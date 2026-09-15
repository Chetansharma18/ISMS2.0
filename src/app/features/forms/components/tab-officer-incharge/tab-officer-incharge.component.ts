import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TpPiaRegistrationService } from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';
import { OfficerInCharge } from '../../models/tp-pia-registration.model';

@Component({
  selector: 'app-tab-officer-incharge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 sm:space-y-6">
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div 
          (click)="isOpen.set(!isOpen())"
          class="px-4 sm:px-6 py-3 sm:py-3.5 flex flex-row items-center justify-between gap-2 sm:gap-3 bg-white hover:bg-slate-50/80 cursor-pointer select-none transition"
          [class.border-b]="isOpen()"
          [class.border-slate-200]="isOpen()"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <span class="px-2 sm:px-2.5 py-0.5 rounded bg-[#1a2656] text-white text-[11px] sm:text-xs font-bold tracking-wide select-none shrink-0">
              Section 2.1
            </span>
            <h3 class="text-xs sm:text-sm md:text-base font-bold text-slate-800 truncate sm:whitespace-normal">
              Details of Officer In-Charge
            </h3>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            @if (isOpen()) {
              <button 
                type="button" 
                (click)="$event.stopPropagation(); openAddModal()"
                class="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1a2656] hover:bg-[#233373] text-white rounded-md text-xs sm:text-sm font-semibold tracking-wide transition shadow-xs cursor-pointer active:scale-98 whitespace-nowrap"
              >
                + Add Officer
              </button>
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
        <div class="p-4 sm:p-6">
          @if (isTab2Invalid && officers.length === 0) {
            <div class="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs sm:text-sm text-rose-700 flex items-center gap-2 font-medium">
              <svg class="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>At least one Officer In-Charge record must be added to proceed.</span>
            </div>
          }

          <!-- Dynamic List of Officers -->
          @if (officers.length === 0) {
            <div class="text-center py-8 sm:py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p class="text-xs sm:text-sm font-medium text-slate-600">No Officer In-Charge added yet</p>
              <button 
                type="button" 
                (click)="openAddModal()"
                class="mt-2.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-900 hover:underline cursor-pointer"
              >
                + Click to add officer record
              </button>
            </div>
          } @else {
            <!-- Mobile Card View (block md:hidden) -->
            <div class="block md:hidden space-y-3">
              @for (off of officers; track off.id; let idx = $index) {
                <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-xs font-bold text-slate-400">#{{ idx + 1 }}</span>
                        <h4 class="font-bold text-slate-900 text-sm truncate">{{ off.name }}</h4>
                      </div>
                      @if (off.emailId) {
                        <p class="text-xs text-slate-500 mt-0.5 truncate">{{ off.emailId }}</p>
                      }
                    </div>
                    @if (off.designation) {
                      <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {{ off.designation }}
                      </span>
                    }
                  </div>

                  <!-- Contact & IDs -->
                  <div class="pt-1 border-t border-slate-100 text-xs space-y-1.5">
                    @if (off.mobileNo) {
                      <div class="flex items-center gap-1.5 text-slate-700">
                        <span class="text-slate-400 font-medium">Mobile:</span>
                        <a [href]="'tel:' + off.mobileNo" class="font-mono font-semibold text-blue-900 hover:underline">{{ off.mobileNo }}</a>
                      </div>
                    }
                    
                    <div class="flex flex-wrap gap-1.5 pt-0.5">
                      @if (off.pan) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-900 border border-blue-200">
                          <span class="font-bold">PAN:</span><span class="font-mono">{{ off.pan }}</span>
                        </span>
                      }
                      @if (off.aadhaarNo) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200">
                          <span class="font-bold">Aadhaar:</span><span class="font-mono">{{ off.aadhaarNo }}</span>
                        </span>
                      }
                      @if (off.voterIdNo) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200">
                          <span class="font-bold">Voter:</span><span class="font-mono">{{ off.voterIdNo }}</span>
                        </span>
                      }
                      @if (off.bhamashahNo) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-900 border border-purple-200">
                          <span class="font-bold">Bhamashah:</span><span class="font-mono">{{ off.bhamashahNo }}</span>
                        </span>
                      }
                      @if (off.passportNo) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          <span class="font-bold">Passport:</span><span class="font-mono">{{ off.passportNo }}</span>
                        </span>
                      }
                      @if (!off.pan && !off.aadhaarNo && !off.bhamashahNo && !off.voterIdNo && !off.passportNo) {
                        <span class="text-slate-400 italic text-[11px]">No ID proofs specified</span>
                      }
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button 
                      type="button" 
                      (click)="editOfficer(off)"
                      class="px-3 py-1 text-xs text-blue-900 font-semibold hover:bg-blue-50 rounded-md border border-blue-200 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      (click)="deleteOfficer(off.id)"
                      class="px-3 py-1 text-xs text-rose-600 font-semibold hover:bg-rose-50 rounded-md border border-rose-200 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Desktop Table View (hidden md:block) -->
            <div class="hidden md:block overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table class="w-full text-left text-sm text-slate-700">
                <thead class="bg-slate-50/90 border-b border-slate-200 text-slate-800 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th class="py-3.5 px-4 w-12 text-center">#</th>
                    <th class="py-3.5 px-4">Officer Name & Email</th>
                    <th class="py-3.5 px-4">Designation</th>
                    <th class="py-3.5 px-4">Mobile No.</th>
                    <th class="py-3.5 px-4">Identity Proofs</th>
                    <th class="py-3.5 px-4 text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (off of officers; track off.id; let idx = $index) {
                    <tr class="hover:bg-slate-50/70 transition">
                      <td class="py-3.5 px-4 font-mono text-slate-400 text-xs text-center">{{ idx + 1 }}</td>
                      <td class="py-3.5 px-4">
                        <div class="font-bold text-slate-900 text-sm">{{ off.name }}</div>
                        @if (off.emailId) {
                          <div class="text-slate-500 text-xs mt-0.5">{{ off.emailId }}</div>
                        }
                      </td>
                      <td class="py-3.5 px-4">
                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {{ off.designation || '—' }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 font-mono text-slate-800 text-sm">
                        {{ off.mobileNo || '—' }}
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                          @if (off.pan) {
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs">
                              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700">PAN:</span>
                              <span class="font-mono font-semibold">{{ off.pan }}</span>
                            </span>
                          }
                          @if (off.aadhaarNo) {
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200/90 shadow-2xs">
                              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Aadhaar:</span>
                              <span class="font-mono font-semibold">{{ off.aadhaarNo }}</span>
                            </span>
                          }
                          @if (off.bhamashahNo) {
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200/90 shadow-2xs">
                              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700">Bhamashah:</span>
                              <span class="font-mono font-semibold">{{ off.bhamashahNo }}</span>
                            </span>
                          }
                          @if (off.voterIdNo) {
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs">
                              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700">Voter:</span>
                              <span class="font-mono font-semibold">{{ off.voterIdNo }}</span>
                            </span>
                          }
                          @if (off.passportNo) {
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
                              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-600">Passport:</span>
                              <span class="font-mono font-semibold">{{ off.passportNo }}</span>
                            </span>
                          }
                          @if (!off.pan && !off.aadhaarNo && !off.bhamashahNo && !off.voterIdNo && !off.passportNo) {
                            <span class="text-slate-400 italic text-xs">No IDs specified</span>
                          }
                        </div>
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <div class="inline-flex items-center gap-2">
                          <button 
                            type="button" 
                            (click)="editOfficer(off)"
                            class="px-3 py-1 text-xs text-blue-900 font-semibold hover:bg-blue-50 rounded-full border border-blue-200 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            (click)="deleteOfficer(off.id)"
                            class="px-3 py-1 text-xs text-rose-600 font-semibold hover:bg-rose-50 rounded-full border border-rose-200 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
        }
      </section>

      <!-- Add / Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div class="bg-[#0f1738] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
              <h4 class="text-sm sm:text-base font-bold uppercase tracking-wider truncate">
                {{ isEditing() ? 'Edit Officer In-Charge' : 'Add Officer In-Charge' }}
              </h4>
              <button type="button" (click)="closeModal()" class="text-slate-300 hover:text-white text-2xl font-bold cursor-pointer leading-none">&times;</button>
            </div>

            <div class="p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[75vh] overflow-y-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <!-- Name -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Name <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentOfficer.name" 
                    placeholder="Full legal name"
                    [ngClass]="isModalFieldInvalid('name') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                    required
                  />
                  @if (isModalFieldInvalid('name')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('name') }}</p>
                  }
                </div>

                <!-- Designation -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Designation <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentOfficer.designation" 
                    placeholder="e.g. Officer In-Charge"
                    [ngClass]="isModalFieldInvalid('designation') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                    required
                  />
                  @if (isModalFieldInvalid('designation')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('designation') }}</p>
                  }
                </div>

                <!-- Mobile No. -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Mobile No. <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="tel" 
                    maxlength="10" 
                    [(ngModel)]="currentOfficer.mobileNo" 
                    placeholder="10 digit mobile"
                    [ngClass]="isModalFieldInvalid('mobileNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                    required
                  />
                  @if (isModalFieldInvalid('mobileNo')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('mobileNo') }}</p>
                  }
                </div>

                <!-- EmailId -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Email ID <span class="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="email" 
                    [(ngModel)]="currentOfficer.emailId" 
                    placeholder="officer@domain.org"
                    [ngClass]="isModalFieldInvalid('emailId') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                    required
                  />
                  @if (isModalFieldInvalid('emailId')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('emailId') }}</p>
                  }
                </div>

                <!-- PAN -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    PAN
                  </label>
                  <input 
                    type="text" 
                    maxlength="10" 
                    [(ngModel)]="currentOfficer.pan" 
                    (ngModelChange)="currentOfficer.pan = (currentOfficer.pan || '').toUpperCase()"
                    placeholder="ABCDE1234F"
                    [ngClass]="isModalFieldInvalid('pan') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 uppercase font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                  />
                  @if (isModalFieldInvalid('pan')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('pan') }}</p>
                  }
                </div>

                <!-- Aadhaar No. -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Aadhaar No.
                  </label>
                  <input 
                    type="text" 
                    maxlength="12" 
                    [(ngModel)]="currentOfficer.aadhaarNo" 
                    placeholder="12 digit Aadhaar"
                    [ngClass]="isModalFieldInvalid('aadhaarNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                  />
                  @if (isModalFieldInvalid('aadhaarNo')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('aadhaarNo') }}</p>
                  }
                </div>

                <!-- Bhamashah No. -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Bhamashah No.
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentOfficer.bhamashahNo" 
                    placeholder="Bhamashah ID"
                    class="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                  />
                </div>

                <!-- Voter Id No. -->
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Voter ID No.
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentOfficer.voterIdNo" 
                    placeholder="EPIC / Voter ID"
                    class="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 uppercase font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                  />
                </div>

                <!-- Passport No. -->
                <div class="sm:col-span-2">
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Passport No.
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentOfficer.passportNo" 
                    placeholder="Passport number"
                    class="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 uppercase font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                  />
                </div>
              </div>
            </div>

            <div class="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button 
                type="button" 
                (click)="closeModal()"
                class="px-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button 
                type="button" 
                (click)="saveOfficer()"
                class="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs text-center"
              >
                {{ isEditing() ? 'Update Officer' : 'Save Officer' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TabOfficerInchargeComponent {
  private service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);

  readonly showModal = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly modalSubmitted = signal<boolean>(false);
  readonly isOpen = signal<boolean>(true);

  currentOfficer: OfficerInCharge = this.getEmptyOfficer();

  get officers(): OfficerInCharge[] {
    return this.service.formData().officers;
  }

  get isTab2Invalid(): boolean {
    return this.valService.isTabSubmitted(2) && !this.valService.isTabValid(2, this.service.formData());
  }

  get officerErrors(): Record<string, string> {
    return this.valService.validateOfficer(this.currentOfficer).errors;
  }

  isModalFieldInvalid(field: keyof OfficerInCharge): boolean {
    const error = this.officerErrors[field];
    if (!error) return false;

    const val = this.currentOfficer[field];
    const hasValue = val !== undefined && val !== null && String(val).trim().length > 0;
    if (hasValue) {
      // User entered input and it is incorrect
      return true;
    }

    // Empty field only shows error when user attempts to submit/save modal
    return this.modalSubmitted();
  }

  getModalFieldError(field: keyof OfficerInCharge): string {
    return this.isModalFieldInvalid(field) ? (this.officerErrors[field] || '') : '';
  }

  openAddModal() {
    this.isEditing.set(false);
    this.modalSubmitted.set(false);
    this.currentOfficer = this.getEmptyOfficer();
    this.showModal.set(true);
  }

  editOfficer(off: OfficerInCharge) {
    this.isEditing.set(true);
    this.modalSubmitted.set(false);
    this.currentOfficer = { ...off };
    this.showModal.set(true);
  }

  deleteOfficer(id: string) {
    if (confirm('Are you sure you want to remove this officer record?')) {
      this.service.updateFormData(curr => ({
        ...curr,
        officers: curr.officers.filter(o => o.id !== id)
      }));
    }
  }

  saveOfficer() {
    this.modalSubmitted.set(true);
    const validation = this.valService.validateOfficer(this.currentOfficer);
    if (!validation.isValid) {
      return;
    }

    if (this.isEditing()) {
      this.service.updateFormData(curr => ({
        ...curr,
        officers: curr.officers.map(o => o.id === this.currentOfficer.id ? this.currentOfficer : o)
      }));
    } else {
      this.service.updateFormData(curr => ({
        ...curr,
        officers: [...curr.officers, { ...this.currentOfficer, id: 'off-' + Date.now() }]
      }));
    }
    this.closeModal();
  }

  closeModal() {
    this.showModal.set(false);
  }

  private getEmptyOfficer(): OfficerInCharge {
    return {
      id: '',
      name: '',
      designation: '',
      mobileNo: '',
      emailId: '',
      pan: '',
      aadhaarNo: '',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
    };
  }
}
