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

export interface ApplicantResponse {
  id: string;
  anonymousLabel: string; // e.g. "Company 1"
  actualLegalName: string; // "Apex Technical & Infrastructure Solutions Pvt Ltd"
  regNumber: string; // "ISMS-REG-2026-8819"
  schemeId: string;
  schemeName: string;
  eoiRefNo: string;
  submissionDate: string;
  status: 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED';
  statusDisplay: string; // "Pending Review" | "Accepted" | "Rejected"
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

  // Evaluation & Scrutiny Decision details
  scrutinyDetails?: {
    technicalScore?: number;
    grade?: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E';
    remarks?: string;
    disqualificationReason?: string;
    approvalDocument?: CommitteeApprovalDocument;
    scrutinyOfficer: string;
    decisionTimestamp: string;
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
  signatoryName: string;
  signatoryTitle: string;
  signatoryOrg: string;
  copyToList: string[];
  leftLogoUrl?: string;
  rightLogoUrl?: string;
  rightLogoText?: string;
}

export interface IpaCourseRow {
  id: string;
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
  courseRows: IpaCourseRow[];
  targetSummary: TargetSummaryRow[];
  termsAndConditions: string[];
  ccList: string[];
  signatoryTitle: string;
  signatorySub: string;
  leftLogoUrl?: string;
  rightLogoUrl?: string;
}

/** Input of `EoiStateService.updateScrutinyDecision`. */
export interface ScrutinyDecisionInput {
  status: 'APPROVED' | 'REJECTED';
  grade: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E';
  technicalScore: number;
  remarks: string;
  disqualificationReason?: string;
  attachedScrutinyNote?: string;
  approvalDocument?: CommitteeApprovalDocument;
  scrutinyOfficer?: string;
}
