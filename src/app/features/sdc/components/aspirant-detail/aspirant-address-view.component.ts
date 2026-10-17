import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AspirantRecord } from '../../models/aspirant.model';
import { ButtonComponent } from '../../../../shared';

/** View-mode card: address and contact details. */
@Component({
  selector: 'app-aspirant-address-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent],
  template: `
    @let cand = aspirant();
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full"></span>
          <span>2. Address &amp; Contact Details</span>
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Permanent Address -->
        <div class="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Permanent Address</span>
          <div class="space-y-1 text-xs text-slate-800">
            <div><span class="text-slate-400">House / Building:</span> <strong>{{ cand.permHouseNo }}</strong>, {{ cand.permStreet }}</div>
            <div><span class="text-slate-400">Ward / City:</span> Ward {{ cand.permWard }}, {{ cand.permCity }} - <span class="font-mono font-bold">{{ cand.permPincode }}</span></div>
            <div><span class="text-slate-400">District:</span> <strong class="text-slate-900">{{ cand.permDistrict }}</strong></div>
            <div><span class="text-slate-400">Block / Tehsil:</span> {{ cand.permBlock || '—' }}, Tehsil: {{ cand.permTehsil || '—' }}</div>
            <div><span class="text-slate-400">Municipality / Panchayat:</span> {{ cand.permMunicipality || '—' }}</div>
            <div><span class="text-slate-400">Assembly / Parliament:</span> {{ cand.permAssembly || '—' }} / {{ cand.permParliament || '—' }}</div>
          </div>
        </div>

        <!-- Communication Address -->
        <div class="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Communication Address</span>
            @if (cand.isAddressSame) {
              <span class="px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Same as Permanent</span>
            }
          </div>
          <div class="space-y-1 text-xs text-slate-800">
            <div><span class="text-slate-400">House / Building:</span> <strong>{{ cand.commHouseNo || cand.permHouseNo }}</strong>, {{ cand.commStreet || cand.permStreet }}</div>
            <div><span class="text-slate-400">Ward / City:</span> Ward {{ cand.commWard || cand.permWard }}, {{ cand.commCity || cand.permCity }} - <span class="font-mono font-bold">{{ cand.commPincode || cand.permPincode }}</span></div>
            <div><span class="text-slate-400">District:</span> <strong class="text-slate-900">{{ cand.commDistrict || cand.permDistrict }}</strong></div>
            <div><span class="text-slate-400">Block / Tehsil:</span> {{ cand.commBlock || cand.permBlock || '—' }}, Tehsil: {{ cand.commTehsil || cand.permTehsil || '—' }}</div>
            <div><span class="text-slate-400">Municipality / Panchayat:</span> {{ cand.commMunicipality || cand.permMunicipality || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div>
          <span class="text-slate-400 block text-[11px]">Primary Mobile Number</span>
          <span class="font-bold font-mono text-slate-800 text-sm mt-0.5 block">{{ cand.mobileNo }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Alternate Mobile</span>
          <span class="font-semibold font-mono text-slate-800 mt-0.5 block">{{ cand.altMobileNo || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Landline Number</span>
          <span class="font-semibold font-mono text-slate-800 mt-0.5 block">{{ cand.landlineNo || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Email Address</span>
          <span class="font-semibold text-slate-800 mt-0.5 block truncate">{{ cand.email || 'N/A' }}</span>
        </div>
      </div>
    </div>
  `
})
export class AspirantAddressViewComponent {
  readonly aspirant = input.required<AspirantRecord>();
  readonly edit = output<void>();
}