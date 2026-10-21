import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SdcService } from '../services/sdc.service';
import { SdcInspectionData, SdcRecord } from '../models/sdc.model';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/permissions/permission.service';
import { ButtonComponent, IconComponent, PageShellComponent } from '../../../shared';
import { SdcEditFormComponent } from './sdc-detail/sdc-edit-form.component';
import { SdcViewComponent } from './sdc-detail/sdc-view.component';
import { SdcDecisionModalComponent, SdcDecisionMode, SdcDecisionSubmission } from './sdc-review/sdc-decision-modal.component';
import { SdcDecisionRecordComponent } from './sdc-review/sdc-decision-record.component';
import { SdcReviewSectionsComponent } from './sdc-review/sdc-review-sections.component';
import { SdcReviewToolbarComponent } from './sdc-review/sdc-review-toolbar.component';
import { SdcInspectionModalComponent } from './sdc-review/sdc-inspection-modal.component';
import { buildSdcEditModel, formatSdcStatus, resolveDistrictLocation } from './sdc-detail/sdc-detail.util';
import { departmentOfficer } from '../utils/department-officer.util';

/** Capacity used when an SDC has none asked for. */
const DEFAULT_CAPACITY = 100;

/**
 * SDC details. The training partner sees the registered SDC laid out like the Register New SDC form (read-only), and
 * can edit it when the department returned it. The department sees the review page, laid out like the applicant review
 * page: the details in numbered cards, and the four review actions (Revert, Remarks, Reject, Approve).
 */
