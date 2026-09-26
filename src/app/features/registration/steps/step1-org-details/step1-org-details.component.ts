import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import {
  NATURE_OF_ENTITIES,
  STATES_MASTER,
  DISTRICTS_BY_STATE,
  NSDC_PARTNER_TYPES,
  FileDoc,
  REGEX
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

@Component({
  selector: 'app-step1-org-details',
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
    <div class="w-full space-y-3 font-sans">
      
      <!-- Organization, Compliance & Contact Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
        <!-- Short Name -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="TP/PIA Short Name"
            [value]="data().shortName"
            (valueChange)="update('shortName', $event)"
            placeholder="e.g. RSLDC-SKILLS"
            [required]="true"
            [maxLength]="50"
            [error]="getFieldError('shortName')"
          ></app-form-input>
        </div>

        <!-- Full Corporate Name -> 6 cols -->
        <div class="lg:col-span-6 sm:col-span-1">
          <app-form-input
            label="TP/PIA Full Name"
            [value]="data().fullName"
            (valueChange)="update('fullName', $event)"
            placeholder="e.g. Rajasthan Skill Development Solutions Pvt Ltd"
            [required]="true"
            [maxLength]="200"
            [error]="getFieldError('fullName')"
          ></app-form-input>
        </div>

        <!-- Nature of Entity -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-select
            label="Nature of Entity"
            [value]="data().natureOfEntity"
            (valueChange)="update('natureOfEntity', $event)"
            [options]="natureOfEntitiesList"
            placeholder="Select Nature"
            [required]="true"
            [error]="getFieldError('natureOfEntity')"
          ></app-form-select>
        </div>

        <!-- Registration Number -> 4 cols -->
        <div class="lg:col-span-4 sm:col-span-1">
          <app-form-input
            label="Registration No. (CIN / Reg No.)"
            [value]="data().registrationNumber"
            (valueChange)="update('registrationNumber', $event)"
            placeholder="e.g. U74999RJ2010PTC032456"
            [required]="true"
            [uppercase]="true"
            [maxLength]="50"
            [error]="getFieldError('registrationNumber')"
          ></app-form-input>
        </div>

        <!-- Date of Registration -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Date of Registration"
            type="date"
            [value]="data().dateOfRegistration"
            (valueChange)="update('dateOfRegistration', $event)"
            [required]="true"
            [error]="getFieldError('dateOfRegistration')"
          ></app-form-input>
        </div>

        <!-- State/UT of Legal Registration -> 5 cols -->
        <div class="lg:col-span-5 sm:col-span-1">
          <app-form-select
            label="State/UT of Registration"
            [value]="data().stateOfLegalReg"
            (valueChange)="update('stateOfLegalReg', $event)"
            [options]="statesList"
            [required]="true"
            [error]="getFieldError('stateOfLegalReg')"
          ></app-form-select>
        </div>

        <!-- Certificate of Incorporation Upload -> 12 cols -->
        <div class="lg:col-span-12 sm:col-span-2">
          <app-form-file-upload
            label="Certificate of Registration / Incorporation"
            [fileDoc]="data().registrationCertDoc"
            (fileChange)="updateDoc('registrationCertDoc', $event)"
            [required]="true"
            [error]="getFieldError('registrationCertDoc')"
          ></app-form-file-upload>
        </div>

        <!-- Company PAN -> 3 cols -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Company PAN"
            [value]="data().companyPan"
            (valueChange)="update('companyPan', $event)"
            placeholder="e.g. ABCDE1234F"
            [required]="true"
            [uppercase]="true"
            [maxLength]="10"
            [error]="getFieldError('companyPan')"
          ></app-form-input>
        </div>

        <!-- Organization PAN Card Upload -> 5 cols -->
        <div class="lg:col-span-5 sm:col-span-1">
          <app-form-file-upload
            label="Organization PAN Card"
            [fileDoc]="data().panCardDoc"
            (fileChange)="updateDoc('panCardDoc', $event)"
            [required]="true"
            [error]="getFieldError('panCardDoc')"
          ></app-form-file-upload>
        </div>

        <!-- GST Registered -> 2 cols -->
        <div class="lg:col-span-2 sm:col-span-1">
          <app-form-select
            label="GST Registered"
            [value]="data().gstRegistered"
            (valueChange)="onGstRegisteredChange($event)"
            [options]="['Yes', 'No']"
            [required]="true"
            [error]="getFieldError('gstRegistered')"
          ></app-form-select>
        </div>

        <!-- MSME Registered -> 2 cols -->
        <div class="lg:col-span-2 sm:col-span-1">
          <app-form-select
            label="MSME Registered"
            [value]="data().msmeRegistered"
            (valueChange)="onMsmeRegisteredChange($event)"
            [options]="['Yes', 'No']"
            [required]="true"
            [error]="getFieldError('msmeRegistered')"
          ></app-form-select>
        </div>

        <!-- Conditional: GST Details -->
        @if (data().gstRegistered === 'Yes') {
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input
              label="GSTIN"
              [value]="data().gstin"
              (valueChange)="update('gstin', $event)"
              placeholder="e.g. 08ABCDE1234F1Z5"
              [required]="true"
              [uppercase]="true"
              [maxLength]="15"
              [error]="getFieldError('gstin')"
            ></app-form-input>
          </div>

          <div class="lg:col-span-8 sm:col-span-1">
            <app-form-file-upload
              label="GST Registration Certificate"
              [fileDoc]="data().gstCertDoc"
              (fileChange)="updateDoc('gstCertDoc', $event)"
              [required]="true"
              [error]="getFieldError('gstCertDoc')"
            ></app-form-file-upload>
          </div>
        }

        <!-- Conditional: MSME Details -->
        @if (data().msmeRegistered === 'Yes') {
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input
              label="Udyam Number"
              [value]="data().udyamNumber"
              (valueChange)="update('udyamNumber', $event)"
              placeholder="e.g. UDYAM-RJ-14-0012345"
              [required]="true"
              [uppercase]="true"
              [maxLength]="19"
              [error]="getFieldError('udyamNumber')"
            ></app-form-input>
          </div>

          <div class="lg:col-span-8 sm:col-span-1">
            <app-form-file-upload
              label="MSME / Udyam Registration Certificate"
              [fileDoc]="data().msmeCertDoc"
              (fileChange)="updateDoc('msmeCertDoc', $event)"
              [required]="true"
              [error]="getFieldError('msmeCertDoc')"
            ></app-form-file-upload>
          </div>
        }

        <!-- Contact Profile Fields -->
        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-select
            label="NSDC Partner"
            [value]="data().nsdcPartner"
            (valueChange)="update('nsdcPartner', $event)"
            [options]="nsdcPartnersList"
            [required]="false"
          ></app-form-select>
        </div>

        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Company Contact No."
            type="tel"
            [value]="data().contactNo"
            (valueChange)="update('contactNo', $event)"
            placeholder="e.g. 9829012345"
            [required]="true"
            [maxLength]="15"
            [error]="getFieldError('contactNo')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Company Email-ID"
            type="email"
            [value]="data().emailId"
            (valueChange)="update('emailId', $event)"
            placeholder="e.g. info@organisation.com"
            [required]="true"
            [error]="getFieldError('emailId')"
          ></app-form-input>
        </div>

        <div class="lg:col-span-3 sm:col-span-1">
          <app-form-input
            label="Website"
            [value]="data().website"
            (valueChange)="update('website', $event)"
            placeholder="e.g. https://www.organisation.com"
          ></app-form-input>
        </div>
      </div>

      <!-- Address Details (Direct screen, no sub-heading) -->
      <div class="pt-2.5 border-t border-slate-200/80 space-y-2.5">
        <!-- Registered Address Block -->
        <div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
            <div class="lg:col-span-6 sm:col-span-2">
              <app-form-textarea
                label="Registered Address"
                [value]="data().registeredAddress"
                (valueChange)="update('registeredAddress', $event)"
                placeholder="Street, locality, building name and number"
                [required]="true"
                [error]="getFieldError('registeredAddress')"
              ></app-form-textarea>
            </div>

            <div class="lg:col-span-2 sm:col-span-1">
              <app-form-select
                label="State / UT"
                [value]="data().registeredState"
                (valueChange)="onRegisteredStateChange($event)"
                [options]="statesList"
                [required]="true"
                [error]="getFieldError('registeredState')"
              ></app-form-select>
            </div>

            <div class="lg:col-span-2 sm:col-span-1">
              <app-form-select
                label="District"
                [value]="data().registeredDistrict"
                (valueChange)="update('registeredDistrict', $event)"
                [options]="registeredDistricts()"
                [disabled]="!data().registeredState"
                [required]="true"
                [error]="getFieldError('registeredDistrict')"
              ></app-form-select>
            </div>

            <div class="lg:col-span-2 sm:col-span-1">
              <app-form-input
                label="PIN Code"
                type="tel"
                [value]="data().registeredPincode"
                (valueChange)="update('registeredPincode', $event)"
                placeholder="e.g. 302001"
                [required]="true"
                [maxLength]="6"
                [error]="getFieldError('registeredPincode')"
              ></app-form-input>
            </div>
          </div>
        </div>

        <!-- Same As Registered Checkbox -->
        <div class="pt-1 border-t border-slate-100">
          <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              [ngModel]="data().sameAsRegistered"
              (ngModelChange)="toggleSameAsRegistered($event)"
              class="w-4 h-4 text-[#0B3558] border-slate-300 rounded focus:ring-[#0B3558] accent-[#0B3558]"
            />
            <span>Office Address is the same as Registered Address</span>
          </label>
        </div>

        <!-- Office Address Block (if different) -->
        @if (!data().sameAsRegistered) {
          <div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
              <div class="lg:col-span-6 sm:col-span-2">
                <app-form-textarea
                  label="Office Address"
                  [value]="data().officeAddress"
                  (valueChange)="update('officeAddress', $event)"
                  placeholder="Street, locality, building name and number"
                  [required]="true"
                  [error]="getFieldError('officeAddress')"
                ></app-form-textarea>
              </div>

              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-select
                  label="State / UT"
                  [value]="data().officeState"
                  (valueChange)="onOfficeStateChange($event)"
                  [options]="statesList"
                  [required]="true"
                  [error]="getFieldError('officeState')"
                ></app-form-select>
              </div>

              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-select
                  label="District"
                  [value]="data().officeDistrict"
                  (valueChange)="update('officeDistrict', $event)"
                  [options]="officeDistricts()"
                  [disabled]="!data().officeState"
                  [required]="true"
                  [error]="getFieldError('officeDistrict')"
                ></app-form-select>
              </div>

              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-input
                  label="PIN Code"
                  type="tel"
                  [value]="data().officePincode"
                  (valueChange)="update('officePincode', $event)"
                  placeholder="e.g. 302001"
                  [required]="true"
                  [maxLength]="6"
                  [error]="getFieldError('officePincode')"
                ></app-form-input>
              </div>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class Step1OrgDetailsComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly natureOfEntitiesList = NATURE_OF_ENTITIES;
  readonly statesList = STATES_MASTER;
  readonly nsdcPartnersList = NSDC_PARTNER_TYPES;

  readonly data = computed(() => this.otrFormService.step1());
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(1));

  readonly registeredDistricts = computed(() => {
    const state = this.data().registeredState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

  readonly officeDistricts = computed(() => {
    const state = this.data().officeState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

  getFieldError(field: string): string | undefined {
    if (!this.isSubmitted()) return undefined;
    const d = this.data();
    switch (field) {
      case 'shortName':
        if (!d.shortName?.trim()) return 'TP/PIA Short Name is required';
        return undefined;
      case 'fullName':
        if (!d.fullName?.trim()) return 'TP/PIA Full Legal Name is required';
        return undefined;
      case 'natureOfEntity':
        if (!d.natureOfEntity?.trim()) return 'Nature of Entity is required';
        return undefined;
      case 'registrationNumber':
        if (!d.registrationNumber?.trim()) return 'Registration / CIN Number is required';
        return undefined;
      case 'dateOfRegistration':
        if (!d.dateOfRegistration) return 'Date of Registration is required';
        if (new Date(d.dateOfRegistration) > new Date()) return 'Date cannot be in the future';
        return undefined;
      case 'stateOfLegalReg':
        if (!d.stateOfLegalReg?.trim()) return 'State of Legal Registration is required';
        return undefined;
      case 'registrationCertDoc':
        if (!d.registrationCertDoc || d.registrationCertDoc.status !== 'uploaded') {
          return 'Registration Certificate is required';
        }
        return undefined;
      case 'companyPan':
        if (!d.companyPan?.trim()) return 'Company PAN is required';
        if (!REGEX.PAN.test(d.companyPan.toUpperCase())) return 'Invalid PAN format (e.g. ABCDE1234F)';
        return undefined;
      case 'panCardDoc':
        if (!d.panCardDoc || d.panCardDoc.status !== 'uploaded') {
          return 'Organization PAN Card is required';
        }
        return undefined;
      case 'gstin':
        if (d.gstRegistered === 'Yes') {
          if (!d.gstin?.trim()) return 'GSTIN is required';
          if (!REGEX.GSTIN.test(d.gstin.toUpperCase())) return 'Invalid GSTIN format (e.g. 08ABCDE1234F1Z5)';
        }
        return undefined;
      case 'gstCertDoc':
        if (d.gstRegistered === 'Yes' && (!d.gstCertDoc || d.gstCertDoc.status !== 'uploaded')) {
          return 'GST Certificate is required';
        }
        return undefined;
      case 'udyamNumber':
        if (d.msmeRegistered === 'Yes') {
          if (!d.udyamNumber?.trim()) return 'Udyam Registration Number is required';
          if (!REGEX.UDYAM.test(d.udyamNumber)) return 'Invalid Udyam Number format';
        }
        return undefined;
      case 'msmeCertDoc':
        if (d.msmeRegistered === 'Yes' && (!d.msmeCertDoc || d.msmeCertDoc.status !== 'uploaded')) {
          return 'MSME Certificate is required';
        }
        return undefined;
      case 'contactNo':
        if (!d.contactNo?.trim()) return 'Contact Number is required';
        return undefined;
      case 'emailId':
        if (!d.emailId?.trim()) return 'Official Email ID is required';
        if (!REGEX.EMAIL.test(d.emailId)) return 'Invalid Email ID format';
        return undefined;
      case 'registeredAddress':
        if (!d.registeredAddress?.trim()) return 'Registered Address is required';
        return undefined;
      case 'registeredState':
        if (!d.registeredState?.trim()) return 'Registered State is required';
        return undefined;
      case 'registeredDistrict':
        if (!d.registeredDistrict?.trim()) return 'Registered District is required';
        return undefined;
      case 'registeredPincode':
        if (!d.registeredPincode?.trim()) return 'PIN Code is required';
        if (!REGEX.INDIAN_PIN.test(d.registeredPincode)) return 'Invalid 6-digit PIN Code';
        return undefined;
      case 'officeAddress':
        if (!d.sameAsRegistered && !d.officeAddress?.trim()) return 'Office Address is required';
        return undefined;
      case 'officeState':
        if (!d.sameAsRegistered && !d.officeState?.trim()) return 'Office State is required';
        return undefined;
      case 'officeDistrict':
        if (!d.sameAsRegistered && !d.officeDistrict?.trim()) return 'Office District is required';
        return undefined;
      case 'officePincode':
        if (!d.sameAsRegistered) {
          if (!d.officePincode?.trim()) return 'Office PIN Code is required';
          if (!REGEX.INDIAN_PIN.test(d.officePincode)) return 'Invalid 6-digit PIN Code';
        }
        return undefined;
      default:
        return undefined;
    }
  }

  update(field: string, value: any): void {
    this.otrFormService.updateStep1({ [field]: value });
  }

  updateDoc(field: string, file: FileDoc | null): void {
    this.otrFormService.updateStep1({ [field]: file });
  }

  onGstRegisteredChange(val: string): void {
    this.otrFormService.updateStep1({
      gstRegistered: val as 'Yes' | 'No',
      gstin: val === 'No' ? '' : this.data().gstin,
      gstCertDoc: val === 'No' ? null : this.data().gstCertDoc
    });
  }

  onMsmeRegisteredChange(val: string): void {
    this.otrFormService.updateStep1({
      msmeRegistered: val as 'Yes' | 'No',
      udyamNumber: val === 'No' ? '' : this.data().udyamNumber,
      msmeCertDoc: val === 'No' ? null : this.data().msmeCertDoc
    });
  }

  onRegisteredStateChange(state: string): void {
    this.otrFormService.updateStep1({
      registeredState: state,
      registeredDistrict: ''
    });
  }

  onOfficeStateChange(state: string): void {
    this.otrFormService.updateStep1({
      officeState: state,
      officeDistrict: ''
    });
  }

  toggleSameAsRegistered(checked: boolean): void {
    this.otrFormService.updateStep1({ sameAsRegistered: checked });
  }
}
