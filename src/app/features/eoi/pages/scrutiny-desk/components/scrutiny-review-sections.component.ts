import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../../shared';
import type { ApplicantResponse, DossierDocument } from '../../../services/eoi-state.service';

/**
 * The applicant's submitted details in collapsible dropdown cards:
 * organisation, authorized person, bank account and uploaded documents.
 */
@Component({
  selector: 'app-scrutiny-review-sections',
  standalone: true,
  imports: [ButtonComponent, IconComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-4' },
  template: `
    @if (applicant(); as app) {
      <div class="flex items-center justify-end pb-1">
        <button
          type="button"
          (click)="toggleAll()"
          class="text-xs text-navy hover:text-sky-700 font-semibold flex items-center gap-1.5 cursor-pointer select-none bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/80 rounded-md px-2.5 py-1 transition-colors"
        >
          <app-icon [name]="allOpen() ? 'chevron-up' : 'chevron-down'" size="xs" />
          <span>{{ allOpen() ? 'Collapse All Sections' : 'Expand All Sections' }}</span>
        </button>
      </div>

      <!-- 1. Organisation Details -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden" aria-labelledby="org-heading">
        <button
          type="button"
          (click)="toggleSection(1)"
          class="w-full bg-slate-50/80 hover:bg-slate-100/80 px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group focus:outline-none"
          [class.border-b]="isOrgOpen()"
          [class.border-slate-200]="isOrgOpen()"
          [attr.aria-expanded]="isOrgOpen()"
        >
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">1</span>
            <h2 id="org-heading" class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-navy transition-colors m-0">
              Organisation Details
            </h2>
          </div>
          <div class="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <span class="hidden sm:inline">{{ isOrgOpen() ? 'Hide Details' : 'View Details' }}</span>
            <app-icon
              name="chevron-down"
              size="md"
              class="text-slate-400 group-hover:text-slate-600 transition-transform duration-200"
              [class.rotate-180]="isOrgOpen()"
            />
          </div>
        </button>

        @if (isOrgOpen()) {
          <div class="p-5 sm:p-6 animate-in fade-in duration-150">
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
          </div>
        }
      </section>

      <!-- 2. Authorized Person Details -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden" aria-labelledby="signatory-heading">
        <button
          type="button"
          (click)="toggleSection(2)"
          class="w-full bg-slate-50/80 hover:bg-slate-100/80 px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group focus:outline-none"
          [class.border-b]="isSignatoryOpen()"
          [class.border-slate-200]="isSignatoryOpen()"
          [attr.aria-expanded]="isSignatoryOpen()"
        >
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">2</span>
            <h2 id="signatory-heading" class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-navy transition-colors m-0">
              Authorized Person Details
            </h2>
          </div>
          <div class="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <span class="hidden sm:inline">{{ isSignatoryOpen() ? 'Hide Details' : 'View Details' }}</span>
            <app-icon
              name="chevron-down"
              size="md"
              class="text-slate-400 group-hover:text-slate-600 transition-transform duration-200"
              [class.rotate-180]="isSignatoryOpen()"
            />
          </div>
        </button>

        @if (isSignatoryOpen()) {
          <div class="p-5 sm:p-6 animate-in fade-in duration-150">
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
          </div>
        }
      </section>

      <!-- 3. Bank Details -->
      @if (app.bankDetails; as bank) {
        <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden" aria-labelledby="bank-heading">
          <button
            type="button"
            (click)="toggleSection(3)"
            class="w-full bg-slate-50/80 hover:bg-slate-100/80 px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group focus:outline-none"
            [class.border-b]="isBankOpen()"
            [class.border-slate-200]="isBankOpen()"
            [attr.aria-expanded]="isBankOpen()"
          >
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">3</span>
              <h2 id="bank-heading" class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-navy transition-colors m-0">
                Bank Details
              </h2>
            </div>
            <div class="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <span class="hidden sm:inline">{{ isBankOpen() ? 'Hide Details' : 'View Details' }}</span>
              <app-icon
                name="chevron-down"
                size="md"
                class="text-slate-400 group-hover:text-slate-600 transition-transform duration-200"
                [class.rotate-180]="isBankOpen()"
              />
            </div>
          </button>

          @if (isBankOpen()) {
            <div class="p-5 sm:p-6 animate-in fade-in duration-150">
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
            </div>
          }
        </section>
      }

      <!-- 4. Documents -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden" aria-labelledby="docs-heading">
        <div
          (click)="toggleSection(4)"
          class="w-full bg-slate-50/80 hover:bg-slate-100/80 px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none group focus:outline-none"
          [class.border-b]="isDocsOpen()"
          [class.border-slate-200]="isDocsOpen()"
          [attr.aria-expanded]="isDocsOpen()"
          role="button"
          tabindex="0"
          (keydown.enter)="toggleSection(4)"
          (keydown.space)="$event.preventDefault(); toggleSection(4)"
        >
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">4</span>
            <h2 id="docs-heading" class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-navy transition-colors m-0">
              Documents
            </h2>
            <span class="text-xs text-slate-500 font-normal">({{ app.uploadedDocuments.length }} Uploaded)</span>
          </div>

          <div class="flex items-center gap-3">
            <button
              appButton
              variant="outline"
              size="sm"
              type="button"
              (click)="$event.stopPropagation(); downloadZip.emit()"
              [disabled]="isDownloadingZip() || !app.uploadedDocuments.length"
              title="Download all documents as ZIP"
            >
              <app-icon name="download" size="sm" />
              <span>{{ isDownloadingZip() ? 'Preparing...' : 'Download All' }}</span>
            </button>

            <div class="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <span class="hidden sm:inline">{{ isDocsOpen() ? 'Hide' : 'View' }}</span>
              <app-icon
                name="chevron-down"
                size="md"
                class="text-slate-400 group-hover:text-slate-600 transition-transform duration-200"
                [class.rotate-180]="isDocsOpen()"
              />
            </div>
          </div>
        </div>

        @if (isDocsOpen()) {
          <div class="p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
            <app-table [columns]="documentColumns" [data]="app.uploadedDocuments" [customTemplates]="{ view: viewTemplate }">
            </app-table>

            <ng-template #viewTemplate let-doc>
              <button appButton variant="outline" size="sm" (click)="viewDoc.emit(doc)">View</button>
            </ng-template>
          </div>
        }
      </section>
    }
  `
})
export class ScrutinyReviewSectionsComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly isDownloadingZip = input(false);

  readonly viewDoc = output<DossierDocument>();
  readonly downloadZip = output<void>();

  readonly isOrgOpen = signal<boolean>(false);
  readonly isSignatoryOpen = signal<boolean>(false);
  readonly isBankOpen = signal<boolean>(false);
  readonly isDocsOpen = signal<boolean>(false);

  readonly allOpen = computed(() =>
    this.isOrgOpen() &&
    this.isSignatoryOpen() &&
    (this.applicant()?.bankDetails ? this.isBankOpen() : true) &&
    this.isDocsOpen()
  );

  toggleSection(sec: number): void {
    switch (sec) {
      case 1: this.isOrgOpen.update(v => !v); break;
      case 2: this.isSignatoryOpen.update(v => !v); break;
      case 3: this.isBankOpen.update(v => !v); break;
      case 4: this.isDocsOpen.update(v => !v); break;
    }
  }

  toggleAll(): void {
    const next = !this.allOpen();
    this.isOrgOpen.set(next);
    this.isSignatoryOpen.set(next);
    this.isBankOpen.set(next);
    this.isDocsOpen.set(next);
  }

  protected readonly documentColumns: TableColumn<DossierDocument>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'title', label: 'Document' },
    { key: 'view', label: 'Action', type: 'custom', align: 'center', width: 'w-28' }
  ];
}
