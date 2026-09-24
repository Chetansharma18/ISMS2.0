import { Component, Input, Output, EventEmitter, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OtrFormService } from '../../../features/registration/services/otr-form.service';
import { OfficerInCharge } from '../../../features/registration/models/otr-form.model';

@Component({
  selector: 'app-profile-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden font-sans animate-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div class="px-5 py-3.5 bg-[#0483AC] text-white flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2.5">
              <svg class="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-white tracking-tight">
                  Verify Registration Profile Before Applying
                </h3>
                <p class="text-[11px] text-sky-100 font-normal">
                  Review your One Time Registration (OTR) particulars before proceeding with the scheme proposal.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="onClose()"
              class="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Close dialog"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Notice Banner -->
          <div class="bg-sky-50 px-5 py-2.5 border-b border-sky-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div class="flex items-center gap-2 text-sky-900">
              <svg class="w-4 h-4 text-[#0483AC] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>All information below is read-only. Click <strong>Edit Profile</strong> to modify any details.</span>
            </div>
            <button
              type="button"
              (click)="onEditProfile()"
              class="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 border border-sky-300 text-[#0483AC] text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>

          <!-- Scrollable Body -->
          <div class="p-5 overflow-y-auto space-y-4 flex-1 text-xs">

            <!-- SECTION 1: ORGANIZATION DETAILS -->
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Organization Details</h4>
              </div>
              <div class="p-4 space-y-3.5">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Short Name</span>
                    <span class="font-medium text-slate-800">{{ step1().shortName || '-' }}</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-slate-400 block text-[10.5px]">Full Name</span>
                    <span class="font-medium text-slate-800">{{ step1().fullName || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Nature of Entity</span>
                    <span class="font-medium text-slate-800">{{ step1().natureOfEntity || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Reg. Number (CIN)</span>
                    <span class="font-mono text-slate-800">{{ step1().registrationNumber || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Date of Reg.</span>
                    <span class="text-slate-800">{{ step1().dateOfRegistration || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">State of Reg.</span>
                    <span class="text-slate-800">{{ step1().stateOfLegalReg || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Company PAN</span>
                    <span class="font-mono text-slate-800 font-semibold">{{ step1().companyPan || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">GST Registered</span>
                    <span class="text-slate-800">{{ step1().gstRegistered }} ({{ step1().gstin || 'N/A' }})</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">MSME / Udyam</span>
                    <span class="text-slate-800">{{ step1().msmeRegistered }} @if(step1().udyamNumber){ - {{ step1().udyamNumber }} }</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">NSDC Partner</span>
                    <span class="text-slate-800">{{ step1().nsdcPartner || 'None' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Blacklisted</span>
                    <span class="font-semibold" [class.text-rose-600]="step1().blackListed === 'Yes'">{{ step1().blackListed }}</span>
                  </div>
                </div>

                <!-- Financial Turnover Table -->
                @if (step1().financialYears && step1().financialYears.length > 0) {
                  <div class="pt-2 border-t border-slate-100">
                    <span class="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Financial Turnover (₹ Lacs)</span>
                    <table class="w-full text-left border-collapse border border-slate-200 rounded text-xs">
                      <thead>
                        <tr class="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                          <th class="py-1 px-3 border-r border-slate-200">Financial Year</th>
                          <th class="py-1 px-3 border-r border-slate-200">Total Turnover (₹ Lacs)</th>
                          <th class="py-1 px-3">Skill Turnover (₹ Lacs)</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (fy of step1().financialYears; track fy.year) {
                          <tr>
                            <td class="py-1 px-3 text-slate-700 border-r border-slate-100">{{ fy.year }}</td>
                            <td class="py-1 px-3 text-slate-700 border-r border-slate-100">{{ fy.totalTurnover || '-' }}</td>
                            <td class="py-1 px-3 text-slate-700">{{ fy.skillTurnover || '-' }}</td>
                          </tr>
                        }
                        <tr class="bg-slate-50 font-semibold border-t border-slate-200">
                          <td class="py-1 px-3 text-slate-700 border-r border-slate-100">3-Year Average</td>
                          <td class="py-1 px-3 text-[#0483AC] border-r border-slate-100">{{ avgTotalTurnover() }} Lacs</td>
                          <td class="py-1 px-3 text-[#0483AC]">{{ avgSkillTurnover() }} Lacs</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }

                <!-- Address Summary -->
                <div class="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Registered Address</span>
                    <span class="text-slate-800">{{ step1().registeredAddress || '-' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[10.5px]">Official Email &amp; Contact</span>
                    <span class="text-slate-800">{{ step1().emailId || '-' }} | {{ step1().contactNo || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 2: AUTHORIZED PERSON (Swapped to Step 2) -->
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Step 2 – Authorized Person Details</h4>
              </div>
              <div class="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Name</span>
                  <span class="font-semibold text-slate-800">{{ step3().name || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Designation</span>
                  <span class="text-slate-800">{{ step3().designation || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Mobile No.</span>
                  <span class="text-slate-800 font-mono">{{ step3().mobileNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Email ID</span>
                  <span class="text-slate-800">{{ step3().emailId || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">PAN</span>
                  <span class="text-slate-800 font-mono">{{ step3().pan || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Aadhaar No.</span>
                  <span class="text-slate-800 font-mono">{{ step3().aadhaarNo || '-' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-slate-400 block text-[10.5px]">Residence Address</span>
                  <span class="text-slate-800">{{ step3().residenceAddress || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- SECTION 3: OFFICER(S) IN-CHARGE (Swapped to Step 3) + PROPOSAL SELECTION -->
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Step 3 – Officer(s) In-Charge ({{ step2().length }})
                  </h4>
                </div>
              </div>

              <div class="p-4 space-y-3">
                <!-- Select Designated OIC for Scheme -->
                <div class="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
                  <label class="block text-xs font-bold text-[#0B3558] mb-1">
                    Designate Officer In-Charge for this Proposal:
                  </label>
                  <p class="text-[11px] text-slate-600 mb-2">
                    Choose which registered Officer In-Charge will serve as the primary operational contact for this scheme proposal.
                  </p>
                  <select
                    [ngModel]="selectedOicId()"
                    (ngModelChange)="selectedOicId.set($event)"
                    class="w-full sm:w-auto min-w-[280px] bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#0483AC]"
                  >
                    @for (oic of step2(); track oic.id) {
                      <option [value]="oic.id">
                        {{ oic.name }} ({{ oic.designation || 'OIC' }}) - {{ oic.mobileNo }}
                      </option>
                    }
                  </select>
                </div>

                <!-- OIC Cards list -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  @for (oic of step2(); track oic.id; let idx = $index) {
                    <div
                      class="p-2.5 rounded-lg border text-xs transition-colors"
                      [class.border-[#0483AC]]="selectedOicId() === oic.id"
                      [class.bg-sky-50/40]="selectedOicId() === oic.id"
                      [class.border-slate-200]="selectedOicId() !== oic.id"
                    >
                      <div class="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                        <span class="font-bold text-slate-800">{{ oic.name || 'Officer #' + (idx + 1) }}</span>
                        @if (selectedOicId() === oic.id) {
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#0483AC] text-white">Selected for Scheme</span>
                        }
                      </div>
                      <div class="grid grid-cols-2 gap-1 text-[11px]">
                        <div><span class="text-slate-400">Desig:</span> {{ oic.designation || '-' }}</div>
                        <div><span class="text-slate-400">Mobile:</span> {{ oic.mobileNo || '-' }}</div>
                        <div><span class="text-slate-400">Email:</span> {{ oic.emailId || '-' }}</div>
                        <div><span class="text-slate-400">PAN:</span> {{ oic.pan || '-' }}</div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- SECTION 4: BANK DETAILS -->
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Step 4 – Bank Account Details</h4>
              </div>
              <div class="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Bank Name</span>
                  <span class="font-medium text-slate-800">{{ step4().bankName || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Branch Name</span>
                  <span class="text-slate-800">{{ step4().branchName || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Account Type</span>
                  <span class="text-slate-800">{{ step4().accountType || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Account Holder Name</span>
                  <span class="font-medium text-slate-800">{{ step4().accountHolderName || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Account No.</span>
                  <span class="font-mono text-slate-800">{{ step4().accountNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">IFSC Code</span>
                  <span class="font-mono text-slate-800">{{ step4().ifscCode || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Transfer Mode</span>
                  <span class="text-slate-800">{{ step4().transferMode || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Cancelled Cheque Doc</span>
                  <span class="text-emerald-700 font-medium">{{ step4().cancelledChequeDoc?.fileName || 'Attached' }}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Modal Footer Actions -->
          <div class="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 shrink-0">
            <button
              type="button"
              (click)="onEditProfile()"
              class="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile Details</span>
            </button>

            <div class="flex items-center gap-2.5">
              <button
                type="button"
                (click)="onClose()"
                class="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                (click)="onProceed()"
                class="px-5 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Apply</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class ProfilePreviewModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() proceed = new EventEmitter<{ selectedOicId: string }>();

  private otrFormService = inject(OtrFormService);
  private router = inject(Router);

  readonly step1 = computed(() => this.otrFormService.step1());
  readonly step2 = computed(() => this.otrFormService.step2());
  readonly step3 = computed(() => this.otrFormService.step3());
  readonly step4 = computed(() => this.otrFormService.step4());

  selectedOicId = signal<string>('');

  readonly avgTotalTurnover = computed(() => {
    const rows = this.step1().financialYears;
    if (!rows || !rows.length) return '0.00';
    const sum = rows.reduce((acc, r) => acc + (parseFloat(r.totalTurnover) || 0), 0);
    return (sum / rows.length).toFixed(2);
  });

  readonly avgSkillTurnover = computed(() => {
    const rows = this.step1().financialYears;
    if (!rows || !rows.length) return '0.00';
    const sum = rows.reduce((acc, r) => acc + (parseFloat(r.skillTurnover) || 0), 0);
    return (sum / rows.length).toFixed(2);
  });

  ngOnInit(): void {
    const oics = this.step2();
    if (oics && oics.length > 0) {
      this.selectedOicId.set(oics[0].id);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onEditProfile(): void {
    this.close.emit();
    this.router.navigate(['/registration']);
  }

  onProceed(): void {
    this.proceed.emit({ selectedOicId: this.selectedOicId() });
  }
}
