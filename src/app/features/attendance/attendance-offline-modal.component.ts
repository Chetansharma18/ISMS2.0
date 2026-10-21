import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, FormInputComponent, FormSelectComponent, IconComponent, ModalComponent } from '../../shared';

export const OFFLINE_REASONS = [
  'Biometric device not working',
  'Power or network failure',
  'Fingerprint or face not recognised',
  'Device not yet linked',
  'Other'
];

/** Mark Offline: the reason the selected aspirants are marked by hand. The marks wait for the Attender User's approval. */
@Component({
  selector: 'app-attendance-offline-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, FormInputComponent, FormSelectComponent, IconComponent, ModalComponent],
  template: `
    <app-modal
      title="Mark Attendance Offline"
      [subtitle]="count() + (count() === 1 ? ' aspirant' : ' aspirants') + ' • ' + date() + ' • ' + slotLabel()"
      size="md"
      [closeOnBackdrop]="false"
      (close)="closed.emit()"
    >
      <div class="space-y-3">
        <p class="text-xs text-slate-700 m-0">
          Offline marks are for when the device cannot be used. They count in the reports only after the Attender User approves them.
        </p>
        <app-form-select label="Reason" [required]="true" [options]="reasons" [value]="reason()" (valueChange)="reason.set($event)"></app-form-select>
        @if (reason() === 'Other') {
          <app-form-input
            label="Details"
            placeholder="Why the device could not be used"
            [required]="true"
            [maxLength]="200"
            [value]="details()"
            (valueChange)="details.set($event)"
          ></app-form-input>
        }
      </div>

      <ng-container modalFooter>
        <button appButton variant="outline" type="button" (click)="closed.emit()">Cancel</button>
        <button appButton type="button" [disabled]="!finalReason()" (click)="confirmed.emit(finalReason())">
          <app-icon name="check" size="sm" />
          <span>Mark Offline</span>
        </button>
      </ng-container>
    </app-modal>
  `
})
export class AttendanceOfflineModalComponent {
  readonly count = input.required<number>();
  readonly date = input.required<string>();
  readonly slotLabel = input.required<string>();
  readonly confirmed = output<string>();
  readonly closed = output<void>();

  protected readonly reasons = OFFLINE_REASONS;
  protected readonly reason = signal<string>('');
  protected readonly details = signal<string>('');

  /** The reason to record; empty until the form is complete. */
  protected readonly finalReason = computed(() => {
    if (!this.reason()) return '';
    if (this.reason() !== 'Other') return this.reason();
    return this.details().trim() ? `Other: ${this.details().trim()}` : '';
  });
}
