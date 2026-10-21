import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, InputDirective, ModalComponent } from '../../../../shared';
import { OTHER_OPTION, OptionDropdownComponent } from '../../../eoi/pages/scrutiny-desk/components/option-dropdown.component';
import { MAX_TRAINEES_PER_BATCH, MIN_TRAINEES_PER_BATCH } from '../../utils/batch-limit.util';

export type BatchDecisionMode = 'revert' | 'remark' | 'reject' | 'approve';

/** What the officer fills in. The capacity is only set when the last level approves. */
export interface BatchDecisionSubmission {
  remark: string;
  capacity?: number;
}

const OTHER = OTHER_OPTION;

const REVERT_PRESETS = [
  'Please correct the faculty details of the batch.',
  'Please add the camera details and the live feed link.',
  'The batch start and end dates need to be corrected.',
  'Please upload the study material for the batch.',
  'Please complete the hostel details.'
];

const REMARK_PRESETS = [
  'Faculty details match the course requirements.',
  'Camera configuration is verified.',
  'Batch dates fall within the approved schedule of the IPA.',
  'Clarification requested on the hostel arrangements.'
];

const REJECT_PRESETS = [
  'The faculty is not available for the whole batch.',
  'The centre is not approved for this course.',
  'The batch dates clash with another batch at the centre.',
  'The batch does not meet the norms of the scheme.'
];

const APPROVE_PRESETS = [
  'Batch details verified. Approved.',
  'Faculty, camera and infrastructure details verified.',
  'Recommended for approval.'
];

const CONTENT: Record<BatchDecisionMode, { title: string; label: string; required: boolean; presets: string[] }> = {
  revert: { title: 'Return to Training Partner', label: 'Instructions for the Training Partner', required: true, presets: REVERT_PRESETS },
  remark: { title: 'Add Remark', label: 'Remark', required: true, presets: REMARK_PRESETS },
  reject: { title: 'Reject Batch', label: 'Remark', required: true, presets: REJECT_PRESETS },
  approve: { title: 'Approve Batch', label: 'Remark', required: true, presets: APPROVE_PRESETS }
};

/**
 * One small form for the four review actions on a batch: return it to the training partner, add a remark, reject or
 * approve. Every action takes a remark chosen from a dropdown, or typed under "Other". Approving also asks for the
 * capacity (trainees) sanctioned for the batch.
 */
@Component({
  selector: 'app-batch-decision-modal',
  standalone: true,
  imports: [ButtonComponent, InputDirective, ModalComponent, OptionDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="title()" [subtitle]="batchLabel()" size="sm" (close)="close.emit()">
      <div class="space-y-5 text-xs">

        @if (asksCapacity()) {
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="batch-capacity">
              Sanctioned Trainee Capacity <span class="text-rose-600">*</span>
            </label>
            <input
              appInput
              id="batch-capacity"
              type="number"
              [min]="minTrainees"
              [max]="maxTrainees"
              [value]="capacity()"
              (input)="setCapacity(+$any($event.target).value)"
              class="w-full"
            />
            <span class="text-[10.5px] text-slate-500 block">Whole number from {{ minTrainees }} to {{ maxTrainees }}. Aspirants are registered after approval.</span>
          </div>
        }

        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-800" for="batch-decision-remark">
            {{ content().label }} <span class="text-rose-600">*</span>
          </label>
          <app-option-dropdown
            inputId="batch-decision-remark"
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
          {{ actionLabel() }}
        </button>
      </ng-container>
    </app-modal>
  `
})
export class BatchDecisionModalComponent {
  readonly mode = input.required<BatchDecisionMode>();
  /** Code and course of the batch, shown under the title. */
  readonly batchLabel = input('');
  /** Capacity the batch asked for; the starting value when approving. */
  readonly requestedCapacity = input(0);

  readonly confirmed = output<BatchDecisionSubmission>();
  readonly close = output<void>();

  protected readonly other = OTHER;
  protected readonly minTrainees = MIN_TRAINEES_PER_BATCH;
  protected readonly maxTrainees = MAX_TRAINEES_PER_BATCH;
  protected readonly content = computed(() => CONTENT[this.mode()]);

  protected readonly asksCapacity = computed(() => this.mode() === 'approve');
  protected readonly title = computed(() => this.content().title);
  protected readonly actionLabel = computed(() => {
    switch (this.mode()) {
      case 'revert':
        return 'Return';
      case 'remark':
        return 'Add Remark';
      case 'reject':
        return 'Reject';
      default:
        return 'Approve';
    }
  });

  protected readonly choice = signal('');
  protected readonly custom = signal('');
  private readonly typedCapacity = signal<number | null>(null);

  /** The capacity shown: what was typed, else the one the batch asked for. */
  protected readonly capacity = computed(() => this.typedCapacity() ?? this.requestedCapacity());

  protected setCapacity(value: number): void {
    this.typedCapacity.set(value);
  }

  protected readonly remark = computed(() => (this.choice() === OTHER ? this.custom() : this.choice()).trim());

  protected readonly isValid = computed(() => {
    if (!this.remark()) return false;
    if (!this.asksCapacity()) return true;
    const capacity = Math.floor(Number(this.capacity()));
    return capacity >= MIN_TRAINEES_PER_BATCH && capacity <= MAX_TRAINEES_PER_BATCH;
  });

  protected submit(): void {
    if (!this.isValid()) return;
    this.confirmed.emit(
      this.asksCapacity() ? { remark: this.remark(), capacity: Math.floor(Number(this.capacity())) } : { remark: this.remark() }
    );
  }
}
