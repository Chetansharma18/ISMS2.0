import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchemeFormState } from '../scheme-form.state';
import { Step4FeeStatusComponent } from './step4/step4-fee-status.component';
import { Step4OrganisationPreviewComponent } from './step4/step4-organisation-preview.component';
import { Step4AuthorizedPersonPreviewComponent } from './step4/step4-authorized-person-preview.component';
import { Step4BankPreviewComponent } from './step4/step4-bank-preview.component';
import { Step4DocumentsTableComponent } from './step4/step4-documents-table.component';

/** Step 4: complete preview of the application before EMD payment. */
@Component({
  selector: 'app-step4-complete-preview',
  standalone: true,
  imports: [NgClass, FormsModule, Step4FeeStatusComponent, Step4OrganisationPreviewComponent, Step4AuthorizedPersonPreviewComponent, Step4BankPreviewComponent, Step4DocumentsTableComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">
      
      <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-8">
        
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-navy tracking-tight">
              Step 4: Complete Application Preview
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Please review all verified profile information, fee payment status, and uploaded proposal documents before committing the EMD deposit.
            </p>
          </div>
          <button
            type="button"
            (click)="state.printReceipt()"
            class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Preview</span>
          </button>
        </div>

        <!-- 1. Processing Fee Status -->
        <app-step4-fee-status />

        <!-- 2. Full OTR Profile Form (All 4 Sections with Inline Edit in Preview) -->
        <div class="space-y-6">
          
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="font-bold text-navy uppercase tracking-wider text-[12px]">2. Complete Verified OTR Profile Details</span>
              @if (state.isEditingOtrInPreview()) {
                <span class="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Editing Mode Active
                </span>
              }
            </div>
            <button
              type="button"
              (click)="state.togglePreviewOtrEdit()"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              [ngClass]="state.isEditingOtrInPreview() ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white hover:bg-slate-50 border border-navy text-navy'"
            >
              @if (state.isEditingOtrInPreview()) {
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save OTR Profile Changes</span>
              } @else {
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile Here</span>
              }
            </button>
          </div>

          <!-- Section 1: Company Particulars -->
          <app-step4-organisation-preview />

          <!-- Section 2: Authorized Signatory -->
          <app-step4-authorized-person-preview />

          <!-- Section 3: Bank Details -->
          <app-step4-bank-preview />

        </div>

        <!-- 3. Uploaded Documents Status Table (16 items) -->
        <app-step4-documents-table />

        <!-- Statutory Undertaking Checkbox -->
        <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs text-amber-900">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="state.declarationAgreed"
              class="mt-1 w-4 h-4 text-navy border-amber-300 rounded focus:ring-navy"
            />
            <div class="leading-relaxed">
              <span class="font-bold text-slate-900 block mb-0.5">Statutory Self-Declaration &amp; Undertaking:</span>
              <span class="text-slate-700">
                I/We hereby declare that all information furnished and documents submitted are true, authentic, and correct to the best of my knowledge and belief. I understand that any deliberate misrepresentation shall lead to immediate disqualification of the EOI application and forfeiture of the Earnest Money Deposit (EMD).
              </span>
            </div>
          </label>
        </div>

      </div>

      <!-- Footer Action Bar -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
        <button
          type="button"
          (click)="state.goToStep(3)"
          class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
        >
          &larr; Back to Upload Documents
        </button>

        <button
          type="button"
          (click)="state.goToStep(5)"
          [disabled]="!state.declarationAgreed()"
          class="px-6 py-2.5 bg-navy hover:bg-navy-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          Proceed to EMD Fee Payment ({{ state.formattedEmdFee() }}) &rarr;
        </button>
      </div>

    </div>
  `
})
export class Step4CompletePreviewComponent {
  protected readonly state = inject(SchemeFormState);
}
