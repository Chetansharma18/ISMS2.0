import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SdcRecord } from '../../models/sdc.model';
import { SdcInspectionSummaryComponent } from './sdc-inspection-summary.component';

/** Department scrutiny panel: approved notice, or the capacity/remarks form with approve, reject and return actions. */
@Component({
  selector: 'app-sdc-approval-panel',
  standalone: true,
  imports: [FormsModule, SdcInspectionSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let center = sdc();
    @if (center.status === 'APPROVED') {
      <div class="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 class="font-bold text-emerald-900 text-sm">SDC Approved by Department</h4>
            <p class="text-emerald-800 text-xs mt-0.5">
              {{ center.approval?.approvalRemarks || 'Center certified and sanctioned for training batches mobilization.' }}
            </p>
            <div class="text-[11px] text-emerald-700 mt-1 flex items-center gap-3">
              <span>Approved Target Capacity: <strong>{{ center.approval?.approvedTargetCapacity || center.sdcCapacity }} Trainees</strong></span>
              <span>•</span>
              <span>Approved Date: <strong>{{ center.approval?.approvedDate || '2026-09-15' }}</strong></span>
              <span>•</span>
              <span>Authority: <strong>{{ center.approval?.approvedBy || 'RSLDC Authority' }}</strong></span>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="rounded-xl border border-primary/30 bg-white shadow-xs overflow-hidden">
        
        <!-- Decision Header -->
        <div class="bg-primary text-white px-5 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="font-bold text-xs uppercase tracking-wider">Department Scrutiny & Approval Decision</span>
          </div>
          <span class="text-[11px] text-white/80 font-mono">Status: {{ center.status }}</span>
        </div>

        <!-- Inspection Findings Summary if available -->
        @if (center.inspection) {
          <app-sdc-inspection-summary [inspection]="center.inspection" />
        }

        <!-- Approval Form Controls -->
        <div class="p-5 space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">
                Sanctioned Target Capacity (Trainees) <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                [ngModel]="targetCapacity()" (ngModelChange)="targetCapacity.set($event)"
                min="1"
                max="5000"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block font-semibold text-slate-700 mb-1">
                Approval / Department Remarks <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [ngModel]="remarks()" (ngModelChange)="remarks.set($event)"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter official remarks..."
              />
            </div>
          </div>

          <!-- Decision Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 flex-wrap">
            
            <button
              type="button"
              (click)="returnToTp.emit()"
              class="px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              Return to TP for Corrections
            </button>

            <button
              type="button"
              (click)="reject.emit()"
              class="px-3.5 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              Reject SDC
            </button>

            <button
              type="button"
              (click)="approve.emit()"
              class="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Approve SDC</span>
            </button>

          </div>

        </div>

      </div>
    }
  `
})
export class SdcApprovalPanelComponent {
  readonly sdc = input.required<SdcRecord>();
  readonly targetCapacity = model.required<number>();
  readonly remarks = model.required<string>();
  readonly approve = output<void>();
  readonly reject = output<void>();
  readonly returnToTp = output<void>();
}