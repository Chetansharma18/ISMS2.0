import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, switchMap, catchError, of, tap } from 'rxjs';
import { GenerateEmpanelmentOrderModalComponent } from '../../components/generate-empanelment-order-modal/generate-empanelment-order-modal.component';
import { HttpService } from '../../../../core/http/http.service';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { ApiError } from '../../../../core/http/api-error';
import { ButtonComponent, FilterTabsComponent, IconComponent, ListPageComponent, TableColumn } from '../../../../shared';
import {
  EMPTY_COUNTS,
  ReviewApplicationList,
  SubmissionRow,
  SubmissionTab,
  evaluationFileName,
  statusTabs,
  toSubmissionRow
} from './applicant-submissions.util';

const QUIET = { skipErrorToast: true };

/**
 * Applicant Submissions of one EOI (GET /api/eoi/responses/notices/{eoiId}/applications). Only the EOI's
 * committee members and approver can open it, after the date of closing; the backend checks both.
 */
@Component({
  selector: 'app-applicant-submissions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ListPageComponent,
    ButtonComponent,
    FilterTabsComponent,
    IconComponent,
    GenerateEmpanelmentOrderModalComponent
  ],
  template: `
    <app-list-page
      title="Applicant Submissions"
      [breadcrumbs]="[
        { label: 'Home', url: '/' },
        { label: 'EOI Responses', url: '/admin/eoi-view' },
        { label: 'Applicant Submissions' }
      ]"
      searchPlaceholder="Search Applicant, Application No., Org..."
      [(searchQuery)]="searchQuery"
      [columns]="submissionColumns"
      [data]="rows()"
      [pagination]="true"
      [pageSize]="20"
      [emptyMessage]="loading() ? 'Loading submissions...' : 'No submissions found.'"
      [customTemplates]="{ anonymousLabel: applicantTemplate, status: statusTemplate, action: actionTemplate }"
    >
      <!-- Action Toolbar: Back, Excel Download, Generate Order, Total Count -->
      <div beforeTable class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button appButton variant="outline" size="sm" class="shrink-0" (click)="goBack()" title="Back to EOI Responses">
              <app-icon name="chevron-left" size="sm" />
              <span>Back</span>
            </button>

            <button
              appButton
              variant="outline"
              size="sm"
              class="shrink-0"
              (click)="downloadEvaluationExcel()"
              [disabled]="isDownloadingExcel() || !eoiId() || counts().all === 0"
              title="Download the evaluation Excel with Status and Grade dropdowns"
            >
              <app-icon name="download" size="sm" />
              <span>{{ isDownloadingExcel() ? 'Generating Excel...' : 'Download Evaluation Excel' }}</span>
            </button>

            <button
              appButton
              size="sm"
              class="shrink-0"
              [disabled]="counts().all === 0"
              (click)="showGenerateOrderModal.set(true)"
              title="Upload evaluated Excel to generate Empanelment and Rejection Orders"
            >
              <app-icon name="clipboard-check" size="sm" />
              <span>Generate Empanelment Order</span>
            </button>
          </div>

          <div class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span class="text-slate-500 font-normal">Total Submissions:</span>
            <span class="font-bold text-slate-800 tabular-nums">{{ counts().all }}</span>
          </div>
        </div>

        @if (eoiTitle()) {
          <p class="m-0 text-xs text-slate-600">
            <span class="font-semibold text-slate-800">{{ eoiTitle() }}</span>
            <span class="tabular-nums text-slate-500"> &middot; {{ eoiRefNo() }}</span>
            @if (myRoles()) { <span class="text-slate-500"> &middot; You: {{ myRoles() }}</span> }
          </p>
        }

        <app-filter-tabs [options]="tabs()" [value]="status()" (valueChange)="setStatus($event)" ariaLabel="Filter by status" />

        @if (loadError()) {
          <p class="m-0 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700" role="alert">{{ loadError() }}</p>
        }
      </div>

      <ng-template #applicantTemplate let-item>
        <div class="font-normal text-slate-800 text-[13px]">{{ item.applicantName }}</div>
        <div class="text-[11px] tabular-nums text-text-muted mt-0.5">{{ item.applicationNo }}</div>
      </ng-template>

      <ng-template #statusTemplate let-item>
        <span
          class="inline-block px-2.5 py-1 rounded-md text-xs font-medium border"
          [class.text-emerald-800]="item.statusTone === 'approved'" [class.bg-emerald-50]="item.statusTone === 'approved'" [class.border-emerald-200]="item.statusTone === 'approved'"
          [class.text-rose-800]="item.statusTone === 'rejected'" [class.bg-rose-50]="item.statusTone === 'rejected'" [class.border-rose-200]="item.statusTone === 'rejected'"
          [class.text-sky-800]="item.statusTone === 'reverted'" [class.bg-sky-50]="item.statusTone === 'reverted'" [class.border-sky-200]="item.statusTone === 'reverted'"
          [class.text-amber-800]="item.statusTone === 'pending'" [class.bg-amber-50]="item.statusTone === 'pending'" [class.border-amber-200]="item.statusTone === 'pending'"
        >
          {{ item.statusLabel }}@if (item.grade) { &middot; {{ item.grade }} }
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

    @if (showGenerateOrderModal() && eoiId(); as id) {
      <app-generate-empanelment-order-modal
        [eoiId]="id"
        [schemeName]="eoiTitle()"
        [eoiRefNo]="eoiRefNo()"
        [isApprover]="isApprover()"
        (decisionsChanged)="reload$.next()"
        (close)="closeOrderModal()"
      />
    }
  `
})
export class ApplicantSubmissionsComponent {
  private readonly http = inject(HttpService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly eoiId = signal<number | null>(null);
  readonly eoiIdText = computed(() => String(this.eoiId() ?? ''));
  readonly searchQuery = signal<string>('');
  readonly status = signal<SubmissionTab>('all');

  readonly list = signal<ReviewApplicationList | null>(null);
  readonly loading = signal<boolean>(false);
  readonly loadError = signal<string>('');
  readonly isDownloadingExcel = signal<boolean>(false);

  readonly rows = computed<SubmissionRow[]>(() => (this.list()?.applications.items ?? []).map(toSubmissionRow));
  readonly counts = computed(() => this.list()?.counts ?? EMPTY_COUNTS);
  readonly tabs = computed(() => statusTabs(this.counts()));
  readonly eoiTitle = computed(() => this.list()?.notice.schemeName ?? '');
  readonly eoiRefNo = computed(() => this.list()?.notice.refNo ?? '');
  readonly myRoles = computed(() => (this.list()?.notice.myRoles ?? []).join(', '));

  showGenerateOrderModal = signal<boolean>(false);
  /** The approver generates and signs the orders; members can check and apply the Excel and view the orders. */
  readonly isApprover = computed(() => (this.list()?.notice.myRoles ?? []).includes('Approver'));

  readonly submissionColumns: TableColumn<SubmissionRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'anonymousLabel', label: 'Applicant / Application No.', width: 'min-w-[260px]', type: 'custom' },
    { key: 'submissionDate', label: 'Submitted Date', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-32', type: 'custom' }
  ];

