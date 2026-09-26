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
      class="btn inline-flex items-center justify-center gap-2 font-medium rounded-[4px] transition-colors cursor-pointer select-none focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed font-sans"
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
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'outline':
        return 'btn-outline';
      case 'ghost':
        return 'btn-ghost';
      case 'danger':
        return 'btn-danger';
      case 'pdf-view':
        return 'bg-white hover:bg-[#0B3558] text-slate-700 hover:text-white border border-slate-300 hover:border-[#0B3558] shadow-2xs';
      default:
        return 'btn-primary';
    }
  }

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      case 'md':
      default:
        return '';
    }
  }
}
