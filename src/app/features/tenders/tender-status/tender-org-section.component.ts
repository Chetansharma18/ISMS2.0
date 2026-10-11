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
        <h3 class="font-semibold text-slate-900 text-sm">
          1. Organisation Details &amp; Legal Registration
        </h3>
        @if (isEditing()) {
          <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
        }
      </div>

      @if (isEditing() && editable(); as ed) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div class="sm:col-span-2">
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation Name *</label>
            <input type="text" [(ngModel)]="ed.orgDetails.fullName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Nature of Entity *</label>
            <input type="text" [(ngModel)]="ed.orgDetails.natureOfEntity" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Registration No. (CIN / Reg. No.) *</label>
            <input type="text" [(ngModel)]="ed.orgDetails.registrationNumber" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Date of Registration *</label>
            <input type="text" [(ngModel)]="ed.orgDetails.dateOfRegistration" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">State / UT of Registration *</label>
            <input type="text" [(ngModel)]="ed.orgDetails.stateOfLegalReg" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation PAN *</label>
            <input type="text" [(ngModel)]="ed.orgDetails.companyPan" class="w-full px-2.5 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">GST Registered *</label>
            <select [(ngModel)]="ed.orgDetails.gstRegistered" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">GSTIN</label>
            <input type="text" [(ngModel)]="ed.orgDetails.gstin" [disabled]="ed.orgDetails.gstRegistered !== 'Yes'" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">MSME / Udyam Registered *</label>
            <select [(ngModel)]="ed.orgDetails.msmeRegistered" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Udyam Registration Number</label>
            <input type="text" [(ngModel)]="ed.orgDetails.udyamNumber" [disabled]="ed.orgDetails.msmeRegistered !== 'Yes'" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">NSDC Partner</label>
            <input type="text" [(ngModel)]="ed.orgDetails.nsdcPartner" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation Contact No. *</label>
            <input type="text" [(ngModel)]="ed.orgDetails.contactNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation Email ID *</label>
            <input type="email" [(ngModel)]="ed.orgDetails.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Website</label>
            <input type="text" [(ngModel)]="ed.orgDetails.website" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div class="sm:col-span-2 lg:col-span-3">
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Registered Address *</label>
            <textarea [(ngModel)]="ed.orgDetails.registeredAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
          </div>
          <div class="sm:col-span-2 lg:col-span-3">
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Office Address *</label>
            <textarea [(ngModel)]="ed.orgDetails.officeAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
          <div class="sm:col-span-2"><span class="text-slate-500 block text-[11px] mb-0.5">Organisation Name</span><span class="font-medium text-slate-900">{{ app().orgDetails.fullName || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Nature of Entity</span><span class="font-medium text-slate-900">{{ app().orgDetails.natureOfEntity || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">CIN / Reg No</span><span class="font-mono text-slate-900 font-medium">{{ app().orgDetails.registrationNumber || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Date of Registration</span><span class="font-medium text-slate-900">{{ app().orgDetails.dateOfRegistration || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">State / UT of Registration</span><span class="font-medium text-slate-900">{{ app().orgDetails.stateOfLegalReg || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Organisation PAN</span><span class="font-mono text-slate-900 font-medium">{{ app().orgDetails.companyPan || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">GST Registered</span><span class="font-mono text-slate-900">{{ app().orgDetails.gstRegistered === 'Yes' ? (app().orgDetails.gstin || 'Yes') : 'No' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">MSME / Udyam Registered</span><span class="font-mono text-slate-900">{{ app().orgDetails.msmeRegistered === 'Yes' ? (app().orgDetails.udyamNumber || 'Yes') : 'No' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">NSDC Partner</span><span class="font-medium text-slate-900">{{ app().orgDetails.nsdcPartner || 'Not Applicable' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Organisation Contact No.</span><span class="font-mono text-slate-900">{{ app().orgDetails.contactNo || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Organisation Email ID</span><span class="font-medium text-slate-900">{{ app().orgDetails.emailId || '-' }}</span></div>
          <div class="sm:col-span-2"><span class="text-slate-500 block text-[11px] mb-0.5">Website</span><span class="font-medium text-brand">{{ app().orgDetails.website || '-' }}</span></div>
          <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Registered Address</span><span class="text-slate-900 leading-relaxed">{{ app().orgDetails.registeredAddress || '-' }}</span></div>
          <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Office Address</span><span class="text-slate-900 leading-relaxed">{{ app().orgDetails.officeAddress || '-' }}</span></div>
        </div>
      }

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