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
 * Step 2: Company Particulars & Registration Details
 *
 * Displays verified OTR organization details and documents.
 * All controls are locked until Step 2 edit mode is toggled on.
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
    <section class="border border-[#EADCE2] rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-white px-5 py-3.5 border-b border-[#EADCE2] flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
          <h2 class="text-base sm:text-[17px] font-bold text-[#7C0E44] m-0">Company Particulars &amp; Registration Details</h2>
        </div>
        <span class="text-xs text-slate-500 tabular-nums font-semibold truncate">CIN: {{ state.editableStep1.registrationNumber || '-' }}</span>
      </div>

      <div class="p-5 sm:p-6 w-full space-y-6 font-sans">
        <!-- 1. Basic Organisation Details -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Basic Organisation Details
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- Organisation Name -->
            <div>
              <app-form-input
                label="Organisation Name"
                [value]="state.editableStep1.fullName"
                (valueChange)="onFullNameChange($event)"
                placeholder="Enter organisation name"
                [required]="true"
                [maxLength]="200"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Nature of Entity -->
            <div>
              <app-form-select
                label="Nature of Entity"
                [value]="state.editableStep1.natureOfEntity"
                (valueChange)="state.editableStep1.natureOfEntity = $event"
                [options]="natureOfEntitiesList"
                placeholder="Select nature of entity"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- GST Registered -->
            <div>
              <app-form-select
                label="GST Registered"
                [value]="state.editableStep1.gstRegistered"
                (valueChange)="onGstRegisteredChange($event)"
                [options]="yesNo"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- MSME / Udyam Registered -->
            <div>
              <app-form-select
                label="MSME / Udyam Registered"
                [value]="state.editableStep1.msmeRegistered"
                (valueChange)="onMsmeRegisteredChange($event)"
                [options]="yesNo"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- Conditional: GST details (Side-by-side in 2 equal columns) -->
            @if (state.editableStep1.gstRegistered === 'Yes') {
              <div>
                <app-form-input
                  label="GSTIN"
                  [value]="state.editableStep1.gstin"
                  (valueChange)="state.editableStep1.gstin = $event"
                  placeholder="Enter GSTIN"
                  [required]="true"
                  [uppercase]="true"
                  [maxLength]="15"
                  [disabled]="!state.isEditingStep2()"
                ></app-form-input>
              </div>

              <div>
                <app-form-file-upload
                  label="GST Registration Certificate"
                  [dropzoneStyle]="true"
                  uploadPrompt="Upload GST Registration Certificate"
                  [fileDoc]="state.editableStep1.gstCertDoc"
                  (fileChange)="state.editableStep1.gstCertDoc = $event"
                  [required]="true"
                  [disabled]="!state.isEditingStep2()"
                ></app-form-file-upload>
              </div>
            }

            <!-- Conditional: MSME details (Side-by-side in 2 equal columns) -->
            @if (state.editableStep1.msmeRegistered === 'Yes') {
              <div>
                <app-form-input
                  label="Udyam Number"
                  [value]="state.editableStep1.udyamNumber"
                  (valueChange)="state.editableStep1.udyamNumber = $event"
                  placeholder="Enter Udyam registration number"
                  [required]="true"
                  [uppercase]="true"
                  [maxLength]="19"
                  [disabled]="!state.isEditingStep2()"
                ></app-form-input>
              </div>

              <div>
                <app-form-file-upload
                  label="MSME / Udyam Registration Certificate"
                  [dropzoneStyle]="true"
                  uploadPrompt="Upload MSME / Udyam Registration Certificate"
                  [fileDoc]="state.editableStep1.msmeCertDoc"
                  (fileChange)="state.editableStep1.msmeCertDoc = $event"
                  [required]="true"
                  [disabled]="!state.isEditingStep2()"
                ></app-form-file-upload>
              </div>
            }
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#EADCE2]"></div>

        <!-- 2. Registration & Documents -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Registration &amp; Statutory Documents
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- Registration Number -->
            <div>
              <app-form-input
                label="Registration No. (CIN / Reg. No.)"
                [value]="state.editableStep1.registrationNumber"
                (valueChange)="state.editableStep1.registrationNumber = $event"
                placeholder="Enter registration number"
                [required]="true"
                [uppercase]="true"
                [maxLength]="50"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Date of Registration -->
            <div>
              <app-form-input
                label="Date of Registration"
                type="date"
                [value]="state.editableStep1.dateOfRegistration"
                (valueChange)="state.editableStep1.dateOfRegistration = $event"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- State / UT of Registration -->
            <div>
              <app-form-select
                label="State / UT of Registration"
                [value]="state.editableStep1.stateOfLegalReg"
                (valueChange)="state.editableStep1.stateOfLegalReg = $event"
                [options]="statesList"
                placeholder="Select state / UT"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- Organisation PAN -->
            <div>
              <app-form-input
                label="Organisation PAN"
                [value]="state.editableStep1.companyPan"
                (valueChange)="state.editableStep1.companyPan = $event"
                placeholder="Enter organisation PAN"
                [required]="true"
                [uppercase]="true"
                [maxLength]="10"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Upload Cards (Side-by-side equal width) -->
            <div>
              <app-form-file-upload
                label="Certificate of Registration / Incorporation"
                [dropzoneStyle]="true"
                uploadPrompt="Upload Certificate of Registration"
                [fileDoc]="state.editableStep1.registrationCertDoc"
                (fileChange)="state.editableStep1.registrationCertDoc = $event"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-file-upload>
            </div>

            <div>
              <app-form-file-upload
                label="Organisation PAN Card"
                [dropzoneStyle]="true"
                uploadPrompt="Upload Organisation PAN Card"
                [fileDoc]="state.editableStep1.panCardDoc"
                (fileChange)="state.editableStep1.panCardDoc = $event"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-file-upload>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#EADCE2]"></div>

        <!-- 3. Contact Information -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Contact Information
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- Organisation Contact No. -->
            <div>
              <app-form-input
                label="Organisation Contact No."
                type="tel"
                [value]="state.editableStep1.contactNo"
                (valueChange)="state.editableStep1.contactNo = $event"
                placeholder="Enter contact number"
                [required]="true"
                [maxLength]="15"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Organisation Email ID -->
            <div>
              <app-form-input
                label="Organisation Email ID"
                type="email"
                [value]="state.editableStep1.emailId"
                (valueChange)="state.editableStep1.emailId = $event"
                placeholder="Enter email address"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Website -->
            <div>
              <app-form-input
                label="Website"
                [value]="state.editableStep1.website"
                (valueChange)="state.editableStep1.website = $event"
                placeholder="Enter website (https://www.example.com)"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- NSDC Partner -->
            <div>
              <app-form-select
                label="NSDC Partner"
                [value]="state.editableStep1.nsdcPartner"
                (valueChange)="state.editableStep1.nsdcPartner = $event"
                [options]="nsdcPartnersList"
                placeholder="Select partner type"
                [required]="false"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#EADCE2]"></div>

        <!-- 4. Registered & Office Address -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#EADCE2]">
            <h3 class="text-[16px] font-semibold text-[#7C0E44] tracking-tight m-0">
              Registered &amp; Office Address
            </h3>
          </div>

          <!-- Subsection A: Registered Address -->
          <div class="space-y-3.5 pt-1">
            <h4 class="text-[15px] font-semibold text-[#7C0E44] m-0">
              A. Registered Address
            </h4>

            <!-- Registered Address (Full width) -->
            <div>
              <app-form-textarea
                label="Registered Address"
                [value]="state.editableStep1.registeredAddress"
                (valueChange)="state.editableStep1.registeredAddress = $event"
                placeholder="Enter address, locality, building name and number"
                [required]="true"
                [rows]="2"
                [disabled]="!state.isEditingStep2()"
              ></app-form-textarea>
            </div>

            <!-- State, District, PIN Code (3 equal-width columns) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5">
              <div>
                <app-form-select
                  label="State / UT"
                  [value]="state.editableStep1.registeredState"
                  (valueChange)="onRegisteredStateChange($event)"
                  [options]="statesList"
                  placeholder="Select state / UT"
                  [required]="true"
                  [disabled]="!state.isEditingStep2()"
                ></app-form-select>
              </div>

              <div>
                <app-form-select
                  label="District"
                  [value]="state.editableStep1.registeredDistrict"
                  (valueChange)="state.editableStep1.registeredDistrict = $event"
                  [options]="districtsFor(state.editableStep1.registeredState)"
                  [disabled]="!state.isEditingStep2() || !state.editableStep1.registeredState"
                  placeholder="Select district"
                  [required]="true"
                ></app-form-select>
              </div>

              <div>
                <app-form-input
                  label="PIN Code"
                  type="tel"
                  [value]="state.editableStep1.registeredPincode"
                  (valueChange)="state.editableStep1.registeredPincode = $event"
                  placeholder="Enter PIN code"
                  [required]="true"
                  [maxLength]="6"
                  [disabled]="!state.isEditingStep2()"
                ></app-form-input>
              </div>
            </div>
          </div>

          <!-- Same as registered Checkbox Row -->
          <div class="w-full flex items-center justify-between p-3 rounded-lg border border-[#EADCE2] bg-slate-50/70 transition-colors">
            <label class="inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-[#334155] cursor-pointer select-none">
              <input
                type="checkbox"
                [ngModel]="state.editableStep1.sameAsRegistered"
                (ngModelChange)="state.editableStep1.sameAsRegistered = $event"
                [disabled]="!state.isEditingStep2()"
                class="w-4 h-4 text-[#7C0E44] border-[#EADCE2] rounded focus:ring-[#AA5E7A] accent-[#7C0E44]"
              />
              <span>Office address is the same as registered address</span>
            </label>
            @if (state.editableStep1.sameAsRegistered) {
              <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Synchronized
              </span>
            }
          </div>

          <!-- Subsection B: Office Address -->
          @if (!state.editableStep1.sameAsRegistered) {
            <div class="space-y-3.5 pt-1">
              <h4 class="text-[15px] font-semibold text-[#7C0E44] m-0">
                B. Office Address
              </h4>

              <!-- Office Address (Full width) -->
              <div>
                <app-form-textarea
                  label="Office Address"
                  [value]="state.editableStep1.officeAddress"
                  (valueChange)="state.editableStep1.officeAddress = $event"
                  placeholder="Enter office address, locality, building name and number"
                  [required]="true"
                  [rows]="2"
                  [disabled]="!state.isEditingStep2()"
                ></app-form-textarea>
              </div>

              <!-- State, District, PIN Code (3 equal-width columns) -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5">
                <div>
                  <app-form-select
                    label="State / UT"
                    [value]="state.editableStep1.officeState"
                    (valueChange)="onOfficeStateChange($event)"
                    [options]="statesList"
                    placeholder="Select state / UT"
                    [required]="true"
                    [disabled]="!state.isEditingStep2()"
                  ></app-form-select>
                </div>

                <div>
                  <app-form-select
                    label="District"
                    [value]="state.editableStep1.officeDistrict"
                    (valueChange)="state.editableStep1.officeDistrict = $event"
                    [options]="districtsFor(state.editableStep1.officeState)"
                    [disabled]="!state.isEditingStep2() || !state.editableStep1.officeState"
                    placeholder="Select district"
                    [required]="true"
                  ></app-form-select>
                </div>

                <div>
                  <app-form-input
                    label="PIN Code"
                    type="tel"
                    [value]="state.editableStep1.officePincode"
                    (valueChange)="state.editableStep1.officePincode = $event"
                    placeholder="Enter PIN code"
                    [required]="true"
                    [maxLength]="6"
                    [disabled]="!state.isEditingStep2()"
                  ></app-form-input>
                </div>
              </div>
            </div>
          }
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
