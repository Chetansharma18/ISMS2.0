import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import {
  OfficerInCharge,
  DESIGNATIONS_MASTER,
  FileDoc,
  REGEX
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
    <div class="w-full space-y-3 font-sans">

      <!-- Same as Authorized Person Toggle -->
      <div class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-sky-50/80 border border-sky-200">
        <div class="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="sameAsAuthPerson"
            [checked]="sameAsAuthPerson()"
            (change)="toggleSameAsAuthPerson($any($event.target).checked)"
            class="w-4 h-4 text-[#0B3558] border-slate-300 rounded focus:ring-[#0B3558] accent-[#0B3558] cursor-pointer shrink-0"
          />
          <label for="sameAsAuthPerson" class="text-xs font-semibold text-[#0B3558] cursor-pointer select-none">
            Officer In-Charge is the same as Authorized Person
            <span class="font-normal text-slate-500 ml-1 hidden sm:inline">(Auto-fill details from Step 2)</span>
          </label>
        </div>
        @if (sameAsAuthPerson()) {
          <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
            Synced with Step 2
          </span>
        }
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
        <!-- Row 1: Name (4 cols), Designation (3 cols), Mobile No (2 cols), Email ID (3 cols) -->
        <div class="lg:col-span-4">
          <app-form-input
            label="Full Name"
            [value]="oic().name"
            (valueChange)="updateField('name', $event)"
            placeholder="e.g. Ramesh Kumar Verma"
            [required]="true"
            [maxLength]="100"
            [disabled]="sameAsAuthPerson()"
            [error]="getFieldError('name')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-3">
          <app-form-select
            label="Designation"
            [value]="oic().designation"
            (valueChange)="updateField('designation', $event)"
            [options]="designations"
            placeholder="Select Designation"
            [required]="true"
            [disabled]="sameAsAuthPerson()"
            [error]="getFieldError('designation')"
          ></app-form-select>
        </div>

        <div class="lg:col-span-2">
          <app-form-input
            label="Mobile No."
            type="tel"
            [value]="oic().mobileNo"
            (valueChange)="updateField('mobileNo', $event)"
            placeholder="10 digits"
            [required]="true"
            [maxLength]="10"
            [disabled]="sameAsAuthPerson()"
            [error]="getFieldError('mobileNo')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-3">
          <app-form-input
            label="Email-ID"
            type="email"
            [value]="oic().emailId"
            (valueChange)="updateField('emailId', $event)"
            placeholder="officer@domain.com"
            [required]="true"
            [disabled]="sameAsAuthPerson()"
            [error]="getFieldError('emailId')"
          ></app-form-input>
        </div>

        <!-- Row 2: PAN (3 cols), Aadhaar (3 cols), Bhamashah (2 cols), Voter ID (2 cols), Passport (2 cols) -->
        <div class="lg:col-span-3">
          <app-form-input
            label="PAN"
            [value]="oic().pan"
            (valueChange)="updateField('pan', $event)"
            placeholder="e.g. ABCDE1234F"
            [required]="true"
            [uppercase]="true"
            [maxLength]="10"
            [disabled]="sameAsAuthPerson()"
            [error]="getFieldError('pan')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-3">
          <app-form-input
            label="Aadhaar No."
            type="tel"
            [value]="oic().aadhaarNo"
            (valueChange)="updateField('aadhaarNo', $event)"
            placeholder="12 digit Aadhaar"
            [required]="true"
            [maxLength]="12"
            [disabled]="sameAsAuthPerson()"
            [error]="getFieldError('aadhaarNo')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-2">
          <app-form-input
            label="Bhamashah No."
            [value]="oic().bhamashahNo"
            (valueChange)="updateField('bhamashahNo', $event)"
            placeholder="Optional"
            [maxLength]="20"
            [disabled]="sameAsAuthPerson()"
          ></app-form-input>
        </div>

        <div class="lg:col-span-2">
          <app-form-input
            label="Voter ID No."
            [value]="oic().voterIdNo"
            (valueChange)="updateField('voterIdNo', $event)"
            placeholder="Optional"
            [uppercase]="true"
            [maxLength]="20"
            [disabled]="sameAsAuthPerson()"
          ></app-form-input>
        </div>

        <div class="lg:col-span-2">
          <app-form-input
            label="Passport No."
            [value]="oic().passportNo"
            (valueChange)="updateField('passportNo', $event)"
            placeholder="Optional"
            [uppercase]="true"
            [maxLength]="8"
            [disabled]="sameAsAuthPerson()"
          ></app-form-input>
        </div>

        <!-- Row 3: Documents (6 cols each) -->
        <div class="lg:col-span-6 pt-1">
          <app-form-file-upload
            label="Appointment / Authorization Letter"
            [fileDoc]="oic().appointmentLetterDoc"
            (fileChange)="updateFileDoc('appointmentLetterDoc', $event)"
            [required]="true"
            [error]="getFieldError('appointmentLetterDoc')"
          ></app-form-file-upload>
        </div>

        <div class="lg:col-span-6 pt-1">
          <app-form-file-upload
            label="Identity Proof Document"
            [fileDoc]="oic().idProofDoc"
            (fileChange)="updateFileDoc('idProofDoc', $event)"
            [required]="false"
          ></app-form-file-upload>
        </div>
      </div>
    </div>
  `
})
export class Step2OicDetailsComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly designations = DESIGNATIONS_MASTER;
  readonly oicList = computed(() => this.otrFormService.step2());
  readonly oic = computed(() => this.oicList()[0] || ({} as OfficerInCharge));
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(3));

  /** Toggle: OIC same as Authorized Person */
  readonly sameAsAuthPerson = signal<boolean>(false);

  getFieldError(field: string): string | undefined {
    if (!this.isSubmitted()) return undefined;
    const o = this.oic();
    switch (field) {
      case 'name':
        if (!o.name?.trim()) return 'Officer Full Name is required';
        return undefined;
      case 'designation':
        if (!o.designation?.trim()) return 'Designation is required';
        return undefined;
      case 'mobileNo':
        if (!o.mobileNo?.trim()) return 'Mobile Number is required';
        if (!REGEX.INDIAN_MOBILE.test(o.mobileNo)) return 'Invalid 10-digit Mobile Number';
        return undefined;
      case 'emailId':
        if (!o.emailId?.trim()) return 'Email-ID is required';
        if (!REGEX.EMAIL.test(o.emailId)) return 'Invalid Email ID format';
        return undefined;
      case 'pan':
        if (!o.pan?.trim()) return 'PAN is required';
        if (!REGEX.PAN.test(o.pan.toUpperCase())) return 'Invalid PAN format';
        return undefined;
      case 'aadhaarNo':
        if (!o.aadhaarNo?.trim()) return 'Aadhaar Number is required';
        if (!REGEX.AADHAAR.test(o.aadhaarNo)) return 'Invalid 12-digit Aadhaar Number';
        return undefined;
      case 'appointmentLetterDoc':
        if (!o.appointmentLetterDoc || o.appointmentLetterDoc.status !== 'uploaded') {
          return 'Appointment Letter is required';
        }
        return undefined;
      default:
        return undefined;
    }
  }

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
