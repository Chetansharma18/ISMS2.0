import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, Step4FeeStatusComponent, Step4OrganisationPreviewComponent, Step4AuthorizedPersonPreviewComponent, Step4BankPreviewComponent, Step4DocumentsTableComponent],
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
        <button appButton variant="outline" size="lg" (click)="state.goToStep(3)">
          &larr; Back to Upload Documents
        </button>

        <button appButton size="lg" (click)="state.goToStep(5)" [disabled]="!state.declarationAgreed()">
          Proceed to EMD Fee Payment ({{ state.formattedEmdFee() }}) &rarr;
        </button>
      </div>

    </div>
  `
})
export class Step4CompletePreviewComponent {
  protected readonly state = inject(SchemeFormState);
}
