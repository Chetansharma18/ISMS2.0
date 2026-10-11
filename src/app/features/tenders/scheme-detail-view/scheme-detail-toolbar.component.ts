import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Top controls of the scheme detail screen: back, download details and apply / closed state. */
@Component({
  selector: 'app-scheme-detail-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
      
      <!-- Back to Active Schemes Button -->
      <button
        type="button"
        (click)="back.emit()"
        class="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
        title="Back to Active Schemes"
      >
        <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Active Schemes</span>
      </button>

      <!-- Right Action Buttons -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
        <!-- Download Scheme Details Button -->
        <button
          type="button"
          (click)="downloadDetails.emit()"
          class="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-navy text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Download Scheme Details PDF"
        >
          <svg class="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Scheme Details</span>
        </button>

        <!-- Apply for EOI Button -->
        @if (!hideApplyButton()) {
          @if (!isClosed()) {
            <button
              type="button"
              (click)="apply.emit()"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs sm:text-[13px] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span>Apply for EOI</span>
              <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          } @else {
            <span class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold select-none">
              Submission Closed
            </span>
          }
        }
      </div>

    </div>
  `
})
export class SchemeDetailToolbarComponent {
  readonly isClosed = input(false);
  readonly hideApplyButton = input(false);

  readonly back = output<void>();
  readonly downloadDetails = output<void>();
  readonly apply = output<void>();
}