  protected readonly reload$ = new Subject<void>();

  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params['schemeId']);
      this.eoiId.set(Number.isInteger(id) && id > 0 ? id : null);
      if (this.eoiId() === null) this.loadError.set('Open the submissions from EOI Responses.');
      else this.reload$.next();
    });

    // Search is sent to the backend (it also matches "Applicant 07", PAN and OTR no.).
    effect(() => {
      this.searchQuery();
      this.status();
      if (this.eoiId() !== null) this.reload$.next();
    });

    this.reload$
      .pipe(
        debounceTime(250),
        tap(() => {
          this.loading.set(true);
          this.loadError.set('');
        }),
        switchMap(() =>
          this.http
            .call<ReviewApplicationList>(API_ENDPOINTS.EOI_RESPONSES.APPLICATIONS, {
              id: this.eoiId() as number,
              params: { status: this.status() === 'all' ? null : this.status(), search: this.searchQuery().trim() || null, page: 1, pageSize: 100 },
              flags: QUIET
            })
            .pipe(
              catchError((error: unknown) => {
                this.loadError.set(error instanceof ApiError ? error.message : 'The submissions could not be loaded. Please try again.');
                return of(null);
              })
            )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        this.loading.set(false);
        if (res) this.list.set(res);
        else if (!this.list()) this.list.set(null);
      });
  }

  setStatus(tab: SubmissionTab): void {
    this.status.set(tab);
  }

  goBack(): void {
    void this.router.navigate(['/admin/eoi-view']);
  }

  /** The backend's evaluation sheet: every submission, pre-filled decisions, Status and Grade dropdowns. */
  downloadEvaluationExcel(): void {
    const id = this.eoiId();
    if (id === null || this.isDownloadingExcel()) return;
    this.isDownloadingExcel.set(true);
    this.http
      .blob(API_ENDPOINTS.EOI_RESPONSES.DECISIONS_TEMPLATE, { id, flags: QUIET })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.isDownloadingExcel.set(false);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = evaluationFileName(this.eoiRefNo());
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (error: unknown) => {
          this.isDownloadingExcel.set(false);
          this.loadError.set(error instanceof ApiError ? error.message : 'The evaluation Excel could not be downloaded.');
        }
      });
  }

  closeOrderModal(): void {
    this.showGenerateOrderModal.set(false);
    this.reload$.next();
  }
}
