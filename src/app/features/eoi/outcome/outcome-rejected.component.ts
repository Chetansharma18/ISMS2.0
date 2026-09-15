import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { EoiStateService, EoiApplication, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-outcome-rejected',
  standalone: true,
  imports: [RouterLink, NgIf, AsyncPipe, HeaderComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-paper-50 font-sans">
      <app-header></app-header>

      <main class="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col items-center">
        
        <!-- Rejected Document Card (Dignified rejection, max 640px) -->
        <div class="doc-card doc-spine w-full bg-surface-0 border border-line-200 p-8 sm:p-10 relative">
          
          <!-- Top Border Stamp (Dignified Reject Icon) -->
          <div class="text-center pb-6 border-b border-line-200">
            <div class="w-14 h-14 mx-auto rounded-full bg-reject-100 text-reject-700 border-2 border-[#E3BFBA] flex items-center justify-center mb-3">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>

            <div class="text-[11px] font-mono text-muted-500 uppercase tracking-widest">Administrative Scrutiny Communication</div>
            <h1 class="text-2xl font-serif font-bold text-ink-900 mt-1">Application Scrutiny Outcome</h1>
            <div class="inline-block mt-2 px-3 py-1 bg-reject-100 text-reject-700 border border-[#E3BFBA] text-xs font-bold uppercase tracking-wider">
              Status: Disqualified Under Scheme Clause 4.2
            </div>
          </div>

          <!-- Formal Public Sector Statement -->
          <div class="my-6 text-xs text-ink-900 leading-relaxed" *ngIf="userProfile$ | async as profile">
            <p>
              We regret to inform you that your Expression of Interest under Reference <strong>ISMS-EOI-2026-9871</strong> was not selected for technical partner empanelment for the following statutory reason:
            </p>

            <!-- Specific Rejection Reasons Box -->
            <div class="mt-3 p-4 bg-paper-50 border border-line-200 text-xs space-y-2">
              <div class="font-bold text-ink-900">Scrutiny Committee Observations:</div>
              <ul class="list-disc pl-4 space-y-1 text-ink-700">
                <li>
                  Mandatory accredited calibration certificate for telemetry sensor quality audit was not attached with the technical submission.
                </li>
                <li>
                  Average audited turnover in civil infrastructure audit for FY 2023-24 fell short of the ₹1.5 Cr threshold required under Clause 4.2.
                </li>
              </ul>
            </div>
          </div>

          <!-- EMD Refund Status Box (Inline & Clear) -->
          <div class="border-2 border-approve-700 bg-approve-100/40 p-4 mb-8 text-xs">
            <div class="flex items-start gap-3">
              <span class="text-approve-700 font-bold text-base leading-none">🛡</span>
              <div>
                <div class="font-bold text-approve-700 uppercase tracking-wider text-[11px]">Automatic EMD Refund Processed</div>
                <div class="text-ink-900 font-medium mt-1">
                  Your Earnest Money Deposit of <strong>₹50,000.00</strong> has been automatically initiated for electronic refund to your registered source bank account.
                </div>
                <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-ink-700">
                  <div>Treasury Refund Txn Ref: <strong>REFUND-HDFC-99201482</strong></div>
                  <div>Settlement Window: <strong>5–7 Working Days</strong></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Re-Apply Reminder (Zero Re-registration needed) -->
          <div class="p-3.5 bg-paper-50 border border-line-200 text-xs text-ink-700 mb-8 flex items-center justify-between">
            <div>
              <strong>Profile Preserved:</strong> Your registered organization profile remains verified and active. You do not need to register again to apply for other open schemes.
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-6 border-t border-line-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <a routerLink="/profile" class="px-4 py-2 border border-line-200 bg-paper-50 hover:bg-surface-0 font-semibold text-ink-900 transition-colors">
              View Profile & History
            </a>

            <a routerLink="/schemes" class="px-6 py-2.5 bg-seal-600 text-surface-0 font-semibold hover:bg-[#9B4523] transition-colors flex items-center justify-center gap-2">
              <span>Apply to Another Scheme</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

        </div>

      </main>

    </div>
  `
})
export class OutcomeRejectedComponent implements OnInit {
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
}
