import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import {
  Step3AuthorizedPerson,
  DESIGNATIONS_MASTER,
  STATES_MASTER,
  FileDoc
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';
import { FormSectionComponent } from '../../../../shared/components/form-controls/form-section/form-section.component';

@Component({
  selector: 'app-step3-auth-person',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent,
    FormSectionComponent
  ],
  template: `
    <div class="w-full space-y-4">

      <!-- Section 3.1: Profile & Demographics -->
      <app-form-section title="Step 3 – Authorized Person Details">
        <p class="text-xs text-slate-500 mb-3 -mt-2">
          The Authorized Person is the person officially authorized to represent the TP/PIA.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <app-form-input
            label="Name"
            [value]="data().name"
            (valueChange)="update('name', $event)"
            placeholder="e.g. Vikramaditya Singh"
            [required]="true"
            [maxLength]="100"
          ></app-form-input>

          <app-form-select
            label="Designation"
            [value]="data().designation"
            (valueChange)="update('designation', $event)"
            [options]="designations"
            placeholder="Select Designation"
            [required]="false"
          ></app-form-select>

          <app-form-input
            label="Date of Birth"
            type="date"
            [value]="data().dob"
            (valueChange)="update('dob', $event)"
            [required]="true"
          ></app-form-input>

          <app-form-input
            label="Age"
            [value]="data().age ? data().age + ' Years' : 'Enter Date of Birth'"
            [disabled]="true"
          ></app-form-input>
        </div>
      </app-form-section>

      <!-- Section 3.2: Contact & Identification Details -->
      <app-form-section title="Identification & Contact Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <app-form-input
            label="PAN"
            [value]="data().pan"
            (valueChange)="update('pan', $event)"
            placeholder="e.g. ABCDE1234F"
            [required]="true"
            [uppercase]="true"
            [maxLength]="10"
          ></app-form-input>

          <app-form-input
            label="Mobile No."
            type="tel"
            [value]="data().mobileNo"
            (valueChange)="update('mobileNo', $event)"
            placeholder="e.g. 9829012345"
            [required]="true"
            [maxLength]="10"
          ></app-form-input>

          <app-form-input
            label="Email-ID"
            type="email"
            [value]="data().emailId"
            (valueChange)="update('emailId', $event)"
            placeholder="e.g. signatory@organisation.com"
          ></app-form-input>

          <app-form-input
            label="Aadhaar No."
            type="tel"
            [value]="data().aadhaarNo"
            (valueChange)="update('aadhaarNo', $event)"
            placeholder="e.g. 123456789012"
            [maxLength]="12"
          ></app-form-input>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-3">
          <app-form-input
            label="Bhamashah No."
            [value]="data().bhamashahNo"
            (valueChange)="update('bhamashahNo', $event)"
            placeholder="Optional"
            [maxLength]="20"
          ></app-form-input>

          <app-form-input
            label="Voter ID No."
            [value]="data().voterIdNo"
            (valueChange)="update('voterIdNo', $event)"
            placeholder="Optional"
            [uppercase]="true"
            [maxLength]="20"
          ></app-form-input>

          <app-form-input
            label="Passport No."
            [value]="data().passportNo"
            (valueChange)="update('passportNo', $event)"
            placeholder="Optional"
            [uppercase]="true"
            [maxLength]="8"
          ></app-form-input>
        </div>
      </app-form-section>

      <!-- Section 3.3: Residence Address & Authorization Document -->
      <app-form-section title="Residence Address & Authorization Documents">
        <div class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <app-form-select
              label="State"
              [value]="data().state"
              (valueChange)="update('state', $event)"
              [options]="states"
              placeholder="Select State"
            ></app-form-select>

            <div class="md:col-span-2">
              <app-form-textarea
                label="Residence Address"
                [value]="data().residenceAddress"
                (valueChange)="update('residenceAddress', $event)"
                placeholder="House/Flat No., Street, Locality, City, PIN code"
                [rows]="2"
              ></app-form-textarea>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <app-form-file-upload
              label="Authorization Letter / Board Resolution / Authority Document"
              [fileDoc]="data().authorizationLetterDoc"
              (fileDocChange)="updateFileDoc('authorizationLetterDoc', $event)"
              [required]="true"
            ></app-form-file-upload>

            <app-form-file-upload
              label="Authorized Person Identity Proof"
              [fileDoc]="data().idProofDoc"
              (fileDocChange)="updateFileDoc('idProofDoc', $event)"
              [required]="false"
            ></app-form-file-upload>
          </div>
        </div>
      </app-form-section>

    </div>
  `
})
export class Step3AuthPersonComponent {
  private otrFormService = inject(OtrFormService);

  readonly designations = DESIGNATIONS_MASTER;
  readonly states = STATES_MASTER;
  readonly data = computed(() => this.otrFormService.step3());

  update(field: keyof Step3AuthorizedPerson, value: string): void {
    this.otrFormService.updateStep3({ [field]: value });
  }

  updateFileDoc(field: 'authorizationLetterDoc' | 'idProofDoc', file: FileDoc | null): void {
    this.otrFormService.updateStep3({ [field]: file });
  }
}
