import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, model, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  styles: [`
    :host {
      display: block;
    }
  `],
  template: `
    <div
      class="relative w-full rounded-[10px] overflow-hidden border border-[#EADCE2] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 px-3.5 sm:px-6 md:px-7 py-2.5 sm:py-3 bg-[#FCF0F2]"
      style="min-height: 56px;"
    >
      <!-- Background Panoramic Fort Image with soft fade to the left -->
      <div
        class="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
        style="background-image: url('/hero-bg.png'); background-position: right 18%; opacity: 0.95;"
      ></div>
      <!-- Soft Gradient Overlay: blends fort image into #FCF0F2 background on the left -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background: linear-gradient(90deg, #FCF0F2 0%, #FCF0F2 28%, rgba(252, 240, 242, 0.90) 52%, rgba(252, 240, 242, 0.30) 72%, transparent 100%);"
      ></div>

      <!-- Left: Title & Subtitle -->
      <div class="relative z-10 flex items-center gap-2.5 sm:gap-3 min-w-0 w-full md:w-auto">
        <!-- Optional Back Button -->
        @if (backUrl || showBack) {
          <button
            type="button"
            (click)="onBackClick()"
            class="w-8 h-8 rounded-full border border-[#EADCE2] bg-white/90 hover:bg-white flex items-center justify-center text-[#7C0E44] shadow-2xs transition-all cursor-pointer shrink-0"
            [title]="backTitle"
            [attr.aria-label]="backTitle"
          >
            <app-icon name="chevron-left" [stroke]="2.5" />
          </button>
        }

        <div class="flex flex-col justify-center leading-tight min-w-0 flex-1">
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1
              class="header-title m-0 text-[18px] sm:text-[21px] md:text-[24px] font-extrabold text-[#7C0E44] tracking-tight leading-tight"
            >
              {{ title }}
            </h1>
            @if (badge) {
              <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-[#7C0E44] text-white select-none tracking-wide shrink-0">
                {{ badge }}
              </span>
            }
          </div>
          @if (subtitle) {
            <p class="text-xs sm:text-[13px] text-[#625663] m-0 mt-0.5 font-normal">
              {{ subtitle }}
            </p>
          }
        </div>
      </div>

      <!-- Right Action Slot -->
      <div class="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0 justify-end">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() showBreadcrumbs = false;
  @Input() backUrl?: string;
  @Input() showBack = false;
  @Input() backTitle = 'Go Back';
  @Input() badge?: string;
  @Input() bgColor = 'var(--color-primary, #7C0E44)';
  @Input() searchable = false;
  @Input() searchPlaceholder = 'Search...';
  @Input() suggestions: string[] = [];

  readonly searchQuery = model<string>('');

  @Output() back = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() suggestionSelect = new EventEmitter<string>();

  readonly isSearchFocused = signal<boolean>(false);

  readonly filteredSuggestions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query || !this.suggestions || this.suggestions.length === 0) {
      return [];
    }
    return this.suggestions
      .filter(s => s && s.toLowerCase().includes(query))
      .slice(0, 8);
  });

  constructor(private router: Router) { }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.search.emit(value);
  }

  onClearSearch(): void {
    this.searchQuery.set('');
    this.search.emit('');
    this.clear.emit();
  }

  onBlur(): void {
    setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 200);
  }

  selectSuggestion(item: string): void {
    this.searchQuery.set(item);
    this.search.emit(item);
    this.suggestionSelect.emit(item);
    this.isSearchFocused.set(false);
  }

  onBackClick(): void {
    if (this.back.observed) {
      this.back.emit();
    } else if (this.backUrl) {
      this.router.navigateByUrl(this.backUrl);
    }
  }
}
