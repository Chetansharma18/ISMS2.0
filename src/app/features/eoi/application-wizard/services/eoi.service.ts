import { Injectable, signal, computed, effect } from '@angular/core';
import {
  EoiFormData,
  OrgBasicDetails,
  AuthorizedPersonOrgDetails,
  OrgBankDetails,
  SpecUploadDoc,
  TrainingProviderDetails,
  TrainingCenterDetails,
  EmdPaymentDetails,
  ProcessFeePaymentDetails,
  LegalConstitutionDetails,
  FinancialDetailRow,
  TrainingPlacementRow,
  AnnualActionPlanRow,
  EoiDocumentChecklistRow,
  EoiUploadSlot,
  PaymentData,
  SubmissionData,
  ApplicationFlowStage,
  INITIAL_REQUIRED_DOCUMENTS,
  OFFICIAL_PREVIEW_DOCUMENTS
} from '../models/eoi.model';

const STORAGE_KEY_FORM = 'isms_eoi_form_v5';
const STORAGE_KEY_STAGE = 'isms_eoi_flow_stage_v5';
const STORAGE_KEY_SECTION = 'isms_eoi_section_v5';
const STORAGE_KEY_SLOTS = 'isms_eoi_slots_v5';
const STORAGE_KEY_PAYMENT = 'isms_eoi_payment_v5';
const STORAGE_KEY_SUBMISSION = 'isms_eoi_submission_v5';
const STORAGE_KEY_MOD_COUNT = 'isms_eoi_mod_count_v5';
const STORAGE_KEY_EDIT_SEC = 'isms_eoi_edit_sec_v5';

@Injectable({
  providedIn: 'root'
})
export class EoiService {
  // Flow navigation stage (starts on Step 1: Document Upload or loads persisted stage)
  readonly flowStage = signal<ApplicationFlowStage>('documents');

  // Stepper navigation compatibility (1: Documents, 2: Fees, 3: Preview, 4: Receipt)
  readonly currentSection = signal<number>(1);
  readonly submissionState = signal<'idle' | 'submitting' | 'submitted'>('idle');
  readonly lastSavedTime = signal<string>('Just now');
  readonly autoSaveStatus = signal<'saved' | 'saving'>('saved');

  // Document Upload Slots State (4 Mandatory Categories per PDF Spec)
  readonly uploadSlots = signal<EoiUploadSlot[]>(this.getInitialUploadSlots());

  // Payment Data State (Both checkboxes compulsory & unchecked by default)
  readonly paymentData = signal<PaymentData>(this.getInitialPaymentData());
  readonly isPaymentProcessing = signal<boolean>(false);

  // Submission Data State
  readonly submissionData = signal<SubmissionData>(this.getInitialSubmissionData());

  // Editing Section Index in Preview (null = full preview, 1-4 = editing individual section)
  readonly editingSectionId = signal<number | null>(null);
  readonly activeEditSectionId = this.editingSectionId;

  // Post-Submission Modification Limit (Max 3 Edits Allowed)
  readonly maxModifications = 3;
  readonly modificationCount = signal<number>(0);
  readonly isModificationMode = signal<boolean>(false);
  readonly modificationsRemaining = computed(() => Math.max(0, this.maxModifications - this.modificationCount()));

  // Modification Deadline: 30 September 2026 23:59:59 IST
  readonly modificationDeadlineIso = '2026-09-30T23:59:59';
  
  // Flag to simulate deadline expiry for testing
  readonly simulateExpiredDeadline = signal<boolean>(false);

  // Toast / System messages
  readonly toastMessage = signal<string | null>(null);

  // Main Form Data State for all sections (Pre-populated with realistic dummy data)
  readonly formData = signal<EoiFormData>(this.getInitialFormData());

  // Dynamically set scheme fees matching selected scheme from /schemes
  setSchemeFees(processingFee: number, emdFee: number, schemeName?: string, eoiRef?: string): void {
    this.paymentData.update(curr => ({
      ...curr,
      processingFee: processingFee,
      processingFeeAmount: processingFee,
      emdFee: emdFee,
      emdFeeAmount: emdFee
    }));

    this.formData.update(curr => ({
      ...curr,
      section8: {
        ...curr.section8,
        process_fee_amount: processingFee
      },
      section7: {
        ...curr.section7,
        emd_amount: emdFee
      }
    }));

    if (schemeName || eoiRef) {
      this.submissionData.update(curr => ({
        ...curr,
        schemeName: schemeName || curr.schemeName,
        eoiRefNumber: eoiRef || curr.eoiRefNumber
      }));
    }
  }

