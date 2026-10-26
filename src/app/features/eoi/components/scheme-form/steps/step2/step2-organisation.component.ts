import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchemeFormState } from '../../scheme-form.state';
import {
  DISTRICTS_BY_STATE,
  NATURE_OF_ENTITIES,
  NSDC_PARTNER_TYPES,
  STATES_MASTER
} from '../../../../../registration/models/otr-form.model';
import { FormInputComponent } from '../../../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

const NO_DISTRICTS: string[] = [];

/**
 * Step 2: company particulars and registration documents (read-only verification).
 * Deliberately stays on default change detection: the state objects are mutated in place.
 */
@Component({
  selector: 'app-step2-organisation',
  standalone: true,
  imports: [
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent
  ],
  host: { class: 'block' },
  template: `
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Company Particulars &amp; Registration Details</h2>
        </div>
        <span class="text-xs text-slate-500 tabular-nums font-semibold truncate">CIN: {{ state.editableStep1.registrationNumber || '-' }}</span>
      </div>

      <div class="p-4 sm:p-5 w-full space-y-3 font-sans">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <!-- Organisation Name -->
          <div class="lg:col-span-9 sm:col-span-2">
            <app-form-input
              label="Organisation Name"
              [value]="state.editableStep1.fullName"
              (valueChange)="onFullNameChange($event)"
              placeholder="Enter organisation name"
              [required]="true"
              [maxLength]="200"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- Nature of Entity -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-select
              label="Nature of Entity"
              [value]="state.editableStep1.natureOfEntity"
              (valueChange)="state.editableStep1.natureOfEntity = $event"
              [options]="natureOfEntitiesList"
              placeholder="Select nature of entity"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-select>
          </div>

          <!-- Registration Number -->
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input
              label="Registration No. (CIN / Reg. No.)"
              [value]="state.editableStep1.registrationNumber"
              (valueChange)="state.editableStep1.registrationNumber = $event"
              placeholder="Enter registration number"
              [required]="true"
              [uppercase]="true"
              [maxLength]="50"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- Date of Registration -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="Date of Registration"
              type="date"
              [value]="state.editableStep1.dateOfRegistration"
              (valueChange)="state.editableStep1.dateOfRegistration = $event"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- State / UT of Registration -->
          <div class="lg:col-span-5 sm:col-span-1">
            <app-form-select
              label="State / UT of Registration"
              [value]="state.editableStep1.stateOfLegalReg"
              (valueChange)="state.editableStep1.stateOfLegalReg = $event"
              [options]="statesList"
              placeholder="Select state / UT"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-select>
          </div>

          <!-- Certificate of Incorporation -->
          <div class="lg:col-span-12 sm:col-span-2">
            <app-form-file-upload
              label="Certificate of Registration / Incorporation"
              [fileDoc]="state.editableStep1.registrationCertDoc"
              (fileChange)="state.editableStep1.registrationCertDoc = $event"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-file-upload>
          </div>

          <!-- Organisation PAN -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="Organisation PAN"
              [value]="state.editableStep1.companyPan"
              (valueChange)="state.editableStep1.companyPan = $event"
              placeholder="Enter organisation PAN"
              [required]="true"
              [uppercase]="true"
              [maxLength]="10"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- Organisation PAN Card -->
          <div class="lg:col-span-5 sm:col-span-1">
            <app-form-file-upload
              label="Organisation PAN Card"
              [fileDoc]="state.editableStep1.panCardDoc"
              (fileChange)="state.editableStep1.panCardDoc = $event"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-file-upload>
          </div>

          <!-- GST Registered -->
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-select
              label="GST Registered"
              [value]="state.editableStep1.gstRegistered"
              (valueChange)="onGstRegisteredChange($event)"
              [options]="yesNo"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-select>
          </div>

          <!-- MSME Registered -->
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-select
              label="MSME / Udyam Registered"
              [value]="state.editableStep1.msmeRegistered"
              (valueChange)="onMsmeRegisteredChange($event)"
              [options]="yesNo"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-select>
          </div>

          <!-- Conditional: GST details -->
          @if (state.editableStep1.gstRegistered === 'Yes') {
            <div class="lg:col-span-4 sm:col-span-1">
              <app-form-input
                label="GSTIN"
                [value]="state.editableStep1.gstin"
                (valueChange)="state.editableStep1.gstin = $event"
                placeholder="Enter GSTIN"
                [required]="true"
                [uppercase]="true"
                [maxLength]="15"
                [disabled]="isReadOnly"
              ></app-form-input>
            </div>

            <div class="lg:col-span-8 sm:col-span-1">
              <app-form-file-upload
                label="GST Registration Certificate"
                [fileDoc]="state.editableStep1.gstCertDoc"
                (fileChange)="state.editableStep1.gstCertDoc = $event"
                [required]="true"
                [disabled]="isReadOnly"
              ></app-form-file-upload>
            </div>
          }

          <!-- Conditional: MSME details -->
          @if (state.editableStep1.msmeRegistered === 'Yes') {
            <div class="lg:col-span-4 sm:col-span-1">
              <app-form-input
                label="Udyam Number"
                [value]="state.editableStep1.udyamNumber"
                (valueChange)="state.editableStep1.udyamNumber = $event"
                placeholder="Enter Udyam registration number"
                [required]="true"
                [uppercase]="true"
                [maxLength]="19"
                [disabled]="isReadOnly"
              ></app-form-input>
            </div>

            <div class="lg:col-span-8 sm:col-span-1">
              <app-form-file-upload
                label="MSME / Udyam Registration Certificate"
                [fileDoc]="state.editableStep1.msmeCertDoc"
                (fileChange)="state.editableStep1.msmeCertDoc = $event"
                [required]="true"
                [disabled]="isReadOnly"
              ></app-form-file-upload>
            </div>
          }

          <!-- Contact profile -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-select
              label="NSDC Partner"
              [value]="state.editableStep1.nsdcPartner"
              (valueChange)="state.editableStep1.nsdcPartner = $event"
              [options]="nsdcPartnersList"
              placeholder="Select"
              [required]="false"
              [disabled]="isReadOnly"
            ></app-form-select>
          </div>

          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="Organisation Contact No."
              type="tel"
              [value]="state.editableStep1.contactNo"
              (valueChange)="state.editableStep1.contactNo = $event"
              placeholder="Enter contact number"
              [required]="true"
              [maxLength]="15"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <div class="lg:col-span-6 sm:col-span-2">
            <app-form-input
              label="Organisation Email ID"
              type="email"
              [value]="state.editableStep1.emailId"
              (valueChange)="state.editableStep1.emailId = $event"
              placeholder="Enter email address"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <div class="lg:col-span-6 sm:col-span-2">
            <app-form-input
              label="Website"
              [value]="state.editableStep1.website"
              (valueChange)="state.editableStep1.website = $event"
              placeholder="Enter website (https://www.example.com)"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>
        </div>

        <!-- Address details -->
        <div class="pt-2.5 border-t border-slate-200/80 space-y-2.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
            <div class="lg:col-span-6 sm:col-span-2">
              <app-form-textarea
                label="Registered Address"
                [value]="state.editableStep1.registeredAddress"
                (valueChange)="state.editableStep1.registeredAddress = $event"
                placeholder="Enter address, locality, building name and number"
                [required]="true"
                [disabled]="isReadOnly"
              ></app-form-textarea>
            </div>

            <div class="lg:col-span-2 sm:col-span-1">
              <app-form-select
                label="State / UT"
                [value]="state.editableStep1.registeredState"
                (valueChange)="onRegisteredStateChange($event)"
                [options]="statesList"
                placeholder="Select state / UT"
                [required]="true"
                [disabled]="isReadOnly"
              ></app-form-select>
            </div>

            <div class="lg:col-span-2 sm:col-span-1">
              <app-form-select
                label="District"
                [value]="state.editableStep1.registeredDistrict"
                (valueChange)="state.editableStep1.registeredDistrict = $event"
                [options]="districtsFor(state.editableStep1.registeredState)"
                [disabled]="isReadOnly || !state.editableStep1.registeredState"
                placeholder="Select district"
                [required]="true"
              ></app-form-select>
            </div>

            <div class="lg:col-span-2 sm:col-span-1">
              <app-form-input
                label="PIN Code"
                type="tel"
                [value]="state.editableStep1.registeredPincode"
                (valueChange)="state.editableStep1.registeredPincode = $event"
                placeholder="Enter PIN code"
                [required]="true"
                [maxLength]="6"
                [disabled]="isReadOnly"
              ></app-form-input>
            </div>
          </div>

          <!-- Same as registered -->
          <div class="pt-1 border-t border-slate-100">
            <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                [ngModel]="state.editableStep1.sameAsRegistered"
                (ngModelChange)="state.editableStep1.sameAsRegistered = $event"
                [disabled]="isReadOnly"
                class="w-4 h-4 text-navy border-slate-300 rounded focus:ring-navy accent-navy disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <span>Office Address is same as Registered Address</span>
            </label>
          </div>

          @if (!state.editableStep1.sameAsRegistered) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
              <div class="lg:col-span-6 sm:col-span-2">
                <app-form-textarea
                  label="Office Address"
                  [value]="state.editableStep1.officeAddress"
                  (valueChange)="state.editableStep1.officeAddress = $event"
                  placeholder="Enter office address, locality, building name and number"
                  [required]="true"
                  [disabled]="isReadOnly"
                ></app-form-textarea>
              </div>

              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-select
                  label="State / UT"
                  [value]="state.editableStep1.officeState"
                  (valueChange)="onOfficeStateChange($event)"
                  [options]="statesList"
                  placeholder="Select state / UT"
                  [required]="true"
                  [disabled]="isReadOnly"
                ></app-form-select>
              </div>

              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-select
                  label="District"
                  [value]="state.editableStep1.officeDistrict"
                  (valueChange)="state.editableStep1.officeDistrict = $event"
                  [options]="districtsFor(state.editableStep1.officeState)"
                  [disabled]="isReadOnly || !state.editableStep1.officeState"
                  placeholder="Select district"
                  [required]="true"
                ></app-form-select>
              </div>

              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-input
                  label="PIN Code"
                  type="tel"
                  [value]="state.editableStep1.officePincode"
                  (valueChange)="state.editableStep1.officePincode = $event"
                  placeholder="Enter PIN code"
                  [required]="true"
                  [maxLength]="6"
                  [disabled]="isReadOnly"
                ></app-form-input>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class Step2OrganisationComponent {
  protected readonly state = inject(SchemeFormState);
  protected readonly isReadOnly = true;

  protected readonly natureOfEntitiesList = NATURE_OF_ENTITIES;
  protected readonly statesList = STATES_MASTER;
  protected readonly nsdcPartnersList = NSDC_PARTNER_TYPES;
  protected readonly yesNo: string[] = ['Yes', 'No'];

  protected districtsFor(stateName: string): string[] {
    return (stateName && DISTRICTS_BY_STATE[stateName]) || NO_DISTRICTS;
  }

  protected onFullNameChange(value: string): void {
    this.state.editableStep1.fullName = value;
    this.state.editableStep1.shortName = value;
  }

  protected onGstRegisteredChange(value: string): void {
    const org = this.state.editableStep1;
    org.gstRegistered = value as 'Yes' | 'No';
    if (value === 'No') {
      org.gstin = '';
      org.gstCertDoc = null;
    }
  }

  protected onMsmeRegisteredChange(value: string): void {
    const org = this.state.editableStep1;
    org.msmeRegistered = value as 'Yes' | 'No';
    if (value === 'No') {
      org.udyamNumber = '';
      org.msmeCertDoc = null;
    }
  }

  protected onRegisteredStateChange(value: string): void {
    this.state.editableStep1.registeredState = value;
    this.state.editableStep1.registeredDistrict = '';
  }

  protected onOfficeStateChange(value: string): void {
    this.state.editableStep1.officeState = value;
    this.state.editableStep1.officeDistrict = '';
  }
}
