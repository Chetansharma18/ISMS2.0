import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ProgressRingComponent } from '../../../shared/components/progress-ring/progress-ring.component';
import { OtrFormDef, OtrRecords, OtrStepValues } from '../../registration/models/otr-api.model';
import { documentsFrom, formSteps, hasSavedStep, initialStepValues, isSubmitted, referenceNumber } from '../../registration/otr-form.util';
import { OtrReviewComponent } from '../../registration/parts/otr-review.component';
import { profileCompletion, profileSteps } from '../profile-view.util';

/**
 * The organisation's One Time Registration on the profile, built from the backend form definition (GET /otr/form)
 * and the saved records: progress, the steps with their status and, once something is saved, every saved answer
 * (fixed and FormManager fields) read-only.
 */
@Component({
  selector: 'app-profile-otr-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, ProgressRingComponent, OtrReviewComponent],
  // A block with its own spacing: the progress card, the steps and the details stack with a gap.
  host: { class: 'flex flex-col gap-5' },
  template: `
    @let f = form();
    <!-- Progress and the main action -->
    <div class="w-full bg-white border border-[#EADCE2] rounded-[10px] p-4 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
      <div class="flex flex-col sm:flex-row items-center sm:items-start md:items-center text-center sm:text-left gap-4 sm:gap-6 flex-1 min-w-0">
        <app-progress-ring [value]="completion()" [complete]="submitted()" class="w-20 h-20 sm:w-24 sm:h-24" />
        <div class="flex-1 min-w-0 space-y-1.5">
          <h2 class="text-base sm:text-[17px] font-bold text-[#25212A] m-0">{{ f?.title || 'Organization Registration' }}</h2>
          <p class="text-xs sm:text-[13px] text-[#625663] leading-relaxed m-0 max-w-3xl">
            @if (submitted()) {
              Your registration has been submitted.
              @if (reference(); as ref) {
                Reference number: <span class="font-semibold text-navy tabular-nums">{{ ref }}</span>
              }
            } @else {
              {{ f?.description || 'Complete all registration steps to become eligible for scheme proposals.' }}
            }
          </p>
        </div>
      </div>
      <div class="shrink-0 w-full sm:w-auto">
        <button appButton size="lg" type="button" class="w-full sm:w-auto" (click)="openStep.emit(nextStep())">
          <span>{{ ctaText() }}</span>
          <app-icon name="forward" />
        </button>
      </div>
    </div>

    @if (f) {
      <!-- Steps of the backend form -->
      <div class="space-y-3 pt-1">
        <h3 class="text-base sm:text-lg font-bold text-slate-900 m-0">Registration Steps</h3>
        <div class="space-y-3">
          @for (step of steps(); track step.number) {
            <div class="bg-white rounded-[10px] border border-[#EADCE2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-3.5 min-w-0">
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  [class.bg-navy]="step.completed || step.current"
                  [class.text-white]="step.completed || step.current"
                  [class.bg-slate-100]="!step.completed && !step.current"
                  [class.text-slate-400]="!step.completed && !step.current"
                >{{ step.number }}</span>
                <div class="min-w-0">
                  <h4 class="text-[15px] font-bold text-slate-800 m-0 leading-snug">{{ step.title }}</h4>
                  <p class="text-xs text-slate-500 m-0 mt-0.5">{{ step.subtitle }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between md:justify-end gap-3 shrink-0">
                @if (step.completed) {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-green-700 border border-[#A7F3D0]">
                    <app-icon name="check" size="sm" [stroke]="2.5" />
                    <span>Completed</span>
                  </span>
                  <button appButton variant="outline" size="sm" type="button" (click)="openStep.emit(step.number)">View Details</button>
                } @else {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                    <app-icon name="clock-circle" size="sm" [stroke]="2" />
                    <span>Pending</span>
                  </span>
                  @if (step.current) {
                    <button appButton size="sm" type="button" (click)="openStep.emit(step.number)">
                      <span>Continue Step</span>
                      <app-icon name="forward" size="sm" />
                    </button>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- What the organisation has filled (only saved steps) -->
      @if (savedStepKeys().length > 0) {
        <div class="space-y-3 pt-1">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 m-0">Registration Details</h3>
          <app-otr-review
            [form]="f"
            [values]="values()"
            [documents]="documents()"
            [readOnly]="true"
            [stepKeys]="savedStepKeys()"
            (viewDocument)="viewDocument.emit($event)"
          />
        </div>
      }
    }
  `
})
export class ProfileOtrCardComponent {
  readonly form = input<OtrFormDef | null>(null);
  readonly records = input<OtrRecords>({});

  /** Opens the registration at this step number. */
  readonly openStep = output<number>();
  /** "View" on a document: its field key. */
  readonly viewDocument = output<string>();

  readonly submitted = computed(() => isSubmitted(this.records()));
  readonly reference = computed(() => referenceNumber(this.records()));
  readonly steps = computed(() => (this.form() ? profileSteps(this.form()!, this.records()) : []));
  readonly completion = computed(() => (this.submitted() ? 100 : profileCompletion(this.steps())));
  readonly nextStep = computed(() => this.steps().find(s => s.current)?.number ?? this.steps().at(-1)?.number ?? 1);
  readonly ctaText = computed(() => {
    if (this.submitted()) return 'View Registration';
    return this.steps().some(s => s.completed) ? 'Continue Registration' : 'Start Registration';
  });

  readonly savedStepKeys = computed(() => {
    const form = this.form();
    const records = this.records();
    return form ? formSteps(form).filter(s => hasSavedStep(s.key, records[s.key])).map(s => s.key) : [];
  });
  readonly values = computed<Record<string, OtrStepValues>>(() => {
    const form = this.form();
    const records = this.records();
    const all: Record<string, OtrStepValues> = {};
    if (form) for (const step of formSteps(form)) all[step.key] = initialStepValues(step, records[step.key]);
    return all;
  });
  readonly documents = computed(() => (this.form() ? documentsFrom(this.form()!, this.records()) : {}));
}
