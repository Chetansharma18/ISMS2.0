import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Scheme } from '../../../../../core/services/eoi-state.service';

@Component({
  selector: 'app-scheme-banner',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  styleUrls: ['../../application-wizard.component.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div *ngIf="scheme" class="gov-scheme-summary-card">
      <div class="scheme-summary-top-bar">
        <div class="scheme-tag-group">
          <span class="scheme-badge-primary">SELECTED TENDER / EOI</span>
          <span class="scheme-code-badge">{{ scheme.schemeCode }}</span>
          <span class="scheme-category-badge">{{ scheme.schemeCategory }}</span>
        </div>
        <div class="scheme-actions-right">
          <button
            type="button"
            class="scheme-change-btn"
            (click)="onChangeScheme.emit()"
            title="Change scheme or view other tenders"
          >
            🔄 Change Scheme / Tender
          </button>
        </div>
      </div>

      <div class="scheme-summary-main">
        <h2 class="scheme-summary-title">
          {{ scheme.name }}
        </h2>
        <p class="scheme-summary-desc">
          {{ scheme.eoiDescription }}
        </p>

        <!-- Key Tender Specifications Grid -->
        <div class="scheme-meta-grid">
          <div class="scheme-meta-item">
            <span class="sm-label">EOI Reference No.</span>
            <strong class="sm-value font-mono">{{ scheme.eoiReferenceNo }}</strong>
          </div>

          <div class="scheme-meta-item">
            <span class="sm-label">Tender ID</span>
            <strong class="sm-value font-mono">{{ scheme.tenderId }}</strong>
          </div>

          <div class="scheme-meta-item">
            <span class="sm-label">Issuing Authority / Department</span>
            <strong class="sm-value">{{ scheme.department }}</strong>
          </div>

          <div class="scheme-meta-item">
            <span class="sm-label">Submission Deadline</span>
            <strong class="sm-value text-danger">{{ scheme.closingDate }}</strong>
          </div>

          <div class="scheme-meta-item">
            <span class="sm-label">EMD Fee</span>
            <strong class="sm-value">₹{{ scheme.emdAmount | number:'1.0-0' }} <span class="sm-sub">(Refundable)</span></strong>
          </div>

          <div class="scheme-meta-item">
            <span class="sm-label">Processing Fee</span>
            <strong class="sm-value">₹{{ scheme.processingFee | number:'1.0-0' }} <span class="sm-sub">(Non-Refundable)</span></strong>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SchemeBannerComponent {
  @Input() scheme: Scheme | null = null;
  @Output() onChangeScheme = new EventEmitter<void>();
}
