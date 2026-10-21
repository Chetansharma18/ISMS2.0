import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionModalComponent,
  ButtonComponent,
  FormInputComponent,
  FormSectionComponent,
  FormSelectComponent,
  IconComponent,
  PageShellComponent,
  StepperComponent,
  StepperStep,
  formatDateTime,
  formatInr
} from '../../../shared';
import { BatchService } from '../services/batch.service';
import type { BatchRecord } from '../models/batch.model';
import { canEditBatch, freezeDateOf, registeredCount } from '../utils/batch-approval.util';
import { SdcService } from '../services/sdc.service';
import { IpaAllocationService } from '../services/ipa-allocation.service';
import { getCoursesForSector } from '../config/courses-catalog.data';
import { DataEngineService } from '../../../core/services/data-engine.service';
import type { CourseMasterItem } from '../../../core/models/admin-masters.model';
import { MAX_TRAINEES_PER_BATCH, MIN_TRAINEES_PER_BATCH, maxBatchesFor, sdcTarget } from '../utils/batch-limit.util';
import { BatchReceiptPdfService } from './batch-form/batch-receipt-pdf.service';
import {
  BatchFormData,
  CameraItem,
  DEFAULT_QUALIFICATION,
  toTimeInput,
  FacultyItem,
  HostelItem,
  PSD_AMOUNT,
  PSD_AMOUNT_IN_WORDS,
  buildCreateBatchDto,
  createAdditionalHostelRow,
  createCameraRow,
  createFacultyRow,
  createInitialHostelRow,
  generateReceiptNumber,
  generateTransactionId,
  toIsoDateOnly,
  validateBatchDetails,
  validateCameras
} from './batch-form/batch-form.util';
import { BatchCameraTableComponent } from './batch-form/batch-camera-table.component';
import { BatchFacultyTableComponent } from './batch-form/batch-faculty-table.component';
import { BatchHostelTableComponent } from './batch-form/batch-hostel-table.component';

/** How long the payment success screen stays up before the batch details open by themselves. */
const PSD_SUCCESS_REDIRECT_MS = 2500;

/** Details of the selected course, worked out from the Course Master (or from the IPA when the master has no such course). */
interface CourseInfo {
  qpCode: string;
  version: string;
  nsqfLevel: string;
  theoryHours: number | null;
  practicalHours: number | null;
  practicalText: string;
  softSkillHours: number | null;
  totalHours: number;
  fromMaster: boolean;
}

/** The course picked on the form, kept so its details can be worked out again when the Course Master finishes loading. */
interface SelectedCourse {
  name: string;
  code?: string;
  fallbackHours?: number;
}

/** A course version that has lapsed (expired or no longer valid) in the Course Master. */
function isLapsed(course: CourseMasterItem): boolean {
  return course.remark === 'Expired' || course.remark === 'Not Valid';
}

/** "180+60" gives 240; a plain "15" gives 15. */
function sumHours(text: string): number {
  return text.split('+').reduce((total, part) => total + (Number(part.trim()) || 0), 0);
}

/**
 * Create Batch: two steps in the same design as the Apply for EOI and Organization Registration forms.
 *
 * Step 1 takes the Performance Security Deposit (PSD) the same way the EOI processing fee is taken: the fee is shown,
 * the partner presses Proceed to Pay, and the payment success screen carries them on to Step 2. The PSD is not the
 * batch fee; nothing else is collected before the batch is created. Step 2 holds the batch details, faculty and hostel.
 *
 * A centre that has approved IPA allocations can only run the courses of those allocations, with the duration and
 * trainees per batch set by the IPA; a centre without any keeps the course catalogue.
 */
