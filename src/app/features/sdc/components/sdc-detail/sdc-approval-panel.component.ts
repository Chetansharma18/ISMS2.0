import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SdcRecord } from '../../models/sdc.model';
import { SdcInspectionSummaryComponent } from './sdc-inspection-summary.component';
import { ButtonComponent, IconComponent, InputDirective } from '../../../../shared';

/** Department scrutiny panel: approved notice, or the capacity/remarks form with approve, reject and return actions. */
@Component({
  selector: 'app-sdc-approval-panel',
  standalone: true,
  imports: [FormsModule, SdcInspectionSummaryComponent, ButtonComponent, IconComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let center = sdc();
    @if (center.status === 'APPROVED') {
      <div class="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <app-icon name="check" size="lg" [stroke]="2.5" />
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
            <app-icon name="shield-check" [stroke]="2" class="text-emerald-300" />
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
                appInput
                type="number"
                [ngModel]="targetCapacity()" (ngModelChange)="targetCapacity.set($event)"
                min="1"
                max="5000"
                class="w-full"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block font-semibold text-slate-700 mb-1">
                Approval / Department Remarks <span class="text-rose-500">*</span>
              </label>
              <input
                appInput
                type="text"
                [ngModel]="remarks()" (ngModelChange)="remarks.set($event)"
                class="w-full"
                placeholder="Enter official remarks..."
              />
            </div>
          </div>

          <!-- Decision Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 flex-wrap">
            
            <button
              appButton
              variant="secondary"
              type="button"
              (click)="returnToTp.emit()"
            >
              Return to TP for Corrections
            </button>

            <button
              appButton
              variant="danger"
              type="button"
              (click)="reject.emit()"
            >
              Reject SDC
            </button>

            <button
              appButton
              type="button"
              (click)="approve.emit()"
            >
              <app-icon name="check" />
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