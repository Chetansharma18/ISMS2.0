import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
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
import { IconComponent } from '../../../../shared';

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
    FormFileUploadComponent
  ],
  template: `
    <div class="w-full space-y-6 font-sans">

      <!-- ====================================================================
           1. BASIC ORGANISATION DETAILS
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          1. Basic Organisation Details
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <!-- 1. Organisation Name * -->
          <div>
            <app-form-input
              label="Organisation Name"
              [value]="data().fullName"
              (valueChange)="update('fullName', $event)"
              placeholder="Enter organisation name"
              [required]="true"
              [error]="getFieldError('fullName')"
            ></app-form-input>
          </div>

          <!-- 2. Nature of Entity * -->
          <div>
            <app-form-select
              label="Nature of Entity"
              [value]="data().natureOfEntity"
              (valueChange)="update('natureOfEntity', $event)"
              [options]="natureOfEntitiesList"
              placeholder="Select entity type"
              [required]="true"
              [error]="getFieldError('natureOfEntity')"
            ></app-form-select>
          </div>

          <!-- 3. Preferred Sector * (Multi-select with Checkboxes) -->
          <div>
            <app-form-select
              label="Preferred Sector"
              [value]="data().preferredSector"
              (valueChange)="update('preferredSector', $event)"
              [options]="sectorOptions()"
              placeholder="Select preferred sector(s)"
              [multiple]="true"
              [required]="true"
              [error]="getFieldError('preferredSector')"
            ></app-form-select>
          </div>

          <!-- 4. NSDC Partner -->
          <div>
            <app-form-select
              label="NSDC Partner"
              [value]="data().nsdcPartner"
              (valueChange)="update('nsdcPartner', $event)"
              [options]="nsdcPartnersList"
              placeholder="Select status"
              [required]="false"
              [error]="getFieldError('nsdcPartner')"
            ></app-form-select>
          </div>

          <!-- 5. GST Registered * -->
          <div>
            <app-form-select
              label="GST Registered"
              [value]="data().gstRegistered"
              (valueChange)="onGstRegisteredChange($event)"
              [options]="['Yes', 'No']"
              placeholder="Select GST status"
              [required]="true"
              [error]="getFieldError('gstRegistered')"
            ></app-form-select>
          </div>

          <!-- 6. MSME / Udyam Registered * -->
          <div>
            <app-form-select
              label="MSME / Udyam Registered"
              [value]="data().msmeRegistered"
              (valueChange)="onMsmeRegisteredChange($event)"
              [options]="['Yes', 'No']"
              placeholder="Select MSME status"
              [required]="true"
              [error]="getFieldError('msmeRegistered')"
            ></app-form-select>
          </div>

          <!-- Conditional GST Fields (When GST Registered is Yes) -->
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
                [error]="getFieldError('gstCertDoc')"
              ></app-form-file-upload>
            </div>
          }

          <!-- Conditional MSME Fields (When MSME / Udyam Registered is Yes) -->
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
                [error]="getFieldError('msmeCertDoc')"
              ></app-form-file-upload>
            </div>
          }
        </div>
      </section>

      <!-- Divider -->
      <div class="pt-2 border-t border-slate-100"></div>

      <!-- ====================================================================
           2. REGISTRATION & DOCUMENTS
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          2. Registration &amp; Documents
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <!-- 1. Registration Number * -->
          <div>
            <app-form-input
              label="Registration Number"
              [value]="data().registrationNumber"
              (valueChange)="update('registrationNumber', $event)"
              placeholder="Enter registration number"
              [required]="true"
              [uppercase]="true"
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
              [error]="getFieldError('stateOfLegalReg')"
            ></app-form-select>
          </div>

          <!-- 4. Organisation PAN * -->
          <div>
            <app-form-input
              label="Organisation PAN"
              [value]="data().companyPan"
              (valueChange)="update('companyPan', $event)"
              placeholder="Enter PAN number"
              [required]="true"
              [uppercase]="true"
              [maxLength]="10"
              [error]="getFieldError('companyPan')"
            ></app-form-input>
          </div>

          <!-- 5. Certificate of Registration / Incorporation * (Full width) -->
          <div class="col-span-1 md:col-span-2">
            <app-form-file-upload
              label="Certificate of Registration / Incorporation"
              [dropzoneStyle]="true"
              uploadPrompt="Upload registration certificate"
              [fileDoc]="data().registrationCertDoc"
              (fileChange)="updateDoc('registrationCertDoc', $event)"
              [required]="true"
              [error]="getFieldError('registrationCertDoc')"
            ></app-form-file-upload>
          </div>

          <!-- 6. Organisation PAN Card * (Full width) -->
          <div class="col-span-1 md:col-span-2">
            <app-form-file-upload
              label="Organisation PAN Card"
              [dropzoneStyle]="true"
              uploadPrompt="Upload PAN card"
              [fileDoc]="data().panCardDoc"
              (fileChange)="updateDoc('panCardDoc', $event)"
              [required]="true"
              [error]="getFieldError('panCardDoc')"
            ></app-form-file-upload>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="pt-2 border-t border-slate-100"></div>

      <!-- ====================================================================
           3. CONTACT INFORMATION
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          3. Contact Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <!-- 1. Contact Number * (10-digit mobile) -->
          <div>
            <app-form-input
              label="Contact Number"
              type="tel"
              [value]="data().contactNo"
              (valueChange)="update('contactNo', $event)"
              placeholder="10-digit mobile number"
              [required]="true"
              [maxLength]="10"
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
              placeholder="Enter official email"
              [required]="true"
              [error]="getFieldError('emailId')"
            ></app-form-input>
          </div>

          <!-- 3. Website (Optional) (Full width) -->
          <div class="col-span-1 md:col-span-2">
            <app-form-input
              label="Website (Optional)"
              type="text"
              [value]="data().website"
              (valueChange)="update('website', $event)"
              placeholder="https://www.example.com"
              [required]="false"
              [error]="getFieldError('website')"
            ></app-form-input>
          </div>
        </div>
      </section>

      <!-- Divider -->
      <div class="pt-2 border-t border-slate-100"></div>

      <!-- ====================================================================
           4. REGISTERED & OFFICE ADDRESS
           ==================================================================== -->
      <section class="space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight m-0">
          4. Registered &amp; Office Address
        </h3>

        <!-- Subsection A: Registered Address -->
        <div class="space-y-3.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            A. Registered Address
          </span>

          <!-- 1. Registered Address * (Full width) -->
          <div>
            <app-form-textarea
              label="Registered Address"
              [value]="data().registeredAddress"
              (valueChange)="update('registeredAddress', $event)"
              placeholder="Address, locality, building name and number"
              [required]="true"
              [error]="getFieldError('registeredAddress')"
            ></app-form-textarea>
          </div>

          <!-- 2, 3, 4: State / UT *, District *, PIN Code * (3-column layout) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <app-form-select
                label="State / UT"
                [value]="data().registeredState"
                (valueChange)="onRegisteredStateChange($event)"
                [options]="statesList"
                placeholder="Select state"
                [required]="true"
                [error]="getFieldError('registeredState')"
              ></app-form-select>
            </div>

            <div>
              <app-form-select
                label="District"
                [value]="data().registeredDistrict"
                (valueChange)="update('registeredDistrict', $event)"
                [options]="registeredDistricts()"
                [disabled]="!data().registeredState"
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
                placeholder="6-digit PIN code"
                [required]="true"
                [maxLength]="6"
                [error]="getFieldError('registeredPincode')"
              ></app-form-input>
            </div>
          </div>
        </div>

        <!-- Middle Checkbox: Office Address Same as Registered Address -->
        <div class="py-2.5 px-3.5 bg-slate-50 border border-slate-200/90 rounded-lg flex items-center justify-between">
          <label class="inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              [ngModel]="data().sameAsRegistered"
              (ngModelChange)="toggleSameAsRegistered($event)"
              class="w-4 h-4 text-navy border-slate-300 rounded focus:ring-navy accent-navy cursor-pointer"
            />
            <span>Office address is the same as registered address</span>
          </label>
          @if (data().sameAsRegistered) {
            <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Synchronized
            </span>
          }
        </div>

        <!-- Subsection B: Office Address (Displayed when unselected) -->
        @if (!data().sameAsRegistered) {
          <div class="space-y-3.5 pt-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              B. Office Address
            </span>

            <!-- 1. Office Address * (Full width) -->
            <div>
              <app-form-textarea
                label="Office Address"
                [value]="data().officeAddress"
                (valueChange)="update('officeAddress', $event)"
                placeholder="Address, locality, building name and number"
                [required]="true"
                [error]="getFieldError('officeAddress')"
              ></app-form-textarea>
            </div>

            <!-- 2, 3, 4: State / UT *, District *, PIN Code * (3-column layout) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <app-form-select
                  label="State / UT"
                  [value]="data().officeState"
                  (valueChange)="onOfficeStateChange($event)"
                  [options]="statesList"
                  placeholder="Select state"
                  [required]="true"
                  [error]="getFieldError('officeState')"
                ></app-form-select>
              </div>

              <div>
                <app-form-select
                  label="District"
                  [value]="data().officeDistrict"
                  (valueChange)="update('officeDistrict', $event)"
                  [options]="officeDistricts()"
                  [disabled]="!data().officeState"
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
                  placeholder="6-digit PIN code"
                  [required]="true"
                  [maxLength]="6"
                  [error]="getFieldError('officePincode')"
                ></app-form-input>
              </div>
            </div>
          </div>
        }
      </section>

    </div>
  `
})
export class Step1OrgDetailsComponent {
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

