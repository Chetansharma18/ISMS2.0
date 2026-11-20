import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { isMockEnabled } from '../mock/mock.config';
import { NotificationService } from '../services/notification.service';
import type { BackendRoleSummary, BackendUser, LoginStepResponse, TwoStepMethod } from './auth-api.models';
import { AuthApiService } from './auth-api.service';
import { AuthService } from './auth.service';
import { resolveSessionRole, roleNamesOf, selectableRolesOf, toPersona, toTwoStepMethods } from './sso-session.util';

/** Where the sign-in stands after RajSSO sent the user back. */
export type SsoLoginStep = 'idle' | 'verifying' | 'select-role' | 'two-step' | 'finishing';

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
  /** A request of the current step is running. */
  readonly busy = signal(false);
  /** Why the last action of the current step failed. */
  readonly error = signal<string | null>(null);

  private user: BackendUser | null = null;
  private chosenRoleId: number | null = null;

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

  /** Abandons the sign-in; the one-time tokens expire on their own. */
  cancel(): void {
    this.reset();
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
    if (res.user) this.user = res.user;
    if (res.selectedRoleId) this.chosenRoleId = res.selectedRoleId;

    if (res.verified === false || res.success === false) {
      this.step() === 'verifying' ? this.abort(res.message) : this.error.set(res.message ?? 'Sign-in failed.');
      return;
    }
    if (res.requiresRoleSelection) {
      this.roles.set(selectableRolesOf(res.user ?? this.user));
      this.step.set('select-role');
      return;
    }
    if (res.requires2FA) {
      this.methods.set(toTwoStepMethods(res.allowedMethods));
      this.otpSent.set(false);
      this.step.set('two-step');
      return;
    }
    this.finish();
  }

  /** The session is open: loads the user and enters the portal. */
  private finish(): void {
    this.step.set('finishing');
    this.authApi.session().subscribe({
      next: me => {
        const chosenName = this.chosenRoleName();
        const role = resolveSessionRole(roleNamesOf(me).length ? roleNamesOf(me) : roleNamesOf(this.user), chosenName);
        const persona = toPersona({ ...(this.user ?? {}), ...me } as BackendUser, role);
        this.reset();
        this.auth.completeSignIn(persona);
      },
      error: err => this.abort(err?.message)
    });
  }

  private chosenRoleName(): string | null {
    if (this.chosenRoleId === null) return null;
    return selectableRolesOf(this.user).find(r => r.id === this.chosenRoleId)?.name ?? null;
  }

  private abort(message?: string | null): void {
    this.reset();
    this.notifications.error(message || 'Sign-in failed. Please sign in again.', 'Sign-in failed');
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
  }
}
