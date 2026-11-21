import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';
import {
  ACCOUNT_TYPES,
  BANKS_MASTER,
  TRANSFER_MODES
} from '../../../../../registration/models/otr-form.model';
import { FormInputComponent } from '../../../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../../shared/components/form-controls/form-select/form-select.component';
import { FormFileUploadComponent } from '../../../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

/**
 * Step 2: Bank Account Details and Cancelled Cheque
 *
 * Displays verified OTR bank details and allows editing when Step 2 edit mode is active.
 */
@Component({
  selector: 'app-step2-bank-details',
  standalone: true,
  imports: [
    FormInputComponent,
    FormSelectComponent,
    FormFileUploadComponent
  ],
  host: { class: 'block' },
  template: `
    <section class="border border-[#EADCE2] rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-white px-5 py-3.5 border-b border-[#EADCE2] flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-full bg-[#D73389] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
          <h2 class="text-base sm:text-[17px] font-bold text-[#D73389] m-0">Bank Account Details</h2>
        </div>
        <span class="text-xs text-slate-500 tabular-nums font-semibold truncate">IFSC: {{ state.editableStep4.ifscCode || '-' }}</span>
      </div>

      <div class="p-5 sm:p-6 w-full space-y-6 font-sans">
        <!-- 1. Bank & Account Details -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#D73389] tracking-tight m-0">
              Bank &amp; Account Details
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- Bank Name -->
            <div>
              <app-form-select
                label="Name of the Bank"
                [value]="state.editableStep4.bankName"
                (valueChange)="state.editableStep4.bankName = $event"
                [options]="banks"
                placeholder="Select bank"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- Branch Name -->
            <div>
              <app-form-input
                label="Branch Name"
                [value]="state.editableStep4.branchName"
                (valueChange)="state.editableStep4.branchName = $event"
                placeholder="Enter branch name"
                [required]="true"
                [maxLength]="150"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Account Holder Name -->
            <div>
              <app-form-input
                label="Account Holder Name"
                [value]="state.editableStep4.accountHolderName"
                (valueChange)="state.editableStep4.accountHolderName = $event"
                placeholder="Enter account holder name"
                [required]="true"
                [maxLength]="200"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Account Number -->
            <div>
              <app-form-input
                label="Account Number"
                type="tel"
                [value]="state.editableStep4.accountNo"
                (valueChange)="state.editableStep4.accountNo = $event"
                placeholder="Enter account number"
                [required]="true"
                [maxLength]="30"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- IFSC Code -->
            <div>
              <app-form-input
                label="IFSC Code"
                [value]="state.editableStep4.ifscCode"
                (valueChange)="state.editableStep4.ifscCode = $event"
                placeholder="Enter IFSC code"
                [required]="true"
                [uppercase]="true"
                [maxLength]="11"
                [infoTooltip]="'11-character alphanumeric code (e.g. SBIN0031804)'"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- MICR Code -->
            <div>
              <app-form-input
                label="MICR Code (Optional)"
                type="tel"
                [value]="state.editableStep4.micrCode"
                (valueChange)="state.editableStep4.micrCode = $event"
                placeholder="Enter MICR code (9 digits)"
                [maxLength]="9"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#EADCE2]"></div>

        <!-- 2. Bank Verification Document -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#D73389] tracking-tight m-0">
              Bank Verification Document
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <div class="col-span-1">
              <app-form-file-upload
                label="Upload Cancelled Cheque / Bank Passbook"
                [dropzoneStyle]="true"
                uploadPrompt="Upload Cancelled Cheque / Bank Passbook"
                [fileDoc]="state.editableStep4.cancelledChequeDoc"
                (fileChange)="state.editableStep4.cancelledChequeDoc = $event"
                [required]="true"
                accept=".pdf,.jpg,.jpeg,.png"
                [maxSizeMb]="5"
                [disabled]="!state.isEditingStep2()"
              ></app-form-file-upload>
            </div>
          </div>
        </div>
      </div>
    </section>
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
      border-color: #EADCE2 !important;
      background-color: #FFFFFF !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-input > div > div.relative:hover:not(.cursor-not-allowed) {
      border-color: #D49A9A !important;
    }

    :host ::ng-deep app-form-input > div > div.relative:focus-within {
      border-color: #E865A6 !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
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
      border-color: #EADCE2 !important;
      background-color: #FFFFFF !important;
      font-size: 14px !important;
      color: #334155 !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-select button[type="button"]:hover:not(:disabled) {
      border-color: #D49A9A !important;
    }

    :host ::ng-deep app-form-select button[type="button"]:focus {
      border-color: #E865A6 !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-file-upload .rounded-lg.border,
    :host ::ng-deep app-form-file-upload .rounded-md.border {
      min-height: 72px !important;
      border-color: #EADCE2 !important;
      border-radius: 6px !important;
      background-color: #FFFFFF !important;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    :host ::ng-deep app-form-file-upload .rounded-lg.border:hover:not(.cursor-not-allowed) {
      border-color: #D49A9A !important;
      background-color: #F8FAFC !important;
    }
  `]
})
export class Step2BankDetailsComponent {
  protected readonly state = inject(SchemeFormState);
  protected readonly isReadOnly = true;

  protected readonly banks = BANKS_MASTER;
  protected readonly transferModes = TRANSFER_MODES;
  protected readonly accountTypes = ACCOUNT_TYPES;
}
