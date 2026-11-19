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
        return 'bg-[#E4F4E8] text-[#18733B] border border-[#C3E8CC]';
      case 'danger':
        return 'bg-[#FCE8E8] text-[#C62828] border border-[#F9C5C5]';
      case 'info':
        return 'bg-[#E8F0FE] text-[#2459B3] border border-[#C5D9F8]';
      case 'submitted':
        return 'bg-[#FFF2D9] text-[#996000] border border-[#FFE1A8]';
      case 'warning':
        return 'bg-[#FFF0E5] text-[#B85B18] border border-[#FFD8BD]';
      case 'returned':
        return 'bg-[#F2EAF8] text-[#75409A] border border-[#E3CEF0]';
      case 'neutral':
      default:
        return 'bg-[#F8F9FA] text-[#5F6B76] border border-[#EADCE2]';
    }
  }
}
