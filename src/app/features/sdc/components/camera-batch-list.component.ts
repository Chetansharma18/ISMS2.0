import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../../shared';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CameraBatchItem {
  id: string;
  batchName: string;
  batchCode: string;
  sdcName: string;
  tpName: string;
  branch: string;
  cameraStatus: string;
}

@Component({
  selector: 'app-camera-batch-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent, FormsModule],
  template: `
    <div class="w-full min-h-full bg-background text-primary font-sans">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        <app-page-header
          title="Camera Monitoring - Batches"
          [breadcrumbs]="[
            { label: 'Home', url: '/' }, 
            { label: 'Camera Monitoring', url: '/admin/camera-monitoring' },
            { label: 'SDCs', url: '/admin/camera-monitoring/TP-001' },
            { label: 'Batches' }
          ]"
          [showBack]="true"
          backUrl="/admin/camera-monitoring/TP-001"
          backTitle="Back to SDC List"
        >
        </app-page-header>

        <app-table
          [columns]="columns"
          [data]="batches()"
          [pagination]="true"
          [pageSize]="10"
          [customTemplates]="{
            batchInfo: batchInfoTemplate,
            sdcTpInfo: sdcTpInfoTemplate,
            branch: branchTemplate,
            cameraStatus: cameraStatusTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #batchInfoTemplate let-item>
          <div>
            <div class="font-bold text-slate-800 text-[13px] leading-snug">
              {{ item.batchName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              Code: {{ item.batchCode }}
            </div>
          </div>
        </ng-template>

        <ng-template #sdcTpInfoTemplate let-item>
          <div>
            <div class="font-bold text-slate-800 text-[13px] leading-snug">
              {{ item.sdcName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 font-mono">
              TP: {{ item.tpName }}
            </div>
          </div>
        </ng-template>

        <ng-template #branchTemplate let-item>
          <div class="flex items-center gap-1.5 text-slate-600 text-[12.5px] font-medium justify-start">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ item.branch }}
          </div>
        </ng-template>

        <ng-template #cameraStatusTemplate let-item>
          <div class="inline-flex items-center gap-1.5 text-[#15803D] text-[11.5px] font-semibold tracking-wide">
            <div class="w-1.5 h-1.5 rounded-full bg-[#15803D]"></div>
            {{ item.cameraStatus }}
          </div>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <button
            (click)="openFeed(item)"
            class="btn btn-primary btn-sm inline-flex items-center justify-center gap-1.5"
            style="color: white !important;"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" style="color: white !important;">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <span style="color: white !important;">Open Live Feed</span>
          </button>
        </ng-template>
      </div>

      <!-- Live Feed Modal -->
      @if (selectedFeed() || isMultiView()) {
        <div class="fixed inset-0 z-[100] bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <!-- Modal Header -->
            <div class="px-4 py-3 bg-[#0B3558] text-white flex items-center justify-between shrink-0 relative z-20">
              <div class="flex items-center gap-3">
                <h2 class="text-base sm:text-lg font-semibold m-0" style="color: white !important;">
                  {{ isMultiView() ? 'Multiple Live Feeds' : 'Live Feed - ' + selectedFeed()?.batchName }}
                </h2>
                @if (!isMultiView()) {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse">
                    Live
                  </span>
                }
              </div>
              <button (click)="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 flex overflow-hidden bg-slate-100 relative">
              
              <!-- Left Sidebar (Multi View Only) -->
              @if (isMultiView() && showSidebar()) {
                <div class="absolute left-0 top-0 bottom-0 z-10 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 animate-in slide-in-from-left duration-200 shadow-xl">
                  <div class="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span class="font-semibold text-slate-700 text-sm">Select Batches</span>
                    <button (click)="showSidebar.set(false)" class="text-slate-400 hover:text-slate-600">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                  </div>
                  <div class="flex-1 overflow-y-auto p-2 space-y-1">
                    @for (b of batches(); track b.id) {
                      <label class="flex items-start gap-2 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border"
                             [class.bg-blue-50]="isBatchSelected(b)" [class.border-blue-200]="isBatchSelected(b)" [class.border-transparent]="!isBatchSelected(b)">
                        <input type="checkbox" class="mt-0.5 rounded border-slate-300 text-[#0B3558] focus:ring-[#0B3558] cursor-pointer"
                               [checked]="isBatchSelected(b)"
                               (change)="toggleBatchSelection(b)" />
                        <div class="flex flex-col">
                          <span class="text-xs font-semibold text-slate-800 leading-tight">{{ b.batchName }}</span>
                          <span class="text-[10px] text-slate-500 mt-0.5">{{ b.cameraStatus }}</span>
                        </div>
                      </label>
                    }
                  </div>
                </div>
              }

              <!-- Main Video Area -->
              <div class="flex-1 p-3 sm:p-4 overflow-y-auto bg-slate-900/5 relative w-full h-full" (click)="closeSidebarIfOpen()">
                
                <!-- Multi View Grid -->
                @if (isMultiView()) {
                  @if (multiSelectedBatches().length === 0) {
                    <div class="h-full flex flex-col items-center justify-center text-slate-400">
                      <svg class="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      <p class="font-medium">Select batches from the sidebar to view live feeds.</p>
                    </div>
                  } @else {
                    <div class="grid gap-3 sm:gap-4 h-full" [ngClass]="getGridClass()">
                      @for (b of multiSelectedBatches(); track b.id) {
                        <ng-container *ngTemplateOutlet="videoPlayerTpl; context: { $implicit: b }"></ng-container>
                      }
                    </div>
                  }
                } @else {
                  <!-- Single View -->
                  <div class="w-full h-full max-w-6xl mx-auto flex flex-col">
                    <ng-container *ngTemplateOutlet="videoPlayerTpl; context: { $implicit: selectedFeed() }"></ng-container>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Reusable Video Player Template -->
      <ng-template #videoPlayerTpl let-feed>
        <div class="relative w-full h-full min-h-[250px] bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col group">
          
          <!-- Video Header Overlay -->
          <div class="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-start justify-between pointer-events-none">
            <div class="text-white drop-shadow-md">
              <div class="font-semibold text-sm">{{ feed.batchName }}</div>
              <div class="text-[11px] opacity-80 flex items-center gap-1.5 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Live Feed - {{ feed.sdcName }}
              </div>
            </div>
          </div>

          <!-- Floating Action Buttons (Top Right) -->
          <div class="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200" (click)="$event.stopPropagation()">
            <!-- Multiple View Button -->
            <button (click)="toggleMultiView()" class="h-8 px-2.5 rounded bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer" title="Toggle Multi View / Batches">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              <span class="text-xs font-semibold">Multi View</span>
            </button>

            <!-- Zoom/Pan Toggle Button -->
            <button (click)="toggleZoom(feed.id)" class="w-8 h-8 rounded bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer" [class.bg-blue-600]="zoomedStates()[feed.id]" title="Toggle Zoom & Pan">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
            </button>

            <!-- Record Button -->
            <button (click)="toggleRecord(feed.id)" 
                    class="flex items-center gap-1.5 px-2.5 h-8 rounded backdrop-blur-sm text-white text-xs font-semibold transition-colors border border-white/20 cursor-pointer"
                    [ngClass]="recordingStates()[feed.id] ? 'bg-red-600 hover:bg-red-700 border-red-500' : 'bg-black/60 hover:bg-black/80'"
                    title="Record Feed">
              <div class="w-2 h-2 rounded-full bg-white" [class.animate-pulse]="recordingStates()[feed.id]"></div>
              <span>{{ recordingStates()[feed.id] ? 'Stop' : 'Record' }}</span>
            </button>
          </div>

          <!-- Video Element with Drag-to-Pan support -->
          <div class="flex-1 relative overflow-hidden bg-black flex items-center justify-center"
               [style.cursor]="zoomedStates()[feed.id] ? (isDragging(feed.id) ? 'grabbing' : 'grab') : 'default'"
               (mousedown)="startPan($event, feed.id)"
               (mousemove)="doPan($event, feed.id)"
               (mouseup)="endPan(feed.id)"
               (mouseleave)="endPan(feed.id)">
            <video 
              src="https://www.w3schools.com/html/mov_bbb.mp4" 
              autoplay 
              loop 
              muted 
              class="w-full h-full object-cover origin-center pointer-events-none"
              [style.transform]="getTransform(feed.id)"
              [style.transition]="isDragging(feed.id) ? 'none' : 'transform 0.3s ease'"
            ></video>
            
            <!-- Recording indicator on video -->
            @if (recordingStates()[feed.id]) {
              <div class="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/30 text-white text-xs shadow-lg animate-in slide-in-from-bottom-2">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span class="font-mono font-semibold tracking-wider">REC</span>
              </div>
            }
          </div>
        </div>
      </ng-template>

    </div>
  `
})
export class CameraBatchListComponent {
  route = inject(ActivatedRoute);

