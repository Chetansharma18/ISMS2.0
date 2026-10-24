import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';
import { OtrFormService } from '../../../../../registration/services/otr-form.service';
import { DESIGNATIONS_MASTER, STATES_MASTER } from '../../../../../registration/models/otr-form.model';
import { FormInputComponent } from '../../../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

/**
 * Step 2: authorised signatory details and documents (editable).
 * Deliberately stays on default change detection: the state objects are mutated in place.
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
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">2</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Authorized Signatory Details</h2>
        </div>
        <span class="text-xs text-slate-500 tabular-nums font-semibold truncate">Designated Signatory</span>
      </div>

      <div class="p-4 sm:p-5 w-full font-sans">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <!-- First Name & Last Name -->
          <div class="lg:col-span-5 sm:col-span-1 grid grid-cols-2 gap-x-3.5">
            <div>
              <app-form-input
                label="First Name"
                [value]="firstName"
                (valueChange)="onFirstNameChange($event)"
                placeholder="Enter first name"
                [required]="true"
                [maxLength]="50"
                [disabled]="isReadOnly"
              ></app-form-input>
            </div>
            <div>
              <app-form-input
                label="Last Name"
                [value]="lastName"
                (valueChange)="onLastNameChange($event)"
                placeholder="Enter last name"
                [maxLength]="50"
                [disabled]="isReadOnly"
              ></app-form-input>
            </div>
          </div>

          <!-- Designation -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-select
              label="Designation"
              [value]="state.editableStep3.designation"
              (valueChange)="state.editableStep3.designation = $event"
              [options]="designations"
              placeholder="Select designation"
              [disabled]="isReadOnly"
            ></app-form-select>
          </div>

          <!-- Date of Birth -->
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input
              label="Date of Birth"
              type="date"
              [value]="state.editableStep3.dob"
              (valueChange)="onDobChange($event)"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- Age (derived from date of birth) -->
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input
              label="Age"
              [value]="state.editableStep3.age ? state.editableStep3.age : 'Auto-calculated'"
              [disabled]="true"
            ></app-form-input>
          </div>

          <!-- PAN -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="PAN"
              [value]="state.editableStep3.pan"
              (valueChange)="state.editableStep3.pan = $event"
              placeholder="Enter PAN number"
              [required]="true"
              [uppercase]="true"
              [maxLength]="10"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- Mobile -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="Mobile No."
              type="tel"
              [value]="state.editableStep3.mobileNo"
              (valueChange)="state.editableStep3.mobileNo = $event"
              placeholder="Enter mobile number"
              [required]="true"
              [maxLength]="10"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- Email -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="Email Address"
              type="email"
              [value]="state.editableStep3.emailId"
              (valueChange)="state.editableStep3.emailId = $event"
              placeholder="Enter email address"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- Aadhaar -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input
              label="Aadhaar No."
              type="tel"
              [value]="state.editableStep3.aadhaarNo"
              (valueChange)="state.editableStep3.aadhaarNo = $event"
              placeholder="Enter Aadhaar number"
              [required]="true"
              [maxLength]="12"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input
              label="Bhamashah No. (Optional)"
              [value]="state.editableStep3.bhamashahNo"
              (valueChange)="state.editableStep3.bhamashahNo = $event"
              placeholder="Enter Bhamashah number"
              [maxLength]="20"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input
              label="Voter ID No. (Optional)"
              [value]="state.editableStep3.voterIdNo"
              (valueChange)="state.editableStep3.voterIdNo = $event"
              placeholder="Enter voter ID number"
              [uppercase]="true"
              [maxLength]="20"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input
              label="Passport No. (Optional)"
              [value]="state.editableStep3.passportNo"
              (valueChange)="state.editableStep3.passportNo = $event"
              placeholder="Enter passport number"
              [uppercase]="true"
              [maxLength]="8"
              [disabled]="isReadOnly"
            ></app-form-input>
          </div>

          <!-- State -->
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-select
              label="State"
              [value]="state.editableStep3.state"
              (valueChange)="state.editableStep3.state = $event"
              [options]="states"
              placeholder="Select state"
              [disabled]="isReadOnly"
            ></app-form-select>
          </div>

          <!-- Residential Address -->
          <div class="lg:col-span-9 sm:col-span-1">
            <app-form-textarea
              label="Residential Address"
              [value]="state.editableStep3.residenceAddress"
              (valueChange)="state.editableStep3.residenceAddress = $event"
              placeholder="Enter house/flat no., street, locality, city, PIN code"
              [rows]="1"
              [maxLength]="500"
              [disabled]="isReadOnly"
            ></app-form-textarea>
          </div>

          <!-- Documents -->
          <div class="lg:col-span-6 sm:col-span-1 pt-1 border-t border-slate-100">
            <app-form-file-upload
              label="Authorization Letter / Board Resolution"
              [fileDoc]="state.editableStep3.authorizationLetterDoc"
              (fileChange)="state.editableStep3.authorizationLetterDoc = $event"
              [required]="true"
              [disabled]="isReadOnly"
            ></app-form-file-upload>
          </div>

          <div class="lg:col-span-6 sm:col-span-1 pt-1 border-t border-slate-100">
            <app-form-file-upload
              label="Authorized Person Identity Proof"
              [fileDoc]="state.editableStep3.idProofDoc"
              (fileChange)="state.editableStep3.idProofDoc = $event"
              [required]="false"
              [disabled]="isReadOnly"
            ></app-form-file-upload>
          </div>
        </div>
      </div>
    </section>
  `
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
