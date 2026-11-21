import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../../shared';
import { SubmittedTender } from '../../../core/models/tender.model';
import { remainingEdits } from './tender-status.util';

@Component({
  selector: 'app-tender-edit-status',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (isEditing()) {
      <div class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs" role="alert">
        <app-icon name="info-circle" size="sm" class="text-amber-700 shrink-0" />
        <div class="flex items-center gap-1.5 min-w-0 flex-wrap leading-snug">
          <strong class="font-semibold text-amber-950 whitespace-nowrap">Document Replacement Active:</strong>
          <span class="text-amber-900">You can edit and replace only documents and PDFs. Organization and profile particulars are read-only.</span>
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