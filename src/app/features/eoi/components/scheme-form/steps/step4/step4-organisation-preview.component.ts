import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../../../shared';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: read-only organisation summary. */
@Component({
  selector: 'app-step4-organisation-preview',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
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

        <!-- Uploaded registration documents (file names only) -->
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
  `
})
export class Step4OrganisationPreviewComponent {
  protected readonly state = inject(SchemeFormState);
}
