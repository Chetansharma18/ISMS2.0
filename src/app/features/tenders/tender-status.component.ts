import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../shared';
import { DocumentViewerModalComponent } from '../../shared/components/document-viewer-modal/document-viewer-modal.component';
import {
  Step1OrgDetails,
  OfficerInCharge,
  Step3AuthorizedPerson,
  Step4BankDetails,
  FileDoc
} from '../registration/models/otr-form.model';

export interface SubmittedTenderDoc {
  id: number;
  name: string;
  category: 'mandatory' | 'annexure' | 'supporting';
  fileName: string;
  fileSize: string;
  status: 'uploaded' | 'pending';
}

export interface SubmittedTender {
  id: string;
  appRef: string;
  appliedDate: string;
  closingDate: string; // Last date of submission
  schemeTitle: string;
  schemeName: string;
  schemeCategory: string;
  department: string;
  emdAmount: string;
  processingFee: string;
  transactionRef: string;
  emdTransactionRef: string;
  submittedStatus: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
  eoiStatus: '-' | 'Under Review' | 'Reviewed' | string;
  rejectionReason?: string;
  editCount: number; // Current number of edits made (max 3)
  maxEdits: number; // 3

  // Complete Application Data for View & Edit
  orgDetails: Step1OrgDetails;
  signatoryDetails: Step3AuthorizedPerson;
  officers: OfficerInCharge[];
  bankDetails: Step4BankDetails;
  documents: SubmittedTenderDoc[];
}

