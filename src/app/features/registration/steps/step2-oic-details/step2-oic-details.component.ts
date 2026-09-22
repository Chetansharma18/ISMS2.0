import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import {
  OfficerInCharge,
  DESIGNATIONS_MASTER,
  FileDoc
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

@Component({
  selector: 'app-step2-oic-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormFileUploadComponent
  ],
  template: `
    <div class="w-full space-y-4">

      <!-- Header -->
      <div class="pb-3 border-b border-slate-200">
        <h2 class="text-base font-bold text-slate-900">
          Step 2 – Details of Officer In-Charge
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Enter details of the authorized project officer and nodal contact.
        </p>
      </div>

      <!-- Single Officer In-Charge Details Card -->
      <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span class="text-xs sm:text-sm font-bold text-slate-800">
              {{ oic().name ? oic().name : 'Officer In-Charge Details' }}
            </span>
            @if (oic().designation) {
              <span class="text-xs text-slate-500 truncate hidden sm:inline">
                &bull; {{ oic().designation }}
              </span>
            }
          </div>
          <span class="text-xs text-slate-500 font-medium">Primary Nodal Contact</span>
        </div>

        <div class="p-4 sm:p-5 space-y-4 bg-white">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <app-form-input
              label="Name"
              [value]="oic().name"
              (valueChange)="updateField('name', $event)"
              placeholder="e.g. Ramesh Kumar Verma"
              [required]="true"
              [maxLength]="100"
            ></app-form-input>

            <app-form-select
              label="Designation"
              [value]="oic().designation"
              (valueChange)="updateField('designation', $event)"
              [options]="designations"
              placeholder="Select Designation"
              [required]="true"
            ></app-form-select>

            <app-form-input
              label="Mobile No."
              type="tel"
              [value]="oic().mobileNo"
              (valueChange)="updateField('mobileNo', $event)"
              placeholder="e.g. 9829012345"
              [required]="true"
              [maxLength]="10"
            ></app-form-input>

            <app-form-input
              label="Email-ID"
              type="email"
              [value]="oic().emailId"
              (valueChange)="updateField('emailId', $event)"
              placeholder="e.g. officer@organisation.com"
              [required]="true"
            ></app-form-input>

            <app-form-input
              label="PAN"
              [value]="oic().pan"
              (valueChange)="updateField('pan', $event)"
              placeholder="e.g. ABCDE1234F"
              [required]="true"
              [uppercase]="true"
              [maxLength]="10"
            ></app-form-input>

            <app-form-input
              label="Aadhaar No."
              type="tel"
              [value]="oic().aadhaarNo"
              (valueChange)="updateField('aadhaarNo', $event)"
              placeholder="e.g. 123456789012"
              [required]="true"
              [maxLength]="12"
            ></app-form-input>
          </div>

          <!-- Secondary IDs -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-1">
            <app-form-input
              label="Bhamashah No."
              [value]="oic().bhamashahNo"
              (valueChange)="updateField('bhamashahNo', $event)"
              placeholder="Optional"
              [maxLength]="20"
            ></app-form-input>

            <app-form-input
              label="Voter ID No."
              [value]="oic().voterIdNo"
              (valueChange)="updateField('voterIdNo', $event)"
              placeholder="Optional"
              [uppercase]="true"
              [maxLength]="20"
            ></app-form-input>

            <app-form-input
              label="Passport No."
              [value]="oic().passportNo"
              (valueChange)="updateField('passportNo', $event)"
              placeholder="Optional"
              [uppercase]="true"
              [maxLength]="8"
            ></app-form-input>
          </div>

          <!-- Documents -->
          <div class="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <app-form-file-upload
              label="OIC Appointment / Authorization Letter"
              [fileDoc]="oic().appointmentLetterDoc"
              (fileDocChange)="updateFileDoc('appointmentLetterDoc', $event)"
              [required]="true"
            ></app-form-file-upload>

            <app-form-file-upload
              label="OIC Identity Proof"
              [fileDoc]="oic().idProofDoc"
              (fileDocChange)="updateFileDoc('idProofDoc', $event)"
              [required]="false"
            ></app-form-file-upload>
          </div>
        </div>
      </div>

    </div>
  `
})
export class Step2OicDetailsComponent {
  private otrFormService = inject(OtrFormService);

  readonly designations = DESIGNATIONS_MASTER;
  readonly oicList = computed(() => this.otrFormService.step2());
  readonly oic = computed(() => this.oicList()[0] || ({} as OfficerInCharge));

  updateField(field: keyof OfficerInCharge, value: string): void {
    this.otrFormService.updateOic(0, { [field]: value });
  }

  updateFileDoc(field: 'appointmentLetterDoc' | 'idProofDoc', file: FileDoc | null): void {
    this.otrFormService.updateOic(0, { [field]: file });
  }
}
