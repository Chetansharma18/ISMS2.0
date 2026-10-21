import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto font-sans">
      <div class="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-brand mb-3">
        <app-icon [name]="icon" size="xl" [stroke]="1.5" />
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
  /** Name of an icon from the shared set (see tools/icons.map.json). */
  @Input() icon: IconName = 'document';
}
