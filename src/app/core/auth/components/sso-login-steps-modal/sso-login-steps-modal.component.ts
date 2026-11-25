import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import type { FilterTab } from '../../../../shared/components/filter-tabs/filter-tabs.component';
import { InputDirective } from '../../../../shared/components/form-controls/input/input.directive';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { OtpInputComponent } from '../../../../shared/components/otp-input/otp-input.component';
import type { TwoStepMethod } from '../../auth-api.models';
import { SsoLoginFlowService } from '../../sso-login-flow.service';
import { humanizeRoleName } from '../../sso-session.util';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH, isPinNotSetMessage, pinError } from '../../security-pin.util';

const OTP_LENGTH = 6;

const METHOD_LABELS: Record<TwoStepMethod, string> = { OTP: 'OTP on mobile', PIN: 'Security PIN' };

/** The sign-in steps after the return from RajSSO: waiting, role choice and second-factor check. */
@Component({
  selector: 'app-sso-login-steps-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, LoaderComponent, ModalComponent, OtpInputComponent],
  template: `
    @switch (flow.step()) {
      @case ('verifying') {
        <app-modal title="Signing in" [showClose]="false" [closeOnBackdrop]="false" size="sm">
          <app-loader text="Verifying your SSO sign-in..." />
        </app-modal>
      }
      @case ('switching') {
        <app-modal title="Switching role" [showClose]="false" [closeOnBackdrop]="false" size="sm">
          <app-loader [text]="switchingText()" />
        </app-modal>
      }
      @case ('finishing') {
        <app-modal title="Signing in" [showClose]="false" [closeOnBackdrop]="false" size="sm">
          <app-loader text="Loading your account..." />
        </app-modal>
      }
      @case ('select-role') {
        <app-modal
          title="Choose a role"
          subtitle="Your account has more than one role. Choose the one to continue with."
          size="sm"
          [closeOnBackdrop]="!flow.switchTargetName()"
          (close)="flow.cancel()"
        >
          <div class="flex flex-col gap-2" role="group" aria-label="Your roles">
            @for (role of flow.roles(); track role.id) {
              <button
                appButton
                variant="outline"
                size="lg"
                block
                type="button"
                class="justify-start gap-3"
                [loading]="flow.busy() && chosenRoleId() === role.id"
                [disabled]="flow.busy()"
                (click)="chooseRole(role.id)"
              >
                @if (!(flow.busy() && chosenRoleId() === role.id)) {
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FCF0F2] text-xs font-bold uppercase text-[#7C0E44]"
                    aria-hidden="true"
                  >{{ roleInitial(role.name) }}</span>
                }
                <span class="min-w-0 flex-1 truncate text-left font-semibold">{{ roleLabel(role.name) }}</span>
                <app-icon name="chevron-right" size="sm" class="shrink-0 opacity-60" />
              </button>
            } @empty {
              <p class="text-sm text-slate-600 m-0">No role is available for this account.</p>
            }
          </div>
          @if (flow.error()) {
            <p class="mt-3 text-xs font-semibold text-rose-700 m-0" role="alert">{{ flow.error() }}</p>
          }
          @if (flow.roles().length > 1) {
            <p class="mt-4 mb-0 flex items-center gap-1.5 text-xs text-slate-500">
              <app-icon name="switch-horizontal" size="sm" />
              You can switch roles later from the menu under your name.
            </p>
          }
        </app-modal>
      }
      @case ('two-step') {
        <app-modal
          title="Two-Factor Authentication (2FA)"
          [subtitle]="twoStepSubtitle()"
          size="md"
          [closeOnBackdrop]="!flow.switchTargetName()"
          (close)="flow.cancel()"
        >
          @if (methodTabs().length > 1) {
            <!-- Method choice: radio options (a choice, not an action) -->
            <fieldset class="mb-4 border-0 p-0 m-0">
              <legend class="mb-2 p-0 text-[13px] font-medium text-slate-700">Verify using</legend>
              <div class="flex flex-col gap-2 sm:flex-row" role="radiogroup">
                @for (option of methodTabs(); track option.id) {
                  <label
                    class="flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition-colors"
                    [class.border-[#7C0E44]]="method() === option.id"
                    [class.bg-[#FCF0F2]]="method() === option.id"
                    [class.border-slate-200]="method() !== option.id"
                    [class.hover:border-slate-300]="method() !== option.id"
                  >
                    <input
                      type="radio"
                      name="sso-two-step-method"
                      class="h-4 w-4 shrink-0 cursor-pointer accent-[#7C0E44]"
                      [value]="option.id"
                      [checked]="method() === option.id"
                      (change)="method.set(option.id)"
                    />
                    <span class="font-medium text-slate-800">{{ option.label }}</span>
                  </label>
                }
              </div>
            </fieldset>
          }

          @if (method() === 'OTP') {
            @if (flow.resettingPin()) {
              <div class="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-[13px] leading-5 text-sky-900" role="status">
                Forgot your PIN? Sign in with OTP. You will then be taken to your profile to set a new PIN.
              </div>
            }
            @if (!flow.otpSent()) {
              <p class="text-sm text-slate-600 m-0 mb-3">
                We will send a one-time password to {{ flow.otpDestination() ? 'your mobile number ' + flow.otpDestination() : 'your registered mobile number' }}.
              </p>
            } @else {
              <p class="text-sm text-slate-600 m-0 mb-1">
                Enter the OTP sent to {{ flow.otpDestination() ? flow.otpDestination() : 'your registered mobile number' }}.
              </p>
              <app-otp-input class="my-4" [length]="otpLength" [(value)]="code" [invalid]="!!flow.error()" (completed)="submit()" />
            }
          } @else if (pinSetup()) {
            <!-- No PIN yet and the backend sent a setup token: set the PIN here, then sign in with it -->
            <p class="text-sm text-slate-600 m-0 mb-3">
              You have not set a security PIN yet. Choose {{ pinMin }} to {{ pinMax }} digits; you will use it to sign in from now on.
            </p>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="flex flex-col gap-1.5 text-[13px] font-medium text-slate-700">
                New PIN
                <input
                  appInput
                  type="password"
                  inputmode="numeric"
                  autocomplete="new-password"
                  [attr.maxlength]="pinMax"
                  [invalid]="setupAttempted() && !!setupError()"
                  [ngModel]="code()"
                  (ngModelChange)="code.set($event)"
                />
              </label>
              <label class="flex flex-col gap-1.5 text-[13px] font-medium text-slate-700">
                Confirm PIN
                <input
                  appInput
                  type="password"
                  inputmode="numeric"
                  autocomplete="new-password"
                  [attr.maxlength]="pinMax"
                  [invalid]="setupAttempted() && !!setupError()"
                  [ngModel]="confirmCode()"
                  (ngModelChange)="confirmCode.set($event)"
                  (keydown.enter)="setUpPin()"
                />
              </label>
            </div>
            @if (setupAttempted() && setupError()) {
              <p class="mt-3 text-xs font-semibold text-rose-700 m-0">{{ setupError() }}</p>
            }
          } @else if (pinMissing()) {
            <!-- No PIN yet, and the backend does not allow setting one before sign-in (another method is set up) -->
            <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-5 text-amber-900" role="alert">
              You have not set a security PIN yet.
              @if (otpAllowed()) {
                Sign in with OTP now, then set your PIN under Profile &gt; Security PIN.
              } @else {
                Your role allows PIN sign-in only. Ask the administrator to set up your PIN.
              }
            </div>
            @if (otpAllowed()) {
              <button appButton variant="outline" size="sm" type="button" class="mt-3" (click)="method.set('OTP')">Use OTP instead</button>
            }
          } @else {
            <label class="block text-sm text-slate-600 mb-2" for="sso-pin">Enter your security PIN.</label>
            <input
              appInput
              id="sso-pin"
              type="password"
              inputmode="numeric"
              autocomplete="one-time-code"
              [invalid]="!!flow.error()"
              [ngModel]="code()"
              (ngModelChange)="code.set($event)"
              (keydown.enter)="submit()"
            />
            <button appButton variant="ghost" size="sm" type="button" class="mt-2" (click)="forgotPin()">Forgot PIN?</button>
            @if (forgotBlocked()) {
              <div class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-5 text-amber-900" role="alert">
                Your role allows PIN sign-in only, so the PIN cannot be reset here. Ask the administrator to reset your PIN.
              </div>
            }
          }

          @if (flow.error() && !pinMissing() && !(pinSetup() && setupAttempted() && setupError())) {
            <p class="mt-3 text-xs font-semibold text-rose-700 m-0">{{ flow.error() }}</p>
          }

          <ng-container modalFooter>
            <!-- During a role switch the previous session has already ended, so cancelling signs out of the portal -->
            <button appButton variant="outline" type="button" (click)="flow.cancel()">
              {{ flow.switchTargetName() ? 'Cancel & sign out' : 'Cancel' }}
            </button>
            @if (method() === 'OTP') {
              @if (flow.otpSent()) {
                <button appButton variant="ghost" type="button" [disabled]="flow.busy()" (click)="flow.sendOtp()">Resend OTP</button>
                <button appButton type="button" [loading]="flow.busy()" [disabled]="!canSubmit()" (click)="submit()">Verify</button>
              } @else {
                <button appButton type="button" [loading]="flow.busy()" [disabled]="flow.busy()" (click)="flow.sendOtp()">Send OTP</button>
              }
            } @else if (pinSetup()) {
              <button appButton type="button" [loading]="flow.busy()" [disabled]="flow.busy()" (click)="setUpPin()">Set PIN &amp; sign in</button>
            } @else if (!pinMissing()) {
              <button appButton type="button" [loading]="flow.busy()" [disabled]="!canSubmit()" (click)="submit()">Verify</button>
            }
          </ng-container>
        </app-modal>
      }
    }
  `
})
export class SsoLoginStepsModalComponent {
  protected readonly flow = inject(SsoLoginFlowService);
  protected readonly otpLength = OTP_LENGTH;

