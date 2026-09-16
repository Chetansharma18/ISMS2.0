import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-field-item" [class.full-span]="fullSpan">
      <span class="p-label">
        {{ label }} <span *ngIf="required" class="req-star">*</span>
      </span>
      <span 
        class="p-value" 
        [class.font-mono]="isMono" 
        [class.font-bold]="isBold"
        [class.text-navy]="isNavy"
        [class.text-success]="isSuccess"
      >
        <ng-container *ngIf="isLink && value">
          <a [href]="value" target="_blank" class="text-link">{{ value }}</a>
        </ng-container>
        <ng-container *ngIf="!isLink">
          {{ value || '—' }}
        </ng-container>
      </span>
    </div>
  `
})
export class PreviewFieldComponent {
  @Input() label: string = '';
  @Input() value: any = '';
  @Input() required: boolean = false;
  @Input() fullSpan: boolean = false;
  @Input() isMono: boolean = false;
  @Input() isBold: boolean = false;
  @Input() isNavy: boolean = false;
  @Input() isSuccess: boolean = false;
  @Input() isLink: boolean = false;
}
