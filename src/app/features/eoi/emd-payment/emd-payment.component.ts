import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, AsyncPipe, CurrencyPipe } from '@angular/common';
import { EoiStateService, EoiApplication, Scheme } from '../../../core/services/eoi-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-emd-payment',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, AsyncPipe, CurrencyPipe, RouterLink, StepperComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-paper-50 font-sans">
      <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Persistent Vertical Stepper (3 cols) -->
          <div class="lg:col-span-4 sticky top-24">
            <app-stepper [currentStep]="4" orientation="vertical"></app-stepper>
          </div>

          <!-- Single-Column Form Spine (max 720px, 8 cols) -->
          <div class="lg:col-span-8 form-spine bg-surface-0 border border-line-200 p-6 sm:p-8">
            
            <!-- Trust-Critical Header -->
            <div class="section-rule pb-4 mb-6 flex justify-between items-start">
              <div>
                <div class="text-xs font-semibold text-seal-600 uppercase tracking-wider">Statutory Financial Deposit</div>
                <h1 class="text-2xl font-serif font-bold text-ink-900">Earnest Money Deposit (EMD)</h1>
                <p class="text-xs text-muted-500 mt-1">Government treasury-compliant security deposit for tender evaluation.</p>
              </div>

              <!-- Security Seal Icon -->
              <div class="w-10 h-10 rounded border border-line-200 bg-paper-50 flex items-center justify-center text-ink-900" title="256-Bit SSL Encrypted">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>

            <!-- Explicit Refund Policy Line (Say it before payment) -->
            <div class="bg-paper-50 border-l-4 border-approve-700 p-4 mb-8">
              <div class="flex items-start gap-3">
                <span class="text-approve-700 font-bold text-base leading-none">🛡</span>
                <div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-approve-700">Official EMD Refund Guarantee</h3>
                  <p class="text-xs text-ink-900 mt-0.5 leading-relaxed">
                    <strong>100% Refundable:</strong> Under General Financial Rules (GFR), your EMD deposit of <strong>₹50,000</strong> is fully refunded to your source bank account within 5–7 working days if your application is not approved during administrative scrutiny.
                  </p>
                </div>
              </div>
            </div>

            <!-- Fee Assessment & Breakdown Table (Bank Grade) -->
            <div class="mb-8">
              <div class="text-xs font-semibold uppercase tracking-wider text-ink-700 pb-2 border-b border-line-200 mb-3">
                1. Statutory Fee Assessment Breakdown
              </div>

              <div class="border border-line-200">
                <table class="min-w-full text-xs text-left">
                  <tbody class="divide-y divide-line-200 bg-surface-0">
                    <tr>
                      <td class="px-4 py-3 text-ink-700">
                        Base Earnest Money Deposit (Refundable Security)
                        <div class="text-[11px] text-muted-500">As mandated in Gazette Tender Notification Clause 2.1</div>
                      </td>
                      <td class="px-4 py-3 text-right font-mono font-medium text-ink-900 tabular-nums">
                        ₹50,000.00
                      </td>
                    </tr>

                    <tr>
                      <td class="px-4 py-3 text-ink-700">
                        Government Tender Processing & Scrutiny Fee
                        <div class="text-[11px] text-muted-500">Non-refundable administrative scrutiny fee</div>
                      </td>
                      <td class="px-4 py-3 text-right font-mono font-medium text-ink-900 tabular-nums">
                        ₹2,500.00
                      </td>
                    </tr>

                    <tr>
                      <td class="px-4 py-3 text-ink-700">
                        GST on Processing Fee (18% Statutory Rate)
                      </td>
                      <td class="px-4 py-3 text-right font-mono font-medium text-ink-900 tabular-nums">
                        ₹450.00
                      </td>
                    </tr>

                    <!-- Total Row -->
                    <tr class="bg-paper-50 font-bold">
                      <td class="px-4 py-3.5 text-sm text-ink-900">
                        Total Amount Payable
                      </td>
                      <td class="px-4 py-3.5 text-right font-mono text-base text-ink-900 tabular-nums">
                        ₹52,950.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Payment Method Radio List (Clean, dignified) -->
            <div class="mb-8">
              <div class="text-xs font-semibold uppercase tracking-wider text-ink-700 pb-2 border-b border-line-200 mb-3">
                2. Select Government Treasury Payment Method
              </div>

              <div class="space-y-3">
                <label class="flex items-start gap-3 p-3.5 border border-line-200 bg-surface-0 hover:border-seal-600 transition-colors cursor-pointer"
                  [class.border-seal-600]="selectedMethod === 'NET_BANKING'"
                  [class.bg-paper-50]="selectedMethod === 'NET_BANKING'">
                  <input type="radio" name="payMethod" value="NET_BANKING" [(ngModel)]="selectedMethod" class="mt-1 text-seal-600 focus:ring-0">
                  <div class="text-xs">
                    <div class="font-bold text-ink-900">Corporate & Retail Net Banking (e-Treasury Integration)</div>
                    <div class="text-muted-500 text-[11px] mt-0.5">SBI, HDFC, ICICI, PNB, Bank of Baroda, and 48 major scheduled banks. Instant confirmation.</div>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3.5 border border-line-200 bg-surface-0 hover:border-seal-600 transition-colors cursor-pointer"
                  [class.border-seal-600]="selectedMethod === 'UPI'"
                  [class.bg-paper-50]="selectedMethod === 'UPI'">
                  <input type="radio" name="payMethod" value="UPI" [(ngModel)]="selectedMethod" class="mt-1 text-seal-600 focus:ring-0">
                  <div class="text-xs">
                    <div class="font-bold text-ink-900">BHIM UPI / VPA (Virtual Payment Address)</div>
                    <div class="text-muted-500 text-[11px] mt-0.5">Instant zero-fee settlement via authorized NPCI government gateway.</div>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3.5 border border-line-200 bg-surface-0 hover:border-seal-600 transition-colors cursor-pointer"
                  [class.border-seal-600]="selectedMethod === 'NEFT_RTGS'"
                  [class.bg-paper-50]="selectedMethod === 'NEFT_RTGS'">
                  <input type="radio" name="payMethod" value="NEFT_RTGS" [(ngModel)]="selectedMethod" class="mt-1 text-seal-600 focus:ring-0">
                  <div class="text-xs">
                    <div class="font-bold text-ink-900">NEFT / RTGS / Bank Challan (e-Kuber Account)</div>
                    <div class="text-muted-500 text-[11px] mt-0.5">Generate virtual account challan number for direct bank branch transfer.</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Action Bar -->
            <div class="pt-6 border-t border-line-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button 
                type="button" 
                routerLink="/eoi/apply/SCHEME-RRD-2026"
                class="px-4 py-2 border border-line-200 bg-surface-0 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition-colors">
                ← Back to Proposal
              </button>

              <button 
                type="button" 
                (click)="processPayment()"
                [disabled]="isProcessing"
                class="px-6 py-2.5 bg-seal-600 text-surface-0 hover:bg-[#9B4523] text-xs font-semibold rounded-none transition-colors flex items-center justify-center gap-2">
                <span *ngIf="isProcessing">Processing Treasury Transaction...</span>
                <span *ngIf="!isProcessing">Pay ₹52,950 Securely & Continue</span>
                <span *ngIf="!isProcessing" aria-hidden="true">→</span>
              </button>
            </div>

            <!-- Security Trust Strip -->
            <div class="mt-6 text-center text-[11px] text-muted-500 flex items-center justify-center gap-2">
              <span>🔒 256-bit encrypted treasury gateway</span>
              <span>•</span>
              <span>Compliant with RBI Circular DPSS.CO.PD.No.1810</span>
            </div>

          </div>
        </div>
      </main>
    </div>
  `
})
export class EmdPaymentComponent implements OnInit {
  selectedMethod: 'UPI' | 'NET_BANKING' | 'CARD' | 'NEFT_RTGS' = 'NET_BANKING';
  isProcessing = false;

  constructor(
    private eoiService: EoiStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {}

  processPayment(): void {
    this.isProcessing = true;
    setTimeout(() => {
      this.eoiService.recordEmdPayment(this.selectedMethod);
      this.isProcessing = false;
      const schemeId = this.route.snapshot.paramMap.get('id') || 'SCHEME-RRD-2026';
      this.router.navigate(['/eoi/preview', schemeId]);
    }, 800);
  }
}
