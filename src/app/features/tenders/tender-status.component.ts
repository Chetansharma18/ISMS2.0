import { Component, DestroyRef, computed, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentViewerService } from '../../core/services/document-viewer.service';
import { formatDateMedium } from '../../shared/utils';
import { ButtonComponent, IconComponent, IconName } from '../../shared';
import { FileDoc } from '../registration/models/otr-form.model';
import {
  ShortfallRequest,
  SubmittedTender,
  SubmittedTenderDoc,
  TenderAppeal
} from '../../core/models/tender.model';
import { ShortfallBridgeService } from '../eoi/services/shortfall-bridge.service';
import { TenderShortfallSectionComponent } from './tender-status/tender-shortfall-section.component';
import { ShortfallResponseModalComponent, ShortfallSubmission } from './tender-status/shortfall-response-modal.component';
import { openShortfalls, withShortfallResponse } from './tender-status/tender-shortfall.util';
import { TenderAppealSectionComponent } from './tender-status/tender-appeal-section.component';
import { AppealModalComponent } from './tender-status/appeal-modal.component';
import { canAppeal } from './tender-status/tender-appeal.util';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import { TenderListComponent } from './tender-status/tender-list.component';
import { TenderDetailHeaderComponent } from './tender-status/tender-detail-header.component';
import { TenderEditStatusComponent } from './tender-status/tender-edit-status.component';
import { TenderOrgSectionComponent } from './tender-status/tender-org-section.component';
import { TenderSignatorySectionComponent } from './tender-status/tender-signatory-section.component';
import { TenderBankSectionComponent } from './tender-status/tender-bank-section.component';
import { TenderDocumentsTableComponent } from './tender-status/tender-documents-table.component';
import { TenderStep5EmdComponent } from './tender-status/tender-step5-emd.component';
import {
  TenderDocReplaceRequest,
  TenderDocViewRequest,
  TenderProposalDocReplaceRequest
} from './tender-status/tender-doc-card.component';
import {
  applyOtrDocument,
  canEditTender,
  formatUploadedFileSize,
  remainingEdits
} from './tender-status/tender-status.util';

export type { SubmittedTender, SubmittedTenderDoc };

export type TenderDetailTab =
  | 'overview'
  | 'organisation'
  | 'signatory'
  | 'bank'
  | 'documents'
  | 'fees'
  | 'shortfall'
  | 'all';

interface TenderDetailTabItem {
  id: TenderDetailTab;
  label: string;
  icon: IconName;
  badge?: number | string;
  badgeColor?: 'amber' | 'rose';
}

