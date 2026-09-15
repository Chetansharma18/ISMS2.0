import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TpPiaRegistrationService, ID_PROOF_TYPES, INDIAN_STATES } from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';

@Component({
  selector: 'app-tab-authorized-org',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Main Card: Authorized Person Details (Organisation Level) -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">

        <!-- Card Body: 2-Column Responsive Layout (Left Side & Right Side) -->
        <div class="p-4 sm:p-6 lg:p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            
            <!-- ================= LEFT SIDE: Personal & Contact Details ================= -->
            <div class="space-y-3.5">
              <div class="pb-1 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Personal & Communication Profile
                </h3>
              </div>

              <!-- 1. Name * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Name <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter Authorized Person Full Name" 
                  [(ngModel)]="data.authorizedOrg.name" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('authorizedOrg.name') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                />
                @if (isFieldInvalid('authorizedOrg.name')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedOrg.name') }}</p>
                }
              </div>

              <!-- 2. S/O, D/O, W/O -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  S/O, D/O, W/O
                </label>
                <input 
                  type="text" 
                  placeholder="Father's / Husband's / Guardian's Name" 
                  [(ngModel)]="data.authorizedOrg.guardianName" 
                  (ngModelChange)="onDataChange()"
                  class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                />
              </div>

              <!-- Row: Date of Birth & Age -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <!-- 3. Date of Birth -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    [(ngModel)]="data.authorizedOrg.dob" 
                    (change)="onDobChange()"
                    class="w-full h-9 px-2.5 border border-slate-300 rounded-md text-sm text-slate-800 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer" 
                  />
                </div>

                <!-- 4. Age -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input 
                    type="number" 
                    min="18"
                    max="100"
                    placeholder="Age (Years)" 
                    [(ngModel)]="data.authorizedOrg.age" 
                    (ngModelChange)="onDataChange()"
                    class="w-full h-9 px-2.5 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono" 
                  />
                </div>
              </div>

              <!-- 5. Designation -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Designation
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Director / Managing Partner / Trustee" 
                  [(ngModel)]="data.authorizedOrg.designation" 
                  (ngModelChange)="onDataChange()"
                  class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                />
              </div>

              <!-- 6. Mobile No. * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile No. <span class="text-rose-500 font-bold">*</span>
                </label>
                <div class="relative w-full">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono select-none">+91</span>
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number" 
                    maxlength="10"
                    [(ngModel)]="data.authorizedOrg.contactNo" 
                    (ngModelChange)="onDataChange()"
                    [ngClass]="isFieldInvalid('authorizedOrg.contactNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-9 pl-11 pr-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none font-mono" 
                    required
                  />
                </div>
                @if (isFieldInvalid('authorizedOrg.contactNo')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedOrg.contactNo') }}</p>
                }
              </div>

              <!-- 7. Email-Id -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Email-Id
                </label>
                <input 
                  type="email" 
                  placeholder="e.g. signatory@organisation.org" 
                  [(ngModel)]="data.authorizedOrg.emailId" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('authorizedOrg.emailId') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                />
                @if (isFieldInvalid('authorizedOrg.emailId')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedOrg.emailId') }}</p>
                }
              </div>

              <!-- 8. Residence Address -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Residence Address
                </label>
                <textarea 
                  rows="2"
                  placeholder="House / Flat No., Premises, Street, Area" 
                  [(ngModel)]="data.authorizedOrg.residenceAddress" 
                  (ngModelChange)="onDataChange()"
                  class="w-full p-2.5 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none resize-none"
                ></textarea>
              </div>

              <!-- 9. State -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select 
                  [(ngModel)]="data.authorizedOrg.state" 
                  (change)="onDataChange()"
                  class="w-full h-9 px-2.5 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                >
                  <option value="">-- Select State --</option>
                  @for (st of states; track st) {
                    <option [value]="st">{{ st }}</option>
                  }
                </select>
              </div>
            </div>


            <!-- ================= RIGHT SIDE: Statutory Identification & Proofs ================= -->
            <div class="space-y-3.5">
              <div class="pb-1 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statutory Identification & Proofs
                </h3>
              </div>

              <!-- 1. PAN * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  PAN <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="10-character PAN (e.g. ABCDE1234F)" 
                  maxlength="10"
                  [(ngModel)]="data.authorizedOrg.pan" 
                  (ngModelChange)="data.authorizedOrg.pan = (data.authorizedOrg.pan || '').toUpperCase(); onDataChange()"
                  [ngClass]="isFieldInvalid('authorizedOrg.pan') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none uppercase font-mono" 
                  required
                />
                @if (isFieldInvalid('authorizedOrg.pan')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedOrg.pan') }}</p>
                }
              </div>

              <!-- 2. Type ID Proof -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Type ID Proof
                </label>
                <select 
                  [(ngModel)]="data.authorizedOrg.typeIdProof" 
                  (change)="onTypeIdProofChange()"
                  class="w-full h-9 px-2.5 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                >
                  <option value="">-- Select ID Proof Type --</option>
                  @for (t of idTypes; track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </div>

              <!-- 3. Dynamic ID Proof Field (Shows ONLY the ID selected in Type ID Proof) -->
              @if (data.authorizedOrg.typeIdProof === 'Aadhaar Card') {
                <div class="step-content-smooth">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Aadhaar No.
                  </label>
                  <input 
                    type="text" 
                    placeholder="12-digit Aadhaar Number" 
                    maxlength="12"
                    [(ngModel)]="data.authorizedOrg.aadhaarNo" 
                    (ngModelChange)="onAadhaarChange()"
                    [ngClass]="isFieldInvalid('authorizedOrg.aadhaarNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none font-mono" 
                  />
                  @if (isFieldInvalid('authorizedOrg.aadhaarNo')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedOrg.aadhaarNo') }}</p>
                  }
                </div>
              } @else if (data.authorizedOrg.typeIdProof === 'Voter ID Card') {
                <div class="step-content-smooth">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Voter Id No.
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. RJ/04/123/98765" 
                    [(ngModel)]="data.authorizedOrg.voterIdNo" 
                    (ngModelChange)="onVoterIdChange()"
                    class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono uppercase" 
                  />
                </div>
              } @else if (data.authorizedOrg.typeIdProof === 'Passport') {
                <div class="step-content-smooth">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Passport No.
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Z1234567" 
                    [(ngModel)]="data.authorizedOrg.passportNo" 
                    (ngModelChange)="onPassportChange()"
                    class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono uppercase" 
                  />
                </div>
              } @else if (data.authorizedOrg.typeIdProof === 'Driving License') {
                <div class="step-content-smooth">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Driving License No.
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. RJ14 20200012345" 
                    [(ngModel)]="data.authorizedOrg.idNo" 
                    (ngModelChange)="onDataChange()"
                    class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono uppercase" 
                  />
                </div>
              } @else if (data.authorizedOrg.typeIdProof === 'Bhamashah Card') {
                <div class="step-content-smooth">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Bhamashah No.
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. BHAM-12345678" 
                    [(ngModel)]="data.authorizedOrg.bhamashahNo" 
                    (ngModelChange)="onBhamashahChange()"
                    class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono" 
                  />
                </div>
              } @else if (data.authorizedOrg.typeIdProof === 'PAN Card') {
                <div class="step-content-smooth">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    PAN Card No.
                  </label>
                  <input 
                    type="text" 
                    placeholder="10-character PAN (e.g. ABCDE1234F)" 
                    maxlength="10"
                    [(ngModel)]="data.authorizedOrg.pan" 
                    (ngModelChange)="onPanChange()"
                    class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono uppercase" 
                  />
                </div>
              } @else if (data.authorizedOrg.typeIdProof) {
                <div class="step-content-smooth">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    {{ data.authorizedOrg.typeIdProof }} No.
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter {{ data.authorizedOrg.typeIdProof }} Number" 
                    [(ngModel)]="data.authorizedOrg.idNo" 
                    (ngModelChange)="onDataChange()"
                    class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono" 
                  />
                </div>
              }
            </div>

          </div>
        </div>
      </section>
    </div>
  `
})
export class TabAuthorizedOrgComponent {
  readonly service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);
  readonly idTypes = ID_PROOF_TYPES;
  readonly states = INDIAN_STATES;

  readonly errors = computed(() => this.valService.validateTab2(this.service.formData()).errors);

  get data() {
    return this.service.formData();
  }

  private getFieldValue(fieldKey: string): any {
    const parts = fieldKey.split('.');
    let curr: any = this.data;
    for (const part of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[part];
    }
    return curr;
  }

  isFieldInvalid(fieldKey: string): boolean {
    const error = this.errors()[fieldKey];
    if (!error) return false;

    const val = this.getFieldValue(fieldKey);
    const hasValue = val !== undefined && val !== null && String(val).trim().length > 0;
    if (hasValue) {
      return true;
    }

    return this.valService.isTabSubmitted(2);
  }

  getFieldError(fieldKey: string): string {
    return this.isFieldInvalid(fieldKey) ? (this.errors()[fieldKey] || '') : '';
  }

  private changeTimer: any;
  onDataChange() {
    if (this.changeTimer) clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => {
      this.service.updateFormData(curr => ({ ...curr }));
    }, 60);
  }

  onDobChange() {
    if (this.data.authorizedOrg.dob) {
      const birthDate = new Date(this.data.authorizedOrg.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0 && age <= 120) {
        this.data.authorizedOrg.age = age;
      }
    }
    this.onDataChange();
  }

  onTypeIdProofChange() {
    const type = this.data.authorizedOrg.typeIdProof;
    if (type === 'Aadhaar Card') {
      if (this.data.authorizedOrg.aadhaarNo) {
        this.data.authorizedOrg.idNo = this.data.authorizedOrg.aadhaarNo;
      } else if (this.data.authorizedOrg.idNo) {
        this.data.authorizedOrg.aadhaarNo = this.data.authorizedOrg.idNo;
      }
    } else if (type === 'Voter ID Card') {
      if (this.data.authorizedOrg.voterIdNo) {
        this.data.authorizedOrg.idNo = this.data.authorizedOrg.voterIdNo;
      } else if (this.data.authorizedOrg.idNo) {
        this.data.authorizedOrg.voterIdNo = this.data.authorizedOrg.idNo;
      }
    } else if (type === 'Passport') {
      if (this.data.authorizedOrg.passportNo) {
        this.data.authorizedOrg.idNo = this.data.authorizedOrg.passportNo;
      } else if (this.data.authorizedOrg.idNo) {
        this.data.authorizedOrg.passportNo = this.data.authorizedOrg.idNo;
      }
    } else if (type === 'Bhamashah Card') {
      if (this.data.authorizedOrg.bhamashahNo) {
        this.data.authorizedOrg.idNo = this.data.authorizedOrg.bhamashahNo;
      } else if (this.data.authorizedOrg.idNo) {
        this.data.authorizedOrg.bhamashahNo = this.data.authorizedOrg.idNo;
      }
    }
    this.onDataChange();
  }

  onAadhaarChange() {
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.aadhaarNo || '';
    this.onDataChange();
  }

  onVoterIdChange() {
    this.data.authorizedOrg.voterIdNo = (this.data.authorizedOrg.voterIdNo || '').toUpperCase();
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.voterIdNo;
    this.onDataChange();
  }

  onPassportChange() {
    this.data.authorizedOrg.passportNo = (this.data.authorizedOrg.passportNo || '').toUpperCase();
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.passportNo;
    this.onDataChange();
  }

  onBhamashahChange() {
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.bhamashahNo || '';
    this.onDataChange();
  }

  onPanChange() {
    this.data.authorizedOrg.pan = (this.data.authorizedOrg.pan || '').toUpperCase();
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.pan;
    this.onDataChange();
  }
}
