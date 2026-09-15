import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-grade-badge',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div class="inline-flex items-center gap-3">
      <!-- Large Solid Circular Seal Badge -->
      <div 
        [ngClass]="size === 'lg' ? 'w-16 h-16 text-2xl' : (size === 'md' ? 'w-10 h-10 text-base' : 'w-7 h-7 text-xs')"
        class="rounded-full bg-seal-600 text-surface-0 font-serif font-bold flex items-center justify-center border-2 border-seal-100 shadow-none flex-shrink-0">
        {{ grade }}
      </div>
      <div *ngIf="showLabel">
        <div class="text-xs font-medium uppercase tracking-wider text-seal-600">Technical Partner Rating</div>
        <div class="text-sm font-semibold text-ink-900">Grade {{ grade }} Accredited</div>
      </div>
    </div>
  `
})
export class GradeBadgeComponent {
  @Input() grade: string = 'A';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showLabel: boolean = false;
}
