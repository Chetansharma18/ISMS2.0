import { Component, DestroyRef, inject, signal, computed, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormSdcComponent, FormFieldConfig } from '../../../shared/components/form-sdc';
import { StepperComponent, StepperStep } from '../../../shared/components/stepper/stepper.component';
import { AspirantAadhaarUploadComponent } from './aspirant-mapping/aspirant-aadhaar-upload.component';
import { AspirantErrorBannerComponent } from './aspirant-mapping/aspirant-error-banner.component';
import { AspirantMappingHeaderComponent } from './aspirant-mapping/aspirant-mapping-header.component';
import { AspirantStepNavBarComponent } from './aspirant-mapping/aspirant-step-nav-bar.component';
import { AspirantPhotoDocumentsStepComponent } from './aspirant-mapping/aspirant-photo-documents-step.component';
import { AspirantSuccessModalComponent } from './aspirant-mapping/aspirant-success-modal.component';
import { formatFileSizeMb, readFileAsDataUrl } from './aspirant-mapping/aspirant-file.util';
import { AspirantDocumentViewerState } from './aspirant-mapping/aspirant-document-viewer.state';
import { createEmptyAspirantFormData } from './aspirant-mapping/aspirant-form-data.factory';
import { validateForSubmit, validateStepBeforeAdvance } from './aspirant-mapping/aspirant-mapping.validation';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { AspirantService } from '../services/aspirant.service';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import {
  AspirantFormData,
  AspirantDocumentItem,
  getStep1PersonalFields,
  getStep2PermanentAddressFields,
  getStep2CommAddressFields,
  getStep2ContactFields,
  getStep3EconomicWorkerFields,
  calculateAgeFromDob,
  getDefaultAspirantDocuments
} from '../config/aspirant-form.config';

