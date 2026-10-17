import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmittedTender } from '../../../core/models/tender.model';
import { TenderDocCardComponent, TenderDocReplaceRequest, TenderDocViewRequest } from './tender-doc-card.component';

// Default change detection: the parent replaces documents inside the passed tender object in place while editing.
@Component({
  selector: 'app-tender-signatory-section',
  standalone: true,
  imports: [FormsModule, TenderDocCardComponent],
  host: { class: 'block' },
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">2</span>
        <h2 class="text-base sm:text-lg font-bold text-slate-900 m-0">Authorized Person Details</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Full Name</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.name || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Designation</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.designation || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Date of Birth / Age</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.dob || '-' }} ({{ app().signatoryDetails.age || '42' }} Yrs)</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">PAN</span><span class="font-mono text-slate-900 font-medium">{{ app().signatoryDetails.pan || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Mobile No.</span><span class="font-mono text-slate-900">{{ app().signatoryDetails.mobileNo || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Email Address</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.emailId || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Aadhaar No.</span><span class="font-mono text-slate-900">{{ app().signatoryDetails.aadhaarNo || '-' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">Voter ID / Bhamashah No.</span><span class="font-mono text-slate-900">{{ app().signatoryDetails.voterIdNo || app().signatoryDetails.bhamashahNo || 'Not Provided' }}</span></div>
        <div><span class="text-slate-500 block text-[11px] mb-0.5">State</span><span class="font-medium text-slate-900">{{ app().signatoryDetails.state || 'Rajasthan' }}</span></div>
        <div class="col-span-2 sm:col-span-3"><span class="text-slate-500 block text-[11px] mb-0.5">Residential Address</span><span class="text-slate-900 leading-relaxed">{{ app().signatoryDetails.residenceAddress || '-' }}</span></div>
      </div>

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