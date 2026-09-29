import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../../shared';
import { inject } from '@angular/core';

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
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        <app-page-header
          title="Camera Monitoring - SDCs"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Camera Monitoring', url: '/admin/camera-monitoring' }, { label: 'SDCs' }]"
          [showBack]="true"
          backUrl="/admin/camera-monitoring"
          backTitle="Back to TP List"
        >
        </app-page-header>

        <app-table
          [columns]="columns"
          [data]="sdcs()"
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
            <div class="font-semibold text-slate-900 text-[13px] leading-snug">
              {{ item.name }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              Code: {{ item.code }}
            </div>
          </div>
        </ng-template>

        <ng-template #locationTemplate let-item>
          <div class="flex items-center gap-1.5 text-slate-600 text-[12.5px] font-medium justify-start">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ item.location }}
          </div>
        </ng-template>

        <ng-template #activeBatchesTemplate let-item>
          <span class="inline-flex items-center text-[#C2410C] text-[11.5px] font-semibold tracking-wide">
            {{ item.activeBatches }} Batches
          </span>
        </ng-template>

        <ng-template #configuredFeedsTemplate let-item>
          <span class="inline-flex items-center gap-1.5 text-[#15803D] text-[11.5px] font-semibold tracking-wide">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {{ item.configuredFeeds }} Active Feeds
          </span>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <a
            [routerLink]="['/admin/camera-monitoring/batches', item.id]"
            class="btn btn-primary btn-sm inline-flex items-center justify-center gap-1"
            style="color: white !important;"
          >
            <span style="color: white !important;">View Batches</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: white !important;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </ng-template>
      </div>
    </div>
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

  sdcs = signal<SdcMonitoringItem[]>([
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
  ]);
}
