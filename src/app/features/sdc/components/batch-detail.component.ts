import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import { PermissionService } from '../../../core/permissions/permission.service';
import { ButtonComponent, IconComponent, PageShellComponent } from '../../../shared';
import { BatchReviewToolbarComponent } from './batch-detail/batch-review-toolbar.component';
import { BatchDecisionRecordComponent } from './batch-detail/batch-decision-record.component';
import { BatchDecisionModalComponent, BatchDecisionMode, BatchDecisionSubmission } from './batch-detail/batch-decision-modal.component';
import { BatchReviewSectionsComponent } from './batch-detail/batch-review-sections.component';
import {
  batchDisplayStatus,
  batchStatusLabel,
  canEditBatch,
  currentApprover,
  isBatchReturned
} from '../utils/batch-approval.util';
import { BatchViewComponent } from './batch-detail/batch-view.component';

/** Capacity used when a batch has none asked for. */
const DEFAULT_CAPACITY = 30;

/**
 * Batch details: the registered batch laid out like the Create Batch form (same card, sections and fields,
 * read-only), in the same theme as the SDC details. The department sees the review page with the four review
 * actions (Revert, Remarks, Reject, Approve); the training partner can use "Edit Details" while the batch is
 * returned, which opens the same form as Create Batch, filled with this batch.
 */