  // Computed Properties
  readonly computedTotalFee = computed(() => {
    const pay = this.paymentData();
    let total = 0;
    if (pay.includeProcessingFee || pay.processingFeeSelected) total += (pay.processingFee ?? pay.processingFeeAmount ?? 2500);
    if (pay.includeEmdFee || pay.emdFeeSelected) total += (pay.emdFee ?? pay.emdFeeAmount ?? 50000);
    return total;
  });

  readonly mandatorySlotsUploaded = computed(() => {
    const slots = this.uploadSlots();
    const mandatory = slots.filter(s => s.mandatory || s.isMandatory);
    return mandatory.every(s => s.file !== null || (s.fileName !== null && s.fileName.length > 0));
  });

  readonly uploadedSlotsCount = computed(() => {
    return this.uploadSlots().filter(s => s.fileName !== null && s.fileName.length > 0).length;
  });

  readonly isStep2Paid = computed(() => {
    const pay = this.paymentData();
    const hasBothTicked = (pay.processingFeeSelected || pay.includeProcessingFee) && (pay.emdFeeSelected || pay.includeEmdFee);
    return hasBothTicked && pay.paymentStatus === 'PAID';
  });

  readonly isModificationAllowed = computed(() => {
    if (this.simulateExpiredDeadline()) return false;
    if (this.modificationsRemaining() <= 0) return false;
    const now = new Date().getTime();
    const deadline = new Date(this.modificationDeadlineIso).getTime();
    return now <= deadline;
  });

  readonly daysRemaining = computed(() => {
    if (this.simulateExpiredDeadline()) return 0;
    const now = new Date().getTime();
    const deadline = new Date(this.modificationDeadlineIso).getTime();
    const diffMs = deadline - now;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  });

  private isInitializing = true;

  constructor() {
    this.loadFromStorage();
    this.updateSection13Documents();
    this.isInitializing = false;

    // Automatic Real-Time Persistence Effect:
    effect(() => {
      this.formData();
      this.paymentData();
      this.flowStage();
      this.currentSection();
      this.editingSectionId();
      this.modificationCount();

      if (!this.isInitializing) {
        this.persistToStorage();
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.persistToStorage();
      });
    }
  }

  // --- Initializers ---

  private getInitialUploadSlots(): EoiUploadSlot[] {
    const fileMetaMap: Record<string, { name: string; size: string; bytes: number }> = {
      doc_company: { name: 'company_registration_incorporation_proof.pdf', size: '2.1 MB', bytes: 2202009 },
      doc_prev_exp: { name: 'previous_training_experience_certificates.pdf', size: '3.4 MB', bytes: 3565158 },
      doc_turnover: { name: 'ca_certified_turnover_certificate_last_3_fy.pdf', size: '1.8 MB', bytes: 1887436 },
      doc_tech_proposal: { name: 'technical_proposal_methodology_2025_26.pdf', size: '2.9 MB', bytes: 3040870 }
    };

    return INITIAL_REQUIRED_DOCUMENTS.map(slot => {
      const meta = fileMetaMap[slot.id] || { name: `${slot.id}.pdf`, size: '2.0 MB', bytes: 2097152 };
      return {
        ...slot,
        file: null,
        fileName: meta.name,
        fileSize: meta.size,
        fileSizeBytes: meta.bytes,
        fileSizeFormatted: meta.size,
        uploadTimestamp: '08-Sep-2026, 11:30 AM',
        uploadDate: '08-Sep-2026',
        previewUrl: null,
        errorMessage: null,
        error: null
      };
    });
  }

  private getInitialPaymentData(): PaymentData {
    return {
      processingFee: 2500,
      emdFee: 50000,
      processingFeeAmount: 2500,
      emdFeeAmount: 50000,
      includeProcessingFee: false,
      includeEmdFee: false,
      processingFeeSelected: false,
      emdFeeSelected: false,
      totalAmount: 0,
      paymentMethod: 'UPI',
      upiId: 'rsldc.partner@sbi',
      transactionId: 'TXN-ISMS-2026-884921',
      paymentDate: '08-Sep-2026, 11:45 AM',
      paymentStatus: 'PENDING'
    };
  }

