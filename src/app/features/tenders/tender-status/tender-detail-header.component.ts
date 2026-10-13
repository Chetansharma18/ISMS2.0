import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { SubmittedTender } from '../../../core/models/tender.model';
import { canEditTender } from './tender-status.util';

@Component({
  selector: 'app-tender-detail-header',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="back.emit()"
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm sm:text-base font-bold text-brand">
                {{ tender().appRef }}
              </span>
              <span
                class="text-[11px] font-medium px-2.5 py-0.5 rounded"
                [ngClass]="{
                  'bg-emerald-50 text-emerald-800 border border-emerald-200': tender().submittedStatus === 'Accepted',
                  'bg-amber-50 text-amber-800 border border-amber-200': tender().submittedStatus === 'Under Review',
                  'bg-sky-50 text-sky-800 border border-sky-200': tender().submittedStatus === 'Submitted',
                  'bg-rose-50 text-rose-800 border border-rose-200': tender().submittedStatus === 'Rejected'
                }"
              >
                {{ tender().submittedStatus }}
              </span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                {{ tender().schemeCategory || 'GENERAL' }}
              </span>
            </div>
            <h2 class="text-sm sm:text-base font-semibold text-slate-800">
              {{ tender().schemeTitle }}
            </h2>
          </div>
        </div>

        <!-- Right Top Actions -->
        <div class="flex items-center gap-2 flex-wrap">
          @if (isEditing()) {
            <button
              type="button"
              (click)="save.emit()"
              class="px-4 py-2 bg-navy hover:bg-navy-dark text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes (Consumes 1 Edit)</span>
            </button>
            <button
              type="button"
              (click)="cancel.emit()"
              class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
          } @else {
            @if (canEdit(tender())) {
              <button
                type="button"
                (click)="edit.emit()"
                class="px-4 py-2 bg-navy hover:bg-navy-dark text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Application</span>
              </button>
            } @else if (tender().editCount >= 3) {
              <span class="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium select-none">
                Max 3/3 Edits Used (Locked)
              </span>
            } @else {
              <span class="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium select-none">
                Submission Closed
              </span>
            }

            <button
              type="button"
              (click)="print.emit()"
              class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print</span>
            </button>
          }
        </div>

      </div>
  `
})
export class TenderDetailHeaderComponent {
  readonly tender = input.required<SubmittedTender>();
  readonly isEditing = input(false);

  readonly back = output<void>();
  readonly edit = output<void>();
  readonly save = output<void>();
  readonly cancel = output<void>();
  readonly print = output<void>();

  protected readonly canEdit = canEditTender;
}