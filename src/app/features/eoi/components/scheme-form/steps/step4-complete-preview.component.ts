import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchemeFormState } from '../scheme-form.state';
import { Step4FeeStatusComponent } from './step4/step4-fee-status.component';
import { Step4OrganisationPreviewComponent } from './step4/step4-organisation-preview.component';
import { Step4AuthorizedPersonPreviewComponent } from './step4/step4-authorized-person-preview.component';
import { Step4BankPreviewComponent } from './step4/step4-bank-preview.component';
import { Step4DocumentsTableComponent } from './step4/step4-documents-table.component';

/** Step 4: read-only preview of the application before EMD payment. */
@Component({
  selector: 'app-step4-complete-preview',
  standalone: true,
  imports: [FormsModule, Step4FeeStatusComponent, Step4OrganisationPreviewComponent, Step4AuthorizedPersonPreviewComponent, Step4BankPreviewComponent, Step4DocumentsTableComponent],
  host: { class: 'block' },
  template: `
    <div class="w-full space-y-4 font-sans">

      <!-- 1. Processing Fee -->
      <app-step4-fee-status />

      <!-- 2. Organisation -->
      <app-step4-organisation-preview />

      <!-- 3. Authorized Signatory -->
      <app-step4-authorized-person-preview />

      <!-- 4. Bank Details -->
      <app-step4-bank-preview />

      <!-- 5. Documents -->
      <app-step4-documents-table />

      <!-- Statutory Undertaking Checkbox -->
      <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs text-amber-900">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            [ngModel]="state.declarationAgreed()"
            (ngModelChange)="state.declarationAgreed.set($event)"
            class="mt-1 w-4 h-4 text-navy border-amber-300 rounded focus:ring-navy accent-navy"
          />
          <div class="leading-relaxed">
            <span class="font-bold text-slate-900 block mb-0.5">Statutory Self-Declaration &amp; Undertaking:</span>
            <span class="text-slate-700">
              I/We hereby declare that all information furnished and documents submitted are true, authentic, and correct to the best of my knowledge and belief. I understand that any deliberate misrepresentation shall lead to immediate disqualification of the EOI application and forfeiture of the Earnest Money Deposit (EMD).
            </span>
          </div>
        </label>
      </div>

      <!-- Footer Action Bar -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          (click)="state.goToStep(3)"
          class="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          &larr; Back to Upload Documents
        </button>

        <button
          type="button"
          (click)="state.goToStep(5)"
          [disabled]="!state.declarationAgreed()"
          class="px-6 sm:px-7 py-2.5 rounded-lg bg-navy hover:bg-[#07243c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
