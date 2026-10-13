import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepperStep {
  label: string;
}

/**
 * Numbered wizard progress indicator shared by multi-step forms.
 *
 * - `variant="line"`: steps in a row joined by connector lines (compact, 2-3 steps)
 * - `variant="tabs"`: responsive grid of step tabs (4+ steps)
 * - `variant="wizard"`: the Organization Registration Form look: a white card with navy
 *   numbered circles, plain step labels and navy connector lines for finished steps
 *
 * Step numbers are 1-based. A step is shown as completed when it is before the
 * current step, or when it is listed in `completedSteps` (e.g. payment done).
 */
@Component({
  selector: 'app-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (variant === 'wizard') {
      <nav
        class="bg-white rounded-xl border border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 sm:py-4 overflow-x-auto no-scrollbar"
        [attr.aria-label]="ariaLabel"
      >
        <ol
          class="list-none m-0 p-0 flex items-center justify-between w-full"
          [ngClass]="hideLabelsOnMobile ? '' : 'min-w-135 sm:min-w-0'"
        >
          @for (step of steps; track step.label; let i = $index; let last = $last) {
            <li class="contents">
              <button
                type="button"
                (click)="stepClick.emit(i + 1)"
                class="flex items-center gap-2 sm:gap-2.5 transition-all cursor-pointer bg-transparent border-0 p-0 text-left shrink-0"
                [attr.aria-current]="isCurrent(i + 1) ? 'step' : null"
              >
                <span
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors shadow-2xs border-2"
                  [ngClass]="wizardCircleClass(i + 1)"
                  aria-hidden="true"
                >
                  @if (isCompleted(i + 1) && !isCurrent(i + 1)) {
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span class="sr-only">Step {{ i + 1 }}: {{ step.label }}{{ isCompleted(i + 1) ? ' (completed)' : '' }}</span>
                <span
                  class="text-xs sm:text-[13.5px] tracking-tight whitespace-nowrap"
                  [ngClass]="[wizardLabelClass(i + 1), hideLabelsOnMobile ? 'hidden md:block' : 'block']"
                  aria-hidden="true"
                >{{ step.label }}</span>
              </button>

              @if (!last) {
                <span
                  class="flex-1 h-0.5 mx-2.5 sm:mx-6 transition-colors duration-200"
                  [ngClass]="isCompleted(i + 1) ? 'bg-navy' : 'bg-slate-200'"
                  aria-hidden="true"
                ></span>
              }
            </li>
          }
        </ol>
      </nav>
    } @else {
      <nav
        [ngClass]="bare ? '' : 'bg-slate-50/80 border border-slate-200 rounded-xl p-3 sm:px-6 shadow-2xs'"
        [attr.aria-label]="ariaLabel"
      >
        <ol
          class="list-none m-0 p-0 mx-auto"
          [ngClass]="variant === 'tabs'
            ? 'grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl'
            : 'flex items-center justify-between overflow-x-auto no-scrollbar py-0.5 ' + (bare ? 'w-full' : 'max-w-2xl')"
        >
          @for (step of steps; track step.label; let i = $index; let last = $last) {
            <li class="contents">
              <button
                type="button"
                (click)="stepClick.emit(i + 1)"
                class="flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer text-left min-w-0 shrink-0"
                [ngClass]="variant === 'tabs' ? 'p-1.5 rounded-lg' : ''"
                [class.bg-white]="variant === 'tabs' && isCurrent(i + 1)"
                [class.shadow-2xs]="variant === 'tabs' && isCurrent(i + 1)"
                [attr.aria-current]="isCurrent(i + 1) ? 'step' : null"
              >
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all"
                  [ngClass]="circleClass(i + 1)"
                  aria-hidden="true"
                >
                  @if (isCompleted(i + 1)) {
                    <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <!-- Accessible name: always announced, even when the visual label is hidden on mobile -->
                <span class="sr-only">Step {{ i + 1 }}: {{ step.label }}{{ isCompleted(i + 1) ? ' (completed)' : '' }}</span>
                <span
                  class="leading-tight font-bold text-slate-900 truncate"
                  [ngClass]="hideLabelsOnMobile ? 'hidden md:block' : 'block'"
                  aria-hidden="true"
                >{{ i + 1 }}. {{ step.label }}</span>
              </button>

              @if (variant === 'line' && !last) {
                <span
                  class="flex-1 min-w-3 mx-2 sm:mx-4 h-0.5 rounded-full transition-all"
                  [ngClass]="isCompleted(i + 1) ? 'bg-emerald-600' : 'bg-slate-200'"
                  aria-hidden="true"
                ></span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `
})
export class StepperComponent {
  @Input({ required: true }) steps: StepperStep[] = [];
  /** 1-based index of the active step */
  @Input({ required: true }) currentStep = 1;
  /** Extra steps to mark as completed regardless of position */
  @Input() completedSteps: number[] = [];
  @Input() variant: 'line' | 'tabs' | 'wizard' = 'line';
  /** Drop the card background/border, e.g. when hosted inside a sticky page header */
  @Input() bare = false;
  /** Show only numbered circles below the md breakpoint (useful for 5+ steps) */
  @Input() hideLabelsOnMobile = false;
  @Input() ariaLabel = 'Form progress';

  @Output() stepClick = new EventEmitter<number>();

  /** The step the user is on (drives aria-current and the active tab style). */
  isCurrent(step: number): boolean {
    return step === this.currentStep;
  }

  isCompleted(step: number): boolean {
    return step < this.currentStep || this.completedSteps.includes(step);
  }

  circleClass(step: number): string {
    if (this.isCompleted(step)) return 'bg-emerald-600 text-white';
    if (step === this.currentStep) return 'bg-primary text-white';
    return 'bg-slate-200 text-slate-600';
  }

  /** `wizard` variant: navy when active or finished, white with a grey ring when still to do. */
  wizardCircleClass(step: number): string {
    return this.isCurrent(step) || this.isCompleted(step)
      ? 'bg-navy text-white border-navy'
      : 'bg-white text-slate-500 border-slate-300';
  }

  wizardLabelClass(step: number): string {
    if (this.isCurrent(step)) return 'font-extrabold text-navy';
    if (this.isCompleted(step)) return 'font-semibold text-slate-800';
    return 'font-semibold text-slate-600';
  }
}
