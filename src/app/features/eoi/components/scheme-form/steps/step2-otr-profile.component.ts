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

      <!-- 1. Company Particulars & Registration Details -->
      <app-step2-organisation />

      <!-- 2. Authorized Signatory Details -->
      <app-step2-authorized-person />

      <!-- 3. Bank Account Details -->
      <app-step2-bank-details />

      <!-- Footer Action Bar -->
      <!-- Forward only: the processing fee step is closed once paid -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          (click)="state.saveAndProceedToStep3()"
          class="px-6 sm:px-7 py-2.5 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
