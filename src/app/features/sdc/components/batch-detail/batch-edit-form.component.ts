import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BatchFacultyEditorComponent } from './batch-faculty-editor.component';
import { BatchHostelEditorComponent } from './batch-hostel-editor.component';

/** Inline edit form for a batch. Edits the parent-owned edit model in place via ngModel. */
@Component({
  selector: 'app-batch-edit-form',
  standalone: true,
  imports: [FormsModule, BatchFacultyEditorComponent, BatchHostelEditorComponent],
  host: { class: 'block' },
  template: `
    <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-6 animate-in fade-in duration-150">
      
      <div class="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-800 m-0">Edit Batch Information</h3>
          <p class="text-xs text-slate-500 m-0 mt-0.5">Update batch schedule, faculty assignments, hostel configurations, and remarks.</p>
        </div>
        <span class="font-mono text-xs font-bold text-brand bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
          {{ editModel.batchCode }}
        </span>
      </div>

      <!-- 4-Column Form Grid matching Batch creation form -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        <!-- Row 1: Sector (colSpan 2) + Course (colSpan 2) -->
        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">
            Sector <span class="text-rose-500">*</span>
          </label>
          <select
            [(ngModel)]="editModel.sector"
            (ngModelChange)="sectorChange.emit($event)"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            @for (sec of sectorList(); track sec) {
              <option [value]="sec">{{ sec }}</option>
            }
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">
            Course <span class="text-rose-500">*</span>
          </label>
          <select
            [(ngModel)]="editModel.courseName"
            (ngModelChange)="courseChange.emit($event)"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            @for (c of availableCourses(); track c.courseName) {
              <option [value]="c.courseName">{{ c.courseName }}</option>
            }
          </select>
        </div>

        <!-- Row 2: Duration, Start Date, End Date, Start Time -->
        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Batch Duration In HRS. <span class="text-rose-500">*</span>
          </label>
          <input
            type="number"
            [(ngModel)]="editModel.batchDurationHours"
            min="10"
            max="2000"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. 400"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Batch Start Date <span class="text-rose-500">*</span>
          </label>
          <input
            type="date"
            [(ngModel)]="editModel.startDate"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Batch End Date
          </label>
          <input
            type="date"
            [(ngModel)]="editModel.endDate"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Batch Start Time <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            [(ngModel)]="editModel.startTime"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="09:00 AM"
          />
        </div>

        <!-- Row 3: End Time, Approved Batch Strength, Remarks -->
        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Batch End Time <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            [(ngModel)]="editModel.endTime"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="05:00 PM"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Approved Batch Strength <span class="text-rose-500">*</span>
          </label>
          <input
            type="number"
            [(ngModel)]="editModel.approvedBatchStrength"
            min="1"
            max="500"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">Remarks</label>
          <input
            type="text"
            [(ngModel)]="editModel.remarks"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter batch remarks or prerequisites..."
          />
        </div>

      </div>

      <app-batch-faculty-editor [rows]="editModel.faculty" />
      <app-batch-hostel-editor [rows]="editModel.hostels" />

      <!-- Form Action Buttons (Save / Cancel) -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          (click)="cancelled.emit()"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          (click)="saved.emit()"
          class="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          Save Changes
        </button>
      </div>

    </div>
  `
})
export class BatchEditFormComponent {
  readonly model = input.required<any>({ alias: 'editModel' });
  readonly sectorList = input.required<string[]>();
  readonly availableCourses = input.required<{ courseName: string; defaultDurationHours: number }[]>();

  readonly sectorChange = output<string>();
  readonly courseChange = output<string>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  /** Template-friendly alias for the bound edit model. */
  get editModel(): any {
    return this.model();
  }
}