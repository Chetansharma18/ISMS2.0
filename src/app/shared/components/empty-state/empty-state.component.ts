import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto font-sans">
      <div class="w-12 h-12 rounded-full bg-[#EAF2F6] flex items-center justify-center text-[#174A6E] mb-3">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" [attr.d]="iconPath" />
        </svg>
      </div>

      <h3 class="text-[16px] leading-[24px] font-semibold text-[#1F2933] m-0">
        {{ title }}
      </h3>

      @if (description) {
        <p class="text-[13px] leading-[20px] text-[#5F6B76] mt-1.5 mb-4">
          {{ description }}
        </p>
      }

      <div class="flex items-center gap-2 mt-2">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title: string = 'No records found';
  @Input() description?: string;
  @Input() iconPath: string =
    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
}
