import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../scheme-form.state';
import { Step2OrganisationComponent } from './step2/step2-organisation.component';
import { Step2AuthorizedPersonComponent } from './step2/step2-authorized-person.component';
import { Step2BankDetailsComponent } from './step2/step2-bank-details.component';

/** Step 2: OTR profile (editable organisation, signatory and bank details). */
@Component({
  selector: 'app-step2-otr-profile',
  standalone: true,
  imports: [Step2OrganisationComponent, Step2AuthorizedPersonComponent, Step2BankDetailsComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">

      <!-- Single Page Container for OTR Profile in 3 Structured Boxes -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-10">

        <!-- ================================================================
             1. Company Particulars & Registration Details
             ================================================================ -->
        <app-step2-organisation />

        <!-- ================================================================
             2. Authorized Signatory / Person Details
             ================================================================ -->
        <app-step2-authorized-person />

        <!-- ================================================================
             3. Bank Account Details
             ================================================================ -->
        <app-step2-bank-details />

      </div>

      <!-- Footer Action Bar -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
        <button
          type="button"
          (click)="state.goToStep(1)"
          class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
        >
          &larr; Back to Processing Fee
        </button>

        <button
          type="button"
          (click)="state.saveAndProceedToStep3()"
          class="px-6 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Proceed to Upload Documents &rarr;
        </button>
      </div>

    </div>
  `
})
export class Step2OtrProfileComponent {
  protected readonly state = inject(SchemeFormState);
}
