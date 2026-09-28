import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  TableColumn
} from '../../../shared';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="Batch Management"
        ></app-page-header>

        <!-- Filter Controls & Search Toolbar (Matching Active EOI & Tender Status) -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          
          <!-- Status Filter Badges / Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            @for (f of filterOptions(); track f.id) {
              <button
                type="button"
                (click)="setFilter(f.id)"
                class="px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
                [class.bg-primary]="activeFilter() === f.id"
                [class.text-white]="activeFilter() === f.id"
                [class.border-primary]="activeFilter() === f.id"
                [class.bg-white]="activeFilter() !== f.id"
                [class.text-text-secondary]="activeFilter() !== f.id"
                [class.border-border]="activeFilter() !== f.id"
                [class.hover:bg-primary-light]="activeFilter() !== f.id"
                [class.hover:text-primary]="activeFilter() !== f.id"
              >
                <span>{{ f.label }}</span>
                <span
                  class="px-1.5 py-0.2 rounded-full text-[10px]"
                  [class.bg-white/20]="activeFilter() === f.id"
                  [class.text-white]="activeFilter() === f.id"
                  [class.bg-[#F5F7F9]]="activeFilter() !== f.id"
                  [class.text-text-secondary]="activeFilter() !== f.id"
                >
                  {{ f.count }}
                </span>
              </button>
            }
          </div>

          <!-- Search Input with Search Icon & Clear Button -->
          <div class="relative w-full sm:w-72">
            <svg class="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search Batch Code, Course, Center, Scheme..."
              class="w-full pl-8 pr-7 py-1.5 text-[13px] bg-white border border-border rounded-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-normal"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                &times;
              </button>
            }
          </div>

        </div>

        <!-- Batches Table via Reusable TableComponent -->
        <app-table
          [columns]="batchColumns"
          [data]="filteredBatches()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="batches"
          emptyMessage="No batches match your search criteria."
          [customTemplates]="{
            batchInfo: batchInfoTemplate,
            courseScheme: courseSchemeTemplate,
            center: centerTemplate,
            capacity: capacityTemplate,
            duration: durationTemplate,
            status: statusTemplate,
            cameraConfig: cameraConfigTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Batch Info -->
        <ng-template #batchInfoTemplate let-b>
          <div class="font-mono">
            <div class="font-bold text-slate-900 leading-snug">
              {{ b.batchCode }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-normal">
              {{ b.batchName || 'General Batch' }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Course & Scheme -->
        <ng-template #courseSchemeTemplate let-b>
          <div>
            <div class="font-semibold text-slate-900 leading-snug">
              {{ b.courseName }}
            </div>
            <div class="mt-1">
              <span class="text-[11px] font-semibold text-slate-600 block">
                {{ b.scheme }}
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Center (SDC) -->
        <ng-template #centerTemplate let-b>
          <div>
            <div class="font-semibold text-slate-900 leading-snug">
              {{ b.sdcName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              {{ b.sdcCode }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Capacity & Mapped Progress -->
        <ng-template #capacityTemplate let-b>
          <div class="min-w-35">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{{ b.mappedAspirantsCount }}/{{ b.maxStrength }} Aspirants</span>
              <span class="text-slate-400 font-normal text-[11px]">{{ getMappedPercent(b) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full transition-all duration-300"
                [style.width]="getMappedPercent(b) + '%'"
              ></div>
            </div>
          </div>
        </ng-template>

        <!-- Template: Duration -->
        <ng-template #durationTemplate let-b>
          <div class="text-xs text-slate-600 space-y-0.5 whitespace-nowrap">
            <div><span class="text-slate-400">From:</span> {{ b.startDate }}</div>
            <div><span class="text-slate-400">To:</span> {{ b.endDate }}</div>
          </div>
        </ng-template>

        <!-- Template: Status Badge -->
        <ng-template #statusTemplate let-b>
          @if (b.status === 'ONGOING') {
            <span class="text-[11px] font-bold text-[#15803D] tracking-wider uppercase">
              ONGOING
            </span>
          } @else {
            <span class="text-[11px] font-bold text-sky-700 tracking-wider uppercase">
              APPROVED
            </span>
          }
        </ng-template>

        <!-- Template: Camera Config -->
        <ng-template #cameraConfigTemplate let-b>
          <app-button
            variant="primary"
            size="sm"
            (btnClick)="addCameraConfig(b)"
            title="Add Camera Configuration"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span class="whitespace-nowrap">Add Camera Configuration</span>
          </app-button>
        </ng-template>

        <!-- Template: Actions -->
        <ng-template #actionsTemplate let-b>
          <app-button
            variant="primary"
            size="sm"
            (btnClick)="selectAndMap(b)"
            title="Register Aspirant"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Register Aspirant</span>
          </app-button>
        </ng-template>

        <!-- Camera Config Modal -->
        @if (isCameraModalOpen()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <!-- Header -->
              <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between" style="background-color: var(--color-primary, #174A6E);">
                <h3 class="font-bold text-lg" style="color: #ffffff;">Add Camera Configuration</h3>
                <button (click)="closeCameraModal()" class="transition-colors cursor-pointer" style="color: #ffffff;">
                  <svg class="w-5 h-5 opacity-80 hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- Body -->
              <div class="p-5 space-y-4">
                <p class="text-sm text-slate-500 mb-2">
                  Configure live feed for batch: <span class="font-bold text-slate-700">{{ selectedBatchForCamera()?.batchCode }}</span>
                </p>
                
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700">Camera Feed URL (RTSP / HTTP) <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="cameraUrl" placeholder="rtsp://camera-ip:port/stream" 
                         class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                         [class.border-red-500]="showCameraValidation() && !cameraUrl()"
                         [class.border-slate-300]="!(showCameraValidation() && !cameraUrl())"
                         [class.focus:border-red-500]="showCameraValidation() && !cameraUrl()"
                         [class.focus:border-primary]="!(showCameraValidation() && !cameraUrl())" />
                </div>
                
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700">Username <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="cameraUsername" placeholder="admin" 
                         class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                         [class.border-red-500]="showCameraValidation() && !cameraUsername()"
                         [class.border-slate-300]="!(showCameraValidation() && !cameraUsername())"
                         [class.focus:border-red-500]="showCameraValidation() && !cameraUsername()"
                         [class.focus:border-primary]="!(showCameraValidation() && !cameraUsername())" />
                </div>
                
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-700">Password <span class="text-red-500">*</span></label>
                  <input type="password" [(ngModel)]="cameraPassword" placeholder="••••••••" 
                         class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                         [class.border-red-500]="showCameraValidation() && !cameraPassword()"
                         [class.border-slate-300]="!(showCameraValidation() && !cameraPassword())"
                         [class.focus:border-red-500]="showCameraValidation() && !cameraPassword()"
                         [class.focus:border-primary]="!(showCameraValidation() && !cameraPassword())" />
                </div>
              </div>
              
              <!-- Footer -->
              <div class="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button (click)="closeCameraModal()" class="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button (click)="saveCameraConfig()" class="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-[#123B59] transition-colors shadow-sm cursor-pointer" style="background-color: var(--color-primary, #174A6E);">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class BatchListComponent {
  readonly batchService = inject(BatchService);
  readonly router = inject(Router);

  searchQuery = '';
  activeFilter = signal<string>('All');
  readonly pageSize = 10;

  readonly batchColumns: TableColumn<BatchRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-10' },
    { key: 'batchInfo', label: 'Batch Info', type: 'custom', width: 'min-w-[130px]' },
    { key: 'courseScheme', label: 'Course & Scheme', type: 'custom', width: 'min-w-[200px]' },
    { key: 'center', label: 'Center (SDC)', type: 'custom', width: 'min-w-[200px]' },
    { key: 'capacity', label: 'Capacity & Mapped', type: 'custom', width: 'min-w-[140px]' },
    { key: 'duration', label: 'Batch Duration', type: 'custom', width: 'w-32' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-24' },
    { key: 'cameraConfig', label: 'Camera Configuration', align: 'center', type: 'custom', width: 'w-56' },
    { key: 'actions', label: 'Actions', align: 'right', type: 'custom', width: 'w-44' }
  ];

  readonly filterOptions = computed(() => {
    const all = this.batchService.batches();
    return [
      { id: 'All', label: 'All Batches', count: all.length },
      { id: 'ONGOING', label: 'Ongoing', count: all.filter(b => b.status === 'ONGOING').length },
      { id: 'APPROVED', label: 'Approved', count: all.filter(b => b.status === 'APPROVED').length }
    ];
  });

  readonly filteredBatches = computed(() => {
    let list = this.batchService.batches();
    const filter = this.activeFilter();

    if (filter === 'ONGOING') {
      list = list.filter(b => b.status === 'ONGOING');
    } else if (filter === 'APPROVED') {
      list = list.filter(b => b.status === 'APPROVED');
    }

    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(
        b =>
          b.batchCode.toLowerCase().includes(query) ||
          (b.batchName && b.batchName.toLowerCase().includes(query)) ||
          b.courseName.toLowerCase().includes(query) ||
          b.sdcName.toLowerCase().includes(query) ||
          b.scheme.toLowerCase().includes(query)
      );
    }

    return list;
  });

  setFilter(filterId: string): void {
    this.activeFilter.set(filterId);
  }

  getMappedPercent(b: BatchRecord): number {
    if (!b.maxStrength) return 0;
    return Math.round((b.mappedAspirantsCount / b.maxStrength) * 100);
  }

  isCameraModalOpen = signal<boolean>(false);
  selectedBatchForCamera = signal<BatchRecord | null>(null);

  // Camera config form state
  cameraUrl = signal<string>('');
  cameraUsername = signal<string>('');
  cameraPassword = signal<string>('');
  showCameraValidation = signal<boolean>(false);

  selectAndMap(b: BatchRecord): void {
    // Navigate to aspirant registration and batch mapping form
    this.router.navigate(['/batches', b.id, 'map-aspirant']);
  }

  addCameraConfig(b: BatchRecord): void {
    this.selectedBatchForCamera.set(b);
    this.cameraUrl.set('');
    this.cameraUsername.set('');
    this.cameraPassword.set('');
    this.showCameraValidation.set(false);
    this.isCameraModalOpen.set(true);
  }

  closeCameraModal(): void {
    this.isCameraModalOpen.set(false);
    this.selectedBatchForCamera.set(null);
  }

  saveCameraConfig(): void {
    if (!this.cameraUrl() || !this.cameraUsername() || !this.cameraPassword()) {
      this.showCameraValidation.set(true);
      return; // Stop if validation fails
    }

    // Implement actual save logic (e.g. API call) here
    console.log('Saved camera config for:', this.selectedBatchForCamera()?.batchCode);
    console.log('URL:', this.cameraUrl(), 'User:', this.cameraUsername());
    
    this.closeCameraModal();
    // Normally you'd trigger a success toast message here
  }
}
