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
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <!-- Integrated Search Box Matching Active Schemes Design -->
          <div class="w-full sm:w-auto min-w-0 sm:min-w-75 md:min-w-100">
            <div class="relative flex items-center bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search by district, sector, course, training partner..."
                class="w-full px-3.5 py-2 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                class="px-3.5 py-2.5 bg-navy hover:bg-navy-dark text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Search"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </app-page-header>


      <!-- ====================================================================
           2. TRAINING CALENDAR TABLE (Reusing Reusable TableComponent)
           ==================================================================== -->
      <app-table
        [columns]="calendarColumns"
        [data]="filteredBatches()"
        [pagination]="true"
        [pageSize]="pageSize"
        itemUnit="training batches"
        emptyMessage="No training programs available matching your search criteria."
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

  readonly filteredBatches = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const items = this.portalService.calendarItems();
    if (!query) return items;
    return items.filter(b =>
      b.district.toLowerCase().includes(query) ||
      b.sector.toLowerCase().includes(query) ||
      b.course.toLowerCase().includes(query) ||
      b.trainingPartner.toLowerCase().includes(query) ||
      b.sdcName.toLowerCase().includes(query)
    );
  });

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
