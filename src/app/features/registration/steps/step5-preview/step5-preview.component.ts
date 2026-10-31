import { ChangeDetectionStrategy, Component, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtrFormService } from '../../services/otr-form.service';
import { FileDoc } from '../../models/otr-form.model';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';
import { ButtonComponent, IconComponent } from '../../../../shared';

@Component({
  selector: 'app-step5-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div class="w-full space-y-4 font-sans bg-white pb-4">

      <!-- ====================================================================
           SECTION 1: ORGANISATION DETAILS (STEP 1)
           ==================================================================== -->
      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <!-- Section Header Bar with Expand / Collapse & Edit -->
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 cursor-pointer select-none" (click)="toggleSection(1)">
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">
              Organisation Details
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <button appButton variant="outline" size="sm" type="button" (click)="onEditStep(1)" title="Edit Organisation Details">
              <span>Edit Details</span>
            </button>

            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              type="button"
              (click)="toggleSection(1)"
              [attr.aria-expanded]="isSection1Open()"
              title="Toggle Section"
              aria-label="Toggle Section"
            >
              <app-icon name="chevron-down" class="transition-transform duration-200" [class.rotate-180]="!isSection1Open()" />
            </button>
          </div>
        </div>

        @if (isSection1Open()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <!-- Row 1: Basic Organisation Details -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation Name</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().fullName || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Nature of Entity</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().natureOfEntity || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Preferred Sector</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().preferredSector || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">NSDC Partner</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().nsdcPartner || '-' }}</span>
            </div>

            <!-- Row 2: Registrations & Status -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Registration No. (CIN / Reg. No.)</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ step1().registrationNumber || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Date of Registration</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().dateOfRegistration || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State / UT of Registration</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().stateOfLegalReg || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation PAN</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ step1().companyPan || '-' }}</span>
            </div>

            <!-- Row 3: Documents & GST / MSME Status -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Certificate of Registration</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 truncate">{{ step1().registrationCertDoc?.fileName || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation PAN Card</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 truncate">{{ step1().panCardDoc?.fileName || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GST Registered</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().gstRegistered || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MSME / Udyam Registered</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().msmeRegistered || '-' }}</span>
            </div>

            <!-- Conditional GST Fields (if GST Registered is Yes) -->
            @if (step1().gstRegistered === 'Yes') {
              <div>
                <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GSTIN</span>
                <span class="font-medium text-slate-900 text-[12.5px] block mt-1 uppercase">{{ step1().gstin || '-' }}</span>
              </div>
              <div class="sm:col-span-3">
                <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">GST Registration Certificate</span>
                <span class="font-medium text-slate-900 text-[12.5px] block mt-1 truncate">{{ step1().gstCertDoc?.fileName || '-' }}</span>
              </div>
            }

            <!-- Conditional MSME Fields (if MSME Registered is Yes) -->
            @if (step1().msmeRegistered === 'Yes') {
              <div>
                <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Udyam Registration Number</span>
                <span class="font-medium text-slate-900 text-[12.5px] block mt-1 uppercase">{{ step1().udyamNumber || '-' }}</span>
              </div>
              <div class="sm:col-span-3">
                <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MSME / Udyam Certificate</span>
                <span class="font-medium text-slate-900 text-[12.5px] block mt-1 truncate">{{ step1().msmeCertDoc?.fileName || '-' }}</span>
              </div>
            }

            <!-- Row 4: Contact Information -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Contact Number</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ step1().contactNo || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Organisation Email ID</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step1().emailId || '-' }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Website</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 break-all">{{ step1().website || '-' }}</span>
            </div>

            <!-- Row 5: Addresses -->
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
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">
              Authorized Person Details
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <button appButton variant="outline" size="sm" type="button" (click)="onEditStep(2)" title="Edit Authorized Person Details">
              <span>Edit Details</span>
            </button>

            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              type="button"
              (click)="toggleSection(2)"
              [attr.aria-expanded]="isSection2Open()"
              title="Toggle Section"
              aria-label="Toggle Section"
            >
              <app-icon name="chevron-down" class="transition-transform duration-200" [class.rotate-180]="!isSection2Open()" />
            </button>
          </div>
        </div>

        @if (isSection2Open()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <!-- Row 1: Personal & Contact Details -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Full Name</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ authPersonFullName() }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Designation</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().designation || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Mobile Number</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ step3().mobileNo || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Email Address</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().emailId || '-' }}</span>
            </div>

            <!-- Row 2: Identity Verification -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Identity Document Type</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">
                {{ step3().identityDocType || (step3().aadhaarNo ? 'Aadhaar Card' : step3().pan ? 'PAN Card' : '-') }}
              </span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Document Number</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">
                {{ step3().identityDocNumber || step3().aadhaarNo || step3().pan || step3().voterIdNo || step3().bhamashahNo || step3().passportNo || '-' }}
              </span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Identity Document Upload</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 truncate">
                {{ step3().idProofDoc?.fileName || '-' }}
              </span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Authorization Letter / Board Resolution</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 truncate">
                {{ step3().authorizationLetterDoc?.fileName || '-' }}
              </span>
            </div>

            <!-- Row 3: Address & State -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">State</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ step3().state || '-' }}</span>
            </div>
            <div class="sm:col-span-3">
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
            <span class="w-5 h-5 rounded-full border border-sky-400 text-navy flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">
              Organisation Bank Details
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <button appButton variant="outline" size="sm" type="button" (click)="onEditStep(3)" title="Edit Organisation Bank Details">
              <span>Edit Details</span>
            </button>

            <button
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              type="button"
              (click)="toggleSection(3)"
              [attr.aria-expanded]="isSection3Open()"
              title="Toggle Section"
              aria-label="Toggle Section"
            >
              <app-icon name="chevron-down" class="transition-transform duration-200" [class.rotate-180]="!isSection3Open()" />
            </button>
          </div>
        </div>

        @if (isSection3Open()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <!-- Row 1: Bank & Branch -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Name of the Bank</span>
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
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ step4().accountNo || '-' }}</span>
            </div>

            <!-- Row 2: Codes & Document -->
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">IFSC Code</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums uppercase">{{ step4().ifscCode || '-' }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">MICR Code</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums">{{ step4().micrCode || '-' }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-500 block text-[11.5px] font-normal leading-tight">Upload Cancelled Cheque / Bank Passbook</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 truncate">{{ step4().cancelledChequeDoc?.fileName || '-' }}</span>
            </div>
          </div>
        }
      </section>

    </div>
  `
})
export class Step5PreviewComponent {
  private otrFormService = inject(OtrFormService);
  private docViewer = inject(DocumentViewerService);

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

  readonly authPersonFullName = computed(() => {
    const s = this.step3();
    if (s.name?.trim()) return s.name.trim();
    const parts = [s.firstName?.trim(), s.lastName?.trim()].filter(Boolean);
    return parts.length ? parts.join(' ') : '-';
  });

  readonly registeredAddressDisplay = computed(() => {
    const s = this.step1();
    if (!s.registeredAddress?.trim() && !s.registeredDistrict?.trim() && !s.registeredPincode?.trim()) {
      return '-';
    }
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
    if (!s.officeAddress?.trim() && !s.officeDistrict?.trim() && !s.officePincode?.trim()) {
      return '-';
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

  onEditStep(step: number): void {
    this.editStep.emit(step);
  }

  previewDoc(doc: FileDoc, title?: string): void {
    this.docViewer.openDocument(doc, title);
  }
}