@Component({
  selector: 'app-tender-status',
  standalone: true,
  imports: [
    ButtonComponent,
    IconComponent,
    TenderListComponent,
    TenderDetailHeaderComponent,
    TenderEditStatusComponent,
    TenderOrgSectionComponent,
    TenderSignatorySectionComponent,
    TenderBankSectionComponent,
    TenderDocumentsTableComponent,
    TenderStep5EmdComponent,
    TenderShortfallSectionComponent,
    TenderAppealSectionComponent,
    ShortfallResponseModalComponent,
    AppealModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans">

      <!-- VIEW 1: TENDER STATUS MAIN TABLE -->
      @if (!selectedTender()) {
        <app-tender-list
          [tenders]="tenders()"
          [(searchQuery)]="searchQuery"
          (open)="openApplicationPage($event)"
          (respond)="startShortfallResponse($event)"
          (appeal)="startAppeal($event)"
        />
      }

      <!-- VIEW 2: SUBMISSION DETAIL / EDIT -->
      @if (selectedTender()) {
        <div class="px-4 sm:px-5 lg:px-6 py-4 sm:py-5 space-y-4 font-sans animate-in fade-in duration-150">

          <app-tender-detail-header
            [tender]="selectedTender()!"
            [isEditing]="isEditing()"
            (back)="backToTenderList()"
            (edit)="startEditing()"
            (save)="saveEdits()"
            (cancel)="cancelEditing()"
            (print)="printApplication()"
          />

          @if (canAppealSelected()) {
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-900" role="alert">
              <p class="m-0 text-[13px] leading-snug">
                <strong class="font-semibold">Rejected:</strong>
                {{ selectedTender()!.rejectionReason || 'Technical qualification criteria not met.' }}
              </p>
              <button appButton size="sm" type="button" (click)="openAppealFlow()" class="shrink-0">
                Request for Appeal
              </button>
            </div>
          }

          @if (pendingNoticeCount() > 0) {
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900" role="alert">
              <p class="m-0 text-[13px] leading-snug">
                <strong class="font-semibold">Shortfall request:</strong>
                the department has asked for more documents on this application ({{ pendingNoticeCount() }} pending).
              </p>
              <button appButton size="sm" type="button" (click)="openShortfallFlow()" class="shrink-0">
                Respond
              </button>
            </div>
          }

          <app-tender-edit-status [tender]="selectedTender()!" [isEditing]="isEditing()" />

          <!-- HORIZONTAL NAVIGATION TABS -->
          <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 py-2 -mx-4 sm:-mx-5 lg:-mx-6 px-4 sm:px-5 lg:px-6 shadow-2xs">
            <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
              @for (tab of tabs(); track tab.id) {
                <button
                  appButton
                  [variant]="activeTab() === tab.id ? 'primary' : 'ghost'"
                  size="sm"
                  type="button"
                  (click)="setActiveTab(tab.id)"
                  class="shrink-0 text-xs font-semibold whitespace-nowrap"
                >
                  <app-icon [name]="tab.icon" size="sm" />
                  <span>{{ tab.label }}</span>
                  @if (tab.badge !== undefined && tab.badge !== null) {
                    <span
                      class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10.5px] font-bold"
                      [class.bg-white/20]="activeTab() === tab.id"
                      [class.text-white]="activeTab() === tab.id"
                      [class.bg-slate-100]="activeTab() !== tab.id && !tab.badgeColor"
                      [class.text-slate-700]="activeTab() !== tab.id && !tab.badgeColor"
                      [class.bg-amber-100]="activeTab() !== tab.id && tab.badgeColor === 'amber'"
                      [class.text-amber-800]="activeTab() !== tab.id && tab.badgeColor === 'amber'"
                      [class.bg-rose-100]="activeTab() !== tab.id && tab.badgeColor === 'rose'"
                      [class.text-rose-800]="activeTab() !== tab.id && tab.badgeColor === 'rose'"
                    >
                      {{ tab.badge }}
                    </span>
                  }
                </button>
              }
            </div>
          </div>

          <!-- TAB CONTENT PANELS -->
          <div class="space-y-5 text-xs">

            <!-- TAB 1: OVERVIEW -->
            @if (activeTab() === 'overview') {
              <div class="space-y-4">
                <!-- Processing Fee Status Card -->
                <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Processing Fee Status</h2>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      Paid
                    </span>
                  </div>
                  <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-xs">
                    <div>
                      <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Amount Paid</span>
                      <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ currentApplication().processingFee || '₹2,000.00' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Paid On</span>
                      <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ currentApplication().appliedDate }}</span>
                    </div>
                    <div>
                      <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Transaction ID</span>
                      <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ currentApplication().transactionRef || 'CIN-SBI-9912081' }}</span>
                    </div>
                  </div>
                </section>

                <!-- Section Summary & Quick-Access Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <!-- Organisation Card -->
                  <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <app-icon name="building" size="sm" class="text-navy" />
                          <span>Organisation</span>
                        </span>
                        <span class="text-[11px] font-medium text-slate-500 tabular-nums">CIN: {{ currentApplication().orgDetails.registrationNumber || '-' }}</span>
                      </div>
                      <div class="text-xs space-y-1">
                        <span class="font-semibold text-slate-900 block truncate">{{ currentApplication().orgDetails.fullName || currentApplication().orgDetails.shortName || '-' }}</span>
                        <span class="text-slate-500 block text-[11.5px]">Entity: {{ currentApplication().orgDetails.natureOfEntity || '-' }} &bull; PAN: {{ currentApplication().orgDetails.companyPan || '-' }}</span>
                      </div>
                    </div>
                    <button appButton variant="outline" size="sm" type="button" (click)="setActiveTab('organisation')" class="w-full justify-center">
                      <span>View Organisation &rarr;</span>
                    </button>
                  </div>

                  <!-- Signatory Card -->
                  <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <app-icon name="identification" size="sm" class="text-navy" />
                          <span>Authorized Person</span>
                        </span>
                        <span class="text-[11px] font-medium text-slate-500">Signatory</span>
                      </div>
                      <div class="text-xs space-y-1">
                        <span class="font-semibold text-slate-900 block truncate">{{ currentApplication().signatoryDetails.name || '-' }}</span>
                        <span class="text-slate-500 block text-[11.5px]">{{ currentApplication().signatoryDetails.designation || '-' }} &bull; {{ currentApplication().signatoryDetails.mobileNo || '-' }}</span>
                      </div>
                    </div>
                    <button appButton variant="outline" size="sm" type="button" (click)="setActiveTab('signatory')" class="w-full justify-center">
                      <span>View Signatory &rarr;</span>
                    </button>
                  </div>

                  <!-- Bank Card -->
                  <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <app-icon name="bank" size="sm" class="text-navy" />
                          <span>Bank Account</span>
                        </span>
                        <span class="text-[11px] font-medium text-slate-500 tabular-nums">IFSC: {{ currentApplication().bankDetails.ifscCode || '-' }}</span>
                      </div>
                      <div class="text-xs space-y-1">
                        <span class="font-semibold text-slate-900 block truncate">{{ currentApplication().bankDetails.bankName || '-' }}</span>
                        <span class="text-slate-500 block text-[11.5px]">A/C: {{ currentApplication().bankDetails.accountNo || '-' }}</span>
                      </div>
                    </div>
                    <button appButton variant="outline" size="sm" type="button" (click)="setActiveTab('bank')" class="w-full justify-center">
                      <span>View Bank Details &rarr;</span>
                    </button>
                  </div>

                  <!-- Documents Card -->
                  <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <app-icon name="document" size="sm" class="text-navy" />
                          <span>Proposal Documents</span>
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-50 text-navy font-semibold text-[11px] border border-sky-200">
                          {{ currentApplication().documents.length }} Files
                        </span>
                      </div>
                      <div class="text-xs space-y-1">
                        <span class="font-semibold text-slate-900 block">Mandatory &amp; Annexure Documents</span>
                        <span class="text-slate-500 block text-[11.5px]">All 16 technical proposal documents attached &amp; verified</span>
                      </div>
                    </div>
                    <button appButton variant="outline" size="sm" type="button" (click)="setActiveTab('documents')" class="w-full justify-center">
                      <span>View Documents Table &rarr;</span>
                    </button>
                  </div>

                  <!-- Payments Card -->
                  <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <app-icon name="document-download" size="sm" class="text-navy" />
                          <span>Statutory Payments</span>
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                          Complete
                        </span>
                      </div>
                      <div class="text-xs space-y-1">
                        <span class="font-semibold text-slate-900 block">EMD: {{ currentApplication().emdAmount || '₹50,000' }} &bull; Fee: {{ currentApplication().processingFee || '₹2,000' }}</span>
                        <span class="text-slate-500 block text-[11.5px]">Download official receipts and submission acknowledgement</span>
                      </div>
                    </div>
                    <button appButton variant="outline" size="sm" type="button" (click)="setActiveTab('fees')" class="w-full justify-center">
                      <span>View &amp; Download Receipts &rarr;</span>
                    </button>
                  </div>

                  <!-- Shortfalls Card -->
                  <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-3">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <app-icon name="alert-triangle" size="sm" class="text-amber-600" />
                          <span>Scrutiny &amp; Shortfalls</span>
                        </span>
                        <span
                          class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] border"
                          [class.bg-amber-50]="pendingNoticeCount() > 0"
                          [class.text-amber-800]="pendingNoticeCount() > 0"
                          [class.border-amber-200]="pendingNoticeCount() > 0"
                          [class.bg-slate-50]="pendingNoticeCount() === 0"
                          [class.text-slate-700]="pendingNoticeCount() === 0"
                          [class.border-slate-200]="pendingNoticeCount() === 0"
                        >
                          {{ pendingNoticeCount() > 0 ? (pendingNoticeCount() + ' Pending') : 'Clear' }}
                        </span>
                      </div>
                      <div class="text-xs space-y-1">
                        <span class="font-semibold text-slate-900 block">Department Status: {{ currentApplication().submittedStatus }}</span>
                        <span class="text-slate-500 block text-[11.5px]">View revert requests history and appeal filing status</span>
                      </div>
                    </div>
                    <button appButton variant="outline" size="sm" type="button" (click)="setActiveTab('shortfall')" class="w-full justify-center">
                      <span>View Scrutiny Details &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 2: ORGANISATION DETAILS -->
            @if (activeTab() === 'organisation' || activeTab() === 'all') {
              <app-tender-org-section
                [app]="currentApplication()"
                [editable]="editableTender"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceOtrDoc)="onReplaceOtrDoc($event)"
              />
            }

            <!-- TAB 3: AUTHORIZED SIGNATORY -->
            @if (activeTab() === 'signatory' || activeTab() === 'all') {
              <app-tender-signatory-section
                [app]="currentApplication()"
                [editable]="editableTender"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceOtrDoc)="onReplaceOtrDoc($event)"
              />
            }

            <!-- TAB 4: BANK DETAILS -->
            @if (activeTab() === 'bank' || activeTab() === 'all') {
              <app-tender-bank-section
                [app]="currentApplication()"
                [editable]="editableTender"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceOtrDoc)="onReplaceOtrDoc($event)"
              />
            }

            <!-- TAB 5: MANDATED PROPOSAL DOCUMENTS -->
            @if (activeTab() === 'documents' || activeTab() === 'all') {
              <app-tender-documents-table
                [documents]="currentApplication().documents"
                [isEditing]="isEditing()"
                (viewDoc)="onViewDoc($event)"
                (replaceDoc)="onReplaceDoc($event)"
              />
            }

            <!-- TAB 6: STATUTORY PAYMENTS & RECEIPTS -->
            @if (activeTab() === 'fees' || activeTab() === 'all') {
              <app-tender-step5-emd [app]="currentApplication()" />
            }

            <!-- TAB 7: SHORTFALL REQUESTS & APPEALS -->
            @if (activeTab() === 'shortfall' || activeTab() === 'all') {
              <app-tender-shortfall-section
                [app]="selectedTender()!"
                (respond)="openShortfallModal(selectedTender()!, $event)"
                (viewDoc)="onViewDoc($event)"
              />

              <app-tender-appeal-section [app]="selectedTender()!" (viewDoc)="onViewDoc($event)" />
            }

          </div>

        </div>
      }

      <app-appeal-modal
        [isOpen]="!!appealingTender()"
        [tender]="appealingTender()"
        (submitted)="submitAppeal($event)"
        (close)="appealingTender.set(null)"
      />

      <app-shortfall-response-modal
        [isOpen]="!!respondingRequest()"
        [request]="respondingRequest()"
        (submitted)="submitShortfallResponse($event)"
        (close)="closeShortfallModal()"
      />

    </div>
  `
})
export class TenderStatusComponent {
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');

  // Selected tender state for full page view
  selectedTender = signal<SubmittedTender | null>(null);
  editableTender: SubmittedTender | null = null;
  isEditing = signal<boolean>(false);

  // Active navigation tab
  readonly activeTab = signal<TenderDetailTab>('overview');

  private readonly docViewer = inject(DocumentViewerService);

  private readonly tenderRepo = inject(DataEngineService).for<SubmittedTender>('SUBMITTED_TENDERS');
  private readonly shortfallBridge = inject(ShortfallBridgeService);

  tenders = signal<SubmittedTender[]>([]);

  // Revert (shortfall) response flow
  private respondingTender: SubmittedTender | null = null;
  readonly respondingRequest = signal<ShortfallRequest | null>(null);

  /** Revert requests of the open application that still wait for a reply. */
  readonly pendingNoticeCount = computed(() => {
    const tender = this.selectedTender();
    return tender ? openShortfalls(tender).length : 0;
  });

  /** The rejected application whose appeal form is open. */
  readonly appealingTender = signal<SubmittedTender | null>(null);

  /** The open application is rejected and has not been appealed yet. */
  readonly canAppealSelected = computed(() => {
    const tender = this.selectedTender();
    return !!tender && canAppeal(tender);
  });

  /** Dynamic tabs for the application detail view */
  readonly tabs = computed<TenderDetailTabItem[]>(() => {
    const tender = this.selectedTender();
    const shortfalls = this.pendingNoticeCount();
    const hasAppeal = tender ? !!tender.appeal || tender.submittedStatus === 'Rejected' : false;

    return [
      { id: 'overview', label: 'Overview', icon: 'clipboard' },
      { id: 'organisation', label: 'Organisation', icon: 'building' },
      { id: 'signatory', label: 'Authorized Person', icon: 'identification' },
      { id: 'bank', label: 'Bank Details', icon: 'bank' },
      { id: 'documents', label: 'Documents', icon: 'document', badge: tender?.documents?.length || 16 },
      { id: 'fees', label: 'Payments & Receipts', icon: 'document-download', badge: 3 },
      {
        id: 'shortfall',
        label: 'Shortfall & Appeal',
        icon: 'alert-triangle',
        badge: shortfalls > 0 ? shortfalls : (hasAppeal ? 'Notice' : undefined),
        badgeColor: shortfalls > 0 ? 'amber' : (hasAppeal ? 'rose' : undefined)
      },
      { id: 'all', label: 'All Sections', icon: 'list' }
    ];
  });

  constructor() {
    this.tenderRepo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => this.tenders.set(list));
  }

  currentApplication(): SubmittedTender {
    return this.editableTender || this.selectedTender()!;
  }

  setActiveTab(tab: TenderDetailTab): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openAppealFlow(): void {
    this.setActiveTab('shortfall');
    const tender = this.selectedTender();
    if (tender) this.startAppeal(tender);
  }

  openShortfallFlow(): void {
    this.setActiveTab('shortfall');
    const tender = this.selectedTender();
    if (tender) this.startShortfallResponse(tender);
  }

  openApplicationPage(tender: SubmittedTender): void {
    this.selectedTender.set(tender);
    this.editableTender = null;
    this.isEditing.set(false);
    this.activeTab.set('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToTenderList(): void {
    this.selectedTender.set(null);
    this.editableTender = null;
    this.isEditing.set(false);
    this.activeTab.set('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEditing(): void {
    const tender = this.selectedTender();
    if (!tender) return;

    if (!canEditTender(tender)) {
      if (tender.editCount >= 3) {
        this.notify.warning('Maximum 3 edits limit reached for this application.');
      } else {
        this.notify.error(`Submission window closed on ${tender.closingDate}. Editing is locked.`);
      }
      return;
    }

    // Deep clone active tender for editing
    this.editableTender = JSON.parse(JSON.stringify(tender));
    this.isEditing.set(true);
    // If on overview, guide user to the editable Organisation tab
    if (this.activeTab() === 'overview') {
      this.activeTab.set('organisation');
    }
    this.notify.warning(`Document replacement enabled. You have ${remainingEdits(tender)} edit(s) remaining.`);
  }

  saveEdits(): void {
    if (!this.editableTender || !this.selectedTender()) return;

    // Increment edit count by 1
    const newEditCount = (this.editableTender.editCount || 0) + 1;
    this.editableTender.editCount = newEditCount;

    // Keep the latest revert requests and replies: the edit copy was taken before any reply was sent.
    const updated = { ...this.editableTender, shortfalls: this.selectedTender()!.shortfalls, appeal: this.selectedTender()!.appeal };

    // Update in reactive signal list, then persist through the data layer
    this.tenders.update(list => list.map(t => t.id === updated.id ? updated : t));
    this.tenderRepo.update(updated.id, updated).subscribe();
    this.selectedTender.set(updated);
    this.editableTender = null;
    this.isEditing.set(false);

    const remaining = Math.max(0, 3 - newEditCount);
    this.notify.success(
      `✓ Application updated successfully! Used edit ${newEditCount} of 3 (${remaining} remaining).`
    );
  }

  cancelEditing(): void {
    this.editableTender = null;
    this.isEditing.set(false);
    this.notify.warning('Edit discarded. No changes made.');
  }

  printApplication(): void {
    // When printing, switch to all sections for a full printout
    this.activeTab.set('all');
    setTimeout(() => {
      window.print();
    }, 200);
  }

  // ---- Appeal against a rejection ------------------------------------------

  startAppeal(tender: SubmittedTender): void {
    if (canAppeal(tender)) this.appealingTender.set(tender);
  }

  submitAppeal(appeal: TenderAppeal): void {
    const tender = this.appealingTender();
    if (!tender || !canAppeal(tender)) return;

    const updated: SubmittedTender = { ...tender, appeal };
    this.tenders.update(list => list.map(t => (t.id === updated.id ? updated : t)));
    if (this.selectedTender()?.id === updated.id) this.selectedTender.set(updated);
    this.tenderRepo.update(updated.id, { appeal }).subscribe();

    this.appealingTender.set(null);
    this.notify.success('Your appeal has been submitted.');
  }

  // ---- Revert (shortfall) requests -----------------------------------------

  /** Opens the reply form for the oldest request that still waits for a response. */
  startShortfallResponse(tender: SubmittedTender): void {
    const next = openShortfalls(tender)[0];
    if (next) this.openShortfallModal(tender, next);
  }

  openShortfallModal(tender: SubmittedTender, request: ShortfallRequest): void {
    if (request.status !== 'Open') return;
    this.respondingTender = tender;
    this.respondingRequest.set(request);
  }

  closeShortfallModal(): void {
    this.respondingTender = null;
    this.respondingRequest.set(null);
  }

  submitShortfallResponse(submission: ShortfallSubmission): void {
    const tender = this.respondingTender;
    const notice = this.respondingRequest();
    if (!tender || !notice) return;

    const shortfalls = withShortfallResponse(tender, submission.shortfallId, submission.response);
    const updated: SubmittedTender = { ...tender, shortfalls };

    this.tenders.update(list => list.map(t => (t.id === updated.id ? updated : t)));
    if (this.selectedTender()?.id === updated.id) this.selectedTender.set(updated);

    this.tenderRepo.update(updated.id, { shortfalls }).subscribe();
    this.shortfallBridge
      .notifyDepartment(updated, notice, submission.response)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.closeShortfallModal();
    this.notify.success('Your response to the shortfall request has been submitted.');
  }

  // Document Viewer Helpers
  onViewDoc(request: TenderDocViewRequest): void {
    this.viewDoc(request.fileName, request.title, request.fileSize);
  }

  viewDoc(fileName: string, title?: string, fileSize?: string): void {
    this.docViewer.openDocument({
      fileName,
      fileSize: fileSize || '1.2 MB',
      uploadDate: 'Verified & Attached',
      status: 'uploaded'
    }, title || fileName);
  }

  onReplaceOtrDoc(request: TenderDocReplaceRequest): void {
    const input = request.event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.editableTender) return;
    const file = input.files[0];
    const fileDoc: FileDoc = {
      fileName: file.name,
      fileSize: formatUploadedFileSize(file.size),
      uploadDate: formatDateMedium(new Date()),
      status: 'uploaded'
    };

    applyOtrDocument(this.editableTender, request.docType, fileDoc);
    input.value = '';
    this.notify.success(`Updated document: ${file.name}`);
  }

  onReplaceDoc(request: TenderProposalDocReplaceRequest): void {
    const input = request.event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.editableTender) return;
    const file = input.files[0];

    const docItem = this.editableTender.documents.find(d => d.id === request.doc.id);
    if (docItem) {
      docItem.fileName = file.name;
      docItem.fileSize = formatUploadedFileSize(file.size);
      docItem.status = 'uploaded';
      this.notify.success(`Replaced ${request.doc.name} with ${file.name}`);
    }
    input.value = '';
  }
}
