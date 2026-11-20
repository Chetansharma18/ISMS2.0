import { ChangeDetectionStrategy, Component, computed, signal, inject, HostListener, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn,
  ButtonComponent,
  IconComponent,
  ModalComponent,
  PageShellComponent
} from '../../../shared';
import { environment } from '../../../../environments/environment';
import { SdcCameraFeed, SdcMonitoringItem } from '../../../core/models/camera.model';

@Component({
  selector: 'app-camera-sdc-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    PageShellComponent
  ],
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
            configuredFeeds: configuredFeedsTemplate,
            cameraStatus: cameraStatusTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #sdcInfoTemplate let-item>
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-snug">
              {{ item.name }}
            </div>
            <div class="text-[11.5px] text-slate-500 mt-0.5 tabular-nums">
              Code: {{ item.code }} &bull; {{ item.tpName }}
            </div>
          </div>
        </ng-template>

        <ng-template #locationTemplate let-item>
          <div class="flex items-center gap-1.5 text-slate-600 text-[13px] font-normal justify-start">
            <app-icon name="map-pin" solid class="text-slate-400" />
            {{ item.location }}
          </div>
        </ng-template>

        <ng-template #configuredFeedsTemplate let-item>
          <span
            class="inline-flex items-center gap-1.5 text-[13px] font-normal tracking-wide"
            [class.text-green-700]="item.configuredFeeds > 0"
            [class.text-slate-400]="item.configuredFeeds === 0"
          >
            <app-icon name="video-camera" [solid]="item.configuredFeeds > 0" />
            {{ item.configuredFeeds }} Active Feeds
          </span>
        </ng-template>

        <ng-template #cameraStatusTemplate let-item>
          <div
            class="inline-flex items-center gap-1.5 text-[13px] font-normal tracking-wide"
            [class.text-green-700]="item.configuredFeeds > 0"
            [class.text-slate-500]="item.configuredFeeds === 0"
          >
            <div
              class="w-1.5 h-1.5 rounded-full"
              [class.bg-green-700]="item.configuredFeeds > 0"
              [class.bg-slate-400]="item.configuredFeeds === 0"
            ></div>
            {{ item.cameraStatus }}
          </div>
        </ng-template>

        <ng-template #actionTemplate let-item>
          @if (item.configuredFeeds > 0) {
            <button
              appButton
              size="sm"
              (click)="openSdcLiveFeed(item)"
            >
              <app-icon name="video-camera" size="sm" solid />
              <span>Open Live Feed</span>
            </button>
          } @else {
            <button
              appButton
              variant="ghost"
              size="sm"
              disabled
            >
              <span class="text-slate-400">No Feeds</span>
            </button>
          }
        </ng-template>

        <!-- Live Feed Modal -->
        @if (selectedSdc()) {
          <app-modal
            [title]="'Live Camera Monitoring - ' + selectedSdc()!.name + ' (' + selectedSdc()!.location + ') • ' + selectedSdc()!.tpName"
            widthOverride="max-w-[96vw]"
            [scrollBody]="false"
            [closeOnBackdrop]="false"
            (close)="closeModal()"
          >
            <!-- Modal Top Action Toolbar -->
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-red-600 text-white animate-pulse">
                  Live
                </span>
                <span class="text-sm font-bold text-slate-800">
                  {{ selectedSdc()!.name }}
                </span>
                <span class="text-xs text-slate-500">
                  &bull; {{ selectedSdc()!.location }} &bull; {{ selectedSdc()!.tpName }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
                  {{ multiSelectedCameras().length }} of {{ selectedSdc()!.cameras.length }} Feeds Active
                </span>
              </div>
              <div class="flex items-center gap-2">
                <!-- Toggle Cameras Sidebar Button -->
                <button
                  appButton
                  [variant]="showSidebar() ? 'primary' : 'outline'"
                  size="sm"
                  (click)="showSidebar.update(v => !v)"
                  title="Toggle Cameras List"
                >
                  <app-icon name="camera" size="sm" />
                  <span>{{ showSidebar() ? 'Hide Camera List' : 'Select Cameras (' + multiSelectedCameras().length + '/' + selectedSdc()!.cameras.length + ')' }}</span>
                </button>

                <!-- Toggle Single / Multi View -->
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  (click)="toggleMultiView()"
                >
                  <app-icon [name]="isMultiView() ? 'expand' : 'squares-grid'" size="sm" [stroke]="2" />
                  <span>{{ isMultiView() ? 'Single View' : 'Multi View Grid' }}</span>
                </button>
              </div>
            </div>

            <!-- Modal Body: Side-by-side flex layout (Sidebar never overlays videos) -->
            <div class="flex h-[74vh] overflow-hidden bg-slate-950 relative rounded-xl border border-slate-800">

              <!-- Left Sidebar: SDC Cameras Checklist (Side-by-side flex child, NOT absolute) -->
              @if (showSidebar()) {
                <div class="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 animate-in slide-in-from-left duration-150 z-20">
                  <div class="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                    <div>
                      <span class="font-bold text-white text-sm block">SDC Cameras</span>
                      <span class="text-[11px] text-slate-400 block">{{ selectedSdc()!.name }} &bull; {{ selectedSdc()!.location }}</span>
                    </div>
                    <button appButton variant="ghost" size="sm" iconOnly aria-label="Hide sidebar" (click)="showSidebar.set(false)">
                      <app-icon name="chevron-left" size="lg" />
                    </button>
                  </div>
                  <div class="p-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs bg-slate-900/40">
                    <button appButton variant="ghost" size="sm" (click)="selectAllCameras()">Select All</button>
                    <button appButton variant="ghost" size="sm" (click)="clearCameraSelection()">Clear</button>
                  </div>
                  <div class="flex-1 overflow-y-auto p-2 space-y-1.5">
                    @for (c of selectedSdc()!.cameras; track c.id) {
                      <label class="flex items-start gap-2.5 p-2.5 hover:bg-slate-900/90 rounded-lg cursor-pointer transition-colors border"
                             [class.bg-slate-900]="isCameraSelected(c)" [class.border-sky-500/50]="isCameraSelected(c)" [class.border-slate-800/80]="!isCameraSelected(c)">
                        <input type="checkbox" class="mt-0.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 cursor-pointer"
                               [checked]="isCameraSelected(c)"
                               (change)="toggleCameraSelection(c)" />
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-semibold text-white leading-tight truncate">{{ c.cameraName }}</span>
                          <span class="text-[11px] text-slate-400 mt-0.5">{{ c.locationInCenter }}</span>
                          <div class="flex items-center gap-1.5 mt-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span class="text-[10.5px] text-emerald-400 font-medium">{{ c.status }} &bull; {{ c.cameraCode }}</span>
                          </div>
                        </div>
                      </label>
                    }
                  </div>
                </div>
              }

              <!-- Main Video Area -->
              <div class="flex-1 min-w-0 p-3 sm:p-4 overflow-y-auto bg-slate-900 relative h-full flex flex-col justify-between">
                @if (isMultiView()) {
                  @if (multiSelectedCameras().length === 0) {
                    <div class="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                      <app-icon name="video" size="auto" [stroke]="1.5" class="w-16 h-16 mb-4 opacity-40 text-slate-500" />
                      <p class="font-medium text-sm text-slate-300">All camera feeds are currently deselected.</p>
                      <p class="text-xs text-slate-500 mt-1">Select cameras from the sidebar or click below to view all feeds.</p>
                      <button appButton variant="outline" size="sm" (click)="selectAllCameras()" class="mt-4">
                        <app-icon name="video-camera" size="sm" />
                        <span>Show All Cameras ({{ selectedSdc()!.cameras.length }})</span>
                      </button>
                    </div>
                  } @else {
                    <div class="grid gap-3 sm:gap-4 h-full" [ngClass]="getGridClass()">
                      @for (c of multiSelectedCameras(); track c.id; let idx = $index) {
                        <ng-container *ngTemplateOutlet="videoPlayerTpl; context: { $implicit: c, itemClass: getItemClass(multiSelectedCameras().length, idx) }"></ng-container>
                      }
                    </div>
                  }
                } @else {
                  <!-- Single View with Bottom Camera Selector Strip -->
                  <div class="w-full h-full max-w-6xl mx-auto flex flex-col justify-between space-y-3">
                    <div class="flex-1 min-h-0">
                      @if (selectedFeed()) {
                        <ng-container *ngTemplateOutlet="videoPlayerTpl; context: { $implicit: selectedFeed()!, itemClass: 'h-full' }"></ng-container>
                      }
                    </div>

                    <!-- Single View: Bottom Camera Selector Strip -->
                    <div class="flex items-center justify-center gap-2 overflow-x-auto py-1 shrink-0">
                      @for (c of selectedSdc()!.cameras; track c.id) {
                        <button
                          appButton
                          [variant]="selectedFeed()?.id === c.id ? 'primary' : 'outline'"
                          size="sm"
                          (click)="selectedFeed.set(c)"
                          class="shrink-0"
                        >
                          <app-icon name="video-camera" size="xs" [solid]="selectedFeed()?.id === c.id" />
                          <span>{{ c.cameraName }}</span>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </app-modal>
        }

        <!-- Reusable Video Player Template -->
        <ng-template #videoPlayerTpl let-feed let-itemClass="itemClass">
          <div #videoContainer [ngClass]="itemClass" class="relative w-full h-full min-h-[180px] bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col group select-none">

            <!-- Video Header Overlay (Clean dark gradient) -->
            <div class="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-10 flex items-start justify-between pointer-events-none">
              <div class="text-white drop-shadow-md">
                <div class="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2">
                  <span>{{ feed.cameraName }}</span>
                </div>
                <div class="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>{{ feed.locationInCenter }} &bull; {{ feed.sdcName }} ({{ feed.branch }})</span>
                </div>
              </div>
            </div>

            <!-- Floating Action Buttons (Top Right) -->
            <div class="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150" (click)="$event.stopPropagation()">
              <!-- Focus / Enlarge Button -->
              @if (isMultiView()) {
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  iconOnly
                  (click)="focusCamera(feed)"
                  title="Focus on this Camera"
                  aria-label="Focus on this Camera"
                >
                  <app-icon name="expand" [stroke]="2" />
                </button>
              } @else {
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  iconOnly
                  (click)="toggleMultiView()"
                  title="Return to Grid View"
                  aria-label="Return to Grid View"
                >
                  <app-icon name="squares-grid" [stroke]="2" />
                </button>
              }

              <!-- Zoom/Pan Toggle Button -->
              <button
                appButton
                [variant]="zoomedStates()[feed.id] ? 'primary' : 'outline'"
                size="sm"
                iconOnly
                (click)="toggleZoom(feed.id)"
                title="Toggle Zoom & Pan"
                aria-label="Toggle Zoom & Pan"
              >
                <app-icon name="zoom-in" [stroke]="2" />
              </button>

              <!-- Mute/Unmute Toggle Button -->
              <button
                appButton
                [variant]="!isMuted(feed.id) ? 'primary' : 'outline'"
                size="sm"
                iconOnly
                (click)="toggleMute(feed.id, videoEl)"
                [title]="isMuted(feed.id) ? 'Unmute Audio' : 'Mute Audio'"
                [attr.aria-label]="isMuted(feed.id) ? 'Unmute Audio' : 'Mute Audio'"
              >
                @if (isMuted(feed.id)) {
                  <app-icon name="volume-off" [stroke]="2" />
                } @else {
                  <app-icon name="volume-on" [stroke]="2" />
                }
              </button>

              <!-- View Recorded Clip Button (if available) -->
              @if (lastRecordedUrls()[feed.id]) {
                <button
                  appButton
                  size="sm"
                  (click)="openRecordingPreview(feed)"
                  title="Preview Recorded Video"
                >
                  <app-icon name="play" size="sm" solid />
                  <span>Recording</span>
                </button>
              }

              <!-- Record Button -->
              <button
                appButton
                size="sm"
                (click)="toggleRecord(feed.id, videoEl)"
                [variant]="recordingStates()[feed.id] ? 'danger' : 'outline'"
                title="Record Feed"
              >
                <div class="w-2 h-2 rounded-full" [class.bg-white]="recordingStates()[feed.id]" [class.bg-red-600]="!recordingStates()[feed.id]" [class.animate-pulse]="recordingStates()[feed.id]"></div>
                <span>{{ recordingStates()[feed.id] ? 'Stop' : 'REC' }}</span>
              </button>
            </div>

            <!-- Video Element with Drag-to-Pan support -->
            <div class="flex-1 relative overflow-hidden bg-black flex items-center justify-center cursor-default"
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
                [style.transition]="isDragging(feed.id) ? 'none' : 'transform 0.25s ease'"
              ></video>

              <!-- Recording indicator on video -->
              @if (recordingStates()[feed.id]) {
                <div class="absolute bottom-9 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-red-500/40 text-white text-[11px] shadow-lg animate-in slide-in-from-bottom-2 z-30">
                  <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span class="tabular-nums font-bold tracking-wider text-red-400">REC</span>
                </div>
              }

              <!-- CCTV On-Screen Display (OSD) Overlay -->
              <div class="absolute bottom-2.5 left-3 right-3 pointer-events-none flex items-center justify-between text-[11px] text-white/90 drop-shadow-md z-10 tabular-nums tracking-wider">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span class="font-bold text-white">{{ feed.cameraCode || 'CAM' }}</span>
                  <span class="text-white/40">&bull;</span>
                  <span class="tabular-nums text-white/90">{{ liveClock() }}</span>
                </div>
                <div class="flex items-center gap-2 text-white/70 text-[10.5px]">
                  <span>1080P</span>
                  <span class="text-white/40">&bull;</span>
                  <span>30 FPS</span>
                </div>
              </div>

              <!-- Bottom Controls (Fullscreen) -->
              <div class="absolute bottom-2.5 right-2.5 z-30 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  iconOnly
                  (click)="toggleFullScreen(videoContainer)"
                  title="Toggle Full Screen"
                  aria-label="Toggle Full Screen"
                >
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
            [title]="'Recorded Video - ' + previewRecording()?.cameraName"
            size="lg"
            (close)="closeRecordingPreview()"
          >
            <div class="p-4 bg-black flex items-center justify-center rounded-lg">
              <video [src]="previewRecording()?.url" controls autoplay playsinline class="w-full max-h-[60vh] rounded-lg shadow-lg"></video>
            </div>
            <ng-container modalFooter>
              <span class="mr-auto text-xs text-slate-500">Clip recorded from live camera feed</span>
              <a appButton size="sm" [href]="previewRecording()?.url" [download]="'SDC_Recording_' + previewRecording()?.cameraId + '.mp4'">
                <app-icon name="download" size="sm" />
                <span>Download</span>
              </a>
            </ng-container>
          </app-modal>
        }
    </app-page-shell>
  `
})
export class CameraSdcListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  columns: TableColumn<SdcMonitoringItem>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'sdcInfo', label: 'Skill Development Center (SDC)', width: 'min-w-[240px]', type: 'custom' },
    { key: 'location', label: 'Branch / Location', width: 'min-w-[120px]', type: 'custom' },
    { key: 'configuredFeeds', label: 'Configured Feeds', align: 'center', type: 'custom' },
    { key: 'cameraStatus', label: 'Camera Status', align: 'center', width: 'min-w-[160px]', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-36', type: 'custom' }
  ];

  sdcs = signal<SdcMonitoringItem[]>(environment.useMockData ? [
    {
      id: 'SDC-001',
      name: 'SDC 1',
      code: 'SDC 001',
      tpId: 'TP-001',
      tpName: 'TP 1',
      location: 'Jaipur',
      configuredFeeds: 6,
      cameraStatus: 'Online (6 Cameras)',
      cameras: [
        {
          id: 'CAM-001-1',
          cameraName: 'Camera 1 - Classroom 101',
          cameraCode: 'CAM-01',
          locationInCenter: 'Theory Room A',
          sdcId: 'SDC-001',
          sdcName: 'SDC 1',
          tpName: 'TP 1',
          branch: 'Jaipur',
          status: 'Online'
        },
        {
          id: 'CAM-001-2',
          cameraName: 'Camera 2 - Computer Lab',
          cameraCode: 'CAM-02',
          locationInCenter: 'IT Domain Lab',
          sdcId: 'SDC-001',
          sdcName: 'SDC 1',
          tpName: 'TP 1',
          branch: 'Jaipur',
          status: 'Online'
        },
        {
          id: 'CAM-001-3',
          cameraName: 'Camera 3 - Practical Workshop',
          cameraCode: 'CAM-03',
          locationInCenter: 'Electronics Workshop',
          sdcId: 'SDC-001',
          sdcName: 'SDC 1',
          tpName: 'TP 1',
          branch: 'Jaipur',
          status: 'Online'
        },
        {
          id: 'CAM-001-4',
          cameraName: 'Camera 4 - Center Entrance',
          cameraCode: 'CAM-04',
          locationInCenter: 'Biometric Attendance Area',
          sdcId: 'SDC-001',
          sdcName: 'SDC 1',
          tpName: 'TP 1',
          branch: 'Jaipur',
          status: 'Online'
        },
        {
          id: 'CAM-001-5',
          cameraName: 'Camera 5 - Classroom 102',
          cameraCode: 'CAM-05',
          locationInCenter: 'Theory Room B',
          sdcId: 'SDC-001',
          sdcName: 'SDC 1',
          tpName: 'TP 1',
          branch: 'Jaipur',
          status: 'Online'
        },
        {
          id: 'CAM-001-6',
          cameraName: 'Camera 6 - Counseling & Admin',
          cameraCode: 'CAM-06',
          locationInCenter: 'Reception / Admin Office',
          sdcId: 'SDC-001',
          sdcName: 'SDC 1',
          tpName: 'TP 1',
          branch: 'Jaipur',
          status: 'Online'
        }
      ]
    },
    {
      id: 'SDC-002',
      name: 'SDC 2',
      code: 'SDC 002',
      tpId: 'TP-001',
      tpName: 'TP 1',
      location: 'Ajmer',
      configuredFeeds: 0,
      cameraStatus: 'No Feeds Configured',
      cameras: []
    },
    {
      id: 'SDC-003',
      name: 'SDC 3',
      code: 'SDC 003',
      tpId: 'TP-001',
      tpName: 'TP 1',
      location: 'Jodhpur',
      configuredFeeds: 2,
      cameraStatus: 'Online (2 Cameras)',
      cameras: [
        {
          id: 'CAM-003-1',
          cameraName: 'Camera 1 - Main Classroom',
          cameraCode: 'CAM-01',
          locationInCenter: 'Domain Training Room',
          sdcId: 'SDC-003',
          sdcName: 'SDC 3',
          tpName: 'TP 1',
          branch: 'Jodhpur',
          status: 'Online'
        },
        {
          id: 'CAM-003-2',
          cameraName: 'Camera 2 - Domain Practical Lab',
          cameraCode: 'CAM-02',
          locationInCenter: 'Practical Lab',
          sdcId: 'SDC-003',
          sdcName: 'SDC 3',
          tpName: 'TP 1',
          branch: 'Jodhpur',
          status: 'Online'
        }
      ]
    }
  ] : []);

  searchQuery = signal('');

  filteredSdcs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tpIdParam = this.route.snapshot.paramMap.get('tpId');
    let list = this.sdcs();
    if (tpIdParam) {
      const matched = list.filter(s => s.tpId === tpIdParam);
      if (matched.length > 0) {
        list = matched;
      }
    }
    if (!q) return list;
    return list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.tpName.toLowerCase().includes(q)
    );
  });

  // Modal State
  selectedSdc = signal<SdcMonitoringItem | null>(null);
  selectedFeed = signal<SdcCameraFeed | null>(null);
  isMultiView = signal<boolean>(true);
  multiSelectedCameras = signal<SdcCameraFeed[]>([]);
  showSidebar = signal<boolean>(false); // Closed by default to keep video grid fully open!

  // Clock Overlay State
  readonly liveClock = signal<string>('');
  private clockTimer: ReturnType<typeof setInterval> | null = null;

  // Video Options State
  recordingStates = signal<Record<string, boolean>>({});
  lastRecordedUrls = signal<Record<string, string>>({});
  previewRecording = signal<{ cameraId: string; cameraName: string; url: string } | null>(null);
  zoomedStates = signal<Record<string, boolean>>({});
  panStates = signal<Record<string, { x: number; y: number; isDragging: boolean; startX: number; startY: number }>>({});
  mutedStates = signal<Record<string, boolean>>({});
  isFullscreen = signal<boolean>(false);

  private mediaRecorders = new Map<string, MediaRecorder>();
  private recordedChunks = new Map<string, Blob[]>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.closeModal();
    });
  }

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

  openSdcLiveFeed(sdc: SdcMonitoringItem) {
    this.selectedSdc.set(sdc);
    this.multiSelectedCameras.set([...sdc.cameras]);
    this.selectedFeed.set(sdc.cameras[0] || null);
    this.isMultiView.set(sdc.cameras.length > 1);
    this.showSidebar.set(false); // Clean unobstructed view by default!
    this.startClock();
  }

  focusCamera(camera: SdcCameraFeed) {
    this.selectedFeed.set(camera);
    this.isMultiView.set(false);
  }

  closeModal() {
    this.selectedSdc.set(null);
    this.selectedFeed.set(null);
    this.isMultiView.set(false);
    this.showSidebar.set(false);
    this.stopClock();
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

  private startClock() {
    this.updateClock();
    if (!this.clockTimer) {
      this.clockTimer = setInterval(() => this.updateClock(), 1000);
    }
  }

  private stopClock() {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
  }

  private updateClock() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(now.getDate());
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    this.liveClock.set(`${day}-${month}-${year} ${hours}:${minutes}:${seconds}`);
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
      this.isMultiView.set(false);
      if (!this.selectedFeed() && this.multiSelectedCameras().length > 0) {
        this.selectedFeed.set(this.multiSelectedCameras()[0]);
      }
    } else {
      this.isMultiView.set(true);
    }
  }

  toggleCameraSelection(camera: SdcCameraFeed) {
    const current = this.multiSelectedCameras();
    const exists = current.find(c => c.id === camera.id);
    if (exists) {
      this.multiSelectedCameras.set(current.filter(c => c.id !== camera.id));
    } else {
      this.multiSelectedCameras.set([...current, camera]);
    }
  }

  isCameraSelected(camera: SdcCameraFeed) {
    return !!this.multiSelectedCameras().find(c => c.id === camera.id);
  }

  selectAllCameras() {
    const sdc = this.selectedSdc();
    if (sdc) {
      this.multiSelectedCameras.set([...sdc.cameras]);
    }
  }

  clearCameraSelection() {
    this.multiSelectedCameras.set([]);
  }

  getGridClass() {
    const count = this.multiSelectedCameras().length;
    if (count <= 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 auto-rows-fr';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 auto-rows-fr';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr';
  }

  getItemClass(count: number, index: number) {
    if (count === 3 && index === 0) {
      return 'col-span-1 sm:col-span-2 lg:col-span-1';
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

  toggleRecord(cameraId: string, videoEl?: HTMLVideoElement) {
    const isRec = !!this.recordingStates()[cameraId];
    if (isRec) {
      this.stopRecording(cameraId);
    } else {
      this.startRecording(cameraId, videoEl);
    }
  }

  private startRecording(cameraId: string, videoEl?: HTMLVideoElement) {
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
        this.recordingStates.update(s => ({ ...s, [cameraId]: true }));
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

        this.lastRecordedUrls.update(u => ({ ...u, [cameraId]: url }));

        const a = document.createElement('a');
        a.href = url;
        a.download = `SDC_Recording_${cameraId}_${new Date().getTime()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      this.recordedChunks.set(cameraId, chunks);
      this.mediaRecorders.set(cameraId, recorder);
      recorder.start(250);
      this.recordingStates.update(s => ({ ...s, [cameraId]: true }));
    } catch (err) {
      console.error('Error starting live recording:', err);
      this.recordingStates.update(s => ({ ...s, [cameraId]: true }));
    }
  }

  private stopRecording(cameraId: string) {
    this.recordingStates.update(s => ({ ...s, [cameraId]: false }));
    const recorder = this.mediaRecorders.get(cameraId);
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      this.mediaRecorders.delete(cameraId);
    } else {
      this.downloadFallback(cameraId);
    }
  }

  private downloadFallback(cameraId: string) {
    const a = document.createElement('a');
    a.href = '/video.mp4';
    a.download = `SDC_Recording_${cameraId}_${new Date().getTime()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openRecordingPreview(feed: SdcCameraFeed) {
    const url = this.lastRecordedUrls()[feed.id];
    if (url) {
      this.previewRecording.set({
        cameraId: feed.id,
        cameraName: feed.cameraName,
        url
      });
    }
  }

  closeRecordingPreview() {
    this.previewRecording.set(null);
  }

  toggleZoom(cameraId: string) {
    const currentZoom = this.zoomedStates();
    const isNowZoomed = !currentZoom[cameraId];
    this.zoomedStates.set({ ...currentZoom, [cameraId]: isNowZoomed });

    if (!isNowZoomed) {
      const currentPan = this.panStates();
      if (currentPan[cameraId]) {
        this.panStates.set({
          ...currentPan,
          [cameraId]: { ...currentPan[cameraId], x: 0, y: 0 }
        });
      }
    }
  }

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
