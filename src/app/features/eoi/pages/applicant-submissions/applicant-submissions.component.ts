import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { jsPDF } from 'jspdf';
import { EoiStateService, ApplicantResponse } from '../../services/eoi-state.service';
import { DataEngineService } from '../../../../core/services/data-engine.service';
import { GradingMasterItem } from '../../../../core/models/admin-masters.model';
import type { EmpanelmentOrder, EmpanelledAgencyItem, RejectedAgencyItem } from '../../models/empanelment-order.model';
import { EmpanelmentOrderService, DEFAULT_COMMITTEE_MEMBERS } from '../../services/empanelment-order.service';
import { OrderViewerModalComponent } from '../../components/order-viewer-modal/order-viewer-modal.component';
import { downloadEvaluationExcelFile, parseEvaluationSpreadsheet, ParsedEvaluationRow } from '../../utils/eoi-evaluation-excel.util';
import { formatDate } from '../../../../shared/utils';
import {
  ButtonComponent,
  IconComponent,
  ListPageComponent,
  ModalComponent,
  TableColumn
} from '../../../../shared';

@Component({
  selector: 'app-applicant-submissions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ListPageComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    OrderViewerModalComponent
  ],
  template: `
    <app-list-page
      title="Applicant Submissions"
      [breadcrumbs]="[
        { label: 'Home', url: '/' },
        { label: 'EOI Responses', url: '/admin/eoi-view' },
        { label: 'Applicant Submissions' }
      ]"
      searchPlaceholder="Search Applicant, Reg No., Org..."
      [(searchQuery)]="searchQuery"
      [columns]="submissionColumns"
      [data]="filteredResponses()"
      [pagination]="true"
      [pageSize]="10"
      emptyMessage="No submissions found."
      [customTemplates]="{
        anonymousLabel: applicantTemplate,
        status: statusTemplate,
        action: actionTemplate
      }"
    >
        <!-- Action Toolbar: Back, Excel Download, Generate Order, Total Count -->
        <div beforeTable class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3">
          <!-- Left: Back Button, Excel Download Button, Generate Empanelment Order -->
          <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button appButton variant="outline" size="sm" class="shrink-0" (click)="goBack()" title="Back to EOI Responses">
              <app-icon name="chevron-left" size="sm" />
              <span>Back</span>
            </button>

            <!-- Excel Download Button -->
            <button
              appButton
              variant="outline"
              size="sm"
              class="shrink-0"
              (click)="downloadOfflineEvaluationExcel()"
              [disabled]="isDownloadingExcel()"
              title="Download Evaluation Excel with Dropdowns for Status and Grading"
            >
              <app-icon name="download" size="sm" />
              <span>{{ isDownloadingExcel() ? 'Generating Excel...' : 'Download Excel' }}</span>
            </button>

            <!-- Upload Excel Button -->
            <button
              appButton
              variant="outline"
              size="sm"
              class="shrink-0"
              (click)="openUploadExcelModal()"
              title="Upload evaluated Excel spreadsheet (.xlsx, .xls)"
            >
              <app-icon name="upload" size="sm" />
              <span>Upload Excel</span>
            </button>

            <!-- Dynamic Empanelment Order Release Flow Button -->
            @if (!isApprovedOrderReleased()) {
              <!-- Step 1: Approved Empanelment Order must be released first -->
              <button
                appButton
                size="sm"
                class="shrink-0"
                (click)="navigateToOrderEditor('empanelment')"
                title="Generate Empanelment Order for eligible applicants"
              >
                <app-icon name="clipboard-check" size="sm" />
                <span>Generate Empanelment Order</span>
              </button>
            } @else if (!isRejectedOrderReleased()) {
              <!-- Step 2: Approved Order is released, now release rejected order -->
              <button
                appButton
                variant="danger"
                size="sm"
                class="shrink-0"
                (click)="navigateToOrderEditor('rejection')"
                title="Release Rejected Empanelment Order for disqualified applicants"
              >
                <app-icon name="alert-triangle" size="sm" />
                <span>Release Rejected Empanelment Order</span>
              </button>
            } @else {
              <!-- Step 3: Both orders released -->
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <app-icon name="check-circle" size="xs" class="text-emerald-600" />
                  <span>All Orders Released</span>
                </span>
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  class="shrink-0"
                  (click)="navigateToOrderEditor('empanelment')"
                  title="View Released Empanelment Orders"
                >
                  <app-icon name="eye" size="xs" />
                  <span>View Orders</span>
                </button>
              </div>
            }
          </div>

          <!-- Total Submissions Count -->
          <div class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span class="text-slate-500 font-normal">Total Submissions:</span>
            <span class="font-bold text-slate-800">{{ totalSubmissionsCount() }}</span>
          </div>
        </div>

        <ng-template #applicantTemplate let-item>
          <div class="font-normal text-slate-800 text-[13px]">
            {{ item.anonymousLabel }}
          </div>
          <div class="text-[11px] tabular-nums text-text-muted mt-0.5">
            {{ item.regNumber }}
          </div>
        </ng-template>

        <!-- Status column displaying Pending, Approved, or Rejected -->
        <ng-template #statusTemplate let-item>
          <span
            class="inline-block px-2.5 py-1 rounded-md text-xs font-medium border"
            [class]="item.status === 'APPROVED' ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : (item.status === 'REJECTED' ? 'text-rose-800 bg-rose-50 border-rose-200' : 'text-amber-800 bg-amber-50 border-amber-200')"
          >
            {{ item.statusDisplay || (item.status === 'APPROVED' ? 'Approved' : (item.status === 'REJECTED' ? 'Rejected' : 'Pending')) }}
          </span>
        </ng-template>

        <ng-template #actionTemplate let-item>
          <a
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            [routerLink]="['/admin/review', item.id]"
            title="Review Submission"
            aria-label="Review Submission"
          >
            <app-icon name="eye" size="sm" />
          </a>
        </ng-template>

    </app-list-page>

    <!-- Upload Excel Modal -->
    @if (showUploadModal()) {
      <app-modal
        title="Upload Evaluation Spreadsheet"
        subtitle="Upload evaluated spreadsheet (.xlsx, .xls) to update applicant statuses"
        size="md"
        (close)="closeUploadExcelModal()"
      >
        @if (isUploading()) {
          <!-- 3-4 Second Progress Loader -->
          <div class="py-10 px-4 text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto animate-pulse">
              <app-icon name="refresh" size="lg" class="animate-spin" />
            </div>
            <div class="space-y-1">
              <h4 class="text-sm font-bold text-slate-900 m-0">{{ uploadLoadingStatus() }}</h4>
              <p class="text-xs text-slate-500 m-0">Evaluating records &amp; compiling official empanelment order...</p>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto border border-slate-200">
              <div
                class="bg-primary h-2 rounded-full transition-all duration-700 ease-out"
                [style.width.%]="uploadProgressPercent()"
              ></div>
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            <!-- Hidden native file input -->
            <input
              #fileInput
              type="file"
              class="hidden"
              accept=".xlsx,.xls"
              (change)="onUploadFileSelected($event)"
            />

            <!-- Upload Dropzone Area -->
            <div
              (click)="fileInput.click()"
              class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary/60 transition-colors bg-slate-50/50 cursor-pointer"
            >
              <div class="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <app-icon name="upload" size="lg" />
              </div>
              <p class="text-sm font-semibold text-slate-800 mb-1">
                Click to choose an Excel file
              </p>
              <p class="text-xs text-slate-500">
                Supports .xlsx and .xls formats
              </p>
            </div>

            <!-- Selected File Display -->
            @if (selectedUploadFile()) {
              <div class="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-2 truncate">
                  <app-icon name="file" size="sm" class="text-primary shrink-0" />
                  <span class="font-semibold text-slate-800 truncate">{{ selectedUploadFile()!.name }}</span>
                  <span class="text-slate-500 shrink-0">({{ formatFileSize(selectedUploadFile()!.size) }})</span>
                </div>
                <button
                  appButton
                  variant="ghost"
                  size="sm"
                  iconOnly
                  type="button"
                  (click)="removeSelectedUploadFile($event)"
                  title="Remove file"
                >
                  <app-icon name="close" size="xs" />
                </button>
              </div>
            }

            <!-- Validation Error Alert -->
            @if (uploadError()) {
              <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <app-icon name="alert-triangle" size="xs" class="shrink-0 mt-0.5" />
                <span>{{ uploadError() }}</span>
              </div>
            }

            <!-- Success Alert -->
            @if (uploadSuccessMessage()) {
              <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <app-icon name="check-circle" size="xs" />
                <span>{{ uploadSuccessMessage() }}</span>
              </div>
            }
          </div>
        }

        <ng-container modalFooter>
          <button
            appButton
            variant="primary"
            size="sm"
            class="w-full sm:w-auto"
            [disabled]="!selectedUploadFile() || isUploading()"
            (click)="submitExcelUpload()"
            [loading]="isUploading()"
          >
            <app-icon name="upload" size="xs" />
            <span>{{ isUploading() ? 'Processing...' : 'Submit Upload' }}</span>
          </button>
        </ng-container>
      </app-modal>
    }

    <!-- Modal for Official Order Viewer with RajKaj Seal & Download -->
    @if (showOrderViewerModal()) {
      <app-order-viewer-modal
        [order]="selectedViewOrder()"
        [orderType]="selectedViewOrderType()"
        [isEditable]="true"
        (close)="showOrderViewerModal.set(false)"
      />
    }
  `
})
export class ApplicantSubmissionsComponent {
  private eoiStateService = inject(EoiStateService);
  private empanelmentOrderService = inject(EmpanelmentOrderService);
  private dataEngine = inject(DataEngineService, { optional: true });
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  responses = signal<ApplicantResponse[]>([]);
  searchQuery = signal<string>('');
  schemeId = signal<string>('');
  isDownloadingExcel = signal<boolean>(false);
  isDownloadingAll = signal<boolean>(false);
  downloadType = signal<'zip' | 'pdf'>('zip');

