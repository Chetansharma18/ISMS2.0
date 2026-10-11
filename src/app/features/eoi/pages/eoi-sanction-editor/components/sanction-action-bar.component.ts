import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PageHeaderComponent } from '../../../../../shared';

/** Top action bar of the sanction order editor: page header, save / print actions and status banner. */
@Component({
  selector: 'app-sanction-action-bar',
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="p-4 sm:p-5 print:hidden space-y-4 max-w-5xl mx-auto font-sans">
      <app-page-header
        title="Editable Sanction Order PDF Editor"
        [breadcrumbs]="[
          { label: 'Home', url: '/' },
          { label: 'EOI Responses', url: '/admin/eoi-view' },
          { label: 'Applicant Submissions', url: '/admin/responses/' + schemeId() },
          { label: 'Sanction Order PDF Editor' }
        ]"
        [backUrl]="'/admin/responses/' + schemeId()"
        backTitle="Back to Applicant Submissions"
      >
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="save.emit()"
            class="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ isSubmitted() ? '✓ Submitted' : 'Auto-Save &amp; Finalize' }}</span>
          </button>

          <button
            type="button"
            (click)="print.emit()"
            class="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print / Export PDF</span>
          </button>
        </div>
      </app-page-header>

      <!-- Notification Banner -->
      @if (savedNotification()) {
        <div class="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center justify-between animate-fade-in shadow-xs">
          <span class="font-semibold flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Sanction Order Submitted &amp; Saved Successfully! Redirecting to EOI Responses...
          </span>
          <span class="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Submitted</span>
        </div>
      } @else {
        <div class="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
          <span>&check; <strong>Live PDF Editor Mode (sanctionorder2.pdf format):</strong> Click any text, date, reference number, allocated target row, or clause below to edit directly before saving or exporting.</span>
          <span class="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">RSLDC Official Letterhead Format</span>
        </div>
      }
    </div>
  `
})
export class SanctionActionBarComponent {
  readonly schemeId = input<string>('');
  readonly isSubmitted = input<boolean>(false);
  readonly savedNotification = input<boolean>(false);
  readonly save = output<void>();
  readonly print = output<void>();
}
