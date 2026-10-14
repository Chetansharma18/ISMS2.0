import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  TableComponent,
  TableColumn,
  PageHeaderComponent,
  ActionModalComponent
} from '../../../shared';
import { AspirantPortalService, TrainingCalendarItem } from '../services/aspirant-portal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-training-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableComponent,
    PageHeaderComponent,
    ActionModalComponent
  ],
  template: `
    <div class="w-full min-h-full text-slate-800 font-sans p-4 sm:p-5 space-y-5" style="background-color: #ffffff; font-family: 'Inter', sans-serif;">

      <!-- ====================================================================
           1. TOP HERO HEADER (Using Reusable PageHeaderComponent with Rajasthan Banner)
           ==================================================================== -->
      <app-page-header
        title="Training Calendar"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Training Calendar' }]"
      >
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">

          <!-- Dropdown Filter: District -->
          <div class="relative w-full sm:w-44 md:w-48 shrink-0">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10 flex items-center">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <select
              [ngModel]="selectedDistrict()"
              (ngModelChange)="selectedDistrict.set($event)"
              class="w-full h-[38px] pl-8 pr-8 text-xs sm:text-[13px] text-slate-800 font-medium bg-white border rounded-lg shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer truncate transition-all"
              [class.border-navy]="selectedDistrict()"
              [class.ring-1]="selectedDistrict()"
              [class.ring-navy/20]="selectedDistrict()"
              [class.border-slate-300]="!selectedDistrict()"
              style="-webkit-appearance: none; -moz-appearance: none; appearance: none;"
              title="Filter by District"
              aria-label="Filter by District"
            >
              <option value="">All Districts</option>
              @for (d of availableDistricts(); track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select>
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10 flex items-center">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <!-- Dropdown Filter: Sector -->
          <div class="relative w-full sm:w-48 md:w-56 shrink-0">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10 flex items-center">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <select
              [ngModel]="selectedSector()"
              (ngModelChange)="selectedSector.set($event)"
              class="w-full h-[38px] pl-8 pr-8 text-xs sm:text-[13px] text-slate-800 font-medium bg-white border rounded-lg shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer truncate transition-all"
              [class.border-navy]="selectedSector()"
              [class.ring-1]="selectedSector()"
              [class.ring-navy/20]="selectedSector()"
              [class.border-slate-300]="!selectedSector()"
              style="-webkit-appearance: none; -moz-appearance: none; appearance: none;"
              title="Filter by Sector"
              aria-label="Filter by Sector"
            >
              <option value="">All Sectors</option>
              @for (s of availableSectors(); track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10 flex items-center">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <!-- Integrated Keyword Search Box -->
          <div class="w-full sm:w-auto min-w-0 sm:min-w-56 md:min-w-64 shrink-0">
            <div class="relative flex items-center h-[38px] bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Search course, partner, SDC..."
                class="w-full h-full pl-3 pr-2 text-xs sm:text-[13px] placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              @if (searchQuery().trim()) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="px-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xs"
                  title="Clear text search"
                >
                  ✕
                </button>
              }
              <button
                type="button"
                class="h-full px-3.5 bg-navy hover:bg-navy-dark text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Search"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Reset Filters Button (visible when any filter or query is active) -->
          @if (hasActiveFilters()) {
            <button
              type="button"
              (click)="resetFilters()"
              class="inline-flex items-center gap-1.5 h-[38px] px-3 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
              title="Reset all filters"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          }

        </div>
      </app-page-header>

      <!-- Active Filters Pill Bar (shown when any filter or query is active) -->
      @if (hasActiveFilters()) {
        <div class="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-600 transition-all">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Active Filters:
            </span>

            @if (selectedDistrict()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                <span>District: <strong class="font-semibold">{{ selectedDistrict() }}</strong></span>
                <button
                  type="button"
                  (click)="clearDistrictFilter()"
                  class="text-blue-600 hover:text-blue-900 cursor-pointer text-xs"
                  title="Remove district filter"
                >
                  ✕
                </button>
              </span>
            }

            @if (selectedSector()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
                <span>Sector: <strong class="font-semibold">{{ selectedSector() }}</strong></span>
                <button
                  type="button"
                  (click)="clearSectorFilter()"
                  class="text-indigo-600 hover:text-indigo-900 cursor-pointer text-xs"
                  title="Remove sector filter"
                >
                  ✕
                </button>
              </span>
            }

            @if (searchQuery().trim()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
                <span>Search: <strong class="font-semibold">"{{ searchQuery() }}"</strong></span>
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="text-slate-600 hover:text-slate-900 cursor-pointer text-xs"
                  title="Clear search text"
                >
                  ✕
                </button>
              </span>
            }

            <button
              type="button"
              (click)="resetFilters()"
              class="text-xs text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer ml-1"
            >
              Clear All
            </button>
          </div>

          <div class="text-[11px] text-slate-500 font-medium">
            Showing <strong class="font-semibold text-slate-800">{{ filteredBatches().length }}</strong> of {{ portalService.calendarItems().length }} training batches
          </div>
        </div>
      }

      <!-- ====================================================================
           2. TRAINING CALENDAR TABLE (Reusing Reusable TableComponent)
           ==================================================================== -->
      <app-table
        [columns]="calendarColumns"
        [data]="filteredBatches()"
        [pagination]="true"
        [pageSize]="pageSize"
        itemUnit="training batches"
        [emptyMessage]="hasActiveFilters() ? 'No training programs match your selected filters. Try adjusting your district or sector filter.' : 'No training programs available matching your search criteria.'"
        [customTemplates]="{
          course: courseTemplate,
          batchDate: batchDateTemplate,
          action: actionTemplate
        }"
      ></app-table>

      <!-- Custom Course Template -->
      <ng-template #courseTemplate let-item>
        <div>
          <span class="font-semibold text-slate-900 text-xs block">{{ item.course }}</span>
          <span class="text-[11px] text-slate-500">{{ item.sector }}</span>
        </div>
      </ng-template>

      <!-- Custom Batch Date Template -->
      <ng-template #batchDateTemplate let-item>
        <span class="font-medium text-slate-800 text-xs whitespace-nowrap">{{ item.batchDate }}</span>
      </ng-template>

      <!-- Custom Action Button Template (Express Interest) -->
      <ng-template #actionTemplate let-item>
        @if (portalService.isExpressed(item.id)) {
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Expressed</span>
          </span>
        } @else {
          <button
            type="button"
            (click)="onExpressInterestClick(item)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy hover:bg-[#07243c] text-white rounded-md text-xs font-medium cursor-pointer shadow-2xs transition-all active:scale-95 whitespace-nowrap"
          >
            <span>Express Interest</span>
            <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        }
      </ng-template>

      <!-- ====================================================================
           3. MODAL: OTR / PROFILE PROMPT (EXACTLY MATCHING NEW USER SCREENSHOT 1)
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showProfilePromptModal()"
        [showCloseButton]="false"
        [showAccentBar]="false"
        title="Complete Your Profile to Express Interest for Training"
        description="To participate in skill training programs and express interest in batches, please complete your candidate profile registration."
        primaryLabel="Complete Registration"
        secondaryLabel="Skip for Now"
        (primaryAction)="onGoToCompleteRegistration()"
        (secondaryAction)="dismissProfilePrompt()"
        (close)="dismissProfilePrompt()"
      ></app-action-modal>

      <!-- ====================================================================
           4. MODAL: PROFILE INCOMPLETE WARNING (ON CLICKING EXPRESS INTEREST)
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showProfileRequiredModal()"
        [showCloseButton]="true"
        [showAccentBar]="false"
        title="Complete Your Profile"
        description="Please complete your profile to express interest for training. Candidate particulars are required before expressing interest."
        primaryLabel="Complete Profile"
        secondaryLabel="Cancel"
        (primaryAction)="onProceedToCompleteProfile()"
        (secondaryAction)="showProfileRequiredModal.set(false)"
        (close)="showProfileRequiredModal.set(false)"
      ></app-action-modal>

      <!-- ====================================================================
           5. MODAL: CONFIRM EXPRESS INTEREST MODAL
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showConfirmExpressModal()"
        [showCloseButton]="true"
        [showAccentBar]="false"
        title="Confirm Expression of Interest"
        badge="Batch Admission Request"
        [description]="getConfirmExpressDescription()"
        primaryLabel="Express"
        secondaryLabel="Cancel"
        (primaryAction)="confirmExpressInterest()"
        (secondaryAction)="showConfirmExpressModal.set(false)"
        (close)="showConfirmExpressModal.set(false)"
      ></app-action-modal>

    </div>
  `
})
export class TrainingCalendarComponent implements OnInit {
  protected readonly portalService = inject(AspirantPortalService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  readonly searchQuery = signal('');
  readonly selectedDistrict = signal('');
  readonly selectedSector = signal('');
  readonly pageSize = 6;

  readonly isProfileComplete = this.portalService.isProfileComplete;

  readonly showProfilePromptModal = signal<boolean>(false);
  readonly showProfileRequiredModal = signal<boolean>(false);
  readonly showConfirmExpressModal = signal<boolean>(false);
  readonly selectedBatchForInterest = signal<TrainingCalendarItem | null>(null);

  private promptDismissed = false;

  readonly calendarColumns: TableColumn<TrainingCalendarItem>[] = [
    { key: '$index',           label: 'S. No.',            type: 'number', align: 'center', width: 'w-12' },
    { key: 'district',         label: 'District',          cellClass: 'whitespace-nowrap font-normal text-slate-800' },
    { key: 'sector',           label: 'Sector',            cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'course',           label: 'Course',            cellClass: 'min-w-[200px]', type: 'custom' },
    { key: 'trainingPartner',  label: 'Training Partner',  cellClass: 'min-w-[180px] font-normal text-slate-800' },
    { key: 'sdcName',          label: 'SDC Name',          cellClass: 'min-w-[180px] font-normal text-slate-700' },
    { key: 'batchDate',        label: 'Batch Date',        align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'batchTime',        label: 'Batch Time',        align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'action',           label: 'Action',            align: 'center', width: 'w-36', type: 'custom' }
  ];

  readonly availableDistricts = computed(() => {
    const items = this.portalService.calendarItems();
    const set = new Set<string>();
    for (const item of items) {
      if (item.district) set.add(item.district.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  readonly availableSectors = computed(() => {
    const items = this.portalService.calendarItems();
    const set = new Set<string>();
    for (const item of items) {
      if (item.sector) set.add(item.sector.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  readonly hasActiveFilters = computed(() => {
    return !!this.selectedDistrict() || !!this.selectedSector() || !!this.searchQuery().trim();
  });

  readonly filteredBatches = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const district = this.selectedDistrict().trim().toLowerCase();
    const sector = this.selectedSector().trim().toLowerCase();
    const items = this.portalService.calendarItems();

    return items.filter(b => {
      const matchDistrict = !district || b.district.trim().toLowerCase() === district;
      const matchSector = !sector || b.sector.trim().toLowerCase() === sector;
      const matchQuery = !query ||
        b.district.toLowerCase().includes(query) ||
        b.sector.toLowerCase().includes(query) ||
        b.course.toLowerCase().includes(query) ||
        b.trainingPartner.toLowerCase().includes(query) ||
        b.sdcName.toLowerCase().includes(query);

      return matchDistrict && matchSector && matchQuery;
    });
  });

  resetFilters(): void {
    this.selectedDistrict.set('');
    this.selectedSector.set('');
    this.searchQuery.set('');
  }

  clearDistrictFilter(): void {
    this.selectedDistrict.set('');
  }

  clearSectorFilter(): void {
    this.selectedSector.set('');
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  ngOnInit(): void {
    this.evaluatePromptModal();

    this.route.queryParams.subscribe(params => {
      if (params['fromLogin'] === 'true') {
        this.evaluatePromptModal();
      }
    });
  }

  private evaluatePromptModal(): void {
    const isDismissed = this.storage.getSessionString('isms_aspirant_prompt_dismissed') === 'true' || this.promptDismissed;
    if (!this.isProfileComplete() && !isDismissed) {
      this.showProfilePromptModal.set(true);
    } else {
      this.showProfilePromptModal.set(false);
    }
  }

  dismissProfilePrompt(): void {
    this.showProfilePromptModal.set(false);
    this.promptDismissed = true;
    this.storage.setSessionString('isms_aspirant_prompt_dismissed', 'true');
  }

  onGoToCompleteRegistration(): void {
    this.dismissProfilePrompt();
    this.goToProfile();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  onExpressInterestClick(item: TrainingCalendarItem): void {
    if (!this.isProfileComplete()) {
      this.selectedBatchForInterest.set(item);
      this.showProfileRequiredModal.set(true);
      return;
    }

    this.selectedBatchForInterest.set(item);
    this.showConfirmExpressModal.set(true);
  }

  onProceedToCompleteProfile(): void {
    this.showProfileRequiredModal.set(false);
    this.goToProfile();
  }

  getConfirmExpressDescription(): string {
    const item = this.selectedBatchForInterest();
    if (!item) return 'Are you sure you want to express interest in this training program?';
    return `Are you sure to express interest in "${item.course}" (${item.sector}) at "${item.sdcName}", ${item.district}?`;
  }

  confirmExpressInterest(): void {
    const item = this.selectedBatchForInterest();
    if (!item) return;

    this.portalService.expressInterest(item);
    this.showConfirmExpressModal.set(false);
    this.notify.success(`Interest successfully expressed for ${item.course}!`);
  }
}
