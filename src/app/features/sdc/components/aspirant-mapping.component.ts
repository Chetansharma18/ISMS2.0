import { Component, DestroyRef, inject, signal, computed, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormSdcComponent, FormFieldConfig } from '../../../shared/components/form-sdc';
import { StepperComponent, StepperStep } from '../../../shared/components/stepper/stepper.component';
import { ButtonComponent, IconComponent, PageShellComponent } from '../../../shared';
import { AspirantAadhaarUploadComponent } from './aspirant-mapping/aspirant-aadhaar-upload.component';
import { AspirantErrorBannerComponent } from './aspirant-mapping/aspirant-error-banner.component';
import { AspirantMappingHeaderComponent } from './aspirant-mapping/aspirant-mapping-header.component';
import { AspirantPhotoDocumentsStepComponent } from './aspirant-mapping/aspirant-photo-documents-step.component';
import {
  AspirantBulkPick,
  AspirantSourceMethod,
  AspirantSourcePick,
  AspirantSourceStepComponent
} from './aspirant-mapping/aspirant-source-step.component';
import { AspirantSuccessModalComponent } from './aspirant-mapping/aspirant-success-modal.component';
import { formatFileSizeMb, readFileAsDataUrl } from './aspirant-mapping/aspirant-file.util';
import { AspirantDocumentViewerState } from './aspirant-mapping/aspirant-document-viewer.state';
import { createEmptyAspirantFormData } from './aspirant-mapping/aspirant-form-data.factory';
import { validateForSubmit, validateStepBeforeAdvance } from './aspirant-mapping/aspirant-mapping.validation';
import { BatchService } from '../services/batch.service';
import { registrationBlockedReason, seatsLeft as seatsLeftOf } from '../utils/batch-approval.util';
import { SdcService } from '../services/sdc.service';
import { AspirantService } from '../services/aspirant.service';
import { AspirantSourceService } from '../services/aspirant-source.service';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import {
  AspirantFormData,
  AspirantDocumentItem,
  getStep1PersonalFields,
  getStep2PermanentAddressFields,
  getStep2CommAddressFields,
  getStep2ContactFields,
  getStep3EconomicWorkerFields,
  calculateAgeFromDob
} from '../config/aspirant-form.config';

/** Title and one line of help for each step, shown in the numbered heading of the form card. */
const STEP_INFO: { label: string; description: string; next: string }[] = [
  { label: 'Registration Method', description: "Choose how the aspirant's details are brought in.", next: 'Proceed to Personal & Identity' },
  { label: 'Personal & Identity', description: 'Identity and personal details of the aspirant.', next: 'Proceed to Address & Contact' },
  { label: 'Address & Contact', description: 'Permanent and communication address, and contact details.', next: 'Proceed to Bank Details' },
  { label: 'Bank', description: 'Bank, income and worker scheme details.', next: 'Proceed to Photo & Documents' },
  { label: 'Photo & Documents', description: 'Upload the photograph and the documents of the aspirant.', next: '' }
];

/**
 * Register Aspirant: five steps in the same design as the Organization Registration form.
 * Step 1 picks how the details come in (Expressed Interest, Employment Department, or manual entry with Aadhaar);
 * steps 2 to 5 are the registration form, filled in when the details came from a source.
 */
