import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'link';

@Component({
  selector: 'app-button',
  template: `
    <button
      [ngClass]="buttonClasses"
      class="px-4 py-2 rounded-md font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full h-full flex items-center justify-center transition-opacity"
      [class.opacity-75]="disabled || isLoading"
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
    const base = ['text-white'];
    switch (this.variant) {
      case 'primary':
        base.push('bg-primary', 'hover:bg-primaryDark');
        break;
      case 'secondary':
        base.push('bg-gray-600', 'hover:bg-gray-700');
        break;
      case 'danger':
        base.push('bg-error', 'hover:bg-errorDark');
        break;
      case 'link':
        base.push('bg-transparent', 'text-primary', 'underline');
        break;
    }
    return base;
  }
}
