import { Component, Input, Output, EventEmitter, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EoiService } from '../../services/eoi.service';
import { Scheme } from '../../../../../core/services/eoi-state.service';

@Component({
  selector: 'app-step-receipt',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  styleUrls: ['../../application-wizard.component.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="gov-step-content" aria-labelledby="step4-heading">
      
      <!-- Page Header & Subtitle -->
      <div class="page-title-section">
        <div class="title-header-row">
          <div class="title-meta-left">
            <h1 id="step4-heading" class="section-title">Submission Receipt &amp; Acknowledgement</h1>
            <p class="section-subtitle">Official Government of Rajasthan EOI Registration Proof • Tender Empanelment</p>
          </div>
          <div class="title-meta-right">
            <span class="gov-step-pill">STEP 04 OF 04</span>
          </div>
        </div>
        <div class="title-separator"></div>
      </div>
      
      <!-- Modification Deadline Alert Window -->
      <div class="modification-window-banner" [class.window-closed]="!eoiService.isModificationAllowed()">
        <div class="mod-banner-left">
          <div class="mod-icon-box">
            {{ eoiService.isModificationAllowed() ? '🕒' : '🔒' }}
          </div>
          <div class="mod-text-box">
            <div class="mod-title-row">
              <span class="mod-main-title">
                {{ eoiService.isModificationAllowed() ? 'Post-Submission Modification Allowed (Max 3 Times Only)' : (eoiService.modificationsRemaining() <= 0 ? 'Modification Limit Reached (3 of 3 Edits Used)' : 'Modification Window Has Closed') }}
              </span>
              <span *ngIf="eoiService.isModificationAllowed()" class="mod-countdown-tag">
                {{ eoiService.modificationsRemaining() }} of {{ eoiService.maxModifications }} Edits Remaining
              </span>
              <span *ngIf="eoiService.modificationsRemaining() <= 0" class="mod-expired-tag">
                0 of 3 Edits Remaining
              </span>
              <span *ngIf="eoiService.modificationsRemaining() > 0 && !eoiService.isModificationAllowed()" class="mod-expired-tag">
                Deadline Expired
              </span>
            </div>
            <p class="mod-sub-desc" *ngIf="eoiService.isModificationAllowed()">
              You can edit the complete details of this submitted application <strong>up to 3 times only</strong> until <strong>30 September 2026 (05:00 PM)</strong>. You have used <strong>{{ eoiService.modificationCount() }} of 3</strong> edits. All post-submission updates retain your existing fee payment without re-payment.
            </p>
            <p class="mod-sub-desc" *ngIf="eoiService.modificationsRemaining() <= 0">
              You have utilized all <strong>3 permitted post-submission edits</strong> for this application. No further modifications can be submitted.
            </p>
            <p class="mod-sub-desc" *ngIf="eoiService.modificationsRemaining() > 0 && !eoiService.isModificationAllowed()">
              The tender modification deadline was <strong>30 September 2026 (05:00 PM)</strong>. The modification window is now closed.
            </p>
          </div>
        </div>

        <div class="mod-banner-actions">
          <!-- Edit Application Button (Enabled when edits remain and deadline active) -->
          <button
            type="button"
            id="btn-edit-application"
            class="gov-btn gov-btn-edit-app"
            [disabled]="!eoiService.isModificationAllowed()"
            (click)="onReopenModification.emit()"
          >
            <span *ngIf="eoiService.isModificationAllowed()">✏️ Edit Complete Application ({{ eoiService.modificationsRemaining() }} Left)</span>
            <span *ngIf="eoiService.modificationsRemaining() <= 0">🔒 Limit Reached (3/3 Used)</span>
            <span *ngIf="eoiService.modificationsRemaining() > 0 && !eoiService.isModificationAllowed()">🔒 Window Closed</span>
          </button>
          
          <!-- Reviewer/Tester Simulation Toggle -->
          <button
            type="button"
            class="gov-btn-test-toggle"
            (click)="onToggleDeadline.emit()"
            title="Toggle between Active and Expired deadline for demo evaluation"
          >
            ⚙️ Test Deadline: {{ eoiService.simulateExpiredDeadline() ? 'Expired (Click to Activate)' : 'Active (Click to Expire)' }}
          </button>
        </div>
      </div>

      <!-- Official Government of Rajasthan Submission Receipt Card -->
      <div class="gov-card-section receipt-card" id="printable-receipt">
        
        <!-- Receipt Top Header -->
        <div class="receipt-header-banner">
          <div class="receipt-emblem-wrap">
            <img src="ashok.png" alt="Emblem" class="receipt-emblem" />
          </div>
          <div class="receipt-titles-wrap">
            <span class="receipt-govt-tag">GOVERNMENT OF RAJASTHAN</span>
            <span class="receipt-dept-tag">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
            <h2 class="receipt-main-title">EOI APPLICATION SUBMISSION RECEIPT &amp; ACKNOWLEDGEMENT</h2>
            <span class="receipt-scheme-tag">Integrated Skill Management System (ISMS 2.0) • Scheme Empanelment FY 2025–26</span>
          </div>
          <div class="receipt-badge-wrap">
            <span class="receipt-status-stamp">✓ SUBMITTED</span>
          </div>
        </div>

        <!-- Receipt Body Content -->
        <div class="gov-card-body receipt-card-body">
          
          <!-- Highlighted Ref Bar -->
          <div class="receipt-ref-bar">
            <div class="ref-col">
              <span class="ref-label">Application Number:</span>
              <strong class="ref-number-big">{{ eoiService.submissionData().applicationNumber }}</strong>
            </div>
            <button
              type="button"
              class="receipt-copy-btn"
              (click)="onCopyRef.emit()"
              title="Copy Application Number"
            >
              {{ copiedRef ? '✓ Copied!' : '📋 Copy Application No.' }}
            </button>
          </div>

          <!-- Application Key Metadata Table -->
          <div class="receipt-meta-grid">
            <div class="receipt-meta-row">
              <span class="r-label">Training Provider / PIA:</span>
              <span class="r-val font-bold">{{ eoiService.formData().section5.training_provider_name }}</span>
            </div>
            <div class="receipt-meta-row">
              <span class="r-label">EOI Reference Number:</span>
              <span class="r-val font-mono">{{ eoiService.submissionData().eoiRefNumber }}</span>
            </div>
            <div class="receipt-meta-row">
              <span class="r-label">Registration Number:</span>
              <span class="r-val font-mono">{{ eoiService.formData().section5.registration_number }}</span>
            </div>
            <div class="receipt-meta-row">
              <span class="r-label">Submission Date &amp; Time:</span>
              <span class="r-val">{{ eoiService.submissionData().submissionDate }}, 03:45 PM IST</span>
            </div>
            <div class="receipt-meta-row">
              <span class="r-label">Post-Submission Edits:</span>
              <span class="r-val font-bold" [class.text-success]="eoiService.modificationsRemaining() > 0" [class.text-danger]="eoiService.modificationsRemaining() <= 0">
                {{ eoiService.modificationCount() }} of {{ eoiService.maxModifications }} Used ({{ eoiService.modificationsRemaining() }} Remaining)
              </span>
            </div>
            <div class="receipt-meta-row">
              <span class="r-label">Training Centre Location:</span>
              <span class="r-val">{{ eoiService.formData().section6.training_center_name }}, {{ eoiService.formData().section6.district_city }}</span>
            </div>
            <div class="receipt-meta-row">
              <span class="r-label">Total Documents Uploaded:</span>
              <span class="r-val font-bold text-success">{{ eoiService.uploadedSlotsCount() }} Categories Uploaded (5 MB Verified PDFs)</span>
            </div>
          </div>

          <!-- Payment Section in Receipt -->
          <div class="receipt-section-box">
            <h4 class="receipt-sec-title">PAYMENT DETAILS &amp; TRANSACTION RECEIPT</h4>
            <div class="receipt-payment-table-wrap">
              <table class="receipt-table">
                <thead>
                  <tr>
                    <th>Fee Description</th>
                    <th>Challan / Ref No.</th>
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th style="text-align: right;">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Processing Fee (Scrutiny Fee)</td>
                    <td class="font-mono">{{ eoiService.formData().section8.process_fee_payment_id }}</td>
                    <td>{{ eoiService.paymentData().paymentMethod || 'Online UPI' }}</td>
                    <td><span class="r-tag-paid">✓ SUCCESSFUL</span></td>
                    <td style="text-align: right;" class="font-mono">₹{{ (eoiService.paymentData().processingFeeSelected ? (eoiService.paymentData().processingFeeAmount || 500) : 0).toLocaleString('en-IN') }}</td>
                  </tr>
                  <tr>
                    <td>Earnest Money Deposit (EMD)</td>
                    <td class="font-mono">{{ eoiService.formData().section7.emd_payment_id }}</td>
                    <td>{{ eoiService.paymentData().paymentMethod || 'Online UPI' }}</td>
                    <td><span class="r-tag-paid">✓ SUCCESSFUL</span></td>
                    <td style="text-align: right;" class="font-mono">₹{{ (eoiService.paymentData().emdFeeSelected ? (eoiService.paymentData().emdFeeAmount || 100000) : 0).toLocaleString('en-IN') }}</td>
                  </tr>
                  <tr class="receipt-total-row">
                    <td colspan="4" style="text-align: right; font-weight: 700;">TOTAL AMOUNT PAID:</td>
                    <td style="text-align: right; font-weight: 800; font-size: 15px; color: #1E4D8F;" class="font-mono">
                      ₹{{ eoiService.paymentData().totalAmount.toLocaleString('en-IN') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="receipt-txn-footer">
              <span>Gateway Transaction ID: <strong>{{ eoiService.paymentData().transactionId }}</strong></span>
              <span>Payment Timestamp: <strong>{{ eoiService.paymentData().paymentDate }}</strong></span>
            </div>
          </div>

          <!-- Official Disclaimer & Footer Stamp -->
          <div class="receipt-official-footer">
            <p class="receipt-disclaimer">
              This acknowledgement receipt is generated electronically under the Integrated Scheme Management System (ISMS 2.0). All claims and uploaded credentials are subject to physical verification and empanelment scrutiny by RSLDC Scrutiny Committee.
            </p>
            <div class="receipt-signature-stamp">
              <span class="stamp-org">ISMS 2.0 VERIFIED</span>
              <span class="stamp-sub">Govt. of Rajasthan</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Receipt Action Bar -->
      <div class="gov-form-footer receipt-actions-bar">
        <div class="footer-left">
          <button
            type="button"
            class="gov-btn gov-btn-secondary"
            (click)="eoiService.setFlowStage('documents')"
          >
            👁️ View Complete Application
          </button>
        </div>
        <div class="footer-right">
          <!-- Print Receipt (window.print) -->
          <button
            type="button"
            class="gov-btn gov-btn-secondary"
            (click)="onPrint.emit()"
          >
            <span>🖨️ Print Receipt</span>
          </button>
          
          <!-- Download Receipt (Official PDF) -->
          <button
            type="button"
            class="gov-btn gov-btn-primary"
            (click)="onDownload.emit()"
          >
            <span>📥 Download Receipt (PDF)</span>
          </button>
        </div>
      </div>

    </div>
  `
})
export class StepReceiptComponent {
  readonly eoiService = inject(EoiService);

  @Input() scheme: Scheme | null = null;
  @Input() copiedRef: boolean = false;

  @Output() onCopyRef = new EventEmitter<void>();
  @Output() onPrint = new EventEmitter<void>();
  @Output() onDownload = new EventEmitter<void>();
  @Output() onReopenModification = new EventEmitter<void>();
  @Output() onToggleDeadline = new EventEmitter<void>();
}
