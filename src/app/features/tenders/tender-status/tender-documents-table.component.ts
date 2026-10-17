import { Component, input, output } from '@angular/core';
import { ButtonComponent, TableColumn, TableComponent } from '../../../shared';
import { SubmittedTenderDoc } from '../../../core/models/tender.model';
import { TenderDocViewRequest, TenderProposalDocReplaceRequest } from './tender-doc-card.component';
import { documentCategoryLabel } from './tender-status.util';

// Default change detection: the parent mutates the passed document rows in place when a file is replaced.
@Component({
  selector: 'app-tender-documents-table',
  standalone: true,
  imports: [TableComponent, ButtonComponent],
  host: { class: 'block' },
  template: `
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">4</span>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">Proposal Documents</h2>
          </div>

          <app-table
            [columns]="columns"
            [data]="documents()"
            [customTemplates]="{ action: actionTemplate }"
          />

          <ng-template #actionTemplate let-doc>
            <div class="flex items-center justify-center gap-1.5">
              <button
                appButton
                variant="outline"
                size="sm"
                type="button"
                (click)="viewDoc.emit({ fileName: doc.fileName, title: doc.name, fileSize: doc.fileSize })"
              >
                View
              </button>
              @if (isEditing()) {
                <label class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-brand rounded text-xs font-medium cursor-pointer">
                  Replace
                  <input type="file" (change)="replaceDoc.emit({ event: $event, doc })" class="hidden" accept=".pdf,.doc,.docx" />
                </label>
              }
            </div>
          </ng-template>
        </div>
  `
})
export class TenderDocumentsTableComponent {
  /** Parent-owned documents; rows are mutated in place by the container when replaced. */
  readonly documents = input.required<SubmittedTenderDoc[]>();
  readonly isEditing = input(false);

  readonly viewDoc = output<TenderDocViewRequest>();
  readonly replaceDoc = output<TenderProposalDocReplaceRequest>();

  protected readonly columns: TableColumn<SubmittedTenderDoc>[] = [
    { key: 'id', label: '#', align: 'center', width: 'w-10', cellClass: 'font-medium text-slate-400' },
    { key: 'name', label: 'Document Title', cellClass: 'font-medium text-slate-800' },
    {
      key: 'category',
      label: 'Category',
      cellClass: 'text-slate-600',
      format: (value: SubmittedTenderDoc['category']) => documentCategoryLabel(value)
    },
    {
      key: 'fileName',
      label: 'Attached File Name',
      cellClass: 'font-mono text-[11px] text-slate-600',
      format: (_value, doc) => `${doc.fileName} (${doc.fileSize})`
    },
    { key: 'action', label: 'Action', align: 'center', type: 'custom' }
  ];
}