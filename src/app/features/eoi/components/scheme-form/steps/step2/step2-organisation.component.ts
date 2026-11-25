import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';
import { Step1OrgDetailsComponent } from '../../../../../registration/steps/step1-org-details/step1-org-details.component';

/**
 * Step 2: Company Particulars & Registration Details
 *
 * Centralized: Embeds the single, canonical Step1OrgDetailsComponent across the application.
 * All controls are locked until Step 2 edit mode is toggled on.
 */
@Component({
  selector: 'app-step2-organisation',
  standalone: true,
  imports: [Step1OrgDetailsComponent],
  host: { class: 'block' },
  template: `
    <section class="border border-[#EADCE2] rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-white px-5 py-3.5 border-b border-[#EADCE2] flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <h2 class="text-base sm:text-[17px] font-semibold text-[#7C0E44] m-0">Company Particulars &amp; Registration Details</h2>
        </div>
        <span class="text-xs text-slate-500 tabular-nums font-semibold truncate">CIN: {{ state.editableStep1.registrationNumber || '-' }}</span>
      </div>

      <div class="p-5 sm:p-6 w-full font-sans">
        <app-step1-org-details [disabled]="!state.isEditingStep2()" />
      </div>
    </section>
  `
})
export class Step2OrganisationComponent {
  protected readonly state = inject(SchemeFormState);
}
