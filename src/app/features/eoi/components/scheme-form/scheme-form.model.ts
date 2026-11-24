export interface EoiDocumentItem {
  id: number;
  name: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  isMandatory: boolean;
  status: 'uploaded' | 'pending';
  category: 'supporting' | 'annexure' | 'mandatory' | 'remaining';
  comment?: string;
}

/** The 14 Supporting Documents and 12 Annexures the applicant has to upload (Step 2). */
export function createInitialEoiDocuments(): EoiDocumentItem[] {
  return [
    // =========================================================================
    // 1. Supporting Documents (14 items from Doc Master)
    // =========================================================================
    {
      id: 1,
      name: 'Company PAN Card',
      description: 'Valid PAN card copy of the applicant entity',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 2,
      name: 'GST Registration Certificate',
      description: 'State GST registration certificate or acknowledgement',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 3,
      name: 'Certificate of Incorporation / Registration',
      description: 'Certificate of Incorporation (ROC) / Society / Trust deed registration',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 4,
      name: 'MSME / Udyam Registration Certificate',
      description: 'Valid Udyam / MSME registration certificate',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: false,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 5,
      name: 'Audited Financial Statements',
      description: 'Audited Balance Sheet and P&L statements for last 3 consecutive years',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 6,
      name: 'CA-Certified Turnover Certificate',
      description: 'Chartered Accountant certified turnover certificate with valid UDIN',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 7,
      name: 'Affidavit for not being blacklisted by any Govt. / PSU',
      description: 'Non-judicial stamp paper affidavit affirming entity is not debarred / blacklisted',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 8,
      name: 'Authorized Person / Signatory Details',
      description: 'Board resolution or Power of Attorney authorizing the signatory',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 9,
      name: 'Details of Officer In-Charge (OIC)',
      description: 'Appointment letter, resume and contact credentials of designated OIC',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 10,
      name: 'Bank Account Details with Cancelled Cheque',
      description: 'Bank passbook copy or cancelled cheque of designated operating account',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 11,
      name: 'Training Centre Infrastructure Details',
      description: 'Center layout, classroom photos and biometric attendance facility proofs',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 12,
      name: 'Placement & Training Track Record',
      description: 'Past placement records, candidate offer letters and salary slips summary',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 13,
      name: 'NSDC Partnership Certificate',
      description: 'NSDC equity or funded partner participation certificate (if applicable)',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: false,
      status: 'pending',
      category: 'supporting'
    },
    {
      id: 14,
      name: 'EOI Document with Sign & Seal on each page',
      description: 'Complete downloaded RFP / EOI document signed and stamped on each page',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'supporting'
    },

    // =========================================================================
    // 2. Annexures (12 items from Annexure Master)
    // =========================================================================
    {
      id: 15,
      name: 'Annexure-1: Covering Letter',
      description: 'Official proposal submission covering letter on organization letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 16,
      name: 'Annexure-3: Audited Financial Statements Format for Last Three Consecutive Financial Years',
      description: 'Financial statements format as per Annexure-3 guidelines',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 17,
      name: 'Annexure-4: Details of Active Skill Development Centre Format',
      description: 'Active center details in prescribed format with geo-tagged verification',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 18,
      name: 'Annexure-5: Training and Placement Details Format',
      description: 'Training and placement format with candidate wage verification',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 19,
      name: 'Annexure-6: Affidavit Format for Not Being Blacklisted by Govt. / PSU',
      description: 'Prescribed affidavit format for non-blacklisting',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 20,
      name: 'Annexure-7: Self-Certificate / Declaration Format as per Annexure-7',
      description: 'Statutory compliance self-declaration on corporate letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 21,
      name: 'Annexure-8: Details of Board of Directors Format',
      description: 'Board of Directors and management profile format',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 22,
      name: 'Annexure-9: Details of Placement Partnership / Industry Tie-ups Format',
      description: 'Corporate partnerships and industry placement tie-up MOUs format',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 23,
      name: 'Annexure-10: Details of Working Experience in Relevant Sector Format',
      description: 'Relevant sector working experience proof and completion certificates',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 24,
      name: 'Annexure-11: List of Divisions and Group of District',
      description: 'Division and district preference list format',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 25,
      name: 'Annexure-12: Proposed Evaluation Matrix Template',
      description: 'Self-assessed proposed technical evaluation scoring matrix',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 26,
      name: 'Annexure-13: Supporting Documents Checklist',
      description: 'Completed supporting documents checklist in prescribed template',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    }
  ];
}
