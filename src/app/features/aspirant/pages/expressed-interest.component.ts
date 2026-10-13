import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  TableComponent,
  TableColumn,
  PageHeaderComponent
} from '../../../shared';
import { AspirantPortalService, TrainingCalendarItem } from '../services/aspirant-portal.service';

@Component({
  selector: 'app-expressed-interest',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableComponent,
    PageHeaderComponent
  ],
  template: `
    <div class="w-full min-h-full text-slate-800 font-sans p-4 sm:p-5 space-y-5" style="background-color: #ffffff; font-family: 'Inter', sans-serif;">

      <!-- Top Header via Reusable PageHeaderComponent with Rajasthan Banner -->
      <app-page-header
        title="Expressed Interest"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Expressed Interest' }]"
      >
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <!-- Integrated Search Box -->
          <div class="w-full sm:w-auto min-w-0 sm:min-w-75 md:min-w-100">
            <div class="relative flex items-center bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search expressed interests by course, sector, district..."
                class="w-full px-3.5 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                class="px-3.5 py-2.5 bg-navy hover:bg-navy-dark text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Search"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </app-page-header>

      <!-- Expressed Interests Table via Reusable TableComponent -->
      <app-table
        [columns]="expressedColumns"
        [data]="filteredExpressed()"
        [pagination]="true"
        [pageSize]="pageSize"
        itemUnit="expressed interests"
        emptyMessage="No training programs expressed yet. Visit Training Calendar to express interest."
        [customTemplates]="{
          course: courseTemplate,
          status: statusTemplate
        }"
      ></app-table>

      <!-- Custom Course Template -->
      <ng-template #courseTemplate let-item>
        <div>
          <span class="font-semibold text-slate-900 text-xs block">{{ item.course }}</span>
          <span class="text-[11px] text-slate-500">{{ item.sector }}</span>
        </div>
      </ng-template>

      <!-- Custom Status Template -->
      <ng-template #statusTemplate let-item>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {{ item.status || 'Interest Submitted' }}
        </span>
      </ng-template>

    </div>
  `
})
export class ExpressedInterestComponent {
  private readonly portalService = inject(AspirantPortalService);

  readonly searchQuery = signal('');
  readonly pageSize = 8;

  readonly expressedColumns: TableColumn<TrainingCalendarItem>[] = [
    { key: '$index',           label: 'S. No.',            type: 'number', align: 'center', width: 'w-12' },
    { key: 'district',         label: 'District',          cellClass: 'whitespace-nowrap font-normal text-slate-800' },
    { key: 'sector',           label: 'Sector',            cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'course',           label: 'Course',            cellClass: 'min-w-[200px]', type: 'custom' },
    { key: 'trainingPartner',  label: 'Training Partner',  cellClass: 'min-w-[180px] font-normal text-slate-800' },
    { key: 'sdcName',          label: 'SDC Name',          cellClass: 'min-w-[180px] font-normal text-slate-700' },
    { key: 'batchDate',        label: 'Batch Date',        align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-800' },
    { key: 'batchTime',        label: 'Batch Time',        align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'expressedDate',    label: 'Expressed On',      align: 'center', cellClass: 'whitespace-nowrap font-medium text-slate-900' },
    { key: 'status',           label: 'Status',            align: 'center', type: 'custom', width: 'w-36' }
  ];

  readonly filteredExpressed = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const items = this.portalService.expressedInterests();
    if (!query) return items;
    return items.filter(b =>
      b.district.toLowerCase().includes(query) ||
      b.sector.toLowerCase().includes(query) ||
      b.course.toLowerCase().includes(query) ||
      b.trainingPartner.toLowerCase().includes(query) ||
      b.sdcName.toLowerCase().includes(query)
    );
  });
}