  protected readonly method = signal<TwoStepMethod>('OTP');
  protected readonly code = signal('');

  protected readonly methodTabs = computed<FilterTab<TwoStepMethod>[]>(() =>
    this.flow.methods().map(id => ({ id, label: METHOD_LABELS[id] }))
  );

  protected readonly pinMin = PIN_MIN_LENGTH;
  protected readonly pinMax = PIN_MAX_LENGTH;
  protected readonly confirmCode = signal('');
  protected readonly setupAttempted = signal(false);
  protected readonly forgotBlocked = signal(false);

  protected readonly otpAllowed = computed(() => this.flow.methods().includes('OTP'));
  /** PIN chosen, no PIN yet, and the backend allows setting it now (setup token). */
  protected readonly pinSetup = computed(() => this.method() === 'PIN' && this.flow.canSetPinNow());
  /** PIN chosen, no PIN yet, and it cannot be set before sign-in (status says so, or the backend refused). */
  protected readonly pinMissing = computed(
    () =>
      this.method() === 'PIN' &&
      !this.flow.canSetPinNow() &&
      (this.flow.pinSet() === false || isPinNotSetMessage(this.flow.error()))
  );
  protected readonly setupError = computed(() => pinError(this.code().trim(), this.confirmCode().trim()));

  protected readonly canSubmit = computed(() => {
    if (this.flow.busy()) return false;
    const code = this.code().trim();
    return this.method() === 'OTP' ? code.length === OTP_LENGTH : code.length >= PIN_MIN_LENGTH;
  });

