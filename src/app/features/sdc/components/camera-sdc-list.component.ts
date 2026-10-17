import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent, TableComponent, TableColumn, ButtonComponent, IconComponent, PageShellComponent } from '../../../shared';
import { environment } from '../../../../environments/environment';

interface SdcMonitoringItem {
  id: string;
  name: string;
  code: string;
  location: string;
  activeBatches: number;
  configuredFeeds: number;
}

@Component({
  selector: 'app-camera-sdc-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent, ButtonComponent, IconComponent, PageShellComponent],
  template: `
    <app-page-shell>
        <app-page-header
          title="Camera Monitoring - SDCs"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Camera Monitoring', url: '/admin/camera-monitoring' }, { label: 'SDCs' }]"
          [showBack]="true"
          backUrl="/admin/camera-monitoring"
          backTitle="Back to TP List"
          [searchable]="true"
          searchPlaceholder="Search SDC name, code, location..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <app-table
          [columns]="columns"
          [data]="filteredSdcs()"
          [pagination]="true"
          [pageSize]="10"
          [customTemplates]="{
            sdcInfo: sdcInfoTemplate,
            location: locationTemplate,
            activeBatches: activeBatchesTemplate,
            configuredFeeds: configuredFeedsTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #sdcInfoTemplate let-item>
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-snug">
              {{ item.name }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              Code: {{ item.code }}
            </div>
          </div>
        </ng-template>

        <ng-template #locationTemplate let-item>
          <div class="flex items-center gap-1.5 text-slate-600 text-[13px] font-normal justify-start">
            <app-icon name="map-pin" solid class="text-slate-400" />
            {{ item.location }}
          </div>
        </ng-template>

        <ng-template #activeBatchesTemplate let-item>
          <span class="inline-flex items-center text-[#C2410C] text-[13px] font-normal tracking-wide">
            {{ item.activeBatches }} Batches
          </span>
        </ng-template>

        <ng-template #configuredFeedsTemplate let-item>
          <span class="inline-flex items-center gap-1.5 text-green-700 text-[13px] font-normal tracking-wide">
            <app-icon name="video-camera" solid />
            {{ item.configuredFeeds }} Active Feeds
          </span>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <a
            appButton
            size="sm"
            [routerLink]="['/admin/camera-monitoring/batches', item.id]"
          >
            <span>View Batches</span>
            <app-icon name="chevron-right" size="sm" />
          </a>
        </ng-template>
    </app-page-shell>
  `
})
export class CameraSdcListComponent {
  route = inject(ActivatedRoute);

  columns: TableColumn<SdcMonitoringItem>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'sdcInfo', label: 'Skill Development Center (SDC)', width: 'min-w-[240px]', type: 'custom' },
    { key: 'location', label: 'Branch / Location', width: 'min-w-[120px]', type: 'custom' },
    { key: 'activeBatches', label: 'Active Batches', align: 'center', type: 'custom' },
    { key: 'configuredFeeds', label: 'Configured Feeds', align: 'center', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-28', type: 'custom' }
  ];

  sdcs = signal<SdcMonitoringItem[]>(environment.useMockData ? [
    {
      id: 'SDC-001',
      name: 'SDC 1',
      code: 'SDC 001',
      location: 'Jaipur',
      activeBatches: 2,
      configuredFeeds: 6
    },
    {
      id: 'SDC-002',
      name: 'SDC 2',
      code: 'SDC 002',
      location: 'Ajmer',
      activeBatches: 1,
      configuredFeeds: 0
    },
    {
      id: 'SDC-003',
      name: 'SDC 3',
      code: 'SDC 003',
      location: 'Jodhpur',
      activeBatches: 1,
      configuredFeeds: 2
    }
  ] : []);

  searchQuery = signal('');

  filteredSdcs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.sdcs();
    return this.sdcs().filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    );
  });
}
