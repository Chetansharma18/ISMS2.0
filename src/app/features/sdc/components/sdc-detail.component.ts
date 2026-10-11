import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SdcService } from '../services/sdc.service';
import { SdcRecord, CenterPhotoItem } from '../models/sdc.model';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/permissions/permission.service';
import { PageHeaderComponent } from '../../../shared/components';
import { SdcHeroComponent } from './sdc-detail/sdc-hero.component';
import { SdcApprovalPanelComponent } from './sdc-detail/sdc-approval-panel.component';
import { SdcDetailsCardComponent } from './sdc-detail/sdc-details-card.component';
import { SdcEditFormComponent } from './sdc-detail/sdc-edit-form.component';
import { SdcPhotoPreviewModalComponent } from './sdc-detail/sdc-photo-preview-modal.component';
import { buildSdcEditModel, resolveDistrictLocation } from './sdc-detail/sdc-detail.util';

@Component({
  selector: 'app-sdc-detail',
  standalone: true,
  imports: [
    RouterModule,
    PageHeaderComponent,
    SdcHeroComponent,
    SdcApprovalPanelComponent,
    SdcDetailsCardComponent,
    SdcEditFormComponent,
    SdcPhotoPreviewModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      @if (sdc(); as center) {
        <div class="p-4 sm:p-6 lg:p-7 space-y-5 w-full">
          
          <!-- Top Page Header -->
          <app-page-header
            [title]="center.sdcName + ' (' + center.sdcCode + ')'"
            bgColor="var(--color-primary, #174A6E)"
            [showBack]="true"
            [backUrl]="backUrl()"
            backTitle="Back to SDC List"
          >
            <div class="flex items-center gap-2">
              @if (!isEditing()) {
                <button
                  type="button"
                  (click)="startEditing(center)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Edit SDC Creation Details"
                >
                  <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Details</span>
                </button>
              }
            </div>
          </app-page-header>

          <!-- Success Alert Banner -->
          @if (successMessage()) {
            <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">{{ successMessage() }}</span>
              </div>
              <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
            </div>
          }


          <app-sdc-hero [sdc]="center" />

          @if (isAdmin() && !isEditing()) {
            <app-sdc-approval-panel
              [sdc]="center"
              [(targetCapacity)]="adminTargetCapacity"
              [(remarks)]="adminRemarks"
              (approve)="approveSdc(center)"
              (reject)="rejectSdc(center)"
              (returnToTp)="returnToTp(center)"
            />
          }

          @if (!isEditing()) {
            <app-sdc-details-card [sdc]="center" (photoOpen)="openPhoto($event)" />
          }

          @if (isEditing()) {
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

        </div>
      } @else {
        <div class="p-12 text-center text-slate-500">
          <p>SDC Center not found.</p>
          <a [routerLink]="backUrl()" class="text-brand font-bold hover:underline mt-2 inline-block">
            Return to SDC Directory
          </a>
        </div>
      }

      <!-- Modal: High Resolution Photo Preview -->
      @if (selectedPhoto(); as p) {
        <app-sdc-photo-preview-modal [photo]="p" (closed)="closePhoto()" />
      }

    </div>
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
  selectedPhoto = signal<CenterPhotoItem | null>(null);

  /** Detect Admin vs TP mode */
  readonly isAdmin = computed(() => {
    return this.permissions.hasRole('dept_admin') || (this.router.url.startsWith('/sdc') && !this.router.url.startsWith('/sdcs'));
  });

  /** Dynamic back URL */
  readonly backUrl = computed(() => this.isAdmin() ? '/sdc' : '/sdcs');

  /** Admin decision form values */
  adminTargetCapacity = 100;
  adminRemarks = 'Approved in accordance with RSLDC guidelines and verified physical infrastructure.';

  assemblyConstituencies: string[] = [];
  parliamentConstituencies: string[] = [];
  blocks: string[] = [];

  editModel: any = {};

  readonly sdc = computed(() => {
    const id = this.centerId();
    return this.sdcService.getSdcById(id);
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.centerId.set(id);
        const center = this.sdcService.getSdcById(id);
        if (center) {
          this.adminTargetCapacity = center.sdcCapacity || 100;
        }
      }
    });
  }

  approveSdc(center: SdcRecord): void {
    this.sdcService.approveSdc(center.id, this.adminTargetCapacity || center.sdcCapacity, this.adminRemarks);
    this.successMessage.set(`SDC "${center.sdcName}" has been successfully approved for ${center.tpName}!`);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  rejectSdc(center: SdcRecord): void {
    if (!confirm(`Are you sure you want to reject SDC "${center.sdcName}"?`)) return;
    this.sdcService.rejectSdc(center.id, this.adminRemarks || 'Rejected by Department Authority');
    this.successMessage.set(`SDC "${center.sdcName}" has been rejected.`);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  returnToTp(center: SdcRecord): void {
    const reason = prompt('Please enter correction instructions for the Training Partner:', 'Please upload updated NOC and lab verification photos.');
    if (reason) {
      this.sdcService.returnToTp(center.id, reason);
      this.successMessage.set(`SDC returned to ${center.tpName} for corrections.`);
      setTimeout(() => this.successMessage.set(''), 5000);
    }
  }

  startEditing(center: SdcRecord): void {
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
    this.sdcService.updateSdc(id, this.editModel);
    this.isEditing.set(false);
    this.successMessage.set('SDC registration details updated successfully!');
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  openPhoto(photo: CenterPhotoItem): void {
    this.selectedPhoto.set(photo);
  }

  closePhoto(): void {
    this.selectedPhoto.set(null);
  }
}