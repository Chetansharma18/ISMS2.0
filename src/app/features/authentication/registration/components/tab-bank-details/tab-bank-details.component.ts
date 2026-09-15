import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TpPiaRegistrationService, COMMON_BANKS, TRANSFER_MODES, ACCOUNT_TYPES } from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';

@Component({
  selector: 'app-tab-bank-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Main Card: Bank Details (Step 3) -->
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <!-- Card Header -->
        <div class="px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Bank Details
            </h2>
          </div>
          <span class="text-xs text-slate-500 font-medium">
            Fields with <span class="text-rose-500 font-bold">*</span> are mandatory
          </span>
        </div>

        <!-- Card Body: 2-Column Responsive Layout (Left Side & Right Side) -->
        <div class="p-4 sm:p-6 lg:p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            
            <!-- ================= LEFT SIDE: Bank & Account Credentials ================= -->
            <div class="space-y-4 sm:space-y-4.5">
              <div class="pb-1 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bank & Account Credentials
                </h3>
              </div>

              <!-- 1. Name of the Bank * -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Name of the Bank <span class="text-rose-500 font-bold">*</span>
                </label>
                <div class="relative">
                  <input 
                    type="text" 
                    list="bankOptionsList"
                    placeholder="Search or enter bank name (e.g. State Bank of India)" 
                    [(ngModel)]="data.bankDetails.bankName" 
                    (ngModelChange)="onDataChange()"
                    [ngClass]="isFieldInvalid('bankDetails.bankName') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                    required
                  />
                  <datalist id="bankOptionsList">
                    @for (b of commonBanks; track b) {
                      <option [value]="b"></option>
                    }
                  </datalist>
                </div>
                @if (isFieldInvalid('bankDetails.bankName')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('bankDetails.bankName') }}</p>
                }
              </div>

              <!-- 2. Account No. * -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Account No. <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter Bank Account Number (9 to 18 digits)" 
                  [(ngModel)]="data.bankDetails.accountNo" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('bankDetails.accountNo') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 font-mono tracking-wider placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                />
                @if (isFieldInvalid('bankDetails.accountNo')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('bankDetails.accountNo') }}</p>
                }
              </div>

              <!-- 3. IFSC Code * -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  IFSC Code <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  maxlength="11" 
                  placeholder="e.g. SBIN0004129" 
                  [(ngModel)]="data.bankDetails.ifscCode" 
                  (ngModelChange)="data.bankDetails.ifscCode = (data.bankDetails.ifscCode || '').toUpperCase(); onDataChange()"
                  [ngClass]="isFieldInvalid('bankDetails.ifscCode') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 uppercase font-mono tracking-widest placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                />
                @if (isFieldInvalid('bankDetails.ifscCode')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('bankDetails.ifscCode') }}</p>
                }
              </div>

              <!-- 4. Type of Account -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Type of Account
                </label>
                <select 
                  [(ngModel)]="data.bankDetails.accountType" 
                  (change)="onDataChange()"
                  class="w-full h-10 px-3 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                >
                  <option value="">-- Select Type of Account --</option>
                  @for (type of accountTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>

              <!-- 5. Mode of electronic transfer -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Mode of electronic transfer
                </label>
                <select 
                  [(ngModel)]="data.bankDetails.electronicTransferMode" 
                  (change)="onDataChange()"
                  class="w-full h-10 px-3 border border-slate-300 rounded-md text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none cursor-pointer"
                >
                  <option value="">-- Select Mode of Electronic Transfer --</option>
                  @for (mode of transferModes; track mode) {
                    <option [value]="mode">{{ mode }}</option>
                  }
                </select>
              </div>

            </div>

            <!-- ================= RIGHT SIDE: Branch & Cheque Verification ================= -->
            <div class="space-y-4 sm:space-y-4.5">
              <div class="pb-1 border-b border-slate-100 flex items-center justify-between">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Branch & Verification Details
                </h3>
              </div>

              <!-- 6. Branch Name * -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Branch Name <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Malviya Nagar Branch, Jaipur" 
                  [(ngModel)]="data.bankDetails.branchName" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('bankDetails.branchName') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                />
                @if (isFieldInvalid('bankDetails.branchName')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('bankDetails.branchName') }}</p>
                }
              </div>

              <!-- 7. MICR Code -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  MICR Code
                </label>
                <input 
                  type="text" 
                  maxlength="9" 
                  placeholder="9-digit MICR code (e.g. 302002018)" 
                  [(ngModel)]="data.bankDetails.micrCode" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('bankDetails.micrCode') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-10 px-3.5 border rounded-md text-sm text-slate-800 font-mono tracking-widest placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                />
                @if (isFieldInvalid('bankDetails.micrCode')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('bankDetails.micrCode') }}</p>
                }
              </div>

              <!-- 8. Branch Address * -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Branch Address <span class="text-rose-500 font-bold">*</span>
                </label>
                <textarea 
                  rows="2"
                  placeholder="Enter complete postal address of the bank branch" 
                  [(ngModel)]="data.bankDetails.branchAddress" 
                  (ngModelChange)="onDataChange()"
                  [ngClass]="isFieldInvalid('bankDetails.branchAddress') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full p-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" 
                  required
                ></textarea>
                @if (isFieldInvalid('bankDetails.branchAddress')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('bankDetails.branchAddress') }}</p>
                }
              </div>

              <!-- 9. Upload Cancel Check -->
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Upload Cancel Check
                </label>

                @if (data.bankDetails.cancelledChequeFileName) {
                  <!-- Uploaded File Card -->
                  <div class="flex items-center justify-between p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs sm:text-sm font-bold text-slate-800 truncate" [title]="data.bankDetails.cancelledChequeFileName">
                          {{ data.bankDetails.cancelledChequeFileName }}
                        </p>
                        <p class="text-[11px] text-emerald-700 font-medium mt-0.5">
                          {{ data.bankDetails.cancelledChequeFileSize || 'Verified Document' }} • Ready
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 ml-2">
                      <label class="cursor-pointer text-xs font-semibold text-blue-900 hover:text-blue-700 underline">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event)" class="sr-only" />
                        Change
                      </label>
                      <span class="text-slate-300">|</span>
                      <button 
                        type="button" 
                        (click)="removeFile()"
                        class="text-xs font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                } @else {
                  <!-- Dropzone Box -->
                  <div 
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onFileDrop($event)"
                   [class.border-blue-500]="isDragging()"
                    class="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 rounded-lg p-4 sm:p-5 text-center transition cursor-pointer relative group"
                    [style.background]="isDragging() ? 'rgba(219,234,254,0.5)' : ''"
                  >
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      (change)="onFileSelected($event)" 
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div class="flex flex-col items-center justify-center gap-1.5">
                      <div class="w-9 h-9 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center group-hover:scale-105 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p class="text-xs sm:text-sm font-semibold text-slate-700">
                        Click to upload or drag & drop Cancelled Cheque
                      </p>
                      <p class="text-[11px] text-slate-400">
                        Supported formats: PDF, JPG, PNG (Max 5 MB)
                      </p>
                    </div>
                  </div>
                }

                @if (fileError()) {
                  <p class="text-xs text-rose-600 font-medium mt-1">{{ fileError() }}</p>
                }
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  `
})
export class TabBankDetailsComponent {
  private service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);

  readonly commonBanks = COMMON_BANKS;
  readonly transferModes = TRANSFER_MODES;
  readonly accountTypes = ACCOUNT_TYPES;

  readonly isDragging = signal<boolean>(false);
  readonly fileError = signal<string>('');

  readonly errors = computed(() => this.valService.validateTab3(this.service.formData()).errors);

  get data() {
    return this.service.formData();
  }

  private getFieldValue(fieldKey: string): any {
    const parts = fieldKey.split('.');
    let curr: any = this.data;
    for (const part of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[part];
    }
    return curr;
  }

  isFieldInvalid(fieldKey: string): boolean {
    const error = this.errors()[fieldKey];
    if (!error) return false;

    const val = this.getFieldValue(fieldKey);
    const hasValue = val !== undefined && val !== null && String(val).trim().length > 0;
    if (hasValue) {
      return true;
    }

    // Mandatory empty field: only show error if Tab 3 has been submitted (Next Step or Submit)
    return this.valService.isTabSubmitted(3);
  }

  getFieldError(fieldKey: string): string {
    return this.isFieldInvalid(fieldKey) ? (this.errors()[fieldKey] || '') : '';
  }

  private changeTimer: any;
  onDataChange() {
    if (this.changeTimer) clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => {
      this.service.updateFormData(curr => ({ ...curr }));
    }, 60);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
    input.value = '';
  }

  private handleFile(file: File) {
    this.fileError.set('');
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxBytes) {
      this.fileError.set(`"${file.name}" exceeds the maximum 5 MB limit.`);
      return;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      this.fileError.set(`Invalid file type "${file.name}". Please upload PDF, JPG, or PNG.`);
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const dateFormatted = new Date().toLocaleDateString('en-GB');

    this.service.updateFormData(curr => ({
      ...curr,
      bankDetails: {
        ...curr.bankDetails,
        cancelledChequeFileName: file.name,
        cancelledChequeFileSize: sizeFormatted,
      },
      // Automatically keep doc-bank in sync in documents list
      documents: curr.documents.map(d => d.id === 'doc-bank' ? {
        ...d,
        fileName: file.name,
        fileSize: sizeFormatted,
        uploadDate: dateFormatted,
        status: 'uploaded' as const
      } : d)
    }));
  }

  removeFile() {
    this.fileError.set('');
    this.service.updateFormData(curr => ({
      ...curr,
      bankDetails: {
        ...curr.bankDetails,
        cancelledChequeFileName: '',
        cancelledChequeFileSize: '',
      },
      documents: curr.documents.map(d => d.id === 'doc-bank' ? {
        ...d,
        fileName: undefined,
        fileSize: undefined,
        uploadDate: undefined,
        status: 'pending' as const
      } : d)
    }));
  }
}
