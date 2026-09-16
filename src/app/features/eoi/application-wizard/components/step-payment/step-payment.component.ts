import { Component, Input, Output, EventEmitter, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../../services/eoi.service';
import { Scheme } from '../../../../../core/services/eoi-state.service';

@Component({
  selector: 'app-step-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  styleUrls: ['../../application-wizard.component.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="gov-step-content" aria-labelledby="step2-heading">
      
      <!-- Page Header & Subtitle -->
      <div class="page-title-section">
        <div class="title-header-row">
          <div class="title-meta-left">
            <h1 id="step2-heading" class="section-title">Fee Payment</h1>
            <p class="section-subtitle">Select Applicable EOI Application Fees &amp; Payment Gateway</p>
          </div>
          <div class="title-meta-right">
            <span class="gov-step-pill">STEP 02 OF 04</span>
            <div class="payment-total-pill">
              <span class="total-label">Total Payable:</span>
              <strong class="total-amount-val">₹{{ eoiService.computedTotalFee().toLocaleString('en-IN') }}</strong>
            </div>
          </div>
        </div>
        <div class="title-separator"></div>
      </div>

      <div class="fees-page-grid">
        <!-- Left: Fee Selection & Payment Methods -->
        <div class="fees-main-col">
          
          <!-- Card 1: Fee Details & Selection -->
          <div class="gov-card-section" [class.has-error-card]="validationErrors['fees_selection']">
            <div class="gov-card-header">
              <div class="card-title-group">
                <h3 class="card-title">1. Applicable EOI Application Fees (Compulsory)</h3>
              </div>
            </div>
            
            <div class="gov-card-body">
              <p class="fee-section-note">
                Both Processing Fee (₹{{ (eoiService.paymentData().processingFee || 2500) | number:'1.0-0' }}) and Earnest Money Deposit (₹{{ (eoiService.paymentData().emdFee || 50000) | number:'1.0-0' }}) are compulsory for EOI proposal submission under <strong>{{ scheme?.schemeCode || 'this Scheme' }}</strong>.
              </p>

              <div class="fee-items-list">
                <!-- Fee Item 1: Processing Fee -->
                <label
                  class="fee-selection-card"
                  [class.is-selected]="eoiService.paymentData().processingFeeSelected"
                >
                  <div class="fee-checkbox-wrap">
                    <input
                      type="checkbox"
                      id="chk_proc_fee"
                      class="gov-checkbox"
                      [ngModel]="eoiService.paymentData().processingFeeSelected"
                      (ngModelChange)="eoiService.updateFeeSelection('processingFeeSelected', $event); onClearError.emit('fees_selection')"
                    />
                  </div>
                  <div class="fee-details-wrap">
                    <div class="fee-name-row">
                      <span class="fee-title">1. Processing Fee <span class="req-star">*</span></span>
                      <span class="fee-amount-tag">₹{{ (eoiService.paymentData().processingFee || 2500) | number:'1.0-0' }}</span>
                    </div>
                    <span class="fee-sub-desc">Non-refundable administrative scrutiny fee under {{ scheme?.schemeCode || 'ISMS 2.0' }} guidelines</span>
                  </div>
                </label>

                <!-- Fee Item 2: EMD Fee -->
                <label
                  class="fee-selection-card"
                  [class.is-selected]="eoiService.paymentData().emdFeeSelected"
                >
                  <div class="fee-checkbox-wrap">
                    <input
                      type="checkbox"
                      id="chk_emd_fee"
                      class="gov-checkbox"
                      [ngModel]="eoiService.paymentData().emdFeeSelected"
                      (ngModelChange)="eoiService.updateFeeSelection('emdFeeSelected', $event); onClearError.emit('fees_selection')"
                    />
                  </div>
                  <div class="fee-details-wrap">
                    <div class="fee-name-row">
                      <span class="fee-title">2. Earnest Money Deposit (EMD) <span class="req-star">*</span></span>
                      <span class="fee-amount-tag">₹{{ (eoiService.paymentData().emdFee || 50000) | number:'1.0-0' }}</span>
                    </div>
                    <span class="fee-sub-desc">Refundable security deposit for Training Provider / PIA empanelment proposal under {{ scheme?.schemeCode || 'EOI' }}</span>
                  </div>
                </label>
              </div>

              <!-- Inline Error for Fee Selection -->
              <div *ngIf="validationErrors['fees_selection']" class="error-feedback fee-error-msg">
                ⚠️ {{ validationErrors['fees_selection'] }}
              </div>
            </div>
          </div>

          <!-- Card 2: Payment Method Selection -->
          <div class="gov-card-section" [class.has-error-card]="validationErrors['payment_method']">
            <div class="gov-card-header">
              <div class="card-title-group">
                <h3 class="card-title">2. Select Payment Mode</h3>
              </div>
            </div>
            
            <div class="gov-card-body">
              <p class="fee-section-note">
                Choose your preferred payment method to complete the application fee payment.
              </p>

              <div class="payment-methods-grid">
                <!-- Method 1: UPI -->
                <label
                  class="payment-method-card"
                  [class.is-selected]="eoiService.paymentData().paymentMethod === 'UPI'"
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    value="UPI"
                    class="gov-radio"
                    [ngModel]="eoiService.paymentData().paymentMethod"
                    (ngModelChange)="eoiService.setPaymentMethod($event); onClearError.emit('payment_method')"
                  />
                  <div class="method-meta">
                    <span class="method-icon">📱</span>
                    <span class="method-name">UPI</span>
                    <span class="method-sub">Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                </label>

                <!-- Method 2: Net Banking -->
                <label
                  class="payment-method-card"
                  [class.is-selected]="eoiService.paymentData().paymentMethod === 'Net Banking'"
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    value="Net Banking"
                    class="gov-radio"
                    [ngModel]="eoiService.paymentData().paymentMethod"
                    (ngModelChange)="eoiService.setPaymentMethod($event); onClearError.emit('payment_method')"
                  />
                  <div class="method-meta">
                    <span class="method-icon">🏦</span>
                    <span class="method-name">Net Banking</span>
                    <span class="method-sub">SBI, HDFC, ICICI, PNB, BoB &amp; 50+ Banks</span>
                  </div>
                </label>

                <!-- Method 3: Debit / Credit Card -->
                <label
                  class="payment-method-card"
                  [class.is-selected]="eoiService.paymentData().paymentMethod === 'Debit / Credit Card'"
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    value="Debit / Credit Card"
                    class="gov-radio"
                    [ngModel]="eoiService.paymentData().paymentMethod"
                    (ngModelChange)="eoiService.setPaymentMethod($event); onClearError.emit('payment_method')"
                  />
                  <div class="method-meta">
                    <span class="method-icon">💳</span>
                    <span class="method-name">Debit / Credit Card</span>
                    <span class="method-sub">RuPay, Visa, MasterCard, Maestro</span>
                  </div>
                </label>
              </div>

              <!-- Inline Error for Payment Method -->
              <div *ngIf="validationErrors['payment_method']" class="error-feedback fee-error-msg">
                ⚠️ {{ validationErrors['payment_method'] }}
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="fees-sidebar-col">
          <div class="payment-summary-sticky-card">
            <div class="summary-card-header">
              <h4 class="summary-header-title">Payment Summary</h4>
              <span class="summary-eoi-tag">{{ scheme?.schemeCode || 'ISMS 2.0' }}</span>
            </div>
            
            <div class="summary-card-body">
              <div class="summary-fee-line">
                <span class="fee-item-name">Processing Fee</span>
                <span class="fee-item-val" [class.is-zero]="!eoiService.paymentData().processingFeeSelected">
                  {{ eoiService.paymentData().processingFeeSelected ? ('₹' + ((eoiService.paymentData().processingFee || 2500) | number:'1.0-0')) : '₹0' }}
                </span>
              </div>
              <div class="summary-fee-line">
                <span class="fee-item-name">EMD Fee</span>
                <span class="fee-item-val" [class.is-zero]="!eoiService.paymentData().emdFeeSelected">
                  {{ eoiService.paymentData().emdFeeSelected ? ('₹' + ((eoiService.paymentData().emdFee || 50000) | number:'1.0-0')) : '₹0' }}
                </span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-total-line">
                <span class="total-title">Total Payable Amount</span>
                <span class="total-big-val">₹{{ eoiService.computedTotalFee().toLocaleString('en-IN') }}</span>
              </div>

              <div *ngIf="eoiService.paymentData().paymentMethod" class="selected-method-indicator">
                <span>Selected Method: <strong>{{ eoiService.paymentData().paymentMethod }}</strong></span>
              </div>

              <!-- Proceed to Payment CTA -->
              <button
                type="button"
                id="btn-proceed-payment"
                class="gov-btn gov-btn-primary gov-btn-pay-action"
                [disabled]="eoiService.computedTotalFee() === 0 || eoiService.isPaymentProcessing()"
                (click)="onProceedPayment.emit()"
              >
                <span *ngIf="!eoiService.isPaymentProcessing()">
                  Proceed to Payment (₹{{ eoiService.computedTotalFee().toLocaleString('en-IN') }}) →
                </span>
                <span *ngIf="eoiService.isPaymentProcessing()" class="btn-spinner-wrap">
                  <span class="btn-spinner"></span>
                  <span>Processing Payment Gateway...</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation Actions -->
      <div class="gov-form-footer">
        <div class="footer-left">
          <button
            type="button"
            class="gov-btn gov-btn-secondary"
            (click)="onBack.emit()"
          >
            ← Back to Documents
          </button>
        </div>
        <div class="footer-right"></div>
      </div>

    </div>
  `
})
export class StepPaymentComponent {
  readonly eoiService = inject(EoiService);

  @Input() scheme: Scheme | null = null;
  @Input() validationErrors: Record<string, string> = {};

  @Output() onProceedPayment = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onClearError = new EventEmitter<string>();
}
