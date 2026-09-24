import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3 p-6 text-center font-sans"
      [class.min-h-[200px]]="centered"
    >
      <svg
        class="animate-spin text-[#174A6E]"
        [ngClass]="sizeClasses"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3.5"
        ></circle>
        <path
          class="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      @if (text) {
        <p class="text-[13px] leading-[20px] font-medium text-[#5F6B76] m-0">
          {{ text }}
        </p>
      }
    </div>
  `
})
export class LoaderComponent {
  @Input() text: string = 'Loading...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() centered: boolean = true;

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'w-5 h-5';
      case 'lg':
        return 'w-10 h-10';
      case 'md':
      default:
        return 'w-7 h-7';
    }
  }
}
