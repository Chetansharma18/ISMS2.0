import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';
import { OtrFormService } from '../../../../../registration/services/otr-form.service';
import { DESIGNATIONS_MASTER, STATES_MASTER } from '../../../../../registration/models/otr-form.model';
import { FormInputComponent } from '../../../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

/**
 * Step 2: Authorized Signatory Details and Verification Documents
 *
 * Displays verified OTR signatory details and allows editing when Step 2 edit mode is active.
 */
@Component({
  selector: 'app-step2-authorized-person',
  standalone: true,
  imports: [
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent
  ],
  host: { class: 'block' },
  template: `
    <section class="border border-[#D6E3F0] rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-white px-5 py-3.5 border-b border-[#E8EEF5] flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
          <h2 class="text-base sm:text-[17px] font-bold text-[#1E3A5F] m-0">Authorized Signatory Details</h2>
        </div>
        <span class="text-xs text-slate-500 tabular-nums font-semibold truncate">Designated Signatory</span>
      </div>

      <div class="p-5 sm:p-6 w-full space-y-6 font-sans">
        <!-- 1. Personal Information -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#E8EEF5]">
            <h3 class="text-[16px] font-semibold text-[#1E3A5F] tracking-tight m-0">
              Personal Information
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- First Name -->
            <div>
              <app-form-input
                label="First Name"
                [value]="firstName"
                (valueChange)="onFirstNameChange($event)"
                placeholder="Enter first name"
                [required]="true"
                [maxLength]="50"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Last Name -->
            <div>
              <app-form-input
                label="Last Name"
                [value]="lastName"
                (valueChange)="onLastNameChange($event)"
                placeholder="Enter last name"
                [maxLength]="50"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Designation -->
            <div>
              <app-form-select
                label="Designation"
                [value]="state.editableStep3.designation"
                (valueChange)="state.editableStep3.designation = $event"
                [options]="designations"
                placeholder="Select designation"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>

            <!-- Date of Birth -->
            <div>
              <app-form-input
                label="Date of Birth"
                type="date"
                [value]="state.editableStep3.dob"
                (valueChange)="onDobChange($event)"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Age -->
            <div>
              <app-form-input
                label="Age"
                [value]="state.editableStep3.age ? state.editableStep3.age : 'Auto-calculated'"
                [disabled]="true"
              ></app-form-input>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#E8EEF5]"></div>

        <!-- 2. Contact & Statutory Identifiers -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#E8EEF5]">
            <h3 class="text-[16px] font-semibold text-[#1E3A5F] tracking-tight m-0">
              Contact &amp; Statutory Identifiers
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <!-- Mobile -->
            <div>
              <app-form-input
                label="Mobile No."
                type="tel"
                [value]="state.editableStep3.mobileNo"
                (valueChange)="state.editableStep3.mobileNo = $event"
                placeholder="Enter mobile number"
                [required]="true"
                [maxLength]="10"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Email -->
            <div>
              <app-form-input
                label="Email Address"
                type="email"
                [value]="state.editableStep3.emailId"
                (valueChange)="state.editableStep3.emailId = $event"
                placeholder="Enter email address"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- PAN -->
            <div>
              <app-form-input
                label="PAN"
                [value]="state.editableStep3.pan"
                (valueChange)="state.editableStep3.pan = $event"
                placeholder="Enter PAN number"
                [required]="true"
                [uppercase]="true"
                [maxLength]="10"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <!-- Aadhaar -->
            <div>
              <app-form-input
                label="Aadhaar No."
                type="tel"
                [value]="state.editableStep3.aadhaarNo"
                (valueChange)="state.editableStep3.aadhaarNo = $event"
                placeholder="Enter Aadhaar number"
                [required]="true"
                [maxLength]="12"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>
          </div>

          <!-- Optional Identifiers (3 equal columns) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <div>
              <app-form-input
                label="Bhamashah No. (Optional)"
                [value]="state.editableStep3.bhamashahNo"
                (valueChange)="state.editableStep3.bhamashahNo = $event"
                placeholder="Enter Bhamashah number"
                [maxLength]="20"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <div>
              <app-form-input
                label="Voter ID No. (Optional)"
                [value]="state.editableStep3.voterIdNo"
                (valueChange)="state.editableStep3.voterIdNo = $event"
                placeholder="Enter voter ID number"
                [uppercase]="true"
                [maxLength]="20"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>

            <div>
              <app-form-input
                label="Passport No. (Optional)"
                [value]="state.editableStep3.passportNo"
                (valueChange)="state.editableStep3.passportNo = $event"
                placeholder="Enter passport number"
                [uppercase]="true"
                [maxLength]="8"
                [disabled]="!state.isEditingStep2()"
              ></app-form-input>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#E8EEF5]"></div>

        <!-- 3. Residential Address -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#E8EEF5]">
            <h3 class="text-[16px] font-semibold text-[#1E3A5F] tracking-tight m-0">
              Residential Address
            </h3>
          </div>

          <!-- Residential Address textarea -->
          <div>
            <app-form-textarea
              label="Residential Address"
              [value]="state.editableStep3.residenceAddress"
              (valueChange)="state.editableStep3.residenceAddress = $event"
              placeholder="Enter house/flat no., street, locality, city, PIN code"
              [rows]="2"
              [maxLength]="500"
              [disabled]="!state.isEditingStep2()"
            ></app-form-textarea>
          </div>

          <!-- State -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-4.5">
            <div>
              <app-form-select
                label="State"
                [value]="state.editableStep3.state"
                (valueChange)="state.editableStep3.state = $event"
                [options]="states"
                placeholder="Select state"
                [disabled]="!state.isEditingStep2()"
              ></app-form-select>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="pt-1 border-t border-[#E8EEF5]"></div>

        <!-- 4. Signatory Verification Documents -->
        <div class="space-y-4">
          <div class="pb-2 border-b border-[#E8EEF5]">
            <h3 class="text-[16px] font-semibold text-[#1E3A5F] tracking-tight m-0">
              Signatory Verification Documents
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">
            <div>
              <app-form-file-upload
                label="Authorization Letter / Board Resolution"
                [dropzoneStyle]="true"
                uploadPrompt="Upload Authorization Letter / Board Resolution"
                [fileDoc]="state.editableStep3.authorizationLetterDoc"
                (fileChange)="state.editableStep3.authorizationLetterDoc = $event"
                [required]="true"
                [disabled]="!state.isEditingStep2()"
              ></app-form-file-upload>
            </div>

            <div>
              <app-form-file-upload
                label="Authorized Person Identity Proof"
                [dropzoneStyle]="true"
                uploadPrompt="Upload Identity Proof Document"
                [fileDoc]="state.editableStep3.idProofDoc"
                (fileChange)="state.editableStep3.idProofDoc = $event"
                [required]="false"
                [disabled]="!state.isEditingStep2()"
              ></app-form-file-upload>
            </div>
          </div>
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
      border-color: #D6E3F0 !important;
      background-color: #FFFFFF !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-input > div > div.relative:hover:not(.cursor-not-allowed) {
      border-color: #B5CBE0 !important;
    }

    :host ::ng-deep app-form-input > div > div.relative:focus-within {
      border-color: #477DAF !important;
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
      border-color: #D6E3F0 !important;
      background-color: #FFFFFF !important;
      font-size: 14px !important;
      color: #334155 !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    :host ::ng-deep app-form-select button[type="button"]:hover:not(:disabled) {
      border-color: #B5CBE0 !important;
    }

    :host ::ng-deep app-form-select button[type="button"]:focus {
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
export class Step2AuthorizedPersonComponent {
  protected readonly state = inject(SchemeFormState);
  protected readonly isReadOnly = true;
  private readonly otrFormService = inject(OtrFormService);

  protected readonly designations = DESIGNATIONS_MASTER;
  protected readonly states = STATES_MASTER;

  /** First name: stored value when present, otherwise the first word of the full name. */
  protected get firstName(): string {
    const p = this.state.editableStep3;
    if (p.firstName !== undefined && p.firstName !== null) return p.firstName;
    return p.name ? (p.name.trim().split(/\s+/)[0] ?? '') : '';
  }

  /** Last name: stored value when present, otherwise everything after the first word of the full name. */
  protected get lastName(): string {
    const p = this.state.editableStep3;
    if (p.lastName !== undefined && p.lastName !== null) return p.lastName;
    return p.name ? p.name.trim().split(/\s+/).slice(1).join(' ') : '';
  }

  protected onFirstNameChange(value: string): void {
    this.applyName(value, this.lastName);
  }

  protected onLastNameChange(value: string): void {
    this.applyName(this.firstName, value);
  }

  protected onDobChange(value: string): void {
    this.state.editableStep3.dob = value;
    this.state.editableStep3.age = this.otrFormService.calculateAgeFromDob(value);
  }

  private applyName(first: string, last: string): void {
    const p = this.state.editableStep3;
    p.firstName = first;
    p.lastName = last;
    p.name = [first.trim(), last.trim()].filter(Boolean).join(' ');
  }
}
