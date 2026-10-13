import { ChangeDetectionStrategy, Component, HostListener, computed, input, output, signal } from '@angular/core';
import { OTHER_OPTION, OptionDropdownComponent } from './option-dropdown.component';

export type DecisionMode = 'remark' | 'reject' | 'approve';

/** A grade from the Grading Master. */
export interface GradeOption {
  grade: string;
  minimum: number;
  maximum: number;
  range: string;
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
  imports: [OptionDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
      (click)="close.emit()"
    >
      <div
        class="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl font-sans overflow-hidden my-auto max-h-[92vh] flex flex-col"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-title"
      >
        <div class="h-1.5 w-full shrink-0" [class]="mode() === 'reject' ? 'bg-rose-600' : 'bg-navy'"></div>

        <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <h2 id="decision-title" class="text-base sm:text-lg font-bold text-slate-900 m-0">{{ content().title }}</h2>
            <p class="text-xs text-slate-500 m-0 mt-0.5">{{ applicantLabel() }}</p>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-5 text-xs">

          @if (mode() === 'approve') {
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-slate-800" for="decision-grade">
                Grade <span class="text-rose-600">*</span>
              </label>
              <select
                id="decision-grade"
                (change)="grade.set($any($event.target).value)"
                class="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-navy cursor-pointer shadow-2xs"
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
                rows="3"
                [value]="custom()"
                (input)="custom.set($any($event.target).value)"
                placeholder="Type your remark"
                class="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-navy bg-white shadow-2xs leading-relaxed"
              ></textarea>
            }
          </div>
        </div>

        <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="submit()"
            [disabled]="!isValid()"
            class="w-full sm:w-auto px-5 py-2 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            [class]="mode() === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-navy hover:bg-[#07243c]'"
            style="color: #ffffff !important;"
          >
            {{ content().action }}
          </button>
        </div>
      </div>
    </div>
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

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }

  protected submit(): void {
    if (!this.isValid()) return;
    this.confirmed.emit(
      this.mode() === 'approve' ? { remark: this.remark(), grade: this.grade() } : { remark: this.remark() }
    );
  }
}
