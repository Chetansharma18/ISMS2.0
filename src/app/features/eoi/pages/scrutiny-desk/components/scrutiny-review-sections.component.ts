import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../../shared';
import type { ApplicantResponse, DossierDocument } from '../../../services/eoi-state.service';

/**
 * The applicant's submitted details, in the same numbered-card style as the Tender Status page:
 * organisation, authorized person, bank account and uploaded documents.
 */
@Component({
  selector: 'app-scrutiny-review-sections',
  standalone: true,
  imports: [ButtonComponent, IconComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  template: `
    @if (applicant(); as app) {
      <!-- 1. Organisation -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="org-heading">
        <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">1</span>
          <h2 id="org-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Organisation Details</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11px] mb-0.5">Name of Organisation</span>
            <span class="font-medium text-slate-900">{{ app.organisation.legalName }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Nature of Entity</span>
            <span class="font-medium text-slate-900">{{ app.organisation.entityType }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Registration Number (CIN)</span>
            <span class="tabular-nums text-slate-900 font-medium">{{ app.organisation.registrationNumber }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Date of Registration</span>
            <span class="font-medium text-slate-900">{{ app.organisation.dateOfRegistration }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">State / UT of Registration</span>
            <span class="font-medium text-slate-900">{{ app.organisation.stateOfRegistration }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Company PAN</span>
            <span class="tabular-nums text-slate-900 font-medium">{{ app.organisation.panNumber }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">GSTIN</span>
            <span class="tabular-nums text-slate-900 font-medium">{{ app.organisation.gstin }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Declared Turnover</span>
            <span class="font-medium text-slate-900">{{ app.organisation.turnover }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Contact No.</span>
            <span class="tabular-nums text-slate-900">{{ app.organisation.contactNumber }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11px] mb-0.5">Email ID</span>
            <span class="font-medium text-slate-900">{{ app.organisation.email }}</span>
          </div>
          <div class="col-span-2 sm:col-span-3 lg:col-span-4">
            <span class="text-slate-500 block text-[11px] mb-0.5">Registered Address</span>
            <span class="text-slate-900 leading-relaxed">{{ app.organisation.registeredAddress }}</span>
          </div>
        </div>
      </section>

      <!-- 2. Authorized person -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="signatory-heading">
        <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">2</span>
          <h2 id="signatory-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Authorized Person Details</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Full Name</span>
            <span class="font-medium text-slate-900">{{ app.authorizedSignatory.name }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Designation</span>
            <span class="font-medium text-slate-900">{{ app.authorizedSignatory.designation }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">PAN</span>
            <span class="tabular-nums text-slate-900 font-medium">{{ app.authorizedSignatory.pan }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Aadhaar No.</span>
            <span class="tabular-nums text-slate-900">{{ app.authorizedSignatory.aadhaarNo }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Mobile No.</span>
            <span class="tabular-nums text-slate-900">{{ app.authorizedSignatory.contactNumber }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500 block text-[11px] mb-0.5">Email Address</span>
            <span class="font-medium text-slate-900">{{ app.authorizedSignatory.email }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">State</span>
            <span class="font-medium text-slate-900">{{ app.authorizedSignatory.state }}</span>
          </div>
          <div class="col-span-2 sm:col-span-3 lg:col-span-4">
            <span class="text-slate-500 block text-[11px] mb-0.5">Residential Address</span>
            <span class="text-slate-900 leading-relaxed">{{ app.authorizedSignatory.residenceAddress }}</span>
          </div>
        </div>
      </section>

      <!-- 3. Bank -->
      @if (app.bankDetails; as bank) {
        <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="bank-heading">
          <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">3</span>
            <h2 id="bank-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Bank Details</h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Name of the Bank</span>
              <span class="font-medium text-slate-900">{{ bank.bankName }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11px] mb-0.5">Branch</span>
              <span class="font-medium text-slate-900">{{ bank.branchName }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Account Type</span>
              <span class="font-medium text-slate-900">{{ bank.accountType }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11px] mb-0.5">Account Holder Name</span>
              <span class="font-medium text-slate-900">{{ bank.accountHolderName }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">Account Number</span>
              <span class="tabular-nums text-slate-900 font-medium">{{ bank.accountNumber }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11px] mb-0.5">IFSC Code</span>
              <span class="tabular-nums text-slate-900 font-medium">{{ bank.ifscCode }}</span>
            </div>
          </div>
        </section>
      }

      <!-- 4. Documents -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="docs-heading">
        <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">4</span>
            <h2 id="docs-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Documents</h2>
          </div>
          <button
            appButton
            variant="outline"
            size="sm"
            (click)="downloadZip.emit()"
            [disabled]="isDownloadingZip() || !app.uploadedDocuments.length"
          >
            <app-icon name="download" size="sm" />
            <span>{{ isDownloadingZip() ? 'Preparing...' : 'Download All' }}</span>
          </button>
        </div>

        <app-table [columns]="documentColumns" [data]="app.uploadedDocuments" [customTemplates]="{ view: viewTemplate }">
        </app-table>

        <ng-template #viewTemplate let-doc>
          <button appButton variant="outline" size="sm" (click)="viewDoc.emit(doc)">View</button>
        </ng-template>
      </section>
    }
  `
})
export class ScrutinyReviewSectionsComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly isDownloadingZip = input(false);

  readonly viewDoc = output<DossierDocument>();
  readonly downloadZip = output<void>();

  protected readonly documentColumns: TableColumn<DossierDocument>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'title', label: 'Document' },
    { key: 'view', label: 'Action', type: 'custom', align: 'center', width: 'w-28' }
  ];
}
