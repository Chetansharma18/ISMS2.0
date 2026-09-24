import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant } from '../table/table.types';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center justify-center min-h-[24px] px-2 rounded-[4px] text-[12px] font-medium leading-none select-none tracking-normal font-sans"
      [ngClass]="variantClasses"
    >
      <ng-content></ng-content>
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';

  get variantClasses(): string {
    switch (this.variant) {
      case 'success':
        return 'bg-[#EAF2F6] text-[#174A6E] border border-[#D9E1E7]';
      case 'warning':
        return 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]';
      case 'danger':
        return 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]';
      case 'info':
        return 'bg-[#EAF2F6] text-[#174A6E] border border-[#D9E1E7]';
      case 'neutral':
      default:
        return 'bg-[#F5F7F9] text-[#5F6B76] border border-[#D9E1E7]';
    }
  }
}
