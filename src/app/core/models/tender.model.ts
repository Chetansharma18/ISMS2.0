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
}

export function createSampleDocs(): SubmittedTenderDoc[] {
  const docNames = [
    { id: 1, name: 'Covering Letter (Annexure 1)', category: 'mandatory' as const },
    { id: 2, name: 'Audited Financial Statements (Annexure 3)', category: 'mandatory' as const },
    { id: 3, name: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)', category: 'mandatory' as const },
    { id: 4, name: 'Statutory Compliance Self-Declaration (Annexure 7)', category: 'mandatory' as const },
    { id: 5, name: 'Signed & Sealed EOI Document', category: 'mandatory' as const },
    { id: 6, name: 'Debarment Undertaking Document', category: 'mandatory' as const },
    { id: 7, name: 'Training & Placement Track Record (Annexure 5)', category: 'annexure' as const },
    { id: 8, name: 'Active Skill Development Centres (Annexure 4)', category: 'annexure' as const },
    { id: 9, name: 'Board of Directors Details (Annexure 8)', category: 'annexure' as const },
    { id: 10, name: 'Industry Placement Tie-ups & MOUs (Annexure 9)', category: 'annexure' as const },
    { id: 11, name: 'Relevant Sector Experience Proof (Annexure 10)', category: 'annexure' as const },
    { id: 12, name: 'District Cluster Mobilization Plan (Annexure 11)', category: 'annexure' as const },
    { id: 13, name: 'Technical Evaluation Matrix (Annexure 12)', category: 'annexure' as const },
    { id: 14, name: 'Supporting Credentials & Accreditations (Annexure 13)', category: 'annexure' as const },
    { id: 15, name: 'NSDC Stake Partner Certificate', category: 'supporting' as const },
    { id: 16, name: 'CA Turnover Certificate with UDIN (Annexure 14)', category: 'supporting' as const }
  ];

  return docNames.map(d => ({
    ...d,
    fileName: `Scan_Annexure_${d.id}_Signed.pdf`,
    fileSize: `${(1.1 + (d.id % 4) * 0.4).toFixed(1)} MB`,
    status: 'uploaded'
  }));
}
