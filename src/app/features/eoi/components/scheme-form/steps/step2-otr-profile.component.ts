import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import { OtrReviewComponent } from '../../../../registration/parts/otr-review.component';
import { SchemeFormState } from '../scheme-form.state';
import { PROFILE_STEP_KEYS, stepDone } from '../eoi-apply.util';

/**
 * Step 1: Registration Profile. The backend copies the applicant's submitted One Time Registration into the
 * application (organisation, authorized person, bank details); it is shown read-only with the OTR form layout.
 */
@Component({
  selector: 'app-step2-otr-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, IconComponent, OtrReviewComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6">

      <div class="flex items-start sm:items-center gap-3 p-3.5 sm:p-4 bg-[#FCF8FA] border border-[#EADCE2] rounded-xl shadow-xs">
        <div class="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 bg-[#F8EDF1] text-[#7C0E44]">
          <app-icon name="lock" size="sm" [stroke]="2" />
        </div>
        <div class="min-w-0">
          <div class="text-xs sm:text-sm font-bold text-[#7C0E44] leading-tight">Registration Profile Verification</div>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            Profile details are taken from your One-Time Registration (OTR)
            @if (state.application()?.otrReferenceNo; as ref) { <span class="tabular-nums font-medium">({{ ref }})</span> }
            and are locked for this application. To change them, update your OTR.
          </p>
        </div>
      </div>

      @if (incomplete().length > 0) {
        <div class="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1" role="alert">
          <p class="m-0 font-semibold">Your OTR is missing: {{ incomplete().join(', ') }}.</p>
          <p class="m-0">Complete it in <a routerLink="/registration" class="font-semibold underline">One Time Registration</a>, then reopen this application.</p>
        </div>
      }

      @if (state.otrForm(); as form) {
        <app-otr-review
          [form]="form"
          [values]="state.profileValues()"
          [documents]="state.profileDocuments()"
          [readOnly]="true"
          (viewDocument)="state.viewProfileDocument($event)"
        />
      } @else {
        <p class="text-xs text-slate-500 italic m-0">The OTR form could not be loaded, so the profile cannot be shown. Reload the page to try again.</p>
      }

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

  /** OTR sections the backend did not find (they block submission). */
  protected readonly incomplete = computed(() => {
    const app = this.state.application();
    return (app?.steps ?? [])
      .filter(s => (PROFILE_STEP_KEYS as readonly string[]).includes(s.key) && !stepDone(app, s.key))
      .map(s => s.title);
  });
}
