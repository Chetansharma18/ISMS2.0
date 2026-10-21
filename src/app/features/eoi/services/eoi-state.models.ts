/** Data shapes for the EOI feature (re-exported from eoi-state.service.ts). */

export interface CommitteeApprovalDocument {
  id: string;
  documentName: string;
  uploadDate: string;
  fileSize: string;
  signatories?: {
    name: string;
    designation: string;
    signedAt: string;
    verified: boolean;
  }[];
}

export interface TrainingCentreDossier {
  district: string;
  centreName: string;
  classrooms: number;
  practicalRooms: number;
  separateWashrooms: boolean;
  labInfrastructure: boolean;
  telephone: string;
  fullAddress: string;
}

export interface DossierDocument {
  id: string;
  title: string;
  fileSize: string;
  category: string;
  previewUrl?: string;
  verified: boolean;
}

/** Result of an earlier EOI the same organisation was empanelled under, measured against its target. */
export interface PastEngagement {
  schemeName: string;
  financialYear: string;
  eoiRefNo: string;
  /** Trainees allotted to the organisation. */
  target: number;
  trained: number;
  certified: number;
  placed: number;
  status: 'Completed' | 'Ongoing';
}

export interface ApplicantResponse {
  id: string;
  anonymousLabel: string; // e.g. "Company 1"
  actualLegalName: string; // "Apex Technical & Infrastructure Solutions Pvt Ltd"
  regNumber: string; // "ISMS-REG-2026-8819"
  schemeId: string;
  schemeName: string;
  eoiRefNo: string;
  submissionDate: string;
  status: 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' | 'REVERTED';
  statusDisplay: string; // "Under Review" | "Approved" | "Rejected" | "Reverted"
  emdFee: number;
  emdStatus: 'PAID' | 'REFUNDED';
  processingFee: number;
  processingFeeStatus: 'PAID';
  
  // OTR Organisation Profile
  organisation: {
    legalName: string;
    tradeName: string;
    entityType: string;
    registrationNumber: string;
    dateOfRegistration: string;
    stateOfRegistration: string;
    panNumber: string;
    gstin: string;
    turnover: string;
    registeredAddress: string;
    operationalAddress: string;
    website: string;
    email: string;
    contactNumber: string;
  };

  // OTR Authorized Signatory (Screenshot 3 fields)
  authorizedSignatory: {
    name: string;
    designation: string;
    email: string;
    contactNumber: string;
    residenceAddress: string;
    state: string;
    pan: string;
    aadhaarNo: string;
    typeIdProof: string;
    idNo: string;
    bhamashahNo: string;
    voterIdNo: string;
    passportNo: string;
    serviceTaxNo: string;
  };

  // OTR Bank Account Details
  bankDetails?: {
    bankName: string;
    branchName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: string;
  };

  // Proposal specific fields
  trainingCentres: TrainingCentreDossier[];
  financialYears: { year: string; totalTurnover: string; skillTurnover: string }[];
  placementTrackRecord: { sector: string; year: string; trained: number; placed: number; proofDetails: string }[];
  annualActionPlan: {
    district: string;
    proposedSDCs: number;
    location: string;
    sectors: string;
    courses: string;
    residential: string;
    batches: number;
  }[];

  // Uploaded Checklist Documents (Screenshot 3)
  uploadedDocuments: DossierDocument[];

  /** Earlier schemes this organisation was empanelled under, with the results achieved against target. */
  pastEngagements?: PastEngagement[];

  // Evaluation & Scrutiny Decision details
  scrutinyDetails?: {
    technicalScore?: number;
    /** Grade from the Grading Master (for example "A+" or "B"). */
    grade?: string;
    remarks?: string;
    disqualificationReason?: string;
    approvalDocument?: CommitteeApprovalDocument;
    scrutinyOfficer: string;
    decisionTimestamp: string;
    shortfall?: {
      documents: string[];
      officeOrderRef?: string;
      officeOrderFileName?: string;
      deadlineDays: number;
      revertedAt: string;
    };
    remarksHistory?: {
      id: string;
      remark: string;
      author: string;
      timestamp: string;
      forwardedTo?: string;
      priority?: 'Normal' | 'Urgent';
    }[];
  };

  // Full timeline audit trail of application lifecycle events & transactions
  activityLog?: ApplicationActivityLog[];
}

