import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ButtonComponent, FormInputComponent, IconComponent, ModalComponent } from '../../shared';

/** Link Device: the Attender User enters the serial number of the DoITC biometric device issued for the batch. */
@Component({
  selector: 'app-attendance-device-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, FormInputComponent, IconComponent, ModalComponent],
  template: `
    <app-modal title="Link Biometric Device" [subtitle]="'Batch ' + batchCode()" size="md" [closeOnBackdrop]="false" (close)="closed.emit()">
      <div class="space-y-3 text-xs text-slate-700">
        <p class="m-0">
          Enter the serial number printed on the DoITC biometric device (fingerprint, face recognition or IRIS) that is used in this
          batch. Once linked, the punches of the aspirants on this device are recorded as attendance of the batch.
        </p>
        <app-form-input
          label="Device Serial Number"
          placeholder="e.g. DOITC-FP-0002"
          [required]="true"
          [uppercase]="true"
          [value]="serial()"
          (valueChange)="onSerial($event)"
          [error]="error()"
        ></app-form-input>
      </div>

      <ng-container modalFooter>
        <button appButton variant="outline" type="button" (click)="closed.emit()">Cancel</button>
        <button appButton type="button" [disabled]="!serial().trim()" (click)="link.emit(serial())">
          <app-icon name="check" size="sm" />
          <span>Link Device</span>
        </button>
      </ng-container>
    </app-modal>
  `
})
export class AttendanceDeviceModalComponent {
  readonly batchCode = input.required<string>();
  /** What is wrong with the serial the parent tried, shown under the box. */
  readonly error = input<string>('');
  readonly link = output<string>();
  readonly closed = output<void>();

  protected readonly serial = signal<string>('');

  protected onSerial(value: string): void {
    this.serial.set(value);
  }
}
