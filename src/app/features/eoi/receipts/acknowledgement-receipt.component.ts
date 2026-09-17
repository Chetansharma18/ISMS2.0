import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, EoiApplication, UserProfile } from '../../../core/services/eoi-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-acknowledgement-receipt',
  standalone: true,
  imports: [RouterLink, NgIf, AsyncPipe, CurrencyPipe, DecimalPipe],
  template: `
    <div class="min-h-screen flex flex-col bg-paper-50 font-sans">
      <main class="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col items-center">
        
        <!-- Document Card (max 640px, centered receipt style on paper background) -->
        <div class="doc-card doc-spine w-full bg-surface-0 border border-line-200 p-8 relative">
          
          <!-- Top Receipt Border / Official Header -->
          <div class="text-center pb-6 border-b border-line-200">
            
            <!-- Animated Official Seal Stamp (Single motion moment) -->
            <div class="w-14 h-14 mx-auto rounded-full bg-approve-100 text-approve-700 border-2 border-[#BBDAC9] flex items-center justify-center mb-3 animate-seal-stamp">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <div class="text-[11px] font-mono text-muted-500 uppercase tracking-widest">Government of India · e-Tendering Registry</div>
            <h1 class="text-2xl font-serif font-bold text-ink-900 mt-1">Official Submission Acknowledgement</h1>
            <p class="text-xs text-ink-700 mt-1">Expression of Interest (EOI) Filing & EMD Deposit Confirmation</p>
          </div>

          <!-- Application ID Banner (Large, tabular, copyable) -->
          <div class="bg-paper-50 border border-line-200 p-4 my-6 text-center" *ngIf="application$ | async as app">
            <div class="text-[11px] font-mono text-muted-500 uppercase tracking-wider">Permanent Application Reference ID</div>
            <div class="text-2xl sm:text-3xl font-mono font-bold text-seal-600 tracking-wider mt-1 select-all">
              {{ app.id }}
            </div>
            <div class="text-[11px] text-muted-500 mt-1">
              Timestamp: {{ app.appliedDate }} 11:45:00 IST • Status: <strong>UNDER ADMINISTRATIVE SCRUTINY</strong>
            </div>
          </div>

          <!-- Details Grid (Tabular receipt structure) -->
          <div class="space-y-4 text-xs" *ngIf="application$ | async as app">
            
            <div class="border border-line-200">
              <div class="bg-paper-50 px-4 py-2 font-serif font-bold text-xs uppercase text-ink-900 border-b border-line-200">
                Tender & Applicant Identification
              </div>
              <table class="w-full text-left divide-y divide-line-200">
                <tbody class="divide-y divide-line-200">
                  <tr>
                    <td class="px-4 py-2.5 text-muted-500 w-1/3">Scheme Name:</td>
                    <td class="px-4 py-2.5 font-bold text-ink-900">{{ app.schemeName }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2.5 text-muted-500">Department:</td>
                    <td class="px-4 py-2.5 text-ink-900">{{ app.department }}</td>
                  </tr>
                  <tr *ngIf="userProfile$ | async as profile">
                    <td class="px-4 py-2.5 text-muted-500">Applicant Entity:</td>
                    <td class="px-4 py-2.5 font-bold text-ink-900">{{ profile.organization.name }} (PAN: {{ profile.organization.pan }})</td>
                  </tr>
                  <tr *ngIf="userProfile$ | async as profile">
                    <td class="px-4 py-2.5 text-muted-500">Authorized Signatory:</td>
                    <td class="px-4 py-2.5 text-ink-900">{{ profile.personal.fullName }} ({{ profile.personal.mobile }})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- EMD Payment Receipt Details -->
            <div class="border border-line-200">
              <div class="bg-paper-50 px-4 py-2 font-serif font-bold text-xs uppercase text-ink-900 border-b border-line-200">
                Statutory Financial Deposit Record
              </div>
              <table class="w-full text-left divide-y divide-line-200">
                <tbody class="divide-y divide-line-200">
                  <tr>
                    <td class="px-4 py-2.5 text-muted-500 w-1/3">EMD Amount Deposited:</td>
                    <td class="px-4 py-2.5 font-mono font-bold text-ink-900 tabular-nums text-sm">
                      ₹{{ app.emdPayment.totalPaid | number:'1.0-0' }} (PAID)
                    </td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2.5 text-muted-500">Treasury Transaction Ref:</td>
                    <td class="px-4 py-2.5 font-mono font-bold text-seal-600">{{ app.emdPayment.txnReference }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2.5 text-muted-500">Payment Gateway:</td>
                    <td class="px-4 py-2.5 text-ink-900">{{ app.emdPayment.paymentMethod }} — e-Treasury Network</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- Bottom Notice & Status Link -->
          <div class="mt-8 pt-6 border-t border-line-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div class="text-ink-700 text-center sm:text-left">
              <span>Your application is now undergoing administrative & technical scrutiny.</span>
            </div>

            <a *ngIf="application$ | async as app" [routerLink]="['/eoi/tracker', app.id]" class="px-5 py-2 bg-ink-900 text-surface-0 font-semibold hover:bg-ink-700 transition-colors">
              Track Scrutiny Status →
            </a>
          </div>

          <!-- Action Buttons (Print & Download PDF) -->
          <div class="mt-6 pt-4 border-t border-line-200 flex justify-center gap-4 text-xs">
            <button (click)="printReceipt()" class="px-4 py-2 border border-line-200 bg-paper-50 hover:bg-surface-0 font-semibold text-ink-900 transition-colors inline-flex items-center gap-1.5">
              <span>🖨 Print Receipt</span>
            </button>
            <button (click)="downloadPdf()" class="px-4 py-2 border border-line-200 bg-paper-50 hover:bg-surface-0 font-semibold text-ink-900 transition-colors inline-flex items-center gap-1.5">
              <span>⬇ Download Signed PDF</span>
            </button>
          </div>

        </div>

      </main>

    </div>
  `
})
export class AcknowledgementReceiptComponent implements OnInit {
  application$!: Observable<EoiApplication>;
  userProfile$!: Observable<UserProfile>;

  constructor(
    private eoiService: EoiStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.application$ = this.eoiService.currentDraft$;
    this.userProfile$ = this.eoiService.userProfile$;
  }

  printReceipt(): void {
    window.print();
  }

  downloadPdf(): void {
    alert('Downloading official digitally signed Acknowledgement PDF (ISMS-EOI-2026-9871.pdf)...');
  }
}
