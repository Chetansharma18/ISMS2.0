import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, ModalComponent, OtpInputComponent } from '../../../../../shared';

const OTP_LENGTH = 6;

/**
 * E-sign dialog. Step 1 offers Aadhaar OTP signing; step 2 asks for the OTP sent to the mobile
 * number registered with the Aadhaar. The E-Sign button is enabled once the OTP is entered.
 */
@Component({
  selector: 'app-esign-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent, OtpInputComponent],
  template: `
    <app-modal
      title="E-Sign"
      [subtitle]="step() === 'choose' ? 'Choose how to sign this ' + documentName() + '.' : 'Verify your identity to sign.'"
      size="sm"
      (close)="close.emit()"
    >
      <div class="text-xs space-y-4">
        @if (step() === 'choose') {
          <label class="flex items-start gap-3 p-3.5 border-2 border-navy rounded-lg bg-slate-50 cursor-pointer">
            <input type="radio" name="esign-method" checked class="mt-0.5 w-4 h-4 accent-[#0B3558]" />
            <span>
              <span class="block text-[13px] font-semibold text-slate-900">Sign with Aadhaar OTP</span>
              <span class="block text-slate-600 mt-0.5 leading-relaxed">
                An OTP will be sent to the mobile number registered with your Aadhaar.
              </span>
            </span>
          </label>
        } @else {
          <div class="space-y-2">
            <span class="block text-xs font-semibold text-slate-800">
              Enter OTP <span class="text-rose-600">*</span>
            </span>
            <p class="m-0 text-slate-600 leading-relaxed">
              A {{ otpLength }}-digit OTP was sent to the mobile number registered with your Aadhaar.
            </p>
            <app-otp-input [length]="otpLength" [value]="otp()" (valueChange)="onOtpChange($event)" />
            <div class="flex items-center justify-between text-[11px]">
              <button appButton variant="ghost" size="sm" (click)="resend()">Resend OTP</button>
              @if (resent()) {
                <span class="text-slate-500" role="status">OTP sent again.</span>
              }
            </div>
          </div>
        }
      </div>

      <ng-container modalFooter>
        <button appButton variant="outline" (click)="close.emit()">Cancel</button>
        @if (step() === 'choose') {
          <button appButton (click)="sendOtp()">Send OTP</button>
        } @else {
          <button appButton [disabled]="!otpComplete()" (click)="sign()">E-Sign</button>
        }
      </ng-container>
    </app-modal>
  `
})
export class EsignModalComponent {
  /** What is being signed, as shown in the dialog text. */
  readonly documentName = input('sanction order');
  /** The applicant confirmed the OTP and wants to sign. */
  readonly signed = output<void>();
  readonly close = output<void>();

  protected readonly otpLength = OTP_LENGTH;
  protected readonly step = signal<'choose' | 'otp'>('choose');
  protected readonly otp = signal('');
  protected readonly resent = signal(false);
  protected readonly otpComplete = computed(() => this.otp().length === OTP_LENGTH);

  protected sendOtp(): void {
    this.step.set('otp');
  }

  protected resend(): void {
    this.otp.set('');
    this.resent.set(true);
  }

  protected onOtpChange(value: string): void {
    this.otp.set(value);
    this.resent.set(false);
  }

  protected sign(): void {
    if (this.otpComplete()) this.signed.emit();
  }
}
