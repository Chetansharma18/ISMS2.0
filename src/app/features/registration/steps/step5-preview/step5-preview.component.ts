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
            1. Organization Details
          </h3>
          <button
            type="button"
            (click)="onEditStep(1)"
            class="text-xs text-[#131862] hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px]">Short Name</span>
            <span class="font-medium text-slate-800">{{ step1().shortName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Full Legal Name</span>
            <span class="font-medium text-slate-800">{{ step1().fullName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Entity Nature</span>
            <span class="font-medium text-slate-800">{{ step1().natureOfEntity || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Registration / CIN</span>
            <span class="font-mono font-medium text-slate-800">{{ step1().registrationNumber || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Date of Registration</span>
            <span class="font-medium text-slate-800">{{ step1().dateOfRegistration || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Company PAN</span>
            <span class="font-mono font-medium text-slate-800">{{ step1().companyPan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">GSTIN</span>
            <span class="font-medium text-slate-800">{{ step1().gstRegistered === 'Yes' ? step1().gstin : 'Not Applicable' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Turn Over (₹ Lakhs)</span>
            <span class="font-medium text-slate-800">₹ {{ step1().turnOver || '0' }} Lakhs</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px]">Contact & Email</span>
            <span class="font-medium text-slate-800">{{ step1().contactNo || '-' }} &bull; {{ step1().emailId || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px]">Registered Address</span>
            <span class="font-medium text-slate-800">{{ step1().registeredAddress || '-' }}, {{ step1().registeredDistrict }}, {{ step1().registeredState }} - {{ step1().registeredPincode }}</span>
          </div>
        </div>
      </div>

      <!-- Section 2 Review: Officer In-Charge Directory -->
      <div class="space-y-3 pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">
            2. Officer In-Charge Directory ({{ step2().length }} Officer{{ step2().length > 1 ? 's' : '' }})
          </h3>
          <button
            type="button"
            (click)="onEditStep(2)"
            class="text-xs text-[#131862] hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border border-slate-200">
            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th class="py-2 px-3">#</th>
                <th class="py-2 px-3">Name</th>
                <th class="py-2 px-3">Designation</th>
                <th class="py-2 px-3">Mobile</th>
                <th class="py-2 px-3">Email</th>
                <th class="py-2 px-3">PAN</th>
                <th class="py-2 px-3">Appointment Document</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (oic of step2(); track oic.id; let idx = $index) {
                <tr>
                  <td class="py-2 px-3 text-slate-500">{{ idx + 1 }}</td>
                  <td class="py-2 px-3 font-medium text-slate-800">{{ oic.name || '-' }}</td>
                  <td class="py-2 px-3 text-slate-700">{{ oic.designation || '-' }}</td>
                  <td class="py-2 px-3 text-slate-700">{{ oic.mobileNo || '-' }}</td>
                  <td class="py-2 px-3 text-slate-700">{{ oic.emailId || '-' }}</td>
                  <td class="py-2 px-3 font-mono text-slate-700">{{ oic.pan || '-' }}</td>
                  <td class="py-2 px-3 text-slate-600">{{ oic.appointmentLetterDoc?.fileName || 'Not Uploaded' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3 Review: Authorized Signatory -->
      <div class="space-y-3 pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">
            3. Authorized Signatory
          </h3>
          <button
            type="button"
            (click)="onEditStep(3)"
            class="text-xs text-[#131862] hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px]">Full Name</span>
            <span class="font-medium text-slate-800">{{ step3().name || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Designation</span>
            <span class="font-medium text-slate-800">{{ step3().designation || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Date of Birth</span>
            <span class="font-medium text-slate-800">{{ step3().dob || '-' }} @if (step3().age) { ({{ step3().age }} yrs) }</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Personal PAN</span>
            <span class="font-mono font-medium text-slate-800">{{ step3().pan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Mobile Number</span>
            <span class="font-medium text-slate-800">{{ step3().mobileNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Official Email</span>
            <span class="font-medium text-slate-800">{{ step3().emailId || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px]">Board Authorization Letter</span>
            <span class="font-medium text-slate-800">{{ step3().authorizationLetterDoc?.fileName || 'Not Uploaded' }}</span>
          </div>
        </div>
      </div>

      <!-- Section 4 Review: Bank Details -->
      <div class="space-y-3 pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">
            4. Bank & PFMS Details
          </h3>
          <button
            type="button"
            (click)="onEditStep(4)"
            class="text-xs text-[#131862] hover:underline font-semibold cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px]">Bank Name</span>
            <span class="font-medium text-slate-800">{{ step4().bankName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Branch Name</span>
            <span class="font-medium text-slate-800">{{ step4().branchName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Account Holder Name</span>
            <span class="font-medium text-slate-800">{{ step4().accountHolderName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Account Number</span>
            <span class="font-mono font-medium text-slate-800">{{ step4().accountNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">IFSC Code</span>
            <span class="font-mono font-medium text-slate-800">{{ step4().ifscCode || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Transfer Mode</span>
            <span class="font-medium text-slate-800">{{ step4().transferMode || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px]">Cancelled Cheque / Passbook</span>
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
            class="mt-1 w-4 h-4 text-[#131862] border-slate-300 rounded focus:ring-1 focus:ring-[#131862]"
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