  showOrderViewerModal = signal<boolean>(false);
  selectedViewOrder = signal<EmpanelmentOrder | null>(null);
  selectedViewOrderType = signal<'EMPANELMENT' | 'REJECTION'>('EMPANELMENT');
  currentOrder = signal<EmpanelmentOrder | null>(null);

  readonly isApprovedOrderReleased = computed(() => {
    return this.currentOrder()?.status === 'E_SIGNED';
  });

  readonly isRejectedOrderReleased = computed(() => {
    return this.currentOrder()?.rejectionStatus === 'E_SIGNED';
  });

  // Excel Upload Modal State
  showUploadModal = signal<boolean>(false);
  selectedUploadFile = signal<File | null>(null);
  uploadError = signal<string>('');
  uploadSuccessMessage = signal<string>('');
  isUploading = signal<boolean>(false);
  uploadLoadingStatus = signal<string>('Validating evaluation spreadsheet records...');
  uploadProgressPercent = signal<number>(25);

  readonly submissionColumns: TableColumn<ApplicantResponse>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'anonymousLabel', label: 'Applicant / Legal Firm Name', width: 'min-w-[260px]', type: 'custom' },
    { key: 'submissionDate', label: 'Submitted Date', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-32', type: 'custom' }
  ];

  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const sId = params['schemeId'] || 'ALL';
      this.schemeId.set(sId);
      this.loadResponses(sId);
      this.loadOrderState(sId);
    });
  }

  loadOrderState(sId: string): void {
    const targetSchemeId = sId === 'ALL' ? 'MMKVY-01' : sId;
    this.empanelmentOrderService.getOrderBySchemeId(targetSchemeId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(order => {
      this.currentOrder.set(order || null);
    });
  }

  loadResponses(sId: string): void {
    this.eoiStateService.getResponses(sId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      // Ensure all initial submissions on this page show 'Pending' as requested
      const pendingSubmissions = (data || []).map(r => ({
        ...r,
        status: 'UNDER_SCRUTINY' as const,
        statusDisplay: 'Pending'
      }));
      this.responses.set(pendingSubmissions);
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/eoi-view']);
  }

  totalSubmissionsCount = computed(() => this.responses().length);

  currentSchemeName = computed(() => {
    const list = this.responses();
    return list[0]?.schemeName || 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)';
  });

  currentEoiRefNo = computed(() => {
    const list = this.responses();
    return list[0]?.eoiRefNo || this.schemeId() || 'RSLDC/EOI/2026/MMKVY-01';
  });

  filteredResponses = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.responses();
    if (!query) return list;
    return list.filter(r =>
      (r.anonymousLabel && r.anonymousLabel.toLowerCase().includes(query)) ||
      (r.regNumber && r.regNumber.toLowerCase().includes(query)) ||
      (r.actualLegalName && r.actualLegalName.toLowerCase().includes(query))
    );
  });

  onOrderGenerated(order: EmpanelmentOrder): void {
    const acceptedMap = new Set(order.empanelledAgencies.map(a => a.applicationId));
    const rejectedMap = new Set(order.rejectedAgencies.map(a => a.applicationId));

    this.responses.update(list =>
      list.map(r => {
        if (acceptedMap.has(r.regNumber) || acceptedMap.has(r.id)) {
          return { ...r, status: 'APPROVED' as const, statusDisplay: 'Approved' };
        }
        if (rejectedMap.has(r.regNumber) || rejectedMap.has(r.id)) {
          return { ...r, status: 'REJECTED' as const, statusDisplay: 'Rejected' };
        }
        return r;
      })
    );
  }

  navigateToOrderEditor(type: 'empanelment' | 'rejection' = 'empanelment'): void {
    const sId = this.schemeId() || 'MMKVY-01';
    if (type === 'rejection') {
      if (!this.isApprovedOrderReleased()) {
        alert('Please release the Approved Empanelment Order first.');
        return;
      }
      this.router.navigate(['/admin/empanelment-order-editor', sId], { queryParams: { type: 'rejection' } });
    } else {
      this.router.navigate(['/admin/empanelment-order-editor', sId]);
    }
  }

  onViewEmpanelmentOrder(order: EmpanelmentOrder): void {
    this.selectedViewOrder.set(order);
    this.selectedViewOrderType.set('EMPANELMENT');
    this.showOrderViewerModal.set(true);
  }

  onViewRejectionOrder(order: EmpanelmentOrder): void {
    this.selectedViewOrder.set(order);
    this.selectedViewOrderType.set('REJECTION');
    this.showOrderViewerModal.set(true);
  }

  openUploadExcelModal(): void {
    this.selectedUploadFile.set(null);
    this.uploadError.set('');
    this.uploadSuccessMessage.set('');
    this.isUploading.set(false);
    this.uploadLoadingStatus.set('Validating evaluation spreadsheet records...');
    this.uploadProgressPercent.set(25);
    this.showUploadModal.set(true);
  }

  closeUploadExcelModal(): void {
    this.showUploadModal.set(false);
    this.selectedUploadFile.set(null);
    this.uploadError.set('');
    this.uploadSuccessMessage.set('');
    this.isUploading.set(false);
  }

  onUploadFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    this.uploadError.set('');
    this.uploadSuccessMessage.set('');

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      this.uploadError.set('Unsupported file format. Please upload a valid .xlsx or .xls file.');
      this.selectedUploadFile.set(null);
      return;
    }

    this.selectedUploadFile.set(file);
  }

  removeSelectedUploadFile(event: Event): void {
    event.stopPropagation();
    this.selectedUploadFile.set(null);
    this.uploadError.set('');
    this.uploadSuccessMessage.set('');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async submitExcelUpload(): Promise<void> {
    const file = this.selectedUploadFile();
    if (!file) {
      this.uploadError.set('Please select an Excel file to upload.');
      return;
    }

    this.isUploading.set(true);
    this.uploadError.set('');
    this.uploadLoadingStatus.set('Validating evaluation spreadsheet records...');
    this.uploadProgressPercent.set(30);

    try {
      const parsed = await parseEvaluationSpreadsheet(file);
      if (!parsed.isValid && parsed.errors && parsed.errors.length > 0) {
        this.uploadError.set(parsed.errors[0]);
        this.isUploading.set(false);
        return;
      }

      const acceptedMap = new Map<string, ParsedEvaluationRow>();
      parsed.accepted.forEach(r => {
        acceptedMap.set(r.refNo.toLowerCase().trim(), r);
      });

      const rejectedMap = new Map<string, ParsedEvaluationRow>();
      parsed.rejected.forEach(r => {
        rejectedMap.set(r.refNo.toLowerCase().trim(), r);
      });

      this.responses.update(list =>
        list.map(item => {
          const key1 = item.regNumber.toLowerCase().trim();
          const key2 = item.id.toLowerCase().trim();

          const acc = acceptedMap.get(key1) || acceptedMap.get(key2);
          if (acc) {
            return {
              ...item,
              status: 'APPROVED' as const,
              statusDisplay: 'Approved',
              evaluationStatus: 'Approved',
              evaluationGrade: acc.grade,
              evaluationRemarks: acc.reason
            };
          }

          const rej = rejectedMap.get(key1) || rejectedMap.get(key2);
          if (rej) {
            return {
              ...item,
              status: 'REJECTED' as const,
              statusDisplay: 'Rejected',
              evaluationStatus: 'Rejected',
              evaluationGrade: rej.grade,
              evaluationRemarks: rej.reason
            };
          }

          return item;
        })
      );

      // Seed / save top 10 eligible companies and rejected companies to EmpanelmentOrderService
      const sId = this.schemeId() || 'MMKVY-01';
      const approvedItems = this.responses().filter(r => r.status === 'APPROVED');
      const empanelledRows: EmpanelledAgencyItem[] = [];

      for (let i = 0; i < 10; i++) {
        const app = approvedItems[i];
        empanelledRows.push({
          sNo: i + 1,
          applicationId: app?.regNumber || `ISMS-REG-2026-${8819 + i}`,
          agencyName: `Company ${i + 1}`,
          category: 'A1(skilling)',
          fileStatus: 'Eligible',
          marksGrade: app?.evaluationGrade || (i < 2 ? 'A+' : (i < 5 ? 'A' : 'B+'))
        });
      }

      const rejectedItems = this.responses().filter(r => r.status === 'REJECTED');
      const rejectedRows: RejectedAgencyItem[] = [];
      if (rejectedItems.length > 0) {
        rejectedItems.forEach((rep, idx) => {
          rejectedRows.push({
            sNo: idx + 1,
            applicationId: rep.regNumber || `ISMS-REG-2026-${8835 + idx}`,
            agencyName: rep.anonymousLabel || rep.actualLegalName || `Disqualified Agency ${idx + 1}`,
            category: 'A1(skilling)',
            fileStatus: 'Not Eligible',
            reason: rep.evaluationRemarks || 'Failed to meet mandatory criteria as per EOI guidelines'
          });
        });
      } else {
        rejectedRows.push(
          { sNo: 1, applicationId: 'ISMS-REG-2026-8835', agencyName: 'Universal Skills Pvt Ltd', category: 'A1(skilling)', fileStatus: 'Not Eligible', reason: 'Failed minimum turnover requirement for 3 consecutive fiscal years as per Clause 4.2.' },
          { sNo: 2, applicationId: 'ISMS-REG-2026-8836', agencyName: 'Apex Educational Trust', category: 'A2(Non-skilling)', fileStatus: 'Not Eligible', reason: 'Non-submission of mandatory CA-certified net worth certificate and GST registration.' },
          { sNo: 3, applicationId: 'ISMS-REG-2026-8837', agencyName: 'Vanguard Vocational Society', category: 'A1(skilling)', fileStatus: 'Not Eligible', reason: 'Blacklisted / barred by Central/State Department during preceding 2 years.' },
          { sNo: 4, applicationId: 'ISMS-REG-2026-8838', agencyName: 'SkillTech Training Foundation', category: 'A2(Non-skilling)', fileStatus: 'Not Eligible', reason: 'Inadequate training center infrastructure & failure in physical inspection norms.' }
        );
      }

      this.empanelmentOrderService.saveOrder({
        id: `ORD-${sId}`,
        schemeId: sId,
        schemeName: this.currentSchemeName(),
        eoiRefNo: this.currentEoiRefNo(),
        fileNo: 'RSLDC/EOI/SAMARTH/2026-27/1709-15',
        orderDate: formatDate(new Date()),
        status: 'DRAFT',
        subject: `Empanelment order against EOI published on 22.01.2026 under MMKVY Category III SAMARTH for FY 2026-2027.`,
        preamble1: `An Expression of Interest (EOI) was published under Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH scheme for empanelment of Project Implementing Agencies (PIAs).`,
        preamble2: `Pursuant to the evaluation and De Novo Assessment process, the following agencies are hereby shortlisted and empaneled under SAMARTH scheme for FY 2026-2027.`,
        issuingAuthority: {
          name: 'Rishav Mandal',
          designation: 'Managing Director, I.A.S.',
          department: 'Rajasthan Skill & Livelihoods Development Corporation'
        },
        copyToList: [
          "PS to Hon'ble Minister, DSEE",
          'PS to Managing Director, RSLDC',
          'General Manager, RSLDC',
          'All Concerned Agencies',
          'Guard File'
        ],
        committeeMembers: DEFAULT_COMMITTEE_MEMBERS.map(m => ({ ...m, otpVerified: false, otpSent: false })),
        empanelledAgencies: empanelledRows,
        rejectedAgencies: rejectedRows,
        createdAt: formatDate(new Date())
      });

      // 3 to 4 Second Loader steps
      setTimeout(() => {
        this.uploadLoadingStatus.set('Evaluating applicant scores & recommendation outcomes...');
        this.uploadProgressPercent.set(65);
      }, 1200);

      setTimeout(() => {
        this.uploadLoadingStatus.set('Compiling official Empanelment Order with eligible companies...');
        this.uploadProgressPercent.set(90);
      }, 2400);

      setTimeout(() => {
        this.uploadProgressPercent.set(100);
        this.isUploading.set(false);
        this.showUploadModal.set(false);
        this.selectedUploadFile.set(null);
        this.router.navigate(['/admin/empanelment-order-editor', sId]);
      }, 3500);

    } catch (err: any) {
      console.error('Error uploading evaluation excel:', err);
      this.uploadError.set(err?.message || 'Failed to process Excel file. Please ensure valid OpenXML structure.');
      this.isUploading.set(false);
    }
  }

  /**
   * Downloads evaluation excel file containing all submitted companies for this scheme
   * with in-cell dropdown data validations for Status ("Approved,Reject") and
   * Grading (from Super Admin Grading Master), plus a Reason / Remarks column.
   */
  async downloadOfflineEvaluationExcel(): Promise<void> {
    const list = this.filteredResponses();
    if (!list || list.length === 0) return;

    this.isDownloadingExcel.set(true);
    try {
      let gradeOptions: (string | { grade: string; range?: string })[] = [
        { grade: 'A+', range: '85 - 100' },
        { grade: 'A', range: '70 - 84' },
        { grade: 'B', range: '55 - 69' },
        { grade: 'C', range: '40 - 54' },
        { grade: 'D', range: '0 - 39' }
      ];
      if (this.dataEngine) {
        try {
          const masters = await firstValueFrom(
            this.dataEngine.for<GradingMasterItem>('GRADING_MASTERS', { idKey: 'id' }).getAll()
          );
          const activeItems = (masters || []).filter(g => g.status !== 'Inactive' && !!g.grade);
          if (activeItems.length > 0) {
            const seen = new Set<string>();
            const unique: { grade: string; range?: string }[] = [];
            for (const g of activeItems) {
              const gradeName = g.grade.trim();
              if (!seen.has(gradeName)) {
                seen.add(gradeName);
                const r = (g.range || (g.minimum !== undefined && g.maximum !== undefined ? `${g.minimum} - ${g.maximum}` : '')).trim();
                unique.push({ grade: gradeName, range: r });
              }
            }
            if (unique.length > 0) {
              gradeOptions = unique;
            }
          }
        } catch (e) {
          console.warn('Could not load grades from data engine, using defaults', e);
        }
      }

      const schemeTitle = list[0]?.schemeName || 'RSLDC Skill Development Scheme';
      const eoiRefNo = list[0]?.eoiRefNo || this.schemeId() || 'EOI-2026';
      const cleanCode = (this.schemeId() || 'EOI').replace(/[^a-zA-Z0-9_-]/g, '_');

      const rows = list.map((app, idx) => ({
        sNo: idx + 1,
        refNo: app.regNumber || app.id,
        companyName: app.anonymousLabel || app.actualLegalName,
        status: '',
        grade: '',
        reason: ''
      }));

      await downloadEvaluationExcelFile({
        fileName: `RSLDC_Evaluation_${cleanCode}.xlsx`,
        schemeTitle,
        eoiRefNo,
        rows,
        gradeOptions,
        statusOptions: ['Approved', 'Reject']
      });
    } catch (err) {
      console.error('Error generating Excel file:', err);
    } finally {
      this.isDownloadingExcel.set(false);
    }
  }

  /**
   * Renders a single official applicant IPA or review outcome document on a given PDF instance page
   */
  private renderApplicantPdfPage(
    pdf: jsPDF,
    app: ApplicantResponse,
    currentSchemeTitle: string,
    today: string,
    currentPage: number,
    totalPages: number
  ): void {
    const isApproved = app.status === 'APPROVED';
    const isRejected = app.status === 'REJECTED';

    // Outer Border framing
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.35);
    pdf.rect(10, 10, 190, 277);

    // Header banner (Navy)
    pdf.setFillColor(11, 53, 88);
    pdf.rect(10, 10, 190, 26, 'F');
    pdf.setFillColor(234, 179, 8);
    pdf.rect(10, 36, 190, 1.8, 'F');

    // Header Text
    pdf.setTextColor(254, 240, 138);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('GOVERNMENT OF RAJASTHAN', 105, 17, { align: 'center' });

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9.5);
    pdf.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', 105, 23, { align: 'center' });

    pdf.setTextColor(186, 230, 253);
    pdf.setFontSize(7.5);
    pdf.text('INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)', 105, 29, { align: 'center' });

    // Document Title Box
    let y = 46;
    const docTitle = isApproved
      ? 'IN-PRINCIPLE APPROVAL (IPA) LETTER'
      : isRejected
        ? 'APPLICATION REVIEW & SCRUTINY OUTCOME'
        : 'APPLICATION SUBMISSION DOSSIER SUMMARY';

    pdf.setTextColor(11, 53, 88);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(docTitle, 15, y);

    y += 5.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Scheme: ${currentSchemeTitle} | EOI Ref: ${app.eoiRefNo || this.schemeId()}`, 15, y);

    // Metadata grid
    y += 6;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(15, y, 180, 22, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text('APPLICATION ID', 20, y + 6);
    pdf.text('APPLICANT / LEGAL FIRM', 75, y + 6);
    pdf.text('ISSUE DATE', 145, y + 6);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(app.id, 20, y + 13);
    pdf.text(app.anonymousLabel || 'Registered Agency', 75, y + 13);
    pdf.text(today, 145, y + 13);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Reg No: ${app.regNumber}`, 75, y + 18);

    // Subject & Recipient
    y += 30;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('To,', 15, y);
    y += 5;
    pdf.text(app.anonymousLabel || 'Authorized Signatory / Partner', 15, y);
    y += 4.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Registration Number: ${app.regNumber}`, 15, y);
    y += 4.5;
    pdf.text('Rajasthan, India', 15, y);

    y += 8;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(15, y, 180, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(11, 53, 88);
    pdf.text(
      isApproved
        ? 'Subject: In-Principle Approval (IPA) for Allocation of Physical Training Targets FY 2026-27'
        : isRejected
          ? 'Subject: Intimation of Application Scrutiny & Evaluation Outcome'
          : 'Subject: Acknowledgment & Dossier Summary for EOI Application',
      18,
      y + 5.5
    );

    // Body Content
    y += 14;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(30, 41, 59);

    if (isApproved) {
      const bodyText = `With reference to your proposal submitted under EOI Ref No. ${app.eoiRefNo || this.schemeId()}, the State Level Scrutiny & Empanelment Committee has reviewed and scrutinized the technical documentation, past training track record, and financial turnover submitted by your organization.\n\n` +
        `The Competent Authority is pleased to convey In-Principle Approval (IPA) to ${app.anonymousLabel} for imparting skill training under ${currentSchemeTitle} for Financial Year 2026-27.`;
      const splitBody = pdf.splitTextToSize(bodyText, 180);
      pdf.text(splitBody, 15, y);
      y += splitBody.length * 4.5 + 4;

      // Details Table
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(187, 247, 208);
      pdf.roundedRect(15, y, 180, 30, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(22, 101, 52);
      pdf.text('APPROVED SANCTION & TARGET PARAMETERS:', 20, y + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Application Status:', 20, y + 13);
      pdf.text('Empanelment Grade:', 20, y + 19);
      pdf.text('Allocated Physical Target:', 20, y + 25);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(22, 101, 52);
      pdf.text('APPROVED & ISSUED', 75, y + 13);
      pdf.text('Grade A (Verified)', 75, y + 19);
      pdf.text('300 Trainees (FY 2026-27)', 75, y + 25);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text('Submission Date:', 125, y + 13);
      pdf.text('Biometric AEBAS:', 125, y + 19);
      pdf.text('IP Camera Norms:', 125, y + 25);

      pdf.setFont('helvetica', 'bold');
      pdf.text(app.submissionDate || today, 160, y + 13);
      pdf.text('Mandatory', 160, y + 19);
      pdf.text('Mandatory', 160, y + 25);

      y += 36;
    } else if (isRejected) {
      const bodyText = `With reference to your proposal submitted under EOI Ref No. ${app.eoiRefNo || this.schemeId()}, the State Level Scrutiny Committee has completed the document verification and technical scrutiny.\n\n` +
        `We regret to inform you that your application could not be approved for empanelment under ${currentSchemeTitle} for FY 2026-27 due to non-fulfillment of mandatory eligibility criteria or technical dossier discrepancies.\n\n` +
        `Review Status: REJECTED (Disqualified at Stage 1 Technical Scrutiny).`;
      const splitBody = pdf.splitTextToSize(bodyText, 180);
      pdf.text(splitBody, 15, y);
      y += splitBody.length * 4.5 + 4;

      // Details Table
      pdf.setFillColor(255, 241, 242);
      pdf.setDrawColor(254, 205, 211);
      pdf.roundedRect(15, y, 180, 24, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(159, 18, 57);
      pdf.text('SCRUTINY REVIEW DETAILS:', 20, y + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Application Status:', 20, y + 13);
      pdf.text('Submission Date:', 20, y + 19);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(159, 18, 57);
      pdf.text('REJECTED', 70, y + 13);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      pdf.text(app.submissionDate || today, 70, y + 19);

      y += 30;
    } else {
      const bodyText = `Application proposal submitted under EOI Ref No. ${app.eoiRefNo || this.schemeId()} is currently Under Technical Scrutiny by the Department Empanelment Committee.`;
      const splitBody = pdf.splitTextToSize(bodyText, 180);
      pdf.text(splitBody, 15, y);
      y += splitBody.length * 4.5 + 10;
    }

    // Mandatory Terms Note
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    const footerNote = 'Note: This is an official digitally generated document issued by the Rajasthan Skill and Livelihoods Development Corporation (RSLDC) via ISMS 2.0 portal.';
    pdf.text(footerNote, 15, y);

    // Signatory Footer
    const signY = 250;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(15, signY, 195, signY);

    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(187, 247, 208);
    pdf.roundedRect(15, signY + 3, 52, 12, 1, 1, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(22, 101, 52);
    pdf.text('✓ DIGITALLY VERIFIED', 18, signY + 10);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Managing Director', 195, signY + 8, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('RSLDC, Jaipur (Govt. of Rajasthan)', 195, signY + 13, { align: 'right' });

    // Page Number Footer
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${currentPage} of ${totalPages} | Applicant: ${app.anonymousLabel} (${app.id})`, 105, 282, { align: 'center' });
  }

  /**
   * Generates and downloads individual official IPA / Review Outcome PDFs
   * packaged into a ZIP archive for all filtered applicants.
   */
  async downloadAllZip(): Promise<void> {
    const list = this.filteredResponses();
    if (!list || list.length === 0) return;

    this.downloadType.set('zip');
    this.isDownloadingAll.set(true);

    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const currentSchemeTitle = list[0]?.schemeName || 'RSLDC Skill Development Scheme';
      const folderName = `RSLDC_Submissions_${this.schemeId() || 'EOI'}`;
      const folder = zip.folder(folderName) || zip;
      const today = formatDate(new Date());

      for (let i = 0; i < list.length; i++) {
        const app = list[i];
        const singlePdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        this.renderApplicantPdfPage(singlePdf, app, currentSchemeTitle, today, 1, 1);
        const arrayBuffer = singlePdf.output('arraybuffer');
        const docPrefix = app.status === 'APPROVED' ? 'IPA_Letter' : app.status === 'REJECTED' ? 'Review_Outcome' : 'Dossier';
        const cleanName = `${i + 1}_${docPrefix}_${(app.anonymousLabel || 'Applicant').replace(/[^a-zA-Z0-9]/g, '_')}_${app.id}.pdf`;
        folder.file(cleanName, arrayBuffer);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${folderName}.zip`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error generating ZIP:', err);
    } finally {
      this.isDownloadingAll.set(false);
    }
  }

  /**
   * Generates and downloads compiled official In-Principle Approval (IPA)
   * or Application Review Outcome PDFs in a single multi-page PDF.
   */
  downloadAllPdf(): void {
    const list = this.filteredResponses();
    if (!list || list.length === 0) return;

    this.downloadType.set('pdf');
    this.isDownloadingAll.set(true);

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const currentSchemeTitle = list[0]?.schemeName || 'RSLDC Skill Development Scheme';
      const today = formatDate(new Date());

      list.forEach((app, idx) => {
        if (idx > 0) {
          pdf.addPage();
        }
        this.renderApplicantPdfPage(pdf, app, currentSchemeTitle, today, idx + 1, list.length);
      });

      const fileName = `RSLDC_Submissions_${this.schemeId() || 'EOI'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      this.isDownloadingAll.set(false);
    }
  }
}
