import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TpPiaRegistrationService, ID_PROOF_TYPES } from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';

@Component({
  selector: 'app-tab-authorized-project',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <section class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div 
          (click)="isOpen.set(!isOpen())"
          class="px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between bg-white hover:bg-slate-50/80 cursor-pointer select-none transition"
          [class.border-b]="isOpen()"
          [class.border-slate-200]="isOpen()"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <span class="px-2 sm:px-2.5 py-0.5 rounded bg-[#1a2656] text-white text-[11px] sm:text-xs font-bold tracking-wide select-none shrink-0">
              Section 4.1
            </span>
            <h3 class="text-xs sm:text-sm md:text-base font-bold text-slate-800 truncate sm:whitespace-normal">
              Authorized Representative (Project Level)
            </h3>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            @if (isOpen()) {
              <span class="text-xs text-slate-500 font-medium hidden sm:inline">State Project Director / Operational Coordinator</span>
            }
            <div class="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition">
              <svg 
                class="w-5 h-5 transition-transform duration-200"
                [class.rotate-180]="isOpen()"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        @if (isOpen()) {
        <div class="p-4 sm:p-6 divide-y divide-slate-100">
          <!-- Name * -->
          <div class="py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
            <div class="w-full md:w-64 lg:w-80 shrink-0">
              <label class="text-xs sm:text-sm font-medium text-slate-700">
                Representative Name <span class="text-rose-500 font-bold">*</span>
              </label>
            </div>
            <div class="flex-1 w-full">
              <input 
                type="text" 
                placeholder="Full name of project head" 
                [(ngModel)]="data.authorizedProject.name" 
                (ngModelChange)="onDataChange()"
                [ngClass]="isFieldInvalid('authorizedProject.name') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                required
              />
              @if (isFieldInvalid('authorizedProject.name')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedProject.name') }}</p>
              }
            </div>
          </div>

          <!-- Designation * -->
          <div class="py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
            <div class="w-full md:w-64 lg:w-80 shrink-0">
              <label class="text-xs sm:text-sm font-medium text-slate-700">
                Designation <span class="text-rose-500 font-bold">*</span>
              </label>
            </div>
            <div class="flex-1 w-full">
              <input 
                type="text" 
                placeholder="e.g. Project Head / State Coordinator" 
                [(ngModel)]="data.authorizedProject.designation" 
                (ngModelChange)="onDataChange()"
                [ngClass]="isFieldInvalid('authorizedProject.designation') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                required
              />
              @if (isFieldInvalid('authorizedProject.designation')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedProject.designation') }}</p>
              }
            </div>
          </div>

          <!-- Email ID * -->
          <div class="py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
            <div class="w-full md:w-64 lg:w-80 shrink-0">
              <label class="text-xs sm:text-sm font-medium text-slate-700">
                Email ID <span class="text-rose-500 font-bold">*</span>
              </label>
            </div>
            <div class="flex-1 w-full">
              <input 
                type="email" 
                placeholder="project.head@org.com" 
                [(ngModel)]="data.authorizedProject.emailId" 
                (ngModelChange)="onDataChange()"
                [ngClass]="isFieldInvalid('authorizedProject.emailId') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                required
              />
              @if (isFieldInvalid('authorizedProject.emailId')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedProject.emailId') }}</p>
              }
            </div>
          </div>

          <!-- Contact No. -->
          <div class="py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
            <div class="w-full md:w-64 lg:w-80 shrink-0">
              <label class="text-xs sm:text-sm font-medium text-slate-700">
                Contact No.
              </label>
            </div>
            <div class="flex-1 w-full">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-mono font-semibold">+91</span>
                <input 
                  type="tel" 
                  maxlength="10" 
                  placeholder="10 digit contact" 
                  [(ngModel)]="data.authorizedProject.contactNo" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('authorizedProject.contactNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-10 pl-11 pr-3.5 border rounded-md text-sm text-slate-800 font-mono hover:border-slate-400 focus:ring-1 transition outline-none" 
                />
              </div>
              @if (isFieldInvalid('authorizedProject.contactNo')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedProject.contactNo') }}</p>
              }
            </div>
          </div>

          <!-- Type ID Proof -->
          <div class="py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
            <div class="w-full md:w-64 lg:w-80 shrink-0">
              <label class="text-xs sm:text-sm font-medium text-slate-700">
                Type ID Proof
              </label>
            </div>
            <div class="flex-1 w-full">
              <select 
                [(ngModel)]="data.authorizedProject.typeIdProof" 
                (change)="onDataChange()"
                class="w-full h-10 px-3 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none"
              >
                <option value="">-- Select ID Proof (Optional) --</option>
                @for (proof of idTypes; track proof) {
                  <option [value]="proof">{{ proof }}</option>
                }
              </select>
            </div>
          </div>

          <!-- ID No. -->
          <div class="py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
            <div class="w-full md:w-64 lg:w-80 shrink-0">
              <label class="text-xs sm:text-sm font-medium text-slate-700">
                ID No.
              </label>
            </div>
            <div class="flex-1 w-full">
              <input 
                type="text" 
                placeholder="Identity document number" 
                [(ngModel)]="data.authorizedProject.idNo" 
                (ngModelChange)="onDataChange()"
                [ngClass]="isFieldInvalid('authorizedProject.idNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
              />
              @if (isFieldInvalid('authorizedProject.idNo')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('authorizedProject.idNo') }}</p>
              }
            </div>
          </div>

          <!-- Residence Address / Project Office Address -->
          <div class="py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-start md:pt-4 gap-1.5 md:gap-6">
            <div class="w-full md:w-64 lg:w-80 shrink-0 md:pt-2">
              <label class="text-xs sm:text-sm font-medium text-slate-700">
                Operational Office Address
              </label>
            </div>
            <div class="flex-1 w-full">
              <textarea 
                rows="2"
                placeholder="Local project office or residence address" 
                [(ngModel)]="data.authorizedProject.address" 
                (ngModelChange)="onDataChange()"
                class="w-full p-3 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
              ></textarea>
            </div>
          </div>
        </div>
        }
      </section>
    </div>
  `
})
export class TabAuthorizedProjectComponent {
  private service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);
  readonly idTypes = ID_PROOF_TYPES;
  readonly isOpen = signal<boolean>(true);

  readonly errors = computed(() => this.valService.validateTab4(this.service.formData()).errors);

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
      // User entered input and it is incorrect
      return true;
    }

    // Field is empty: only show error if user attempted to proceed (Next Step / Review & Submit)
    return this.valService.isTabSubmitted(4);
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
}
