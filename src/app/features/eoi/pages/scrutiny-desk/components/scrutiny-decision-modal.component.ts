import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonComponent, InputDirective, ModalComponent, DropdownComponent } from '../../../../../shared';
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
  remark: { title: 'Add Remark', label: 'Remark', required: true, presets: REMARK_PRESETS, action: 'Submit' },
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
  imports: [NgClass, ButtonComponent, InputDirective, ModalComponent, OptionDropdownComponent, DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="content().title" [subtitle]="applicantLabel()" size="sm" (close)="close.emit()">
        <div class="space-y-4 text-xs">

          @if (mode() === 'approve') {
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-slate-800" for="decision-grade">
                Grade <span class="text-rose-600">*</span>
              </label>
              <app-dropdown
                inputId="decision-grade"
                [options]="uniqueGradeValues()"
                [value]="grade()"
                (valueChange)="grade.set($event)"
                placeholder="Select grade"
              />
            </div>
          }

          @if (mode() === 'remark') {
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="block text-xs font-semibold text-slate-800" for="decision-remark">
                  {{ content().label }} <span class="text-rose-600">*</span>
                </label>
                <span
                  class="text-[11px] tabular-nums"
                  [ngClass]="{
                    'text-rose-600 font-semibold': wordCount() > 250,
                    'text-slate-400': wordCount() <= 250
                  }"
                >
                  {{ wordCount() }}/250 words
                </span>
              </div>
              <textarea
                id="decision-remark"
                appInput
                rows="4"
                [value]="custom()"
                (input)="onTextInput($any($event.target).value)"
                placeholder="Type your remark (maximum 250 words)..."
                class="w-full"
                [invalid]="wordCount() > 250"
              ></textarea>
              @if (wordCount() > 250) {
                <p class="text-[11px] text-rose-600 m-0">Remark exceeds the maximum limit of 250 words.</p>
              }

              <div class="pt-1">
                <span class="text-[11px] text-slate-500 block mb-1">Preset remarks (optional):</span>
                <app-option-dropdown
                  inputId="decision-remark-preset"
                  placeholder="Select a preset remark"
                  [options]="content().presets"
                  [value]="choice()"
                  (valueChange)="onPresetSelect($event)"
                />
              </div>
            </div>
          } @else {
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
          }
        </div>

        <ng-container modalFooter>
          <button appButton [variant]="mode() === 'reject' ? 'danger' : 'primary'" (click)="submit()" [disabled]="!isValid()">
            {{ content().action }}
          </button>
        </ng-container>
    </app-modal>
  `
})
export class ScrutinyDecisionModalComponent implements OnInit {
  readonly mode = input.required<DecisionMode>();
  readonly applicantLabel = input('');
  readonly initialRemark = input<string>('');
  /** Grades from the Grading Master, used when approving. */
  readonly grades = input<GradeOption[]>([]);

  readonly uniqueGrades = computed(() => {
    const raw = this.grades();
    const seen = new Set<string>();
    const result: GradeOption[] = [];
    for (const g of raw) {
      const clean = g.grade?.trim();
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        result.push({ ...g, grade: clean });
      }
    }
    return result;
  });

  readonly uniqueGradeValues = computed(() => this.uniqueGrades().map(g => g.grade));

  readonly confirmed = output<DecisionSubmission>();
  readonly close = output<void>();

  protected readonly other = OTHER;
  protected readonly content = computed(() => CONTENT[this.mode()]);

  protected readonly choice = signal('');
  protected readonly custom = signal('');
  protected readonly grade = signal('');

  ngOnInit(): void {
    const init = this.initialRemark();
    if (init && !this.custom()) {
      this.custom.set(init);
    }
  }

  protected onTextInput(val: string): void {
    this.custom.set(val);
  }

  protected onPresetSelect(val: string): void {
    this.choice.set(val);
    if (val && val !== OTHER) {
      this.custom.set(val);
    }
  }

  getWordCount(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  protected readonly wordCount = computed(() => {
    return this.getWordCount(this.custom());
  });

  protected readonly remark = computed(() =>
    (this.choice() === OTHER ? this.custom() : this.choice()).trim()
  );

  protected readonly isValid = computed(() => {
    if (this.mode() === 'remark') {
      const words = this.wordCount();
      return words > 0 && words <= 250;
    }
    if (this.content().required && !this.remark()) return false;
    // Approving needs a grade; the remark is optional.
    return this.mode() !== 'approve' || !!this.grade();
  });

  protected submit(): void {
    if (!this.isValid()) return;
    const finalRemark = this.mode() === 'remark' ? this.custom().trim() : this.remark();
    this.confirmed.emit(
      this.mode() === 'approve' ? { remark: finalRemark, grade: this.grade() } : { remark: finalRemark }
    );
  }
}
