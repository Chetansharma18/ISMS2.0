import { Component, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtrFormService } from '../../services/otr-form.service';
import { FileDoc } from '../../models/otr-form.model';
import { DocumentViewerModalComponent } from '../../../../shared/components/document-viewer-modal/document-viewer-modal.component';

@Component({
  selector: 'app-step5-preview',
  standalone: true,
  imports: [CommonModule, DocumentViewerModalComponent],
  template: `
    <div class="w-full space-y-6 font-sans bg-white pb-6">

      <!-- ====================================================================
           PREVIEW HEADER: Clean Top Bar
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
      </div>

      <!-- ====================================================================
           SECTION 1: ORGANIZATION DETAILS (STEP 1)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
              Organization Details
            </h2>
          </div>
          <button
            type="button"
            (click)="onEditStep(1)"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#0B3558]/30 text-[#0B3558] hover:bg-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            title="Edit Organization Details"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Details</span>
          </button>
        </div>

        <div class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3.5 text-xs">
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Name', value: step1().shortName, highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Full Name', value: step1().fullName, span: 'sm:col-span-2', highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Nature of Entity', value: step1().natureOfEntity }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Registration Number', value: step1().registrationNumber, mono: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Date of Registration', value: step1().dateOfRegistration }"></ng-container>

          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'State of Legal Reg.', value: step1().stateOfLegalReg }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Company PAN', value: step1().companyPan, mono: true, highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'GST Registered', value: step1().gstRegistered }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'GSTIN', value: step1().gstRegistered === 'Yes' ? (step1().gstin || '-') : 'Not Applicable', mono: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'MSME Registered', value: step1().msmeRegistered }"></ng-container>
          @if (step1().msmeRegistered === 'Yes') {
            <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Udyam Registration No.', value: step1().udyamNumber, mono: true }"></ng-container>
          }
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'NSDC Partner Status', value: step1().nsdcPartner || 'Not Applicable' }"></ng-container>

          <div>
            <span class="text-slate-400 block text-[11px] font-medium">Blacklisted by Govt / PSU</span>
            <span class="font-semibold text-xs" [class.text-rose-600]="step1().blackListed === 'Yes'" [class.text-emerald-700]="step1().blackListed === 'No'">
              {{ step1().blackListed }}
            </span>
          </div>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Contact Number', value: step1().contactNo }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Email ID', value: step1().emailId }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Official Website', value: step1().website, span: 'sm:col-span-3' }"></ng-container>

          <div class="col-span-2 sm:col-span-3">
            <span class="text-slate-400 block text-[11px] font-medium">Registered Office Address</span>
            <span class="font-medium text-slate-800 text-xs leading-relaxed">{{ registeredAddressDisplay() }}</span>
          </div>
          <div class="col-span-2 sm:col-span-3">
            <span class="text-slate-400 block text-[11px] font-medium">Corporate / Branch Office Address</span>
            <span class="font-medium text-slate-800 text-xs leading-relaxed">{{ officeAddressDisplay() }}</span>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           SECTION 2: AUTHORIZED PERSON DETAILS (STEP 2)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <h2 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
              Authorized Person Details
            </h2>
          </div>
          <button
            type="button"
            (click)="onEditStep(2)"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#0B3558]/30 text-[#0B3558] hover:bg-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            title="Edit Authorized Person Details"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Details</span>
          </button>
        </div>

        <div class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3.5 text-xs">
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Authorized Person Name', value: step3().name, highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Authorized Designation', value: step3().designation }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Date of Birth', value: step3().dob }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Age', value: step3().age ? (step3().age + ' Years') : '-' }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Mobile No.', value: step3().mobileNo }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Email ID', value: step3().emailId }"></ng-container>

          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'PAN', value: step3().pan, mono: true, highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Aadhaar No.', value: step3().aadhaarNo, mono: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Bhamashah No.', value: step3().bhamashahNo }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Voter ID No.', value: step3().voterIdNo }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Passport No.', value: step3().passportNo }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'State / Domicile', value: step3().state }"></ng-container>

          <div class="col-span-2 sm:col-span-3 lg:col-span-6">
            <span class="text-slate-400 block text-[11px] font-medium">Residence Address</span>
            <span class="font-medium text-slate-800 text-xs leading-relaxed">{{ step3().residenceAddress || '-' }}</span>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           SECTION 3: OFFICER(S) IN-CHARGE DETAILS (STEP 3)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <h2 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
              Officer(s) In-Charge Details
            </h2>
          </div>
          <button
            type="button"
            (click)="onEditStep(3)"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#0B3558]/30 text-[#0B3558] hover:bg-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            title="Edit Officer(s) In-Charge"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Details</span>
          </button>
        </div>

        <div class="p-4">
          <div class="overflow-x-auto border border-slate-200 rounded-lg">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-[#0B3558] font-semibold text-[11px]">
                  <th class="py-2.5 px-3 w-10">#</th>
                  <th class="py-2.5 px-3">Officer Name</th>
                  <th class="py-2.5 px-3">Designation</th>
                  <th class="py-2.5 px-3">Contact Details</th>
                  <th class="py-2.5 px-3">Identity Numbers</th>
                  <th class="py-2.5 px-3">Role</th>
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
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
                            [class.bg-sky-50]="idx === 0" [class.text-sky-800]="idx === 0" [class.border]="idx === 0" [class.border-sky-200]="idx === 0"
                            [class.bg-slate-100]="idx > 0" [class.text-slate-600]="idx > 0">
                        {{ idx === 0 ? 'Primary Nodal Officer' : 'Additional Officer' }}
                      </span>
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
        </div>
      </section>

      <!-- ====================================================================
           SECTION 4: BANK ACCOUNT DETAILS (STEP 4)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <h2 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
              Bank Account Details
            </h2>
          </div>
          <button
            type="button"
            (click)="onEditStep(4)"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#0B3558]/30 text-[#0B3558] hover:bg-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            title="Edit Bank Account Details"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Details</span>
          </button>
        </div>

        <div class="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3.5 text-xs">
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Name of the Bank', value: step4().bankName, highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Branch Name', value: step4().branchName }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Account Type', value: step4().accountType }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Mode of Transfer', value: step4().transferMode }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Account Holder Name', value: step4().accountHolderName, span: 'sm:col-span-2', highlight: true }"></ng-container>

          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'Account Number', value: step4().accountNo, mono: true, highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'IFSC Code', value: step4().ifscCode, mono: true, highlight: true }"></ng-container>
          <ng-container *ngTemplateOutlet="fieldTpl; context: { label: 'MICR Code', value: step4().micrCode, mono: true }"></ng-container>

          <div class="col-span-2 sm:col-span-3">
            <span class="text-slate-400 block text-[11px] font-medium">Branch Address</span>
            <span class="font-medium text-slate-800 text-xs leading-relaxed">{{ step4().branchAddress || '-' }}</span>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           SECTION 5: ATTACHED VERIFICATION DOCUMENTS
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold shrink-0">5</span>
            <h2 class="text-xs sm:text-sm font-bold text-[#0B3558] uppercase tracking-wide m-0">
              Attached Verification Documents
            </h2>
          </div>
        </div>

        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ng-container *ngTemplateOutlet="docCardTpl; context: { title: 'Certificate of Registration', doc: step1().registrationCertDoc }"></ng-container>
          <ng-container *ngTemplateOutlet="docCardTpl; context: { title: 'Company PAN Card', doc: step1().panCardDoc }"></ng-container>

          @if (step1().gstRegistered === 'Yes') {
            <ng-container *ngTemplateOutlet="docCardTpl; context: { title: 'GST Registration Certificate', doc: step1().gstCertDoc }"></ng-container>
          }

          @if (step1().msmeRegistered === 'Yes') {
            <ng-container *ngTemplateOutlet="docCardTpl; context: { title: 'MSME Udyam Certificate', doc: step1().msmeCertDoc }"></ng-container>
          }

          <ng-container *ngTemplateOutlet="docCardTpl; context: { title: 'Authorization Letter', doc: step3().authorizationLetterDoc }"></ng-container>
          <ng-container *ngTemplateOutlet="docCardTpl; context: { title: 'Auth Signatory ID Proof', doc: step3().idProofDoc }"></ng-container>
          <ng-container *ngTemplateOutlet="docCardTpl; context: { title: 'Bank Cheque / Passbook', doc: step4().cancelledChequeDoc }"></ng-container>
        </div>
      </section>

      <!-- ====================================================================
           REUSABLE TEMPLATES: FIELD DISPLAY & DOCUMENT BADGE
           ==================================================================== -->
      <ng-template #fieldTpl let-label="label" let-value="value" let-mono="mono" let-highlight="highlight" let-span="span">
        <div [class]="span ? span : ''">
          <span class="text-slate-400 block text-[11px] font-medium">{{ label }}</span>
          <span
            class="text-xs text-slate-800 break-words"
            [class.font-mono]="mono"
            [class.font-bold]="highlight"
            [class.font-semibold]="!highlight"
          >
            {{ value || '-' }}
          </span>
        </div>
      </ng-template>

      <ng-template #docCardTpl let-title="title" let-doc="doc">
        <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2.5">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] text-slate-500 font-medium block truncate" [title]="title">{{ title }}</span>
            @if (doc && doc.status === 'uploaded') {
              <div class="flex items-center gap-1.5 mt-0.5">
                <svg class="w-3.5 h-3.5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                </svg>
                <span class="text-xs font-semibold text-slate-800 truncate" [title]="doc.fileName">{{ doc.fileName }}</span>
                <span class="text-[10px] text-slate-400 shrink-0">({{ doc.fileSize }})</span>
              </div>
            } @else {
              <span class="text-xs text-slate-400 font-normal">Not Provided</span>
            }
          </div>

          <div class="shrink-0">
            @if (doc && doc.status === 'uploaded') {
              <button
                type="button"
                (click)="previewDoc(doc, title)"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Preview {{ title }}"
              >
                <svg class="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </button>
            } @else {
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                Not Uploaded
              </span>
            }
          </div>
        </div>
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

  readonly step1 = computed(() => this.otrFormService.step1());
  readonly step2 = computed(() => this.otrFormService.step2()); // OIC list
  readonly step3 = computed(() => this.otrFormService.step3()); // Authorized Person
  readonly step4 = computed(() => this.otrFormService.step4()); // Bank Details

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

  previewDoc(doc: FileDoc, title?: string): void {
    this.activeDoc.set(doc);
    this.activeDocTitle.set(title || doc.fileName);
    this.isViewerOpen.set(true);
  }

  closeViewer(): void {
    this.isViewerOpen.set(false);
    this.activeDoc.set(null);
  }
}
