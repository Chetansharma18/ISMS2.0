import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EoiService } from '../../core/services/eoi.service';
import { EoiFieldService } from '../../core/services/eoi-field.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EoiItem, EoiFormField } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-preview',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <div>
      <admin-page-header 
        [title]="'Preview as Applicant: ' + (eoi()?.referenceNo || eoiId)"
        subtitle="Full fidelity applicant simulation: This is precisely what prospective organizations see when applying online"
        icon="preview"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Applicant Preview' }
        ]">
        <div header-actions class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            SIMULATION MODE
          </span>
          <a 
            routerLink="/admin/eoi" 
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            ← Exit Preview
          </a>
        </div>
      </admin-page-header>

      <div *ngIf="eoi() as item" class="max-w-5xl mx-auto space-y-6">
        
        <!-- Applicant Hero Header -->
        <div class="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
          <div class="flex items-center gap-2 text-blue-200 text-xs font-semibold mb-2 uppercase tracking-wider">
            <span>{{ item.department }}</span>
            <span>•</span>
            <span>Scheme: {{ item.schemeName }}</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight leading-snug">{{ item.title }}</h2>
          <div class="mt-4 pt-4 border-t border-blue-700/60 flex flex-wrap items-center justify-between gap-4 text-xs text-blue-100">
            <div>Ref No: <strong class="text-white font-mono">{{ item.referenceNo }}</strong></div>
            <div>Category: <strong class="text-white">{{ item.eoiCategory }}</strong></div>
            <div>Submission Deadline: <strong class="text-amber-300 font-bold">{{ item.closingDate }}</strong></div>
            <div>Total Fee: <strong class="text-emerald-300 font-bold">₹{{ item.fees.totalFee | number:'1.0-0' }}</strong></div>
          </div>
        </div>

        <!-- 1. Important Milestone Dates -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-700 text-[18px]">calendar_month</span>
            Important Tender Milestone Dates
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Published Date</span>
              <span class="font-bold text-slate-800">{{ item.publishedDate }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Applications Open</span>
              <span class="font-bold text-slate-800">{{ item.applicationStartDate }}</span>
            </div>
            <div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span class="text-[10px] text-amber-700 font-bold uppercase block">Last Date for Submission</span>
              <span class="font-bold text-amber-900">{{ item.closingDate }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Tender Opening Date</span>
              <span class="font-bold text-slate-800">{{ item.openingDate }}</span>
            </div>
          </div>
        </div>

        <!-- 2. Scope & Description -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Detailed Scope of Work</h3>
          <p class="text-xs text-slate-600 leading-relaxed">{{ item.description }}</p>
        </div>

        <!-- 3. Minimum Eligibility Criteria -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-700 text-[18px]">verified</span>
            Minimum Eligibility Criteria
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Min Past Experience</span>
              <span class="font-bold text-slate-800">{{ item.eligibility.minExperienceYears }} Years</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Min Annual Turnover</span>
              <span class="font-bold text-slate-800">INR {{ item.eligibility.minTurnoverCrores }} Crores</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Eligible Organization Types</span>
              <span class="font-bold text-slate-800 truncate block">{{ item.eligibility.organizationTypes.join(', ') }}</span>
            </div>
          </div>
          <ul class="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
            <li *ngFor="let c of item.eligibility.customCriteria">{{ c }}</li>
          </ul>
        </div>

        <!-- 4. Dynamic Application Form (Interactive simulated inputs) -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-700 text-[18px]">edit_note</span>
              Application Submission Questionnaire ({{ fields().length }} Custom Fields)
            </h3>
            <span class="text-[11px] text-slate-500 font-medium">Rendered via Form Builder</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div *ngFor="let f of fields()" class="space-y-1">
              <label class="block font-bold text-slate-800">
                {{ f.fieldLabel }}
                <span *ngIf="f.required" class="text-rose-600">*</span>
              </label>
              
              <input *ngIf="f.fieldType === 'Text' || f.fieldType === 'Number' || f.fieldType === 'Decimal' || f.fieldType === 'Email'" 
                type="text" [placeholder]="f.placeholder || ''" class="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50/50" />

              <textarea *ngIf="f.fieldType === 'Textarea'" rows="2" [placeholder]="f.placeholder || ''" class="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50/50"></textarea>

              <select *ngIf="f.fieldType === 'Dropdown'" class="w-full px-3 py-2 border rounded-lg text-xs bg-white">
                <option value="">-- Select --</option>
                <option *ngFor="let opt of f.options" [value]="opt.value">{{ opt.label }}</option>
              </select>

              <div *ngIf="f.fieldType === 'Radio' || f.fieldType === 'Checkbox' || f.fieldType === 'Multi Select'" class="space-y-1 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div *ngFor="let opt of f.options" class="flex items-center gap-2">
                  <input type="checkbox" class="rounded text-blue-600" />
                  <span>{{ opt.label }}</span>
                </div>
              </div>

              <input *ngIf="f.fieldType === 'Date'" type="date" class="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50/50" />

              <div *ngIf="f.fieldType === 'File Upload'" class="p-2 border border-dashed rounded-lg bg-slate-50 text-slate-500 flex items-center justify-between">
                <span>Upload PDF (Max {{ f.maxFileSizeMB || 5 }}MB)</span>
                <span class="material-symbols-outlined text-[18px]">upload</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Fee Breakdown & Payment Summary -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-700 text-[18px]">payments</span>
            Applicable Fees & Deposit Breakdown
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-slate-500 block">Earnest Money Deposit</span>
              <span class="font-bold text-slate-900 text-sm">₹{{ item.fees.emdFee | number:'1.0-0' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block">EOI Application Fee</span>
              <span class="font-bold text-slate-900 text-sm">₹{{ item.fees.applicationFee | number:'1.0-0' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block">Processing Fee (RISL)</span>
              <span class="font-bold text-slate-900 text-sm">₹{{ item.fees.processingFee | number:'1.0-0' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block">GST (18%)</span>
              <span class="font-bold text-slate-900 text-sm">₹{{ item.fees.gstAmount | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class EoiPreviewComponent implements OnInit {
  private eoiService = inject(EoiService);
  private fieldService = inject(EoiFieldService);
  private route = inject(ActivatedRoute);

  eoiId = 'EOI-2025-001';
  eoi = signal<EoiItem | null>(null);
  fields = signal<EoiFormField[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
    }
    this.eoiService.getEoiById(this.eoiId).subscribe(e => this.eoi.set(e || null));
    this.fieldService.getFieldsForEoi(this.eoiId).subscribe(f => this.fields.set(f));
  }
}
