import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/permissions/permission.service';
import { PageHeaderComponent, ButtonComponent, IconComponent } from '../../../shared';
import { SECTOR_COURSES_MAP, getCoursesForSector } from '../config/courses-catalog.data';
import { BatchHeroComponent } from './batch-detail/batch-hero.component';
import { BatchApprovalPanelComponent } from './batch-detail/batch-approval-panel.component';
import { BatchSummaryCardComponent } from './batch-detail/batch-summary-card.component';
import { BatchFacultyTableComponent } from './batch-detail/batch-faculty-table.component';
import { BatchHostelTableComponent } from './batch-detail/batch-hostel-table.component';
import { BatchEditFormComponent } from './batch-detail/batch-edit-form.component';
import {
  buildBatchEditModel,
  buildBatchUpdates,
  formatBatchStatus,
  getBatchFacultyList,
  getBatchHostelList,
  isBatchApproved,
  isBatchRejected
} from './batch-detail/batch-detail.util';

@Component({
  selector: 'app-batch-detail',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    IconComponent,
    BatchHeroComponent,
    BatchApprovalPanelComponent,
    BatchSummaryCardComponent,
    BatchFacultyTableComponent,
    BatchHostelTableComponent,
    BatchEditFormComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      @if (batch(); as b) {
        <div class="p-4 sm:p-6 lg:p-7 space-y-5 w-full">
          
          <!-- Top Page Header (Matching SDC Detail Top Bar) -->
          <app-page-header
            [title]="b.sdcName + ' (' + b.sdcCode + ')'"
            bgColor="var(--color-primary, #174A6E)"
            [showBack]="true"
            [backUrl]="backUrl()"
            [backTitle]="isAdmin() ? 'Back to Approvals' : 'Back to Batches'"
          >
            <div class="flex items-center gap-2">
              @if (!isEditing()) {
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  type="button"
                  (click)="startEditing(b)"
                  title="Edit Batch Creation Details"
                >
                  <app-icon name="edit" size="sm" />
                  <span>Edit Details</span>
                </button>
              }

              <button
                appButton
                variant="outline"
                size="sm"
                type="button"
                (click)="printSummary()"
                title="Print Batch Summary"
              >
                <app-icon name="print" size="sm" />
                <span>Print</span>
              </button>
            </div>
          </app-page-header>

          <!-- Success Alert Notification -->
          @if (successMessage()) {
            <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
              <div class="flex items-center gap-2">
                <app-icon name="check" [stroke]="2" class="text-emerald-600 shrink-0" />
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="successMessage.set('')"><app-icon name="close" size="xs" /></button>
            </div>
          }

          <app-batch-hero [batch]="b" [status]="formatStatus(b)" />

          @if (isAdmin() && !isEditing()) {
            <app-batch-approval-panel
              [batch]="b"
              [approved]="isApproved(b)"
              [(targetCapacity)]="adminTargetCapacity"
              [(remarks)]="adminRemarks"
              (approve)="approveBatch(b)"
              (reject)="rejectBatch(b)"
            />
          }

          @if (!isEditing()) {
            <app-batch-summary-card [batch]="b" />
            <app-batch-faculty-table [faculty]="getFacultyList(b)" />
            @if (getHostelList(b).length > 0) {
              <app-batch-hostel-table [hostels]="getHostelList(b)" />
            }
          }

          @if (isEditing()) {
            <app-batch-edit-form
              [editModel]="editModel"
              [sectorList]="sectorList"
              [availableCourses]="availableCourses"
              (sectorChange)="onSectorChange($event)"
              (courseChange)="onCourseChange($event)"
              (saved)="saveChanges()"
              (cancelled)="cancelEditing()"
            />
          }

        </div>
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
          <button
            appButton
            type="button"
            (click)="goBack()"
          >
            Back to Batches
          </button>
        </div>
      }

    </div>
  `
})
export class BatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private router = inject(Router);
  readonly batchService = inject(BatchService);
  readonly authService = inject(AuthService);
  private readonly permissions = inject(PermissionService);

  batchId = signal<string>('');
  successMessage = signal<string>('');
  isEditing = signal<boolean>(false);

  /** Scrutiny / Approval state for Dept Admin */
  adminTargetCapacity = 30;
  adminRemarks = 'Approved in accordance with RSLDC guidelines and verified infrastructure.';

  /** Edit Form Model */
  editModel: any = {};
  availableCourses: { courseName: string; defaultDurationHours: number }[] = [];

  readonly sectorList = Object.keys(SECTOR_COURSES_MAP).sort();

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
      const b = this.batchService.getBatchById(id);
      if (b) {
        this.adminTargetCapacity = b.approvedBatchStrength || b.maxStrength || 30;
      }
    });
  }

  isApproved(b: BatchRecord): boolean {
    return isBatchApproved(b);
  }

  isRejected(b: BatchRecord): boolean {
    return isBatchRejected(b);
  }

  formatStatus(b: BatchRecord): string {
    return formatBatchStatus(b);
  }

  getFacultyList(b: BatchRecord): any[] {
    return getBatchFacultyList(b);
  }

  getHostelList(b: BatchRecord): any[] {
    return getBatchHostelList(b);
  }

  startEditing(b: BatchRecord): void {
    const currentSector = b.sector || 'Aerospace and Aviation';
    this.availableCourses = getCoursesForSector(currentSector);
    this.editModel = buildBatchEditModel(b, currentSector, this.availableCourses);
    this.isEditing.set(true);
  }

  onSectorChange(sector: string): void {
    this.availableCourses = getCoursesForSector(sector);
    if (this.availableCourses.length > 0) {
      this.editModel.courseName = this.availableCourses[0].courseName;
      this.editModel.batchDurationHours = this.availableCourses[0].defaultDurationHours;
    }
  }

  onCourseChange(courseName: string): void {
    const found = this.availableCourses.find(c => c.courseName === courseName);
    if (found) {
      this.editModel.batchDurationHours = found.defaultDurationHours;
    }
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveChanges(): void {
    const id = this.editModel.id || this.batchId();
    if (!id) return;

    this.batchService.updateBatch(id, buildBatchUpdates(this.editModel));
    this.successMessage.set(`Batch "${this.editModel.batchCode}" details updated successfully.`);
    this.isEditing.set(false);
  }

  approveBatch(b: BatchRecord): void {
    const officer = this.authService.currentUser()?.label || 'Department Scrutiny Officer';
    this.batchService.approveBatch(b.id, this.adminRemarks, officer);
    this.batchService.updateBatch(b.id, {
      approvedBatchStrength: this.adminTargetCapacity,
      maxStrength: this.adminTargetCapacity
    });
    this.successMessage.set(`Batch "${b.batchCode}" has been approved successfully with capacity ${this.adminTargetCapacity} trainees.`);
  }

  rejectBatch(b: BatchRecord): void {
    this.batchService.rejectBatch(b.id, this.adminRemarks || 'Rejected during department scrutiny.');
    this.successMessage.set(`Batch "${b.batchCode}" has been rejected.`);
  }

  printSummary(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigateByUrl(this.backUrl());
  }
}