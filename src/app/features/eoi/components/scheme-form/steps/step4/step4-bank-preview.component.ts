import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: bank details preview / inline edit. */
@Component({
  selector: 'app-step4-bank-preview',
  standalone: true,
  imports: [NgClass, FormsModule],
  host: { class: 'block' },
  template: `
    <div class="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 text-xs">
      <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
        <span class="font-bold text-slate-800 uppercase text-[11px]">3. Bank Account Details</span>
        <div class="flex items-center gap-2">
          <span class="font-mono text-slate-500 font-semibold">IFSC: {{ state.editableStep4.ifscCode || '-' }}</span>
          <button
            type="button"
            (click)="state.togglePreviewOtrEdit()"
            class="px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            [ngClass]="state.isEditingOtrInPreview() ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-navy text-navy hover:bg-slate-50'"
          >
            {{ state.isEditingOtrInPreview() ? 'Done' : 'Edit' }}
          </button>
        </div>
      </div>

      @if (state.isEditingOtrInPreview()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Bank Name</label>
            <input type="text" [(ngModel)]="state.editableStep4.bankName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
          </div>
          <div>
            <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Branch Name</label>
            <input type="text" [(ngModel)]="state.editableStep4.branchName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
          </div>
          <div>
            <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Type</label>
            <select [(ngModel)]="state.editableStep4.accountType" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
              <option value="Current Account">Current Account</option>
              <option value="Savings Account">Savings Account</option>
            </select>
          </div>
          <div>
            <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Holder</label>
            <input type="text" [(ngModel)]="state.editableStep4.accountHolderName" class="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white" />
          </div>
          <div>
            <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Number</label>
            <input type="text" [(ngModel)]="state.editableStep4.accountNo" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white" />
          </div>
          <div>
            <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">IFSC Code</label>
            <input type="text" [(ngModel)]="state.editableStep4.ifscCode" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white" />
          </div>
          <div>
            <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Transfer Mode</label>
            <input type="text" [(ngModel)]="state.editableStep4.transferMode" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
          </div>
          <div class="sm:col-span-2 lg:col-span-4 pt-1">
            @if (state.editableStep4.cancelledChequeDoc && state.editableStep4.cancelledChequeDoc.status === 'uploaded') {
              <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs max-w-xl">
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                    <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                    <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                  </svg>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Cancelled Cheque / Passbook</span>
                    <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep4.cancelledChequeDoc.fileName }}">
                      {{ state.editableStep4.cancelledChequeDoc.fileName }}
                    </span>
                    <div class="mt-0.5">
                      <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {{ state.editableStep4.cancelledChequeDoc.fileSize || '890 KB' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    (click)="state.viewDoc(state.editableStep4.cancelledChequeDoc.fileName, 'Cancelled Cheque', state.editableStep4.cancelledChequeDoc.fileSize || '890 KB')"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean hover:text-ocean-dark bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                    title="Preview Document"
                  >
                    <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </button>
                  <label
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                    title="Change Document"
                  >
                    <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Change</span>
                    <input type="file" (change)="state.replaceOtrDoc($event, 'bankDoc')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                  </label>
                  <button
                    type="button"
                    (click)="state.removeOtrDoc('bankDoc')"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="Remove Document"
                  >
                    <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-medium">Bank Name</span>
            <span class="font-bold text-slate-800 text-xs">{{ state.editableStep4.bankName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-medium">Branch</span>
            <span class="font-semibold text-slate-800 text-xs">{{ state.editableStep4.branchName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-medium">Account Type</span>
            <span class="font-semibold text-slate-800 text-xs">{{ state.editableStep4.accountType || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-medium">Account Holder</span>
            <span class="font-bold text-slate-800 text-xs">{{ state.editableStep4.accountHolderName || state.editableStep1.fullName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-medium">Account Number</span>
            <span class="font-mono font-bold text-slate-800 text-xs">{{ state.editableStep4.accountNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-medium">IFSC Code</span>
            <span class="font-mono font-bold text-slate-800 text-xs">{{ state.editableStep4.ifscCode || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-medium">Transfer Mode</span>
            <span class="font-semibold text-slate-800 text-xs">{{ state.editableStep4.transferMode || 'NEFT / RTGS' }}</span>
          </div>
          <div class="sm:col-span-2 lg:col-span-4 pt-1">
            @if (state.editableStep4.cancelledChequeDoc && state.editableStep4.cancelledChequeDoc.status === 'uploaded') {
              <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs max-w-xl">
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                    <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                    <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                  </svg>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Cancelled Cheque / Passbook</span>
                    <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep4.cancelledChequeDoc.fileName }}">
                      {{ state.editableStep4.cancelledChequeDoc.fileName }}
                    </span>
                    <div class="mt-0.5">
                      <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {{ state.editableStep4.cancelledChequeDoc.fileSize || '890 KB' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    (click)="state.viewDoc(state.editableStep4.cancelledChequeDoc.fileName, 'Cancelled Cheque', state.editableStep4.cancelledChequeDoc.fileSize || '890 KB')"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean hover:text-ocean-dark bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                    title="Preview Document"
                  >
                    <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class Step4BankPreviewComponent {
  protected readonly state = inject(SchemeFormState);
}
