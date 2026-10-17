import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AspirantRecord } from '../../models/aspirant.model';
import { ButtonComponent } from '../../../../shared';

/** View-mode card: bank / DBT and socio-economic registrations. */
@Component({
  selector: 'app-aspirant-bank-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [DecimalPipe, ButtonComponent],
  template: `
    @let cand = aspirant();
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full"></span>
          <span>3. Bank DBT &amp; Socio-Economic Registrations</span>
        </h2>
        <button
          appButton
          variant="ghost"
          size="sm"
          type="button"
          (click)="edit.emit()"
        >
          <span>Edit Section</span> &rarr;
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span class="text-slate-400 block text-[11px]">Account Holder Name</span>
          <span class="font-bold text-slate-800 mt-0.5 block">{{ cand.bankAccountName || cand.aspirantName }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Bank Name</span>
          <span class="font-bold text-slate-800 mt-0.5 block">{{ cand.bankName }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Account No. (Masked)</span>
          <span class="font-mono font-bold text-slate-800 mt-0.5 block">{{ cand.bankAccountNo }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Account Type</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.bankAccountType || 'Savings' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">IFSC Code</span>
          <span class="font-mono font-bold text-slate-800 mt-0.5 block">{{ cand.ifscCode }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Branch Name</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.bankBranch }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">MICR Code</span>
          <span class="font-mono font-semibold text-slate-800 mt-0.5 block">{{ cand.micrCode || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Annual Family Income</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">₹ {{ cand.annualFamilyIncome | number }} <span class="text-slate-400 text-[10.5px]">({{ cand.incomeSlab || 'N/A' }})</span></span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Economic Status</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.economicStatus }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Ration / BPL Card No.</span>
          <span class="font-mono font-semibold text-slate-800 mt-0.5 block">{{ cand.economicCardNo || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">BoCW Registered</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">
            {{ cand.bocwWorker || 'No' }}
            @if (cand.bocwNo) {
              <span class="text-[10.5px] font-mono text-slate-500 block">({{ cand.bocwNo }})</span>
            }
          </span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">MGNREGA Worker</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">
            {{ cand.mgnregaWorker || 'No' }}
            @if (cand.mgnregaNo) {
              <span class="text-[10.5px] font-mono text-slate-500 block">({{ cand.mgnregaNo }})</span>
            }
          </span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">RSBY Beneficiary</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">
            {{ cand.isRsby || 'No' }}
            @if (cand.rsbyNo) {
              <span class="text-[10.5px] font-mono text-slate-500 block">({{ cand.rsbyNo }})</span>
            }
          </span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Gram Sabha PIP Listed</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.gramsabhaPip || 'No' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">NRLM / SHG Member</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">
            {{ cand.nrlmMember || 'No' }}
            @if (cand.nrlmNo) {
              <span class="text-[10.5px] font-mono text-slate-500 block">({{ cand.nrlmNo }})</span>
            }
          </span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Voter ID (EPIC No.)</span>
          <span class="font-mono font-semibold text-slate-800 mt-0.5 block">{{ cand.epicNo || 'N/A' }}</span>
        </div>
      </div>

      <!-- Preferred Sectors -->
      @if (cand.preferredSectors && cand.preferredSectors.length > 0) {
        <div class="pt-3 border-t border-slate-100">
          <span class="text-slate-400 block text-[11px] mb-1.5">Sector Preferences</span>
          <div class="flex flex-wrap gap-1.5">
            @for (sec of cand.preferredSectors; track sec) {
              <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-primary-light text-brand border border-[#c1d9e7]">
                {{ sec }}
              </span>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AspirantBankViewComponent {
  readonly aspirant = input.required<AspirantRecord>();
  readonly edit = output<void>();
}