@Component({
  selector: 'app-aspirant-mapping',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FormSdcComponent,
    StepperComponent,
    AspirantAadhaarUploadComponent,
    AspirantErrorBannerComponent,
    AspirantMappingHeaderComponent,
    AspirantPhotoDocumentsStepComponent,
    AspirantStepNavBarComponent,
    AspirantSuccessModalComponent
  ],
  template: `
    <div class="min-h-full bg-white py-4 sm:py-6 px-4 sm:px-8 font-sans selection:bg-primary selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Direct-on-Page Container (matching SDC & Batch forms) -->
      <div class="w-full space-y-4">
        
        <!-- Aadhaar Card Upload Control Template for Identity Details in Step 1 -->
        <ng-template #aadhaarUploadTemplate>
          <app-aspirant-aadhaar-upload
            [fileName]="formData.aadhaarDocName ?? ''"
            [fileSize]="formData.aadhaarDocSize ?? ''"
            (viewDocument)="viewer.viewAadhaar()"
            (fileSelected)="onAadhaarUploaded($event)"
          ></app-aspirant-aadhaar-upload>
        </ng-template>

        <!-- Header: Back Button + Title + Batch Context -->
        <app-aspirant-mapping-header [batch]="batch()" (back)="goBack()"></app-aspirant-mapping-header>

        <!-- Wizard progress (shared StepperComponent) -->
        <app-stepper variant="tabs" [steps]="wizardSteps" [currentStep]="currentStep()" (stepClick)="goToStep($event)"></app-stepper>

        <!-- Notification Banner -->
        @if (errorMessage()) {
          <app-aspirant-error-banner [message]="errorMessage()" (dismiss)="errorMessage.set('')"></app-aspirant-error-banner>
        }

        <!-- ========================================================================= -->
        <!-- STEP 1: MAIN / IDENTITY DETAILS                                -->
        <!-- ========================================================================= -->
        @if (currentStep() === 1) {
          <div class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Main Personal & Demographic Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step1Fields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Bottom Navigation Bar for Step 1 -->
            <app-aspirant-step-nav-bar
              label="Proceed to Address Details"
              (proceed)="proceedToStep(2)"
            ></app-aspirant-step-nav-bar>

          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 2: ADDRESS & CONTACT DETAILS                                         -->
        <!-- ========================================================================= -->
        @if (currentStep() === 2) {
          <div class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Permanent Address Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step2PermanentFields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Communication Address Header with Small Checkbox on Top Right -->
            <div class="pt-3 pb-1 border-b border-slate-200 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-4 bg-primary rounded-full"></span>
                <h4 class="text-xs font-bold text-slate-900 tracking-wider uppercase m-0">
                  COMMUNICATION ADDRESS
                </h4>
              </div>
              <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="sameAddressCheck"
                  [(ngModel)]="formData.isAddressSame"
                  (change)="toggleSameAddress()"
                  class="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Same as Permanent Address</span>
              </label>
            </div>

            <!-- Communication Address Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step2CommFields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Contact Details Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step2ContactFields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Bottom Navigation Bar for Step 2 -->
            <app-aspirant-step-nav-bar
              label="Proceed to Bank Details"
              (proceed)="proceedToStep(3)"
            ></app-aspirant-step-nav-bar>

          </div>
        }

        <!-- ========================================================================= -->
        <!-- STEP 3: BANK, ECONOMIC & WORKER DETAILS                                    -->
        <!-- ========================================================================= -->
        @if (currentStep() === 3) {
          <div class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Bank & Worker Fields via FormSdcComponent -->
            <app-form-sdc
              [fields]="step3Fields"
              [(model)]="formData"
              density="compact"
              layout="plain"
              [card]="false"
              [gridCols]="4"
              [showSubmit]="false"
              [showCancel]="false"
            ></app-form-sdc>

            <!-- Bottom Navigation Bar for Step 3 -->
            <app-aspirant-step-nav-bar
              label="Proceed to Photo &amp; Documents"
              (proceed)="proceedToStep(4)"
            ></app-aspirant-step-nav-bar>

          </div>
        }

        <!-- ========================================================================= -->
        <!-- ========================================================================= -->
        <!-- STEP 4: PHOTO & DOCUMENT ATTACHMENTS                                      -->
        <!-- ========================================================================= -->
        @if (currentStep() === 4) {
          <app-aspirant-photo-documents-step
            [formData]="formData"
            (viewPhoto)="viewer.viewPhoto()"
            (photoSelected)="onPhotoUploaded($event)"
            (viewDocument)="viewer.viewDocument($event)"
            (documentSelected)="onAspirantDocSelected($event.doc, $event.event)"
          >
            <!-- Batch Mapping Confirmation Bar -->
            <div class="p-4 bg-linear-to-r from-navy to-primary text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div class="space-y-1 text-center sm:text-left">
                <span class="text-[11px] text-blue-300 font-bold uppercase tracking-wider block">
                  Mapping Target Batch: {{ batch().batchCode }}
                </span>
                <span class="text-sm font-semibold text-slate-100 block">
                  Candidate: {{ formData.aspirantName || 'New Aspirant' }} (Aadhaar: {{ formData.aadhaarNo || 'XXXX-XXXX-XXXX' }})
                </span>
                <span class="text-[11px] text-slate-400 block">
                  SDC: {{ batch().sdcName }} • Course: {{ batch().courseName }}
                </span>
              </div>

              <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  (click)="submitAndMapAspirant()"
                  [disabled]="isSubmitting()"
                  class="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Mapping to Batch...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Register Aspirant</span>
                  }
                </button>
              </div>
            </div>
          </app-aspirant-photo-documents-step>
        }

      </div>

      <!-- SUCCESS MODAL AFTER MAPPING ASPIRANT -->
      @if (showSuccessModal()) {
        <app-aspirant-success-modal
          [batchCode]="batch().batchCode"
          [aspirantId]="createdAspirantId()"
          [aspirantName]="formData.aspirantName"
          [aadhaarNo]="formData.aadhaarNo"
          (mapAnother)="mapAnotherAspirant()"
          (batchList)="goToBatchList()"
          (aspirantsList)="goToAspirantsList()"
        ></app-aspirant-success-modal>
      }

    </div>
  `
})
export class AspirantMappingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private router = inject(Router);
  readonly batchService = inject(BatchService);
  readonly sdcService = inject(SdcService);
  readonly aspirantService = inject(AspirantService);
  private readonly docViewer = inject(DocumentViewerService);

  currentStep = signal<number>(1);
  readonly wizardSteps: StepperStep[] = [
    { label: 'Personal & Identity' },
    { label: 'Address & Contact' },
    { label: 'Bank' },
    { label: 'Photo & Documents' }
  ];
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  showSuccessModal = signal<boolean>(false);
  createdAspirantId = signal<string>('ASP-RJ-2026-98412');

  @ViewChild('aadhaarUploadTemplate', { static: true }) aadhaarUploadTemplate!: TemplateRef<any>;

  readonly viewer = new AspirantDocumentViewerState(() => this.formData, this.docViewer);

  batchId = signal<string>('');
  batch = computed(() => {
    return this.batchService.getBatchById(this.batchId()) || this.batchService.batches()[0];
  });

  step1Fields: FormFieldConfig[] = [];
  step2PermanentFields: FormFieldConfig[] = [];
  step2CommFields: FormFieldConfig[] = [];
  step2ContactFields: FormFieldConfig[] = [];
  step3Fields: FormFieldConfig[] = [];

  formData: AspirantFormData = createEmptyAspirantFormData();

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['batchId']) {
        this.batchId.set(params['batchId']);
      }
    });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(q => {
      if (q['batchId']) {
        this.batchId.set(q['batchId']);
      }
    });

    // Fallback batchId if none in url
    if (!this.batchId() && this.batchService.batches().length > 0) {
      this.batchId.set(this.batchService.batches()[0].id);
    }

    // Set initial preferred sector from batch
    const currentBatch = this.batch();
    if (currentBatch && currentBatch.sector) {
      if (!this.formData.preferredSectors.includes(currentBatch.sector)) {
        this.formData.preferredSectors.unshift(currentBatch.sector);
      }
    }

    // Initialize Form Fields for Steps 1, 2, and 3
    this.step1Fields = getStep1PersonalFields((dob, model) => {
      model.age = calculateAgeFromDob(dob);
    }, this.aadhaarUploadTemplate);
    this.step2PermanentFields = getStep2PermanentAddressFields();
    this.step2CommFields = getStep2CommAddressFields();
    this.step2ContactFields = getStep2ContactFields();
    this.step3Fields = getStep3EconomicWorkerFields();
  }

  goBack(): void {
    this.router.navigate(['/batches']);
  }

  goToStep(step: number): void {
    if (step < 1 || step > 4) return;
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  proceedToStep(step: number): void {
    this.errorMessage.set('');
    const stepError = validateStepBeforeAdvance(this.currentStep(), this.formData);
    if (stepError) {
      this.errorMessage.set(stepError);
      return;
    }

    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAadhaarUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formData.aadhaarDocName = file.name;
      this.formData.aadhaarDocSize = formatFileSizeMb(file.size);

      readFileAsDataUrl(file, (url) => {
        this.formData.aadhaarDocUrl = url;
      });
    }
  }

  toggleSameAddress(): void {
    if (this.formData.isAddressSame) {
      this.copyPermanentToComm();
    }
  }

  copyPermanentToComm(): void {
    this.formData.isAddressSame = true;
    this.formData.commHouseNo = this.formData.permHouseNo;
    this.formData.commStreet = this.formData.permStreet;
    this.formData.commWard = this.formData.permWard;
    this.formData.commCity = this.formData.permCity;
    this.formData.commDistrict = this.formData.permDistrict;
    this.formData.commBlock = this.formData.permBlock;
    this.formData.commTehsil = this.formData.permTehsil;
    this.formData.commMunicipality = this.formData.permMunicipality;
    this.formData.commPincode = this.formData.permPincode;
  }

  onPhotoUploaded(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formData.candidatePhotoName = file.name;
      readFileAsDataUrl(file, (url) => {
        this.formData.candidatePhotoUrl = url;
      });
    }
  }

  onAspirantDocSelected(doc: AspirantDocumentItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      doc.fileName = file.name;
      doc.fileSize = formatFileSizeMb(file.size);
      doc.status = 'UPLOADED';
      doc.uploadedAt = 'Just now';

      readFileAsDataUrl(file, (url) => {
        doc.fileUrl = url;
      });
    }
  }

  submitAndMapAspirant(): void {
    this.errorMessage.set('');
    const submitError = validateForSubmit(this.formData);
    if (submitError) {
      this.errorMessage.set(submitError.message);
      this.currentStep.set(submitError.step);
      return;
    }

    const currentBatch = this.batch();
    if (!currentBatch) {
      this.errorMessage.set('Target batch not found.');
      return;
    }

    if (currentBatch.mappedAspirantsCount >= currentBatch.maxStrength) {
      this.errorMessage.set('This batch has reached maximum approved candidate capacity.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);

      // Mask Aadhaar e.g. XXXX-XXXX-1234
      const aadhaarLast4 = this.formData.aadhaarNo.slice(-4) || '9812';
      const masked = `XXXX-XXXX-${aadhaarLast4}`;

      // Map to batch service
      this.batchService.mapCandidateToBatch(currentBatch.id, {
        name: this.formData.aspirantName,
        aadhaarMasked: masked,
        mobile: this.formData.mobileNo
      });

      // Also register full aspirant in AspirantService across SDC & Scheme
      const sdc = this.sdcService.getSdcById(currentBatch.sdcId);
      const newAspirant = this.aspirantService.addAspirant(this.formData, currentBatch, sdc);

      this.createdAspirantId.set(newAspirant.id);
      this.showSuccessModal.set(true);
    }, 900);
  }

  mapAnotherAspirant(): void {
    this.showSuccessModal.set(false);
    // Reset demographic values for the next candidate
    this.formData.aspirantName = '';
    this.formData.aadhaarNo = '';
    this.formData.confirmAadhaarNo = '';
    this.formData.mobileNo = '';
    this.formData.email = '';
    this.formData.dob = '';
    this.formData.age = '';
    this.currentStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToBatchList(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/batches']);
  }

  goToAspirantsList(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/aspirants']);
  }
}
