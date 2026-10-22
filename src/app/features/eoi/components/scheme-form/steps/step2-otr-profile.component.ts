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

      <!-- Profile Verification & Edit Mode Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs">
        <div class="flex items-start sm:items-center gap-3 min-w-0">
          <div class="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0" [class.bg-sky-100]="!state.isEditingStep2()" [class.text-navy]="!state.isEditingStep2()" [class.bg-amber-100]="state.isEditingStep2()" [class.text-amber-800]="state.isEditingStep2()">
            <app-icon [name]="state.isEditingStep2() ? 'edit' : 'lock'" size="sm" [stroke]="2" />
          </div>
          <div class="min-w-0">
            <div class="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Registration Profile Verification
            </div>
            <p class="text-xs text-slate-500 m-0 mt-0.5 truncate sm:whitespace-normal">
              {{ state.isEditingStep2()
                  ? 'Edit mode active: You can modify the fields below before proceeding.'
                  : 'Profile details are currently locked for verification. Click "Edit Details" to make changes.' }}
            </p>
          </div>
        </div>

        <button
          appButton
          [variant]="state.isEditingStep2() ? 'primary' : 'outline'"
          size="sm"
          type="button"
          (click)="state.toggleStep2Edit()"
          class="shrink-0"
        >
          <app-icon [name]="state.isEditingStep2() ? 'check' : 'edit'" size="sm" />
          <span>{{ state.isEditingStep2() ? 'Lock Details' : 'Edit Details' }}</span>
        </button>
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
        @if (state.isEditingStep2()) {
          <span class="text-xs text-amber-700 font-medium">
            &bull; Editing enabled for Registration Profile
          </span>
        } @else {
          <span class="text-xs text-slate-500">
            Verified from One-Time Registration
          </span>
        }

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
