import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant } from '../table/table.types';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center justify-center min-h-6 px-2 rounded-sm text-[12px] font-medium leading-none select-none tracking-normal font-sans"
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
        return 'bg-primary-light text-brand border border-theme';
      case 'warning':
        return 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]';
      case 'danger':
        return 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]';
      case 'info':
        return 'bg-primary-light text-brand border border-theme';
      case 'neutral':
      default:
        return 'bg-surface-muted text-[#5F6B76] border border-border';
    }
  }
}
