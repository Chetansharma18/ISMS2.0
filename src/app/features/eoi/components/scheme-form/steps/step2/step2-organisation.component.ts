import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchemeFormState } from '../../scheme-form.state';

/** Step 2: company particulars and registration documents (editable). */
@Component({
  selector: 'app-step2-organisation',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'block' },
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <h4 class="text-sm sm:text-base font-bold text-navy uppercase tracking-wide m-0">
          1. COMPANY PARTICULARS &amp; REGISTRATION DETAILS
        </h4>
        <span class="text-xs text-slate-500 font-mono font-semibold">CIN: {{ state.editableStep1.registrationNumber || '-' }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NAME (SHORT NAME)</label>
          <input type="text" [(ngModel)]="state.editableStep1.shortName" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="e.g. SVEPL" />
        </div>

        <div class="sm:col-span-2">
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">FULL NAME OF ORGANIZATION</label>
          <input type="text" [(ngModel)]="state.editableStep1.fullName" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Full Legal Name" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NATURE OF ENTITY</label>
          <input type="text" [(ngModel)]="state.editableStep1.natureOfEntity" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="e.g. Private Limited Company" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">REGISTRATION NUMBER (CIN)</label>
          <input type="text" [(ngModel)]="state.editableStep1.registrationNumber" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="CIN Number" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DATE OF REGISTRATION</label>
          <input type="text" [(ngModel)]="state.editableStep1.dateOfRegistration" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="DD/MM/YYYY" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">STATE / UT OF REGISTRATION</label>
          <input type="text" [(ngModel)]="state.editableStep1.stateOfLegalReg" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="State" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY PAN</label>
          <input type="text" [(ngModel)]="state.editableStep1.companyPan" class="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Company PAN" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">GST REGISTERED</label>
          <select [(ngModel)]="state.editableStep1.gstRegistered" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">GSTIN</label>
          <input type="text" [(ngModel)]="state.editableStep1.gstin" [disabled]="state.editableStep1.gstRegistered !== 'Yes'" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-navy" placeholder="15-digit GSTIN" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">MSME / UDYAM REGISTERED</label>
          <select [(ngModel)]="state.editableStep1.msmeRegistered" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">UDYAM REGISTRATION NO.</label>
          <input type="text" [(ngModel)]="state.editableStep1.udyamNumber" [disabled]="state.editableStep1.msmeRegistered !== 'Yes'" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-navy" placeholder="UDYAM-RJ-XX-XXXXXXX" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NSDC PARTNER STATUS</label>
          <select [(ngModel)]="state.editableStep1.nsdcPartner" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY CONTACT NO.</label>
          <input type="text" [(ngModel)]="state.editableStep1.contactNo" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Phone number" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY EMAIL-ID</label>
          <input type="email" [(ngModel)]="state.editableStep1.emailId" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Official email" />
        </div>

        <div>
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">WEBSITE</label>
          <input type="text" [(ngModel)]="state.editableStep1.website" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="https://domain.com" />
        </div>

        <div class="sm:col-span-2 lg:col-span-3">
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">REGISTERED ADDRESS</label>
          <textarea [(ngModel)]="state.editableStep1.registeredAddress" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Complete Registered Address"></textarea>
        </div>

        <div class="sm:col-span-2 lg:col-span-3">
          <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICE ADDRESS</label>
          <textarea [(ngModel)]="state.editableStep1.officeAddress" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy" placeholder="Corporate / Branch Office Address"></textarea>
        </div>
      </div>

      <!-- Attached Registration Documents -->
      <div class="pt-3 border-t border-slate-100">
        <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
          ATTACHED REGISTRATION DOCUMENTS
        </span>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <!-- Doc 1: Certificate of Incorporation -->
          @if (state.editableStep1.registrationCertDoc && state.editableStep1.registrationCertDoc.status === 'uploaded') {
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                </svg>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Certificate of Incorporation</span>
                  <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep1.registrationCertDoc.fileName }}">
                    {{ state.editableStep1.registrationCertDoc.fileName }}
                  </span>
                  <div class="mt-0.5">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {{ state.editableStep1.registrationCertDoc.fileSize || '1.4 MB' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  (click)="state.viewDoc(state.editableStep1.registrationCertDoc.fileName, 'Certificate of Incorporation', state.editableStep1.registrationCertDoc.fileSize || '1.4 MB')"
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
                  <input type="file" (change)="state.replaceOtrDoc($event, 'regCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                </label>
                <button
                  type="button"
                  (click)="state.removeOtrDoc('regCert')"
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
              <span class="text-xs text-slate-500 font-medium">Certificate of Incorporation</span>
              <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Document</span>
                <input type="file" (change)="state.replaceOtrDoc($event, 'regCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>
          }

          <!-- Doc 2: Organization PAN Card -->
          @if (state.editableStep1.panCardDoc && state.editableStep1.panCardDoc.status === 'uploaded') {
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                </svg>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Organization PAN Card</span>
                  <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep1.panCardDoc.fileName }}">
                    {{ state.editableStep1.panCardDoc.fileName }}
                  </span>
                  <div class="mt-0.5">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {{ state.editableStep1.panCardDoc.fileSize || '840 KB' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  (click)="state.viewDoc(state.editableStep1.panCardDoc.fileName, 'Organization PAN Card', state.editableStep1.panCardDoc.fileSize || '840 KB')"
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
                  <input type="file" (change)="state.replaceOtrDoc($event, 'panCard')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                </label>
                <button
                  type="button"
                  (click)="state.removeOtrDoc('panCard')"
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
              <span class="text-xs text-slate-500 font-medium">Organization PAN Card</span>
              <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Document</span>
                <input type="file" (change)="state.replaceOtrDoc($event, 'panCard')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>
          }

          <!-- Doc 3: GST Certificate -->
          @if (state.editableStep1.gstCertDoc && state.editableStep1.gstCertDoc.status === 'uploaded') {
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                </svg>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">GST Certificate</span>
                  <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep1.gstCertDoc.fileName }}">
                    {{ state.editableStep1.gstCertDoc.fileName }}
                  </span>
                  <div class="mt-0.5">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {{ state.editableStep1.gstCertDoc.fileSize || '920 KB' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  (click)="state.viewDoc(state.editableStep1.gstCertDoc.fileName, 'GST Certificate', state.editableStep1.gstCertDoc.fileSize || '920 KB')"
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
                  <input type="file" (change)="state.replaceOtrDoc($event, 'gstCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                </label>
                <button
                  type="button"
                  (click)="state.removeOtrDoc('gstCert')"
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
              <span class="text-xs text-slate-500 font-medium">GST Certificate</span>
              <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Document</span>
                <input type="file" (change)="state.replaceOtrDoc($event, 'gstCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>
          }

          <!-- Doc 4: Udyam Certificate -->
          @if (state.editableStep1.msmeCertDoc && state.editableStep1.msmeCertDoc.status === 'uploaded') {
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                  <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                </svg>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Udyam Certificate</span>
                  <span class="font-medium text-slate-800 truncate text-xs" title="{{ state.editableStep1.msmeCertDoc.fileName }}">
                    {{ state.editableStep1.msmeCertDoc.fileName }}
                  </span>
                  <div class="mt-0.5">
                    <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {{ state.editableStep1.msmeCertDoc.fileSize || '650 KB' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  (click)="state.viewDoc(state.editableStep1.msmeCertDoc.fileName, 'Udyam Certificate', state.editableStep1.msmeCertDoc.fileSize || '650 KB')"
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
                  <input type="file" (change)="state.replaceOtrDoc($event, 'msmeCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                </label>
                <button
                  type="button"
                  (click)="state.removeOtrDoc('msmeCert')"
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
              <span class="text-xs text-slate-500 font-medium">Udyam Certificate</span>
              <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Document</span>
                <input type="file" (change)="state.replaceOtrDoc($event, 'msmeCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>
          }

        </div>
      </div>

    </div>
  `
})
export class Step2OrganisationComponent {
  protected readonly state = inject(SchemeFormState);
}
