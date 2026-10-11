import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BatchRecord } from '../../models/batch.model';

/** Read-only card with the registered batch parameters and schedule. */
@Component({
  selector: 'app-batch-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let b = batch();
    <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-6">
      
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>Registered Batch Parameters &amp; Schedule</span>
        </h3>
        <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✓ PSD Payment: SUCCESS (₹{{ b.psdFee || 500 }})
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
        
        <!-- Sector (colSpan 2) -->
        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sector</span>
          <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ b.sector || 'Aerospace and Aviation' }}</span>
        </div>

        <!-- Course Name (colSpan 2) -->
        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Course</span>
          <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ b.courseName || b.course || 'Domestic Data Entry Operator' }}</span>
        </div>

        <!-- Batch Duration -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch Duration In HRS.</span>
          <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.batchDurationHours || b.totalHours || 400 }} hrs</span>
        </div>

        <!-- Batch Start Date -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch Start Date</span>
          <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.startDate || b.batchStartDate || '2026-10-01' }}</span>
        </div>

        <!-- Batch End Date -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch End Date</span>
          <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.endDate || b.batchEndDate || '2026-12-31' }}</span>
        </div>

        <!-- Batch Start Time -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch Start Time</span>
          <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.startTime || b.batchStartTime || '09:00 AM' }}</span>
        </div>

        <!-- Batch End Time -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Batch End Time</span>
          <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ b.endTime || b.batchEndTime || '05:00 PM' }}</span>
        </div>

        <!-- Approved Batch Strength -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Approved Batch Strength</span>
          <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ b.approvedBatchStrength || b.maxStrength || 30 }} Aspirants</span>
        </div>

        <!-- Remarks (colSpan 2) -->
        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Remarks</span>
          <span class="font-medium text-slate-700 text-[13px] mt-0.5 block italic">{{ b.remarks || 'Standard batch guidelines and training prerequisites compliant.' }}</span>
        </div>

      </div>

    </div>
  `
})
export class BatchSummaryCardComponent {
  readonly batch = input.required<BatchRecord>();
}