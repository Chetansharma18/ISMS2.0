import { Component, inject } from '@angular/core';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 4: read-only authorised signatory summary. */
@Component({
  selector: 'app-step4-authorized-person-preview',
  standalone: true,
  host: { class: 'block' },
  template: `
    <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">3</span>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Authorized Signatory</h2>
        </div>
        <button
          type="button"
          (click)="state.goToStep(2)"
          class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          Edit Details
        </button>
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
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ state.editableStep3.pan || '-' }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Mobile No.</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ state.editableStep3.mobileNo || '-' }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ state.editableStep3.emailId || '-' }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Aadhaar No.</span>
          <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ state.editableStep3.aadhaarNo || '-' }}</span>
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

        <!-- Uploaded signatory documents (file names only) -->
        @if (state.editableStep3.authorizationLetterDoc?.status === 'uploaded' || state.editableStep3.idProofDoc?.status === 'uploaded') {
          <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100 space-y-1.5">
            @if (state.editableStep3.authorizationLetterDoc; as doc) {
              @if (doc.status === 'uploaded') {
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <span class="text-slate-500 text-[11.5px]">Authorization Letter: </span>
                    <span class="font-medium text-slate-900 text-[12.5px] break-all">{{ doc.fileName }}</span>
                  </div>
                  <button type="button" (click)="state.viewDoc(doc.fileName, 'Authorization Letter', doc.fileSize)" class="text-ocean font-semibold text-xs hover:underline cursor-pointer shrink-0">View</button>
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
                  <button type="button" (click)="state.viewDoc(doc.fileName, 'Signatory Identity Proof', doc.fileSize)" class="text-ocean font-semibold text-xs hover:underline cursor-pointer shrink-0">View</button>
                </div>
              }
            }
          </div>
        }
      </div>
    </section>
  `
})
export class Step4AuthorizedPersonPreviewComponent {
  protected readonly state = inject(SchemeFormState);
}