  readonly registeredDistricts = computed(() => {
    const state = this.data().registeredState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

  readonly officeDistricts = computed(() => {
    const state = this.data().officeState;
    return state && DISTRICTS_BY_STATE[state] ? DISTRICTS_BY_STATE[state] : [];
  });

  getFieldError(field: string): string | undefined {
    if (!this.isSubmitted()) {
      return undefined;
    }

    const d = this.data();
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
      case 'dateOfRegistration':
        if (!d.dateOfRegistration) return 'Date of Registration is required';
        if (new Date(d.dateOfRegistration) > new Date()) return 'Date cannot be in the future';
        return undefined;
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
      case 'contactNo':
        if (!d.contactNo?.trim()) return 'Contact Number is required';
        if (!REGEX.INDIAN_MOBILE.test(d.contactNo) && !/^[0-9]{7,12}$/.test(d.contactNo.replace(/[-\s]/g, ''))) {
          return 'Invalid 10-digit mobile number';
        }
        return undefined;
      case 'emailId':
        if (!d.emailId?.trim()) return 'Organisation Email ID is required';
        if (!REGEX.EMAIL.test(d.emailId)) return 'Invalid Email ID format';
        return undefined;
      case 'website':
        if (d.website?.trim() && !REGEX.URL.test(d.website)) {
          return 'Invalid Website URL format';
        }
        return undefined;
      case 'registeredAddress':
        return !d.registeredAddress?.trim() ? 'Registered Address is required' : undefined;
      case 'registeredState':
        return !d.registeredState?.trim() ? 'Registered State is required' : undefined;
      case 'registeredDistrict':
        return !d.registeredDistrict?.trim() ? 'Registered District is required' : undefined;
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
    if (field === 'fullName') {
      this.otrFormService.updateStep1({ fullName: value, shortName: value });
    } else {
      this.otrFormService.updateStep1({ [field]: value });
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
