import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** One bar: what it is called, its value, and an optional colour. */
export interface BarChartItem {
  label: string;
  value: number;
  /** Shown when the pointer is over the bar (defaults to the label and value). */
  hint?: string;
  /** Bars are navy; `warn` is amber and `bad` is red, for values that need a look. */
  tone?: 'default' | 'warn' | 'bad';
}

const TONE_CLASS: Record<NonNullable<BarChartItem['tone']>, string> = {
  default: 'bg-navy',
  warn: 'bg-amber-500',
  bad: 'bg-red-500'
};

/**
 * A simple bar chart for the dashboards. `vertical` draws columns left to right (a trend over time); `horizontal` draws
 * one row per item (a comparison). Values are drawn against `max` (100 for percentages).
 *
 *   <app-bar-chart [items]="[{ label: 'Mon', value: 92 }, { label: 'Tue', value: 71, tone: 'warn' }]" unit="%" />
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (items().length === 0) {
      <p class="text-xs text-slate-500 m-0 py-6 text-center">{{ emptyMessage() }}</p>
    } @else if (orientation() === 'vertical') {
      <div role="img" [attr.aria-label]="summary()" class="flex items-end gap-1.5 overflow-x-auto pb-1" [style.height.px]="height()">
        @for (bar of bars(); track bar.label + $index) {
          <div class="flex-1 min-w-[22px] h-full flex flex-col items-center justify-end gap-1" [title]="bar.hint">
            <span class="text-[10px] tabular-nums text-slate-600">{{ bar.text }}</span>
            <div class="w-full rounded-t-[3px]" [class]="bar.toneClass" [style.height.%]="bar.percent" style="min-height: 2px"></div>
            <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ bar.label }}</span>
          </div>
        }
      </div>
    } @else {
      <div role="img" [attr.aria-label]="summary()" class="space-y-2">
        @for (bar of bars(); track bar.label + $index) {
          <div class="grid grid-cols-[minmax(110px,170px)_1fr_auto] items-center gap-3 text-xs" [title]="bar.hint">
            <span class="text-slate-700 truncate">{{ bar.label }}</span>
            <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full rounded-full" [class]="bar.toneClass" [style.width.%]="bar.percent"></div>
            </div>
            <span class="tabular-nums text-slate-700 w-14 text-right">{{ bar.text }}</span>
          </div>
        }
      </div>
    }
  `
})
export class BarChartComponent {
  readonly items = input.required<BarChartItem[]>();
  readonly max = input<number>(100);
  readonly unit = input<string>('');
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Height of a vertical chart in pixels. */
  readonly height = input<number>(180);
  readonly emptyMessage = input<string>('Nothing to show yet.');

  protected readonly bars = computed(() =>
    this.items().map(item => ({
      label: item.label,
      text: `${item.value}${this.unit()}`,
      percent: Math.max(0, Math.min(100, this.max() > 0 ? (item.value / this.max()) * 100 : 0)),
      toneClass: TONE_CLASS[item.tone ?? 'default'],
      hint: item.hint ?? `${item.label}: ${item.value}${this.unit()}`
    }))
  );

  protected readonly summary = computed(() => this.items().map(item => `${item.label} ${item.value}${this.unit()}`).join(', '));
}
