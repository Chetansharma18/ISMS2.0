import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonComponent, IconComponent } from '../../../shared';
import { SubmittedTender } from '../../../core/models/tender.model';
import { canEditTender } from './tender-status.util';

/** Top of the application detail page: back button, title, actions and the application summary. */
@Component({
  selector: 'app-tender-detail-header',
  standalone: true,
  imports: [NgClass, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-3">
      <div>
        <button appButton variant="outline" size="sm" type="button" (click)="back.emit()" title="Back to Tender Status">
          <app-icon name="back" />
          <span>Back</span>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">Application Details</h1>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          @if (isEditing()) {
            <button appButton variant="outline" size="sm" type="button" (click)="cancel.emit()">
              Cancel
            </button>
            <button appButton size="sm" type="button" (click)="save.emit()">
              <span>Save Changes</span>
            </button>
          } @else {
            <button appButton variant="outline" size="sm" type="button" (click)="print.emit()" title="Print Application">
              <app-icon name="print-simple" [stroke]="2" class="text-slate-600" />
              <span>Print</span>
            </button>

            @if (canEdit(tender())) {
              <button appButton size="sm" type="button" (click)="edit.emit()">
                <span>Edit Application</span>
              </button>
            } @else if (tender().editCount >= 3) {
              <span class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold select-none">
                All 3 edits used
              </span>
            } @else {
              <span class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold select-none">
                Submission closed
              </span>
            }
          }
        </div>
      </div>

      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
        {{ tender().schemeTitle || tender().schemeName }}
      </p>
    </div>

    <!-- Application summary -->
    <div class="mt-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 text-xs">
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">EOI Reference No.</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1 break-all tabular-nums">{{ tender().appRef }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Scheme</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ tender().schemeName }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Scheme Category</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ tender().schemeCategory || 'ALL' }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Status</span>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mt-1"
            [ngClass]="{
              'bg-sky-50 text-navy border border-sky-200': tender().submittedStatus === 'Approved' || tender().submittedStatus === 'Accepted',
              'bg-amber-50 text-amber-800 border border-amber-200': tender().submittedStatus === 'Under Review',
              'bg-slate-100 text-slate-700 border border-slate-200': tender().submittedStatus === 'Submitted',
              'bg-rose-50 text-rose-800 border border-rose-200': tender().submittedStatus === 'Rejected'
            }"
          >
            {{ tender().submittedStatus }}
          </span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Submitted On</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ tender().appliedDate }}</span>
        </div>
        <div>
          <span class="text-[11.5px] text-slate-500 block leading-tight">Last Date of Submission</span>
          <span class="text-[12.5px] font-medium text-slate-900 block mt-1">{{ tender().closingDate }}</span>
        </div>
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
