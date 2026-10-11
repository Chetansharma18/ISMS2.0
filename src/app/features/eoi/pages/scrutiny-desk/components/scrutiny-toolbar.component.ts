import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/** Breadcrumb navigation and the back / reject / accept quick actions. */
@Component({
  selector: 'app-scrutiny-toolbar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">

      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-slate-500 font-normal" aria-label="Breadcrumb">
        <a routerLink="/" class="inline-flex items-center gap-1.5 text-slate-600 hover:text-navy transition-colors">
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Home</span>
        </a>
        <span class="text-slate-400">/</span>
        <a routerLink="/admin/eoi-view" class="text-slate-600 hover:text-navy transition-colors">EOI Responses</a>
        <span class="text-slate-400">/</span>
        <a [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']" class="text-slate-600 hover:text-navy transition-colors">Applicant Submissions</a>
        <span class="text-slate-400">/</span>
        <span class="text-slate-800 font-medium">Application Review</span>
      </nav>

      <!-- Right Quick Actions -->
      <div class="flex items-center gap-2.5">
        <a
          [routerLink]="['/admin/responses', applicant()?.schemeId || 'ALL']"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all cursor-pointer shadow-2xs"
        >
          <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Submissions</span>
        </a>

        <!-- Reject Action -->
        <button
          type="button"
          (click)="reject.emit()"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium transition-all cursor-pointer shadow-2xs"
        >
          <span>&times;</span>
          <span>Reject Application</span>
        </button>

        <!-- Accept Action -->
        <button
          type="button"
          (click)="accept.emit()"
          class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-medium transition-all cursor-pointer shadow-2xs"
          style="color: #ffffff !important;"
        >
          <span>&check;</span>
          <span style="color: #ffffff !important;">Accept Application</span>
        </button>
      </div>

    </div>
  `
})
export class ScrutinyToolbarComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly reject = output<void>();
  readonly accept = output<void>();
}
