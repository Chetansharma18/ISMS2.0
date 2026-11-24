import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../../shared';
import { EoiDocumentItem } from '../scheme-form.model';
import { SchemeFormState } from '../scheme-form.state';
import { DOC_ACCEPT, validateDocFile } from './step3-document-rules';

/**
 * Step 3: Complete Application Preview
 *
 * Consolidates verified profile and proposal documents into a structured, read-only
 * verification view before the applicant proceeds to processing fee payment.
 * Profile sections are strictly read-only; document section allows replacement via the Edit option.
 */
@Component({
  selector: 'app-step4-complete-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="w-full space-y-4 font-sans">

      <!-- ====================================================================
           1. ORGANISATION DETAILS PREVIEW (Read-Only)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Organisation Details</h2>
          </div>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <!-- Row 1: Basic Organisation Details -->
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation Name</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.fullName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Nature of Entity</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.natureOfEntity || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Preferred Sector</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.preferredSector || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">NSDC Partner</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.nsdcPartner || '-' }}</span>
          </div>

          <!-- Row 2: Registrations & Status -->
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Registration No. (CIN / Reg. No.)</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.registrationNumber || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Registration</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.dateOfRegistration || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State / UT of Registration</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.stateOfLegalReg || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation PAN</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.companyPan || '-' }}</span>
          </div>

          <!-- Row 3: GST & MSME Status -->
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GST Registered</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.gstRegistered || '-' }}</span>
          </div>
          @if (state.editableStep1.gstRegistered === 'Yes') {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GSTIN</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums uppercase">{{ state.editableStep1.gstin || '-' }}</span>
            </div>
          }
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MSME / Udyam Registered</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.msmeRegistered || '-' }}</span>
          </div>
          @if (state.editableStep1.msmeRegistered === 'Yes') {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Udyam Registration No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums uppercase">{{ state.editableStep1.udyamNumber || '-' }}</span>
            </div>
          }

          <!-- Row 4: Contact Information -->
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Contact Number</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.contactNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation Email ID</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ state.editableStep1.emailId || '-' }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Website</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ state.editableStep1.website || '-' }}</span>
          </div>

          <!-- Row 5: Addresses -->
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Registered Address</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ state.registeredAddressText }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Office Address</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ state.officeAddressText }}</span>
          </div>

          <!-- Uploaded registration documents -->
          @if (state.editableStep1.registrationCertDoc?.status === 'uploaded' || state.editableStep1.panCardDoc?.status === 'uploaded' || state.editableStep1.gstCertDoc?.status === 'uploaded' || state.editableStep1.msmeCertDoc?.status === 'uploaded') {
            <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100 space-y-1.5">
              @if (state.editableStep1.registrationCertDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <app-icon name="pdf-badge" solid size="auto" class="w-4 h-4 text-[#E5252A] select-none shrink-0" />
                      <div class="min-w-0">
                        <span class="text-slate-500 text-[11.5px]">Registration Certificate: </span>
                        <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                      </div>
                    </div>
                    <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Registration Certificate', doc.fileSize)" title="View Registration Certificate" aria-label="View Registration Certificate"><app-icon name="eye" size="sm" /></button>
                  </div>
                }
              }
              @if (state.editableStep1.panCardDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <app-icon name="pdf-badge" solid size="auto" class="w-4 h-4 text-[#E5252A] select-none shrink-0" />
                      <div class="min-w-0">
                        <span class="text-slate-500 text-[11.5px]">PAN Card: </span>
                        <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                      </div>
                    </div>
                    <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="state.viewDoc(doc.fileName, 'PAN Card', doc.fileSize)" title="View PAN Card" aria-label="View PAN Card"><app-icon name="eye" size="sm" /></button>
                  </div>
                }
              }
              @if (state.editableStep1.gstCertDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <app-icon name="pdf-badge" solid size="auto" class="w-4 h-4 text-[#E5252A] select-none shrink-0" />
                      <div class="min-w-0">
                        <span class="text-slate-500 text-[11.5px]">GST Certificate: </span>
                        <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                      </div>
                    </div>
                    <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="state.viewDoc(doc.fileName, 'GST Certificate', doc.fileSize)" title="View GST Certificate" aria-label="View GST Certificate"><app-icon name="eye" size="sm" /></button>
                  </div>
                }
              }
              @if (state.editableStep1.msmeCertDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <app-icon name="pdf-badge" solid size="auto" class="w-4 h-4 text-[#E5252A] select-none shrink-0" />
                      <div class="min-w-0">
                        <span class="text-slate-500 text-[11.5px]">Udyam Certificate: </span>
                        <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                      </div>
                    </div>
                    <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Udyam Certificate', doc.fileSize)" title="View Udyam Certificate" aria-label="View Udyam Certificate"><app-icon name="eye" size="sm" /></button>
                  </div>
                }
              }
            </div>
          }
        </div>
      </section>

      <!-- ====================================================================
           2. AUTHORIZED SIGNATORY PREVIEW (Read-Only)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Authorized Person Details</h2>
          </div>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Full Name</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ authPersonFullName }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Designation</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep3.designation || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Mobile Number</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep3.mobileNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email Address</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ state.editableStep3.emailId || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep3.state || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Identity Document Type</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep3.identityDocType || (state.editableStep3.aadhaarNo ? 'Aadhaar Card' : state.editableStep3.pan ? 'PAN Card' : '-') }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Document Number</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ authPersonDocNumber }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Residential Address</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ state.residenceAddressText || state.editableStep3.residenceAddress || '-' }}</span>
          </div>

          <!-- Uploaded signatory documents -->
          @if (state.editableStep3.idProofDoc?.status === 'uploaded' || state.editableStep3.authorizationLetterDoc?.status === 'uploaded') {
            <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100 space-y-1.5">
              @if (state.editableStep3.idProofDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <app-icon name="pdf-badge" solid size="auto" class="w-4 h-4 text-[#E5252A] select-none shrink-0" />
                      <div class="min-w-0">
                        <span class="text-slate-500 text-[11.5px]">Identity Document: </span>
                        <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                      </div>
                    </div>
                    <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Identity Document', doc.fileSize)" title="View Identity Document" aria-label="View Identity Document"><app-icon name="eye" size="sm" /></button>
                  </div>
                }
              }
              @if (state.editableStep3.authorizationLetterDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <app-icon name="pdf-badge" solid size="auto" class="w-4 h-4 text-[#E5252A] select-none shrink-0" />
                      <div class="min-w-0">
                        <span class="text-slate-500 text-[11.5px]">Authorization Letter / Board Resolution: </span>
                        <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                      </div>
                    </div>
                    <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Authorization Letter', doc.fileSize)" title="View Authorization Letter" aria-label="View Authorization Letter"><app-icon name="eye" size="sm" /></button>
                  </div>
                }
              }
            </div>
          }
        </div>
      </section>

      <!-- ====================================================================
           3. BANK DETAILS PREVIEW (Read-Only)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Organisation Bank Details</h2>
          </div>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Name of the Bank</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.bankName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Branch Name</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.branchName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Holder Name</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.accountHolderName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Number</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep4.accountNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">IFSC Code</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums uppercase">{{ state.editableStep4.ifscCode || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MICR Code</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep4.micrCode || '-' }}</span>
          </div>

          @if (state.editableStep4.cancelledChequeDoc; as doc) {
            @if (doc.status === 'uploaded') {
              <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 min-w-0">
                    <app-icon name="pdf-badge" solid size="auto" class="w-4 h-4 text-[#E5252A] select-none shrink-0" />
                    <div class="min-w-0">
                      <span class="text-slate-500 text-[11.5px]">Cancelled Cheque / Bank Passbook: </span>
                      <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                    </div>
                  </div>
                  <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Cancelled Cheque', doc.fileSize)" title="View Cancelled Cheque" aria-label="View Cancelled Cheque"><app-icon name="eye" size="sm" /></button>
                </div>
              </div>
            }
          }
        </div>
      </section>

      <!-- ====================================================================
           4. PROPOSAL DOCUMENTS TABLE PREVIEW (Replace only on Edit)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Documents ({{ state.attachedDocsCount() }} / {{ state.eoiDocuments().length }} Uploaded)</h2>
          </div>
          <button
            appButton
            [variant]="isEditingDocs() ? 'primary' : 'outline'"
            size="sm"
            (click)="toggleDocEdit()"
          >
            {{ isEditingDocs() ? 'Done' : 'Edit' }}
          </button>
        </div>

        <div class="p-4 sm:p-5 space-y-6">
          @if (isEditingDocs()) {
            <div class="p-3 bg-[#F8EDF1] border border-[#EADCE2] rounded-lg text-xs text-[#7C0E44] flex items-center justify-between gap-3">
              <span>Replace mode active: click <strong>Replace</strong> against any document to upload a replacement file.</span>
              <button appButton variant="primary" size="sm" (click)="toggleDocEdit()">Done</button>
            </div>
          }

          <!-- Subsection 4.1: Supporting Documents -->
          <div class="space-y-2.5">
            <app-table
              [columns]="documentColumns"
              [data]="state.supportingDocs()"
              [customTemplates]="{ name: nameTemplate, comment: commentTemplate, status: statusTemplate, action: actionTemplate }"
            >
            </app-table>
          </div>

          <!-- Subsection 4.2: Annexures -->
          <div class="space-y-2.5">
            <app-table
              [columns]="annexureColumns"
              [data]="state.annexureDocs()"
              [customTemplates]="{ name: nameTemplate, comment: commentTemplate, status: statusTemplate, action: actionTemplate }"
            >
            </app-table>
          </div>
        </div>

        <ng-template #nameTemplate let-doc>
          <div class="flex items-center gap-2">
            <app-icon name="pdf-badge" solid size="auto" class="w-4.5 h-4.5 text-[#E5252A] select-none shrink-0" />
            <div class="min-w-0">
              <span class="font-medium text-slate-900 text-[12.5px]">{{ doc.name }}</span>
              @if (doc.isMandatory) {
                <span class="text-rose-600 font-bold" title="Mandatory"> *</span>
              }
            </div>
          </div>
          @if (errors()[doc.id]) {
            <p class="text-[11.5px] text-red-600 m-0 mt-1" role="alert">{{ errors()[doc.id] }}</p>
          }
        </ng-template>

        <ng-template #commentTemplate let-doc>
          @if (doc.comment) {
            <span class="text-[12px] text-[#25212A] whitespace-pre-wrap break-words block max-w-[240px]">{{ doc.comment }}</span>
          } @else {
            <span class="text-slate-400 text-xs">—</span>
          }
        </ng-template>

        <ng-template #statusTemplate let-doc>
          @if (doc.status === 'uploaded') {
            <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              Uploaded
            </span>
          } @else {
            <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
              Not uploaded
            </span>
          }
        </ng-template>

        <ng-template #actionTemplate let-doc>
          <div class="flex items-center gap-1.5 justify-center">
            @if (doc.status === 'uploaded') {
              <button appButton variant="ghost" size="sm" iconOnly (click)="state.viewDoc(doc.fileName, doc.name, doc.fileSize)" title="View Document" aria-label="View Document">
                <app-icon name="eye" size="sm" />
              </button>
            }
            @if (isEditingDocs()) {
              @if (doc.status === 'uploaded') {
                <button appButton variant="secondary" size="sm" (click)="replaceInput.click()">
                  Replace
                </button>
                <input #replaceInput type="file" (change)="onFileChange($event, doc)" class="hidden" [accept]="accept" />
              } @else {
                <button appButton size="sm" (click)="uploadInput.click()">
                  Upload
                </button>
                <input #uploadInput type="file" (change)="onFileChange($event, doc)" class="hidden" [accept]="accept" />
              }
            }
          </div>
        </ng-template>
      </section>

      <!-- ====================================================================
           STATUTORY UNDERTAKING & SELF-DECLARATION
           ==================================================================== -->
      <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs text-amber-900">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            [ngModel]="state.declarationAgreed()"
            (ngModelChange)="state.declarationAgreed.set($event)"
            class="mt-1 w-4 h-4 text-navy border-amber-300 rounded focus:ring-navy accent-navy"
          />
          <div class="leading-relaxed">
            <span class="font-bold text-slate-900 block mb-0.5">Statutory Self-Declaration &amp; Undertaking:</span>
            <span class="text-slate-700">
              I/We hereby declare that all information furnished and documents submitted are true, authentic, and correct to the best of my knowledge and belief. I understand that any deliberate misrepresentation shall lead to immediate disqualification of the EOI application and forfeiture of the Earnest Money Deposit (EMD).
            </span>
          </div>
        </label>
      </div>

      <!-- ====================================================================
           FOOTER ACTION BAR
           ==================================================================== -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(2)">
          &larr; Back to Upload Documents
        </button>

        <button appButton size="lg" (click)="state.goToStep(4)" [disabled]="!state.declarationAgreed()">
          Proceed to Processing Fee Payment ({{ state.formattedProcessFee() }}) &rarr;
        </button>
      </div>

    </div>
  `
})
export class Step4CompletePreviewComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly isEditingDocs = signal<boolean>(false);
  protected readonly accept = DOC_ACCEPT;
  protected readonly errors = signal<Record<number, string>>({});

  get authPersonFullName(): string {
    const s = this.state.editableStep3;
    if (s.name?.trim()) return s.name.trim();
    const parts = [s.firstName?.trim(), s.lastName?.trim()].filter(Boolean);
    return parts.length ? parts.join(' ') : '-';
  }

  get authPersonDocNumber(): string {
    const s = this.state.editableStep3;
    return s.identityDocNumber || s.aadhaarNo || s.pan || s.voterIdNo || s.bhamashahNo || s.passportNo || '-';
  }

  protected readonly documentColumns: TableColumn<EoiDocumentItem>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Supporting Document', type: 'custom' },
    { key: 'fileName', label: 'File Name', cellClass: 'break-all' },
    { key: 'fileSize', label: 'Size', cellClass: 'whitespace-nowrap' },
    { key: 'comment', label: 'Comment', type: 'custom' },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center' }
  ];

  protected readonly annexureColumns: TableColumn<EoiDocumentItem>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Annexure Name', type: 'custom' },
    { key: 'fileName', label: 'File Name', cellClass: 'break-all' },
    { key: 'fileSize', label: 'Size', cellClass: 'whitespace-nowrap' },
    { key: 'comment', label: 'Comment', type: 'custom' },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center' }
  ];

  protected toggleDocEdit(): void {
    this.isEditingDocs.update(val => !val);
  }

  protected onFileChange(event: Event, doc: EoiDocumentItem): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const error = validateDocFile(file);
    if (error) {
      this.setError(doc.id, error);
      input.value = '';
      return;
    }

    this.setError(doc.id, null);
    this.state.onFileSelected(event, doc);
  }

  private setError(id: number, message: string | null): void {
    this.errors.update(current => {
      const next = { ...current };
      if (message) {
        next[id] = message;
      } else {
        delete next[id];
      }
      return next;
    });
  }
}

