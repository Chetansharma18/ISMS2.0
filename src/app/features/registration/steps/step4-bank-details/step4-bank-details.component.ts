import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import {
  Step4BankDetails,
  BANKS_MASTER,
  TRANSFER_MODES,
  ACCOUNT_TYPES,
  FileDoc,
  REGEX
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

@Component({
  selector: 'app-step4-bank-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent
  ],
  template: `
    <div class="w-full font-sans">
      <!-- 12-column Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
        <!-- Row 1: Bank Name (4 cols), Branch Name (4 cols), Transfer Mode (2 cols), Account Type (2 cols) -->
        <div class="lg:col-span-4">
          <app-form-select
            label="Name of the Bank"
            [value]="data().bankName"
            (valueChange)="update('bankName', $event)"
            [options]="banks"
            placeholder="Select Bank"
            [required]="true"
            [error]="getFieldError('bankName')"
          ></app-form-select>
        </div>

        <div class="lg:col-span-4">
          <app-form-input
            label="Branch Name"
            [value]="data().branchName"
            (valueChange)="update('branchName', $event)"
            placeholder="e.g. C-Scheme Branch, Jaipur"
            [required]="true"
            [maxLength]="150"
            [error]="getFieldError('branchName')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-2">
          <app-form-select
            label="Transfer Mode"
            [value]="data().transferMode"
            (valueChange)="update('transferMode', $event)"
            [options]="transferModes"
            placeholder="Select Mode"
            [required]="true"
            [error]="getFieldError('transferMode')"
          ></app-form-select>
        </div>

        <div class="lg:col-span-2">
          <app-form-select
            label="Account Type"
            [value]="data().accountType"
            (valueChange)="update('accountType', $event)"
            [options]="accountTypes"
            placeholder="Select Type"
            [required]="true"
            [error]="getFieldError('accountType')"
          ></app-form-select>
        </div>

        <!-- Row 2: Account Holder Name (5 cols), Account No (3 cols), IFSC (2 cols), MICR (2 cols) -->
        <div class="lg:col-span-5">
          <app-form-input
            label="Account Holder Name"
            [value]="data().accountHolderName"
            (valueChange)="update('accountHolderName', $event)"
            placeholder="e.g. Rajasthan Skill Development Solutions Pvt Ltd"
            [required]="true"
            [maxLength]="200"
            [error]="getFieldError('accountHolderName')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-3">
          <app-form-input
            label="Account Number"
            type="tel"
            [value]="data().accountNo"
            (valueChange)="update('accountNo', $event)"
            placeholder="e.g. 50200012345678"
            [required]="true"
            [maxLength]="30"
            [error]="getFieldError('accountNo')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-2">
          <app-form-input
            label="IFSC Code"
            [value]="data().ifscCode"
            (valueChange)="update('ifscCode', $event)"
            placeholder="e.g. SBIN0031804"
            [required]="true"
            [uppercase]="true"
            [maxLength]="11"
            [error]="getFieldError('ifscCode')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-2">
          <app-form-input
            label="MICR Code"
            type="tel"
            [value]="data().micrCode"
            (valueChange)="update('micrCode', $event)"
            placeholder="9 digit code"
            [maxLength]="9"
            [error]="getFieldError('micrCode')"
          ></app-form-input>
        </div>

        <!-- Branch Address (12 cols) -->
        <div class="lg:col-span-12">
          <app-form-textarea
            label="Branch Full Address"
            [value]="data().branchAddress"
            (valueChange)="update('branchAddress', $event)"
            placeholder="Branch building, street, landmark, city"
            [required]="true"
            [error]="getFieldError('branchAddress')"
          ></app-form-textarea>
        </div>

        <!-- Row 3: Cheque Upload (12 cols) -->
        <div class="lg:col-span-12 pt-1 border-t border-slate-100">
          <app-form-file-upload
            label="Upload Cancelled Cheque / Bank Passbook"
            [fileDoc]="data().cancelledChequeDoc"
            (fileChange)="updateFileDoc('cancelledChequeDoc', $event)"
            [required]="true"
            accept=".pdf,.jpg,.jpeg,.png"
            [maxSizeMb]="5"
            [error]="getFieldError('cancelledChequeDoc')"
          ></app-form-file-upload>
        </div>
      </div>
    </div>
  `
})
export class Step4BankDetailsComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly banks = BANKS_MASTER;
  readonly transferModes = TRANSFER_MODES;
  readonly accountTypes = ACCOUNT_TYPES;
  readonly data = computed(() => this.otrFormService.step4());
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(4));

  getFieldError(field: string): string | undefined {
    if (!this.isSubmitted()) return undefined;
    const d = this.data();
    switch (field) {
      case 'bankName':
        if (!d.bankName?.trim()) return 'Bank Name is required';
        return undefined;
      case 'branchName':
        if (!d.branchName?.trim()) return 'Branch Name is required';
        return undefined;
      case 'transferMode':
        if (!d.transferMode?.trim()) return 'Mode of Transfer is required';
        return undefined;
      case 'accountType':
        if (!d.accountType?.trim()) return 'Account Type is required';
        return undefined;
      case 'accountHolderName':
        if (!d.accountHolderName?.trim()) return 'Account Holder Name is required';
        return undefined;
      case 'accountNo':
        if (!d.accountNo?.trim()) return 'Bank Account Number is required';
        if (!REGEX.BANK_ACCOUNT.test(d.accountNo)) return 'Invalid Account Number (9 to 18 digits)';
        return undefined;
      case 'ifscCode':
        if (!d.ifscCode?.trim()) return 'IFSC Code is required';
        if (!REGEX.IFSC.test(d.ifscCode.toUpperCase())) return 'Invalid IFSC Code (e.g. SBIN0031804)';
        return undefined;
      case 'micrCode':
        if (d.micrCode?.trim() && !REGEX.MICR.test(d.micrCode)) return 'Invalid MICR Code (9 digits)';
        return undefined;
      case 'branchAddress':
        if (!d.branchAddress?.trim()) return 'Branch Address is required';
        return undefined;
      case 'cancelledChequeDoc':
        if (!d.cancelledChequeDoc || d.cancelledChequeDoc.status !== 'uploaded') {
          return 'Cancelled Cheque or Bank Passbook upload is required';
        }
        return undefined;
      default:
        return undefined;
    }
  }

  update(field: keyof Step4BankDetails, value: string): void {
    this.otrFormService.updateStep4({ [field]: value });
  }

  updateFileDoc(field: 'cancelledChequeDoc', file: FileDoc | null): void {
    this.otrFormService.updateStep4({ [field]: file });
  }
}
