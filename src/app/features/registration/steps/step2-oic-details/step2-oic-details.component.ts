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
    <div class="w-full space-y-4 font-sans">
      
      @for (oic of oicList(); track oic.id || $index; let idx = $index; let first = $first; let count = $count) {
        <div class="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
          
          <!-- Card Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded-full bg-[#0B3558] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {{ idx + 1 }}
              </span>
              <h3 class="text-sm sm:text-base font-extrabold text-[#0B3558] tracking-tight">
                {{ first ? 'Officer In-Charge' : 'Additional Officer In-Charge #' + (idx + 1) }}
              </h3>
              @if (first && sameAsAuthPerson()) {
                <span class="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-1">
                  Synced with Authorized Person
                </span>
              }
            </div>

            <!-- Remove Button for additional officers -->
            @if (idx > 0) {
              <button
                type="button"
                (click)="removeOfficer(idx)"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors cursor-pointer"
                title="Remove this officer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove</span>
              </button>
            }
          </div>

          <!-- Same as Authorized Person Toggle (First officer only) -->
          @if (first) {
            <div class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-sky-50/70 border border-sky-200">
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
            </div>
          }

          <!-- Form Fields Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
            <!-- Row 1: Name (4 cols), Designation (3 cols), Mobile No (2 cols), Email ID (3 cols) -->
            <div class="lg:col-span-4">
              <app-form-input
                label="Full Name"
                [value]="oic.name"
                (valueChange)="updateField(idx, 'name', $event)"
                placeholder="e.g. Ramesh Kumar Verma"
                [required]="true"
                [maxLength]="100"
                [disabled]="first && sameAsAuthPerson()"
                [error]="getFieldError(idx, 'name')"
              ></app-form-input>
            </div>

            <div class="lg:col-span-3">
              <app-form-select
                label="Designation"
                [value]="oic.designation"
                (valueChange)="updateField(idx, 'designation', $event)"
                [options]="designations"
                placeholder="Select Designation"
                [required]="true"
                [disabled]="first && sameAsAuthPerson()"
                [error]="getFieldError(idx, 'designation')"
              ></app-form-select>
            </div>

            <div class="lg:col-span-2">
              <app-form-input
                label="Mobile No."
                type="tel"
                [value]="oic.mobileNo"
                (valueChange)="updateField(idx, 'mobileNo', $event)"
                placeholder="10 digits"
                [required]="true"
                [maxLength]="10"
                [disabled]="first && sameAsAuthPerson()"
                [error]="getFieldError(idx, 'mobileNo')"
              ></app-form-input>
            </div>

            <div class="lg:col-span-3">
              <app-form-input
                label="Email-ID"
                type="email"
                [value]="oic.emailId"
                (valueChange)="updateField(idx, 'emailId', $event)"
                placeholder="officer@domain.com"
                [required]="true"
                [disabled]="first && sameAsAuthPerson()"
                [error]="getFieldError(idx, 'emailId')"
              ></app-form-input>
            </div>

            <!-- Row 2: PAN (3 cols), Aadhaar (3 cols), Bhamashah (2 cols), Voter ID (2 cols), Passport (2 cols) -->
            <div class="lg:col-span-3">
              <app-form-input
                label="PAN"
                [value]="oic.pan"
                (valueChange)="updateField(idx, 'pan', $event)"
                placeholder="e.g. ABCDE1234F"
                [required]="true"
                [uppercase]="true"
                [maxLength]="10"
                [disabled]="first && sameAsAuthPerson()"
                [error]="getFieldError(idx, 'pan')"
              ></app-form-input>
            </div>

            <div class="lg:col-span-3">
              <app-form-input
                label="Aadhaar No."
                type="tel"
                [value]="oic.aadhaarNo"
                (valueChange)="updateField(idx, 'aadhaarNo', $event)"
                placeholder="12 digit Aadhaar"
                [required]="true"
                [maxLength]="12"
                [disabled]="first && sameAsAuthPerson()"
                [error]="getFieldError(idx, 'aadhaarNo')"
              ></app-form-input>
            </div>

            <div class="lg:col-span-2">
              <app-form-input
                label="Bhamashah No."
                [value]="oic.bhamashahNo"
                (valueChange)="updateField(idx, 'bhamashahNo', $event)"
                placeholder="Optional"
                [maxLength]="20"
                [disabled]="first && sameAsAuthPerson()"
              ></app-form-input>
            </div>

            <div class="lg:col-span-2">
              <app-form-input
                label="Voter ID No."
                [value]="oic.voterIdNo"
                (valueChange)="updateField(idx, 'voterIdNo', $event)"
                placeholder="Optional"
                [uppercase]="true"
                [maxLength]="20"
                [disabled]="first && sameAsAuthPerson()"
              ></app-form-input>
            </div>

            <div class="lg:col-span-2">
              <app-form-input
                label="Passport No."
                [value]="oic.passportNo"
                (valueChange)="updateField(idx, 'passportNo', $event)"
                placeholder="Optional"
                [uppercase]="true"
                [maxLength]="8"
                [disabled]="first && sameAsAuthPerson()"
              ></app-form-input>
            </div>

            <!-- Row 3: Documents (6 cols each) -->
            <div class="lg:col-span-6 pt-1">
              <app-form-file-upload
                label="Appointment / Authorization Letter"
                [fileDoc]="oic.appointmentLetterDoc"
                (fileChange)="updateFileDoc(idx, 'appointmentLetterDoc', $event)"
                [required]="true"
                [error]="getFieldError(idx, 'appointmentLetterDoc')"
              ></app-form-file-upload>
            </div>

            <div class="lg:col-span-6 pt-1">
              <app-form-file-upload
                label="Identity Proof Document"
                [fileDoc]="oic.idProofDoc"
                (fileChange)="updateFileDoc(idx, 'idProofDoc', $event)"
                [required]="false"
              ></app-form-file-upload>
            </div>
          </div>
        </div>
      }

      <!-- Bottom action: Add One More Officer In-Charge Button -->
      <div class="flex items-center justify-between pt-1">
        <p class="text-xs text-slate-500 font-normal">
          Click below to add more Officers In-Charge if applicable for your organization.
        </p>
        <button
          type="button"
          (click)="addNewOfficer()"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#0B3558] hover:bg-[#0B3558]/5 text-[#0B3558] text-xs sm:text-[13px] font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Officer In-Charge</span>
        </button>
      </div>

    </div>
  `
})
export class Step2OicDetailsComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly designations = DESIGNATIONS_MASTER;
  readonly oicList = computed(() => this.otrFormService.step2());
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(3));

  /** Toggle: OIC same as Authorized Person (applies to first officer) */
  readonly sameAsAuthPerson = signal<boolean>(false);

  getFieldError(idx: number, field: string): string | undefined {
    if (!this.isSubmitted()) return undefined;
    const o = this.oicList()[idx];
    if (!o) return undefined;

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

  addNewOfficer(): void {
    this.otrFormService.addOic();
  }

  removeOfficer(index: number): void {
    this.otrFormService.removeOic(index);
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

  updateField(index: number, field: keyof OfficerInCharge, value: string): void {
    if (index === 0 && this.sameAsAuthPerson()) {
      return;
    }
    this.otrFormService.updateOic(index, { [field]: value });
  }

  updateFileDoc(index: number, field: 'appointmentLetterDoc' | 'idProofDoc', file: FileDoc | null): void {
    this.otrFormService.updateOic(index, { [field]: file });
  }
}
