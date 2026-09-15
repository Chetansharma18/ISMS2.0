export interface OrgBasicDetails {
  application_no: string;
  tp_full_name: string;
  tp_short_name: string;
  registration_number: string;
  organisation_contact_no: string;
  company_email: string;
  organisation_pan: string;
  website: string;
  registered_address: string;
  state_ut: string;
  district: string;
  pincode: string;
  turnover_lakhs: number | string;
  date_of_registration: string;
  state_where_registered: string;
  type_of_business: string;
  postal_address: string;
}

export interface AuthorizedPersonOrgDetails {
  auth_name: string;
  auth_guardian_name: string;
  auth_dob: string;
  auth_age: number | string;
  auth_designation: string;
  auth_mobile: string;
  auth_email: string;
  auth_residence_address: string;
  auth_state: string;
  auth_pan: string;
  auth_aadhaar: string;
  auth_id_proof_type: string;
  auth_id_number: string;
  auth_bhamashah: string;
  auth_voter_id: string;
  auth_passport_no: string;
  auth_service_tax_no: string;
}

export interface OrgBankDetails {
  bank_name: string;
  bank_account_no: string;
  bank_ifsc: string;
  bank_account_type: string;
  bank_transfer_mode: string;
  bank_branch_name: string;
  bank_micr: string;
  bank_branch_address: string;
  bank_cancelled_cheque_doc: string;
}

export interface SpecUploadDoc {
  s_no: number;
  doc_title: string;
  doc_category: string;
  file_type: string;
  mandatory: boolean;
  file_name: string;
  file_size: string;
  upload_date: string;
  guidelines: string;
}

export interface TrainingProviderDetails {
  training_provider_name: string;
  registration_number: string;
  status: string;
  date_of_registration: string;
  name_of_registering_authority: string;
  place_of_registration: string;
}

export interface TrainingCenterDetails {
  district_city: string;
  training_center_name: string;
  telephone_number: string;
  number_of_classrooms: number | null;
  full_address: string;
  number_of_practical_rooms: number | null;
  separate_wash_rooms: string;
  lab_infrastructure_available: string;
}

export interface EmdPaymentDetails {
  emd_payment_id: string;
  emd_amount: number | null;
  emd_payment_date: string;
}

export interface ProcessFeePaymentDetails {
  process_fee_payment_id: string;
  process_fee_amount: number | null;
  process_fee_payment_date: string;
}

export interface LegalConstitutionDetails {
  name_of_legal_constitution: string;
  registration_number: string;
  status_of_firm: string;
  date_of_registration: string;
  name_of_authority: string;
  place_of_registration: string;
  pan_card_number: string;
}

export interface FinancialDetailRow {
  id: string;
  s_no: number;
  financial_year: string;
  total_turnover_inr: number | null;
  total_turnover_from_skill_development: number | null;
}

export interface TrainingPlacementRow {
  id: string;
  s_no: number;
  name_of_sector: string;
  financial_year: string;
  total_candidates_trained: number | null;
  placement_provided_to_number: number | null;
  details_of_supporting_proof_provided: number | null;
}

export interface AnnualActionPlanRow {
  id: string;
  s_no: number;
  year: string;
  proposed_district: string;
  proposed_number_of_sdc: number | null;
  sdc_location: string;
  proposed_sectors: string;
  sdc_wise_course: string;
  residential_non_residential: string;
  no_of_batches: number | null;
}

export interface EoiDocumentChecklistRow {
  id: string;
  s_no: number;
  eoi_document: string;
  applicant_uploaded_document: string;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
}

export interface EoiUploadSlot {
  id: string;
  slotNumber: number;
  categoryName: string;
  title: string;
  subtitle?: string;
  description: string;
  mandatory: boolean;
  isMandatory: boolean;
  isCore?: boolean;
  file: File | null;
  fileName: string | null;
  fileSize?: string | null;
  fileSizeBytes: number | null;
  fileSizeFormatted: string | null;
  uploadTimestamp: string | null;
  uploadDate?: string | null;
  previewUrl: string | null;
  errorMessage?: string | null;
  error?: string | null;
}

export interface PaymentData {
  processingFee: number;
  emdFee: number;
  processingFeeAmount: number;
  emdFeeAmount: number;
  includeProcessingFee: boolean;
  includeEmdFee: boolean;
  processingFeeSelected: boolean;
  emdFeeSelected: boolean;
  totalAmount: number;
  paymentMethod: string;
  upiId?: string;
  bankName?: string;
  transactionId?: string;
  paymentDate?: string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
}

export interface SubmissionData {
  applicationNumber: string;
  submissionTimestamp: string;
  submissionDate?: string;
  eoiRefNumber?: string;
  acknowledgementReceiptNumber: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED' | 'DRAFT';
  modificationDeadline: string;
  applicantName: string;
  providerName: string;
  contactEmail: string;
  contactMobile: string;
  schemeName: string;
  eoiNoticeNumber: string;
  digitalSignatureRef: string;
  modificationCount?: number;
  maxModifications?: number;
}

