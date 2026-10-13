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
      <!-- 1. TOP CONTROLS & NAVIGATION BAR -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
        
        <!-- Back Button -->
        <button
          type="button"
          (click)="back.emit()"
          class="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Back to Tender Status List"
        >
          <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <!-- Right Action Buttons -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
          @if (isEditing()) {
            <button
              type="button"
              (click)="cancel.emit()"
              class="inline-flex items-center justify-center px-3.5 py-2 sm:py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md font-medium text-xs sm:text-[13px] cursor-pointer transition-all shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="save.emit()"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 bg-navy hover:bg-[#07243c] text-white rounded-md font-medium text-xs sm:text-[13px] cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes (Consumes 1 Edit)</span>
            </button>
          } @else {
            <button
              type="button"
              (click)="print.emit()"
              class="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-navy text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Print Application"
            >
              <svg class="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Application</span>
            </button>

            @if (canEdit(tender())) {
              <button
                type="button"
                (click)="edit.emit()"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Application</span>
              </button>
            } @else if (tender().editCount >= 3) {
              <span class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold select-none">
                Max 3/3 Edits Used (Locked)
              </span>
            } @else {
              <span class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold select-none">
                Submission Closed
              </span>
            }
          }
        </div>

      </div>

      <!-- 2. SCHEME TITLE & DESCRIPTION -->
      <div class="mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {{ tender().schemeTitle || tender().schemeName }}
        </h1>
        <p class="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
          Expression of Interest for submission of proposal to undertake the Skill Training under {{ tender().schemeName }} Scheme
        </p>
      </div>

      <!-- 3. METADATA STATS BAR WITH VERTICAL DIVIDERS -->
      <div class="mt-4 pt-3 pb-3 border-t border-b border-slate-200">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          
          <div class="pr-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">EOI Reference No.</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1 break-all">{{ tender().appRef }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Scheme Name</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ tender().schemeName }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Scheme Category</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ tender().schemeCategory || 'ALL' }}</span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Submission Status</span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mt-1"
              [ngClass]="{
                'bg-emerald-50 text-emerald-800 border border-emerald-200': tender().submittedStatus === 'Approved' || tender().submittedStatus === 'Accepted',
                'bg-amber-50 text-amber-800 border border-amber-200': tender().submittedStatus === 'Under Review',
                'bg-sky-50 text-sky-800 border border-sky-200': tender().submittedStatus === 'Submitted',
                'bg-rose-50 text-rose-800 border border-rose-200': tender().submittedStatus === 'Rejected'
              }"
            >
              <span class="w-1.5 h-1.5 rounded-full"
                [ngClass]="{
                  'bg-emerald-600': tender().submittedStatus === 'Approved' || tender().submittedStatus === 'Accepted',
                  'bg-amber-600': tender().submittedStatus === 'Under Review',
                  'bg-sky-600': tender().submittedStatus === 'Submitted',
                  'bg-rose-600': tender().submittedStatus === 'Rejected'
                }"
              ></span>
              {{ tender().submittedStatus }}
            </span>
          </div>

          <div class="px-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Date of Submission</span>
            <span class="text-xs sm:text-[12.5px] font-medium text-slate-900 block mt-1">{{ tender().appliedDate }}</span>
          </div>

          <div class="pl-3 py-1 sm:py-0">
            <span class="text-[11px] text-slate-500 block leading-tight">Last Date of EOI Submission</span>
            <span class="text-xs sm:text-[12.5px] font-bold text-red-600 block mt-1">{{ tender().closingDate }}</span>
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