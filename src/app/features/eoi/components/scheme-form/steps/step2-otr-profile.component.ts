import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { Step2OrganisationComponent } from './step2/step2-organisation.component';
import { Step2AuthorizedPersonComponent } from './step2/step2-authorized-person.component';
import { Step2BankDetailsComponent } from './step2/step2-bank-details.component';

/** Step 2: Registration Profile (verified organisation, signatory and bank details). */
@Component({
  selector: 'app-step2-otr-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, Step2OrganisationComponent, Step2AuthorizedPersonComponent, Step2BankDetailsComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">

      <!-- Profile Verification Banner (Read-only / Non-editable) -->
      <div class="flex items-start sm:items-center gap-3 p-3.5 sm:p-4 bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs">
        <div class="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 bg-sky-100 text-navy">
          <app-icon name="lock" size="sm" [stroke]="2" />
        </div>
        <div class="min-w-0">
          <div class="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
            Registration Profile Verification
          </div>
          <p class="text-xs text-slate-500 m-0 mt-0.5 truncate sm:whitespace-normal">
            Profile details are verified from your One-Time Registration (OTR) and are locked for this application.
          </p>
        </div>
      </div>

      <!-- 1. Company Particulars & Registration Details -->
      <app-step2-organisation />

      <!-- 2. Authorized Signatory Details -->
      <app-step2-authorized-person />

      <!-- 3. Bank Account Details -->
      <app-step2-bank-details />

      <!-- Footer Action Bar -->
      <!-- Forward only: the processing fee step is closed once paid -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-xs text-slate-500 flex items-center gap-1.5">
          <app-icon name="check-circle" size="xs" class="text-emerald-600" />
          Verified from One-Time Registration
        </span>

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
