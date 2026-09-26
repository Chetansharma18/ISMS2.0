import { Component, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import { FileDoc } from '../../models/otr-form.model';
import { DocumentViewerModalComponent } from '../../../../shared/components/document-viewer-modal/document-viewer-modal.component';

@Component({
  selector: 'app-step5-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentViewerModalComponent],
  template: `
    <div class="w-full space-y-5 font-sans bg-white pb-6">

      <!-- ====================================================================
           PREVIEW HEADER: Clean Top Bar with Single Edit Option
           ==================================================================== -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 class="text-base sm:text-lg font-bold text-[#0B3558] m-0">
            Preview &amp; Submit
          </h1>
          <p class="text-[11px] sm:text-xs text-slate-500 m-0 mt-0.5">
            Review all details filled in the form from beginning to end before submitting.
          </p>
        </div>

        <!-- Single Edit Option -->
        <button
          type="button"
          (click)="onEditStep(1)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0B3558]/30 text-[#0B3558] hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          title="Edit filled details"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Edit Details</span>
        </button>
      </div>

      <!-- ====================================================================
           CONTINUOUS DETAILS: All Answers from Start to End (Single Heading, No Sub-Steps)
           ==================================================================== -->
      <div class="space-y-4 text-xs text-slate-800">

        <!-- Unified Answers Grid: Organization, Authorized Signatory, Bank Details -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">TP/PIA Short Name</span>
            <span class="font-semibold text-slate-800">{{ step1().shortName || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px] font-medium">TP/PIA Full Name</span>
            <span class="font-semibold text-slate-800">{{ step1().fullName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Nature of Entity</span>
            <span class="font-semibold text-slate-800">{{ step1().natureOfEntity || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Registration Number</span>
            <span class="font-mono font-medium text-slate-800">{{ step1().registrationNumber || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Date of Registration</span>
            <span class="font-medium text-slate-800">{{ step1().dateOfRegistration || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">State of Legal Reg.</span>
            <span class="font-medium text-slate-800">{{ step1().stateOfLegalReg || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Company PAN</span>
            <span class="font-mono font-semibold text-slate-800">{{ step1().companyPan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">GST Registered</span>
            <span class="font-medium text-slate-800">{{ step1().gstRegistered }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">GSTIN</span>
            <span class="font-mono font-medium text-slate-800">{{ step1().gstRegistered === 'Yes' ? (step1().gstin || '-') : 'Not Applicable' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">MSME Registered</span>
            <span class="font-medium text-slate-800">{{ step1().msmeRegistered }}</span>
          </div>
          @if (step1().msmeRegistered === 'Yes') {
            <div>
              <span class="text-slate-400 block text-[11px] font-medium">Udyam Registration No.</span>
              <span class="font-mono font-medium text-slate-800">{{ step1().udyamNumber || '-' }}</span>
            </div>
          }
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">NSDC Partner Status</span>
            <span class="font-medium text-slate-800">{{ step1().nsdcPartner || 'Not Applicable' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Blacklisted by Govt / PSU</span>
            <span class="font-medium" [class.text-rose-600]="step1().blackListed === 'Yes'">{{ step1().blackListed }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Contact Number</span>
            <span class="font-medium text-slate-800">{{ step1().contactNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Email ID</span>
            <span class="font-medium text-slate-800">{{ step1().emailId || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Official Website</span>
            <span class="font-medium text-slate-800">{{ step1().website || '-' }}</span>
          </div>
          <div class="sm:col-span-3">
            <span class="text-slate-400 block text-[11px] font-medium">Registered Office Address</span>
            <span class="font-medium text-slate-800">{{ registeredAddressDisplay() }}</span>
          </div>
          <div class="sm:col-span-3">
            <span class="text-slate-400 block text-[11px] font-medium">Corporate / Branch Office Address</span>
            <span class="font-medium text-slate-800">{{ officeAddressDisplay() }}</span>
          </div>

          <!-- Authorized Person Fields -->
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Authorized Person Name</span>
            <span class="font-semibold text-slate-800">{{ step3().name || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Authorized Designation</span>
            <span class="font-medium text-slate-800">{{ step3().designation || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Date of Birth</span>
            <span class="font-medium text-slate-800">{{ step3().dob || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Age</span>
            <span class="font-medium text-slate-800">{{ step3().age || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Mobile No.</span>
            <span class="font-medium text-slate-800">{{ step3().mobileNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Email ID</span>
            <span class="font-medium text-slate-800">{{ step3().emailId || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">PAN</span>
            <span class="font-mono font-medium text-slate-800">{{ step3().pan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Aadhaar No.</span>
            <span class="font-mono font-medium text-slate-800">{{ step3().aadhaarNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Bhamashah No.</span>
            <span class="font-medium text-slate-800">{{ step3().bhamashahNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Voter ID No.</span>
            <span class="font-medium text-slate-800">{{ step3().voterIdNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Passport No.</span>
            <span class="font-medium text-slate-800">{{ step3().passportNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">State</span>
            <span class="font-medium text-slate-800">{{ step3().state || '-' }}</span>
          </div>
          <div class="sm:col-span-6">
            <span class="text-slate-400 block text-[11px] font-medium">Residence Address</span>
            <span class="font-medium text-slate-800">{{ step3().residenceAddress || '-' }}</span>
          </div>

          <!-- Bank Details Fields -->
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Name of the Bank</span>
            <span class="font-semibold text-slate-800">{{ step4().bankName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Branch Name</span>
            <span class="font-medium text-slate-800">{{ step4().branchName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Account Type</span>
            <span class="font-medium text-slate-800">{{ step4().accountType || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Mode of Transfer</span>
            <span class="font-medium text-slate-800">{{ step4().transferMode || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-400 block text-[11px] font-medium">Account Holder Name</span>
            <span class="font-semibold text-slate-800">{{ step4().accountHolderName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Account Number</span>
            <span class="font-mono font-semibold text-slate-800">{{ step4().accountNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">IFSC Code</span>
            <span class="font-mono font-semibold text-slate-800">{{ step4().ifscCode || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px] font-medium">MICR Code</span>
            <span class="font-mono font-medium text-slate-800">{{ step4().micrCode || '-' }}</span>
          </div>
          <div class="sm:col-span-3">
            <span class="text-slate-400 block text-[11px] font-medium">Branch Address</span>
            <span class="font-medium text-slate-800">{{ step4().branchAddress || '-' }}</span>
          </div>
        </div>

        <!-- Details of Officer(s) In-Charge Table -->
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[#0B3558] font-semibold text-[11px]">
                <th class="py-2.5 px-3 w-10">#</th>
                <th class="py-2.5 px-3">Officer Name</th>
                <th class="py-2.5 px-3">Designation</th>
                <th class="py-2.5 px-3">Contact Details</th>
                <th class="py-2.5 px-3">Identity Numbers</th>
                <th class="py-2.5 px-3">Attached Documents</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (oic of step2(); track oic.id; let idx = $index) {
                <tr class="hover:bg-slate-50/50">
                  <td class="py-2.5 px-3 font-semibold text-slate-500">{{ idx + 1 }}</td>
                  <td class="py-2.5 px-3 font-bold text-slate-800">{{ oic.name || '-' }}</td>
                  <td class="py-2.5 px-3 text-slate-700">{{ oic.designation || '-' }}</td>
                  <td class="py-2.5 px-3 text-slate-700 space-y-0.5">
                    <div><span class="text-slate-400">Mob:</span> {{ oic.mobileNo || '-' }}</div>
                    <div><span class="text-slate-400">Email:</span> {{ oic.emailId || '-' }}</div>
                  </td>
                  <td class="py-2.5 px-3 text-slate-700 font-mono text-[11px] space-y-0.5">
                    <div><span class="text-slate-400 font-sans">PAN:</span> {{ oic.pan || '-' }}</div>
                    <div><span class="text-slate-400 font-sans">Aadhaar:</span> {{ oic.aadhaarNo || '-' }}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="flex flex-col gap-1">
                      @if (oic.appointmentLetterDoc) {
                        <button
                          type="button"
                          (click)="previewDoc(oic.appointmentLetterDoc, 'OIC Appointment Letter')"
                          class="text-[11px] text-[#0483AC] hover:underline font-medium text-left cursor-pointer flex items-center gap-1"
                        >
                          <svg class="w-3 h-3 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                          </svg>
                          <span>Appt. Letter</span>
                        </button>
                      }
                      @if (oic.idProofDoc) {
                        <button
                          type="button"
                          (click)="previewDoc(oic.idProofDoc, 'OIC Identity Proof')"
                          class="text-[11px] text-[#0483AC] hover:underline font-medium text-left cursor-pointer flex items-center gap-1"
                        >
                          <svg class="w-3 h-3 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                          </svg>
                          <span>ID Proof</span>
                        </button>
                      }
                      @if (!oic.appointmentLetterDoc && !oic.idProofDoc) {
                        <span class="text-slate-400 text-[11px]">-</span>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Attached Verification Documents -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-600 font-medium truncate">Certificate of Registration:</span>
            <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().registrationCertDoc, title: 'Certificate of Registration' }"></ng-container>
          </div>

          <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-600 font-medium truncate">Company PAN Doc:</span>
            <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().panCardDoc, title: 'Company PAN Card' }"></ng-container>
          </div>

          @if (step1().gstRegistered === 'Yes') {
            <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-600 font-medium truncate">GST Certificate:</span>
              <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().gstCertDoc, title: 'GST Registration Certificate' }"></ng-container>
            </div>
          }

          @if (step1().msmeRegistered === 'Yes') {
            <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-600 font-medium truncate">Udyam Certificate:</span>
              <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().msmeCertDoc, title: 'MSME Udyam Certificate' }"></ng-container>
            </div>
          }

          <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-600 font-medium truncate">Authorization Letter:</span>
            <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step3().authorizationLetterDoc, title: 'Authorization Letter' }"></ng-container>
          </div>

          <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-600 font-medium truncate">Auth Signatory ID Proof:</span>
            <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step3().idProofDoc, title: 'Authorized Person Identity Proof' }"></ng-container>
          </div>

          <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2 sm:col-span-2 lg:col-span-1">
            <span class="text-[11px] text-slate-600 font-medium truncate">Bank Cheque / Passbook:</span>
            <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step4().cancelledChequeDoc, title: 'Bank Cancelled Cheque' }"></ng-container>
          </div>
        </div>

      </div>

      <!-- ====================================================================
           STATUTORY DECLARATION
           ==================================================================== -->
      <div class="p-4 bg-amber-50/80 border border-amber-200 rounded-lg">
        <label class="flex items-start gap-2.5 cursor-pointer text-xs sm:text-[13px] text-slate-900 leading-relaxed select-none">
          <input
            id="statutory-declaration-checkbox"
            type="checkbox"
            [ngModel]="declarationAgreed()"
            (ngModelChange)="onDeclarationChange($event)"
            class="mt-0.5 w-4 h-4 text-[#0483AC] border-slate-300 rounded focus:ring-1 focus:ring-[#0483AC] accent-[#0483AC] shrink-0"
          />
          <span class="font-medium">
            I hereby solemnly declare and affirm that all the particulars and documents provided above are true, complete, and correct to the best of my knowledge and belief. I acknowledge that any false or misleading statement will render my application liable for rejection.
          </span>
        </label>
      </div>

      <!-- ====================================================================
           BOTTOM ACTION BAR: DOWNLOAD COMPLETE DETAILS IN PDF (TABULAR FORMAT)
           ==================================================================== -->
      <div class="pt-3 pb-1 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-xs text-slate-500">
          Download a complete, official tabular PDF copy of all submitted answers.
        </div>

        <button
          type="button"
          (click)="downloadPdf()"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0483AC] hover:bg-[#036c8f] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Details (PDF)</span>
        </button>
      </div>

      <!-- ====================================================================
           REUSABLE DOCUMENT BADGE + VIEW ACTION TEMPLATE
           ==================================================================== -->
      <ng-template #docBadgeTemplate let-doc="doc" let-title="title">
        @if (doc && doc.status === 'uploaded') {
          <div class="inline-flex items-center gap-2">
            <!-- PDF Icon & File details -->
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 rounded text-xs shadow-2xs">
              <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <rect width="24" height="24" rx="3" fill="#E5252A"/>
                <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
              </svg>
              <span class="font-medium text-slate-800 max-w-[130px] truncate" [title]="doc.fileName">{{ doc.fileName }}</span>
              <span class="text-slate-400 text-[10px]">({{ doc.fileSize }})</span>
            </div>

            <!-- View Action Button -->
            <button
              type="button"
              (click)="previewDoc(doc, title)"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer shadow-2xs"
              title="Preview {{ doc.fileName }}"
            >
              <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View</span>
            </button>
          </div>
        } @else {
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Not Uploaded
          </span>
        }
      </ng-template>

      <!-- Document Preview Modal Dialog -->
      <app-document-viewer-modal
        [isOpen]="isViewerOpen()"
        [doc]="activeDoc()"
        [title]="activeDocTitle()"
        (close)="closeViewer()"
      ></app-document-viewer-modal>

    </div>
  `
})
export class Step5PreviewComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly step1 = computed(() => this.otrFormService.step1());
  readonly step2 = computed(() => this.otrFormService.step2()); // OIC list
  readonly step3 = computed(() => this.otrFormService.step3()); // Authorized Person
  readonly step4 = computed(() => this.otrFormService.step4()); // Bank Details
  readonly declarationAgreed = computed(() => this.otrFormService.step5DeclarationAgreed());

  readonly isStep1Valid = computed(() => this.validationService.validateStep1(this.step1()).length === 0);
  readonly isStep2Valid = computed(() => this.validationService.validateStep2(this.step2()).length === 0);
  readonly isStep3Valid = computed(() => this.validationService.validateStep3(this.step3()).length === 0);
  readonly isStep4Valid = computed(() => this.validationService.validateStep4(this.step4()).length === 0);

  readonly isAllValid = computed(() => {
    return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid() && this.isStep4Valid();
  });

  readonly registeredAddressDisplay = computed(() => {
    const s = this.step1();
    const parts: string[] = [];
    if (s.registeredAddress?.trim()) parts.push(s.registeredAddress.trim());
    if (s.registeredDistrict?.trim()) parts.push(s.registeredDistrict.trim());
    if (s.registeredState?.trim()) parts.push(s.registeredState.trim());
    let str = parts.join(', ');
    if (s.registeredPincode?.trim()) str += (str ? ' - ' : '') + s.registeredPincode.trim();
    return str || '-';
  });

  readonly officeAddressDisplay = computed(() => {
    const s = this.step1();
    if (s.sameAsRegistered) {
      return 'Same as Registered Office Address';
    }
    const parts: string[] = [];
    if (s.officeAddress?.trim()) parts.push(s.officeAddress.trim());
    if (s.officeDistrict?.trim()) parts.push(s.officeDistrict.trim());
    if (s.officeState?.trim()) parts.push(s.officeState.trim());
    let str = parts.join(', ');
    if (s.officePincode?.trim()) str += (str ? ' - ' : '') + s.officePincode.trim();
    return str || '-';
  });

  editStep = output<number>();

  isViewerOpen = signal<boolean>(false);
  activeDoc = signal<FileDoc | null>(null);
  activeDocTitle = signal<string>('');

  onEditStep(step: number): void {
    this.editStep.emit(step);
  }

  onDeclarationChange(agreed: boolean): void {
    this.otrFormService.setStep5Declaration(agreed);
  }

  previewDoc(doc: FileDoc, title?: string): void {
    this.activeDoc.set(doc);
    this.activeDocTitle.set(title || doc.fileName);
    this.isViewerOpen.set(true);
  }

  closeViewer(): void {
    this.isViewerOpen.set(false);
    this.activeDoc.set(null);
  }

  downloadPdf(): void {
    const s1 = this.step1();
    const s2 = this.step2(); // OIC list
    const s3 = this.step3(); // Auth Person
    const s4 = this.step4(); // Bank Details

    const printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
      window.print();
      return;
    }

    const regAddress = this.registeredAddressDisplay();
    const officeAddress = this.officeAddressDisplay();

    // Construct Officer in Charge tabular rows
    const oicRows = (s2 && s2.length > 0)
      ? s2.map((o, idx) => `
        <tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="font-weight:700;">${o.name || '-'}</td>
          <td>${o.designation || '-'}</td>
          <td>${o.mobileNo || '-'}</td>
          <td>${o.emailId || '-'}</td>
          <td style="font-family:monospace;">${o.pan || '-'}</td>
          <td style="font-family:monospace;">${o.aadhaarNo || '-'}</td>
          <td>${idx === 0 ? 'Primary Nodal Officer' : 'Additional Officer'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="8" style="text-align:center;color:#64748b;padding:8px;">No Officer Details Provided</td></tr>';

    // Construct Uploaded Documents Checklist rows
    const docs = [
      { name: 'Certificate of Registration', doc: s1.registrationCertDoc },
      { name: 'Company PAN Card', doc: s1.panCardDoc },
      ...(s1.gstRegistered === 'Yes' ? [{ name: 'GST Registration Certificate', doc: s1.gstCertDoc }] : []),
      ...(s1.msmeRegistered === 'Yes' ? [{ name: 'MSME Udyam Certificate', doc: s1.msmeCertDoc }] : []),
      { name: 'Authorization Letter / Board Resolution', doc: s3.authorizationLetterDoc },
      { name: 'Authorized Signatory Identity Proof', doc: s3.idProofDoc },
      ...s2.map((o, i) => ({ name: `Officer #${i + 1} Appointment Letter (${o.name || 'OIC'})`, doc: o.appointmentLetterDoc })),
      ...s2.map((o, i) => ({ name: `Officer #${i + 1} ID Proof (${o.name || 'OIC'})`, doc: o.idProofDoc })),
      { name: 'Bank Cancelled Cheque / Passbook Copy', doc: s4.cancelledChequeDoc }
    ];

    const docRows = docs.map((d, idx) => {
      const isUp = d.doc && d.doc.status === 'uploaded';
      return `
        <tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="font-weight:600;">${d.name}</td>
          <td>${isUp ? d.doc!.fileName : '<span style="color:#94a3b8;">-</span>'}</td>
          <td style="text-align:center;">${isUp ? d.doc!.fileSize : '<span style="color:#94a3b8;">-</span>'}</td>
          <td style="text-align:center;font-weight:600;color:${isUp ? '#15803d' : '#94a3b8'};">
            ${isUp ? 'Attached' : 'Not Attached'}
          </td>
        </tr>
      `;
    }).join('');

    const printDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>ISMS 2.0 - OTR Application Details Summary</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              font-family: Arial, Helvetica, sans-serif;
            }
            body {
              margin: 0;
              padding: 16px;
              background: #ffffff;
              color: #0f172a;
              font-size: 11px;
              line-height: 1.4;
            }
            .pdf-header {
              border-bottom: 2px solid #0B3558;
              padding-bottom: 8px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .gov-subhead {
              font-size: 9.5px;
              font-weight: 700;
              color: #0483AC;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .gov-mainhead {
              font-size: 15px;
              font-weight: 800;
              color: #0B3558;
              margin-top: 2px;
            }
            .gov-docname {
              font-size: 11.5px;
              font-weight: 700;
              color: #334155;
              margin-top: 3px;
            }
            .meta-block {
              text-align: right;
              font-size: 9.5px;
              color: #64748b;
            }
            .sec-header {
              background: #0B3558;
              color: #ffffff;
              font-size: 10.5px;
              font-weight: 700;
              padding: 5px 8px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin-top: 12px;
              border-radius: 3px 3px 0 0;
            }
            table.tbl {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              border: 1px solid #cbd5e1;
              margin-bottom: 4px;
            }
            table.tbl th {
              background: #f1f5f9;
              color: #0B3558;
              font-weight: 700;
              padding: 5px 6px;
              text-align: left;
              border: 1px solid #cbd5e1;
            }
            table.tbl td {
              padding: 4.5px 6px;
              border: 1px solid #cbd5e1;
              vertical-align: top;
            }
            table.tbl td.lbl {
              background: #f8fafc;
              color: #475569;
              font-weight: 600;
              width: 22%;
            }
            table.tbl td.val {
              color: #0f172a;
              font-weight: 500;
              width: 28%;
            }
            .declaration-card {
              margin-top: 14px;
              padding: 8px 10px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              page-break-inside: avoid;
            }
            .declaration-title {
              font-weight: 700;
              color: #0B3558;
              font-size: 10px;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .declaration-text {
              font-size: 9.5px;
              color: #334155;
              line-height: 1.45;
            }
            .sign-row {
              display: flex;
              justify-content: space-between;
              margin-top: 24px;
              padding-top: 8px;
              page-break-inside: avoid;
            }
            .sign-col {
              text-align: center;
              font-size: 9.5px;
              color: #475569;
              min-width: 180px;
            }
            .sign-line {
              border-top: 1px solid #94a3b8;
              margin-bottom: 4px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-header">
            <div>
              <div class="gov-subhead">GOVERNMENT OF RAJASTHAN • RSLDC</div>
              <div class="gov-mainhead">INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)</div>
              <div class="gov-docname">ONE TIME REGISTRATION (OTR) - APPLICATION DETAILS PREVIEW</div>
            </div>
            <div class="meta-block">
              <div><strong>Generated Date:</strong> ${printDate}</div>
              <div><strong>Status:</strong> Application Preview / Draft</div>
            </div>
          </div>

          <!-- 1. Organization & Legal Particulars Table -->
          <div class="sec-header">1. Organization &amp; Legal Particulars</div>
          <table class="tbl">
            <tr>
              <td class="lbl">TP/PIA Full Name:</td>
              <td class="val" colspan="3" style="font-weight:700;">${s1.fullName || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">TP/PIA Short Name:</td>
              <td class="val">${s1.shortName || '-'}</td>
              <td class="lbl">Nature of Entity:</td>
              <td class="val">${s1.natureOfEntity || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Registration Number:</td>
              <td class="val" style="font-family:monospace;">${s1.registrationNumber || '-'}</td>
              <td class="lbl">Date of Registration:</td>
              <td class="val">${s1.dateOfRegistration || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">State of Legal Reg.:</td>
              <td class="val">${s1.stateOfLegalReg || '-'}</td>
              <td class="lbl">Company PAN:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s1.companyPan || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">GST Registered:</td>
              <td class="val">${s1.gstRegistered} ${s1.gstRegistered === 'Yes' ? '(' + (s1.gstin || '-') + ')' : ''}</td>
              <td class="lbl">MSME Registered:</td>
              <td class="val">${s1.msmeRegistered} ${s1.msmeRegistered === 'Yes' ? '(' + (s1.udyamNumber || '-') + ')' : ''}</td>
            </tr>
            <tr>
              <td class="lbl">NSDC Partner Status:</td>
              <td class="val">${s1.nsdcPartner || 'Not Applicable'}</td>
              <td class="lbl">Blacklisted by Govt/PSU:</td>
              <td class="val">${s1.blackListed}</td>
            </tr>
            <tr>
              <td class="lbl">Official Contact No.:</td>
              <td class="val">${s1.contactNo || '-'}</td>
              <td class="lbl">Official Email ID:</td>
              <td class="val">${s1.emailId || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Official Website:</td>
              <td class="val" colspan="3">${s1.website || '-'}</td>
            </tr>
          </table>

          <!-- 2. Address Particulars Table -->
          <div class="sec-header">2. Official Address Details</div>
          <table class="tbl">
            <tr>
              <td class="lbl" style="width:25%;">Registered Office Address:</td>
              <td class="val" style="width:75%;">${regAddress}</td>
            </tr>
            <tr>
              <td class="lbl" style="width:25%;">Corporate / Branch Address:</td>
              <td class="val" style="width:75%;">${officeAddress}</td>
            </tr>
          </table>

          <!-- 3. Authorized Person Details Table -->
          <div class="sec-header">3. Authorized Signatory Particulars</div>
          <table class="tbl">
            <tr>
              <td class="lbl">Full Name:</td>
              <td class="val" style="font-weight:700;">${s3.name || '-'}</td>
              <td class="lbl">Designation:</td>
              <td class="val">${s3.designation || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Date of Birth:</td>
              <td class="val">${s3.dob || '-'}</td>
              <td class="lbl">Age:</td>
              <td class="val">${s3.age || '-'} Years</td>
            </tr>
            <tr>
              <td class="lbl">Mobile Number:</td>
              <td class="val">${s3.mobileNo || '-'}</td>
              <td class="lbl">Email Address:</td>
              <td class="val">${s3.emailId || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">PAN:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s3.pan || '-'}</td>
              <td class="lbl">Aadhaar Number:</td>
              <td class="val" style="font-family:monospace;">${s3.aadhaarNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Bhamashah Number:</td>
              <td class="val">${s3.bhamashahNo || '-'}</td>
              <td class="lbl">Voter ID Number:</td>
              <td class="val">${s3.voterIdNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Passport Number:</td>
              <td class="val">${s3.passportNo || '-'}</td>
              <td class="lbl">Domicile / State:</td>
              <td class="val">${s3.state || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Residence Address:</td>
              <td class="val" colspan="3">${s3.residenceAddress || '-'}</td>
            </tr>
          </table>

          <!-- 4. Officer(s) In-Charge Table -->
          <div class="sec-header">4. Officer(s) In-Charge Details</div>
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">#</th>
                <th>Officer Name</th>
                <th>Designation</th>
                <th>Mobile No.</th>
                <th>Email ID</th>
                <th>PAN</th>
                <th>Aadhaar No.</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${oicRows}
            </tbody>
          </table>

          <!-- 5. Bank Account Details Table -->
          <div class="sec-header">5. Bank Account &amp; Settlement Details</div>
          <table class="tbl">
            <tr>
              <td class="lbl">Name of the Bank:</td>
              <td class="val" style="font-weight:700;">${s4.bankName || '-'}</td>
              <td class="lbl">Branch Name:</td>
              <td class="val">${s4.branchName || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Account Holder Name:</td>
              <td class="val" style="font-weight:600;">${s4.accountHolderName || '-'}</td>
              <td class="lbl">Account Number:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s4.accountNo || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Account Type:</td>
              <td class="val">${s4.accountType || '-'}</td>
              <td class="lbl">Transfer Mode:</td>
              <td class="val">${s4.transferMode || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">IFSC Code:</td>
              <td class="val" style="font-family:monospace;font-weight:700;">${s4.ifscCode || '-'}</td>
              <td class="lbl">MICR Code:</td>
              <td class="val" style="font-family:monospace;">${s4.micrCode || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Branch Address:</td>
              <td class="val" colspan="3">${s4.branchAddress || '-'}</td>
            </tr>
          </table>

          <!-- 6. Uploaded Documents Verification Checklist Table -->
          <div class="sec-header">6. Attached Verification Documents Checklist</div>
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:25px;text-align:center;">#</th>
                <th>Document Description</th>
                <th>Uploaded File Name</th>
                <th style="width:75px;text-align:center;">File Size</th>
                <th style="width:90px;text-align:center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${docRows}
            </tbody>
          </table>

          <!-- Statutory Declaration -->
          <div class="declaration-card">
            <div class="declaration-title">Solemn Declaration &amp; Affirmation</div>
            <div class="declaration-text">
              I hereby solemnly declare and affirm that all the particulars and documents provided above are true, complete, and correct to the best of my knowledge and belief. I acknowledge that any false or misleading statement will render my application liable for rejection.
            </div>
          </div>

          <!-- Signature Block -->
          <div class="sign-row">
            <div class="sign-col" style="text-align:left;">
              <div>Date: ${printDate}</div>
              <div>Place: _____________________</div>
            </div>
            <div class="sign-col">
              <div style="height:35px;"></div>
              <div class="sign-line"></div>
              <div><strong>Signature of Authorized Signatory</strong></div>
              <div>(Name: ${s3.name || 'Authorized Signatory'})</div>
            </div>
            <div class="sign-col">
              <div style="height:35px;"></div>
              <div class="sign-line"></div>
              <div><strong>Seal of the Organization</strong></div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}
