import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EoiService } from '../../services/eoi.service';

@Component({
  selector: 'app-footer-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gov-form-footer">
      <div class="footer-left">
        <button
          *ngIf="eoiService.currentSection() > 1"
          type="button"
          class="gov-btn gov-btn-secondary"
          (click)="onPrevious()"
        >
          Previous
        </button>
      </div>

      <div class="footer-right">
        <button
          *ngIf="eoiService.currentSection() < 4"
          type="button"
          class="gov-btn gov-btn-primary"
          (click)="onNext()"
        >
          Next Step & Continue
        </button>

        <button
          *ngIf="eoiService.currentSection() === 4"
          type="button"
          class="gov-btn gov-btn-submit"
          [class.is-loading]="eoiService.submissionState() === 'submitting'"
          [class.is-success]="eoiService.submissionState() === 'submitted'"
          [disabled]="eoiService.submissionState() !== 'idle'"
          (click)="onSubmit()"
        >
          <span *ngIf="eoiService.submissionState() === 'idle'" class="btn-inner">
            <span class="btn-icon">✓</span> Submit EOI Application
          </span>
          <span *ngIf="eoiService.submissionState() === 'submitting'" class="btn-inner">
            <span class="btn-spinner"></span> Submitting Application...
          </span>
          <span *ngIf="eoiService.submissionState() === 'submitted'" class="btn-inner">
            <span class="btn-animated-tick">✔</span> Submitted!
          </span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./footer-actions.component.css']
})
export class FooterActionsComponent {
  eoiService = inject(EoiService);
  @Output() nextClicked = new EventEmitter<void>();
  @Output() submitClicked = new EventEmitter<void>();

  onPrevious(): void {
    this.eoiService.previousSection();
  }

  onNext(): void {
    this.nextClicked.emit();
  }

  onSubmit(): void {
    this.submitClicked.emit();
  }
}
