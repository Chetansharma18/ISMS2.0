import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { InputDirective } from '../form-controls/input/input.directive';
import { IconComponent } from '../icon/icon.component';

/** One entry of the list. A plain string is used as both the value and the label. */
export interface DropdownItem {
  value: string;
  label: string;
  disabled?: boolean;
}
export type DropdownOption = string | DropdownItem;
export type DropdownSize = 'md' | 'sm';

type DropdownRow =
  | { kind: 'all'; disabled: boolean }
  | { kind: 'other'; disabled: false }
  | { kind: 'option'; disabled: boolean; item: DropdownItem };

let nextDropdownId = 0;

/**
 * The one dropdown of the portal: single select, multi select with checkboxes, optional search box,
 * an optional "Other" row and an optional "Select all" row.
 *
 *   <app-dropdown [options]="['A', 'B']" [(value)]="choice" placeholder="Select" />
 *   <app-dropdown multiple [options]="items" [(values)]="chosen" [searchable]="true" />
 *   <app-dropdown [options]="presets" [value]="v" otherLabel="Other (type your own)"
 *                 [otherSelected]="isOther" (other)="isOther = true" (valueChange)="v = $event" />
 *
 * - Options are `string[]` or `{ value, label, disabled? }[]`.
 * - Single mode uses `value`; multi mode (`multiple`) uses `values`. Both are two-way `model`s.
 * - Multi mode also emits `optionToggled` (the option that was clicked) and `selectAllToggled`, so a
 *   screen with its own selection rules (for example an "ALL" option) can apply them itself and
 *   feed the result back through `values`.
 * - The list opens in the page flow under the trigger, at the width of the field, so a dialog
 *   never clips it (set `overlay` to float it over the content below instead).
 * - Look: same height, border and focus ring as `appInput` fields (`.form-control` in styles.css).
 * - Keyboard: ArrowDown/ArrowUp open and move, Enter or Space picks, Escape closes.
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [ButtonComponent, IconComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block relative',
    '(keydown)': 'onKeydown($event)',
    '(keyup)': 'onKeyup($event)',
    '(document:click)': 'onOutside($event)',
    '(document:focusin)': 'onOutside($event)'
  },
  template: `
    <div class="relative">
      <button
        #trigger
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        [attr.id]="inputId() || null"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? listId : null"
        [attr.aria-activedescendant]="isOpen() && activeIndex() >= 0 ? rowId(activeIndex()) : null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [disabled]="disabled()"
        (click)="toggle()"
        class="form-control flex items-center justify-between gap-2 text-left cursor-pointer"
        [class.form-control-sm]="size() === 'sm'"
        [class.is-invalid]="invalid()"
        [class.pr-14]="showClear()"
      >
        <span class="flex-1 min-w-0 truncate" [class.text-slate-400]="!hasValue()">{{ triggerLabel() }}</span>
        <app-icon
          name="chevron-down"
          [stroke]="2"
          class="text-slate-400 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
        />
      </button>

      @if (showClear()) {
        <button
          appButton
          variant="ghost"
          size="xs"
          iconOnly
          type="button"
          class="absolute right-8 top-1/2 -translate-y-1/2"
          aria-label="Clear selection"
          title="Clear"
          (click)="clear()"
        >
          <app-icon name="close" size="xs" [stroke]="2" />
        </button>
      }
    </div>

    @if (isOpen()) {
      <div
        class="mt-1 bg-white border border-slate-300 rounded-lg overflow-hidden"
        [class.shadow-xs]="!overlay()"
        [class.absolute]="overlay()"
        [class.left-0]="overlay()"
        [class.right-0]="overlay()"
        [class.top-full]="overlay()"
        [class.z-50]="overlay()"
        [class.shadow-xl]="overlay()"
      >
        @if (searchable()) {
          <div class="p-2 border-b border-slate-100 bg-slate-50/80">
            <input
              #search
              appInput
              size="sm"
              type="text"
              class="w-full"
              autocomplete="off"
              [value]="query()"
              [placeholder]="searchPlaceholder()"
              [attr.aria-label]="searchPlaceholder()"
              [attr.aria-controls]="listId"
              [attr.aria-activedescendant]="activeIndex() >= 0 ? rowId(activeIndex()) : null"
              (input)="onQuery($event)"
            />
          </div>
        }

        <ul
          [id]="listId"
          role="listbox"
          class="m-0 p-1 list-none max-h-56 overflow-y-auto text-xs"
          [attr.aria-multiselectable]="multiple() ? 'true' : null"
          [attr.aria-label]="ariaLabel() || null"
        >
          @for (row of rows(); track $index) {
            <li
              role="option"
              [id]="rowId($index)"
              [attr.aria-selected]="isRowSelected(row)"
              [attr.aria-disabled]="row.disabled ? 'true' : null"
              (mousedown)="$event.preventDefault()"
              (click)="activate($index)"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded leading-snug select-none"
              [class.cursor-pointer]="!row.disabled"
              [class.cursor-not-allowed]="row.disabled"
              [class.opacity-50]="row.disabled"
              [class.hover:bg-slate-50]="!row.disabled"
              [class.bg-slate-100]="$index === activeIndex()"
              [class.bg-slate-50]="row.kind === 'all' && $index !== activeIndex()"
              [class.font-semibold]="row.kind === 'all' || (!multiple() && isRowSelected(row))"
              [class.text-navy]="row.kind === 'other'"
              [class.text-slate-800]="row.kind !== 'other'"
              [class.border-t]="row.kind === 'other'"
              [class.border-slate-100]="row.kind === 'other'"
            >
              @if (multiple()) {
                <input
                  type="checkbox"
                  tabindex="-1"
                  aria-hidden="true"
                  class="w-4 h-4 rounded text-primary border-slate-300 accent-primary shrink-0 pointer-events-none"
                  [checked]="isRowSelected(row)"
                  [disabled]="row.disabled"
                />
              }
              <span class="flex-1 min-w-0">{{ rowLabel(row) }}</span>
              @if (row.kind === 'all') {
                <span class="text-[11px] text-slate-500 font-normal shrink-0">({{ selectedEnabledCount() }}/{{ enabledItems().length }})</span>
              }
              @if (!multiple() && isRowSelected(row)) {
                <app-icon name="check" size="sm" [stroke]="2.5" class="text-navy" />
              }
            </li>
          }
          @if (visibleItems().length === 0) {
            <li role="presentation" class="px-3 py-3 text-center text-slate-400">{{ emptyText() }}</li>
          }
        </ul>

        @if (multiple() && footer()) {
          <div class="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">{{ values().length }} selected</span>
            <button appButton size="sm" type="button" (mousedown)="$event.preventDefault()" (click)="close(true)">Done</button>
          </div>
        }
      </div>
    }
  `
})
export class DropdownComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('search');

  /** `string[]` or `{ value, label, disabled? }[]`. */
  readonly options = input<readonly DropdownOption[]>([]);
  /** Several options can be ticked; use `values` instead of `value`. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Selected option (single mode). Empty when nothing is selected. */
  readonly value = model('');
  /** Selected options (multi mode), in the order they were ticked. */
  readonly values = model<string[]>([]);

  readonly placeholder = input('Select');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows the error border. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly size = input<DropdownSize>('md');
  /** Adds a filter box at the top of the list. */
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input('Search...');
  /** Text of the empty list, for example when the filter matches nothing. */
  readonly emptyText = input('No matching options');
  /** Shows a small button that empties the selection. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Last row that lets the user type their own entry. Empty hides the row. */
  readonly otherLabel = input('');
  /** Whether the "Other" row counts as chosen (shown on the trigger in single mode, ticked in multi mode). */
  readonly otherSelected = input(false, { transform: booleanAttribute });
  /** First row of a multi-select that ticks or unticks every enabled option. Empty hides the row. */
  readonly selectAllLabel = input('');
  /** Replaces the text on the trigger of a multi-select while something is selected. */
  readonly summary = input('');
  /** Multi mode shows the joined labels up to this many options, then "n selected". 0 always shows the count. */
  readonly maxLabels = input(2);
  /** Float the list over the content below instead of pushing it down. */
  readonly overlay = input(false, { transform: booleanAttribute });
  /** Multi mode: footer with the selected count and a Done button. */
  readonly footer = input(false, { transform: booleanAttribute });
  /** `id` of the trigger, so a <label for="..."> points at it. */
  readonly inputId = input('');
  readonly ariaLabel = input('');

  /** The "Other" row was clicked. */
  readonly other = output<void>();
  /** Multi mode: the option that was just ticked or unticked. */
  readonly optionToggled = output<string>();
  /** Multi mode: the "Select all" row was clicked. */
  readonly selectAllToggled = output<void>();

  protected readonly isOpen = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);
  protected readonly listId = `app-dropdown-${nextDropdownId++}`;

  private spaceHandled = false;

  private readonly items = computed<DropdownItem[]>(() =>
    this.options().map(option => (typeof option === 'string' ? { value: option, label: option } : option))
  );
  protected readonly enabledItems = computed(() => this.items().filter(item => !item.disabled));
  protected readonly visibleItems = computed(() => {
    const q = this.searchable() ? this.query().trim().toLowerCase() : '';
    return q ? this.items().filter(item => item.label.toLowerCase().includes(q)) : this.items();
  });

  private readonly selectedSet = computed(() => new Set(this.values()));
  protected readonly selectedEnabledCount = computed(
    () => this.enabledItems().filter(item => this.selectedSet().has(item.value)).length
  );
  private readonly allSelected = computed(
    () => this.enabledItems().length > 0 && this.selectedEnabledCount() === this.enabledItems().length
  );

  protected readonly rows = computed<DropdownRow[]>(() => {
    const rows: DropdownRow[] = [];
    if (this.multiple() && this.selectAllLabel()) {
      rows.push({ kind: 'all', disabled: this.enabledItems().length === 0 });
    }
    for (const item of this.visibleItems()) {
      rows.push({ kind: 'option', disabled: !!item.disabled, item });
    }
    if (this.otherLabel()) rows.push({ kind: 'other', disabled: false });
    return rows;
  });

  protected readonly hasValue = computed(() => {
    if (this.multiple()) return this.values().length > 0;
    return !!this.value() || (this.otherSelected() && !!this.otherLabel());
  });

  protected readonly triggerLabel = computed(() => {
    if (this.multiple()) {
      const chosen = this.values();
      if (chosen.length === 0) return this.placeholder();
      if (this.summary()) return this.summary();
      if (chosen.length <= this.maxLabels()) return chosen.map(v => this.labelOf(v)).join(', ');
      return `${chosen.length} selected`;
    }
    const current = this.value();
    if (current) return this.labelOf(current);
    if (this.otherSelected() && this.otherLabel()) return this.otherLabel();
    return this.placeholder();
  });

  protected readonly showClear = computed(() => this.clearable() && !this.disabled() && this.hasValue());

  protected rowId(index: number): string {
    return `${this.listId}-row-${index}`;
  }

  protected rowLabel(row: DropdownRow): string {
    if (row.kind === 'all') return this.selectAllLabel();
    if (row.kind === 'other') return this.otherLabel();
    return row.item.label;
  }

  protected isRowSelected(row: DropdownRow): boolean {
    if (row.kind === 'all') return this.allSelected();
    if (row.kind === 'other') return this.otherSelected();
    return this.multiple() ? this.selectedSet().has(row.item.value) : this.value() === row.item.value;
  }

  protected toggle(): void {
    if (this.isOpen()) this.close();
    else this.openPanel();
  }

  protected close(restoreFocus = false): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  private openPanel(): void {
    if (this.disabled()) return;
    this.query.set('');
    this.isOpen.set(true);
    const selected = this.rows().findIndex(row => row.kind === 'option' && !row.disabled && this.isRowSelected(row));
    this.activeIndex.set(selected);
    afterNextRender(
      () => {
        this.searchBox()?.nativeElement.focus();
        this.scrollActiveIntoView();
      },
      { injector: this.injector }
    );
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
  }

  protected clear(): void {
    if (this.multiple()) this.values.set([]);
    else this.value.set('');
    this.trigger().nativeElement.focus();
  }

  protected activate(index: number): void {
    const row = this.rows()[index];
    if (!row || row.disabled) return;
    this.activeIndex.set(index);
    if (row.kind === 'all') {
      this.toggleAll();
    } else if (row.kind === 'other') {
      this.other.emit();
      if (!this.multiple()) this.close(true);
    } else if (this.multiple()) {
      this.toggleOption(row.item.value);
    } else {
      this.value.set(row.item.value);
      this.close(true);
    }
  }

  private toggleOption(optionValue: string): void {
    const chosen = this.values();
    this.values.set(chosen.includes(optionValue) ? chosen.filter(v => v !== optionValue) : [...chosen, optionValue]);
    this.optionToggled.emit(optionValue);
  }

  private toggleAll(): void {
    const enabled = this.enabledItems().map(item => item.value);
    const chosen = this.values();
    if (this.allSelected()) {
      this.values.set(chosen.filter(v => !enabled.includes(v)));
    } else {
      this.values.set([...chosen, ...enabled.filter(v => !chosen.includes(v))]);
    }
    this.selectAllToggled.emit();
  }

  private labelOf(optionValue: string): string {
    return this.items().find(item => item.value === optionValue)?.label ?? optionValue;
  }

  /** Host listener: keyboard navigation. */
  onKeydown(event: KeyboardEvent): void {
    const onTrigger = event.target === this.trigger().nativeElement;
    if (!this.isOpen()) {
      if (onTrigger && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        this.openPanel();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation(); // do not let an Escape that closes the list also close the dialog around it
        this.close(true);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Home':
      case 'End':
        if (onTrigger) {
          event.preventDefault();
          this.activeIndex.set(-1);
          this.move(event.key === 'Home' ? 1 : -1);
        }
        break;
      case 'Enter':
        if (this.activeIndex() >= 0) {
          event.preventDefault();
          this.activate(this.activeIndex());
        } else if (!onTrigger) {
          event.preventDefault(); // Enter in the filter box must not submit a surrounding form
        }
        break;
      case ' ':
        if (onTrigger && this.activeIndex() >= 0) {
          event.preventDefault();
          this.spaceHandled = true;
          this.activate(this.activeIndex());
        }
        break;
    }
  }

  /** Host listener. */
  onKeyup(event: KeyboardEvent): void {
    // A button clicks itself on Space keyup; the press was already used to pick the active option.
    if (event.key === ' ' && this.spaceHandled) {
      event.preventDefault();
      this.spaceHandled = false;
    }
  }

  /** Host listener: a click or focus outside the dropdown closes the list. */
  onOutside(event: Event): void {
    if (this.isOpen() && !event.composedPath().includes(this.host.nativeElement)) this.close();
  }

  private move(delta: 1 | -1): void {
    const rows = this.rows();
    const count = rows.length;
    if (count === 0) return;
    let index = this.activeIndex();
    if (index < 0 && delta < 0) index = 0;
    for (let step = 0; step < count; step++) {
      index = (index + delta + count) % count;
      if (!rows[index].disabled) {
        this.activeIndex.set(index);
        this.scrollActiveIntoView();
        return;
      }
    }
  }

  private scrollActiveIntoView(): void {
    const index = this.activeIndex();
    if (index < 0) return;
    const row = this.host.nativeElement.querySelector(`[id="${this.rowId(index)}"]`);
    row?.scrollIntoView?.({ block: 'nearest' });
  }
}
