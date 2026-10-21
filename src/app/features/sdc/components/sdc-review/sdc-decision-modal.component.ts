import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, InputDirective, ModalComponent } from '../../../../shared';
import { OTHER_OPTION, OptionDropdownComponent } from '../../../eoi/pages/scrutiny-desk/components/option-dropdown.component';

export type SdcDecisionMode = 'revert' | 'remark' | 'reject' | 'approve';

/** What the officer fills in. The capacity is only set when approving. */
export interface SdcDecisionSubmission {
  remark: string;
  capacity?: number;
}

const OTHER = OTHER_OPTION;

/** Most trainees one SDC can be sanctioned for. */
const MAX_CAPACITY = 5000;

const REVERT_PRESETS = [
  'Please upload the updated NOC and lab verification photos.',
  'Please upload clear photos of the signboard, classrooms and labs.',
  'The centre address and GPS location need to be corrected.',
  'Please attach a valid rental agreement.',
  'Please complete the hostel details.'
];

const REMARK_PRESETS = [
  'Centre address and GPS location match the inspection report.',
  'Rental agreement and fire NOC are valid.',
  'Classrooms and labs match the course requirements.',
  'Biometric attendance (AEBAS) is installed and working.',
  'Clarification requested on the hostel arrangements.'
];

const REJECT_PRESETS = [
  'The centre does not exist at the given address.',
  'The GPS location of the inspection does not match the centre.',
  'Classrooms and labs do not meet the norms.',
  'Biometric attendance (AEBAS) is not installed.',
  'Rental agreement or fire NOC is missing or invalid.'
];

const APPROVE_PRESETS = [
  'Inspection report is satisfactory. Centre approved.',
  'Infrastructure and biometric attendance verified.',
  'Recommended for approval.'
];

const CONTENT: Record<SdcDecisionMode, { title: string; label: string; required: boolean; presets: string[]; action: string }> = {
  revert: { title: 'Return to Training Partner', label: 'Instructions for the Training Partner', required: true, presets: REVERT_PRESETS, action: 'Return' },
  remark: { title: 'Add Remark', label: 'Remark', required: true, presets: REMARK_PRESETS, action: 'Add Remark' },
  reject: { title: 'Reject SDC', label: 'Remark', required: true, presets: REJECT_PRESETS, action: 'Reject' },
  approve: { title: 'Approve SDC', label: 'Remark', required: false, presets: APPROVE_PRESETS, action: 'Approve' }
};

/**
 * One small form for the four review actions on an SDC: return it to the training partner, add a remark, reject or
 * approve. Every action takes a remark chosen from a dropdown, or typed under "Other". Approving also asks for the
 * capacity (trainees) sanctioned for the centre.
 */
@Component({
  selector: 'app-sdc-decision-modal',
  standalone: true,
  imports: [ButtonComponent, InputDirective, ModalComponent, OptionDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="content().title" [subtitle]="sdcLabel()" size="sm" (close)="close.emit()">
      <div class="space-y-5 text-xs">

        @if (mode() === 'approve') {
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="sdc-capacity">
              Sanctioned Capacity (Trainees) <span class="text-rose-600">*</span>
            </label>
            <input
              appInput
              id="sdc-capacity"
              type="number"
              min="1"
              [max]="maxCapacity"
              [value]="capacity()"
              (input)="setCapacity(+$any($event.target).value)"
              class="w-full"
            />
            <span class="text-[10.5px] text-slate-500 block">Whole number from 1 to {{ maxCapacity }}.</span>
          </div>
        }

        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-800" for="sdc-decision-remark">
            {{ content().label }}
            @if (content().required) {
              <span class="text-rose-600">*</span>
            } @else {
              <span class="text-slate-400 font-normal">(optional)</span>
            }
          </label>
          <app-option-dropdown
            inputId="sdc-decision-remark"
            placeholder="Select a remark"
            [options]="content().presets"
            [value]="choice()"
            (valueChange)="choice.set($event)"
          />

          @if (choice() === other) {
            <textarea
              appInput
              rows="3"
              aria-label="Your remark"
              [value]="custom()"
              (input)="custom.set($any($event.target).value)"
              placeholder="Type your remark"
              class="w-full"
            ></textarea>
          }
        </div>
      </div>

      <ng-container modalFooter>
        <button appButton variant="outline" (click)="close.emit()">Cancel</button>
        <button appButton [variant]="mode() === 'reject' ? 'danger' : 'primary'" (click)="submit()" [disabled]="!isValid()">
          {{ content().action }}
        </button>
      </ng-container>
    </app-modal>
  `
})
export class SdcDecisionModalComponent {
  readonly mode = input.required<SdcDecisionMode>();
  /** Name and code of the SDC, shown under the title. */
  readonly sdcLabel = input('');
  /** Capacity the training partner asked for; the starting value when approving. */
  readonly requestedCapacity = input(0);

  readonly confirmed = output<SdcDecisionSubmission>();
  readonly close = output<void>();

  protected readonly other = OTHER;
  protected readonly maxCapacity = MAX_CAPACITY;
  protected readonly content = computed(() => CONTENT[this.mode()]);

  protected readonly choice = signal('');
  protected readonly custom = signal('');
  private readonly typedCapacity = signal<number | null>(null);

  /** The capacity shown: what was typed, else the one the training partner asked for. */
  protected readonly capacity = computed(() => this.typedCapacity() ?? this.requestedCapacity());

  protected setCapacity(value: number): void {
    this.typedCapacity.set(value);
  }

  protected readonly remark = computed(() => (this.choice() === OTHER ? this.custom() : this.choice()).trim());

  protected readonly isValid = computed(() => {
    if (this.content().required && !this.remark()) return false;
    if (this.mode() !== 'approve') return true;
    const capacity = Math.floor(Number(this.capacity()));
    return capacity >= 1 && capacity <= MAX_CAPACITY;
  });

  protected submit(): void {
    if (!this.isValid()) return;
    this.confirmed.emit(
      this.mode() === 'approve'
        ? { remark: this.remark(), capacity: Math.floor(Number(this.capacity())) }
        : { remark: this.remark() }
    );
  }
}
