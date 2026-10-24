import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import {
  Step3AuthorizedPerson,
  DESIGNATIONS_MASTER,
  STATES_MASTER,
  IDENTITY_DOCUMENT_TYPES,
  FileDoc,
  REGEX
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

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

@Component({
  selector: 'app-step3-auth-person',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent
  ],
  template: `
    <div class="w-full space-y-6 font-sans">

      <!-- ====================================================================
           1. PERSONAL INFORMATION
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          1. Personal Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <!-- Row 1: First Name * (50%) -->
          <div>
            <app-form-input
              label="First Name"
              [value]="firstName()"
              (valueChange)="onFirstNameChange($event)"
              placeholder="Enter first name"
              [required]="true"
              [maxLength]="50"
              [error]="getFieldError('firstName')"
            ></app-form-input>
          </div>

          <!-- Row 1: Last Name (50%) -->
          <div>
            <app-form-input
              label="Last Name"
              [value]="lastName()"
              (valueChange)="onLastNameChange($event)"
              placeholder="Enter last name"
              [required]="false"
              [maxLength]="50"
              [error]="getFieldError('lastName')"
            ></app-form-input>
          </div>

          <!-- Row 2: Designation (Full width or Col 1) -->
          <div class="col-span-1 md:col-span-2">
            <app-form-select
              label="Designation"
              [value]="data().designation"
              (valueChange)="update('designation', $event)"
              [options]="designations"
              placeholder="Select designation"
              [required]="false"
              [error]="getFieldError('designation')"
            ></app-form-select>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="pt-2 border-t border-slate-100"></div>

      <!-- ====================================================================
           2. CONTACT INFORMATION
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          2. Contact Information
        </h3>

        <div class="space-y-4">
          <!-- Row 1: Mobile Number * (50%) & Email Address * (50%) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <app-form-input
                label="Mobile Number"
                type="tel"
                [value]="data().mobileNo"
                (valueChange)="update('mobileNo', $event)"
                placeholder="10-digit mobile number"
                [required]="true"
                [maxLength]="10"
                [error]="getFieldError('mobileNo')"
              ></app-form-input>
            </div>

            <div>
              <app-form-input
                label="Email Address"
                type="email"
                [value]="data().emailId"
                (valueChange)="update('emailId', $event)"
                placeholder="Enter email address"
                [required]="true"
                [error]="getFieldError('emailId')"
              ></app-form-input>
            </div>
          </div>

          <!-- Row 2: State (smaller column) & Residential Address (remaining width) -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            <div class="md:col-span-4">
              <app-form-select
                label="State"
                [value]="data().state"
                (valueChange)="update('state', $event)"
                [options]="states"
                placeholder="Select state"
                [required]="false"
                [error]="getFieldError('state')"
              ></app-form-select>
            </div>

            <div class="md:col-span-8">
              <app-form-textarea
                label="Residential Address"
                [value]="data().residenceAddress"
                (valueChange)="update('residenceAddress', $event)"
                placeholder="Enter house/flat no., street, locality, city, PIN code"
                [rows]="1"
                [maxLength]="500"
                [required]="false"
                [error]="getFieldError('residenceAddress')"
              ></app-form-textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="pt-2 border-t border-slate-100"></div>

      <!-- ====================================================================
           3. IDENTITY VERIFICATION
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          3. Identity Verification
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <!-- A. Identity Document Type * -->
          <div>
            <app-form-select
              label="Identity Document Type"
              [value]="selectedDocType()"
              (valueChange)="onDocTypeChange($event)"
              [options]="identityDocTypes"
              placeholder="Select identity document"
              [required]="true"
              [error]="getFieldError('identityDocType')"
            ></app-form-select>
          </div>

          <!-- B. Corresponding Document Number * -->
          <div>
            <app-form-input
              [label]="currentDocConfig().label"
              [type]="currentDocConfig().type"
              [value]="currentDocNumber()"
              (valueChange)="onDocNumberChange($event)"
              [placeholder]="currentDocConfig().placeholder"
              [required]="true"
              [uppercase]="currentDocConfig().uppercase"
              [maxLength]="currentDocConfig().maxLength"
              [disabled]="!selectedDocType()"
              [error]="getFieldError('identityDocNumber')"
            ></app-form-input>
          </div>

          <!-- C. Upload Identity Document * (Full width) -->
          <div class="col-span-1 md:col-span-2">
            <app-form-file-upload
              label="Upload Identity Document"
              [dropzoneStyle]="true"
              [uploadPrompt]="'Upload ' + (selectedDocType() || 'Identity Document')"
              [fileDoc]="data().idProofDoc"
              (fileChange)="updateFileDoc('idProofDoc', $event)"
              [required]="true"
              [disabled]="!selectedDocType()"
              [error]="getFieldError('idProofDoc')"
            ></app-form-file-upload>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="pt-2 border-t border-slate-100"></div>

      <!-- ====================================================================
           4. AUTHORIZATION DOCUMENTS
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          4. Authorization Documents
        </h3>

        <div>
          <app-form-file-upload
            label="Authorization Letter / Board Resolution"
            [dropzoneStyle]="true"
            uploadPrompt="Upload Authorization Letter / Board Resolution"
            [fileDoc]="data().authorizationLetterDoc"
            (fileChange)="updateFileDoc('authorizationLetterDoc', $event)"
            [required]="true"
            [error]="getFieldError('authorizationLetterDoc')"
          ></app-form-file-upload>
        </div>
      </section>

    </div>
  `
})
export class Step3AuthPersonComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly designations = DESIGNATIONS_MASTER;
  readonly states = STATES_MASTER;
  readonly identityDocTypes = IDENTITY_DOCUMENT_TYPES;

  readonly data = computed(() => this.otrFormService.step3());
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(2));

  readonly firstName = computed(() => {
    const d = this.data();
    if (d.firstName !== undefined && d.firstName !== null) {
      return d.firstName;
    }
    if (d.name) {
      const parts = d.name.trim().split(/\s+/);
      return parts[0] || '';
    }
    return '';
  });

  readonly lastName = computed(() => {
    const d = this.data();
    if (d.lastName !== undefined && d.lastName !== null) {
      return d.lastName;
    }
    if (d.name) {
      const parts = d.name.trim().split(/\s+/);
      return parts.slice(1).join(' ') || '';
    }
    return '';
  });

  readonly selectedDocType = computed(() => {
    const d = this.data();
    if (d.identityDocType) return d.identityDocType;
    if (d.aadhaarNo) return 'Aadhaar Card';
    if (d.pan) return 'PAN Card';
    if (d.voterIdNo) return 'Voter ID Card';
    if (d.bhamashahNo) return 'Jan Aadhaar Card';
    if (d.passportNo) return 'Passport';
    return 'Aadhaar Card';
  });

  readonly currentDocConfig = computed(() => {
    const type = this.selectedDocType();
    return DOC_CONFIGS[type] || DEFAULT_DOC_CONFIG;
  });

  readonly currentDocNumber = computed(() => {
    const d = this.data();
    if (d.identityDocNumber !== undefined && d.identityDocNumber !== null && d.identityDocNumber !== '') {
      return d.identityDocNumber;
    }
    const type = this.selectedDocType();
    switch (type) {
      case 'Aadhaar Card': return d.aadhaarNo || '';
      case 'PAN Card': return d.pan || '';
      case 'Voter ID Card': return d.voterIdNo || '';
      case 'Jan Aadhaar Card': return d.bhamashahNo || '';
      case 'Passport': return d.passportNo || '';
      default: return '';
    }
  });

  onFirstNameChange(value: string): void {
    const first = value;
    const last = this.lastName();
    const fullName = [first.trim(), last.trim()].filter(Boolean).join(' ');
    this.otrFormService.updateStep3({
      firstName: first,
      lastName: last,
      name: fullName
    });
  }

  onLastNameChange(value: string): void {
    const first = this.firstName();
    const last = value;
    const fullName = [first.trim(), last.trim()].filter(Boolean).join(' ');
    this.otrFormService.updateStep3({
      firstName: first,
      lastName: last,
      name: fullName
    });
  }

  onDocTypeChange(newType: string): void {
    // When document type changes:
    // 1. Clear previous document number
    // 2. Clear mapped numbers
    // 3. Reset uploaded identity file so mismatched file isn't submitted
    this.otrFormService.updateStep3({
      identityDocType: newType,
      identityDocNumber: '',
      pan: '',
      aadhaarNo: '',
      voterIdNo: '',
      bhamashahNo: '',
      passportNo: '',
      idProofDoc: null
    });
  }

  onDocNumberChange(value: string): void {
    const clean = value.trim();
    const type = this.selectedDocType();
    const updates: Partial<Step3AuthorizedPerson> = {
      identityDocNumber: clean
    };

    // Synchronize to statutory backend fields for complete compatibility
    if (type === 'Aadhaar Card') {
      updates.aadhaarNo = clean;
    } else if (type === 'PAN Card') {
      updates.pan = clean.toUpperCase();
    } else if (type === 'Voter ID Card') {
      updates.voterIdNo = clean.toUpperCase();
    } else if (type === 'Jan Aadhaar Card') {
      updates.bhamashahNo = clean.toUpperCase();
    } else if (type === 'Passport') {
      updates.passportNo = clean.toUpperCase();
    }

    this.otrFormService.updateStep3(updates);
  }

  getFieldError(field: string): string | undefined {
    if (!this.isSubmitted()) return undefined;
    const d = this.data();
    switch (field) {
      case 'firstName':
      case 'name':
        if (!this.firstName()?.trim() && !d.name?.trim()) return 'Authorized Person First Name is required';
        return undefined;
      case 'lastName':
        return undefined;
      case 'mobileNo':
        if (!d.mobileNo?.trim()) return 'Mobile Number is required';
        if (!REGEX.INDIAN_MOBILE.test(d.mobileNo)) return 'Invalid 10-digit Mobile Number';
        return undefined;
      case 'emailId':
        if (!d.emailId?.trim()) return 'Email Address is required';
        if (!REGEX.EMAIL.test(d.emailId)) return 'Invalid Email Address format';
        return undefined;
      case 'identityDocType':
        if (!this.selectedDocType()) return 'Identity Document Type is required';
        return undefined;
      case 'identityDocNumber': {
        const type = this.selectedDocType();
        const num = this.currentDocNumber().trim();
        if (!type) return 'Identity Document Type is required';
        if (!num) return `${this.currentDocConfig().label} is required`;
        switch (type) {
          case 'Aadhaar Card':
            if (!REGEX.AADHAAR.test(num)) return 'Invalid 12-digit Aadhaar Number';
            break;
          case 'PAN Card':
            if (!REGEX.PAN.test(num.toUpperCase())) return 'Invalid PAN format (e.g. ABCDE1234F)';
            break;
          case 'Voter ID Card':
            if (!REGEX.VOTER_ID.test(num.toUpperCase())) return 'Invalid Voter ID format';
            break;
          case 'Jan Aadhaar Card':
            if (!/^[0-9A-Za-z-]{7,16}$/.test(num)) return 'Invalid Jan Aadhaar Number format';
            break;
          case 'Passport':
            if (!REGEX.PASSPORT.test(num.toUpperCase())) return 'Invalid Passport Number format';
            break;
        }
        return undefined;
      }
      case 'idProofDoc':
        if (!d.idProofDoc || d.idProofDoc.status !== 'uploaded') {
          return 'Identity Document upload is required';
        }
        return undefined;
      case 'authorizationLetterDoc':
        if (!d.authorizationLetterDoc || d.authorizationLetterDoc.status !== 'uploaded') {
          return 'Authorization Letter upload is required';
        }
        return undefined;
      default:
        return undefined;
    }
  }

  update(field: keyof Step3AuthorizedPerson, value: string): void {
    this.otrFormService.updateStep3({ [field]: value });
  }

  updateFileDoc(field: 'authorizationLetterDoc' | 'idProofDoc', file: FileDoc | null): void {
    this.otrFormService.updateStep3({ [field]: file });
  }
}
