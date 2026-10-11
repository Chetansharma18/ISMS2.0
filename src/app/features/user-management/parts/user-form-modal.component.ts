import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionModalComponent } from '../../../shared';
import { ROLE_TYPE_OPTIONS, UserFormData } from '../user-management.util';

/**
 * Add / edit user form. The form object is owned by the parent and edited in place via ngModel,
 * so this component intentionally stays on default change detection.
 */
@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [NgClass, FormsModule, ActionModalComponent],
  template: `
    @let f = formData();
    @let isSubmitted = submitted();
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      [reverseButtons]="true"
      [showAccentBar]="false"
      [primaryLabel]="editing() ? 'Save Changes' : 'Submit'"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[780px]"
      (primaryAction)="save.emit()"
      (secondaryAction)="cancelled.emit()"
      (close)="cancelled.emit()"
    >
      <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
        {{ editing() ? 'Edit User' : 'Add New User' }}
      </h2>

      <div class="mt-4 font-sans text-[13px] space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">

          <!-- LEFT COLUMN -->
          <div class="space-y-3">
            <!-- SSO ID -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">SSO ID*</label>
              <input
                type="text"
                placeholder="e.g. SSO_1008"
                [(ngModel)]="f.ssoId"
                [ngClass]="{'border-red-500': isSubmitted && !f.ssoId, 'border-field-border': !(isSubmitted && !f.ssoId)}"
                class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 font-mono text-xs"
              />
              @if (isSubmitted && !f.ssoId) {
                <div class="text-xs text-red-500 mt-0.5 font-medium">SSO ID is required</div>
              }
            </div>

            <!-- First Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">First Name*</label>
              <input
                type="text"
                placeholder="e.g. John"
                [(ngModel)]="f.firstName"
                [ngClass]="{'border-red-500': isSubmitted && !f.firstName, 'border-field-border': !(isSubmitted && !f.firstName)}"
                class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
              />
              @if (isSubmitted && !f.firstName) {
                <div class="text-xs text-red-500 mt-0.5 font-medium">First Name is required</div>
              }
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Last Name*</label>
              <input
                type="text"
                placeholder="e.g. Doe"
                [(ngModel)]="f.lastName"
                [ngClass]="{'border-red-500': isSubmitted && !f.lastName, 'border-field-border': !(isSubmitted && !f.lastName)}"
                class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
              />
              @if (isSubmitted && !f.lastName) {
                <div class="text-xs text-red-500 mt-0.5 font-medium">Last Name is required</div>
              }
            </div>

            <!-- Date Of Birth -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Date Of Birth</label>
              <input
                type="date"
                [(ngModel)]="f.dateOfBirth"
                class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800"
              />
            </div>

            <!-- E-Mail -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">E-Mail*</label>
              <input
                type="email"
                placeholder="name@example.com"
                [(ngModel)]="f.email"
                [ngClass]="{'border-red-500': isSubmitted && !f.email, 'border-field-border': !(isSubmitted && !f.email)}"
                class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
              />
              @if (isSubmitted && !f.email) {
                <div class="text-xs text-red-500 mt-0.5 font-medium">E-Mail is required</div>
              }
            </div>

            <!-- Mobile No. -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Mobile No.*</label>
              <input
                type="text"
                maxlength="10"
                placeholder="10-digit mobile number"
                [(ngModel)]="f.mobileNo"
                [ngClass]="{'border-red-500': isSubmitted && !f.mobileNo, 'border-field-border': !(isSubmitted && !f.mobileNo)}"
                class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800"
              />
              @if (isSubmitted && !f.mobileNo) {
                <div class="text-xs text-red-500 mt-0.5 font-medium">Mobile No. is required</div>
              }
            </div>


            <!-- Aadhaar Id -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Aadhaar Id</label>
              <input
                type="text"
                maxlength="12"
                placeholder="12-digit Aadhaar number"
                [(ngModel)]="f.aadhaarId"
                class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:border-primary text-slate-800 font-mono text-xs"
              />
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="space-y-3">
            <!-- User Type -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">User Type*</label>
              <select
                [(ngModel)]="f.userType"
                [ngClass]="{'border-red-500': isSubmitted && !f.userType, 'border-field-border': !(isSubmitted && !f.userType)}"
                class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Department">Department</option>
                <option value="Citizen">Citizen</option>
              </select>
              <div class="text-[11px] text-slate-500 mt-0.5">Select user classification (Super Admin, Department, or Citizen).</div>
            </div>

            <!-- Role Type -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Role Type*</label>
              <select
                [(ngModel)]="f.roleType"
                [ngClass]="{'border-red-500': isSubmitted && !f.roleType, 'border-field-border': !(isSubmitted && !f.roleType)}"
                class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="" disabled selected>Select Role Type</option>
                @for (role of roleTypeOptions; track role.value) {
                  <option [value]="role.value">{{ role.label }}</option>
                }
              </select>
              @if (isSubmitted && !f.roleType) {
                <div class="text-xs text-red-500 mt-0.5 font-medium">Role Type is required</div>
              }
            </div>

            <!-- Designation -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Designation</label>
              <select
                [(ngModel)]="f.designation"
                class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 bg-white"
              >
                <option value="Managing Director">Managing Director</option>
                <option value="Joint Director">Joint Director</option>
                <option value="General Manager">General Manager</option>
                <option value="Zone Coordinator">Zone Coordinator</option>
                <option value="Programmer">Programmer</option>
                <option value="MIS Manager">MIS Manager</option>
                <option value="Scheme Nodal Officer">Scheme Nodal Officer</option>
              </select>
            </div>

            <!-- Scheme Department -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Scheme Department</label>
              <select
                [(ngModel)]="f.schemeDepartment"
                class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 bg-white"
              >
                <option value="RSLDC">RSLDC</option>
                <option value="Skill & Entrepreneurship">Skill & Entrepreneurship</option>
                <option value="Planning Department">Planning Department</option>
              </select>
            </div>

            <!-- District -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">District</label>
              <select
                [(ngModel)]="f.district"
                class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 bg-white"
              >
                <option value="All Districts">All Districts</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Jodhpur">Jodhpur</option>
                <option value="Udaipur">Udaipur</option>
                <option value="Ajmer">Ajmer</option>
                <option value="Kota">Kota</option>
              </select>
            </div>

            <!-- Block Name -->
            <div>
              <label class="block text-slate-700 font-medium mb-1">Block Name</label>
              <select
                [(ngModel)]="f.blockName"
                class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 bg-white"
              >
                <option value="All Blocks">All Blocks</option>
                <option value="Amber">Amber</option>
                <option value="Sanganer">Sanganer</option>
                <option value="Mandore">Mandore</option>
                <option value="Girwa">Girwa</option>
              </select>
            </div>


          </div>

        </div>
      </div>
    </app-action-modal>
  `
})
export class UserFormModalComponent {
  readonly isOpen = input.required<boolean>();
  /** True when editing an existing user (changes title / primary label). */
  readonly editing = input.required<boolean>();
  /** Parent-owned form state, edited in place. */
  readonly formData = input.required<UserFormData>();
  /** Whether the parent has attempted a submit (drives validation styling). */
  readonly submitted = input.required<boolean>();

  readonly save = output<void>();
  readonly cancelled = output<void>();

  protected readonly roleTypeOptions = ROLE_TYPE_OPTIONS;
}
