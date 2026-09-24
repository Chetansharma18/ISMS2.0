import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pdf-view';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      class="inline-flex items-center justify-center gap-2 font-medium rounded-[4px] transition-colors cursor-pointer select-none focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed font-sans"
      [ngClass]="[variantClasses, sizeClasses]"
      [title]="title"
      [attr.aria-label]="ariaLabel || title"
    >
      <!-- Optional Loading Spinner -->
      @if (loading) {
        <svg class="animate-spin -ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      }

      <!-- Authentic Adobe PDF Icon for 'pdf-view' variant -->
      @if (variant === 'pdf-view' && !loading) {
        <svg class="w-4 h-4 shrink-0 select-none" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#E5252A"/>
          <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
        </svg>
      }

      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() title = '';
  @Input() ariaLabel = '';

  @Output() btnClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }

  get variantClasses(): string {
    switch (this.variant) {
      case 'primary':
        return 'bg-[#174A6E] hover:bg-[#123B59] text-white border border-[#174A6E]';
      case 'secondary':
        return 'bg-[#EAF2F6] hover:bg-[#d5e6f0] text-[#174A6E] border border-[#EAF2F6]';
      case 'outline':
        return 'bg-white hover:bg-[#F5F7F9] text-[#174A6E] border border-[#174A6E]';
      case 'ghost':
        return 'bg-transparent hover:bg-[#EAF2F6] text-[#174A6E] border border-transparent';
      case 'danger':
        return 'bg-rose-700 hover:bg-rose-800 text-white border border-rose-700';
      case 'pdf-view':
        return 'bg-white hover:bg-slate-100 text-[#1F2933] border border-[#D9E1E7] shadow-2xs';
      default:
        return 'bg-[#174A6E] text-white border border-[#174A6E]';
    }
  }

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'h-[32px] px-3 text-[13px] leading-[18px]';
      case 'lg':
        return 'h-[44px] px-6 text-[15px] leading-[22px]';
      case 'md':
      default:
        // Design System Standard: Height 38px, horizontal padding 16px, font 14px / 500
        return 'h-[38px] px-4 text-[14px] leading-[20px]';
    }
  }
}
