import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icon/icon.component';
import { ButtonComponent } from '../../button/button.component';

/** One choice of a select: the value it stores and the text it shows. */
export interface SelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="w-full flex flex-col relative">
      <!-- Label Row -->
      @if (label) {
        <div class="flex items-center justify-between mb-1 font-sans">
          <label [for]="id" class="text-xs sm:text-[12.5px] font-medium leading-[18px] text-[#1F2933] select-none">
            {{ label }}
            @if (required) {
              <span class="text-rose-600 font-bold ml-0.5">*</span>
            }
          </label>
        </div>
      }

      <!-- Select Button / Display Box -->
      <button
        [id]="id"
        type="button"
        (click)="toggleDropdown()"
        [disabled]="disabled"
        class="w-full h-[35px] flex items-center justify-between px-2.5 text-xs sm:text-[13px] leading-[20px] rounded-[4px] border transition-all duration-150 text-left bg-white font-sans cursor-pointer"
        [class.border-theme]="!error"
        [class.border-rose-600]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-600]="!!error"
        [class.bg-surface-muted]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.focus:border-primary]="!disabled && !error"
        [class.focus:ring-2]="!disabled && !error"
        [class.focus:ring-primary-light]="!disabled && !error"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
      >
        <span [class.text-muted]="!selectedLabel()" [class.text-primary]="!!selectedLabel()" class="truncate">
          {{ selectedLabel() || placeholder }}
        </span>

        <app-icon
          name="chevron-down"
          [stroke]="2"
          class="text-muted transition-transform duration-200 ml-2 shrink-0"
          [class.rotate-180]="isOpen()"
        />
      </button>

      <!-- Dropdown Popup Menu with Outside-Click Detector -->
      @if (isOpen()) {
        <div
          class="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-[4px] border border-theme shadow-[0_8px_24px_rgba(31,41,51,0.12)] overflow-hidden font-sans"
          role="listbox"
        >
          <!-- Search input for large lists -->
          @if (shouldShowSearch()) {
            <div class="p-2 border-b border-theme bg-surface-muted flex items-center gap-2">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search options..."
                class="w-full h-[32px] px-2.5 text-[13px] rounded-[4px] border border-theme focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-primary"
                (click)="$event.stopPropagation()"
              />
              @if (multiple) {
                <button
                  appButton
                  size="sm"
                  variant="outline"
                  type="button"
                  class="shrink-0 text-xs whitespace-nowrap"
                  (click)="toggleSelectAll($event)"
                >
                  {{ areAllFilteredSelected() ? 'Clear' : 'Select All' }}
                </button>
              }
            </div>
          }

          <!-- Options List -->
          <ul class="max-h-56 overflow-y-auto py-1 divide-y divide-border/40 text-[13px]">
            @for (opt of filteredEntries(); track opt.value) {
              <li
                (click)="toggleOption(opt, $event)"
                class="px-3 py-2 cursor-pointer transition-colors flex items-center justify-between gap-2.5"
                [class.bg-primary-light]="isOptionSelected(opt.value)"
                [class.text-brand]="isOptionSelected(opt.value)"
                [class.font-medium]="isOptionSelected(opt.value)"
                [class.hover:bg-surface-muted]="!isOptionSelected(opt.value) && !opt.disabled"
                [class.text-primary]="!isOptionSelected(opt.value)"
                [class.opacity-50]="opt.disabled"
                [class.cursor-not-allowed]="opt.disabled"
                role="option"
                [attr.aria-selected]="isOptionSelected(opt.value)"
                [attr.aria-disabled]="opt.disabled ? true : null"
              >
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  @if (multiple) {
                    <input
                      type="checkbox"
                      tabindex="-1"
                      aria-hidden="true"
                      class="w-4 h-4 rounded text-navy border-slate-300 accent-navy shrink-0 pointer-events-none"
                      [checked]="isOptionSelected(opt.value)"
                      [disabled]="opt.disabled"
                    />
                  }
                  <span class="truncate">{{ opt.label }}</span>
                </div>
                @if (!multiple && isOptionSelected(opt.value)) {
                  <app-icon name="check" [stroke]="2" class="text-brand shrink-0" />
                }
              </li>
            } @empty {
              <li class="px-3 py-3 text-center text-[12px] text-muted">
                No matching options found
              </li>
            }
          </ul>

          <!-- Footer for Multiple Selection -->
          @if (multiple) {
            <div class="p-2 border-t border-theme bg-surface-muted flex items-center justify-between text-xs font-sans">
              <span class="text-slate-600 font-medium">{{ selectedValues().length }} selected</span>
              <button
                appButton
                size="sm"
                type="button"
                (click)="isOpen.set(false)"
              >
                Done
              </button>
            </div>
          }
        </div>
      }

      <!-- Inline Error Message -->
      @if (error) {
        <div class="form-error-text text-rose-600 font-medium mt-0.5 flex items-center gap-1 leading-tight animate-fade-in" style="font-size: 11px !important; line-height: 14px !important;">
          <app-icon name="error" size="xs" [stroke]="2.5" />
          <span style="font-size: 11px !important; line-height: 14px !important;">{{ error }}</span>
        </div>
      }

      <!-- Helper Hint -->
      @if (!error && hint) {
        <div class="form-hint-text text-slate-400 mt-0.5 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
          {{ hint }}
        </div>
      }
    </div>
  `,
  styles: [`
    .form-error-text {
      font-size: 11px !important;
      line-height: 14px !important;
    }
    .form-hint-text {
      font-size: 11px !important;
      line-height: 14px !important;
    }
  `]
})
export class FormSelectComponent {
  private static nextId = 0;
  readonly id = `form-select-${++FormSelectComponent.nextId}`;

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() multiple: boolean = false;
  @Input() values: string[] = [];
  /** Plain options: the text is both what is shown and the value. */
  @Input() options: string[] = [];
  /** Options whose shown text differs from the value; used instead of `options` when given. */
  @Input() items?: SelectItem[];
  @Input() placeholder: string = 'Please select';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hint?: string;
  @Input() error?: string;

  @Output() valueChange = new EventEmitter<string>();
  @Output() valuesChange = new EventEmitter<string[]>();

  isOpen = signal<boolean>(false);
  searchQuery = '';

  constructor(private elementRef: ElementRef) { }

  /** Every option as value and shown text. */
  protected entries(): SelectItem[] {
    return this.items ?? (this.options || []).map(option => ({ value: option, label: option }));
  }

  shouldShowSearch(): boolean {
    return this.entries().length > 6;
  }

  /** Resolved selected values in multiple or single mode. */
  selectedValues(): string[] {
    if (this.values && this.values.length > 0) {
      return this.values;
    }
    if (this.value) {
      return this.value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  isOptionSelected(val: string): boolean {
    if (this.multiple) {
      return this.selectedValues().includes(val);
    }
    return this.value === val;
  }

  /** The shown text of the chosen option(s). */
  selectedLabel(): string {
    if (this.multiple) {
      const list = this.selectedValues();
      if (list.length === 0) return '';
      if (list.length <= 2) {
        return list.join(', ');
      }
      return `${list[0]}, ${list[1]} (+${list.length - 2} more)`;
    }
    if (!this.value) return '';
    return this.entries().find(entry => entry.value === this.value)?.label ?? this.value;
  }

  filteredEntries(): SelectItem[] {
    const list = this.entries();
    const q = this.searchQuery.trim().toLowerCase();
    return q ? list.filter(item => item.label.toLowerCase().includes(q)) : list;
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
      this.searchQuery = '';
    }
  }

  toggleOption(option: SelectItem, event?: MouseEvent): void {
    if (option.disabled) return;
    if (event) {
      event.stopPropagation();
    }

    if (!this.multiple) {
      this.value = option.value;
      this.valueChange.emit(option.value);
      this.isOpen.set(false);
      return;
    }

    const current = [...this.selectedValues()];
    const idx = current.indexOf(option.value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(option.value);
    }

    this.values = current;
    this.value = current.join(', ');
    this.valueChange.emit(this.value);
    this.valuesChange.emit(current);
  }

  areAllFilteredSelected(): boolean {
    const list = this.filteredEntries().filter(e => !e.disabled);
    if (list.length === 0) return false;
    const current = this.selectedValues();
    return list.every(e => current.includes(e.value));
  }

  toggleSelectAll(event: MouseEvent): void {
    event.stopPropagation();
    const list = this.filteredEntries().filter(e => !e.disabled).map(e => e.value);
    const current = this.selectedValues();
    const allSelected = list.length > 0 && list.every(v => current.includes(v));

    let updated: string[];
    if (allSelected) {
      updated = current.filter(v => !list.includes(v));
    } else {
      const set = new Set([...current, ...list]);
      updated = Array.from(set);
    }

    this.values = updated;
    this.value = updated.join(', ');
    this.valueChange.emit(this.value);
    this.valuesChange.emit(updated);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
