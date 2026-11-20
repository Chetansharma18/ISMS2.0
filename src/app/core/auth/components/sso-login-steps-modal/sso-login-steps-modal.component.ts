import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FilterTab, FilterTabsComponent } from '../../../../shared/components/filter-tabs/filter-tabs.component';
import { InputDirective } from '../../../../shared/components/form-controls/input/input.directive';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { OtpInputComponent } from '../../../../shared/components/otp-input/otp-input.component';
import type { TwoStepMethod } from '../../auth-api.models';
import { SsoLoginFlowService } from '../../sso-login-flow.service';
import { PIN_MIN_LENGTH, isPinNotSetMessage } from '../../security-pin.util';

const OTP_LENGTH = 6;

const METHOD_LABELS: Record<TwoStepMethod, string> = { OTP: 'OTP on mobile', PIN: 'Security PIN' };

/** The sign-in steps after the return from RajSSO: waiting, role choice and second-factor check. */
@Component({
  selector: 'app-sso-login-steps-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, FilterTabsComponent, InputDirective, LoaderComponent, ModalComponent, OtpInputComponent],
  template: `
    @switch (flow.step()) {
      @case ('verifying') {
        <app-modal title="Signing in" [showClose]="false" [closeOnBackdrop]="false" size="sm">
          <app-loader text="Verifying your SSO sign-in..." />
        </app-modal>
      }
      @case ('finishing') {
        <app-modal title="Signing in" [showClose]="false" [closeOnBackdrop]="false" size="sm">
          <app-loader text="Loading your account..." />
        </app-modal>
      }
      @case ('select-role') {
        <app-modal title="Choose a role" subtitle="Your account has more than one role. Pick the one to sign in with." size="sm" (close)="flow.cancel()">
          <div class="flex flex-col gap-2">
            @for (role of flow.roles(); track role.id) {
              <button appButton variant="outline" type="button" class="w-full" [disabled]="flow.busy()" (click)="flow.chooseRole(role.id)">
                {{ role.name }}
              </button>
            } @empty {
              <p class="text-sm text-slate-600 m-0">No role is available for this account.</p>
            }
          </div>
          @if (flow.error()) {
            <p class="mt-3 text-xs font-semibold text-rose-700 m-0">{{ flow.error() }}</p>
          }
        </app-modal>
      }
      @case ('two-step') {
        <app-modal title="Verify it's you" subtitle="Your role needs a second check before you sign in." size="sm" (close)="flow.cancel()">
          @if (methodTabs().length > 1) {
            <app-filter-tabs class="mb-4" [options]="methodTabs()" [(value)]="method" stretch />
          }

          @if (method() === 'OTP') {
            @if (!flow.otpSent()) {
              <p class="text-sm text-slate-600 m-0 mb-3">We will send a one-time password to your registered mobile number.</p>
            } @else {
              <p class="text-sm text-slate-600 m-0 mb-1">Enter the OTP sent to your registered mobile number.</p>
              <app-otp-input class="my-4" [length]="otpLength" [(value)]="code" [invalid]="!!flow.error()" (completed)="submit()" />
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
          }

          @if (pinNotSet()) {
            <div class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-5 text-amber-900" role="alert">
              You have not set a security PIN yet.
              @if (otpAllowed()) {
                Sign in with OTP now, then set your PIN under Profile &gt; Security PIN.
              } @else {
                Your role allows PIN sign-in only. Ask the administrator to enable OTP for your role, or to set up your PIN.
              }
            </div>
            @if (otpAllowed()) {
              <button appButton variant="outline" size="sm" type="button" class="mt-3" (click)="method.set('OTP')">Use OTP instead</button>
            }
          } @else if (flow.error()) {
            <p class="mt-3 text-xs font-semibold text-rose-700 m-0">{{ flow.error() }}</p>
          }

          <ng-container modalFooter>
            <button appButton variant="outline" type="button" (click)="flow.cancel()">Cancel</button>
            @if (method() === 'OTP') {
              @if (flow.otpSent()) {
                <button appButton variant="ghost" type="button" [disabled]="flow.busy()" (click)="flow.sendOtp()">Resend OTP</button>
              } @else {
                <button appButton type="button" [loading]="flow.busy()" [disabled]="flow.busy()" (click)="flow.sendOtp()">Send OTP</button>
              }
            }
            @if (method() === 'PIN' || flow.otpSent()) {
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

  /** The backend refused PIN sign-in because this account has no PIN yet. */
  protected readonly pinNotSet = computed(() => this.method() === 'PIN' && isPinNotSetMessage(this.flow.error()));
  protected readonly otpAllowed = computed(() => this.flow.methods().includes('OTP'));

  protected readonly canSubmit = computed(() => {
    if (this.flow.busy()) return false;
    const code = this.code().trim();
    return this.method() === 'OTP' ? code.length === OTP_LENGTH : code.length >= PIN_MIN_LENGTH;
  });

  constructor() {
    // A new challenge starts on its first allowed method with an empty code.
    effect(() => {
      const methods = this.flow.methods();
      this.method.set(methods[0] ?? 'OTP');
      this.code.set('');
    });
    // Switching method clears what was typed, and the error, of the other one.
    effect(() => {
      this.method();
      this.code.set('');
      this.flow.error.set(null);
    });
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.flow.verify(this.method(), this.code());
  }
}
