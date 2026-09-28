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
    :host h1,
    :host .header-title {
      color: #ffffff !important;
      font-size: 16px !important;
      line-height: 22px !important;
      font-weight: 600 !important;
    }
    :host nav,
    :host nav a,
    :host nav span {
      color: #ffffff !important;
    }
    :host .breadcrumb-separator {
      color: rgba(255, 255, 255, 0.75) !important;
    }
  `],
  template: `
    <div
      class="text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-sm flex items-center justify-between gap-3 shadow-xs"
      [style.backgroundColor]="bgColor"
    >
      <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <!-- Circular Back Button -->
        @if (backUrl || showBack) {
          <button
            type="button"
            (click)="onBackClick()"
            class="w-7 h-7 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer shrink-0 focus:outline-none"
            style="border-color: #ffffff !important; color: #ffffff !important;"
            [title]="backTitle"
            [attr.aria-label]="backTitle"
          >
            <svg class="w-3.5 h-3.5 stroke-[2.5]" style="stroke: #ffffff !important; color: #ffffff !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }

        <!-- Title & Breadcrumb Block -->
        <div class="flex flex-col justify-center leading-tight min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h1
              class="header-title text-[15px] sm:text-[16px] font-semibold text-white leading-snug m-0 truncate tracking-tight"
              style="color: #ffffff !important; font-size: 16px !important; line-height: 22px !important;"
            >
              {{ title }}
            </h1>
            @if (badge) {
              <span class="px-1.5 py-0.5 text-[10.5px] font-medium rounded-[3px] bg-white/20 text-white select-none" style="color: #ffffff !important;">
                {{ badge }}
              </span>
            }
          </div>

          <!-- Breadcrumbs -->
          @if (breadcrumbs && breadcrumbs.length > 0) {
            <nav class="flex items-center gap-1.5 text-[11px] sm:text-[11.5px] leading-tight text-white/90 font-normal mt-0.5 select-none" aria-label="Breadcrumb">
              @for (item of breadcrumbs; track item.label; let last = $last) {
                @if (item.url && !last) {
                  <a [routerLink]="item.url" class="hover:underline transition-colors" style="color: #ffffff !important;">
                    {{ item.label }}
                  </a>
                } @else {
                  <span [class.font-medium]="last" style="color: #ffffff !important;">{{ item.label }}</span>
                }

                @if (!last) {
                  <span class="breadcrumb-separator select-none">&gt;</span>
                }
              }
            </nav>
          }
        </div>
      </div>

      <!-- Right Action / Metadata Slot -->
      <div class="flex items-center gap-2 shrink-0">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
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
