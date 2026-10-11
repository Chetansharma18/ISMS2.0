import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { SubmittedTender } from '../../../core/models/tender.model';
import { remainingEdits } from './tender-status.util';

@Component({
  selector: 'app-tender-edit-status',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  template: `
      <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs font-sans">
        <div class="flex items-center gap-2 flex-wrap text-slate-600">
          <span class="font-semibold text-slate-800">Edits Allowed:</span>
          <span>3 Edits Only</span>
          <span class="text-slate-300">&bull;</span>
          <span class="text-slate-500">Max 3 edit attempts allowed before closing date ({{ tender().closingDate }})</span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 text-slate-700 font-medium">
          <span [ngClass]="tender().editCount >= 3 ? 'text-rose-700 font-semibold' : 'text-slate-900 font-semibold'">
            {{ tender().editCount }} of 3 Used
          </span>
          <span class="text-slate-500">({{ remainingEdits(tender()) }} Remaining)</span>
        </div>
      </div>

      @if (isEditing()) {
        <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2 text-xs font-sans">
          <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="leading-relaxed">
            <span class="font-semibold block">You are currently editing this application:</span>
            <span class="text-slate-700">Saving changes will consume 1 edit attempt ({{ remainingEdits(tender()) }} remaining). You can edit up to 3 times before the closing date (<strong>{{ tender().closingDate }}</strong>).</span>
          </div>
        </div>
      }
  `
})
export class TenderEditStatusComponent {
  readonly tender = input.required<SubmittedTender>();
  readonly isEditing = input(false);

  protected readonly remainingEdits = remainingEdits;
}