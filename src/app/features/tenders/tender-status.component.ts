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
import {
  SubmittedTender,
  SubmittedTenderDoc,
  MOCK_SUBMITTED_TENDERS
} from '../../core/mock/data/tenders.mock';

export type { SubmittedTender, SubmittedTenderDoc };

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
                class="w-full pl-9 pr-7 py-2 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B3558] transition-colors font-normal shadow-2xs"
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

      @if (selectedTender()) {
        <div class="p-4 sm:p-6 lg:p-8 space-y-5 font-sans animate-in fade-in duration-150">
          
          <!-- Top Navigation Header with Back Button -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="backToTenderList()"
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Tender Status</span>
              </button>

              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm sm:text-base font-bold text-[#174A6E]">
                    {{ selectedTender()!.appRef }}
                  </span>
                  <span
                    class="text-[11px] font-medium px-2.5 py-0.5 rounded"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-800 border border-emerald-200': selectedTender()!.submittedStatus === 'Accepted',
                      'bg-amber-50 text-amber-800 border border-amber-200': selectedTender()!.submittedStatus === 'Under Review',
                      'bg-sky-50 text-sky-800 border border-sky-200': selectedTender()!.submittedStatus === 'Submitted',
                      'bg-rose-50 text-rose-800 border border-rose-200': selectedTender()!.submittedStatus === 'Rejected'
                    }"
                  >
                    {{ selectedTender()!.submittedStatus }}
                  </span>
                  @if (isEditing()) {
                    <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded">
                      Edit Mode Active
                    </span>
                  }
                </div>
                <h2 class="text-sm sm:text-base font-semibold text-slate-800">
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
                  class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes (Consumes 1 Edit)</span>
                </button>
                <button
                  type="button"
                  (click)="cancelEditing()"
                  class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
              } @else {
                @if (canEdit(selectedTender()!)) {
                  <button
                    type="button"
                    (click)="startEditing()"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Application</span>
                  </button>
                } @else if (selectedTender()!.editCount >= 3) {
                  <span class="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium select-none">
                    Max 3/3 Edits Used (Locked)
                  </span>
                } @else {
                  <span class="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium select-none">
                    Submission Closed
                  </span>
                }

                <button
                  type="button"
                  (click)="printApplication()"
                  class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
              }
            </div>

          </div>

          <!-- Top Edits Status Strip -->
          <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs font-sans">
            <div class="flex items-center gap-2 flex-wrap text-slate-600">
              <span class="font-semibold text-slate-800">Edits Allowed:</span>
              <span>3 Edits Only</span>
              <span class="text-slate-300">&bull;</span>
              <span class="text-slate-500">Max 3 edit attempts allowed before closing date ({{ selectedTender()!.closingDate }})</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 text-slate-700 font-medium">
              <span [ngClass]="selectedTender()!.editCount >= 3 ? 'text-rose-700 font-semibold' : 'text-slate-900 font-semibold'">
                {{ selectedTender()!.editCount }} of 3 Used
              </span>
              <span class="text-slate-500">({{ remainingEdits(selectedTender()!) }} Remaining)</span>
            </div>
          </div>

          @if (isEditing()) {
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2 text-xs font-sans">
              <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div class="leading-relaxed">
                <span class="font-semibold block">You are currently editing this application:</span>
                <span class="text-slate-700">Saving changes will consume 1 edit attempt ({{ remainingEdits(selectedTender()!) }} remaining). You can edit up to 3 times before the closing date (<strong>{{ selectedTender()!.closingDate }}</strong>).</span>
              </div>
            </div>
          }

          <!-- Fee Verification Summary Card -->
          <div class="p-4 sm:p-5 rounded-lg bg-white border border-slate-200 text-xs space-y-3">
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 flex-wrap gap-2">
              <span class="font-semibold text-[#174A6E] text-xs">
                Fee Payments &amp; Treasury Verification Status (Settled)
              </span>
              <span class="font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-[11px]">
                Total Fees Settled: ₹ 52,000.00
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Processing Fee Block -->
              <div class="p-3 bg-[#F5F7F9] border border-slate-200 rounded-lg space-y-2">
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span class="font-medium text-slate-800 text-xs">1. EOI RFP Processing Fee</span>
                  <span class="font-medium text-emerald-700 text-[11px]">Paid</span>
                </div>
                <div class="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-600">
                  <div><span class="text-slate-500 text-[11px] block">Amount</span><span class="font-medium text-slate-900">{{ currentApplication().processingFee }}</span></div>
                  <div><span class="text-slate-500 text-[11px] block">Payment Mode</span><span class="font-medium text-slate-900">Cyber Treasury e-GRAS</span></div>
                  <div><span class="text-slate-500 text-[11px] block">Challan GRN</span><span class="font-mono text-slate-900">{{ currentApplication().transactionRef }}</span></div>
                  <div><span class="text-slate-500 text-[11px] block">Settled On</span><span class="font-medium text-slate-900">{{ currentApplication().appliedDate }}</span></div>
                </div>
              </div>

              <!-- EMD Fee Block -->
              <div class="p-3 bg-[#F5F7F9] border border-slate-200 rounded-lg space-y-2">
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span class="font-medium text-slate-800 text-xs">2. Earnest Money Deposit (EMD)</span>
                  <span class="font-medium text-emerald-700 text-[11px]">Deposited</span>
                </div>
                <div class="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-600">
                  <div><span class="text-slate-500 text-[11px] block">Amount</span><span class="font-medium text-slate-900">{{ currentApplication().emdAmount }}</span></div>
                  <div><span class="text-slate-500 text-[11px] block">Payment Mode</span><span class="font-medium text-slate-900">Cyber Treasury e-GRAS</span></div>
                  <div><span class="text-slate-500 text-[11px] block">Challan GRN</span><span class="font-mono text-slate-900">{{ currentApplication().emdTransactionRef }}</span></div>
                  <div><span class="text-slate-500 text-[11px] block">Settled On</span><span class="font-medium text-slate-900">{{ currentApplication().appliedDate }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================================
               ALL APPLICATION SECTIONS IN ONE CONTINUOUS PAGE
               ================================================================ -->
          <div class="space-y-5 text-xs">
            
            <!-- SECTION 1: Organisation Details & Legal Registration -->
            <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="font-semibold text-slate-900 text-sm">
                  1. Organisation Details &amp; Legal Registration
                </h3>
                @if (isEditing()) {
                  <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
                }
              </div>

              @if (isEditing()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div class="sm:col-span-2">
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.fullName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Nature of Entity *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.natureOfEntity" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Registration No. (CIN / Reg. No.) *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.registrationNumber" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Date of Registration *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.dateOfRegistration" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">State / UT of Registration *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.stateOfLegalReg" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation PAN *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.companyPan" class="w-full px-2.5 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">GST Registered *</label>
                    <select [(ngModel)]="editableTender!.orgDetails.gstRegistered" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">GSTIN</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.gstin" [disabled]="editableTender!.orgDetails.gstRegistered !== 'Yes'" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md enabled:bg-white disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">MSME / Udyam Registered *</label>
                    <select [(ngModel)]="editableTender!.orgDetails.msmeRegistered" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Udyam Registration Number</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.udyamNumber" [disabled]="editableTender!.orgDetails.msmeRegistered !== 'Yes'" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md enabled:bg-white disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">NSDC Partner</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.nsdcPartner" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation Contact No. *</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.contactNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Organisation Email ID *</label>
                    <input type="email" [(ngModel)]="editableTender!.orgDetails.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Website</label>
                    <input type="text" [(ngModel)]="editableTender!.orgDetails.website" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Registered Address *</label>
                    <textarea [(ngModel)]="editableTender!.orgDetails.registeredAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]"></textarea>
                  </div>
                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Office Address *</label>
                    <textarea [(ngModel)]="editableTender!.orgDetails.officeAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]"></textarea>
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
                  <div class="sm:col-span-2"><span class="text-slate-500 block text-[11px] mb-0.5">Organisation Name</span><span class="font-medium text-slate-900">{{ currentApplication().orgDetails.fullName || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Nature of Entity</span><span class="font-medium text-slate-900">{{ currentApplication().orgDetails.natureOfEntity || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">CIN / Reg No</span><span class="font-mono text-slate-900 font-medium">{{ currentApplication().orgDetails.registrationNumber || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Date of Registration</span><span class="font-medium text-slate-900">{{ currentApplication().orgDetails.dateOfRegistration || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">State / UT of Registration</span><span class="font-medium text-slate-900">{{ currentApplication().orgDetails.stateOfLegalReg || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Organisation PAN</span><span class="font-mono text-slate-900 font-medium">{{ currentApplication().orgDetails.companyPan || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">GST Registered</span><span class="font-mono text-slate-900">{{ currentApplication().orgDetails.gstRegistered === 'Yes' ? (currentApplication().orgDetails.gstin || 'Yes') : 'No' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">MSME / Udyam Registered</span><span class="font-mono text-slate-900">{{ currentApplication().orgDetails.msmeRegistered === 'Yes' ? (currentApplication().orgDetails.udyamNumber || 'Yes') : 'No' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">NSDC Partner</span><span class="font-medium text-slate-900">{{ currentApplication().orgDetails.nsdcPartner || 'Not Applicable' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Organisation Contact No.</span><span class="font-mono text-slate-900">{{ currentApplication().orgDetails.contactNo || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Organisation Email ID</span><span class="font-medium text-slate-900">{{ currentApplication().orgDetails.emailId || '-' }}</span></div>
                  <div class="sm:col-span-2"><span class="text-slate-500 block text-[11px] mb-0.5">Website</span><span class="font-medium text-[#174A6E]">{{ currentApplication().orgDetails.website || '-' }}</span></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Registered Address</span><span class="text-slate-900 leading-relaxed">{{ currentApplication().orgDetails.registeredAddress || '-' }}</span></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Office Address</span><span class="text-slate-900 leading-relaxed">{{ currentApplication().orgDetails.officeAddress || '-' }}</span></div>
                </div>
              }

              <!-- Attached Registration Documents -->
              <div class="pt-3 border-t border-slate-200 space-y-2.5">
                <span class="text-xs font-semibold text-slate-700 block">
                  Attached Registration Documents
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <!-- Incorporation Certificate -->
                  <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                    <div class="min-w-0 flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <rect width="24" height="24" rx="3" fill="#E5252A"/>
                        <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                      </svg>
                      <div class="min-w-0">
                        <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ currentApplication().orgDetails.registrationCertDoc?.fileName || 'Incorporation_Cert.pdf' }}</span>
                        <span class="text-[10px] text-slate-500">{{ currentApplication().orgDetails.registrationCertDoc?.fileSize || '1.4 MB' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.registrationCertDoc?.fileName || 'Incorporation_Cert.pdf', 'Certificate of Registration', '1.4 MB')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'regCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Organisation PAN Card -->
                  <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                    <div class="min-w-0 flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <rect width="24" height="24" rx="3" fill="#E5252A"/>
                        <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                      </svg>
                      <div class="min-w-0">
                        <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ currentApplication().orgDetails.panCardDoc?.fileName || 'Company_PAN.pdf' }}</span>
                        <span class="text-[10px] text-slate-500">{{ currentApplication().orgDetails.panCardDoc?.fileSize || '820 KB' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.panCardDoc?.fileName || 'Company_PAN.pdf', 'Organisation PAN Card', '820 KB')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'panCard')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- GST Certificate -->
                  <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                    <div class="min-w-0 flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <rect width="24" height="24" rx="3" fill="#E5252A"/>
                        <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                      </svg>
                      <div class="min-w-0">
                        <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ currentApplication().orgDetails.gstCertDoc?.fileName || 'GST_Cert.pdf' }}</span>
                        <span class="text-[10px] text-slate-500">{{ currentApplication().orgDetails.gstCertDoc?.fileSize || '910 KB' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.gstCertDoc?.fileName || 'GST_Cert.pdf', 'GST Certificate', '910 KB')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'gstCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Udyam MSME Certificate -->
                  <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                    <div class="min-w-0 flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <rect width="24" height="24" rx="3" fill="#E5252A"/>
                        <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                      </svg>
                      <div class="min-w-0">
                        <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ currentApplication().orgDetails.msmeCertDoc?.fileName || 'Udyam_Cert.pdf' }}</span>
                        <span class="text-[10px] text-slate-500">{{ currentApplication().orgDetails.msmeCertDoc?.fileSize || '650 KB' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().orgDetails.msmeCertDoc?.fileName || 'Udyam_Cert.pdf', 'Udyam Certificate', '650 KB')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
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
            <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="font-semibold text-slate-900 text-sm">
                  2. Authorized Person Details
                </h3>
                @if (isEditing()) {
                  <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
                }
              </div>

              @if (isEditing()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Full Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.name" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Designation</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.designation" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Date of Birth *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.dob" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Age</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.age" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">PAN *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.pan" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Mobile No. *</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.mobileNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Email Address *</label>
                    <input type="email" [(ngModel)]="editableTender!.signatoryDetails.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Aadhaar No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.aadhaarNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Bhamashah No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.bhamashahNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Voter ID No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.voterIdNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Passport No. (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.passportNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">State</label>
                    <input type="text" [(ngModel)]="editableTender!.signatoryDetails.state" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div class="sm:col-span-2 lg:col-span-4">
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Residential Address</label>
                    <textarea [(ngModel)]="editableTender!.signatoryDetails.residenceAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]"></textarea>
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Full Name</span><span class="font-medium text-slate-900">{{ currentApplication().signatoryDetails.name || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Designation</span><span class="font-medium text-slate-900">{{ currentApplication().signatoryDetails.designation || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Date of Birth / Age</span><span class="font-medium text-slate-900">{{ currentApplication().signatoryDetails.dob || '-' }} ({{ currentApplication().signatoryDetails.age || '42' }} Yrs)</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">PAN</span><span class="font-mono text-slate-900 font-medium">{{ currentApplication().signatoryDetails.pan || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Mobile No.</span><span class="font-mono text-slate-900">{{ currentApplication().signatoryDetails.mobileNo || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Email Address</span><span class="font-medium text-slate-900">{{ currentApplication().signatoryDetails.emailId || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Aadhaar No.</span><span class="font-mono text-slate-900">{{ currentApplication().signatoryDetails.aadhaarNo || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">State</span><span class="font-medium text-slate-900">{{ currentApplication().signatoryDetails.state || 'Rajasthan' }}</span></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Residential Address</span><span class="text-slate-900 leading-relaxed">{{ currentApplication().signatoryDetails.residenceAddress || '-' }}</span></div>
                </div>
              }

              <!-- Attached Signatory Documents -->
              <div class="pt-3 border-t border-slate-200 space-y-2.5">
                <span class="text-xs font-semibold text-slate-700 block">
                  Attached Signatory Documents
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <!-- Board Resolution -->
                  <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                    <div class="min-w-0 flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <rect width="24" height="24" rx="3" fill="#E5252A"/>
                        <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                      </svg>
                      <div class="min-w-0">
                        <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ currentApplication().signatoryDetails.authorizationLetterDoc?.fileName || 'Board_Resolution.pdf' }}</span>
                        <span class="text-[10px] text-slate-500">{{ currentApplication().signatoryDetails.authorizationLetterDoc?.fileSize || '1.2 MB' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().signatoryDetails.authorizationLetterDoc?.fileName || 'Board_Resolution.pdf', 'Authorization Letter / Board Resolution', '1.2 MB')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
                          Replace
                          <input type="file" (change)="replaceOtrDoc($event, 'authLetter')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      }
                    </div>
                  </div>

                  <!-- Signatory ID Proof -->
                  <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                    <div class="min-w-0 flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <rect width="24" height="24" rx="3" fill="#E5252A"/>
                        <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                      </svg>
                      <div class="min-w-0">
                        <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ currentApplication().signatoryDetails.idProofDoc?.fileName || 'Signatory_Aadhaar.pdf' }}</span>
                        <span class="text-[10px] text-slate-500">{{ currentApplication().signatoryDetails.idProofDoc?.fileSize || '750 KB' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" (click)="viewDoc(currentApplication().signatoryDetails.idProofDoc?.fileName || 'Signatory_Aadhaar.pdf', 'Authorized Person Identity Proof', '750 KB')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
                      @if (isEditing()) {
                        <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
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
            <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="font-semibold text-slate-900 text-sm">
                  3. Bank Details
                </h3>
                @if (isEditing()) {
                  <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
                }
              </div>

              @if (isEditing()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Name of the Bank *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.bankName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Branch Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.branchName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Transfer Mode *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.transferMode" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Account Type *</label>
                    <select [(ngModel)]="editableTender!.bankDetails.accountType" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]">
                      <option value="Current">Current</option>
                      <option value="Savings">Savings</option>
                      <option value="Current Account">Current Account</option>
                      <option value="Savings Account">Savings Account</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Account Holder Name *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.accountHolderName" class="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Account Number *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.accountNo" class="w-full px-2.5 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">IFSC Code *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.ifscCode" class="w-full px-2.5 py-1.5 text-xs font-mono font-medium border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div>
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">MICR Code (Optional)</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.micrCode" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                  <div class="sm:col-span-2 lg:col-span-4">
                    <label class="text-slate-600 block text-[11px] font-medium mb-1">Branch Address *</label>
                    <input type="text" [(ngModel)]="editableTender!.bankDetails.branchAddress" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#174A6E]" />
                  </div>
                </div>
              } @else {
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Name of the Bank</span><span class="font-medium text-slate-900">{{ currentApplication().bankDetails.bankName || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Branch Name</span><span class="font-medium text-slate-900">{{ currentApplication().bankDetails.branchName || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Transfer Mode</span><span class="font-medium text-slate-900">{{ currentApplication().bankDetails.transferMode || 'NEFT / RTGS' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Account Type</span><span class="font-medium text-slate-900">{{ currentApplication().bankDetails.accountType || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Account Holder Name</span><span class="font-medium text-slate-900">{{ currentApplication().bankDetails.accountHolderName || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">Account Number</span><span class="font-mono text-slate-900 font-medium">{{ currentApplication().bankDetails.accountNo || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">IFSC Code</span><span class="font-mono text-slate-900 font-medium">{{ currentApplication().bankDetails.ifscCode || '-' }}</span></div>
                  <div><span class="text-slate-500 block text-[11px] mb-0.5">MICR Code</span><span class="font-mono text-slate-900">{{ currentApplication().bankDetails.micrCode || '-' }}</span></div>
                  <div class="col-span-2 sm:col-span-4"><span class="text-slate-500 block text-[11px] mb-0.5">Branch Address</span><span class="text-slate-900 leading-relaxed">{{ currentApplication().bankDetails.branchAddress || '-' }}</span></div>
                </div>
              }

              <!-- Attached Bank Cheque -->
              <div class="pt-3 border-t border-slate-200">
                <div class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs max-w-md">
                  <div class="min-w-0 flex items-center gap-2">
                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <rect width="24" height="24" rx="3" fill="#E5252A"/>
                      <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                    </svg>
                    <div class="min-w-0">
                      <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ currentApplication().bankDetails.cancelledChequeDoc?.fileName || 'Cancelled_Cheque.pdf' }}</span>
                      <span class="text-[10px] text-slate-500">{{ currentApplication().bankDetails.cancelledChequeDoc?.fileSize || '890 KB' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button type="button" (click)="viewDoc(currentApplication().bankDetails.cancelledChequeDoc?.fileName || 'Cancelled_Cheque.pdf', 'Cancelled Cheque / Bank Passbook', '890 KB')" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
                    @if (isEditing()) {
                      <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
                        Replace
                        <input type="file" (change)="replaceOtrDoc($event, 'bankDoc')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                      </label>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 4: Mandated Proposal Documents (16 Uploaded Files) -->
            <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="font-semibold text-slate-900 text-sm">
                  4. Mandated Proposal Documents &amp; Annexures (16 Files Attached)
                </h3>
                @if (isEditing()) {
                  <span class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[11px]">Editing Active</span>
                }
              </div>

              <div class="border border-slate-200 rounded-lg overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#F5F7F9] font-semibold text-[11px] text-slate-600 border-b border-slate-200">
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
                      <tr class="hover:bg-slate-50/70">
                        <td class="p-2.5 text-center font-medium text-slate-400">{{ doc.id }}</td>
                        <td class="p-2.5 font-medium text-slate-800">{{ doc.name }}</td>
                        <td class="p-2.5">
                          <span class="text-[10.5px] font-medium text-slate-600">
                            {{ doc.category === 'mandatory' ? 'Mandatory Statutory' : (doc.category === 'annexure' ? 'Scheme Annexure' : 'Supporting') }}
                          </span>
                        </td>
                        <td class="p-2.5 font-mono text-[11px] text-slate-600">
                          {{ doc.fileName }} ({{ doc.fileSize }})
                        </td>
                        <td class="p-2.5 text-center">
                          <div class="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              (click)="viewDoc(doc.fileName, doc.name, doc.fileSize)"
                              class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer"
                            >
                              View
                            </button>
                            @if (isEditing()) {
                              <label class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#174A6E] rounded text-xs font-medium cursor-pointer">
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
            <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="font-semibold text-slate-900 text-sm">
                  5. Official Payment Receipts &amp; e-Challan Acknowledgement
                </h3>
              </div>

              <!-- Receipt 1: EOI Proposal Submission Acknowledgment -->
              <div class="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                  <div>
                    <div class="text-[10.5px] font-medium text-slate-500">Government of Rajasthan &bull; RSLDC</div>
                    <h4 class="text-xs sm:text-[13px] font-semibold text-slate-800">Proposal Submission Acknowledgment Slip (Form RSLDC-EOI-ACK)</h4>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                      {{ currentApplication().appRef }}
                    </span>
                    <button
                      type="button"
                      (click)="downloadAcknowledgmentReceipt()"
                      class="px-3 py-1 bg-[#0B3558] hover:bg-[#07233B] text-white rounded font-medium text-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                  <div><span class="text-slate-500 block text-[11px]">Applied Date</span><span class="font-medium text-slate-900">{{ currentApplication().appliedDate }}</span></div>
                  <div><span class="text-slate-500 block text-[11px]">Remitter Name</span><span class="font-medium text-slate-900">{{ currentApplication().orgDetails.fullName }}</span></div>
                  <div><span class="text-slate-500 block text-[11px]">CIN / PAN</span><span class="font-mono font-medium text-slate-900">{{ currentApplication().orgDetails.registrationNumber }} / {{ currentApplication().orgDetails.companyPan }}</span></div>
                  <div><span class="text-slate-500 block text-[11px]">Submission Status</span><span class="font-semibold text-emerald-700">Submitted</span></div>
                </div>
              </div>

              <!-- Receipt 2: Cyber Treasury e-GRAS Challan -->
              <div class="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                  <div>
                    <div class="text-[10.5px] font-medium text-slate-500">Finance Department &bull; Cyber Treasury (e-GRAS)</div>
                    <h4 class="text-xs sm:text-[13px] font-semibold text-slate-800">e-Challan / Treasury Receipt (Form GA-57)</h4>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                      {{ currentApplication().emdTransactionRef }}
                    </span>
                    <button
                      type="button"
                      (click)="downloadChallanReceipt()"
                      class="px-3 py-1 bg-[#0B3558] hover:bg-[#07233B] text-white rounded font-medium text-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <table class="w-full text-xs border border-slate-200 border-collapse">
                  <thead class="bg-[#F5F7F9] font-semibold text-[11px] text-slate-600">
                    <tr>
                      <th class="p-2 text-left border-r border-slate-200">Fee Particulars</th>
                      <th class="p-2 text-left border-r border-slate-200">Treasury Head</th>
                      <th class="p-2 text-left border-r border-slate-200">Challan GRN</th>
                      <th class="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td class="p-2 font-medium">EOI RFP Tender Processing Fee</td>
                      <td class="p-2 font-mono text-[11px]">0070-60-800-01-00</td>
                      <td class="p-2 font-mono text-[11px]">{{ currentApplication().transactionRef }}</td>
                      <td class="p-2 text-right font-mono font-medium">{{ currentApplication().processingFee }}</td>
                    </tr>
                    <tr>
                      <td class="p-2 font-medium">Earnest Money Deposit (EMD)</td>
                      <td class="p-2 font-mono text-[11px]">8443-00-103-00-00</td>
                      <td class="p-2 font-mono text-[11px]">{{ currentApplication().emdTransactionRef }}</td>
                      <td class="p-2 text-right font-mono font-medium">{{ currentApplication().emdAmount }}</td>
                    </tr>
                    <tr class="bg-slate-50 font-semibold text-slate-800">
                      <td colspan="3" class="p-2 text-right">Total Amount Deposited:</td>
                      <td class="p-2 text-right font-mono text-sm text-[#0B3558]">₹ 52,000.00</td>
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

  tenders = signal<SubmittedTender[]>(MOCK_SUBMITTED_TENDERS);

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
