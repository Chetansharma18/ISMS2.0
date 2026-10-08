import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dept-admin-otp-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none font-sans animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-title"
      >
        <!-- Modal Card -->
        <div
          class="relative w-full max-w-110 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        >
          <!-- Top Accent Bar -->
          <div class="h-1.5 w-full bg-[#0B3558]"></div>

          <div class="p-6 sm:p-7">
            <!-- Security Shield Icon -->
            <div class="w-12 h-12 rounded-xl bg-[#EAF2F6] text-[#0B3558] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <svg class="w-6 h-6 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <!-- Header Titles -->
            <div class="text-center">
              <h2 id="otp-title" class="text-xl sm:text-[22px] font-extrabold text-[#0B3558] tracking-tight m-0">
                Department Admin Verification
              </h2>
              <p class="text-xs sm:text-[13px] text-slate-500 mt-2 leading-relaxed m-0">
                Please enter the 6-digit One Time Password (OTP) sent to your registered department email &amp; mobile
                <span class="font-semibold text-slate-700 block mt-0.5">(+91 98******42 &bull; officer.rsldc&#64;rajasthan.gov.in)</span>
              </p>
            </div>

            <!-- Resend Notification Banner -->
            @if (resendSuccess()) {
              <div class="mt-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>New OTP has been sent successfully!</span>
              </div>
            }

            <!-- Error Banner -->
            @if (errorMessage()) {
              <div class="mt-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center animate-in fade-in">
                {{ errorMessage() }}
              </div>
            }

            <!-- 6 Individual Digit Inputs -->
            <div class="flex items-center justify-center gap-2 sm:gap-2.5 my-6" (paste)="onPaste($event)">
              @for (digit of otpDigits; track $index; let i = $index) {
                <input
                  #otpInput
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  pattern="[0-9]*"
                  autocomplete="one-time-code"
                  [value]="digit"
                  (input)="onDigitInput($event, i)"
                  (keydown)="onKeyDown($event, i)"
                  class="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono text-slate-800 bg-white border-2 rounded-xl focus:border-[#0B3558] focus:ring-4 focus:ring-[#0B3558]/15 outline-none transition-all shadow-2xs select-none"
                  [class.border-rose-400]="errorMessage()"
                  [class.border-[#0B3558]]="digit !== '' && !errorMessage()"
                  [class.border-slate-200]="digit === '' && !errorMessage()"
                />
              }
            </div>

            <!-- Demo Hint -->
            <div class="mb-4 text-center">
              <span class="inline-block text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1">
                Demo OTP: <strong class="font-mono text-slate-800 font-bold">123456</strong> (or enter any 6 digits)
              </span>
            </div>

            <!-- Resend Timer Section -->
            <div class="text-center text-xs text-slate-500 mb-6">
              @if (timerSeconds() > 0) {
                <span>Didn't receive OTP? Resend in </span>
                <span class="font-mono font-bold text-[#0B3558]">00:{{ timerSeconds() < 10 ? '0' + timerSeconds() : timerSeconds() }}</span>
              } @else {
                <span>Didn't receive OTP? </span>
                <button
                  type="button"
                  (click)="resendOtp()"
                  class="text-[#0B3558] hover:text-[#07243c] font-bold underline cursor-pointer transition-colors"
                >
                  Resend OTP
                </button>
              }
            </div>

            <!-- Primary Action Buttons -->
            <div class="space-y-2">
              <button
                type="button"
                (click)="submitOtp()"
                [disabled]="!isComplete() || isSubmitting()"
                class="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#0B3558] hover:bg-[#07243c] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                @if (isSubmitting()) {
                  <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying OTP...</span>
                } @else {
                  <span>Submit OTP &amp; Proceed &rarr;</span>
                }
              </button>

              <button
                type="button"
                (click)="cancel()"
                [disabled]="isSubmitting()"
                class="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel &amp; Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DeptAdminOtpModalComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() ssoId = 'dept_admin';

  @Output() verified = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otpDigits: string[] = ['', '', '', '', '', ''];
  timerSeconds = signal<number>(30);
  isSubmitting = signal<boolean>(false);
  resendSuccess = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private timerInterval: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.resetState();
        this.startTimer();
        setTimeout(() => this.focusFirstInput(), 100);
      } else {
        this.stopTimer();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isOpen) {
      setTimeout(() => this.focusFirstInput(), 100);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  isComplete(): boolean {
    return this.otpDigits.every(d => d.trim().length === 1);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');

    this.errorMessage.set(null);
    this.resendSuccess.set(false);

    if (value.length > 0) {
      const char = value.charAt(value.length - 1);
      this.otpDigits[index] = char;
      input.value = char;

      // Auto-advance to next input
      if (index < 5) {
        const nextInput = this.otpInputs.toArray()[index + 1];
        if (nextInput) {
          nextInput.nativeElement.focus();
          nextInput.nativeElement.select();
        }
      }
    } else {
      this.otpDigits[index] = '';
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.otpDigits[index] && index > 0) {
        const prevInput = this.otpInputs.toArray()[index - 1];
        if (prevInput) {
          prevInput.nativeElement.focus();
          prevInput.nativeElement.select();
        }
      } else {
        this.otpDigits[index] = '';
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1];
      if (prevInput) prevInput.nativeElement.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.otpInputs.toArray()[index + 1];
      if (nextInput) nextInput.nativeElement.focus();
    } else if (event.key === 'Enter') {
      if (this.isComplete()) {
        this.submitOtp();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digitsOnly = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digitsOnly.length > 0) {
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = digitsOnly.charAt(i) || '';
      }
      const inputs = this.otpInputs.toArray();
      inputs.forEach((inputEl, idx) => {
        if (inputEl) inputEl.nativeElement.value = this.otpDigits[idx];
      });

      const targetIdx = Math.min(digitsOnly.length, 5);
      if (inputs[targetIdx]) {
        inputs[targetIdx].nativeElement.focus();
      }
    }
  }

  resendOtp(): void {
    this.otpDigits = ['', '', '', '', '', ''];
    const inputs = this.otpInputs?.toArray() || [];
    inputs.forEach(input => {
      if (input) input.nativeElement.value = '';
    });
    this.errorMessage.set(null);
    this.resendSuccess.set(true);
    this.startTimer();
    setTimeout(() => this.focusFirstInput(), 50);
  }

  submitOtp(): void {
    if (!this.isComplete()) {
      this.errorMessage.set('Please enter all 6 digits of the OTP.');
      return;
    }

    const otp = this.otpDigits.join('');
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Emulate realistic authentication verification
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.verified.emit(otp);
    }, 700);
  }

  cancel(): void {
    this.stopTimer();
    this.cancelled.emit();
  }

  private resetState(): void {
    this.otpDigits = ['', '', '', '', '', ''];
    this.isSubmitting.set(false);
    this.resendSuccess.set(false);
    this.errorMessage.set(null);
    this.timerSeconds.set(30);
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerSeconds.set(30);
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds() > 0) {
        this.timerSeconds.update(v => v - 1);
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private focusFirstInput(): void {
    const firstInput = this.otpInputs?.first;
    if (firstInput) {
      firstInput.nativeElement.focus();
    }
  }
}
