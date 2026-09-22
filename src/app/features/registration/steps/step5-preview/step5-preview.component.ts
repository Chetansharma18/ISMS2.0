import { Component, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';

@Component({
  selector: 'app-step5-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-6">

      <!-- Header -->
      <div class="pb-3 border-b border-slate-200">
        <h2 class="text-base sm:text-lg font-bold text-slate-900">
          Application Review & Declaration
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Please verify all entered particulars before submitting your One Time Registration (OTR).
        </p>
      </div>

      <!-- Section 1 Review: Organization Details -->
      <div class="space-y-3 pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">
            Step 1 - Organization Details
          </h3>
          <button
            type="button"
            (click)="onEditStep(1)"
            class="text-xs text-slate-700 hover:text-slate-900 hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">TP/PIA Short Name</span>
            <span class="font-medium text-slate-800">{{ step1().shortName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">TP/PIA Full Name</span>
            <span class="font-medium text-slate-800">{{ step1().fullName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Nature of Entity</span>
            <span class="font-medium text-slate-800">{{ step1().natureOfEntity || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Registration Number of Entity (CIN / Registration No. / Other)</span>
            <span class="font-mono font-medium text-slate-800">{{ step1().registrationNumber || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Date of Registration as Legal Entity</span>
            <span class="font-medium text-slate-800">{{ step1().dateOfRegistration || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Company PAN</span>
            <span class="font-mono font-medium text-slate-800">{{ step1().companyPan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">GSTIN</span>
            <span class="font-medium text-slate-800">{{ step1().gstRegistered === 'Yes' ? step1().gstin : 'Not Applicable' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px] font-medium">Company Contact No. &amp; Company Email-ID</span>
            <span class="font-medium text-slate-800">{{ step1().contactNo || '-' }} &bull; {{ step1().emailId || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px] font-medium">Registered Address</span>
            <span class="font-medium text-slate-800">{{ step1().registeredAddress || '-' }}, {{ step1().registeredDistrict }}, {{ step1().registeredState }} - {{ step1().registeredPincode }}</span>
          </div>
        </div>
      </div>

      <!-- Section 2 Review: Officer In-Charge Details -->
      <div class="space-y-3 pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">
            Step 2 – Details of Officer In-Charge
          </h3>
          <button
            type="button"
            (click)="onEditStep(2)"
            class="text-xs text-slate-700 hover:text-slate-900 hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        @let oic = step2()[0] || {};
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Name</span>
            <span class="font-medium text-slate-800">{{ oic.name || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Designation</span>
            <span class="font-medium text-slate-800">{{ oic.designation || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Mobile No.</span>
            <span class="font-medium text-slate-800">{{ oic.mobileNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Email-ID</span>
            <span class="font-medium text-slate-800">{{ oic.emailId || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">PAN</span>
            <span class="font-mono font-medium text-slate-800">{{ oic.pan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Aadhaar No.</span>
            <span class="font-mono font-medium text-slate-800">{{ oic.aadhaarNo || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px] font-medium">OIC Appointment / Authorization Letter</span>
            <span class="font-medium text-slate-800">{{ oic.appointmentLetterDoc?.fileName || 'Not Uploaded' }}</span>
          </div>
        </div>
      </div>

      <!-- Section 3 Review: Authorized Signatory -->
      <div class="space-y-3 pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">
            Step 3 – Authorized Person Details
          </h3>
          <button
            type="button"
            (click)="onEditStep(3)"
            class="text-xs text-slate-700 hover:text-slate-900 hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Name</span>
            <span class="font-medium text-slate-800">{{ step3().name || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Designation</span>
            <span class="font-medium text-slate-800">{{ step3().designation || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Date of Birth</span>
            <span class="font-medium text-slate-800">{{ step3().dob || '-' }} @if (step3().age) { ({{ step3().age }} yrs) }</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">PAN</span>
            <span class="font-mono font-medium text-slate-800">{{ step3().pan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Mobile No.</span>
            <span class="font-medium text-slate-800">{{ step3().mobileNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Email-ID</span>
            <span class="font-medium text-slate-800">{{ step3().emailId || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Aadhaar No.</span>
            <span class="font-mono font-medium text-slate-800">{{ step3().aadhaarNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">State</span>
            <span class="font-medium text-slate-800">{{ step3().state || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px] font-medium">Authorization Letter / Board Resolution / Authority Document</span>
            <span class="font-medium text-slate-800">{{ step3().authorizationLetterDoc?.fileName || 'Not Uploaded' }}</span>
          </div>
        </div>
      </div>

      <!-- Section 4 Review: Bank Details -->
      <div class="space-y-3 pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">
            Step 4 – Bank Details
          </h3>
          <button
            type="button"
            (click)="onEditStep(4)"
            class="text-xs text-slate-700 hover:text-slate-900 hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Name of the Bank</span>
            <span class="font-medium text-slate-800">{{ step4().bankName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Branch Name</span>
            <span class="font-medium text-slate-800">{{ step4().branchName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Account Holder Name</span>
            <span class="font-medium text-slate-800">{{ step4().accountHolderName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Account No.</span>
            <span class="font-mono font-medium text-slate-800">{{ step4().accountNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">IFSC Code</span>
            <span class="font-mono font-medium text-slate-800">{{ step4().ifscCode || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Mode of Transfer</span>
            <span class="font-medium text-slate-800">{{ step4().transferMode || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px] font-medium">Upload Cancelled Cheque</span>
            <span class="font-medium text-slate-800">{{ step4().cancelledChequeDoc?.fileName || 'Not Uploaded' }}</span>
          </div>
        </div>
      </div>

      <!-- Statutory Declaration -->
      <div class="pt-2">
        <label class="flex items-start gap-2.5 cursor-pointer text-xs sm:text-[13px] text-slate-800 leading-relaxed select-none">
          <input
            id="statutory-declaration-checkbox"
            type="checkbox"
            [ngModel]="declarationAgreed()"
            (ngModelChange)="onDeclarationChange($event)"
            class="mt-1 w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-1 focus:ring-slate-700 accent-slate-800"
          />
          <span>
            I hereby solemnly declare and affirm that all the particulars and documents provided above are true, complete, and correct to the best of my knowledge and belief.
          </span>
        </label>
      </div>

    </div>
  `
})
export class Step5PreviewComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly step1 = computed(() => this.otrFormService.step1());
  readonly step2 = computed(() => this.otrFormService.step2());
  readonly step3 = computed(() => this.otrFormService.step3());
  readonly step4 = computed(() => this.otrFormService.step4());
  readonly declarationAgreed = computed(() => this.otrFormService.step5DeclarationAgreed());

  readonly isStep1Valid = computed(() => this.validationService.validateStep1(this.step1()).length === 0);
  readonly isStep2Valid = computed(() => this.validationService.validateStep2(this.step2()).length === 0);
  readonly isStep3Valid = computed(() => this.validationService.validateStep3(this.step3()).length === 0);
  readonly isStep4Valid = computed(() => this.validationService.validateStep4(this.step4()).length === 0);

  readonly isAllValid = computed(() => {
    return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid() && this.isStep4Valid();
  });

  editStep = output<number>();

  onEditStep(step: number): void {
    this.editStep.emit(step);
  }

  onDeclarationChange(agreed: boolean): void {
    this.otrFormService.setStep5Declaration(agreed);
  }
}