@Component({
  selector: 'app-sdc-detail',
  standalone: true,
  imports: [
    RouterModule,
    ButtonComponent,
    IconComponent,
    PageShellComponent,
    SdcEditFormComponent,
    SdcViewComponent,
    SdcDecisionModalComponent,
    SdcDecisionRecordComponent,
    SdcReviewSectionsComponent,
    SdcReviewToolbarComponent,
    SdcInspectionModalComponent
  ],
  template: `
    <app-page-shell>
      @if (sdc(); as center) {
        @if (isAdmin()) {
          <!-- Department: review page -->
          <app-sdc-review-toolbar
            [sdc]="center"
            [backUrl]="backUrl()"
            (inspection)="successMessage.set(''); inspectionOpen.set(true)"
            (revert)="openModal('revert')"
            (remarks)="openModal('remark')"
            (reject)="openModal('reject')"
            (approve)="openModal('approve')"
          />

          @if (successMessage()) {
            <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
              <div class="flex items-center gap-2">
                <app-icon name="check" [stroke]="2" class="text-emerald-600 shrink-0" />
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="successMessage.set('')"><app-icon name="close" size="xs" /></button>
            </div>
          }

          <app-sdc-decision-record [sdc]="center" />

          <app-sdc-review-sections [sdc]="center" />

          @if (modal(); as mode) {
            <app-sdc-decision-modal
              [mode]="mode"
              [sdcLabel]="center.sdcName + ' (' + center.sdcCode + ')'"
              [requestedCapacity]="center.sdcCapacity || defaultCapacity"
              (confirmed)="confirm(mode, center, $event)"
              (close)="modal.set(null)"
            />
          }

          @if (inspectionOpen()) {
            <app-sdc-inspection-modal
              [sdc]="center"
              [sdcLabel]="center.sdcName + ' (' + center.sdcCode + ')'"
              (confirmed)="confirmInspection(center, $event)"
              (close)="inspectionOpen.set(false)"
            />
          }
        } @else {
          <!-- Training partner: the registered SDC, read-only, or the edit form when it was returned -->
          <div class="space-y-3">
            <div>
              <a appButton variant="outline" size="sm" [routerLink]="backUrl()" title="Back to SDC List">
                <app-icon name="back" />
                <span>Back</span>
              </a>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 flex-wrap min-w-0">
                <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">{{ center.sdcName }}</h1>
                <span class="tabular-nums text-xs font-semibold text-slate-500">{{ center.sdcCode }}</span>
                <span class="whitespace-nowrap font-medium text-xs" [class]="statusClass(center.status)">
                  {{ statusText(center.status) }}
                </span>
              </div>

              @if (!isEditing() && canEdit()) {
                <button appButton variant="outline" size="sm" type="button" (click)="startEditing(center)" title="Edit SDC Creation Details">
                  <app-icon name="edit" size="sm" />
                  <span>Edit Details</span>
                </button>
              }
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              Details of the Skill Development Centre as registered.
            </p>
          </div>

          @if (successMessage()) {
            <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
              <div class="flex items-center gap-2">
                <app-icon name="check" [stroke]="2" class="text-emerald-600 shrink-0" />
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="successMessage.set('')"><app-icon name="close" size="xs" /></button>
            </div>
          }

          @if (!isEditing()) {
            <app-sdc-view [sdc]="center" />
          } @else {
            <app-sdc-edit-form
              [editModel]="editModel"
              [assemblyConstituencies]="assemblyConstituencies"
              [parliamentConstituencies]="parliamentConstituencies"
              [blocks]="blocks"
              (districtChange)="onDistrictChange($event)"
              (saved)="saveEditing(center.id)"
              (cancelled)="cancelEditing()"
            />
          }
        }
      } @else {
        <div class="p-12 text-center text-slate-500">
          <p>SDC Center not found.</p>
          <a [routerLink]="backUrl()" class="text-brand font-bold hover:underline mt-2 inline-block">
            Return to SDC Directory
          </a>
        </div>
      }
    </app-page-shell>
  `
})
export class SdcDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly router = inject(Router);
  readonly sdcService = inject(SdcService);
  readonly authService = inject(AuthService);
  private readonly permissions = inject(PermissionService);

  centerId = signal<string>('');
  isEditing = signal<boolean>(false);
  successMessage = signal<string>('');
  /** The review action whose dialog is open, or null. */
  readonly modal = signal<SdcDecisionMode | null>(null);
  /** Whether the inspection form dialog is open. */
  readonly inspectionOpen = signal(false);
  protected readonly defaultCapacity = DEFAULT_CAPACITY;

  /** Detect Admin vs TP mode */
  readonly isAdmin = computed(() => {
    return this.permissions.hasRole('dept_admin') || (this.router.url.startsWith('/sdc') && !this.router.url.startsWith('/sdcs'));
  });

  /** Dynamic back URL */
  readonly backUrl = computed(() => this.isAdmin() ? '/sdc' : '/sdcs');

  assemblyConstituencies: string[] = [];
  parliamentConstituencies: string[] = [];
  blocks: string[] = [];

  editModel: any = {};

  readonly sdc = computed(() => {
    const id = this.centerId();
    return this.sdcService.getSdcById(id);
  });

  /** Only the training partner edits an SDC, and only after the department returned it for corrections. */
  readonly canEdit = computed(() => !this.isAdmin() && this.sdc()?.status === 'RETURNED_TO_TP');

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.centerId.set(id);
        const center = this.sdcService.getSdcById(id);
        // The Edit button of the SDC list opens this page already in edit mode.
        if (center && this.route.snapshot.queryParamMap.get('edit') && this.canEdit()) this.startEditing(center);
      }
    });
  }

  statusText(status?: string): string {
    return formatSdcStatus(status);
  }

  /** Same colours as the status in the SDC table. */
  statusClass(status?: string): string {
    if (status === 'APPROVED') return 'text-emerald-700';
    if (status === 'REJECTED' || status === 'PENDING_INSPECTION' || status === 'INSPECTION_COMPLETED') return 'text-red-600';
    return 'text-amber-700';
  }

  openModal(mode: SdcDecisionMode): void {
    this.successMessage.set('');
    this.modal.set(mode);
  }

  /** The officer confirmed one of the four review actions. */
  confirm(mode: SdcDecisionMode, center: SdcRecord, submission: SdcDecisionSubmission): void {
    // Remarks carry a neutral officer name and the designation; no person's name is shown anywhere else.
    const officer = departmentOfficer(this.authService.currentUser()?.ssoId);

    switch (mode) {
      case 'approve': {
        const capacity = submission.capacity || center.sdcCapacity || DEFAULT_CAPACITY;
        this.sdcService.approveSdc(
          center.id,
          capacity,
          submission.remark || 'Approved in accordance with RSLDC guidelines and verified physical infrastructure.',
          officer
        );
        this.show(`SDC "${center.sdcName}" has been approved for ${center.tpName} with a capacity of ${capacity} trainees.`);
        break;
      }
      case 'reject':
        this.sdcService.rejectSdc(center.id, submission.remark, officer);
        this.show(`SDC "${center.sdcName}" has been rejected.`);
        break;
      case 'revert':
        this.sdcService.returnToTp(center.id, submission.remark, officer);
        this.show(`SDC returned to ${center.tpName} for corrections.`);
        break;
      case 'remark':
        this.sdcService.addRemark(center.id, submission.remark, officer);
        this.show('Your remark has been recorded.');
        break;
    }
    this.modal.set(null);
  }

  /** The officer submitted the inspection form: the SDC moves to approval and the report is logged as a remark. */
  confirmInspection(center: SdcRecord, data: Partial<SdcInspectionData>): void {
    this.sdcService.submitInspection(center.id, data);
    const result = this.sdcService.getSdcById(center.id)?.inspection;
    const recommendation = (data.recommendation ?? '').replace(/_/g, ' ').toLowerCase();
    const remark = (data.auditorRemarks ?? '').trim();
    this.sdcService.addRemark(
      center.id,
      `Inspection report submitted. Recommendation: ${recommendation || 'none'}.${remark ? ' ' + remark : ''}`,
      departmentOfficer(this.authService.currentUser()?.ssoId)
    );
    this.inspectionOpen.set(false);
    const far = result && result.geoMatched === false;
    this.show(
      far
        ? 'Inspection submitted. The auditor location is more than 100 m from the SDC location. The SDC is now pending approval.'
        : 'Inspection submitted. The SDC is now pending approval.'
    );
  }

  private show(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  startEditing(center: SdcRecord): void {
    if (!this.canEdit()) return;
    this.editModel = buildSdcEditModel(center);
    this.updateLocationDropdowns(this.editModel.district);
    this.isEditing.set(true);
  }

  onDistrictChange(newDistrict: string): void {
    this.editModel.district = newDistrict;
    this.updateLocationDropdowns(newDistrict);
  }

  updateLocationDropdowns(district: string): void {
    const selection = resolveDistrictLocation(district, this.editModel);
    if (selection) {
      this.editModel.division = selection.division;
      this.assemblyConstituencies = selection.assemblyConstituencies;
      this.parliamentConstituencies = selection.parliamentConstituencies;
      this.blocks = selection.blocks;
      this.editModel.assemblyConstituency = selection.assemblyConstituency;
      this.editModel.parliamentConstituency = selection.parliamentConstituency;
      this.editModel.block = selection.block;
    }
  }

  saveEditing(id: string): void {
    if (!this.canEdit()) {
      this.isEditing.set(false);
      return;
    }
    // Saving the corrections sends the SDC back to the department: to approval if it was already inspected, else to inspection.
    const center = this.sdcService.getSdcById(id);
    this.sdcService.updateSdc(id, {
      ...this.editModel,
      status: center?.inspection ? 'PENDING_APPROVAL' : 'PENDING_INSPECTION',
      submittedAt: new Date().toISOString()
    });
    this.isEditing.set(false);
    this.successMessage.set('Corrections saved and the SDC was sent back to the department.');
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }
}
