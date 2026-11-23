import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { isMockEnabled } from '../mock/mock.config';
import { NotificationService } from '../services/notification.service';
import type { BackendRoleSummary, BackendUser, LoginStepResponse, TwoStepMethod } from './auth-api.models';
import { AuthApiService } from './auth-api.service';
import { AuthService } from './auth.service';
import {
  humanizeRoleName,
  resolveSessionRole,
  roleNamesOf,
  selectableRolesOf,
  toPersona,
  toTwoStepMethods
} from './sso-session.util';

/** Where the sign-in stands after RajSSO sent the user back. */
export type SsoLoginStep = 'idle' | 'verifying' | 'switching' | 'select-role' | 'two-step' | 'finishing';

/** Query parameter the backend SSO callback adds when it redirects to the frontend. */
const RETURN_PARAM = 'verifylogin';
const MESSAGE_PARAM = 'message';
/** Optional login callback token in the return URL (`?verifylogin=true&token=...`), used when there is no cookie. */
const TOKEN_PARAMS = ['token', 'loginCallbackToken', 'logincallback'] as const;

/**
 * Completes a RajSSO sign-in on the frontend:
 *
 * 1. RajSSO posts to the backend (`/api/auth/verify-sso-token`), which sets a login_callback_token cookie and
 *    redirects here with `?verifylogin=true` (or `false&message=...`).
 * 2. `verify-login-token` exchanges the cookie. The backend answers with the session, a role choice or a
 *    second-factor challenge.
 * 3. `select-role` and `two-step/send-otp` + `two-step/verify` cover those steps (their tokens are cookies too).
 * 4. `me` loads the user; the persona is set and the user lands on their role's home screen.
 *
 * SsoLoginStepsModalComponent renders the steps from the signals below.
 */
@Injectable({ providedIn: 'root' })
export class SsoLoginFlowService {
  private readonly authApi = inject(AuthApiService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly step = signal<SsoLoginStep>('idle');
  /** Roles to choose from (select-role step). */
  readonly roles = signal<BackendRoleSummary[]>([]);
  /** Second-factor methods the role allows (two-step step). */
  readonly methods = signal<TwoStepMethod[]>([]);
  /** The OTP of the current challenge has been sent. */
  readonly otpSent = signal(false);
  /** From the challenge's `twoStepStatus`: true / false when the role allows PIN, null when unknown. */
  readonly pinSet = signal<boolean | null>(null);
  /** Masked mobile number the OTP goes to, when the backend sends it. */
  readonly otpDestination = signal<string | null>(null);
  /** The backend sent a setup token: the user may set a PIN now, before signing in. */
  readonly canSetPinNow = computed(() => !!this.setupToken() && this.methods().includes('PIN') && this.pinSet() === false);
  /** "Forgot PIN": sign in with OTP, then open the profile to set a new PIN. */
  readonly resettingPin = signal(false);
  /** A request of the current step is running. */
  readonly busy = signal(false);
  /** Why the last action of the current step failed. */
  readonly error = signal<string | null>(null);

  private user: BackendUser | null = null;
  private chosenRoleId: number | null = null;
  /** True while switching the role of an existing session (not a fresh sign-in). */
  private switching = false;
  /** switch-role succeeded: the old session is gone, so giving up now means signing out of the portal. */
  private sessionEnded = false;
  /** Name of the role being switched to (null when not switching); the dialogs word their text with it. */
  readonly switchTargetName = signal<string | null>(null);
  /** Setup token of the 2FA challenge (only when nothing is set up yet); lets the user set a PIN during sign-in. */
  private readonly setupToken = signal<string | null>(null);
  /** Role id -> name, from every sign-in response that listed `{ id, name }` roles. */
  private readonly knownRoles = new Map<number, string>();

  /**
   * Call once when the app starts. Picks up the return from RajSSO, removes the parameters from the address bar and
   * starts the sign-in steps. Returns true when the address was an SSO return.
   */
  handleReturn(href: string = typeof window !== 'undefined' ? window.location.href : ''): boolean {
    if (!href || isMockEnabled('AUTH')) return false;
    const url = new URL(href);
    const flag = url.searchParams.get(RETURN_PARAM);
    if (flag === null) return false;

    const message = url.searchParams.get(MESSAGE_PARAM);
    const token = TOKEN_PARAMS.map(p => url.searchParams.get(p)).find(v => !!v?.trim())?.trim() ?? null;
    // The token is single-use, but it is still removed from the address bar (and history) at once.
    url.searchParams.delete(RETURN_PARAM);
    url.searchParams.delete(MESSAGE_PARAM);
    TOKEN_PARAMS.forEach(p => url.searchParams.delete(p));
    if (typeof history !== 'undefined') {
      history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }

    if (flag !== 'true') {
      this.notifications.error(message || 'SSO sign-in failed. Please try again.', 'Sign-in failed');
      return true;
    }

    this.reset();
    this.step.set('verifying');
    this.run(this.authApi.verifyLoginToken(token), true);
    return true;
  }

  /** Signs in with the chosen role (select-role step). */
  chooseRole(roleId: number): void {
    this.chosenRoleId = roleId;
    const picked = this.roles().find(r => r.id === roleId);
    if (picked) this.knownRoles.set(picked.id, picked.name);
    this.run(this.authApi.selectRole(roleId));
  }

  /** Sends (or re-sends) the OTP for the two-step challenge. */
  sendOtp(): void {
    this.busy.set(true);
    this.error.set(null);
    this.authApi.sendOtp().subscribe({
      next: () => {
        this.otpSent.set(true);
        this.busy.set(false);
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err?.message ?? 'Could not send the OTP. Please try again.');
      }
    });
  }

