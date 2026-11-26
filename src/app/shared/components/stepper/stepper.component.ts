import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface StepperStep {
  label: string;
  description?: string;
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
  imports: [CommonModule, IconComponent],
  template: `
    @if (variant === 'vertical') {
      <nav class="w-full" [attr.aria-label]="ariaLabel">
        <ol class="list-none m-0 p-0 flex flex-col w-full">
          @for (step of steps; track step.label; let i = $index; let last = $last) {
            <li class="relative flex flex-col">
              <button
                type="button"
                (click)="stepClick.emit(i + 1)"
                class="flex items-start gap-3 w-full text-left py-2.5 px-2 rounded-lg transition-all cursor-pointer bg-transparent border-0 group focus:outline-none"
                [ngClass]="verticalItemBgClass(i + 1)"
                [attr.aria-current]="isCurrent(i + 1) ? 'step' : null"
              >
                <div class="flex flex-col items-center shrink-0">
                  <span
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs border-2"
                    [ngClass]="verticalCircleClass(i + 1)"
                  >
                    @if (isCompleted(i + 1) && !isCurrent(i + 1)) {
                      <app-icon name="check" size="xs" [stroke]="3" />
                    } @else {
                      {{ i + 1 }}
                    }
                  </span>
                  @if (!last) {
                    <span
                      class="w-0.5 h-6 my-1 transition-colors"
                      [ngClass]="isCompleted(i + 1) ? 'bg-navy' : 'bg-slate-200'"
                    ></span>
                  }
                </div>
                <div class="pt-0.5 min-w-0">
                  <span
                    class="text-xs sm:text-[13px] block transition-colors leading-tight"
                    [ngClass]="verticalLabelClass(i + 1)"
                  >
                    {{ step.label }}
                  </span>
                  @if (step.description) {
                    <span class="text-[11px] text-slate-400 block mt-0.5">{{ step.description }}</span>
                  }
                </div>
              </button>
            </li>
          }
        </ol>
      </nav>
    } @else if (variant === 'wizard') {
      <nav
        class="bg-white rounded-xl border border-[#EADCE2] shadow-2xs"
        [ngClass]="steps.length >= 5 ? 'px-3 sm:px-5 py-2.5 sm:py-3' : 'px-5 sm:px-8 py-3 sm:py-3.5'"
        [attr.aria-label]="ariaLabel"
      >
        <ol
          class="list-none m-0 p-0 flex items-center justify-between w-full gap-1"
          [ngClass]="steps.length > 2 && steps.length < 5 && !hideLabelsOnMobile ? 'min-w-135 sm:min-w-0' : ''"
        >
          @for (step of steps; track step.label; let i = $index; let last = $last) {
            <li class="contents">
              <button
                type="button"
                (click)="stepClick.emit(i + 1)"
                class="flex items-center transition-all cursor-pointer bg-transparent border-0 p-0 text-left min-w-0"
                [ngClass]="steps.length >= 5 ? 'gap-1.5' : 'gap-2 sm:gap-2.5 shrink-0'"
                [attr.aria-current]="isCurrent(i + 1) ? 'step' : null"
              >
                <span
                  class="rounded-full flex items-center justify-center font-bold shrink-0 transition-colors shadow-2xs border-2"
                  [ngClass]="[
                    wizardCircleClass(i + 1),
                    steps.length >= 5 ? 'w-6 h-6 sm:w-7 sm:h-7 text-[11px] sm:text-xs' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'
                  ]"
                  aria-hidden="true"
                >
                  @if (isCompleted(i + 1) && !isCurrent(i + 1)) {
                    <app-icon name="check" [stroke]="3" class="text-white" />
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span class="sr-only">Step {{ i + 1 }}: {{ step.label }}{{ isCompleted(i + 1) ? ' (completed)' : '' }}</span>
                <span
                  class="tracking-tight leading-tight"
                  [ngClass]="[
                    wizardLabelClass(i + 1),
                    hideLabelsOnMobile ? 'hidden md:block' : 'block',
                    steps.length >= 5 ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-[13.5px] whitespace-nowrap'
                  ]"
                  aria-hidden="true"
                >{{ step.label }}</span>
              </button>

              @if (!last) {
                <span
                  class="flex-1 h-[2px] rounded-full transition-colors duration-200"
                  [ngClass]="[
                    isCompleted(i + 1) ? 'bg-navy' : 'bg-slate-200',
                    steps.length >= 5 ? 'min-w-[8px] mx-1 sm:mx-2' : 'mx-3 sm:mx-6'
                  ]"
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
                    <app-icon name="check" size="sm" [stroke]="2.5" />
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
  @Input() variant: 'line' | 'tabs' | 'wizard' | 'vertical' = 'line';
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

  verticalItemBgClass(step: number): string {
    if (this.isCurrent(step)) return 'bg-slate-100/70';
    return 'hover:bg-slate-50';
  }

  verticalCircleClass(step: number): string {
    if (this.isCurrent(step)) {
      return 'bg-white text-navy border-navy ring-4 ring-navy/10';
    }
    if (this.isCompleted(step)) {
      return 'bg-navy text-white border-navy';
    }
    return 'bg-white text-slate-400 border-slate-300 group-hover:border-slate-400 group-hover:text-slate-600';
  }

  verticalLabelClass(step: number): string {
    if (this.isCurrent(step)) {
      return 'font-bold text-navy';
    }
    if (this.isCompleted(step)) {
      return 'font-semibold text-slate-800 group-hover:text-navy';
    }
    return 'font-medium text-slate-600 group-hover:text-slate-900';
  }
}
