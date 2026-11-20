import {
  Step1OrgDetails,
  OfficerInCharge,
  Step3AuthorizedPerson,
  Step4BankDetails
} from '../../features/registration/models/otr-form.model';

export interface SubmittedTenderDoc {
  id: number;
  name: string;
  category: 'mandatory' | 'annexure' | 'supporting';
  fileName: string;
  fileSize: string;
  status: 'uploaded' | 'pending';
  comment?: string;
}

/** A file shared by the department along with a shortfall notice (office order, format, sample...). */
export interface ShortfallSharedDoc {
  title: string;
  fileName: string;
  fileSize: string;
}

/** A file the applicant uploaded against one document asked for in a shortfall notice. */
export interface ShortfallUpload {
  requiredDoc: string;
  fileName: string;
  fileSize: string;
  uploadedOn?: string;
}

/** The applicant's reply to a shortfall notice. */
export interface ShortfallResponse {
  respondedOn: string;
  remarks: string;
  uploads: ShortfallUpload[];
}

/** One revert (shortfall) notice raised by the department on a submitted application. */
export interface ShortfallRequest {
  id: string;
  /** Only present when the shortfall came with an office order. */
  officeOrderRef?: string;
  raisedOn: string;
  raisedBy: string;
  /** Last date to respond (DD-Mon-YYYY). */
  dueDate: string;
  remarks: string;
  /** Documents the applicant has to upload. */
  requiredDocs: string[];
  /** Supporting files shared by the department. */
  sharedDocs: ShortfallSharedDoc[];
  status: 'Open' | 'Responded';
  response?: ShortfallResponse;
}

/** A file the applicant attached to an appeal. */
export interface AppealFile {
  fileName: string;
  fileSize: string;
}

/** The applicant's appeal against the rejection of an application: the answer to the rejection remarks and the files attached. */
export interface TenderAppeal {
  /** DD-Mon-YYYY. */
  submittedOn: string;
  reply: string;
  files: AppealFile[];
  status?: 'Pending' | 'Accepted' | 'Rejected';
  rejectionReason?: string;
  decidedAt?: string;
  deptRemarks?: string;
  responseDeadline?: string;
  response?: ShortfallResponse;
}

export interface SubmittedTender {
  id: string;
  appRef: string;
  appliedDate: string;
  closingDate: string; // Last date of submission
  schemeTitle: string;
  schemeName: string;
  schemeCategory: string;
  department: string;
  emdAmount: string;
  processingFee: string;
  transactionRef: string;
  emdTransactionRef: string;
  submittedStatus: 'Submitted' | 'Under Review' | 'Approved' | 'Accepted' | 'Rejected';
  eoiStatus: '-' | 'Under Review' | 'Reviewed' | string;
  rejectionReason?: string;
  editCount: number;
  maxEdits: number;

  orgDetails: Step1OrgDetails;
  signatoryDetails: Step3AuthorizedPerson;
  officers: OfficerInCharge[];
  bankDetails: Step4BankDetails;
  documents: SubmittedTenderDoc[];
  /** Revert (shortfall) notices from the department and the applicant's replies, oldest first. */
  shortfalls?: ShortfallRequest[];
  /** The appeal against a rejection; one appeal per application. */
  appeal?: TenderAppeal;
}

