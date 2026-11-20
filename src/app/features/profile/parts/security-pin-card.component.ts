import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH, pinError } from '../../../core/auth/security-pin.util';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent, IconComponent, InputDirective, SectionCardComponent } from '../../../shared';

/**
 * Sets or changes the security PIN used for PIN sign-in (backend `two-step/pin/set`).
 * The backend only allows this for a signed-in user, so a first PIN is set here after signing in with OTP.
 */
@Component({
  selector: 'app-security-pin-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, SectionCardComponent],
  template: `
    <app-section-card title="Security PIN" subtitle="Used to sign in when your role asks for a second check.">
      <div class="flex flex-col gap-4 max-w-md">
        <div class="flex items-start gap-2.5 text-[13px] leading-5 text-slate-600">
          <app-icon name="info-circle" size="sm" class="mt-0.5 shrink-0 text-sky-600" />
          <span>
            Choose {{ minLength }} to {{ maxLength }} digits. Saving replaces any PIN you set before. If you have not set a PIN yet,
            sign in with OTP once and set it here.
          </span>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5 text-[13px] font-medium text-slate-700">
            New PIN
            <input
              appInput
              type="password"
              inputmode="numeric"
              autocomplete="new-password"
              [attr.maxlength]="maxLength"
              [invalid]="showError()"
              [ngModel]="pin()"
              (ngModelChange)="pin.set($event)"
            />
          </label>
          <label class="flex flex-col gap-1.5 text-[13px] font-medium text-slate-700">
            Confirm PIN
            <input
              appInput
              type="password"
              inputmode="numeric"
              autocomplete="new-password"
              [attr.maxlength]="maxLength"
              [invalid]="showError()"
              [ngModel]="confirm()"
              (ngModelChange)="confirm.set($event)"
              (keydown.enter)="save()"
            />
          </label>
        </div>

        @if (showError()) {
          <div class="text-[13px] font-medium text-rose-700" role="alert">{{ error() }}</div>
        }

        <div>
          <button appButton type="button" [loading]="saving()" [disabled]="saving()" (click)="save()">Save PIN</button>
        </div>
      </div>
    </app-section-card>
  `
})
export class SecurityPinCardComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly minLength = PIN_MIN_LENGTH;
  protected readonly maxLength = PIN_MAX_LENGTH;

  protected readonly pin = signal('');
  protected readonly confirm = signal('');
  protected readonly saving = signal(false);
  /** Errors show only after the first save attempt, not while typing. */
  private readonly attempted = signal(false);
  private readonly serverError = signal<string | null>(null);

  protected readonly error = computed(() => this.serverError() ?? pinError(this.pin(), this.confirm()));
  protected readonly showError = computed(() => this.attempted() && !!this.error());

  protected save(): void {
    this.attempted.set(true);
    this.serverError.set(null);
    if (pinError(this.pin(), this.confirm())) return;

    this.saving.set(true);
    this.authApi.setPin(this.pin()).subscribe({
      next: res => {
        this.saving.set(false);
        if (res?.success === false) {
          this.serverError.set(res.message ?? 'The PIN could not be saved.');
          return;
        }
        this.pin.set('');
        this.confirm.set('');
        this.attempted.set(false);
        this.notifications.success(res?.message ?? 'Security PIN set successfully.', 'PIN saved');
      },
      error: err => {
        this.saving.set(false);
        this.serverError.set(err?.message ?? 'The PIN could not be saved. Please try again.');
      }
    });
  }
}
