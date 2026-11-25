import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';
import {
  DESIGNATIONS_MASTER,
  STATES_MASTER,
  IDENTITY_DOCUMENT_TYPES
} from '../../../../../registration/models/otr-form.model';
import { FormInputComponent } from '../../../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

interface DocConfig {
  label: string;
  placeholder: string;
  type: 'text' | 'tel';
  uppercase: boolean;
  maxLength: number;
}

const DOC_CONFIGS: Record<string, DocConfig> = {
  'Aadhaar Card': {
    label: 'Aadhaar Number',
    placeholder: 'Enter Aadhaar number',
    type: 'tel',
    uppercase: false,
    maxLength: 12
  },
  'PAN Card': {
    label: 'PAN Number',
    placeholder: 'Enter PAN number',
    type: 'text',
    uppercase: true,
    maxLength: 10
  },
  'Voter ID Card': {
    label: 'Voter ID Number',
    placeholder: 'Enter Voter ID number',
    type: 'text',
    uppercase: true,
    maxLength: 20
  },
  'Jan Aadhaar Card': {
    label: 'Jan Aadhaar Number',
    placeholder: 'Enter Jan Aadhaar number',
    type: 'text',
    uppercase: true,
    maxLength: 16
  },
  'Passport': {
    label: 'Passport Number',
    placeholder: 'Enter passport number',
    type: 'text',
    uppercase: true,
    maxLength: 8
  }
};

const DEFAULT_DOC_CONFIG: DocConfig = {
  label: 'Document Number',
  placeholder: 'Enter document number',
  type: 'text',
  uppercase: false,
  maxLength: 50
};

/**
 * Step 2: Authorized Signatory Details and Verification Documents
 *
 * Displays verified OTR signatory details and allows editing when Step 2 edit mode is active.
 */
