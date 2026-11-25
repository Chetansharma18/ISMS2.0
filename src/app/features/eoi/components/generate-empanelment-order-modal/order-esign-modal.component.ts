import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent, ModalComponent, OtpInputComponent } from '../../../../shared';
import { errorText } from '../scheme-form/eoi-apply.util';
import { ResultOrdersService } from './result-orders.service';
import { ESignChallengeDto, PublishResultDto, secondsUntil } from './result-orders.util';

const OTP_LENGTH = 6;

/**
 * E-sign of the result orders, as for the sanction order: send an OTP to the signer's mobile, enter it, sign.
 * One OTP (the backend's publish OTP) e-signs every page of both the Empanelment and the Rejection Order and
 * releases them. Only the EOI's committee approver signs.
 */
@Component({
  selector: 'app-order-esign-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent, OtpInputComponent],
  template: `
    <app-modal
      title="E-Sign Orders"
      [subtitle]="challenge() ? 'Verify your identity to sign.' : 'Sign the ' + orderNames() + '.'"
      size="sm"
      (close)="close.emit()"
    >
      <div class="text-xs space-y-4">
        @if (!challenge()) {
          <div class="p-3.5 border-2 border-navy rounded-lg bg-slate-50 space-y-1">
            <span class="block text-[13px] font-semibold text-slate-900">Sign with OTP</span>
            <span class="block text-slate-600 leading-relaxed">
              An OTP will be sent to the mobile number in your profile. Signing puts your e-signature on every page of the
              {{ orderNames() }}, makes them final (decisions lock) and releases them to the applicants.
            </span>
          </div>
        } @else {
          <div class="space-y-2">
            <span class="block text-xs font-semibold text-slate-800">Enter OTP <span class="text-rose-600">*</span></span>
            <p class="m-0 text-slate-600 leading-relaxed">A {{ otpLength }}-digit OTP was sent to {{ challenge()!.mobileMasked }}.</p>
            <app-otp-input [length]="otpLength" [value]="otp()" (valueChange)="otp.set($event)" />
            <div class="flex items-center justify-between text-[11px]">
              <button appButton variant="ghost" size="sm" type="button" [disabled]="busy() || wait() > 0" (click)="sendOtp()">
                {{ wait() > 0 ? 'Resend OTP in ' + wait() + ' s' : 'Resend OTP' }}
              </button>
            </div>
          </div>
        }
        @if (error()) {
          <p class="m-0 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700" role="alert">{{ error() }}</p>
        }
      </div>

      <ng-container modalFooter>
        @if (!challenge()) {
          <button appButton type="button" [disabled]="busy()" (click)="sendOtp()">{{ busy() ? 'Sending...' : 'Send OTP' }}</button>
        } @else {
          <button appButton type="button" [disabled]="busy() || otp().length !== otpLength" (click)="sign()">{{ busy() ? 'Signing...' : 'E-Sign' }}</button>
        }
      </ng-container>
    </app-modal>
  `
})
export class OrderEsignModalComponent {
  private readonly api = inject(ResultOrdersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly eoiId = input.required<number>();
  /** e.g. "Final Empanelment Order and Final Rejection Order". */
  readonly orderNames = input('result orders');

  readonly signed = output<PublishResultDto>();
  readonly close = output<void>();

  protected readonly otpLength = OTP_LENGTH;
  protected readonly challenge = signal<ESignChallengeDto | null>(null);
  protected readonly otp = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  private readonly now = signal(Date.now());
  protected readonly wait = computed(() => secondsUntil(this.challenge()?.resendAvailableAt, this.now()));

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected sendOtp(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .requestESignOtp(this.eoiId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: c => {
          this.busy.set(false);
          this.otp.set('');
          this.challenge.set(c);
        },
        error: (e: unknown) => {
          this.busy.set(false);
          this.error.set(errorText(e, 'The OTP could not be sent. Please try again.'));
        }
      });
  }

  protected sign(): void {
    const c = this.challenge();
    if (!c || this.busy() || this.otp().length !== OTP_LENGTH) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .eSign(this.eoiId(), c.challengeId, this.otp())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.busy.set(false);
          this.signed.emit(result);
        },
        error: (e: unknown) => {
          this.busy.set(false);
          this.error.set(errorText(e, 'The orders could not be signed. Please try again.'));
        }
      });
  }
}
