import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';
import {
  ACCOUNT_TYPES,
  BANKS_MASTER,
  TRANSFER_MODES
} from '../../../../../registration/models/otr-form.model';
import { FormInputComponent } from '../../../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

/**
 * Step 2: bank account details and cancelled cheque (editable).
 * Deliberately stays on default change detection: the state objects are mutated in place.
 */
@Component({
  selector: 'app-step2-bank-details',
  standalone: true,
  imports: [
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent
  ],
  host: { class: 'block' },
  template: `
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">3</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Bank Account Details</h2>
        </div>
        <span class="text-xs text-slate-500 font-mono font-semibold truncate">IFSC: {{ state.editableStep4.ifscCode || '-' }}</span>
      </div>

      <div class="p-4 sm:p-5 w-full font-sans">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <!-- Bank Name, Branch Name, Transfer Mode, Account Type -->
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-select
              label="Name of the Bank"
              [value]="state.editableStep4.bankName"
              (valueChange)="state.editableStep4.bankName = $event"
              [options]="banks"
              placeholder="Select bank"
              [required]="true"
            ></app-form-select>
          </div>

          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input
              label="Branch Name"
              [value]="state.editableStep4.branchName"
              (valueChange)="state.editableStep4.branchName = $event"
              placeholder="Enter branch name"
              [required]="true"
              [maxLength]="150"
            ></app-form-input>
          </div>

          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-select
              label="Transfer Mode"
              [value]="state.editableStep4.transferMode"
              (valueChange)="state.editableStep4.transferMode = $event"
              [options]="transferModes"
              placeholder="Select mode"
              [required]="true"
            ></app-form-select>
          </div>

          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-select
              label="Account Type"
              [value]="state.editableStep4.accountType"
              (valueChange)="state.editableStep4.accountType = $event"
              [options]="accountTypes"
              placeholder="Select account type"
              [required]="true"
            ></app-form-select>
          </div>

          <!-- Account Holder, Account No, IFSC, MICR -->
          <div class="lg:col-span-5 sm:col-span-1">
            <app-form-input
              label="Account Holder Name"
              [value]="state.editableStep4.accountHolderName"
              (valueChange)="state.editableStep4.accountHolderName = $event"
              placeholder="Enter account holder name"
              [required]="true"
              [maxLength]="200"
            ></app-form-input>
          </div>

          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="Account Number"
              type="tel"
              [value]="state.editableStep4.accountNo"
              (valueChange)="state.editableStep4.accountNo = $event"
              placeholder="Enter account number"
              [required]="true"
              [maxLength]="30"
            ></app-form-input>
          </div>

          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input
              label="IFSC Code"
              [value]="state.editableStep4.ifscCode"
              (valueChange)="state.editableStep4.ifscCode = $event"
              placeholder="Enter IFSC code"
              [required]="true"
              [uppercase]="true"
              [maxLength]="11"
              [infoTooltip]="'11-character alphanumeric code (e.g. SBIN0031804)'"
            ></app-form-input>
          </div>

          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input
              label="MICR Code (Optional)"
              type="tel"
              [value]="state.editableStep4.micrCode"
              (valueChange)="state.editableStep4.micrCode = $event"
              placeholder="Enter MICR code (9 digits)"
              [maxLength]="9"
            ></app-form-input>
          </div>

          <!-- Branch Address -->
          <div class="lg:col-span-12 sm:col-span-2">
            <app-form-textarea
              label="Branch Address"
              [value]="state.editableStep4.branchAddress"
              (valueChange)="state.editableStep4.branchAddress = $event"
              placeholder="Enter branch address, street, locality, city, PIN code"
              [required]="true"
            ></app-form-textarea>
          </div>

          <!-- Cancelled Cheque -->
          <div class="lg:col-span-12 sm:col-span-2 pt-1 border-t border-slate-100">
            <app-form-file-upload
              label="Upload Cancelled Cheque / Bank Passbook"
              [fileDoc]="state.editableStep4.cancelledChequeDoc"
              (fileChange)="state.editableStep4.cancelledChequeDoc = $event"
              [required]="true"
              accept=".pdf,.jpg,.jpeg,.png"
              [maxSizeMb]="5"
            ></app-form-file-upload>
          </div>
        </div>
      </div>
    </section>
  `
})
export class Step2BankDetailsComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly banks = BANKS_MASTER;
  protected readonly transferModes = TRANSFER_MODES;
  protected readonly accountTypes = ACCOUNT_TYPES;
}
