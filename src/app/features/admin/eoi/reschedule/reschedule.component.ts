import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EoiService } from '../../core/services/eoi.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EoiItem } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-reschedule',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div>
      <admin-page-header 
        [title]="'Reschedule EOI: ' + (eoi()?.referenceNo || eoiId)"
        subtitle="Mandatory Corrigendum / Amendment rule: Rescheduling dates legally requires attaching an official Gazetted Corrigendum or Amendment notice"
        icon="update"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Reschedule EOI' }
        ]">
        <div header-actions>
          <a 
            routerLink="/admin/eoi" 
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            ← Back to All EOIs
          </a>
        </div>
      </admin-page-header>

      <div *ngIf="eoi() as item" class="space-y-6">
        
        <!-- CURRENT SCHEDULE SUMMARY CARD -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-700 text-[18px]">calendar_today</span>
              Current Official Tender Schedule
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 font-medium">Current Version:</span>
              <span class="font-mono font-bold text-blue-900">v{{ item.version }}</span>
              <admin-status-badge [status]="item.status"></admin-status-badge>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase font-bold block">Current Start Date</span>
              <span class="font-bold text-slate-800 text-sm mt-0.5 block">{{ item.applicationStartDate }}</span>
            </div>
            <div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span class="text-[10px] text-amber-700 uppercase font-bold block">Current Closing Date</span>
              <span class="font-bold text-amber-900 text-sm mt-0.5 block">{{ item.closingDate }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase font-bold block">Tender Opening Date</span>
              <span class="font-semibold text-slate-800 text-sm mt-0.5 block">{{ item.openingDate }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] text-slate-500 uppercase font-bold block">Applications Received</span>
              <span class="font-bold text-[#131A4D] text-sm mt-0.5 block">{{ item.applicationCount }} Submissions</span>
            </div>
          </div>
        </div>

        <form [formGroup]="rescheduleForm" (ngSubmit)="initiateConfirmation()" class="space-y-6">
          
          <!-- SECTION 1: REVISED SCHEDULE DATES & REASON -->
          <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div class="border-b border-slate-100 pb-3">
              <h3 class="text-sm font-bold text-slate-900">1. Revised Schedule & Justification</h3>
              <p class="text-xs text-slate-500">Provide updated submission windows and the administrative justification</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  New Start Date <span class="text-rose-600">*</span>
                </label>
                <input 
                  type="date" 
                  formControlName="newStartDate"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  New Closing Date <span class="text-rose-600">*</span>
                </label>
                <input 
                  type="date" 
                  formControlName="newClosingDate"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Official Administrative Reason for Rescheduling <span class="text-rose-600">*</span>
                </label>
                <textarea 
                  rows="3" 
                  formControlName="reason"
                  placeholder="e.g. Administrative extension requested by Industry Associations to accommodate revised technical certification norms..."
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"></textarea>
              </div>
            </div>
          </div>

          <!-- SECTION 2: MANDATORY CORRIGENDUM / AMENDMENT DOCUMENT UPLOAD -->
          <div class="bg-white rounded-xl shadow-xs border-2 border-amber-300 p-6 space-y-4 bg-amber-50/10">
            <div class="border-b border-amber-200 pb-3 flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2 text-amber-900">
                  <span class="material-symbols-outlined text-[20px] text-amber-600">verified</span>
                  <h3 class="text-sm font-bold">2. Mandatory Corrigendum / Amendment Notification</h3>
                </div>
                <p class="text-xs text-amber-800 mt-0.5">
                  Statutory Rule: You cannot publish a revised schedule without uploading an official signed PDF notice.
                </p>
              </div>
              <span class="px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                MANDATORY
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Type -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Document Type <span class="text-rose-600">*</span>
                </label>
                <select 
                  formControlName="docType"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                  <option value="Corrigendum">Corrigendum (Date Extension / Tender Clarification)</option>
                  <option value="Amendment">Amendment (Scope / Terms Modification)</option>
                </select>
              </div>

              <!-- Document Number -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Document Reference Number <span class="text-rose-600">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="docNumber"
                  placeholder="e.g. RSLDC/EOI/CORR/2025/02"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
              </div>

              <!-- Title -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Document Title / Subject <span class="text-rose-600">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="docTitle"
                  placeholder="e.g. Corrigendum-01: Extension of Submission Last Date"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
              </div>

              <!-- Attachment Upload -->
              <div class="sm:col-span-2 lg:col-span-3 p-4 bg-white rounded-xl border border-slate-200">
                <label class="block text-xs font-bold text-slate-800 mb-2">
                  Attach Official Signed Notification (PDF) <span class="text-rose-600">*</span>
                </label>
                
                <div class="flex flex-col sm:flex-row items-center gap-4">
                  <input 
                    type="file" 
                    accept=".pdf"
                    (change)="onFileSelect($event)"
                    class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer" />

                  <div *ngIf="uploadedFileName()" class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800 font-semibold whitespace-nowrap">
                    <span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                    <span>{{ uploadedFileName() }} ({{ uploadedFileSize() }})</span>
                    <button type="button" (click)="clearFile()" class="text-rose-500 hover:text-rose-700 ml-1">
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
                <p *ngIf="!uploadedFileName()" class="text-[11px] text-rose-600 mt-1 font-semibold">
                  ⚠️ File attachment is strictly mandatory. Rescheduling cannot proceed without upload.
                </p>
              </div>
            </div>
          </div>

          <!-- SUBMIT BUTTON -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <a 
              routerLink="/admin/eoi" 
              class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </a>
            <button 
              type="submit" 
              [disabled]="!uploadedFileName() || rescheduleForm.invalid"
              class="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">rule</span>
              Review & Confirm Reschedule
            </button>
          </div>

        </form>
      </div>

      <!-- CONFIRMATION MODAL (Section 40) -->
      <admin-modal 
        [isOpen]="showConfirmModal()"
        title="Confirm EOI Reschedule & Corrigendum Publication"
        icon="published_with_changes"
        maxWidth="xl"
        (close)="showConfirmModal.set(false)">
        <div modal-body class="space-y-4 text-xs text-slate-700">
          <div class="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-medium">
            Please verify the schedule comparison below. Once confirmed, a new version will be issued and the Corrigendum will be public.
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1">Current Schedule</span>
              <p>Start: <strong>{{ eoi()?.applicationStartDate }}</strong></p>
              <p>Closing: <strong>{{ eoi()?.closingDate }}</strong></p>
              <p>Version: <strong>v{{ eoi()?.version }}</strong></p>
            </div>

            <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span class="text-[10px] font-bold uppercase text-blue-700 block mb-1">New Schedule</span>
              <p>New Start: <strong class="text-blue-900">{{ rescheduleForm.get('newStartDate')?.value }}</strong></p>
              <p>New Closing: <strong class="text-blue-900">{{ rescheduleForm.get('newClosingDate')?.value }}</strong></p>
              <p>New Version: <strong class="text-blue-900">v1.2 (Next Version)</strong></p>
            </div>
          </div>

          <div>
            <span class="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Reason for Rescheduling</span>
            <p class="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {{ rescheduleForm.get('reason')?.value }}
            </p>
          </div>

          <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase text-emerald-800 block">Verified Attached Document</span>
              <span class="font-bold text-emerald-950">{{ rescheduleForm.get('docTitle')?.value }}</span>
              <span class="block text-[10px] text-emerald-700">Ref: {{ rescheduleForm.get('docNumber')?.value }}</span>
            </div>
            <span class="text-xs font-semibold text-emerald-800 font-mono">{{ uploadedFileName() }}</span>
          </div>
        </div>

        <div modal-footer class="flex items-center gap-2">
          <button (click)="showConfirmModal.set(false)" class="px-3.5 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100">
            Cancel
          </button>
          <button (click)="executeReschedule()" class="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">publish</span>
            Publish Revised Schedule
          </button>
        </div>
      </admin-modal>

    </div>
  `
})
export class RescheduleComponent implements OnInit {
  private eoiService = inject(EoiService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  eoiId = 'EOI-2025-001';
  eoi = signal<EoiItem | null>(null);

  rescheduleForm!: FormGroup;
  uploadedFileName = signal<string>('Corrigendum_02_Extension_Notice.pdf');
  uploadedFileSize = signal<string>('850 KB');

  showConfirmModal = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
    }
    this.eoiService.getEoiById(this.eoiId).subscribe(item => {
      this.eoi.set(item || null);
      if (item) {
        this.rescheduleForm.patchValue({
          newStartDate: item.applicationStartDate,
          newClosingDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          docNumber: `${item.referenceNo}/CORR/02`
        });
      }
    });

    this.rescheduleForm = this.fb.group({
      newStartDate: ['', Validators.required],
      newClosingDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      docType: ['Corrigendum', Validators.required],
      docNumber: ['RSLDC/EOI/CORR/2025/02', Validators.required],
      docTitle: ['Corrigendum-02: Extension of Submission Last Date & RFP Clarification', Validators.required]
    });
  }

  onFileSelect(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.uploadedFileName.set(file.name);
      this.uploadedFileSize.set(`${(file.size / 1024).toFixed(0)} KB`);
      this.toastService.success('Document Attached', `${file.name} uploaded successfully.`);
    }
  }

  clearFile(): void {
    this.uploadedFileName.set('');
    this.uploadedFileSize.set('');
  }

  initiateConfirmation(): void {
    if (this.rescheduleForm.invalid || !this.uploadedFileName()) {
      this.toastService.error('Incomplete Information', 'All date, reason, and document upload parameters are required.');
      return;
    }
    this.showConfirmModal.set(true);
  }

  executeReschedule(): void {
    const val = this.rescheduleForm.value;
    this.eoiService.rescheduleEoi(
      this.eoiId,
      val.newStartDate,
      val.newClosingDate,
      val.reason,
      {
        type: val.docType,
        documentNumber: val.docNumber,
        title: val.docTitle,
        description: val.reason,
        attachmentFileName: this.uploadedFileName(),
        attachmentFileSize: this.uploadedFileSize()
      }
    ).subscribe(res => {
      this.showConfirmModal.set(false);
      if (res.success) {
        this.toastService.success('EOI Rescheduled', res.message);
        this.router.navigate(['/admin/eoi']);
      } else {
        this.toastService.error('Rescheduling Failed', res.message);
      }
    });
  }
}