export function createSampleDocs(): SubmittedTenderDoc[] {
  const annexureItems: SubmittedTenderDoc[] = [
    {
      id: 1,
      name: 'Annexure-1: Covering Letter',
      category: 'annexure',
      fileName: 'Scan_Annexure_1_Signed.pdf',
      fileSize: '1.2 MB',
      status: 'uploaded'
    },
    {
      id: 2,
      name: 'Annexure-3: Audited Financial Statements Format for Last Three Consecutive Financial Years',
      category: 'annexure',
      fileName: 'Scan_Annexure_3_Signed.pdf',
      fileSize: '1.8 MB',
      status: 'uploaded'
    },
    {
      id: 3,
      name: 'Annexure-4: Details of Active Skill Development Centre Format',
      category: 'annexure',
      fileName: 'Scan_Annexure_4_Signed.pdf',
      fileSize: '1.4 MB',
      status: 'uploaded'
    },
    {
      id: 4,
      name: 'Annexure-5: Training and Placement Details Format',
      category: 'annexure',
      fileName: 'Scan_Annexure_5_Signed.pdf',
      fileSize: '2.1 MB',
      status: 'uploaded'
    },
    {
      id: 5,
      name: 'Annexure-6: Affidavit Format for Not Being Blacklisted by Govt. / PSU',
      category: 'annexure',
      fileName: 'Scan_Annexure_6_Signed.pdf',
      fileSize: '1.1 MB',
      status: 'uploaded'
    },
    {
      id: 6,
      name: 'Annexure-7: Self-Certificate / Declaration Format as per Annexure-7',
      category: 'annexure',
      fileName: 'Scan_Annexure_7_Signed.pdf',
      fileSize: '1.3 MB',
      status: 'uploaded'
    },
    {
      id: 7,
      name: 'Annexure-8: Details of Board of Directors Format',
      category: 'annexure',
      fileName: 'Scan_Annexure_8_Signed.pdf',
      fileSize: '1.5 MB',
      status: 'uploaded'
    },
    {
      id: 8,
      name: 'Annexure-9: Details of Placement Partnership / Industry Tie-ups Format',
      category: 'annexure',
      fileName: 'Scan_Annexure_9_Signed.pdf',
      fileSize: '1.7 MB',
      status: 'uploaded'
    },
    {
      id: 9,
      name: 'Annexure-10: Details of Working Experience in Relevant Sector Format',
      category: 'annexure',
      fileName: 'Scan_Annexure_10_Signed.pdf',
      fileSize: '2.3 MB',
      status: 'uploaded'
    },
    {
      id: 10,
      name: 'Annexure-11: List of Divisions and Group of District',
      category: 'annexure',
      fileName: 'Scan_Annexure_11_Signed.pdf',
      fileSize: '1.0 MB',
      status: 'uploaded'
    },
    {
      id: 11,
      name: 'Annexure-12: Proposed Evaluation Matrix Template',
      category: 'annexure',
      fileName: 'Scan_Annexure_12_Signed.pdf',
      fileSize: '1.6 MB',
      status: 'uploaded'
    },
    {
      id: 12,
      name: 'Annexure-13: Supporting Documents Checklist',
      category: 'annexure',
      fileName: 'Scan_Annexure_13_Signed.pdf',
      fileSize: '1.9 MB',
      status: 'uploaded'
    }
  ];

  const supportingItems: SubmittedTenderDoc[] = [
    {
      id: 13,
      name: 'Company PAN Card (Self-attested copy)',
      category: 'supporting',
      fileName: 'Company_PAN_Card.pdf',
      fileSize: '1.2 MB',
      status: 'uploaded'
    },
    {
      id: 14,
      name: 'GST Registration Certificate (If registered)',
      category: 'supporting',
      fileName: 'GST_Registration_Certificate.pdf',
      fileSize: '1.4 MB',
      status: 'uploaded'
    },
    {
      id: 15,
      name: 'Certificate of Incorporation / Registration (Issued by respective authority)',
      category: 'supporting',
      fileName: 'Certificate_of_Incorporation.pdf',
      fileSize: '1.5 MB',
      status: 'uploaded'
    },
    {
      id: 16,
      name: 'MSME / Udyam Registration Certificate (If applicable)',
      category: 'supporting',
      fileName: 'MSME_Udyam_Registration_Certificate.pdf',
      fileSize: '1.1 MB',
      status: 'uploaded'
    },
    {
      id: 17,
      name: 'Audited Financial Statements (Last 3 years) (Signed by CA with UDIN)',
      category: 'supporting',
      fileName: 'Audited_Financial_Statements_3Y.pdf',
      fileSize: '2.4 MB',
      status: 'uploaded'
    },
    {
      id: 18,
      name: 'CA-Certified Turnover Certificate (For total & skill-sector turnover)',
      category: 'supporting',
      fileName: 'CA_Turnover_Certificate_UDIN.pdf',
      fileSize: '1.3 MB',
      status: 'uploaded'
    },
    {
      id: 19,
      name: 'Affidavit for not being blacklisted by any Govt. / PSU (Notarized)',
      category: 'supporting',
      fileName: 'Notarized_Non_Blacklisting_Affidavit.pdf',
      fileSize: '1.2 MB',
      status: 'uploaded'
    },
    {
      id: 20,
      name: 'Authorized Person / Signatory Details (PAN, Aadhaar, Board resolution / authorization letter)',
      category: 'supporting',
      fileName: 'Signatory_Authorization_Resolution.pdf',
      fileSize: '1.8 MB',
      status: 'uploaded'
    },
    {
      id: 21,
      name: 'Details of Officer In-Charge (OIC) (PAN, Aadhaar, appointment letter)',
      category: 'supporting',
      fileName: 'OIC_Details_Appointment_Letter.pdf',
      fileSize: '1.5 MB',
      status: 'uploaded'
    },
    {
      id: 22,
      name: 'Bank Account Details with Cancelled Cheque (IFSC code required)',
      category: 'supporting',
      fileName: 'Bank_Cancelled_Cheque_Proof.pdf',
      fileSize: '1.0 MB',
      status: 'uploaded'
    },
    {
      id: 23,
      name: 'Training Centre Infrastructure Details (As per Annexure-4 format)',
      category: 'supporting',
      fileName: 'Training_Centre_Infrastructure_Proof.pdf',
      fileSize: '2.8 MB',
      status: 'uploaded'
    },
    {
      id: 24,
      name: 'Placement & Training Track Record (Sector-wise data as per Annexure-5)',
      category: 'supporting',
      fileName: 'Placement_Training_Track_Record.pdf',
      fileSize: '2.2 MB',
      status: 'uploaded'
    },
    {
      id: 25,
      name: 'NSDC Partnership Certificate (If applicable)',
      category: 'supporting',
      fileName: 'NSDC_Partnership_Certificate.pdf',
      fileSize: '1.4 MB',
      status: 'uploaded'
    },
    {
      id: 26,
      name: 'EOI Document with Sign & Seal on each page (By Company Secretary or Authorized Representative)',
      category: 'supporting',
      fileName: 'Signed_Sealed_EOI_Document.pdf',
      fileSize: '3.1 MB',
      status: 'uploaded'
    }
  ];

  return [...annexureItems, ...supportingItems];
}
