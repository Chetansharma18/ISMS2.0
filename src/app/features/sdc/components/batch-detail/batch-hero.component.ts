import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BatchRecord } from '../../models/batch.model';

/** Hero strip: training partner, batch identity, target capacity and current status. */
@Component({
  selector: 'app-batch-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let b = batch();
    <div class="rounded-xl border border-border bg-primary-light/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
      
      <!-- Left: Training Partner & Batch / SDC Context -->
      <div class="space-y-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2 py-0.5 rounded bg-primary text-white text-[10.5px] font-bold uppercase tracking-wider">
            TRAINING PARTNER
          </span>
          <span class="font-mono text-xs font-semibold text-slate-600">
            {{ b.nipaNo || ('BATCH/' + b.batchCode) }}
          </span>
        </div>
        <div class="text-base sm:text-lg font-bold text-slate-900">
          {{ b.tpName || 'ARNOLD SAMARTH' }}
        </div>
        <div class="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
          <span>Center: <strong class="text-slate-800">{{ b.sdcName }}</strong></span>
          <span>•</span>
          <span class="font-mono font-medium text-brand">{{ b.sdcCode }}</span>
          <span>•</span>
          <span>Scheme: <strong class="text-slate-800">{{ b.scheme }}</strong></span>
          <span>•</span>
          <span>Batch: <strong class="font-mono text-slate-800">{{ b.batchCode }}</strong></span>
        </div>
      </div>

      <!-- Right: Target Capacity & Current Status Badges -->
      <div class="flex items-center gap-4 sm:gap-6">
        
        <!-- Target Capacity -->
        <div class="text-right">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">TARGET CAPACITY</span>
          <span class="font-bold text-slate-900 text-sm">
            {{ b.approvedBatchStrength || b.maxStrength || 30 }} Trainees
          </span>
        </div>

        <!-- Current Status (Bold Black Uppercase Text matching SDC Detail) -->
        <div class="text-right border-l border-border pl-4 sm:pl-6">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">CURRENT STATUS</span>
          <span class="font-bold text-sm tracking-wide uppercase text-black" style="color: #000000 !important; font-weight: bold;">
            {{ status().toUpperCase() }}
          </span>
        </div>

      </div>

    </div>
  `
})
export class BatchHeroComponent {
  readonly batch = input.required<BatchRecord>();
  /** Already formatted status label, e.g. APPROVED / PENDING / REJECTED. */
  readonly status = input.required<string>();
}