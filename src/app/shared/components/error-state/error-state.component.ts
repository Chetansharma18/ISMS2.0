import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto font-sans">
      <div class="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#991B1B] mb-3">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h3 class="text-[16px] leading-[24px] font-semibold text-[#1F2933] m-0">
        {{ title }}
      </h3>

      @if (message) {
        <p class="text-[13px] leading-[20px] text-[#5F6B76] mt-1.5 mb-4">
          {{ message }}
        </p>
      }

      <div class="flex items-center gap-2 mt-2">
        @if (showRetry) {
          <button
            type="button"
            (click)="retry.emit()"
            class="h-[38px] px-4 rounded-[4px] bg-[#174A6E] hover:bg-[#123B59] text-white text-[14px] font-medium transition-colors cursor-pointer"
          >
            {{ retryText }}
          </button>
        }
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ErrorStateComponent {
  @Input() title: string = 'Something went wrong';
  @Input() message?: string;
  @Input() showRetry: boolean = true;
  @Input() retryText: string = 'Try Again';

  @Output() retry = new EventEmitter<void>();
}
