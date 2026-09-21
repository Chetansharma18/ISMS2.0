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
  FileDoc
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';
import { FormSectionComponent } from '../../../../shared/components/form-controls/form-section/form-section.component';

@Component({
  selector: 'app-step1-org-details',
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

      <!-- Section 1.1: Organization Profile & Constitution -->
      <app-form-section title="Organization Profile & Constitution">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <app-form-input
            label="TP / PIA Short Name"
            [value]="data().shortName"
            (valueChange)="update('shortName', $event)"
            placeholder="e.g. RSLDC-SKILLS"
            [required]="true"
            [maxLength]="50"
          ></app-form-input>

          <app-form-input
            label="TP / PIA Full Legal Name"
            [value]="data().fullName"
            (valueChange)="update('fullName', $event)"
            placeholder="e.g. Rajasthan Skill Development Solutions Pvt Ltd"
            [required]="true"
            [maxLength]="200"
          ></app-form-input>

          <app-form-select
            label="Nature of Entity"
            [value]="data().natureOfEntity"
            (valueChange)="update('natureOfEntity', $event)"
            [options]="natureOfEntitiesList"
            placeholder="Select Nature of Entity"
            [required]="true"
          ></app-form-select>

          <app-form-input
            label="Registration / CIN No."
            [value]="data().registrationNumber"
            (valueChange)="update('registrationNumber', $event)"
            placeholder="e.g. U74999RJ2010PTC032456"
            [required]="true"
            [uppercase]="true"
            [maxLength]="50"
          ></app-form-input>

          <app-form-input
            label="Date of Registration as Legal Entity"
            type="date"
            [value]="data().dateOfRegistration"
            (valueChange)="update('dateOfRegistration', $event)"
            [required]="true"
          ></app-form-input>

          <app-form-select
            label="State / UT of Legal Registration"
            [value]="data().stateOfLegalReg"
            (valueChange)="update('stateOfLegalReg', $event)"
            [options]="statesList"
            [required]="true"
          ></app-form-select>

          <div class="md:col-span-2">
            <app-form-file-upload
              label="Certificate of Registration Document"
              [fileDoc]="data().registrationCertDoc"
              (fileChange)="updateDoc('registrationCertDoc', $event)"
              [required]="true"
            ></app-form-file-upload>
          </div>
        </div>
      </app-form-section>

      <!-- Section 1.2: Statutory & Tax Compliance Details -->
      <app-form-section title="Statutory & Tax Compliance Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <app-form-input
            label="Company PAN"
            [value]="data().companyPan"
            (valueChange)="update('companyPan', $event)"
            placeholder="e.g. ABCDE1234F"
            [required]="true"
            [uppercase]="true"
            [maxLength]="10"
          ></app-form-input>

          <app-form-file-upload
            label="Organization PAN Card Document"
            [fileDoc]="data().panCardDoc"
            (fileChange)="updateDoc('panCardDoc', $event)"
            [required]="true"
          ></app-form-file-upload>

          <app-form-select
            label="GST Registered?"
            [value]="data().gstRegistered"
            (valueChange)="onGstRegisteredChange($event)"
            [options]="['Yes', 'No']"
            [required]="true"
          ></app-form-select>

          @if (data().gstRegistered === 'Yes') {
            <app-form-input
              label="GSTIN Number"
              [value]="data().gstin"
              (valueChange)="update('gstin', $event)"
              placeholder="e.g. 08ABCDE1234F1Z5"
              [required]="true"
              [uppercase]="true"
              [maxLength]="15"
            ></app-form-input>

            <div class="md:col-span-2">
              <app-form-file-upload
                label="GST Registration Certificate"
                [fileDoc]="data().gstCertDoc"
                (fileChange)="updateDoc('gstCertDoc', $event)"
                [required]="true"
              ></app-form-file-upload>
            </div>
          }

          <app-form-select
            label="MSME / Udyam Registered?"
            [value]="data().msmeRegistered"
            (valueChange)="onMsmeRegisteredChange($event)"
            [options]="['Yes', 'No']"
            [required]="true"
          ></app-form-select>

          @if (data().msmeRegistered === 'Yes') {
            <app-form-input
              label="Udyam Registration Number"
              [value]="data().udyamNumber"
              (valueChange)="update('udyamNumber', $event)"
              placeholder="e.g. UDYAM-RJ-14-0012345"
              [required]="true"
              [uppercase]="true"
              [maxLength]="19"
            ></app-form-input>

            <div class="md:col-span-2">
              <app-form-file-upload
                label="MSME / Udyam Certificate"
                [fileDoc]="data().msmeCertDoc"
                (fileChange)="updateDoc('msmeCertDoc', $event)"
                [required]="true"
              ></app-form-file-upload>
            </div>
          }
        </div>
      </app-form-section>

      <!-- Section 1.3: Financial, Governance & Digital Profile -->
      <app-form-section title="Financial, Governance & Digital Profile">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
          <app-form-input
            label="Turn Over (₹ in Lakhs)"
            type="number"
            [value]="data().turnOver"
            (valueChange)="update('turnOver', $event)"
            placeholder="e.g. 250.50"
            prefixText="₹"
            suffixText="Lakhs"
            [required]="true"
          ></app-form-input>

          <app-form-select
            label="Blacklisted by any Govt Dept?"
            [value]="data().blackListed"
            (valueChange)="update('blackListed', $event)"
            [options]="['No', 'Yes']"
            [required]="true"
          ></app-form-select>

          <app-form-select
            label="NSDC Partner Affiliation"
            [value]="data().nsdcPartner"
            (valueChange)="update('nsdcPartner', $event)"
            [options]="nsdcPartnersList"
            [required]="true"
          ></app-form-select>

          <app-form-input
            label="Company Contact Number"
            type="tel"
            [value]="data().contactNo"
            (valueChange)="update('contactNo', $event)"
            placeholder="e.g. 9829012345"
            [required]="true"
            [maxLength]="10"
          ></app-form-input>

          <app-form-input
            label="Official Company Email-ID"
            type="email"
            [value]="data().emailId"
            (valueChange)="update('emailId', $event)"
            placeholder="e.g. info@organisation.com"
            [required]="true"
          ></app-form-input>

          <app-form-input
            label="Official Website URL"
            [value]="data().website"
            (valueChange)="update('website', $event)"
            placeholder="e.g. https://www.organisation.com"
          ></app-form-input>
        </div>
      </app-form-section>

      <!-- Section 1.4: Registered & Operational Addresses -->
      <app-form-section title="Registered & Operational Address">
        <div class="space-y-4">
          
          <!-- Registered Address Block -->
          <div>
            <span class="text-xs font-bold text-slate-700 block mb-2">Registered Office Address</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
              <div class="sm:col-span-3">
                <app-form-textarea
                  label="Registered Premise Address"
                  [value]="data().registeredAddress"
                  (valueChange)="update('registeredAddress', $event)"
                  placeholder="Street, locality, building name and number"
                  [required]="true"
                  [rows]="2"
                ></app-form-textarea>
              </div>

              <app-form-select
                label="Registered State"
                [value]="data().registeredState"
                (valueChange)="onRegisteredStateChange($event)"
                [options]="statesList"
                [required]="true"
              ></app-form-select>

              <app-form-select
                label="Registered District"
                [value]="data().registeredDistrict"
                (valueChange)="update('registeredDistrict', $event)"
                [options]="registeredDistricts()"
                [disabled]="!data().registeredState"
                [required]="true"
              ></app-form-select>

              <app-form-input
                label="Registered PIN Code"
                type="tel"
                [value]="data().registeredPincode"
                (valueChange)="update('registeredPincode', $event)"
                placeholder="e.g. 302001"
                [required]="true"
                [maxLength]="6"
              ></app-form-input>
            </div>
          </div>

          <!-- Same As Registered Checkbox -->
          <div class="pt-2 border-t border-slate-100">
            <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                [ngModel]="data().sameAsRegistered"
                (ngModelChange)="toggleSameAsRegistered($event)"
                class="w-4 h-4 text-[#131862] border-slate-300 rounded focus:ring-[#131862]"
              />
              <span>Operational / Correspondence Address is the same as Registered Address</span>
            </label>
          </div>

          <!-- Operational Address Block (if different) -->
          @if (!data().sameAsRegistered) {
            <div>
              <span class="text-xs font-bold text-slate-700 block mb-2">Operational Office Address</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                <div class="sm:col-span-3">
                  <app-form-textarea
                    label="Operational Office Address"
                    [value]="data().officeAddress"
                    (valueChange)="update('officeAddress', $event)"
                    placeholder="Street, locality, building name and number"
                    [required]="true"
                    [rows]="2"
                  ></app-form-textarea>
                </div>

                <app-form-select
                  label="Operational State"
                  [value]="data().officeState"
                  (valueChange)="onOfficeStateChange($event)"
                  [options]="statesList"
                  [required]="true"
                ></app-form-select>

                <app-form-select
                  label="Operational District"
                  [value]="data().officeDistrict"
                  (valueChange)="update('officeDistrict', $event)"
                  [options]="officeDistricts()"
                  [disabled]="!data().officeState"
                  [required]="true"
                ></app-form-select>

                <app-form-input
                  label="Operational PIN Code"
                  type="tel"
                  [value]="data().officePincode"
                  (valueChange)="update('officePincode', $event)"
                  placeholder="e.g. 302001"
                  [required]="true"
                  [maxLength]="6"
                ></app-form-input>
              </div>
            </div>
          }

        </div>
      </app-form-section>

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

  readonly registeredDistricts = computed(() => {
    const state = this.data().registeredState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

  readonly officeDistricts = computed(() => {
    const state = this.data().officeState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

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
