import { Component, DestroyRef, inject, signal, computed, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { EOI_WIZARD_STEP_COUNT, EoiDraft, EoiDraftService } from '../../core/services/eoi-draft.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { SchemeService } from './services/scheme.service';
import { ApiError } from '../../core/http/api-error';
import { HttpService } from '../../core/http/http.service';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { EoiDetail } from './services/eoi-config.model';
import {
  annexureItemsFrom,
  committeeErrorText,
  mergeCommitteePeople,
  toCommitteeAdmin,
  detailToForm,
  detailToScheme,
  docItemsFrom,
  mapSaveErrors,
  noticeDetailToScheme,
  schemeItemsFrom
} from './services/eoi-config.util';
import {
  TableComponent,
  ActionModalComponent,
  ButtonComponent,
  IconComponent,
  PageHeaderComponent,
  TableColumn,
  formatInr,
  MasterFilterBarComponent,
  MasterFilterConfig,
  StatusFilterOption
} from '../../shared';
import {
  SchemeMasterItem,
  SchemeCategoryMasterItem,
  DocMasterItem,
  AnnexureMasterItem
} from '../../core/models/admin-masters.model';
import { DataEngineService } from '../../core/services/data-engine.service';

import { SchemeDetailViewComponent } from './scheme-detail-view.component';
import { CommitteeAdmin, EoiAttachment, EoiDocumentItem, EoiFormData, EoiRequiredInfoItem, SchemeTender } from './tenders.models';
import {
  createEmptyEoiForm,
  isSchemeClosed,
  parseMasterEntriesByScheme,
  validateEoiFormComplete
} from './tenders-page/tenders-page.util';
import { StepperComponent, StepperStep } from '../../shared/components/stepper/stepper.component';
import { ConfigureEoiFormComponent } from './tenders-page/configure-eoi-form.component';
import { CommitteeAssignmentModalComponent } from './tenders-page/committee-assignment-modal.component';
import { OtrPromptModalComponent } from './tenders-page/otr-prompt-modal.component';
import { AttachmentUploadModalComponent } from './tenders-page/attachment-upload-modal.component';
import { CorrigendumModalComponent, CorrigendumSubmission } from './tenders-page/corrigendum-modal.component';
import { SchemeRowActionsComponent } from './tenders-page/scheme-row-actions.component';
import { SchemesHeaderComponent } from './tenders-page/schemes-header.component';

// Keep the historical import path working for other files.
export type { SchemeTender, EoiDocumentItem } from './tenders.models';

@Component({
  selector: 'app-tenders-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableComponent,
    ActionModalComponent,
    ButtonComponent,
    IconComponent,
    PageHeaderComponent,
    StepperComponent,
    SchemeDetailViewComponent,
    ConfigureEoiFormComponent,
    CommitteeAssignmentModalComponent,
    OtrPromptModalComponent,
    AttachmentUploadModalComponent,
    CorrigendumModalComponent,
    SchemeRowActionsComponent,
    SchemesHeaderComponent,
    MasterFilterBarComponent
  ],
  template: `
    <div class="w-full min-h-full text-slate-800 font-sans" style="background-color: #ffffff;">
      
      <!-- ====================================================================
           VIEW 1: CONFIGURE / EDIT EOI SCREEN (Full Page View)
           ==================================================================== -->
      @if (showConfigureScreen()) {
        <div class="p-4 sm:p-5 space-y-4 font-sans" style="background-color: #ffffff;">
          <app-page-header
            [title]="editingSchemeRefNo() ? 'Edit EOI Configuration' : 'Configure New EOI'"
            [breadcrumbs]="[
              { label: 'Home', url: '/' },
              { label: 'Active Schemes', url: '/admin/eoi-configuration' },
              { label: editingSchemeRefNo() ? 'Edit EOI' : 'Configure New EOI' }
            ]"
            [showBack]="true"
            (back)="closeConfigureScreen()"
            backTitle="Back to Active Schemes"
          >
          </app-page-header>

          <!-- Step progress card (Wizard Stepper - Full width border with centered steps) -->
          <div class="w-full">
            <app-stepper
              variant="wizard"
              ariaLabel="EOI Configuration Steps"
              [steps]="eoiWizardSteps"
              [currentStep]="eoiCurrentStep()"
              [completedSteps]="completedEoiSteps()"
              (stepClick)="goToEoiStep($event)"
            ></app-stepper>
          </div>

          <!-- Main Form Card Container - Styled exactly like Registration Form Box -->
          <div class="bg-white rounded-xl border border-[#D6E3F0] shadow-xs p-5 sm:p-7 space-y-6">

            <!-- Card Header Strip -->
            <div class="pb-4 border-b border-[#E8EEF5] flex items-center justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-lg sm:text-[19px] font-bold text-[#1E3A5F] m-0 leading-tight">
                  @if (eoiCurrentStep() === 1) {
                    {{ editingSchemeRefNo() ? 'Edit Expression of Interest' : 'Expression of Interest Details' }}
                  } @else {
                    Uploading Details
                  }
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  @if (eoiCurrentStep() === 1) {
                    {{ editingSchemeRefNo() ? 'Update scheme parameters and EOI details' : 'Enter the required scheme parameters and EOI details' }}
                  } @else {
                    Configure required supporting documents and annexures for proposal upload
                  }
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                @if (editingSchemeRefNo()) {
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2]">
                    Ref: {{ editingSchemeRefNo() }}
                  </span>
                }
                @if (eoiCurrentStep() === 1) {
                  <span class="text-xs text-slate-500 font-medium">
                    Required fields marked <span class="text-[#DC2626] font-bold">*</span>
                  </span>
                }
              </div>
            </div>

            <!-- Form Content Component -->
            <app-configure-eoi-form
              [activeStep]="eoiCurrentStep()"
              [data]="newEoiData"
              [submitted]="newEoiSubmitted()"
              [fileError]="fileError()"
              [isEditing]="!!editingSchemeRefNo()"
              [schemeNameOptions]="schemeNameOptions()"
              [schemeCategoryOptions]="schemeCategoryOptions()"
              [eoiCategoryOptions]="eoiCategoryOptions()"
              [requiredInfo]="eoiRequiredInfo"
              [schemeMasterItems]="schemeMasterItems()"
              [docMasterItems]="docMasterItems()"
              [annexureMasterItems]="annexureMasterItems()"
              [existingRefNos]="existingRefNos()"
              [currentRefNo]="editingSchemeRefNo()"
              [externalVersion]="eoiFormVersion()"
              (schemeChange)="onSchemeSelected($event)"
              (formChange)="onFormChange()"
              (attach)="openAttachmentModal()"
              (removeAttachment)="removeAttachment($event)"
              (addDocument)="addEoiDocument()"
              (removeDocument)="removeEoiDocument($event)"
              (addAnnexure)="addEoiAnnexure()"
              (removeAnnexure)="removeEoiAnnexure($event)"
            ></app-configure-eoi-form>

            <!-- Card Footer / Actions -->
            <div class="pt-5 border-t border-[#E8EEF5]">
              @if (eoiCurrentStep() === 1) {
                <div class="flex items-center justify-end w-full">
                  <button
                    appButton
                    variant="primary"
                    size="md"
                    type="button"
                    (click)="nextEoiStep()"
                  >
                    <span>Next: Uploading Details</span>
                    <app-icon name="chevron-right" />
                  </button>
                </div>
              } @else {
                <div class="flex items-center justify-between w-full gap-3">
                  <button
                    appButton
                    variant="outline"
                    size="md"
                    type="button"
                    [disabled]="isSubmitting()"
                    (click)="prevEoiStep()"
                  >
                    <app-icon name="chevron-left" />
                    <span>Back to Publish Details</span>
                  </button>
                  <button
                    appButton
                    variant="primary"
                    size="md"
                    type="button"
                    [disabled]="isSubmitting()"
                    (click)="submitNewEoi()"
                  >
                    <span>{{ editingSchemeRefNo() ? 'Update EOI' : 'Submit EOI' }}</span>
                    <app-icon name="chevron-right" />
                  </button>
                </div>
              }
            </div>

          </div>
        </div>
      } @else if (selectedScheme(); as s) {
        <!-- ====================================================================
             VIEW 2: SCHEME DETAILS VIEW (Tabular Layout matching Government eProcurement)
             ==================================================================== -->
        <app-scheme-detail-view
          [scheme]="s"
          [rfpDocs]="rfpDocsFor(s)"
          [annexures]="getSchemeAnnexures(s)"
          [requiredInfo]="getSchemeRequiredDocs(s)"
          [hideApplyButton]="isSuperAdmin()"
          (back)="backToList()"
          (apply)="handleApplyForScheme()"
          (download)="downloadDoc($event)"
        ></app-scheme-detail-view>
      } @else {
        <!-- ====================================================================
           VIEW 3: ACTIVE EOI TABLE (Using Reusable PageHeader & DataTable)
           ==================================================================== -->
        <div class="p-4 sm:p-5 space-y-4 font-sans" style="background-color: #ffffff;">
          
          <app-schemes-header
            [(searchQuery)]="searchQuery"
            [suggestions]="searchSuggestions()"
            [isSuperAdmin]="isSuperAdmin()"
            (searchChange)="onSearchChange($event)"
            (configureEoi)="openConfigureScreen()"
          ></app-schemes-header>

          <!-- Schemes Filter Bar (Dropdown filters - NO BUTTONS) -->
          <app-master-filter-bar
            [(searchQuery)]="searchQuery"
            searchPlaceholder="Search by scheme name, ref no, category..."
            [(status)]="statusFilter"
            [showStatusFilter]="true"
            [statusOptions]="statusFilterOptions()"
            [filters]="schemeFilters()"
            [(filterValues)]="filterValues"
            (resetFilters)="resetFilters()"
          />

          <!-- Unfinished EOI applications of the signed-in applicant -->
          @for (draft of pendingDrafts(); track draft.refNo) {
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900"
              role="alert"
            >
              <p class="m-0 flex items-start gap-2 text-[13px] leading-snug">
                <app-icon name="warning-triangle" [stroke]="2" class="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong class="font-semibold">Application pending:</strong>
                  your EOI application for <strong class="font-semibold">{{ draft.schemeName }}</strong>
                  ({{ draft.refNo }}) is incomplete. You stopped at Step {{ draft.step }} of {{ draftStepCount }}.
                </span>
              </p>
              <button appButton size="sm" type="button" (click)="resumeApplication(draft.refNo)" class="shrink-0">
                Continue Application
              </button>
            </div>
          }

          <!-- Schemes Table via Reusable TableComponent -->
          <app-table
            [columns]="schemeColumns()"
            [data]="filteredSchemes()"
            [pagination]="true"
            [pageSize]="pageSize"
            [rowClass]="getRowClass"
            itemUnit="schemes"
            emptyMessage="No active schemes available matching your search query."
            [customTemplates]="{
              schemeName: schemeNameTemplate,
              closingDate: closingDateTemplate,
              eoiDescription: descTemplate,
              viewAction: viewActionTemplate
            }"
          >
          </app-table>

          <!-- Scheme name, with Government-style Blinking "NEW" / "Expired" badge and "pending" tag when the applicant left this application unfinished -->
          <ng-template #schemeNameTemplate let-item>
            <div class="flex items-start justify-between gap-2">
              <span class="text-slate-800 font-medium text-[13px] leading-snug">{{ item.schemeName }}</span>
              <div class="inline-flex items-center gap-1.5 shrink-0 pt-0.5">
                @if (isSchemeExpired(item)) {
                  <span
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200 shrink-0 shadow-2xs"
                    title="Scheme Expired &bull; Closing Date: {{ item.closingDate }}"
                  >
                    <app-icon name="clock" size="xs" class="text-rose-500 shrink-0" />
                    <span class="animate-blink font-extrabold text-rose-700">Expired</span>
                  </span>
                } @else if (isNewScheme(item)) {
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#DC2626] text-white shadow-xs animate-blink shrink-0"
                    title="Newly Added Scheme"
                  >
                    <app-icon name="bell" size="xs" class="text-white shrink-0" />
                    <span>NEW</span>
                  </span>
                }
                @if (draftFor(item.refNo); as draft) {
                  <span
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-amber-300 bg-amber-100 text-amber-800 text-[10px] font-semibold shrink-0"
                    title="Application Pending &bull; Step {{ draft.step }} of {{ draftStepCount }}"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
                    Pending
                  </span>
                }
              </div>
            </div>
          </ng-template>

          <!-- Custom Template for Closing Date -->
          <ng-template #closingDateTemplate let-item>
            <span class="text-slate-700 font-normal text-[12.5px] whitespace-nowrap">{{ item.closingDate }}</span>
          </ng-template>

          <ng-template #descTemplate let-item>
            <span class="line-clamp-2 text-[11px] leading-relaxed text-slate-600">
              {{ item.eoiDescription }}
            </span>
          </ng-template>

          <ng-template #viewActionTemplate let-item>
            <app-scheme-row-actions
              [item]="item"
              [isSuperAdmin]="isSuperAdmin()"
              [hasPendingApplication]="!!draftFor(item.refNo)"
              (viewScheme)="viewSchemeDetails($event)"
              (resumeScheme)="resumeApplication($event.refNo)"
              (manageCommittee)="openAddCommitteeModal($event)"
              (editScheme)="editScheme($event)"
              (toggleActive)="toggleActiveStatus($event)"
            ></app-scheme-row-actions>
          </ng-template>

        </div>
      }

      <!-- MODAL: CREATE COMMITTEE -->
      <app-committee-assignment-modal
        [isOpen]="showCommitteeModal()"
        [scheme]="selectedSchemeForCommittee()"
        [admins]="availableAdmins()"
        [serverError]="committeeError()"
        [saving]="committeeSaving()"
        (save)="saveCommittee($event)"
        (close)="closeCommitteeModal()"
      ></app-committee-assignment-modal>

      <!-- MODAL: ONE-TIME REGISTRATION (OTR) POPUP PROMPT -->
      <app-otr-prompt-modal
        [isOpen]="showOtrPromptModal()"
        (completeRegistration)="goToRegistration()"
        (dismiss)="dismissOtrPrompt()"
      ></app-otr-prompt-modal>

      <!-- MODAL: UPLOAD ATTACHMENT -->
      <app-attachment-upload-modal
        [isOpen]="showAttachmentModal()"
        (attachmentAdded)="onAttachmentAdded($event)"
        (close)="closeAttachmentModal()"
      ></app-attachment-upload-modal>

      <!-- MODAL: UPLOAD CORRIGENDUM (OPTIONAL FOR EDIT EOI) -->
      <app-corrigendum-modal
        [isOpen]="showCorrigendumModal()"
        (submitted)="submitCorrigendumAndSave($event)"
        (close)="closeCorrigendumModal()"
      ></app-corrigendum-modal>

      <!-- MODAL: CONFIRM SUBMIT EOI -->
      <app-action-modal
        [isOpen]="showConfirmSubmitEoiModal()"
        [showCloseButton]="false"
        title="Confirm Submission"
        description="Are you sure you want to submit this EOI configuration?"
        primaryLabel="Submit EOI"
        secondaryLabel="No, Cancel"
        (primaryAction)="confirmSubmitNewEoi()"
        (secondaryAction)="closeConfirmSubmitEoiModal()"
        (close)="closeConfirmSubmitEoiModal()"
      >
      </app-action-modal>

    </div>
  `
})
export class TendersPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private schemeService = inject(SchemeService);
  private storage = inject(StorageService);
  private destroyRef = inject(DestroyRef);

  private permissions = inject(PermissionService);
  readonly currentUser = this.authService.currentUser;

  readonly isProfileIncomplete = computed(() => this.permissions.hasRole('new_user'));

  private readonly http = inject(HttpService);
  private readonly dataEngine = inject(DataEngineService);
  /** EOI administration: the EOI Configuration route and the EoiNotices permission (from the backend). */
  readonly isSuperAdmin = computed(() => this.router.url.startsWith('/admin/eoi-configuration') && this.schemeService.isAdmin());
  readonly isNewOrExistingUser = computed(() => this.permissions.hasRole(['new_user', 'existing_user']));

  // Schemes reactive state managed via SchemeService (connected to central Mock/API engine)
  readonly schemes = this.schemeService.schemes;

  selectedScheme = signal<SchemeTender | null>(null);
  readonly showOtrPromptModal = signal<boolean>(false);
  readonly showConfigureScreen = signal<boolean>(false);
  /** Alias for backward compatibility */
  readonly showConfigureEoiModal = this.showConfigureScreen;
  readonly showConfirmSubmitEoiModal = signal<boolean>(false);
  readonly showCommitteeModal = signal<boolean>(false);
  readonly selectedSchemeForCommittee = signal<SchemeTender | null>(null);

  /** Stepper configuration for Configure / Edit EOI form wizard. */
  readonly eoiWizardSteps: StepperStep[] = [
    { label: 'Publish Details' },
    { label: 'Uploading Details' }
  ];
  readonly eoiCurrentStep = signal<number>(1);

  readonly completedEoiSteps = computed<number[]>(() => {
    const res: number[] = [];
    if (this.eoiCurrentStep() >= 2) {
      res.push(1);
    }
    return res;
  });

  /** People who can sit on a committee (backend committee-candidates), loaded when the dialog opens. */
  readonly availableAdmins = signal<CommitteeAdmin[]>([]);
  /** The backend's message when Save Committee was rejected (shown inside the dialog). */
  readonly committeeError = signal('');
  readonly committeeSaving = signal(false);
  private readonly notifications = inject(NotificationService);
  private promptDismissed = false;

  readonly schemeMasterItems = signal<SchemeMasterItem[]>([]);
  readonly docMasterItems = signal<DocMasterItem[]>([]);
  readonly annexureMasterItems = signal<AnnexureMasterItem[]>([]);
  readonly schemeMasterNames = signal<string[]>([]);
  readonly schemeCategoryNames = signal<string[]>([]);
  readonly eoiCategoryNames = signal<string[]>([]);

  /** Scheme names available in the "Configure New EOI" scheme dropdown (sourced from Scheme Master). */
  readonly schemeNameOptions = computed(() => {
    const list = [...this.schemeMasterNames()];
    const current = this.newEoiData?.scheme;
    if (current && !list.includes(current)) {
      list.unshift(current);
    }
    return list;
  });

  /** Scheme Category options for the "Configure New EOI" form (sourced from Scheme Category Master). */
  readonly schemeCategoryOptions = computed(() => {
    this.eoiFormVersion();
    const list = [...this.schemeCategoryNames()];
    // An EOI saved with a category that is no longer active still shows it.
    for (const current of (this.newEoiData?.schemeCategory ?? '').split(',').map(s => s.trim()).filter(Boolean)) {
      if (!list.includes(current)) list.unshift(current);
    }
    return list;
  });

  /** EOI Category options for the "Configure New EOI" form (sourced from EOI Category Master). */
  readonly eoiCategoryOptions = computed(() => {
    const list = [...this.eoiCategoryNames()];
    const current = this.newEoiData?.eoiCategory;
    if (current && !list.includes(current)) {
      list.unshift(current);
    }
    return list;
  });

  newEoiData: EoiFormData = createEmptyEoiForm();
  /** The backend EOI being edited (its id, documents and attachments). */
  private editingDetail: EoiDetail | null = null;
  readonly eoiFormVersion = signal<number>(0);
  newEoiSubmitted = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  fileError = signal<string>('');
  editingSchemeRefNo = signal<string | null>(null);
  readonly existingRefNos = computed(() => this.schemes().map(s => s.refNo));

  readonly showAttachmentModal = signal<boolean>(false);
  readonly showCorrigendumModal = signal<boolean>(false);
  /** Edit confirmed, waiting for the optional corrigendum before it is saved. */
  private pendingEditSave = false;
  private pendingApplyAfterOtrDismiss = false;

  pageSize = 10;
  searchQuery = signal<string>('');

  private readonly draftService = inject(EoiDraftService);
  protected readonly draftStepCount = EOI_WIZARD_STEP_COUNT;

  /** Unfinished applications for schemes that are still listed. Admins do not apply, so they never see any. */
  readonly pendingDrafts = computed(() =>
    this.isSuperAdmin()
      ? []
      : this.draftService.drafts().filter(d => this.schemes().some(s => s.refNo === d.refNo))
  );

  readonly statusFilter = signal<string>('ALL');
  readonly filterValues = signal<Record<string, string>>({});

  readonly statusFilterOptions = computed<StatusFilterOption[]>(() => [
    { value: 'ALL', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Expired', label: 'Expired' }
  ]);

  readonly schemeFilters = computed<MasterFilterConfig[]>(() => [
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      options: () => this.schemeCategoryOptions(),
      placeholder: 'All Scheme Categories'
    },
    {
      key: 'eoiCategory',
      label: 'EOI Category',
      options: () => this.eoiCategoryOptions(),
      placeholder: 'All EOI Categories'
    }
  ]);

  readonly filteredSchemes = computed(() => {
    let list = this.schemes();
    const q = this.searchQuery().toLowerCase().trim();

    if (q) {
      list = list.filter(s => {
        const name = (s.schemeName || '').toLowerCase();
        const title = (s.schemeTitle || '').toLowerCase();
        const ref = (s.refNo || '').toLowerCase();
        const desc = (s.eoiDescription || '').toLowerCase();
        const cat = (s.schemeCategory || (s as any).category || '').toLowerCase();
        const code = ((s as any).code || '').toLowerCase();
        return (
          name.includes(q) ||
          title.includes(q) ||
          ref.includes(q) ||
          desc.includes(q) ||
          cat.includes(q) ||
          code.includes(q)
        );
      });
    }

    const st = this.statusFilter();
    if (st === 'Active') {
      list = list.filter(s => !isSchemeClosed(s));
    } else if (st === 'Expired' || st === 'Inactive') {
      list = list.filter(s => isSchemeClosed(s));
    }

    const schemeCat = this.filterValues()['schemeCategory'];
    if (schemeCat) {
      list = list.filter(s => {
        const c = s.schemeCategory || (s as any).category || '';
        return c.toLowerCase().includes(schemeCat.toLowerCase());
      });
    }

    const eoiCat = this.filterValues()['eoiCategory'];
    if (eoiCat) {
      list = list.filter(s => {
        const c = s.eoiCategory || (s as any).category || '';
        return c.toLowerCase().includes(eoiCat.toLowerCase());
      });
    }

    // Sort: New schemes at top, and current (newest) to old (oldest)
    list = [...list].sort((a, b) => {
      // 1. New flag priority: new schemes appear first
      const aIsNew = this.isNewScheme(a) ? 1 : 0;
      const bIsNew = this.isNewScheme(b) ? 1 : 0;
      if (aIsNew !== bIsNew) {
        return bIsNew - aIsNew;
      }

      // 2. Created timestamp (if available)
      const aCreated = a.createdAt || 0;
      const bCreated = b.createdAt || 0;
      if (aCreated !== bCreated) {
        return bCreated - aCreated;
      }

      // 3. Published date (current/newest date to oldest date)
      const aPub = this.parseDate(a.datePublished);
      const bPub = this.parseDate(b.datePublished);
      if (aPub !== bPub) {
        return bPub - aPub;
      }

      return 0;
    });

    return list.map((item, idx) => ({ ...item, sNo: idx + 1 }));
  });

  parseDate(dateStr?: string): number {
    if (!dateStr) return 0;
    const separator = dateStr.includes('/') ? '/' : dateStr.includes('-') ? '-' : null;
    if (!separator) return 0;
    const parts = dateStr.split(separator);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
      }
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    }
    return 0;
  }

  isNewScheme(item: SchemeTender): boolean {
    if (item.isNew) return true;
    if (item.createdAt && (Date.now() - item.createdAt < 7 * 24 * 60 * 60 * 1000)) {
      return true;
    }
    return false;
  }

  isSchemeExpired(item: SchemeTender): boolean {
    return isSchemeClosed(item);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
    this.filterValues.set({});
  }

  readonly searchSuggestions = computed(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    for (const s of this.schemes()) {
      if (s.schemeName && !seen.has(s.schemeName)) {
        seen.add(s.schemeName);
        list.push(s.schemeName);
      }
      if (s.refNo && !seen.has(s.refNo)) {
        seen.add(s.refNo);
        list.push(s.refNo);
      }
      if (s.schemeCategory && !seen.has(s.schemeCategory)) {
        seen.add(s.schemeCategory);
        list.push(s.schemeCategory);
      }
      const cat = (s as any).category;
      if (cat && !seen.has(cat)) {
        seen.add(cat);
        list.push(cat);
      }
      const code = (s as any).code;
      if (code && !seen.has(code)) {
        seen.add(code);
        list.push(code);
      }
    }
    return list;
  });

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  constructor() {
    this.schemeService.loadSchemes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.loadMasterOptions();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const fromLogin = params['fromLogin'] === 'true';
      const promptOtr = params['promptOtr'] === 'true';
      if (fromLogin || promptOtr) {
        this.promptDismissed = false;
        this.storage.removeSessionItem('isms_otr_prompt_dismissed');
      }
      this.evaluateOtrModalPrompt();

      const action = params['action'];
      const configure = params['configure'] === 'true' || action === 'create' || action === 'configure';
      if (configure) {
        if (!this.showConfigureScreen()) {
          this.openConfigureScreen(false);
        }
      } else if (action === 'edit' && params['refNo']) {
        const found = this.schemes().find(s => s.refNo === params['refNo']);
        if (found && (!this.showConfigureScreen() || this.editingSchemeRefNo() !== found.refNo)) {
          this.editScheme(found, false);
        }
      } else if (!action && !configure && this.showConfigureScreen()) {
        this.showConfigureScreen.set(false);
        this.editingSchemeRefNo.set(null);
      }

      const viewRefNo = params['viewRefNo'] || params['refNo'];
      if (viewRefNo && action !== 'edit' && !this.showConfigureScreen()) {
        const found = this.schemes().find(s => s.refNo === viewRefNo);
        if (found) {
          this.selectedScheme.set(found);
        }
      }
    });

    effect(() => {
      // Re-evaluate whenever currentUser signal changes
      this.evaluateOtrModalPrompt();

      const list = this.schemes();
      const action = this.route.snapshot.queryParams['action'];
      const refNo = this.route.snapshot.queryParams['refNo'];
      if (action === 'edit' && refNo && list.length > 0 && !this.showConfigureScreen()) {
        const found = list.find(s => s.refNo === refNo);
        if (found) {
          this.editScheme(found, false);
        }
      }

      const viewRefNo = this.route.snapshot.queryParams['viewRefNo'] || (action !== 'edit' ? refNo : null);
      if (viewRefNo && list.length > 0 && !this.selectedScheme() && !this.showConfigureScreen()) {
        const found = list.find(s => s.refNo === viewRefNo);
        if (found) {
          this.selectedScheme.set(found);
        }
      }
    });
  }

  private evaluateOtrModalPrompt(): void {
    const isNewUser = this.permissions.hasRole('new_user');
    const isDismissed = this.storage.getSessionString('isms_otr_prompt_dismissed') === 'true' || this.promptDismissed;

    // Show popup strictly for new_user role on their first visit / fresh login
    if (isNewUser && !isDismissed) {
      this.showOtrPromptModal.set(true);
    } else {
      this.showOtrPromptModal.set(false);
    }
  }

  dismissOtrPrompt(): void {
    this.showOtrPromptModal.set(false);
    this.promptDismissed = true;
    this.storage.setSessionString('isms_otr_prompt_dismissed', 'true');
    this.storage.setString('isms_eoi_prompt_shown_new_user', 'true');
    if (this.pendingApplyAfterOtrDismiss) {
      this.pendingApplyAfterOtrDismiss = false;
      this.navigateToSchemeForm(this.selectedScheme());
    }
  }

  /** The EOI's published files (RFP, SOP, corrigenda) for the detail view. */
  rfpDocsFor(scheme: SchemeTender): EoiDocumentItem[] {
    return scheme.attachedDocs ?? [];
  }

  /** No fixed list of "required information" rows: the EOI's documents come from the backend. */
  readonly eoiRequiredInfo: EoiRequiredInfoItem[] = [];

  readonly schemeColumns = computed<TableColumn<SchemeTender>[]>(() => [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-14 min-w-[50px] max-w-[60px]' },
    {
      key: 'refNo',
      label: 'EOI Reference No.',
      width: 'w-36 min-w-[120px]',
      cellClass: 'text-[12.5px] font-normal text-slate-800 break-words'
    },
    {
      key: 'schemeName',
      label: 'Scheme Name',
      type: 'custom',
      cellClass: 'text-[13px] font-medium text-slate-800'
    },
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      align: 'center',
      width: 'w-28 min-w-[90px]',
      cellClass: 'text-[12.5px] font-normal text-slate-700'
    },
    {
      key: 'datePublished',
      label: 'EOI Publication Date',
      align: 'center',
      width: 'w-28 min-w-[100px]',
      cellClass: 'whitespace-nowrap text-[12.5px] font-normal text-slate-700'
    },
    {
      key: 'closingDate',
      label: 'Date of Closing',
      align: 'center',
      type: 'custom',
      width: 'w-28 min-w-[100px]',
      cellClass: 'whitespace-nowrap text-[12.5px] font-normal text-slate-700'
    },
    {
      key: 'eoiCategory',
      label: 'EOI Category',
      align: 'center',
      width: 'w-24 min-w-[80px]',
      cellClass: 'whitespace-nowrap text-[12.5px] font-normal text-slate-700'
    },
    {
      key: 'viewAction',
      label: 'Action',
      align: 'center',
      width: this.isSuperAdmin() ? 'w-40 min-w-[145px]' : 'w-20 min-w-[65px]',
      type: 'custom'
    }
  ]);

  getRowClass = (item: SchemeTender): string => {
    const isInactive = item.isActive === false;
    if (isInactive) {
      return 'opacity-50 !bg-slate-100/70 transition-colors';
    }
    return this.draftFor(item.refNo)
      ? '!bg-amber-50 hover:!bg-amber-100/70 transition-colors'
      : 'bg-white hover:bg-slate-50/80 transition-colors';
  };

  /** Pending (unfinished) application the signed-in applicant has for the given scheme, if any. */
  draftFor(refNo: string): EoiDraft | null {
    return this.pendingDrafts().find(d => d.refNo === refNo) ?? null;
  }

  /** Reopens the wizard exactly where the applicant left it. */
  resumeApplication(refNo: string): void {
    const draft = this.draftFor(refNo);
    if (!draft) return;
    this.router.navigate(['/scheme-form'], { queryParams: { ...draft.queryParams, refNo: draft.refNo } });
  }

  onRowClick(scheme: SchemeTender): void {
    this.viewSchemeDetails(scheme);
  }

  viewSchemeDetails(scheme: SchemeTender): void {
    this.selectedScheme.set(scheme);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const id = this.backendId(scheme);
    if (id === null) return;
    // The list rows carry no documents. Administrators read the full EOI from the configuration API;
    // applicants (TP / User) from the apply API, which returns the same required documents, annexures and files.
    const detail$ = this.schemeService.isAdmin()
      ? this.schemeService.getDetail(id).pipe(map(detailToScheme))
      : this.schemeService.getNoticeDetail(id).pipe(map(noticeDetailToScheme));
    detail$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: full => {
        if (this.selectedScheme()?.refNo === scheme.refNo) this.selectedScheme.set({ ...full, sNo: scheme.sNo });
      },
      error: (error: unknown) => this.fileError.set(error instanceof ApiError ? error.message : 'The EOI details could not be loaded.')
    });
  }

  /** The backend EOI id of a list row. */
  private backendId(scheme: SchemeTender | null | undefined): number | null {
    const id = Number((scheme as { id?: string } | null)?.id);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  backToList(): void {
    this.pendingApplyAfterOtrDismiss = false;
    this.selectedScheme.set(null);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Opens the Apply for EOI wizard; it starts (or resumes) the application on the backend from the EOI id. */
  private navigateToSchemeForm(scheme: SchemeTender | null): void {
    const eoiId = this.backendId(scheme);
    if (!scheme || eoiId === null) return;
    this.router.navigate(['/scheme-form'], { queryParams: { eoiId, refNo: scheme.refNo } });
  }

  handleApplyForScheme(): void {
    // Check if profile is incomplete
    if (this.isProfileIncomplete()) {
      this.pendingApplyAfterOtrDismiss = true;
      this.showOtrPromptModal.set(true);
      return;
    }

    // Direct navigation to scheme proposal form without showing the registration preview modal
    this.navigateToSchemeForm(this.selectedScheme());
  }

  goToProfile(): void {
    this.pendingApplyAfterOtrDismiss = false;
    this.dismissOtrPrompt();
    this.router.navigate(['/profile']);
  }

  goToRegistration(): void {
    this.pendingApplyAfterOtrDismiss = false;
    this.dismissOtrPrompt();
    this.router.navigate(['/registration']);
  }

  /** Opens one of the EOI's published files (matched by its title) from the backend. */
  downloadDoc(docType: string): void {
    const id = this.backendId(this.selectedScheme());
    if (id === null) return;
    this.schemeService
      .openAttachment(id, docType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      });
  }

  getSchemeDescription(scheme: SchemeTender | null): string {
    return scheme?.eoiDescription ?? '';
  }

  // ---- Configure / edit EOI ------------------------------------------------

  /** The form's dropdowns from GET /eoi/configurations/options (only what the backend accepts for an EOI). */
  private loadMasterOptions(): void {
    if (!this.schemeService.isAdmin()) return;
    this.loadSchemeCategories();
    this.schemeService
      .loadOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: options => {
          const schemes = schemeItemsFrom(options);
          this.schemeMasterItems.set(schemes);
          this.schemeMasterNames.set(Array.from(new Set(schemes.map(s => s.schemeName))));
          // Scheme Categories come from Scheme Category Master (loadSchemeCategories); the options list is used
          // only when the master could not be read.
          if (this.schemeCategoryNames().length === 0 && options.schemeCategories?.length) {
            this.schemeCategoryNames.set(options.schemeCategories.map(c => c.name));
          }
          this.eoiCategoryNames.set(options.eoiCategories.map(c => c.name));
          this.docMasterItems.set(docItemsFrom(options));
          this.annexureMasterItems.set(annexureItemsFrom(options));
          this.eoiFormVersion.update(v => v + 1);
        },
        error: () => {
          this.schemeMasterItems.set([]);
          this.schemeMasterNames.set([]);
          this.eoiCategoryNames.set([]);
          this.docMasterItems.set([]);
          this.annexureMasterItems.set([]);
        }
      });
  }

  /** Active Scheme Category Master entries (GET /api/master/scheme-categories) for the multi-select. */
  private loadSchemeCategories(): void {
    this.dataEngine
      .for<SchemeCategoryMasterItem>('SCHEME_CATEGORIES', { idKey: 'id' })
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: items => {
          const names = (items ?? [])
            .filter(c => c.status !== 'Inactive')
            .map(c => c.categoryName?.trim())
            .filter((n): n is string => !!n);
          if (names.length > 0) {
            this.schemeCategoryNames.set(Array.from(new Set(names)));
            this.eoiFormVersion.update(v => v + 1);
          }
        },
        error: () => { /* the options list (loadMasterOptions) is the fallback */ }
      });
  }

  onSchemeSelected(schemeName: string): void {
    if (!schemeName) {
      this.newEoiData.emdFee = '';
      this.newEoiData.processFee = '';
      this.newEoiData.documents = [];
      this.newEoiData.annexures = [];
      this.newEoiData.documentFiles = {};
      this.eoiFormVersion.update(v => v + 1);
      return;
    }

    // Fees, scheme category and EOI category of the chosen scheme (backend options).
    const schemeItem = this.schemeMasterItems().find(s => s.schemeName?.trim().toLowerCase() === schemeName.trim().toLowerCase());
    // Only the fees come from the scheme; Scheme Category and EOI Category are chosen on the form.
    if (schemeItem) {
      if (schemeItem.amount != null) this.newEoiData.emdFee = formatInr(schemeItem.amount);
      if (schemeItem.processFees != null) this.newEoiData.processFee = formatInr(schemeItem.processFees);
    }

    // Doc Master documents and Annexure Master annexures that apply to the scheme.
    this.newEoiData.documents = parseMasterEntriesByScheme(this.docMasterItems(), schemeName, d => d.docName || d.documents);
    this.newEoiData.annexures = parseMasterEntriesByScheme(this.annexureMasterItems(), schemeName, a => a.annexureName || a.annexures);
    this.newEoiData.documentFiles = {};
    this.eoiFormVersion.update(v => v + 1);
  }

  /** Clears a backend error once the form changes. */
  onFormChange(): void {
    if (this.fileError()) this.fileError.set('');
  }

  openConfigureScreen(updateUrl = true): void {
    this.loadMasterOptions();
    this.editingSchemeRefNo.set(null);
    this.editingDetail = null;
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
    this.eoiCurrentStep.set(1);
    this.newEoiData = createEmptyEoiForm();
    this.eoiFormVersion.update(v => v + 1);
    this.selectedScheme.set(null);
    this.showConfigureScreen.set(true);
    if (updateUrl) {
      this.router.navigate([], { relativeTo: this.route, queryParams: { action: 'create' } });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openConfigureEoiModal(): void {
    this.openConfigureScreen();
  }

  nextEoiStep(): void {
    this.eoiCurrentStep.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevEoiStep(): void {
    this.eoiCurrentStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToEoiStep(step: number): void {
    if (step >= 1 && step <= 2) {
      this.eoiCurrentStep.set(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /** Opens the form with the EOI as the backend has it (documents, attachments, custom fields). */
  editScheme(scheme: SchemeTender, updateUrl = true): void {
    const id = this.backendId(scheme);
    if (id === null) return;
    this.loadMasterOptions();
    this.schemeService
      .getDetail(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(detail => {
        this.editingDetail = detail;
        this.editingSchemeRefNo.set(detail.refNo);
        this.newEoiSubmitted.set(false);
        this.fileError.set('');
        this.eoiCurrentStep.set(1);
        this.newEoiData = detailToForm(detail);
        this.eoiFormVersion.update(v => v + 1);
        this.selectedScheme.set(null);
        this.showConfigureScreen.set(true);
        if (updateUrl) {
          this.router.navigate([], { relativeTo: this.route, queryParams: { action: 'edit', refNo: detail.refNo } });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  closeConfigureScreen(): void {
    this.showConfigureScreen.set(false);
    this.editingSchemeRefNo.set(null);
    this.editingDetail = null;
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
    this.eoiCurrentStep.set(1);
    const action = this.route.snapshot.queryParams['action'];
    if (action === 'create' || action === 'edit') {
      this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    }
  }

  closeConfigureEoiModal(): void {
    this.closeConfigureScreen();
  }

  addEoiDocument(): void {
    this.newEoiData.documents.push('');
    this.eoiFormVersion.update(v => v + 1);
  }

  removeEoiDocument(index: number): void {
    this.newEoiData.documents.splice(index, 1);
    if (this.newEoiData.documentFiles) {
      const newFiles: Record<number, any> = {};
      for (const [key, val] of Object.entries(this.newEoiData.documentFiles)) {
        const k = Number(key);
        if (k < index) newFiles[k] = val;
        else if (k > index) newFiles[k - 1] = val;
      }
      this.newEoiData.documentFiles = newFiles;
    }
    this.eoiFormVersion.update(v => v + 1);
  }

  addEoiAnnexure(): void {
    if (!this.newEoiData.annexures) this.newEoiData.annexures = [];
    this.newEoiData.annexures.push('');
    this.eoiFormVersion.update(v => v + 1);
  }

  removeEoiAnnexure(index: number): void {
    if (this.newEoiData.annexures && index >= 0 && index < this.newEoiData.annexures.length) {
      this.newEoiData.annexures.splice(index, 1);
      this.eoiFormVersion.update(v => v + 1);
    }
  }

  getSchemeAnnexures(scheme: SchemeTender): EoiDocumentItem[] {
    return (scheme.annexures ?? []).map((ann, idx) => ({ sNo: idx + 1, name: ann, size: '' }));
  }

  getSchemeRequiredDocs(scheme: SchemeTender): EoiRequiredInfoItem[] {
    return (scheme.requiredDocs ?? []).map((doc, idx) => ({ sNo: idx + 1, name: doc, note: '' }));
  }

  // ---- Row actions ---------------------------------------------------------

  toggleActiveStatus(scheme: SchemeTender): void {
    const id = this.backendId(scheme);
    if (!this.isSuperAdmin() || scheme.isFrozen || id === null) return;
    const newActive = scheme.isActive === false;
    this.schemeService
      .setActive(id, newActive)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (error: unknown) => this.fileError.set(this.errorText(error)) });
  }

  // ---- Committee assignment ------------------------------------------------

  /**
   * Loads the eligible people (GET /eoi/configurations/committee-candidates) and the EOI's current committee
   * (GET /eoi/configurations/{id}/committee) together, then opens the dialog. People are keyed by SSO ID.
   */
  openAddCommitteeModal(scheme: SchemeTender): void {
    const id = this.backendId(scheme);
    if (!this.isSuperAdmin() || id === null) return;
    this.committeeError.set('');
    forkJoin({ candidates: this.schemeService.committeeCandidates(), committee: this.schemeService.getCommittee(id) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ candidates, committee }) => {
          const current = [committee.approver, ...committee.members].filter((u): u is NonNullable<typeof u> => !!u);
          this.availableAdmins.set(mergeCommitteePeople(candidates, current.map(toCommitteeAdmin)));
          this.selectedSchemeForCommittee.set({
            ...scheme,
            eoiDescription: committee.description ?? scheme.eoiDescription,
            committeeApprover: committee.approver?.ssoid ?? '',
            committeeMembers: committee.members.map(m => m.ssoid)
          });
          this.showCommitteeModal.set(true);
        },
        error: (error: unknown) => this.fileError.set(error instanceof ApiError ? error.message : 'The committee could not be loaded.')
      });
  }

  closeCommitteeModal(): void {
    if (this.committeeSaving()) return;
    this.showCommitteeModal.set(false);
    this.selectedSchemeForCommittee.set(null);
    this.committeeError.set('');
  }

  /** PUT /eoi/configurations/{id}/committee with the selected SSO IDs; the backend validates eligibility. */
  saveCommittee(payload: { approver?: string; members: string[] }): void {
    const scheme = this.selectedSchemeForCommittee();
    const id = this.backendId(scheme);
    if (!scheme || id === null || this.committeeSaving()) return;
    this.committeeSaving.set(true);
    this.committeeError.set('');
    this.schemeService
      .saveCommittee(id, payload.approver ?? '', payload.members)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.committeeSaving.set(false);
          this.closeCommitteeModal();
          this.notifications.success('Committee saved.');
        },
        error: (error: unknown) => {
          this.committeeSaving.set(false);
          this.committeeError.set(committeeErrorText(error));
        }
      });
  }

  // ---- Attachments ---------------------------------------------------------

  openAttachmentModal(): void {
    this.showAttachmentModal.set(true);
  }

  closeAttachmentModal(): void {
    this.showAttachmentModal.set(false);
  }

  onAttachmentAdded(attachment: EoiAttachment): void {
    this.newEoiData.attachments.push(attachment);
    this.showAttachmentModal.set(false);
    this.eoiFormVersion.update(v => v + 1);
  }

  removeAttachment(index: number): void {
    this.newEoiData.attachments.splice(index, 1);
    this.eoiFormVersion.update(v => v + 1);
  }

  // ---- Corrigendum (edit mode) ---------------------------------------------

  /** Saves the confirmed edit, then issues the corrigendum when one was given. */
  submitCorrigendumAndSave(submission: CorrigendumSubmission): void {
    if (!this.pendingEditSave) return;
    this.pendingEditSave = false;
    this.showCorrigendumModal.set(false);
    this.saveToBackend(false, submission);
  }

  closeCorrigendumModal(): void {
    this.pendingEditSave = false;
    this.showCorrigendumModal.set(false);
    this.showConfigureScreen.set(true);
  }

  // ---- Submit --------------------------------------------------------------

  submitNewEoi(): void {
    this.newEoiSubmitted.set(true);

    const validation = validateEoiFormComplete(this.newEoiData, {
      existingRefNos: this.existingRefNos(),
      currentRefNo: this.editingSchemeRefNo(),
      activeSchemeNames: this.schemeNameOptions(),
      activeEoiCategories: [...this.eoiCategoryOptions()],
      schemeMasterItems: this.schemeMasterItems()
    });

    if (!validation.isValid) {
      const firstInvalidKey = Object.keys(validation.errors)[0];
      if (firstInvalidKey) this.focusField(firstInvalidKey);
      return;
    }

    this.showConfirmSubmitEoiModal.set(true);
  }

  /** "Save as Draft": the backend only needs the reference number and the scheme. */
  saveDraftEoi(): void {
    this.saveToBackend(true, null);
  }

  confirmSubmitNewEoi(): void {
    this.showConfirmSubmitEoiModal.set(false);
    if (this.editingDetail) {
      // Edit: offer an optional corrigendum first; the edit is saved when that dialog is submitted.
      this.pendingEditSave = true;
      this.showConfigureScreen.set(false);
      this.showCorrigendumModal.set(true);
      return;
    }
    this.saveToBackend(false, null);
  }

  closeConfirmSubmitEoiModal(): void {
    this.showConfirmSubmitEoiModal.set(false);
  }

  private saveToBackend(saveAsDraft: boolean, corrigendum: CorrigendumSubmission | null): void {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.fileError.set('');
    const editing = this.editingDetail;
    const save$ = editing
      ? this.schemeService.updateEoi(editing.id, this.newEoiData, saveAsDraft)
      : this.schemeService.createEoi(this.newEoiData, saveAsDraft);

    save$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
        const finish = () => {
          this.isSubmitting.set(false);
          this.showConfigureScreen.set(false);
          this.editingSchemeRefNo.set(null);
          this.editingDetail = null;
          this.router.navigate([], { relativeTo: this.route, queryParams: {} });
        };
        if (corrigendum?.file && corrigendum.title?.trim()) {
          this.schemeService
            .addCorrigendum(saved.id, corrigendum.title.trim(), corrigendum.file)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: finish,
              error: (error: unknown) => {
                finish();
                this.fileError.set(this.errorText(error));
              }
            });
        } else {
          finish();
        }
      },
      error: (error: unknown) => {
        this.isSubmitting.set(false);
        this.showConfigureScreen.set(true);
        this.fileError.set(this.errorText(error));
        if (error instanceof ApiError && error.fieldErrors.length > 0) {
          const first = Object.keys(mapSaveErrors(error.fieldErrors))[0];
          if (first) this.focusField(first);
        }
      }
    });
  }

  /** The backend's messages, one per line (field errors first). */
  private errorText(error: unknown): string {
    if (!(error instanceof ApiError)) return 'The EOI could not be saved. Please try again.';
    const fields = Object.values(mapSaveErrors(error.fieldErrors));
    return fields.length > 0 ? fields.join(' ') : error.message;
  }

  /** Shows the wizard step of a form field and focuses it. */
  private focusField(key: string): void {
    const fieldMap: Record<string, string> = {
      refNo: 'eoiRefNoInput',
      scheme: 'eoiSchemeSelect',
      schemeCategory: 'eoiSchemeCategorySelect',
      eoiCategory: 'eoiCategorySelect',
      publishedDate: 'eoiPublishedDateInput',
      submissionDate: 'eoiSubmissionDateInput',
      eoiDurationValue: 'eoiDurationInput',
      description: 'eoiDescriptionInput',
      emdFee: 'eoiEmdFeeInput',
      processFee: 'eoiProcessFeeInput'
    };
    const elId = fieldMap[key];
    const step = elId ? 1 : 2;
    const focus = () => {
      if (!elId || typeof document === 'undefined') return;
      const el = document.getElementById(elId);
      el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      el?.focus();
    };
    if (this.eoiCurrentStep() !== step) {
      this.eoiCurrentStep.set(step);
      setTimeout(focus);
    } else {
      focus();
    }
  }
}
