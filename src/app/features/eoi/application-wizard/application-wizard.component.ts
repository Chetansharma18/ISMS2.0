import { Component, inject, signal, computed, effect, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { StepNavComponent } from './components/step-nav/step-nav.component';
import { SchemeBannerComponent } from './components/scheme-banner/scheme-banner.component';
import { StepDocumentsComponent } from './components/step-documents/step-documents.component';
import { StepPaymentComponent } from './components/step-payment/step-payment.component';
import { StepPreviewComponent } from './components/step-preview/step-preview.component';
import { StepReceiptComponent } from './components/step-receipt/step-receipt.component';
import { EoiService } from './services/eoi.service';
import { EoiStateService, Scheme } from '../../../core/services/eoi-state.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { RAJASTHAN_DISTRICTS, EOI_SECTIONS } from './models/eoi.model';

@Component({
  selector: 'app-application-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    StepNavComponent,
    SchemeBannerComponent,
    StepDocumentsComponent,
    StepPaymentComponent,
    StepPreviewComponent,
    StepReceiptComponent
  ],
  templateUrl: './application-wizard.component.html',
  styleUrls: ['./application-wizard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ApplicationWizardComponent implements OnInit {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly eoiStateService = inject(EoiStateService);
  readonly eoiService = inject(EoiService);
  readonly pdfService = inject(PdfGeneratorService);
  readonly districts = RAJASTHAN_DISTRICTS;
  readonly sections = EOI_SECTIONS;

  // Currently selected Scheme & Tender info
  readonly selectedScheme = signal<Scheme | null>(null);

  // Modals state
  readonly showDocConfirmModal = signal<boolean>(false);
  readonly showPaymentSuccessModal = signal<boolean>(false);
  readonly showSubmitConfirmModal = signal<boolean>(false);
  readonly showPdfViewerModal = signal<boolean>(false);
  readonly currentViewingDoc = signal<{ title: string; fileName: string; fileSize: string } | null>(null);

  // Validation errors map
  readonly validationErrors = signal<Record<string, string>>({});

  // Receipt copy state
  readonly copiedRef = signal<boolean>(false);

  constructor() {
    // Lock body scroll when any modal is active
    effect(() => {
      const anyModalOpen =
        this.showDocConfirmModal() ||
        this.showPaymentSuccessModal() ||
        this.showSubmitConfirmModal() ||
        this.showPdfViewerModal();

      if (anyModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Automatically scroll to the top of the page on step/flow transition
    effect(() => {
      this.eoiService.flowStage();
      this.eoiService.currentSection();
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const schemeId = params.get('id') || 'EOI-MMKVY-2026-01';
      this.loadSchemeDetails(schemeId);
    });
  }

  private loadSchemeDetails(schemeId: string): void {
    this.eoiStateService.schemes$.subscribe(schemes => {
      const found = schemes.find(s => s.id === schemeId || s.schemeCode === schemeId || s.tenderId === schemeId);
      const active = found || (schemes.length > 0 ? schemes[0] : null);
      if (active) {
        this.selectedScheme.set(active);
        this.eoiService.setSchemeFees(
          active.processingFee,
          active.emdAmount,
          active.name,
          active.eoiReferenceNo,
          active.id || active.schemeCode
        );
      }
    });
  }

  goToAllSchemes(): void {
    this.router.navigate(['/schemes']);
  }

  // Keyboard accessibility: Escape closes open modal
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showDocConfirmModal()) this.showDocConfirmModal.set(false);
    if (this.showSubmitConfirmModal()) this.showSubmitConfirmModal.set(false);
    if (this.showPdfViewerModal()) this.showPdfViewerModal.set(false);
  }

  // Document view helper
  onViewDocument(doc: { title: string; fileName: string; fileSize: string }): void {
    this.currentViewingDoc.set(doc);
    this.showPdfViewerModal.set(true);
  }

  closePdfViewer(): void {
    this.showPdfViewerModal.set(false);
    this.currentViewingDoc.set(null);
  }

  // 1. Step 1 Documents: Save & Next
  handleDocumentsNext(): void {
    const errors: Record<string, string> = {};
    const slots = this.eoiService.uploadSlots();

    // Check mandatory documents
    slots.forEach(slot => {
      if (slot.isMandatory && !slot.fileName) {
        errors[`doc_${slot.id}`] = `${slot.title} is required. Please upload a valid PDF (max 5 MB).`;
      }
    });

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.eoiService.showToast('Please upload all mandatory documents (* Required) before proceeding.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    this.validationErrors.set({});
    this.showDocConfirmModal.set(true);
  }

  confirmProceedToFees(): void {
    this.showDocConfirmModal.set(false);
    this.eoiService.goToFees();
  }

  closeDocConfirmModal(): void {
    this.showDocConfirmModal.set(false);
  }

  // 2. Step 2 Fees: Proceed to Payment
  handleProceedToPayment(): void {
    const pay = this.eoiService.paymentData();
    const errors: Record<string, string> = {};

    const procFee = pay.processingFee || 2000;
    const emdFee = pay.emdFee || 50000;
    const procFeeStr = '₹' + procFee.toLocaleString('en-IN');
    const emdFeeStr = '₹' + emdFee.toLocaleString('en-IN');

    if (!pay.processingFeeSelected && !pay.emdFeeSelected) {
      errors['fees_selection'] = `Both Processing Fee (${procFeeStr}) and Earnest Money Deposit (EMD ${emdFeeStr}) are compulsory. Please select both fees to proceed.`;
    } else if (!pay.processingFeeSelected) {
      errors['fees_selection'] = `Processing Fee (${procFeeStr}) is compulsory. Please select it to proceed.`;
    } else if (!pay.emdFeeSelected) {
      errors['fees_selection'] = `Earnest Money Deposit (EMD ${emdFeeStr}) is compulsory. Please select it to proceed.`;
    }

    if (!pay.paymentMethod) {
      errors['payment_method'] = 'Please select a payment method.';
    }

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.eoiService.showToast('Both Processing Fee and EMD Fee are compulsory to proceed.');
      return;
    }

    this.validationErrors.set({});
    this.eoiService.processMockPayment(() => {
      this.showPaymentSuccessModal.set(true);
    });
  }

  continueToPreview(): void {
    this.showPaymentSuccessModal.set(false);
    this.eoiService.goToPreview();
  }

  // 3. Step 3 Preview: Section-level Edit & Submit
  editSection(sectionId: number): void {
    this.validationErrors.set({});
    this.eoiService.editIndividualSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFieldError(field: string): void {
    if (this.validationErrors()[field]) {
      const current = { ...this.validationErrors() };
      delete current[field];
      this.validationErrors.set(current);
    }
  }

  private scrollToPreviewSection(secId: number | null): void {
    if (!secId) return;
    setTimeout(() => {
      const targetEl = document.getElementById(`preview-sec-${secId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetEl.classList.add('section-highlight-pulse');
        setTimeout(() => targetEl.classList.remove('section-highlight-pulse'), 2500);
      }
    }, 120);
  }

  saveSectionAndReturn(): void {
    const targetSecId = this.eoiService.activeEditSectionId();
    const form = this.eoiService.formData();
    const errors: Record<string, string> = {};

    if (targetSecId === 1) {
      const org = form.orgBasicDetails;
      if (!String(org.tp_full_name || '').trim()) errors['tp_full_name'] = 'TP/PIA Full Name is required';
      if (!String(org.tp_short_name || '').trim()) errors['tp_short_name'] = 'TP/PIA Short Name is required';
      if (!String(org.organisation_contact_no || '').trim()) errors['organisation_contact_no'] = 'Contact Number is required';
      if (!String(org.company_email || '').trim()) errors['company_email'] = 'Company Email is required';
      if (!String(org.registered_address || '').trim()) errors['registered_address'] = 'Registered Address is required';
      if (!String(org.state_ut || '').trim()) errors['state_ut'] = 'State / UT is required';
      if (!String(org.district || '').trim()) errors['district'] = 'District is required';
      if (!String(org.pincode || '').trim()) errors['pincode'] = 'Pincode is required';
      if (!String(org.turnover_lakhs ?? '').trim()) errors['turnover_lakhs'] = 'Turnover is required';
      if (!String(org.postal_address || '').trim()) errors['postal_address'] = 'Postal Address is required';
    } else if (targetSecId === 2) {
      const auth = form.authPersonDetails;
      if (!String(auth.auth_name || '').trim()) errors['auth_name'] = 'Authorized Person Name is required';
      if (!String(auth.auth_mobile || '').trim()) errors['auth_mobile'] = 'Mobile Number is required';
      if (!String(auth.auth_pan || '').trim()) errors['auth_pan'] = 'PAN is required';
    } else if (targetSecId === 3) {
      const bank = form.bankDetails;
      if (!String(bank.bank_name || '').trim()) errors['bank_name'] = 'Bank Name is required';
      if (!String(bank.bank_account_no || '').trim()) errors['bank_account_no'] = 'Account Number is required';
      if (!String(bank.bank_ifsc || '').trim()) errors['bank_ifsc'] = 'IFSC Code is required';
      if (!String(bank.bank_branch_name || '').trim()) errors['bank_branch_name'] = 'Branch Name is required';
      if (!String(bank.bank_branch_address || '').trim()) errors['bank_branch_address'] = 'Branch Address is required';
    } else if (targetSecId === 5) {
      const sec5 = form.section6;
      if (!String(sec5.district_city || '').trim()) errors['district_city'] = 'District / City is required';
      if (!String(sec5.training_center_name || '').trim()) errors['training_center_name'] = 'Training Centre Name is required';
      if (!String(sec5.telephone_number || '').trim()) errors['telephone_number'] = 'Telephone Number is required';
      if (!String(sec5.number_of_classrooms ?? '').trim()) errors['number_of_classrooms'] = 'Number of Classrooms is required';
      if (!String(sec5.full_address || '').trim()) errors['full_address'] = 'Full Address is required';
    }

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.eoiService.showToast('Please fill all compulsory fields marked with * before saving.');
      return;
    }

    this.validationErrors.set({});
    this.eoiService.saveAndReturnToPreview();
    this.scrollToPreviewSection(targetSecId);
  }

  cancelSectionAndReturn(): void {
    const targetSecId = this.eoiService.activeEditSectionId();
    this.validationErrors.set({});
    this.eoiService.editingSectionId.set(null);
    this.eoiService.setFlowStage('preview');
    this.scrollToPreviewSection(targetSecId);
  }

  openSubmitConfirmation(): void {
    this.showSubmitConfirmModal.set(true);
  }

  closeSubmitConfirmModal(): void {
    this.showSubmitConfirmModal.set(false);
  }

  confirmFinalSubmission(): void {
    this.showSubmitConfirmModal.set(false);
    this.eoiService.finalizeSubmission();
  }

  // 4. Step 4 Receipt Actions
  printReceipt(): void {
    window.print();
  }

  downloadReceipt(): void {
    const sub = this.eoiService.submissionData();
    const pay = this.eoiService.paymentData();
    const org = this.eoiService.formData().orgBasicDetails;
    const auth = this.eoiService.formData().authPersonDetails;

    this.pdfService.downloadReceiptPdf({
      applicationNumber: sub.applicationNumber || 'ISMS-TP-2026-884921',
      acknowledgementReceiptNumber: sub.acknowledgementReceiptNumber || 'ACK-RSLDC-2026-9921',
      eoiRefNumber: sub.eoiRefNumber || 'EOI/RSLDC/ISMS/2026/04',
      submissionDate: sub.submissionDate || '08-Sep-2026',
      submissionTimestamp: sub.submissionTimestamp || '08-Sep-2026, 03:45 PM',
      tpName: org.tp_full_name || sub.applicantName || 'Apex Skill Development Foundation',
      regNumber: org.registration_number || 'REG/RAJ/2018/88921',
      tpPan: org.organisation_pan || 'AAACA1234C',
      tpEmail: org.company_email || 'contact@apexskills.org',
      tpMobile: org.organisation_contact_no || '9829012345',
      authPerson: auth.auth_name || 'Rajesh Kumar Sharma',
      authDesignation: auth.auth_designation || 'Managing Director & CEO',
      processingFee: pay.processingFee || pay.processingFeeAmount || 2000,
      emdFee: pay.emdFee || pay.emdFeeAmount || 50000,
      totalFee: pay.totalAmount || this.eoiService.computedTotalFee() || ((pay.processingFee || 2000) + (pay.emdFee || 50000)),
      transactionId: pay.transactionId || 'TXN-ISMS-2026-884921',
      paymentMethod: pay.paymentMethod || 'UPI / Online Gateway',
      paymentDate: pay.paymentDate || '08-Sep-2026',
      status: 'SUBMITTED'
    }, `Receipt_${sub.applicationNumber || 'ISMS_2026'}.pdf`);

    this.eoiService.showToast('Official PDF Receipt downloaded successfully.');
  }

  copyApplicationNumber(): void {
    const appNum = this.eoiService.submissionData().applicationNumber;
    navigator.clipboard.writeText(appNum).then(() => {
      this.copiedRef.set(true);
      setTimeout(() => this.copiedRef.set(false), 2500);
      this.eoiService.showToast('Application Number copied to clipboard.');
    });
  }

  reopenForModification(): void {
    this.eoiService.reopenApplicationForEdit();
  }

  toggleDeadlineSimulation(): void {
    const current = this.eoiService.simulateExpiredDeadline();
    this.eoiService.simulateExpiredDeadline.set(!current);
    const msg = !current
      ? 'Simulated: Modification Deadline Expired (Modification Window Closed)'
      : 'Simulated: Within Deadline (22 days remaining until 30 Sep 2026)';
    this.eoiService.showToast(msg);
  }
}
