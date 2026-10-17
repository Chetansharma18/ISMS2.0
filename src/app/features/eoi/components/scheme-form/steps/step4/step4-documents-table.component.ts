import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, TableColumn, TableComponent } from '../../../../../../shared';
import { EoiDocumentItem } from '../../scheme-form.model';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: read-only summary of the uploaded proposal documents. */
@Component({
  selector: 'app-step4-documents-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, TableComponent],
  host: { class: 'block' },
  template: `
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">5</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Documents ({{ state.attachedDocsCount() }} / {{ state.eoiDocuments().length }} Uploaded)</h2>
        </div>
        <button appButton variant="outline" size="sm" (click)="state.goToStep(3)">Edit Details</button>
      </div>

      <div class="p-4 sm:p-5">
        <app-table
          [columns]="documentColumns"
          [data]="state.eoiDocuments()"
          [customTemplates]="{ name: nameTemplate, status: statusTemplate, action: actionTemplate }"
        >
        </app-table>
      </div>

      <ng-template #nameTemplate let-doc>
        <span class="font-medium text-slate-900 text-[12.5px]">{{ doc.name }}</span>
        @if (doc.isMandatory) {
          <span class="text-rose-600 font-bold" title="Mandatory"> *</span>
        }
      </ng-template>

      <ng-template #statusTemplate let-doc>
        @if (doc.status === 'uploaded') {
          <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">Uploaded</span>
        } @else {
          <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">Not uploaded</span>
        }
      </ng-template>

      <ng-template #actionTemplate let-doc>
        @if (doc.status === 'uploaded') {
          <button appButton variant="ghost" size="sm" (click)="state.viewDoc(doc.fileName, doc.name, doc.fileSize)">View</button>
        }
      </ng-template>
    </section>
  `
})
export class Step4DocumentsTableComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly documentColumns: TableColumn<EoiDocumentItem>[] = [
    { key: 'id', label: '#', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Document Name', type: 'custom' },
    { key: 'fileName', label: 'File Name', cellClass: 'break-all' },
    { key: 'fileSize', label: 'Size', cellClass: 'whitespace-nowrap' },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center' }
  ];
}