export interface ApplicationActivityLog {
  id: string;
  timestamp: string;
  action: 'SUBMITTED' | 'UNDER_REVIEW' | 'REVERTED' | 'RESUBMITTED' | 'REMARK_ADDED' | 'FORWARDED' | 'APPROVED' | 'REJECTED';
  title: string;
  actor: string;
  actorRole: 'Applicant / TP' | 'Department Scrutiny Officer' | 'Joint Director' | 'Empanelment Committee' | 'System';
  description: string;
  badgeClass?: string;
  meta?: {
    documents?: string[];
    officeOrderRef?: string;
    officeOrderFileName?: string;
    forwardedTo?: string;
    score?: number;
    grade?: string;
    remarks?: string;
  };
}

export interface Scheme {
  id: string;
  refNo: string;
  schemeTitle: string;
  code: string;
  category: string;
  dateOfOpening: string; // renamed from Published
  dateOfClosing: string; // renamed from Deadline
  status: 'Open' | 'Closed';
  responseCount: number;
  issuingAuthority: string;
  emdFee: string;
  processFee: string;
  description: string;
}

export interface SanctionTableRow {
  id: string;
  appId: string;
  agencyName: string;
  district: string;
  sector: string;
  category: string;
  grade: string;
  target: number;
}

export interface SanctionOrderDocumentData {
  schemeId: string;
  headerTitle: string;
  headerSubtitle: string;
  headerAddress: string;
  fileNo: string;
  sanctionDate: string;
  documentTitle: string;
  subjectText: string;
  referenceText: string;
  preambleText: string;
  tableRows: SanctionTableRow[];
  termsAndConditions: string[];
  dispatchRef: string;
  /** When the order was e-signed (ISO date-time). Empty while it is a draft. */
  signedAt?: string;
  copyToList: string[];
  leftLogoUrl?: string;
  rightLogoUrl?: string;
  rightLogoText?: string;
}

export interface IpaCourseRow {
  id: string;
  /** District this course row is allowed in (the IPA allows a course per district). */
  district?: string;
  sector: string;
  courseName: string;
  courseCode: string;
  durationDays: number;
  durationHours: number;
  mandatoryOjt: string;
  minEdu: string;
  minAge: string;
  rnr: string;
  rCat: string;
  costC: number;
  costH: number;
  costToolkit: string;
  totalCostPerTrainee: number;
  approvedTrainees: number;
  costPerBatch: number;
  cycles: number;
  totalBudget: number;
  perDayHours: number;
}

export interface TargetSummaryRow {
  sNo: number;
  particular: string;
  value: string;
}

export interface IpaDocumentData {
  schemeId: string;
  appId: string;
  headerTitle: string;
  headerSubtitle: string;
  headerAddress: string;
  fileNo: string;
  ipaDate: string;
  recipientName: string;
  recipientAddress1: string;
  recipientAddress2: string;
  sarNumber: string;
  referenceNo: string;
  subjectText: string;
  preambleText: string;
  piaName: string;
  sdcAddress: string;
  /** Line about the minimum qualification of the trainees, printed under the tables. */
  qualificationNote?: string;
  /** Heading of the box with the minimum educational qualification and experience. */
  qualificationTitle?: string;
  /** Lines of that box, one per line ("OR" lines included). */
  qualificationText?: string;
  courseRows: IpaCourseRow[];
  targetSummary: TargetSummaryRow[];
  termsAndConditions: string[];
  ccList: string[];
  signatoryTitle: string;
  signatorySub: string;
  /** When the IPA was e-signed (ISO date-time). Empty while it is a draft. */
  signedAt?: string;
  leftLogoUrl?: string;
  rightLogoUrl?: string;
}

/** Input of `EoiStateService.updateScrutinyDecision`. */
export interface ScrutinyDecisionInput {
  status: 'APPROVED' | 'REJECTED' | 'REVERTED' | 'UNDER_SCRUTINY';
  grade?: string;
  technicalScore?: number;
  remarks: string;
  disqualificationReason?: string;
  attachedScrutinyNote?: string;
  approvalDocument?: CommitteeApprovalDocument;
  scrutinyOfficer?: string;
  shortfall?: {
    documents: string[];
    officeOrderRef?: string;
    officeOrderFileName?: string;
    deadlineDays: number;
    revertedAt: string;
  };
  remarksHistory?: {
    id: string;
    remark: string;
    author: string;
    timestamp: string;
    forwardedTo?: string;
    priority?: 'Normal' | 'Urgent';
  }[];
  activityLog?: ApplicationActivityLog[];
}
