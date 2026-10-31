import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import type { SubmittedTender, TenderAppeal } from '../../../core/models/tender.model';
import { ActionModalComponent } from '../../../shared/components/action-modal/action-modal.component';
import { IconComponent, InputDirective } from '../../../shared';
import { formatDateMedium } from '../../../shared/utils';
import { buildAppeal } from './tender-appeal.util';

/**
 * Appeal request confirmation modal: confirms appeal against rejection and captures
 * the applicant's appeal remarks (no documents requested at this stage).
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
      [showAccentBar]="true"
      accentBarClass="bg-navy"
      title="Request for Appeal"
      primaryLabel="Confirm Appeal Request"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-2xl"
      [disablePrimary]="!canSubmit()"
      (primaryAction)="submit()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (tender(); as t) {
        <div class="space-y-4 text-left text-xs max-h-[62vh] overflow-y-auto pr-1">
          <!-- Confirmation Banner -->
          <div class="p-4 rounded-xl border border-amber-300 bg-amber-50/80 text-amber-950 space-y-2">
            <div class="flex items-start gap-2.5">
              <app-icon name="alert-triangle" size="sm" class="text-amber-600 mt-0.5 shrink-0" />
              <div class="space-y-1">
                <h4 class="m-0 text-[13px] font-bold text-amber-900">
                  Are you sure you want to request for an appeal?
                </h4>
                <p class="m-0 text-xs text-amber-800 leading-relaxed">
                  Your application <span class="font-semibold">{{ t.appRef }} &bull; {{ t.schemeTitle }}</span> was rejected with remarks:
                  <span class="font-semibold italic">"{{ t.rejectionReason || 'Technical qualification criteria not met.' }}"</span>
                </p>
                <p class="m-0 text-[11.5px] text-amber-700 leading-relaxed pt-1">
                  Once submitted, the department scrutiny committee will review your appeal. If accepted, the department may ask for shortfall documents to be uploaded.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-800" for="appeal-reply">
              Remarks <span class="text-rose-600">*</span>
            </label>
            <textarea
              appInput
              id="appeal-reply"
              rows="4"
              maxlength="1000"
              [value]="reply()"
              (input)="reply.set($any($event.target).value)"
              placeholder="Enter your remarks for the appeal request..."
              class="w-full"
            ></textarea>
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

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.submitted.emit(buildAppeal(this.reply().trim(), [], formatDateMedium(new Date(), '-')));
  }
}
