import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white border border-[#D9E1E7] rounded-[6px] shadow-[0_1px_3px_rgba(31,41,51,0.06)] overflow-hidden font-sans"
      [ngClass]="cardClass"
    >
      @if (title || hasHeader) {
        <div class="px-4 sm:px-5 py-3.5 border-b border-[#D9E1E7] flex items-center justify-between gap-3 bg-white">
          <div>
            @if (title) {
              <h3 class="text-[16px] leading-[24px] font-semibold text-[#1F2933] m-0">
                {{ title }}
              </h3>
            }
            @if (subtitle) {
              <p class="text-[12px] leading-[18px] text-[#5F6B76] mt-0.5 m-0">
                {{ subtitle }}
              </p>
            }
          </div>
          <div class="flex items-center gap-2">
            <ng-content select="[card-actions]"></ng-content>
          </div>
        </div>
      }

      <div [class]="bodyPadding">
        <ng-content></ng-content>
      </div>

      @if (hasFooter) {
        <div class="px-4 sm:px-5 py-3 border-t border-[#D9E1E7] bg-[#F5F7F9] flex items-center justify-end gap-2">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hasHeader: boolean = false;
  @Input() hasFooter: boolean = false;
  @Input() cardClass: string = '';
  @Input() bodyPadding: string = 'p-4 sm:p-5';
}
