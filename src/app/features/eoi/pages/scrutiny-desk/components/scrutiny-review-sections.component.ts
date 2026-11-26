import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../../shared';
import type { ApplicantResponse, DossierDocument } from '../../../services/eoi-state.service';

/**
 * The applicant's submitted details: organisation, authorized person,
 * bank account and uploaded documents, rendered in a clean, professional
 * key-value typography layout without redundant nested borders or grey boxes.
 */
@Component({
  selector: 'app-scrutiny-review-sections',
  standalone: true,
  imports: [ButtonComponent, IconComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-6' },
  template: `
    @if (applicant(); as app) {

      <!-- 1. Organisation Details -->
      @if (activeSection() === 'all' || activeSection() === 'organisation') {
        <div class="space-y-6 animate-in fade-in duration-150">
          
          <!-- Sub-section 1: Entity Profile & Registration -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 pb-2 border-b border-slate-100 flex items-center gap-2">
              <app-icon name="building" size="xs" class="text-primary" />
              <span>Entity Profile &amp; Legal Registration</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Name of Organisation</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.organisation.legalName }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Trade / Operating Name</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.organisation.tradeName || app.organisation.legalName }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Nature of Entity</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.organisation.entityType }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Registration Number (CIN)</span>
                <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ app.organisation.registrationNumber }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Date of Registration</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.organisation.dateOfRegistration }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">State / UT of Registration</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.organisation.stateOfRegistration }}</span>
              </div>
            </div>
          </div>

          <!-- Sub-section 2: Tax & Statutory Credentials -->
          <div class="space-y-3 pt-2">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 pb-2 border-b border-slate-100 flex items-center gap-2">
              <app-icon name="document" size="xs" class="text-primary" />
              <span>Tax &amp; Statutory Credentials</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Company PAN</span>
                <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ app.organisation.panNumber }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">GSTIN</span>
                <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ app.organisation.gstin }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Declared Annual Turnover</span>
                <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ app.organisation.turnover }}</span>
              </div>
            </div>
          </div>

          <!-- Sub-section 3: Official Contact & Premises -->
          <div class="space-y-3 pt-2">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 pb-2 border-b border-slate-100 flex items-center gap-2">
              <app-icon name="info" size="xs" class="text-primary" />
              <span>Official Contact &amp; Premises</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Contact Number</span>
                <span class="text-sm font-semibold text-slate-900 block tabular-nums">{{ app.organisation.contactNumber }}</span>
              </div>
              <div class="sm:col-span-2">
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Official Email ID</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.organisation.email }}</span>
              </div>
              <div class="sm:col-span-3">
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Registered Address</span>
                <span class="text-sm font-normal text-slate-800 leading-relaxed block">{{ app.organisation.registeredAddress }}</span>
              </div>
              @if (app.organisation.operationalAddress && app.organisation.operationalAddress !== app.organisation.registeredAddress) {
                <div class="sm:col-span-3">
                  <span class="text-xs font-medium text-slate-500 block mb-0.5">Operational Office Address</span>
                  <span class="text-sm font-normal text-slate-800 leading-relaxed block">{{ app.organisation.operationalAddress }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- 2. Authorized Person Details -->
      @if (activeSection() === 'all' || activeSection() === 'signatory') {
        <div class="space-y-6 animate-in fade-in duration-150">
          
          <!-- Sub-section 1: Signatory Profile & Contact -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 pb-2 border-b border-slate-100 flex items-center gap-2">
              <app-icon name="user" size="xs" class="text-primary" />
              <span>Signatory Profile &amp; Contact</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Full Name</span>
                <span class="text-sm font-bold text-slate-900 block">{{ app.authorizedSignatory.name }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Designation</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.authorizedSignatory.designation }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Mobile Number</span>
                <span class="text-sm font-semibold text-slate-900 block tabular-nums">{{ app.authorizedSignatory.contactNumber }}</span>
              </div>
              <div class="sm:col-span-2">
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Email Address</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.authorizedSignatory.email }}</span>
              </div>
            </div>
          </div>

          <!-- Sub-section 2: Statutory Identifications -->
          <div class="space-y-3 pt-2">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 pb-2 border-b border-slate-100 flex items-center gap-2">
              <app-icon name="document" size="xs" class="text-primary" />
              <span>Statutory Identifications</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">PAN</span>
                <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ app.authorizedSignatory.pan }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Aadhaar Reference</span>
                <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ app.authorizedSignatory.aadhaarNo || '•••• •••• 9812' }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">ID Proof Type</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.authorizedSignatory.typeIdProof || 'Aadhaar / Government ID' }}</span>
              </div>
            </div>
          </div>

          <!-- Sub-section 3: Residential Address -->
          <div class="space-y-3 pt-2">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 pb-2 border-b border-slate-100 flex items-center gap-2">
              <app-icon name="info" size="xs" class="text-primary" />
              <span>Residential Address</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div class="sm:col-span-2">
                <span class="text-xs font-medium text-slate-500 block mb-0.5">Residential Address</span>
                <span class="text-sm font-normal text-slate-800 leading-relaxed block">{{ app.authorizedSignatory.residenceAddress }}</span>
              </div>
              <div>
                <span class="text-xs font-medium text-slate-500 block mb-0.5">State</span>
                <span class="text-sm font-semibold text-slate-900 block">{{ app.authorizedSignatory.state }}</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- 3. Bank Details -->
      @if (activeSection() === 'all' || activeSection() === 'bank') {
        @if (app.bankDetails; as bank) {
          <div class="space-y-6 animate-in fade-in duration-150">
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <app-icon name="building" size="xs" class="text-primary" />
                  <span>Disbursement &amp; PFMS Bank Account</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  PFMS Validated
                </span>
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span class="text-xs font-medium text-slate-500 block mb-0.5">Name of the Bank</span>
                  <span class="text-sm font-bold text-slate-900 block">{{ bank.bankName }}</span>
                </div>
                <div>
                  <span class="text-xs font-medium text-slate-500 block mb-0.5">Branch Name</span>
                  <span class="text-sm font-semibold text-slate-900 block">{{ bank.branchName }}</span>
                </div>
                <div>
                  <span class="text-xs font-medium text-slate-500 block mb-0.5">Account Type</span>
                  <span class="text-sm font-semibold text-slate-900 block">{{ bank.accountType }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-xs font-medium text-slate-500 block mb-0.5">Account Holder Name</span>
                  <span class="text-sm font-bold text-slate-900 block">{{ bank.accountHolderName }}</span>
                </div>
                <div>
                  <span class="text-xs font-medium text-slate-500 block mb-0.5">Account Number</span>
                  <span class="text-sm font-bold text-slate-900 block tabular-nums tracking-wide">{{ bank.accountNumber }}</span>
                </div>
                <div>
                  <span class="text-xs font-medium text-slate-500 block mb-0.5">IFSC Code</span>
                  <span class="text-sm font-bold text-slate-900 block tabular-nums">{{ bank.ifscCode }}</span>
                </div>
              </div>
            </div>
          </div>
        }
      }

      <!-- 4. Uploaded Documents -->
      @if (activeSection() === 'all' || activeSection() === 'documents') {
        <div class="space-y-4 animate-in fade-in duration-150">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 flex items-center gap-2">
                <app-icon name="document" size="xs" class="text-primary" />
                <span>Proposal Evidentiary Documents ({{ app.uploadedDocuments.length }} Files)</span>
              </h3>
              <p class="text-xs text-slate-500 mt-1 m-0">
                All mandatory and annexure documents submitted by applicant with compliance marks
              </p>
            </div>
            <button
              appButton
              variant="outline"
              size="sm"
              type="button"
              (click)="downloadZip.emit()"
              [disabled]="isDownloadingZip() || !app.uploadedDocuments.length"
              title="Download all proposal documents as ZIP archive"
            >
              <app-icon name="download" size="xs" />
              <span>{{ isDownloadingZip() ? 'Preparing ZIP...' : 'Download All as ZIP' }}</span>
            </button>
          </div>

          <app-table
            [columns]="documentColumns"
            [data]="app.uploadedDocuments"
            [customTemplates]="{ document: docTitleTemplate, comment: commentTemplate, view: viewTemplate }"
          />

          <ng-template #docTitleTemplate let-doc>
            <div class="flex items-center gap-2.5 py-1">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <app-icon name="document" size="xs" />
              </div>
              <div>
                <span class="text-xs font-bold text-slate-900 block">{{ doc.title }}</span>
                <span class="text-[11px] text-slate-500 block font-normal">{{ doc.fileSize }} &bull; {{ doc.category }}</span>
              </div>
            </div>
          </ng-template>

          <ng-template #commentTemplate let-doc>
            @if (doc.comment) {
              <span class="text-xs text-slate-700 whitespace-pre-wrap break-words block max-w-[320px]">{{ doc.comment }}</span>
            } @else {
              <span class="text-slate-400 text-xs">—</span>
            }
          </ng-template>

          <ng-template #viewTemplate let-doc>
            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              (click)="viewDoc.emit(doc)"
              title="View Document"
              aria-label="View Document"
            >
              <app-icon name="eye" size="sm" />
            </button>
          </ng-template>
        </div>
      }
    }
  `
})
export class ScrutinyReviewSectionsComponent implements OnInit {
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly isDownloadingZip = input(false);
  readonly activeSection = input<'all' | 'organisation' | 'signatory' | 'bank' | 'documents'>('all');
  readonly initiallyOpen = input<boolean>(false);

  readonly viewDoc = output<DossierDocument>();
  readonly downloadZip = output<void>();

  ngOnInit(): void {
    // Component is pure key-value presentation
  }

  protected readonly documentColumns: TableColumn<DossierDocument>[] = [
    { key: '$index', label: 'Sr. No', type: 'number', align: 'center', width: 'w-16' },
    { key: 'document', label: 'Document Name & Metadata', type: 'custom' },
    { key: 'comment', label: 'Applicant Remarks / Submission Note', type: 'custom' },
    { key: 'view', label: 'Action', type: 'custom', align: 'center', width: 'w-24' }
  ];
}
