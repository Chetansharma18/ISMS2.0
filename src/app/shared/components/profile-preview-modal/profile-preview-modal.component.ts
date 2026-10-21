import { Component, Input, Output, EventEmitter, inject, computed, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OtrFormService } from '../../../features/registration/services/otr-form.service';
import { OfficerInCharge } from '../../../features/registration/models/otr-form.model';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { InputDirective } from '../form-controls/input/input.directive';
import { ModalComponent } from '../modal/modal.component';
import { TableComponent } from '../table/table.component';
import { TableColumn } from '../table/table.types';

/** One line of the financial turnover grid; the last line is the computed 3-year average. */
interface TurnoverRow {
  id: string;
  year: string;
  totalTurnover: string;
  skillTurnover: string;
  isAverage: boolean;
}

@Component({
  selector: 'app-profile-preview-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent, InputDirective, ModalComponent, TableComponent],
  template: `
    @if (isOpen) {
      <app-modal
        title="Verify Registration Profile Before Applying"
        subtitle="Review your One Time Registration (OTR) particulars before proceeding with the scheme proposal."
        size="xl"
        [closeOnBackdrop]="false"
        (close)="onClose()"
      >
          <!-- Body -->
          <div class="space-y-4 text-xs">

            <!-- Notice Banner -->
            <div class="bg-sky-50 px-4 py-2.5 border border-sky-100 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs">
              <div class="flex items-center gap-2 text-sky-900">
                <app-icon name="info" [stroke]="2" class="text-ocean shrink-0" />
                <span>All information below is read-only. Click <strong>Edit Profile</strong> to modify any details.</span>
              </div>
              <button
                appButton
                variant="outline"
                size="sm"
                type="button"
                (click)="onEditProfile()"
              >
                <app-icon name="pencil" size="sm" [stroke]="2" />
                <span>Edit Profile</span>
              </button>
            </div>

            <!-- SECTION 1: ORGANIZATION DETAILS -->
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Organization Details</h4>
              </div>
              <div class="p-4 space-y-3.5">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    <span class="tabular-nums text-slate-800">{{ step1().registrationNumber || '-' }}</span>
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
                    <span class="tabular-nums text-slate-800 font-semibold">{{ step1().companyPan || '-' }}</span>
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
                    <span class="text-slate-400 block text-[10.5px]">Preferred Sector</span>
                    <span class="text-slate-800">{{ step1().preferredSector || '-' }}</span>
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
                    <app-table [columns]="turnoverColumns" [data]="turnoverRows()" />
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
              <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  <span class="text-slate-800 tabular-nums">{{ step3().mobileNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Email ID</span>
                  <span class="text-slate-800">{{ step3().emailId || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">PAN</span>
                  <span class="text-slate-800 tabular-nums">{{ step3().pan || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">Aadhaar No.</span>
                  <span class="text-slate-800 tabular-nums">{{ step3().aadhaarNo || '-' }}</span>
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
                  <label class="block text-xs font-bold text-navy mb-1">
                    Designate Officer In-Charge for this Proposal:
                  </label>
                  <p class="text-[11px] text-slate-600 mb-2">
                    Choose which registered Officer In-Charge will serve as the primary operational contact for this scheme proposal.
                  </p>
                  <select
                    appInput
                    size="sm"
                    [ngModel]="selectedOicId()"
                    (ngModelChange)="selectedOicId.set($event)"
                    class="w-full sm:w-auto min-w-[280px]"
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
                      [class.border-ocean]="selectedOicId() === oic.id"
                      [class.bg-sky-50/40]="selectedOicId() === oic.id"
                      [class.border-slate-200]="selectedOicId() !== oic.id"
                    >
                      <div class="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
                        <span class="font-bold text-slate-800">{{ oic.name || 'Officer #' + (idx + 1) }}</span>
                        @if (selectedOicId() === oic.id) {
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-ocean text-white">Selected for Scheme</span>
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
              <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
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
                  <span class="tabular-nums text-slate-800">{{ step4().accountNo || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10.5px]">IFSC Code</span>
                  <span class="tabular-nums text-slate-800">{{ step4().ifscCode || '-' }}</span>
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
          <ng-container modalFooter>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
              <button
                appButton
                variant="outline"
                type="button"
                (click)="onEditProfile()"
              >
                <app-icon name="pencil" size="sm" [stroke]="2" />
                <span>Edit Profile Details</span>
              </button>

              <div class="flex items-center gap-2.5 justify-end">
                <button
                  appButton
                  variant="outline"
                  type="button"
                  (click)="onClose()"
                  class="flex-1 sm:flex-none"
                >
                  Cancel
                </button>

                <button
                  appButton
                  type="button"
                  (click)="onProceed()"
                  class="flex-1 sm:flex-none"
                >
                  <span>Proceed to Apply</span>
                  <app-icon name="forward" />
                </button>
              </div>
            </div>
          </ng-container>
      </app-modal>
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

  protected readonly turnoverColumns: TableColumn<TurnoverRow>[] = [
    { key: 'year', label: 'Financial Year', cellClass: (_value, row) => (row.isAverage ? 'font-semibold text-slate-700' : 'text-slate-700') },
    { key: 'totalTurnover', label: 'Total Turnover (₹ Lacs)', cellClass: (_value, row) => (row.isAverage ? 'font-semibold text-ocean' : 'text-slate-700') },
    { key: 'skillTurnover', label: 'Skill Turnover (₹ Lacs)', cellClass: (_value, row) => (row.isAverage ? 'font-semibold text-ocean' : 'text-slate-700') }
  ];

  /** The entered years followed by the 3-year average line. */
  readonly turnoverRows = computed<TurnoverRow[]>(() => [
    ...(this.step1().financialYears ?? []).map(fy => ({
      id: fy.year,
      year: fy.year,
      totalTurnover: fy.totalTurnover || '-',
      skillTurnover: fy.skillTurnover || '-',
      isAverage: false
    })),
    {
      id: 'average',
      year: '3-Year Average',
      totalTurnover: `${this.avgTotalTurnover()} Lacs`,
      skillTurnover: `${this.avgSkillTurnover()} Lacs`,
      isAverage: true
    }
  ]);

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
