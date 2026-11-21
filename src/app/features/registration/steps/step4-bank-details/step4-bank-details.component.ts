import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
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
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

@Component({
  selector: 'app-step4-bank-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormFileUploadComponent
  ],
  template: `
    <div class="w-full space-y-6 font-sans">

      <!-- ====================================================================
           1. BANK & ACCOUNT DETAILS
           ==================================================================== -->
      <section class="space-y-4">
        <div class="pb-2 border-b border-[#E8EEF5]">
          <h3 class="text-[19px] font-semibold text-[#1E3A5F] tracking-tight m-0">
            1. Bank &amp; Account Details
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
          <!-- Row 1: Bank Name * (Col 1) -->
          <div>
            <app-form-select
              label="Name of the Bank"
              [value]="data().bankName"
              (valueChange)="update('bankName', $event)"
              [options]="banks"
              placeholder="Select bank"
              [required]="true"
              [error]="getFieldError('bankName')"
            ></app-form-select>
          </div>

          <!-- Row 1: Branch Name * (Col 2) -->
          <div>
            <app-form-input
              label="Branch Name"
              [value]="data().branchName"
              (valueChange)="update('branchName', $event)"
              (blur)="markTouched('branchName')"
              placeholder="Enter branch name"
              [required]="true"
              [maxLength]="150"
              [error]="getFieldError('branchName')"
            ></app-form-input>
          </div>

          <!-- Row 2: Account Holder Name * (Col 1) -->
          <div>
            <app-form-input
              label="Account Holder Name"
              [value]="data().accountHolderName"
              (valueChange)="update('accountHolderName', $event)"
              (blur)="markTouched('accountHolderName')"
              placeholder="Enter account holder name"
              [required]="true"
              [maxLength]="200"
              [error]="getFieldError('accountHolderName')"
            ></app-form-input>
          </div>

          <!-- Row 2: Account Number * (Col 2) -->
          <div>
            <app-form-input
              label="Account Number"
              type="tel"
              [numericOnly]="true"
              [value]="data().accountNo"
              (valueChange)="update('accountNo', $event)"
              (blur)="markTouched('accountNo')"
              placeholder="Enter account number"
              [required]="true"
              [maxLength]="30"
              [error]="getFieldError('accountNo')"
            ></app-form-input>
          </div>

          <!-- Row 3: IFSC Code * (Col 1) -->
          <div>
            <app-form-input
              label="IFSC Code"
              [value]="data().ifscCode"
              (valueChange)="update('ifscCode', $event)"
              (blur)="markTouched('ifscCode')"
              placeholder="Enter IFSC code"
              [required]="true"
              [uppercase]="true"
              [maxLength]="11"
              [infoTooltip]="'11-character alphanumeric code (e.g. SBIN0031804)'"
              [error]="getFieldError('ifscCode')"
            ></app-form-input>
          </div>

          <!-- Row 3: MICR Code (Optional) (Col 2) -->
          <div>
            <app-form-input
              label="MICR Code (Optional)"
              type="tel"
              [numericOnly]="true"
              [value]="data().micrCode"
              (valueChange)="update('micrCode', $event)"
              (blur)="markTouched('micrCode')"
              placeholder="Enter MICR code (9 digits)"
              [maxLength]="9"
              [error]="getFieldError('micrCode')"
            ></app-form-input>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="pt-2 border-t border-[#E8EEF5]"></div>

      <!-- ====================================================================
           2. BANK VERIFICATION DOCUMENT
           ==================================================================== -->
      <section class="space-y-4">
        <div class="pb-2 border-b border-[#E8EEF5]">
          <h3 class="text-[19px] font-semibold text-[#1E3A5F] tracking-tight m-0">
            2. Bank Verification Document
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
          <div class="col-span-1">
            <app-form-file-upload
              label="Upload Cancelled Cheque / Bank Passbook"
              [dropzoneStyle]="true"
              uploadPrompt="Upload Cancelled Cheque / Bank Passbook"
              [fileDoc]="data().cancelledChequeDoc"
              (fileChange)="updateFileDoc('cancelledChequeDoc', $event)"
              [required]="true"
              accept=".pdf,.jpg,.jpeg,.png"
              [maxSizeMb]="25"
              [error]="getFieldError('cancelledChequeDoc')"
            ></app-form-file-upload>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    :host ::ng-deep app-form-input label,
    :host ::ng-deep app-form-select label,
    :host ::ng-deep app-form-file-upload label {
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #334155 !important;
      margin-bottom: 6px !important;
    }

    :host ::ng-deep app-form-input label .text-rose-600,
    :host ::ng-deep app-form-select label .text-rose-600,
    :host ::ng-deep app-form-file-upload label .text-rose-500 {
      color: #DC2626 !important;
    }

    :host ::ng-deep app-form-input > div > div.relative {
      height: 44px !important;
      min-height: 44px !important;
      border-radius: 6px !important;
      border-color: #D6E3F0 !important;
      background-color: #FFFFFF !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-input > div > div.relative:hover:not(.cursor-not-allowed) {
      border-color: #B5CBE0 !important;
    }

    :host ::ng-deep app-form-input > div > div.relative:not(.border-rose-600):focus-within {
      border-color: #477DAF !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-input > div > div.relative.border-rose-600:focus-within {
      border-color: #DC2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
    }

    :host ::ng-deep app-form-input input {
      font-size: 14px !important;
      color: #334155 !important;
    }

    :host ::ng-deep app-form-input input::placeholder {
      color: #94A3B8 !important;
      font-size: 14px !important;
    }

    :host ::ng-deep app-form-select button[type="button"] {
      height: 44px !important;
      min-height: 44px !important;
      border-radius: 6px !important;
      border-color: #D6E3F0 !important;
      background-color: #FFFFFF !important;
      font-size: 14px !important;
      color: #334155 !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-select button[type="button"]:hover:not(:disabled) {
      border-color: #B5CBE0 !important;
    }

    :host ::ng-deep app-form-select button[type="button"]:focus {
      border-color: #477DAF !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-file-upload .rounded-lg.border,
    :host ::ng-deep app-form-file-upload .rounded-md.border {
      min-height: 72px !important;
      border-color: #D6E3F0 !important;
      border-radius: 6px !important;
      background-color: #FFFFFF !important;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    :host ::ng-deep app-form-file-upload .rounded-lg.border:hover:not(.cursor-not-allowed) {
      border-color: #B5CBE0 !important;
      background-color: #F8FAFC !important;
    }
  `]
})
export class Step4BankDetailsComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly banks = BANKS_MASTER;
  readonly transferModes = TRANSFER_MODES;
  readonly accountTypes = ACCOUNT_TYPES;
  readonly data = computed(() => this.otrFormService.step4());
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(3));
  readonly touchedFields = signal<Set<string>>(new Set<string>());

  markTouched(field: string): void {
    this.touchedFields.update(set => {
      if (set.has(field)) return set;
      const next = new Set(set);
      next.add(field);
      return next;
    });
  }

  getFieldError(field: string): string | undefined {
    const isSubmitted = this.isSubmitted();
    const isTouched = this.touchedFields().has(field);
    const d = this.data();

    if (field === 'bankName') {
      if ((isSubmitted || isTouched) && !d.bankName?.trim()) return 'Bank Name is required';
      return undefined;
    }
    if (field === 'branchName') {
      if ((isSubmitted || isTouched) && !d.branchName?.trim()) return 'Branch Name is required';
      return undefined;
    }
    if (field === 'accountHolderName') {
      if ((isSubmitted || isTouched) && !d.accountHolderName?.trim()) return 'Account Holder Name is required';
      return undefined;
    }
    if (field === 'accountNo') {
      if ((isSubmitted || isTouched) && !d.accountNo?.trim()) return 'Bank Account Number is required';
      if (d.accountNo?.trim() && !REGEX.BANK_ACCOUNT.test(d.accountNo)) return 'Invalid Account Number (9 to 18 digits)';
      return undefined;
    }
    if (field === 'ifscCode') {
      if ((isSubmitted || isTouched) && !d.ifscCode?.trim()) return 'IFSC Code is required';
      if (d.ifscCode?.trim() && !REGEX.IFSC.test(d.ifscCode.toUpperCase())) return 'Invalid IFSC Code (e.g. SBIN0031804)';
      return undefined;
    }
    if (field === 'micrCode') {
      if (d.micrCode?.trim() && !REGEX.MICR.test(d.micrCode)) return 'Invalid MICR Code (9 digits)';
      return undefined;
    }
    if (field === 'cancelledChequeDoc') {
      if (isSubmitted && (!d.cancelledChequeDoc || d.cancelledChequeDoc.status !== 'uploaded')) {
        return 'Cancelled Cheque or Bank Passbook upload is required';
      }
      return undefined;
    }
    return undefined;
  }

  update(field: keyof Step4BankDetails, value: string): void {
    this.otrFormService.updateStep4({ [field]: value });
  }

  updateFileDoc(field: 'cancelledChequeDoc', file: FileDoc | null): void {
    this.otrFormService.updateStep4({ [field]: file });
  }
}
