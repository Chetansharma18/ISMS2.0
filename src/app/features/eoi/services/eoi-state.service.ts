import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class EoiStateService {

  // Initial Schemes matching Screenshot 1
  private initialSchemes: Scheme[] = [
    {
      id: 'MMKVY-01',
      refNo: 'RSLDC/EOI/2026/MMKVY-01',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-RAJKVIK',
      category: 'Category I: RAJKVIK',
      dateOfOpening: '31-Aug-2026 01:00 PM',
      dateOfClosing: '05-Oct-2026 02:00 PM',
      status: 'Closed',
      responseCount: 4,
      issuingAuthority: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdFee: '₹50,000',
      processFee: '₹2,000',
      description: 'Expression of Interest for Empanelment of Training Partners (TPs) to impart skill training under MMKVY (Category I: RAJKVIK) across Rajasthan districts with guaranteed minimum 70% wage & corporate placement support for eligible youth.'
    },
    {
      id: 'SAMARTH-02',
      refNo: 'RSLDC/EOI/2026/SAMARTH-02',
      schemeTitle: 'SAMARTH Skill Development Scheme',
      code: 'SAMARTH-SPEC',
      category: '-',
      dateOfOpening: '01-Sep-2026 11:00 AM',
      dateOfClosing: '15-Oct-2026 03:00 PM',
      status: 'Closed',
      responseCount: 4,
      issuingAuthority: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdFee: '₹75,000',
      processFee: '₹2,500',
      description: 'Skill development scheme focused on specialized technical trades, artisan empowerment, and industrial fabrication certifications for youth in marginalized communities.'
    },
    {
      id: 'MMKVY-03',
      refNo: 'RSLDC/EOI/2026/MMKVY-03',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-SAMARTH',
      category: 'Category III: SAMARTH',
      dateOfOpening: '03-Sep-2026 02:30 PM',
      dateOfClosing: '20-Oct-2026 05:00 PM',
      status: 'Open',
      responseCount: 19,
      issuingAuthority: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdFee: '₹50,000',
      processFee: '₹2,000',
      description: 'Skill empanelment proposal for Category III target segments across designated tribal and scheduled caste sub-plan tehsils in Rajasthan.'
    },
    {
      id: 'ELSTP-01',
      refNo: 'RSLDC/EOI/2026/ELSTP-01',
      schemeTitle: 'Employment Linked Skill Training Programme (ELSTP)',
      code: 'ELSTP-PHASE4',
      category: '-',
      dateOfOpening: '25-Aug-2026 04:30 PM',
      dateOfClosing: '17-Sep-2026 11:00 AM',
      status: 'Open',
      responseCount: 16,
      issuingAuthority: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      emdFee: '₹1,00,000',
      processFee: '₹3,000',
      description: 'Employment linked skill training initiative focusing on high-demand manufacturing and renewable energy service technician roles.'
    },
    {
      id: 'RYSY-02',
      refNo: 'DSEE/EOI/2026/RYSY-02',
      schemeTitle: 'Rajasthan Yuva Sambal Yojana (RYSY)',
      code: 'RYSY-SAKSHM',
      category: 'Category II: SAKSHM',
      dateOfOpening: '08-Sep-2026 01:00 PM',
      dateOfClosing: '28-Oct-2026 03:00 PM',
      status: 'Open',
      responseCount: 11,
      issuingAuthority: 'Department of Skills, Employment & Entrepreneurship',
      emdFee: '₹40,000',
      processFee: '₹1,500',
      description: 'Skill enhancement and bridge apprenticeship program under the statutory Yuva Sambal allowance framework for eligible graduates.'
    },
    {
      id: 'DDUGKY-03',
      refNo: 'MORD/EOI/2026/DDUGKY-03',
      schemeTitle: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
      code: 'DDU-GKY-RAJ',
      category: '-',
      dateOfOpening: '25-Aug-2026 04:30 PM',
      dateOfClosing: '17-Sep-2026 11:00 AM',
      status: 'Open',
      responseCount: 14,
      issuingAuthority: 'Ministry of Rural Development & RSLDC State Hub',
      emdFee: '₹60,000',
      processFee: '₹2,000',
      description: 'Rural youth skill empanelment initiative for national livelihood mission and residential placement tied projects.'
    }
  ];

  // Initial 4 Applicant Responses matching dummy specification (Company 1, Company 2, Company 3, Company 4)
  private initialResponses: ApplicantResponse[] = [
    {
      id: 'APP-004661',
      anonymousLabel: 'Company 1',
      actualLegalName: 'Company 1',
      regNumber: 'ISMS-REG-2026-8819',
      schemeId: 'MMKVY-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      eoiRefNo: 'RSLDC/EOI/2026/MMKVY-01',
      submissionDate: '08/09/2026 14:30 PM',
      status: 'UNDER_SCRUTINY',
      statusDisplay: 'Pending Review',
      emdFee: 50000,
      emdStatus: 'PAID',
      processingFee: 2000,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 1',
        tradeName: 'Company 1 Trade',
        entityType: 'Company registered under Companies Act, 2013',
        registrationNumber: 'U74999DL2018PTC334512',
        dateOfRegistration: '14/03/2018',
        stateOfRegistration: 'DELHI',
        panNumber: 'AAECD8566H',
        gstin: '07AAECD8566H1ZC',
        turnover: '₹12,03,35,010',
        registeredAddress: '123, Block A, Industrial Area, Sector 1, Jaipur, Rajasthan 302001',
        operationalAddress: '123, Block A, Industrial Area, Sector 1, Jaipur, Rajasthan 302001',
        website: 'company1.com',
        email: 'info@company1.com',
        contactNumber: '0141-2705600'
      },

      authorizedSignatory: {
        name: 'SUMAN GUPTA',
        designation: 'Director',
        email: 'compliance@company1.com',
        contactNumber: '9968009648',
        residenceAddress: '123, Sector 1, Jaipur, Rajasthan',
        state: 'Rajasthan',
        pan: 'BGPPS4512K',
        aadhaarNo: 'XXXX-XXXX-4512',
        typeIdProof: 'Aadhaar Card',
        idNo: 'XXXX-XXXX-4512',
        bhamashahNo: 'Not Provided',
        voterIdNo: 'RJP1245789',
        passportNo: 'Z8945123',
        serviceTaxNo: 'Not Provided'
      },

      bankDetails: {
        bankName: 'State Bank of India',
        branchName: 'Specialized Commercial Branch, Jaipur',
        accountHolderName: 'Company 1',
        accountNumber: '38920194821',
        ifscCode: 'SBIN0004128',
        accountType: 'Current Account'
      },

      trainingCentres: [
        {
          district: 'Alwar',
          centreName: 'Company 1 Skill Centre Alwar',
          classrooms: 3,
          practicalRooms: 2,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0144-2345678',
          fullAddress: '123, Industrial Area, Alwar, Rajasthan'
        },
        {
          district: 'Jaipur',
          centreName: 'Company 1 Skill Academy Jaipur',
          classrooms: 4,
          practicalRooms: 3,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0141-4098765',
          fullAddress: '456, Industrial Area, Mansarovar, Jaipur, Rajasthan'
        },
        {
          district: 'Udaipur',
          centreName: 'Company 1 Skill Hub Udaipur',
          classrooms: 3,
          practicalRooms: 2,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0294-2456789',
          fullAddress: '789, Industrial Area, Aayad, Udaipur, Rajasthan'
        },
        {
          district: 'Sikar',
          centreName: 'Company 1 Skill Centre Sikar',
          classrooms: 3,
          practicalRooms: 2,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '01572-234510',
          fullAddress: '101, Industrial Area, Sikar, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '9,21,00,536', skillTurnover: '9,21,00,536' },
        { year: '2022 - 2023', totalTurnover: '2,39,94,320', skillTurnover: '2,39,94,320' },
        { year: '2023 - 2024', totalTurnover: '42,40,154', skillTurnover: '42,40,154' }
      ],

      placementTrackRecord: [
        { sector: 'Healthcare & Paramedical', year: '2022 - 2023', trained: 570, placed: 476, proofDetails: '476 verified EPF/ESI slips' },
        { sector: 'Garment Making & Apparel', year: '2023 - 2024', trained: 150, placed: 105, proofDetails: '105 offer letters attached' },
        { sector: 'Handicraft & Local Resource Based Skills', year: '2024 - 2025', trained: 810, placed: 441, proofDetails: '441 artisan wage certificates' }
      ],

      annualActionPlan: [
        { district: 'Khairthal-Tijara', proposedSDCs: 2, location: 'KHAIRTHAL - TIJARA', sectors: 'Handicraft & Local Resource Skills', courses: 'Assistant Hardware Tech, Receptionist DEO', residential: 'Both', batches: 10 },
        { district: 'Kotputli-Behror', proposedSDCs: 2, location: 'KOTPUTLI - BEHROR', sectors: 'IT-ITeS & Multi-Skills', courses: 'Hardware cum Networking, Folk Art Music', residential: 'Both', batches: 10 },
        { district: 'Salumber', proposedSDCs: 2, location: 'SALUMBAR', sectors: 'Handicraft & Traditional Art', courses: 'Phad Painting, Traditional Embroidery', residential: 'Both', batches: 10 }
      ],

      uploadedDocuments: [
        { id: 'doc-1', title: 'Organisation Registration Certificate', fileSize: '1.4 MB PDF', category: 'Statutory', verified: true },
        { id: 'doc-2', title: 'Organisation PAN Card', fileSize: '850 KB PDF', category: 'Taxation', verified: true },
        { id: 'doc-3', title: 'GST Registration Certificate', fileSize: '1.1 MB PDF', category: 'Taxation', verified: true },
        { id: 'doc-4', title: 'Audited Balance Sheet / Turnover Certificate', fileSize: '3.8 MB PDF · CA Certified', category: 'Financial', verified: true },
        { id: 'doc-5', title: 'Board Resolution / Power of Attorney', fileSize: '2.1 MB PDF', category: 'Legal', verified: true },
        { id: 'doc-6', title: 'NSDC Partner Certificate', fileSize: '1.9 MB PDF', category: 'Affiliation', verified: true },
        { id: 'doc-7', title: 'Additional Supporting Document', fileSize: '4.5 MB PDF', category: 'Annexures', verified: true }
      ]
    },

    {
      id: 'APP-004662',
      anonymousLabel: 'Company 2',
      actualLegalName: 'Company 2',
      regNumber: 'ISMS-REG-2026-3391',
      schemeId: 'MMKVY-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      eoiRefNo: 'RSLDC/EOI/2026/MMKVY-01',
      submissionDate: '07/09/2026 09:15 AM',
      status: 'APPROVED',
      statusDisplay: 'Accepted',
      emdFee: 50000,
      emdStatus: 'PAID',
      processingFee: 2000,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 2',
        tradeName: 'Company 2 Trade',
        entityType: 'Registered Society under Rajasthan Societies Act',
        registrationNumber: 'RS-JOD-2016-891',
        dateOfRegistration: '11/08/2016',
        stateOfRegistration: 'RAJASTHAN',
        panNumber: 'AAATM1122K',
        gstin: '08AAATM1122K1Z9',
        turnover: '₹8,45,00,000',
        registeredAddress: '456, Block B, Industrial Area, Sector 2, Jodhpur, Rajasthan 342001',
        operationalAddress: '456, Block B, Industrial Area, Sector 2, Jodhpur, Rajasthan 342001',
        website: 'company2.com',
        email: 'info@company2.com',
        contactNumber: '0291-2741000'
      },

      authorizedSignatory: {
        name: 'RAJENDRA SINGH RATHORE',
        designation: 'Managing Trustee',
        email: 'trustee@company2.com',
        contactNumber: '9414123456',
        residenceAddress: '456, Sector 2, Jodhpur, Rajasthan',
        state: 'Rajasthan',
        pan: 'AETPR9912L',
        aadhaarNo: 'XXXX-XXXX-9912',
        typeIdProof: 'Aadhaar Card',
        idNo: 'XXXX-XXXX-9912',
        bhamashahNo: 'BHM-881273',
        voterIdNo: 'JOD9912345',
        passportNo: 'Not Provided',
        serviceTaxNo: 'Not Provided'
      },

      bankDetails: {
        bankName: 'Punjab National Bank',
        branchName: 'Heavy Industrial Area Branch, Jodhpur',
        accountHolderName: 'Company 2',
        accountNumber: '1129002100045812',
        ifscCode: 'PUNB0112900',
        accountType: 'Current Account'
      },

      trainingCentres: [
        {
          district: 'Jodhpur',
          centreName: 'Company 2 Skill Centre Jodhpur',
          classrooms: 4,
          practicalRooms: 3,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0291-2741001',
          fullAddress: '456, Industrial Area, Jodhpur, Rajasthan'
        },
        {
          district: 'Pali',
          centreName: 'Company 2 Skill Centre Pali',
          classrooms: 3,
          practicalRooms: 2,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '02932-224455',
          fullAddress: '789, Industrial Area, Pali, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '6,50,00,000', skillTurnover: '6,10,00,000' },
        { year: '2022 - 2023', totalTurnover: '7,80,00,000', skillTurnover: '7,50,00,000' },
        { year: '2023 - 2024', totalTurnover: '8,45,00,000', skillTurnover: '8,20,00,000' }
      ],

      placementTrackRecord: [
        { sector: 'Textile & Handloom', year: '2022 - 2023', trained: 450, placed: 390, proofDetails: '390 verified employer salary credits' },
        { sector: 'Solar PV Installation', year: '2023 - 2024', trained: 300, placed: 260, proofDetails: '260 appointment letters attached' }
      ],

      annualActionPlan: [
        { district: 'Jodhpur', proposedSDCs: 2, location: 'MANDORE & BORANADA', sectors: 'Textile & Solar Technician', courses: 'Solar PV Installer, Sewing Machine Operator', residential: 'Non-Residential', batches: 8 },
        { district: 'Pali', proposedSDCs: 1, location: 'PALI INDUSTRIAL BELT', sectors: 'Textile Processing', courses: 'Dyeing & Printing Operator', residential: 'Non-Residential', batches: 4 }
      ],

      uploadedDocuments: [
        { id: 'doc-201', title: 'Organisation Registration Certificate', fileSize: '1.2 MB PDF', category: 'Statutory', verified: true },
        { id: 'doc-202', title: 'Organisation PAN Card', fileSize: '650 KB PDF', category: 'Taxation', verified: true },
        { id: 'doc-203', title: 'GST Registration Certificate', fileSize: '980 KB PDF', category: 'Taxation', verified: true },
        { id: 'doc-204', title: 'Audited Balance Sheet / Turnover Certificate', fileSize: '2.9 MB PDF · CA Certified', category: 'Financial', verified: true },
        { id: 'doc-205', title: 'Board Resolution / Power of Attorney', fileSize: '1.5 MB PDF', category: 'Legal', verified: true },
        { id: 'doc-206', title: 'NSDC Partner Certificate', fileSize: '1.4 MB PDF', category: 'Affiliation', verified: true },
        { id: 'doc-207', title: 'Additional Supporting Document', fileSize: '3.1 MB PDF', category: 'Annexures', verified: true }
      ],

      scrutinyDetails: {
        technicalScore: 88,
        grade: 'Grade A',
        remarks: 'All statutory parameters, training infrastructure, and past audited placement thresholds meet Category I empanelment guidelines.',
        scrutinyOfficer: 'Shri R. K. Sharma (Joint Director, RSLDC)',
        decisionTimestamp: '10/09/2026 16:40 PM',
        approvalDocument: {
          id: 'RES-MMKVY-2026-088',
          documentName: 'Committee_Empanelment_Resolution_088.pdf',
          uploadDate: '10/09/2026',
          fileSize: '3.4 MB',
          signatories: [
            { name: 'Dr. Alok Verma, IAS', designation: 'Managing Director, RSLDC', signedAt: '10/09/2026 15:30', verified: true },
            { name: 'Shri R. K. Sharma', designation: 'Joint Director (Scrutiny In-charge)', signedAt: '10/09/2026 15:45', verified: true },
            { name: 'Smt. Neeta Mathur', designation: 'Senior Accounts Officer (Finance)', signedAt: '10/09/2026 16:00', verified: true }
          ]
        }
      }
    },

    {
      id: 'APP-004663',
      anonymousLabel: 'Company 3',
      actualLegalName: 'Company 3',
      regNumber: 'ISMS-REG-2026-1104',
      schemeId: 'MMKVY-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      eoiRefNo: 'RSLDC/EOI/2026/MMKVY-01',
      submissionDate: '05/09/2026 16:45 PM',
      status: 'REJECTED',
      statusDisplay: 'Rejected',
      emdFee: 50000,
      emdStatus: 'REFUNDED',
      processingFee: 2000,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 3',
        tradeName: 'Company 3 Trade',
        entityType: 'Trust registered under Indian Trusts Act',
        registrationNumber: 'TR-UDR-2019-440',
        dateOfRegistration: '22/05/2019',
        stateOfRegistration: 'RAJASTHAN',
        panNumber: 'AACTS3344M',
        gstin: '08AACTS3344M1Z2',
        turnover: '₹1,20,00,000',
        registeredAddress: '789, Block C, Industrial Area, Sector 3, Udaipur, Rajasthan 313001',
        operationalAddress: '789, Block C, Industrial Area, Sector 3, Udaipur, Rajasthan 313001',
        website: 'company3.com',
        email: 'info@company3.com',
        contactNumber: '0294-2567890'
      },

      authorizedSignatory: {
        name: 'MANISH SINGHANIA',
        designation: 'Chief Trustee',
        email: 'contact@company3.com',
        contactNumber: '9829012345',
        residenceAddress: '789, Sector 3, Udaipur, Rajasthan',
        state: 'Rajasthan',
        pan: 'AFGPS1123P',
        aadhaarNo: 'XXXX-XXXX-1123',
        typeIdProof: 'Aadhaar Card',
        idNo: 'XXXX-XXXX-1123',
        bhamashahNo: 'Not Provided',
        voterIdNo: 'UDR1123456',
        passportNo: 'Not Provided',
        serviceTaxNo: 'Not Provided'
      },

      bankDetails: {
        bankName: 'HDFC Bank',
        branchName: 'Chetak Circle Branch, Udaipur',
        accountHolderName: 'Company 3',
        accountNumber: '50200034891240',
        ifscCode: 'HDFC0000281',
        accountType: 'Current Account'
      },

      trainingCentres: [
        {
          district: 'Udaipur',
          centreName: 'Company 3 Skill Centre Udaipur',
          classrooms: 1,
          practicalRooms: 1,
          separateWashrooms: false,
          labInfrastructure: false,
          telephone: '0294-2567891',
          fullAddress: '789, Industrial Area, Udaipur, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '80,00,000', skillTurnover: '60,00,000' },
        { year: '2022 - 2023', totalTurnover: '95,00,000', skillTurnover: '75,00,000' },
        { year: '2023 - 2024', totalTurnover: '1,20,00,000', skillTurnover: '90,00,000' }
      ],

      placementTrackRecord: [
        { sector: 'Data Entry & Retail', year: '2023 - 2024', trained: 120, placed: 42, proofDetails: 'Incomplete placement documentation' }
      ],

      annualActionPlan: [
        { district: 'Udaipur', proposedSDCs: 1, location: 'UDAIPUR CITY', sectors: 'IT-ITeS', courses: 'Data Entry Operator', residential: 'Non-Residential', batches: 4 }
      ],

      uploadedDocuments: [
        { id: 'doc-301', title: 'Organisation Registration Certificate', fileSize: '1.1 MB PDF', category: 'Statutory', verified: true },
        { id: 'doc-302', title: 'Organisation PAN Card', fileSize: '520 KB PDF', category: 'Taxation', verified: true },
        { id: 'doc-303', title: 'GST Registration Certificate', fileSize: '810 KB PDF', category: 'Taxation', verified: true },
        { id: 'doc-304', title: 'Audited Balance Sheet / Turnover Certificate', fileSize: '1.6 MB PDF · CA Certified', category: 'Financial', verified: true },
        { id: 'doc-305', title: 'Board Resolution / Power of Attorney', fileSize: '890 KB PDF', category: 'Legal', verified: true },
        { id: 'doc-306', title: 'NSDC Partner Certificate', fileSize: '1.0 MB PDF', category: 'Affiliation', verified: true },
        { id: 'doc-307', title: 'Additional Supporting Document', fileSize: '2.1 MB PDF', category: 'Annexures', verified: true }
      ],

      scrutinyDetails: {
        technicalScore: 38,
        grade: 'Grade E',
        disqualificationReason: 'Deficiency in Audited Turnover (< ₹10 Cr)',
        remarks: 'Entity fails to satisfy mandatory financial turnover criteria (minimum ₹10 Crore required under MMKVY Cat I). Centre lacks dedicated practical lab and separate washroom infrastructure.',
        scrutinyOfficer: 'Shri R. K. Sharma (Joint Director, RSLDC)',
        decisionTimestamp: '09/09/2026 11:20 AM'
      }
    },

    {
      id: 'APP-004664',
      anonymousLabel: 'Company 4',
      actualLegalName: 'Company 4',
      regNumber: 'ISMS-REG-2026-9871',
      schemeId: 'MMKVY-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      eoiRefNo: 'RSLDC/EOI/2026/MMKVY-01',
      submissionDate: '14/07/2026 11:20 AM',
      status: 'APPROVED',
      statusDisplay: 'Accepted',
      emdFee: 50000,
      emdStatus: 'PAID',
      processingFee: 2000,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 4',
        tradeName: 'Company 4 Trade',
        entityType: 'Company registered under Companies Act, 1956',
        registrationNumber: '07AAECD8566H1ZC',
        dateOfRegistration: '07/01/2017',
        stateOfRegistration: 'RAJASTHAN',
        panNumber: 'AAECD8566H',
        gstin: '07AAECD8566H1ZC',
        turnover: '₹12,03,35,010',
        registeredAddress: '101, Block D, Industrial Area, Sector 4, Kota, Rajasthan 324001',
        operationalAddress: '101, Block D, Industrial Area, Sector 4, Kota, Rajasthan 324001',
        website: 'company4.com',
        email: 'info@company4.com',
        contactNumber: '7849954552'
      },

      authorizedSignatory: {
        name: 'SUMAN GUPTA',
        designation: 'Director',
        email: 'compliance@company4.com',
        contactNumber: '9968009648',
        residenceAddress: '101, Sector 4, Kota, Rajasthan',
        state: 'Rajasthan',
        pan: 'AAECD8566H',
        aadhaarNo: 'XXXX-XXXX-6814',
        typeIdProof: 'Aadhaar Card',
        idNo: '542510326814',
        bhamashahNo: 'Not Provided',
        voterIdNo: 'DLH6814990',
        passportNo: 'Not Provided',
        serviceTaxNo: 'Not Provided'
      },

      bankDetails: {
        bankName: 'Bank of Baroda',
        branchName: 'Industrial Area Branch, Kota',
        accountHolderName: 'Company 4',
        accountNumber: '08420200001923',
        ifscCode: 'BARB0KOTAX',
        accountType: 'Current Account'
      },

      trainingCentres: [
        {
          district: 'Alwar',
          centreName: 'Company 4 Skill Centre Alwar',
          classrooms: 2,
          practicalRooms: 2,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0144-223344',
          fullAddress: '101, Industrial Area, Alwar, Rajasthan'
        },
        {
          district: 'Khairthal-Tijara',
          centreName: 'Company 4 Skill Centre Khairthal',
          classrooms: 3,
          practicalRooms: 3,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '01493-255667',
          fullAddress: '202, Industrial Area, Khairthal, Rajasthan'
        },
        {
          district: 'Udaipur',
          centreName: 'Company 4 Skill Centre Udaipur',
          classrooms: 3,
          practicalRooms: 3,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0294-266778',
          fullAddress: '303, Industrial Area, Udaipur, Rajasthan'
        },
        {
          district: 'Jaipur',
          centreName: 'Company 4 Skill Centre Jaipur',
          classrooms: 3,
          practicalRooms: 3,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0141-288990',
          fullAddress: '404, Industrial Area, Jaipur, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '9,21,00,536', skillTurnover: '9,21,00,536' },
        { year: '2022 - 2023', totalTurnover: '2,39,94,320', skillTurnover: '2,39,94,320' },
        { year: '2023 - 2024', totalTurnover: '42,40,154', skillTurnover: '42,40,154' }
      ],

      placementTrackRecord: [
        { sector: 'Healthcare', year: '2022 - 2023', trained: 570, placed: 476, proofDetails: '476 verification logs' },
        { sector: 'Garment Making', year: '2023 - 2024', trained: 150, placed: 105, proofDetails: '105 verification logs' },
        { sector: 'Handicraft & Local Skills', year: '2024 - 2025', trained: 810, placed: 441, proofDetails: '441 artisan logs' }
      ],

      annualActionPlan: [
        { district: 'Khairthal-Tijara', proposedSDCs: 2, location: 'KHAIRTHAL- TIJARA', sectors: 'Handicraft & Multi-Skills', courses: 'Assistant Tech Hardware, Folk Music', residential: 'Both', batches: 10 },
        { district: 'Kotputli-Behror', proposedSDCs: 2, location: 'KOTPUTLI - BEHROR', sectors: 'Local Resource Based', courses: 'DEO Saksham, Phad Painting', residential: 'Both', batches: 10 },
        { district: 'Salumber', proposedSDCs: 2, location: 'SALUMBAR', sectors: 'Indian Culture', courses: 'DEO Receptionist, Traditional Music', residential: 'Both', batches: 10 }
      ],

      uploadedDocuments: [
        { id: 'doc-401', title: 'Organisation Registration Certificate', fileSize: '1.4 MB PDF', category: 'Statutory', verified: true },
        { id: 'doc-402', title: 'Organisation PAN Card', fileSize: '850 KB PDF', category: 'Taxation', verified: true },
        { id: 'doc-403', title: 'GST Registration Certificate', fileSize: '1.1 MB PDF', category: 'Taxation', verified: true },
        { id: 'doc-404', title: 'Audited Balance Sheet / Turnover Certificate', fileSize: '3.8 MB PDF · CA Certified', category: 'Financial', verified: true },
        { id: 'doc-405', title: 'Board Resolution / Power of Attorney', fileSize: '2.1 MB PDF', category: 'Legal', verified: true },
        { id: 'doc-406', title: 'NSDC Partner Certificate', fileSize: '1.9 MB PDF', category: 'Affiliation', verified: true },
        { id: 'doc-407', title: 'Additional Supporting Document', fileSize: '4.5 MB PDF', category: 'Annexures', verified: true }
      ],

      scrutinyDetails: {
        technicalScore: 92,
        grade: 'Grade A',
        remarks: 'Exemplary technical infrastructure and robust track record across four Rajasthan districts. Fully approved for Category I empanelment.',
        scrutinyOfficer: 'Shri R. K. Sharma (Joint Director, RSLDC)',
        decisionTimestamp: '25/08/2026 14:15 PM',
        approvalDocument: {
          id: 'RES-MMKVY-2026-042',
          documentName: 'Committee_Empanelment_Resolution_042.pdf',
          uploadDate: '25/08/2026',
          fileSize: '3.1 MB',
          signatories: [
            { name: 'Dr. Alok Verma, IAS', designation: 'Managing Director, RSLDC', signedAt: '25/08/2026 13:30', verified: true },
            { name: 'Shri R. K. Sharma', designation: 'Joint Director (Scrutiny In-charge)', signedAt: '25/08/2026 13:50', verified: true },
            { name: 'Smt. Neeta Mathur', designation: 'Senior Accounts Officer (Finance)', signedAt: '25/08/2026 14:05', verified: true }
          ]
        }
      }
    },

    // 4 Applicant Responses for SAMARTH-02 (SAMARTH Skill Development Scheme)
    {
      id: 'APP-005001',
      anonymousLabel: 'Company 1',
      actualLegalName: 'Company 1',
      regNumber: 'ISMS-REG-2026-9011',
      schemeId: 'SAMARTH-02',
      schemeName: 'SAMARTH Skill Development Scheme',
      eoiRefNo: 'RSLDC/EOI/2026/SAMARTH-02',
      submissionDate: '10/09/2026 11:30 AM',
      status: 'UNDER_SCRUTINY',
      statusDisplay: 'Pending Review',
      emdFee: 75000,
      emdStatus: 'PAID',
      processingFee: 2500,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 1',
        tradeName: 'Company 1 Trade',
        entityType: 'Company registered under Companies Act, 2013',
        registrationNumber: 'U74999DL2018PTC334512',
        dateOfRegistration: '14/03/2018',
        stateOfRegistration: 'DELHI',
        panNumber: 'AAECD8566H',
        gstin: '07AAECD8566H1ZC',
        turnover: '₹14,50,00,000',
        registeredAddress: '123, Block A, Industrial Area, Sector 1, Jaipur, Rajasthan 302001',
        operationalAddress: '123, Block A, Industrial Area, Sector 1, Jaipur, Rajasthan 302001',
        website: 'company1.com',
        email: 'info@company1.com',
        contactNumber: '0141-2705600'
      },

      authorizedSignatory: {
        name: 'SUMAN GUPTA',
        designation: 'Director',
        email: 'compliance@company1.com',
        contactNumber: '9968009648',
        residenceAddress: '123, Sector 1, Jaipur, Rajasthan',
        state: 'Rajasthan',
        pan: 'BGPPS4512K',
        aadhaarNo: 'XXXX-XXXX-4512',
        typeIdProof: 'Aadhaar Card',
        idNo: 'XXXX-XXXX-4512',
        bhamashahNo: 'Not Provided',
        voterIdNo: 'RJP1245789',
        passportNo: 'Z8945123',
        serviceTaxNo: 'Not Provided'
      },

      bankDetails: {
        bankName: 'State Bank of India',
        branchName: 'Specialized Commercial Branch, Jaipur',
        accountHolderName: 'Company 1',
        accountNumber: '38920194821',
        ifscCode: 'SBIN0004128',
        accountType: 'Current Account'
      },

      trainingCentres: [
        {
          district: 'Jaipur',
          centreName: 'SAMARTH Skill Hub Jaipur',
          classrooms: 4,
          practicalRooms: 3,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0141-4098765',
          fullAddress: '456, Industrial Area, Mansarovar, Jaipur, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '10,21,00,536', skillTurnover: '10,21,00,536' },
        { year: '2022 - 2023', totalTurnover: '12,39,94,320', skillTurnover: '12,39,94,320' },
        { year: '2023 - 2024', totalTurnover: '14,50,00,000', skillTurnover: '14,50,00,000' }
      ],

      placementTrackRecord: [
        { sector: 'Technical Trades', year: '2023 - 2024', trained: 400, placed: 340, proofDetails: '340 offer letters attached' }
      ],

      annualActionPlan: [
        { district: 'Jaipur', proposedSDCs: 2, location: 'MANSAROVAR', sectors: 'Technical Trades', courses: 'Industrial Automation', residential: 'Both', batches: 8 }
      ],

      uploadedDocuments: [
        { id: 'doc-s1', title: 'Organisation Registration Certificate', fileSize: '1.4 MB PDF', category: 'Statutory', verified: true }
      ]
    },

    {
      id: 'APP-005002',
      anonymousLabel: 'Company 2',
      actualLegalName: 'Company 2',
      regNumber: 'ISMS-REG-2026-9012',
      schemeId: 'SAMARTH-02',
      schemeName: 'SAMARTH Skill Development Scheme',
      eoiRefNo: 'RSLDC/EOI/2026/SAMARTH-02',
      submissionDate: '11/09/2026 02:15 PM',
      status: 'APPROVED',
      statusDisplay: 'Accepted',
      emdFee: 75000,
      emdStatus: 'PAID',
      processingFee: 2500,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 2',
        tradeName: 'Company 2 Trade',
        entityType: 'Registered Society',
        registrationNumber: 'RS-JOD-2016-891',
        dateOfRegistration: '11/08/2016',
        stateOfRegistration: 'RAJASTHAN',
        panNumber: 'AAATM1122K',
        gstin: '08AAATM1122K1Z9',
        turnover: '₹9,80,00,000',
        registeredAddress: '456, Sector 2, Jodhpur, Rajasthan 342001',
        operationalAddress: '456, Sector 2, Jodhpur, Rajasthan 342001',
        website: 'company2.com',
        email: 'info@company2.com',
        contactNumber: '0291-2741000'
      },

      authorizedSignatory: {
        name: 'RAJENDRA SINGH RATHORE',
        designation: 'Managing Trustee',
        email: 'trustee@company2.com',
        contactNumber: '9414123456',
        residenceAddress: '456, Sector 2, Jodhpur',
        state: 'Rajasthan',
        pan: 'AETPR9912L',
        aadhaarNo: 'XXXX-XXXX-9912',
        typeIdProof: 'Aadhaar Card',
        idNo: 'XXXX-XXXX-9912',
        bhamashahNo: 'BHM-881273',
        voterIdNo: 'JOD9912345',
        passportNo: 'Not Provided',
        serviceTaxNo: 'Not Provided'
      },

      trainingCentres: [
        {
          district: 'Jodhpur',
          centreName: 'SAMARTH Centre Jodhpur',
          classrooms: 3,
          practicalRooms: 2,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0291-2741001',
          fullAddress: '456, Industrial Area, Jodhpur, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '7,50,00,000', skillTurnover: '7,10,00,000' },
        { year: '2022 - 2023', totalTurnover: '8,80,00,000', skillTurnover: '8,50,00,000' },
        { year: '2023 - 2024', totalTurnover: '9,80,00,000', skillTurnover: '9,20,00,000' }
      ],

      placementTrackRecord: [
        { sector: 'Artisan & Craft', year: '2023 - 2024', trained: 350, placed: 295, proofDetails: '295 wage proofs' }
      ],

      annualActionPlan: [
        { district: 'Jodhpur', proposedSDCs: 1, location: 'BORANADA', sectors: 'Artisan', courses: 'Handicrafts', residential: 'Non-Residential', batches: 6 }
      ],

      uploadedDocuments: [
        { id: 'doc-s2', title: 'Organisation Registration Certificate', fileSize: '1.2 MB PDF', category: 'Statutory', verified: true }
      ],

      scrutinyDetails: {
        technicalScore: 86,
        grade: 'Grade A',
        remarks: 'Approved under SAMARTH guidelines.',
        scrutinyOfficer: 'Shri R. K. Sharma',
        decisionTimestamp: '13/09/2026 15:30 PM'
      }
    },

    {
      id: 'APP-005003',
      anonymousLabel: 'Company 3',
      actualLegalName: 'Company 3',
      regNumber: 'ISMS-REG-2026-9013',
      schemeId: 'SAMARTH-02',
      schemeName: 'SAMARTH Skill Development Scheme',
      eoiRefNo: 'RSLDC/EOI/2026/SAMARTH-02',
      submissionDate: '12/09/2026 04:40 PM',
      status: 'REJECTED',
      statusDisplay: 'Rejected',
      emdFee: 75000,
      emdStatus: 'REFUNDED',
      processingFee: 2500,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 3',
        tradeName: 'Company 3 Trade',
        entityType: 'Trust',
        registrationNumber: 'TR-UDR-2019-440',
        dateOfRegistration: '22/05/2019',
        stateOfRegistration: 'RAJASTHAN',
        panNumber: 'AACTS3344M',
        gstin: '08AACTS3344M1Z2',
        turnover: '₹1,50,00,000',
        registeredAddress: '789, Sector 3, Udaipur, Rajasthan',
        operationalAddress: '789, Sector 3, Udaipur, Rajasthan',
        website: 'company3.com',
        email: 'info@company3.com',
        contactNumber: '0294-2567890'
      },

      authorizedSignatory: {
        name: 'MANISH SINGHANIA',
        designation: 'Chief Trustee',
        email: 'contact@company3.com',
        contactNumber: '9829012345',
        residenceAddress: '789, Sector 3, Udaipur',
        state: 'Rajasthan',
        pan: 'AFGPS1123P',
        aadhaarNo: 'XXXX-XXXX-1123',
        typeIdProof: 'Aadhaar Card',
        idNo: 'XXXX-XXXX-1123',
        bhamashahNo: 'Not Provided',
        voterIdNo: 'UDR1123456',
        passportNo: 'Not Provided',
        serviceTaxNo: 'Not Provided'
      },

      trainingCentres: [
        {
          district: 'Udaipur',
          centreName: 'SAMARTH Centre Udaipur',
          classrooms: 1,
          practicalRooms: 1,
          separateWashrooms: false,
          labInfrastructure: false,
          telephone: '0294-2567891',
          fullAddress: '789, Industrial Area, Udaipur, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '90,00,000', skillTurnover: '70,00,000' },
        { year: '2022 - 2023', totalTurnover: '1,10,00,000', skillTurnover: '85,00,000' },
        { year: '2023 - 2024', totalTurnover: '1,50,00,000', skillTurnover: '1,10,00,000' }
      ],

      placementTrackRecord: [
        { sector: 'General Skills', year: '2023 - 2024', trained: 100, placed: 35, proofDetails: 'Insufficient proofs' }
      ],

      annualActionPlan: [
        { district: 'Udaipur', proposedSDCs: 1, location: 'UDAIPUR CITY', sectors: 'General Skills', courses: 'Craft Assistant', residential: 'Non-Residential', batches: 4 }
      ],

      uploadedDocuments: [
        { id: 'doc-s3', title: 'Organisation Registration Certificate', fileSize: '1.1 MB PDF', category: 'Statutory', verified: true }
      ],

      scrutinyDetails: {
        technicalScore: 42,
        grade: 'Grade E',
        disqualificationReason: 'Financial turnover below SAMARTH threshold',
        remarks: 'Inadequate financial turnover and lab equipment.',
        scrutinyOfficer: 'Shri R. K. Sharma',
        decisionTimestamp: '14/09/2026 10:20 AM'
      }
    },

    {
      id: 'APP-005004',
      anonymousLabel: 'Company 4',
      actualLegalName: 'Company 4',
      regNumber: 'ISMS-REG-2026-9014',
      schemeId: 'SAMARTH-02',
      schemeName: 'SAMARTH Skill Development Scheme',
      eoiRefNo: 'RSLDC/EOI/2026/SAMARTH-02',
      submissionDate: '13/09/2026 01:10 PM',
      status: 'APPROVED',
      statusDisplay: 'Accepted',
      emdFee: 75000,
      emdStatus: 'PAID',
      processingFee: 2500,
      processingFeeStatus: 'PAID',

      organisation: {
        legalName: 'Company 4',
        tradeName: 'Company 4 Trade',
        entityType: 'Company registered under Companies Act',
        registrationNumber: '07AAECD8566H1ZC',
        dateOfRegistration: '07/01/2017',
        stateOfRegistration: 'RAJASTHAN',
        panNumber: 'AAECD8566H',
        gstin: '07AAECD8566H1ZC',
        turnover: '₹15,10,00,000',
        registeredAddress: '101, Sector 4, Kota, Rajasthan 324001',
        operationalAddress: '101, Sector 4, Kota, Rajasthan 324001',
        website: 'company4.com',
        email: 'info@company4.com',
        contactNumber: '7849954552'
      },

      authorizedSignatory: {
        name: 'SUMAN GUPTA',
        designation: 'Director',
        email: 'compliance@company4.com',
        contactNumber: '9968009648',
        residenceAddress: '101, Sector 4, Kota',
        state: 'Rajasthan',
        pan: 'AAECD8566H',
        aadhaarNo: 'XXXX-XXXX-6814',
        typeIdProof: 'Aadhaar Card',
        idNo: '542510326814',
        bhamashahNo: 'Not Provided',
        voterIdNo: 'DLH6814990',
        passportNo: 'Not Provided',
        serviceTaxNo: 'Not Provided'
      },

      trainingCentres: [
        {
          district: 'Kota',
          centreName: 'SAMARTH Centre Kota',
          classrooms: 4,
          practicalRooms: 3,
          separateWashrooms: true,
          labInfrastructure: true,
          telephone: '0141-288990',
          fullAddress: '101, Industrial Area, Kota, Rajasthan'
        }
      ],

      financialYears: [
        { year: '2021 - 2022', totalTurnover: '11,21,00,536', skillTurnover: '11,21,00,536' },
        { year: '2022 - 2023', totalTurnover: '13,39,94,320', skillTurnover: '13,39,94,320' },
        { year: '2023 - 2024', totalTurnover: '15,10,00,000', skillTurnover: '15,10,00,000' }
      ],

      placementTrackRecord: [
        { sector: 'Industrial Trades', year: '2023 - 2024', trained: 500, placed: 440, proofDetails: '440 wage proof slips' }
      ],

      annualActionPlan: [
        { district: 'Kota', proposedSDCs: 2, location: 'KOTA INDUSTRIAL BELT', sectors: 'Industrial Trades', courses: 'Industrial Fabrication', residential: 'Both', batches: 8 }
      ],

      uploadedDocuments: [
        { id: 'doc-s4', title: 'Organisation Registration Certificate', fileSize: '1.4 MB PDF', category: 'Statutory', verified: true }
      ],

      scrutinyDetails: {
        technicalScore: 94,
        grade: 'Grade A',
        remarks: 'Fully approved for SAMARTH empanelment.',
        scrutinyOfficer: 'Shri R. K. Sharma',
        decisionTimestamp: '15/09/2026 14:00 PM'
      }
    }
  ];

  private schemesSubject = new BehaviorSubject<Scheme[]>(this.initialSchemes);
  public schemes$ = this.schemesSubject.asObservable();

  private responsesSubject = new BehaviorSubject<ApplicantResponse[]>(this.initialResponses);
  public responses$ = this.responsesSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedResponses = localStorage.getItem('isms_dept_admin_responses');
        if (savedResponses) {
          const parsed: ApplicantResponse[] = JSON.parse(savedResponses);
          const mergedMap = new Map<string, ApplicantResponse>();
          this.initialResponses.forEach(init => mergedMap.set(init.id, init));
          parsed.forEach(p => {
            if (mergedMap.has(p.id)) {
              const init = mergedMap.get(p.id)!;
              const isCompany1 = init.anonymousLabel === 'Company 1' || init.id === 'APP-004661' || init.id === 'APP-005001';
              // Always reset Company 1 to UNDER_SCRUTINY (Pending Review) as requested by user
              mergedMap.set(p.id, {
                ...init,
                status: isCompany1 ? 'UNDER_SCRUTINY' : (p.status || init.status),
                statusDisplay: isCompany1 ? 'Pending Review' : (p.statusDisplay || init.statusDisplay),
                emdStatus: isCompany1 ? 'PAID' : (p.emdStatus || init.emdStatus),
                scrutinyDetails: isCompany1 ? undefined : (p.scrutinyDetails || init.scrutinyDetails)
              });
            } else {
              mergedMap.set(p.id, p);
            }
          });
          this.responsesSubject.next(Array.from(mergedMap.values()));
          this.saveToStorage(Array.from(mergedMap.values()));
          return;
        }
      } catch (e) {
        console.error('Error loading stored responses', e);
      }
    }
    // Default fallback: ensure Company 1 is UNDER_SCRUTINY
    const defaultList = this.initialResponses.map(resp => {
      const isCompany1 = resp.anonymousLabel === 'Company 1' || resp.id === 'APP-004661' || resp.id === 'APP-005001';
      if (isCompany1) {
        return {
          ...resp,
          status: 'UNDER_SCRUTINY' as const,
          statusDisplay: 'Pending Review',
          scrutinyDetails: undefined
        };
      }
      return resp;
    });
    this.responsesSubject.next(defaultList);
    this.saveToStorage(defaultList);
  }

  private saveToStorage(responses: ApplicantResponse[]): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('isms_dept_admin_responses', JSON.stringify(responses));
      } catch (e) {
        console.error('Error saving responses', e);
      }
    }
  }

  getSchemes(): Observable<Scheme[]> {
    return this.schemes$;
  }

  getSchemeById(schemeId: string): Observable<Scheme | undefined> {
    return this.schemes$.pipe(
      map(schemes => schemes.find(s => s.id === schemeId || s.refNo.includes(schemeId)))
    );
  }

  getResponses(schemeId?: string): Observable<ApplicantResponse[]> {
    return this.responses$.pipe(
      map(responses => {
        if (!schemeId || schemeId === 'ALL') return responses;
        if (schemeId === '2' || schemeId === 'SAMARTH-02' || schemeId.includes('SAMARTH-02')) {
          const samarth = responses.filter(r => r.schemeId === 'SAMARTH-02');
          if (samarth.length > 0) return samarth;
        }
        if (schemeId === '1' || schemeId === 'MMKVY-01' || schemeId.includes('MMKVY-01')) {
          const mmkvy = responses.filter(r => r.schemeId === 'MMKVY-01');
          if (mmkvy.length > 0) return mmkvy;
        }
        const filtered = responses.filter(r => r.schemeId === schemeId || r.eoiRefNo.includes(schemeId));
        return filtered.length > 0 ? filtered : responses.filter(r => r.schemeId === 'SAMARTH-02');
      })
    );
  }

  getResponseById(applicationId: string): Observable<ApplicantResponse | undefined> {
    return this.responses$.pipe(
      map(responses => responses.find(r => r.id === applicationId || r.regNumber === applicationId))
    );
  }

  /**
   * Business Logic for Scrutiny Decision:
   * - If status is REJECTED -> automatically update emdStatus = 'REFUNDED'
   * - If status is APPROVED -> set emdStatus = 'PAID'
   * - Update state immutably and notify all subscribers
   */
  updateScrutinyDecision(
    applicationId: string,
    decision: {
      status: 'APPROVED' | 'REJECTED';
      grade: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E';
      technicalScore: number;
      remarks: string;
      disqualificationReason?: string;
      attachedScrutinyNote?: string;
      approvalDocument?: CommitteeApprovalDocument;
      scrutinyOfficer?: string;
    }
  ): boolean {
    const currentList = this.responsesSubject.getValue();
    const targetIndex = currentList.findIndex(r => r.id === applicationId || r.regNumber === applicationId);

    if (targetIndex === -1) {
      return false;
    }

    const target = currentList[targetIndex];
    const isApproved = decision.status === 'APPROVED';
    const updatedEmdStatus = isApproved ? 'PAID' : 'REFUNDED';
    const statusDisplay = isApproved ? 'Accepted' : 'Rejected';

    const updatedResponse: ApplicantResponse = {
      ...target,
      status: decision.status,
      statusDisplay: statusDisplay,
      emdStatus: updatedEmdStatus,
      scrutinyDetails: {
        technicalScore: Math.min(100, Math.max(0, decision.technicalScore)),
        grade: decision.grade,
        remarks: decision.remarks,
        disqualificationReason: decision.disqualificationReason,
        approvalDocument: decision.approvalDocument,
        scrutinyOfficer: decision.scrutinyOfficer || 'Department Scrutiny Officer (RSLDC)',
        decisionTimestamp: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
    };

    const updatedList = [...currentList];
    updatedList[targetIndex] = updatedResponse;

    this.responsesSubject.next(updatedList);
    this.saveToStorage(updatedList);
    return true;
  }

  markSanctionSubmitted(schemeId: string): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`isms_sanction_submitted_${schemeId}`, 'true');
        localStorage.setItem(`isms_sanction_submitted_latest`, 'true');
      } catch (e) {}
    }
  }

  isSanctionSubmitted(schemeId: string): boolean {
    const currentResponses = this.responsesSubject.getValue();
    const hasPending = currentResponses.some(r => r.status === 'UNDER_SCRUTINY');
    if (hasPending) return false;

    if (typeof localStorage !== 'undefined') {
      try {
        const val = localStorage.getItem(`isms_sanction_submitted_${schemeId}`);
        if (val === 'true') return true;
        const globalVal = localStorage.getItem(`isms_sanction_submitted_latest`);
        return globalVal === 'true';
      } catch (e) {}
    }
    return false;
  }
}
