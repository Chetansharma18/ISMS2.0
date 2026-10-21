import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ListPageComponent,
  TableColumn
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
    ListPageComponent
  ],
  template: `
    <app-list-page
      title="Expressed Interest"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Expressed Interest' }]"
      searchPlaceholder="Search expressed interests by course, sector, district..."
      [(searchQuery)]="searchQuery"
      [columns]="expressedColumns"
      [data]="filteredExpressed()"
      [pageSize]="pageSize"
      itemUnit="expressed interests"
      emptyMessage="No training programs expressed yet. Visit Training Calendar to express interest."
      [customTemplates]="{
        course: courseTemplate,
        status: statusTemplate
      }"
    />

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
