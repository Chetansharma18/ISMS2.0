import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EoiService } from '../../core/services/eoi.service';
import { MasterService } from '../../core/services/master.service';
import { CommitteeService } from '../../core/services/committee.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SchemeMaster, DepartmentMaster, EoiCategoryMaster, Committee, EoiItem } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-create',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    PageHeaderComponent
  ],
  template: `
    <div>
      <admin-page-header 
        [title]="isEditMode ? 'Configure EOI: ' + referenceNo : 'Create Expression of Interest (EOI)'"
        subtitle="Multi-step statutory configuration covering tender classification, milestone dates, fee heads, documents checklist, transactions, and eligibility"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: isEditMode ? 'Edit EOI' : 'Create EOI' }
        ]">
        <div header-actions class="flex items-center gap-2">
          <button 
            type="button" 
            (click)="saveAsDraft()" 
            class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer">
            Save as Draft
          </button>
          <a 
            routerLink="/admin/eoi" 
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </a>
        </div>
      </admin-page-header>

      <form [formGroup]="eoiForm" (ngSubmit)="onSubmitPublish()" class="bg-white rounded-xl shadow-lg border border-slate-200 border-t-4 border-t-[#002244] p-6 md:p-8 space-y-10">

        <!-- SECTION 1: BASIC DETAILS -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 1</div>
            <div>
              <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">EOI Basic Details</h3>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">Specify official tender reference number, associated scheme, and nodal department</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- EOI Reference No. * -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                EOI Reference No. <span class="text-rose-600">*</span>
              </label>
              <input 
                type="text" 
                formControlName="referenceNo"
                placeholder="e.g. RSLDC/EOI/2025-26/001"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': hasError('referenceNo')}" />
              <p *ngIf="hasError('referenceNo')" class="text-[11px] text-rose-600 mt-1 font-medium">Reference number is required.</p>
            </div>

            <!-- EOI Title * -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                EOI Title <span class="text-rose-600">*</span>
              </label>
              <input 
                type="text" 
                formControlName="title"
                placeholder="Full official subject of the Expression of Interest..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': hasError('title')}" />
              <p *ngIf="hasError('title')" class="text-[11px] text-rose-600 mt-1 font-medium">Title is required.</p>
            </div>

            <!-- Scheme * -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Scheme <span class="text-rose-600">*</span>
              </label>
              <select 
                formControlName="schemeId"
                (change)="onSchemeChange()"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': hasError('schemeId')}">
                <option value="">Select Scheme from Master</option>
                <option *ngFor="let s of activeSchemes()" [value]="s.id">{{ s.schemeName }} ({{ s.schemeCode }})</option>
              </select>
              <p *ngIf="hasError('schemeId')" class="text-[11px] text-rose-600 mt-1 font-medium">Active Scheme must be selected.</p>
            </div>

            <!-- Department * -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Department <span class="text-rose-600">*</span>
              </label>
              <select 
                formControlName="department"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': hasError('department')}">
                <option value="">Select Department</option>
                <option *ngFor="let d of departments()" [value]="d.departmentName">{{ d.departmentName }}</option>
              </select>
              <p *ngIf="hasError('department')" class="text-[11px] text-rose-600 mt-1 font-medium">Department is required.</p>
            </div>

            <!-- EOI Category * -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                EOI Category <span class="text-rose-600">*</span>
              </label>
              <select 
                formControlName="eoiCategory"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': hasError('eoiCategory')}">
                <option value="">Select EOI Category</option>
                <option *ngFor="let c of categories()" [value]="c.categoryName">{{ c.categoryName }}</option>
              </select>
              <p *ngIf="hasError('eoiCategory')" class="text-[11px] text-rose-600 mt-1 font-medium">EOI Category is required.</p>
            </div>

            <!-- Description * -->
            <div class="col-span-full">
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                EOI Description <span class="text-rose-600">*</span>
              </label>
              <textarea 
                rows="4" 
                formControlName="description"
                placeholder="Comprehensive scope of work, background, and delivery expectations..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-400 bg-rose-50 ring-1 ring-rose-400': hasError('description')}"></textarea>
              <p *ngIf="hasError('description')" class="text-[11px] text-rose-600 mt-1 font-medium">Description is required.</p>
            </div>
          </div>
        </div>

        <hr class="border-slate-200">

        <!-- SECTION 2: IMPORTANT DATES -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 2</div>
            <div>
              <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">Important Tender Milestone Dates</h3>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">All dates are strictly validated. Submission deadline enforces applicant form closing.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Date of EOI Published <span class="text-rose-600">*</span></label>
              <input type="date" formControlName="publishedDate" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Application Start Date <span class="text-rose-600">*</span></label>
              <input type="date" formControlName="applicationStartDate" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Last Date of EOI Submission <span class="text-rose-600">*</span></label>
              <input type="date" formControlName="closingDate" class="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-900 transition-all focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">EOI Opening Date</label>
              <input type="date" formControlName="openingDate" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Technical Review Start Date</label>
              <input type="date" formControlName="reviewStartDate" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
          </div>
        </div>

        <hr class="border-slate-200">

        <!-- SECTION 3: FEES -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 3</div>
            <div>
              <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">Statutory Fees & Earnest Money Deposit (EMD)</h3>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">Values calculate automatic totals and GST billing requirements</p>
            </div>
          </div>

          <div formGroupName="fees" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">EMD Fee (INR)</label>
              <input type="number" formControlName="emdFee" (input)="recalculateFees()" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">EOI / Application Fee (INR)</label>
              <input type="number" formControlName="applicationFee" (input)="recalculateFees()" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Processing Fee (RISL) (INR)</label>
              <input type="number" formControlName="processingFee" (input)="recalculateFees()" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">GST Percentage (%)</label>
              <input type="number" formControlName="gstPercentage" (input)="recalculateFees()" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">GST Amount (Calculated)</label>
              <input type="number" formControlName="gstAmount" readonly class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Other Charges (INR)</label>
              <input type="number" formControlName="otherCharges" (input)="recalculateFees()" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
          </div>

          <!-- Total Calculation Card -->
          <div class="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div>
              <span class="text-sm font-extrabold text-blue-900 block tracking-wide uppercase">Total Calculated Application Package Amount</span>
              <span class="text-xs text-blue-700 font-medium">Base Application + Processing + GST + Refundable EMD</span>
            </div>
            <div class="text-3xl font-black text-blue-950 font-mono tracking-tight bg-white px-5 py-2.5 rounded-lg shadow-sm border border-blue-100">
              ₹{{ totalCalculatedFee() | number:'1.0-0' }}
            </div>
          </div>
        </div>

        <hr class="border-slate-200">

        <!-- SECTION 4: ATTACHMENT & DOCUMENTS -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 4</div>
            <div>
              <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">Attachment & Documents Checklist</h3>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">Configure mandatory attachments and compliance documents</p>
            </div>
          </div>

          <!-- Official EOI File -->
          <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 transition-colors hover:border-slate-300">
            <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-blue-700 text-[18px]">attachment</span>
              Official EOI RFP Document Upload <span class="text-rose-600 ml-1">*</span>
            </h4>
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <input type="file" (change)="onFileSelected($event)" class="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer shadow-sm transition-colors" />
              <div *ngIf="attachedFileName()" class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-emerald-200 shadow-sm text-xs text-slate-800 whitespace-nowrap">
                <span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                <span class="font-bold">{{ attachedFileName() }}</span>
                <span class="text-slate-500 font-medium">({{ attachedFileSize() }})</span>
                <button type="button" (click)="removeAttachedFile()" class="text-rose-500 hover:text-rose-700 ml-2 p-1 hover:bg-rose-50 rounded transition-colors">
                  <span class="material-symbols-outlined text-[16px] block">close</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Required Applicant Document Checklist -->
          <div class="mt-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div>
                <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Mandatory Applicant Submission Checklist</h4>
                <p class="text-[11px] text-slate-500 font-medium mt-0.5">Applicant will be required to upload these verified documents</p>
              </div>
              <button 
                type="button" 
                (click)="addDocumentRow()"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">add</span>
                Add Document
              </button>
            </div>

            <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-100 text-slate-700 text-[10px] uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-3.5">Document Name</th>
                    <th class="p-3.5">Allowed Format</th>
                    <th class="p-3.5 text-center">Required</th>
                    <th class="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr *ngFor="let doc of docChecklist(); let i = index" class="hover:bg-slate-50 transition-colors">
                    <td class="p-3.5 font-bold text-slate-800">{{ doc.name }}</td>
                    <td class="p-3.5 text-slate-600 font-medium">{{ doc.format }}</td>
                    <td class="p-3.5 text-center">
                      <span class="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">Mandatory</span>
                    </td>
                    <td class="p-3.5 text-right">
                      <button type="button" (click)="removeDocumentRow(i)" class="text-slate-400 hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-lg">
                        <span class="material-symbols-outlined text-[18px] block">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <hr class="border-slate-200">

        <!-- SECTION 5: TRANSACTIONS -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 5</div>
              <div>
                <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">Transaction Configuration</h3>
                <p class="text-[11px] text-slate-500 font-medium mt-0.5">Define milestone payment and scrutiny transaction heads for reconciliation</p>
              </div>
            </div>
            <button 
              type="button" 
              (click)="addTransactionRow()"
              class="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 shrink-0">
              <span class="material-symbols-outlined text-[16px]">add</span>
              Add Transaction Head
            </button>
          </div>

          <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-100 text-slate-700 text-[10px] uppercase font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th class="p-3.5">Transaction Name</th>
                  <th class="p-3.5">Reference Head</th>
                  <th class="p-3.5 text-right">Amount (INR)</th>
                  <th class="p-3.5 text-center">Status</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr *ngFor="let t of transactionList(); let i = index" class="hover:bg-slate-50 transition-colors">
                  <td class="p-3.5 font-bold text-slate-800">{{ t.name }}</td>
                  <td class="p-3.5 font-mono text-slate-600 bg-slate-50 px-2 rounded">{{ t.ref }}</td>
                  <td class="p-3.5 text-right font-black text-slate-900 text-sm">₹{{ t.amount | number:'1.0-0' }}</td>
                  <td class="p-3.5 text-center">
                    <span class="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
                  </td>
                  <td class="p-3.5 text-right">
                    <button type="button" (click)="removeTransactionRow(i)" class="text-slate-400 hover:text-rose-600 transition-colors p-1.5 hover:bg-rose-50 rounded-lg">
                      <span class="material-symbols-outlined text-[18px] block">delete</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr class="border-slate-200">

        <!-- SECTION 6: ELIGIBILITY CRITERIA -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 6</div>
            <div>
              <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">Minimum Eligibility Configuration</h3>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">Applicant responses must satisfy these quantitative and qualification filters</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Min Experience (Years)</label>
              <div class="relative">
                <input type="number" formControlName="minExperience" class="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <span class="text-slate-400 text-xs font-bold">YRS</span>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Min Turnover (in Crores INR)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <span class="text-slate-400 text-xs font-bold">₹</span>
                </div>
                <input type="number" step="0.1" formControlName="minTurnover" class="w-full pl-8 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <span class="text-slate-400 text-xs font-bold">CR</span>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Geographic Location Scope</label>
              <input type="text" formControlName="location" placeholder="e.g. Rajasthan (All 33 Districts)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden" />
            </div>
          </div>
        </div>

        <hr class="border-slate-200">

        <!-- SECTION 7: COMMITTEE ASSIGNMENT (Rule 7 & 30) -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 7</div>
            <div>
              <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">Approval Committee Assignment</h3>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">Assign a designated Technical Evaluation Committee to score proposals post-closure</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Select Evaluation Committee <span class="text-rose-600">*</span></label>
              <select 
                formControlName="committeeId"
                (change)="onCommitteeSelect()"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden">
                <option value="">Unassigned (Assign Later)</option>
                <option *ngFor="let c of committees()" [value]="c.id">{{ c.committeeName }} ({{ c.committeeCode }})</option>
              </select>
            </div>

            <div *ngIf="selectedCommittee()" class="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 text-xs space-y-2 shadow-sm">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[18px] text-blue-700">groups</span>
                </div>
                <div>
                  <span class="font-extrabold text-slate-900 block text-sm">{{ selectedCommittee()?.committeeName }}</span>
                  <span class="text-[10px] uppercase font-bold text-blue-700 tracking-wider">{{ selectedCommittee()?.committeeCode }}</span>
                </div>
              </div>
              <div class="mt-3 pl-11 space-y-1.5">
                <p class="text-slate-600 flex justify-between"><span class="font-medium text-slate-500">Chairperson:</span> <strong class="text-slate-900">{{ selectedCommittee()?.chairpersonName }}</strong></p>
                <p class="text-slate-600 flex justify-between"><span class="font-medium text-slate-500">Department:</span> <strong class="text-slate-900">{{ selectedCommittee()?.department }}</strong></p>
                <p class="text-slate-600 flex justify-between"><span class="font-medium text-slate-500">Members:</span> <strong class="text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-bold">{{ selectedCommittee()?.members?.length }} Technical Experts</strong></p>
              </div>
            </div>
          </div>
        </div>

        <hr class="border-slate-200">

        <!-- SECTION 8: PREVIEW & PUBLISH -->
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="bg-[#002244] text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">Section 8</div>
              <div>
                <h3 class="text-sm font-extrabold text-[#002244] uppercase tracking-wide">Review Tender Summary & Final Publish</h3>
                <p class="text-[11px] text-slate-500 font-medium mt-0.5">Confirm all parameters before pushing live to the public portal</p>
              </div>
            </div>
            <span class="px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-[14px]">verified</span>
              Ready for Publication
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-sm">
              <h4 class="font-black text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-blue-700">info</span>
                Tender Summary
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between"><span class="text-slate-500 font-medium">Reference:</span> <strong class="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{{ eoiForm.get('referenceNo')?.value || 'N/A' }}</strong></div>
                <div class="flex justify-between"><span class="text-slate-500 font-medium">Title:</span> <strong class="text-slate-900 truncate max-w-[200px]" [title]="eoiForm.get('title')?.value">{{ eoiForm.get('title')?.value || 'N/A' }}</strong></div>
                <div class="flex justify-between"><span class="text-slate-500 font-medium">Department:</span> <span class="text-slate-800 font-semibold truncate max-w-[200px]">{{ eoiForm.get('department')?.value || 'N/A' }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500 font-medium">Category:</span> <span class="text-slate-800 font-semibold">{{ eoiForm.get('eoiCategory')?.value || 'N/A' }}</span></div>
              </div>
            </div>

            <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-sm">
              <h4 class="font-black text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-emerald-700">event_note</span>
                Schedule & Financials
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between"><span class="text-slate-500 font-medium">Application Window:</span> <strong class="text-slate-900">{{ eoiForm.get('applicationStartDate')?.value }} to {{ eoiForm.get('closingDate')?.value }}</strong></div>
                <div class="flex justify-between"><span class="text-slate-500 font-medium">Total Fee:</span> <strong class="text-[#002244] text-sm font-black">₹{{ totalCalculatedFee() | number:'1.0-0' }}</strong></div>
                <div class="flex justify-between"><span class="text-slate-500 font-medium">Assigned Committee:</span> <strong class="text-slate-900">{{ selectedCommittee()?.committeeName || 'Unassigned' }}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <!-- FORM SUBMIT CONTROLS -->
        <div class="flex flex-col sm:flex-row items-center justify-end pt-8 mt-6 border-t border-slate-200 gap-4">
          <button 
            type="button" 
            (click)="saveAsDraft()" 
            class="w-full sm:w-auto px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs tracking-wide rounded-xl shadow-sm transition-all cursor-pointer">
            SAVE AS DRAFT
          </button>
          <button 
            type="submit" 
            class="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-lg shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">rocket_launch</span>
            Publish EOI Live
          </button>
        </div>

      </form>
    </div>
  `
})
export class EoiCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eoiService = inject(EoiService);
  private masterService = inject(MasterService);
  private committeeService = inject(CommitteeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  eoiId = '';
  referenceNo = '';

  // Form is now a single-step layout

  activeSchemes = signal<SchemeMaster[]>([]);
  departments = signal<DepartmentMaster[]>([]);
  categories = signal<EoiCategoryMaster[]>([]);
  committees = signal<Committee[]>([]);
  selectedCommittee = signal<Committee | null>(null);

  attachedFileName = signal<string>('MMKVY_State_Tender_RFP_2025.pdf');
  attachedFileSize = signal<string>('3.8 MB');

  docChecklist = signal<{ name: string; format: string }[]>([
    { name: 'Certificate of Incorporation / Society Reg', format: 'PDF' },
    { name: 'Valid GSTIN Registration Certificate', format: 'PDF' },
    { name: 'Audited Balance Sheets (Last 3 Financial Years)', format: 'PDF' },
    { name: 'CA Turnover Certificate with UDIN', format: 'PDF' }
  ]);

  transactionList = signal<{ name: string; ref: string; amount: number }[]>([
    { name: 'Standard Application Fee', ref: 'TXN-REQ-APP', amount: 5000 },
    { name: 'RISL Gateway Processing Fee', ref: 'TXN-REQ-RISL', amount: 1000 },
    { name: 'Earnest Money Deposit (Refundable)', ref: 'TXN-REQ-EMD', amount: 50000 }
  ]);

  eoiForm!: FormGroup;

  totalCalculatedFee = signal<number>(57080);

  ngOnInit(): void {
    this.masterService.getSchemes().subscribe(list => {
      // Rule 1: Active schemes from Master
      this.activeSchemes.set(list.filter(s => s.status === 'Active'));
    });
    this.masterService.getDepartments().subscribe(d => this.departments.set(d));
    this.masterService.getEoiCategories().subscribe(c => this.categories.set(c));
    this.committeeService.getCommittees().subscribe(comm => this.committees.set(comm));

    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eoiId = id;
      this.loadEoi(id);
    }
  }

  initForm(): void {
    this.eoiForm = this.fb.group({
      referenceNo: ['RSLDC/EOI/2025-26/00' + Math.floor(10 + Math.random() * 89), Validators.required],
      title: ['', Validators.required],
      schemeId: ['', Validators.required],
      schemeName: [''],
      schemeCategory: ['Skill Development & Training'],
      department: ['Skill, Employment & Entrepreneurship Department', Validators.required],
      eoiCategory: ['General', Validators.required],
      description: ['', Validators.required],
      publishedDate: [new Date().toISOString().split('T')[0], Validators.required],
      applicationStartDate: [new Date().toISOString().split('T')[0], Validators.required],
      closingDate: [new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], Validators.required],
      openingDate: [new Date(Date.now() + 47 * 86400000).toISOString().split('T')[0]],
      reviewStartDate: [new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0]],
      fees: this.fb.group({
        emdFee: [50000],
        applicationFee: [5000],
        processingFee: [1000],
        gstPercentage: [18],
        gstAmount: [1080],
        otherCharges: [0],
        totalFee: [57080]
      }),
      minExperience: [3],
      minTurnover: [1.5],
      location: ['Rajasthan (All Districts)'],
      committeeId: ['']
    });
  }

  loadEoi(id: string): void {
    this.eoiService.getEoiById(id).subscribe(e => {
      if (e) {
        this.referenceNo = e.referenceNo;
        this.eoiForm.patchValue({
          referenceNo: e.referenceNo,
          title: e.title,
          schemeId: e.schemeId,
          schemeName: e.schemeName,
          schemeCategory: e.schemeCategory,
          department: e.department,
          eoiCategory: e.eoiCategory,
          description: e.description,
          publishedDate: e.publishedDate,
          applicationStartDate: e.applicationStartDate,
          closingDate: e.closingDate,
          openingDate: e.openingDate,
          reviewStartDate: e.reviewStartDate,
          fees: e.fees,
          committeeId: e.committeeId || ''
        });
        if (e.committeeId) {
          this.onCommitteeSelect();
        }
        this.recalculateFees();
      }
    });
  }

  hasError(field: string): boolean {
    const c = this.eoiForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSchemeChange(): void {
    const id = this.eoiForm.get('schemeId')?.value;
    const s = this.activeSchemes().find(item => item.id === id);
    if (s) {
      this.eoiForm.patchValue({
        schemeName: s.schemeName,
        schemeCategory: s.schemeCategory,
        department: s.department
      });
    }
  }

  onCommitteeSelect(): void {
    const id = this.eoiForm.get('committeeId')?.value;
    const found = this.committees().find(c => c.id === id);
    this.selectedCommittee.set(found || null);
  }

  recalculateFees(): void {
    const fg = this.eoiForm.get('fees') as FormGroup;
    const appFee = Number(fg.get('applicationFee')?.value) || 0;
    const procFee = Number(fg.get('processingFee')?.value) || 0;
    const emd = Number(fg.get('emdFee')?.value) || 0;
    const gstRate = Number(fg.get('gstPercentage')?.value) || 0;
    const other = Number(fg.get('otherCharges')?.value) || 0;

    const gstAmt = Math.round(((appFee + procFee) * gstRate) / 100);
    fg.patchValue({ gstAmount: gstAmt }, { emitEvent: false });

    const total = appFee + procFee + gstAmt + emd + other;
    fg.patchValue({ totalFee: total }, { emitEvent: false });
    this.totalCalculatedFee.set(total);
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.attachedFileName.set(file.name);
      this.attachedFileSize.set(`${(file.size / 1024 / 1024).toFixed(1)} MB`);
      this.toastService.success('File Uploaded', `${file.name} attached.`);
    }
  }

  removeAttachedFile(): void {
    this.attachedFileName.set('');
    this.attachedFileSize.set('');
  }

  addDocumentRow(): void {
    this.docChecklist.update(list => [
      ...list,
      { name: 'Self-Declaration Affidavit on Non-Judicial Stamp', format: 'PDF' }
    ]);
  }

  removeDocumentRow(index: number): void {
    this.docChecklist.update(list => list.filter((_, i) => i !== index));
  }

  addTransactionRow(): void {
    this.transactionList.update(list => [
      ...list,
      { name: 'Additional Technical Scrutiny Cess', ref: 'TXN-REQ-CESS', amount: 1500 }
    ]);
  }

  removeTransactionRow(index: number): void {
    this.transactionList.update(list => list.filter((_, i) => i !== index));
  }

  // Removed tab navigation methods

  saveAsDraft(): void {
    const payload = {
      ...(this.isEditMode ? { id: this.eoiId } : {}),
      ...this.eoiForm.value,
      status: 'DRAFT',
      attachedFileName: this.attachedFileName(),
      attachedFileSize: this.attachedFileSize()
    };
    this.eoiService.saveEoi(payload).subscribe(saved => {
      this.toastService.info('Saved as Draft', `${saved.referenceNo} stored in Draft state.`);
      this.router.navigate(['/admin/eoi']);
    });
  }

  onSubmitPublish(): void {
    if (this.eoiForm.invalid) {
      this.eoiForm.markAllAsTouched();
      this.toastService.error('Validation Error', 'Please complete all required fields.');
      return;
    }

    const payload = {
      ...(this.isEditMode ? { id: this.eoiId } : {}),
      ...this.eoiForm.value,
      status: 'PUBLISHED',
      attachedFileName: this.attachedFileName(),
      attachedFileSize: this.attachedFileSize()
    };

    this.eoiService.saveEoi(payload).subscribe(saved => {
      this.toastService.success('EOI Published', `${saved.referenceNo} is published and ready for applications.`);
      this.router.navigate(['/admin/eoi']);
    });
  }
}