export type ApplicationFlowStage = 'listing' | 'notice' | 'documents' | 'fees' | 'preview' | 'receipt' | 'edit_section';

export interface EoiFormData {
  orgBasicDetails: OrgBasicDetails;
  authPersonDetails: AuthorizedPersonOrgDetails;
  bankDetails: OrgBankDetails;
  specUploadDocs: SpecUploadDoc[];
  section5: TrainingProviderDetails;
  section6: TrainingCenterDetails;
  section7: EmdPaymentDetails;
  section8: ProcessFeePaymentDetails;
  section9: LegalConstitutionDetails;
  section10: FinancialDetailRow[];
  section11: TrainingPlacementRow[];
  section12: AnnualActionPlanRow[];
  section13: EoiDocumentChecklistRow[];
}

export interface SectionMeta {
  id: number;
  stepNumber: number;
  shortLabel: string;
  officialTitle: string;
  subTitle: string;
}

export const EOI_SECTIONS: SectionMeta[] = [
  {
    id: 1,
    stepNumber: 1,
    shortLabel: 'Documents',
    officialTitle: 'Step 1: Document Upload & Application Details',
    subTitle: 'Upload prescribed document categories (Max 5MB PDF only)'
  },
  {
    id: 2,
    stepNumber: 2,
    shortLabel: 'Fees & Payment',
    officialTitle: 'Step 2: Applicable Fee Calculation & Payment',
    subTitle: 'Processing Fee (₹500) + EMD Fee (₹1,00,000) Gateway'
  },
  {
    id: 3,
    stepNumber: 3,
    shortLabel: 'Complete Preview',
    officialTitle: 'Step 3: Complete EOI Application Preview',
    subTitle: 'Comprehensive Preview (Org Details, Auth Person, Bank, Turnovers, Plan & Documents)'
  },
  {
    id: 4,
    stepNumber: 4,
    shortLabel: 'Submission Receipt',
    officialTitle: 'Step 4: Government Submission Receipt',
    subTitle: 'Official RSLDC Receipt & Post-Submission Modification Window'
  }
];

export const INITIAL_REQUIRED_DOCUMENTS: Omit<EoiUploadSlot, 'file' | 'fileName' | 'fileSize' | 'fileSizeBytes' | 'fileSizeFormatted' | 'uploadTimestamp' | 'uploadDate' | 'previewUrl' | 'errorMessage' | 'error'>[] = [
  {
    id: 'doc_company',
    slotNumber: 1,
    categoryName: 'Company Document / Legal Constitution Proof',
    title: 'Company Document *',
    subtitle: 'Certificate of Incorporation / Society Reg / Trust Deed / Entity PAN',
    description: 'Certificate of Incorporation, Society Registration, Trust Deed, or PAN proof issued by competent authority.',
    mandatory: true,
    isMandatory: true,
    isCore: true
  },
  {
    id: 'doc_prev_exp',
    slotNumber: 2,
    categoryName: 'Previous Experience / Past Skill Training Proof',
    title: 'Previous Experience *',
    subtitle: 'Past skill training & placement track record certificates / work orders',
    description: 'Work completion certificates, sanction orders, or verified past placement records.',
    mandatory: true,
    isMandatory: true,
    isCore: true
  },
  {
    id: 'doc_turnover',
    slotNumber: 3,
    categoryName: 'Annual Turnover Certificate / Audited Financial Statements',
    title: 'Turn Over Certificate *',
    subtitle: 'CA Certified Annual Turnover Certificate with UDIN (Last 3 FY)',
    description: 'Chartered Accountant certified turnover certificate and audited balance sheets for the last 3 financial years.',
    mandatory: true,
    isMandatory: true,
    isCore: true
  },
  {
    id: 'doc_tech_proposal',
    slotNumber: 4,
    categoryName: 'Technical Proposal & Implementation Methodology',
    title: 'Technical Proposal *',
    subtitle: 'Detailed skill training plan, center infrastructure, and placement strategy',
    description: 'Comprehensive technical proposal detailing proposed training sectors, course curriculum, and execution plan.',
    mandatory: true,
    isMandatory: true,
    isCore: true
  }
];

