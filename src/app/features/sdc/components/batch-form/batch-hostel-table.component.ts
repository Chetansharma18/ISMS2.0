import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HostelItem } from './batch-form.util';

@Component({
  selector: 'app-batch-hostel-table',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="space-y-2.5 pt-2 border-t border-slate-200">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full shrink-0"></span>
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
            Hostel Details
          </h3>
          <span class="text-[11px] text-slate-500">(Residential facility configuration)</span>
        </div>

        <!-- Blue + Add Hostel Button -->
        <button
          type="button"
          (click)="addHostel.emit()"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary hover:bg-primary-dark active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="Add Hostel"
        >
          <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Hostel</span>
        </button>
      </div>

      <!-- Hostel Responsive Table -->
      <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <th class="py-2 px-3 w-12 text-center">#</th>
              <th class="py-2 px-3 min-w-[260px]">Hostel Address</th>
              <th class="py-2 px-3 min-w-[140px]">Hostel Code</th>
              <th class="py-2 px-3 min-w-[140px]">Type</th>
              <th class="py-2 px-3 w-28">Capacity</th>
              <th class="py-2 px-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (hostel of hostelList(); track $index; let i = $index) {
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                
                <!-- Hostel Address -->
                <td class="py-2 px-3">
                  <input
                    type="text"
                    [(ngModel)]="hostel.hostelAddress"
                    [name]="'hostel_addr_' + i"
                    placeholder="Plot / Campus Address"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </td>

                <!-- Hostel Code -->
                <td class="py-2 px-3">
                  <input
                    type="text"
                    [(ngModel)]="hostel.hostelCode"
                    [name]="'hostel_code_' + i"
                    placeholder="e.g. HST-JP-001"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </td>

                <!-- Type -->
                <td class="py-2 px-3">
                  <select
                    [(ngModel)]="hostel.type"
                    [name]="'hostel_type_' + i"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-ed">Co-ed</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </td>

                <!-- Capacity -->
                <td class="py-2 px-3">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    [(ngModel)]="hostel.capacity"
                    [name]="'hostel_cap_' + i"
                    placeholder="0"
                    class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </td>

                <!-- Action: Remove -->
                <td class="py-2 px-3 text-center">
                  <button
                    type="button"
                    (click)="removeHostel.emit(i)"
                    class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Remove Hostel"
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
export class BatchHostelTableComponent {
  /** Parent-owned rows; edited in place through ngModel. */
  readonly hostelList = input.required<HostelItem[]>();

  readonly addHostel = output<void>();
  readonly removeHostel = output<number>();
}
