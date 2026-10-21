import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, FormInputComponent, FormSelectComponent, FormTextareaComponent, ModalComponent } from '../../../../shared';
import type { SelectItem } from '../../../../shared/components/form-controls/form-select/form-select.component';
import type { SdcInspectionData, SdcRecord } from '../../models/sdc.model';
import { todayIso } from '../../utils/batch-approval.util';
import { InspectionDraft, InspectionErrors, validateInspection } from './sdc-review.util';

const RECOMMENDATIONS: SelectItem[] = [
  { value: 'RECOMMENDED', label: 'Recommended' },
  { value: 'CORRECTION_REQUIRED', label: 'Correction required' },
  { value: 'REJECTED', label: 'Not recommended' }
];

/** The four things the auditor confirms on the spot. */
const CHECKS: { key: 'physicalExistenceVerified' | 'signboardVerified' | 'classroomsLabsVerified' | 'biometricAebasVerified'; label: string }[] = [
  { key: 'physicalExistenceVerified', label: 'The centre exists at the address given' },
  { key: 'signboardVerified', label: 'Signboard is displayed' },
  { key: 'classroomsLabsVerified', label: 'Classrooms and labs match the course requirements' },
  { key: 'biometricAebasVerified', label: 'Biometric attendance (AEBAS) is installed and working' }
];

/**
 * The inspection form of an SDC: who inspected it and when, what was verified, where the auditor stood (checked against
 * the GPS position of the centre) and the recommendation. Submitting it moves the SDC on to approval.
 */
@Component({
  selector: 'app-sdc-inspection-modal',
  standalone: true,
  imports: [ButtonComponent, FormInputComponent, FormSelectComponent, FormTextareaComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal title="Inspection Form" [subtitle]="sdcLabel()" size="lg" [closeOnBackdrop]="false" (close)="close.emit()">
      <div class="space-y-5 text-xs">

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-5 sm:col-span-2">
            <app-form-input label="Name of the Auditor" [required]="true" [value]="draft().auditorName" [error]="shown().auditorName" (valueChange)="set('auditorName', $event)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Auditor Mobile No." type="tel" [maxLength]="10" [required]="true" [value]="draft().auditorPhone" [error]="shown().auditorPhone" (valueChange)="set('auditorPhone', $event)"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Inspection Date" type="date" [required]="true" [value]="draft().inspectionDate" [error]="shown().inspectionDate" (valueChange)="set('inspectionDate', $event)"></app-form-input>
          </div>
        </div>

        <!-- What the auditor verified -->
        <fieldset class="m-0 p-0 border-0 space-y-2">
          <legend class="p-0 mb-1 text-xs font-semibold text-slate-800">Verified at the centre</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            @for (check of checks; track check.key) {
              <label class="flex items-start gap-2 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  class="mt-0.5 w-3.5 h-3.5 shrink-0 cursor-pointer"
                  [checked]="draft()[check.key]"
                  (change)="setCheck(check.key, $any($event.target).checked)"
                />
                <span>{{ check.label }}</span>
              </label>
            }
          </div>
        </fieldset>

        <!-- Where the auditor stood -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Auditor Latitude (GPS)" type="number" [required]="true" [value]="draft().auditorLatitude" [error]="shown().auditorLatitude" (valueChange)="set('auditorLatitude', $event)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Auditor Longitude (GPS)" type="number" [required]="true" [value]="draft().auditorLongitude" [error]="shown().auditorLongitude" (valueChange)="set('auditorLongitude', $event)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-select label="Recommendation" [required]="true" [items]="recommendations" placeholder="Select" [value]="draft().recommendation" [error]="shown().recommendation" (valueChange)="set('recommendation', $event)"></app-form-select>
          </div>
          <div class="lg:col-span-12 sm:col-span-2 -mt-1 text-[11px] text-slate-500">
            GPS position of the centre as registered: {{ centrePosition() }}. The distance is worked out when the form is submitted and must be within 100 m.
          </div>
        </div>

        <app-form-textarea label="Remarks of the Auditor" [required]="true" [rows]="3" [maxLength]="500" [showCharCount]="true" [value]="draft().auditorRemarks" [error]="shown().auditorRemarks" (valueChange)="set('auditorRemarks', $event)"></app-form-textarea>
      </div>

      <ng-container modalFooter>
        <button appButton variant="outline" type="button" (click)="close.emit()">Cancel</button>
        <button appButton type="button" (click)="submit()">Submit Inspection</button>
      </ng-container>
    </app-modal>
  `
})
export class SdcInspectionModalComponent {
  readonly sdc = input.required<SdcRecord>();
  /** Name and code of the SDC, shown under the title. */
  readonly sdcLabel = input('');

  readonly confirmed = output<Partial<SdcInspectionData>>();
  readonly close = output<void>();

  protected readonly checks = CHECKS;
  protected readonly recommendations = RECOMMENDATIONS;

  protected readonly draft = signal<InspectionDraft>({
    auditorName: '',
    auditorPhone: '',
    inspectionDate: todayIso(),
    physicalExistenceVerified: false,
    signboardVerified: false,
    classroomsLabsVerified: false,
    biometricAebasVerified: false,
    auditorLatitude: '',
    auditorLongitude: '',
    recommendation: '',
    auditorRemarks: ''
  });

  /** Errors are shown only after the first attempt to submit. */
  private readonly attempted = signal(false);
  private readonly errors = computed<InspectionErrors>(() => validateInspection(this.draft(), todayIso()));
  protected readonly shown = computed<InspectionErrors>(() => (this.attempted() ? this.errors() : {}));

  protected readonly centrePosition = computed(() => {
    const { latitude, longitude } = this.sdc();
    return latitude != null && longitude != null ? `${latitude}, ${longitude}` : 'not recorded';
  });

  protected set(key: 'auditorName' | 'auditorPhone' | 'inspectionDate' | 'auditorLatitude' | 'auditorLongitude' | 'recommendation' | 'auditorRemarks', value: string): void {
    this.draft.update(current => ({ ...current, [key]: value }));
  }

  protected setCheck(key: (typeof CHECKS)[number]['key'], value: boolean): void {
    this.draft.update(current => ({ ...current, [key]: value }));
  }

  protected submit(): void {
    this.attempted.set(true);
    if (Object.keys(this.errors()).length > 0) return;
    const d = this.draft();
    this.confirmed.emit({
      auditorName: d.auditorName.trim(),
      auditorPhone: d.auditorPhone.trim(),
      inspectionDate: d.inspectionDate,
      physicalExistenceVerified: d.physicalExistenceVerified,
      signboardVerified: d.signboardVerified,
      classroomsLabsVerified: d.classroomsLabsVerified,
      biometricAebasVerified: d.biometricAebasVerified,
      auditorLatitude: Number(d.auditorLatitude),
      auditorLongitude: Number(d.auditorLongitude),
      recommendation: d.recommendation as SdcInspectionData['recommendation'],
      auditorRemarks: d.auditorRemarks.trim()
    });
  }
}
