import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  TpPiaRegistrationService, 
  INDIAN_STATES, 
  RAJASTHAN_DISTRICTS, 
  BUSINESS_ACTIVITIES 
} from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';

@Component({
  selector: 'app-tab-org-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Main Card: Organisation / Company Basic Details -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div class="p-5 sm:p-7 lg:p-8 space-y-7">
          
          <!-- ================= 1. ORGANISATION & LEGAL DETAILS ================= -->
          <div>
            <div class="flex items-center gap-2 pb-2.5 mb-4 border-b border-slate-200/80">
              <span class="w-2 h-2 rounded-full bg-blue-700"></span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">
                Organisation Profile & Legal Constitution
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <!-- Row 1: Application No. & Date of Registration -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Application No.
                </label>
                <div class="relative">
                  <input 
                    type="text" 
                    placeholder="Application Number" 
                    [(ngModel)]="data.basicInfo.applicationNo" 
                    (ngModelChange)="onDataChange()"
                    class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 bg-slate-50 font-mono focus:bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                  />
                  <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-sky-800 bg-sky-100/90 border border-sky-200 px-1.5 py-0.5 rounded select-none">
                    Auto / Assigned
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Registration
                </label>
                <input 
                  type="date" 
                  [(ngModel)]="data.basicInfo.dateOfRegistration" 
                  (ngModelChange)="onDataChange()"
                  class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer" 
                />
              </div>

              <!-- Row 2: TP/PIA Full Name * & TP/PIA Short Name * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  TP/PIA Full Name <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter TP/PIA Full Name" 
                  [(ngModel)]="data.basicInfo.fullName" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('basicInfo.fullName') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                />
                @if (isFieldInvalid('basicInfo.fullName')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('basicInfo.fullName') }}</p>
                }
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  TP/PIA Short Name <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. KUSHAL / SKILL-ORG" 
                  [(ngModel)]="data.basicInfo.shortName" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('basicInfo.shortName') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                />
                @if (isFieldInvalid('basicInfo.shortName')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('basicInfo.shortName') }}</p>
                }
              </div>

              <!-- Row 3: Registration Number & Organisation PAN No. -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Entity Registration Number
                </label>
                <input 
                  type="text" 
                  placeholder="Enter Entity Registration Number" 
                  [(ngModel)]="data.basicInfo.registrationNumber" 
                  (ngModelChange)="onDataChange()"
                  class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono" 
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Organisation PAN No.
                </label>
                <input 
                  type="text" 
                  placeholder="10-character PAN (e.g. ABCDE1234F)" 
                  maxlength="10"
                  [(ngModel)]="data.basicInfo.panNo" 
                  (ngModelChange)="data.basicInfo.panNo = (data.basicInfo.panNo || '').toUpperCase(); onDataChange()"
                  [ngClass]="isFieldInvalid('basicInfo.panNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none uppercase font-mono" 
                />
                @if (isFieldInvalid('basicInfo.panNo')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('basicInfo.panNo') }}</p>
                }
              </div>

              <!-- Row 4: Type of business/activity & State Where Registered -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Type of Business / Activity
                </label>
                <select 
                  [(ngModel)]="data.entityInfo.businessActivity" 
                  (change)="onDataChange()"
                  class="w-full h-9 px-2.5 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                >
                  <option value="">-- Select Business Activity --</option>
                  @for (act of businessActivities; track act) {
                    <option [value]="act">{{ act }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  State Where Registered
                </label>
                <select 
                  [(ngModel)]="data.entityInfo.stateWhereRegistered" 
                  (change)="onDataChange()"
                  class="w-full h-9 px-2.5 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                >
                  <option value="">-- Select State --</option>
                  @for (st of states; track st) {
                    <option [value]="st">{{ st }}</option>
                  }
                </select>
              </div>

              <!-- Row 5: Turn Over * & Website -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Turnover (₹ in Lakhs) <span class="text-rose-500 font-bold">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium select-none">₹</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Turnover (e.g. 150.00)" 
                    [(ngModel)]="data.entityInfo.turnOver" 
                    (ngModelChange)="onDataChange()"
                    [ngClass]="isFieldInvalid('entityInfo.turnOver') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-9 pl-7 pr-12 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none font-mono" 
                    required
                  />
                  <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium select-none">Lakhs</span>
                </div>
                @if (isFieldInvalid('entityInfo.turnOver')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('entityInfo.turnOver') }}</p>
                }
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Official Website
                </label>
                <input 
                  type="url" 
                  placeholder="https://www.organisation.org" 
                  [(ngModel)]="data.basicInfo.website" 
                  (ngModelChange)="onDataChange()"
                  class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                />
              </div>
            </div>
          </div>

          <!-- ================= 2. CONTACT & COMMUNICATION ================= -->
          <div>
            <div class="flex items-center gap-2 pb-2.5 mb-4 border-b border-slate-200/80">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">
                Contact & Communication Details
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <!-- Organisation Contact No. * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Organisation Contact No. <span class="text-rose-500 font-bold">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono select-none">+91</span>
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number" 
                    maxlength="10"
                    [(ngModel)]="data.basicInfo.contactNo" 
                    (ngModelChange)="onDataChange()"
                    [ngClass]="isFieldInvalid('basicInfo.contactNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-9 pl-11 pr-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none font-mono" 
                    required
                  />
                </div>
                @if (isFieldInvalid('basicInfo.contactNo')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('basicInfo.contactNo') }}</p>
                }
              </div>

              <!-- Company Email-ID * -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Company Official Email-ID <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="email" 
                  placeholder="info@organisation.org" 
                  [(ngModel)]="data.basicInfo.emailId" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('basicInfo.emailId') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                />
                @if (isFieldInvalid('basicInfo.emailId')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('basicInfo.emailId') }}</p>
                }
              </div>
            </div>
          </div>

          <!-- ================= 3. OFFICE ADDRESS RECORDS ================= -->
          <div>
            <div class="flex items-center gap-2 pb-2.5 mb-4 border-b border-slate-200/80">
              <span class="w-2 h-2 rounded-full bg-amber-600"></span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">
                Office Address Records
              </h3>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <!-- Left Card: Registered Office Address -->
              <div class="bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>Registered Office Address</span>
                      <span class="text-rose-500 font-bold">*</span>
                    </h4>
                    <span class="text-[10px] text-slate-500 font-medium">As per Certificate</span>
                  </div>

                  <!-- Street / Premises -->
                  <div class="mb-3">
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                      Premises / Building, Street & Area <span class="text-rose-500 font-bold">*</span>
                    </label>
                    <textarea 
                      rows="2"
                      placeholder="Enter Building, Street, Landmark" 
                      [(ngModel)]="data.registeredAddress.address" 
                      (ngModelChange)="onRegisteredAddressChange()"
                      [ngClass]="isFieldInvalid('registeredAddress.address') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                      class="w-full p-2.5 bg-white border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none resize-none" 
                      required
                    ></textarea>
                    @if (isFieldInvalid('registeredAddress.address')) {
                      <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('registeredAddress.address') }}</p>
                    }
                  </div>

                  <!-- State, District, Pincode -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1">
                        State/UT <span class="text-rose-500 font-bold">*</span>
                      </label>
                      <select 
                        [(ngModel)]="data.registeredAddress.state" 
                        (change)="onRegisteredAddressChange()"
                        class="w-full h-9 px-2 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                      >
                        @for (st of states; track st) {
                          <option [value]="st">{{ st }}</option>
                        }
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1">
                        District <span class="text-rose-500 font-bold">*</span>
                      </label>
                      @if (data.registeredAddress.state === 'Rajasthan') {
                        <select 
                          [(ngModel)]="data.registeredAddress.district" 
                          (change)="onRegisteredAddressChange()"
                          [ngClass]="isFieldInvalid('registeredAddress.district') ? 'border-rose-400' : 'border-slate-300'"
                          class="w-full h-9 px-2 border rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                        >
                          <option value="">-- District --</option>
                          @for (dist of districts; track dist) {
                            <option [value]="dist">{{ dist }}</option>
                          }
                        </select>
                      } @else {
                        <input 
                          type="text" 
                          placeholder="District" 
                          [(ngModel)]="data.registeredAddress.district" 
                          (ngModelChange)="onRegisteredAddressChange()"
                          class="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 transition outline-none" 
                        />
                      }
                      @if (isFieldInvalid('registeredAddress.district')) {
                        <p class="text-[11px] text-rose-600 mt-0.5 font-medium">Required</p>
                      }
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1">
                        Pincode <span class="text-rose-500 font-bold">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="6 digits" 
                        maxlength="6"
                        [(ngModel)]="data.registeredAddress.pincode" 
                        (ngModelChange)="onRegisteredAddressChange()"
                        [ngClass]="isFieldInvalid('registeredAddress.pincode') ? 'border-rose-400' : 'border-slate-300'"
                        class="w-full h-9 px-2.5 bg-white border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none font-mono" 
                        required
                      />
                      @if (isFieldInvalid('registeredAddress.pincode')) {
                        <p class="text-[11px] text-rose-600 mt-0.5 font-medium">{{ getFieldError('registeredAddress.pincode') }}</p>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Card: Postal / Communication Address -->
              <div class="bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>Postal / Mailing Address</span>
                      <span class="text-rose-500 font-bold">*</span>
                    </h4>
                    <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-950 bg-blue-100/80 hover:bg-blue-200/80 px-2.5 py-1 rounded-md transition select-none">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="data.sameAsRegistered" 
                        (change)="toggleSameAddress()"
                        class="rounded border-slate-300 text-blue-900 focus:ring-blue-900 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Same as Registered</span>
                    </label>
                  </div>

                  <!-- Street / Premises -->
                  <div class="mb-3">
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                      Premises / Building, Street, Area, City & Pincode <span class="text-rose-500 font-bold">*</span>
                    </label>
                    <textarea 
                      rows="2"
                      placeholder="Enter Postal Address details" 
                      [(ngModel)]="data.postalAddress.address" 
                      (ngModelChange)="onDataChange()"
                      [disabled]="data.sameAsRegistered"
                      [ngClass]="isFieldInvalid('postalAddress.address') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                      class="w-full p-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none resize-none disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed bg-white" 
                      required
                    ></textarea>
                    @if (isFieldInvalid('postalAddress.address')) {
                      <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('postalAddress.address') }}</p>
                    }
                  </div>

                  <!-- Status Note -->
                  @if (data.sameAsRegistered) {
                    <div class="flex items-center gap-2 py-2 px-3 bg-emerald-50 border border-emerald-200/80 rounded-md text-xs text-emerald-800 font-medium">
                      <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Automatically synchronized with Registered Office Address</span>
                    </div>
                  } @else {
                    <p class="text-xs text-slate-500">
                      Provide official correspondence address if different from the registered office.
                    </p>
                  }
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  `
})
export class TabOrgDetailsComponent {
  readonly service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);

  readonly states = INDIAN_STATES;
  readonly districts = RAJASTHAN_DISTRICTS;
  readonly businessActivities = BUSINESS_ACTIVITIES;

  readonly errors = computed(() => this.valService.validateTab1(this.service.formData()).errors);

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

    return this.valService.isTabSubmitted(1);
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

  toggleSameAddress() {
    if (this.data.sameAsRegistered) {
      const reg = this.data.registeredAddress;
      const full = [reg.address, reg.district, reg.state, reg.pincode ? `PIN: ${reg.pincode}` : ''].filter(Boolean).join(', ');
      this.data.postalAddress.address = full;
      this.data.postalAddress.state = reg.state;
      this.data.postalAddress.district = reg.district;
      this.data.postalAddress.pincode = reg.pincode;
    }
    this.service.updateFormData(curr => ({ ...curr }));
  }

  onRegisteredAddressChange() {
    if (this.data.sameAsRegistered) {
      this.toggleSameAddress();
    }
    this.onDataChange();
  }
}
