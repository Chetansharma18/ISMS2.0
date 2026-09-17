import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'link';

@Component({
  selector: 'app-button',
  template: `
    <button
      [ngClass]="buttonClasses"
      class="px-4 py-2 font-sans text-[14px] font-semibold rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full h-full flex items-center justify-center transition-all cursor-pointer"
      [class.opacity-60]="disabled || isLoading"
      [class.cursor-not-allowed]="disabled || isLoading"
      [disabled]="disabled || isLoading"
      [attr.type]="type"
    >
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass, NgIf]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() isLoading = false;

  get buttonClasses(): string[] {
    const base: string[] = [];
    switch (this.variant) {
      case 'primary':
        base.push('bg-[#0B3558]', 'hover:bg-[#082A46]', 'text-white', 'border', 'border-transparent');
        break;
      case 'secondary':
        base.push('bg-white', 'border', 'border-[#0B3558]', 'text-[#0B3558]', 'hover:bg-[#F4F7F9]');
        break;
      case 'success':
        base.push('bg-[#16834B]', 'hover:bg-[#11683B]', 'text-white', 'border', 'border-transparent');
        break;
      case 'danger':
        base.push('bg-[#C62828]', 'hover:bg-[#A31F1F]', 'text-white', 'border', 'border-transparent');
        break;
      case 'link':
        base.push('bg-transparent', 'text-[#0B3558]', 'underline', 'p-0', 'h-auto');
        break;
    }
    return base;
  }
}
