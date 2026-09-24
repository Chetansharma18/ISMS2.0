import { Component, inject, computed, signal } from '@angular/core';
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
          Step 3 – Details of Officer In-Charge
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Enter details of the authorized project officer and nodal contact.
        </p>
      </div>

      <!-- Same as Authorized Person Toggle -->
      <div class="flex items-start gap-3 p-3.5 rounded-lg bg-sky-50 border border-sky-200">
        <input
          type="checkbox"
          id="sameAsAuthPerson"
          [checked]="sameAsAuthPerson()"
          (change)="toggleSameAsAuthPerson($any($event.target).checked)"
          class="mt-0.5 w-4 h-4 text-[#0483AC] border-slate-300 rounded focus:ring-[#0483AC] accent-[#0483AC] cursor-pointer shrink-0"
        />
        <label for="sameAsAuthPerson" class="text-xs font-medium text-sky-900 cursor-pointer leading-snug">
          Officer In-Charge is the same as Authorized Person
          <span class="block text-sky-600 font-normal mt-0.5">
            Checking this will auto-fill the OIC details from the Authorized Person information entered in Step 2.
          </span>
        </label>
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
          @if (sameAsAuthPerson()) {
            <span class="text-xs text-sky-600 font-medium bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Auto-filled from Auth. Person</span>
          } @else {
            <span class="text-xs text-slate-500 font-medium">Primary Nodal Contact</span>
          }
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
              [disabled]="sameAsAuthPerson()"
            ></app-form-input>

            <app-form-select
              label="Designation"
              [value]="oic().designation"
              (valueChange)="updateField('designation', $event)"
              [options]="designations"
              placeholder="Select Designation"
              [required]="true"
              [disabled]="sameAsAuthPerson()"
            ></app-form-select>

            <app-form-input
              label="Mobile No."
              type="tel"
              [value]="oic().mobileNo"
              (valueChange)="updateField('mobileNo', $event)"
              placeholder="e.g. 9829012345"
              [required]="true"
              [maxLength]="10"
              [disabled]="sameAsAuthPerson()"
            ></app-form-input>

            <app-form-input
              label="Email-ID"
              type="email"
              [value]="oic().emailId"
              (valueChange)="updateField('emailId', $event)"
              placeholder="e.g. officer@organisation.com"
              [required]="true"
              [disabled]="sameAsAuthPerson()"
            ></app-form-input>

            <app-form-input
              label="PAN"
              [value]="oic().pan"
              (valueChange)="updateField('pan', $event)"
              placeholder="e.g. ABCDE1234F"
              [required]="true"
              [uppercase]="true"
              [maxLength]="10"
              [disabled]="sameAsAuthPerson()"
            ></app-form-input>

            <app-form-input
              label="Aadhaar No."
              type="tel"
              [value]="oic().aadhaarNo"
              (valueChange)="updateField('aadhaarNo', $event)"
              placeholder="e.g. 123456789012"
              [required]="true"
              [maxLength]="12"
              [disabled]="sameAsAuthPerson()"
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

  /** Toggle: OIC same as Authorized Person */
  readonly sameAsAuthPerson = signal<boolean>(false);

  /**
   * When toggled ON, copy Authorized Person fields (step3) into OIC (step2[0]).
   * When toggled OFF, reset OIC personal fields to empty so user can fill manually.
   */
  toggleSameAsAuthPerson(checked: boolean): void {
    this.sameAsAuthPerson.set(checked);
    if (checked) {
      const authPerson = this.otrFormService.step3();
      this.otrFormService.updateOic(0, {
        name: authPerson.name,
        designation: authPerson.designation,
        mobileNo: authPerson.mobileNo,
        emailId: authPerson.emailId,
        pan: authPerson.pan,
        aadhaarNo: authPerson.aadhaarNo,
        bhamashahNo: authPerson.bhamashahNo,
        voterIdNo: authPerson.voterIdNo,
        passportNo: authPerson.passportNo
      });
    } else {
      // Clear auto-filled fields so user can fill fresh
      this.otrFormService.updateOic(0, {
        name: '',
        designation: '',
        mobileNo: '',
        emailId: '',
        pan: '',
        aadhaarNo: '',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: ''
      });
    }
  }

  updateField(field: keyof OfficerInCharge, value: string): void {
    if (!this.sameAsAuthPerson()) {
      this.otrFormService.updateOic(0, { [field]: value });
    }
  }

  updateFileDoc(field: 'appointmentLetterDoc' | 'idProofDoc', file: FileDoc | null): void {
    this.otrFormService.updateOic(0, { [field]: file });
  }
}
