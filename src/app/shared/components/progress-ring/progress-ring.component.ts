import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A circular progress indicator with the percentage in the middle (profile completion, steps done).
 * Size it with classes on the element, for example `class="w-20 h-20 sm:w-24 sm:h-24"`.
 *
 *   <app-progress-ring [value]="completion()" [complete]="completion() === 100" class="w-24 h-24" />
 */
@Component({
  selector: 'app-progress-ring',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-flex shrink-0 items-center justify-center',
    role: 'progressbar',
    '[attr.aria-valuenow]': 'clamped()',
    'aria-valuemin': '0',
    'aria-valuemax': '100'
  },
  template: `
    <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" [attr.r]="radius" stroke="#E2E8F0" stroke-width="8" fill="none" />
      <circle
        cx="50"
        cy="50"
        [attr.r]="radius"
        [attr.stroke]="complete() ? '#15803D' : '#0B3558'"
        stroke-width="8"
        fill="none"
        stroke-linecap="round"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="dashOffset()"
        class="transition-all duration-700 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-lg sm:text-xl font-bold text-slate-800 leading-none">{{ clamped() }}%</span>
    </div>
  `
})
export class ProgressRingComponent {
  /** 0 to 100. */
  readonly value = input.required<number>();
  /** Draws the ring in the "done" colour. */
  readonly complete = input(false);

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;
  protected readonly clamped = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
  protected readonly dashOffset = computed(() => CIRCUMFERENCE * (1 - this.clamped() / 100));
}
