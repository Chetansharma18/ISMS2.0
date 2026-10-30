import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, TableColumn, TableComponent } from '../../../../../shared';
import { EoiDocumentItem } from '../scheme-form.model';
import { SchemeFormState } from '../scheme-form.state';
import { DOC_ACCEPT, validateDocFile } from './step3-document-rules';

/**
 * Step 4: Complete Application Preview
 *
 * Consolidates all applicant-submitted details (fee, verified profile, and proposal documents)
 * into a structured, read-only verification view before the applicant proceeds to EMD payment.
 * Profile sections are strictly read-only; document section allows replacement via the Edit option.
 */
@Component({
  selector: 'app-step4-complete-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="w-full space-y-4 font-sans">

      <!-- ====================================================================
           1. PROCESSING FEE STATUS
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Processing Fee</h2>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            Paid
          </span>
        </div>
        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Amount Paid</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.formattedProcessFee() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Paid On</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.procFeeDate() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Transaction ID</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">CIN-SBI-9912081</span>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           2. ORGANISATION DETAILS PREVIEW (Read-Only)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Organisation Details</h2>
          </div>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation Name</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.fullName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Nature of Entity</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.natureOfEntity || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Registration No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.registrationNumber || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Registration</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.dateOfRegistration || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State / UT</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.stateOfLegalReg || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">PAN</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.companyPan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GST Registered</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.gstRegistered || '-' }}</span>
          </div>

          @if (state.editableStep1.gstRegistered === 'Yes' && state.editableStep1.gstin) {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GSTIN</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.gstin }}</span>
            </div>
          }

          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MSME Registered</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.msmeRegistered || '-' }}</span>
          </div>

          @if (state.editableStep1.msmeRegistered === 'Yes' && state.editableStep1.udyamNumber) {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Udyam Registration No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.udyamNumber }}</span>
            </div>
          }

          @if (state.editableStep1.preferredSector) {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Preferred Sector</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.preferredSector }}</span>
            </div>
          }

          @if (state.editableStep1.nsdcPartner) {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">NSDC Partner</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep1.nsdcPartner }}</span>
            </div>
          }

          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Contact No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep1.contactNo || '-' }}</span>
          </div>

          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ state.editableStep1.emailId || '-' }}</span>
          </div>

          @if (state.editableStep1.website) {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Website</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ state.editableStep1.website }}</span>
            </div>
          }

          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Registered Address</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ state.registeredAddressText }}</span>
          </div>

          @if (!state.editableStep1.sameAsRegistered && state.editableStep1.officeAddress) {
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Office Address</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ state.officeAddressText }}</span>
            </div>
          }

          <!-- Uploaded registration documents -->
          @if (state.editableStep1.registrationCertDoc?.status === 'uploaded' || state.editableStep1.panCardDoc?.status === 'uploaded' || state.editableStep1.gstCertDoc?.status === 'uploaded' || state.editableStep1.msmeCertDoc?.status === 'uploaded') {
            <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100 space-y-1.5">
              @if (state.editableStep1.registrationCertDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <span class="text-slate-500 text-[11.5px]">Registration Certificate: </span>
                      <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                    </div>
                    <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Registration Certificate', doc.fileSize)">View</button>
                  </div>
                }
              }
              @if (state.editableStep1.panCardDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <span class="text-slate-500 text-[11.5px]">PAN Card: </span>
                      <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                    </div>
                    <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'PAN Card', doc.fileSize)">View</button>
                  </div>
                }
              }
              @if (state.editableStep1.gstCertDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <span class="text-slate-500 text-[11.5px]">GST Certificate: </span>
                      <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                    </div>
                    <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'GST Certificate', doc.fileSize)">View</button>
                  </div>
                }
              }
              @if (state.editableStep1.msmeCertDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <span class="text-slate-500 text-[11.5px]">Udyam Certificate: </span>
                      <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                    </div>
                    <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Udyam Certificate', doc.fileSize)">View</button>
                  </div>
                }
              }
            </div>
          }
        </div>
      </section>

      <!-- ====================================================================
           3. AUTHORIZED SIGNATORY PREVIEW (Read-Only)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Authorized Signatory</h2>
          </div>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Name</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep3.name || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Designation</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep3.designation || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Birth</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep3.dob || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">PAN</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep3.pan || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Mobile No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep3.mobileNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ state.editableStep3.emailId || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Aadhaar No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep3.aadhaarNo || '-' }}</span>
          </div>
          @if (state.editableStep3.state) {
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep3.state }}</span>
            </div>
          }
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Address</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ state.residenceAddressText }}</span>
          </div>

          <!-- Uploaded signatory documents -->
          @if (state.editableStep3.authorizationLetterDoc?.status === 'uploaded' || state.editableStep3.idProofDoc?.status === 'uploaded') {
            <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100 space-y-1.5">
              @if (state.editableStep3.authorizationLetterDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <span class="text-slate-500 text-[11.5px]">Authorization Letter: </span>
                      <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                    </div>
                    <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Authorization Letter', doc.fileSize)">View</button>
                  </div>
                }
              }
              @if (state.editableStep3.idProofDoc; as doc) {
                @if (doc.status === 'uploaded') {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <span class="text-slate-500 text-[11.5px]">Identity Proof: </span>
                      <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                    </div>
                    <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Signatory Identity Proof', doc.fileSize)">View</button>
                  </div>
                }
              }
            </div>
          }
        </div>
      </section>

      <!-- ====================================================================
           4. BANK DETAILS PREVIEW (Read-Only)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Organisation Bank Details</h2>
          </div>
        </div>

        <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Bank</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.bankName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Branch</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.branchName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Holder</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.editableStep4.accountHolderName || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account No.</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep4.accountNo || '-' }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">IFSC</span>
            <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ state.editableStep4.ifscCode || '-' }}</span>
          </div>

          @if (state.editableStep4.cancelledChequeDoc; as doc) {
            @if (doc.status === 'uploaded') {
              <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <span class="text-slate-500 text-[11.5px]">Cancelled Cheque / Passbook: </span>
                    <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                  </div>
                  <button appButton variant="ghost" size="sm" class="shrink-0" (click)="state.viewDoc(doc.fileName, 'Cancelled Cheque', doc.fileSize)">View</button>
                </div>
              </div>
            }
          }
        </div>
      </section>

      <!-- ====================================================================
           5. PROPOSAL DOCUMENTS TABLE PREVIEW (Replace only on Edit)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">5</span>
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

        <div class="p-4 sm:p-5">
          @if (isEditingDocs()) {
            <div class="mb-3.5 p-3 bg-sky-50/80 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-center justify-between gap-3">
              <span>Replace mode active: click <strong>Replace</strong> against any document to upload a replacement file.</span>
              <button appButton variant="primary" size="sm" (click)="toggleDocEdit()">Done</button>
            </div>
          }

          <app-table
            [columns]="documentColumns"
            [data]="state.eoiDocuments()"
            [customTemplates]="{ name: nameTemplate, status: statusTemplate, action: actionTemplate }"
          >
          </app-table>
        </div>

        <ng-template #nameTemplate let-doc>
          <span class="font-medium text-slate-900 text-[12.5px]">{{ doc.name }}</span>
          @if (doc.isMandatory) {
            <span class="text-rose-600 font-bold" title="Mandatory"> *</span>
          }
          @if (errors()[doc.id]) {
            <p class="text-[11.5px] text-red-600 m-0 mt-1" role="alert">{{ errors()[doc.id] }}</p>
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
              <button appButton variant="ghost" size="sm" (click)="state.viewDoc(doc.fileName, doc.name, doc.fileSize)">
                View
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
        <button appButton variant="outline" size="lg" (click)="state.goToStep(3)">
          &larr; Back to Upload Documents
        </button>

        <button appButton size="lg" (click)="state.goToStep(5)" [disabled]="!state.declarationAgreed()">
          Proceed to EMD Fee Payment ({{ state.formattedEmdFee() }}) &rarr;
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

  protected readonly documentColumns: TableColumn<EoiDocumentItem>[] = [
    { key: 'id', label: '#', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Document Name', type: 'custom' },
    { key: 'fileName', label: 'File Name', cellClass: 'break-all' },
    { key: 'fileSize', label: 'Size', cellClass: 'whitespace-nowrap' },
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