  /** Verifies the OTP or PIN (two-step step). */
  verify(method: TwoStepMethod, code: string): void {
    this.run(this.authApi.verifyTwoStep(method, code.trim()));
  }

  /**
   * First PIN during sign-in (only when the backend sent a setup token): sets the PIN with the setup token, then
   * signs in with it straight away.
   */
  setupPinAndSignIn(pin: string): void {
    const token = this.setupToken();
    if (!token) {
      this.error.set('PIN setup is not available. Sign in with another method and set your PIN in your profile.');
      return;
    }
    const code = pin.trim();
    this.busy.set(true);
    this.error.set(null);
    this.authApi.setPin(code, token).subscribe({
      next: res => {
        if (res?.success === false) {
          this.busy.set(false);
          this.error.set(res.message ?? 'The PIN could not be saved.');
          return;
        }
        this.pinSet.set(true);
        this.setupToken.set(null);
        this.verify('PIN', code);
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err?.message ?? 'The PIN could not be saved. Please try again.');
      }
    });
  }

  /**
   * "Forgot PIN": the backend has no PIN reset during sign-in, but a signed-in user can set a new PIN. So the user signs
   * in with OTP (when the role allows it) and lands on the profile to set a new PIN. Returns false when OTP is not allowed.
   */
  forgotPin(): boolean {
    if (!this.methods().includes('OTP')) return false;
    this.resettingPin.set(true);
    this.error.set(null);
    return true;
  }

  /** Leaves the "Forgot PIN" path. */
  cancelForgotPin(): void {
    this.resettingPin.set(false);
  }

  /**
   * Abandons the sign-in. During a role switch the previous session has already ended on the server, so the user is
   * signed out of the portal (RajSSO stays signed in: Login brings them back without credentials).
   */
  cancel(): void {
    const ended = this.sessionEnded;
    this.reset();
    if (ended) {
      this.auth.endSessionLocally();
      this.notifications.info('Role switch cancelled. You have been signed out of the portal; sign in again to continue.');
    }
  }

  /**
   * Switches the signed-in user to another of their roles, without going back to RajSSO:
   *
   * 1. `POST /auth/switch-role { roleId }`. The backend checks the role, ends the current session (clears the access
   *    and refresh cookies) and returns a fresh one-time login token scoped to that role (`loginCallbackToken`; web
   *    also gets it as the login_callback_token cookie).
   * 2. `verify-login-token` with that token: the same steps as after RajSSO follow. When the new role needs 2FA the
   *    "Two-Factor Authentication (2FA)" dialog appears; otherwise the new session opens at once.
   * 3. The session, permissions and sidebar follow the new role, and the user lands on its first screen.
   *
   * If switch-role fails, the current session is untouched. Once it succeeded the old session no longer exists, so
   * cancelling the 2FA step (or a failure after it) signs the user out of the portal (RajSSO stays signed in).
   */
  switchRole(roleId: number): void {
    const { roles, activeRoleId } = this.auth.sessionRoles();
    if (roleId === activeRoleId || this.step() !== 'idle') return;

    this.reset();
    this.switching = true;
    for (const r of roles) this.knownRoles.set(r.id, r.name);
    this.chosenRoleId = roleId;
    this.user = this.auth.userDetails();
    this.switchTargetName.set(this.knownRoles.get(roleId) ?? null);
    this.step.set('switching');
    this.busy.set(true);

    this.authApi.switchRole(roleId).subscribe({
      next: res => {
        if (res.success === false) {
          // Refused before anything changed: the current session is still valid.
          this.abort(res.message ?? 'Could not switch role. Please try again.');
          return;
        }
        // From here on the old session is gone; the new one opens with the login token, as after RajSSO.
        this.sessionEnded = true;
        this.authApi.sessionPaused = true;
        if (res.user) this.user = res.user;
        if (res.selectedRoleId) this.chosenRoleId = res.selectedRoleId;
        this.run(this.authApi.verifyLoginToken(res.loginCallbackToken ?? null), true);
      },
      error: err => {
        const status = err?.status;
        this.abort(
          status === 404 || status === 405
            ? 'Role switching is not available on the server yet. Sign out and sign in again to use another role.'
            : (err?.error?.message ?? err?.message ?? 'Could not switch role. Please try again.')
        );
      }
    });
  }

  // ---- internals -----------------------------------------------------------------------------

  /** Runs a sign-in step. `fatal`: a failure ends the sign-in instead of showing the error in the step. */
  private run(request$: Observable<LoginStepResponse>, fatal = false): void {
    this.busy.set(true);
    this.error.set(null);
    request$.subscribe({
      next: res => {
        this.busy.set(false);
        this.advance(res);
      },
      error: err => {
        this.busy.set(false);
        const message = err?.error?.message ?? err?.message ?? 'Sign-in failed. Please try again.';
        if (fatal || this.step() === 'verifying') {
          this.abort(message);
        } else {
          this.error.set(message);
        }
      }
    });
  }

  private advance(res: LoginStepResponse): void {
    if (res.user) {
      // Remember every { id, name } role seen: later steps (two-step/verify) may send roles as plain names only,
      // and the chosen role must still be found by its id.
      for (const role of selectableRolesOf(res.user)) this.knownRoles.set(role.id, role.name);
      this.user = res.user;
    }
    if (res.selectedRoleId) this.chosenRoleId = res.selectedRoleId;

    if (res.verified === false || res.success === false) {
      const waiting = this.step() === 'verifying' || this.step() === 'switching';
      waiting ? this.abort(res.message) : this.error.set(res.message ?? 'Sign-in failed.');
      return;
    }
    if (res.requiresRoleSelection) {
      this.roles.set(selectableRolesOf(res.user ?? this.user));
      this.step.set('select-role');
      return;
    }
    if (res.requires2FA) {
      this.methods.set(toTwoStepMethods(res.allowedMethods));
      const status = res.twoStepStatus;
      this.pinSet.set(status?.pin ? status.pin.isSet : null);
      this.otpDestination.set(status?.mobile?.isSet && status.mobile.details ? status.mobile.details : null);
      this.setupToken.set(res.setupToken ?? null);
      this.otpSent.set(false);
      this.step.set('two-step');
      return;
    }
    this.finish();
  }

  /**
   * The session is open: enters the portal with the short user details the sign-in steps returned
   * (verify-login-token / select-role / two-step/verify). `/auth/me` is only called when the profile is opened.
   */
  private finish(): void {
    if (!this.user) {
      this.abort('The sign-in response did not include the user details. Please sign in again.');
      return;
    }
    const roleNames = roleNamesOf(this.user);
    const chosenName = this.chosenRoleName() ?? (roleNames.length === 1 ? roleNames[0] : null);
    const role = resolveSessionRole(roleNames, chosenName);
    const persona = toPersona(this.user, role, chosenName);
    const details = this.user;

    // All roles seen during sign-in (verify-login-token lists every role) + the active one, for "Switch Role".
    for (const r of selectableRolesOf(this.user)) this.knownRoles.set(r.id, r.name);
    const allRoles = [...this.knownRoles.entries()].map(([id, name]) => ({ id, name }));
    const activeRoleId =
      this.chosenRoleId ?? [...this.knownRoles.entries()].find(([, name]) => name === chosenName)?.[0] ?? null;
    if (this.switching) {
      // Keep the full list the session already had; only the active role changes.
      const previous = this.auth.sessionRoles().roles;
      this.auth.setSessionRoles([...previous, ...allRoles], activeRoleId);
    } else {
      this.auth.setSessionRoles(allRoles, activeRoleId);
    }
    // "Forgot PIN": open the profile, where the signed-in user can set a new PIN.
    const redirectTo = this.resettingPin() ? '/profile' : undefined;
    const switched = this.switching;
    this.reset();
    if (switched && chosenName) this.notifications.success(`You are now working as ${humanizeRoleName(chosenName)}.`, 'Role switched');
    if (redirectTo) {
      this.auth.completeSignIn(persona, details, redirectTo);
    } else {
      this.auth.completeSignIn(persona, details);
    }
  }

  /** Name of the role the user signed in with: the one picked in the role step (or reported by the backend). */
  private chosenRoleName(): string | null {
    if (this.chosenRoleId === null) return null;
    return this.knownRoles.get(this.chosenRoleId) ?? null;
  }

  private abort(message?: string | null): void {
    const switching = this.switching;
    const ended = this.sessionEnded;
    this.reset();
    if (ended) {
      // The previous session was already closed by switch-role and the new one could not be opened.
      this.auth.endSessionLocally();
      this.notifications.error(
        `${message || 'The new role could not be opened.'} You have been signed out of the portal; sign in again to continue.`,
        'Role switch failed'
      );
      return;
    }
    this.notifications.error(
      message || (switching ? 'Could not switch role. Please try again.' : 'Sign-in failed. Please sign in again.'),
      switching ? 'Role switch failed' : 'Sign-in failed'
    );
  }

  private reset(): void {
    this.step.set('idle');
    this.roles.set([]);
    this.methods.set([]);
    this.otpSent.set(false);
    this.busy.set(false);
    this.error.set(null);
    this.user = null;
    this.chosenRoleId = null;
    this.knownRoles.clear();
    this.pinSet.set(null);
    this.otpDestination.set(null);
    this.setupToken.set(null);
    this.resettingPin.set(false);
    this.switching = false;
    this.sessionEnded = false;
    this.authApi.sessionPaused = false;
    this.switchTargetName.set(null);
  }
}
