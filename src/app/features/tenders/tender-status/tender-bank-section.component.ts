import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderDocCardComponent, TenderDocReplaceRequest, TenderDocViewRequest } from './tender-doc-card.component';

// Default change detection: the parent replaces documents inside the passed tender object in place while editing.
@Component({
  selector: 'app-tender-bank-section',
  standalone: true,
  imports: [FormsModule, TenderDocCardComponent],
  host: { class: 'block' },
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">3</span>
        <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">Bank Details</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Name of the Bank</span><span class="font-medium text-slate-900">{{ app().bankDetails.bankName || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Branch Name</span><span class="font-medium text-slate-900">{{ app().bankDetails.branchName || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Transfer Mode</span><span class="font-medium text-slate-900">{{ app().bankDetails.transferMode || 'NEFT / RTGS' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Account Type</span><span class="font-medium text-slate-900">{{ app().bankDetails.accountType || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Account Holder Name</span><span class="font-medium text-slate-900">{{ app().bankDetails.accountHolderName || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Account Number</span><span class="font-mono text-slate-900 font-medium">{{ app().bankDetails.accountNo || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">IFSC Code</span><span class="font-mono text-slate-900 font-medium">{{ app().bankDetails.ifscCode || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">MICR Code</span><span class="font-mono text-slate-900">{{ app().bankDetails.micrCode || '-' }}</span></div>
        <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Branch Address</span><span class="text-slate-900 leading-relaxed">{{ app().bankDetails.branchAddress || '-' }}</span></div>
      </div>

      <!-- Attached Bank Cheque -->
      <div class="pt-3 border-t border-slate-200">
        <app-tender-doc-card
          [doc]="app().bankDetails.cancelledChequeDoc"
          fallbackName="Cancelled_Cheque.pdf"
          fallbackSize="890 KB"
          viewTitle="Cancelled Cheque / Bank Passbook"
          [narrow]="true"
          [isEditing]="isEditing()"
          (view)="viewDoc.emit($event)"
          (replace)="replaceOtrDoc.emit({ event: $event, docType: 'bankDoc' })"
        />
      </div>
    </div>
  `
})
export class TenderBankSectionComponent {
  readonly app = input.required<SubmittedTender>();
  /** Parent-owned deep clone being edited; fields are bound directly with ngModel. */
  readonly editable = input<SubmittedTender | null>(null);
  readonly isEditing = input(false);

  readonly viewDoc = output<TenderDocViewRequest>();
  readonly replaceOtrDoc = output<TenderDocReplaceRequest>();
}