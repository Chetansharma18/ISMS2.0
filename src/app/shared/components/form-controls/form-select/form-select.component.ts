import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex flex-col relative">
      <!-- Label Row -->
      <div class="flex items-center justify-between mb-1">
        <label [for]="id" class="text-xs sm:text-[13px] font-semibold text-slate-700 select-none">
          {{ label }}
          @if (required) {
            <span class="text-rose-500 font-bold ml-0.5">*</span>
          }
        </label>
      </div>

      <!-- Select Button / Display Box -->
      <button
        [id]="id"
        type="button"
        (click)="toggleDropdown()"
        [disabled]="disabled"
        class="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-[13px] rounded-md border transition-all duration-150 text-left bg-white shadow-2xs"
        [class.border-slate-300]="!error && !disabled"
        [class.border-rose-500]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-500]="!!error"
        [class.bg-slate-50]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.hover:border-slate-400]="!disabled && !error"
        [class.focus:border-[#0B3558]]="!disabled && !error"
        [class.focus:ring-1]="!disabled && !error"
        [class.focus:ring-[#0B3558]]="!disabled && !error"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
      >
        <span [class.text-slate-400]="!value" [class.text-slate-800]="!!value" class="truncate">
          {{ value || placeholder }}
        </span>

        <svg
          class="w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2"
          [class.rotate-180]="isOpen()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Popup Menu with Outside-Click Detector -->
      @if (isOpen()) {
        <div
          class="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden animate-fade-in"
          role="listbox"
        >
          <!-- Search input for large lists -->
          @if (shouldShowSearch()) {
            <div class="p-2 border-b border-slate-100 bg-slate-50/70">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search options..."
                class="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B3558] bg-white"
                (click)="$event.stopPropagation()"
              />
            </div>
          }

          <!-- Options List -->
          <ul class="max-h-56 overflow-y-auto py-1 divide-y divide-slate-50 text-xs sm:text-[13px]">
            @for (opt of filteredOptions(); track opt) {
              <li
                (click)="selectOption(opt)"
                class="px-3 py-2 cursor-pointer transition-colors flex items-center justify-between"
                [class.bg-blue-50]="opt === value"
                [class.text-[#0B3558]]="opt === value"
                [class.font-semibold]="opt === value"
                [class.hover:bg-slate-50]="opt !== value"
                [class.text-slate-700]="opt !== value"
                role="option"
                [attr.aria-selected]="opt === value"
              >
                <span class="truncate">{{ opt }}</span>
                @if (opt === value) {
                  <svg class="w-3.5 h-3.5 text-[#0B3558] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                }
              </li>
            } @empty {
              <li class="px-3 py-3 text-center text-xs text-slate-400">
                No matching options found
              </li>
            }
          </ul>
        </div>
      }

      <!-- Inline Error Message -->
      @if (error) {
        <p class="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1 animate-fade-in">
          <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ error }}</span>
        </p>
      }

      <!-- Helper Hint -->
      @if (!error && hint) {
        <p class="text-[11px] text-slate-400 mt-1 leading-tight">
          {{ hint }}
        </p>
      }
    </div>
  `
})
export class FormSelectComponent {
  private static nextId = 0;
  readonly id = `form-select-${++FormSelectComponent.nextId}`;

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Please select';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hint?: string;
  @Input() error?: string;

  @Output() valueChange = new EventEmitter<string>();

  isOpen = signal<boolean>(false);
  searchQuery = '';

  constructor(private elementRef: ElementRef) {}

  shouldShowSearch(): boolean {
    return (this.options?.length || 0) > 6;
  }

  filteredOptions = computed(() => {
    const list = this.options || [];
    if (!this.searchQuery.trim()) {
      return list;
    }
    const q = this.searchQuery.toLowerCase();
    return list.filter(item => item.toLowerCase().includes(q));
  });

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
      this.searchQuery = '';
    }
  }

  selectOption(option: string): void {
    this.value = option;
    this.valueChange.emit(option);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
