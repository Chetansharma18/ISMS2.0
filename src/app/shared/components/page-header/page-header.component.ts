import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [`
    :host {
      display: block;
    }
  `],
  template: `
    <div
      class="relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 px-3.5 sm:px-6 md:px-7 py-2.5 sm:py-3 bg-[#edf4fa]"
      style="min-height: 56px;"
    >
      <!-- Background Panoramic Fort Image with soft fade to the left -->
      <div
        class="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
        style="background-image: url('/hero-bg.png'); background-position: right 18%; opacity: 0.95;"
      ></div>
      <!-- Soft Gradient Overlay: blends fort image into light sky/white background on the left -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background: linear-gradient(90deg, #edf4fa 0%, #edf4fa 28%, rgba(237, 244, 250, 0.88) 52%, rgba(237, 244, 250, 0.28) 72%, transparent 100%);"
      ></div>

      <!-- Left: Title & Breadcrumbs -->
      <div class="relative z-10 flex items-center gap-2.5 sm:gap-3 min-w-0 w-full md:w-auto">
        <!-- Optional Back Button -->
        @if (backUrl || showBack) {
          <button
            type="button"
            (click)="onBackClick()"
            class="w-8 h-8 rounded-full border border-slate-300 bg-white/90 hover:bg-white flex items-center justify-center text-brand-dark shadow-sm transition-all cursor-pointer shrink-0"
            [title]="backTitle"
            [attr.aria-label]="backTitle"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }

        <div class="flex flex-col justify-center leading-tight min-w-0 flex-1">
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1
              class="header-title m-0 text-[18px] sm:text-[21px] md:text-[24px] font-extrabold text-[#0c2d4e] tracking-tight leading-tight"
            >
              {{ title }}
            </h1>
            @if (badge) {
              <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-primary text-white select-none tracking-wide shrink-0">
                {{ badge }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Right Action / Search Slot -->
      <div class="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0 justify-end">
        @if (searchable) {
          <div class="relative w-full sm:w-80">
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchInput($event)"
              [placeholder]="searchPlaceholder"
              class="w-full pl-9 pr-7 py-2 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-navy transition-colors font-normal shadow-2xs"
            />
            @if (searchQuery()) {
              <button
                type="button"
                (click)="onClearSearch()"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                title="Clear search"
              >
                ✕
              </button>
            }
          </div>
        }
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() showBreadcrumbs = false;
  @Input() backUrl?: string;
  @Input() showBack = false;
  @Input() backTitle = 'Go Back';
  @Input() badge?: string;
  @Input() bgColor = 'var(--color-primary, #174A6E)';
  @Input() searchable = false;
  @Input() searchPlaceholder = 'Search...';

  readonly searchQuery = model<string>('');

  @Output() back = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  constructor(private router: Router) {}

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.search.emit(value);
  }

  onClearSearch(): void {
    this.searchQuery.set('');
    this.search.emit('');
    this.clear.emit();
  }

  onBackClick(): void {
    if (this.back.observed) {
      this.back.emit();
    } else if (this.backUrl) {
      this.router.navigateByUrl(this.backUrl);
    }
  }
}
