import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AspirantRecord } from '../../models/aspirant.model';
import { ButtonComponent, IconComponent } from '../../../../shared';

/** View-mode card: identity details. */
@Component({
  selector: 'app-aspirant-identity-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent],
  template: `
    @let cand = aspirant();
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full"></span>
          <span>1. Identity details </span>
        </h2>
        <button
          appButton
          variant="ghost"
          size="sm"
          type="button"
          (click)="edit.emit()"
        >
          <span>Edit Section</span> &rarr;
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span class="text-slate-400 block text-[11px]">Full Name</span>
          <span class="font-bold text-slate-900 text-sm mt-0.5 block">{{ cand.aspirantName }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Aadhaar No. (Masked)</span>
          <span class="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{{ cand.aadhaarMasked }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Jan Aadhaar ID</span>
          <span class="font-mono font-semibold text-slate-800 text-sm mt-0.5 block">{{ cand.janaadhaarId || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Other ID ({{ cand.otherIdType || 'ID' }})</span>
          <span class="font-mono font-semibold text-slate-800 text-sm mt-0.5 block">{{ cand.otherIdNo || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Date of Birth (Age)</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.dob }} ({{ cand.age }} yrs)</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Gender / Relation</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.gender }} • {{ cand.relationType }}: {{ cand.relationName }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Mother's Name</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.motherName || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Education Qualification</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.educationalQualification }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Religion / Category</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.religion }} • {{ cand.category }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Minority / Special Ability</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.minority }} • Disability: {{ cand.specialAbility }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Area Type</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.areaType }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">Relocation / Out of Rajasthan</span>
          <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.interestedOutOfRajasthan || 'No' }}</span>
        </div>
        @if (cand.disabilityType) {
          <div>
            <span class="text-slate-400 block text-[11px]">Disability Type</span>
            <span class="font-semibold text-slate-800 mt-0.5 block">{{ cand.disabilityType }}</span>
          </div>
        }
        
        <!-- Aadhaar Document Proof: Preview only in View mode -->
        <div>
          <span class="text-slate-400 block text-[11px]">Aadhaar Proof Document</span>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="font-medium text-slate-800 text-xs truncate max-w-[160px]" [title]="cand.aadhaarDocName || 'Aadhaar_Document.pdf'">
              {{ cand.aadhaarDocName || 'Aadhaar_Document.pdf' }}
            </span>
            <button
              appButton
              variant="outline"
              size="sm"
              class="shrink-0"
              type="button"
              (click)="previewAadhaar.emit()"
              title="Preview Aadhaar Card"
            >
              <app-icon name="eye" size="sm" />
              <span>Preview</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AspirantIdentityViewComponent {
  readonly aspirant = input.required<AspirantRecord>();
  readonly edit = output<void>();
  readonly previewAadhaar = output<void>();
}