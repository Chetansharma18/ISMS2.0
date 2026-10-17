import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TableColumn, TableComponent } from '../../../../shared';

/** Read-only hostel table. */
@Component({
  selector: 'app-batch-hostel-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableComponent],
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

      <app-table
        [columns]="columns"
        [data]="hostels()"
        [customTemplates]="{
          hostelAddress: addressTemplate,
          hostelCode: codeTemplate,
          type: typeTemplate,
          capacity: capacityTemplate
        }"
      ></app-table>

      <ng-template #addressTemplate let-hostel>
        <span class="font-medium text-slate-800">
          {{ hostel.hostelAddress || hostel.address || 'Plot / Campus Address' }}
        </span>
      </ng-template>

      <ng-template #codeTemplate let-hostel>
        <span class="font-mono font-bold text-slate-700">
          {{ hostel.hostelCode || hostel.code || 'HST-JP-001' }}
        </span>
      </ng-template>

      <ng-template #typeTemplate let-hostel>
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {{ hostel.type || hostel.hostelType || 'Boys' }}
        </span>
      </ng-template>

      <ng-template #capacityTemplate let-hostel>
        <span class="font-semibold text-slate-900">
          {{ hostel.capacity || 0 }} Beds
        </span>
      </ng-template>
    </div>
  `
})
export class BatchHostelTableComponent {
  readonly hostels = input.required<any[]>();

  readonly columns: TableColumn[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'hostelAddress', label: 'Hostel Address', type: 'custom', width: 'min-w-65' },
    { key: 'hostelCode', label: 'Hostel Code', type: 'custom', width: 'min-w-35' },
    { key: 'type', label: 'Type', type: 'custom', width: 'min-w-35' },
    { key: 'capacity', label: 'Capacity', type: 'custom', align: 'center', width: 'w-28' }
  ];
}
