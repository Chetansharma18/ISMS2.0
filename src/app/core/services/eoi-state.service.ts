import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  ssoId: string;
  role: 'applicant' | 'dept_admin' | 'super_admin';
  userState: 'new' | 'existing';
  isRegistered: boolean;
  isApprovedTp: boolean;
  tpGrade: 'A' | 'B' | 'C' | null;
  registrationNumber: string;
  tpId: string | null;
  department?: string;
  personal: {
    fullName: string;
    designation: string;
    dob: string;
    identityType: string;
    identityNumber: string;
    email: string;
    mobile: string;
    isOtpVerified: boolean;
  };
  organization: {
    name: string;
    entityType: string;
    incorporationDate: string;
    pan: string;
    gstin: string;
    registeredAddress: string;
    state: string;
    pincode: string;
    website: string;
  };
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: string;
    isPfmsVerified: boolean;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
  }[];
}

export interface SchemeDocument {
  id: string;
  title: string;
  filename: string;
  type: 'PDF' | 'EXCEL' | 'DOC';
  size: string;
  publishedDate: string;
  description: string;
}

export interface Scheme {
  id: string;
  eoiReferenceNo: string;
  name: string;
  schemeCode: string;
  schemeCategory: string;
  tenderId: string;
  ePublishedDate: string;
  closingDate: string;
  openingDate: string;
  preBidMeetingDate?: string;
  organisationChain: string;
  publishDate: string;
  submissionLastDate: string;
  deadline?: string;
  eoiCategory: string;
  eoiDescription: string;
  emdAmount: number;
  processingFee: number;
  attachedFile: string;
  department: string;
  status: 'Open' | 'Closed';
  responseCount?: number;
  targetBeneficiaries?: string;
  eligibilityPreview?: string[];
  daysRemaining?: number;
  documents?: SchemeDocument[];
}

export interface CommitteeApprovalDocument {
  documentTitle: string;
  fileName: string;
  fileSize: string;
  certificateRefNo: string;
  uploadedDate: string;
  uploadedBy: string;
  committeeName: string;
  signedMembers: {
    name: string;
    designation: string;
    department: string;
    signedAt: string;
    status: 'E-Signed & Approved';
  }[];
  documentUrl?: string;
}

export interface EoiApplication {
  id: string;
  schemeId: string;
  schemeName: string;
  department: string;
  appliedDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED';
  proposalDetails: {
    targetCapacity: number;
    sectors: string[];
    proposedDistricts: string[];
    proposedCentersCount: number;
    keyFacultyCount: number;
    priorGovtProjects: number;
  };
  emdPayment: {
    baseEmd: number;
    processingFee: number;
    totalPaid: number;
    paymentMethod: 'UPI' | 'NET_BANKING' | 'CARD' | 'NEFT_RTGS';
    txnReference: string;
    paidTimestamp: string;
    status: 'SUCCESS' | 'PENDING';
  };
  scrutinyDetails?: {
    assignedOfficer: string;
    submissionDate: string;
    slaExpectedDays: number;
    scrutinyStage: string;
    decisionDate?: string;
    assignedGrade?: string;
    assignedCategory?: string;
    rejectionReason?: string;
    adminRemarks?: string;
    attachedScrutinyNote?: string;
    committeeAttachment?: CommitteeApprovalDocument;
    currentStageNumber?: number;
    scrutinyStageName?: string;
    emdRefund?: {
      refundAmount: number;
      refundTxnId: string;
      refundStatus: string;
      expectedCreditDays: string;
    };
  };
}

export interface ApplicantResponse {
  applicationId: string;
  schemeId: string;
  schemeName: string;
  applicantName: string;
  organizationName: string;
  submissionDate: string;
  emdStatus: 'PAID' | 'REFUNDED' | 'PENDING';
  emdAmount: number;
  processingFee: number;
  currentGrade: 'A' | 'B' | 'C' | null;
  scrutinyStatus: 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  attachedScrutinyNote?: string;
  proposalCapacity: number;
  proposedDistricts: string[];
  contactEmail: string;
  contactMobile: string;
  registrationNumber: string;
  pan: string;
  gstin: string;
}

export interface DepartmentMaster {
  id: string;
  code: string;
  name: string;
  nodalOfficer: string;
  email: string;
  phone: string;
  activeTendersCount: number;
}

export interface SchemeMaster {
  id: string;
  schemeCode: string;
  name: string;
  department: string;
  category: string;
  defaultEmd: number;
  defaultFormFee: number;
  targetBeneficiaries: string;
  status: 'Active' | 'Draft' | 'Archived';
}

export interface FeeStructureMaster {
  id: string;
  categoryName: string;
  minTurnover: string;
  defaultFormFee: number;
  defaultEmd: number;
  exemptionApplicable: boolean;
}

export interface DynamicFormField {
  id: string;
  schemeCode: string;
  label: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'file' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  order: number;
}

