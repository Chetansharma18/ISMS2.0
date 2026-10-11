import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderDocCardComponent, TenderDocReplaceRequest, TenderDocViewRequest } from './tender-doc-card.component';

@Component({
  selector: 'app-tender-signatory-section',
  standalone: true,
  imports: [FormsModule, TenderDocCardComponent],
  host: { class: 'block' },
  template: `
    <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 class="font-semibold text-slate-900 text-sm">
          2. Authorized Person Details
        </h3>
        @if (isEditing()) {
          <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
        }
      </div>

      @if (isEditing() && editable(); as ed) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Full Name *</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.name" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Designation</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.designation" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Date of Birth *</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.dob" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Age</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.age" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">PAN *</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.pan" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Mobile No. *</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.mobileNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Email Address *</label>
            <input type="email" [(ngModel)]="ed.signatoryDetails.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Aadhaar No. (Optional)</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.aadhaarNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Bhamashah No. (Optional)</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.bhamashahNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Voter ID No. (Optional)</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.voterIdNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Passport No. (Optional)</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.passportNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="text-slate-600 block text-[11px] font-medium mb-1">State</label>
            <input type="text" [(ngModel)]="ed.signatoryDetails.state" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div class="sm:col-span-2 lg:col-span-4">
            <label class="text-slate-600 block text-[11px] font-medium mb-1">Residential Address</label>
            <textarea [(ngModel)]="ed.signatoryDetails.residenceAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Full Name</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.name || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Designation</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.designation || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Date of Birth / Age</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.dob || '-' }} ({{ app().signatoryDetails.age || '42' }} Yrs)</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">PAN</span><span class="font-mono text-slate-900 font-medium">{{ app().signatoryDetails.pan || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Mobile No.</span><span class="font-mono text-slate-900">{{ app().signatoryDetails.mobileNo || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Email Address</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.emailId || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">Aadhaar No.</span><span class="font-mono text-slate-900">{{ app().signatoryDetails.aadhaarNo || '-' }}</span></div>
          <div><span class="text-slate-500 block text-[11px] mb-0.5">State</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.state || 'Rajasthan' }}</span></div>
          <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Residential Address</span><span class="text-slate-900 leading-relaxed">{{ app().signatoryDetails.residenceAddress || '-' }}</span></div>
        </div>
      }

      <!-- Attached Signatory Documents -->
      <div class="pt-3 border-t border-slate-200 space-y-2.5">
        <span class="text-xs font-semibold text-slate-700 block">
          Attached Signatory Documents
        </span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Board Resolution -->
          <app-tender-doc-card
            [doc]="app().signatoryDetails.authorizationLetterDoc"
            fallbackName="Board_Resolution.pdf"
            fallbackSize="1.2 MB"
            viewTitle="Authorization Letter / Board Resolution"
            [isEditing]="isEditing()"
            (view)="viewDoc.emit($event)"
            (replace)="replaceOtrDoc.emit({ event: $event, docType: 'authLetter' })"
          />

          <!-- Signatory ID Proof -->
          <app-tender-doc-card
            [doc]="app().signatoryDetails.idProofDoc"
            fallbackName="Signatory_Aadhaar.pdf"
            fallbackSize="750 KB"
            viewTitle="Authorized Person Identity Proof"
            [isEditing]="isEditing()"
            (view)="viewDoc.emit($event)"
            (replace)="replaceOtrDoc.emit({ event: $event, docType: 'authIdProof' })"
          />
        </div>
      </div>
    </div>
  `
})
export class TenderSignatorySectionComponent {
  readonly app = input.required<SubmittedTender>();
  /** Parent-owned deep clone being edited; fields are bound directly with ngModel. */
  readonly editable = input<SubmittedTender | null>(null);
  readonly isEditing = input(false);

  readonly viewDoc = output<TenderDocViewRequest>();
  readonly replaceOtrDoc = output<TenderDocReplaceRequest>();
}