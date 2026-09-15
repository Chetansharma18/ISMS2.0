import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../../core/services/eoi.service';
import { EoiFieldService } from '../../core/services/eoi-field.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ApplicationItem, EoiItem, EoiFormField, CommitteeApprovalDocument } from '../../core/models/admin.models';

@Component({
  selector: 'admin-response-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent
  ],
  template: `
    <div class="font-sans text-slate-800">
      <admin-page-header 
        [title]="'Proposal Dossier: ' + (app()?.applicationNumber || appId)"
        [subtitle]="'Submitted by ' + (app()?.organizationName || 'Applicant') + ' against ' + (app()?.eoiReferenceNo || eoiId)"
        icon="description"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Responses', url: '/admin/eoi/' + eoiId + '/responses' },
          { label: app()?.applicationNumber || 'Application Details' }
        ]">
        <div header-actions class="flex items-center gap-2 flex-wrap">
          <admin-status-badge [status]="app()?.status || 'Submitted'"></admin-status-badge>
          <a 
            [routerLink]="['/admin/eoi', eoiId, 'responses']" 
            class="px-3.5 py-2 border border-slate-300 rounded-xs text-xs font-bold text-[#002244] hover:bg-slate-50 transition-colors shadow-2xs">
            ← Back to Responses
          </a>
        </div>
      </admin-page-header>

      <div *ngIf="app() as item" class="space-y-6">
        
        <!-- Tab Navigation (ISMS 2.0 Government Light Styling) -->
        <div class="bg-white rounded-xs shadow-2xs border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto select-none">
          <button 
            *ngFor="let tab of tabs"
            (click)="activeTab.set(tab.id)"
            class="px-3.5 py-2 rounded-xs text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
            [ngClass]="activeTab() === tab.id ? 'bg-[#002244] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-[#002244]'">
            {{ tab.label }}
          </button>
        </div>

        <!-- TAB 1: APPLICANT DETAILS -->
        <div *ngIf="activeTab() === 'applicant'" class="bg-white p-5 sm:p-6 rounded-xs border border-slate-200 shadow-2xs space-y-4">
          <h3 class="text-sm font-bold text-[#002244] border-b border-slate-100 pb-2">Primary Authorized Signatory Representative</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
              <span class="font-bold text-slate-900 text-sm mt-0.5 block">{{ item.applicantName }}</span>
            </div>
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Official Email</span>
              <span class="font-semibold text-blue-700 text-sm mt-0.5 block">{{ item.applicantEmail }}</span>
            </div>
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Mobile Number</span>
              <span class="font-semibold text-slate-800 text-sm mt-0.5 block">{{ item.applicantPhone }}</span>
            </div>
          </div>
        </div>

        <!-- TAB 2: ORGANIZATION -->
        <div *ngIf="activeTab() === 'org'" class="bg-white p-5 sm:p-6 rounded-xs border border-slate-200 shadow-2xs space-y-4">
          <h3 class="text-sm font-bold text-[#002244] border-b border-slate-100 pb-2">Legal Entity &amp; Statutory Registration</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Legal Entity Name</span>
              <span class="font-bold text-slate-900 text-sm mt-0.5 block">{{ item.organizationName }}</span>
            </div>
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Organization Type</span>
              <span class="font-semibold text-slate-800 text-sm mt-0.5 block">{{ item.organizationType }}</span>
            </div>
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Portal Registration No.</span>
              <span class="font-mono font-bold text-[#002244] text-sm mt-0.5 block">{{ item.registrationNumber }}</span>
            </div>
          </div>
        </div>

        <!-- TAB 3: DYNAMIC EOI FORM RESPONSES -->
        <div *ngIf="activeTab() === 'responses'" class="bg-white p-5 sm:p-6 rounded-xs border border-slate-200 shadow-2xs space-y-4">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-[#002244]">Dynamic EOI Application Answers</h3>
              <p class="text-xs text-slate-500">Rendered dynamically matching the specific form builder schema for this tender</p>
            </div>
            <span class="px-2.5 py-1 rounded-2xs text-[10px] font-bold bg-[#002244]/10 text-[#002244] border border-[#002244]/20">
              Schema Validated
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div *ngFor="let field of schemaFields()" class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200 space-y-1">
              <span class="text-[10.5px] font-bold uppercase text-slate-500 block">{{ field.fieldLabel }}</span>
              
              <div class="font-bold text-slate-900 text-sm">
                <ng-container *ngIf="item.formResponses[field.fieldCode] !== undefined; else noAnswer">
                  <span *ngIf="isPrimitive(item.formResponses[field.fieldCode])">
                    {{ item.formResponses[field.fieldCode] }}
                  </span>
                  <div *ngIf="isArray(item.formResponses[field.fieldCode])" class="flex items-center gap-1 flex-wrap mt-1">
                    <span *ngFor="let val of item.formResponses[field.fieldCode]" class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-semibold">
                      {{ val }}
                    </span>
                  </div>
                </ng-container>
                <ng-template #noAnswer>
                  <span class="text-slate-400 font-normal italic">Not provided / Exempted</span>
                </ng-template>
              </div>

              <span class="font-mono text-[9px] text-slate-400">Code: {{ field.fieldCode }} ({{ field.fieldType }})</span>
            </div>
          </div>
        </div>

        <!-- TAB 4: UPLOADED DOCUMENTS -->
        <div *ngIf="activeTab() === 'docs'" class="bg-white p-5 sm:p-6 rounded-xs border border-slate-200 shadow-2xs space-y-4">
          <h3 class="text-sm font-bold text-[#002244] border-b border-slate-100 pb-2">Uploaded Verification Documents</h3>
          
          <div class="divide-y divide-slate-100 text-xs">
            <div *ngFor="let doc of item.uploadedDocuments" class="py-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[24px] text-rose-700">picture_as_pdf</span>
                <div>
                  <span class="font-bold text-slate-800 block">{{ doc.documentName }}</span>
                  <span class="text-slate-500 text-[11px]">{{ doc.fileName }} • {{ doc.fileSize }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-2xs text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">verified</span>
                  Verified
                </span>
                <button (click)="toastService.success('Document Download', 'Downloading ' + doc.fileName)" class="px-3 py-1 bg-white border border-slate-300 rounded-xs text-xs font-bold text-[#002244] hover:bg-slate-50 cursor-pointer">
                  View PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 5: PAYMENT -->
        <div *ngIf="activeTab() === 'payment'" class="bg-white p-5 sm:p-6 rounded-xs border border-slate-200 shadow-2xs space-y-4">
          <h3 class="text-sm font-bold text-[#002244] border-b border-slate-100 pb-2">e-Treasury Transaction Reconciliation</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-3.5 bg-emerald-50/70 rounded-xs border border-emerald-200">
              <span class="text-[10px] uppercase font-bold text-emerald-800 block">Payment Status</span>
              <span class="font-black text-emerald-900 text-base mt-0.5 block">{{ item.paymentStatus }}</span>
            </div>
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Amount Paid (INR)</span>
              <span class="font-black text-slate-900 text-base mt-0.5 block">₹{{ item.amount | number:'1.0-0' }}</span>
            </div>
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Transaction Reference ID</span>
              <span class="font-mono font-bold text-[#002244] text-sm mt-0.5 block">{{ item.transactionId || 'TXN-RAJBANK-90218847' }}</span>
            </div>
          </div>
        </div>

        <!-- TAB 6: OFFICIAL COMMITTEE EVALUATION & SIGN-OFF (WHITEBOARD WORKFLOW) -->
        <div *ngIf="activeTab() === 'review'" class="space-y-6">
          
          <!-- Header Bar -->
          <div class="bg-white p-5 sm:p-6 rounded-xs border border-slate-200 shadow-2xs">
            <div class="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 class="text-base font-extrabold text-[#002244] flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#002244]">gavel</span>
                  Departmental Scrutiny, Grading &amp; Committee Sign-Off
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Official evaluation recording under RTPP Act 2012. Legal decision requires grade, category, and e-signed resolution attachment.
                </p>
              </div>
              <div class="text-left sm:text-right">
                <span class="text-[10.5px] font-bold text-slate-400 uppercase block">Evaluation Committee</span>
                <span class="text-xs font-extrabold text-[#002244]">
                  {{ item.assignedCommitteeName || 'State Skill Evaluation Committee (RSLDC)' }}
                </span>
              </div>
            </div>

            <!-- Existing Decisions / Audit Log -->
            <div *ngIf="item.reviewComments?.length" class="mt-4 space-y-3">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Previous Evaluation Records</h4>
              <div *ngFor="let rev of item.reviewComments" class="p-3 bg-slate-50/80 rounded-xs border border-slate-200 text-xs space-y-1">
                <div class="flex items-center justify-between font-bold text-slate-800">
                  <span>{{ rev.reviewerName }}</span>
                  <span class="text-slate-400 font-mono text-[11px]">{{ rev.date }}</span>
                </div>
                <p class="text-slate-700 leading-relaxed">{{ rev.comment }}</p>
                <div class="pt-1">
                  <admin-status-badge [status]="rev.status"></admin-status-badge>
                </div>
              </div>
            </div>

            <!-- Existing Attached Committee Document (if already accepted) -->
            <div *ngIf="item.committeeAttachment" class="mt-4 p-4 bg-emerald-50/60 rounded-xs border border-emerald-300">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-emerald-700 text-[28px]">verified</span>
                  <div>
                    <h5 class="text-xs font-extrabold text-emerald-900">{{ item.committeeAttachment.documentTitle }}</h5>
                    <p class="text-[11px] text-emerald-800 mt-0.5">
                      Ref: <strong class="font-mono">{{ item.committeeAttachment.certificateRefNo }}</strong> • Uploaded: {{ item.committeeAttachment.uploadedDate }}
                    </p>
                  </div>
                </div>
                <button (click)="downloadCommitteeDoc()" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  Download Signed Resolution
                </button>
              </div>

              <!-- Signed Members Badges -->
              <div class="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div *ngFor="let m of item.committeeAttachment.signedMembers" class="p-2 bg-white/80 rounded-xs border border-emerald-200 text-[10.5px]">
                  <div class="font-bold text-slate-800">{{ m.name }}</div>
                  <div class="text-slate-500 text-[9.5px] truncate">{{ m.designation }}</div>
                  <div class="text-emerald-700 font-extrabold mt-1 flex items-center gap-1">
                    <span>✓ {{ m.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- EVALUATION FORM (Per Whiteboard Workflow) -->
          <div class="bg-white p-5 sm:p-7 rounded-xs border border-slate-200 shadow-2xs space-y-6">
            
            <div class="border-b border-slate-100 pb-3">
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#002244]">
                New Scrutiny Decision Entry
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                Assign technical grading, designated partner category, and official resolution evidence
              </p>
            </div>

            <!-- ROW 1: Grading and Category Inputs -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Grading Input Box -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Technical Evaluation Grading <span class="text-rose-600">*</span>
                </label>
                <select 
                  [(ngModel)]="selectedGrade"
                  class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xs text-xs font-semibold focus:ring-2 focus:ring-[#002244] focus:outline-hidden">
                  <option value="Grade A+ (Exemplary - 92/100)">Grade A+ (Exemplary Technical Score: 92/100)</option>
                  <option value="Grade A (Qualified - 84/100)">Grade A (Qualified Technical Score: 84/100)</option>
                  <option value="Grade B (Standard - 74/100)">Grade B (Standard Technical Score: 74/100)</option>
                  <option value="Grade C (Conditional - 64/100)">Grade C (Conditional Technical Score: 64/100)</option>
                  <option value="Unsatisfactory (< 60/100)">Unsatisfactory / Ineligible (< 60/100)</option>
                </select>
                <span class="text-[10px] text-slate-400 mt-1 block font-medium">
                  Benchmarked against infrastructure, faculty TOT certification &amp; financial strength.
                </span>
              </div>

              <!-- Category Dropdown -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Empanelment Category <span class="text-rose-600">*</span>
                </label>
                <select 
                  [(ngModel)]="selectedCategory"
                  class="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xs text-xs font-semibold focus:ring-2 focus:ring-[#002244] focus:outline-hidden">
                  <option value="Category A - Mega Training Partner (State-wide Multi-District Operations)">
                    Category A - Mega Training Partner (State-wide Multi-District Operations)
                  </option>
                  <option value="Category B - Regional Training Partner (Specific Division / 3-5 Districts)">
                    Category B - Regional Training Partner (Specific Division / 3-5 Districts)
                  </option>
                  <option value="Category C - Specialized Sectoral Partner (Niche Trades / Tribal Mandate)">
                    Category C - Specialized Sectoral Partner (Niche Trades / Tribal Mandate)
                  </option>
                  <option value="Category D - Project Assessment & Certification Agency">
                    Category D - Project Assessment &amp; Certification Agency
                  </option>
                </select>
                <span class="text-[10px] text-slate-400 mt-1 block font-medium">
                  Determines target trainee allotment ceilings and payment tranche rates.
                </span>
              </div>

            </div>

            <!-- ROW 2: Accept vs Reject Decision Toggle -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                3. Official Scrutiny Decision <span class="text-rose-600">*</span>
              </label>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Accept Option -->
                <label 
                  class="flex items-center gap-3 p-3.5 rounded-xs border-2 cursor-pointer transition-all"
                  [ngClass]="selectedDecision === 'Accepted' ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'">
                  <input 
                    type="radio" 
                    name="decisionType" 
                    value="Accepted" 
                    [(ngModel)]="selectedDecision"
                    class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                  <div>
                    <div class="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                      Qualify &amp; Empanel (Accept Profile)
                    </div>
                    <p class="text-[10.5px] text-emerald-800 mt-0.5">
                      Requires committee approval document upload with all committee members e-signatures.
                    </p>
                  </div>
                </label>

                <!-- Reject Option -->
                <label 
                  class="flex items-center gap-3 p-3.5 rounded-xs border-2 cursor-pointer transition-all"
                  [ngClass]="selectedDecision === 'Rejected' ? 'border-rose-600 bg-rose-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'">
                  <input 
                    type="radio" 
                    name="decisionType" 
                    value="Rejected" 
                    [(ngModel)]="selectedDecision"
                    class="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer" />
                  <div>
                    <div class="font-extrabold text-xs text-rose-900 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[18px] text-rose-600">cancel</span>
                      Disqualify &amp; Reject Proposal
                    </div>
                    <p class="text-[10.5px] text-rose-800 mt-0.5">
                      Requires mandatory statutory grounds and detailed remarks for applicant intimation.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <!-- CONDITIONAL WORKFLOW A: IF ACCEPT SELECTED -> UPLOAD ATTACHMENT WITH COMMITTEE E-SIGNATURES -->
            <div *ngIf="selectedDecision === 'Accepted'" class="p-5 bg-emerald-50/40 rounded-xs border border-emerald-200 space-y-4 animate-fade-in">
              
              <div class="flex items-start justify-between gap-3 border-b border-emerald-200/80 pb-3">
                <div>
                  <h5 class="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-emerald-700 text-[18px]">attachment</span>
                    Committee Signed Approval Document Upload (Tamper-Proof Evidence)
                  </h5>
                  <p class="text-[11px] text-emerald-800 mt-0.5">
                    Upload official resolution minutes signed by all committee members ("I approve this profile"). Serves as permanent evidence against future objections.
                  </p>
                </div>
                <span class="px-2 py-0.5 rounded-2xs text-[10px] font-bold bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                  RTPP Mandate
                </span>
              </div>

              <!-- Upload File Attachment Box -->
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div class="md:col-span-8 p-3.5 bg-white border border-emerald-300 rounded-xs flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="material-symbols-outlined text-rose-600 text-[24px]">picture_as_pdf</span>
                    <div class="min-w-0">
                      <span class="font-bold text-xs text-slate-900 block truncate">{{ attachedDocName }}</span>
                      <span class="text-[10.5px] text-slate-500 block">Certificate Ref: <strong class="font-mono text-[#002244]">RSLDC/SSEC/2026/APPR-9821</strong> (2.4 MB)</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded-2xs bg-emerald-100 text-emerald-800 font-extrabold text-[10px] shrink-0">
                    ✓ Validated
                  </span>
                </div>

                <div class="md:col-span-4 flex items-center gap-2">
                  <button 
                    type="button"
                    (click)="simulateFileUpload()"
                    class="w-full px-3 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-[#002244] font-bold text-xs rounded-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px]">upload_file</span>
                    Browse / Replace PDF
                  </button>
                </div>
              </div>

              <!-- Committee Members E-Sign Verification Grid -->
              <div class="space-y-2 pt-1">
                <span class="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                  Committee Signatory Verification Proof:
                </span>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div class="p-2.5 bg-white rounded-xs border border-emerald-200">
                    <div class="font-bold text-xs text-slate-900">Shri S. K. Sharma, IAS</div>
                    <div class="text-[10px] text-slate-500">Chairman, State Evaluation Committee</div>
                    <div class="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">draw</span>
                      E-Signed &amp; Approved ✓
                    </div>
                  </div>

                  <div class="p-2.5 bg-white rounded-xs border border-emerald-200">
                    <div class="font-bold text-xs text-slate-900">Dr. K. N. Verma</div>
                    <div class="text-[10px] text-slate-500">Technical Scrutiny Officer, RSLDC</div>
                    <div class="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">draw</span>
                      E-Signed &amp; Approved ✓
                    </div>
                  </div>

                  <div class="p-2.5 bg-white rounded-xs border border-emerald-200">
                    <div class="font-bold text-xs text-slate-900">Smt. Sunita Meena, RAS</div>
                    <div class="text-[10px] text-slate-500">Financial Advisor &amp; Joint Secretary</div>
                    <div class="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">draw</span>
                      E-Signed &amp; Approved ✓
                    </div>
                  </div>
                </div>
              </div>

              <!-- Legal Checkbox Acknowledgment -->
              <label class="flex items-start gap-2 pt-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="approvalConfirmed"
                  class="mt-0.5 rounded-2xs text-[#002244] focus:ring-[#002244]" />
                <span class="text-xs text-slate-700 leading-relaxed font-medium">
                  I hereby confirm that all 3 committee members have thoroughly vetted this applicant profile and digitally signed the approval order. This document is sealed as legal proof against any future objections.
                </span>
              </label>

              <!-- Optional Approval Note -->
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                  Additional Committee Scrutiny Remarks (Optional)
                </label>
                <textarea 
                  rows="2" 
                  [(ngModel)]="evaluationComment"
                  placeholder="Enter any specific conditions, target center limits, or remarks..."
                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-xs focus:ring-2 focus:ring-[#002244] focus:outline-hidden"></textarea>
              </div>

            </div>

            <!-- CONDITIONAL WORKFLOW B: IF REJECT SELECTED -> MANDATORY REMARKS -->
            <div *ngIf="selectedDecision === 'Rejected'" class="p-5 bg-rose-50/40 rounded-xs border border-rose-200 space-y-4 animate-fade-in">
              
              <div class="flex items-start justify-between gap-3 border-b border-rose-200/80 pb-3">
                <div>
                  <h5 class="text-xs font-extrabold text-rose-950 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-rose-700 text-[18px]">report</span>
                    Mandatory Statutory Disqualification Remarks &amp; Grounds
                  </h5>
                  <p class="text-[11px] text-rose-800 mt-0.5">
                    State the specific tender clause, financial deficiency, or document failure. This explanation will be displayed directly to the applicant with RTPP Act appeal rights.
                  </p>
                </div>
                <span class="px-2 py-0.5 rounded-2xs text-[10px] font-bold bg-rose-200/80 text-rose-900 border border-rose-300">
                  Required *
                </span>
              </div>

              <!-- Quick Template Reasons Dropdown -->
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                  Insert Standard Disqualification Grounds Template:
                </label>
                <select 
                  (change)="applyRejectTemplate($event)"
                  class="w-full px-3 py-2 bg-white border border-rose-300 rounded-xs text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden">
                  <option value="">-- Choose Standard Statutory Clause Ground --</option>
                  <option value="Disqualified under RTPP RFP Clause 4.2: Average audited turnover for FY 2021-24 is below required ₹50 Lakhs threshold.">
                    Turnover Deficiency (Below ₹50 Lakhs under Clause 4.2)
                  </option>
                  <option value="Non-Compliant: Proposed training center carpet area is deficient as per Annexure 3 infrastructure specifications.">
                    Center Infrastructure Deficient (Carpet Area / CCTV)
                  </option>
                  <option value="Disqualified: Key domain faculty members lack valid TOT (Training of Trainer) credentials from SSC/NCVET.">
                    Faculty ToT Certification Missing or Expired
                  </option>
                  <option value="Non-Responsive: Statutory Non-Blacklisting Notarized Affidavit on ₹500 Stamp Paper not provided.">
                    Statutory Non-Blacklisting Affidavit Missing
                  </option>
                </select>
              </div>

              <!-- Mandatory Textarea -->
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">
                  Detailed Official Rejection Remarks *
                </label>
                <textarea 
                  rows="3" 
                  [(ngModel)]="evaluationComment"
                  placeholder="Enter precise technical committee findings and disqualification clause citations..."
                  class="w-full px-3 py-2 bg-white border border-rose-300 rounded-xs text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"></textarea>
              </div>

              <!-- Automatic EMD Refund Notice -->
              <div class="p-3 bg-white rounded-xs border border-rose-200 text-xs text-slate-700 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-600 text-[20px]">currency_rupee</span>
                  <span>100% Treasury EMD Deposit (₹50,000) will be queued for automated cyber treasury credit.</span>
                </div>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-2xs border border-emerald-200">
                  RTPP Rule 42 Compliant
                </span>
              </div>

            </div>

            <!-- SUBMIT ACTION BUTTON -->
            <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div class="text-xs text-slate-500">
                Decision authenticated by: <strong class="text-[#002244]">Shri Rajeshwar Sharma, IAS (Super Admin)</strong>
              </div>

              <button 
                type="button"
                (click)="submitCommitteeEvaluation()"
                [disabled]="isSubmitting"
                class="w-full sm:w-auto px-6 py-2.5 rounded-xs font-extrabold text-xs text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                [ngClass]="selectedDecision === 'Accepted' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-600 hover:bg-rose-700'">
                <span class="material-symbols-outlined text-[18px]">verified_user</span>
                <span>{{ selectedDecision === 'Accepted' ? 'Seal & Issue Empanelment Order' : 'Confirm & Issue Rejection Intimation' }}</span>
              </button>
            </div>

          </div>

        </div>

        <!-- TAB 7: TIMELINE & AUDIT -->
        <div *ngIf="activeTab() === 'timeline'" class="bg-white p-5 sm:p-6 rounded-xs border border-slate-200 shadow-2xs space-y-4">
          <h3 class="text-sm font-bold text-[#002244] border-b border-slate-100 pb-2">Application Progression History</h3>
          <div class="space-y-3 text-xs">
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Application Initiated (Draft)</span>
                <span class="text-slate-500">Applicant generated draft registration</span>
              </div>
              <span class="font-mono text-slate-400">2024-11-20 10:14:02</span>
            </div>
            <div class="p-3.5 bg-slate-50/70 rounded-xs border border-slate-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 block">Payment Reconciled (₹28,540)</span>
                <span class="text-slate-500">Cyber receipt acknowledged by state treasury</span>
              </div>
              <span class="font-mono text-slate-400">2024-11-28 16:15:30</span>
            </div>
            <div class="p-3.5 bg-[#002244]/5 rounded-xs border border-[#002244]/20 flex items-center justify-between">
              <div>
                <span class="font-bold text-[#002244] block">Final Online Submission Sealed</span>
                <span class="text-[#002244]">Digital signature stamp affixed</span>
              </div>
              <span class="font-mono text-[#002244] font-bold">2024-11-28 16:20:00</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ResponseDetailsComponent implements OnInit {
  private eoiService = inject(EoiService);
  private fieldService = inject(EoiFieldService);
  toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  eoiId = 'EOI-2025-002';
  appId = 'APP-2025-001';

  app = signal<ApplicationItem | null>(null);
  schemaFields = signal<EoiFormField[]>([]);
  activeTab = signal<string>('review');

  tabs = [
    { id: 'review', label: '1. Committee Review & Decision' },
    { id: 'applicant', label: '2. Applicant Details' },
    { id: 'org', label: '3. Organization' },
    { id: 'responses', label: '4. Dynamic Form Responses' },
    { id: 'docs', label: '5. Documents' },
    { id: 'payment', label: '6. Payment' },
    { id: 'timeline', label: '7. Timeline & Audit' }
  ];

  // Evaluation form state
  selectedGrade = 'Grade A+ (Exemplary - 92/100)';
  selectedCategory = 'Category A - Mega Training Partner (State-wide Multi-District Operations)';
  selectedDecision: 'Accepted' | 'Rejected' = 'Accepted';
  evaluationComment = '';
  approvalConfirmed = true;
  attachedDocName = 'SSEC_Empanelment_Approval_Resolution_Signed.pdf';
  isSubmitting = false;

  ngOnInit(): void {
    const eId = this.route.snapshot.paramMap.get('eoiId');
    const aId = this.route.snapshot.paramMap.get('applicationId');
    if (eId) this.eoiId = eId;
    if (aId) this.appId = aId;

    this.eoiService.getApplicationById(this.appId).subscribe(a => {
      this.app.set(a || null);
      if (a?.grading) this.selectedGrade = a.grading;
      if (a?.assignedCategory) this.selectedCategory = a.assignedCategory;
      if (a?.status === 'Rejected') {
        this.selectedDecision = 'Rejected';
        this.evaluationComment = a.decisionRemarks || '';
      }
    });

    this.fieldService.getFieldsForEoi(this.eoiId).subscribe(fields => {
      this.schemaFields.set(fields);
    });
  }

  isPrimitive(val: any): boolean {
    return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  applyRejectTemplate(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    if (val) {
      this.evaluationComment = val;
    }
  }

  simulateFileUpload(): void {
    this.attachedDocName = 'SSEC_Order_Ref_' + Math.floor(1000 + Math.random() * 9000) + '_Signed.pdf';
    this.toastService.success('Document Attached', 'Committee signed resolution file attached successfully.');
  }

  downloadCommitteeDoc(): void {
    this.toastService.info('Download Started', 'Downloading official committee signed empanelment resolution.');
  }

  submitCommitteeEvaluation(): void {
    if (this.selectedDecision === 'Rejected' && !this.evaluationComment.trim()) {
      this.toastService.error('Remarks Required', 'Please provide detailed rejection grounds as mandated under RTPP Act.');
      return;
    }

    if (this.selectedDecision === 'Accepted' && !this.approvalConfirmed) {
      this.toastService.error('Verification Required', 'Please confirm the committee members digital signatures certification.');
      return;
    }

    this.isSubmitting = true;

    const attachment: CommitteeApprovalDocument | undefined = this.selectedDecision === 'Accepted' ? {
      documentTitle: 'State Skill Evaluation Committee (SSEC) Empanelment Order',
      fileName: this.attachedDocName,
      fileSize: '2.4 MB',
      certificateRefNo: 'RSLDC/SSEC/2026/APPR-' + Math.floor(1000 + Math.random() * 9000),
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Shri Rajeshwar Sharma, IAS (Super Admin)',
      committeeName: 'State Skill Evaluation Committee (RSLDC)',
      signedMembers: [
        {
          name: 'Shri S. K. Sharma, IAS',
          designation: 'Chairman, State Evaluation Committee',
          department: 'Skill, Employment & Entrepreneurship',
          signedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'E-Signed & Approved',
          ipAddress: '10.24.12.91'
        },
        {
          name: 'Dr. K. N. Verma',
          designation: 'Technical Scrutiny Officer, RSLDC',
          department: 'Quality Directorate',
          signedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'E-Signed & Approved',
          ipAddress: '10.24.12.94'
        },
        {
          name: 'Smt. Sunita Meena, RAS',
          designation: 'Financial Advisor & Joint Secretary',
          department: 'RSLDC Finance Cell',
          signedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'E-Signed & Approved',
          ipAddress: '10.24.12.98'
        }
      ]
    } : undefined;

    const finalComment = this.evaluationComment || (this.selectedDecision === 'Accepted' 
      ? `Approved by Committee with ${this.selectedGrade} under ${this.selectedCategory}. Resolution attached.` 
      : 'Disqualified under technical evaluation criteria.');

    this.eoiService.updateApplicationStatus(
      this.appId,
      this.selectedDecision,
      finalComment,
      this.selectedGrade,
      this.selectedCategory,
      attachment
    ).subscribe(() => {
      this.isSubmitting = false;
      this.toastService.success(
        this.selectedDecision === 'Accepted' ? 'Empanelment Order Sealed' : 'Rejection Intimation Issued',
        `Application ${this.appId} decision successfully recorded.`
      );
      this.eoiService.getApplicationById(this.appId).subscribe(a => this.app.set(a || null));
    });
  }
}
