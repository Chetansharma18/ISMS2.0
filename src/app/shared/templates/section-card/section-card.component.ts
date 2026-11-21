import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A white bordered card with an optional title row. Use it for every grouped block of a page
 * (details, summaries, form sections) instead of writing the border and padding by hand.
 *
 *   <app-section-card title="Organisation" subtitle="As registered">
 *     <button actions appButton size="sm" variant="outline">Edit</button>
 *     ...content...
 *   </app-section-card>
 */
@Component({
  selector: 'app-section-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block bg-white border border-[#EADCE2] rounded-[10px] shadow-2xs overflow-hidden' },
  template: `
    @if (title()) {
      <div class="px-4 sm:px-5 py-3 border-b border-[#EADCE2] bg-[#F8E9EE] flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-[#D73389] m-0">{{ title() }}</h3>
          @if (subtitle()) {
            <p class="text-xs text-[#625663] m-0 mt-0.5">{{ subtitle() }}</p>
          }
        </div>
        <div class="flex items-center gap-2 shrink-0 empty:hidden">
          <ng-content select="[actions]" />
        </div>
      </div>
    }
    <div [class]="flush() ? '' : 'p-4 sm:p-5'">
      <ng-content />
    </div>
  `
})
export class SectionCardComponent {
  readonly title = input('');
  readonly subtitle = input('');
  /** Removes the body padding, for a table or list that should touch the card edges. */
  readonly flush = input(false);
}
