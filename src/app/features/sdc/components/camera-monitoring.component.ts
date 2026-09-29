import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../../shared';

interface CameraUser {
  id: string;
  sdcName: string;
  tpName: string;
  tpCode: string;
  sdcCount: number;
  totalBatches: number;
  totalCameras: number;
}

@Component({
  selector: 'app-camera-monitoring',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        <app-page-header
          title="Camera Monitoring"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Camera Monitoring' }]"
        >
          <!-- Search Bar -->
          <div class="relative w-full sm:w-64">
            <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search by TP or SDC Name..."
              class="w-full pl-8 pr-3 py-1.5 text-sm bg-white border-none rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
            />
          </div>
        </app-page-header>

        <app-table
          [columns]="columns"
          [data]="filteredUsers()"
          [pagination]="true"
          [pageSize]="10"
          [customTemplates]="{
            tpInfo: tpInfoTemplate,
            sdcCount: sdcCountTemplate,
            totalBatches: totalBatchesTemplate,
            totalCameras: totalCamerasTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #tpInfoTemplate let-user>
          <div>
            <div class="font-semibold text-slate-900 text-[13px] leading-snug">
              {{ user.tpName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              Code: {{ user.tpCode }}
            </div>
          </div>
        </ng-template>

        <ng-template #sdcCountTemplate let-user>
          <div class="inline-flex flex-col items-center justify-center text-[#334155] text-[11.5px] font-semibold leading-tight min-w-[70px]">
            <span>{{ user.sdcCount }} SDC</span>
            <span>Center(s)</span>
          </div>
        </ng-template>

        <ng-template #totalBatchesTemplate let-user>
          <span class="inline-flex items-center text-[#475569] text-[11.5px] font-semibold tracking-wide">
            {{ user.totalBatches }} Batches
          </span>
        </ng-template>

        <ng-template #totalCamerasTemplate let-user>
          <span class="inline-flex items-center gap-1.5 text-[#15803D] text-[11.5px] font-semibold tracking-wide">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {{ user.totalCameras }} Cameras
          </span>
        </ng-template>

        <ng-template #actionTemplate let-user>
          <a
            [routerLink]="['/admin/camera-monitoring', user.id]"
            class="btn btn-primary btn-sm inline-flex items-center justify-center gap-1"
            style="color: white !important;"
          >
            <span style="color: white !important;">View SDCs</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: white !important;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </ng-template>
      </div>
    </div>
  `
})
export class CameraMonitoringComponent {
  columns: TableColumn<CameraUser>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'tpInfo', label: 'Training Partner Name', width: 'min-w-[220px]', type: 'custom' },
    { key: 'sdcCount', label: 'SDC Centers', align: 'center', type: 'custom' },
    { key: 'totalBatches', label: 'Total Batches', align: 'center', type: 'custom' },
    { key: 'totalCameras', label: 'Total Cameras', align: 'center', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-28', type: 'custom' }
  ];

  searchQuery = signal('');

  users = signal<CameraUser[]>([
    {
      id: 'TP-001',
      sdcName: 'SDC 1',
      tpName: 'TP 1',
      tpCode: 'TP 001',
      sdcCount: 2,
      totalBatches: 3,
      totalCameras: 6
    },
    {
      id: 'TP-002',
      sdcName: 'SDC 2',
      tpName: 'TP 2',
      tpCode: 'TP 002',
      sdcCount: 2,
      totalBatches: 2,
      totalCameras: 2
    },
    {
      id: 'TP-003',
      sdcName: 'SDC 3',
      tpName: 'TP 3',
      tpCode: 'TP 003',
      sdcCount: 1,
      totalBatches: 1,
      totalCameras: 1
    }
  ]);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u => 
      u.tpName.toLowerCase().includes(q) || 
      u.sdcName.toLowerCase().includes(q)
    );
  });
}
