import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import {
  OfficerInCharge,
  DESIGNATIONS_MASTER,
  FileDoc
} from '../../models/otr-form.model';

import { FormInputComponent } from '../../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { FormFileUploadComponent } from '../../../../shared/components/form-controls/form-file-upload/form-file-upload.component';

@Component({
  selector: 'app-step2-oic-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    FormFileUploadComponent
  ],
  template: `
    <div class="w-full space-y-4">

      <!-- Header & Add Officer Action -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-base font-bold text-slate-900">
            Officer In-Charge Directory
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Add authorized project officers and nodal contacts (Minimum 1 officer required).
          </p>
        </div>

        <button
          type="button"
          (click)="addOfficer()"
          class="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#131862] hover:bg-[#0c1046] active:scale-95 rounded transition-all cursor-pointer"
        >
          + Add Officer
        </button>
      </div>

      <!-- Duplicate Warnings (if any) -->
      @if (duplicateWarnings().length > 0) {
        <div class="p-3 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <span class="font-bold block mb-1">Duplicate Data Warnings:</span>
          <ul class="list-disc list-inside space-y-0.5">
            @for (warn of duplicateWarnings(); track $index) {
              <li>{{ warn }}</li>
            }
          </ul>
        </div>
      }

      <!-- Officers List / Accordion Cards -->
      <div class="space-y-3">
        @for (oic of oicList(); track oic.id; let idx = $index) {
          <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
            
            <!-- Accordion Header -->
            <div
              (click)="toggleExpand(idx)"
              class="w-full px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-5 h-5 rounded bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {{ idx + 1 }}
                </span>
                <span class="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {{ oic.name ? oic.name : 'Officer #' + (idx + 1) }}
                </span>
                @if (oic.designation) {
                  <span class="text-xs text-slate-500 truncate hidden sm:inline">
                    &bull; {{ oic.designation }}
                  </span>
                }
              </div>

              <div class="flex items-center gap-2 shrink-0">
                @if (oicList().length > 1) {
                  <button
                    type="button"
                    (click)="removeOfficer(idx, $event)"
                    class="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-0.5 cursor-pointer"
                  >
                    Delete
                  </button>
                }
                <span class="text-xs text-slate-400">
                  {{ oic.isExpanded ? 'Collapse' : 'Expand' }}
                </span>
              </div>
            </div>

            <!-- Form Body -->
            @if (oic.isExpanded) {
              <div class="p-4 space-y-3 bg-white">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <app-form-input
                    label="Officer Full Name"
                    [value]="oic.name"
                    (valueChange)="updateField(idx, 'name', $event)"
                    placeholder="e.g. Ramesh Kumar Verma"
                    [required]="true"
                    [maxLength]="100"
                  ></app-form-input>

                  <app-form-select
                    label="Designation / Role"
                    [value]="oic.designation"
                    (valueChange)="updateField(idx, 'designation', $event)"
                    [options]="designations"
                    placeholder="Select Designation"
                    [required]="true"
                  ></app-form-select>

                  <app-form-input
                    label="Mobile Number"
                    type="tel"
                    [value]="oic.mobileNo"
                    (valueChange)="updateField(idx, 'mobileNo', $event)"
                    placeholder="e.g. 9829012345"
                    [required]="true"
                    [maxLength]="10"
                  ></app-form-input>

                  <app-form-input
                    label="Official Email-ID"
                    type="email"
                    [value]="oic.emailId"
                    (valueChange)="updateField(idx, 'emailId', $event)"
                    placeholder="e.g. officer@organisation.com"
                    [required]="true"
                  ></app-form-input>

                  <app-form-input
                    label="Permanent Account Number (PAN)"
                    [value]="oic.pan"
                    (valueChange)="updateField(idx, 'pan', $event)"
                    placeholder="e.g. ABCDE1234F"
                    [required]="true"
                    [uppercase]="true"
                    [maxLength]="10"
                  ></app-form-input>

                  <app-form-input
                    label="Aadhaar Card Number"
                    type="tel"
                    [value]="oic.aadhaarNo"
                    (valueChange)="updateField(idx, 'aadhaarNo', $event)"
                    placeholder="e.g. 123456789012"
                    [required]="true"
                    [maxLength]="12"
                  ></app-form-input>
                </div>

                <!-- Secondary IDs -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-1">
                  <app-form-input
                    label="Bhamashah / Jan Aadhaar No."
                    [value]="oic.bhamashahNo"
                    (valueChange)="updateField(idx, 'bhamashahNo', $event)"
                    placeholder="Optional"
                    [maxLength]="15"
                  ></app-form-input>

                  <app-form-input
                    label="Voter ID Card No."
                    [value]="oic.voterIdNo"
                    (valueChange)="updateField(idx, 'voterIdNo', $event)"
                    placeholder="Optional"
                    [uppercase]="true"
                    [maxLength]="20"
                  ></app-form-input>

                  <app-form-input
                    label="Passport Number"
                    [value]="oic.passportNo"
                    (valueChange)="updateField(idx, 'passportNo', $event)"
                    placeholder="Optional"
                    [uppercase]="true"
                    [maxLength]="12"
                  ></app-form-input>
                </div>

                <!-- Documents -->
                <div class="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <app-form-file-upload
                    label="Appointment / Authorization Letter"
                    [fileDoc]="oic.appointmentLetterDoc"
                    (fileDocChange)="updateFileDoc(idx, 'appointmentLetterDoc', $event)"
                    [required]="true"
                  ></app-form-file-upload>

                  <app-form-file-upload
                    label="Government ID Proof (PAN / Aadhaar)"
                    [fileDoc]="oic.idProofDoc"
                    (fileDocChange)="updateFileDoc(idx, 'idProofDoc', $event)"
                    [required]="false"
                  ></app-form-file-upload>
                </div>

              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class Step2OicDetailsComponent {
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);

  readonly designations = DESIGNATIONS_MASTER;
  readonly oicList = computed(() => this.otrFormService.step2());

  readonly duplicateWarnings = computed(() => {
    const list = this.oicList();
    const warnings: string[] = [];
    const pans = new Map<string, number>();
    const mobiles = new Map<string, number>();

    list.forEach((oic, idx) => {
      const p = oic.pan?.trim().toUpperCase();
      if (p) {
        if (pans.has(p)) {
          warnings.push(`Duplicate PAN (${p}) in Officer #${pans.get(p)! + 1} and Officer #${idx + 1}`);
        } else {
          pans.set(p, idx);
        }
      }

      const m = oic.mobileNo?.trim();
      if (m) {
        if (mobiles.has(m)) {
          warnings.push(`Duplicate Mobile (${m}) in Officer #${mobiles.get(m)! + 1} and Officer #${idx + 1}`);
        } else {
          mobiles.set(m, idx);
        }
      }
    });

    return warnings;
  });

  addOfficer(): void {
    this.otrFormService.addOic();
  }

  removeOfficer(index: number, event: Event): void {
    event.stopPropagation();
    if (this.oicList().length <= 1) {
      this.validationService.showToast('At least one Officer In-Charge record is strictly mandatory.', 'warning', 2);
      return;
    }
    this.otrFormService.removeOic(index);
  }

  toggleExpand(index: number): void {
    this.otrFormService.toggleOicExpand(index);
  }

  updateField(index: number, field: keyof OfficerInCharge, value: string): void {
    this.otrFormService.updateOic(index, { [field]: value });
  }

  updateFileDoc(index: number, field: 'appointmentLetterDoc' | 'idProofDoc', file: FileDoc | null): void {
    this.otrFormService.updateOic(index, { [field]: file });
  }
}
