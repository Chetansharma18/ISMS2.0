import { Component, DestroyRef, inject, signal, computed, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { EOI_WIZARD_STEP_COUNT, EoiDraft, EoiDraftService } from '../../core/services/eoi-draft.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { SchemeService } from './services/scheme.service';
import { SchemeRequirementsService } from '../../core/services/scheme-requirements.service';
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
import { DataEngineService } from '../../core/services/data-engine.service';
import {
  SchemeMasterItem,
  SchemeCategoryMasterItem,
  EoiCategoryItem,
  DocMasterItem,
  AnnexureMasterItem
} from '../../core/models/admin-masters.model';

import { SchemeDetailViewComponent } from './scheme-detail-view.component';
import { EoiAttachment, EoiDocumentItem, EoiFormData, EoiRequiredInfoItem, SchemeTender } from './tenders.models';
import {
  buildCorrigendumDoc,
  buildSchemeFromForm,
  createEmptyEoiForm,
  eoiFormFromScheme,
  filterActiveSchemes,
  isEoiFormValid,
  isSchemeClosed,
  parseMasterEntriesByScheme,
  validateEoiFormComplete
} from './tenders-page/tenders-page.util';
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

          <!-- Main Form Card Container - Styled exactly like Registration Form Box -->
          <div class="bg-white rounded-xl border border-[#D6E3F0] shadow-xs p-5 sm:p-7 space-y-6">

            <!-- Card Header Strip -->
            <div class="pb-3.5 border-b border-[#E8EEF5] flex items-center justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-lg sm:text-[19px] font-bold text-[#1E3A5F] m-0 leading-tight">
                  {{ editingSchemeRefNo() ? 'Edit Expression of Interest' : 'Expression of Interest Details' }}
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  {{ editingSchemeRefNo() ? 'Update scheme parameters and required documents' : 'Enter the required scheme parameters and EOI details' }}
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                @if (editingSchemeRefNo()) {
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2]">
                    Ref: {{ editingSchemeRefNo() }}
                  </span>
                }
                <span class="text-xs text-slate-500 font-medium">
                  Required fields marked <span class="text-[#DC2626] font-bold">*</span>
                </span>
              </div>
            </div>

            <!-- Form Content Component -->
            <app-configure-eoi-form
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
              (formChange)="autoSaveDraft()"
              (attach)="openAttachmentModal()"
              (removeAttachment)="removeAttachment($event)"
              (addDocument)="addEoiDocument()"
              (removeDocument)="removeEoiDocument($event)"
              (addAnnexure)="addEoiAnnexure()"
              (removeAnnexure)="removeEoiAnnexure($event)"
            ></app-configure-eoi-form>

            <!-- Card Footer / Actions -->
            <div class="pt-4 border-t border-[#E8EEF5] flex items-center justify-between gap-3">
              <button
                appButton
                variant="outline"
                size="md"
                type="button"
                [disabled]="isSubmitting()"
                (click)="closeConfigureScreen()"
              >
                <app-icon name="chevron-left" />
                <span>Cancel</span>
              </button>
              <div class="flex items-center gap-2">
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
            </div>

          </div>
        </div>
      } @else if (selectedScheme(); as s) {
        <!-- ====================================================================
             VIEW 2: SCHEME DETAILS VIEW (Tabular Layout matching Government eProcurement)
             ==================================================================== -->
        <app-scheme-detail-view
          [scheme]="s"
          [rfpDocs]="rfpDocuments"
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
        [admins]="availableAdmins"
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

  readonly isSuperAdmin = computed(() => this.permissions.hasRole('super_admin'));
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

  private dataEngine = inject(DataEngineService);

  readonly availableAdmins = this.schemeService.getAvailableAdmins();
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
    const list = [...this.schemeCategoryNames()];
    const current = this.newEoiData?.schemeCategory;
    if (current && !list.includes(current)) {
      list.unshift(current);
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

  static readonly EOI_DRAFT_STORAGE_KEY = 'isms_eoi_configure_draft';

  newEoiData: EoiFormData = createEmptyEoiForm();
  readonly eoiFormVersion = signal<number>(0);
  newEoiSubmitted = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  fileError = signal<string>('');
  editingSchemeRefNo = signal<string | null>(null);
  readonly existingRefNos = computed(() => this.schemes().map(s => s.refNo));

  readonly showAttachmentModal = signal<boolean>(false);
  readonly showCorrigendumModal = signal<boolean>(false);
  private pendingEditScheme: SchemeTender | null = null;

  pageSize = 10;
  searchQuery = signal<string>('');

  private readonly draftService = inject(EoiDraftService);
  private readonly schemeReqService = inject(SchemeRequirementsService);
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
  }

  // Documents & requirements sourced from centralized mock/API store via SchemeService
  readonly rfpDocuments: EoiDocumentItem[] = this.schemeService.getRfpDocuments();
  readonly annexureDocuments: EoiDocumentItem[] = this.schemeService.getAnnexures();
  readonly eoiRequiredInfo = this.schemeService.getRequiredInfo();

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
  }

  backToList(): void {
    this.selectedScheme.set(null);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleApplyForScheme(): void {
    // Check if profile is incomplete
    if (this.isProfileIncomplete()) {
      this.showOtrPromptModal.set(true);
      return;
    }

    // Direct navigation to scheme proposal form without showing the registration preview modal
    const scheme = this.selectedScheme();
    this.router.navigate(['/scheme-form'], {
      queryParams: {
        refNo: scheme?.refNo || 'RSLDC/EOI/VYUPY/2026-27/01',
        title: scheme?.schemeTitle || scheme?.schemeName || 'Vishwakarma Yuva Udyami Protsahan Yojana',
        schemeName: scheme?.schemeName || 'Vishwakarma Yuva Udyami Protsahan Yojana',
        category: scheme?.schemeCategory || scheme?.category || 'Rajvik',
        eoiCategory: scheme?.eoiCategory || 'General',
        datePublished: scheme?.datePublished || '15/09/2026',
        closingDate: scheme?.closingDate || '30/11/2026',
        emdFee: scheme?.emdFee || '₹50,000',
        processFee: scheme?.processFee || '₹10,000',
        eoiDescription: scheme?.eoiDescription || 'Expression of Interest for submission of proposal to undertake Skill Training under Vishwakarma Yuva Udyami Protsahan Yojana'
      }
    });
  }

  goToProfile(): void {
    this.dismissOtrPrompt();
    this.router.navigate(['/profile']);
  }

  goToRegistration(): void {
    this.dismissOtrPrompt();
    this.router.navigate(['/registration']);
  }

  downloadDoc(docType: string): void {
    const s = this.selectedScheme();
    console.log(`Downloading ${docType} for ${s?.schemeTitle || s?.schemeName} (${s?.refNo})`);
  }

  getSchemeDescription(scheme: SchemeTender | null): string {
    if (!scheme) return '';
    if (scheme.eoiDescription) return scheme.eoiDescription;
    return `Expression of Interest for Empanelment of Training Providers / PIAs to implement state skill development initiatives under ${scheme.schemeTitle || scheme.schemeName}.`;
  }

  // ---- Configure / edit EOI ------------------------------------------------

  private loadMasterOptions(): void {
    // 1. Load active schemes from Scheme Master
    this.dataEngine
      .for<SchemeMasterItem>('SCHEME_MASTERS', { idKey: 'id' })
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.schemeMasterItems.set(items || []);
          const names = (items || [])
            .filter((s) => s.status !== 'Inactive')
            .map((s) => s.schemeName?.trim())
            .filter((name): name is string => !!name);
          this.schemeMasterNames.set(Array.from(new Set(names)));
        },
        error: () => {
          this.schemeMasterItems.set([]);
          this.schemeMasterNames.set([]);
        }
      });

    // 2. Load active scheme categories from Scheme Category Master
    this.dataEngine
      .for<SchemeCategoryMasterItem>('SCHEME_CATEGORIES', { idKey: 'id' })
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          const cats = (items || [])
            .filter((c) => c.status !== 'Inactive')
            .map((c) => (c.categoryName || c.schemeName)?.trim())
            .filter((name): name is string => !!name);
          this.schemeCategoryNames.set(Array.from(new Set(cats)));
        },
        error: () => this.schemeCategoryNames.set([])
      });

    // 3. Load active EOI categories from EOI Category Master
    this.dataEngine
      .for<EoiCategoryItem>('EOI_CATEGORIES', { idKey: 'id' })
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          const cats = (items || [])
            .filter((e) => e.status !== 'Inactive')
            .map((e) => e.categoryTitle?.trim())
            .filter((title): title is string => !!title);
          this.eoiCategoryNames.set(Array.from(new Set(cats)));
        },
        error: () => this.eoiCategoryNames.set([])
      });

    // 4. Doc Master items from the backend (/api/master/doc-masters), active only. No sample fallback: an empty or
    //    failed list means the EOI form offers no master documents.
    this.dataEngine
      .for<DocMasterItem>('DOC_MASTERS', { idKey: 'id' })
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.docMasterItems.set((items || []).filter((d) => d.status !== 'Inactive')),
        error: () => this.docMasterItems.set([])
      });

    // 5. Annexure Master items. The backend has no annexure API yet, so this stays empty until it has one
    //    (register ANNEXURE_MASTERS in api.config.ts then).
    this.dataEngine
      .for<AnnexureMasterItem>('ANNEXURE_MASTERS', { idKey: 'id' })
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.annexureMasterItems.set((items || []).filter((a) => a.status !== 'Inactive')),
        error: () => this.annexureMasterItems.set([])
      });
  }

  onSchemeSelected(schemeName: string): void {
    if (!schemeName) return;

    // 1. Auto-fill EMD Fee, Process Fee & Scheme Category from Scheme Master
    const schemeItem = this.schemeMasterItems().find(
      (s) => s.schemeName?.trim().toLowerCase() === schemeName.trim().toLowerCase()
    );
    if (schemeItem) {
      if (schemeItem.amount != null) {
        this.newEoiData.emdFee = formatInr(schemeItem.amount);
      }
      if (schemeItem.processFees != null) {
        this.newEoiData.processFee = formatInr(schemeItem.processFees);
      }
      if (schemeItem.schemeCategory) {
        this.newEoiData.schemeCategory = schemeItem.schemeCategory;
      }
    }

    // 2. Auto-fill required documents from Scheme Requirements / Doc Master
    const reqs = this.schemeReqService.getRequirementsForScheme(schemeName);
    if (reqs.documents.length > 0) {
      this.newEoiData.documents = reqs.documents.map((d) => d.masterItemName);
    } else {
      const masterList = this.docMasterItems();
      const docs = parseMasterEntriesByScheme(masterList, schemeName, (d) => d.docName || d.documents);
      this.newEoiData.documents = [...docs];
    }
    this.newEoiData.documentFiles = {};

    // 3. Auto-fill annexures from Scheme Requirements / Annexure Master
    if (reqs.annexures.length > 0) {
      this.newEoiData.annexures = reqs.annexures.map((a) => a.masterItemName);
    } else {
      const annexList = this.annexureMasterItems();
      const annexures = parseMasterEntriesByScheme(annexList, schemeName, (a) => a.annexureName || a.annexures);
      this.newEoiData.annexures = [...annexures];
    }

    this.eoiFormVersion.update((v) => v + 1);
    this.autoSaveDraft();
  }

  autoSaveDraft(): void {
    if (this.editingSchemeRefNo()) return; // Don't overwrite new EOI draft when editing an existing scheme
    const hasInput =
      !!this.newEoiData.refNo ||
      !!this.newEoiData.scheme ||
      !!this.newEoiData.eoiCategory ||
      !!this.newEoiData.publishedDate ||
      !!this.newEoiData.submissionDate ||
      !!this.newEoiData.eoiDurationValue ||
      !!this.newEoiData.description;

    if (hasInput) {
      this.storage.setItem(TendersPageComponent.EOI_DRAFT_STORAGE_KEY, {
        ...this.newEoiData,
        documentFiles: {}
      });
    }
  }

  openConfigureScreen(updateUrl = true): void {
    this.loadMasterOptions();
    this.editingSchemeRefNo.set(null);
    this.newEoiSubmitted.set(false);
    this.fileError.set('');

    const savedDraft = this.storage.getItem<EoiFormData>(TendersPageComponent.EOI_DRAFT_STORAGE_KEY);
    if (savedDraft) {
      this.newEoiData = {
        ...createEmptyEoiForm(),
        ...savedDraft,
        documentFiles: {}
      };
      if (this.newEoiData.scheme && (!this.newEoiData.documents?.length || !this.newEoiData.annexures?.length)) {
        this.onSchemeSelected(this.newEoiData.scheme);
      }
    } else {
      this.newEoiData = createEmptyEoiForm();
    }

    this.eoiFormVersion.update((v) => v + 1);
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

  editScheme(scheme: SchemeTender, updateUrl = true): void {
    this.loadMasterOptions();
    this.editingSchemeRefNo.set(scheme.refNo);
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
    this.newEoiData = eoiFormFromScheme(scheme);
    this.eoiFormVersion.update((v) => v + 1);
    this.selectedScheme.set(null);
    this.showConfigureScreen.set(true);
    if (updateUrl) {
      this.router.navigate([], { relativeTo: this.route, queryParams: { action: 'edit', refNo: scheme.refNo } });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeConfigureScreen(): void {
    this.showConfigureScreen.set(false);
    this.editingSchemeRefNo.set(null);
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
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
    this.eoiFormVersion.update((v) => v + 1);
    this.autoSaveDraft();
  }

  removeEoiDocument(index: number): void {
    this.newEoiData.documents.splice(index, 1);
    if (this.newEoiData.documentFiles) {
      const newFiles: Record<number, any> = {};
      for (const [key, val] of Object.entries(this.newEoiData.documentFiles)) {
        const k = Number(key);
        if (k < index) {
          newFiles[k] = val;
        } else if (k > index) {
          newFiles[k - 1] = val;
        }
      }
      this.newEoiData.documentFiles = newFiles;
    }
    this.eoiFormVersion.update((v) => v + 1);
    this.autoSaveDraft();
  }

  addEoiAnnexure(): void {
    if (!this.newEoiData.annexures) {
      this.newEoiData.annexures = [];
    }
    this.newEoiData.annexures.push('');
    this.eoiFormVersion.update((v) => v + 1);
    this.autoSaveDraft();
  }

  removeEoiAnnexure(index: number): void {
    if (this.newEoiData.annexures && index >= 0 && index < this.newEoiData.annexures.length) {
      this.newEoiData.annexures.splice(index, 1);
      this.eoiFormVersion.update((v) => v + 1);
      this.autoSaveDraft();
    }
  }

  private resolveMasterSchemeList<T extends { schemeName?: string; schemes?: string[]; status?: string }>(
    explicitItems: string[] | undefined,
    masterList: T[],
    scheme: SchemeTender,
    fieldExtractor: (item: T) => string | undefined
  ): string[] | null {
    if (explicitItems && explicitItems.length > 0) {
      return explicitItems;
    }
    const target = (scheme.schemeName || scheme.schemeTitle || '').trim();
    if (!target) return null;
    const items = parseMasterEntriesByScheme(masterList, target, fieldExtractor);
    return items.length > 0 ? items : null;
  }

  getSchemeAnnexures(scheme: SchemeTender): EoiDocumentItem[] {
    const masterList = this.annexureMasterItems();
    const items = this.resolveMasterSchemeList(scheme.annexures, masterList, scheme, (a) => a.annexureName || a.annexures);
    if (items) {
      return items.map((ann, idx) => ({
        sNo: idx + 1,
        name: ann,
        size: '250 KB'
      }));
    }
    return this.annexureDocuments;
  }

  getSchemeRequiredDocs(scheme: SchemeTender): EoiRequiredInfoItem[] {
    const masterList = this.docMasterItems();
    const items = this.resolveMasterSchemeList(scheme.requiredDocs, masterList, scheme, (d) => d.docName || d.documents);
    if (items) {
      return items.map((doc, idx) => ({
        sNo: idx + 1,
        name: doc,
        note: 'Upload required'
      }));
    }
    return this.eoiRequiredInfo;
  }

  // ---- Row actions ---------------------------------------------------------

  toggleActiveStatus(scheme: SchemeTender): void {
    if (!this.isSuperAdmin() || scheme.isFrozen) return;
    const newActive = scheme.isActive === false ? true : false;
    scheme.isActive = newActive;
    this.schemeService.updateScheme(scheme.refNo, { isActive: newActive }).subscribe();
  }

  // ---- Committee assignment ------------------------------------------------

  openAddCommitteeModal(scheme: SchemeTender): void {
    if (!this.isSuperAdmin()) return;
    this.selectedSchemeForCommittee.set(scheme);
    this.showCommitteeModal.set(true);
  }

  closeCommitteeModal(): void {
    this.showCommitteeModal.set(false);
    this.selectedSchemeForCommittee.set(null);
  }

  saveCommittee(payload: { approver?: string; members: string[] } | string[]): void {
    const scheme = this.selectedSchemeForCommittee();
    if (!scheme) return;

    if (Array.isArray(payload)) {
      this.schemeService.assignCommittee(scheme.refNo, [...payload]).subscribe();
    } else {
      this.schemeService.assignCommittee(scheme.refNo, [...payload.members], payload.approver).subscribe();
    }
    this.closeCommitteeModal();
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
    this.eoiFormVersion.update((v) => v + 1);
    this.autoSaveDraft();
  }

  removeAttachment(index: number): void {
    this.newEoiData.attachments.splice(index, 1);
    this.eoiFormVersion.update((v) => v + 1);
    this.autoSaveDraft();
  }

  // ---- Corrigendum (edit mode) ---------------------------------------------

  submitCorrigendumAndSave(submission: CorrigendumSubmission): void {
    if (!this.pendingEditScheme) return;

    const targetScheme = { ...this.pendingEditScheme };
    if (submission.file) {
      const corrigendumDoc = buildCorrigendumDoc(
        submission.title,
        submission.file.size,
        targetScheme.attachedDocs?.length || 0
      );
      targetScheme.attachedDocs = [...(targetScheme.attachedDocs || []), corrigendumDoc];
    }

    const targetRef = this.editingSchemeRefNo();
    if (targetRef) {
      this.schemeService.updateScheme(targetRef, targetScheme).subscribe();
    }

    this.pendingEditScheme = null;
    this.editingSchemeRefNo.set(null);
    this.showCorrigendumModal.set(false);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  closeCorrigendumModal(): void {
    this.pendingEditScheme = null;
    this.editingSchemeRefNo.set(null);
    this.showCorrigendumModal.set(false);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
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
      if (firstInvalidKey) {
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
        const elId = fieldMap[firstInvalidKey];
        if (elId) {
          const el = document.getElementById(elId);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el?.focus();
        }
      }
      return;
    }

    this.showConfirmSubmitEoiModal.set(true);
  }

  saveDraftEoi(): void {
    if (!this.newEoiData.refNo?.trim()) {
      this.newEoiSubmitted.set(true);
      return;
    }
    this.newEoiData.status = 'Draft';
    const targetRef = this.editingSchemeRefNo();
    const existingScheme = targetRef ? this.schemes().find(s => s.refNo === targetRef) : null;
    const draftScheme = buildSchemeFromForm(this.newEoiData, existingScheme);
    draftScheme.status = 'Draft';

    this.isSubmitting.set(true);
    if (targetRef) {
      this.schemeService.updateScheme(targetRef, draftScheme).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeConfigureScreen();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.fileError.set(err?.message || 'Failed to save draft');
        }
      });
    } else {
      this.schemeService.createScheme(draftScheme).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeConfigureScreen();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.fileError.set(err?.message || 'Failed to save draft');
        }
      });
    }
  }

  confirmSubmitNewEoi(): void {
    const targetRef = this.editingSchemeRefNo();
    const existingScheme = targetRef ? this.schemes().find(s => s.refNo === targetRef) : null;
    const newScheme = buildSchemeFromForm(this.newEoiData, existingScheme);

    // Freeze immutable EOI requirement snapshot to protect published tenders against master edits
    this.schemeReqService.createEoiSnapshot(newScheme.refNo, newScheme.schemeName);

    this.isSubmitting.set(true);
    if (targetRef) {
      // Edit mode: save updated scheme object into pendingEditScheme & open optional Corrigendum modal
      this.pendingEditScheme = newScheme;
      this.isSubmitting.set(false);
      this.showConfigureScreen.set(false);
      this.showCorrigendumModal.set(true);
    } else {
      // New EOI mode: save directly via SchemeService
      this.schemeService.createScheme(newScheme).subscribe({
        next: () => {
          this.storage.removeItem(TendersPageComponent.EOI_DRAFT_STORAGE_KEY);
          this.isSubmitting.set(false);
          this.showConfigureScreen.set(false);
          this.editingSchemeRefNo.set(null);
          this.router.navigate([], { relativeTo: this.route, queryParams: {} });
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.fileError.set(err?.message || 'Failed to configure EOI');
        }
      });
    }

    this.showConfirmSubmitEoiModal.set(false);
  }

  closeConfirmSubmitEoiModal(): void {
    this.showConfirmSubmitEoiModal.set(false);
  }
}
