import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, EoiApplication, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-preview-submit',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, AsyncPipe, CurrencyPipe, DecimalPipe, RouterLink, HeaderComponent, StepperComponent, ConfirmDialogComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-paper-50 font-sans">
      <app-header></app-header>

      <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Persistent Vertical Stepper (3 cols) -->
          <div class="lg:col-span-4 sticky top-24">
            <app-stepper [currentStep]="5" orientation="vertical"></app-stepper>
          </div>

          <!-- Single-Column Form Spine (max 720px, 8 cols) -->
          <div class="lg:col-span-8 form-spine bg-surface-0 border border-line-200 p-6 sm:p-8">
            
            <div class="section-rule pb-4 mb-6">
              <div class="text-xs font-semibold text-seal-600 uppercase tracking-wider">Final Verification Stage</div>
              <h1 class="text-2xl font-serif font-bold text-ink-900">Application Preview & Affirmative Submission</h1>
              <p class="text-xs text-muted-500 mt-1">Review your consolidated proposal and verify your EMD payment reference before statutory submission.</p>
            </div>

            <!-- Consolidated Read-Only Sections with Jump-Back 'Edit' Links -->

            <!-- Section 1: Target Scheme -->
            <div class="border border-line-200 mb-6" *ngIf="draft$ | async as draft">
              <div class="bg-paper-50 px-4 py-3 border-b border-line-200 flex justify-between items-center">
                <span class="font-serif font-bold text-xs uppercase tracking-wider text-ink-900">1. Scheme / Tender Information</span>
                <span class="text-[11px] font-mono text-muted-500">Ref: {{ draft.schemeId }}</span>
              </div>
              <div class="p-4 text-xs space-y-2">
                <div class="font-serif font-bold text-sm text-ink-900">{{ draft.schemeName }}</div>
                <div class="text-ink-700">{{ draft.department }}</div>
              </div>
            </div>

            <!-- Section 2: Attached Applicant Profile -->
            <div class="border border-line-200 mb-6" *ngIf="userProfile$ | async as profile">
              <div class="bg-paper-50 px-4 py-3 border-b border-line-200 flex justify-between items-center">
                <span class="font-serif font-bold text-xs uppercase tracking-wider text-ink-900">2. Attached Entity Profile</span>
                <a routerLink="/profile" class="text-xs text-seal-600 hover:underline font-semibold">Edit Section ↗</a>
              </div>
              <div class="p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span class="text-muted-500 block">Organization Name:</span>
                  <span class="font-bold text-ink-900">{{ profile.organization.name }}</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Signatory:</span>
                  <span class="font-medium text-ink-900">{{ profile.personal.fullName }}</span>
                </div>
                <div>
                  <span class="text-muted-500 block">PAN / GSTIN:</span>
                  <span class="font-mono text-ink-900">{{ profile.organization.pan }} / {{ profile.organization.gstin }}</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Official Contact:</span>
                  <span class="font-mono text-ink-900">{{ profile.personal.email }} | {{ profile.personal.mobile }}</span>
                </div>
              </div>
            </div>

            <!-- Section 3: Technical Proposal Answers -->
            <div class="border border-line-200 mb-6" *ngIf="draft$ | async as draft">
              <div class="bg-paper-50 px-4 py-3 border-b border-line-200 flex justify-between items-center">
                <span class="font-serif font-bold text-xs uppercase tracking-wider text-ink-900">3. Proposal Parameters</span>
                <a [routerLink]="['/eoi/apply', draft.schemeId]" class="text-xs text-seal-600 hover:underline font-semibold">Edit Section ↗</a>
              </div>
              <div class="p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span class="text-muted-500 block">Proposed Capacity:</span>
                  <span class="font-mono font-bold text-ink-900 tabular-nums">{{ draft.proposalDetails.targetCapacity }} units/trainees</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Dedicated Centers:</span>
                  <span class="font-mono font-bold text-ink-900 tabular-nums">{{ draft.proposalDetails.proposedCentersCount }} inspection centers</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Certified Technical Staff:</span>
                  <span class="font-mono font-bold text-ink-900 tabular-nums">{{ draft.proposalDetails.keyFacultyCount }} engineers</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Prior Govt Projects:</span>
                  <span class="font-mono font-bold text-ink-900 tabular-nums">{{ draft.proposalDetails.priorGovtProjects }} completed</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-muted-500 block">Proposed Clusters/Districts:</span>
                  <span class="font-medium text-ink-900">{{ draft.proposalDetails.proposedDistricts.join(', ') }}</span>
                </div>
              </div>
            </div>

            <!-- Section 4: EMD Payment Verification Record -->
            <div class="border border-line-200 mb-8" *ngIf="draft$ | async as draft">
              <div class="bg-paper-50 px-4 py-3 border-b border-line-200 flex justify-between items-center">
                <span class="font-serif font-bold text-xs uppercase tracking-wider text-ink-900">4. EMD Security Deposit Status</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-approve-100 text-approve-700 border border-[#BBDAC9]">
                  ✓ PAID & VERIFIED
                </span>
              </div>
              <div class="p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 bg-paper-50/50">
                <div>
                  <span class="text-muted-500 block">Total Paid:</span>
                  <span class="font-mono font-bold text-sm text-ink-900 tabular-nums">₹{{ draft.emdPayment.totalPaid | number:'1.0-0' }}</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Government Treasury Ref:</span>
                  <span class="font-mono font-bold text-xs text-seal-600">{{ draft.emdPayment.txnReference }}</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Payment Method:</span>
                  <span class="font-medium text-ink-900">{{ draft.emdPayment.paymentMethod }}</span>
                </div>
                <div>
                  <span class="text-muted-500 block">Transaction Timestamp:</span>
                  <span class="font-mono text-ink-700">{{ draft.emdPayment.paidTimestamp }}</span>
                </div>
              </div>
            </div>

            <!-- Statutory Affirmative Legal Declaration -->
            <div class="p-4 bg-paper-50 border border-line-200 mb-8">
              <label class="flex items-start gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  [(ngModel)]="isDeclared" 
                  class="mt-1 w-4 h-4 text-seal-600 rounded-none focus:ring-0">
                <span class="text-xs text-ink-900 leading-relaxed">
                  <strong>Statutory Declaration:</strong> I hereby declare that the information, technical capabilities, and attached certificates submitted herein are true and accurate to the best of my knowledge. I understand that any false representation will result in immediate disqualification and forfeiture of the Earnest Money Deposit under GFR 2017.
                </span>
              </label>
            </div>

            <!-- Action Bar -->
            <div class="pt-6 border-t border-line-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <a [routerLink]="['/eoi/payment', (draft$ | async)?.schemeId]" class="px-4 py-2 border border-line-200 bg-surface-0 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition-colors">
                ← Back to Payment
              </a>

              <button 
                type="button" 
                (click)="openConfirmModal()"
                [disabled]="!isDeclared"
                [ngClass]="isDeclared ? 'bg-seal-600 hover:bg-[#9B4523] text-surface-0' : 'bg-line-200 text-muted-500 cursor-not-allowed'"
                class="px-8 py-3 text-xs font-semibold rounded-none transition-colors flex items-center gap-2">
                <span>Lock & Submit Application</span>
                <span aria-hidden="true">✓</span>
              </button>
            </div>

          </div>
        </div>
      </main>

      <!-- Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="showConfirmModal"
        title="Confirm Statutory EOI Submission"
        subtitle="This action will lock your application and timestamp it for administrative scrutiny."
        message="Once confirmed, you will receive an official Acknowledgement Receipt with your permanent Application ID. Do you wish to proceed?"
        (confirmed)="onFinalSubmitConfirmed()"
        (cancelled)="showConfirmModal = false">
      </app-confirm-dialog>

    </div>
  `
})
export class PreviewSubmitComponent implements OnInit {
  draft$!: Observable<EoiApplication>;
  userProfile$!: Observable<UserProfile>;
  isDeclared = false;
  showConfirmModal = false;

  constructor(
    private eoiService: EoiStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.draft$ = this.eoiService.currentDraft$;
    this.userProfile$ = this.eoiService.userProfile$;
  }

  openConfirmModal(): void {
    if (!this.isDeclared) return;
    this.showConfirmModal = true;
  }

  onFinalSubmitConfirmed(): void {
    this.showConfirmModal = false;
    const submitted = this.eoiService.finalizeSubmission();
    this.router.navigate(['/eoi/acknowledgement', submitted.id]);
  }
}
