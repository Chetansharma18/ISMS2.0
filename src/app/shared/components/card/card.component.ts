import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div 
      class="bg-white rounded-[6px] border border-[#D9E1E8] overflow-hidden flex flex-col font-sans"
      [ngClass]="customClass">
      
      <div *ngIf="hasHeader" class="px-6 py-4 border-b border-[#D9E1E8] bg-[#EEF3F7] flex justify-between items-center text-[#0B3558] font-semibold text-[16px]">
        <ng-content select="[card-header]"></ng-content>
      </div>
      
      <div class="p-6 flex-grow text-[#172B3A] text-[14px]">
        <ng-content></ng-content>
      </div>
      
      <div *ngIf="hasFooter" class="px-6 py-3.5 bg-[#F6F8FA] border-t border-[#D9E1E8] mt-auto flex items-center justify-end gap-2.5">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() customClass = '';
  @Input() hasHeader = false;
  @Input() hasFooter = false;
}
