import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  viewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { OtpInputComponent } from '../../../../shared/components/otp-input/otp-input.component';

@Component({
  selector: 'app-dept-admin-otp-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, ModalComponent, OtpInputComponent],
  template: `
    @if (isOpen) {
      <app-modal
        [title]="title"
        [subtitle]="tagline"
        widthOverride="max-w-[460px]"
        (close)="cancel()"
      >
          <!-- Resend Notification Banner -->
          @if (resendSuccess()) {
            <div class="mt-3.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <app-icon name="check" [stroke]="2.5" class="text-emerald-600 shrink-0" />
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
          <app-otp-input
            class="my-6"
            [length]="6"
            [value]="otp()"
            (valueChange)="onOtpChange($event)"
            [invalid]="!!errorMessage()"
            (keydown.enter)="onEnter()"
          />

          <!-- Bottom Action Row: Resend OTP on Left, Verify on Right -->
          <ng-container modalFooter>
            <div class="flex items-center justify-between gap-3 w-full">
              <!-- Left: Resend OTP Option -->
              <div class="text-xs sm:text-[13px] text-[#5F6B76]">
                @if (timerSeconds() > 0) {
                  <span>Didn't receive OTP? Resend in <span class="tabular-nums font-bold text-[#12365A]">00:{{ timerSeconds() < 10 ? '0' + timerSeconds() : timerSeconds() }}</span></span>
                } @else {
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
                    type="button"
                    (click)="resendOtp()"
                  >
                    Didn't receive OTP? Resend
                  </button>
                }
              </div>

              <!-- Right: Verify Button -->
              <button
                appButton
                [loading]="isSubmitting()"
                type="button"
                (click)="submitOtp()"
                [disabled]="!isComplete() || isSubmitting()"
                class="shrink-0"
              >
                @if (isSubmitting()) {
                  <span>Verifying...</span>
                } @else {
                  <span>Verify</span>
                }
              </button>
            </div>
          </ng-container>
      </app-modal>
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

  private readonly otpField = viewChild(OtpInputComponent);

  /** The code typed so far (digits only, up to 6). */
  otp = signal<string>('');
  timerSeconds = signal<number>(30);
  isSubmitting = signal<boolean>(false);
  resendSuccess = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

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
    return this.otp().length === 6;
  }

  onOtpChange(value: string): void {
    this.otp.set(value);
    this.errorMessage.set(null);
    this.resendSuccess.set(false);
  }

  onEnter(): void {
    if (this.isComplete()) {
      this.submitOtp();
    }
  }

  resendOtp(): void {
    this.otp.set('');
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

    const otp = this.otp();
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
    this.otp.set('');
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
    this.otpField()?.focus(0);
  }
}
