import { ChangeDetectionStrategy, Component, inject, computed, signal, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataEngineService } from '../../../../core/services/data-engine.service';
import { SectorMasterItem } from '../../../../core/models/admin-masters.model';
import { SKILL_SECTOR_NAMES } from '../../../../core/config/sector.config';
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
import { DocTableDirective, IconComponent, InputDirective } from '../../../../shared';

@Component({
  selector: 'app-step1-org-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent,
    DocTableDirective,
    InputDirective
  ],
  template: `
    <div class="w-full space-y-6 font-sans">

      <!-- ====================================================================
           1. BASIC ORGANISATION DETAILS
           ==================================================================== -->
      <section class="space-y-4">
        <div class="pb-2 border-b border-[#E8EEF5]">
          <h3 class="text-lg font-semibold text-primary tracking-tight m-0">
            1. Basic Organisation Details
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
          <!-- 1. Organisation Name * -->
          <div>
            <app-form-input
              label="Organisation Name"
              [value]="data().fullName"
              (valueChange)="update('fullName', $event)"
              placeholder="Enter organisation name"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('fullName')"
            ></app-form-input>
          </div>

          <!-- 2. Trade / Operating Name -->
          <div>
            <app-form-input
              label="Trade / Operating Name"
              [value]="data().shortName"
              (valueChange)="update('shortName', $event)"
              placeholder="Enter trade or operating name"
              [required]="false"
              [disabled]="disabled()"
              [error]="getFieldError('shortName')"
            ></app-form-input>
          </div>

          <!-- 3. Nature of Entity * -->
          <div>
            <app-form-select
              label="Nature of Entity"
              [value]="data().natureOfEntity"
              (valueChange)="update('natureOfEntity', $event)"
              [options]="natureOfEntitiesList"
              placeholder="Select entity type"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('natureOfEntity')"
            ></app-form-select>
          </div>

          <!-- 4. Preferred Sector * (Multi-select with Checkboxes) -->
          <div>
            <app-form-select
              label="Preferred Sector"
              [value]="data().preferredSector"
              (valueChange)="update('preferredSector', $event)"
              [options]="sectorOptions()"
              placeholder="Select preferred sector(s)"
              [multiple]="true"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('preferredSector')"
            ></app-form-select>
          </div>

          <!-- 5. NSDC Partner -->
          <div>
            <app-form-select
              label="NSDC Partner"
              [value]="data().nsdcPartner"
              (valueChange)="update('nsdcPartner', $event)"
              [options]="nsdcPartnersList"
              placeholder="Select status"
              [required]="false"
              [disabled]="disabled()"
              [error]="getFieldError('nsdcPartner')"
            ></app-form-select>
          </div>

          <!-- 6. GST Registered * -->
          <div>
            <app-form-select
              label="GST Registered"
              [value]="data().gstRegistered"
              (valueChange)="onGstRegisteredChange($event)"
              [options]="['Yes', 'No']"
              placeholder="Select GST status"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('gstRegistered')"
            ></app-form-select>
          </div>

          <!-- 7. MSME / Udyam Registered * -->
          <div>
            <app-form-select
              label="MSME / Udyam Registered"
              [value]="data().msmeRegistered"
              (valueChange)="onMsmeRegisteredChange($event)"
              [options]="['Yes', 'No']"
              placeholder="Select MSME status"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('msmeRegistered')"
            ></app-form-select>
          </div>

          <!-- Conditional GST Fields (When GST Registered is Yes) -> Side-by-side in 2 columns -->
          @if (data().gstRegistered === 'Yes') {
            <div>
              <app-form-input
                label="GSTIN / GST Registration Number"
                [value]="data().gstin"
                (valueChange)="update('gstin', $event)"
                placeholder="08ABCDE1234F1Z5"
                [required]="true"
                [uppercase]="true"
                [maxLength]="15"
                [disabled]="disabled()"
                [error]="getFieldError('gstin')"
              ></app-form-input>
            </div>

            <div>
              <app-form-file-upload
                label="GST Registration Certificate"
                [dropzoneStyle]="true"
                uploadPrompt="Upload GST registration certificate"
                [fileDoc]="data().gstCertDoc"
                (fileChange)="updateDoc('gstCertDoc', $event)"
                [required]="true"
                [disabled]="disabled()"
                [error]="getFieldError('gstCertDoc')"
              ></app-form-file-upload>
            </div>
          }

          <!-- Conditional MSME Fields (When MSME / Udyam Registered is Yes) -> Side-by-side in 2 columns -->
          @if (data().msmeRegistered === 'Yes') {
            <div>
              <app-form-input
                label="Udyam Registration Number"
                [value]="data().udyamNumber"
                (valueChange)="update('udyamNumber', $event)"
                placeholder="UDYAM-XX-00-0000000"
                [required]="true"
                [uppercase]="true"
                [maxLength]="25"
                [disabled]="disabled()"
                [error]="getFieldError('udyamNumber')"
              ></app-form-input>
            </div>

            <div>
              <app-form-file-upload
                label="MSME / Udyam Certificate"
                [dropzoneStyle]="true"
                uploadPrompt="Upload MSME / Udyam certificate"
                [fileDoc]="data().msmeCertDoc"
                (fileChange)="updateDoc('msmeCertDoc', $event)"
                [required]="true"
                [disabled]="disabled()"
                [error]="getFieldError('msmeCertDoc')"
              ></app-form-file-upload>
            </div>
          }
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-[#E8EEF5]"></div>

      <!-- ====================================================================
           2. REGISTRATION & DOCUMENTS
           ==================================================================== -->
      <section class="space-y-4">
        <div class="pb-2 border-b border-[#E8EEF5]">
          <h3 class="text-lg font-semibold text-primary tracking-tight m-0">
            2. Registration &amp; Documents
          </h3>
        </div>

        <!-- 2-column balanced grid with uploads side-by-side -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
          <!-- 1. Registration Number * -->
          <div>
            <app-form-input
              label="Registration Number"
              [value]="data().registrationNumber"
              (valueChange)="update('registrationNumber', $event)"
              placeholder="Enter registration number (CIN)"
              [required]="true"
              [uppercase]="true"
              [disableLabelClick]="true"
              [disabled]="disabled()"
              [error]="getFieldError('registrationNumber')"
            ></app-form-input>
          </div>

          <!-- 2. Date of Registration * -->
          <div>
            <app-form-input
              label="Date of Registration"
              type="date"
              [value]="data().dateOfRegistration"
              (valueChange)="update('dateOfRegistration', $event)"
              placeholder="DD-MM-YYYY"
              [required]="true"
              [max]="maxRegistrationDate"
              [disabled]="disabled()"
              (blur)="markTouched('dateOfRegistration')"
              [error]="getFieldError('dateOfRegistration')"
            ></app-form-input>
          </div>

          <!-- 3. State / UT of Registration * -->
          <div>
            <app-form-select
              label="State / UT of Registration"
              [value]="data().stateOfLegalReg"
              (valueChange)="update('stateOfLegalReg', $event)"
              [options]="statesList"
              placeholder="Select state / UT"
              [required]="true"
              [clearable]="true"
              [disabled]="disabled()"
              [error]="getFieldError('stateOfLegalReg')"
            ></app-form-select>
          </div>

          <!-- 4. Company PAN * -->
          <div>
            <app-form-input
              label="Company PAN"
              [value]="data().companyPan"
              (valueChange)="update('companyPan', $event)"
              placeholder="Enter PAN number"
              [required]="true"
              [uppercase]="true"
              [maxLength]="10"
              [disabled]="disabled()"
              [error]="getFieldError('companyPan')"
            ></app-form-input>
          </div>

          <!-- 5. Certificate of Registration / Incorporation * (Side-by-side, equal width) -->
          <div>
            <app-form-file-upload
              label="Certificate of Registration / Incorporation"
              [dropzoneStyle]="true"
              uploadPrompt="Upload registration certificate"
              [fileDoc]="data().registrationCertDoc"
              (fileChange)="updateDoc('registrationCertDoc', $event)"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('registrationCertDoc')"
            ></app-form-file-upload>
          </div>

          <!-- 6. Organisation PAN Card * (Side-by-side, equal width) -->
          <div>
            <app-form-file-upload
              label="Organisation PAN Card"
              [dropzoneStyle]="true"
              uploadPrompt="Upload PAN card"
              [fileDoc]="data().panCardDoc"
              (fileChange)="updateDoc('panCardDoc', $event)"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('panCardDoc')"
            ></app-form-file-upload>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-[#E8EEF5]"></div>

      <!-- ====================================================================
           3. CONTACT INFORMATION
           ==================================================================== -->
      <section class="space-y-4">
        <div class="pb-2 border-b border-[#E8EEF5]">
          <h3 class="text-lg font-semibold text-primary tracking-tight m-0">
            3. Contact Information
          </h3>
        </div>

        <!-- 2-column balanced grid: Contact No & Email in row 1, Website in col 1 row 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
          <!-- 1. Contact Number * (10-digit mobile) -->
          <div>
            <app-form-input
              label="Contact Number"
              type="tel"
              [value]="data().contactNo"
              (valueChange)="update('contactNo', $event)"
              (blur)="markTouched('contactNo')"
              placeholder="10-digit mobile number"
              [required]="true"
              [numericOnly]="true"
              [maxLength]="10"
              [disabled]="disabled()"
              [error]="getFieldError('contactNo')"
            ></app-form-input>
          </div>

          <!-- 2. Organisation Email ID * -->
          <div>
            <app-form-input
              label="Organisation Email ID"
              type="email"
              [value]="data().emailId"
              (valueChange)="update('emailId', $event)"
              (blur)="markTouched('emailId')"
              placeholder="Enter official email"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('emailId')"
            ></app-form-input>
          </div>

          <!-- 3. Website (Optional) (Column 1 of row 2, leaving column 2 clean/empty) -->
          <div>
            <app-form-input
              label="Website (Optional)"
              type="text"
              [value]="data().website"
              (valueChange)="update('website', $event)"
              (blur)="markTouched('website')"
              placeholder="https://example.com"
              [required]="false"
              [disabled]="disabled()"
              [error]="getFieldError('website')"
            ></app-form-input>
          </div>

          <!-- Empty column to balance row 2 without inventing fields -->
          <div class="hidden md:block"></div>
        </div>
      </section>

      <!-- Divider -->
      <div class="border-t border-[#E8EEF5]"></div>

      <!-- ====================================================================
           4. REGISTERED & OFFICE ADDRESS
           ==================================================================== -->
      <section class="space-y-5">
        <div class="pb-2 border-b border-[#E8EEF5]">
          <h3 class="text-lg font-semibold text-primary tracking-tight m-0">
            4. Registered &amp; Office Address
          </h3>
        </div>

        <!-- Subsection A: Registered Address -->
        <div class="space-y-3.5">
          <h4 class="text-sm font-semibold text-slate-800 m-0">
            A. Registered Address
          </h4>

          <!-- 1. Registered Address * (Full width) -->
          <div>
            <app-form-textarea
              label="Registered Address"
              [value]="data().registeredAddress"
              (valueChange)="update('registeredAddress', $event)"
              placeholder="Address, locality, building name and number"
              [required]="true"
              [disabled]="disabled()"
              [error]="getFieldError('registeredAddress')"
            ></app-form-textarea>
          </div>

          <!-- 2, 3, 4: State / UT *, District *, PIN Code * (3-column layout) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5">
            <div>
              <app-form-select
                label="State / UT"
                [value]="data().registeredState"
                (valueChange)="onRegisteredStateChange($event)"
                [options]="statesList"
                placeholder="Select state"
                [required]="true"
                [clearable]="true"
                [disabled]="disabled()"
                [error]="getFieldError('registeredState')"
              ></app-form-select>
            </div>

            <div>
              <app-form-select
                label="District"
                [value]="data().registeredDistrict"
                (valueChange)="update('registeredDistrict', $event)"
                [options]="registeredDistricts()"
                [disabled]="disabled() || !data().registeredState"
                placeholder="Select district"
                [required]="true"
                [error]="getFieldError('registeredDistrict')"
              ></app-form-select>
            </div>

            <div>
              <app-form-input
                label="PIN Code"
                type="tel"
                [value]="data().registeredPincode"
                (valueChange)="update('registeredPincode', $event)"
                (blur)="markTouched('registeredPincode')"
                placeholder="6-digit PIN code"
                [required]="true"
                [numericOnly]="true"
                [maxLength]="6"
                [disabled]="disabled()"
                [error]="getFieldError('registeredPincode')"
              ></app-form-input>
            </div>
          </div>
        </div>

        <!-- Middle Checkbox: Office Address Same as Registered Address -->
        <div class="py-3 px-4 bg-slate-50/70 border border-[#D6E3F0] rounded-lg flex items-center justify-between">
          <label class="inline-flex items-center gap-2.5 text-sm font-medium text-[#334155] cursor-pointer select-none">
            <input
              type="checkbox"
              [ngModel]="data().sameAsRegistered"
              (ngModelChange)="toggleSameAsRegistered($event)"
              [disabled]="disabled()"
              class="w-4.5 h-4.5 text-[#8B104D] border-[#D6E3F0] rounded focus:ring-[#8B104D] accent-[#8B104D] cursor-pointer"
            />
            <span>Office address is the same as registered address</span>
          </label>
          @if (data().sameAsRegistered) {
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Synchronized
            </span>
          }
        </div>

        <!-- Subsection B: Office Address (Displayed when unselected) -->
        @if (!data().sameAsRegistered) {
          <div class="space-y-3.5 pt-1">
            <h4 class="text-sm font-semibold text-slate-800 m-0">
              B. Office Address
            </h4>

            <!-- 1. Office Address * (Full width) -->
            <div>
              <app-form-textarea
                label="Office Address"
                [value]="data().officeAddress"
                (valueChange)="update('officeAddress', $event)"
                placeholder="Address, locality, building name and number"
                [required]="true"
                [disabled]="disabled()"
                [error]="getFieldError('officeAddress')"
              ></app-form-textarea>
            </div>

            <!-- 2, 3, 4: State / UT *, District *, PIN Code * (3-column layout) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5">
              <div>
                <app-form-select
                  label="State / UT"
                  [value]="data().officeState"
                  (valueChange)="onOfficeStateChange($event)"
                  [options]="statesList"
                  placeholder="Select state"
                  [required]="true"
                  [clearable]="true"
                  [disabled]="disabled()"
                  [error]="getFieldError('officeState')"
                ></app-form-select>
              </div>

              <div>
                <app-form-select
                  label="District"
                  [value]="data().officeDistrict"
                  (valueChange)="update('officeDistrict', $event)"
                  [options]="officeDistricts()"
                  [disabled]="disabled() || !data().officeState"
                  placeholder="Select district"
                  [required]="true"
                  [error]="getFieldError('officeDistrict')"
                ></app-form-select>
              </div>

              <div>
                <app-form-input
                  label="PIN Code"
                  type="tel"
                  [value]="data().officePincode"
                  (valueChange)="update('officePincode', $event)"
                  (blur)="markTouched('officePincode')"
                  placeholder="6-digit PIN code"
                  [required]="true"
                  [numericOnly]="true"
                  [maxLength]="6"
                  [disabled]="disabled()"
                  [error]="getFieldError('officePincode')"
                ></app-form-input>
              </div>
            </div>
          </div>
        }
      </section>

      <!-- Divider -->
      <div class="border-t border-[#E8EEF5]"></div>

      <!-- ====================================================================
           5. FINANCIAL STANDING & ANNUAL TURNOVER
           ==================================================================== -->
      <section class="space-y-4">
        <div class="pb-2 border-b border-[#E8EEF5]">
          <h3 class="text-lg font-semibold text-primary tracking-tight m-0">
            5. Financial Standing &amp; Annual Turnover
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
          <!-- Declared Turnover -->
          <div>
            <app-form-input
              label="Declared Annual Turnover (in ₹ Lacs)"
              [value]="data().turnOver"
              (valueChange)="update('turnOver', $event)"
              placeholder="e.g. 1203.35"
              [required]="false"
              [disabled]="disabled()"
              [error]="getFieldError('turnOver')"
            ></app-form-input>
          </div>

          <!-- Blacklisted status -->
          <div>
            <app-form-select
              label="Blacklisted by Central / State Department"
              [value]="data().blackListed"
              (valueChange)="update('blackListed', $event)"
              [options]="['No', 'Yes']"
              placeholder="Select blacklisting status"
              [required]="false"
              [disabled]="disabled()"
              [error]="getFieldError('blackListed')"
            ></app-form-select>
          </div>

          <!-- CA-Certified Turnover Certificate upload -->
          <div class="md:col-span-2">
            <app-form-file-upload
              label="CA-Certified Turnover Certificate"
              [dropzoneStyle]="true"
              uploadPrompt="Upload CA-certified turnover certificate (with valid UDIN)"
              [fileDoc]="data().turnoverCertDoc"
              (fileChange)="updateDoc('turnoverCertDoc', $event)"
              [required]="false"
              [disabled]="disabled()"
              [error]="getFieldError('turnoverCertDoc')"
            ></app-form-file-upload>
          </div>
        </div>

        <!-- Multi-Year Turnover Grid (3 Financial Years) -->
        @if (data().financialYears && data().financialYears.length > 0) {
          <div class="pt-2">
            <span class="text-xs font-semibold text-slate-700 block mb-2">
              Three Consecutive Fiscal Years Turnover (₹ in Lacs)
            </span>
            <div class="overflow-x-auto border border-[#EADCE2] rounded-lg">
              <!-- ui-guard-allow: financial turnover table -->
              <table appDocTable class="w-full text-left border-collapse text-xs bg-white">
                <thead>
                  <tr class="bg-slate-50 text-slate-800 font-semibold border-b border-[#EADCE2]">
                    <th class="p-2.5 border-r border-[#EADCE2]">Financial Year</th>
                    <th class="p-2.5 border-r border-[#EADCE2]">Total Annual Turnover (₹ Lacs)</th>
                    <th class="p-2.5">Turnover from Skill Training (₹ Lacs)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#EADCE2]">
                  @for (fy of data().financialYears; track fy.year; let idx = $index) {
                    <tr>
                      <td class="p-2.5 font-bold text-slate-800 border-r border-[#EADCE2] bg-slate-50/50 w-36">
                        {{ fy.year }}
                      </td>
                      <td class="p-2 border-r border-[#EADCE2]">
                        <input
                          appInput
                          size="sm"
                          type="text"
                          [value]="fy.totalTurnover"
                          [disabled]="disabled()"
                          (input)="updateTurnoverYear(idx, 'totalTurnover', $any($event.target).value)"
                          placeholder="e.g. 450.00"
                          class="w-full text-xs tabular-nums"
                        />
                      </td>
                      <td class="p-2">
                        <input
                          appInput
                          size="sm"
                          type="text"
                          [value]="fy.skillTurnover"
                          [disabled]="disabled()"
                          (input)="updateTurnoverYear(idx, 'skillTurnover', $any($event.target).value)"
                          placeholder="e.g. 210.00"
                          class="w-full text-xs tabular-nums"
                        />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </section>

    </div>
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
      border-color: #D6E3F0 !important;
      background-color: #FFFFFF !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-input > div > div.relative:hover:not(.cursor-not-allowed) {
      border-color: #B5CBE0 !important;
    }

    :host ::ng-deep app-form-input > div > div.relative:not(.border-rose-600):focus-within {
      border-color: #477DAF !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-input > div > div.relative.border-rose-600 {
      border-color: #DC2626 !important;
    }

    :host ::ng-deep app-form-input > div > div.relative.border-rose-600:hover:not(.cursor-not-allowed) {
      border-color: #DC2626 !important;
    }

    :host ::ng-deep app-form-input > div > div.relative.border-rose-600:focus-within {
      border-color: #DC2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
    }

    :host ::ng-deep app-form-input input {
      font-size: 14px !important;
      color: #334155 !important;
    }

    :host ::ng-deep app-form-input input::placeholder {
      color: #94A3B8 !important;
      font-size: 14px !important;
    }

    :host ::ng-deep app-form-select button[type="button"]:not(.form-select-search-clear) {
      height: 44px !important;
      min-height: 44px !important;
      border-radius: 6px !important;
      border-color: #D6E3F0 !important;
      background-color: #FFFFFF !important;
      font-size: 14px !important;
      color: #334155 !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-select button[type="button"]:not(.form-select-search-clear):hover:not(:disabled) {
      border-color: #B5CBE0 !important;
    }

    :host ::ng-deep app-form-select button[type="button"]:not(.form-select-search-clear):focus {
      border-color: #477DAF !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-textarea textarea {
      min-height: 72px !important;
      border-radius: 6px !important;
      border-color: #D6E3F0 !important;
      background-color: #FFFFFF !important;
      font-size: 14px !important;
      color: #334155 !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-textarea textarea:hover:not(:disabled) {
      border-color: #B5CBE0 !important;
    }

    :host ::ng-deep app-form-textarea textarea:focus {
      border-color: #477DAF !important;
      box-shadow: 0 0 0 2px rgba(71, 125, 175, 0.18) !important;
    }

    :host ::ng-deep app-form-textarea textarea::placeholder {
      color: #94A3B8 !important;
      font-size: 14px !important;
    }

    :host ::ng-deep app-form-file-upload .rounded-lg.border,
    :host ::ng-deep app-form-file-upload .rounded-md.border {
      min-height: 72px !important;
      border-color: #D6E3F0 !important;
      border-radius: 6px !important;
      background-color: #FFFFFF !important;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    :host ::ng-deep app-form-file-upload .rounded-lg.border:hover:not(.cursor-not-allowed) {
      border-color: #B5CBE0 !important;
      background-color: #F8FAFC !important;
    }
  `]
})
export class Step1OrgDetailsComponent {
  readonly disabled = input<boolean>(false);
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly natureOfEntitiesList = NATURE_OF_ENTITIES;
  readonly statesList = STATES_MASTER;
  readonly nsdcPartnersList = NSDC_PARTNER_TYPES;