export interface UserAccount {
  id: string;
  ssoId: string;
  fullName: string;
  email: string;
  role: 'applicant' | 'dept_admin' | 'super_admin';
  department?: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
  tpGrade?: string;
  organizationName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EoiStateService {

  // Current User Profile State
  private userProfileSubject = new BehaviorSubject<UserProfile>({
    ssoId: 'applicant_rj',
    role: 'applicant',
    userState: 'existing', // 'new' | 'existing'
    isRegistered: true,
    isApprovedTp: false,
    tpGrade: null,
    registrationNumber: 'ISMS-REG-2026-8819',
    tpId: null,
    department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
    personal: {
      fullName: 'Vikramaditya Sharma',
      designation: 'Managing Director & Authorized Signatory',
      dob: '1984-06-15',
      identityType: 'Aadhaar (UIDAI)',
      identityNumber: 'XXXX-XXXX-4812',
      email: 'v.sharma@apextechnical.in',
      mobile: '+91 98201 44520',
      isOtpVerified: true
    },
    organization: {
      name: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
      entityType: 'Private Limited Company (Registered under Companies Act 2013)',
      incorporationDate: '2015-11-04',
      pan: 'AABCA1294F',
      gstin: '27AABCA1294F1Z8',
      registeredAddress: 'Unit 402, Bharat Technology Hub, Sector 18, MIDC Industrial Area',
      state: 'Maharashtra',
      pincode: '400705',
      website: 'www.apextechnical.in'
    },
    bankDetails: {
      accountHolderName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
      bankName: 'State Bank of India',
      branchName: 'Commercial Branch, M.I. Road, Jaipur',
      accountNumber: '39480124891',
      ifscCode: 'SBIN0004123',
      accountType: 'Current Account',
      isPfmsVerified: true
    },
    documents: [
      { id: 'doc-1', name: 'Certificate_of_Incorporation_Apex.pdf', type: 'PDF', size: '1.4 MB', uploadDate: '12 Jan 2026' },
      { id: 'doc-2', name: 'PAN_Card_Apex_Technical.pdf', type: 'PDF', size: '420 KB', uploadDate: '12 Jan 2026' },
      { id: 'doc-3', name: 'GST_Registration_Certificate.pdf', type: 'PDF', size: '680 KB', uploadDate: '12 Jan 2026' },
      { id: 'doc-4', name: 'Audited_Balance_Sheet_FY24_25.pdf', type: 'PDF', size: '3.8 MB', uploadDate: '12 Jan 2026' }
    ]
  });

  public userProfile$: Observable<UserProfile> = this.userProfileSubject.asObservable();

  setPersona(role: 'citizen' | 'applicant' | 'dept_admin' | 'super_admin', userState?: 'new' | 'existing'): void {
    const current = this.userProfileSubject.value;
    const newProfile = { ...current, role: role as any, userState: userState || 'new' };
    this.userProfileSubject.next(newProfile);
  }

  // Active Schemes Catalog matching RSLDC EOI Details & Tender Table format
  private schemesSubject = new BehaviorSubject<Scheme[]>([
    {
      id: 'EOI-MMKVY-2026-01',
      eoiReferenceNo: 'RSLDC/EOI/2026/MMKVY-01',
      name: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      schemeCode: 'MMKVY',
      schemeCategory: 'State Funded',
      tenderId: '2026_RSLDC_593778_1',
      ePublishedDate: '31-Aug-2026 01:00 PM',
      closingDate: '05-Oct-2026 02:00 PM',
      openingDate: '06-Oct-2026 02:30 PM',
      preBidMeetingDate: '15-Sep-2026 11:30 AM',
      organisationChain: 'RSLDC - MD||CE (MM and O and M)||SE - Skill Cell||AEN 6',
      publishDate: '31-Aug-2026 01:00 PM',
      submissionLastDate: '05-Oct-2026 02:00 PM',
      deadline: '05-Oct-2026 02:00 PM',
      daysRemaining: 23,
      eoiCategory: 'General Empanelment',
      eoiDescription: 'Expression of Interest for Empanelment of Training Partners (TPs) to impart skill training under MMKVY across Rajasthan districts with guaranteed minimum 70% wage & self-employment placement support for eligible youth.',
      emdAmount: 50000,
      processingFee: 2500,
      attachedFile: 'EOI_MMKVY_RSLDC_2026.pdf',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      status: 'Closed',
      responseCount: 14,
      targetBeneficiaries: 'Youth of Rajasthan (Aged 18-35) with priority to rural and underprivileged categories.',
      eligibilityPreview: [
        'Registered Company / Society / Trust / Partnership active for minimum 3 years',
        'Average annual turnover of ₹50 Lakhs in the last 3 financial years',
        'Valid Rajasthan GSTIN and PAN registration',
        'Accredited training center infrastructure or commitment to establish within 30 days'
      ],
      documents: [
        {
          id: 'doc-mmkvy-1',
          title: 'Official Request for Proposal (RFP) & Tender Terms',
          filename: 'EOI_MMKVY_RSLDC_2026.pdf',
          type: 'PDF',
          size: '2.4 MB',
          publishedDate: '31-Aug-2026',
          description: 'Detailed instructions to bidders, qualification benchmarks, and terms of empanelment.'
        },
        {
          id: 'doc-mmkvy-2',
          title: 'Standard Operating Procedure (SOP) for Training Partners',
          filename: 'MMKVY_TP_Empanelment_SOP_2026.pdf',
          type: 'PDF',
          size: '1.8 MB',
          publishedDate: '31-Aug-2026',
          description: 'Guidelines on biometric attendance, course curriculum, assessments, and trainer certification.'
        },
        {
          id: 'doc-mmkvy-3',
          title: 'Technical Bid Evaluation Criteria & Annexures',
          filename: 'Annexure_Technical_Evaluation_Criteria.pdf',
          type: 'PDF',
          size: '950 KB',
          publishedDate: '31-Aug-2026',
          description: 'Format for past experience certificates, faculty credentials, and center layout affidavits.'
        },
        {
          id: 'doc-mmkvy-4',
          title: 'Financial Norms Schedule & Cost Head Formats',
          filename: 'Annexure_Financial_Cost_Norms.xlsx',
          type: 'EXCEL',
          size: '420 KB',
          publishedDate: '31-Aug-2026',
          description: 'Category-wise training cost payouts, milestone disbursement schedule, and incentive grid.'
        },
        {
          id: 'doc-mmkvy-5',
          title: 'Corrigendum 01 - Pre-Bid Query Submission Extension',
          filename: 'Corrigendum_01_MMKVY_Extension.pdf',
          type: 'PDF',
          size: '310 KB',
          publishedDate: '04-Sep-2026',
          description: 'Official notice regarding clarification timeline and online submission portal guidelines.'
        }
      ]
    },
    {
      id: 'EOI-SAMARTH-2026-02',
      eoiReferenceNo: 'RSLDC/EOI/2026/SAMARTH-02',
      name: 'SAMARTH Skill Development Scheme',
      schemeCode: 'SAMARTH',
      schemeCategory: 'State Funded',
      tenderId: '2026_RSLDC_587251_9',
      ePublishedDate: '27-Aug-2026 03:00 PM',
      closingDate: '15-Sep-2026 11:00 AM',
      openingDate: '16-Sep-2026 11:00 AM',
      preBidMeetingDate: '05-Sep-2026 11:00 AM',
      organisationChain: 'RSLDC - MD||CE-COMMERCIAL||SE-TECHNICAL CELL||XEN',
      publishDate: '27-Aug-2026 03:00 PM',
      submissionLastDate: '15-Sep-2026 11:00 AM',
      deadline: '15-Sep-2026 11:00 AM',
      daysRemaining: 3,
      eoiCategory: 'Special Projects',
      eoiDescription: 'Empanelment of specialized technical training institutes for advanced manufacturing, renewable solar PV systems, EV servicing, and automation trade certifications.',
      emdAmount: 35000,
      processingFee: 1800,
      attachedFile: 'EOI_SAMARTH_Technical_Specs.pdf',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      status: 'Closed',
      responseCount: 8,
      targetBeneficiaries: 'Diploma holders, ITI graduates, and engineering dropouts seeking industrial certifications.',
      eligibilityPreview: [
        'Recognized technical education institute or NSIC/MSME certified tech training center',
        'Minimum 2 years domain training experience in engineering/renewable energy trades',
        'Industry tie-ups with minimum 5 manufacturing/solar enterprises for on-the-job internships'
      ],
      documents: [
        {
          id: 'doc-samarth-1',
          title: 'Official RFP for SAMARTH Specialized Technical Trades',
          filename: 'EOI_SAMARTH_Technical_Specs.pdf',
          type: 'PDF',
          size: '2.1 MB',
          publishedDate: '27-Aug-2026',
          description: 'Tender requirements, technical trade list, equipment specifications, and evaluation marks.'
        },
        {
          id: 'doc-samarth-2',
          title: 'Curriculum & Laboratory Equipment Norms',
          filename: 'SAMARTH_Lab_Standards_2026.pdf',
          type: 'PDF',
          size: '1.4 MB',
          publishedDate: '27-Aug-2026',
          description: 'Mandatory tools, workshop layout, safety protocols, and lab equipment checklists.'
        },
        {
          id: 'doc-samarth-3',
          title: 'Industry MoA / Placement Undertaking Templates',
          filename: 'SAMARTH_Industry_MoA_Templates.docx',
          type: 'DOC',
          size: '620 KB',
          publishedDate: '27-Aug-2026',
          description: 'Standard format for enterprise placement agreements and trainee apprenticeship commitments.'
        }
      ]
    },
    {
      id: 'EOI-ELSTP-2026-03',
      eoiReferenceNo: 'RSLDC/EOI/2026/ELSTP-03',
      name: 'Employment Linked Skill Training Programme (ELSTP)',
      schemeCode: 'ELSTP',
      schemeCategory: 'Employment Linked',
      tenderId: '2026_DSEE_592681_1',
      ePublishedDate: '25-Aug-2026 04:30 PM',
      closingDate: '15-Sep-2026 11:00 AM',
      openingDate: '16-Sep-2026 11:00 AM',
      preBidMeetingDate: '04-Sep-2026 03:00 PM',
      organisationChain: 'DSEE - SECRETARIAT||DIRECTORATE SKILL DEV||SE-OPERATIONS||XEN',
      publishDate: '25-Aug-2026 04:30 PM',
      submissionLastDate: '15-Sep-2026 11:00 AM',
      deadline: '15-Sep-2026 11:00 AM',
      daysRemaining: 3,
      eoiCategory: 'Wage Employment',
      eoiDescription: 'Selection of corporate training providers for demand-driven wage and self-employment skill certifications with guaranteed 75% formal employment within 90 days of completion.',
      emdAmount: 75000,
      processingFee: 3000,
      attachedFile: 'ELSTP_Empanelment_Guidelines.pdf',
      department: 'Department of Skills, Employment & Entrepreneurship, GoR',
      status: 'Open',
      responseCount: 19,
      targetBeneficiaries: 'Unemployed youth across all 33 districts of Rajasthan registered on Employment Exchange.',
      eligibilityPreview: [
        'Corporate training firm or National Skill Development Corporation (NSDC) funded partner',
        'Direct employer placement tie-ups or captive hiring requirements',
        'Minimum cumulative placement track record of 1,000 candidates over last 3 years'
      ],
      documents: [
        {
          id: 'doc-elstp-1',
          title: 'ELSTP Empanelment Guidelines & RFP Document',
          filename: 'ELSTP_Empanelment_Guidelines.pdf',
          type: 'PDF',
          size: '3.2 MB',
          publishedDate: '25-Aug-2026',
          description: 'Comprehensive tender terms, captive employer guidelines, and wage validation SOP.'
        },
        {
          id: 'doc-elstp-2',
          title: 'Placement Verification & Post-Placement Tracking Protocol',
          filename: 'ELSTP_Placement_Tracking_Protocol.pdf',
          type: 'PDF',
          size: '880 KB',
          publishedDate: '25-Aug-2026',
          description: 'EPFO/ESIC wage proof submission requirements and 12-month candidate tracking guidelines.'
        },
        {
          id: 'doc-elstp-3',
          title: 'Sector Skill Council (SSC) Affiliation Affidavit Format',
          filename: 'SSC_Affiliation_Affidavit_Format.docx',
          type: 'DOC',
          size: '340 KB',
          publishedDate: '25-Aug-2026',
          description: 'Format for declaring active Sector Skill Council trainer and assessor accreditations.'
        }
      ]
    },
    {
      id: 'EOI-DDUGKY-2026-04',
      eoiReferenceNo: 'RSLDC/EOI/2026/DDUGKY-04',
      name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
      schemeCode: 'DDU-GKY',
      schemeCategory: 'Centrally Sponsored',
      tenderId: '2026_MORD_592688_1',
      ePublishedDate: '25-Aug-2026 04:30 PM',
      closingDate: '15-Sep-2026 11:00 AM',
      openingDate: '16-Sep-2026 11:00 AM',
      preBidMeetingDate: '03-Sep-2026 02:00 PM',
      organisationChain: 'MORD STATE CELL - HQ||CE-RURAL LIVELIHOODS||SE-PROJECTS||XEN',
      publishDate: '25-Aug-2026 04:30 PM',
      submissionLastDate: '15-Sep-2026 11:00 AM',
      deadline: '15-Sep-2026 11:00 AM',
      daysRemaining: 3,
      eoiCategory: 'Rural Focus',
      eoiDescription: 'Empanelment of Project Implementing Agencies (PIAs) for rural poor youth skill development, residential training facilities, and sustainable livelihood placement under MoRD norms.',
      emdAmount: 25000,
      processingFee: 1500,
      attachedFile: 'DDU_GKY_RSLDC_RFP_2026.pdf',
      department: 'Ministry of Rural Development / RSLDC',
      status: 'Open',
      responseCount: 6,
      targetBeneficiaries: 'Rural BPL/SECC poor youth aged 15-35 years with focus on SC, ST, women and PwD.',
      eligibilityPreview: [
        'Valid PRN (Permanent Registration Number) registered with MoRD portal',
        'Financial net worth of at least 25% of total proposed project cost',
        'Capacity to operate fully residential skill centers with boarding and lodging amenities'
      ],
      documents: [
        {
          id: 'doc-ddugky-1',
          title: 'Official DDU-GKY MoRD RFP & Empanelment Notice',
          filename: 'DDU_GKY_RSLDC_RFP_2026.pdf',
          type: 'PDF',
          size: '2.8 MB',
          publishedDate: '25-Aug-2026',
          description: 'Guidelines on project eligibility, target allocation, and inspection protocols.'
        },
        {
          id: 'doc-ddugky-2',
          title: 'Residential Training Center Specification & Amenities Checklist',
          filename: 'DDU_GKY_Residential_Center_Norms.pdf',
          type: 'PDF',
          size: '1.1 MB',
          publishedDate: '25-Aug-2026',
          description: 'Hostel standards, CCTV surveillance norms, mess facilities, and biometric setup.'
        },
        {
          id: 'doc-ddugky-3',
          title: 'Financial Proposal & Installment Disbursement Model',
          filename: 'DDUGKY_Disbursement_Schedule.xlsx',
          type: 'EXCEL',
          size: '510 KB',
          publishedDate: '25-Aug-2026',
          description: 'Four-installment release conditions, bank guarantee norms, and audit checklists.'
        }
      ]
    }
  ]);

  public schemes$: Observable<Scheme[]> = this.schemesSubject.asObservable();

  // Current Active Application Draft
  private currentDraftSubject = new BehaviorSubject<EoiApplication>({
    id: 'ISMS-EOI-2026-9871',
    schemeId: 'EOI-MMKVY-2026-01',
    schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
    appliedDate: '2026-09-08',
    status: 'UNDER_SCRUTINY',
    proposalDetails: {
      targetCapacity: 450,
      sectors: ['Industrial Automation', 'Solar Energy', 'Quality Control & Testing'],
      proposedDistricts: ['Jaipur Rural', 'Jodhpur', 'Kota', 'Udaipur'],
      proposedCentersCount: 3,
      keyFacultyCount: 8,
      priorGovtProjects: 5
    },
    emdPayment: {
      baseEmd: 50000,
      processingFee: 2500,
      totalPaid: 52500,
      paymentMethod: 'NET_BANKING',
      txnReference: 'TXN-ISMS-884920482',
      paidTimestamp: '2026-09-08 11:15:30 IST',
      status: 'SUCCESS'
    },
    scrutinyDetails: {
      assignedOfficer: 'Dr. K. N. Verma (Senior Scrutiny Officer, RSLDC)',
      submissionDate: '2026-09-08',
      slaExpectedDays: 7,
      scrutinyStage: 'Stage 2: Technical Eligibility & Document Verification',
      assignedGrade: 'A',
      rejectionReason: 'Technical qualification requirement not met.',
      emdRefund: {
        refundAmount: 50000,
        refundTxnId: 'REFUND-HDFC-99201482',
        refundStatus: 'Processed & Credited to Original Account',
        expectedCreditDays: 'Completed on 2026-09-08'
      }
    }
  });

  public currentDraft$: Observable<EoiApplication> = this.currentDraftSubject.asObservable();

  private initialHistory: EoiApplication[] = [
    {
      id: 'ISMS-EOI-2026-9871',
      schemeId: 'EOI-MMKVY-2026-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      appliedDate: '2026-09-08',
      status: 'UNDER_SCRUTINY',
      proposalDetails: {
        targetCapacity: 450,
        sectors: ['Industrial Automation', 'Solar Energy'],
        proposedDistricts: ['Jaipur', 'Jodhpur', 'Kota'],
        proposedCentersCount: 3,
        keyFacultyCount: 8,
        priorGovtProjects: 5
      },
      emdPayment: {
        baseEmd: 50000,
        processingFee: 2500,
        totalPaid: 52500,
        paymentMethod: 'NET_BANKING',
        txnReference: 'TXN-ISMS-884920482',
        paidTimestamp: '2026-09-08 11:15:30 IST',
        status: 'SUCCESS'
      },
      scrutinyDetails: {
        assignedOfficer: 'Dr. K. N. Verma (Scrutiny Cell)',
        submissionDate: '2026-09-08',
        slaExpectedDays: 7,
        scrutinyStage: 'Stage 2: Technical Scrutiny & Financial Evaluation'
      }
    },
    {
      id: 'ISMS-EOI-2026-6412',
      schemeId: 'EOI-SAMARTH-2026-02',
      schemeName: 'SAMARTH Skill Development Scheme',
      department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      appliedDate: '2026-07-14',
      status: 'APPROVED',
      proposalDetails: {
        targetCapacity: 300,
        sectors: ['Industrial Automation', 'CNC Machining'],
        proposedDistricts: ['Alwar', 'Bhiwadi'],
        proposedCentersCount: 2,
        keyFacultyCount: 6,
        priorGovtProjects: 3
      },
      emdPayment: {
        baseEmd: 35000,
        processingFee: 1800,
        totalPaid: 36800,
        paymentMethod: 'UPI',
        txnReference: 'TXN-UPI-771920831',
        paidTimestamp: '2026-07-14 14:22:10 IST',
        status: 'SUCCESS'
      },
      scrutinyDetails: {
        assignedOfficer: 'S. Rajagopalan (Directorate)',
        submissionDate: '2026-07-14',
        slaExpectedDays: 10,
        scrutinyStage: 'Scrutiny Complete & Approved',
        decisionDate: '2026-07-22',
        assignedGrade: 'A'
      }
    },
    {
      id: 'ISMS-EOI-2025-4109',
      schemeId: 'EOI-DDUGKY-2026-04',
      schemeName: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
      department: 'Ministry of Rural Development / RSLDC',
      appliedDate: '2025-11-20',
      status: 'REJECTED',
      proposalDetails: {
        targetCapacity: 200,
        sectors: ['Rural Trades'],
        proposedDistricts: ['Barmer', 'Jaisalmer'],
        proposedCentersCount: 1,
        keyFacultyCount: 3,
        priorGovtProjects: 1
      },
      emdPayment: {
        baseEmd: 25000,
        processingFee: 1500,
        totalPaid: 26500,
        paymentMethod: 'NET_BANKING',
        txnReference: 'TXN-ISMS-339182749',
        paidTimestamp: '2025-11-20 16:45:00 IST',
        status: 'SUCCESS'
      },
      scrutinyDetails: {
        assignedOfficer: 'M. S. Patil (Deputy Director)',
        submissionDate: '2025-11-20',
        slaExpectedDays: 14,
        scrutinyStage: 'Disqualified on Technical Clause 4.2',
        decisionDate: '2025-11-28',
        rejectionReason: 'Mandatory Class-A calibration certificate for telemetry sensor audit was not provided with the initial bid submission.',
        emdRefund: {
          refundAmount: 25000,
          refundTxnId: 'REFUND-HDFC-99201482',
          refundStatus: 'Processed & Credited to Original Bank Account',
          expectedCreditDays: 'Credited on 2025-12-02'
        }
      }
    }
  ];

  private historySubject = new BehaviorSubject<EoiApplication[]>(this.initialHistory);

  public history$: Observable<EoiApplication[]> = this.historySubject.asObservable();

  // Department Admin: Applicant Responses Working List
  private applicantResponsesSubject = new BehaviorSubject<ApplicantResponse[]>([
    {
      applicationId: 'ISMS-EOI-2026-9871',
      schemeId: 'EOI-MMKVY-2026-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      applicantName: 'Vikramaditya Sharma',
      organizationName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
      submissionDate: '08/09/2026',
      emdStatus: 'PAID',
      emdAmount: 50000,
      processingFee: 2500,
      currentGrade: null,
      scrutinyStatus: 'UNDER_SCRUTINY',
      remarks: '',
      proposalCapacity: 450,
      proposedDistricts: ['Jaipur Rural', 'Jodhpur', 'Kota', 'Udaipur'],
      contactEmail: 'v.sharma@apextechnical.in',
      contactMobile: '+91 98201 44520',
      registrationNumber: 'ISMS-REG-2026-8819',
      pan: 'AABCA1294F',
      gstin: '27AABCA1294F1Z8'
    },
    {
      applicationId: 'ISMS-EOI-2026-8192',
      schemeId: 'EOI-MMKVY-2026-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      applicantName: 'Dr. Ramesh Chandra',
      organizationName: 'Marwar Skill Foundation',
      submissionDate: '07/09/2026',
      emdStatus: 'PAID',
      emdAmount: 50000,
      processingFee: 2500,
      currentGrade: 'A',
      scrutinyStatus: 'APPROVED',
      remarks: 'Full compliance verified on technical infrastructure and faculty credentials.',
      proposalCapacity: 600,
      proposedDistricts: ['Jodhpur', 'Nagaur', 'Pali'],
      contactEmail: 'contact@marwarskill.org',
      contactMobile: '+91 94140 11223',
      registrationNumber: 'ISMS-REG-2026-3391',
      pan: 'AAATM4412B',
      gstin: '08AAATM4412B1ZX'
    },
    {
      applicationId: 'ISMS-EOI-2026-7241',
      schemeId: 'EOI-MMKVY-2026-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      applicantName: 'Suresh Singhania',
      organizationName: 'Singhania Vocational Institute',
      submissionDate: '05/09/2026',
      emdStatus: 'REFUNDED',
      emdAmount: 50000,
      processingFee: 2500,
      currentGrade: null,
      scrutinyStatus: 'REJECTED',
      remarks: 'Audited balance sheet FY25 missing required CA registration number.',
      proposalCapacity: 250,
      proposedDistricts: ['Bikaner', 'Churu'],
      contactEmail: 'info@singhaniainstitute.in',
      contactMobile: '+91 98290 88712',
      registrationNumber: 'ISMS-REG-2026-1104',
      pan: 'AABCS9912K',
      gstin: '08AABCS9912K1ZY'
    },
    {
      applicationId: 'ISMS-EOI-2026-6412',
      schemeId: 'EOI-SAMARTH-2026-02',
      schemeName: 'SAMARTH Skill Development Scheme',
      applicantName: 'Vikramaditya Sharma',
      organizationName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
      submissionDate: '14/07/2026',
      emdStatus: 'PAID',
      emdAmount: 35000,
      processingFee: 1800,
      currentGrade: 'A',
      scrutinyStatus: 'APPROVED',
      remarks: 'Approved for Advanced Manufacturing & Automation trades.',
      proposalCapacity: 300,
      proposedDistricts: ['Alwar', 'Bhiwadi'],
      contactEmail: 'v.sharma@apextechnical.in',
      contactMobile: '+91 98201 44520',
      registrationNumber: 'ISMS-REG-2026-8819',
      pan: 'AABCA1294F',
      gstin: '27AABCA1294F1Z8'
    }
  ]);

  public applicantResponses$: Observable<ApplicantResponse[]> = this.applicantResponsesSubject.asObservable();

  // Super Admin: Masters State
  private departmentsSubject = new BehaviorSubject<DepartmentMaster[]>([
    {
      id: 'DEPT-01',
      code: 'RSLDC',
      name: 'Rajasthan Skill and Livelihoods Development Corporation',
      nodalOfficer: 'Dr. R. K. Sharma (IAS)',
      email: 'md.rsldc@rajasthan.gov.in',
      phone: '+91 141 270 2000',
      activeTendersCount: 4
    },
    {
      id: 'DEPT-02',
      code: 'DSEE',
      name: 'Department of Skills, Employment & Entrepreneurship',
      nodalOfficer: 'Smt. Priya Mathur (Joint Secretary)',
      email: 'secy.skills@rajasthan.gov.in',
      phone: '+91 141 270 2110',
      activeTendersCount: 2
    },
    {
      id: 'DEPT-03',
      code: 'MORD',
      name: 'Ministry of Rural Development State Cell',
      nodalOfficer: 'Sh. K. L. Meena (Project Director)',
      email: 'pd.mord@rajasthan.gov.in',
      phone: '+91 141 270 3340',
      activeTendersCount: 1
    }
  ]);

  public departments$: Observable<DepartmentMaster[]> = this.departmentsSubject.asObservable();

  private schemeMastersSubject = new BehaviorSubject<SchemeMaster[]>([
    {
      id: 'SCH-01',
      schemeCode: 'MMKVY',
      name: 'Mukhya Mantri Kaushalya Vikas Yojana',
      department: 'RSLDC',
      category: 'State Funded Scheme',
      defaultEmd: 50000,
      defaultFormFee: 2500,
      targetBeneficiaries: 'Unemployed Youth (18-35 yrs)',
      status: 'Active'
    },
    {
      id: 'SCH-02',
      schemeCode: 'SAMARTH',
      name: 'SAMARTH Advanced Technical Skill Scheme',
      department: 'RSLDC',
      category: 'Special Projects',
      defaultEmd: 35000,
      defaultFormFee: 1800,
      targetBeneficiaries: 'Engineering & Diploma Graduates',
      status: 'Active'
    },
    {
      id: 'SCH-03',
      schemeCode: 'ELSTP',
      name: 'Employment Linked Skill Training Programme',
      department: 'DSEE',
      category: 'Wage Linked',
      defaultEmd: 75000,
      defaultFormFee: 3000,
      targetBeneficiaries: 'School/College Dropouts',
      status: 'Active'
    },
    {
      id: 'SCH-04',
      schemeCode: 'DDU-GKY',
      name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
      department: 'MORD',
      category: 'Centrally Sponsored',
      defaultEmd: 25000,
      defaultFormFee: 1500,
      targetBeneficiaries: 'Rural Poor Families',
      status: 'Active'
    }
  ]);

  public schemeMasters$: Observable<SchemeMaster[]> = this.schemeMastersSubject.asObservable();

  private feeStructuresSubject = new BehaviorSubject<FeeStructureMaster[]>([
    {
      id: 'FEE-01',
      categoryName: 'General Category - Mega Schemes (Turnover > 5 Cr)',
      minTurnover: '₹5,00,00,000',
      defaultFormFee: 5000,
      defaultEmd: 100000,
      exemptionApplicable: false
    },
    {
      id: 'FEE-02',
      categoryName: 'Standard State Training Partners (Turnover 1 - 5 Cr)',
      minTurnover: '₹1,00,00,000',
      defaultFormFee: 2500,
      defaultEmd: 50000,
      exemptionApplicable: true
    },
    {
      id: 'FEE-03',
      categoryName: 'MSME & Startup Training Entities (Turnover < 1 Cr)',
      minTurnover: '₹25,00,000',
      defaultFormFee: 1000,
      defaultEmd: 20000,
      exemptionApplicable: true
    }
  ]);

  public feeStructures$: Observable<FeeStructureMaster[]> = this.feeStructuresSubject.asObservable();

  // Super Admin: Dynamic Form Fields per Scheme
  private dynamicFormFieldsSubject = new BehaviorSubject<DynamicFormField[]>([
    { id: 'f-1', schemeCode: 'MMKVY', label: 'Proposed Training Capacity (Annual Candidates)', fieldType: 'number', required: true, placeholder: 'e.g. 500', order: 1 },
    { id: 'f-2', schemeCode: 'MMKVY', label: 'Primary Target Skill Sector', fieldType: 'dropdown', required: true, options: ['Industrial Automation', 'Solar Energy', 'Apparel & Garment', 'Healthcare', 'IT/ITeS'], order: 2 },
    { id: 'f-3', schemeCode: 'MMKVY', label: 'Target District Clusters in Rajasthan', fieldType: 'text', required: true, placeholder: 'e.g. Jaipur, Jodhpur, Kota', order: 3 },
    { id: 'f-4', schemeCode: 'MMKVY', label: 'Number of Dedicated Training Centers', fieldType: 'number', required: true, placeholder: 'e.g. 3', order: 4 },
    { id: 'f-5', schemeCode: 'MMKVY', label: 'Center Infrastructure Layout Drawing (PDF)', fieldType: 'file', required: true, helpText: 'Upload certified floor plan blueprint', order: 5 },
    { id: 'f-6', schemeCode: 'MMKVY', label: 'I agree to comply with RSLDC 70% mandatory placement guidelines', fieldType: 'checkbox', required: true, order: 6 },
    
    { id: 'f-7', schemeCode: 'SAMARTH', label: 'Specialized Lab Equipment Machinery List', fieldType: 'file', required: true, helpText: 'Upload equipment invoice and serial audit', order: 1 },
    { id: 'f-8', schemeCode: 'SAMARTH', label: 'Industry MoU / Apprenticeship Partner Name', fieldType: 'text', required: true, placeholder: 'e.g. Hero MotoCorp Ltd', order: 2 }
  ]);

  public dynamicFormFields$: Observable<DynamicFormField[]> = this.dynamicFormFieldsSubject.asObservable();

  // Super Admin: User Accounts Directory
  private userAccountsSubject = new BehaviorSubject<UserAccount[]>([
    { id: 'u-1', ssoId: 'applicant_rj', fullName: 'Vikramaditya Sharma', email: 'v.sharma@apextechnical.in', role: 'applicant', organizationName: 'Apex Technical & Infrastructure Solutions Pvt Ltd', status: 'Active', createdDate: '12 Jan 2026', tpGrade: 'A' },
    { id: 'u-2', ssoId: 'new_citizen_rj', fullName: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', role: 'applicant', organizationName: 'Citizen / Prospective Applicant', status: 'Active', createdDate: '08 Sep 2026' },
    { id: 'u-3', ssoId: 'dept_admin_rj', fullName: 'Dr. K. N. Verma', email: 'kn.verma@rsldc.rajasthan.gov.in', role: 'dept_admin', department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)', status: 'Active', createdDate: '01 Jan 2025' },
    { id: 'u-4', ssoId: 'super_admin_rj', fullName: 'Sunil Kumar (Joint Director, IT)', email: 'sunil.it@rajasthan.gov.in', role: 'super_admin', department: 'DoIT&C / ISMS State Headquarters', status: 'Active', createdDate: '15 Oct 2024' },
    { id: 'u-5', ssoId: 'marwar_tp_rj', fullName: 'Dr. Ramesh Chandra', email: 'contact@marwarskill.org', role: 'applicant', organizationName: 'Marwar Skill Foundation', status: 'Active', createdDate: '04 Feb 2026', tpGrade: 'A' }
  ]);

  public userAccounts$: Observable<UserAccount[]> = this.userAccountsSubject.asObservable();

  // Getters
  getProfile(): UserProfile {
    return this.userProfileSubject.getValue();
  }

  getApplicantResponses(): ApplicantResponse[] {
    return this.applicantResponsesSubject.getValue();
  }

  getCurrentDraft(): EoiApplication {
    return this.currentDraftSubject.getValue();
  }

  getDynamicFields(schemeCode: string): DynamicFormField[] {
    return this.dynamicFormFieldsSubject.getValue().filter(f => f.schemeCode === schemeCode || f.schemeCode === 'ALL');
  }

  private saveToStorage(key: string, data: any): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {}
    }
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      } catch (e) {}
    }
    return fallback;
  }

  constructor() {
    const savedProfile = this.loadFromStorage<UserProfile | null>('isms_user_profile', null);
    if (savedProfile) {
      this.userProfileSubject.next(savedProfile);
    }
    const savedHistory = this.loadFromStorage<EoiApplication[] | null>('isms_app_history', null);
    if (savedHistory && savedHistory.length > 0) {
      this.historySubject.next(savedHistory);
    }
    const savedDraft = this.loadFromStorage<EoiApplication | null>('isms_current_draft', null);
    if (savedDraft) {
      this.currentDraftSubject.next(savedDraft);
    }
  }

  // Mutations
  updateProfile(profile: Partial<UserProfile>): void {
    const current = this.userProfileSubject.getValue();
    const updated = { ...current, ...profile };
    this.userProfileSubject.next(updated);
    this.saveToStorage('isms_user_profile', updated);
  }

  // Role & State Switchers
  loginAs(role: 'applicant' | 'dept_admin' | 'super_admin', userState: 'new' | 'existing', ssoId: string, department?: string): void {
    const current = this.userProfileSubject.getValue();
    this.userProfileSubject.next({
      ...current,
      ssoId,
      role,
      userState,
      isRegistered: userState === 'existing',
      department: department || (role === 'dept_admin' ? 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)' : current.department)
    });
  }

  resetToNewCitizen(ssoId: string = 'new_citizen_rj'): void {
    this.loginAs('applicant', 'new', ssoId);
    this.historySubject.next([]);
    this.updateProfile({
      registrationNumber: '',
      isRegistered: false,
      isApprovedTp: false,
      tpGrade: null,
      personal: {
        fullName: 'Citizen Applicant',
        designation: '',
        dob: '',
        identityType: '',
        identityNumber: '',
        email: 'citizen@rajasthan.in',
        mobile: '+91 98290 12345',
        isOtpVerified: true
      },
      organization: {
        name: '',
        entityType: '',
        incorporationDate: '',
        pan: '',
        gstin: '',
        registeredAddress: '',
        state: '',
        pincode: '',
        website: ''
      },
      bankDetails: {
        accountHolderName: '',
        bankName: '',
        branchName: '',
        accountNumber: '',
        ifscCode: '',
        accountType: '',
        isPfmsVerified: false
      },
      documents: []
    });
  }

  resetToNewUser(ssoId: string = 'new_user_rj'): void {
    this.loginAs('applicant', 'new', ssoId);
    this.historySubject.next([]);
    this.updateProfile({
      registrationNumber: '',
      isRegistered: false,
      isApprovedTp: false,
      tpGrade: null,
      documents: []
    });
  }

  resetToRegisteredApplicant(ssoId: string = 'applicant_rj'): void {
    this.loginAs('applicant', 'existing', ssoId);
    this.historySubject.next(this.initialHistory);
    this.updateProfile({
      registrationNumber: 'ISMS-REG-2026-8819',
      isRegistered: true,
      isApprovedTp: false,
      tpGrade: null,
      personal: {
        fullName: 'Vikramaditya Sharma',
        designation: 'Managing Director & Authorized Signatory',
        dob: '1984-06-15',
        identityType: 'Aadhaar (UIDAI)',
        identityNumber: 'XXXX-XXXX-4812',
        email: 'v.sharma@apextechnical.in',
        mobile: '+91 98201 44520',
        isOtpVerified: true
      },
      organization: {
        name: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
        entityType: 'Private Limited Company (Registered under Companies Act 2013)',
        incorporationDate: '2015-11-04',
        pan: 'AABCA1294F',
        gstin: '27AABCA1294F1Z8',
        registeredAddress: 'Unit 402, Bharat Technology Hub, Sector 18, MIDC Industrial Area',
        state: 'Maharashtra',
        pincode: '400705',
        website: 'www.apextechnical.in'
      },
      bankDetails: {
        accountHolderName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
        bankName: 'State Bank of India',
        branchName: 'Commercial Branch, M.I. Road, Jaipur',
        accountNumber: '39480124891',
        ifscCode: 'SBIN0004123',
        accountType: 'Current Account',
        isPfmsVerified: true
      },
      documents: [
        { id: 'doc-1', name: 'Certificate_of_Incorporation_Apex.pdf', type: 'PDF', size: '1.4 MB', uploadDate: '12 Jan 2026' },
        { id: 'doc-2', name: 'PAN_Card_Apex_Technical.pdf', type: 'PDF', size: '420 KB', uploadDate: '12 Jan 2026' },
        { id: 'doc-3', name: 'GST_Registration_Certificate.pdf', type: 'PDF', size: '680 KB', uploadDate: '12 Jan 2026' },
        { id: 'doc-4', name: 'Audited_Balance_Sheet_FY24_25.pdf', type: 'PDF', size: '3.8 MB', uploadDate: '12 Jan 2026' }
      ]
    });
  }

  resetToApprovedTp(grade: 'A' | 'B' | 'C' = 'A', ssoId: string = 'tp_partner_rj'): void {
    this.loginAs('applicant', 'existing', ssoId);
    this.historySubject.next(this.initialHistory);
    this.updateProfile({
      registrationNumber: 'ISMS-REG-2026-8819',
      isRegistered: true,
      isApprovedTp: true,
      tpGrade: grade,
      tpId: `TP-${grade}-2026-4412`
    });
  }

  resetToDeptAdmin(ssoId: string = 'dept_admin_rj'): void {
    this.loginAs('dept_admin', 'existing', ssoId, 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)');
    this.updateProfile({
      personal: {
        fullName: 'Dr. K. N. Verma',
        designation: 'Senior Scrutiny Officer & Deputy Director',
        dob: '1976-08-20',
        identityType: 'Government Official ID',
        identityNumber: 'RAJ-GOV-9921',
        email: 'kn.verma@rsldc.rajasthan.gov.in',
        mobile: '+91 94140 88219',
        isOtpVerified: true
      }
    });
  }

  resetToSuperAdmin(ssoId: string = 'super_admin_rj'): void {
    this.loginAs('super_admin', 'existing', ssoId, 'DoIT&C / ISMS State Headquarters');
    this.updateProfile({
      personal: {
        fullName: 'Sunil Kumar (Joint Director, IT)',
        designation: 'State System Administrator',
        dob: '1974-12-10',
        identityType: 'National Informatics ID',
        identityNumber: 'NIC-RAJ-001',
        email: 'sunil.it@rajasthan.gov.in',
        mobile: '+91 94133 00001',
        isOtpVerified: true
      }
    });
  }

  // Scrutiny Actions by Dept Admin
  updateScrutinyDecision(
    applicationId: string, 
    decision: {
      status: 'APPROVED' | 'REJECTED';
      grade?: 'A' | 'B' | 'C';
      remarks: string;
      attachedScrutinyNote?: string;
    }
  ): void {
    const responses = this.applicantResponsesSubject.getValue();
    const index = responses.findIndex(r => r.applicationId === applicationId);
    if (index !== -1) {
      const updated = [...responses];
      updated[index] = {
        ...updated[index],
        scrutinyStatus: decision.status,
        currentGrade: decision.grade || null,
        remarks: decision.remarks,
        attachedScrutinyNote: decision.attachedScrutinyNote,
        emdStatus: decision.status === 'REJECTED' ? 'REFUNDED' : 'PAID'
      };
      this.applicantResponsesSubject.next(updated);
    }

    // Also update current draft if it matches
    const draft = this.currentDraftSubject.getValue();
    if (draft.id === applicationId) {
      this.currentDraftSubject.next({
        ...draft,
        status: decision.status,
        scrutinyDetails: {
          ...draft.scrutinyDetails!,
          assignedGrade: decision.grade,
          rejectionReason: decision.remarks,
          scrutinyStage: decision.status === 'APPROVED' ? 'Scrutiny Complete & Approved' : 'Scrutiny Rejected',
          decisionDate: '2026-09-08',
          emdRefund: decision.status === 'REJECTED' ? {
            refundAmount: draft.emdPayment.baseEmd,
            refundTxnId: 'REFUND-HDFC-99201482',
            refundStatus: 'Processed & Credited to Original Account',
            expectedCreditDays: 'Completed on 2026-09-08'
          } : undefined
        }
      });
    }
  }

  // Dynamic Form Builder methods (Super Admin)
  addDynamicFormField(field: Omit<DynamicFormField, 'id'>): void {
    const fields = this.dynamicFormFieldsSubject.getValue();
    const newField: DynamicFormField = {
      ...field,
      id: `f-${Date.now()}`
    };
    this.dynamicFormFieldsSubject.next([...fields, newField]);
  }

  removeDynamicFormField(id: string): void {
    const fields = this.dynamicFormFieldsSubject.getValue();
    this.dynamicFormFieldsSubject.next(fields.filter(f => f.id !== id));
  }

  // Masters CRUD (Super Admin)
  addDepartment(dept: Omit<DepartmentMaster, 'id'>): void {
    const depts = this.departmentsSubject.getValue();
    this.departmentsSubject.next([...depts, { ...dept, id: `DEPT-0${depts.length + 1}` }]);
  }

  addSchemeMaster(sch: Omit<SchemeMaster, 'id'>): void {
    const schs = this.schemeMastersSubject.getValue();
    this.schemeMastersSubject.next([...schs, { ...sch, id: `SCH-0${schs.length + 1}` }]);
  }

  addFeeStructure(fee: Omit<FeeStructureMaster, 'id'>): void {
    const fees = this.feeStructuresSubject.getValue();
    this.feeStructuresSubject.next([...fees, { ...fee, id: `FEE-0${fees.length + 1}` }]);
  }

  // Missing methods for applicant wizard & status tracker
  getSchemeById(id: string): Scheme | undefined {
    return this.schemesSubject.getValue().find(s => s.id === id || s.schemeCode === id);
  }

  startApplicationForScheme(scheme: Scheme): void {
    const draft = this.currentDraftSubject.getValue();
    this.currentDraftSubject.next({
      ...draft,
      schemeId: scheme.id,
      schemeName: scheme.name,
      department: scheme.department,
      emdPayment: {
        ...draft.emdPayment,
        baseEmd: scheme.emdAmount,
        processingFee: scheme.processingFee,
        totalPaid: scheme.emdAmount + scheme.processingFee
      }
    });
  }

  updateApplicationProposal(proposal: any): void {
    const draft = this.currentDraftSubject.getValue();
    this.currentDraftSubject.next({
      ...draft,
      proposalDetails: {
        ...draft.proposalDetails,
        ...proposal
      }
    });
  }

  recordEmdPayment(method: any): void {
    const draft = this.currentDraftSubject.getValue();
    this.currentDraftSubject.next({
      ...draft,
      emdPayment: {
        ...draft.emdPayment,
        paymentMethod: method,
        status: 'SUCCESS',
        txnReference: 'TXN-ISMS-' + Math.floor(100000000 + Math.random() * 900000000),
        paidTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' IST'
      }
    });
  }

  finalizeSubmission(): EoiApplication {
    const draft = this.currentDraftSubject.getValue();
    const finalized: EoiApplication = {
      ...draft,
      status: 'SUBMITTED',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    this.currentDraftSubject.next(finalized);
    this.saveToStorage('isms_current_draft', finalized);
    
    // Add to history
    const history = this.historySubject.getValue();
    const newHistory = [finalized, ...history];
    this.historySubject.next(newHistory);
    this.saveToStorage('isms_app_history', newHistory);
    return finalized;
  }

  setTpStatus(approved: boolean, grade: 'A' | 'B' | 'C' = 'A'): void {
    this.updateProfile({
      isApprovedTp: approved,
      tpGrade: approved ? grade : null,
      tpId: approved ? `TP-${grade}-2026-${Math.floor(1000 + Math.random() * 9000)}` : null
    });
  }

  addUserAccount(account: Omit<UserAccount, 'id'>): void {
    const users = this.userAccountsSubject.getValue();
    this.userAccountsSubject.next([...users, { ...account, id: `u-${Date.now()}` }]);
  }

  /** Synchronous snapshot of current application history (for tab counts etc.) */
  getHistory(): EoiApplication[] {
    return this.historySubject.getValue();
  }

  /** Apply Admin evaluation decision (Grade, Category, Committee signed document, Rejection remarks) */
  applyAdminDecision(appId: string, status: 'APPROVED' | 'REJECTED' | 'UNDER_SCRUTINY', details: {
    grade?: string;
    category?: string;
    remarks?: string;
    committeeAttachment?: CommitteeApprovalDocument;
    currentStageNumber?: number;
    scrutinyStageName?: string;
  }): void {
    const history = this.historySubject.getValue();
    const updatedHistory = history.map(app => {
      // Matches directly, by scheme or fallback to first application if testing
      if (app.id === appId || app.id.includes(appId) || appId.includes(app.id) || history.length === 1) {
        return {
          ...app,
          status: status,
          scrutinyDetails: {
            assignedOfficer: app.scrutinyDetails?.assignedOfficer || 'Dr. K. N. Verma (Senior Scrutiny Officer, RSLDC)',
            submissionDate: app.scrutinyDetails?.submissionDate || app.appliedDate,
            slaExpectedDays: app.scrutinyDetails?.slaExpectedDays || 7,
            scrutinyStage: details.scrutinyStageName || (status === 'APPROVED' ? 'Stage 4: Empanelled & Approved' : status === 'REJECTED' ? 'Disqualified / Criteria Ineligible' : 'Stage 2: Technical Committee Evaluation'),
            assignedGrade: details.grade || app.scrutinyDetails?.assignedGrade,
            assignedCategory: details.category || app.scrutinyDetails?.assignedCategory,
            rejectionReason: status === 'REJECTED' ? details.remarks : undefined,
            adminRemarks: details.remarks,
            committeeAttachment: details.committeeAttachment,
            currentStageNumber: details.currentStageNumber || (status === 'APPROVED' ? 4 : status === 'REJECTED' ? 2 : 2),
            emdRefund: status === 'REJECTED' ? {
              refundAmount: app.emdPayment.baseEmd || 50000,
              refundTxnId: 'REFUND-TREASURY-' + Math.floor(10000000 + Math.random() * 90000000),
              refundStatus: 'Processed 100% Refund & Credited to Original Bank Account',
              expectedCreditDays: 'Completed on ' + new Date().toISOString().split('T')[0]
            } : app.scrutinyDetails?.emdRefund
          }
        };
      }
      return app;
    });

    this.historySubject.next(updatedHistory);
    this.saveToStorage('isms_app_history', updatedHistory);

    // Also update currentDraft
    const current = this.currentDraftSubject.getValue();
    if (current) {
      const updatedDraft = {
        ...current,
        status: status,
        scrutinyDetails: {
          assignedOfficer: current.scrutinyDetails?.assignedOfficer || 'Dr. K. N. Verma (Senior Scrutiny Officer, RSLDC)',
          submissionDate: current.scrutinyDetails?.submissionDate || current.appliedDate,
          slaExpectedDays: current.scrutinyDetails?.slaExpectedDays || 7,
          scrutinyStage: details.scrutinyStageName || (status === 'APPROVED' ? 'Stage 4: Empanelled & Approved' : status === 'REJECTED' ? 'Disqualified / Criteria Ineligible' : 'Stage 2: Technical Committee Evaluation'),
          assignedGrade: details.grade || current.scrutinyDetails?.assignedGrade,
          assignedCategory: details.category || current.scrutinyDetails?.assignedCategory,
          rejectionReason: status === 'REJECTED' ? details.remarks : undefined,
          adminRemarks: details.remarks,
          committeeAttachment: details.committeeAttachment,
          currentStageNumber: details.currentStageNumber || (status === 'APPROVED' ? 4 : status === 'REJECTED' ? 2 : 2),
          emdRefund: status === 'REJECTED' ? {
            refundAmount: current.emdPayment.baseEmd || 50000,
            refundTxnId: 'REFUND-TREASURY-' + Math.floor(10000000 + Math.random() * 90000000),
            refundStatus: 'Processed 100% Refund & Credited to Original Bank Account',
            expectedCreditDays: 'Completed on ' + new Date().toISOString().split('T')[0]
          } : current.scrutinyDetails?.emdRefund
        }
      };
      this.currentDraftSubject.next(updatedDraft);
      this.saveToStorage('isms_current_draft', updatedDraft);
    }

    // If approved, update user profile as Approved TP with the grade
    if (status === 'APPROVED') {
      const g = (details.grade?.includes('A') ? 'A' : details.grade?.includes('B') ? 'B' : 'C') as 'A' | 'B' | 'C';
      this.setTpStatus(true, g);
    }
  }
}
