import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { Step2OrganisationComponent } from './step2/step2-organisation.component';
import { Step2AuthorizedPersonComponent } from './step2/step2-authorized-person.component';
import { Step2BankDetailsComponent } from './step2/step2-bank-details.component';

/** Step 2: OTR profile (editable organisation, signatory and bank details). */
@Component({
  selector: 'app-step2-otr-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, Step2OrganisationComponent, Step2AuthorizedPersonComponent, Step2BankDetailsComponent],
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
        <button appButton size="lg" (click)="state.saveAndProceedToStep3()">
          Proceed to Upload Documents &rarr;
        </button>
      </div>

    </div>
  `
})
export class Step2OtrProfileComponent {
  protected readonly state = inject(SchemeFormState);
}
