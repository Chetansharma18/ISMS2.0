import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderDocCardComponent, TenderDocReplaceRequest, TenderDocViewRequest } from './tender-doc-card.component';

@Component({
  selector: 'app-tender-org-section',
  standalone: true,
  imports: [FormsModule, TenderDocCardComponent],
  host: { class: 'block' },
  template: `
    <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <h3 class="font-semibold text-slate-900 text-sm">
            Step 1: OTR Profile - Organisation Details &amp; Legal Registration
          </h3>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Short Name</span><span class="font-medium text-slate-900">{{ app().orgDetails.shortName || app().orgDetails.fullName || '-' }}</span></div>
        <div class="sm:col-span-2"><span class="text-slate-500 block text-[11px] mb-0.5">Full Name of Organisation</span><span class="font-medium text-slate-900">{{ app().orgDetails.fullName || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Nature of Entity</span><span class="font-medium text-slate-900">{{ app().orgDetails.natureOfEntity || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Registration Number (CIN)</span><span class="font-mono text-slate-900 font-medium">{{ app().orgDetails.registrationNumber || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Date of Registration</span><span class="font-medium text-slate-900">{{ app().orgDetails.dateOfRegistration || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">State / UT of Registration</span><span class="font-medium text-slate-900">{{ app().orgDetails.stateOfLegalReg || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Company PAN</span><span class="font-mono text-slate-900 font-medium">{{ app().orgDetails.companyPan || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">GST Registered</span><span class="font-mono text-slate-900">{{ app().orgDetails.gstRegistered === 'Yes' ? ('Yes (' + (app().orgDetails.gstin || '') + ')') : 'No' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">MSME / Udyam Registered</span><span class="font-mono text-slate-900">{{ app().orgDetails.msmeRegistered === 'Yes' ? ('Yes (' + (app().orgDetails.udyamNumber || '') + ')') : 'No' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">NSDC Partner Status</span><span class="font-medium text-slate-900">{{ app().orgDetails.nsdcPartner || 'Not Applicable' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Company Contact No.</span><span class="font-mono text-slate-900">{{ app().orgDetails.contactNo || '-' }}</span></div>
        <div class="sm:col-span-2"><span class="text-slate-500 block text-[11px] mb-0.5">Company Email-ID</span><span class="font-medium text-slate-900">{{ app().orgDetails.emailId || '-' }}</span></div>
        <div class="sm:col-span-2"><span class="text-slate-500 block text-[11px] mb-0.5">Website</span><span class="font-medium text-brand">{{ app().orgDetails.website || '-' }}</span></div>
        <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Registered Address</span><span class="text-slate-900 leading-relaxed">{{ app().orgDetails.registeredAddress || '-' }}</span></div>
        <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Office Address</span><span class="text-slate-900 leading-relaxed">{{ app().orgDetails.officeAddress || '-' }}</span></div>
      </div>

      <!-- Attached Registration Documents -->
      <div class="pt-3 border-t border-slate-200 space-y-2.5">
        <span class="text-xs font-semibold text-slate-700 block">
          Attached Registration Documents
        </span>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <!-- Incorporation Certificate -->
          <app-tender-doc-card
            [doc]="app().orgDetails.registrationCertDoc"
            fallbackName="Incorporation_Cert.pdf"
            fallbackSize="1.4 MB"
            viewTitle="Certificate of Registration"
            [isEditing]="isEditing()"
            (view)="viewDoc.emit($event)"
            (replace)="replaceOtrDoc.emit({ event: $event, docType: 'regCert' })"
          />

          <!-- Organisation PAN Card -->
          <app-tender-doc-card
            [doc]="app().orgDetails.panCardDoc"
            fallbackName="Company_PAN.pdf"
            fallbackSize="820 KB"
            viewTitle="Organisation PAN Card"
            [isEditing]="isEditing()"
            (view)="viewDoc.emit($event)"
            (replace)="replaceOtrDoc.emit({ event: $event, docType: 'panCard' })"
          />

          <!-- GST Certificate -->
          <app-tender-doc-card
            [doc]="app().orgDetails.gstCertDoc"
            fallbackName="GST_Cert.pdf"
            fallbackSize="910 KB"
            viewTitle="GST Certificate"
            [isEditing]="isEditing()"
            (view)="viewDoc.emit($event)"
            (replace)="replaceOtrDoc.emit({ event: $event, docType: 'gstCert' })"
          />

          <!-- Udyam MSME Certificate -->
          <app-tender-doc-card
            [doc]="app().orgDetails.msmeCertDoc"
            fallbackName="Udyam_Cert.pdf"
            fallbackSize="650 KB"
            viewTitle="Udyam Certificate"
            [isEditing]="isEditing()"
            (view)="viewDoc.emit($event)"
            (replace)="replaceOtrDoc.emit({ event: $event, docType: 'msmeCert' })"
          />
        </div>
      </div>
    </div>
  `
})
export class TenderOrgSectionComponent {
  readonly app = input.required<SubmittedTender>();
  /** Parent-owned deep clone being edited; fields are bound directly with ngModel. */
  readonly editable = input<SubmittedTender | null>(null);
  readonly isEditing = input(false);

  readonly viewDoc = output<TenderDocViewRequest>();
  readonly replaceOtrDoc = output<TenderDocReplaceRequest>();
}