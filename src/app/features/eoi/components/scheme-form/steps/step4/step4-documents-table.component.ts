import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: read-only summary of the uploaded proposal documents. */
@Component({
  selector: 'app-step4-documents-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">5</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Documents ({{ state.attachedDocsCount() }} / {{ state.eoiDocuments().length }} Uploaded)</h2>
        </div>
        <button
          type="button"
          (click)="state.goToStep(3)"
          class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          Edit Details
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/90 text-slate-600 text-[11.5px] font-semibold border-b border-slate-200">
            <tr>
              <th class="px-3 py-2.5 w-10 text-center">#</th>
              <th class="px-3 py-2.5">Document Name</th>
              <th class="px-3 py-2.5">File Name</th>
              <th class="px-3 py-2.5">Size</th>
              <th class="px-3 py-2.5">Status</th>
              <th class="px-3 py-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="text-slate-700">
            @for (doc of state.eoiDocuments(); track doc.id) {
              <tr class="border-t border-slate-100 hover:bg-slate-50/50">
                <td class="px-3 py-2.5 text-center font-semibold text-slate-400">{{ doc.id }}</td>
                <td class="px-3 py-2.5 font-medium text-slate-900 text-[12.5px]">
                  {{ doc.name }}
                  @if (doc.isMandatory) {
                    <span class="text-rose-600 font-bold" title="Mandatory">*</span>
                  }
                </td>
                <td class="px-3 py-2.5 text-[12.5px] text-slate-700 break-all">{{ doc.fileName || '-' }}</td>
                <td class="px-3 py-2.5 text-[12.5px] text-slate-700 whitespace-nowrap">{{ doc.fileSize || '-' }}</td>
                <td class="px-3 py-2.5">
                  @if (doc.status === 'uploaded') {
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">Uploaded</span>
                  } @else {
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">Not uploaded</span>
                  }
                </td>
                <td class="px-3 py-2.5 text-center">
                  @if (doc.status === 'uploaded') {
                    <button
                      type="button"
                      (click)="state.viewDoc(doc.fileName, doc.name, doc.fileSize)"
                      class="text-ocean font-semibold text-xs hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class Step4DocumentsTableComponent {
  protected readonly state = inject(SchemeFormState);
}
