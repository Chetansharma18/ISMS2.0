import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListPageComponent, ButtonComponent, IconComponent, TableColumn } from '../../../shared';
import { environment } from '../../../../environments/environment';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, ListPageComponent, ButtonComponent, IconComponent],
  template: `
    <app-list-page
      title="Camera Monitoring"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Camera Monitoring' }]"
      [searchable]="true"
      searchPlaceholder="Search TP or SDC Name..."
      [(searchQuery)]="searchQuery"
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

        <ng-template #tpInfoTemplate let-user>
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-snug">
              {{ user.tpName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              Code: {{ user.tpCode }}
            </div>
          </div>
        </ng-template>

        <ng-template #sdcCountTemplate let-user>
          <div class="inline-flex flex-col items-center justify-center text-slate-700 text-[13px] font-normal leading-tight min-w-17.5">
            <span>{{ user.sdcCount }} SDC</span>
            <span>Center(s)</span>
          </div>
        </ng-template>

        <ng-template #totalBatchesTemplate let-user>
          <span class="inline-flex items-center text-slate-600 text-[13px] font-normal tracking-wide">
            {{ user.totalBatches }} Batches
          </span>
        </ng-template>

        <ng-template #totalCamerasTemplate let-user>
          <span class="inline-flex items-center gap-1.5 text-green-700 text-[13px] font-normal tracking-wide">
            <app-icon name="video-camera" solid />
            {{ user.totalCameras }} Cameras
          </span>
        </ng-template>

        <ng-template #actionTemplate let-user>
          <a
            appButton
            size="sm"
            [routerLink]="['/admin/camera-monitoring', user.id]"
          >
            <span>View SDCs</span>
            <app-icon name="chevron-right" size="sm" />
          </a>
        </ng-template>
    </app-list-page>
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

  users = signal<CameraUser[]>(environment.useMockData ? [
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
  ] : []);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u => 
      u.tpName.toLowerCase().includes(q) || 
      u.sdcName.toLowerCase().includes(q)
    );
  });
}