  private getInitialSubmissionData(): SubmissionData {
    return {
      applicationNumber: 'ISMS-TP-2026-884921',
      submissionTimestamp: '08-Sep-2026, 03:45 PM',
      submissionDate: '08-Sep-2026',
      eoiRefNumber: 'EOI/RSLDC/ISMS/2026/04',
      acknowledgementReceiptNumber: 'ACK-RSLDC-2026-9921',
      status: 'NOT_SUBMITTED',
      modificationDeadline: '2026-09-30T23:59:59',
      applicantName: 'Apex Skill Development Foundation',
      providerName: 'Apex Skill Development Foundation',
      contactEmail: 'contact@apexskills.org',
      contactMobile: '9829012345',
      schemeName: 'ISMS 2.0 Empanelment Scheme',
      eoiNoticeNumber: 'EOI-RSLDC-2026-004',
      digitalSignatureRef: 'DS-RSLDC-884921-SIG',
      modificationCount: 0,
      maxModifications: 3
    };
  }

  private getInitialFormData(): EoiFormData {
    return {
      // Step 1: Organisation / Company Basic Details
      orgBasicDetails: {
        application_no: 'ISMS-2026-90412',
        tp_full_name: 'Apex Skill Development Foundation',
        tp_short_name: 'ASDF',
        registration_number: 'REG/RAJ/2018/88921',
        organisation_contact_no: '9829012345',
        company_email: 'contact@apexskills.org',
        organisation_pan: 'AAACA1234C',
        website: 'https://apexskills.org',
        registered_address: 'Plot No. 45, Institutional Area, Jhalana Doongri',
        state_ut: 'Rajasthan',
        district: 'Jaipur',
        pincode: '302004',
        turnover_lakhs: '450.00',
        date_of_registration: '2018-04-12',
        state_where_registered: 'Rajasthan',
        type_of_business: 'Skill Training Provider / Non-Profit Institution',
        postal_address: 'Plot No. 45, Institutional Area, Jhalana Doongri, Jaipur - 302004'
      },

      // Step 2: Authorized Person Details
      authPersonDetails: {
        auth_name: 'Rajesh Kumar Sharma',
        auth_guardian_name: 'Late Shri Mohan Lal Sharma',
        auth_dob: '1982-06-15',
        auth_age: '44',
        auth_designation: 'Managing Director & CEO',
        auth_mobile: '9829012345',
        auth_email: 'rajesh.sharma@apexskills.org',
        auth_state: 'Rajasthan',
        auth_residence_address: 'B-12, Malviya Nagar, Jaipur, Rajasthan - 302017',
        auth_pan: 'ABCPR5678K',
        auth_aadhaar: '8921-4432-1109',
        auth_id_proof_type: 'Aadhaar Card',
        auth_id_number: '8921-4432-1109',
        auth_bhamashah: 'BHAM-8849-21',
        auth_voter_id: 'RJ/01/045/882190',
        auth_passport_no: 'Z8849201',
        auth_service_tax_no: '08AAACA1234C1ZP'
      },

      // Step 3: Bank Details
      bankDetails: {
        bank_name: 'State Bank of India',
        bank_account_no: '38920194821',
        bank_ifsc: 'SBIN0004123',
        bank_account_type: 'Current Account',
        bank_transfer_mode: 'RTGS / NEFT / ECS / CBS',
        bank_branch_name: 'Sitapura Industrial Area Branch, Jaipur',
        bank_micr: '302002014',
        bank_branch_address: 'Commercial Complex, Sitapura, Jaipur, Rajasthan - 302022',
        bank_cancelled_cheque_doc: 'cancelled_cheque_sbi_current.pdf'
      },

      // Step 4: Official Uploaded Documents Checklist (12 documents per PDF spec)
      specUploadDocs: OFFICIAL_PREVIEW_DOCUMENTS.map(doc => ({ ...doc })),

      section5: {
        training_provider_name: 'Apex Skill Development Foundation',
        registration_number: 'REG/RAJ/2018/88921',
        status: 'Active Registered Entity',
        date_of_registration: '2018-04-12',
        name_of_registering_authority: 'Registrar of Societies / Companies, Jaipur',
        place_of_registration: 'Jaipur'
      },
      section6: {
        district_city: 'Jaipur',
        training_center_name: 'Apex Skill Development Center Jaipur Central',
        telephone_number: '01412789456',
        number_of_classrooms: 4,
        full_address: 'Plot No. 42-45, Industrial Area, Sitapura, Tonk Road, Jaipur, Rajasthan - 302022',
        number_of_practical_rooms: 3,
        separate_wash_rooms: 'Yes',
        lab_infrastructure_available: 'Yes'
      },
      section7: {
        emd_payment_id: 'EMD-RJ-2026-88492',
        emd_amount: 100000,
        emd_payment_date: '2026-09-08'
      },
      section8: {
        process_fee_payment_id: 'PF-RJ-2026-11029',
        process_fee_amount: 500,
        process_fee_payment_date: '2026-09-08'
      },
      section9: {
        name_of_legal_constitution: 'Registered Entity (Society / Trust / Corporate)',
        registration_number: 'REG/RAJ/2018/88921',
        status_of_firm: 'Active Operating Entity',
        date_of_registration: '2018-04-12',
        name_of_authority: 'Govt. of Rajasthan / MCA',
        place_of_registration: 'Jaipur, Rajasthan',
        pan_card_number: 'AAACA1234C'
      },
      section10: [
        {
          id: 'fin_1',
          s_no: 1,
          financial_year: '2024-25',
          total_turnover_inr: 48500000,
          total_turnover_from_skill_development: 32000000
        },
        {
          id: 'fin_2',
          s_no: 2,
          financial_year: '2023-24',
          total_turnover_inr: 41200000,
          total_turnover_from_skill_development: 27500000
        },
        {
          id: 'fin_3',
          s_no: 3,
          financial_year: '2022-23',
          total_turnover_inr: 34000000,
          total_turnover_from_skill_development: 21000000
        }
      ],
      section11: [
        {
          id: 'tp_1',
          s_no: 1,
          name_of_sector: 'IT & IT-Enabled Services (IT-ITeS)',
          financial_year: '2024-25',
          total_candidates_trained: 1250,
          placement_provided_to_number: 960,
          details_of_supporting_proof_provided: 960
        },
        {
          id: 'tp_2',
          s_no: 2,
          name_of_sector: 'Healthcare & Paramedical Support',
          financial_year: '2024-25',
          total_candidates_trained: 850,
          placement_provided_to_number: 680,
          details_of_supporting_proof_provided: 680
        },
        {
          id: 'tp_3',
          s_no: 3,
          name_of_sector: 'Apparel, Made-Ups & Home Furnishing',
          financial_year: '2023-24',
          total_candidates_trained: 600,
          placement_provided_to_number: 450,
          details_of_supporting_proof_provided: 450
        }
      ],
      section12: [
        {
          id: 'aap_1',
          s_no: 1,
          year: '2025-26',
          proposed_district: 'Jaipur',
          proposed_number_of_sdc: 2,
          sdc_location: 'Sitapura & Mansarovar',
          proposed_sectors: 'IT-ITeS, Electronics & Hardware',
          sdc_wise_course: 'Data Entry Operator, Solar Technician',
          residential_non_residential: 'Non-Residential',
          no_of_batches: 12
        },
        {
          id: 'aap_2',
          s_no: 2,
          year: '2025-26',
          proposed_district: 'Jodhpur',
          proposed_number_of_sdc: 1,
          sdc_location: 'Boronada Industrial Park',
          proposed_sectors: 'Handicrafts, Textiles & Solar PV',
          sdc_wise_course: 'Master Weaver, Solar Panel Installer',
          residential_non_residential: 'Residential',
          no_of_batches: 6
        },
        {
          id: 'aap_3',
          s_no: 3,
          year: '2025-26',
          proposed_district: 'Udaipur',
          proposed_number_of_sdc: 1,
          sdc_location: 'Sukher Tech Hub',
          proposed_sectors: 'Tourism, Hospitality & Food Processing',
          sdc_wise_course: 'Front Office Executive, Bakery Chef',
          residential_non_residential: 'Non-Residential',
          no_of_batches: 6
        }
      ],
      section13: []
    };
  }

