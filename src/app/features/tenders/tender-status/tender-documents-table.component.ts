import { Component, computed, input, output } from '@angular/core';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../shared';
import { SubmittedTenderDoc } from '../../../core/models/tender.model';
import { TenderDocViewRequest, TenderProposalDocReplaceRequest } from './tender-doc-card.component';
import { documentCategoryLabel } from './tender-status.util';

// Default change detection: the parent mutates the passed document rows in place when a file is replaced.
@Component({
  selector: 'app-tender-documents-table',
  standalone: true,
  imports: [TableComponent, ButtonComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6">

      <!-- 1. ANNEXURES TABLE -->
      @if (annexureDocs().length > 0) {
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">4.1</span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">Annexures</h2>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {{ annexureDocs().length }} Files
            </span>
          </div>

          <app-table
            [columns]="annexureColumns"
            [data]="annexureDocs()"
            [customTemplates]="{ fileName: fileNameTemplate, comment: commentTemplate, action: actionTemplate }"
          />
        </div>
      }

      <!-- 2. SUPPORTING DOCUMENTS TABLE -->
      @if (supportingDocs().length > 0) {
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">4.2</span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">Supporting Documents</h2>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {{ supportingDocs().length }} Files
            </span>
          </div>

          <app-table
            [columns]="supportingColumns"
            [data]="supportingDocs()"
            [customTemplates]="{ fileName: fileNameTemplate, comment: commentTemplate, action: actionTemplate }"
          />
        </div>
      }

      <ng-template #fileNameTemplate let-doc>
        <div class="flex items-center gap-2 min-w-0">
          <app-icon name="pdf-badge" solid size="auto" class="w-4.5 h-4.5 text-[#E5252A] select-none shrink-0" />
          <span class="tabular-nums text-[11px] text-slate-700 truncate" [title]="doc.fileName">{{ doc.fileName }} ({{ doc.fileSize }})</span>
        </div>
      </ng-template>

      <ng-template #commentTemplate let-doc>
        @if (doc.comment) {
          <span class="text-[12px] text-[#25212A] whitespace-pre-wrap break-words block max-w-[240px]">{{ doc.comment }}</span>
        } @else {
          <span class="text-slate-400 text-xs">—</span>
        }
      </ng-template>

      <ng-template #actionTemplate let-doc>
        <div class="flex items-center justify-center gap-1.5 flex-nowrap whitespace-nowrap">
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="viewDoc.emit({ fileName: doc.fileName, title: doc.name, fileSize: doc.fileSize })"
            title="View Document"
            aria-label="View Document"
          >
            <app-icon name="eye" size="sm" />
          </button>
          @if (isEditing()) {
            <button
              appButton
              variant="secondary"
              size="sm"
              type="button"
              (click)="replaceFileInput.click()"
            >
              Replace
            </button>
            <input #replaceFileInput type="file" (change)="replaceDoc.emit({ event: $event, doc })" class="hidden" accept=".pdf,.doc,.docx" />
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

  private isAnnexureDoc(doc: SubmittedTenderDoc): boolean {
    return doc.category === 'annexure' || doc.name.toLowerCase().startsWith('annexure');
  }

  private extractAnnexureNum(name: string): number {
    const match = name.match(/annexure[- ]?(\d+)/i);
    return match ? parseInt(match[1], 10) : 999;
  }

  readonly annexureDocs = computed(() => {
    return this.documents()
      .filter(d => this.isAnnexureDoc(d))
      .sort((a, b) => this.extractAnnexureNum(a.name) - this.extractAnnexureNum(b.name));
  });

  readonly supportingDocs = computed(() => {
    return this.documents().filter(d => !this.isAnnexureDoc(d));
  });

  protected readonly annexureColumns: TableColumn<SubmittedTenderDoc>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10', cellClass: 'font-medium text-slate-400' },
    { key: 'name', label: 'Document Title', cellClass: 'font-medium text-slate-800' },
    {
      key: 'category',
      label: 'Category',
      cellClass: 'text-slate-600',
      format: () => 'Scheme Annexure'
    },
    { key: 'fileName', label: 'Attached File Name', type: 'custom' },
    { key: 'comment', label: 'Comment', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', type: 'custom' }
  ];

  protected readonly supportingColumns: TableColumn<SubmittedTenderDoc>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10', cellClass: 'font-medium text-slate-400' },
    { key: 'name', label: 'Document Title', cellClass: 'font-medium text-slate-800' },
    {
      key: 'category',
      label: 'Category',
      cellClass: 'text-slate-600',
      format: (value: SubmittedTenderDoc['category']) => documentCategoryLabel(value)
    },
    { key: 'fileName', label: 'Attached File Name', type: 'custom' },
    { key: 'comment', label: 'Comment', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', type: 'custom' }
  ];

  protected readonly columns = this.supportingColumns;
}
