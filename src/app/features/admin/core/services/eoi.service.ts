import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { 
  EoiItem, EoiStatus, CorrigendumAmendment, EoiVersionHistory, 
  ApplicationItem, DashboardSummary, CommitteeApprovalDocument 
} from '../models/admin.models';
import { AuditService } from './audit.service';
import { EoiStateService } from '../../../../core/services/eoi-state.service';

@Injectable({
  providedIn: 'root'
})
export class EoiService {
  private auditService = inject(AuditService);
  private eoiStateService = inject(EoiStateService, { optional: true });

  private loadEois(): EoiItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('isms_eoi_list');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
    {
      id: 'EOI-2025-001',
      referenceNo: 'RSLDC/EOI/2025-26/001',
      title: 'Empanelment of Project Implementing Agencies (PIAs) for Running Skill Training Centers across 33 Districts of Rajasthan under MMKVY',
      schemeId: 'SCH-001',
      schemeName: 'Mukhya Mantri Kaushal Vikas Yojana',
      schemeCategory: 'Skill Development & Training',
      department: 'Skill, Employment & Entrepreneurship Department',
      eoiCategory: 'General',
      description: 'Expression of interest invited from reputed private organizations, societies, and trusts for establishing multi-skill training centers with assured placement linkages.',
      publishedDate: '2026-09-01',
      applicationStartDate: '2026-09-05',
      closingDate: '2026-09-17', // Currently OPEN (closes tomorrow)
      openingDate: '2026-09-18',
      reviewStartDate: '2026-09-20',
      status: 'OPEN',
      version: '1.1',
      applicationCount: 42,
      committeeId: 'COMM-01',
      committeeName: 'State Skill Evaluation Committee (SSEC-01)',
      attachedFileName: 'MMKVY_PIA_Empanelment_Guidelines_2025.pdf',
      attachedFileSize: '4.2 MB',
      fees: {
        emdFee: 50000,
        applicationFee: 5000,
        processingFee: 1000,
        gstPercentage: 18,
        gstAmount: 1080,
        otherCharges: 0,
        totalFee: 57080
      },
      eligibility: {
        id: 'ELG-01',
        organizationTypes: ['Private Organization', 'Society', 'Trust', 'PSU'],
        minExperienceYears: 3,
        minTurnoverCrores: 1.5,
        allowedLocations: ['Rajasthan (All Districts)'],
        department: 'Skill, Employment & Entrepreneurship Department',
        customCriteria: [
          'Must have placed at least 300 candidates in past 2 financial years with EPF/ESIC proof',
          'Must possess minimum 3000 sq. ft. dedicated carpet area in designated district',
          'Not debarred or blacklisted by any Central/State Govt agency'
        ]
      },
      documents: [
        { id: 'ED-01', documentTypeId: 'DOC-01', documentName: 'Certificate of Incorporation / Registration', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' },
        { id: 'ED-02', documentTypeId: 'DOC-02', documentName: 'GST Registration Certificate', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' },
        { id: 'ED-03', documentTypeId: 'DOC-04', documentName: 'Audited Balance Sheets (Last 3 FY)', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' },
        { id: 'ED-04', documentTypeId: 'DOC-05', documentName: 'CA Certificate of Annual Turnover', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' },
        { id: 'ED-05', documentTypeId: 'DOC-08', documentName: 'Non-Blacklisting Undertaking Affidavit', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' }
      ],
      transactions: [
        { id: 'ET-01', transactionCode: 'TX_APP_FEE', transactionName: 'Standard Application Fee', transactionIdRef: 'TXN-REQ-APP-001', amount: 5000, status: 'Active' },
        { id: 'ET-02', transactionCode: 'TX_PROC_FEE', transactionName: 'RISL Processing Fee', transactionIdRef: 'TXN-REQ-RISL-001', amount: 1000, status: 'Active' },
        { id: 'ET-03', transactionCode: 'TX_EMD_PAY', transactionName: 'Earnest Money Deposit (Refundable)', transactionIdRef: 'TXN-REQ-EMD-001', amount: 50000, status: 'Active' }
      ],
      termsAndConditions: 'All participating organizations must strictly adhere to the Rajasthan Transparency in Public Procurement (RTPP) Act 2012 and Rules 2013.',
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-02-01T14:30:00.000Z'
    },
    {
      id: 'EOI-2025-002',
      referenceNo: 'RSLDC/EOI/2024-25/089',
      title: 'Selection of Assessment & Certification Agencies for Recognition of Prior Learning (RPL) in Handicrafts & Tourism',
      schemeId: 'SCH-006',
      schemeName: 'Rajkvik Recognition of Prior Learning',
      schemeCategory: 'Recognition of Prior Learning',
      department: 'Skill, Employment & Entrepreneurship Department',
      eoiCategory: 'Government Institution / PSU',
      description: 'EOI for third-party accredited assessment bodies to evaluate informal artisan cohorts across Jodhpur, Jaipur, and Udaipur heritage clusters.',
      publishedDate: '2026-08-01',
      applicationStartDate: '2026-08-05',
      closingDate: '2026-09-15', // CLOSED EOI! (closed yesterday)
      openingDate: '2026-09-16',
      reviewStartDate: '2026-09-18',
      status: 'CLOSED',
      version: '1.0',
      applicationCount: 18,
      committeeId: 'COMM-02',
      committeeName: 'Centrally Sponsored Schemes Scrutiny Committee',
      attachedFileName: 'RPL_Assessment_Agencies_RFP_2024.pdf',
      attachedFileSize: '3.1 MB',
      fees: {
        emdFee: 25000,
        applicationFee: 2500,
        processingFee: 500,
        gstPercentage: 18,
        gstAmount: 540,
        otherCharges: 0,
        totalFee: 28540
      },
      eligibility: {
        id: 'ELG-02',
        organizationTypes: ['Government Institution', 'PSU', 'University', 'Private Organization'],
        minExperienceYears: 2,
        minTurnoverCrores: 0.75,
        allowedLocations: ['Pan India with Rajasthan Liaison Office'],
        department: 'Skill, Employment & Entrepreneurship Department',
        customCriteria: [
          'Must be accredited by NCVET or Sector Skill Councils (SSC)',
          'Minimum 5,000 candidate assessments completed in last 2 financial years'
        ]
      },
      documents: [
        { id: 'ED-06', documentTypeId: 'DOC-01', documentName: 'Incorporation Certificate', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' },
        { id: 'ED-07', documentTypeId: 'DOC-06', documentName: 'NCVET/SSC Accreditation Certificate', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' }
      ],
      transactions: [
        { id: 'ET-04', transactionCode: 'TX_APP_FEE', transactionName: 'Application Fee', transactionIdRef: 'TXN-REQ-APP-002', amount: 2500, status: 'Active' }
      ],
      createdAt: '2024-10-25T08:00:00.000Z',
      updatedAt: '2024-12-15T18:00:00.000Z'
    },
    {
      id: 'EOI-2025-003',
      referenceNo: 'RSLDC/EOI/2025-26/003',
      title: 'Specialized Skill Training & Entrepreneurship Incubation for Rural Women Self Help Groups under SAKSHAM Scheme',
      schemeId: 'SCH-005',
      schemeName: 'Saksham Scheme for Women Empowerment',
      schemeCategory: 'Women Entrepreneurship',
      department: 'Women & Child Development / Skill Dept',
      eoiCategory: 'NGO / Non-Profit Trust',
      description: 'Empanelment of NGOs and training partners for mobilizing, skilling, and handholding women micro-enterprises in food processing and handicrafts.',
      publishedDate: '2026-09-10',
      applicationStartDate: '2026-09-12',
      closingDate: '2026-10-15',
      openingDate: '2026-10-18',
      reviewStartDate: '2026-10-20',
      status: 'OPEN',
      version: '1.0',
      applicationCount: 29,
      committeeId: 'COMM-03',
      committeeName: 'Women & Affirmative Skilling Screening Board',
      attachedFileName: 'Saksham_Women_Empanelment_EOI.pdf',
      attachedFileSize: '2.8 MB',
      fees: {
        emdFee: 10000,
        applicationFee: 1000,
        processingFee: 250,
        gstPercentage: 18,
        gstAmount: 225,
        otherCharges: 0,
        totalFee: 11475
      },
      eligibility: {
        id: 'ELG-03',
        organizationTypes: ['NGO', 'Society', 'Trust', 'Government Organization'],
        minExperienceYears: 3,
        minTurnoverCrores: 0.25,
        allowedLocations: ['Rajasthan'],
        department: 'Women & Child Development / Skill Dept',
        customCriteria: [
          'Valid registration on NGO Darpan Portal of NITI Aayog',
          'Audit statements for last 3 years with Nil adverse remarks'
        ]
      },
      documents: [
        { id: 'ED-08', documentTypeId: 'DOC-01', documentName: 'Society/Trust Registration', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' },
        { id: 'ED-09', documentTypeId: 'DOC-07', documentName: 'NITI Aayog Darpan Certificate', documentType: 'PDF', isRequired: true, version: '1.0', status: 'Active' }
      ],
      transactions: [
        { id: 'ET-05', transactionCode: 'TX_APP_FEE', transactionName: 'Application Processing Fee', transactionIdRef: 'TXN-REQ-APP-003', amount: 1000, status: 'Active' }
      ],
      createdAt: '2025-01-28T09:00:00.000Z',
      updatedAt: '2025-02-01T10:00:00.000Z'
    },
    {
      id: 'EOI-2025-004',
      referenceNo: 'RSLDC/EOI/2025-26/004',
      title: 'Empanelment of Training Providers for Divyangjan Residential Vocational Skilling under SAMARTH Scheme',
      schemeId: 'SCH-004',
      schemeName: 'Samarth Scheme for Special Vulnerable Groups',
      schemeCategory: 'Affirmative Action Skilling',
      department: 'Social Justice & Empowerment / Skill Dept',
      eoiCategory: 'NGO / Non-Profit Trust',
      description: 'Comprehensive residential technical skilling and assistive tech orientation for specially-abled youth with placement guarantees.',
      publishedDate: '2025-02-15',
      applicationStartDate: '2025-02-20',
      closingDate: '2025-05-30',
      openingDate: '2025-06-02',
      reviewStartDate: '2025-06-05',
      status: 'PUBLISHED',
      version: '1.0',
      applicationCount: 8,
      committeeId: 'COMM-03',
      committeeName: 'Women & Affirmative Skilling Screening Board',
      attachedFileName: 'Samarth_Divyangjan_Vocational_EOI_2025.pdf',
      attachedFileSize: '3.6 MB',
      fees: {
        emdFee: 15000,
        applicationFee: 1500,
        processingFee: 300,
        gstPercentage: 18,
        gstAmount: 324,
        otherCharges: 0,
        totalFee: 17124
      },
      eligibility: {
        id: 'ELG-04',
        organizationTypes: ['NGO', 'Trust', 'Government Institution', 'Private Organization'],
        minExperienceYears: 2,
        minTurnoverCrores: 0.5,
        allowedLocations: ['Rajasthan'],
        department: 'Social Justice & Empowerment / Skill Dept',
        customCriteria: [
          'Center must have barrier-free tactile paving and Divyangjan accessible infrastructure'
        ]
      },
      documents: [],
      transactions: [],
      createdAt: '2025-02-10T11:00:00.000Z',
      updatedAt: '2025-02-15T12:00:00.000Z'
    },
    {
      id: 'EOI-2025-005',
      referenceNo: 'RSLDC/EOI/2025-26/005-DRAFT',
      title: 'Setting up State-of-the-Art Industry 4.0 Advanced Robotics & Drone Technology Center of Excellence (CoE)',
      schemeId: 'SCH-003',
      schemeName: 'Rajasthan Kaushal Vikas Kendra Scheme',
      schemeCategory: 'Infrastructure & Training Center Support',
      department: 'Skill, Employment & Entrepreneurship Department',
      eoiCategory: 'General',
      description: 'High-tech Center of Excellence for drone manufacturing, precision piloting, and industrial robotics in partnership with global OEMs.',
      publishedDate: '2025-03-01',
      applicationStartDate: '2025-03-10',
      closingDate: '2025-07-15',
      openingDate: '2025-07-20',
      reviewStartDate: '2025-07-25',
      status: 'DRAFT',
      version: '0.1',
      applicationCount: 0,
      attachedFileName: 'Draft_Industry_4.0_CoE_RFP.pdf',
      attachedFileSize: '1.9 MB',
      fees: {
        emdFee: 100000,
        applicationFee: 10000,
        processingFee: 2000,
        gstPercentage: 18,
        gstAmount: 2160,
        otherCharges: 0,
        totalFee: 114160
      },
      eligibility: {
        id: 'ELG-05',
        organizationTypes: ['Private Organization', 'University', 'PSU'],
        minExperienceYears: 5,
        minTurnoverCrores: 10.0,
        allowedLocations: ['Jaipur / Jodhpur'],
        department: 'Skill, Employment & Entrepreneurship Department',
        customCriteria: ['Direct OEM tie-up or DGCA approved drone training organization accreditation']
      },
      documents: [],
      transactions: [],
      createdAt: '2025-02-25T14:00:00.000Z',
      updatedAt: '2025-02-25T14:00:00.000Z'
    }
  ];
}

  private eoiList: EoiItem[] = this.loadEois();

  private saveEoisToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('isms_eoi_list', JSON.stringify(this.eoiList));
      if (this.eoiStateService) {
        this.eoiStateService.refreshSchemesFromStorage();
      }
    }
  }

  // Corrigendums & Amendments
  private corrigendums: CorrigendumAmendment[] = [
    {
      id: 'CORR-01',
      eoiId: 'EOI-2025-001',
      eoiReferenceNo: 'RSLDC/EOI/2025-26/001',
      version: '1.1',
      type: 'Corrigendum',
      documentNumber: 'RSLDC/EOI/CORR/2025/01',
      title: 'Extension of Last Date of Submission and Clarification on Financial Turnover Criteria',
      description: 'Submission last date extended from 15th May 2025 to 30th June 2025 due to requests from regional associations.',
      publishedDate: '2025-02-01',
      attachmentFileName: 'Corrigendum_01_Extension_Notice.pdf',
      attachmentFileSize: '640 KB',
      publishedBy: 'Shri Rajeshwar Sharma, IAS (Super Admin)',
      status: 'Published',
      previousStartDate: '2025-01-20',
      previousClosingDate: '2025-05-15',
      newStartDate: '2025-01-20',
      newClosingDate: '2025-06-30',
      reason: 'Administrative extension requested by Skill Development Directorate'
    }
  ];

  // EOI Version History
  private historyList: EoiVersionHistory[] = [
    {
      id: 'HIST-01',
      eoiId: 'EOI-2025-001',
      version: '1.0',
      date: '2025-01-15T10:00:00.000Z',
      changedBy: 'superadmin_rajasthan',
      changeType: 'Published',
      reason: 'Initial Official Publication on State EOI Portal',
      oldValue: 'Status: APPROVED',
      newValue: 'Status: PUBLISHED (Closing: 2025-05-15)',
      documentTitle: 'MMKVY_PIA_Empanelment_Guidelines_2025.pdf'
    },
    {
      id: 'HIST-02',
      eoiId: 'EOI-2025-001',
      version: '1.1',
      date: '2025-02-01T14:30:00.000Z',
      changedBy: 'superadmin_rajasthan',
      changeType: 'Rescheduled',
      reason: 'Administrative extension requested by Directorate; Corrigendum-01 issued',
      oldValue: 'Closing Date: 2025-05-15',
      newValue: 'Closing Date: 2025-06-30 (Corrigendum-01 attached)',
      documentTitle: 'Corrigendum_01_Extension_Notice.pdf'
    }
  ];

  // Applications Store (Responses)
  private defaultApplications: ApplicationItem[] = [
    {
      id: 'APP-2025-001',
      applicationNumber: 'APP-RSLDC-2025-00142',
      registrationNumber: 'REG-RJ-2024-8921',
      eoiId: 'EOI-2025-002', // Closed EOI
      eoiReferenceNo: 'RSLDC/EOI/2024-25/089',
      eoiTitle: 'Selection of Assessment & Certification Agencies for Recognition of Prior Learning (RPL)',
      schemeId: 'SCH-006',
      schemeName: 'Rajkvik Recognition of Prior Learning',
      category: 'General',
      applicantName: 'Dr. Ramesh Chandra Joshi',
      applicantEmail: 'rc.joshi@marwar-skilltech.org',
      applicantPhone: '+91 94140 12890',
      organizationName: 'Marwar SkillTech Foundation',
      organizationType: 'Society',
      submissionDate: '2024-11-28T16:20:00.000Z',
      amount: 28540,
      paymentStatus: 'Paid',
      transactionId: 'TXN-RAJBANK-90218847',
      status: 'Accepted',
      assignedCommitteeId: 'COMM-02',
      assignedCommitteeName: 'Centrally Sponsored Schemes Scrutiny Committee',
      formResponses: {
        'TC_LEGAL_NAME': 'Marwar Heritage Artisan Assessment Center',
        'SECTORS_OFFERED': ['Apparel, Made-Ups & Home Furnishing', 'Renewable Energy & Solar Installations'],
        'ANNUAL_CAPACITY': 1200,
        'CENTER_CARPET_AREA': 4800,
        'AVG_TURNOVER_LAKHS': 210.50,
        'HISTORICAL_PLACEMENT_PERC': 84.0,
        'NODAL_EMAIL': 'rc.joshi@marwar-skilltech.org',
        'NODAL_MOBILE': '9414012890',
        'COMMISSIONING_DATE': '2024-12-01',
        'OWNERSHIP_TYPE': 'Self Owned Freehold Property',
        'POWER_BACKUP_AVAILABLE': 'Dedicated DG Set (Minimum 15 KVA)',
        'SAFETY_AMENITIES': ['CCTV Surveillance with 30-Day Storage', 'Fire Extinguishers & Exit Signage', 'Biometric Attendance Integration']
      },
      uploadedDocuments: [
        { documentName: 'Certificate of Incorporation', fileName: 'Marwar_Society_Reg_Certificate.pdf', fileSize: '1.8 MB', verified: true },
        { documentName: 'NCVET/SSC Accreditation', fileName: 'NCVET_Accreditation_Cert.pdf', fileSize: '2.4 MB', verified: true },
        { documentName: 'Audited Balance Sheets', fileName: 'Audited_Accounts_FY22_24.pdf', fileSize: '8.2 MB', verified: true }
      ],
      reviewComments: [
        { reviewerName: 'Dr. Alok Verma, IAS', date: '2024-12-20', comment: 'All statutory criteria met with stellar past assessment track record. Approved.', status: 'Accepted' }
      ]
    },
    {
      id: 'APP-2025-002',
      applicationNumber: 'APP-RSLDC-2025-00143',
      registrationNumber: 'REG-RJ-2024-7712',
      eoiId: 'EOI-2025-002',
      eoiReferenceNo: 'RSLDC/EOI/2024-25/089',
      eoiTitle: 'Selection of Assessment & Certification Agencies for Recognition of Prior Learning (RPL)',
      schemeId: 'SCH-006',
      schemeName: 'Rajkvik Recognition of Prior Learning',
      category: 'Private Organization / Corporate',
      applicantName: 'Smt. Priya Nair',
      applicantEmail: 'priya.nair@apexeval.in',
      applicantPhone: '+91 98290 44321',
      organizationName: 'Apex Vocational Evaluators Pvt Ltd',
      organizationType: 'Private Organization',
      submissionDate: '2024-12-05T11:45:00.000Z',
      amount: 28540,
      paymentStatus: 'Paid',
      transactionId: 'TXN-RAJBANK-90219901',
      status: 'Under Review',
      assignedCommitteeId: 'COMM-02',
      assignedCommitteeName: 'Centrally Sponsored Schemes Scrutiny Committee',
      formResponses: {
        'TC_LEGAL_NAME': 'Apex Vocational Assessment Hub',
        'SECTORS_OFFERED': ['Automotive & Electric Vehicles (EV)', 'IT-ITeS & Artificial Intelligence'],
        'ANNUAL_CAPACITY': 850,
        'CENTER_CARPET_AREA': 3600,
        'AVG_TURNOVER_LAKHS': 185.00,
        'NODAL_EMAIL': 'priya.nair@apexeval.in',
        'NODAL_MOBILE': '9829044321',
        'OWNERSHIP_TYPE': 'Registered Long-Term Lease (3+ Years)'
      },
      uploadedDocuments: [
        { documentName: 'Certificate of Incorporation', fileName: 'Apex_Company_RoC.pdf', fileSize: '2.1 MB', verified: true },
        { documentName: 'NCVET/SSC Accreditation', fileName: 'SSC_Affiliation_Letter.pdf', fileSize: '1.9 MB', verified: true }
      ]
    },
    {
      id: 'APP-2025-003',
      applicationNumber: 'APP-RSLDC-2025-00144',
      registrationNumber: 'REG-RJ-2024-6504',
      eoiId: 'EOI-2025-002',
      eoiReferenceNo: 'RSLDC/EOI/2024-25/089',
      eoiTitle: 'Selection of Assessment & Certification Agencies for Recognition of Prior Learning (RPL)',
      schemeId: 'SCH-006',
      schemeName: 'Rajkvik Recognition of Prior Learning',
      category: 'General',
      applicantName: 'Shri Manoj Singhal',
      applicantEmail: 'singhal.manoj@globaleval.org',
      applicantPhone: '+91 97840 99120',
      organizationName: 'Global Human Capital Development Trust',
      organizationType: 'Trust',
      submissionDate: '2024-12-10T14:10:00.000Z',
      amount: 28540,
      paymentStatus: 'Paid',
      transactionId: 'TXN-RAJBANK-90220110',
      status: 'Rejected',
      assignedCommitteeId: 'COMM-02',
      assignedCommitteeName: 'Centrally Sponsored Schemes Scrutiny Committee',
      formResponses: {
        'TC_LEGAL_NAME': 'Global Skill Evaluation Lab',
        'ANNUAL_CAPACITY': 300,
        'CENTER_CARPET_AREA': 2200, // Below threshold
        'AVG_TURNOVER_LAKHS': 35.00  // Below threshold
      },
      uploadedDocuments: [],
      reviewComments: [
        { reviewerName: 'Shri Vikram Rathore', date: '2024-12-22', comment: 'Rejected in technical round. Center carpet area (2200 sq ft) and turnover (INR 35 Lakhs) do not satisfy minimum eligibility mandatory parameters.', status: 'Rejected' }
      ]
    },
    // Mock applications for OPEN EOI-2025-001 (Notice: While OPEN, individual responses are locked for regular viewers)
    {
      id: 'ISMS-EOI-2026-9871',
      applicationNumber: 'ISMS-EOI-2026-9871',
      registrationNumber: 'ISMS-REG-2026-8819',
      eoiId: 'EOI-2025-001',
      eoiReferenceNo: 'RSLDC/EOI/2025-26/001',
      eoiTitle: 'Empanelment of PIAs under MMKVY',
      schemeId: 'EOI-MMKVY-2026-01',
      schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      category: 'Category A - Mega Training Partner',
      applicantName: 'Vikramaditya Sharma',
      applicantEmail: 'vikramaditya@apexsolutions.in',
      applicantPhone: '+91 98290 12345',
      organizationName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
      organizationType: 'Private Limited Company',
      submissionDate: '2026-09-08T11:15:00.000Z',
      amount: 52500,
      paymentStatus: 'Paid',
      transactionId: 'TXN-ISMS-884920482',
      status: 'Under Review',
      assignedCommitteeId: 'COMM-01',
      assignedCommitteeName: 'State Skill Evaluation Committee (RSLDC)',
      formResponses: {
        'TC_LEGAL_NAME': 'Apex Skill Development Center (Jaipur HQ)',
        'ANNUAL_CAPACITY': 450,
        'CENTER_CARPET_AREA': 5200,
        'AVG_TURNOVER_LAKHS': 240.00
      },
      uploadedDocuments: [
        { documentName: 'Certificate of Incorporation', fileName: 'Apex_Incorporation_Certificate.pdf', fileSize: '2.1 MB', verified: true },
        { documentName: 'PAN & GSTIN Registration', fileName: 'GSTIN_Registration_Certificate.pdf', fileSize: '1.4 MB', verified: true }
      ]
    },
    {
      id: 'APP-2025-004',
      applicationNumber: 'APP-RSLDC-2025-00201',
      registrationNumber: 'REG-RJ-2025-1102',
      eoiId: 'EOI-2025-001',
      eoiReferenceNo: 'RSLDC/EOI/2025-26/001',
      eoiTitle: 'Empanelment of PIAs under MMKVY',
      schemeId: 'SCH-001',
      schemeName: 'Mukhya Mantri Kaushal Vikas Yojana',
      category: 'General',
      applicantName: 'Shri Sunil Meena',
      applicantEmail: 's.meena@rajasthanskills.com',
      applicantPhone: '+91 99280 11223',
      organizationName: 'Rajasthan Skills Infrastructure Pvt Ltd',
      organizationType: 'Private Organization',
      submissionDate: '2025-01-25T10:00:00.000Z',
      amount: 57080,
      paymentStatus: 'Paid',
      transactionId: 'TXN-RAJBANK-91102830',
      status: 'Submitted',
      formResponses: {},
      uploadedDocuments: []
    }
  ];

  private loadApplications(): ApplicationItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('isms_admin_applications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return this.defaultApplications;
  }

  private applications: ApplicationItem[] = this.loadApplications();

  // Dashboard Aggregates
  getDashboardSummary(): Observable<DashboardSummary> {
    const totalSchemes = 7;
    const activeSchemes = 7;
    const totalEOIs = this.eoiList.length;
    const draftEOIs = this.eoiList.filter(e => e.status === 'DRAFT').length;
    const publishedEOIs = this.eoiList.filter(e => e.status === 'PUBLISHED').length;
    const openEOIs = this.eoiList.filter(e => e.status === 'OPEN').length;
    const closedEOIs = this.eoiList.filter(e => e.status === 'CLOSED').length;
    const rescheduledEOIs = this.eoiList.filter(e => e.status === 'RESCHEDULED').length;
    const totalApplications = 97; // aggregated
    const underReview = 28;
    const accepted = 46;
    const rejected = 14;

    return of({
      totalSchemes,
      activeSchemes,
      totalEOIs,
      draftEOIs,
      publishedEOIs,
      openEOIs,
      closedEOIs,
      rescheduledEOIs,
      totalApplications,
      underReview,
      accepted,
      rejected
    });
  }

  getEois(): Observable<EoiItem[]> {
    return of([...this.eoiList]);
  }

  getEoiById(id: string): Observable<EoiItem | undefined> {
    const found = this.eoiList.find(e => e.id === id || e.referenceNo === id);
    return of(found ? { ...found } : undefined);
  }

  saveEoi(eoi: Partial<EoiItem>): Observable<EoiItem> {
    if (eoi.id) {
      const idx = this.eoiList.findIndex(e => e.id === eoi.id);
      if (idx !== -1) {
        this.eoiList[idx] = { 
          ...this.eoiList[idx], 
          ...eoi, 
          updatedAt: new Date().toISOString() 
        };
        this.auditService.logAction({
          user: 'superadmin_rajasthan',
          role: 'SUPER_ADMIN',
          module: 'EOI',
          action: 'Edited EOI',
          eoiId: eoi.id,
          oldValue: `EOI: ${this.eoiList[idx].title}`,
          newValue: `Updated: ${eoi.title || this.eoiList[idx].title}`,
          reason: 'Administrative configuration update'
        });
        this.saveEoisToStorage();
        return of({ ...this.eoiList[idx] });
      }
    }
    const newId = `EOI-2025-${String(this.eoiList.length + 1).padStart(3, '0')}`;
    const newEoi: EoiItem = {
      id: newId,
      referenceNo: eoi.referenceNo || `RSLDC/EOI/2025-26/${String(this.eoiList.length + 1).padStart(3, '0')}`,
      title: eoi.title || 'New Expression of Interest',
      schemeId: eoi.schemeId || 'SCH-001',
      schemeName: eoi.schemeName || 'Mukhya Mantri Kaushal Vikas Yojana',
      schemeCategory: eoi.schemeCategory || 'Skill Development & Training',
      department: eoi.department || 'Skill, Employment & Entrepreneurship Department',
      eoiCategory: eoi.eoiCategory || 'General',
      description: eoi.description || '',
      publishedDate: eoi.publishedDate || new Date().toISOString().split('T')[0],
      applicationStartDate: eoi.applicationStartDate || new Date().toISOString().split('T')[0],
      closingDate: eoi.closingDate || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      openingDate: eoi.openingDate || new Date(Date.now() + 62 * 86400000).toISOString().split('T')[0],
      reviewStartDate: eoi.reviewStartDate || new Date(Date.now() + 65 * 86400000).toISOString().split('T')[0],
      status: (eoi.status as EoiStatus) || 'DRAFT',
      version: '1.0',
      applicationCount: 0,
      committeeId: eoi.committeeId,
      committeeName: eoi.committeeName,
      attachedFileName: eoi.attachedFileName,
      attachedFileSize: eoi.attachedFileSize,
      fees: eoi.fees || {
        emdFee: 50000,
        applicationFee: 5000,
        processingFee: 1000,
        gstPercentage: 18,
        gstAmount: 1080,
        otherCharges: 0,
        totalFee: 57080
      },
      eligibility: eoi.eligibility || {
        id: `ELG-${Date.now()}`,
        organizationTypes: ['Private Organization', 'Society'],
        minExperienceYears: 3,
        minTurnoverCrores: 1.0,
        allowedLocations: ['Rajasthan'],
        department: eoi.department || 'Skill, Employment & Entrepreneurship Department',
        customCriteria: []
      },
      documents: eoi.documents || [],
      transactions: eoi.transactions || [],
      termsAndConditions: eoi.termsAndConditions || 'Adherence to RTPP Act 2012 is mandatory.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.eoiList.unshift(newEoi);
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'EOI',
      action: 'Created EOI',
      eoiId: newId,
      newValue: `Created: ${newEoi.referenceNo} - ${newEoi.title}`,
      reason: 'New EOI initialized in system'
    });
    this.saveEoisToStorage();
    return of({ ...newEoi });
  }

  publishEoi(id: string): Observable<EoiItem | undefined> {
    const e = this.eoiList.find(item => item.id === id);
    if (e) {
      const oldStatus = e.status;
      e.status = 'OPEN';
      e.updatedAt = new Date().toISOString();
      this.historyList.unshift({
        id: `HIST-${Date.now()}`,
        eoiId: id,
        version: e.version,
        date: new Date().toISOString(),
        changedBy: 'superadmin_rajasthan',
        changeType: 'Published',
        reason: 'Super Admin published EOI for public submissions',
        oldValue: `Status: ${oldStatus}`,
        newValue: 'Status: OPEN'
      });
      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'EOI',
        action: 'Published EOI',
        eoiId: id,
        oldValue: `Status: ${oldStatus}`,
        newValue: 'Status: OPEN',
        reason: 'Public tender notification open'
      });
      this.saveEoisToStorage();
      return of({ ...e });
    }
    return of(undefined);
  }

  closeEoi(id: string): Observable<EoiItem | undefined> {
    const e = this.eoiList.find(item => item.id === id);
    if (e) {
      const oldStatus = e.status;
      e.status = 'CLOSED';
      e.updatedAt = new Date().toISOString();
      this.historyList.unshift({
        id: `HIST-${Date.now()}`,
        eoiId: id,
        version: e.version,
        date: new Date().toISOString(),
        changedBy: 'superadmin_rajasthan',
        changeType: 'Status Changed',
        reason: 'EOI submission deadline reached - Form closed',
        oldValue: `Status: ${oldStatus}`,
        newValue: 'Status: CLOSED'
      });
      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'EOI',
        action: 'Closed EOI',
        eoiId: id,
        oldValue: `Status: ${oldStatus}`,
        newValue: 'Status: CLOSED',
        reason: 'Submission window closed. Responses unlocked for technical scrutiny.'
      });
      this.saveEoisToStorage();
      return of({ ...e });
    }
    return of(undefined);
  }

  // Rescheduling Rule 39 & 40: Mandatory Corrigendum/Amendment document upload!
  rescheduleEoi(
    id: string, 
    newStartDate: string, 
    newClosingDate: string, 
    reason: string, 
    documentData: {
      type: 'Corrigendum' | 'Amendment';
      documentNumber: string;
      title: string;
      description: string;
      attachmentFileName: string;
      attachmentFileSize: string;
    }
  ): Observable<{ success: boolean; eoi?: EoiItem; message: string }> {
    const e = this.eoiList.find(item => item.id === id);
    if (!e) {
      return of({ success: false, message: 'EOI not found.' });
    }
    if (!documentData.attachmentFileName) {
      return of({ success: false, message: 'Mandatory Corrigendum / Amendment document must be uploaded before rescheduling.' });
    }

    const oldStart = e.applicationStartDate;
    const oldClose = e.closingDate;
    
    // Update version e.g. 1.0 -> 1.1 or 1.1 -> 1.2
    const verParts = e.version.split('.');
    const minor = parseInt(verParts[1] || '0', 10) + 1;
    const newVersion = `${verParts[0]}.${minor}`;

    e.applicationStartDate = newStartDate;
    e.closingDate = newClosingDate;
    e.version = newVersion;
    e.status = 'OPEN';
    e.updatedAt = new Date().toISOString();

    // Create Corrigendum/Amendment Record
    const corrRecord: CorrigendumAmendment = {
      id: `CORR-${Date.now()}`,
      eoiId: id,
      eoiReferenceNo: e.referenceNo,
      version: newVersion,
      type: documentData.type,
      documentNumber: documentData.documentNumber,
      title: documentData.title,
      description: documentData.description,
      publishedDate: new Date().toISOString().split('T')[0],
      attachmentFileName: documentData.attachmentFileName,
      attachmentFileSize: documentData.attachmentFileSize,
      publishedBy: 'Shri Rajeshwar Sharma, IAS (Super Admin)',
      status: 'Published',
      previousStartDate: oldStart,
      previousClosingDate: oldClose,
      newStartDate: newStartDate,
      newClosingDate: newClosingDate,
      reason: reason
    };
    this.corrigendums.unshift(corrRecord);

    // Record in History
    this.historyList.unshift({
      id: `HIST-${Date.now()}`,
      eoiId: id,
      version: newVersion,
      date: new Date().toISOString(),
      changedBy: 'superadmin_rajasthan',
      changeType: 'Rescheduled',
      reason: reason,
      oldValue: `Start: ${oldStart}, Close: ${oldClose}`,
      newValue: `Start: ${newStartDate}, Close: ${newClosingDate} (${documentData.type} ${documentData.documentNumber})`,
      documentTitle: documentData.title,
      documentPath: documentData.attachmentFileName
    });

    // Record in Audit
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'EOI',
      action: 'Rescheduled EOI',
      eoiId: id,
      oldValue: `Closing Date: ${oldClose}`,
      newValue: `New Closing Date: ${newClosingDate} (${documentData.type}: ${documentData.documentNumber})`,
      reason: reason
    });
    this.saveEoisToStorage();

    return of({ success: true, eoi: { ...e }, message: 'EOI successfully rescheduled and Corrigendum published.' });
  }

  // Committee Assignment Rule 30
  assignCommittee(eoiId: string, committeeId: string, committeeName: string): Observable<boolean> {
    const e = this.eoiList.find(item => item.id === eoiId);
    if (e) {
      const oldComm = e.committeeName || 'Unassigned';
      e.committeeId = committeeId;
      e.committeeName = committeeName;
      e.updatedAt = new Date().toISOString();

      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'EOI',
        action: 'Assigned Committee',
        eoiId: eoiId,
        oldValue: `Committee: ${oldComm}`,
        newValue: `Committee: ${committeeName} (${committeeId})`,
        reason: 'Super Admin committee assignment for technical evaluation'
      });
      return of(true);
    }
    return of(false);
  }

  // Corrigendums
  getCorrigendums(eoiId?: string): Observable<CorrigendumAmendment[]> {
    if (!eoiId) return of([...this.corrigendums]);
    return of(this.corrigendums.filter(c => c.eoiId === eoiId));
  }

  saveCorrigendum(corr: Partial<CorrigendumAmendment>): Observable<CorrigendumAmendment> {
    const item: CorrigendumAmendment = {
      id: `CORR-${Date.now()}`,
      eoiId: corr.eoiId || 'EOI-2025-001',
      eoiReferenceNo: corr.eoiReferenceNo || 'RSLDC/EOI/2025-26/001',
      version: corr.version || '1.1',
      type: corr.type || 'Corrigendum',
      documentNumber: corr.documentNumber || `CORR-${Date.now()}`,
      title: corr.title || 'Amendment Notice',
      description: corr.description || '',
      publishedDate: new Date().toISOString().split('T')[0],
      attachmentFileName: corr.attachmentFileName || 'Official_Notification.pdf',
      attachmentFileSize: corr.attachmentFileSize || '1.2 MB',
      publishedBy: 'Shri Rajeshwar Sharma, IAS',
      status: corr.status || 'Published'
    };
    this.corrigendums.unshift(item);
    return of(item);
  }

  // Version History
  getVersionHistory(eoiId: string): Observable<EoiVersionHistory[]> {
    return of(this.historyList.filter(h => h.eoiId === eoiId));
  }

  // Responses / Application queries (Rules 33, 34, 35, 36)
  getApplicationsForEoi(eoiId: string): Observable<ApplicationItem[]> {
    return of(this.applications.filter(a => a.eoiId === eoiId));
  }

  getAllApplications(): Observable<ApplicationItem[]> {
    return of([...this.applications]);
  }

  getApplicationById(id: string): Observable<ApplicationItem | undefined> {
    const found = this.applications.find(a => a.id === id || a.applicationNumber === id);
    return of(found ? { ...found } : undefined);
  }

  updateApplicationStatus(
    appId: string, 
    status: any, 
    comment: string,
    grading?: string,
    category?: string,
    attachment?: CommitteeApprovalDocument
  ): Observable<boolean> {
    const a = this.applications.find(item => item.id === appId || item.applicationNumber === appId);
    if (a) {
      const oldStatus = a.status;
      a.status = status;
      if (grading) a.grading = grading;
      if (category) a.assignedCategory = category;
      if (comment) a.decisionRemarks = comment;
      if (attachment) a.committeeAttachment = attachment;

      if (!a.reviewComments) a.reviewComments = [];
      a.reviewComments.push({
        reviewerName: 'Shri Rajeshwar Sharma, IAS (Super Admin)',
        date: new Date().toISOString().split('T')[0],
        comment: comment,
        status: status
      });

      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'Applications',
        action: `Application Status Changed to ${status}`,
        applicationId: a.applicationNumber,
        oldValue: `Status: ${oldStatus}`,
        newValue: `Status: ${status}${grading ? ' | Grade: ' + grading : ''}${category ? ' | ' + category : ''}`,
        reason: comment
      });

      // Synchronize with applicant portal state
      if (this.eoiStateService) {
        const applicantStatus = status === 'Accepted' ? 'APPROVED' : status === 'Rejected' ? 'REJECTED' : 'UNDER_SCRUTINY';
        this.eoiStateService.applyAdminDecision(a.applicationNumber, applicantStatus, {
          grade: grading,
          category: category,
          remarks: comment,
          committeeAttachment: attachment as any
        });
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('isms_admin_applications', JSON.stringify(this.applications));
        } catch (e) {}
      }

      return of(true);
    }
    return of(false);
  }
}
