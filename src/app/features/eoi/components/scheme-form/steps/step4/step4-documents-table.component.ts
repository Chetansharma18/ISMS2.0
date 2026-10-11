import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: uploaded documents status table. */
@Component({
  selector: 'app-step4-documents-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    <div class="space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200 flex-wrap gap-2">
        <span class="font-bold text-navy uppercase tracking-wider text-[11px]">3. Uploaded Proposal Documents ({{ state.attachedDocsCount() }} / 16 Attached)</span>
        <button
          type="button"
          (click)="state.attachAllSampleDocs()"
          class="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md font-semibold text-xs cursor-pointer shadow-2xs"
        >
          Attach All Mandated Annexures
        </button>
      </div>

      <div class="border border-slate-200 rounded-xl overflow-hidden">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 text-slate-600 font-bold text-[10.5px] uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="p-2.5 w-10 text-center">#</th>
              <th class="p-2.5">Document Title</th>
              <th class="p-2.5">Classification</th>
              <th class="p-2.5">Attached File</th>
              <th class="p-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            @for (doc of state.eoiDocuments(); track doc.id) {
              <tr class="hover:bg-slate-50/50">
                <td class="p-2.5 text-center font-bold text-slate-400">{{ doc.id }}</td>
                <td class="p-2.5 font-semibold text-slate-800">{{ doc.name }}</td>
                <td class="p-2.5">
                  <span class="text-[10px] px-2 py-0.5 rounded font-semibold"
                    [ngClass]="{
                      'bg-rose-50 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                      'bg-sky-50 text-sky-700 border border-sky-200': doc.category === 'annexure',
                      'bg-slate-100 text-slate-600': doc.category === 'remaining'
                    }">
                    {{ doc.category === 'mandatory' ? 'Mandatory Statutory' : (doc.category === 'annexure' ? 'Scheme Annexure' : 'Supporting') }}
                  </span>
                </td>
                <td class="p-2.5 font-mono text-[11.5px] text-slate-600">
                  {{ doc.fileName ? (doc.fileName + ' (' + doc.fileSize + ')') : '-' }}
                </td>
                <td class="p-2.5 text-center">
                  @if (doc.status === 'uploaded') {
                    <div class="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        (click)="state.viewDoc(doc.fileName, doc.name, doc.fileSize)"
                        class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10.5px] font-medium cursor-pointer"
                      >
                        View
                      </button>
                      <label class="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-ocean rounded text-[10.5px] font-medium cursor-pointer">
                        Replace
                        <input type="file" (change)="state.onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                      </label>
                    </div>
                  } @else {
                    <label class="px-2.5 py-0.5 bg-navy hover:bg-navy-dark text-white rounded text-[10.5px] font-semibold cursor-pointer shadow-2xs">
                      Upload PDF
                      <input type="file" (change)="state.onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                    </label>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class Step4DocumentsTableComponent {
  protected readonly state = inject(SchemeFormState);
}
