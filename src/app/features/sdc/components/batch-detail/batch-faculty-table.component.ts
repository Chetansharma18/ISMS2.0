import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TableColumn, TableComponent } from '../../../../shared';

/** Read-only faculty table. */
@Component({
  selector: 'app-batch-faculty-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableComponent],
  host: { class: 'block' },
  template: `
    <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-4">
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>Faculty Details</span>
        </h3>
        <span class="text-xs text-slate-500 font-medium">
          {{ faculty().length }} Trainer{{ faculty().length > 1 ? 's' : '' }} Assigned
        </span>
      </div>

      <app-table
        [columns]="columns"
        [data]="faculty()"
        [customTemplates]="{
          facultyName: nameTemplate,
          trainerType: typeTemplate,
          qualification: qualificationTemplate
        }"
      ></app-table>

      <ng-template #nameTemplate let-fac>
        <span class="font-semibold text-slate-900">
          {{ fac.facultyName || fac.name || 'Vikas Purohit' }}
        </span>
      </ng-template>

      <ng-template #typeTemplate let-fac>
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {{ fac.trainerType || fac.type || 'Primary Trainer' }}
        </span>
      </ng-template>

      <ng-template #qualificationTemplate let-fac>
        <span class="text-slate-700">
          {{ fac.qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)' }}
        </span>
      </ng-template>
    </div>
  `
})
export class BatchFacultyTableComponent {
  readonly faculty = input.required<any[]>();

  readonly columns: TableColumn[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'facultyName', label: 'Faculty Name', type: 'custom', width: 'min-w-50' },
    { key: 'trainerType', label: 'Trainer Type', type: 'custom', width: 'min-w-45' },
    { key: 'qualification', label: 'Qualification / Experience', type: 'custom', width: 'min-w-60' }
  ];
}
