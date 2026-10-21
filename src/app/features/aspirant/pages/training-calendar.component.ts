import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  TableComponent,
  TableColumn,
  PageHeaderComponent,
  ActionModalComponent,
  ButtonComponent,
  IconComponent,
  InputDirective,
  PageShellComponent
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
    ActionModalComponent,
    ButtonComponent,
    IconComponent,
    InputDirective,
    PageShellComponent
  ],
  template: `
    <app-page-shell>

      <!-- ====================================================================
           1. TOP HERO HEADER (Using Reusable PageHeaderComponent with Rajasthan Banner)
           ==================================================================== -->
      <app-page-header
        title="Training Calendar"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Training Calendar' }]"
        [searchable]="true"
        searchPlaceholder="Search course, partner, SDC..."
        [(searchQuery)]="searchQuery"
      >
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">

          <!-- Dropdown Filter: District -->
          <div class="relative w-full sm:w-44 md:w-48 shrink-0">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10 flex items-center">
              <app-icon name="map-pin" size="sm" [stroke]="2" />
            </span>
            <select
              appInput
              size="sm"
              [ngModel]="selectedDistrict()"
              (ngModelChange)="selectedDistrict.set($event)"
              class="w-full pl-8 truncate"
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
              <app-icon name="chevron-down" size="sm" [stroke]="2" />
            </span>
          </div>

          <!-- Dropdown Filter: Sector -->
          <div class="relative w-full sm:w-48 md:w-56 shrink-0">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10 flex items-center">
              <app-icon name="suitcase" size="sm" [stroke]="2" />
            </span>
            <select
              appInput
              size="sm"
              [ngModel]="selectedSector()"
              (ngModelChange)="selectedSector.set($event)"
              class="w-full pl-8 truncate"
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
              <app-icon name="chevron-down" size="sm" [stroke]="2" />
            </span>
          </div>

          <!-- Reset Filters Button (visible when any filter or query is active) -->
          @if (hasActiveFilters()) {
            <button
              appButton
              size="sm"
              variant="danger"
              type="button"
              (click)="resetFilters()"
              class="shrink-0"
              title="Reset all filters"
            >
              <app-icon name="refresh" size="sm" [stroke]="2" />
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
              <app-icon name="filter" size="sm" [stroke]="2" class="text-slate-500" />
              Active Filters:
            </span>

            @if (selectedDistrict()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                <span>District: <strong class="font-semibold">{{ selectedDistrict() }}</strong></span>
                <button
                  appButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  (click)="clearDistrictFilter()"
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
                  appButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  (click)="clearSectorFilter()"
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
                  appButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  (click)="clearSearch()"
                  title="Clear search text"
                >
                  ✕
                </button>
              </span>
            }

            <button
              appButton
              variant="ghost"
              size="sm"
              type="button"
              (click)="resetFilters()"
              class="ml-1"
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
            <app-icon name="check" size="sm" [stroke]="2.5" class="text-emerald-600" />
            <span>Expressed</span>
          </span>
        } @else {
          <button
            appButton
            size="sm"
            type="button"
            (click)="onExpressInterestClick(item)"
            class="whitespace-nowrap"
          >
            <span>Express Interest</span>
            <app-icon name="forward" size="sm" />
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

    </app-page-shell>
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
