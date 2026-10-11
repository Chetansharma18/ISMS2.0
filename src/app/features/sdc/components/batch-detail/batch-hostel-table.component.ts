import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Read-only hostel table. */
@Component({
  selector: 'app-batch-hostel-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-4">
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>Hostel Details</span>
        </h3>
        <span class="text-xs text-slate-500 font-medium">Residential Facility Configuration</span>
      </div>

      <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <th class="py-2.5 px-3 w-12 text-center">#</th>
              <th class="py-2.5 px-3 min-w-65">Hostel Address</th>
              <th class="py-2.5 px-3 min-w-35">Hostel Code</th>
              <th class="py-2.5 px-3 min-w-35">Type</th>
              <th class="py-2.5 px-3 w-28 text-center">Capacity</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (hostel of hostels(); track $index; let i = $index) {
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                <td class="py-2.5 px-3 font-medium text-slate-800">
                  {{ hostel.hostelAddress || hostel.address || 'Plot / Campus Address' }}
                </td>
                <td class="py-2.5 px-3 font-mono font-bold text-slate-700">
                  {{ hostel.hostelCode || hostel.code || 'HST-JP-001' }}
                </td>
                <td class="py-2.5 px-3">
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {{ hostel.type || hostel.hostelType || 'Boys' }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-center font-semibold text-slate-900">
                  {{ hostel.capacity || 0 }} Beds
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
  readonly hostels = input.required<any[]>();
}