@Component({
  selector: 'app-batch-detail',
  standalone: true,
  imports: [
    RouterModule,
    ButtonComponent,
    IconComponent,
    PageShellComponent,
    BatchReviewToolbarComponent,
    BatchDecisionRecordComponent,
    BatchDecisionModalComponent,
    BatchReviewSectionsComponent,
    BatchViewComponent
  ],
  template: `
    <app-page-shell>
      @if (batch(); as b) {
        @if (isAdmin()) {
          <!-- Department: review page with the four review actions -->
          <app-batch-review-toolbar
            [batch]="b"
            [backUrl]="backUrl()"
            (revert)="openModal('revert')"
            (remarks)="openModal('remark')"
            (reject)="openModal('reject')"
            (approve)="openModal('approve')"
          />
        } @else {
          <!-- Training partner: back button, title row and subtitle (same as the SDC details and the registration form) -->
          <div class="space-y-3">
            <div>
              <a appButton variant="outline" size="sm" [routerLink]="backUrl()" title="Back to Batches">
                <app-icon name="back" />
                <span>Back</span>
              </a>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 flex-wrap min-w-0">
                <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0 tabular-nums">{{ b.batchCode }}</h1>
                <span class="text-xs font-semibold text-slate-500">{{ b.courseName }}</span>
                <span class="whitespace-nowrap font-medium text-xs" [class]="statusClass(b)">{{ statusText(b) }}</span>
              </div>

              <div class="flex items-center gap-2">
                @if (canEdit(b)) {
                  <a appButton variant="outline" size="sm" [routerLink]="['/batches', b.id, 'edit']" title="Details can be edited while the batch is returned to the training partner">
                    <app-icon name="edit" size="sm" />
                    <span>Edit Details</span>
                  </a>
                }
              </div>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              Details of the batch as registered at {{ b.sdcName }} ({{ b.sdcCode }}).
            </p>
          </div>
        }

        @if (successMessage()) {
          <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <app-icon name="check" [stroke]="2" class="text-emerald-600 shrink-0" />
              <span class="font-medium">{{ successMessage() }}</span>
            </div>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="successMessage.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        @if (errorMessage()) {
          <div class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
            <span class="font-medium">{{ errorMessage() }}</span>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="errorMessage.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        @if (!isAdmin() && isReturned(b)) {
          <div class="rounded-xl border border-amber-300 bg-amber-50/80 p-4 sm:p-5 text-xs text-amber-900">
            <h4 class="font-bold text-sm m-0">Returned by the department for corrections</h4>
            <p class="mt-0.5 mb-0">{{ b.returnRemarks || 'No remarks were recorded.' }}</p>
            <p class="mt-1 mb-0 text-amber-800">Edit the batch to make the corrections. Saving sends it for approval again.</p>
          </div>
        }

        @if (isAdmin()) {
          <app-batch-decision-record [batch]="b" />
          <app-batch-review-sections [batch]="b" />
        } @else {
          <app-batch-view [batch]="b" />
        }

        @if (modal(); as mode) {
          <app-batch-decision-modal
            [mode]="mode"
            [batchLabel]="b.batchCode + ' • ' + b.courseName"
            [requestedCapacity]="b.approvedBatchStrength || b.maxStrength || defaultCapacity"
            (confirmed)="confirm(mode, b, $event)"
            (close)="modal.set(null)"
          />
        }
      } @else {
        <!-- Batch Not Found State -->
        <div class="p-8 max-w-xl mx-auto text-center space-y-4 py-16">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h2 class="text-base font-bold text-slate-800">Batch Record Not Found</h2>
          <p class="text-xs text-slate-500">
            The requested batch could not be found or may have been archived.
          </p>
          <button appButton type="button" (click)="goBack()">
            Back to Batches
          </button>
        </div>
      }
    </app-page-shell>
  `
})
export class BatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private router = inject(Router);
  readonly batchService = inject(BatchService);
  private readonly permissions = inject(PermissionService);

  batchId = signal<string>('');
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  /** The review action whose dialog is open, or null. */
  readonly modal = signal<BatchDecisionMode | null>(null);
  protected readonly defaultCapacity = DEFAULT_CAPACITY;

  readonly batch = computed(() => {
    const id = this.batchId();
    if (!id) return undefined;
    return this.batchService.getBatchById(id);
  });

  readonly isAdmin = computed(() => {
    return this.permissions.hasRole('dept_admin') || this.router.url.includes('admin');
  });

  readonly backUrl = computed(() => {
    return this.isAdmin() ? '/admin/batch-approvals' : '/batches';
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id') || params.get('batchId') || '';
      this.batchId.set(id);
    });
  }

  isReturned(b: BatchRecord): boolean {
    return isBatchReturned(b);
  }

  /** Only the training partner edits, and only while the batch is returned. */
  canEdit(b: BatchRecord): boolean {
    return !this.isAdmin() && canEditBatch(b);
  }

  /** Status in words: "Pending approval", "Approved", "Rejected", "Returned to TP". */
  statusText(b: BatchRecord): string {
    return batchStatusLabel(b);
  }

  /** Same colours as the status in the batch table. */
  statusClass(b: BatchRecord): string {
    switch (batchDisplayStatus(b)) {
      case 'APPROVED':
        return 'text-emerald-700';
      case 'WITHDRAWN':
        return 'text-slate-500';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-amber-700';
    }
  }

  openModal(mode: BatchDecisionMode): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.modal.set(mode);
  }

  /** The officer confirmed one of the four review actions. */
  confirm(mode: BatchDecisionMode, b: BatchRecord, submission: BatchDecisionSubmission): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    // The history says "Department"; no officer's name or designation is shown for a batch.
    const officer = currentApprover(b);
    const remark = submission.remark;

    switch (mode) {
      case 'remark':
        if (!this.batchService.addRemark(b.id, remark, officer)) {
          this.errorMessage.set('The remark could not be saved.');
        } else {
          this.successMessage.set('Your remark has been recorded.');
        }
        break;

      case 'revert':
        if (!this.batchService.returnToTp(b.id, remark, officer)) {
          this.errorMessage.set('This batch is not waiting for a decision.');
        } else {
          this.successMessage.set(`Batch "${b.batchCode}" has been returned to ${b.tpName} for corrections.`);
        }
        break;

      case 'reject':
        if (!this.batchService.rejectBatch(b.id, remark, officer)) {
          this.errorMessage.set('This batch is not waiting for a decision.');
        } else {
          this.successMessage.set(`Batch "${b.batchCode}" has been rejected.`);
        }
        break;

      case 'approve': {
        if (!this.batchService.approveBatch(b.id, remark, officer)) {
          this.errorMessage.set('This batch is not waiting for a decision.');
        } else {
          const capacity = submission.capacity ?? (b.approvedBatchStrength || b.maxStrength || DEFAULT_CAPACITY);
          this.batchService.updateBatch(b.id, { approvedBatchStrength: capacity, maxStrength: capacity });
          this.successMessage.set(`Batch "${b.batchCode}" has been approved with a capacity of ${capacity} trainees.`);
        }
        break;
      }
    }
    this.modal.set(null);
  }

  goBack(): void {
    this.router.navigateByUrl(this.backUrl());
  }
}
