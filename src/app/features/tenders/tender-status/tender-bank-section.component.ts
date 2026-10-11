import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderDocCardComponent, TenderDocReplaceRequest, TenderDocViewRequest } from './tender-doc-card.component';

@Component({
  selector: 'app-tender-bank-section',
  standalone: true,
  imports: [FormsModule, TenderDocCardComponent],
  host: { class: 'block' },
  template: `
    <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 class="font-semibold text-slate-900 text-sm">
          3. Bank Details
        </h3>
        @if (isEditing()) {
          <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
        }
      </div>

      @if (isEditing() && editable(); as ed) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Name of the Bank *</label>
            <input type="text" [(ngModel)]="ed.bankDetails.bankName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Branch Name *</label>
            <input type="text" [(ngModel)]="ed.bankDetails.branchName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Transfer Mode *</label>
            <input type="text" [(ngModel)]="ed.bankDetails.transferMode" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Account Type *</label>
            <select [(ngModel)]="ed.bankDetails.accountType" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="Current">Current</option>
              <option value="Savings">Savings</option>
              <option value="Current Account">Current Account</option>
              <option value="Savings Account">Savings Account</option>
            </select>
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Account Holder Name *</label>
            <input type="text" [(ngModel)]="ed.bankDetails.accountHolderName" class="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Account Number *</label>
            <input type="text" [(ngModel)]="ed.bankDetails.accountNo" class="w-full px-2.5 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">IFSC Code *</label>
            <input type="text" [(ngModel)]="ed.bankDetails.ifscCode" class="w-full px-2.5 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">MICR Code (Optional)</label>
            <input type="text" [(ngModel)]="ed.bankDetails.micrCode" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div class="sm:col-span-2 lg:col-span-4">
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Branch Address *</label>
            <input type="text" [(ngModel)]="ed.bankDetails.branchAddress" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      } @else {
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
      }

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