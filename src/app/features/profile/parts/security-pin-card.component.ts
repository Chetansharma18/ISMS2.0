import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PinStatusStore } from '../../../core/auth/pin-status.store';
import { PIN_LENGTH, pinError } from '../../../core/auth/security-pin.util';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent, IconComponent, OtpInputComponent, SectionCardComponent, StatusBadgeComponent } from '../../../shared';

/**
 * Security PIN of the signed-in user (PIN sign-in, backend `two-step/set?type=pin`).
 *
 * First it says whether the user has a PIN, then offers "Set PIN now" or "Reset PIN"; the PIN boxes open only then.
 * The backend reports whether a PIN exists only at sign-in (PinStatusStore keeps that answer). When it has not said
 * yet, the card says so and still lets the user set one (saving replaces any PIN set before).
 */
@Component({
  selector: 'app-security-pin-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, OtpInputComponent, SectionCardComponent, StatusBadgeComponent],
  // Block, so the page's vertical spacing applies (a custom element is inline by default).
  host: { class: 'block' },
  template: `
    <app-section-card title="Security PIN" subtitle="Used to sign in when your role asks for a second check.">
      <div class="flex flex-col gap-5">
        @if (!editing()) {
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="flex items-start gap-3 min-w-0">
              <span
                class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                [class.bg-emerald-50]="status() === true" [class.text-emerald-700]="status() === true"
                [class.bg-amber-50]="status() !== true" [class.text-amber-700]="status() !== true"
              >
                <app-icon [name]="status() === true ? 'shield-check' : 'lock'" size="sm" />
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="m-0 text-sm font-semibold text-slate-900">
                    @switch (status()) {
                      @case (true) { You have a security PIN }
                      @case (false) { You do not have a security PIN }
                      @default { Security PIN }
                    }
                  </p>
                  @switch (status()) {
                    @case (true) { <app-status-badge variant="success">Set</app-status-badge> }
                    @case (false) { <app-status-badge variant="warning">Not set</app-status-badge> }
                    @default { <app-status-badge variant="neutral">Not known yet</app-status-badge> }
                  }
                </div>
                <p class="m-0 mt-1 text-[13px] leading-5 text-slate-600">
                  @switch (status()) {
                    @case (true) { You can sign in with your {{ pinLength }}-digit PIN. If you have forgotten it, reset it here. }
                    @case (false) { Set a {{ pinLength }}-digit PIN to use PIN sign-in. }
                    @default {
                      Whether you have a PIN is checked when you sign in with a role that asks for a second check. You can still set
                      a PIN now; it replaces any PIN you set before.
                    }
                  }
                </p>
              </div>
            </div>
            <button appButton size="sm" type="button" [variant]="status() === true ? 'outline' : 'primary'" (click)="open()">
              <app-icon [name]="status() === true ? 'refresh' : 'plus'" size="sm" />
              <span>{{ status() === true ? 'Reset PIN' : 'Set PIN now' }}</span>
            </button>
          </div>
        } @else {
          <!-- PIN entry: centred, the two PINs side by side with clear space between them -->
          <div class="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-2">
            <div class="text-center space-y-1">
              <p class="m-0 text-sm font-semibold text-slate-900">{{ status() === true ? 'Reset your security PIN' : 'Set your security PIN' }}</p>
              <p class="m-0 text-[13px] leading-5 text-slate-600">
                {{ status() === true ? 'Enter a new' : 'Choose a' }} {{ pinLength }}-digit PIN and type it again to confirm.
                {{ status() === true ? 'It replaces your current PIN.' : '' }}
              </p>
            </div>

            <div class="w-full grid gap-6 sm:grid-cols-2 sm:gap-12">
              <div class="flex flex-col items-center gap-2.5">
                <span class="text-[13px] font-semibold text-slate-700">New PIN</span>
                <div class="w-full max-w-[240px]">
                  <app-otp-input [length]="pinLength" masked label="New PIN" [invalid]="showError()" [value]="pin()" (valueChange)="pin.set($event)" />
                </div>
              </div>
              <div class="flex flex-col items-center gap-2.5">
                <span class="text-[13px] font-semibold text-slate-700">Confirm PIN</span>
                <div class="w-full max-w-[240px]">
                  <app-otp-input
                    [length]="pinLength"
                    masked
                    label="Confirm PIN"
                    [autofocus]="false"
                    [invalid]="showError()"
                    [value]="confirm()"
                    (valueChange)="confirm.set($event)"
                  />
                </div>
              </div>
            </div>

            @if (showError()) {
              <div class="text-[13px] font-medium text-rose-700 text-center" role="alert">{{ error() }}</div>
            }

            <div class="flex items-center justify-center gap-3 pt-1">
              <button appButton variant="outline" type="button" [disabled]="saving()" (click)="cancel()">Cancel</button>
              <button appButton type="button" [loading]="saving()" [disabled]="saving()" (click)="save()">
                {{ status() === true ? 'Save New PIN' : 'Set PIN' }}
              </button>
            </div>
          </div>
        }
      </div>
    </app-section-card>
  `
})
export class SecurityPinCardComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly auth = inject(AuthService);
  private readonly pinStatus = inject(PinStatusStore);
  private readonly notifications = inject(NotificationService);

  protected readonly pinLength = PIN_LENGTH;
  /** true / false as the backend last said, null when it has not said yet. */
  protected readonly status = computed(() => this.pinStatus.statusOf(this.auth.currentUser()?.ssoId));

  protected readonly editing = signal(false);
  protected readonly pin = signal('');
  protected readonly confirm = signal('');
  protected readonly saving = signal(false);
  /** Errors show only after the first save attempt, not while typing. */
  private readonly attempted = signal(false);
  private readonly serverError = signal<string | null>(null);

  protected readonly error = computed(() => this.serverError() ?? pinError(this.pin(), this.confirm()));
  protected readonly showError = computed(() => this.attempted() && !!this.error());

  protected open(): void {
    this.clear();
    this.editing.set(true);
  }

  protected cancel(): void {
    this.clear();
    this.editing.set(false);
  }

  protected save(): void {
    this.attempted.set(true);
    this.serverError.set(null);
    if (pinError(this.pin(), this.confirm())) return;

    const hadPin = this.status() === true;
    this.saving.set(true);
    this.authApi.setPin(this.pin()).subscribe({
      next: res => {
        this.saving.set(false);
        if (res?.success === false) {
          this.serverError.set(res.message ?? 'The PIN could not be saved.');
          return;
        }
        this.pinStatus.record(this.auth.currentUser()?.ssoId, true);
        this.cancel();
        this.notifications.success(
          res?.message ?? (hadPin ? 'Your security PIN has been reset.' : 'Your security PIN has been set.'),
          hadPin ? 'PIN reset' : 'PIN set'
        );
      },
      error: err => {
        this.saving.set(false);
        this.serverError.set(err?.message ?? 'The PIN could not be saved. Please try again.');
      }
    });
  }

  private clear(): void {
    this.pin.set('');
    this.confirm.set('');
    this.attempted.set(false);
    this.serverError.set(null);
  }
}
