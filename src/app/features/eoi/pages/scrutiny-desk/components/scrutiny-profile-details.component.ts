import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { ApplicantResponse } from '../../../services/eoi-state.service';

/** Financial parameters, organisation profile, authorized signatory and bank details. */
@Component({
  selector: 'app-scrutiny-profile-details',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-4">

      <!-- Left Column: Financials & Organisation Particulars (5 of 12 columns) -->
      <div class="md:col-span-6 lg:col-span-5 md:pr-6 md:border-r border-slate-200 space-y-5">

        <!-- Financial Details Box (Matching Image 4 Layout) -->
        <div>
          <h2 class="text-base font-bold text-slate-900 mb-3">Financial Parameters</h2>

          <div class="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div class="grid grid-cols-2 divide-x divide-slate-200">
              <!-- EMD Fee -->
              <div class="pr-3">
                <span class="text-xs font-semibold text-slate-800 leading-tight block">EMD Fee</span>
                <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                  <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                    ₹{{ applicant()?.emdFee | number }}
                  </span>
                  <span class="text-[11px] text-emerald-700 font-semibold leading-none">(PAID)</span>
                </div>
                <span class="text-[10.5px] text-slate-400 mt-1 block">Government Statutory Deposit</span>
              </div>

              <!-- Processing Fee -->
              <div class="pl-4">
                <span class="text-xs font-semibold text-slate-800 leading-tight block">Processing Fee</span>
                <div class="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                  <span class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                    ₹{{ applicant()?.processingFee | number }}
                  </span>
                  <span class="text-[11px] text-emerald-700 font-semibold leading-none">(PAID)</span>
                </div>
                <span class="text-[10.5px] text-slate-400 mt-1 block">e-Challan / Cyber Treasury</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Organisation Particulars Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold text-slate-900 m-0">Organisation Profile</h2>
            <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              &check; OTR Verified
            </span>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs text-xs space-y-2.5">
            <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Legal Entity Name</span>
                <span class="font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.legalName }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Trade / Brand Name</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.tradeName }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Date &amp; State of Reg</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.dateOfRegistration }} ({{ applicant()?.organisation?.stateOfRegistration }})</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Declared Turnover</span>
                <span class="font-bold text-navy block text-xs mt-0.5">{{ applicant()?.organisation?.turnover }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Official Email</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5 truncate" [title]="applicant()?.organisation?.email">{{ applicant()?.organisation?.email }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Contact Phone</span>
                <span class="tabular-nums text-slate-800 block text-xs mt-0.5">{{ applicant()?.organisation?.contactNumber }}</span>
              </div>
            </div>

            <div>
              <span class="text-[11px] text-slate-400 block font-normal">Registered Office Address</span>
              <span class="font-normal text-slate-700 block text-xs mt-0.5 leading-snug">{{ applicant()?.organisation?.registeredAddress }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Signatory & Bank Details (7 of 12 columns) -->
      <div class="md:col-span-6 lg:col-span-7 space-y-5">

        <!-- Authorized Signatory Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold text-slate-900 m-0">Authorized Signatory</h2>
            <span class="text-xs text-slate-500 font-normal">Official Liaison Person</span>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs text-xs space-y-2.5">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-100">
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Full Name</span>
                <span class="font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.name }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Designation</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.designation }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Official Contact</span>
                <span class="tabular-nums text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.contactNumber }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-100">
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Official Email</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5 truncate" [title]="applicant()?.authorizedSignatory?.email">{{ applicant()?.authorizedSignatory?.email }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Signatory PAN</span>
                <span class="tabular-nums font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.pan }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Aadhaar Reference</span>
                <span class="tabular-nums text-slate-800 block text-xs mt-0.5">{{ applicant()?.authorizedSignatory?.aadhaarNo }}</span>
              </div>
            </div>

            <div>
              <span class="text-[11px] text-slate-400 block font-normal">Residence Address</span>
              <span class="font-normal text-slate-700 block text-xs mt-0.5 leading-snug">{{ applicant()?.authorizedSignatory?.residenceAddress }}, {{ applicant()?.authorizedSignatory?.state }}</span>
            </div>
          </div>
        </div>

        <!-- Bank & Mandate Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold text-slate-900 m-0">Bank &amp; Account Details</h2>
            <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              &check; Mandate Verified
            </span>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs text-xs space-y-2.5">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-100">
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Bank Name</span>
                <span class="font-semibold text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.bankName }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Branch</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.branchName }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Account Type</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.accountType }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Account Holder Name</span>
                <span class="font-medium text-slate-800 block text-xs mt-0.5">{{ applicant()?.bankDetails?.accountHolderName }}</span>
              </div>
              <div>
                <span class="text-[11px] text-slate-400 block font-normal">Account No. &amp; IFSC</span>
                <span class="tabular-nums font-bold text-slate-900 block text-xs mt-0.5">
                  {{ applicant()?.bankDetails?.accountNumber }} &bull; {{ applicant()?.bankDetails?.ifscCode }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class ScrutinyProfileDetailsComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
}
