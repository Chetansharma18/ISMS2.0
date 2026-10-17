import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSdcComponent, FormFieldConfig } from '../../../shared/components/form-sdc';
import { StepperComponent, StepperStep } from '../../../shared/components/stepper/stepper.component';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { getBatchDetailsFormFields, getCoursesForSector } from '../config/batch-form.config';
import { formatDateTime } from '../../../shared/utils';
import { ButtonComponent, IconComponent, PageShellComponent } from '../../../shared';
import { BatchReceiptPdfService } from './batch-form/batch-receipt-pdf.service';
import {
  BatchFormData,
  FacultyItem,
  HostelItem,
  buildCreateBatchDto,
  createAdditionalHostelRow,
  createFacultyRow,
  createInitialHostelRow,
  generateReceiptNumber,
  generateTransactionId,
  toIsoDateOnly,
  validateBatchDetails
} from './batch-form/batch-form.util';
import { PsdPaymentPanelComponent } from './batch-form/psd-payment-panel.component';
import { BatchFacultyTableComponent } from './batch-form/batch-faculty-table.component';
import { BatchHostelTableComponent } from './batch-form/batch-hostel-table.component';
import { PaymentSuccessModalComponent } from './batch-form/payment-success-modal.component';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [
    ButtonComponent,
    IconComponent,
    PageShellComponent,
    FormSdcComponent,
    StepperComponent,
    PsdPaymentPanelComponent,
    BatchFacultyTableComponent,
    BatchHostelTableComponent,
    PaymentSuccessModalComponent
  ],
  template: `
    <app-page-shell>
        
        <!-- Header: Back Button + Title & SDC Context -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div class="flex items-center gap-3">
            <button
              appButton
              variant="outline"
              size="sm"
              class="shrink-0"
              type="button"
              (click)="goBack()"
              title="Go Back"
            >
              <app-icon name="chevron-left" size="sm" />
              <span>Back</span>
            </button>
            
            <div>
              <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug m-0">
                Create Batch
              </h1>
              
            </div>
          </div>

          <!-- SDC & Scheme Context Pill -->
          <div class="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span class="font-semibold text-slate-800">{{ sdcName() }}</span>
            <span class="text-slate-400 font-mono text-[11px]">({{ sdcCode() }})</span>
            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">{{ scheme() }}</span>
          </div>
        </div>

        <!-- Wizard progress (shared StepperComponent) -->
        <app-stepper [steps]="wizardSteps" [currentStep]="currentStep()" [completedSteps]="completedWizardSteps()" (stepClick)="goToStep($event)"></app-stepper>

        <!-- Notification Banner -->
        @if (errorMessage()) {
          <div class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <app-icon name="alert-triangle" [stroke]="2" class="text-rose-600 shrink-0" />
              <span>{{ errorMessage() }}</span>
            </div>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="errorMessage.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        <!-- =====================================================================
             STEP 1: FEE PAYMENT & RECEIPT
             ===================================================================== -->
        @if (currentStep() === 1) {
          <app-psd-payment-panel
            [isPaymentCompleted]="isPaymentCompleted()"
            [isPaymentProcessing]="isPaymentProcessing()"
            [(selectedPaymentMethod)]="selectedPaymentMethod"
            [scheme]="scheme()"
            [sdcName]="sdcName()"
            [sdcCode]="sdcCode()"
            [sector]="batchData.sector"
            [receiptNumber]="receiptNumber()"
            [transactionId]="transactionId()"
            [paymentTimestamp]="paymentTimestamp()"
            (makePayment)="triggerPayment()"
            (viewPaymentOptions)="isPaymentCompleted.set(false)"
            (downloadReceipt)="downloadPaymentReceipt()"
            (proceed)="proceedToStep2()"
          ></app-psd-payment-panel>
        }

        <!-- =====================================================================
             STEP 2: COMPLETE ELSE DETAILS (SHOWING SECTOR ALREADY FILLED)
             ===================================================================== -->
        @if (currentStep() === 2) {
          <div class="space-y-6 animate-in fade-in duration-200">
            
            <!-- Section 1: Batch Parameters & Schedule (with pre-filled Sector) -->
            <div class="space-y-2">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-primary rounded-full shrink-0"></span>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                    Batch Parameters &amp; Schedule
                  </h3>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span>PSD Payment:</span>
                  <span class="font-semibold px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ SUCCESS (₹{{ batchData.psdFee }})
                  </span>
                </div>
              </div>

              <!-- Reused Shared Form Component (Includes pre-filled Sector as first field) -->
              <app-form-sdc
                [fields]="batchDetailsFormFields"
                [(model)]="batchData"
                [errors]="formErrors"
                (fieldChange)="onFieldChanged($event)"
                density="compact"
                layout="plain"
                [card]="false"
                [gridCols]="4"
                [showSubmit]="false"
                [showCancel]="false"
              ></app-form-sdc>
            </div>

            <!-- Section 2: Faculty Details Table (Matching PDF page 6) -->
            <app-batch-faculty-table
              [facultyList]="facultyList"
              [facultyErrors]="facultyErrors"
              (addFaculty)="addFaculty()"
              (removeFaculty)="removeFaculty($event)"
              (nameEdited)="facultyErrors[$event] = false"
            ></app-batch-faculty-table>

            <!-- Section 3: Hostel Details Table (Matching PDF page 7) -->
            <app-batch-hostel-table
              [hostelList]="hostelList"
              (addHostel)="addHostel()"
              (removeHostel)="removeHostel($event)"
            ></app-batch-hostel-table>

            <!-- Bottom Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">

              <button
                appButton
                type="button"
                (click)="submitBatchForm()"
                [disabled]="isSubmitting()"
                [loading]="isSubmitting()"
                class="w-full sm:w-auto"
              >
                @if (isSubmitting()) {
                  <span>Submitting Batch...</span>
                } @else {
                  <span>Submit Batch</span>
                }
              </button>
            </div>

          </div>
        }

      <!-- =====================================================================
           PAYMENT SUCCESS POPUP MODAL (MATCHING TP REGISTRATION EXPERIENCE)
           ===================================================================== -->
      @if (showPaymentSuccessModal()) {
        <app-payment-success-modal
          [selectedPaymentMethod]="selectedPaymentMethod()"
          [receiptNumber]="receiptNumber()"
          [transactionId]="transactionId()"
          [paymentTimestamp]="paymentTimestamp()"
          [sdcName]="sdcName()"
          [sdcCode]="sdcCode()"
          [sector]="batchData.sector"
          (closed)="closePaymentSuccessModal()"
          (downloadReceipt)="downloadPaymentReceipt()"
          (continued)="continueToBatchDetailsFromModal()"
        ></app-payment-success-modal>
      }

    </app-page-shell>
  `
})
export class BatchFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private location = inject(Location);
  private batchService = inject(BatchService);
  private sdcService = inject(SdcService);
  private receiptPdf = inject(BatchReceiptPdfService);

  /** Active Step: 1 for PSD Payment, 2 for Batch Details */
  currentStep = signal<number>(1);
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  /** Payment State Signals (just like in TP Registration / Scheme Form) */
  selectedPaymentMethod = signal<string>('UPI');
  isPaymentProcessing = signal<boolean>(false);
  isPaymentCompleted = signal<boolean>(false); // starts false: user sees "Make Payment"

  readonly wizardSteps: StepperStep[] = [{ label: 'PSD Payment' }, { label: 'Batch Details' }];
  /** Step 1 shows as done once payment succeeds, even while the user is still on it. */
  readonly completedWizardSteps = computed(() => (this.isPaymentCompleted() ? [1] : []));
  showPaymentSuccessModal = signal<boolean>(false);
  transactionId = signal<string>('');
  receiptNumber = signal<string>('');
  paymentTimestamp = signal<string>('');

  /** Context identifiers */
  sdcId = signal<string>('sdc-101');
  sdcCode = signal<string>('SDC-0001');
  sdcName = signal<string>('Jaipur Skill Center');
  tpName = signal<string>('ARNOLD SAMARTH');
  scheme = signal<string>('SAMARTH');
  sector = signal<string>('Aerospace and Aviation');

  /** Field configurations for Step 2 */
  batchDetailsFormFields: FormFieldConfig[] = [];
  formErrors: Record<string, string> = {};
  facultyErrors: boolean[] = [false];

  onFieldChanged(event: any): void {
    if (this.formErrors[event.key]) {
      delete this.formErrors[event.key];
      this.formErrors = { ...this.formErrors };
    }
  }

  /**
   * Unified Batch Form Data Model containing:
   * Step 1: PSD Payment fee & status
   * Step 2: Sector (already filled) + 8 Batch parameters
   */
  batchData: BatchFormData = {
    // Step 1: PSD Payment
    psdFee: 500,
    psdPaymentStatus: 'PENDING',
    psdPaymentMode: '',
    psdPaymentRef: '',
    psdPaymentDate: '',

    // Step 2: Pre-filled Sector (from SDC context) + empty batch parameters
    sector: 'Aerospace and Aviation',
    course: '',
    batchDurationHours: 0,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    approvedBatchStrength: 30,
    remarks: ''
  };

  /** Faculty Details List — starts empty, user adds faculty */
  facultyList: FacultyItem[] = [createFacultyRow()];

  /** Hostel Details List — starts empty, user adds hostel */
  hostelList: HostelItem[] = [createInitialHostelRow()];

  ngOnInit(): void {
    // Read route query parameters if redirected from SDC list or detail
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['sdcId']) this.sdcId.set(params['sdcId']);
      if (params['sdcCode']) this.sdcCode.set(params['sdcCode']);
      if (params['sdcName']) this.sdcName.set(params['sdcName']);
      if (params['scheme']) this.scheme.set(params['scheme']);
      if (params['sector']) {
        this.sector.set(params['sector']);
        this.batchData.sector = params['sector'];
      }
      if (params['step']) {
        const stepNum = parseInt(params['step'], 10);
        if (stepNum === 1 || stepNum === 2) {
          this.currentStep.set(stepNum);
        }
      }
      if (params['paid'] === 'true' || params['receipt'] === 'true') {
        this.isPaymentCompleted.set(true);
      }
    });

    // Lookup SDC from SdcService to prefill sector and capacity
    const sdc = this.sdcService.getSdcById(this.sdcId());
    if (sdc) {
      this.sdcName.set(sdc.sdcName);
      this.sdcCode.set(sdc.sdcCode);
      this.tpName.set(sdc.tpName);
      this.scheme.set(sdc.scheme);
      if (sdc.sector) {
        this.sector.set(sdc.sector);
        this.batchData.sector = sdc.sector;
      }
      if (sdc.sdcCapacity) {
        this.batchData.approvedBatchStrength = Math.min(30, sdc.sdcCapacity);
      }
    } else {
      if (!this.batchData.sector) {
        this.batchData.sector = this.sector();
      }
    }

    // Default payment timestamp and IDs
    if (!this.transactionId()) {
      this.transactionId.set(generateTransactionId());
    }
    if (!this.receiptNumber()) {
      this.receiptNumber.set(generateReceiptNumber());
    }
    this.paymentTimestamp.set(formatDateTime(new Date()));

    // Ensure course matches the sector
    const initialCourses = getCoursesForSector(this.batchData.sector);
    if (initialCourses.length > 0) {
      if (!initialCourses.some(c => c.courseName === this.batchData.course)) {
        this.batchData.course = initialCourses[0].courseName;
        this.batchData.batchDurationHours = initialCourses[0].defaultDurationHours;
      }
    }

    // Initialize Step 2 batch details form fields (including Sector already filled)
    this.batchDetailsFormFields = getBatchDetailsFormFields({
      onCourseChange: (courseName: string, duration: number) => {
        this.batchData.course = courseName;
        this.batchData.batchDurationHours = duration;
      },
      onSectorChange: (sectorName: string) => {
        this.onSectorSelected(sectorName);
      },
      sector: this.batchData.sector,
      scheme: this.scheme()
    });
  }

  /**
   * Handler when Sector is changed in the dropdown: dynamically syncs Course options
   */
  onSectorSelected(sectorName: string): void {
    this.batchData.sector = sectorName;
    this.sector.set(sectorName);
    const courses = getCoursesForSector(sectorName);
    const courseField = this.batchDetailsFormFields.find(f => f.key === 'course');
    if (courseField) {
      courseField.options = courses.map(c => ({
        label: c.courseName,
        value: c.courseName
      }));
    }
    const hasCurrent = courses.some(c => c.courseName === this.batchData.course);
    if (!hasCurrent) {
      if (courses.length > 0) {
        this.batchData.course = courses[0].courseName;
        this.batchData.batchDurationHours = courses[0].defaultDurationHours;
      } else {
        this.batchData.course = '';
      }
    }
    // Reassign array reference to guarantee child change detection
    this.batchDetailsFormFields = [...this.batchDetailsFormFields];
  }

  goToStep(step: number): void {
    if (step === 2) {
      this.proceedToStep2();
    } else {
      this.currentStep.set(1);
    }
  }

  /**
   * Trigger Payment: Replaces the manual Proceed button with "Make Payment"
   */
  triggerPayment(): void {
    this.isPaymentProcessing.set(true);
    setTimeout(() => {
      this.isPaymentProcessing.set(false);
      const txn = generateTransactionId();
      const rcp = generateReceiptNumber();
      this.transactionId.set(txn);
      this.receiptNumber.set(rcp);
      this.paymentTimestamp.set(formatDateTime(new Date()));
      this.batchData.psdPaymentStatus = 'SUCCESS';
      this.batchData.psdPaymentRef = txn;
      this.batchData.psdPaymentMode = this.selectedPaymentMethod();
      this.batchData.psdPaymentDate = toIsoDateOnly(new Date());
      this.isPaymentCompleted.set(true);
      this.showPaymentSuccessModal.set(true);
    }, 1200);
  }

  continueToBatchDetailsFromModal(): void {
    this.showPaymentSuccessModal.set(false);
    this.currentStep.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closePaymentSuccessModal(): void {
    this.showPaymentSuccessModal.set(false);
    this.currentStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Download Official PDF Payment Receipt (Government of Rajasthan / RSLDC ISMS 2.0)
   */
  downloadPaymentReceipt(): void {
    this.receiptPdf.download({
      receiptNumber: this.receiptNumber(),
      transactionId: this.transactionId(),
      paymentTimestamp: this.paymentTimestamp(),
      paymentMethod: this.selectedPaymentMethod(),
      tpName: this.tpName(),
      sdcCode: this.sdcCode(),
      sdcName: this.sdcName(),
      scheme: this.scheme(),
      sector: this.batchData.sector
    });
  }

  proceedToStep2(): void {
    if (!this.isPaymentCompleted()) {
      this.errorMessage.set('Please make the PSD verification payment before proceeding to batch details.');
      return;
    } this.errorMessage.set('');
    this.currentStep.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addFaculty(): void {
    this.facultyList.push(createFacultyRow('Assistant Trainer'));
  }

  removeFaculty(index: number): void {
    if (this.facultyList.length > 1) {
      this.facultyList.splice(index, 1);
    }
  }

  addHostel(): void {
    this.hostelList.push(createAdditionalHostelRow(this.hostelList.length));
  }

  removeHostel(index: number): void {
    this.hostelList.splice(index, 1);
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/batches']);
    }
  }

  submitBatchForm(): void {
    this.errorMessage.set('');
    this.formErrors = {};
    // Validation for compulsory fields - highlights empty fields in red
    const validation = validateBatchDetails(this.batchData, this.facultyList);
    this.formErrors = validation.formErrors;
    this.facultyErrors = validation.facultyErrors;

    if (validation.hasError) {
      this.errorMessage.set('Please fill all mandatory highlighted fields before submitting.');
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const dto = buildCreateBatchDto(
        {
          sdcId: this.sdcId(),
          sdcCode: this.sdcCode(),
          sdcName: this.sdcName(),
          tpName: this.tpName(),
          scheme: this.scheme(),
          sector: this.sector()
        },
        this.batchData,
        this.facultyList,
        this.hostelList
      );

      this.batchService.createBatch(dto);
      this.router.navigate(['/batches']);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to submit batch application.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
