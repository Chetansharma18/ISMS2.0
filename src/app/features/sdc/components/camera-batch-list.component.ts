import { ChangeDetectionStrategy, Component, computed, signal, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn,
  ButtonComponent,
  IconComponent,
  ModalComponent,
  PageShellComponent
} from '../../../shared';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CameraBatchItem } from '../../../core/models/camera.model';
import { DataEngineService } from '../../../core/services/data-engine.service';

@Component({
  selector: 'app-camera-batch-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent,
    FormsModule,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    PageShellComponent
  ],
  template: `
    <app-page-shell>
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
          [searchable]="true"
          searchPlaceholder="Search batch name, code, SDC..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <app-table
          [columns]="columns"
          [data]="filteredBatches()"
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
            <div class="font-normal text-slate-800 text-[13px] leading-snug">
              {{ item.batchName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 tabular-nums">
              Code: {{ item.batchCode }}
            </div>
          </div>
        </ng-template>

        <ng-template #sdcTpInfoTemplate let-item>
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-snug">
              {{ item.sdcName }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 tabular-nums">
              TP: {{ item.tpName }}
            </div>
          </div>
        </ng-template>

        <ng-template #branchTemplate let-item>
          <div class="flex items-center gap-1.5 text-slate-600 text-[13px] font-normal justify-start">
            <app-icon name="map-pin" solid class="text-slate-400" />
            {{ item.branch }}
          </div>
        </ng-template>

        <ng-template #cameraStatusTemplate let-item>
          <div class="inline-flex items-center gap-1.5 text-green-700 text-[13px] font-normal tracking-wide">
            <div class="w-1.5 h-1.5 rounded-full bg-green-700"></div>
            {{ item.cameraStatus }}
          </div>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <button
            appButton
            size="sm"
            (click)="openFeed(item)"
          >
            <app-icon name="video-camera" size="sm" solid />
            <span>Open Live Feed</span>
          </button>
        </ng-template>

      <!-- Live Feed Modal -->
      @if (selectedFeed() || isMultiView()) {
        <app-modal
          [title]="isMultiView() ? 'Multiple Live Feeds' : 'Live Feed - ' + selectedFeed()?.batchName"
          widthOverride="max-w-[95vw]"
          [scrollBody]="false"
          [closeOnBackdrop]="false"
          (close)="closeModal()"
        >
            @if (!isMultiView()) {
              <div class="mb-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse">
                  Live
                </span>
              </div>
            }

            <!-- Modal Body -->
            <div class="flex h-[65vh] overflow-hidden bg-slate-100 relative rounded-lg">
              
              <!-- Left Sidebar (Multi View Only) -->
              @if (isMultiView() && showSidebar()) {
                <div class="absolute left-0 top-0 bottom-0 z-10 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 animate-in slide-in-from-left duration-200 shadow-xl">
                  <div class="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span class="font-semibold text-slate-700 text-sm">Select Batches</span>
                    <button appButton variant="ghost" size="sm" iconOnly aria-label="Hide sidebar" (click)="showSidebar.set(false)">
                      <app-icon name="chevron-left" size="lg" />
                    </button>
                  </div>
                  <div class="flex-1 overflow-y-auto p-2 space-y-1">
                    @for (b of batches(); track b.id) {
                      <label class="flex items-start gap-2 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border"
                             [class.bg-blue-50]="isBatchSelected(b)" [class.border-blue-200]="isBatchSelected(b)" [class.border-transparent]="!isBatchSelected(b)">
                        <input type="checkbox" class="mt-0.5 rounded border-slate-300 text-navy focus:ring-navy cursor-pointer"
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
                      <app-icon name="video" size="auto" [stroke]="1.5" class="w-16 h-16 mb-4 opacity-50" />
                      <p class="font-medium">Select batches from the sidebar to view live feeds.</p>
                    </div>
                  } @else {
                    <div class="grid gap-3 sm:gap-4 h-full" [ngClass]="getGridClass()">
                      @for (b of multiSelectedBatches(); track b.id; let idx = $index) {
                        <ng-container *ngTemplateOutlet="videoPlayerTpl; context: { $implicit: b, itemClass: getItemClass(multiSelectedBatches().length, idx) }"></ng-container>
                      }
                    </div>
                  }
                } @else {
                  <!-- Single View -->
                  <div class="w-full h-full max-w-6xl mx-auto flex flex-col">
                    <ng-container *ngTemplateOutlet="videoPlayerTpl; context: { $implicit: selectedFeed(), itemClass: '' }"></ng-container>
                  </div>
                }
              </div>
            </div>
        </app-modal>
      }

      <!-- Reusable Video Player Template -->
      <ng-template #videoPlayerTpl let-feed let-itemClass="itemClass">
        <div #videoContainer [ngClass]="itemClass" class="relative w-full h-full min-h-62.5 bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col group">
          
          <!-- Video Header Overlay -->
          <div class="absolute top-0 left-0 right-0 p-3 bg-linear-to-b from-black/80 to-transparent z-10 flex items-start justify-between pointer-events-none">
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
            <button appButton variant="outline" size="sm" (click)="toggleMultiView()" title="Toggle Multi View / Batches">
              <app-icon name="squares-grid" size="sm" [stroke]="2" />
              <span>Multi View</span>
            </button>

            <!-- Zoom/Pan Toggle Button -->
            <button appButton [variant]="zoomedStates()[feed.id] ? 'primary' : 'outline'" size="sm" iconOnly (click)="toggleZoom(feed.id)" title="Toggle Zoom & Pan" aria-label="Toggle Zoom & Pan">
              <app-icon name="zoom-in" [stroke]="2" />
            </button>

            <!-- Mute/Unmute Toggle Button -->
            <button appButton [variant]="!isMuted(feed.id) ? 'primary' : 'outline'" size="sm" iconOnly (click)="toggleMute(feed.id, videoEl)"
                    [title]="isMuted(feed.id) ? 'Unmute Audio' : 'Mute Audio'"
                    [attr.aria-label]="isMuted(feed.id) ? 'Unmute Audio' : 'Mute Audio'">
              @if (isMuted(feed.id)) {
                <app-icon name="volume-off" [stroke]="2" />
              } @else {
                <app-icon name="volume-on" [stroke]="2" />
              }
            </button>

            <!-- View Recorded Clip Button (if available) -->
            @if (lastRecordedUrls()[feed.id]) {
              <button appButton size="sm" (click)="openRecordingPreview(feed)"
                      title="Preview Recorded Video">
                <app-icon name="play" size="sm" solid />
                <span>View Recording</span>
              </button>
            }

            <!-- Record Button -->
            <button appButton size="sm" (click)="toggleRecord(feed.id, videoEl)"
                    [variant]="recordingStates()[feed.id] ? 'danger' : 'outline'"
                    title="Record Feed">
              <div class="w-2 h-2 rounded-full" [class.bg-white]="recordingStates()[feed.id]" [class.bg-red-600]="!recordingStates()[feed.id]" [class.animate-pulse]="recordingStates()[feed.id]"></div>
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
              #videoEl
              src="/video.mp4" 
              autoplay 
              loop 
              [muted]="isMuted(feed.id)" 
              playsinline
              crossorigin="anonymous"
              class="w-full h-full object-cover origin-center pointer-events-none"
              [style.transform]="getTransform(feed.id)"
              [style.transition]="isDragging(feed.id) ? 'none' : 'transform 0.3s ease'"
            ></video>
            
            <!-- Recording indicator on video -->
            @if (recordingStates()[feed.id]) {
              <div class="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/30 text-white text-xs shadow-lg animate-in slide-in-from-bottom-2 z-30">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span class="tabular-nums font-semibold tracking-wider">REC</span>
              </div>
            }

            <!-- Bottom Controls (Mute & Fullscreen) -->
            <div class="absolute bottom-4 right-4 flex items-center gap-2 z-30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <!-- Mute Toggle Button -->
              <button appButton [variant]="!isMuted(feed.id) ? 'primary' : 'outline'" size="sm" iconOnly (click)="toggleMute(feed.id, videoEl)" [title]="isMuted(feed.id) ? 'Unmute Audio' : 'Mute Audio'" [attr.aria-label]="isMuted(feed.id) ? 'Unmute Audio' : 'Mute Audio'">
                @if (isMuted(feed.id)) {
                  <app-icon name="volume-off" [stroke]="2" />
                } @else {
                  <app-icon name="volume-on" [stroke]="2" />
                }
              </button>

              <!-- Fullscreen Toggle Button -->
              <button appButton variant="outline" size="sm" iconOnly (click)="toggleFullScreen(videoContainer)" title="Toggle Full Screen" aria-label="Toggle Full Screen">
                @if (isFullscreen()) {
                  <app-icon name="shrink" [stroke]="2" />
                } @else {
                  <app-icon name="expand" [stroke]="2" />
                }
              </button>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Recorded Video Preview Modal -->
      @if (previewRecording()) {
        <app-modal
          [title]="'Recorded Video - ' + previewRecording()?.batchName"
          size="lg"
          (close)="closeRecordingPreview()"
        >
          <div class="p-4 bg-black flex items-center justify-center rounded-lg">
            <video [src]="previewRecording()?.url" controls autoplay playsinline class="w-full max-h-[60vh] rounded-lg shadow-lg"></video>
          </div>
          <ng-container modalFooter>
            <span class="mr-auto text-xs text-slate-500">Clip recorded from live feed</span>
            <a appButton size="sm" [href]="previewRecording()?.url" [download]="'Batch_Recording_' + previewRecording()?.batchId + '.mp4'">
              <app-icon name="download" size="sm" />
              <span>Download</span>
            </a>
            <button appButton variant="outline" size="sm" (click)="closeRecordingPreview()">
              Close
            </button>
          </ng-container>
        </app-modal>
      }

    </app-page-shell>
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

  batches = signal<CameraBatchItem[]>([]);
  searchQuery = signal<string>('');

  filteredBatches = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.batches();
    return this.batches().filter(b =>
      (b.batchName && b.batchName.toLowerCase().includes(q)) ||
      (b.batchCode && b.batchCode.toLowerCase().includes(q)) ||
      (b.sdcName && b.sdcName.toLowerCase().includes(q)) ||
      (b.tpName && b.tpName.toLowerCase().includes(q)) ||
      (b.branch && b.branch.toLowerCase().includes(q))
    );
  });

  constructor() {
    inject(DataEngineService)
      .for<CameraBatchItem>('CAMERA_BATCHES')
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe(list => this.batches.set(list));
  }

  // Modal State
  selectedFeed = signal<CameraBatchItem | null>(null);
  isMultiView = signal<boolean>(false);
  multiSelectedBatches = signal<CameraBatchItem[]>([]);
  showSidebar = signal<boolean>(true);
  
  // Video Options State
  recordingStates = signal<Record<string, boolean>>({});
  lastRecordedUrls = signal<Record<string, string>>({});
  previewRecording = signal<{ batchId: string; batchName: string; url: string } | null>(null);
  zoomedStates = signal<Record<string, boolean>>({});
  panStates = signal<Record<string, {x: number, y: number, isDragging: boolean, startX: number, startY: number}>>({});
  mutedStates = signal<Record<string, boolean>>({});
  isFullscreen = signal<boolean>(false);

  private mediaRecorders = new Map<string, MediaRecorder>();
  private recordedChunks = new Map<string, Blob[]>();

  @HostListener('document:fullscreenchange')
  onFullScreenChange() {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  toggleFullScreen(element: HTMLElement) {
    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  openFeed(item: CameraBatchItem) {
    this.selectedFeed.set(item);
    this.isMultiView.set(false);
    this.multiSelectedBatches.set([item]);
  }

  closeModal() {
    this.selectedFeed.set(null);
    this.isMultiView.set(false);
    this.mediaRecorders.forEach(rec => {
      if (rec.state !== 'inactive') {
        try { rec.stop(); } catch {}
      }
    });
    this.mediaRecorders.clear();
    this.recordingStates.set({});
    this.zoomedStates.set({});
    this.panStates.set({});
    this.mutedStates.set({});
    this.previewRecording.set(null);
  }

  isMuted(feedId: string): boolean {
    const s = this.mutedStates()[feedId];
    return s === undefined ? true : s;
  }

  toggleMute(feedId: string, videoEl?: HTMLVideoElement) {
    const nextMuted = !this.isMuted(feedId);
    this.mutedStates.update(s => ({ ...s, [feedId]: nextMuted }));
    if (videoEl) {
      videoEl.muted = nextMuted;
      if (!nextMuted) {
        videoEl.play().catch(() => {});
      }
    }
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
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-1 grid-rows-2';
    if (count === 3) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-2';
  }

  getItemClass(count: number, index: number) {
    if (count === 3 && index === 0) {
      return 'col-span-2 row-span-1';
    }
    return 'col-span-1';
  }

  private getRecorderOptions(): { mimeType?: string; ext: string } {
    if (typeof MediaRecorder === 'undefined') {
      return { ext: 'mp4' };
    }
    const candidates = [
      { mime: 'video/mp4;codecs=avc1', ext: 'mp4' },
      { mime: 'video/mp4', ext: 'mp4' },
      { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
      { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
      { mime: 'video/webm', ext: 'webm' }
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c.mime)) {
        return { mimeType: c.mime, ext: c.ext };
      }
    }
    return { ext: 'mp4' };
  }

  toggleRecord(batchId: string, videoEl?: HTMLVideoElement) {
    const isRec = !!this.recordingStates()[batchId];
    if (isRec) {
      this.stopRecording(batchId);
    } else {
      this.startRecording(batchId, videoEl);
    }
  }

  private startRecording(batchId: string, videoEl?: HTMLVideoElement) {
    try {
      let stream: MediaStream | null = null;
      if (videoEl) {
        const anyV = videoEl as any;
        if (typeof anyV.captureStream === 'function') {
          stream = anyV.captureStream(30);
        } else if (typeof anyV.mozCaptureStream === 'function') {
          stream = anyV.mozCaptureStream(30);
        }
      }

      if (!stream) {
        const videos = document.querySelectorAll('video');
        for (let i = 0; i < videos.length; i++) {
          const v = videos[i] as any;
          if (v && typeof v.captureStream === 'function') {
            stream = v.captureStream(30);
            break;
          }
        }
      }

      if (!stream || typeof MediaRecorder === 'undefined') {
        this.recordingStates.update(s => ({ ...s, [batchId]: true }));
        return;
      }

      const { mimeType, ext } = this.getRecorderOptions();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || mimeType || 'video/mp4';
        const blob = new Blob(chunks, { type: mime });
        const url = URL.createObjectURL(blob);

        // Store URL for in-app viewing
        this.lastRecordedUrls.update(u => ({ ...u, [batchId]: url }));

        // Download the recording
        const a = document.createElement('a');
        a.href = url;
        a.download = `Batch_Recording_${batchId}_${new Date().getTime()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      this.recordedChunks.set(batchId, chunks);
      this.mediaRecorders.set(batchId, recorder);
      recorder.start(250);
      this.recordingStates.update(s => ({ ...s, [batchId]: true }));
    } catch (err) {
      console.error('Error starting live recording:', err);
      this.recordingStates.update(s => ({ ...s, [batchId]: true }));
    }
  }

  private stopRecording(batchId: string) {
    this.recordingStates.update(s => ({ ...s, [batchId]: false }));
    const recorder = this.mediaRecorders.get(batchId);
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      this.mediaRecorders.delete(batchId);
    } else {
      this.downloadFallback(batchId);
    }
  }

  private downloadFallback(batchId: string) {
    const a = document.createElement('a');
    a.href = '/video.mp4';
    a.download = `Batch_Recording_${batchId}_${new Date().getTime()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openRecordingPreview(feed: CameraBatchItem) {
    const url = this.lastRecordedUrls()[feed.id];
    if (url) {
      this.previewRecording.set({
        batchId: feed.id,
        batchName: feed.batchName,
        url
      });
    }
  }

  closeRecordingPreview() {
    this.previewRecording.set(null);
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

