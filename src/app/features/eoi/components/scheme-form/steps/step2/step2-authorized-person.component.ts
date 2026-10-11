import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 2: authorised signatory details and documents (editable). */
@Component({
  selector: 'app-step2-authorized-person',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="space-y-4 pt-6 border-t border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <h4 class="text-sm sm:text-base font-bold text-navy uppercase tracking-wide m-0">
          2. AUTHORIZED SIGNATORY / PERSON DETAILS
        </h4>
        <span class="text-xs text-slate-500 font-semibold">Designated Signatory</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">FULL NAME</label>
          <input type="text" [(ngModel)]="state.editableStep3.name" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Signatory Full Name" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DESIGNATION</label>
          <input type="text" [(ngModel)]="state.editableStep3.designation" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="e.g. Director" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DATE OF BIRTH / AGE</label>
          <input type="text" [(ngModel)]="state.editableStep3.dob" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="DD/MM/YYYY" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICIAL MOBILE NO.</label>
          <input type="text" [(ngModel)]="state.editableStep3.mobileNo" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Mobile Number" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICIAL EMAIL-ID</label>
          <input type="email" [(ngModel)]="state.editableStep3.emailId" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Official Email" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">PAN</label>
          <input type="text" [(ngModel)]="state.editableStep3.pan" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Signatory PAN" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">AADHAAR NUMBER</label>
          <input type="text" [(ngModel)]="state.editableStep3.aadhaarNo" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="XXXX-XXXX-XXXX" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">STATE</label>
          <input type="text" [(ngModel)]="state.editableStep3.state" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="State" />
        </div>

        <div class="sm:col-span-2 lg:col-span-4">
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">RESIDENCE ADDRESS</label>
          <textarea [(ngModel)]="state.editableStep3.residenceAddress" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Complete Residential Address"></textarea>
        </div>
      </div>

      <!-- Attached Signatory Documents -->
      <div class="pt-3 border-t border-slate-100">
        <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
          ATTACHED SIGNATORY DOCUMENTS
        </span>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <!-- Doc 1: Authorization Letter / Resolution -->
          @if (state.editableStep3.authorizationLetterDoc && state.editableStep3.authorizationLetterDoc.status === 'uploaded') {
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                </svg>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Authorization Letter / Board Resolution</span>
                  <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep3.authorizationLetterDoc.fileName }}">
                    {{ state.editableStep3.authorizationLetterDoc.fileName }}
                  </span>
                  <div class="mt-0.5">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {{ state.editableStep3.authorizationLetterDoc.fileSize || '1.1 MB' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  (click)="state.viewDoc(state.editableStep3.authorizationLetterDoc.fileName, 'Authorization Letter / Resolution', state.editableStep3.authorizationLetterDoc.fileSize || '1.1 MB')"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean hover:text-ocean-dark bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                  title="Preview Document"
                >
                  <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
                </button>
                <label
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                  title="Change Document"
                >
                  <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Change</span>
                  <input type="file" (change)="state.replaceOtrDoc($event, 'authLetter')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                </label>
                <button
                  type="button"
                  (click)="state.removeOtrDoc('authLetter')"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="Remove Document"
                >
                  <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          } @else {
            <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <span class="text-xs text-slate-500 font-medium">Authorization Letter / Board Resolution</span>
              <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Document</span>
                <input type="file" (change)="state.replaceOtrDoc($event, 'authLetter')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>
          }

          <!-- Doc 2: Identity Proof -->
          @if (state.editableStep3.idProofDoc && state.editableStep3.idProofDoc.status === 'uploaded') {
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                </svg>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Signatory Identity Proof</span>
                  <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep3.idProofDoc.fileName }}">
                    {{ state.editableStep3.idProofDoc.fileName }}
                  </span>
                  <div class="mt-0.5">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {{ state.editableStep3.idProofDoc.fileSize || '780 KB' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  (click)="state.viewDoc(state.editableStep3.idProofDoc.fileName, 'Signatory Identity Proof', state.editableStep3.idProofDoc.fileSize || '780 KB')"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean hover:text-ocean-dark bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                  title="Preview Document"
                >
                  <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
                </button>
                <label
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                  title="Change Document"
                >
                  <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Change</span>
                  <input type="file" (change)="state.replaceOtrDoc($event, 'authIdProof')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                </label>
                <button
                  type="button"
                  (click)="state.removeOtrDoc('authIdProof')"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="Remove Document"
                >
                  <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          } @else {
            <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <span class="text-xs text-slate-500 font-medium">Signatory Identity Proof</span>
              <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Document</span>
                <input type="file" (change)="state.replaceOtrDoc($event, 'authIdProof')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>
          }

        </div>
      </div>

    </div>
  `
})
export class Step2AuthorizedPersonComponent {
  protected readonly state = inject(SchemeFormState);
}
