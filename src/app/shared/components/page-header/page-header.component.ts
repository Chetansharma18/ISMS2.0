import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    :host {
      display: block;
    }
  `],
  template: `
    <div
      class="relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-2.5 sm:px-7 sm:py-3 bg-[#edf4fa]"
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
      <div class="relative z-10 flex items-center gap-3 min-w-0">
        <!-- Optional Back Button -->
        @if (backUrl || showBack) {
          <button
            type="button"
            (click)="onBackClick()"
            class="w-8 h-8 rounded-full border border-slate-300 bg-white/90 hover:bg-white flex items-center justify-center text-[#123B59] shadow-sm transition-all cursor-pointer shrink-0"
            [title]="backTitle"
            [attr.aria-label]="backTitle"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }

        <div class="flex flex-col justify-center leading-tight min-w-0">
          <div class="flex items-center gap-3 flex-wrap">
            <h1
              class="header-title m-0 truncate"
              style="color: #0c2d4e !important; font-size: 24px !important; line-height: 28px !important; font-weight: 800 !important; letter-spacing: -0.01em;"
            >
              {{ title }}
            </h1>
            @if (badge) {
              <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-[#174A6E] text-white select-none tracking-wide">
                {{ badge }}
              </span>
            }
          </div>
        </div>
      </div>

      <!-- Right Action / Search Slot -->
      <div class="relative z-10 flex items-center gap-3 shrink-0">
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

  @Output() back = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBackClick(): void {
    if (this.back.observed) {
      this.back.emit();
    } else if (this.backUrl) {
      this.router.navigateByUrl(this.backUrl);
    }
  }
}
