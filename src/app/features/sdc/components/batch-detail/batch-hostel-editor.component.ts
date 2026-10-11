import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createHostelRow } from './batch-detail.util';

/** Editable hostel rows. Mutates the supplied array in place (it belongs to the parent edit model). */
@Component({
  selector: 'app-batch-hostel-editor',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <!-- Hostel Details Editable Table -->
    <div class="space-y-2.5 pt-3 border-t border-slate-200">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <label class="block font-semibold text-slate-800 text-xs uppercase tracking-wider m-0">
          Hostel Details (Residential facility configuration)
        </label>
        <button
          type="button"
          (click)="addHostelRow()"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <span>+ Add Hostel</span>
        </button>
      </div>

      <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <th class="py-2 px-3 w-12 text-center">#</th>
              <th class="py-2 px-3 min-w-65">Hostel Address</th>
              <th class="py-2 px-3 min-w-35">Hostel Code</th>
              <th class="py-2 px-3 min-w-35">Type</th>
              <th class="py-2 px-3 w-28">Capacity</th>
              <th class="py-2 px-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (hostel of rows(); track $index; let i = $index) {
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                <td class="py-2 px-3">
                  <input
                    type="text"
                    [(ngModel)]="hostel.hostelAddress"
                    placeholder="Plot / Campus Address"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td class="py-2 px-3">
                  <input
                    type="text"
                    [(ngModel)]="hostel.hostelCode"
                    placeholder="HST-JP-001"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td class="py-2 px-3">
                  <select
                    [(ngModel)]="hostel.type"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-ed">Co-ed</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </td>
                <td class="py-2 px-3">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    [(ngModel)]="hostel.capacity"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td class="py-2 px-3 text-center">
                  <button
                    type="button"
                    (click)="removeHostelRow(i)"
                    class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remove Hostel"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class BatchHostelEditorComponent {
  readonly rows = input.required<any[]>();

  addHostelRow(): void {
    this.rows().push(createHostelRow());
  }

  removeHostelRow(index: number): void {
    this.rows().splice(index, 1);
  }
}