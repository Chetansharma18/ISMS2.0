import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { Step2OrganisationComponent } from './step2/step2-organisation.component';
import { Step2AuthorizedPersonComponent } from './step2/step2-authorized-person.component';
import { Step2BankDetailsComponent } from './step2/step2-bank-details.component';

/** Step 1: Registration Profile (verified organisation, signatory and bank details). */
@Component({
  selector: 'app-step2-otr-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, Step2OrganisationComponent, Step2AuthorizedPersonComponent, Step2BankDetailsComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">

      <!-- Profile Verification Banner (Read-only / Non-editable) -->
      <div class="flex items-start sm:items-center gap-3 p-3.5 sm:p-4 bg-[#FCF8FA] border border-[#EADCE2] rounded-xl shadow-xs">
        <div class="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 bg-[#F8EDF1] text-[#7C0E44]">
          <app-icon name="lock" size="sm" [stroke]="2" />
        </div>
        <div class="min-w-0">
          <div class="text-xs sm:text-sm font-bold text-[#7C0E44] leading-tight">
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
      <div class="pt-4 border-t border-[#EADCE2] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-xs text-slate-500 flex items-center gap-1.5">
          <app-icon name="check-circle" size="xs" class="text-emerald-600" />
          Verified from One-Time Registration
        </span>

        <button appButton size="lg" (click)="state.saveAndProceedToDocuments()">
          {{ state.hasCustomFields() ? 'Proceed to Scheme Proposal Details \u2192' : 'Proceed to Upload Documents \u2192' }}
        </button>
      </div>

    </div>
  `
})
export class Step2OtrProfileComponent {
  protected readonly state = inject(SchemeFormState);
}
