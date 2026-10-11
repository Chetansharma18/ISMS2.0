import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacultyItem } from './batch-form.util';

@Component({
  selector: 'app-batch-faculty-table',
  standalone: true,
  imports: [NgClass, FormsModule],
  host: { class: 'block' },
  template: `
    <div class="space-y-2.5 pt-2 border-t border-slate-200">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full shrink-0"></span>
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
            Faculty Details
          </h3>
          <span class="text-[11px] text-slate-500">({{ facultyList().length }} trainer{{ facultyList().length > 1 ? 's' : '' }} assigned)</span>
        </div>

        <!-- Blue + Add Faculty Button -->
        <button
          type="button"
          (click)="addFaculty.emit()"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary hover:bg-primary-dark active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="Add Faculty Trainer"
        >
          <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Faculty</span>
        </button>
      </div>

      <!-- Faculty Responsive Table -->
      <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <th class="py-2 px-3 w-12 text-center">#</th>
              <th class="py-2 px-3 min-w-[200px]">Faculty Name <span class="text-rose-500">*</span></th>
              <th class="py-2 px-3 min-w-[180px]">Trainer Type <span class="text-rose-500">*</span></th>
              <th class="py-2 px-3 min-w-[220px]">Qualification / Experience <span class="text-rose-500">*</span></th>
              <th class="py-2 px-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (faculty of facultyList(); track $index; let i = $index) {
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                
                <!-- Faculty Name -->
                <td class="py-2 px-3">
                  <input
                    type="text"
                    [(ngModel)]="faculty.facultyName"
                    [name]="'faculty_name_' + i"
                    (input)="nameEdited.emit(i)"
                    placeholder="e.g. Vikas Purohit"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border rounded-md text-slate-800 focus:outline-none transition-all"
                    [ngClass]="facultyErrors()[i] ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-200' : 'border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary'"
                  />
                  @if (facultyErrors()[i]) {
                    <span class="text-[10.5px] text-red-600 font-medium block mt-0.5">Faculty Name is required</span>
                  }
                </td>

                <!-- Trainer Type -->
                <td class="py-2 px-3">
                  <select
                    [(ngModel)]="faculty.trainerType"
                    [name]="'faculty_type_' + i"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="Primary Trainer">Primary Trainer</option>
                    <option value="Assistant Trainer">Assistant Trainer</option>
                    <option value="Domain Trainer">Domain Trainer</option>
                    <option value="Master Trainer">Master Trainer</option>
                  </select>
                </td>

                <!-- Qualification / Experience (Options: Graduate, Post Graduate, PhD) -->
                <td class="py-2 px-3">
                  <select
                    [(ngModel)]="faculty.qualification"
                    [name]="'faculty_qual_' + i"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
                    <option value="Post Graduate (M.A / M.Sc / M.Tech)">Post Graduate (M.A / M.Sc / M.Tech)</option>
                    <option value="PhD">PhD</option>
                  </select>
                </td>

                <!-- Action: Remove -->
                <td class="py-2 px-3 text-center">
                  <button
                    type="button"
                    (click)="removeFaculty.emit(i)"
                    [disabled]="facultyList().length === 1"
                    class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Remove Trainer"
                  >
                    <svg class="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
export class BatchFacultyTableComponent {
  /** Parent-owned rows; edited in place through ngModel. */
  readonly facultyList = input.required<FacultyItem[]>();
  readonly facultyErrors = input<boolean[]>([]);

  readonly addFaculty = output<void>();
  readonly removeFaculty = output<number>();
  /** Emits the row index when its name is edited (parent clears the error flag). */
  readonly nameEdited = output<number>();
}
