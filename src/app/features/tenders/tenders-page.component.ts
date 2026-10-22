import { Component, DestroyRef, inject, signal, computed, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { EOI_WIZARD_STEP_COUNT, EoiDraft, EoiDraftService } from '../../core/services/eoi-draft.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { SchemeService } from './services/scheme.service';
import {
  TableComponent,
  ActionModalComponent,
  ButtonComponent,
  IconComponent,
  TableColumn,
  formatInr
} from '../../shared';
import { DataEngineService } from '../../core/services/data-engine.service';
import {
  SchemeMasterItem,
  SchemeCategoryMasterItem,
  EoiCategoryItem,
  DocMasterItem
} from '../../core/models/admin-masters.model';
import { DOC_MASTER_STORAGE_KEY, INITIAL_DOC_ITEMS } from '../admin-master/doc-master.component';
import { SchemeDetailViewComponent } from './scheme-detail-view.component';
import { EoiAttachment, EoiDocumentItem, EoiFormData, SchemeTender } from './tenders.models';
import {
  buildCorrigendumDoc,
  buildSchemeFromForm,
  createEmptyEoiForm,
  eoiFormFromScheme,
  filterActiveSchemes,
  isEoiFormValid
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
    SchemeDetailViewComponent,
    ConfigureEoiFormComponent,
    CommitteeAssignmentModalComponent,
    OtrPromptModalComponent,
    AttachmentUploadModalComponent,
    CorrigendumModalComponent,
    SchemeRowActionsComponent,
    SchemesHeaderComponent
  ],
  template: `
    <div class="w-full min-h-full text-slate-800 font-sans" style="background-color: #ffffff;">
      
      <!-- ====================================================================
           VIEW 1: ACTIVE EOI TABLE (Using Reusable PageHeader & DataTable)
           ==================================================================== -->
      @if (!selectedScheme()) {
        <div class="p-4 sm:p-5 space-y-4 font-sans" style="background-color: #ffffff;">
          
          <app-schemes-header
            [searchQuery]="searchQuery()"
            [isSuperAdmin]="isSuperAdmin()"
            (searchChange)="onSearchChange($event)"
            (configureEoi)="openConfigureEoiModal()"
          ></app-schemes-header>

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
            (rowClick)="onRowClick($event)"
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

          <!-- Scheme name, with a "pending" tag when the applicant left this application unfinished -->
          <ng-template #schemeNameTemplate let-item>
            <span class="text-slate-800 font-normal text-[13px]">{{ item.schemeName }}</span>
            @if (draftFor(item.refNo); as draft) {
              <span class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300 bg-amber-100 text-amber-800 text-[10.5px] font-semibold align-middle">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
                Pending &bull; Step {{ draft.step }} of {{ draftStepCount }}
              </span>
            }
          </ng-template>

          <!-- Custom Template for Closing Date -->
          <ng-template #closingDateTemplate let-item>
            <span class="text-slate-800 font-normal text-[13px]">{{ item.closingDate }}</span>
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

      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS VIEW (Tabular Layout matching Government eProcurement)
           ==================================================================== -->
      @if (selectedScheme(); as s) {
        <app-scheme-detail-view
          [scheme]="s"
          [rfpDocs]="rfpDocuments"
          [annexures]="annexureDocuments"
          [requiredInfo]="eoiRequiredInfo"
          [hideApplyButton]="isSuperAdmin()"
          (back)="backToList()"
          (apply)="handleApplyForScheme()"
          (download)="downloadDoc($event)"
        ></app-scheme-detail-view>
      }

      <!-- MODAL: ADD COMMITTEE MEMBERS -->
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

      <!-- ====================================================================
           MODAL: CONFIGURE NEW EOI / EDIT EOI
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showConfigureEoiModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Publish EOI"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[650px]"
        (primaryAction)="submitNewEoi()"
        (secondaryAction)="closeConfigureEoiModal()"
        (close)="closeConfigureEoiModal()"
      >
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
          (schemeChange)="onSchemeSelected($event)"
          (attach)="openAttachmentModal()"
          (removeAttachment)="removeAttachment($event)"
          (addDocument)="addEoiDocument()"
          (removeDocument)="removeEoiDocument($event)"
        ></app-configure-eoi-form>
      </app-action-modal>

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
        primaryLabel="Publish EOI"
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

  // Schemes reactive state managed via SchemeService (connected to central Mock/API engine)
  readonly schemes = this.schemeService.schemes;

  selectedScheme = signal<SchemeTender | null>(null);
  readonly showOtrPromptModal = signal<boolean>(false);
  readonly showConfigureEoiModal = signal<boolean>(false);
  readonly showConfirmSubmitEoiModal = signal<boolean>(false);
  readonly showCommitteeModal = signal<boolean>(false);
  readonly selectedSchemeForCommittee = signal<SchemeTender | null>(null);

  private dataEngine = inject(DataEngineService);

  readonly availableAdmins = this.schemeService.getAvailableAdmins();
  private promptDismissed = false;

  readonly schemeMasterItems = signal<SchemeMasterItem[]>([]);
  readonly docMasterItems = signal<DocMasterItem[]>([]);
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

  newEoiData: EoiFormData = createEmptyEoiForm();
  newEoiSubmitted = signal<boolean>(false);
  fileError = signal<string>('');
  editingSchemeRefNo = signal<string | null>(null);

  readonly showAttachmentModal = signal<boolean>(false);
  readonly showCorrigendumModal = signal<boolean>(false);
  private pendingEditScheme: SchemeTender | null = null;

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

  readonly filteredSchemes = computed(() => filterActiveSchemes(this.schemes(), this.searchQuery()));

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

      const viewRefNo = params['viewRefNo'] || params['refNo'];
      if (viewRefNo) {
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
      const viewRefNo = this.route.snapshot.queryParams['viewRefNo'] || this.route.snapshot.queryParams['refNo'];
      if (viewRefNo && list.length > 0 && !this.selectedScheme()) {
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
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-20 min-w-[75px]' },
    {
      key: 'refNo',
      label: 'EOI Reference No.',
      cellClass: 'whitespace-nowrap font-normal text-slate-800'
    },
    {
      key: 'schemeName',
      label: 'Scheme Name',
      type: 'custom',
      cellClass: 'whitespace-nowrap font-normal text-slate-800'
    },
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      align: 'center',
      cellClass: 'whitespace-nowrap font-normal text-slate-700'
    },
    {
      key: 'datePublished',
      label: 'EOI Publication Date',
      align: 'center',
      cellClass: 'whitespace-nowrap font-normal text-slate-700'
    },
    {
      key: 'closingDate',
      label: 'Date of Closing',
      align: 'center',
      type: 'custom',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'eoiCategory',
      label: 'EOI Category',
      align: 'center',
      cellClass: 'whitespace-nowrap font-normal text-slate-700'
    },
    {
      key: 'viewAction',
      label: 'Action',
      align: 'center',
      width: this.isSuperAdmin() ? 'min-w-[280px]' : 'min-w-[100px]',
      type: 'custom'
    }
  ]);

  getRowClass = (item: SchemeTender): string => {
    const isInactive = item.isActive === false;
    if (isInactive) {
      return 'opacity-50 !bg-slate-100/70 cursor-pointer hover:!bg-slate-200/80 transition-colors';
    }
    return this.draftFor(item.refNo)
      ? '!bg-amber-50 cursor-pointer hover:!bg-amber-100/70 transition-colors'
      : 'bg-white cursor-pointer hover:bg-slate-100/90 transition-colors';
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

    // 4. Load Doc Master items (from storage or fallback)
    const cachedDocs = this.storage.getItem<DocMasterItem[]>(DOC_MASTER_STORAGE_KEY);
    if (cachedDocs && Array.isArray(cachedDocs) && cachedDocs.length > 0) {
      this.docMasterItems.set(cachedDocs);
    } else {
      this.docMasterItems.set(INITIAL_DOC_ITEMS);
    }
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

    // 2. Auto-fill required documents from Doc Master
    const docItem = this.docMasterItems().find(
      (d) => d.schemeName?.trim().toLowerCase() === schemeName.trim().toLowerCase()
    );
    if (docItem && docItem.documents) {
      const docs = docItem.documents
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
      if (docs.length > 0) {
        this.newEoiData.documents = [...docs];
        this.newEoiData.documentFiles = {};
      }
    }
  }

  openConfigureEoiModal(): void {
    this.loadMasterOptions();
    this.editingSchemeRefNo.set(null);
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
    this.newEoiData = createEmptyEoiForm();
    this.showConfigureEoiModal.set(true);
  }

  editScheme(scheme: SchemeTender): void {
    this.loadMasterOptions();
    this.editingSchemeRefNo.set(scheme.refNo);
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
    this.newEoiData = eoiFormFromScheme(scheme);
    this.showConfigureEoiModal.set(true);
  }

  closeConfigureEoiModal(): void {
    this.showConfigureEoiModal.set(false);
  }

  addEoiDocument(): void {
    this.newEoiData.documents.push('');
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
  }

  removeAttachment(index: number): void {
    this.newEoiData.attachments.splice(index, 1);
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
    this.showCorrigendumModal.set(false);
  }

  closeCorrigendumModal(): void {
    this.pendingEditScheme = null;
    this.showCorrigendumModal.set(false);
  }

  // ---- Submit --------------------------------------------------------------

  submitNewEoi(): void {
    this.newEoiSubmitted.set(true);

    // Invalid: fields turn red / show required error
    if (!isEoiFormValid(this.newEoiData)) {
      return;
    }

    this.showConfirmSubmitEoiModal.set(true);
  }

  confirmSubmitNewEoi(): void {
    const targetRef = this.editingSchemeRefNo();
    const existingScheme = targetRef ? this.schemes().find(s => s.refNo === targetRef) : null;
    const newScheme = buildSchemeFromForm(this.newEoiData, existingScheme);

    if (targetRef) {
      // Edit mode: save updated scheme object into pendingEditScheme & open optional Corrigendum modal
      this.pendingEditScheme = newScheme;
      this.showConfigureEoiModal.set(false);
      this.showCorrigendumModal.set(true);
    } else {
      // New EOI mode: save directly via SchemeService
      this.schemeService.createScheme(newScheme).subscribe();
      this.showConfigureEoiModal.set(false);
    }

    this.showConfirmSubmitEoiModal.set(false);
  }

  closeConfirmSubmitEoiModal(): void {
    this.showConfirmSubmitEoiModal.set(false);
  }
}