export const OFFICIAL_PREVIEW_DOCUMENTS: SpecUploadDoc[] = [
  {
    s_no: 1,
    doc_title: 'Company Document *',
    doc_category: 'Company Document / Legal Constitution Proof',
    file_type: 'PDF',
    mandatory: true,
    file_name: 'company_registration_incorporation_proof.pdf',
    file_size: '2.1 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Certificate of Incorporation / Society Reg / Trust Deed / Entity PAN'
  },
  {
    s_no: 2,
    doc_title: 'Previous Experience *',
    doc_category: 'Previous Experience / Past Skill Training Proof',
    file_type: 'PDF',
    mandatory: true,
    file_name: 'previous_training_experience_certificates.pdf',
    file_size: '3.4 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Past skill training & placement track record certificates / work orders'
  },
  {
    s_no: 3,
    doc_title: 'Turn Over Certificate *',
    doc_category: 'Annual Turnover Certificate / Audited Financial Statements',
    file_type: 'PDF',
    mandatory: true,
    file_name: 'ca_certified_turnover_certificate_last_3_fy.pdf',
    file_size: '1.8 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'CA Certified Annual Turnover Certificate with UDIN (Last 3 FY)'
  },
  {
    s_no: 4,
    doc_title: 'Technical Proposal *',
    doc_category: 'Technical Proposal & Implementation Methodology',
    file_type: 'PDF',
    mandatory: true,
    file_name: 'technical_proposal_methodology_2025_26.pdf',
    file_size: '2.9 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Detailed skill training plan, center infrastructure, and placement strategy'
  },
  {
    s_no: 5,
    doc_title: 'Organisation Registration Certificate *',
    doc_category: 'Registration Certificate (Section 1 Proof)',
    file_type: 'PDF',
    mandatory: true,
    file_name: 'org_registration_certificate.pdf',
    file_size: '1.9 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Certificate of Incorporation / Society / Trust deed'
  },
  {
    s_no: 6,
    doc_title: 'Organisation PAN Card *',
    doc_category: 'PAN Card (Section 1 Proof)',
    file_type: 'PDF',
    mandatory: true,
    file_name: 'organisation_pan_card_copy.pdf',
    file_size: '1.2 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Clear scanned copy of entity PAN card'
  },
  {
    s_no: 7,
    doc_title: 'GST Registration Certificate',
    doc_category: 'GST Certificate (Section 1 Proof)',
    file_type: 'PDF',
    mandatory: false,
    file_name: 'gst_registration_certificate_annexure.pdf',
    file_size: '1.5 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'GSTIN Certificate with all annexures'
  },
  {
    s_no: 8,
    doc_title: 'Audited Balance Sheet / Turnover Certificate',
    doc_category: 'Audited Balance Sheet (Section 1 & Financials Proof)',
    file_type: 'PDF',
    mandatory: false,
    file_name: 'audited_balance_sheet_fy24_25.pdf',
    file_size: '2.4 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'CA-certified balance sheet / turnover proof'
  },
  {
    s_no: 9,
    doc_title: 'Cancelled Cheque / Bank Passbook',
    doc_category: 'Bank Proof (Section 3 Proof)',
    file_type: 'PDF',
    mandatory: false,
    file_name: 'cancelled_cheque_sbi_current.pdf',
    file_size: '1.1 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Bank proof showing printed account name/IFSC'
  },
  {
    s_no: 10,
    doc_title: 'Board Resolution / Power of Attorney',
    doc_category: 'Board Resolution (Section 2 Proof)',
    file_type: 'PDF',
    mandatory: false,
    file_name: 'board_resolution_auth_signatory.pdf',
    file_size: '1.6 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Authorizing official signatory for ISMS portal'
  },
  {
    s_no: 11,
    doc_title: 'NSDC Partner Certificate (If Applicable)',
    doc_category: 'NSDC Certificate',
    file_type: 'PDF',
    mandatory: false,
    file_name: 'nsdc_training_partner_certificate.pdf',
    file_size: '2.0 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Valid NSDC partnership certificate'
  },
  {
    s_no: 12,
    doc_title: 'Additional Supporting Document',
    doc_category: 'Supporting Document',
    file_type: 'PDF',
    mandatory: false,
    file_name: 'additional_supporting_credentials.pdf',
    file_size: '1.7 MB',
    upload_date: '08-Sep-2026',
    guidelines: 'Any additional empanelment credentials'
  }
];

export const RAJASTHAN_DISTRICTS: string[] = [
  'Ajmer',
  'Alwar',
  'Anupgarh',
  'Balotra',
  'Banswara',
  'Baran',
  'Barmer',
  'Beawar',
  'Bharatpur',
  'Bhilwara',
  'Bikaner',
  'Bundi',
  'Chittorgarh',
  'Churu',
  'Dausa',
  'Deeg',
  'Dholpur',
  'Didwana-Kuchaman',
  'Dungarpur',
  'Gangapur City',
  'Hanumangarh',
  'Jaipur',
  'Jaipur (Rural)',
  'Jaisalmer',
  'Jalore',
  'Jhalawar',
  'Jhunjhunu',
  'Jodhpur',
  'Jodhpur (Rural)',
  'Karauli',
  'Kekri',
  'Khairthal-Tijara',
  'Kota',
  'Kotputli-Behror',
  'Nagaur',
  'Neem Ka Thana',
  'Pali',
  'Phalodi',
  'Pratapgarh',
  'Rajsamand',
  'Salumbar',
  'Sanchore',
  'Sawai Madhopur',
  'Shahpura',
  'Sikar',
  'Sirohi',
  'Sri Ganganagar',
  'Tonk',
  'Udaipur'
];

export const STANDARD_EOI_DOCUMENTS: string[] = [
  'Organisation Registration Certificate / Incorporation Proof',
  'Organisation PAN Card',
  'GST Registration Certificate',
  'Audited Balance Sheet / Turnover Certificate',
  'Cancelled Cheque / Bank Passbook',
  'Board Resolution / Power of Attorney',
  'NSDC Partner Certificate',
  'Additional Supporting Document'
];
