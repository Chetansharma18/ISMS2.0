import { Component, inject, computed, signal } from '@angular/core';
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
  FinancialYearEntry
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

      <!-- Section 1.1: Step 1 - Organization Details -->
      <app-form-section title="Step 1 - Organization Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <app-form-input
            label="TP/PIA Short Name"
            [value]="data().shortName"
            (valueChange)="update('shortName', $event)"
            placeholder="e.g. RSLDC-SKILLS"
            [required]="true"
            [maxLength]="50"
          ></app-form-input>

          <app-form-input
            label="TP/PIA Full Name"
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
            label="Registration Number of Entity (CIN / Registration No. / Other)"
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
            label="State/UT of Legal Registration"
            [value]="data().stateOfLegalReg"
            (valueChange)="update('stateOfLegalReg', $event)"
            [options]="statesList"
            [required]="true"
          ></app-form-select>

          <div class="md:col-span-2">
            <app-form-file-upload
              label="Certificate of Registration / Incorporation"
              [fileDoc]="data().registrationCertDoc"
              (fileChange)="updateDoc('registrationCertDoc', $event)"
              [required]="true"
            ></app-form-file-upload>
          </div>
        </div>
      </app-form-section>

      <!-- Section 1.2: Statutory Compliance Details -->
      <app-form-section title="Statutory & Tax Compliance">
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
            label="Organization PAN Card"
            [fileDoc]="data().panCardDoc"
            (fileChange)="updateDoc('panCardDoc', $event)"
            [required]="true"
          ></app-form-file-upload>

          <app-form-select
            label="GST Registered"
            [value]="data().gstRegistered"
            (valueChange)="onGstRegisteredChange($event)"
            [options]="['Yes', 'No']"
            [required]="true"
          ></app-form-select>

          @if (data().gstRegistered === 'Yes') {
            <app-form-input
              label="GSTIN"
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
            label="MSME Registered"
            [value]="data().msmeRegistered"
            (valueChange)="onMsmeRegisteredChange($event)"
            [options]="['Yes', 'No']"
            [required]="true"
          ></app-form-select>

          @if (data().msmeRegistered === 'Yes') {
            <app-form-input
              label="Udyam Number"
              [value]="data().udyamNumber"
              (valueChange)="update('udyamNumber', $event)"
              placeholder="e.g. UDYAM-RJ-14-0012345"
              [required]="true"
              [uppercase]="true"
              [maxLength]="19"
            ></app-form-input>

            <div class="md:col-span-2">
              <app-form-file-upload
                label="MSME / Udyam Registration Certificate"
                [fileDoc]="data().msmeCertDoc"
                (fileChange)="updateDoc('msmeCertDoc', $event)"
                [required]="true"
              ></app-form-file-upload>
            </div>
          }
        </div>
      </app-form-section>

      <!-- Section 1.3: Financial Details -->
      <app-form-section title="Financial Details">
        <p class="text-xs text-slate-500 mb-3 -mt-2">
          Enter the total turnover and skill-specific turnover for the last 3 financial years (in Indian Rupees, in Lacs).
        </p>

        <!-- Financial Year Rows Table -->
        <div class="border border-slate-200 rounded-lg overflow-hidden mb-3">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] font-semibold border-b border-slate-200">
                <th class="py-2 px-3 w-8 text-center border-r border-slate-200">#</th>
                <th class="py-2 px-3 border-r border-slate-200">Financial Year</th>
                <th class="py-2 px-3 border-r border-slate-200">
                  Total Turnover <span class="font-normal text-slate-400">(₹ in Lacs)</span>
                </th>
                <th class="py-2 px-3 border-r border-slate-200">
                  Skill Turnover <span class="font-normal text-slate-400">(₹ in Lacs)</span>
                </th>
                <th class="py-2 px-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (fy of data().financialYears; track fy.year; let i = $index) {
                <tr class="bg-white hover:bg-slate-50/50 transition-colors">
                  <td class="py-2 px-3 text-center text-slate-500 text-xs border-r border-slate-100">{{ i + 1 }}</td>
                  <!-- Financial Year Dropdown -->
                  <td class="py-2 px-3 border-r border-slate-100">
                    <select
                      [value]="fy.year"
                      (change)="updateFyYear(i, $any($event.target).value)"
                      class="w-full text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#0483AC] focus:border-[#0483AC]"
                    >
                      @for (yr of availableYears; track yr) {
                        <option [value]="yr" [selected]="fy.year === yr">{{ yr }}</option>
                      }
                    </select>
                  </td>
                  <!-- Total Turnover -->
                  <td class="py-2 px-3 border-r border-slate-100">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      [value]="fy.totalTurnover"
                      (input)="updateFyField(i, 'totalTurnover', $any($event.target).value)"
                      placeholder="e.g. 150.00"
                      class="w-full text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#0483AC] focus:border-[#0483AC]"
                    />
                  </td>
                  <!-- Skill Turnover -->
                  <td class="py-2 px-3 border-r border-slate-100">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      [value]="fy.skillTurnover"
                      (input)="updateFyField(i, 'skillTurnover', $any($event.target).value)"
                      placeholder="e.g. 60.00"
                      class="w-full text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#0483AC] focus:border-[#0483AC]"
                    />
                  </td>
                  <!-- Delete Row -->
                  <td class="py-2 px-3 text-center">
                    @if (data().financialYears.length > 1) {
                      <button
                        type="button"
                        (click)="removeFyRow(i)"
                        title="Remove this year"
                        class="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded transition-colors cursor-pointer"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </td>
                </tr>
              }
              <!-- 3-Year Average Row -->
              @if (data().financialYears.length > 0) {
                <tr class="bg-slate-50 border-t-2 border-slate-200">
                  <td class="py-2 px-3 border-r border-slate-100"></td>
                  <td class="py-2 px-3 text-xs font-semibold text-slate-700 border-r border-slate-100">
                    3-Year Average
                  </td>
                  <td class="py-2 px-3 text-xs font-semibold text-[#0483AC] border-r border-slate-100">
                    ₹ {{ avgTotalTurnover() }} Lacs
                  </td>
                  <td class="py-2 px-3 text-xs font-semibold text-[#0483AC] border-r border-slate-100">
                    ₹ {{ avgSkillTurnover() }} Lacs
                  </td>
                  <td class="py-2 px-3"></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Add Row Button -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="addFyRow()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0483AC] border border-[#0483AC]/40 rounded-md hover:bg-[#0483AC]/5 transition-colors cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Financial Year
          </button>
        </div>

        <!-- Turnover Certificate Upload -->
        <div class="mt-4">
          <app-form-file-upload
            label="CA-Certified Turnover Certificate"
            [fileDoc]="data().turnoverCertDoc"
            (fileChange)="updateDoc('turnoverCertDoc', $event)"
            [required]="true"
          ></app-form-file-upload>
        </div>
      </app-form-section>

      <!-- Section 1.4: Governance & Contact Profile -->
      <app-form-section title="Governance & Contact Profile">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
          <app-form-select
            label="NSDC Partner"
            [value]="data().nsdcPartner"
            (valueChange)="update('nsdcPartner', $event)"
            [options]="nsdcPartnersList"
            [required]="false"
          ></app-form-select>

          <app-form-input
            label="Company Contact No."
            type="tel"
            [value]="data().contactNo"
            (valueChange)="update('contactNo', $event)"
            placeholder="e.g. 9829012345"
            [required]="true"
            [maxLength]="15"
          ></app-form-input>

          <app-form-input
            label="Company Email-ID"
            type="email"
            [value]="data().emailId"
            (valueChange)="update('emailId', $event)"
            placeholder="e.g. info@organisation.com"
            [required]="true"
          ></app-form-input>

          <app-form-input
            label="Website"
            [value]="data().website"
            (valueChange)="update('website', $event)"
            placeholder="e.g. https://www.organisation.com"
          ></app-form-input>
        </div>
      </app-form-section>

      <!-- Section 1.4: Addresses -->
      <app-form-section title="Registered & Office Addresses">
        <div class="space-y-4">
          
          <!-- Registered Address Block -->
          <div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
              <div class="sm:col-span-3">
                <app-form-textarea
                  label="Address"
                  [value]="data().registeredAddress"
                  (valueChange)="update('registeredAddress', $event)"
                  placeholder="Street, locality, building name and number"
                  [required]="true"
                  [rows]="2"
                ></app-form-textarea>
              </div>

              <app-form-select
                label="State / UT"
                [value]="data().registeredState"
                (valueChange)="onRegisteredStateChange($event)"
                [options]="statesList"
                [required]="true"
              ></app-form-select>

              <app-form-select
                label="District"
                [value]="data().registeredDistrict"
                (valueChange)="update('registeredDistrict', $event)"
                [options]="registeredDistricts()"
                [disabled]="!data().registeredState"
                [required]="true"
              ></app-form-select>

              <app-form-input
                label="PIN Code"
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
                class="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-700 accent-slate-800"
              />
              <span>Office Address is the same as Registered Address</span>
            </label>
          </div>

          <!-- Office Address Block (if different) -->
          @if (!data().sameAsRegistered) {
            <div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                <div class="sm:col-span-3">
                  <app-form-textarea
                    label="Office Address"
                    [value]="data().officeAddress"
                    (valueChange)="update('officeAddress', $event)"
                    placeholder="Street, locality, building name and number"
                    [required]="true"
                    [rows]="2"
                  ></app-form-textarea>
                </div>

                <app-form-select
                  label="State / UT"
                  [value]="data().officeState"
                  (valueChange)="onOfficeStateChange($event)"
                  [options]="statesList"
                  [required]="true"
                ></app-form-select>

                <app-form-select
                  label="District"
                  [value]="data().officeDistrict"
                  (valueChange)="update('officeDistrict', $event)"
                  [options]="officeDistricts()"
                  [disabled]="!data().officeState"
                  [required]="true"
                ></app-form-select>

                <app-form-input
                  label="PIN Code"
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

  /** Last 6 financial years available for selection */
  readonly availableYears: string[] = this._buildYearOptions();

  private _buildYearOptions(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push(`${y - 1}-${String(y).slice(2)}`);
    }
    return years;
  }

  /** Computed 3-year average for Total Turnover */
  readonly avgTotalTurnover = computed(() => {
    const rows = this.data().financialYears;
    if (!rows.length) return '0.00';
    const sum = rows.reduce((acc, r) => acc + (parseFloat(r.totalTurnover) || 0), 0);
    return (sum / rows.length).toFixed(2);
  });

  /** Computed 3-year average for Skill Turnover */
  readonly avgSkillTurnover = computed(() => {
    const rows = this.data().financialYears;
    if (!rows.length) return '0.00';
    const sum = rows.reduce((acc, r) => acc + (parseFloat(r.skillTurnover) || 0), 0);
    return (sum / rows.length).toFixed(2);
  });

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

  /** Add a new financial year row (uses the next available year not already selected) */
  addFyRow(): void {
    const existing = this.data().financialYears.map(r => r.year);
    const nextYear = this.availableYears.find(y => !existing.includes(y)) || '';
    const updated = [...this.data().financialYears, { year: nextYear, totalTurnover: '', skillTurnover: '' }];
    this.otrFormService.updateStep1({ financialYears: updated });
  }

  /** Remove a financial year row by index */
  removeFyRow(index: number): void {
    const updated = this.data().financialYears.filter((_, i) => i !== index);
    this.otrFormService.updateStep1({ financialYears: updated });
  }

  /** Update the year dropdown for a specific row */
  updateFyYear(index: number, year: string): void {
    const updated = this.data().financialYears.map((r, i) =>
      i === index ? { ...r, year } : r
    );
    this.otrFormService.updateStep1({ financialYears: updated });
  }

  /** Update a numeric field (totalTurnover or skillTurnover) for a specific row */
  updateFyField(index: number, field: 'totalTurnover' | 'skillTurnover', value: string): void {
    const updated = this.data().financialYears.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    this.otrFormService.updateStep1({ financialYears: updated });
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