@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [
    ActionModalComponent,
    ButtonComponent,
    FormInputComponent,
    FormSectionComponent,
    FormSelectComponent,
    IconComponent,
    PageShellComponent,
    StepperComponent,
    BatchCameraTableComponent,
    BatchFacultyTableComponent,
    BatchHostelTableComponent
  ],
  template: `
    <app-page-shell>
      @let errs = fieldErrors();

      <!-- Back button, title row and subtitle (same as the registration and EOI forms) -->
      <div class="space-y-3">
        <!-- No Back once the PSD is paid: the payment step cannot be reopened -->
        @if (!justPaid) {
          <div>
            <button appButton variant="outline" size="sm" type="button" (click)="goBack()">
              <app-icon name="back" />
              <span>Back</span>
            </button>
          </div>
        }

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">{{ isEdit ? 'Edit Batch' : 'Create Batch' }}</h1>
          <span class="text-xs text-slate-500 font-medium select-none">
            Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
          </span>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
          @if (isEdit) {
            Update the details of batch {{ editedBatchCode() }} of {{ sdcName() }} ({{ sdcCode() }}). Saving sends the batch for approval again.
          } @else if (needsPsd) {
            This is the first batch of {{ sdcName() }} ({{ sdcCode() }}). Pay the PSD once and enter the batch details in the two steps below.
            The batch goes for approval when you submit it; aspirants are registered after it is approved.
          } @else {
            Enter the batch details for {{ sdcName() }} ({{ sdcCode() }}). The PSD of this center is already paid.
            The batch goes for approval when you submit it; aspirants are registered after it is approved.
          }
        </p>
      </div>

      <!-- Step progress card: only for the first batch of a center, which takes the PSD -->
      @if (needsPsd) {
        <app-stepper
          class="block"
          variant="wizard"
          ariaLabel="Batch Creation Steps"
          [steps]="wizardSteps"
          [currentStep]="currentStep()"
          [completedSteps]="completedWizardSteps()"
          (stepClick)="goToStep($event)"
        ></app-stepper>
      }

      @if (errorMessage()) {
        <div id="batch-form-error" role="alert" class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <app-icon name="alert-triangle" [stroke]="2" class="text-rose-600 shrink-0" />
            <span>{{ errorMessage() }}</span>
          </div>
          <button appButton variant="ghost" size="sm" iconOnly type="button" aria-label="Dismiss" (click)="errorMessage.set('')">
            <app-icon name="close" size="xs" />
          </button>
        </div>
      }

      <!-- Main form card: numbered step title + the active step -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
        <div class="pb-3.5 border-b border-slate-100 space-y-1">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
              {{ needsPsd ? currentStep() : 1 }}
            </span>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">{{ currentStep() === 1 ? 'PSD Payment' : 'Batch Details' }}</h2>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 pl-10 m-0">
            @if (currentStep() === 1) {
              Pay the Performance Security Deposit (PSD) of {{ psdAmountText }} before the batch is created.
            } @else {
              Enter the course, schedule, faculty and hostel details of the batch.
            }
          </p>
        </div>

        <!-- =====================================================================
             STEP 1: PSD PAYMENT (same method as the EOI processing fee)
             ===================================================================== -->
        @if (currentStep() === 1) {
          <div class="space-y-4">
            <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center gap-2.5">
                <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">Fee Details</h3>
              </div>

              <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Payable To</span>
                  <span class="font-medium text-slate-900 text-[12.5px] block mt-1">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Payable For</span>
                  <span class="font-medium text-slate-900 text-[12.5px] block mt-1">Performance Security Deposit (PSD)</span>
                </div>

                <div class="p-4 rounded-xl bg-sky-50/60 border border-sky-200">
                  <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Amount Payable</span>
                  <span class="text-xl font-extrabold text-navy block mt-1">{{ psdAmountText }}</span>
                  <span class="text-[11.5px] text-slate-500 block mt-0.5">{{ psdAmountInWords }}</span>
                </div>
              </div>
            </section>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                appButton
                size="lg"
                type="button"
                [loading]="isPaying()"
                [disabled]="isPaying() || isPaymentCompleted() || limitReached"
                (click)="payPsd()"
              >
                @if (isPaying()) {
                  <span>Processing...</span>
                } @else {
                  <span>Proceed to Pay</span>
                }
              </button>
            </div>
          </div>
        }

        <!-- =====================================================================
             STEP 2: BATCH DETAILS
             ===================================================================== -->
        @if (currentStep() === 2) {
          <!-- PSD paid (once per center, with its first batch) -->
          @if (!isEdit) {
          <div class="flex items-center justify-between gap-3 flex-wrap p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
            <div class="flex items-center gap-2 text-slate-700">
              <app-icon name="check" size="sm" [stroke]="2.5" class="text-navy shrink-0" />
              @if (hasPaymentDetails()) {
                <span>
                  PSD of <strong class="text-slate-900">{{ psdAmountText }}</strong>
                  {{ needsPsd ? 'paid on' : 'already paid for this center on' }} {{ paymentTimestamp() }}.
                  Ref: <span class="tabular-nums font-semibold">{{ transactionId() }}</span>
                </span>
              } @else {
                <span>The PSD of this center is already paid.</span>
              }
            </div>
            @if (hasPaymentDetails()) {
              <button appButton variant="outline" size="sm" type="button" (click)="downloadPaymentReceipt()">
                <app-icon name="download" size="sm" />
                <span>Download Receipt</span>
              </button>
            }
          </div>
          }

          <app-form-section class="block" title="Center Details">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
              <div class="lg:col-span-6 sm:col-span-2">
                <app-form-input label="Center Name" [disabled]="true" [value]="sdcName()"></app-form-input>
              </div>
              <div class="lg:col-span-3 sm:col-span-1">
                <app-form-input label="Center Code" [disabled]="true" [value]="sdcCode()"></app-form-input>
              </div>
              <div class="lg:col-span-3 sm:col-span-1">
                <app-form-input label="Scheme" [disabled]="true" [value]="scheme()"></app-form-input>
              </div>
              @if (isEdit) {
                <div class="lg:col-span-3 sm:col-span-1">
                  <app-form-input label="Batch Code" [disabled]="true" [value]="editedBatchCode()"></app-form-input>
                </div>
              }
            </div>
          </app-form-section>

          <app-form-section class="block" title="Batch Details">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
              @if (ipaMode && isEdit) {
                <div class="lg:col-span-12 sm:col-span-2">
                  <app-form-input label="IPA Course" [disabled]="true" [value]="ipaCourseLabel"></app-form-input>
                </div>
              } @else if (ipaMode) {
                <div class="lg:col-span-12 sm:col-span-2">
                  <app-form-select
                    label="Course (as allowed by the IPA)"
                    placeholder="Select the IPA course for this batch"
                    [required]="true"
                    [options]="ipaCourseOptions"
                    [value]="ipaCourseLabel"
                    (valueChange)="onIpaCourseSelected($event)"
                    [error]="errs['ipaSlot']"
                  ></app-form-select>
                </div>
              }

              <div class="lg:col-span-4 sm:col-span-1">
                <app-form-input label="Sector" [disabled]="true" [value]="batchData.sector"></app-form-input>
              </div>

              <div class="lg:col-span-4 sm:col-span-1">
                @if (ipaMode) {
                  <app-form-input label="Course" [disabled]="true" [value]="batchData.course"></app-form-input>
                } @else {
                  <app-form-select
                    label="Course"
                    placeholder="Select course"
                    [required]="true"
                    [options]="courseOptions"
                    [value]="batchData.course"
                    (valueChange)="onCourseSelected($event)"
                    [error]="errs['course']"
                  ></app-form-select>
                }
              </div>

              <div class="lg:col-span-4 sm:col-span-2">
                <app-form-input
                  label="Batch Size"
                  type="number"
                  placeholder="Number of trainees"
                  [required]="true"
                  [hint]="'Between ' + minBatchSize() + ' and ' + maxBatchSize() + ' trainees in a batch'"
                  [value]="strengthText()"
                  (valueChange)="onBatchSize($event)"
                  [error]="errs['batchSize']"
                ></app-form-input>
              </div>

              <div class="lg:col-span-3 sm:col-span-1">
                <app-form-input
                  label="Batch Start Date"
                  type="date"
                  [required]="true"
                  [value]="batchData.startDate"
                  (valueChange)="setField('startDate', $event)"
                  [error]="errs['startDate']"
                ></app-form-input>
              </div>
              <div class="lg:col-span-3 sm:col-span-1">
                <app-form-input
                  label="Batch End Date"
                  type="date"
                  [value]="batchData.endDate"
                  (valueChange)="setField('endDate', $event)"
                ></app-form-input>
              </div>
              <div class="lg:col-span-3 sm:col-span-1">
                <app-form-input
                  label="Batch Start Time"
                  type="time"
                  [required]="true"
                  [value]="batchData.startTime"
                  (valueChange)="setField('startTime', $event)"
                  [error]="errs['startTime']"
                ></app-form-input>
              </div>
              <div class="lg:col-span-3 sm:col-span-1">
                <app-form-input
                  label="Batch End Time"
                  type="time"
                  [required]="true"
                  [value]="batchData.endTime"
                  (valueChange)="setField('endTime', $event)"
                  [error]="errs['endTime']"
                ></app-form-input>
              </div>

              <div class="lg:col-span-12 sm:col-span-2">
                <app-form-input
                  label="Remarks"
                  placeholder="Any note for the department"
                  [maxLength]="300"
                  [value]="batchData.remarks"
                  (valueChange)="setField('remarks', $event)"
                ></app-form-input>
              </div>
            </div>
          </app-form-section>

          <!-- Filled in as soon as the course is selected -->
          <app-form-section class="block" title="Course Details">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
              <div class="lg:col-span-4 sm:col-span-2">
                <app-form-input label="QP / Job Role Code" [disabled]="true" [value]="info('qpCode')"></app-form-input>
              </div>
              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-input label="Version" [disabled]="true" [value]="info('version')"></app-form-input>
              </div>
              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-input label="NSQF Level" [disabled]="true" [value]="info('nsqfLevel')"></app-form-input>
              </div>
              <div class="lg:col-span-4 sm:col-span-2">
                <app-form-input label="Total Duration (hrs)" [disabled]="true" [value]="info('totalHours')"></app-form-input>
              </div>

              <div class="lg:col-span-4 sm:col-span-1">
                <app-form-input label="Theory Duration (hrs)" [disabled]="true" [value]="info('theoryHours')"></app-form-input>
              </div>
              <div class="lg:col-span-4 sm:col-span-1">
                <app-form-input label="Practical + OJT Duration (hrs)" [disabled]="true" [value]="info('practicalText')"></app-form-input>
              </div>
              <div class="lg:col-span-4 sm:col-span-2">
                <app-form-input label="IT & Soft Skill Training (hrs)" [disabled]="true" [value]="info('softSkillHours')"></app-form-input>
              </div>
            </div>
            @if (courseInfo && !courseInfo.fromMaster) {
              <p class="text-xs text-slate-500 m-0 mt-2">Only the duration is available for this course; it is taken from the IPA.</p>
            } @else if (!courseInfo) {
              <p class="text-xs text-slate-500 m-0 mt-2">Select the course to see its details and hours.</p>
            }
          </app-form-section>

          <app-batch-faculty-table
            [facultyList]="facultyList"
            [facultyErrors]="facultyErrors"
            (addFaculty)="addFaculty()"
            (removeFaculty)="removeFaculty($event)"
            (nameEdited)="facultyErrors[$event] = false"
          ></app-batch-faculty-table>

          <app-batch-camera-table
            [cameraList]="cameraList"
            [cameraErrors]="cameraErrors"
            (addCamera)="addCamera()"
            (removeCamera)="removeCamera($event)"
          ></app-batch-camera-table>

          <app-batch-hostel-table
            [hostelList]="hostelList"
            (addHostel)="addHostel()"
            (removeHostel)="removeHostel($event)"
          ></app-batch-hostel-table>

          <div class="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button appButton variant="outline" size="lg" type="button" (click)="goBack()">
              <app-icon name="close" />
              <span>Cancel</span>
            </button>
            <button appButton size="lg" type="button" [loading]="isSubmitting()" [disabled]="isSubmitting() || limitReached" (click)="submitBatchForm()">
              <span>{{ isEdit ? 'Save Changes' : 'Submit Batch' }}</span>
            </button>
          </div>
        }
      </div>

      <!-- =====================================================================
           PSD PAYMENT SUCCESS (cannot be dismissed: it opens Step 2 by itself)
           ===================================================================== -->
      <app-action-modal
        [isOpen]="showSuccessModal()"
        accentBarClass="bg-navy"
        [showCloseButton]="false"
        [closeOnBackdrop]="false"
        maxWidthClass="max-w-md"
        primaryLabel=""
        secondaryLabel=""
        (close)="keepOpen()"
      >
        <div class="text-center space-y-5">
          <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 text-navy flex items-center justify-center shadow-inner ring-4 ring-slate-50">
            <app-icon name="check" size="2xl" [stroke]="3" />
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 m-0">Payment Successful</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
              Performance Security Deposit of <strong class="text-slate-900">{{ psdAmountText }}</strong> has been paid.
            </p>
          </div>

          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2.5">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Transaction ID</span>
              <span class="tabular-nums font-semibold text-slate-800 text-xs">{{ transactionId() }}</span>
            </div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span class="text-slate-500 text-[11px] font-medium">Paid On</span>
              <span class="font-semibold text-slate-800 text-xs">{{ paymentTimestamp() }}</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="font-bold text-slate-700 text-xs">Amount Paid</span>
              <span class="font-black text-navy text-sm">{{ psdAmountText }}</span>
            </div>
          </div>

          <p class="flex items-center justify-center gap-2 text-xs text-slate-500 m-0" role="status">
            <span class="inline-block w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-navy animate-spin" aria-hidden="true"></span>
            Taking you to Step 2...
          </p>
        </div>
      </app-action-modal>
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
  private allocationService = inject(IpaAllocationService);
  private receiptPdf = inject(BatchReceiptPdfService);

  readonly wizardSteps: StepperStep[] = [{ label: 'PSD Payment' }, { label: 'Batch Details' }];
  readonly psdAmountText = formatInr(PSD_AMOUNT, { fractionDigits: 2 });
  readonly psdAmountInWords = PSD_AMOUNT_IN_WORDS;

  /** Active step: 1 for the PSD payment, 2 for the batch details. */
  currentStep = signal<number>(1);
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  /** Turns on the field messages after the first submit attempt. */
  submitted = signal<boolean>(false);

  /**
   * The PSD is taken once per SDC, with its first batch. False only when the SDC has already paid it, in which case
   * the form is the batch details only.
   */
  needsPsd = true;
  /** True once the PSD details of this SDC (transaction, receipt) are known, so the receipt can be downloaded. */
  paymentRecorded = signal<boolean>(false);

  isPaying = signal<boolean>(false);
  isPaymentCompleted = signal<boolean>(false);

  /** The PSD was paid just now, in this form: the payment step cannot be reopened, so Back is hidden. */
  get justPaid(): boolean {
    return this.needsPsd && this.isPaymentCompleted();
  }

  hasPaymentDetails(): boolean {
    return this.paymentRecorded();
  }
  showSuccessModal = signal<boolean>(false);
  transactionId = signal<string>('');
  receiptNumber = signal<string>('');
  paymentTimestamp = signal<string>('');

  /** Step 1 shows as done once the PSD is paid. */
  readonly completedWizardSteps = computed(() => (this.isPaymentCompleted() ? [1] : []));

  /** Context identifiers */
  sdcId = signal<string>('');
  sdcCode = signal<string>('');
  sdcName = signal<string>('');
  tpName = signal<string>('Company 1');
  scheme = signal<string>('');
  sector = signal<string>('');

  /** Id of the batch being edited ('' when a new batch is being created). */
  private editId = '';
  readonly editedBatchCode = signal<string>('');
  /** Aspirants already registered in the batch being edited; the batch size cannot go below this. */
  private editRegistered = 0;
  /** Course details saved on the batch, used while the Course Master has no such course. */
  private recordInfo: (CourseInfo & { name: string }) | null = null;

  /** True on the Edit Batch page, which is this same form filled with the batch. */
  get isEdit(): boolean {
    return !!this.editId;
  }

  /** Batches the centre already has and the most it can run (its target in batches of 30 trainees). */
  batchesRegistered = 0;
  batchLimit = Number.POSITIVE_INFINITY;

  /** Every batch the target allows is already registered, so no more can be created. */
  get limitReached(): boolean {
    return this.batchesRegistered >= this.batchLimit;
  }

  /** True when the centre has IPA allocations: the course then comes from the IPA, not the catalogue. */
  ipaMode = false;
  /** IPA courses the centre may run now (a course whose batches are all used is not listed). */
  ipaCourseOptions: string[] = [];
  ipaCourseLabel = '';
  private readonly ipaSlotByLabel = new Map<string, string>();
  /** Courses of the centre's sector (centres without an IPA allocation). */
  courseOptions: string[] = [];

  /** Valid courses of the Course Master; the hours, QP code and version of the selected course come from here. */
  private readonly courseMaster = signal<CourseMasterItem[]>([]);
  private selectedCourse: SelectedCourse | null = null;
  courseInfo: CourseInfo | null = null;

  /** At least one camera is required, so the list starts with one row to fill in. */
  cameraList: CameraItem[] = [createCameraRow()];
  cameraErrors: string[] = [];

  constructor() {
    inject(DataEngineService)
      .for<CourseMasterItem>('COURSES')
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: list => {
          this.courseMaster.set(list.filter(c => c.status !== 'Inactive'));
          this.refreshCourseOptions();
          this.applyCourseInfo();
        },
        error: () => {
          // The course catalogue and the IPA durations are used when the Course Master cannot be read.
        }
      });
  }

  facultyErrors: boolean[] = [false];

  /** The batch: PSD payment fields, sector (from the centre or the IPA) and the batch parameters. */
  batchData: BatchFormData = {
    psdFee: PSD_AMOUNT,
    psdPaymentStatus: 'PENDING',
    psdPaymentMode: '',
    psdPaymentRef: '',
    psdPaymentDate: '',
    sector: '',
    course: '',
    batchDurationHours: 0,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    approvedBatchStrength: 0,
    remarks: ''
  };

  /** Faculty and hostel lists start with one empty row to fill in. */
  facultyList: FacultyItem[] = [createFacultyRow()];
  hostelList: HostelItem[] = [createInitialHostelRow()];

  ngOnInit(): void {
    const editing = this.route.snapshot.paramMap.get('id');
    if (editing) {
      this.startEdit(editing);
      return;
    }

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['sdcId']) this.sdcId.set(params['sdcId']);
      if (params['sdcCode']) this.sdcCode.set(params['sdcCode']);
      if (params['sdcName']) this.sdcName.set(params['sdcName']);
      if (params['scheme']) this.scheme.set(params['scheme']);
      if (params['sector']) this.sector.set(params['sector']);
    });

    const sdc = this.sdcService.getSdcById(this.sdcId());
    if (sdc) {
      this.sdcName.set(sdc.sdcName);
      this.sdcCode.set(sdc.sdcCode);
      this.tpName.set(sdc.tpName);
      this.scheme.set(sdc.scheme);
      if (sdc.sector) this.sector.set(sdc.sector);
    }
    this.batchData.sector = this.sector();

    // The target allows only so many batches of up to 30 trainees; no more can be created once they are all registered.
    if (sdc) {
      this.batchLimit = maxBatchesFor(sdcTarget(sdc));
      this.batchesRegistered = this.batchService
        .getBatchesBySdc(sdc.id)
        .filter(b => b.status !== 'REJECTED' && b.status !== 'CANCELLED').length;
      if (this.limitReached) {
        this.errorMessage.set(
          `All ${this.batchLimit} batches allowed for this center's target of ${sdcTarget(sdc)} are already registered.`
        );
      }
    }

    // A centre with IPA allocations runs only the courses and batches its approved allocations allow.
    this.ipaMode = this.allocationService.forSdc(this.sdcId()).length > 0;
    if (this.ipaMode) {
      this.buildIpaCourseOptions();
      this.batchData.sector = '';
      if (this.ipaCourseOptions.length === 0) {
        this.errorMessage.set(
          'No IPA course is open for this centre: its IPA allocation is not approved yet, or every batch has been used.'
        );
      }
    } else {
      this.refreshCourseOptions();
    }

    // The PSD is taken once per SDC, with the first batch made through this form; after that the SDC goes straight to the batch details.
    // It is judged by the PSD payment saved on the SDC, not by sample batches the SDC may already have.
    const earlier = sdc?.psdPayment;
    if (earlier) {
      this.needsPsd = false;
      this.transactionId.set(earlier.transactionId);
      this.receiptNumber.set(earlier.receiptNumber);
      this.paymentTimestamp.set(earlier.paidAt);
      this.paymentRecorded.set(true);
      this.markPaid(earlier.paymentMode, earlier.paidDate);
      this.currentStep.set(2);
    } else {
      this.transactionId.set(generateTransactionId());
      this.receiptNumber.set(generateReceiptNumber());
      this.paymentTimestamp.set(formatDateTime(new Date()));
    }
  }

  // ---- Edit mode ------------------------------------------------------------------------------

  /** Fills the form with the batch to edit. Only a batch returned by the department can be edited; any other goes back to the list. Saving sends it for approval again. */
  private startEdit(id: string): void {
    const batch = this.batchService.getBatchById(id);
    if (!batch || !canEditBatch(batch)) {
      this.router.navigate(['/batches']);
      return;
    }

    this.editId = id;
    this.editedBatchCode.set(batch.batchCode);
    this.editRegistered = registeredCount(batch);
    const sdc = this.sdcService.getSdcById(batch.sdcId);
    this.sdcId.set(batch.sdcId);
    this.sdcCode.set(batch.sdcCode);
    this.sdcName.set(batch.sdcName);
    this.tpName.set(batch.tpName);
    this.scheme.set(sdc?.scheme ?? batch.scheme);
    this.sector.set(batch.sector);

    // The PSD of the center is not part of an edit.
    this.needsPsd = false;
    this.paymentRecorded.set(!!sdc?.psdPayment);
    this.isPaymentCompleted.set(true);
    this.currentStep.set(2);
    this.batchLimit = Number.POSITIVE_INFINITY;

    this.batchData.sector = batch.sector;
    this.batchData.course = batch.courseName || batch.course || '';
    this.batchData.startDate = batch.startDate || batch.batchStartDate || '';
    this.batchData.endDate = batch.endDate || batch.batchEndDate || '';
    this.batchData.startTime = toTimeInput(batch.startTime || batch.batchStartTime);
    this.batchData.endTime = toTimeInput(batch.endTime || batch.batchEndTime);
    this.batchData.approvedBatchStrength = batch.approvedBatchStrength || batch.maxStrength || 0;
    this.batchData.remarks = batch.remarks ?? '';

    // A batch made under an IPA keeps its IPA course; any other batch keeps the courses of its sector.
    this.ipaMode = !!(batch.ipaAllocationId && batch.ipaCourseRowId);
    if (this.ipaMode) {
      this.batchData.ipaSlot = `${batch.ipaAllocationId}|${batch.ipaCourseRowId}`;
      this.ipaCourseLabel = `${batch.courseName} (${batch.sector}) · IPA ${batch.nipaNo ?? ''}`.trim();
    } else {
      this.refreshCourseOptions();
    }

    // The course details saved on the batch show until the Course Master answers for the course.
    const practicalText = String(batch.practicalHours ?? '');
    this.recordInfo = {
      name: this.batchData.course,
      qpCode: batch.qpCode ?? '',
      version: batch.courseVersion ?? '',
      nsqfLevel: '',
      theoryHours: batch.theoryHours ?? null,
      practicalHours: batch.practicalHours ?? null,
      practicalText,
      softSkillHours: batch.softSkillHours ?? null,
      totalHours: batch.totalHours || batch.batchDurationHours || 0,
      fromMaster: true
    };
    this.selectedCourse = { name: this.batchData.course, code: batch.qpCode, fallbackHours: this.recordInfo.totalHours };
    this.applyCourseInfo();

    this.facultyList = (batch.faculty ?? []).map(f => ({
      ssoId: f.ssoId ?? '',
      facultyName: f.facultyName ?? f.name ?? '',
      trainerType: f.trainerType ?? f.type ?? 'Primary Trainer',
      qualification: f.qualification ?? DEFAULT_QUALIFICATION
    }));
    if (this.facultyList.length === 0) this.facultyList = [createFacultyRow()];
    this.facultyErrors = this.facultyList.map(() => false);

    this.cameraList = (batch.cameras ?? []).map(c => ({ ...c }));
    if (this.cameraList.length === 0) this.cameraList = [createCameraRow()];

    const hostels = batch.hostels && batch.hostels.length > 0 ? batch.hostels : batch.hostel ? [batch.hostel] : [];
    this.hostelList = hostels.map(h => ({
      hostelAddress: h.hostelAddress ?? h.address ?? '',
      hostelCode: h.hostelCode ?? h.code ?? '',
      type: h.type ?? h.hostelType ?? 'Boys',
      capacity: h.capacity ?? 0
    }));
    if (this.hostelList.length === 0) this.hostelList = [createInitialHostelRow()];
  }

  /** Saves the edited batch (the batch code, center and PSD do not change). */
  private saveEdit(): void {
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
      this.hostelList,
      this.cameraList
    );
    const info = this.courseInfo;
    const updates: Partial<BatchRecord> = {
      sector: dto.sector,
      courseName: dto.courseName,
      course: dto.course,
      startDate: dto.startDate,
      batchStartDate: dto.startDate,
      endDate: dto.endDate,
      batchEndDate: dto.endDate,
      startTime: dto.startTime,
      batchStartTime: dto.startTime,
      endTime: dto.endTime,
      batchEndTime: dto.endTime,
      approvedBatchStrength: dto.approvedBatchStrength,
      maxStrength: dto.approvedBatchStrength,
      remarks: dto.remarks,
      faculty: dto.faculty,
      cameras: dto.cameras,
      hostels: dto.hostels,
      hostel: dto.hostels?.[0]
    };
    if (info) {
      Object.assign(updates, {
        batchDurationHours: info.totalHours,
        totalHours: info.totalHours,
        qpCode: info.qpCode || undefined,
        courseVersion: info.version || undefined,
        theoryHours: info.theoryHours ?? undefined,
        practicalHours: info.practicalHours ?? undefined,
        softSkillHours: info.softSkillHours ?? undefined
      });
    }
    updates.freezeDate = freezeDateOf({ startDate: dto.startDate });
    this.batchService.updateBatch(this.editId, updates);
    // The corrections go back to the department straight away.
    this.batchService.submitForApproval(this.editId);
    this.router.navigate(['/batches']);
  }

  // ---- Step 1: PSD payment --------------------------------------------------------------------

  /** Takes the PSD (dummy gateway for now), shows the success screen and then opens Step 2. */
  payPsd(): void {
    if (this.isPaying() || this.isPaymentCompleted()) return;
    this.isPaying.set(true);
    setTimeout(() => {
      this.isPaying.set(false);
      this.transactionId.set(generateTransactionId());
      this.receiptNumber.set(generateReceiptNumber());
      this.paymentTimestamp.set(formatDateTime(new Date()));
      const paidDate = toIsoDateOnly(new Date());
      this.paymentRecorded.set(true);
      this.markPaid('Online Payment', paidDate);
      // Saved on the SDC straight away, so the PSD is not asked again for this SDC even if this batch is not finished.
      if (this.sdcId()) {
        this.sdcService.recordPsdPayment(this.sdcId(), {
          amount: PSD_AMOUNT,
          transactionId: this.transactionId(),
          receiptNumber: this.receiptNumber(),
          paymentMode: 'Online Payment',
          paidAt: this.paymentTimestamp(),
          paidDate
        });
      }
      this.showSuccessModal.set(true);
      // The success screen cannot be dismissed: it carries the partner on to Step 2 by itself.
      setTimeout(() => {
        this.showSuccessModal.set(false);
        this.currentStep.set(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, PSD_SUCCESS_REDIRECT_MS);
    }, 600);
  }

  private markPaid(mode: string, paidDate: string): void {
    this.batchData.psdFee = PSD_AMOUNT;
    this.batchData.psdPaymentStatus = 'SUCCESS';
    this.batchData.psdPaymentRef = this.paymentRecorded() ? this.transactionId() : '';
    this.batchData.psdPaymentMode = mode;
    this.batchData.psdPaymentDate = paidDate;
    this.isPaymentCompleted.set(true);
  }

  /** Step 1 cannot be reopened once paid, and Step 2 cannot be opened before. */
  goToStep(step: number): void {
    if (!this.needsPsd) return;
    if (step < 2 && this.isPaymentCompleted()) return;
    if (step >= 2 && !this.isPaymentCompleted()) {
      this.errorMessage.set('Please pay the PSD before entering the batch details.');
      return;
    }
    this.errorMessage.set('');
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** The success screen cannot be dismissed (Escape included). */
  keepOpen(): void {
    // intentionally empty
  }

  downloadPaymentReceipt(): void {
    this.receiptPdf.download({
      receiptNumber: this.receiptNumber(),
      transactionId: this.transactionId(),
      paymentTimestamp: this.paymentTimestamp(),
      paymentMethod: this.batchData.psdPaymentMode,
      tpName: this.tpName(),
      sdcCode: this.sdcCode(),
      sdcName: this.sdcName(),
      scheme: this.scheme(),
      sector: this.batchData.sector
    });
  }

  // ---- Step 2: batch details ------------------------------------------------------------------

  /** The IPA courses of the centre's approved allocations that still have a batch left. */
  private buildIpaCourseOptions(): void {
    this.ipaSlotByLabel.clear();
    for (const allocation of this.allocationService.approvedForSdc(this.sdcId())) {
      for (const course of allocation.courses) {
        const used = this.allocationService.usedCycles(allocation.id, course.courseRowId);
        if (used >= course.cycles) continue;
        const label = `${course.courseName} (${course.sector}) · IPA ${allocation.ipaNumber} · batch ${used + 1} of ${course.cycles}`;
        this.ipaSlotByLabel.set(label, `${allocation.id}|${course.courseRowId}`);
      }
    }
    this.ipaCourseOptions = [...this.ipaSlotByLabel.keys()];
  }

  /** Fills the batch from the IPA course picked: the IPA fixes the sector, course, duration and trainees per batch. */
  onIpaCourseSelected(label: string): void {
    const slot = this.ipaSlotByLabel.get(label);
    const [allocationId, courseRowId] = (slot ?? '').split('|');
    const course = this.allocationService.getById(allocationId)?.courses.find(c => c.courseRowId === courseRowId);
    if (!slot || !course) return;
    this.ipaCourseLabel = label;
    this.batchData.ipaSlot = slot;
    this.batchData.sector = course.sector;
    this.batchData.course = course.courseName;
    this.sector.set(course.sector);
    // The hours and codes come from the Course Master; the IPA duration is the fallback.
    this.selectedCourse = { name: course.courseName, code: course.courseCode, fallbackHours: course.durationHours };
    this.applyCourseInfo();
    // A batch size typed before cannot be above what the IPA allows for this course.
    this.batchData.approvedBatchStrength = Math.min(this.batchData.approvedBatchStrength, this.maxBatchSize());
  }

  /** Centre without an IPA allocation: the details follow the course picked. */
  onCourseSelected(name: string): void {
    this.batchData.course = name;
    const found = getCoursesForSector(this.batchData.sector).find(c => c.courseName === name);
    this.selectedCourse = { name, fallbackHours: found?.defaultDurationHours };
    this.applyCourseInfo();
  }

  /** The batch size the training partner types; it cannot go above 30 (or what the IPA allows for the course). */
  onBatchSize(text: string): void {
    const size = Math.floor(Number(text));
    this.batchData.approvedBatchStrength = Number.isFinite(size) && size > 0 ? size : 0;
  }

  /** A batch needs at least 12 trainees to be sent for approval, so it cannot be created smaller than that. */
  protected minBatchSize(): number {
    return Math.min(MIN_TRAINEES_PER_BATCH, this.maxBatchSize());
  }

  protected maxBatchSize(): number {
    const { course } = this.pickedIpaCourse();
    return this.ipaMode && course ? Math.min(MAX_TRAINEES_PER_BATCH, course.approvedTrainees) : MAX_TRAINEES_PER_BATCH;
  }

  /** Course Master record of a course: by QP code first, then by name; a valid version is preferred over an expired one. */
  private masterFor(name: string, code?: string): CourseMasterItem | undefined {
    const same = (a?: string, b?: string): boolean => (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
    const matches = this.courseMaster().filter(c => (!!code && same(c.jobRoleCode, code)) || same(c.jobRoleName, name));
    const current = matches.filter(c => !isLapsed(c));
    const pool = current.length > 0 ? current : matches;
    return pool[pool.length - 1];
  }

  /** Works out the hours, QP code, version and NSQF level of the selected course from the Course Master. */
  private applyCourseInfo(): void {
    const picked = this.selectedCourse;
    if (!picked) {
      this.courseInfo = null;
      this.batchData.batchDurationHours = 0;
      return;
    }
    const master = this.masterFor(picked.name, picked.code);
    if (master) {
      const practicalText = String(master.practicalOjtDurationHours ?? '');
      this.courseInfo = {
        qpCode: master.jobRoleCode,
        version: master.version,
        nsqfLevel: master.nsqfLevel,
        theoryHours: typeof master.theoryDurationHours === 'number' ? master.theoryDurationHours : null,
        practicalHours: sumHours(practicalText),
        practicalText: practicalText.includes('+') ? `${practicalText} = ${sumHours(practicalText)}` : practicalText,
        softSkillHours: master.itSoftSkillTrainingHours ?? null,
        totalHours: Number(master.totalQpHours) || 0,
        fromMaster: true
      };
    } else if (this.recordInfo && this.recordInfo.name === picked.name) {
      // The batch's own saved details, until another course is picked.
      this.courseInfo = this.recordInfo;
    } else if (picked.fallbackHours) {
      this.courseInfo = {
        qpCode: picked.code ?? '',
        version: '',
        nsqfLevel: '',
        theoryHours: null,
        practicalHours: null,
        practicalText: '',
        softSkillHours: null,
        totalHours: picked.fallbackHours,
        fromMaster: false
      };
    } else {
      this.courseInfo = null;
    }
    this.batchData.batchDurationHours = this.courseInfo?.totalHours ?? 0;
  }

  /** A field of the course details for a read-only box. */
  protected info(key: 'qpCode' | 'version' | 'nsqfLevel' | 'totalHours' | 'theoryHours' | 'practicalText' | 'softSkillHours'): string {
    const value = this.courseInfo?.[key];
    return value == null || value === '' || value === 0 ? '—' : String(value);
  }

  /** The courses of the sector that can be offered: the Course Master's valid courses, or the catalogue if it has none. */
  private refreshCourseOptions(): void {
    if (this.ipaMode) return;
    const sector = this.batchData.sector.trim().toLowerCase();
    const names = this.courseMaster()
      .filter(c => c.sector.trim().toLowerCase() === sector && !isLapsed(c))
      .map(c => c.jobRoleName);
    const unique = names.filter((n, i) => names.indexOf(n) === i).sort((a, b) => a.localeCompare(b));
    this.courseOptions = unique.length > 0 ? unique : getCoursesForSector(this.batchData.sector).map(c => c.courseName);
    // The course the batch already has stays selectable even if the list no longer carries it.
    const current = this.batchData.course;
    if (this.isEdit && current && !this.courseOptions.includes(current)) this.courseOptions = [current, ...this.courseOptions];
  }

  setField(key: 'startDate' | 'endDate' | 'startTime' | 'endTime' | 'remarks', value: string): void {
    this.batchData[key] = value;
  }

  protected strengthText(): string {
    return this.batchData.approvedBatchStrength ? String(this.batchData.approvedBatchStrength) : '';
  }

  /** The IPA allocation course picked for the batch, and how many batches of it are already made. */
  private pickedIpaCourse() {
    const [allocationId, courseRowId] = (this.batchData.ipaSlot ?? '').split('|');
    const allocation = this.allocationService.getById(allocationId);
    const course = allocation?.courses.find(c => c.courseRowId === courseRowId);
    return {
      allocation,
      course,
      used: course ? this.allocationService.usedCycles(allocationId, courseRowId) : 0
    };
  }

  /** Field messages (empty until the first submit attempt). */
  fieldErrors(): Record<string, string> {
    if (!this.submitted()) return {};
    const errors = { ...validateBatchDetails(this.batchData, this.facultyList).formErrors };
    // The duration comes from the course, so a missing course is reported on the course field only.
    delete errors['batchDurationHours'];
    if (this.ipaMode) {
      // The IPA course decides the course, so the one message goes on the IPA course field.
      delete errors['course'];
      const { course, used } = this.pickedIpaCourse();
      // An edited batch already holds its own place in the IPA course, so only a new batch is checked against what is left.
      if (!this.isEdit) {
        if (!course) errors['ipaSlot'] = 'Select the IPA course for this batch.';
        else if (used >= course.cycles) errors['ipaSlot'] = 'All batches of this IPA course are used.';
      }
    }
    const size = this.batchData.approvedBatchStrength;
    const max = this.maxBatchSize();
    const min = this.minBatchSize();
    if (!size || size < 1) errors['batchSize'] = 'Enter the batch size.';
    else if (this.isEdit && size < this.editRegistered) errors['batchSize'] = `Batch size cannot be below the ${this.editRegistered} aspirants already registered.`;
    else if (size < min) errors['batchSize'] = `Batch size must be at least ${min}.`;
    else if (size > max) errors['batchSize'] = `Batch size can be at most ${max}.`;
    return errors;
  }

  addCamera(): void {
    this.cameraList.push(createCameraRow());
  }

  removeCamera(index: number): void {
    if (this.cameraList.length <= 1) return;
    this.cameraList.splice(index, 1);
    this.cameraErrors.splice(index, 1);
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
      this.router.navigate(['/sdcs']);
    }
  }

  submitBatchForm(): void {
    this.errorMessage.set('');
    this.submitted.set(true);

    const validation = validateBatchDetails(this.batchData, this.facultyList);
    this.facultyErrors = validation.facultyErrors;
    const hasFieldError = Object.keys(this.fieldErrors()).length > 0;
    this.cameraErrors = validateCameras(this.cameraList);
    const cameraProblem = this.cameraErrors.some(message => !!message);

    if (this.limitReached) {
      this.errorMessage.set(`All ${this.batchLimit} batches allowed for this center are already registered.`);
      return;
    }
    if (!this.isPaymentCompleted()) {
      this.errorMessage.set('Please pay the PSD before creating the batch.');
      return;
    }
    if (validation.hasError || hasFieldError || cameraProblem) {
      this.errorMessage.set(`Please fill all mandatory highlighted fields before ${this.isEdit ? 'saving' : 'submitting'}.`);
      setTimeout(() => document.getElementById('batch-form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }

    if (this.isEdit) {
      this.saveEdit();
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
        this.hostelList,
        this.cameraList
      );

      // The hours, QP code and version worked out from the Course Master; the batch size is what the partner typed.
      const info = this.courseInfo;
      if (info) {
        Object.assign(dto, {
          batchDurationHours: info.totalHours,
          totalHours: info.totalHours,
          qpCode: info.qpCode || undefined,
          courseVersion: info.version || undefined,
          theoryHours: info.theoryHours ?? undefined,
          practicalHours: info.practicalHours ?? undefined,
          softSkillHours: info.softSkillHours ?? undefined
        });
      }
      Object.assign(dto, { minStrength: Math.min(15, this.batchData.approvedBatchStrength) });

      const { allocation, course, used } = this.pickedIpaCourse();
      if (this.ipaMode && allocation && course) {
        Object.assign(dto, {
          ipaId: allocation.ipaId,
          ipaAllocationId: allocation.id,
          ipaCourseRowId: course.courseRowId,
          cycleNo: used + 1,
          costPerBatch: course.costPerBatch,
          nipaNo: allocation.ipaNumber
        });
      }

      this.batchService.createBatch(dto);
      this.router.navigate(['/batches']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to submit batch application.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
