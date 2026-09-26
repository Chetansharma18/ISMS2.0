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
    <div class="w-full space-y-6 font-sans">

      <!-- ====================================================================
           SECTION 1: STEP 1 - ORGANIZATION DETAILS
           ==================================================================== -->
      <section class="w-full bg-white pb-5 mb-5 border-b border-slate-200/70 last:border-b-0 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 class="text-sm sm:text-base font-bold text-slate-800">
              Step 1 – Organization Details
            </h3>
          </div>
          <button
            type="button"
            (click)="onEditStep(1)"
            class="text-xs text-[#0483AC] hover:text-[#036c8f] hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Entity & Compliance Info Grid -->
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
          </div>

          <!-- Financial Years Table -->
          @if (step1().financialYears && step1().financialYears.length > 0) {
            <div class="pt-2 border-t border-slate-100">
              <div class="border border-slate-200 rounded-md overflow-hidden">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-[#F4F7FB] text-slate-700 text-[10.5px] font-semibold border-b border-slate-200">
                      <th class="py-1.5 px-3 border-r border-slate-200">Financial Year</th>
                      <th class="py-1.5 px-3 border-r border-slate-200">Total Turnover (₹ Lacs)</th>
                      <th class="py-1.5 px-3">Skill Turnover (₹ Lacs)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (fy of step1().financialYears; track fy.year) {
                      <tr class="bg-white">
                        <td class="py-1.5 px-3 text-xs font-medium text-slate-700 border-r border-slate-100">{{ fy.year }}</td>
                        <td class="py-1.5 px-3 text-xs text-slate-700 border-r border-slate-100">{{ fy.totalTurnover || '-' }}</td>
                        <td class="py-1.5 px-3 text-xs text-slate-700">{{ fy.skillTurnover || '-' }}</td>
                      </tr>
                    }
                    <!-- Average Row -->
                    <tr class="bg-slate-50 border-t-2 border-slate-200">
                      <td class="py-1.5 px-3 text-xs font-semibold text-slate-700 border-r border-slate-100">3-Year Average</td>
                      <td class="py-1.5 px-3 text-xs font-semibold text-[#174A6E] border-r border-slate-100">{{ avgTotalTurnover() }} Lacs</td>
                      <td class="py-1.5 px-3 text-xs font-semibold text-[#174A6E]">{{ avgSkillTurnover() }} Lacs</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Uploaded Documents -->
          <div class="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-600 font-medium truncate">Certificate of Registration:</span>
              <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().registrationCertDoc, title: 'Certificate of Registration' }"></ng-container>
            </div>

            <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-600 font-medium truncate">Company PAN Doc:</span>
              <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().panCardDoc, title: 'Company PAN Card' }"></ng-container>
            </div>

            @if (step1().gstRegistered === 'Yes') {
              <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
                <span class="text-[11px] text-slate-600 font-medium truncate">GST Certificate:</span>
                <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().gstCertDoc, title: 'GST Registration Certificate' }"></ng-container>
              </div>
            }

            @if (step1().msmeRegistered === 'Yes') {
              <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
                <span class="text-[11px] text-slate-600 font-medium truncate">Udyam Certificate:</span>
                <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().msmeCertDoc, title: 'MSME Udyam Certificate' }"></ng-container>
              </div>
            }

            @if (step1().financialYears && step1().financialYears.length > 0) {
              <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
                <span class="text-[11px] text-slate-600 font-medium truncate">Turnover Certificate:</span>
                <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step1().turnoverCertDoc, title: 'Turnover Certificate' }"></ng-container>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ====================================================================
           SECTION 2: STEP 2 - AUTHORIZED PERSON DETAILS
           ==================================================================== -->
      <section class="w-full bg-white pb-5 mb-5 border-b border-slate-200/70 last:border-b-0 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h3 class="text-sm sm:text-base font-bold text-slate-800">
              Step 2 – Authorized Person Details
            </h3>
          </div>
          <button
            type="button"
            (click)="onEditStep(2)"
            class="text-xs text-[#0483AC] hover:text-[#036c8f] hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <div>
              <span class="text-slate-400 block text-[11px] font-medium">Authorized Person Name</span>
              <span class="font-semibold text-slate-800">{{ step3().name || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px] font-medium">Designation</span>
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
            <div class="sm:col-span-2">
              <span class="text-slate-400 block text-[11px] font-medium">Residence Address</span>
              <span class="font-medium text-slate-800">{{ step3().residenceAddress || '-' }}</span>
            </div>
          </div>

          <!-- Authorized Person Documents -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
            <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-600 font-medium truncate">Authorization Letter / Resolution:</span>
              <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step3().authorizationLetterDoc, title: 'Authorization Letter' }"></ng-container>
            </div>

            <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-600 font-medium truncate">Identity Proof:</span>
              <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step3().idProofDoc, title: 'Authorized Person Identity Proof' }"></ng-container>
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           SECTION 3: STEP 3 - OFFICER(S) IN-CHARGE
           ==================================================================== -->
      <section class="w-full bg-white pb-5 mb-5 border-b border-slate-200/70 last:border-b-0 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h3 class="text-sm sm:text-base font-bold text-slate-800">
              Step 3 – Details of Officer In-Charge ({{ step2().length }} Officer{{ step2().length > 1 ? 's' : '' }})
            </h3>
          </div>
          <button
            type="button"
            (click)="onEditStep(3)"
            class="text-xs text-[#0483AC] hover:text-[#036c8f] hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <div class="space-y-4 divide-y divide-slate-100 text-xs">
          @for (oic of step2(); track oic.id; let idx = $index) {
            <div class="space-y-3" [class.pt-4]="idx > 0">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-2 font-bold text-slate-800">
                  <span class="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] flex items-center justify-center">
                    {{ idx + 1 }}
                  </span>
                  <span>{{ oic.name || 'Officer ' + (idx + 1) }}</span>
                  @if (oic.designation) {
                    <span class="font-normal text-slate-500">&bull; {{ oic.designation }}</span>
                  }
                </span>
                <span class="text-[11px] text-slate-400 font-medium">
                  {{ idx === 0 ? 'Primary Nodal Officer' : 'Additional Officer' }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
                <div>
                  <span class="text-slate-400 block text-[11px] font-medium">Designation</span>
                  <span class="font-medium text-slate-800">{{ oic.designation || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px] font-medium">Mobile No.</span>
                  <span class="font-medium text-slate-800">{{ oic.mobileNo || '-' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-400 block text-[11px] font-medium">Email ID</span>
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
                <div>
                  <span class="text-slate-400 block text-[11px] font-medium">Bhamashah No.</span>
                  <span class="font-medium text-slate-800">{{ oic.bhamashahNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px] font-medium">Voter ID No.</span>
                  <span class="font-medium text-slate-800">{{ oic.voterIdNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[11px] font-medium">Passport No.</span>
                  <span class="font-medium text-slate-800">{{ oic.passportNo || '-' }}</span>
                </div>
              </div>

              <!-- Officer Documents Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
                  <span class="text-[11px] text-slate-600 font-medium truncate">Appointment Letter:</span>
                  <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: oic.appointmentLetterDoc, title: 'OIC Appointment Letter' }"></ng-container>
                </div>

                <div class="bg-slate-50/70 p-2.5 rounded border border-slate-200/80 flex items-center justify-between gap-2">
                  <span class="text-[11px] text-slate-600 font-medium truncate">Identity Proof:</span>
                  <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: oic.idProofDoc, title: 'OIC Identity Proof' }"></ng-container>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- ====================================================================
           SECTION 4: STEP 4 - BANK DETAILS
           ==================================================================== -->
      <section class="w-full bg-white pb-5 mb-5 border-b border-slate-200/70 last:border-b-0 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">4</span>
            <h3 class="text-sm sm:text-base font-bold text-slate-800">
              Step 4 – Bank Details
            </h3>
          </div>
          <button
            type="button"
            (click)="onEditStep(4)"
            class="text-xs text-[#0483AC] hover:text-[#036c8f] hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-3">
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
            <div class="sm:col-span-2 lg:col-span-4">
              <span class="text-slate-400 block text-[11px] font-medium">Branch Address</span>
              <span class="font-medium text-slate-800">{{ step4().branchAddress || '-' }}</span>
            </div>
          </div>

          <!-- Bank Verification Document -->
          <div class="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 bg-slate-50/70 p-2.5 rounded border border-slate-200/80">
            <span class="font-medium text-slate-700">Cancelled Cheque / Passbook Verification Document:</span>
            <ng-container *ngTemplateOutlet="docBadgeTemplate; context: { doc: step4().cancelledChequeDoc, title: 'Bank Cancelled Cheque' }"></ng-container>
          </div>
        </div>
      </section>

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
              <span class="font-medium text-slate-800 max-w-[140px] truncate" [title]="doc.fileName">{{ doc.fileName }}</span>
              <span class="text-slate-400 text-[10px]">({{ doc.fileSize }})</span>
            </div>

            <!-- View Action Button -->
            <button
              type="button"
              (click)="previewDoc(doc, title)"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer shadow-2xs"
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

  /** Computed 3-year average for Total Turnover (for preview display) */
  readonly avgTotalTurnover = computed(() => {
    const rows = this.step1().financialYears;
    if (!rows || !rows.length) return '0.00';
    const sum = rows.reduce((acc, r) => acc + (parseFloat(r.totalTurnover) || 0), 0);
    return (sum / rows.length).toFixed(2);
  });

  /** Computed 3-year average for Skill Turnover (for preview display) */
  readonly avgSkillTurnover = computed(() => {
    const rows = this.step1().financialYears;
    if (!rows || !rows.length) return '0.00';
    const sum = rows.reduce((acc, r) => acc + (parseFloat(r.skillTurnover) || 0), 0);
    return (sum / rows.length).toFixed(2);
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
}