@Component({
  selector: 'app-aspirant-mapping',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FormSdcComponent,
    StepperComponent,
    ButtonComponent,
    IconComponent,
    PageShellComponent,
    AspirantAadhaarUploadComponent,
    AspirantErrorBannerComponent,
    AspirantMappingHeaderComponent,
    AspirantPhotoDocumentsStepComponent,
    AspirantSourceStepComponent,
    AspirantSuccessModalComponent
  ],
  template: `
    <app-page-shell>

        <!-- Aadhaar Card Upload Control Template for Identity Details in Step 2 -->
        <ng-template #aadhaarUploadTemplate>
          <app-aspirant-aadhaar-upload
            [fileName]="formData.aadhaarDocName ?? ''"
            [fileSize]="formData.aadhaarDocSize ?? ''"
            (viewDocument)="viewer.viewAadhaar()"
            (fileSelected)="onAadhaarUploaded($event)"
          ></app-aspirant-aadhaar-upload>
        </ng-template>

        <app-aspirant-mapping-header [batch]="batch()" [replacedName]="replacing()?.aspirantName ?? ''" (back)="goBack()"></app-aspirant-mapping-header>

        <!-- Step progress card (same look as the Organization Registration form) -->
        <app-stepper
          class="block"
          variant="wizard"
          ariaLabel="Aspirant Registration Steps"
          [steps]="wizardSteps"
          [currentStep]="currentStep()"
          [hideLabelsOnMobile]="true"
          (stepClick)="goToStep($event)"
        ></app-stepper>

        @if (errorMessage()) {
          <app-aspirant-error-banner [message]="errorMessage()" (dismiss)="errorMessage.set('')"></app-aspirant-error-banner>
        }

        <!-- Main form card: numbered step title + the active step -->
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
          <div class="pb-3.5 border-b border-slate-100 space-y-1">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                {{ currentStep() }}
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">{{ stepInfo().label }}</h2>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 pl-10 m-0">{{ stepInfo().description }}</p>
          </div>

          <!-- Details loaded from a source, reminded on the form steps -->
          @if (currentStep() > 1 && currentStep() < 5 && loadedNote()) {
            <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center gap-2" role="status">
              <app-icon name="check" size="sm" [stroke]="2.5" class="text-navy shrink-0" />
              <span>{{ loadedNote() }}</span>
            </div>
          }

          <!-- STEP 1: REGISTRATION METHOD -->
          @if (currentStep() === 1) {
            <app-aspirant-source-step
              [method]="method()"
              [batch]="batch()"
              [candidates]="candidates()"
              [registeredAadhaars]="registeredAadhaars()"
              [seatsLeft]="seatsLeft()"
              [chosenAadhaar]="chosenAadhaar()"
              [loadedNote]="bulkNote() || loadedNote()"
              (methodChange)="onMethod($event)"
              (profileChosen)="onProfilePicked($event)"
              (bulkRegister)="onBulkRegister($event)"
            ></app-aspirant-source-step>
          }

          <!-- STEP 2: PERSONAL & IDENTITY -->
          @if (currentStep() === 2) {
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
          }

          <!-- STEP 3: ADDRESS & CONTACT -->
          @if (currentStep() === 3) {
            <div class="space-y-4">
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
              <div class="pt-2 pb-1.5 border-b border-slate-200/80 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
                  <h4 class="font-bold m-0" style="font-size: 13.5px !important; color: #0B3558 !important;">
                    Communication Address
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
            </div>
          }

          <!-- STEP 4: BANK, ECONOMIC & WORKER DETAILS -->
          @if (currentStep() === 4) {
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
          }

          <!-- STEP 5: PHOTO & DOCUMENTS -->
          @if (currentStep() === 5) {
            <div class="space-y-4">
              <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700">
                Registering <strong class="text-slate-900">{{ formData.aspirantName || 'the aspirant' }}</strong>
                (Aadhaar {{ maskedAadhaar() }}) in batch <strong class="tabular-nums text-slate-900">{{ batch().batchCode }}</strong>.
              </div>

              <app-aspirant-photo-documents-step
                [formData]="formData"
                (viewPhoto)="viewer.viewPhoto()"
                (photoSelected)="onPhotoUploaded($event)"
                (viewDocument)="viewer.viewDocument($event)"
                (documentSelected)="onAspirantDocSelected($event.doc, $event.event)"
              ></app-aspirant-photo-documents-step>
            </div>
          }

          <!-- Footer: Previous and Proceed (Register Aspirant on the last step) -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            @if (currentStep() > 1) {
              <button appButton variant="outline" size="lg" type="button" (click)="previous()">
                <app-icon name="chevron-left" size="sm" />
                <span>Previous</span>
              </button>
            } @else {
              <span></span>
            }

            @if (currentStep() < lastStep) {
              <button appButton size="lg" type="button" (click)="next()">
                <span>{{ stepInfo().next }}</span>
                <app-icon name="chevron-right" size="sm" />
              </button>
            } @else {
              <button appButton size="lg" type="button" [loading]="isSubmitting()" [disabled]="isSubmitting()" (click)="submitAndMapAspirant()">
                @if (isSubmitting()) {
                  <span>Registering...</span>
                } @else {
                  <app-icon name="check" />
                  <span>Register Aspirant</span>
                }
              </button>
            }
          </div>
        </div>

      <!-- SUCCESS MODAL AFTER MAPPING ASPIRANT -->
      @if (showSuccessModal()) {
        <app-aspirant-success-modal
          [batchCode]="batch().batchCode"
          [aspirantId]="createdAspirantId()"
          [aspirantName]="formData.aspirantName"
          [aadhaarNo]="formData.aadhaarNo"
          [replacedName]="replacing()?.aspirantName ?? ''"
          (mapAnother)="mapAnotherAspirant()"
          (batchList)="goToBatchList()"
          (aspirantsList)="goToAspirantsList()"
        ></app-aspirant-success-modal>
      }

    </app-page-shell>
  `
})
export class AspirantMappingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private router = inject(Router);
  readonly batchService = inject(BatchService);
  readonly sdcService = inject(SdcService);
  readonly aspirantService = inject(AspirantService);
  private readonly sources = inject(AspirantSourceService);
  private readonly docViewer = inject(DocumentViewerService);

  readonly lastStep = STEP_INFO.length;
  currentStep = signal<number>(1);
  /** Furthest step reached, so the stepper can go back and forth but not skip ahead. */
  private readonly furthestStep = signal<number>(1);
  readonly wizardSteps: StepperStep[] = STEP_INFO.map(step => ({ label: step.label }));
  readonly stepInfo = computed(() => STEP_INFO[this.currentStep() - 1]);

  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  showSuccessModal = signal<boolean>(false);
  createdAspirantId = signal<string>('ASP-RJ-2026-98412');

  /** How the details come in; none until the partner chooses on step 1. */
  readonly method = signal<AspirantSourceMethod | null>(null);
  /** The step 1 choice is complete: manual entry chosen, or an aspirant's details loaded from a source. */
  private readonly sourceReady = signal<boolean>(false);
  readonly loadedNote = signal<string>('');
  readonly chosenAadhaar = signal<string>('');

  @ViewChild('aadhaarUploadTemplate', { static: true }) aadhaarUploadTemplate!: TemplateRef<any>;

  readonly viewer = new AspirantDocumentViewerState(() => this.formData, this.docViewer);

  batchId = signal<string>('');
  batch = computed(() => {
    return this.batchService.getBatchById(this.batchId()) || this.batchService.batches()[0];
  });

  /** Aspirants who expressed interest in this batch's course or sector and are not registered in it yet. */
  readonly candidates = computed(() => {
    const batch = this.batch();
    return batch ? this.sources.expressedInterestFor(batch) : [];
  });

  /** Aadhaar numbers already registered in this batch. */
  readonly registeredAadhaars = computed(
    () =>
      new Set(
        this.aspirantService
          .aspirants()
          .filter(a => a.batchId === this.batch()?.id && a.trainingStatus !== 'DROPOUT')
          .map(a => a.aadhaarNo)
      )
  );

  /** Id of the dropped student this registration replaces (from the link), or empty for a normal registration. */
  private readonly replaceId = signal<string>('');

  /** The dropped student being replaced, when the page was opened to register a replacement. */
  readonly replacing = computed(() => (this.replaceId() ? this.aspirantService.getAspirantById(this.replaceId()) : undefined));

  /** Why the page cannot register anyone, or an empty text. A replacement works after the freeze date too. */
  private readonly blockedReason = computed(() => {
    const batch = this.batch();
    const replaced = this.replacing();
    if (this.replaceId()) {
      if (!replaced || replaced.batchId !== batch?.id || replaced.trainingStatus !== 'DROPOUT') return 'Only a student who has dropped out of this batch can be replaced.';
      if (replaced.replacedByAspirantId) return `${replaced.aspirantName} has already been replaced.`;
    }
    return registrationBlockedReason(batch, undefined, !!this.replaceId());
  });

  /** Places still free in the batch (none while it is not approved, frozen, rejected or full). A replacement takes one. */
  readonly seatsLeft = computed(() => {
    const batch = this.batch();
    if (!batch || this.blockedReason()) return 0;
    const free = seatsLeftOf(batch);
    return this.replaceId() ? Math.min(1, free) : free;
  });

  /** Result of the last bulk registration, shown on step 1. */
  readonly bulkNote = signal<string>('');

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
      this.replaceId.set(q['replace'] ?? '');
    });

    // Fallback batchId if none in url
    if (!this.batchId() && this.batchService.batches().length > 0) {
      this.batchId.set(this.batchService.batches()[0].id);
    }

    // Tell the partner up front when aspirants cannot be registered in this batch (not approved, frozen, rejected, full).
    const blockedReason = this.blockedReason();
    if (blockedReason) this.errorMessage.set(blockedReason);

    this.formData = this.freshForm();

    // Initialize Form Fields for the form steps
    this.step1Fields = getStep1PersonalFields((dob, model) => {
      model.age = calculateAgeFromDob(dob);
    }, this.aadhaarUploadTemplate);
    this.step2PermanentFields = getStep2PermanentAddressFields();
    this.step2CommFields = getStep2CommAddressFields();
    this.step2ContactFields = getStep2ContactFields();
    this.step3Fields = getStep3EconomicWorkerFields();
  }

  /** A blank form that already lists the sector of the batch as a preferred sector. */
  private freshForm(): AspirantFormData {
    const form = createEmptyAspirantFormData();
    const sector = this.batch()?.sector;
    if (sector && !form.preferredSectors.includes(sector)) form.preferredSectors.unshift(sector);
    return form;
  }

  protected maskedAadhaar(): string {
    return `XXXX-XXXX-${this.formData.aadhaarNo.slice(-4) || 'XXXX'}`;
  }

  goBack(): void {
    this.router.navigate(['/batches']);
  }

  // ---- Step 1: registration method -------------------------------------------------------------

  /** Choosing another method starts the form again, so details of one source never mix with another. */
  onMethod(method: AspirantSourceMethod): void {
    if (this.method() === method) return;
    this.method.set(method);
    this.bulkNote.set('');
    this.formData = this.freshForm();
    this.loadedNote.set('');
    this.chosenAadhaar.set('');
    this.sourceReady.set(method === 'MANUAL');
    this.furthestStep.set(1);
    this.errorMessage.set('');
  }

  /** The partner registered several aspirants at once: they go straight into the batch, without the form steps. */
  onBulkRegister(pick: AspirantBulkPick): void {
    const batch = this.batch();
    if (!batch) return;
    const { registered, skipped } = this.sources.registerMany(pick.profiles, batch.id, this.replaceId() || undefined);
    this.errorMessage.set(
      skipped > 0 ? `${skipped} ${skipped === 1 ? 'aspirant was' : 'aspirants were'} not registered: the batch is full or the Aadhaar number is already in it.` : ''
    );
    this.bulkNote.set(
      registered > 0
        ? `${registered} ${registered === 1 ? 'aspirant' : 'aspirants'} registered in batch ${batch.batchCode} from the ${pick.source}.`
        : ''
    );
  }

  /** The partner picked an aspirant (or used the fetched record): the form is filled with what the source knows. */
  onProfilePicked(pick: AspirantSourcePick): void {
    this.bulkNote.set('');
    this.formData = this.sources.toFormData(pick.profile, this.freshForm().preferredSectors);
    this.chosenAadhaar.set(pick.profile.aadhaarNo);
    this.loadedNote.set(`Details of ${pick.profile.aspirantName} loaded from ${pick.source}. Review them and complete the rest in the next steps.`);
    this.sourceReady.set(true);
    this.errorMessage.set('');
  }

  // ---- Navigation ----------------------------------------------------------------------------

  /** The message that explains why step 1 cannot be left yet, or an empty text when it can. */
  private sourceProblem(): string {
    if (this.sourceReady()) return '';
    switch (this.method()) {
      case 'EXPRESSED_INTEREST':
        return 'Select an aspirant from the list.';
      case 'EMPLOYMENT_DEPT':
        return 'Fetch the aspirant\'s details and choose Use These Details.';
      default:
        return 'Choose how the aspirant\'s details are brought in.';
    }
  }

  /** Why the active step cannot be left yet, or an empty text when it can. */
  private stepProblem(): string {
    if (this.currentStep() === 1) return this.sourceProblem();
    // Validation counts the form steps from 1 (identity), which is step 2 of this wizard.
    return validateStepBeforeAdvance(this.currentStep() - 1, this.formData) ?? '';
  }

  next(): void {
    this.errorMessage.set('');
    const problem = this.stepProblem();
    if (problem) {
      this.errorMessage.set(problem);
      return;
    }
    this.moveTo(this.currentStep() + 1);
  }

  previous(): void {
    this.errorMessage.set('');
    this.moveTo(this.currentStep() - 1);
  }

  /** Clicking a step in the stepper: back to an earlier step, or ahead exactly as Proceed would. */
  goToStep(step: number): void {
    if (step < 1 || step > this.lastStep || step === this.currentStep()) return;
    this.errorMessage.set('');
    // Going back is direct. Going ahead works like Proceed: each step in between must be complete,
    // and the first one that is not stops the move and says why.
    while (this.currentStep() < step) {
      const problem = this.stepProblem();
      if (problem) {
        this.errorMessage.set(problem);
        return;
      }
      this.moveTo(this.currentStep() + 1);
    }
    if (this.currentStep() > step) this.moveTo(step);
  }

  private moveTo(step: number): void {
    this.currentStep.set(step);
    this.furthestStep.update(furthest => Math.max(furthest, step));
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
      // The validation counts the form steps from 1 (identity), which is step 2 of this wizard.
      this.moveTo(submitError.step + 1);
      return;
    }

    const currentBatch = this.batch();
    if (!currentBatch) {
      this.errorMessage.set('Target batch not found.');
      return;
    }

    const blocked = this.blockedReason();
    if (blocked) {
      this.errorMessage.set(blocked);
      return;
    }

    if (
      this.aspirantService
        .aspirants()
        .some(a => a.batchId === currentBatch.id && a.trainingStatus !== 'DROPOUT' && a.aadhaarNo === this.formData.aadhaarNo)
    ) {
      this.errorMessage.set('An aspirant with this Aadhaar number is already registered in this batch.');
      this.moveTo(2);
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);

      // Mask Aadhaar e.g. XXXX-XXXX-1234
      const aadhaarLast4 = this.formData.aadhaarNo.slice(-4) || '9812';
      const masked = `XXXX-XXXX-${aadhaarLast4}`;

      // Map to batch service
      const replacesId = this.replaceId() || undefined;
      const mapped = this.batchService.mapCandidateToBatch(
        currentBatch.id,
        { name: this.formData.aspirantName, aadhaarMasked: masked, mobile: this.formData.mobileNo },
        { replacement: !!replacesId }
      );
      if (!mapped) {
        this.errorMessage.set('The aspirant could not be registered. The batch is full or registration is closed.');
        return;
      }

      // Also register full aspirant in AspirantService across SDC & Scheme
      const sdc = this.sdcService.getSdcById(currentBatch.sdcId);
      const newAspirant = this.aspirantService.addAspirant(this.formData, currentBatch, sdc, replacesId);

      this.createdAspirantId.set(newAspirant.id);
      this.showSuccessModal.set(true);
    }, 900);
  }

  /** Starts the next aspirant from the first step, with nothing carried over from the last one. */
  mapAnotherAspirant(): void {
    this.showSuccessModal.set(false);
    this.formData = this.freshForm();
    this.method.set(null);
    this.sourceReady.set(false);
    this.loadedNote.set('');
    this.chosenAadhaar.set('');
    this.furthestStep.set(1);
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
