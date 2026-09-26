import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import {
  Step3AuthorizedPerson,
  DESIGNATIONS_MASTER,
  STATES_MASTER,
  FileDoc,
  REGEX
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

@Component({
  selector: 'app-step3-auth-person',
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
        <!-- Full Name -> 5 cols -->
        <div class="lg:col-span-5 sm:col-span-1">
          <app-form-input
            label="Full Name"
            [value]="data().name"
            (valueChange)="update('name', $event)"
            placeholder="e.g. Vikramaditya Singh"
            [required]="true"
            [maxLength]="100"
            [error]="getFieldError('name')"
          ></app-form-input>
        </div>

        <!-- Designation -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-select
            label="Designation"
            [value]="data().designation"
            (valueChange)="update('designation', $event)"
            [options]="designations"
            placeholder="Select Designation"
            [required]="false"
          ></app-form-select>
        </div>

        <!-- DOB -> 2 cols -->
        <div class="lg:col-span-2 sm:col-span-1">
          <app-form-input
            label="Date of Birth"
            type="date"
            [value]="data().dob"
            (valueChange)="update('dob', $event)"
            [required]="true"
            [error]="getFieldError('dob')"
          ></app-form-input>
        </div>

        <!-- Age -> 2 cols -->
        <div class="lg:col-span-2 sm:col-span-1">
          <app-form-input
            label="Age"
            [value]="data().age ? data().age + ' Years' : 'Auto-calculated'"
            [disabled]="true"
          ></app-form-input>
        </div>

        <!-- PAN -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="PAN"
            [value]="data().pan"
            (valueChange)="update('pan', $event)"
            placeholder="e.g. ABCDE1234F"
            [required]="true"
            [uppercase]="true"
            [maxLength]="10"
            [error]="getFieldError('pan')"
          ></app-form-input>
        </div>

        <!-- Mobile -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Mobile No."
            type="tel"
            [value]="data().mobileNo"
            (valueChange)="update('mobileNo', $event)"
            placeholder="e.g. 9829012345"
            [required]="true"
            [maxLength]="10"
            [error]="getFieldError('mobileNo')"
          ></app-form-input>
        </div>

        <!-- Email -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Email-ID"
            type="email"
            [value]="data().emailId"
            (valueChange)="update('emailId', $event)"
            placeholder="e.g. signatory@organisation.com"
            [error]="getFieldError('emailId')"
          ></app-form-input>
        </div>

        <!-- Aadhaar -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Aadhaar No."
            type="tel"
            [value]="data().aadhaarNo"
            (valueChange)="update('aadhaarNo', $event)"
            placeholder="e.g. 123456789012"
            [maxLength]="12"
            [error]="getFieldError('aadhaarNo')"
          ></app-form-input>
        </div>

        <!-- Secondary IDs: Bhamashah (4 cols), Voter ID (4 cols), Passport (4 cols) -->
        <div class="lg:col-span-4 sm:col-span-1">
          <app-form-input
            label="Bhamashah No."
            [value]="data().bhamashahNo"
            (valueChange)="update('bhamashahNo', $event)"
            placeholder="Optional"
            [maxLength]="20"
          ></app-form-input>
        </div>

        <div class="lg:col-span-4 sm:col-span-1">
          <app-form-input
            label="Voter ID No."
            [value]="data().voterIdNo"
            (valueChange)="update('voterIdNo', $event)"
            placeholder="Optional"
            [uppercase]="true"
            [maxLength]="20"
          ></app-form-input>
        </div>

        <div class="lg:col-span-4 sm:col-span-1">
          <app-form-input
            label="Passport No."
            [value]="data().passportNo"
            (valueChange)="update('passportNo', $event)"
            placeholder="Optional"
            [uppercase]="true"
            [maxLength]="8"
          ></app-form-input>
        </div>

        <!-- State -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-select
            label="State"
            [value]="data().state"
            (valueChange)="update('state', $event)"
            [options]="states"
            placeholder="Select State"
          ></app-form-select>
        </div>

        <!-- Residence Address -> 9 cols -->
        <div class="lg:col-span-9 sm:col-span-1">
          <app-form-textarea
            label="Residence Address"
            [value]="data().residenceAddress"
            (valueChange)="update('residenceAddress', $event)"
            placeholder="House/Flat No., Street, Locality, City, PIN code"
            [rows]="1"
            [maxLength]="500"
          ></app-form-textarea>
        </div>

        <!-- Documents: Authorization letter (6 cols) & Identity Proof (6 cols) -->
        <div class="lg:col-span-6 sm:col-span-1 pt-1 border-t border-slate-100">
          <app-form-file-upload
            label="Authorization Letter / Board Resolution"
            [fileDoc]="data().authorizationLetterDoc"
            (fileChange)="updateFileDoc('authorizationLetterDoc', $event)"
            [required]="true"
            [error]="getFieldError('authorizationLetterDoc')"
          ></app-form-file-upload>
        </div>

        <div class="lg:col-span-6 sm:col-span-1 pt-1 border-t border-slate-100">
          <app-form-file-upload
            label="Authorized Person Identity Proof"
            [fileDoc]="data().idProofDoc"
            (fileChange)="updateFileDoc('idProofDoc', $event)"
            [required]="false"
          ></app-form-file-upload>
        </div>
      </div>
    </div>
  `
})
export class Step3AuthPersonComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly designations = DESIGNATIONS_MASTER;
  readonly states = STATES_MASTER;
  readonly data = computed(() => this.otrFormService.step3());
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(2));

  getFieldError(field: string): string | undefined {
    if (!this.isSubmitted()) return undefined;
    const d = this.data();
    switch (field) {
      case 'name':
        if (!d.name?.trim()) return 'Authorized Person Full Name is required';
        return undefined;
      case 'dob':
        if (!d.dob) return 'Date of Birth is required';
        if (new Date(d.dob) > new Date()) return 'Date cannot be in the future';
        return undefined;
      case 'pan':
        if (!d.pan?.trim()) return 'Personal PAN is required';
        if (!REGEX.PAN.test(d.pan.toUpperCase())) return 'Invalid PAN format (e.g. ABCDE1234F)';
        return undefined;
      case 'mobileNo':
        if (!d.mobileNo?.trim()) return 'Mobile Number is required';
        if (!REGEX.INDIAN_MOBILE.test(d.mobileNo)) return 'Invalid 10-digit Mobile Number';
        return undefined;
      case 'emailId':
        if (d.emailId?.trim() && !REGEX.EMAIL.test(d.emailId)) return 'Invalid Email ID format';
        return undefined;
      case 'aadhaarNo':
        if (d.aadhaarNo?.trim() && !REGEX.AADHAAR.test(d.aadhaarNo)) return 'Invalid 12-digit Aadhaar Number';
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