  // --- Flow Actions & Strict Guarding ---

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }

  setFlowStage(stage: ApplicationFlowStage): void {
    if (stage === 'fees' && !this.mandatorySlotsUploaded()) {
      this.showToast('Please upload all 4 mandatory documents in Step 1 first.');
      return;
    }
    if ((stage === 'preview' || stage === 'edit_section' || stage === 'receipt') && !this.isStep2Paid()) {
      this.showToast('Both Processing Fee and EMD Fee in Step 2 are compulsory and must be paid first.');
      this.flowStage.set('fees');
      this.currentSection.set(2);
      this.persistToStorage();
      this.scrollToTop();
      return;
    }

    this.flowStage.set(stage);
    if (stage === 'documents') this.currentSection.set(1);
    else if (stage === 'fees') this.currentSection.set(2);
    else if (stage === 'preview') this.currentSection.set(3);
    else if (stage === 'receipt') this.currentSection.set(4);
    this.persistToStorage();
    this.scrollToTop();
  }

  setSection(sectionId: number): void {
    if (sectionId === 2 && !this.mandatorySlotsUploaded()) {
      this.showToast('Please upload all 4 mandatory documents in Step 1 first.');
      return;
    }
    if ((sectionId === 3 || sectionId === 4) && !this.isStep2Paid()) {
      this.showToast('Both Processing Fee and EMD Fee in Step 2 are compulsory and must be paid before Step 3.');
      this.currentSection.set(2);
      this.flowStage.set('fees');
      this.persistToStorage();
      this.scrollToTop();
      return;
    }

    this.currentSection.set(sectionId);
    if (sectionId === 1) this.flowStage.set('documents');
    else if (sectionId === 2) this.flowStage.set('fees');
    else if (sectionId === 3) this.flowStage.set('preview');
    else if (sectionId === 4) this.flowStage.set('receipt');
    this.persistToStorage();
    this.scrollToTop();
  }

  startApplication(): void {
    this.setFlowStage('documents');
  }

  goToFees(): void {
    this.setFlowStage('fees');
  }

  goToPreview(): void {
    if (!this.isStep2Paid()) {
      this.showToast('Both Processing Fee and EMD Fee are compulsory and must be paid to enter Step 3.');
      this.setFlowStage('fees');
      return;
    }
    this.setFlowStage('preview');
  }

  // --- Document Upload Handlers (5MB, PDF only) ---

  uploadDocument(slotId: string, file: File): boolean {
    const slots = [...this.uploadSlots()];
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return false;

    // Validate PDF format
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      slots[index] = {
        ...slots[index],
        errorMessage: 'Invalid file format. Only PDF (.pdf) documents are permitted.',
        error: 'Invalid file format. Only PDF (.pdf) documents are permitted.'
      };
      this.uploadSlots.set(slots);
      return false;
    }

    // Validate size limit <= 5 MB
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      slots[index] = {
        ...slots[index],
        errorMessage: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5.0 MB.`,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5.0 MB.`
      };
      this.uploadSlots.set(slots);
      return false;
    }

    // Format size
    const sizeFormatted = file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    slots[index] = {
      ...slots[index],
      file: file,
      fileName: file.name,
      fileSize: sizeFormatted,
      fileSizeBytes: file.size,
      fileSizeFormatted: sizeFormatted,
      uploadTimestamp: nowStr,
      uploadDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      previewUrl: URL.createObjectURL(file),
      errorMessage: null,
      error: null
    };

    this.uploadSlots.set(slots);
    this.updateSection13Documents();
    this.showToast(`Auto-saved uploaded file: ${file.name}`);
    this.persistToStorage();
    return true;
  }

  removeDocument(slotId: string): void {
    const slots = [...this.uploadSlots()];
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return;

    if (slots[index].previewUrl) {
      URL.revokeObjectURL(slots[index].previewUrl!);
    }

    slots[index] = {
      ...slots[index],
      file: null,
      fileName: null,
      fileSize: null,
      fileSizeBytes: null,
      fileSizeFormatted: null,
      uploadTimestamp: null,
      uploadDate: null,
      previewUrl: null,
      errorMessage: null,
      error: null
    };

    this.uploadSlots.set(slots);
    this.updateSection13Documents();
    this.persistToStorage();
  }

  private updateSection13Documents(): void {
    const slots = this.uploadSlots();
    const currentForm = { ...this.formData() };
    const specDocs: SpecUploadDoc[] = (currentForm.specUploadDocs && currentForm.specUploadDocs.length >= 12)
      ? [...currentForm.specUploadDocs]
      : OFFICIAL_PREVIEW_DOCUMENTS.map(d => ({ ...d }));

    // Sync the first 4 slots with the actual uploaded files from Step 1
    slots.forEach((s, idx) => {
      if (idx < specDocs.length) {
        specDocs[idx] = {
          ...specDocs[idx],
          file_name: s.fileName || '',
          file_size: s.fileSize || s.fileSizeFormatted || '',
          upload_date: s.uploadDate || '08-Sep-2026'
        };
      }
    });

    currentForm.specUploadDocs = specDocs;
    this.formData.set(currentForm);
  }

  uploadPreviewDocument(sNo: number, file: File): boolean {
    const currentForm = { ...this.formData() };
    const specDocs = [...currentForm.specUploadDocs];
    const index = specDocs.findIndex(d => d.s_no === sNo);
    if (index === -1) return false;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.showToast('Invalid format. Only PDF (.pdf) documents are permitted.');
      return false;
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      this.showToast('File size exceeds maximum allowed limit of 5.0 MB.');
      return false;
    }

    const sizeFormatted = file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    specDocs[index] = {
      ...specDocs[index],
      file_name: file.name,
      file_size: sizeFormatted,
      upload_date: today
    };

    currentForm.specUploadDocs = specDocs;
    this.formData.set(currentForm);

    if (sNo >= 1 && sNo <= 4) {
      const slots = [...this.uploadSlots()];
      if (slots[sNo - 1]) {
        slots[sNo - 1] = {
          ...slots[sNo - 1],
          file: file,
          fileName: file.name,
          fileSize: sizeFormatted,
          fileSizeBytes: file.size,
          fileSizeFormatted: sizeFormatted,
          uploadDate: today
        };
        this.uploadSlots.set(slots);
      }
    }

    this.showToast(`Auto-saved document: ${file.name}`);
    this.persistToStorage();
    return true;
  }

  // --- Dynamic Form Rows Methods ---

  addFinancialRow(): void {
    const cur = { ...this.formData() };
    const nextNo = cur.section10.length + 1;
    cur.section10 = [
      ...cur.section10,
      {
        id: `fin_${Date.now()}`,
        s_no: nextNo,
        financial_year: '2025-26',
        total_turnover_inr: null,
        total_turnover_from_skill_development: null
      }
    ];
    this.formData.set(cur);
    this.persistToStorage();
  }

  removeFinancialRow(index: number): void {
    const cur = { ...this.formData() };
    cur.section10 = cur.section10.filter((_, i) => i !== index);
    this.formData.set(cur);
    this.persistToStorage();
  }

  addTrainingPlacementRow(): void {
    const cur = { ...this.formData() };
    const nextNo = cur.section11.length + 1;
    cur.section11 = [
      ...cur.section11,
      {
        id: `tp_${Date.now()}`,
        s_no: nextNo,
        name_of_sector: '',
        financial_year: '2024-25',
        total_candidates_trained: null,
        placement_provided_to_number: null,
        details_of_supporting_proof_provided: null
      }
    ];
    this.formData.set(cur);
    this.persistToStorage();
  }

  removeTrainingPlacementRow(index: number): void {
    const cur = { ...this.formData() };
    cur.section11 = cur.section11.filter((_, i) => i !== index);
    this.formData.set(cur);
    this.persistToStorage();
  }

  addActionPlanRow(): void {
    const cur = { ...this.formData() };
    const nextNo = cur.section12.length + 1;
    cur.section12 = [
      ...cur.section12,
      {
        id: `ap_${Date.now()}`,
        s_no: nextNo,
        year: '2025-26',
        proposed_district: 'Jaipur',
        proposed_number_of_sdc: 1,
        sdc_location: '',
        proposed_sectors: 'IT-ITeS',
        sdc_wise_course: 'Certificate in Web Development',
        residential_non_residential: 'Non-Residential',
        no_of_batches: 2
      }
    ];
    this.formData.set(cur);
    this.persistToStorage();
  }

  removeActionPlanRow(index: number): void {
    const cur = { ...this.formData() };
    cur.section12 = cur.section12.filter((_, i) => i !== index);
    this.formData.set(cur);
    this.persistToStorage();
  }

  updateOrgBasicDetails(partial: Partial<OrgBasicDetails>): void {
    const cur = { ...this.formData() };
    cur.orgBasicDetails = { ...cur.orgBasicDetails, ...partial };
    if (partial.tp_full_name) {
      cur.section5.training_provider_name = partial.tp_full_name;
    }
    if (partial.registration_number) {
      cur.section5.registration_number = partial.registration_number;
    }
    this.formData.set(cur);
    this.persistToStorage();
  }

  updateAuthPersonDetails(partial: Partial<AuthorizedPersonOrgDetails>): void {
    const cur = { ...this.formData() };
    cur.authPersonDetails = { ...cur.authPersonDetails, ...partial };
    this.formData.set(cur);
    this.persistToStorage();
  }

  updateBankDetails(partial: Partial<OrgBankDetails>): void {
    const cur = { ...this.formData() };
    cur.bankDetails = { ...cur.bankDetails, ...partial };
    this.formData.set(cur);
    this.persistToStorage();
  }

  updateSection5(partial: Partial<TrainingProviderDetails>): void {
    const cur = { ...this.formData() };
    cur.section5 = { ...cur.section5, ...partial };
    this.formData.set(cur);
    this.persistToStorage();
  }

  updateSection6(partial: Partial<TrainingCenterDetails>): void {
    const cur = { ...this.formData() };
    cur.section6 = { ...cur.section6, ...partial };
    this.formData.set(cur);
    this.persistToStorage();
  }

  updateSection9(partial: Partial<LegalConstitutionDetails>): void {
    const cur = { ...this.formData() };
    cur.section9 = { ...cur.section9, ...partial };
    this.formData.set(cur);
    this.persistToStorage();
  }

  // --- Fee & Payment Handlers ---

  setPaymentMethod(method: string): void {
    const current = { ...this.paymentData() };
    current.paymentMethod = method;
    this.paymentData.set(current);
    this.persistToStorage();
  }

  updateFeeSelection(field: 'processingFeeSelected' | 'emdFeeSelected', checked: boolean): void {
    this.toggleFeeItem(field === 'processingFeeSelected' ? 'processing' : 'emd', checked);
  }

  toggleFeeItem(feeType: 'processing' | 'emd', checked: boolean): void {
    const current = { ...this.paymentData() };
    if (feeType === 'processing') {
      current.includeProcessingFee = checked;
      current.processingFeeSelected = checked;
    } else {
      current.includeEmdFee = checked;
      current.emdFeeSelected = checked;
    }
    current.totalAmount = (current.includeProcessingFee || current.processingFeeSelected ? (current.processingFee || 500) : 0) +
                          (current.includeEmdFee || current.emdFeeSelected ? (current.emdFee || 100000) : 0);
    this.paymentData.set(current);
    this.persistToStorage();
  }

  processMockPayment(callback: () => void): void {
    this.isPaymentProcessing.set(true);
    const current = { ...this.paymentData() };
    current.paymentStatus = 'PROCESSING';
    this.paymentData.set(current);

    setTimeout(() => {
      this.isPaymentProcessing.set(false);
      const randHex = Math.floor(100000 + Math.random() * 900000).toString();
      const updated: PaymentData = {
        ...current,
        paymentStatus: 'PAID',
        transactionId: `TXN-ISMS-2026-${randHex}`,
        paymentDate: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        totalAmount: this.computedTotalFee()
      };
      this.paymentData.set(updated);
      
      // Update section 7 and 8 payment records in form data
      const curForm = { ...this.formData() };
      curForm.section7 = {
        emd_payment_id: `EMD-TXN-${randHex}`,
        emd_amount: updated.includeEmdFee || updated.emdFeeSelected ? (updated.emdFee || 100000) : 0,
        emd_payment_date: new Date().toISOString().split('T')[0]
      };
      curForm.section8 = {
        process_fee_payment_id: `PF-TXN-${randHex}`,
        process_fee_amount: updated.includeProcessingFee || updated.processingFeeSelected ? (updated.processingFee || 500) : 0,
        process_fee_payment_date: new Date().toISOString().split('T')[0]
      };
      this.formData.set(curForm);

      this.persistToStorage();
      callback();
    }, 2000);
  }

  // --- Preview & Section Editing ---

  editIndividualSection(sectionId: number): void {
    this.editingSectionId.set(sectionId);
    this.setFlowStage('edit_section');
  }

  saveAndReturnToPreview(): void {
    this.editingSectionId.set(null);
    this.setFlowStage('preview');
    this.showToast('Section details auto-saved.');
    this.persistToStorage();
  }

  // --- Final Submission ---

  finalizeSubmission(): void {
    const wasModifying = this.isModificationMode();
    if (wasModifying) {
      this.modificationCount.update(c => Math.min(this.maxModifications, c + 1));
      this.isModificationMode.set(false);
    }

    const randNum = Math.floor(100000 + Math.random() * 900000).toString();
    const ackNum = Math.floor(10000 + Math.random() * 90000).toString();
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const sub: SubmissionData = {
      ...this.submissionData(),
      applicationNumber: this.submissionData().applicationNumber || `ISMS-TP-2026-${randNum}`,
      acknowledgementReceiptNumber: this.submissionData().acknowledgementReceiptNumber || `ACK-RSLDC-2026-${ackNum}`,
      submissionTimestamp: nowStr,
      submissionDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'SUBMITTED',
      applicantName: this.formData().orgBasicDetails.tp_full_name,
      providerName: this.formData().orgBasicDetails.tp_full_name,
      digitalSignatureRef: this.submissionData().digitalSignatureRef || `DS-RSLDC-${randNum}-SIG`,
      modificationCount: this.modificationCount(),
      maxModifications: this.maxModifications
    };

    this.submissionData.set(sub);
    this.setFlowStage('receipt');
    if (wasModifying) {
      this.showToast(`Application updated & resubmitted (Edit ${this.modificationCount()} of ${this.maxModifications} used).`);
    } else {
      this.showToast('EOI Application Submitted Successfully.');
    }
    this.persistToStorage();
  }

  // --- Post-Submission Modification Window ---

  reopenApplicationForEdit(): void {
    if (this.modificationsRemaining() <= 0) {
      this.showToast(`Modification limit reached. You can only edit the application a maximum of ${this.maxModifications} times.`);
      return;
    }
    if (!this.isModificationAllowed()) {
      this.showToast('Modification window has expired on 30 September 2026.');
      return;
    }
    this.isModificationMode.set(true);
    this.setFlowStage('preview');
    this.showToast(`Application reopened for modification (${this.modificationsRemaining()} of ${this.maxModifications} edits remaining).`);
    this.persistToStorage();
  }

  previousSection(): void {
    const cur = this.currentSection();
    if (cur > 1) {
      this.setSection(cur - 1);
    }
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 4000);
  }

  public persistToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      this.autoSaveStatus.set('saving');
      localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(this.formData()));
      localStorage.setItem(STORAGE_KEY_STAGE, this.flowStage());
      localStorage.setItem(STORAGE_KEY_SECTION, this.currentSection().toString());
      localStorage.setItem(STORAGE_KEY_PAYMENT, JSON.stringify(this.paymentData()));
      localStorage.setItem(STORAGE_KEY_SUBMISSION, JSON.stringify(this.submissionData()));
      localStorage.setItem(STORAGE_KEY_MOD_COUNT, this.modificationCount().toString());
      if (this.editingSectionId() !== null) {
        localStorage.setItem(STORAGE_KEY_EDIT_SEC, this.editingSectionId()!.toString());
      } else {
        localStorage.removeItem(STORAGE_KEY_EDIT_SEC);
      }

      const serializableSlots = this.uploadSlots().map(s => ({
        ...s,
        file: null,
        previewUrl: null
      }));
      localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(serializableSlots));

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      this.lastSavedTime.set(timeStr);
      this.autoSaveStatus.set('saved');
    } catch {
      // Ignore storage errors in private/restricted environments
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      // 1. Restore Form Data
      const savedForm = localStorage.getItem(STORAGE_KEY_FORM);
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        this.formData.set({
          ...this.getInitialFormData(),
          ...parsed
        });
      }

      // 2. Restore Upload Slots
      const savedSlots = localStorage.getItem(STORAGE_KEY_SLOTS);
      if (savedSlots) {
        const parsedSlots: EoiUploadSlot[] = JSON.parse(savedSlots);
        if (Array.isArray(parsedSlots) && parsedSlots.length > 0) {
          this.uploadSlots.set(parsedSlots);
        }
      }

      // 3. Restore Payment Data
      const savedPay = localStorage.getItem(STORAGE_KEY_PAYMENT);
      if (savedPay) {
        this.paymentData.set(JSON.parse(savedPay));
      }

      // 4. Restore Submission Data
      const savedSub = localStorage.getItem(STORAGE_KEY_SUBMISSION);
      if (savedSub) {
        this.submissionData.set(JSON.parse(savedSub));
      }

      // 5. Restore Modification Count
      const savedModCount = localStorage.getItem(STORAGE_KEY_MOD_COUNT);
      if (savedModCount) {
        const parsed = parseInt(savedModCount, 10);
        if (!isNaN(parsed)) {
          this.modificationCount.set(Math.min(this.maxModifications, Math.max(0, parsed)));
        }
      }

      // 6. Restore Flow Stage & Guard against unpaid step 3 jumps
      const savedStage = localStorage.getItem(STORAGE_KEY_STAGE) as ApplicationFlowStage | null;
      const isPaid = this.isStep2Paid();

      if (savedStage && ['documents', 'fees', 'preview', 'edit_section', 'receipt'].includes(savedStage)) {
        if ((savedStage === 'preview' || savedStage === 'edit_section' || savedStage === 'receipt') && !isPaid) {
          this.flowStage.set('fees');
          this.currentSection.set(2);
        } else {
          this.flowStage.set(savedStage);
        }
      } else {
        this.flowStage.set('documents');
        this.currentSection.set(1);
      }

      const savedSec = localStorage.getItem(STORAGE_KEY_SECTION);
      if (savedSec) {
        const secNum = parseInt(savedSec, 10);
        if (!isNaN(secNum) && secNum >= 1 && secNum <= 4) {
          if (secNum >= 3 && !isPaid) {
            this.currentSection.set(2);
          } else {
            this.currentSection.set(secNum);
          }
        }
      }

      const savedEditSec = localStorage.getItem(STORAGE_KEY_EDIT_SEC);
      if (savedEditSec && isPaid) {
        const parsed = parseInt(savedEditSec, 10);
        if (!isNaN(parsed)) {
          this.editingSectionId.set(parsed);
        }
      }

      this.lastSavedTime.set('Auto-loaded session');
    } catch {
      // Fall back to memory defaults
    }
  }
}
