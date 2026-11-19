import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, InputDirective, ModalComponent } from '../../../../../shared';
import { OTHER_OPTION, OptionDropdownComponent } from './option-dropdown.component';

export type DecisionMode = 'remark' | 'reject' | 'approve';

/** A grade from the Grading Master. */
export interface GradeOption {
  grade: string;
  minimum: number;
  maximum: number;
  range: string;
  schemeName?: string;
}

/** What the committee member fills in. The grade is only set when approving. */
export interface DecisionSubmission {
  remark: string;
  grade?: string;
}

const OTHER = OTHER_OPTION;

const REMARK_PRESETS = [
  'All statutory documents validated with original OTR credentials.',
  'Technical turnover criteria satisfied as per RFP Section 4.2.',
  'NSDC partner affiliation certificate is active and authenticated.',
  'Clarification requested regarding training centre practical lab infrastructure.',
  'Bank mandate and cancelled cheque matched with PFMS records.',
  'GST active status checked successfully on GSTN portal.'
];

const REJECT_PRESETS = [
  'Minimum turnover criteria are not met.',
  'Training centre infrastructure is inadequate.',
  'The organisation is debarred or blacklisted.',
  'Statutory documents are incomplete or invalid.',
  'CA turnover certificate does not have a valid UDIN.',
  'Past performance under earlier schemes is below the required level.'
];

const APPROVE_PRESETS = [
  'All documents verified. Eligible for empanelment.',
  'Technical and turnover criteria are met.',
  'Infrastructure and past performance are satisfactory.',
  'Recommended for approval.'
];

const CONTENT: Record<DecisionMode, { title: string; label: string; required: boolean; presets: string[]; action: string }> = {
  remark: { title: 'Add Remark', label: 'Remark', required: true, presets: REMARK_PRESETS, action: 'Add Remark' },
  reject: { title: 'Reject Application', label: 'Remark', required: true, presets: REJECT_PRESETS, action: 'Reject' },
  approve: { title: 'Approve Application', label: 'Remark', required: false, presets: APPROVE_PRESETS, action: 'Approve' }
};

/**
 * One small form for the three committee actions: add a remark, reject, or approve.
 * Every action takes a remark chosen from a dropdown, or typed under "Other".
 * Approving also asks for a grade from the Grading Master.
 */
@Component({
  selector: 'app-scrutiny-decision-modal',
  standalone: true,
  imports: [ButtonComponent, InputDirective, ModalComponent, OptionDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="content().title" [subtitle]="applicantLabel()" size="sm" (close)="close.emit()">
        <div class="space-y-5 text-xs">

          @if (mode() === 'approve') {
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-slate-800" for="decision-grade">
                Grade <span class="text-rose-600">*</span>
              </label>
              <select
                appInput
                id="decision-grade"
                (change)="grade.set($any($event.target).value)"
                class="w-full cursor-pointer"
              >
                <option value="" [selected]="!grade()">Select grade</option>
                @for (g of grades(); track g.grade) {
                  <option [value]="g.grade" [selected]="g.grade === grade()">{{ g.grade }}</option>
                }
              </select>
            </div>
          }

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="decision-remark">
              {{ content().label }}
              @if (content().required) {
                <span class="text-rose-600">*</span>
              } @else {
                <span class="text-slate-400 font-normal">(optional)</span>
              }
            </label>
            <app-option-dropdown
              inputId="decision-remark"
              placeholder="Select a remark"
              [options]="content().presets"
              [value]="choice()"
              (valueChange)="choice.set($event)"
            />

            @if (choice() === other) {
              <textarea
                appInput
                rows="3"
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
export class ScrutinyDecisionModalComponent {
  readonly mode = input.required<DecisionMode>();
  readonly applicantLabel = input('');
  /** Grades from the Grading Master, used when approving. */
  readonly grades = input<GradeOption[]>([]);

  readonly confirmed = output<DecisionSubmission>();
  readonly close = output<void>();

  protected readonly other = OTHER;
  protected readonly content = computed(() => CONTENT[this.mode()]);

  protected readonly choice = signal('');
  protected readonly custom = signal('');
  protected readonly grade = signal('');

  protected readonly remark = computed(() =>
    (this.choice() === OTHER ? this.custom() : this.choice()).trim()
  );

  protected readonly isValid = computed(() => {
    if (this.content().required && !this.remark()) return false;
    // Approving needs a grade; the remark is optional.
    return this.mode() !== 'approve' || !!this.grade();
  });

  protected submit(): void {
    if (!this.isValid()) return;
    this.confirmed.emit(
      this.mode() === 'approve' ? { remark: this.remark(), grade: this.grade() } : { remark: this.remark() }
    );
  }
}
