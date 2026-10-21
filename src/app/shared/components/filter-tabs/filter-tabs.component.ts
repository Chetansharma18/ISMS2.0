import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

/** One tab of the bar. `count` is the small number shown next to the label. */
export interface FilterTab<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

/**
 * The one row of status / category filter buttons (All, Approved, Pending ...). The selected tab is
 * filled, the others are outlined, and an optional count sits next to the label.
 *
 *   <app-filter-tabs [options]="tabs()" [(value)]="activeFilter" />
 *   <app-filter-tabs [options]="roles" [value]="role()" (valueChange)="setRole($event)" stretch />
 *
 * `stretch` makes the tabs share the full width equally (used for a short list such as user roles).
 */
@Component({
  selector: 'app-filter-tabs',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center gap-1.5 flex-wrap', role: 'group', '[attr.aria-label]': 'ariaLabel() || null' },
  template: `
    @for (tab of options(); track tab.id) {
      <button
        appButton
        size="sm"
        type="button"
        [variant]="value() === tab.id ? 'primary' : 'outline'"
        [attr.aria-pressed]="value() === tab.id"
        [class.flex-1]="stretch()"
        (click)="value.set(tab.id)"
      >
        <span>{{ tab.label }}</span>
        @if (tab.count !== undefined) {
          <span
            class="px-1.5 rounded-full text-[10px] leading-4"
            [class.bg-white/20]="value() === tab.id"
            [class.text-white]="value() === tab.id"
            [class.bg-slate-100]="value() !== tab.id"
            [class.text-slate-600]="value() !== tab.id"
          >{{ tab.count }}</span>
        }
      </button>
    }
  `
})
export class FilterTabsComponent<T extends string = string> {
  readonly options = input.required<readonly FilterTab<T>[]>();
  readonly value = model.required<T>();
  /** Tabs share the whole row equally. */
  readonly stretch = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
}
