import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatchRecord } from '../../models/batch.model';
import { ButtonComponent, IconComponent, InputDirective } from '../../../../shared';

/** Department scrutiny panel: approved notice, or the capacity/remarks form with approve and reject actions. */
@Component({
  selector: 'app-batch-approval-panel',
  standalone: true,
  imports: [DatePipe, FormsModule, ButtonComponent, IconComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let b = batch();
    @if (approved()) {
      <div class="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <app-icon name="check" size="lg" [stroke]="2.5" />
          </div>
          <div>
            <h4 class="font-bold text-emerald-900 text-sm">Batch Approved by Department</h4>
            <p class="text-emerald-800 text-xs mt-0.5">
              {{ b.approvalRemarks || 'Batch infrastructure and parameters verified. Commencement of training and attendance capture permitted.' }}
            </p>
            <div class="text-[11px] text-emerald-700 mt-1 flex items-center gap-3 flex-wrap">
              <span>Approved Target Capacity: <strong>{{ b.approvedBatchStrength || b.maxStrength || 30 }} Trainees</strong></span>
              <span>•</span>
              <span>Approved Date: <strong>{{ b.approvedAt ? (b.approvedAt | date:'mediumDate') : '2026-09-20' }}</strong></span>
              <span>•</span>
              <span>Authority: <strong>{{ b.approvedBy || 'Department Scrutiny Officer' }}</strong></span>
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
          <span class="text-[11px] text-white/80 font-mono">Batch: {{ b.batchCode }}</span>
        </div>

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
              variant="danger"
              type="button"
              (click)="reject.emit()"
            >
              Reject Batch
            </button>

            <button
              appButton
              type="button"
              (click)="approve.emit()"
            >
              <app-icon name="check" />
              <span>Approve Batch</span>
            </button>
          </div>

        </div>

      </div>
    }
  `
})
export class BatchApprovalPanelComponent {
  readonly batch = input.required<BatchRecord>();
  readonly approved = input.required<boolean>();
  readonly targetCapacity = model.required<number>();
  readonly remarks = model.required<string>();
  readonly approve = output<void>();
  readonly reject = output<void>();
}