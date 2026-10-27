import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../../../shared';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: read-only bank details summary. */
@Component({
  selector: 'app-step4-bank-preview',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">4</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Organisation Bank Details</h2>
        </div>
      </div>

      <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Bank</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.bankName || '-' }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Branch</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.branchName || '-' }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Holder</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.accountHolderName || '-' }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account No.</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep4.accountNo || '-' }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">IFSC</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep4.ifscCode || '-' }}</span>
        </div>

        @if (state.editableStep4.cancelledChequeDoc; as doc) {
          @if (doc.status === 'uploaded') {
            <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <span class="text-slate-500 text-[11.5px]">Cancelled Cheque / Passbook: </span>
                  <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                </div>
                <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Cancelled Cheque', doc.fileSize)">View</button>
              </div>
            </div>
          }
        }
      </div>
    </section>
  `
})
export class Step4BankPreviewComponent {
  protected readonly state = inject(SchemeFormState);
}
