import { Component, input, output } from '@angular/core';
import { SubmittedTenderDoc } from '../../../core/models/tender.model';
import { TenderDocViewRequest, TenderProposalDocReplaceRequest } from './tender-doc-card.component';
import { documentCategoryLabel } from './tender-status.util';

@Component({
  selector: 'app-tender-documents-table',
  standalone: true,
  host: { class: 'block' },
  template: `
        <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 class="font-semibold text-slate-900 text-sm">
              4. Mandated Proposal Documents &amp; Annexures (16 Files Attached)
            </h3>
            @if (isEditing()) {
              <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
            }
          </div>

          <div class="border border-slate-200 rounded-lg overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-muted font-semibold text-[11px] text-slate-600 border-b border-slate-200">
                <tr>
                  <th class="p-2.5 text-center w-10">#</th>
                  <th class="p-2.5">Document Title</th>
                  <th class="p-2.5">Category</th>
                  <th class="p-2.5">Attached File Name</th>
                  <th class="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (doc of documents(); track doc.id) {
                  <tr class="hover:bg-slate-50/70">
                    <td class="p-2.5 text-center font-medium text-slate-400">{{ doc.id }}</td>
                    <td class="p-2.5 font-medium text-slate-800">{{ doc.name }}</td>
                    <td class="p-2.5">
                      <span class="text-[10.5px] font-medium text-slate-600">
                        {{ categoryLabel(doc.category) }}
                      </span>
                    </td>
                    <td class="p-2.5 font-mono text-[11px] text-slate-600">
                      {{ doc.fileName }} ({{ doc.fileSize }})
                    </td>
                    <td class="p-2.5 text-center">
                      <div class="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          (click)="viewDoc.emit({ fileName: doc.fileName, title: doc.name, fileSize: doc.fileSize })"
                          class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer"
                        >
                          View
                        </button>
                        @if (isEditing()) {
                          <label class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-brand rounded text-xs font-medium cursor-pointer">
                            Replace
                            <input type="file" (change)="replaceDoc.emit({ event: $event, doc })" class="hidden" accept=".pdf" />
                          </label>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
  `
})
export class TenderDocumentsTableComponent {
  /** Parent-owned documents; rows are mutated in place by the container when replaced. */
  readonly documents = input.required<SubmittedTenderDoc[]>();
  readonly isEditing = input(false);

  readonly viewDoc = output<TenderDocViewRequest>();
  readonly replaceDoc = output<TenderProposalDocReplaceRequest>();

  protected readonly categoryLabel = documentCategoryLabel;
}