@Component({
  selector: 'app-step2-authorized-person',
  standalone: true,
  imports: [
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent
  ],
  host: { class: 'block' },
  template: `
    <section class="border border-[#EADCE2] rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-white px-5 py-3.5 border-b border-[#EADCE2] flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
          <h2 class="text-base sm:text-[17px] font-bold text-[#7C0E44] m-0">Authorized Person Details</h2>
        </div>
        <span class="text-xs text-slate-500 tabular-nums font-semibold truncate">Designated Signatory</span>
      </div>

      <div class="p-5 sm:p-6 w-full space-y-6 font-sans">
        <!-- 1. Personal Information -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Personal Information
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- First Name -->
            <div>
              <app-form-input
                label="First Name"
                [value]="firstName"
                (valueChange)="onFirstNameChange($event)"
                placeholder="Enter first name"
                [required]="true"
                [maxLength]="50"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Last Name -->
            <div>
              <app-form-input
                label="Last Name"
                [value]="lastName"
                (valueChange)="onLastNameChange($event)"
                placeholder="Enter last name"
                [maxLength]="50"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Designation -->
            <div>
              <app-form-select
                label="Designation"
                [value]="state.editableStep3.designation"
                (valueChange)="state.editableStep3.designation = $event"
                [options]="designations"
                placeholder="Select designation"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#EADCE2]"></div>

        <!-- 2. Contact Information -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Contact Information
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- Mobile -->
            <div>
              <app-form-input
                label="Mobile Number"
                type="tel"
                [value]="state.editableStep3.mobileNo"
                (valueChange)="state.editableStep3.mobileNo = $event"
                placeholder="10-digit mobile number"
                [required]="true"
                [maxLength]="10"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Email -->
            <div>
              <app-form-input
                label="Email Address"
                type="email"
                [value]="state.editableStep3.emailId"
                (valueChange)="state.editableStep3.emailId = $event"
                placeholder="Enter email address"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- State -->
            <div>
              <app-form-select
                label="State"
                [value]="state.editableStep3.state"
                (valueChange)="state.editableStep3.state = $event"
                [options]="states"
                placeholder="Select state"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- Residential Address -->
            <div class="col-span-1 md:col-span-3">
              <app-form-textarea
                label="Residential Address"
                [value]="state.editableStep3.residenceAddress"
                (valueChange)="state.editableStep3.residenceAddress = $event"
                placeholder="Enter house/flat no., street, locality, city, PIN code"
                [rows]="2"
                [maxLength]="500"
                [disabled]="!state.isEditingStep2()"
              ></app-form-textarea>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#EADCE2]"></div>

        <!-- 3. Identity Verification -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Identity Verification
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- Identity Document Type -->
            <div>
              <app-form-select
                label="Identity Document Type"
                [value]="selectedDocType"
                (valueChange)="onDocTypeChange($event)"
                [options]="identityDocTypes"
                placeholder="Select identity document"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- Corresponding Document Number -->
            <div>
              <app-form-input
                [label]="currentDocConfig.label"
                [type]="currentDocConfig.type"
                [value]="currentDocNumber"
                (valueChange)="onDocNumberChange($event)"
                [placeholder]="currentDocConfig.placeholder"
                [required]="true"
                [uppercase]="currentDocConfig.uppercase"
                [maxLength]="currentDocConfig.maxLength"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Upload Identity Document -->
            <div class="col-span-1">
              <app-form-file-upload
                label="Upload Identity Document"
                [dropzoneStyle]="true"
                [uploadPrompt]="'Upload ' + (selectedDocType || 'Identity Document')"
                [fileDoc]="state.editableStep3.idProofDoc"
                (fileChange)="state.editableStep3.idProofDoc = $event"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-file-upload>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#EADCE2]"></div>

        <!-- 4. Authorization Documents -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Authorization Documents
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <div class="col-span-1">
              <app-form-file-upload
                label="Authorization Letter / Board Resolution"
                [dropzoneStyle]="true"
                uploadPrompt="Upload Authorization Letter / Board Resolution"
                [fileDoc]="state.editableStep3.authorizationLetterDoc"
                (fileChange)="state.editableStep3.authorizationLetterDoc = $event"
                [required]="true"
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
    :host ::ng-deep app-form-textarea label,
    :host ::ng-deep app-form-file-upload label {
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #334155 !important;
      margin-bottom: 6px !important;
    }

    :host ::ng-deep app-form-input label .text-rose-600,
    :host ::ng-deep app-form-select label .text-rose-600,
    :host ::ng-deep app-form-textarea label .text-rose-600,
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
      border-color: #AA5E7A !important;
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
      border-color: #AA5E7A !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-textarea textarea {
      min-height: 72px !important;
      border-radius: 6px !important;
      border-color: #EADCE2 !important;
      background-color: #FFFFFF !important;
      font-size: 14px !important;
      color: #334155 !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-textarea textarea:hover:not(:disabled) {
      border-color: #D49A9A !important;
    }

    :host ::ng-deep app-form-textarea textarea:focus {
      border-color: #AA5E7A !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-textarea textarea::placeholder {
      color: #94A3B8 !important;
      font-size: 14px !important;
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
export class Step2AuthorizedPersonComponent {
  protected readonly state = inject(SchemeFormState);
  protected readonly isReadOnly = true;

  protected readonly designations = DESIGNATIONS_MASTER;
  protected readonly states = STATES_MASTER;
  protected readonly identityDocTypes = IDENTITY_DOCUMENT_TYPES;

  /** First name: stored value when present, otherwise the first word of the full name. */
  protected get firstName(): string {
    const p = this.state.editableStep3;
    if (p.firstName !== undefined && p.firstName !== null) return p.firstName;
    return p.name ? (p.name.trim().split(/\s+/)[0] ?? '') : '';
  }

  /** Last name: stored value when present, otherwise everything after the first word of the full name. */
  protected get lastName(): string {
    const p = this.state.editableStep3;
    if (p.lastName !== undefined && p.lastName !== null) return p.lastName;
    return p.name ? p.name.trim().split(/\s+/).slice(1).join(' ') : '';
  }

  protected onFirstNameChange(value: string): void {
    this.applyName(value, this.lastName);
  }

  protected onLastNameChange(value: string): void {
    this.applyName(this.firstName, value);
  }

  private applyName(first: string, last: string): void {
    const p = this.state.editableStep3;
    p.firstName = first;
    p.lastName = last;
    p.name = [first.trim(), last.trim()].filter(Boolean).join(' ');
  }

  protected get selectedDocType(): string {
    const p = this.state.editableStep3;
    if (p.identityDocType) return p.identityDocType;
    if (p.aadhaarNo) return 'Aadhaar Card';
    if (p.pan) return 'PAN Card';
    if (p.voterIdNo) return 'Voter ID Card';
    if (p.bhamashahNo) return 'Jan Aadhaar Card';
    if (p.passportNo) return 'Passport';
    return 'Aadhaar Card';
  }

  protected get currentDocConfig(): DocConfig {
    return DOC_CONFIGS[this.selectedDocType] || DEFAULT_DOC_CONFIG;
  }

  protected get currentDocNumber(): string {
    const p = this.state.editableStep3;
    if (p.identityDocNumber) return p.identityDocNumber;
    switch (this.selectedDocType) {
      case 'Aadhaar Card': return p.aadhaarNo || '';
      case 'PAN Card': return p.pan || '';
      case 'Voter ID Card': return p.voterIdNo || '';
      case 'Jan Aadhaar Card': return p.bhamashahNo || '';
      case 'Passport': return p.passportNo || '';
      default: return p.identityDocNumber || '';
    }
  }

  protected onDocTypeChange(type: string): void {
    const p = this.state.editableStep3;
    p.identityDocType = type;
  }

  protected onDocNumberChange(num: string): void {
    const p = this.state.editableStep3;
    p.identityDocNumber = num;
    switch (this.selectedDocType) {
      case 'Aadhaar Card': p.aadhaarNo = num; break;
      case 'PAN Card': p.pan = num; break;
      case 'Voter ID Card': p.voterIdNo = num; break;
      case 'Jan Aadhaar Card': p.bhamashahNo = num; break;
      case 'Passport': p.passportNo = num; break;
    }
  }
}

