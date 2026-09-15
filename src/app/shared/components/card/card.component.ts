import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div 
      class="bg-white rounded-lg shadow-sm border border-border overflow-hidden flex flex-col"
      [ngClass]="customClass">
      
      <div *ngIf="hasHeader" class="px-6 py-4 border-b border-border bg-gray-50 flex justify-between items-center">
        <ng-content select="[card-header]"></ng-content>
      </div>
      
      <div class="p-6 flex-grow">
        <ng-content></ng-content>
      </div>
      
      <div *ngIf="hasFooter" class="px-6 py-4 bg-gray-50 border-t border-border mt-auto">
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
