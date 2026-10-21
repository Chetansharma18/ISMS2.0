import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../../shared';
import { SubmittedTender } from '../../../core/models/tender.model';
import { remainingEdits } from './tender-status.util';

@Component({
  selector: 'app-tender-edit-status',
  standalone: true,
  imports: [NgClass, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  template: `
      <div class="p-3 bg-amber-50/90 border border-amber-300 rounded-lg flex items-center justify-between gap-3 text-xs font-sans text-amber-950 shadow-2xs">
        <div class="flex items-center gap-2 flex-wrap text-amber-900">
          <span class="font-bold text-amber-950">Edits Allowed:</span>
          <span class="font-semibold text-amber-900">3 Edits Only</span>
          <span class="text-amber-400">&bull;</span>
          <span class="text-amber-800">Max 3 edit attempts allowed before closing date ({{ tender().closingDate }})</span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 font-medium">
          <span [ngClass]="tender().editCount >= 3 ? 'text-rose-700 font-bold' : 'text-amber-950 font-bold'">
            {{ tender().editCount }} of 3 Used
          </span>
          <span class="text-amber-800">({{ remainingEdits(tender()) }} Remaining)</span>
        </div>
      </div>

      @if (isEditing()) {
        <div class="p-3 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-950 flex items-start gap-2.5 text-xs font-sans">
          <app-icon name="info-circle" [stroke]="2" class="text-amber-700 shrink-0 mt-0.5" />
          <div class="leading-relaxed">
            <span class="font-bold text-amber-950 block">Document Replacement Active:</span>
            <span class="text-amber-900">You can edit and replace <strong>only documents and PDFs</strong>. Organization and profile particulars are verified and read-only. Saving replacements will consume 1 edit attempt ({{ remainingEdits(tender()) }} remaining before <strong>{{ tender().closingDate }}</strong>).</span>
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