  /** Active sectors from the Sector Master; falls back to the official list if the master is empty or unavailable. */
  readonly sectorOptions = signal<string[]>([...SKILL_SECTOR_NAMES]);

  constructor() {
    inject(DataEngineService)
      .for<SectorMasterItem>('SECTORS')
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: sectors => {
          const names = sectors.filter(s => s.status !== 'Inactive').map(s => s.sectorName);
          if (names.length > 0) this.sectorOptions.set(names);
        },
        error: () => { /* keep the built-in list */ }
      });
  }

  readonly data = computed(() => this.otrFormService.step1());
  readonly isSubmitted = computed(() => this.validationService.submittedSteps().has(1));
  readonly touchedFields = signal<Set<string>>(new Set<string>());

  markTouched(field: string): void {
    this.touchedFields.update(set => {
      if (set.has(field)) return set;
      const next = new Set(set);
      next.add(field);
      return next;
    });
  }

  readonly registeredDistricts = computed(() => {
    const state = this.data().registeredState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

  readonly officeDistricts = computed(() => {
    const state = this.data().officeState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

  readonly maxRegistrationDate = new Date().toISOString().split('T')[0];

  getFieldError(field: string): string | undefined {
    const isSubmitted = this.isSubmitted();
    const isTouched = this.touchedFields().has(field);
    const d = this.data();

    if (field === 'dateOfRegistration') {
      if ((isSubmitted || isTouched) && !d.dateOfRegistration?.trim()) {
        return 'Date of Registration is required';
      }
      if (d.dateOfRegistration?.trim()) {
        const selected = new Date(d.dateOfRegistration);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selected > today) {
          return 'Date cannot be in the future';
        }
      }
      return undefined;
    }

    // Specific live/blur format validations when user has entered content or touched field
    if (field === 'emailId') {
      const email = d.emailId?.trim();
      if (email && !REGEX.EMAIL.test(email)) {
        return 'Invalid Email ID format';
      }
      if ((isSubmitted || isTouched) && !email) {
        return 'Organisation Email ID is required';
      }
      return undefined;
    }

    if (field === 'website') {
      const url = d.website?.trim();
      if (url && !REGEX.URL.test(url)) {
        return 'Invalid Website URL format';
      }
      return undefined;
    }

    if (field === 'contactNo') {
      if ((isSubmitted || isTouched) && !d.contactNo?.trim()) {
        return 'Contact Number is required';
      }
      if (d.contactNo?.trim() && (!REGEX.INDIAN_MOBILE.test(d.contactNo) && !/^[0-9]{10}$/.test(d.contactNo.replace(/[-\s]/g, '')))) {
        return 'Invalid 10-digit mobile number';
      }
      return undefined;
    }

    if (field === 'registeredPincode') {
      if ((isSubmitted || isTouched) && !d.registeredPincode?.trim()) {
        return 'PIN Code is required';
      }
      if (d.registeredPincode?.trim() && !REGEX.INDIAN_PIN.test(d.registeredPincode)) {
        return 'Invalid 6-digit PIN Code';
      }
      return undefined;
    }

    if (field === 'officePincode') {
      if (!d.sameAsRegistered) {
        if ((isSubmitted || isTouched) && !d.officePincode?.trim()) {
          return 'Office PIN Code is required';
        }
        if (d.officePincode?.trim() && !REGEX.INDIAN_PIN.test(d.officePincode)) {
          return 'Invalid 6-digit PIN Code';
        }
      }
      return undefined;
    }

    // For other required fields, only evaluate if form has been submitted
    if (!isSubmitted) {
      return undefined;
    }

    switch (field) {
      case 'fullName':
        return !d.fullName?.trim() ? 'Organization Name is required' : undefined;
      case 'natureOfEntity':
        return !d.natureOfEntity?.trim() ? 'Nature of Entity is required' : undefined;
      case 'preferredSector':
        return !d.preferredSector?.trim() ? 'Preferred Sector is required' : undefined;
      case 'gstRegistered':
        return !d.gstRegistered ? 'GST Registration status is required' : undefined;
      case 'gstin':
        if (d.gstRegistered === 'Yes') {
          if (!d.gstin?.trim()) return 'GSTIN Number is required';
          if (!REGEX.GSTIN.test(d.gstin.toUpperCase())) return 'Invalid GSTIN format (15 characters)';
        }
        return undefined;
      case 'gstCertDoc':
        if (d.gstRegistered === 'Yes' && (!d.gstCertDoc || d.gstCertDoc.status !== 'uploaded')) {
          return 'GST Registration Certificate is required';
        }
        return undefined;
      case 'msmeRegistered':
        return !d.msmeRegistered ? 'MSME Registration status is required' : undefined;
      case 'udyamNumber':
        if (d.msmeRegistered === 'Yes') {
          if (!d.udyamNumber?.trim()) return 'Udyam Registration Number is required';
          if (!REGEX.UDYAM.test(d.udyamNumber)) return 'Invalid Udyam Number (UDYAM-XX-00-0000000)';
        }
        return undefined;
      case 'msmeCertDoc':
        if (d.msmeRegistered === 'Yes' && (!d.msmeCertDoc || d.msmeCertDoc.status !== 'uploaded')) {
          return 'MSME / Udyam Certificate is required';
        }
        return undefined;
      case 'registrationNumber':
        return !d.registrationNumber?.trim() ? 'Registration Number is required' : undefined;
      case 'stateOfLegalReg':
        return !d.stateOfLegalReg?.trim() ? 'State/UT of Registration is required' : undefined;
      case 'companyPan':
        if (!d.companyPan?.trim()) return 'Organisation PAN is required';
        if (!REGEX.PAN.test(d.companyPan.toUpperCase())) return 'Invalid PAN format (e.g. ABCDE1234F)';
        return undefined;
      case 'registrationCertDoc':
        if (!d.registrationCertDoc || d.registrationCertDoc.status !== 'uploaded') {
          return 'Certificate of Registration is required';
        }
        return undefined;
      case 'panCardDoc':
        if (!d.panCardDoc || d.panCardDoc.status !== 'uploaded') {
          return 'Organisation PAN Card is required';
        }
        return undefined;
      case 'registeredAddress':
        return !d.registeredAddress?.trim() ? 'Registered Address is required' : undefined;
      case 'registeredState':
        return !d.registeredState?.trim() ? 'Registered State is required' : undefined;
      case 'registeredDistrict':
        return !d.registeredDistrict?.trim() ? 'Registered District is required' : undefined;
      case 'officeAddress':
        if (!d.sameAsRegistered && !d.officeAddress?.trim()) return 'Office Address is required';
        return undefined;
      case 'officeState':
        if (!d.sameAsRegistered && !d.officeState?.trim()) return 'Office State is required';
        return undefined;
      case 'officeDistrict':
        if (!d.sameAsRegistered && !d.officeDistrict?.trim()) return 'Office District is required';
        return undefined;
      default:
        return undefined;
    }
  }

  update(field: string, value: any): void {
    if (field === 'fullName') {
      this.otrFormService.updateStep1({ fullName: value, shortName: this.data().shortName || value });
    } else {
      this.otrFormService.updateStep1({ [field]: value });
    }
  }

  updateTurnoverYear(index: number, key: 'totalTurnover' | 'skillTurnover', val: string): void {
    const years = [...(this.data().financialYears || [])];
    if (years[index]) {
      years[index] = { ...years[index], [key]: val };
      this.otrFormService.updateStep1({ financialYears: years });
    }
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