  columns: TableColumn<CameraBatchItem>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'batchInfo', label: 'Batch Name & Code', width: 'min-w-[240px]', type: 'custom' },
    { key: 'sdcTpInfo', label: 'SDC Center & TP', width: 'min-w-[260px]', type: 'custom' },
    { key: 'branch', label: 'Branch', width: 'w-32', type: 'custom' },
    { key: 'cameraStatus', label: 'Camera Status', align: 'center', width: 'min-w-[160px]', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-36', type: 'custom' }
  ];

  batches = signal<CameraBatchItem[]>([
    {
      id: 'B-001',
      batchName: 'Batch 1',
      batchCode: 'B-26-0001',
      sdcName: 'SDC 1',
      tpName: 'TP 1',
      branch: 'Jaipur',
      cameraStatus: 'Configured (4 Cameras)'
    },
    {
      id: 'B-002',
      batchName: 'Batch 2',
      batchCode: 'B-26-0005',
      sdcName: 'SDC 1',
      tpName: 'TP 1',
      branch: 'Jaipur',
      cameraStatus: 'Configured (2 Cameras)'
    },
    {
      id: 'B-003',
      batchName: 'Batch 3',
      batchCode: 'B-26-0007',
      sdcName: 'SDC 1',
      tpName: 'TP 1',
      branch: 'Jaipur',
      cameraStatus: 'Configured (1 Camera)'
    }
  ]);

  // Modal State
  selectedFeed = signal<CameraBatchItem | null>(null);
  isMultiView = signal<boolean>(false);
  multiSelectedBatches = signal<CameraBatchItem[]>([]);
  showSidebar = signal<boolean>(true);
  
  // Video Options State
  recordingStates = signal<Record<string, boolean>>({});
  zoomedStates = signal<Record<string, boolean>>({});
  panStates = signal<Record<string, {x: number, y: number, isDragging: boolean, startX: number, startY: number}>>({});

  openFeed(item: CameraBatchItem) {
    this.selectedFeed.set(item);
    this.isMultiView.set(false);
    this.multiSelectedBatches.set([item]);
  }

  closeModal() {
    this.selectedFeed.set(null);
    this.isMultiView.set(false);
    this.recordingStates.set({});
    this.zoomedStates.set({});
    this.panStates.set({});
  }

  toggleMultiView() {
    if (this.isMultiView()) {
      this.showSidebar.set(!this.showSidebar());
    } else {
      this.isMultiView.set(true);
      this.showSidebar.set(true);
    }
  }

  closeSidebarIfOpen() {
    if (this.isMultiView() && this.showSidebar()) {
      this.showSidebar.set(false);
    }
  }

  toggleBatchSelection(batch: CameraBatchItem) {
    const current = this.multiSelectedBatches();
    const exists = current.find(b => b.id === batch.id);
    if (exists) {
      this.multiSelectedBatches.set(current.filter(b => b.id !== batch.id));
    } else {
      this.multiSelectedBatches.set([...current, batch]);
    }
  }

  isBatchSelected(batch: CameraBatchItem) {
    return !!this.multiSelectedBatches().find(b => b.id === batch.id);
  }

  getGridClass() {
    const count = this.multiSelectedBatches().length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }

  toggleRecord(batchId: string) {
    const current = this.recordingStates();
    const isRec = !!current[batchId];
    this.recordingStates.set({ ...current, [batchId]: !isRec });
    
    if (isRec) {
      this.downloadRecording(batchId);
    }
  }

  downloadRecording(batchId: string) {
    const a = document.createElement('a');
    a.href = 'https://www.w3schools.com/html/mov_bbb.mp4';
    a.download = `Batch_Recording_${batchId}_${new Date().getTime()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  toggleZoom(batchId: string) {
    const currentZoom = this.zoomedStates();
    const isNowZoomed = !currentZoom[batchId];
    this.zoomedStates.set({ ...currentZoom, [batchId]: isNowZoomed });

    // Reset pan position if zoomed out
    if (!isNowZoomed) {
      const currentPan = this.panStates();
      if (currentPan[batchId]) {
        this.panStates.set({
          ...currentPan,
          [batchId]: { ...currentPan[batchId], x: 0, y: 0 }
        });
      }
    }
  }

  // --- Pan Logic ---
  getTransform(feedId: string) {
    const isZoomed = this.zoomedStates()[feedId];
    const pan = this.panStates()[feedId] || { x: 0, y: 0 };
    if (isZoomed) {
      return `scale(1.5) translate(${pan.x / 1.5}px, ${pan.y / 1.5}px)`;
    }
    return 'scale(1) translate(0px, 0px)';
  }

  isDragging(feedId: string) {
    return this.panStates()[feedId]?.isDragging || false;
  }

  startPan(event: MouseEvent, feedId: string) {
    if (!this.zoomedStates()[feedId]) return;
    const current = this.panStates()[feedId] || { x: 0, y: 0, isDragging: false, startX: 0, startY: 0 };
    this.panStates.update(s => ({
      ...s,
      [feedId]: { ...current, isDragging: true, startX: event.clientX - current.x, startY: event.clientY - current.y }
    }));
  }

  doPan(event: MouseEvent, feedId: string) {
    const state = this.panStates()[feedId];
    if (!state?.isDragging) return;
    this.panStates.update(s => ({
      ...s,
      [feedId]: { ...state, x: event.clientX - state.startX, y: event.clientY - state.startY }
    }));
  }

  endPan(feedId: string) {
    const state = this.panStates()[feedId];
    if (!state?.isDragging) return;
    this.panStates.update(s => ({
      ...s,
      [feedId]: { ...state, isDragging: false }
    }));
  }
}

