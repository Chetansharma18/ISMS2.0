import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createFacultyRow } from './batch-detail.util';

/** Editable faculty rows. Mutates the supplied array in place (it belongs to the parent edit model). */
@Component({
  selector: 'app-batch-faculty-editor',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <!-- Faculty Details Editable Table -->
    <div class="space-y-2.5 pt-3 border-t border-slate-200">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <label class="block font-semibold text-slate-800 text-xs uppercase tracking-wider m-0">
          Faculty Details ({{ rows().length }} Trainers)
        </label>
        <button
          type="button"
          (click)="addFacultyRow()"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <span>+ Add Faculty</span>
        </button>
      </div>

      <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <th class="py-2 px-3 w-12 text-center">#</th>
              <th class="py-2 px-3 min-w-50">Faculty Name <span class="text-rose-500">*</span></th>
              <th class="py-2 px-3 min-w-45">Trainer Type <span class="text-rose-500">*</span></th>
              <th class="py-2 px-3 min-w-55">Qualification / Experience <span class="text-rose-500">*</span></th>
              <th class="py-2 px-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (fac of rows(); track $index; let i = $index) {
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                <td class="py-2 px-3">
                  <input
                    type="text"
                    [(ngModel)]="fac.facultyName"
                    placeholder="Faculty Name"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </td>
                <td class="py-2 px-3">
                  <select
                    [(ngModel)]="fac.trainerType"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Primary Trainer">Primary Trainer</option>
                    <option value="Assistant Trainer">Assistant Trainer</option>
                    <option value="Domain Trainer">Domain Trainer</option>
                    <option value="Master Trainer">Master Trainer</option>
                  </select>
                </td>
                <td class="py-2 px-3">
                  <select
                    [(ngModel)]="fac.qualification"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
                    <option value="Post Graduate (M.A / M.Sc / M.Tech)">Post Graduate (M.A / M.Sc / M.Tech)</option>
                    <option value="PhD">PhD</option>
                  </select>
                </td>
                <td class="py-2 px-3 text-center">
                  <button
                    type="button"
                    (click)="removeFacultyRow(i)"
                    [disabled]="rows().length <= 1"
                    class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove Trainer"
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
export class BatchFacultyEditorComponent {
  readonly rows = input.required<any[]>();

  addFacultyRow(): void {
    this.rows().push(createFacultyRow());
  }

  removeFacultyRow(index: number): void {
    if (this.rows().length > 1) {
      this.rows().splice(index, 1);
    }
  }
}