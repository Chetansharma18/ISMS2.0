import { ChangeDetectionStrategy, Component, HostListener, computed, input, output, signal } from '@angular/core';

const OTP_LENGTH = 6;

/**
 * E-sign dialog. Step 1 offers Aadhaar OTP signing; step 2 asks for the OTP sent to the mobile
 * number registered with the Aadhaar. The E-Sign button is enabled once the OTP is entered.
 */
@Component({
  selector: 'app-esign-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans"
      style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
      (click)="close.emit()"
    >
      <div
        class="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        aria-labelledby="esign-title"
      >
        <div class="h-1.5 w-full bg-navy"></div>

        <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <h2 id="esign-title" class="text-base sm:text-lg font-bold text-slate-900 m-0">E-Sign</h2>
            <p class="text-xs text-slate-500 m-0 mt-0.5">
              {{ step() === 'choose' ? 'Choose how to sign this ' + documentName() + '.' : 'Verify your identity to sign.' }}
            </p>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-5 sm:px-6 py-5 text-xs space-y-4">
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
              <label class="block text-xs font-semibold text-slate-800" for="esign-otp">
                Enter OTP <span class="text-rose-600">*</span>
              </label>
              <p class="m-0 text-slate-600 leading-relaxed">
                A {{ otpLength }}-digit OTP was sent to the mobile number registered with your Aadhaar.
              </p>
              <input
                id="esign-otp"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                [attr.maxlength]="otpLength"
                [value]="otp()"
                (input)="onOtpInput($event)"
                placeholder="------"
                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-center text-lg font-semibold tracking-[0.5em] text-slate-900 focus:outline-none focus:border-navy bg-white shadow-2xs"
              />
              <div class="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  (click)="resend()"
                  class="text-navy font-semibold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
                @if (resent()) {
                  <span class="text-slate-500" role="status">OTP sent again.</span>
                }
              </div>
            </div>
          }
        </div>

        <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          @if (step() === 'choose') {
            <button
              type="button"
              (click)="sendOtp()"
              class="w-full sm:w-auto px-5 py-2 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              style="color: #ffffff !important;"
            >
              Send OTP
            </button>
          } @else {
            <button
              type="button"
              (click)="sign()"
              [disabled]="!otpComplete()"
              class="w-full sm:w-auto px-5 py-2 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              style="color: #ffffff !important;"
            >
              E-Sign
            </button>
          }
        </div>
      </div>
    </div>
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

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }

  protected sendOtp(): void {
    this.step.set('otp');
  }

  protected resend(): void {
    this.otp.set('');
    this.resent.set(true);
  }

  protected onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    input.value = digits;
    this.otp.set(digits);
    this.resent.set(false);
  }

  protected sign(): void {
    if (this.otpComplete()) this.signed.emit();
  }
}
