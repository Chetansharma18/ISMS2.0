import { Component, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtrFormService } from '../../services/otr-form.service';
import { FileDoc } from '../../models/otr-form.model';
import { DocumentViewerModalComponent } from '../../../../shared/components/document-viewer-modal/document-viewer-modal.component';

@Component({
  selector: 'app-step5-preview',
  standalone: true,
  imports: [CommonModule, DocumentViewerModalComponent],
  template: `
    <div class="w-full space-y-4 font-sans bg-white pb-4">

      <!-- ====================================================================
           SECTION 1: ORGANISATION DETAILS (STEP 1)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <!-- Section Header Bar with Expand / Collapse & Edit -->
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="toggleSection(1)">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-[#0B3558] flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">
              Organisation Details
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="onEditStep(1)"
              class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              title="Edit Organisation Details"
            >
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              (click)="toggleSection(1)"
              class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              [attr.aria-expanded]="isSection1Open()"
              title="Toggle Section"
            >
              <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!isSection1Open()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        @if (isSection1Open()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <!-- Row 1 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation Name</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().fullName || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Nature of Entity</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().natureOfEntity || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Registration No. (CIN / Reg. No.)</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ step1().registrationNumber || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Registration</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().dateOfRegistration || '-' }}</span>
            </div>

            <!-- Row 2 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State / UT of Registration</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().stateOfLegalReg || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation PAN</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ step1().companyPan || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GST Registered</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().gstRegistered || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MSME / Udyam Registered</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().msmeRegistered || '-' }}</span>
            </div>

            <!-- Row 3 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">NSDC Partner</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().nsdcPartner || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Contact No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().contactNo || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email ID</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().emailId || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Website</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ step1().website || '-' }}</span>
            </div>

            <!-- Row 4 Addresses -->
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Registered Address</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ registeredAddressDisplay() }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Office Address</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ officeAddressDisplay() }}</span>
            </div>
          </div>
        }
      </section>

      <!-- ====================================================================
           SECTION 2: AUTHORIZED PERSON DETAILS (STEP 2)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <!-- Section Header Bar with Expand / Collapse & Edit -->
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="toggleSection(2)">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-[#0B3558] flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">
              Authorized Person Details
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="onEditStep(2)"
              class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              title="Edit Authorized Person Details"
            >
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              (click)="toggleSection(2)"
              class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              [attr.aria-expanded]="isSection2Open()"
              title="Toggle Section"
            >
              <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!isSection2Open()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        @if (isSection2Open()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <!-- Row 1 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Full Name</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().name || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Designation</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().designation || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Birth</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().dob || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Age</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().age ? (step3().age + ' Years') : (step3().dob ? 'Calculated' : '-') }}</span>
            </div>

            <!-- Row 2 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">PAN</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ step3().pan || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Aadhaar No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ step3().aadhaarNo || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Mobile No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().mobileNo || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email Address</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().emailId || '-' }}</span>
            </div>

            <!-- Row 3 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Bhamashah No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().bhamashahNo || 'Not Provided' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Voter ID No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().voterIdNo || 'Not Provided' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Passport No.</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().passportNo || 'Not Provided' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().state || '-' }}</span>
            </div>

            <!-- Row 4 Address -->
            <div class="sm:col-span-4">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Residential Address</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ step3().residenceAddress || '-' }}</span>
            </div>
          </div>
        }
      </section>

      <!-- ====================================================================
           SECTION 3: BANK DETAILS (STEP 3)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <!-- Section Header Bar with Expand / Collapse & Edit -->
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="toggleSection(3)">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-[#0B3558] flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">
              Bank Details
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="onEditStep(3)"
              class="inline-flex items-center px-3 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              title="Edit Bank Details"
            >
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              (click)="toggleSection(3)"
              class="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              [attr.aria-expanded]="isSection3Open()"
              title="Toggle Section"
            >
              <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="!isSection3Open()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>


        @if (isSection3Open()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <!-- Row 1 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Bank Name</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step4().bankName || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Branch Name</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step4().branchName || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Holder Name</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step4().accountHolderName || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Number</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ step4().accountNo || '-' }}</span>
            </div>

            <!-- Row 2 -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Account Type</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step4().accountType || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">IFSC Code</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ step4().ifscCode || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MICR Code</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 font-mono">{{ step4().micrCode || 'Optional / -' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Transfer Mode</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step4().transferMode || 'NEFT' }}</span>
            </div>

            <!-- Row 3 Address -->
            <div class="sm:col-span-4">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Branch Address</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 leading-relaxed">{{ step4().branchAddress || '-' }}</span>
            </div>
          </div>
        }
      </section>

      <!-- Document Preview Modal Dialog (if needed) -->
      <app-document-viewer-modal
        [isOpen]="isViewerOpen()"
        [doc]="activeDoc()"
        [title]="activeDocTitle()"
        (close)="closeViewer()"
      ></app-document-viewer-modal>

    </div>
  `
})
export class Step5PreviewComponent {
  private otrFormService = inject(OtrFormService);

  readonly step1 = computed(() => this.otrFormService.step1());
  readonly step3 = computed(() => this.otrFormService.step3()); // Authorized Person Details
  readonly step4 = computed(() => this.otrFormService.step4()); // Bank Details

  isSection1Open = signal<boolean>(true);
  isSection2Open = signal<boolean>(true);
  isSection3Open = signal<boolean>(true);

  toggleSection(section: number): void {
    if (section === 1) this.isSection1Open.set(!this.isSection1Open());
    if (section === 2) this.isSection2Open.set(!this.isSection2Open());
    if (section === 3) this.isSection3Open.set(!this.isSection3Open());
  }

  readonly registeredAddressDisplay = computed(() => {
    const s = this.step1();
    const parts: string[] = [];
    if (s.registeredAddress?.trim()) parts.push(s.registeredAddress.trim());
    if (s.registeredDistrict?.trim()) parts.push(s.registeredDistrict.trim());
    if (s.registeredState?.trim()) parts.push(s.registeredState.trim());
    let str = parts.join(', ');
    if (s.registeredPincode?.trim()) str += (str ? ' - ' : '') + s.registeredPincode.trim();
    return str || '-';
  });

  readonly officeAddressDisplay = computed(() => {
    const s = this.step1();
    if (s.sameAsRegistered) {
      return 'Same as registered address';
    }
    const parts: string[] = [];
    if (s.officeAddress?.trim()) parts.push(s.officeAddress.trim());
    if (s.officeDistrict?.trim()) parts.push(s.officeDistrict.trim());
    if (s.officeState?.trim()) parts.push(s.officeState.trim());
    let str = parts.join(', ');
    if (s.officePincode?.trim()) str += (str ? ' - ' : '') + s.officePincode.trim();
    return str || '-';
  });

  editStep = output<number>();

  isViewerOpen = signal<boolean>(false);
  activeDoc = signal<FileDoc | null>(null);
  activeDocTitle = signal<string>('');

  onEditStep(step: number): void {
    this.editStep.emit(step);
  }

  previewDoc(doc: FileDoc, title?: string): void {
    this.activeDoc.set(doc);
    this.activeDocTitle.set(title || doc.fileName);
    this.isViewerOpen.set(true);
  }

  closeViewer(): void {
    this.isViewerOpen.set(false);
    this.activeDoc.set(null);
  }
}