  constructor() {
    // A new challenge starts on the method the user can use: PIN setup when the backend allows it, OTP when the PIN is
    // not set, otherwise the first allowed method.
    // Runs once per challenge (methods change); setting a PIN later must not switch the method under the user.
    effect(() => {
      const methods = this.flow.methods();
      untracked(() => {
        const canSetPin = this.flow.canSetPinNow();
        const pinSet = this.flow.pinSet();
        if (canSetPin) this.method.set('PIN');
        else if (pinSet === false && methods.includes('OTP')) this.method.set('OTP');
        else this.method.set(methods[0] ?? 'OTP');
      });
    });
    // Switching method clears what was typed, and the error, of the other one.
    effect(() => {
      const method = this.method();
      untracked(() => {
        // Back on the PIN tab: the user remembered the PIN, so leave the "Forgot PIN" path.
        if (method === 'PIN') this.flow.cancelForgotPin();
        this.code.set('');
        this.confirmCode.set('');
        this.setupAttempted.set(false);
        this.forgotBlocked.set(false);
        this.flow.error.set(null);
      });
    });
  }

  protected readonly switchingText = computed(() => {
    const target = this.flow.switchTargetName();
    return target ? `Switching to ${humanizeRoleName(target)}...` : 'Switching to the selected role...';
  });

  protected readonly twoStepSubtitle = computed(() => {
    const target = this.flow.switchTargetName();
    return target
      ? `Switching to ${humanizeRoleName(target)}. This role requires a second verification step: verify with OTP or your security PIN to continue.`
      : 'Your role requires a second verification step. Verify with OTP or your security PIN to sign in.';
  });

  /** The role the user clicked, so only its row shows the spinner. */
  protected readonly chosenRoleId = signal<number | null>(null);

  protected roleLabel(name: string): string {
    return humanizeRoleName(name);
  }

  protected roleInitial(name: string): string {
    return humanizeRoleName(name).charAt(0) || '?';
  }

  protected chooseRole(roleId: number): void {
    this.chosenRoleId.set(roleId);
    this.flow.chooseRole(roleId);
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.flow.verify(this.method(), this.code());
  }

  protected setUpPin(): void {
    this.setupAttempted.set(true);
    if (this.setupError() || this.flow.busy()) return;
    this.flow.setupPinAndSignIn(this.code());
  }

  /** Forgot PIN: switch to OTP (then the profile, to set a new PIN), or explain that only an administrator can help. */
  protected forgotPin(): void {
    if (this.flow.forgotPin()) {
      this.method.set('OTP');
    } else {
      this.forgotBlocked.set(true);
    }
  }
}
