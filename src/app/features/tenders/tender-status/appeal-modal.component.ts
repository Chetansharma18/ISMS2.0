import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import type { SubmittedTender, TenderAppeal } from '../../../core/models/tender.model';
import { ActionModalComponent } from '../../../shared/components/action-modal/action-modal.component';
import { IconComponent, InputDirective } from '../../../shared';
import { formatDateMedium } from '../../../shared/utils';
import { buildAppeal, getAppealDeadline } from './tender-appeal.util';

/**
 * Appeal request modal:
 * Text-only appeal submission within the 7-day window.
 * Available only when application is Approved or Rejected.
 */
@Component({
  selector: 'app-appeal-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent, IconComponent, InputDirective],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      [reverseButtons]="true"
      [showAccentBar]="false"
      accentBarClass="bg-navy"
      title="Submit Appeal Request"
      primaryLabel="Submit Appeal"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-xl"
      [disablePrimary]="!canSubmit()"
      (primaryAction)="submit()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (tender(); as t) {
        <div class="space-y-4 text-left text-xs max-h-[62vh] overflow-y-auto pr-1">

          <!-- 1. Grounds & 7-Day Window Context Banner -->
          @if (t.submittedStatus === 'Approved' || t.submittedStatus === 'Accepted') {
            <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 space-y-2">
              <div class="flex items-start gap-2.5">
                <app-icon name="check" size="sm" class="text-emerald-700 mt-0.5 shrink-0" />
                <div class="space-y-1">
                  <h4 class="m-0 text-[13px] font-bold text-emerald-900">
                    Appeal on Approved Proposal & Terms
                  </h4>
                  <p class="m-0 text-xs text-emerald-800 leading-relaxed">
                    Your application <span class="font-semibold">{{ t.appRef }} &bull; {{ t.schemeTitle }}</span> has been approved. You may submit an appeal regarding approved terms, allocated targets, sectors, or conditional remarks:
                  </p>
                  <p class="m-0 text-xs text-emerald-950 font-semibold italic bg-white/90 p-2.5 rounded border border-emerald-200">
                    "{{ t.scrutinyRemarks || 'Application proposal meets qualification criteria.' }}"
                  </p>
                  <p class="m-0 text-[11.5px] text-emerald-700 leading-relaxed pt-0.5 font-medium">
                    &bull; Appeal button is available for 7 days only from decision date (Deadline: <strong>{{ deadline(t) }}</strong>). Exactly one appeal is permitted per application.
                  </p>
                </div>
              </div>
            </div>
          } @else {
            <div class="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-950 space-y-2">
              <div class="flex items-start gap-2.5">
                <app-icon name="alert-triangle" size="sm" class="text-rose-600 mt-0.5 shrink-0" />
                <div class="space-y-1">
                  <h4 class="m-0 text-[13px] font-bold text-rose-900">
                    Rejection Grounds & 7-Day Appeal Window
                  </h4>
                  <p class="m-0 text-xs text-rose-800 leading-relaxed">
                    Your application <span class="font-semibold">{{ t.appRef }} &bull; {{ t.schemeTitle }}</span> was rejected with remarks:
                  </p>
                  <p class="m-0 text-xs text-rose-950 font-semibold italic bg-white/90 p-2.5 rounded border border-rose-200">
                    "{{ t.rejectionReason || 'Technical qualification criteria not met.' }}"
                  </p>
                  <p class="m-0 text-[11.5px] text-rose-700 leading-relaxed pt-0.5 font-medium">
                    &bull; The appeal button is active for 7 days only from decision date (Deadline: <strong>{{ deadline(t) }}</strong>). Once submitted, the department scrutiny committee will review your appeal remarks.
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- 2. Applicant Appeal Remarks (Text Box Only) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-slate-800" for="appeal-reply">
                Appeal Remarks / Justification <span class="text-rose-600">*</span>
              </label>
              <span class="text-[11px] text-slate-400 tabular-nums">{{ reply().length }}/1000</span>
            </div>
            <textarea
              appInput
              id="appeal-reply"
              rows="5"
              maxlength="1000"
              [value]="reply()"
              (input)="reply.set($any($event.target).value)"
              [placeholder]="t.submittedStatus === 'Approved' || t.submittedStatus === 'Accepted' ? 'Enter your reasons or request for appeal regarding approved terms, targets or remarks...' : 'Enter your justification or explanation for appeal against the rejection remarks...'"
              class="w-full text-xs"
            ></textarea>
            <p class="text-[11px] text-slate-500 m-0 leading-normal">
              Enter your detailed justification. No document upload is required; the department scrutiny committee will review this statement directly.
            </p>
          </div>

        </div>
      }
    </app-action-modal>
  `
})
export class AppealModalComponent {
  readonly isOpen = input(false);
  readonly tender = input<SubmittedTender | null>(null);

  readonly submitted = output<TenderAppeal>();
  readonly close = output<void>();

  protected readonly reply = signal('');

  protected readonly canSubmit = computed(() => !!this.tender() && this.reply().trim().length > 0);

  constructor() {
    // Reset remark on open
    effect(() => {
      this.tender();
      this.reply.set('');
    });
  }

  protected deadline(tender: SubmittedTender): string {
    return getAppealDeadline(tender);
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.submitted.emit(buildAppeal(this.reply().trim(), formatDateMedium(new Date(), '-')));
  }
}