@Component({
  selector: 'app-tender-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent,
    DocumentViewerModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans">
      
      <!-- Toast Notification -->
      @if (toastMessage()) {
        <div
          class="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4"
          [ngClass]="{
            'bg-emerald-50 text-emerald-900 border-emerald-300': toastType() === 'success',
            'bg-amber-50 text-amber-900 border-amber-300': toastType() === 'warning',
            'bg-rose-50 text-rose-900 border-rose-300': toastType() === 'error'
          }"
        >
          <span>{{ toastMessage() }}</span>
          <button type="button" (click)="toastMessage.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer font-bold">✕</button>
        </div>
      }

      <!-- Document Viewer Modal -->
      <app-document-viewer-modal
        [isOpen]="isViewerOpen()"
        [doc]="activeViewerDoc()"
        [title]="activeViewerTitle()"
        (close)="closeViewer()"
      />

      <!-- ====================================================================
           VIEW 1: TENDER STATUS MAIN TABLE (Without Extra Columns)
           ==================================================================== -->
      @if (!selectedTender()) {
        <div class="p-4 sm:p-5 space-y-4 font-sans">
          
          <!-- Page Header via Reusable PageHeaderComponent -->
          <app-page-header
            title="Tender Status"
            [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Tender Status' }]"
          >
            <!-- Search Input -->
            <div class="relative w-full sm:w-80">
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search Ref, Scheme, Department..."
                class="w-full pl-9 pr-7 py-2 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B3558] focus:border-[#0B3558] transition-colors font-normal shadow-2xs"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="searchQuery = ''"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  ✕
                </button>
              }
            </div>
          </app-page-header>

          <!-- Main Status Table via Reusable TableComponent -->
          <app-table
            [columns]="tenderColumns"
            [data]="filteredTenders()"
            [pagination]="true"
            [pageSize]="pageSize"
            emptyMessage="No tender applications match your search query."
            [customTemplates]="{
              appRef: appRefTemplate,
              schemeTitle: schemeTitleTemplate,
              department: deptTemplate,
              eoiStatus: eoiStatusTemplate,
              rejectionReason: rejectionReasonTemplate,
              view: viewTemplate
            }"
          >
          </app-table>

          <!-- Custom App Ref Template -->
          <ng-template #appRefTemplate let-tender>
            <button
              type="button"
              (click)="openApplicationPage(tender)"
              class="hover:text-[#0B3558] hover:underline cursor-pointer text-left inline-flex items-center gap-1 font-mono font-bold text-[#0B3558] transition-colors"
              title="Open Application Details Page"
            >
              <span>{{ tender.appRef }}</span>
              <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </ng-template>

          <!-- Custom Scheme Title Template -->
          <ng-template #schemeTitleTemplate let-tender>
            <span
              (click)="openApplicationPage(tender)"
              class="font-semibold text-slate-800 hover:text-[#0B3558] hover:underline cursor-pointer transition-colors"
              title="Open {{ tender.schemeTitle }}"
            >
              {{ tender.schemeTitle }}
            </span>
          </ng-template>

          <!-- Custom Department Template -->
          <ng-template #deptTemplate let-tender>
            <span class="line-clamp-2 text-slate-600 text-[11px] leading-relaxed">{{ tender.department }}</span>
          </ng-template>

          <!-- Custom EOI Stage Template -->
          <ng-template #eoiStatusTemplate let-tender>
            @if (tender.eoiStatus === 'Reviewed') {
              <span class="text-slate-800 font-bold text-xs">{{ tender.eoiStatus }}</span>
            } @else if (tender.eoiStatus === 'Under Review') {
              <span class="text-amber-800 font-bold text-xs">{{ tender.eoiStatus }}</span>
            } @else {
              <span class="text-slate-500 font-normal text-xs">-</span>
            }
          </ng-template>

          <!-- Custom Rejection Reason Template -->
          <ng-template #rejectionReasonTemplate let-tender>
            @if (tender.submittedStatus === 'Rejected') {
              <span class="text-rose-600 text-xs leading-tight font-medium block max-w-sm text-left">
                {{ tender.rejectionReason || 'Technical qualification criteria not met.' }}
              </span>
            } @else {
              <span class="text-slate-400 font-normal text-center block">-</span>
            }
          </ng-template>

          <!-- Custom View Action Button Template -->
          <ng-template #viewTemplate let-tender>
            <button
              type="button"
              (click)="openApplicationPage(tender)"
              title="Open Application Details Page"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View</span>
            </button>
          </ng-template>

        </div>
      }

      <!-- ====================================================================
           VIEW 2: FULL-PAGE APPLICATION VIEW & EDIT (ONE SINGLE PAGE)
           ==================================================================== -->
      @if (selectedTender()) {
        <div class="p-4 sm:p-6 lg:p-8 space-y-6 font-sans animate-in fade-in duration-150">
          
          <!-- Top Navigation Header with Back Button -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="backToTenderList()"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Tender Status</span>
              </button>

              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm sm:text-base font-black text-[#0B3558]">
                    {{ selectedTender()!.appRef }}
                  </span>
                  <span
                    class="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-800 border border-emerald-300': selectedTender()!.submittedStatus === 'Accepted',
                      'bg-amber-100 text-amber-800 border border-amber-300': selectedTender()!.submittedStatus === 'Under Review',
                      'bg-sky-100 text-sky-800 border border-sky-300': selectedTender()!.submittedStatus === 'Submitted',
                      'bg-rose-100 text-rose-800 border border-rose-300': selectedTender()!.submittedStatus === 'Rejected'
                    }"
                  >
                    {{ selectedTender()!.submittedStatus }}
                  </span>
                  @if (isEditing()) {
                    <span class="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wide">
                      Edit Mode Active
                    </span>
                  }
                </div>
                <h2 class="text-sm sm:text-base font-bold text-slate-800">
                  {{ selectedTender()!.schemeTitle }}
                </h2>
              </div>
            </div>

            <!-- Right Top Actions -->
            <div class="flex items-center gap-2 flex-wrap">
              @if (isEditing()) {
                <button
                  type="button"
                  (click)="saveEdits()"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes (Consumes 1 Edit)</span>
                </button>
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              } @else {
                @if (canEdit(selectedTender()!)) {
                  <button
                    type="button"
                    (click)="startEditing()"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Application</span>
                  </button>
                } @else if (selectedTender()!.editCount >= 3) {
                  <span class="px-3.5 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold select-none">
                    Max 3/3 Edits Used (Locked)
                  </span>
                } @else {
                  <span class="px-3.5 py-2 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs font-bold select-none">
                    Submission Closed (Editing Disabled)
                  </span>
                }

                <button
                  type="button"
                  (click)="printApplication()"
                  class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
              }
            </div>

          </div>

          <!-- Top 3 Edits Status Strip -->
          <div class="p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs font-sans">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="w-2 h-2 rounded-full" [ngClass]="selectedTender()!.editCount >= 3 ? 'bg-rose-500' : 'bg-emerald-500'"></span>
              <span class="text-slate-400 uppercase font-bold text-[10.5px]">Edits Allowed:</span>
              <span class="font-bold text-slate-800">3 Edits Only</span>
              <span class="text-slate-400">&bull;</span>
              <span class="text-slate-500">Max 3 edit attempts allowed before closing date ({{ selectedTender()!.closingDate }})</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <strong class="text-xs" [ngClass]="selectedTender()!.editCount >= 3 ? 'text-rose-700' : 'text-[#0B3558]'">
                {{ selectedTender()!.editCount }} of 3 Used
              </strong>
              <span class="text-slate-500">({{ remainingEdits(selectedTender()!) }} Remaining)</span>
            </div>
          </div>

          @if (isEditing()) {
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2 text-xs font-sans">
              <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div class="leading-relaxed">
                <strong class="block font-bold">You are currently editing this application:</strong>
                <span>Saving your changes will consume 1 edit attempt ({{ remainingEdits(selectedTender()!) }} remaining). You can edit up to 3 times before the closing date (<strong>{{ selectedTender()!.closingDate }}</strong>).</span>
              </div>
            </div>
          }

          <!-- Fee Verification Summary Card -->
          <div class="p-4 sm:p-5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-blue-200 flex-wrap gap-2">
              <span class="font-bold text-[#0B3558] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Fee Payments &amp; Treasury Verification Status (Settled)
              </span>
              <span class="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 text-[11px]">
                ✓ Total Fees Settled: ₹ 52,000.00
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Processing Fee Block -->
              <div class="p-3 bg-white border border-blue-200/80 rounded-lg space-y-1.5">
                <div class="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span class="font-bold text-[#0B3558] text-[11.5px]">1. EOI RFP Processing Fee</span>
                  <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[10.5px]">✓ Paid</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-0.5">
                  <div>Amount: <strong class="text-slate-900 font-bold">{{ currentApplication().processingFee }}</strong></div>
                  <div>Payment Mode: <strong>Cyber Treasury e-GRAS</strong></div>
                  <div>Challan GRN: <strong class="font-mono text-slate-900">{{ currentApplication().transactionRef }}</strong></div>
                  <div>Settled On: <strong>{{ currentApplication().appliedDate }}</strong></div>
                </div>
              </div>

              <!-- EMD Fee Block -->
              <div class="p-3 bg-white border border-blue-200/80 rounded-lg space-y-1.5">
                <div class="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span class="font-bold text-[#0B3558] text-[11.5px]">2. Earnest Money Deposit (EMD)</span>
                  <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[10.5px]">✓ Deposited</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-0.5">
                  <div>Amount: <strong class="text-slate-900 font-bold">{{ currentApplication().emdAmount }}</strong></div>
                  <div>Payment Mode: <strong>Cyber Treasury e-GRAS</strong></div>
                  <div>Challan GRN: <strong class="font-mono text-slate-900">{{ currentApplication().emdTransactionRef }}</strong></div>
                  <div>Settled On: <strong>{{ currentApplication().appliedDate }}</strong></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================================
               ALL APPLICATION SECTIONS IN ONE CONTINUOUS PAGE
               ================================================================ -->
          <div class="space-y-6 text-xs">
            
            <!-- SECTION 1: Organisation Details & Legal Registration -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 class="font-bold text-[#0B3558] text-sm uppercase tracking-wide flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-xs font-bold">1</span>
                  <span>Organisation Details &amp; Legal Registration</span>
                </h4>
                @if (isEditing()) {
                  <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[11px]">Editing Active</span>
                }
              </div>

              @if (isEditing()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div class="sm:col-span-2">
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Organisation Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.fullName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Nature of Entity *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.natureOfEntity" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Registration No. (CIN / Reg. No.) *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.registrationNumber" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Date of Registration *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.dateOfRegistration" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">State / UT of Registration *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.stateOfLegalReg" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Organisation PAN *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.companyPan" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">GST Registered *</label>
                    <select [(ngModel)]="editableTender!.orgDetails.gstRegistered" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">GSTIN</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.gstin" [disabled]="editableTender!.orgDetails.gstRegistered !== 'Yes'" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white disabled:bg-slate-100" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">MSME / Udyam Registered *</label>
                    <select [(ngModel)]="editableTender!.orgDetails.msmeRegistered" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Udyam Registration Number</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.udyamNumber" [disabled]="editableTender!.orgDetails.msmeRegistered !== 'Yes'" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white disabled:bg-slate-100" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">NSDC Partner</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.nsdcPartner" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Organisation Contact No. *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.contactNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Organisation Email ID *</label>
                    <input type="email" [(ngModel)]="editableTender!.orgDetails.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Website</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.website" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Registered Address *</label>
                    <textarea [(ngModel)]="editableTender!.orgDetails.registeredAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"></textarea>
                  </div>
                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Office Address *</label>
                    <textarea [(ngModel)]="editableTender!.orgDetails.officeAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"></textarea>
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div class="sm:col-span-2"><span class="text-slate-400 block uppercase text-[10px] font-medium">Organisation Name</span><strong class="text-slate-900 text-xs">{{ currentApplication().orgDetails.fullName || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Nature of Entity</span><strong class="text-slate-900 text-xs">{{ currentApplication().orgDetails.natureOfEntity || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">CIN / Reg No</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().orgDetails.registrationNumber || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Date of Registration</span><strong class="text-slate-900 text-xs">{{ currentApplication().orgDetails.dateOfRegistration || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">State / UT of Registration</span><strong class="text-slate-900 text-xs">{{ currentApplication().orgDetails.stateOfLegalReg || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Organisation PAN</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().orgDetails.companyPan || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">GST Registered</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().orgDetails.gstRegistered === 'Yes' ? (currentApplication().orgDetails.gstin || 'Yes') : 'No' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">MSME / Udyam Registered</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().orgDetails.msmeRegistered === 'Yes' ? (currentApplication().orgDetails.udyamNumber || 'Yes') : 'No' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">NSDC Partner</span><strong class="text-slate-900 text-xs">{{ currentApplication().orgDetails.nsdcPartner || 'Not Applicable' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Organisation Contact No.</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().orgDetails.contactNo || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Organisation Email ID</span><strong class="text-slate-900 text-xs">{{ currentApplication().orgDetails.emailId || '-' }}</strong></div>
                  <div class="sm:col-span-2"><span class="text-slate-400 block uppercase text-[10px] font-medium">Website</span><strong class="text-sky-800 text-xs">{{ currentApplication().orgDetails.website || '-' }}</strong></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-400 block uppercase text-[10px] font-medium">Registered Address</span><span class="text-slate-900 leading-tight block text-xs">{{ currentApplication().orgDetails.registeredAddress || '-' }}</span></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-400 block uppercase text-[10px] font-medium">Office Address</span><span class="text-slate-900 leading-tight block text-xs">{{ currentApplication().orgDetails.officeAddress || '-' }}</span></div>
                </div>
              }

              <!-- Attached Registration Certificates Grid -->
              <div class="pt-2 border-t border-slate-200 space-y-2">
                <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Attached Registration Documents
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <!-- Incorporation Certificate -->
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <span class="text-[9.5px] font-bold uppercase text-slate-400 block">Certificate of Registration</span>
                      <span class="font-semibold text-slate-800 truncate block text-[11px]">{{ currentApplication().orgDetails.registrationCertDoc?.fileName || 'Incorporation_Cert.pdf' }}</span>
                      <span class="text-[10px] text-slate-400">{{ currentApplication().orgDetails.registrationCertDoc?.fileSize || '1.4 MB' }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.registrationCertDoc?.fileName || 'Incorporation_Cert.pdf', 'Certificate of Registration', '1.4 MB')" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'regCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Organisation PAN Card -->
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <span class="text-[9.5px] font-bold uppercase text-slate-400 block">Organisation PAN Card</span>
                      <span class="font-semibold text-slate-800 truncate block text-[11px]">{{ currentApplication().orgDetails.panCardDoc?.fileName || 'Company_PAN.pdf' }}</span>
                      <span class="text-[10px] text-slate-400">{{ currentApplication().orgDetails.panCardDoc?.fileSize || '820 KB' }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.panCardDoc?.fileName || 'Company_PAN.pdf', 'Organisation PAN Card', '820 KB')" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'panCard')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- GST Certificate -->
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <span class="text-[9.5px] font-bold uppercase text-slate-400 block">GST Certificate</span>
                      <span class="font-semibold text-slate-800 truncate block text-[11px]">{{ currentApplication().orgDetails.gstCertDoc?.fileName || 'GST_Cert.pdf' }}</span>
                      <span class="text-[10px] text-slate-400">{{ currentApplication().orgDetails.gstCertDoc?.fileSize || '910 KB' }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.gstCertDoc?.fileName || 'GST_Cert.pdf', 'GST Certificate', '910 KB')" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'gstCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Udyam MSME Certificate -->
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <span class="text-[9.5px] font-bold uppercase text-slate-400 block">Udyam Certificate</span>
                      <span class="font-semibold text-slate-800 truncate block text-[11px]">{{ currentApplication().orgDetails.msmeCertDoc?.fileName || 'Udyam_Cert.pdf' }}</span>
                      <span class="text-[10px] text-slate-400">{{ currentApplication().orgDetails.msmeCertDoc?.fileSize || '650 KB' }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.msmeCertDoc?.fileName || 'Udyam_Cert.pdf', 'Udyam Certificate', '650 KB')" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'msmeCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 2: Authorized Person Details -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 class="font-bold text-[#0B3558] text-sm uppercase tracking-wide flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-xs font-bold">2</span>
                  <span>Authorized Person Details</span>
                </h4>
                @if (isEditing()) {
                  <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[11px]">Editing Active</span>
                }
              </div>

              @if (isEditing()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Full Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.name" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Designation</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.designation" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Date of Birth *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.dob" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Age</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.age" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">PAN *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.pan" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Mobile No. *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.mobileNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Email Address *</label>
                    <input type="email" [(ngModel)]="editableTender!.signatoryDetails.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Aadhaar No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.aadhaarNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Bhamashah No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.bhamashahNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Voter ID No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.voterIdNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Passport No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.passportNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">State</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.state" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div class="sm:col-span-2 lg:col-span-4">
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Residential Address</label>
                    <textarea [(ngModel)]="editableTender!.signatoryDetails.residenceAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"></textarea>
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Full Name</span><strong class="text-slate-900 text-xs">{{ currentApplication().signatoryDetails.name || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Designation</span><strong class="text-slate-900 text-xs">{{ currentApplication().signatoryDetails.designation || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Date of Birth / Age</span><strong class="text-slate-900 text-xs">{{ currentApplication().signatoryDetails.dob || '-' }} ({{ currentApplication().signatoryDetails.age || '42' }} Yrs)</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">PAN</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().signatoryDetails.pan || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Mobile No.</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().signatoryDetails.mobileNo || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Email Address</span><strong class="text-slate-900 text-xs">{{ currentApplication().signatoryDetails.emailId || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Aadhaar No.</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().signatoryDetails.aadhaarNo || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">State</span><strong class="text-slate-900 text-xs">{{ currentApplication().signatoryDetails.state || 'Rajasthan' }}</strong></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-400 block uppercase text-[10px] font-medium">Residential Address</span><span class="text-slate-900 block leading-tight text-xs">{{ currentApplication().signatoryDetails.residenceAddress || '-' }}</span></div>
                </div>
              }

              <!-- Attached Signatory Documents Grid -->
              <div class="pt-2 border-t border-slate-200 space-y-2">
                <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Attached Signatory Documents
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <!-- Board Resolution -->
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <span class="text-[9.5px] font-bold uppercase text-slate-400 block">Authorization Letter / Board Resolution</span>
                      <span class="font-semibold text-slate-800 truncate block text-[11px]">{{ currentApplication().signatoryDetails.authorizationLetterDoc?.fileName || 'Board_Resolution.pdf' }}</span>
                      <span class="text-[10px] text-slate-400">{{ currentApplication().signatoryDetails.authorizationLetterDoc?.fileSize || '1.2 MB' }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().signatoryDetails.authorizationLetterDoc?.fileName || 'Board_Resolution.pdf', 'Authorization Letter / Board Resolution', '1.2 MB')" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'authLetter')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Signatory ID Proof -->
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <span class="text-[9.5px] font-bold uppercase text-slate-400 block">Authorized Person Identity Proof</span>
                      <span class="font-semibold text-slate-800 truncate block text-[11px]">{{ currentApplication().signatoryDetails.idProofDoc?.fileName || 'Signatory_Aadhaar.pdf' }}</span>
                      <span class="text-[10px] text-slate-400">{{ currentApplication().signatoryDetails.idProofDoc?.fileSize || '750 KB' }}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().signatoryDetails.idProofDoc?.fileName || 'Signatory_Aadhaar.pdf', 'Authorized Person Identity Proof', '750 KB')" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'authIdProof')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: Bank Details -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 class="font-bold text-[#0B3558] text-sm uppercase tracking-wide flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-xs font-bold">3</span>
                  <span>Bank Details</span>
                </h4>
                @if (isEditing()) {
                  <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[11px]">Editing Active</span>
                }
              </div>

              @if (isEditing()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Name of the Bank *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.bankName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Branch Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.branchName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Transfer Mode *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.transferMode" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Type *</label>
                    <select [(ngModel)]="editableTender!.bankDetails.accountType" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
                      <option value="Current">Current</option>
                      <option value="Savings">Savings</option>
                      <option value="Current Account">Current Account</option>
                      <option value="Savings Account">Savings Account</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Holder Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.accountHolderName" class="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Number *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.accountNo" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">IFSC Code *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.ifscCode" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">MICR Code (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.micrCode" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                  </div>
                  <div class="sm:col-span-2 lg:col-span-4">
                    <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Branch Address *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.branchAddress" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Name of the Bank</span><strong class="text-slate-900 text-xs">{{ currentApplication().bankDetails.bankName || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Branch Name</span><strong class="text-slate-900 text-xs">{{ currentApplication().bankDetails.branchName || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Transfer Mode</span><strong class="text-slate-900 text-xs">{{ currentApplication().bankDetails.transferMode || 'NEFT / RTGS' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Account Type</span><strong class="text-slate-900 text-xs">{{ currentApplication().bankDetails.accountType || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Account Holder Name</span><strong class="text-slate-900 text-xs">{{ currentApplication().bankDetails.accountHolderName || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">Account Number</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().bankDetails.accountNo || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">IFSC Code</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().bankDetails.ifscCode || '-' }}</strong></div>
                  <div><span class="text-slate-400 block uppercase text-[10px] font-medium">MICR Code</span><strong class="font-mono text-slate-900 text-xs">{{ currentApplication().bankDetails.micrCode || '-' }}</strong></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-400 block uppercase text-[10px] font-medium">Branch Address</span><span class="text-slate-900 text-xs block leading-tight">{{ currentApplication().bankDetails.branchAddress || '-' }}</span></div>
                </div>
              }

              <!-- Attached Bank Cheque -->
              <div class="pt-2 border-t border-slate-200">
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <span class="text-[9.5px] font-bold uppercase text-slate-400 block">Upload Cancelled Cheque / Bank Passbook</span>
                    <span class="font-semibold text-slate-800 truncate block text-[11px]">{{ currentApplication().bankDetails.cancelledChequeDoc?.fileName || 'Cancelled_Cheque.pdf' }}</span>
                    <span class="text-[10px] text-slate-400">{{ currentApplication().bankDetails.cancelledChequeDoc?.fileSize || '890 KB' }}</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" (click)="viewDoc(currentApplication().bankDetails.cancelledChequeDoc?.fileName || 'Cancelled_Cheque.pdf', 'Cancelled Cheque / Bank Passbook', '890 KB')" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer">View</button>
                    @if (isEditing()) {
                      <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                        Replace
                        <input type="file" (change)="replaceOtrDoc($event, 'bankDoc')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                      </label>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 4: Mandated Proposal Documents (16 Uploaded Files) - WITHOUT STATUS COLUMN -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 class="font-bold text-[#0B3558] text-sm uppercase tracking-wide flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-xs font-bold">4</span>
                  <span>Mandated Proposal Documents &amp; Annexures (16 Files Attached)</span>
                </h4>
                @if (isEditing()) {
                  <span class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[11px]">Editing Active</span>
                }
              </div>

              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 font-bold uppercase text-[10.5px] text-slate-600 border-b border-slate-200">
                    <tr>
                      <th class="p-2.5 text-center w-10">#</th>
                      <th class="p-2.5">Document Title</th>
                      <th class="p-2.5">Category</th>
                      <th class="p-2.5">Attached File Name</th>
                      <th class="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-700">
                    @for (doc of (isEditing() ? editableTender!.documents : currentApplication().documents); track doc.id) {
                      <tr class="hover:bg-slate-50/50">
                        <td class="p-2.5 text-center font-bold text-slate-400">{{ doc.id }}</td>
                        <td class="p-2.5 font-semibold text-slate-800">{{ doc.name }}</td>
                        <td class="p-2.5">
                          <span class="text-[10px] px-2 py-0.5 rounded font-bold"
                            [ngClass]="{
                              'bg-rose-50 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                              'bg-sky-50 text-sky-700 border border-sky-200': doc.category === 'annexure',
                              'bg-slate-100 text-slate-600': doc.category === 'supporting'
                            }">
                            {{ doc.category === 'mandatory' ? 'Mandatory Statutory' : (doc.category === 'annexure' ? 'Scheme Annexure' : 'Supporting') }}
                          </span>
                        </td>
                        <td class="p-2.5 font-mono text-[11.5px] text-slate-700">
                          {{ doc.fileName }} ({{ doc.fileSize }})
                        </td>
                        <td class="p-2.5 text-center">
                          <div class="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              (click)="viewDoc(doc.fileName, doc.name, doc.fileSize)"
                              class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                            >
                              View
                            </button>
                            @if (isEditing()) {
                              <label class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-xs font-semibold cursor-pointer">
                                Replace
                                <input type="file" (change)="replaceDoc($event, doc)" class="hidden" accept=".pdf" />
                              </label>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- SECTION 5: Official Payment Receipts & e-Challan Acknowledgement -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 class="font-bold text-[#0B3558] text-sm uppercase tracking-wide flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#0B3558]/10 text-[#0B3558] flex items-center justify-center text-xs font-bold">5</span>
                  <span>Official Payment Receipts &amp; e-Challan Acknowledgement</span>
                </h4>
              </div>

              <!-- Receipt 1: EOI Proposal Submission Acknowledgment -->
              <div class="border-2 border-slate-700 rounded-xl p-5 bg-white space-y-4">
                <div class="flex items-center justify-between pb-2 border-b-2 border-slate-800 flex-wrap gap-2">
                  <div>
                    <div class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Government of Rajasthan &bull; RSLDC</div>
                    <h5 class="text-sm font-bold text-[#0B3558] uppercase">Proposal Submission Acknowledgment Slip (Form RSLDC-EOI-ACK)</h5>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                      {{ currentApplication().appRef }}
                    </span>
                    <button
                      type="button"
                      (click)="downloadAcknowledgmentReceipt()"
                      class="px-3 py-1 bg-[#0B3558] hover:bg-[#07233B] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span class="text-slate-400 block text-[10px]">Applied Date</span><strong>{{ currentApplication().appliedDate }}</strong></div>
                  <div><span class="text-slate-400 block text-[10px]">Remitter Name</span><strong>{{ currentApplication().orgDetails.fullName }}</strong></div>
                  <div><span class="text-slate-400 block text-[10px]">CIN / PAN</span><strong class="font-mono">{{ currentApplication().orgDetails.registrationNumber }} / {{ currentApplication().orgDetails.companyPan }}</strong></div>
                  <div><span class="text-slate-400 block text-[10px]">Submission Status</span><strong class="text-emerald-700">✓ SUBMITTED</strong></div>
                </div>
              </div>

              <!-- Receipt 2: Cyber Treasury e-GRAS Challan -->
              <div class="border-2 border-slate-700 rounded-xl p-5 bg-white space-y-4">
                <div class="flex items-center justify-between pb-2 border-b-2 border-slate-800 flex-wrap gap-2">
                  <div>
                    <div class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Finance Department &bull; Cyber Treasury (e-GRAS)</div>
                    <h5 class="text-sm font-bold text-[#0B3558] uppercase">e-Challan / Treasury Receipt (Form GA-57)</h5>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-slate-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      {{ currentApplication().emdTransactionRef }}
                    </span>
                    <button
                      type="button"
                      (click)="downloadChallanReceipt()"
                      class="px-3 py-1 bg-[#0B3558] hover:bg-[#07233B] text-white rounded font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <table class="w-full text-xs border border-slate-300 border-collapse">
                  <thead class="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th class="p-2 border-r border-slate-300">Fee Particulars</th>
                      <th class="p-2 border-r border-slate-300">Treasury Head</th>
                      <th class="p-2 border-r border-slate-300">Challan GRN</th>
                      <th class="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-300">
                    <tr>
                      <td class="p-2 font-semibold">EOI RFP Tender Processing Fee</td>
                      <td class="p-2 font-mono">0070-60-800-01-00</td>
                      <td class="p-2 font-mono">{{ currentApplication().transactionRef }}</td>
                      <td class="p-2 text-right font-mono font-bold">{{ currentApplication().processingFee }}</td>
                    </tr>
                    <tr>
                      <td class="p-2 font-semibold">Earnest Money Deposit (EMD)</td>
                      <td class="p-2 font-mono">8443-00-103-00-00</td>
                      <td class="p-2 font-mono">{{ currentApplication().emdTransactionRef }}</td>
                      <td class="p-2 text-right font-mono font-bold">{{ currentApplication().emdAmount }}</td>
                    </tr>
                    <tr class="bg-slate-50 font-bold">
                      <td colspan="3" class="p-2 text-right uppercase">Total Amount Deposited:</td>
                      <td class="p-2 text-right text-[#0B3558] text-sm">₹ 52,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>
      }

    </div>
  `
})
export class TenderStatusComponent {
  readonly Math = Math;
  searchQuery = '';
  readonly pageSize = 6;

  // Selected tender state for full page view
  selectedTender = signal<SubmittedTender | null>(null);
  editableTender: SubmittedTender | null = null;
  isEditing = signal<boolean>(false);

  // Toast State
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'warning' | 'error'>('success');

  // Document Viewer Modal State
  activeViewerDoc = signal<FileDoc | null>(null);
  activeViewerTitle = signal<string>('');
  isViewerOpen = signal<boolean>(false);

  // Clean Table Columns without Closing Date / Edits Used
  readonly tenderColumns: TableColumn<SubmittedTender>[] = [
    { key: '$index',           label: 'S. No.',               type: 'number', align: 'center', width: 'w-12' },
    { key: 'appRef',           label: 'Application Ref. No.', cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'schemeTitle',      label: 'Scheme Name',          cellClass: 'whitespace-nowrap font-medium text-slate-800', type: 'custom' },
    { key: 'department',       label: 'Department',           width: 'min-w-[180px] max-w-sm', type: 'custom' },
    { key: 'appliedDate',      label: 'Applied Date',         align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    {
      key: 'submittedStatus',
      label: 'Submitted Status',
      align: 'center',
      type: 'status',
      badgeVariantMap: {
        'Submitted': 'info',
        'Under Review': 'warning',
        'Accepted': 'success',
        'Rejected': 'danger'
      }
    },
    { key: 'eoiStatus',        label: 'EOI Stage',            align: 'center', type: 'custom', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'rejectionReason',  label: 'Remarks', align: 'center', type: 'custom', cellClass: 'min-w-[200px]' },
    { key: 'view',             label: 'View',                 align: 'center', width: 'w-20', type: 'custom' }
  ];

  /** Standard 16 Proposal Documents Generator */
  private createSampleDocs(): SubmittedTenderDoc[] {
    const docNames = [
      { id: 1, name: 'Covering Letter (Annexure 1)', category: 'mandatory' as const },
      { id: 2, name: 'Audited Financial Statements (Annexure 3)', category: 'mandatory' as const },
      { id: 3, name: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)', category: 'mandatory' as const },
      { id: 4, name: 'Statutory Compliance Self-Declaration (Annexure 7)', category: 'mandatory' as const },
      { id: 5, name: 'Signed & Sealed EOI Document', category: 'mandatory' as const },
      { id: 6, name: 'Debarment Undertaking Document', category: 'mandatory' as const },
      { id: 7, name: 'Training & Placement Track Record (Annexure 5)', category: 'annexure' as const },
      { id: 8, name: 'Active Skill Development Centres (Annexure 4)', category: 'annexure' as const },
      { id: 9, name: 'Board of Directors Details (Annexure 8)', category: 'annexure' as const },
      { id: 10, name: 'Industry Placement Tie-ups & MOUs (Annexure 9)', category: 'annexure' as const },
      { id: 11, name: 'Relevant Sector Experience Proof (Annexure 10)', category: 'annexure' as const },
      { id: 12, name: 'District Cluster Mobilization Plan (Annexure 11)', category: 'annexure' as const },
      { id: 13, name: 'Technical Evaluation Matrix (Annexure 12)', category: 'annexure' as const },
      { id: 14, name: 'Supporting Credentials & Accreditations (Annexure 13)', category: 'annexure' as const },
      { id: 15, name: 'NSDC Stake Partner Certificate', category: 'supporting' as const },
      { id: 16, name: 'CA Turnover Certificate with UDIN (Annexure 14)', category: 'supporting' as const }
    ];

    return docNames.map(d => ({
      ...d,
      fileName: `Scan_Annexure_${d.id}_Signed.pdf`,
      fileSize: `${(1.1 + (d.id % 4) * 0.4).toFixed(1)} MB`,
      status: 'uploaded'
    }));
  }

  tenders = signal<SubmittedTender[]>([
    {
      id: 't-1',
      appRef: 'APP-2024-001',
      appliedDate: '08-Sep-2026',
      closingDate: '30-Nov-2026', // Future date - Window Open
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      schemeName: 'MMKVY',
      schemeCategory: 'Rajvik',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹ 50,000',
      processingFee: '₹ 2,000',
      transactionRef: 'GRN-RAJ-2026-981240',
      emdTransactionRef: 'GRN-RAJ-2026-981241',
      submittedStatus: 'Accepted',
      eoiStatus: 'Reviewed',
      editCount: 0, // 3 remaining
      maxEdits: 3,
      orgDetails: {
        shortName: 'Company 1',
        fullName: 'Company 1',
        natureOfEntity: 'Private Limited Company',
        registrationNumber: 'U80302RJ2022NPL079811',
        dateOfRegistration: '14/06/2022',
        stateOfLegalReg: 'Rajasthan',
        registrationCertDoc: { fileName: 'Incorporation_Cert.pdf', fileSize: '1.4 MB', uploadDate: '08/09/2026', status: 'uploaded' },
        companyPan: 'AAACR1234F',
        panCardDoc: { fileName: 'Company_PAN.pdf', fileSize: '820 KB', uploadDate: '08/09/2026', status: 'uploaded' },
        gstRegistered: 'Yes',
        gstin: '08AAACR1234F1Z5',
        gstCertDoc: { fileName: 'GST_Cert.pdf', fileSize: '910 KB', uploadDate: '08/09/2026', status: 'uploaded' },
        msmeRegistered: 'Yes',
        udyamNumber: 'UDYAM-RJ-14-0028192',
        msmeCertDoc: { fileName: 'Udyam_Cert.pdf', fileSize: '650 KB', uploadDate: '08/09/2026', status: 'uploaded' },
        turnOver: '450',
        financialYears: [
          { year: '2025-26', totalTurnover: '450', skillTurnover: '320' },
          { year: '2024-25', totalTurnover: '380', skillTurnover: '260' },
          { year: '2023-24', totalTurnover: '290', skillTurnover: '190' }
        ],
        turnoverCertDoc: { fileName: 'CA_Turnover_Certificate.pdf', fileSize: '1.1 MB', uploadDate: '08/09/2026', status: 'uploaded' },
        blackListed: 'No',
        nsdcPartner: 'Non-Funded Partner',
        contactNo: '9829154321',
        emailId: 'contact@company1.org',
        website: 'https://company1.org',
        registeredAddress: '402, Jaipur Tower, Tonk Road, Jaipur',
        registeredState: 'Rajasthan',
        registeredDistrict: 'Jaipur',
        registeredPincode: '302015',
        sameAsRegistered: true,
        officeAddress: '402, Jaipur Tower, Tonk Road, Jaipur',
        officeState: 'Rajasthan',
        officeDistrict: 'Jaipur',
        officePincode: '302015'
      },
      signatoryDetails: {
        name: 'Vikram Singh Mehta',
        dob: '12/08/1984',
        age: '42',
        designation: 'Managing Director / Authorized Representative',
        pan: 'AAAPM5512B',
        emailId: 'vikram.mehta@company1.org',
        mobileNo: '9829154321',
        aadhaarNo: '7845 1209 3341',
        bhamashahNo: '',
        voterIdNo: 'RJ/14/082/194821',
        passportNo: '',
        state: 'Rajasthan',
        residenceAddress: 'B-14, Vaishali Nagar, Jaipur, Rajasthan - 302021',
        authorizationLetterDoc: { fileName: 'Board_Resolution.pdf', fileSize: '1.2 MB', uploadDate: '08/09/2026', status: 'uploaded' },
        idProofDoc: { fileName: 'Signatory_Aadhaar.pdf', fileSize: '750 KB', uploadDate: '08/09/2026', status: 'uploaded' }
      },
      officers: [
        {
          id: 'OIC-1',
          name: 'Rajesh Sharma',
          designation: 'Project Director',
          mobileNo: '9829011223',
          emailId: 'rajesh.sharma@company1.org',
          pan: 'AAAPR1122C',
          aadhaarNo: '9845 2211 4455',
          bhamashahNo: '',
          voterIdNo: '',
          passportNo: '',
          appointmentLetterDoc: { fileName: 'Appointment_Rajesh.pdf', fileSize: '950 KB', uploadDate: '08/09/2026', status: 'uploaded' },
          idProofDoc: null
        }
      ],
      bankDetails: {
        bankName: 'State Bank of India',
        branchName: 'Tonk Road Branch, Jaipur',
        transferMode: 'NEFT / RTGS',
        accountType: 'Current Account',
        accountHolderName: 'Company 1',
        accountNo: '389102948192',
        ifscCode: 'SBIN0004120',
        micrCode: '302002018',
        branchAddress: 'Tonk Road, Jaipur - 302015',
        cancelledChequeDoc: { fileName: 'Cancelled_Cheque.pdf', fileSize: '890 KB', uploadDate: '08/09/2026', status: 'uploaded' }
      },
      documents: this.createSampleDocs()
    },
    {
      id: 't-2',
      appRef: 'APP-2024-002',
      appliedDate: '24-Aug-2026',
      closingDate: '15-Nov-2026', // Future date - Window Open
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MNSKSY)',
      schemeName: 'MNSKSY',
      schemeCategory: 'Samarth',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹ 50,000',
      processingFee: '₹ 2,000',
      transactionRef: 'GRN-RAJ-2026-771829',
      emdTransactionRef: 'GRN-RAJ-2026-771830',
      submittedStatus: 'Accepted',
      eoiStatus: 'Reviewed',
      editCount: 1, // 2 remaining
      maxEdits: 3,
      orgDetails: {
        shortName: 'Company 2',
        fullName: 'Company 2',
        natureOfEntity: 'Society / Trust',
        registrationNumber: 'REG/RAJ/2019/88129',
        dateOfRegistration: '10/02/2019',
        stateOfLegalReg: 'Rajasthan',
        registrationCertDoc: { fileName: 'Trust_Reg_Cert.pdf', fileSize: '1.2 MB', uploadDate: '24/08/2026', status: 'uploaded' },
        companyPan: 'AAATA4419E',
        panCardDoc: { fileName: 'Trust_PAN.pdf', fileSize: '780 KB', uploadDate: '24/08/2026', status: 'uploaded' },
        gstRegistered: 'Yes',
        gstin: '08AAATA4419E1Z8',
        gstCertDoc: { fileName: 'GST_Cert.pdf', fileSize: '890 KB', uploadDate: '24/08/2026', status: 'uploaded' },
        msmeRegistered: 'No',
        udyamNumber: '',
        msmeCertDoc: null,
        turnOver: '520',
        financialYears: [
          { year: '2025-26', totalTurnover: '520', skillTurnover: '410' },
          { year: '2024-25', totalTurnover: '440', skillTurnover: '330' },
          { year: '2023-24', totalTurnover: '350', skillTurnover: '240' }
        ],
        turnoverCertDoc: { fileName: 'CA_Turnover.pdf', fileSize: '1.0 MB', uploadDate: '24/08/2026', status: 'uploaded' },
        blackListed: 'No',
        nsdcPartner: 'Funded Partner',
        contactNo: '9414019283',
        emailId: 'info@company2.org',
        website: 'https://company2.org',
        registeredAddress: 'Plot 12, Malviya Industrial Area, Jaipur',
        registeredState: 'Rajasthan',
        registeredDistrict: 'Jaipur',
        registeredPincode: '302017',
        sameAsRegistered: true,
        officeAddress: 'Plot 12, Malviya Industrial Area, Jaipur',
        officeState: 'Rajasthan',
        officeDistrict: 'Jaipur',
        officePincode: '302017'
      },
      signatoryDetails: {
        name: 'Dr. Rajeshwar Sharma',
        dob: '05/11/1976',
        age: '50',
        designation: 'Director / Trustee',
        pan: 'AAAPR9914L',
        emailId: 'director@company2.org',
        mobileNo: '9414019283',
        aadhaarNo: '4412 8891 0021',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        state: 'Rajasthan',
        residenceAddress: 'A-22, C-Scheme, Jaipur - 302001',
        authorizationLetterDoc: { fileName: 'Trust_Resolution.pdf', fileSize: '1.1 MB', uploadDate: '24/08/2026', status: 'uploaded' },
        idProofDoc: { fileName: 'Signatory_PAN.pdf', fileSize: '650 KB', uploadDate: '24/08/2026', status: 'uploaded' }
      },
      officers: [
        {
          id: 'OIC-1',
          name: 'Sunil Verma',
          designation: 'Training Head',
          mobileNo: '9414128910',
          emailId: 'sunil.verma@company2.org',
          pan: 'AAAPV8812K',
          aadhaarNo: '5521 9912 3341',
          bhamashahNo: '',
          voterIdNo: '',
          passportNo: '',
          appointmentLetterDoc: { fileName: 'Appointment_Sunil.pdf', fileSize: '850 KB', uploadDate: '24/08/2026', status: 'uploaded' },
          idProofDoc: null
        }
      ],
      bankDetails: {
        bankName: 'HDFC Bank',
        branchName: 'C-Scheme Branch, Jaipur',
        transferMode: 'NEFT / RTGS',
        accountType: 'Current Account',
        accountHolderName: 'Company 2',
        accountNo: '50200088192014',
        ifscCode: 'HDFC0000054',
        micrCode: '302240002',
        branchAddress: 'C-Scheme, Jaipur - 302001',
        cancelledChequeDoc: { fileName: 'Cheque_HDFC.pdf', fileSize: '810 KB', uploadDate: '24/08/2026', status: 'uploaded' }
      },
      documents: this.createSampleDocs()
    },
    {
      id: 't-3',
      appRef: 'APP-2024-003',
      appliedDate: '14-Jul-2026',
      closingDate: '25-Oct-2026', // Future date - Window Open
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      schemeName: 'MMKVY',
      schemeCategory: 'Samarth',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdAmount: '₹ 35,000',
      processingFee: '₹ 2,000',
      transactionRef: 'GRN-RAJ-2026-551920',
      emdTransactionRef: 'GRN-RAJ-2026-551921',
      submittedStatus: 'Under Review',
      eoiStatus: 'Under Review',
      editCount: 2, // 1 remaining
      maxEdits: 3,
      orgDetails: {
        shortName: 'Company 3',
        fullName: 'Company 3',
        natureOfEntity: 'Section 8 Company',
        registrationNumber: 'U85300RJ2020NPL068192',
        dateOfRegistration: '19/08/2020',
        stateOfLegalReg: 'Rajasthan',
        registrationCertDoc: { fileName: 'Sec8_License.pdf', fileSize: '1.5 MB', uploadDate: '14/07/2026', status: 'uploaded' },
        companyPan: 'AAACR7718M',
        panCardDoc: { fileName: 'Company_PAN.pdf', fileSize: '820 KB', uploadDate: '14/07/2026', status: 'uploaded' },
        gstRegistered: 'Yes',
        gstin: '08AAACR7718M1Z2',
        gstCertDoc: { fileName: 'GST_Cert.pdf', fileSize: '920 KB', uploadDate: '14/07/2026', status: 'uploaded' },
        msmeRegistered: 'Yes',
        udyamNumber: 'UDYAM-RJ-14-0091823',
        msmeCertDoc: { fileName: 'Udyam.pdf', fileSize: '700 KB', uploadDate: '14/07/2026', status: 'uploaded' },
        turnOver: '380',
        financialYears: [
          { year: '2025-26', totalTurnover: '380', skillTurnover: '290' },
          { year: '2024-25', totalTurnover: '310', skillTurnover: '210' },
          { year: '2023-24', totalTurnover: '220', skillTurnover: '150' }
        ],
        turnoverCertDoc: { fileName: 'Turnover.pdf', fileSize: '1.2 MB', uploadDate: '14/07/2026', status: 'uploaded' },
        blackListed: 'No',
        nsdcPartner: 'Non-Funded Partner',
        contactNo: '9829001928',
        emailId: 'contact@company3.org',
        website: 'https://company3.org',
        registeredAddress: '102, RIICO Complex, Sitapura, Jaipur',
        registeredState: 'Rajasthan',
        registeredDistrict: 'Udaipur',
        registeredPincode: '302022',
        sameAsRegistered: true,
        officeAddress: '102, RIICO Complex, Sitapura, Jaipur',
        officeState: 'Rajasthan',
        officeDistrict: 'Udaipur',
        officePincode: '302022'
      },
      signatoryDetails: {
        name: 'Manoj Kumar Mathur',
        dob: '22/04/1980',
        age: '46',
        designation: 'Chief Executive Officer',
        pan: 'AAAPM1129P',
        emailId: 'ceo@company3.org',
        mobileNo: '9829001928',
        aadhaarNo: '6612 0019 4481',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        state: 'Rajasthan',
        residenceAddress: 'D-88, Mansarovar, Jaipur - 302020',
        authorizationLetterDoc: { fileName: 'Board_Auth.pdf', fileSize: '1.3 MB', uploadDate: '14/07/2026', status: 'uploaded' },
        idProofDoc: { fileName: 'CEO_ID.pdf', fileSize: '800 KB', uploadDate: '14/07/2026', status: 'uploaded' }
      },
      officers: [
        {
          id: 'OIC-1',
          name: 'Pooja Agarwal',
          designation: 'Operations Lead',
          mobileNo: '9829110022',
          emailId: 'pooja.a@company3.org',
          pan: 'AAAPA9911D',
          aadhaarNo: '7781 2291 0014',
          bhamashahNo: '',
          voterIdNo: '',
          passportNo: '',
          appointmentLetterDoc: { fileName: 'Appointment_Pooja.pdf', fileSize: '900 KB', uploadDate: '14/07/2026', status: 'uploaded' },
          idProofDoc: null
        }
      ],
      bankDetails: {
        bankName: 'ICICI Bank',
        branchName: 'Sitapura Industrial Area, Jaipur',
        transferMode: 'NEFT / RTGS',
        accountType: 'Current Account',
        accountHolderName: 'Company 3',
        accountNo: '001205018921',
        ifscCode: 'ICIC0000012',
        micrCode: '302229005',
        branchAddress: 'Sitapura, Jaipur - 302022',
        cancelledChequeDoc: { fileName: 'Cheque_ICICI.pdf', fileSize: '850 KB', uploadDate: '14/07/2026', status: 'uploaded' }
      },
      documents: this.createSampleDocs()
    },
    {
      id: 't-4',
      appRef: 'APP-2024-004',
      appliedDate: '20-Nov-2025',
      closingDate: '20-Nov-2025', // Past date - Submission Window Closed
      schemeTitle: 'Indira Mahila Shakti Kaushal Samarthya Yojana (IM-Shakti)',
      schemeName: 'IM_Shakti',
      schemeCategory: 'Samarth',
      department: 'Ministry of Rural Development / RSLDC',
      emdAmount: '₹ 25,000',
      processingFee: '₹ 2,000',
      transactionRef: 'GRN-RAJ-2025-330102',
      emdTransactionRef: 'GRN-RAJ-2025-330103',
      submittedStatus: 'Rejected',
      eoiStatus: 'Reviewed',
      rejectionReason: 'Annual turnover criteria not met for last 3 financial years (CA certificate missing valid UDIN).',
      editCount: 1, // Cannot edit because closingDate has passed
      maxEdits: 3,
      orgDetails: {
        shortName: 'Company 4',
        fullName: 'Company 4',
        natureOfEntity: 'Registered Society',
        registrationNumber: 'SOC/RAJ/2017/9912',
        dateOfRegistration: '12/03/2017',
        stateOfLegalReg: 'Rajasthan',
        registrationCertDoc: { fileName: 'Soc_Cert.pdf', fileSize: '1.1 MB', uploadDate: '20/11/2025', status: 'uploaded' },
        companyPan: 'AAASG8812K',
        panCardDoc: { fileName: 'PAN.pdf', fileSize: '700 KB', uploadDate: '20/11/2025', status: 'uploaded' },
        gstRegistered: 'Yes',
        gstin: '08AAASG8812K1Z4',
        gstCertDoc: { fileName: 'GST.pdf', fileSize: '800 KB', uploadDate: '20/11/2025', status: 'uploaded' },
        msmeRegistered: 'No',
        udyamNumber: '',
        msmeCertDoc: null,
        turnOver: '180',
        financialYears: [
          { year: '2024-25', totalTurnover: '180', skillTurnover: '120' },
          { year: '2023-24', totalTurnover: '150', skillTurnover: '100' },
          { year: '2022-23', totalTurnover: '110', skillTurnover: '80' }
        ],
        turnoverCertDoc: { fileName: 'Turnover_Old.pdf', fileSize: '950 KB', uploadDate: '20/11/2025', status: 'uploaded' },
        blackListed: 'No',
        nsdcPartner: 'Non-Partner',
        contactNo: '9828019283',
        emailId: 'contact@company4.org',
        website: 'https://company4.org',
        registeredAddress: 'Village Post Sanganer, Jaipur',
        registeredState: 'Rajasthan',
        registeredDistrict: 'Jaipur',
        registeredPincode: '302029',
        sameAsRegistered: true,
        officeAddress: 'Village Post Sanganer, Jaipur',
        officeState: 'Rajasthan',
        officeDistrict: 'Jaipur',
        officePincode: '302029'
      },
      signatoryDetails: {
        name: 'Rameshwar Lal Gurjar',
        dob: '10/01/1975',
        age: '51',
        designation: 'President',
        pan: 'AAAPG4412F',
        emailId: 'president@company4.org',
        mobileNo: '9828019283',
        aadhaarNo: '3312 9901 8841',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        state: 'Rajasthan',
        residenceAddress: 'Sanganer, Jaipur - 302029',
        authorizationLetterDoc: { fileName: 'Resolution.pdf', fileSize: '1.0 MB', uploadDate: '20/11/2025', status: 'uploaded' },
        idProofDoc: { fileName: 'Aadhaar.pdf', fileSize: '600 KB', uploadDate: '20/11/2025', status: 'uploaded' }
      },
      officers: [
        {
          id: 'OIC-1',
          name: 'Mukesh Sharma',
          designation: 'Center Manager',
          mobileNo: '9828112233',
          emailId: 'mukesh@company4.org',
          pan: 'AAAPM8811K',
          aadhaarNo: '8812 3341 9901',
          bhamashahNo: '',
          voterIdNo: '',
          passportNo: '',
          appointmentLetterDoc: { fileName: 'Mukesh_Appt.pdf', fileSize: '750 KB', uploadDate: '20/11/2025', status: 'uploaded' },
          idProofDoc: null
        }
      ],
      bankDetails: {
        bankName: 'Punjab National Bank',
        branchName: 'Sanganer Branch, Jaipur',
        transferMode: 'NEFT / RTGS',
        accountType: 'Current Account',
        accountHolderName: 'Company 4',
        accountNo: '18920021008419',
        ifscCode: 'PUNB0189200',
        micrCode: '302024018',
        branchAddress: 'Sanganer, Jaipur - 302029',
        cancelledChequeDoc: { fileName: 'PNB_Cheque.pdf', fileSize: '790 KB', uploadDate: '20/11/2025', status: 'uploaded' }
      },
      documents: this.createSampleDocs()
    },
    {
      id: 't-5',
      appRef: 'ISMS-EOI-2026-5520',
      appliedDate: '12-Sep-2026',
      closingDate: '10-Dec-2026', // Future date - Window Open
      schemeTitle: 'Rajasthan Yuva Sambal Yojana (RYSY) - Self-Employment Skilling',
      schemeName: 'RYSY',
      schemeCategory: 'Self-Employment',
      department: 'Directorate of Skill Development',
      emdAmount: '₹ 40,000',
      processingFee: '₹ 2,000',
      transactionRef: 'GRN-RAJ-2026-661520',
      emdTransactionRef: 'GRN-RAJ-2026-661521',
      submittedStatus: 'Submitted',
      eoiStatus: '-',
      editCount: 3, // Max 3 edits already used -> Locked
      maxEdits: 3,
      orgDetails: {
        shortName: 'YuvaSkill',
        fullName: 'Yuva Skill Foundation Pvt Ltd',
        natureOfEntity: 'Private Limited Company',
        registrationNumber: 'U80903RJ2021PTC074192',
        dateOfRegistration: '05/05/2021',
        stateOfLegalReg: 'Rajasthan',
        registrationCertDoc: { fileName: 'COI.pdf', fileSize: '1.3 MB', uploadDate: '12/09/2026', status: 'uploaded' },
        companyPan: 'AAACY9914P',
        panCardDoc: { fileName: 'PAN.pdf', fileSize: '750 KB', uploadDate: '12/09/2026', status: 'uploaded' },
        gstRegistered: 'Yes',
        gstin: '08AAACY9914P1Z3',
        gstCertDoc: { fileName: 'GST.pdf', fileSize: '850 KB', uploadDate: '12/09/2026', status: 'uploaded' },
        msmeRegistered: 'Yes',
        udyamNumber: 'UDYAM-RJ-14-0033190',
        msmeCertDoc: { fileName: 'Udyam.pdf', fileSize: '620 KB', uploadDate: '12/09/2026', status: 'uploaded' },
        turnOver: '390',
        financialYears: [
          { year: '2025-26', totalTurnover: '390', skillTurnover: '300' },
          { year: '2024-25', totalTurnover: '320', skillTurnover: '240' },
          { year: '2023-24', totalTurnover: '250', skillTurnover: '180' }
        ],
        turnoverCertDoc: { fileName: 'Turnover.pdf', fileSize: '1.1 MB', uploadDate: '12/09/2026', status: 'uploaded' },
        blackListed: 'No',
        nsdcPartner: 'Non-Funded Partner',
        contactNo: '9829554433',
        emailId: 'info@yuvaskill.org',
        website: 'https://yuvaskill.org',
        registeredAddress: 'G-14, Subhash Nagar, Jaipur',
        registeredState: 'Rajasthan',
        registeredDistrict: 'Jaipur',
        registeredPincode: '302016',
        sameAsRegistered: true,
        officeAddress: 'G-14, Subhash Nagar, Jaipur',
        officeState: 'Rajasthan',
        officeDistrict: 'Jaipur',
        officePincode: '302016'
      },
      signatoryDetails: {
        name: 'Deepak Choudhary',
        dob: '18/07/1982',
        age: '44',
        designation: 'Managing Director',
        pan: 'AAAPC8812N',
        emailId: 'deepak@yuvaskill.org',
        mobileNo: '9829554433',
        aadhaarNo: '9901 2284 5512',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        state: 'Rajasthan',
        residenceAddress: 'Subhash Nagar, Jaipur - 302016',
        authorizationLetterDoc: { fileName: 'Auth.pdf', fileSize: '1.1 MB', uploadDate: '12/09/2026', status: 'uploaded' },
        idProofDoc: { fileName: 'ID.pdf', fileSize: '700 KB', uploadDate: '12/09/2026', status: 'uploaded' }
      },
      officers: [
        {
          id: 'OIC-1',
          name: 'Nitin Soni',
          designation: 'Coordinator',
          mobileNo: '9829887766',
          emailId: 'nitin@yuvaskill.org',
          pan: 'AAAPS4412L',
          aadhaarNo: '4419 8812 0033',
          bhamashahNo: '',
          voterIdNo: '',
          passportNo: '',
          appointmentLetterDoc: { fileName: 'Nitin_Appt.pdf', fileSize: '800 KB', uploadDate: '12/09/2026', status: 'uploaded' },
          idProofDoc: null
        }
      ],
      bankDetails: {
        bankName: 'Bank of Baroda',
        branchName: 'Subhash Nagar, Jaipur',
        transferMode: 'NEFT / RTGS',
        accountType: 'Current Account',
        accountHolderName: 'Yuva Skill Foundation Pvt Ltd',
        accountNo: '04820200001928',
        ifscCode: 'BARB0SUBHAI',
        micrCode: '302012014',
        branchAddress: 'Subhash Nagar, Jaipur - 302016',
        cancelledChequeDoc: { fileName: 'Cheque_BOB.pdf', fileSize: '820 KB', uploadDate: '12/09/2026', status: 'uploaded' }
      },
      documents: this.createSampleDocs()
    }
  ]);

  readonly filteredTenders = computed(() => {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.tenders();

    return this.tenders().filter(t =>
      t.appRef.toLowerCase().includes(query) ||
      t.schemeTitle.toLowerCase().includes(query) ||
      t.department.toLowerCase().includes(query) ||
      t.submittedStatus.toLowerCase().includes(query) ||
      t.eoiStatus.toLowerCase().includes(query) ||
      (t.rejectionReason && t.rejectionReason.toLowerCase().includes(query)) ||
      t.transactionRef.toLowerCase().includes(query)
    );
  });

  /**
   * Helper to verify if current date is strictly before the submission closing date
   */
  isBeforeClosingDate(closingDateStr?: string): boolean {
    if (!closingDateStr) return true;
    try {
      const parts = closingDateStr.split(/[-/]/);
      if (parts.length === 3) {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const day = parseInt(parts[0], 10);
        let month = -1;
        let year = parseInt(parts[2], 10);

        const mIdx = monthNames.indexOf(parts[1].toLowerCase().slice(0, 3));
        if (mIdx !== -1) {
          month = mIdx;
        } else {
          month = parseInt(parts[1], 10) - 1;
        }
        if (year < 100) year += 2000;
        const closing = new Date(year, month, day, 23, 59, 59);
        return new Date().getTime() <= closing.getTime();
      }
    } catch {
      return true;
    }
    return true;
  }

  canEdit(tender: SubmittedTender): boolean {
    return this.isBeforeClosingDate(tender.closingDate) && (tender.editCount || 0) < (tender.maxEdits || 3);
  }

  remainingEdits(tender: SubmittedTender): number {
    return Math.max(0, (tender.maxEdits || 3) - (tender.editCount || 0));
  }

  currentApplication(): SubmittedTender {
    return this.editableTender || this.selectedTender()!;
  }

  openApplicationPage(tender: SubmittedTender): void {
    this.selectedTender.set(tender);
    this.editableTender = null;
    this.isEditing.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToTenderList(): void {
    this.selectedTender.set(null);
    this.editableTender = null;
    this.isEditing.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEditing(): void {
    const tender = this.selectedTender();
    if (!tender) return;

    if (!this.canEdit(tender)) {
      if (tender.editCount >= 3) {
        this.showToast('Maximum 3 edits limit reached for this application.', 'warning');
      } else {
        this.showToast(`Submission window closed on ${tender.closingDate}. Editing is locked.`, 'error');
      }
      return;
    }

    // Deep clone active tender for editing
    this.editableTender = JSON.parse(JSON.stringify(tender));
    this.isEditing.set(true);
    this.showToast(`Editing active. You have ${this.remainingEdits(tender)} edit(s) remaining.`, 'warning');
  }

  saveEdits(): void {
    if (!this.editableTender || !this.selectedTender()) return;

    // Increment edit count by 1
    const newEditCount = (this.editableTender.editCount || 0) + 1;
    this.editableTender.editCount = newEditCount;

    const updated = { ...this.editableTender };

    // Update in reactive signal list
    this.tenders.update(list => list.map(t => t.id === updated.id ? updated : t));
    this.selectedTender.set(updated);
    this.editableTender = null;
    this.isEditing.set(false);

    const remaining = Math.max(0, 3 - newEditCount);
    this.showToast(
      `✓ Application updated successfully! Used edit ${newEditCount} of 3 (${remaining} remaining).`,
      'success'
    );
  }

  cancelEditing(): void {
    this.editableTender = null;
    this.isEditing.set(false);
    this.showToast('Edit discarded. No changes made.', 'warning');
  }

  // Document Viewer Helpers
  viewDoc(fileName: string, title?: string, fileSize?: string): void {
    this.activeViewerDoc.set({
      fileName,
      fileSize: fileSize || '1.2 MB',
      uploadDate: 'Verified & Attached',
      status: 'uploaded'
    });
    this.activeViewerTitle.set(title || fileName);
    this.isViewerOpen.set(true);
  }

  closeViewer(): void {
    this.isViewerOpen.set(false);
    this.activeViewerDoc.set(null);
  }

  replaceOtrDoc(event: Event, docType: 'regCert' | 'panCard' | 'gstCert' | 'msmeCert' | 'turnoverCert' | 'authLetter' | 'authIdProof' | 'bankDoc'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.editableTender) return;
    const file = input.files[0];
    const sizeMb = file.size / (1024 * 1024);
    const fileSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    const fileDoc: FileDoc = {
      fileName: file.name,
      fileSize,
      uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'uploaded'
    };

    switch (docType) {
      case 'regCert':
        this.editableTender.orgDetails.registrationCertDoc = fileDoc;
        break;
      case 'panCard':
        this.editableTender.orgDetails.panCardDoc = fileDoc;
        break;
      case 'gstCert':
        this.editableTender.orgDetails.gstCertDoc = fileDoc;
        break;
      case 'msmeCert':
        this.editableTender.orgDetails.msmeCertDoc = fileDoc;
        break;
      case 'turnoverCert':
        this.editableTender.orgDetails.turnoverCertDoc = fileDoc;
        break;
      case 'authLetter':
        this.editableTender.signatoryDetails.authorizationLetterDoc = fileDoc;
        break;
      case 'authIdProof':
        this.editableTender.signatoryDetails.idProofDoc = fileDoc;
        break;
      case 'bankDoc':
        this.editableTender.bankDetails.cancelledChequeDoc = fileDoc;
        break;
    }
    input.value = '';
    this.showToast(`Updated document: ${file.name}`, 'success');
  }

  replaceDoc(event: Event, doc: SubmittedTenderDoc): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.editableTender) return;
    const file = input.files[0];
    const sizeMb = file.size / (1024 * 1024);
    const fileSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const docItem = this.editableTender.documents.find(d => d.id === doc.id);
    if (docItem) {
      docItem.fileName = file.name;
      docItem.fileSize = fileSize;
      docItem.status = 'uploaded';
      this.showToast(`Replaced ${doc.name} with ${file.name}`, 'success');
    }
    input.value = '';
  }

  showToast(msg: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 4500);
  }

  printApplication(): void {
    window.print();
  }

  downloadAcknowledgmentReceipt(): void {
    const app = this.currentApplication();
    const filename = `EOI_Acknowledgment_Receipt_${app.appRef}.html`;
    const docRows = app.documents.map(d => `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #64748b;">${d.id}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a;">${d.name}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #475569;">${d.category === 'mandatory' ? 'Mandatory Statutory' : (d.category === 'annexure' ? 'Scheme Annexure' : 'Supporting')}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #1e293b;">${d.fileName ? `${d.fileName} (${d.fileSize})` : 'Attached (Verified)'}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EOI Proposal Submission Acknowledgment - ${app.appRef}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .gov-title { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    .sub-title { font-size: 12px; color: #334155; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #0B3558; border: 1px solid #cbd5e1; }
    .section-title { font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>

  <div class="header-box">
    <div>
      <div class="gov-title">Government of Rajasthan &bull; Department of Skill, Employment &amp; Entrepreneurship</div>
      <div class="main-title">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</div>
      <div class="sub-title">Official EOI Proposal Submission Acknowledgment Receipt (Form RSLDC-EOI-ACK)</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Application Ref: ${app.appRef}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Applied Date: ${app.appliedDate}</div>
    </div>
  </div>

  <div class="section-title">1. Applicant Organisation &amp; Scheme Details</div>
  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">Applicant Organisation</td><td>${app.orgDetails.fullName}</td><td style="width: 20%; font-weight: bold; background: #f8fafc;">CIN / Reg No</td><td style="font-family: monospace;">${app.orgDetails.registrationNumber}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Scheme Name</td><td>${app.schemeTitle}</td><td style="font-weight: bold; background: #f8fafc;">Category</td><td>${app.schemeCategory}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Organisation PAN / GSTIN</td><td style="font-family: monospace;">${app.orgDetails.companyPan} / ${app.orgDetails.gstin || 'NA'}</td><td style="font-weight: bold; background: #f8fafc;">Submission Status</td><td style="font-weight: bold; color: #15803d;">${app.submittedStatus.toUpperCase()}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Authorized Person</td><td>${app.signatoryDetails.name} (${app.signatoryDetails.designation})</td><td style="font-weight: bold; background: #f8fafc;">Contact &amp; Email</td><td>${app.signatoryDetails.mobileNo} | ${app.signatoryDetails.emailId}</td></tr>
  </table>

  <div class="section-title">2. Mandatory Proposal Documents Checklist (16 Documents)</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document Name</th><th>Classification</th><th>Attached File</th></tr></thead>
    <tbody>${docRows}</tbody>
  </table>

  <div class="section-title">3. Statutory Undertaking</div>
  <p style="font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
    Digitally authenticated and submitted by <strong>${app.signatoryDetails.name}</strong> on ${app.appliedDate}. All particulars and annexed documents are verified authentic.
  </p>

  <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
    <div>Generated from ISMS 2.0 &bull; Official RSLDC EOI Record</div>
    <div>Date: ${app.appliedDate}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

downloadChallanReceipt(): void {
  const app = this.currentApplication();
  const filename = `Cyber_Treasury_eChallan_${app.emdTransactionRef || 'GRN-RAJ-2026-981241'}.html`;
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Treasury Rajasthan - e-Challan Receipt (Form GA-57)</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
    .gov-title { font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print e-Challan / Save as PDF</button>
  </div>

  <div class="header-box">
    <div class="gov-title">Finance Department &bull; Cyber Treasury Rajasthan (e-GRAS)</div>
    <div class="main-title">e-Challan / Treasury Remittance Receipt (Form GA-57)</div>
    <div style="font-size: 11px; color: #64748b;">Government of Rajasthan &bull; https://gras.rajasthan.gov.in</div>
  </div>

  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">GRN Number</td><td style="font-family: monospace; font-weight: bold; color: #0B3558;">${app.emdTransactionRef || 'GRN-RAJ-2026-981241'}</td><td style="width: 20%; font-weight: bold; background: #f8fafc;">Payment Date</td><td>${app.appliedDate}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Remitter Name</td><td>${app.orgDetails.fullName}</td><td style="font-weight: bold; background: #f8fafc;">Company PAN</td><td style="font-family: monospace;">${app.orgDetails.companyPan}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Department</td><td colspan="3">${app.department}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Scheme Ref No</td><td style="font-family: monospace;">${app.appRef}</td><td style="font-weight: bold; background: #f8fafc;">Status</td><td style="font-weight: bold; color: #15803d;">SUCCESS / PAID</td></tr>
  </table>

  <div style="font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; margin: 15px 0 8px 0;">Head of Account Details</div>
  <table>
    <thead><tr><th>Particulars</th><th>Treasury Head Code</th><th>GRN Ref</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td>EOI Processing Fee</td><td style="font-family: monospace;">0070-60-800-01-00</td><td style="font-family: monospace;">${app.transactionRef || 'GRN-RAJ-2026-981240'}</td><td style="text-align: right; font-weight: bold;">${app.processingFee}</td></tr>
      <tr><td>Earnest Money Deposit (EMD)</td><td style="font-family: monospace;">8443-00-103-00-00</td><td style="font-family: monospace;">${app.emdTransactionRef || 'GRN-RAJ-2026-981241'}</td><td style="text-align: right; font-weight: bold;">${app.emdAmount}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="3" style="text-align: right; text-transform: uppercase;">Total Amount Remitted:</td><td style="text-align: right; color: #0B3558; font-size: 13px;">₹ 52,000.00</td></tr>
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
}
