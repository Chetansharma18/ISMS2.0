import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
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
import { OverlayService, ConnectedOverlayRef } from '../../services/overlay.service';

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
    '[class.z-50]': 'isOpen()',
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
        #dropdownPanel
        class="bg-white border border-theme rounded-[6px] overflow-hidden flex flex-col"
        [class.mt-1]="!overlay() || resolvedDirection() === 'down'"
        [class.mb-1]="!overlay() && resolvedDirection() === 'up'"
        [class.shadow-xs]="!overlay()"
        [class.shadow-[0_12px_32px_rgba(31,41,51,0.16)]]="overlay()"
        (keydown)="onPanelKeydown($event)"
      >
        @if (searchable()) {
          <div class="p-2 border-b border-theme bg-surface-muted shrink-0">
            <input
              #search
              appInput
              size="sm"
              type="text"
              class="w-full h-[32px] px-2.5 text-[13px] rounded-[4px] border border-theme focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-primary"
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
          class="m-0 py-1 list-none flex-1 min-h-0 max-h-56 overflow-y-auto divide-y divide-border/40 text-[13px]"
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
              class="flex items-center justify-between gap-2.5 px-3 py-2 leading-snug select-none transition-colors"
              [class.cursor-pointer]="!row.disabled"
              [class.cursor-not-allowed]="row.disabled"
              [class.opacity-50]="row.disabled"
              [class.hover:bg-surface-muted]="!row.disabled && !isRowSelected(row)"
              [class.bg-[#FAF5F7]]="isRowSelected(row)"
              [class.text-[#7C0E44]]="isRowSelected(row)"
              [class.font-semibold]="isRowSelected(row) || row.kind === 'all'"
              [class.bg-surface-muted]="$index === activeIndex() && !isRowSelected(row)"
              [class.text-navy]="row.kind === 'other'"
              [class.text-slate-800]="row.kind !== 'other' && !isRowSelected(row)"
              [class.border-t]="row.kind === 'other'"
              [class.border-slate-100]="row.kind === 'other'"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
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
                <span class="truncate">{{ rowLabel(row) }}</span>
                @if (row.kind === 'all') {
                  <span class="text-[11px] text-slate-500 font-normal shrink-0">({{ selectedEnabledCount() }}/{{ enabledItems().length }})</span>
                }
              </div>
              @if (!multiple() && isRowSelected(row)) {
                <span class="text-primary font-bold text-xs shrink-0">✓</span>
              }
            </li>
          }
          @if (visibleItems().length === 0) {
            <li role="presentation" class="px-3 py-3 text-center text-slate-400">{{ emptyText() }}</li>
          }
        </ul>

        @if (multiple() && footer()) {
          <div class="px-3 py-2 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-2 text-xs shrink-0">
            <span class="text-slate-600 font-medium">{{ values().length }} selected</span>
            <button appButton variant="primary" size="sm" type="button" (mousedown)="$event.preventDefault()" (click)="close(true)">Done</button>
          </div>
        }
      </div>
    }
  `
})
export class DropdownComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly overlayService = inject(OverlayService);
  private overlayRef: ConnectedOverlayRef | null = null;

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('search');
  private readonly dropdownPanel = viewChild<ElementRef<HTMLElement>>('dropdownPanel');

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
  /** Float the list over the content below instead of pushing it down. Defaults to true. */
  readonly overlay = input<boolean, unknown>(true, {
    transform: (v: unknown) => (v === undefined || v === '' ? true : booleanAttribute(v))
  });
  /** Multi mode: footer with the selected count and a Done button. Defaults to true. */
  readonly footer = input<boolean, unknown>(true, {
    transform: (v: unknown) => (v === undefined || v === '' ? true : booleanAttribute(v))
  });
  /** Opening direction: 'down' (default), 'up' (drop-up), or 'auto' (detects available space in viewport). */
  readonly direction = input<'down' | 'up' | 'auto'>('auto');
  /** `id` of the trigger, so a <label for="..."> points at it. */
  readonly inputId = input('');
  readonly ariaLabel = input('');

  protected readonly resolvedDirection = computed(() => {
    const d = this.direction();
    this.isOpen();
    if (d !== 'auto') return d;
    if (typeof window === 'undefined') return 'down';
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < 300 && spaceAbove > spaceBelow ? 'up' : 'down';
  });

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
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.close();
    }
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  ngOnDestroy(): void {
    const ref = this.overlayRef;
    this.overlayRef = null;
    if (ref) {
      ref.close();
    }
  }

  private openPanel(): void {
    if (this.disabled()) return;
    this.query.set('');
    this.isOpen.set(true);
    const selected = this.rows().findIndex(row => row.kind === 'option' && !row.disabled && this.isRowSelected(row));
    this.activeIndex.set(selected);
    afterNextRender(
      () => {
        if (this.overlay() && this.dropdownPanel() && this.trigger()) {
          this.overlayRef = this.overlayService.attachConnectedOverlay(
            this.trigger().nativeElement,
            this.dropdownPanel()!.nativeElement,
            { preferredMaxHeight: 360, gap: 4 },
            () => this.close()
          );
        }
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

  /**
   * Keys typed inside the list (for example in the search box). Once the list is portaled to
   * document.body (overlay mode) these no longer bubble to the host, so handle them here.
   */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (this.overlayRef) this.onKeydown(event);
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
    if (!this.isOpen()) return;
    const path = event.composedPath();
    const inHost = path.includes(this.host.nativeElement);
    const inPanel = this.dropdownPanel() ? path.includes(this.dropdownPanel()!.nativeElement) : false;
    if (!inHost && !inPanel) {
      this.close();
    }
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
    // The list may be portaled to document.body (overlay mode), so look inside the panel first.
    const root: HTMLElement = this.dropdownPanel()?.nativeElement ?? this.host.nativeElement;
    const list = root.querySelector(`ul#${this.listId}`) as HTMLElement | null;
    const row = root.querySelector(`[id="${this.rowId(index)}"]`) as HTMLElement | null;
    if (!list || !row) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    if (rowRect.top < listRect.top) {
      list.scrollTop -= (listRect.top - rowRect.top);
    } else if (rowRect.bottom > listRect.bottom) {
      list.scrollTop += (rowRect.bottom - listRect.bottom);
    }
  }
}
