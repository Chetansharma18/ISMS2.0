import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import {
  Step4BankDetails,
  BANKS_MASTER,
  TRANSFER_MODES,
  ACCOUNT_TYPES,
  FileDoc
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';
import { FormSectionComponent } from '../../../../shared/components/form-controls/form-section/form-section.component';

@Component({
  selector: 'app-step4-bank-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormFileUploadComponent,
    FormSectionComponent
  ],
  template: `
    <div class="w-full space-y-4">

      <!-- Section 4.1: Bank Details -->
      <app-form-section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <app-form-select
            label="Name of the Bank"
            [value]="data().bankName"
            (valueChange)="update('bankName', $event)"
            [options]="banks"
            placeholder="Select Bank"
            [required]="true"
          ></app-form-select>

          <app-form-input
            label="Branch Name"
            [value]="data().branchName"
            (valueChange)="update('branchName', $event)"
            placeholder="e.g. C-Scheme Branch, Jaipur"
            [required]="true"
            [maxLength]="150"
          ></app-form-input>

          <app-form-select
            label="Mode of Transfer"
            [value]="data().transferMode"
            (valueChange)="update('transferMode', $event)"
            [options]="transferModes"
            placeholder="Select Mode (e.g. NEFT / RTGS)"
            [required]="true"
          ></app-form-select>

          <app-form-select
            label="Type of Account"
            [value]="data().accountType"
            (valueChange)="update('accountType', $event)"
            [options]="accountTypes"
            placeholder="Select Account Type (e.g. Current Account)"
            [required]="true"
          ></app-form-select>
        </div>
      </app-form-section>

      <!-- Section 4.2: Account Identification & Routing Codes -->
      <app-form-section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <app-form-input
            label="Account Holder Name"
            [value]="data().accountHolderName"
            (valueChange)="update('accountHolderName', $event)"
            placeholder="e.g. Rajasthan Skill Development Solutions Pvt Ltd"
            [required]="true"
            [maxLength]="200"
          ></app-form-input>

          <app-form-input
            label="Account No."
            type="tel"
            [value]="data().accountNo"
            (valueChange)="update('accountNo', $event)"
            placeholder="e.g. 50200012345678"
            [required]="true"
            [maxLength]="30"
          ></app-form-input>

          <app-form-input
            label="IFSC Code"
            [value]="data().ifscCode"
            (valueChange)="update('ifscCode', $event)"
            placeholder="e.g. SBIN0031804"
            [required]="true"
            [uppercase]="true"
            [maxLength]="11"
          ></app-form-input>

          <app-form-input
            label="MICR Code"
            type="tel"
            [value]="data().micrCode"
            (valueChange)="update('micrCode', $event)"
            placeholder="e.g. 302002005"
            [maxLength]="9"
          ></app-form-input>

         
        </div>
      </app-form-section>

      <!-- Section 4.3: Financial Verification Instrument -->
      <app-form-section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <div class="md:col-span-2">
            <app-form-file-upload
              label="Upload Cancelled Cheque"
              [fileDoc]="data().cancelledChequeDoc"
              (fileDocChange)="updateFileDoc('cancelledChequeDoc', $event)"
              [required]="true"
              accept=".pdf,.jpg,.jpeg,.png"
              [maxSizeMb]="5"
            ></app-form-file-upload>
          </div>
        </div>
      </app-form-section>

    </div>
  `
})
export class Step4BankDetailsComponent {
  private otrFormService = inject(OtrFormService);

  readonly banks = BANKS_MASTER;
  readonly transferModes = TRANSFER_MODES;
  readonly accountTypes = ACCOUNT_TYPES;
  readonly data = computed(() => this.otrFormService.step4());

  update(field: keyof Step4BankDetails, value: string): void {
    this.otrFormService.updateStep4({ [field]: value });
  }

  updateFileDoc(field: 'cancelledChequeDoc', file: FileDoc | null): void {
    this.otrFormService.updateStep4({ [field]: file });
  }
}
