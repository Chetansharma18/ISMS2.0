import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SdcRecord } from '../../models/sdc.model';
import { formatSdcStatus } from './sdc-detail.util';

/** Hero strip: training partner, centre identity, target capacity and current status. */
@Component({
  selector: 'app-sdc-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let center = sdc();
    <div class="rounded-xl border border-border bg-primary-light/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
      
      <!-- Left: Training Partner & Center Code -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-primary text-white text-[10.5px] font-bold uppercase tracking-wider">
            Training Partner
          </span>
          <span class="font-mono text-xs font-semibold text-slate-600">
            {{ center.mouRefNo || 'MOU Registered' }}
          </span>
        </div>
        <div class="text-base sm:text-lg font-bold text-slate-900">
          {{ center.tpName }}
        </div>
        <div class="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
          <span>Center: <strong class="text-slate-800">{{ center.sdcName }}</strong></span>
          <span>•</span>
          <span class="font-mono font-medium text-brand">{{ center.sdcCode }}</span>
          <span>•</span>
          <span>Scheme: <strong class="text-slate-800">{{ center.scheme }}</strong> ({{ center.schemeCategory || 'General' }})</span>
        </div>
      </div>

      <!-- Right: Status & Capacity Badges -->
      <div class="flex items-center gap-4 sm:gap-6">
        
        <!-- Target Capacity -->
        <div class="text-right">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Target Capacity</span>
          <span class="font-bold text-slate-900 text-sm">
            {{ center.approval?.approvedTargetCapacity || center.sdcCapacity }} Trainees
          </span>
        </div>

        <!-- Status (Bold Black Uppercase Text) -->
        <div class="text-right border-l border-border pl-4 sm:pl-6">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Current Status</span>
          <span class="font-bold text-sm tracking-wide uppercase text-black" style="color: #000000 !important; font-weight: bold;">
            {{ formatStatus(center.status).toUpperCase() }}
          </span>
        </div>

      </div>

    </div>
  `
})
export class SdcHeroComponent {
  readonly sdc = input.required<SdcRecord>();

  formatStatus(status?: string): string {
    return formatSdcStatus(status);
  }
}