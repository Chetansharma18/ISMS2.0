import {
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs select-none font-sans animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-title"
        (keydown.escape)="cancel()"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Card -->
        <div
          class="relative w-full max-w-[460px] bg-white rounded-2xl shadow-2xl border border-[#DCE4ED] p-6 sm:p-7 animate-in zoom-in-95 duration-150"
          (click)="$event.stopPropagation()"
        >
          <!-- Close Button -->
          <button
            type="button"
            (click)="cancel()"
            class="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-[#12365A] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Heading & Tagline -->
          <div class="pr-6">
            <h2 id="otp-title" class="text-xl sm:text-[22px] font-bold text-[#12365A] tracking-tight m-0">
              {{ title }}
            </h2>
            <p class="text-xs sm:text-[13.5px] text-[#5F6B76] mt-1.5 m-0 leading-normal">
              {{ tagline }}
            </p>
          </div>

          <!-- Resend Notification Banner -->
          @if (resendSuccess()) {
            <div class="mt-3.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>New OTP has been sent successfully.</span>
            </div>
          }

          <!-- Error Banner -->
          @if (errorMessage()) {
            <div class="mt-3.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
              {{ errorMessage() }}
            </div>
          }

          <!-- 6 Individual Digit Inputs with Connectors -->
          <div class="flex items-center justify-between gap-1 sm:gap-1.5 my-6" (paste)="onPaste($event)">
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
                class="w-10 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold text-[#12365A] bg-white border rounded-xl focus:border-[#12365A] focus:ring-2 focus:ring-[#12365A]/15 outline-none transition-all shadow-2xs select-none"
                [class.border-rose-400]="errorMessage()"
                [class.border-[#12365A]]="digit !== '' && !errorMessage()"
                [class.border-[#DCE4ED]]="digit === '' && !errorMessage()"
              />
              @if (i < 5) {
                <span class="w-1.5 sm:w-2.5 h-[2px] bg-[#DCE4ED] shrink-0"></span>
              }
            }
          </div>

          <!-- Bottom Action Row: Resend OTP on Left, Verify on Right -->
          <div class="flex items-center justify-between gap-3 pt-1">
            <!-- Left: Resend OTP Option -->
            <div class="text-xs sm:text-[13px] text-[#5F6B76]">
              @if (timerSeconds() > 0) {
                <span>Didn't receive OTP? Resend in <span class="font-mono font-bold text-[#12365A]">00:{{ timerSeconds() < 10 ? '0' + timerSeconds() : timerSeconds() }}</span></span>
              } @else {
                <button
                  type="button"
                  (click)="resendOtp()"
                  class="text-[#12365A] hover:text-[#0B2440] font-semibold hover:underline cursor-pointer transition-colors border-0 bg-transparent p-0"
                >
                  Didn't receive OTP? Resend
                </button>
              }
            </div>

            <!-- Right: Verify Button -->
            <button
              type="button"
              (click)="submitOtp()"
              [disabled]="!isComplete() || isSubmitting()"
              class="px-6 py-2 sm:px-7 sm:py-2.5 rounded-full text-sm font-semibold text-white bg-[#12365A] hover:bg-[#0B2440] disabled:opacity-40 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 border-0"
            >
              @if (isSubmitting()) {
                <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              } @else {
                <span>Verify</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DeptAdminOtpModalComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() ssoId = 'dept_admin';
  @Input() title = 'OTP Verification';
  @Input() tagline = 'Enter the OTP sent to your registered mobile number.';

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

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
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
