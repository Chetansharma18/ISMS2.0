import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { 
  SchemeMaster, SchemeCategoryMaster, EoiCategoryMaster, DepartmentMaster,
  OrganizationTypeMaster, UserTypeMaster, DesignationMaster, StateMaster,
  DistrictMaster, BlockMaster, DocumentTypeMaster, TransactionMaster,
  FeeMaster, RoleMaster, AccessLevelMaster, ApplicationStatusMaster,
  CommitteeRoleMaster 
} from '../models/admin.models';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private auditService = inject(AuditService);

  // 1. Schemes Master (Rule 1: Scheme must exist before creating an EOI. Mock values: MMKVY, MMYSY, MNSKSY, PMKVY, RAJKVIK, RAJKVIK RPL, RAJKVIKRTD, RRLP, RSTP, SAMARTH, SAKSHM)
  private schemes: SchemeMaster[] = [
    {
      id: 'SCH-001',
      schemeCode: 'MMKVY',
      schemeName: 'Mukhya Mantri Kaushal Vikas Yojana',
      shortName: 'MMKVY',
      department: 'Skill, Employment & Entrepreneurship',
      schemeCategory: 'Skill Development & Training',
      description: 'Comprehensive state skill training initiative targeting youth employment across priority sectors.',
      objective: 'To provide quality skill certifications to over 200,000 youth annually with guaranteed minimum placement linkages.',
      startDate: '2023-04-01',
      endDate: '2028-03-31',
      status: 'Active',
      eoiCount: 3,
      contactDepartment: 'RSLDC Directorate',
      contactEmail: 'mmkvy.support@rajasthan.gov.in',
      contactPhone: '+91 141 2795412',
      createdAt: '2023-04-01T00:00:00.000Z',
      updatedAt: '2025-01-10T11:20:00.000Z'
    },
    {
      id: 'SCH-002',
      schemeCode: 'PMKVY',
      schemeName: 'Pradhan Mantri Kaushal Vikas Yojana (State Component)',
      shortName: 'PMKVY-CSSM',
      department: 'Skill, Employment & Entrepreneurship',
      schemeCategory: 'Centrally Sponsored Scheme',
      description: 'Centrally sponsored state-managed component for demand-driven skilling in high-growth districts.',
      objective: 'Standardized industry-aligned certification adhering to National Skills Qualification Framework (NSQF).',
      startDate: '2023-08-01',
      endDate: '2026-07-31',
      status: 'Active',
      eoiCount: 2,
      contactDepartment: 'Mission Directorate PMKVY',
      contactEmail: 'pmkvy.cssm@rajasthan.gov.in',
      contactPhone: '+91 141 2795430',
      createdAt: '2023-08-01T00:00:00.000Z',
      updatedAt: '2024-12-05T09:15:00.000Z'
    },
    {
      id: 'SCH-003',
      schemeCode: 'RAJKVIK',
      schemeName: 'Rajasthan Kaushal Vikas Kendra Scheme',
      shortName: 'RAJKVIK',
      department: 'Skill, Employment & Entrepreneurship',
      schemeCategory: 'Infrastructure & Training Center Support',
      description: 'Establishment of state-of-the-art multi-skill centers at block and sub-divisional levels.',
      objective: 'Decentralized rural training infrastructure with smart classrooms and simulated industrial labs.',
      startDate: '2022-01-01',
      endDate: '2027-12-31',
      status: 'Active',
      eoiCount: 1,
      contactDepartment: 'Infrastructure Wing, RSLDC',
      contactEmail: 'rajkvik@rajasthan.gov.in',
      contactPhone: '+91 141 2795455',
      createdAt: '2022-01-01T00:00:00.000Z',
      updatedAt: '2024-10-18T16:45:00.000Z'
    },
    {
      id: 'SCH-004',
      schemeCode: 'SAMARTH',
      schemeName: 'Samarth Scheme for Special Vulnerable Groups',
      shortName: 'SAMARTH',
      department: 'Social Justice & Empowerment / Skill Dept',
      schemeCategory: 'Affirmative Action Skilling',
      description: 'Customized skilling and rehabilitation training for persons with disabilities, widows, and special categories.',
      objective: 'Inclusive livelihood enablement with 100% state scholarship and post-placement assistive support.',
      startDate: '2023-01-01',
      endDate: '2026-12-31',
      status: 'Active',
      eoiCount: 2,
      contactDepartment: 'Social Inclusion Wing',
      contactEmail: 'samarth.skill@rajasthan.gov.in',
      contactPhone: '+91 141 2795480',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T14:10:00.000Z'
    },
    {
      id: 'SCH-005',
      schemeCode: 'SAKSHM',
      schemeName: 'Saksham Scheme for Women Empowerment',
      shortName: 'SAKSHM',
      department: 'Women & Child Development / Skill Dept',
      schemeCategory: 'Women Entrepreneurship',
      description: 'Skill development programs dedicated to women self-help groups (SHGs) and aspiring female entrepreneurs.',
      objective: 'Empowering women with technical, digital marketing, and small enterprise management capabilities.',
      startDate: '2023-06-01',
      endDate: '2027-05-31',
      status: 'Active',
      eoiCount: 1,
      contactDepartment: 'Women Skilling Cell',
      contactEmail: 'saksham.women@rajasthan.gov.in',
      contactPhone: '+91 141 2795495',
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2024-11-20T10:30:00.000Z'
    },
    {
      id: 'SCH-006',
      schemeCode: 'RAJKVIK RPL',
      schemeName: 'Rajkvik Recognition of Prior Learning',
      shortName: 'RAJKVIK-RPL',
      department: 'Skill, Employment & Entrepreneurship',
      schemeCategory: 'Recognition of Prior Learning',
      description: 'Formal assessment and state certification for informal and traditional craftspersons and artisans.',
      objective: 'Certify unorganized sector workers to improve wage potential and bridge formal recognition gaps.',
      startDate: '2023-09-01',
      endDate: '2026-08-31',
      status: 'Active',
      eoiCount: 1,
      contactDepartment: 'RPL Assessment Cell',
      contactEmail: 'rpl.skill@rajasthan.gov.in',
      contactPhone: '+91 141 2795400',
      createdAt: '2023-09-01T00:00:00.000Z',
      updatedAt: '2024-09-15T12:00:00.000Z'
    },
    {
      id: 'SCH-007',
      schemeCode: 'RSTP',
      schemeName: 'Regular Skill Training Programme',
      shortName: 'RSTP',
      department: 'Skill, Employment & Entrepreneurship',
      schemeCategory: 'Core Skill Training',
      description: 'Continuous annual training batches operated through empanelled Project Implementing Agencies (PIAs).',
      objective: 'Industry cluster-based skilling in manufacturing, logistics, healthcare, and IT-ITeS sectors.',
      startDate: '2022-04-01',
      endDate: '2027-03-31',
      status: 'Active',
      eoiCount: 2,
      contactDepartment: 'Operations Division',
      contactEmail: 'rstp.ops@rajasthan.gov.in',
      contactPhone: '+91 141 2795460',
      createdAt: '2022-04-01T00:00:00.000Z',
      updatedAt: '2025-01-14T15:30:00.000Z'
    }
  ];

  // 2. Scheme Categories
  private schemeCategories: SchemeCategoryMaster[] = [
    { id: 'SC-01', categoryCode: 'SDT', categoryName: 'Skill Development & Training', description: 'Core domain training and skill upgrades', status: 'Active' },
    { id: 'SC-02', categoryCode: 'CSS', categoryName: 'Centrally Sponsored Scheme', description: 'Joint funding initiatives with Central ministries', status: 'Active' },
    { id: 'SC-03', categoryCode: 'INFRA', categoryName: 'Infrastructure & Training Center Support', description: 'Capital grants and lab setup', status: 'Active' },
    { id: 'SC-04', categoryCode: 'AFFIRM', categoryName: 'Affirmative Action Skilling', description: 'Reserved target beneficiaries and vulnerable groups', status: 'Active' },
    { id: 'SC-05', categoryCode: 'WOMEN', categoryName: 'Women Entrepreneurship', description: 'Exclusive programs for women and SHGs', status: 'Active' },
    { id: 'SC-06', categoryCode: 'RPL', categoryName: 'Recognition of Prior Learning', description: 'Certification of existing uncertified workforce', status: 'Active' },
    { id: 'SC-07', categoryCode: 'RECURRENT', categoryName: 'Core Skill Training', description: 'Continuous annual batches with empanelled partners', status: 'Active' }
  ];

  // 3. EOI Categories (Legacy screenshot mapping)
  private eoiCategories: EoiCategoryMaster[] = [
    { id: 'EC-01', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', schemeCategory: 'Skill Development & Training', categoryName: 'General', amount: 25000, processingFee: 2500, status: 'Active' },
    { id: 'EC-02', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', schemeCategory: 'Skill Development & Training', categoryName: 'Government Institution / Organisation', amount: 0, processingFee: 0, status: 'Active' },
    { id: 'EC-03', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', schemeCategory: 'Skill Development & Training', categoryName: 'Government Institution / PSU', amount: 0, processingFee: 1000, status: 'Active' },
    { id: 'EC-04', schemeName: 'Pradhan Mantri Kaushal Vikas Yojana (State Component)', schemeCategory: 'Centrally Sponsored Scheme', categoryName: 'Private Organization / Corporate', amount: 50000, processingFee: 5000, status: 'Active' },
    { id: 'EC-05', schemeName: 'Samarth Scheme for Special Vulnerable Groups', schemeCategory: 'Affirmative Action Skilling', categoryName: 'NGO / Non-Profit Trust', amount: 10000, processingFee: 1000, status: 'Active' },
    { id: 'EC-06', schemeName: 'Regular Skill Training Programme', schemeCategory: 'Core Skill Training', categoryName: 'Other', amount: 30000, processingFee: 3000, status: 'Active' }
  ];

  // 4. Department Master
  private departments: DepartmentMaster[] = [
    { id: 'DEP-01', departmentCode: 'SEED', departmentName: 'Skill, Employment & Entrepreneurship Department', shortName: 'SEED', description: 'Nodal department for youth workforce development and industrial skilling.', contactEmail: 'secedu-skill@rajasthan.gov.in', contactPhone: '+91 141 2227100', status: 'Active' },
    { id: 'DEP-02', departmentCode: 'RSLDC', departmentName: 'Rajasthan Skill & Livelihoods Development Corporation', shortName: 'RSLDC', description: 'State implementation mission and accreditation agency.', contactEmail: 'info@rsldc.in', contactPhone: '+91 141 2795400', status: 'Active' },
    { id: 'DEP-03', departmentCode: 'DTE', departmentName: 'Directorate of Technical Education', shortName: 'DTE', description: 'Polytechnics, ITIs and technical diploma institutes oversight.', contactEmail: 'dte.jodhpur@rajasthan.gov.in', contactPhone: '+91 291 2434220', status: 'Active' },
    { id: 'DEP-04', departmentCode: 'WCD', departmentName: 'Women & Child Development Department', shortName: 'WCD', description: 'Welfare, gender budgeting and women economic independence schemes.', contactEmail: 'dir-wcd@rajasthan.gov.in', contactPhone: '+91 141 2712211', status: 'Active' },
    { id: 'DEP-05', departmentCode: 'SJED', departmentName: 'Social Justice & Empowerment Department', shortName: 'SJED', description: 'Empowerment for SC/ST/OBC/EWS and specially-abled individuals.', contactEmail: 'sjed.director@rajasthan.gov.in', contactPhone: '+91 141 2226602', status: 'Active' },
    { id: 'DEP-06', departmentCode: 'IT&C', departmentName: 'Department of Information Technology & Communication', shortName: 'DoIT&C', description: 'State digital infrastructure, cyber security and e-governance.', contactEmail: 'secy-doitc@rajasthan.gov.in', contactPhone: '+91 141 2224855', status: 'Active' }
  ];

  // 5. Organization Type Master
  private organizationTypes: OrganizationTypeMaster[] = [
    { id: 'OT-01', code: 'GOV', organizationType: 'Government', description: 'State or Central Government departments directly', status: 'Active' },
    { id: 'OT-02', code: 'GOV_INST', organizationType: 'Government Institution', description: 'State universities, statutory boards or autonomous institutes', status: 'Active' },
    { id: 'OT-03', code: 'GOV_ORG', organizationType: 'Government Organization', description: 'State development agencies and mission directorates', status: 'Active' },
    { id: 'OT-04', code: 'PSU', organizationType: 'PSU', description: 'Public Sector Undertakings (Central or State)', status: 'Active' },
    { id: 'OT-05', code: 'PVT_ORG', organizationType: 'Private Organization', description: 'Registered Companies Act 2013 private or public limited entities', status: 'Active' },
    { id: 'OT-06', code: 'NGO', organizationType: 'NGO', description: 'Non-Governmental voluntary organizations with DARPAN ID', status: 'Active' },
    { id: 'OT-07', code: 'SOCIETY', organizationType: 'Society', description: 'Registered Societies Registration Act 1860 organizations', status: 'Active' },
    { id: 'OT-08', code: 'TRUST', organizationType: 'Trust', description: 'Registered Public or Charitable Trusts with 12A/80G status', status: 'Active' },
    { id: 'OT-09', code: 'UNIVERSITY', organizationType: 'University', description: 'UGC recognized Universities and deemed universities', status: 'Active' },
    { id: 'OT-10', code: 'COLLEGE', organizationType: 'College', description: 'Affiliated technical or vocational higher education colleges', status: 'Active' },
    { id: 'OT-11', code: 'OTHER', organizationType: 'Other', description: 'Other legally constituted corporate entities or consortia', status: 'Active' }
  ];

  // 6. User Type Master
  private userTypes: UserTypeMaster[] = [
    { id: 'UT-01', userTypeCode: 'SUPER_ADMIN', userTypeName: 'Super Admin', description: 'Supreme authority with global configuration, masters and EOI lifecycle control', status: 'Active' },
    { id: 'UT-02', userTypeCode: 'DEPT_ADMIN', userTypeName: 'Department Admin', description: 'Department-level administrator managing department schemes and users', status: 'Active' },
    { id: 'UT-03', userTypeCode: 'DEPT_USER', userTypeName: 'Department User', description: 'Operational desk officer verifying submissions and reports', status: 'Active' },
    { id: 'UT-04', userTypeCode: 'THIRD_PARTY', userTypeName: 'Third Party User', description: 'External technical evaluation consultants and auditing agencies', status: 'Active' },
    { id: 'UT-05', userTypeCode: 'APPLICANT', userTypeName: 'Applicant', description: 'Registered agency or organization applying against published EOIs', status: 'Active' },
    { id: 'UT-06', userTypeCode: 'APPROVAL_COMM', userTypeName: 'Approval Committee', description: 'Empanelled committee members performing application technical evaluations', status: 'Active' }
  ];

  // 7. Designation Master
  private designations: DesignationMaster[] = [
    { id: 'DES-01', designationCode: 'PRIN_SEC', designationName: 'Principal Secretary & State Mission Director', department: 'Skill, Employment & Entrepreneurship', description: 'Head of Administrative Department', status: 'Active' },
    { id: 'DES-02', designationCode: 'MAN_DIR', designationName: 'Managing Director, RSLDC', department: 'RSLDC', description: 'Executive head of corporation', status: 'Active' },
    { id: 'DES-03', designationCode: 'GEN_MGR', designationName: 'General Manager (EOI & Procurement)', department: 'RSLDC', description: 'Procurement and empanelment lead', status: 'Active' },
    { id: 'DES-04', designationCode: 'JT_DIR', designationName: 'Joint Director (Technical Evaluations)', department: 'Directorate of Technical Education', description: 'Technical scrutiny officer', status: 'Active' },
    { id: 'DES-05', designationCode: 'DY_MGR', designationName: 'Deputy Manager (Finance & Accounts)', department: 'RSLDC', description: 'Fee and bank guarantee verification officer', status: 'Active' },
    { id: 'DES-06', designationCode: 'ASST_DIR', designationName: 'Assistant Director (District Outreach)', department: 'Skill, Employment & Entrepreneurship', description: 'Field liaison and center audit officer', status: 'Active' },
    { id: 'DES-07', designationCode: 'TECH_LEAD', designationName: 'Chief Technology Officer / Senior IT Analyst', department: 'DoIT&C', description: 'Portal technical oversight and SSO administrator', status: 'Active' }
  ];

  // 8. State Master
  private states: StateMaster[] = [
    { id: 'ST-01', stateCode: '08', stateName: 'Rajasthan', stateShortCode: 'RJ', status: 'Active' },
    { id: 'ST-02', stateCode: '07', stateName: 'Delhi (NCT)', stateShortCode: 'DL', status: 'Active' },
    { id: 'ST-03', stateCode: '24', stateName: 'Gujarat', stateShortCode: 'GJ', status: 'Active' },
    { id: 'ST-04', stateCode: '23', stateName: 'Madhya Pradesh', stateShortCode: 'MP', status: 'Active' },
    { id: 'ST-05', stateCode: '06', stateName: 'Haryana', stateShortCode: 'HR', status: 'Active' },
    { id: 'ST-06', stateCode: '09', stateName: 'Uttar Pradesh', stateShortCode: 'UP', status: 'Active' }
  ];

  // 9. District Master (State -> District cascade)
  private districts: DistrictMaster[] = [
    { id: 'DST-01', stateCode: '08', stateName: 'Rajasthan', districtCode: '0801', districtName: 'Jaipur', status: 'Active' },
    { id: 'DST-02', stateCode: '08', stateName: 'Rajasthan', districtCode: '0802', districtName: 'Jodhpur', status: 'Active' },
    { id: 'DST-03', stateCode: '08', stateName: 'Rajasthan', districtCode: '0803', districtName: 'Udaipur', status: 'Active' },
    { id: 'DST-04', stateCode: '08', stateName: 'Rajasthan', districtCode: '0804', districtName: 'Kota', status: 'Active' },
    { id: 'DST-05', stateCode: '08', stateName: 'Rajasthan', districtCode: '0805', districtName: 'Ajmer', status: 'Active' },
    { id: 'DST-06', stateCode: '08', stateName: 'Rajasthan', districtCode: '0806', districtName: 'Bikaner', status: 'Active' },
    { id: 'DST-07', stateCode: '08', stateName: 'Rajasthan', districtCode: '0807', districtName: 'Alwar', status: 'Active' },
    { id: 'DST-08', stateCode: '08', stateName: 'Rajasthan', districtCode: '0808', districtName: 'Bhilwara', status: 'Active' },
    { id: 'DST-09', stateCode: '08', stateName: 'Rajasthan', districtCode: '0809', districtName: 'Bharatpur', status: 'Active' },
    { id: 'DST-10', stateCode: '08', stateName: 'Rajasthan', districtCode: '0810', districtName: 'Sikar', status: 'Active' },
    { id: 'DST-11', stateCode: '07', stateName: 'Delhi (NCT)', districtCode: '0701', districtName: 'New Delhi', status: 'Active' },
    { id: 'DST-12', stateCode: '24', stateName: 'Gujarat', districtCode: '2401', districtName: 'Ahmedabad', status: 'Active' }
  ];

  // 10. Block Master (State -> District -> Block cascade)
  private blocks: BlockMaster[] = [
    { id: 'BLK-01', stateCode: '08', stateName: 'Rajasthan', districtCode: '0801', districtName: 'Jaipur', blockCode: '080101', blockName: 'Amber', status: 'Active' },
    { id: 'BLK-02', stateCode: '08', stateName: 'Rajasthan', districtCode: '0801', districtName: 'Jaipur', blockCode: '080102', blockName: 'Bassie', status: 'Active' },
    { id: 'BLK-03', stateCode: '08', stateName: 'Rajasthan', districtCode: '0801', districtName: 'Jaipur', blockCode: '080103', blockName: 'Chaksu', status: 'Active' },
    { id: 'BLK-04', stateCode: '08', stateName: 'Rajasthan', districtCode: '0801', districtName: 'Jaipur', blockCode: '080104', blockName: 'Govindgarh', status: 'Active' },
    { id: 'BLK-05', stateCode: '08', stateName: 'Rajasthan', districtCode: '0801', districtName: 'Jaipur', blockCode: '080105', blockName: 'Jhotwara', status: 'Active' },
    { id: 'BLK-06', stateCode: '08', stateName: 'Rajasthan', districtCode: '0801', districtName: 'Jaipur', blockCode: '080106', blockName: 'Sanganer', status: 'Active' },
    { id: 'BLK-07', stateCode: '08', stateName: 'Rajasthan', districtCode: '0802', districtName: 'Jodhpur', blockCode: '080201', blockName: 'Mandore', status: 'Active' },
    { id: 'BLK-08', stateCode: '08', stateName: 'Rajasthan', districtCode: '0802', districtName: 'Jodhpur', blockCode: '080202', blockName: 'Luni', status: 'Active' },
    { id: 'BLK-09', stateCode: '08', stateName: 'Rajasthan', districtCode: '0802', districtName: 'Jodhpur', blockCode: '080203', blockName: 'Osian', status: 'Active' },
    { id: 'BLK-10', stateCode: '08', stateName: 'Rajasthan', districtCode: '0803', districtName: 'Udaipur', blockCode: '080301', blockName: 'Girwa', status: 'Active' },
    { id: 'BLK-11', stateCode: '08', stateName: 'Rajasthan', districtCode: '0803', districtName: 'Udaipur', blockCode: '080302', blockName: 'Badgaon', status: 'Active' },
    { id: 'BLK-12', stateCode: '08', stateName: 'Rajasthan', districtCode: '0804', districtName: 'Kota', blockCode: '080401', blockName: 'Ladpura', status: 'Active' }
  ];

  // 11. Document Type Master (Legacy screenshot mapping)
  private documentTypes: DocumentTypeMaster[] = [
    { id: 'DOC-01', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', documentCode: 'DOC_REG_CERT', documentName: 'Certificate of Incorporation / Registration Certificate', documentDescription: 'Legal incorporation document issued by RoC or Registrar of Societies', isRequired: true, allowedFileTypes: 'PDF', maxFileSizeMB: 5, status: 'Active' },
    { id: 'DOC-02', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', documentCode: 'DOC_GST_CERT', documentName: 'GST Registration Certificate', documentDescription: 'Form GST REG-06 showing active GSTIN in Rajasthan or Pan-India', isRequired: true, allowedFileTypes: 'PDF', maxFileSizeMB: 3, status: 'Active' },
    { id: 'DOC-03', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', documentCode: 'DOC_PAN_CARD', documentName: 'PAN Card of Organization', documentDescription: 'Permanent Account Number in the name of the applying legal entity', isRequired: true, allowedFileTypes: 'PDF, JPG', maxFileSizeMB: 2, status: 'Active' },
    { id: 'DOC-04', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', documentCode: 'DOC_AUDIT_BS', documentName: 'Audited Balance Sheets (Last 3 FY)', documentDescription: 'Statutory auditor-certified balance sheets and P&L with UDIN numbers', isRequired: true, allowedFileTypes: 'PDF', maxFileSizeMB: 15, status: 'Active' },
    { id: 'DOC-05', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', documentCode: 'DOC_TURNOVER_CA', documentName: 'CA Certificate of Annual Turnover', documentDescription: 'Specific CA certification proving minimum required turnover threshold', isRequired: true, allowedFileTypes: 'PDF', maxFileSizeMB: 5, status: 'Active' },
    { id: 'DOC-06', schemeName: 'Pradhan Mantri Kaushal Vikas Yojana (State Component)', documentCode: 'DOC_EXP_CRED', documentName: 'Past Experience & Work Orders', documentDescription: 'Completion certificates from State/Central skilling missions of past 3 years', isRequired: true, allowedFileTypes: 'PDF', maxFileSizeMB: 10, status: 'Active' },
    { id: 'DOC-07', schemeName: 'Samarth Scheme for Special Vulnerable Groups', documentCode: 'DOC_DARPAN_CERT', documentName: 'NITI Aayog NGO Darpan Registration Certificate', documentDescription: 'Valid Darpan unique portal registration ID certificate', isRequired: false, allowedFileTypes: 'PDF', maxFileSizeMB: 4, status: 'Active' },
    { id: 'DOC-08', schemeName: 'Regular Skill Training Programme', documentCode: 'DOC_AFFIDAVIT_NB', documentName: 'Non-Blacklisting Undertaking Affidavit', documentDescription: 'Notarized affidavit on INR 100 non-judicial stamp paper affirming non-debarment', isRequired: true, allowedFileTypes: 'PDF', maxFileSizeMB: 3, status: 'Active' }
  ];

  // 12. Transaction Master
  private transactions: TransactionMaster[] = [
    { id: 'TRX-01', transactionCode: 'TX_SUBMISSION', transactionName: 'EOI Submission', transactionType: 'Application Process', description: 'Application online submission gateway transaction record', status: 'Active' },
    { id: 'TRX-02', transactionCode: 'TX_EMD_PAY', transactionName: 'EMD Payment', transactionType: 'Earnest Money Deposit', description: 'Refundable / Security deposit transaction via e-Treasury or cyber receipt', status: 'Active' },
    { id: 'TRX-03', transactionCode: 'TX_APP_FEE', transactionName: 'Application Fee', transactionType: 'Non-Refundable Fee', description: 'Standard tender / EOI evaluation application charge', status: 'Active' },
    { id: 'TRX-04', transactionCode: 'TX_PROC_FEE', transactionName: 'Processing Fee', transactionType: 'RISL / Portal Charge', description: 'State IT processing and RISL gateway convenience charges', status: 'Active' },
    { id: 'TRX-05', transactionCode: 'TX_DOC_VERIFY', transactionName: 'Document Verification', transactionType: 'Scrutiny Audit', description: 'Physical or digital certificate verification verification stage', status: 'Active' },
    { id: 'TRX-06', transactionCode: 'TX_FINAL_SUB', transactionName: 'Final Submission', transactionType: 'Milestone Confirmation', description: 'Cryptographic digital signature final archive seal', status: 'Active' }
  ];

  // 13. Fee Master
  private fees: FeeMaster[] = [
    { id: 'FEE-01', feeCode: 'FEE_EMD_GEN', feeName: 'Earnest Money Deposit (General Category)', feeType: 'EMD', calculationType: 'Fixed', amount: 50000, gstApplicable: false, description: 'Refundable security deposit for general category applicants', status: 'Active' },
    { id: 'FEE-02', feeCode: 'FEE_APP_STD', feeName: 'Standard EOI Application Fee', feeType: 'EOI Fee', calculationType: 'Fixed', amount: 5000, gstApplicable: true, gstRate: 18, description: 'Non-refundable application scrutiny fee', status: 'Active' },
    { id: 'FEE-03', feeCode: 'FEE_RISL_PROC', feeName: 'RISL Processing Fee', feeType: 'Processing Fee', calculationType: 'Fixed', amount: 1000, gstApplicable: true, gstRate: 18, description: 'State IT department portal operational maintenance fee', status: 'Active' },
    { id: 'FEE-04', feeCode: 'FEE_EMD_PERC', feeName: 'Tender Value Linked EMD (2%)', feeType: 'EMD', calculationType: 'Percentage', amount: 0, percentage: 2.0, gstApplicable: false, description: '2 percent of estimated project allocation value', status: 'Active' },
    { id: 'FEE-05', feeCode: 'FEE_EMD_EXEMPT', feeName: 'Government/PSU Fee Exemption', feeType: 'EOI Fee', calculationType: 'Fixed', amount: 0, gstApplicable: false, description: 'Zero fee exemption for state and central government institutions', status: 'Active' }
  ];

  // 14. Role Master
  private roles: RoleMaster[] = [
    { id: 'ROL-01', roleCode: 'SUPER_ADMIN', roleName: 'Super Admin', description: 'Unrestricted state-level system and configuration administrator', status: 'Active' },
    { id: 'ROL-02', roleCode: 'DEPARTMENT_ADMIN', roleName: 'Department Admin', description: 'Department-specific administrator controlling department schemes', status: 'Active' },
    { id: 'ROL-03', roleCode: 'DEPARTMENT_USER', roleName: 'Department User', description: 'Executive operator reviewing EOI forms and issuing clarifications', status: 'Active' },
    { id: 'ROL-04', roleCode: 'APPROVAL_COMMITTEE', roleName: 'Approval Committee', description: 'Empanelled technical committee chair and voting members', status: 'Active' },
    { id: 'ROL-05', roleCode: 'APPLICANT', roleName: 'Applicant', description: 'External entity participating in EOI opportunities', status: 'Active' }
  ];

  // 15. Access Level Master (Granular permission matrix per module)
  private accessLevels: AccessLevelMaster[] = [
    {
      id: 'AL-01',
      roleCode: 'SUPER_ADMIN',
      roleName: 'Super Admin Access Profile',
      permissions: [
        { module: 'Dashboard', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Masters', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Schemes', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'EOI', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'EOI Form Builder', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Documents', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Transactions', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Fees', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Committees', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Users', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Applications', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Reports', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Audit Logs', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true },
        { module: 'Settings', view: true, create: true, edit: true, update: true, delete: true, publish: true, approve: true, export: true }
      ],
      status: 'Active'
    },
    {
      id: 'AL-02',
      roleCode: 'DEPARTMENT_ADMIN',
      roleName: 'Department Admin Access Profile',
      permissions: [
        { module: 'Dashboard', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: true },
        { module: 'Masters', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Schemes', view: true, create: true, edit: true, update: true, delete: false, publish: false, approve: true, export: true },
        { module: 'EOI', view: true, create: true, edit: true, update: true, delete: false, publish: false, approve: false, export: true },
        { module: 'EOI Form Builder', view: true, create: true, edit: true, update: true, delete: false, publish: false, approve: false, export: false },
        { module: 'Documents', view: true, create: true, edit: true, update: true, delete: false, publish: false, approve: false, export: true },
        { module: 'Transactions', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: true },
        { module: 'Fees', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Committees', view: true, create: true, edit: true, update: true, delete: false, publish: false, approve: true, export: true },
        { module: 'Users', view: true, create: true, edit: true, update: true, delete: false, publish: false, approve: false, export: true },
        { module: 'Applications', view: true, create: false, edit: true, update: true, delete: false, publish: false, approve: true, export: true },
        { module: 'Reports', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: true },
        { module: 'Audit Logs', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: true },
        { module: 'Settings', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false }
      ],
      status: 'Active'
    },
    {
      id: 'AL-03',
      roleCode: 'APPROVAL_COMMITTEE',
      roleName: 'Committee Member Access Profile',
      permissions: [
        { module: 'Dashboard', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Masters', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Schemes', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'EOI', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'EOI Form Builder', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Documents', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Transactions', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Fees', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Committees', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Users', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Applications', view: true, create: false, edit: true, update: true, delete: false, publish: false, approve: true, export: true },
        { module: 'Reports', view: true, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: true },
        { module: 'Audit Logs', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false },
        { module: 'Settings', view: false, create: false, edit: false, update: false, delete: false, publish: false, approve: false, export: false }
      ],
      status: 'Active'
    }
  ];

  // 16. Application Status Master
  private applicationStatuses: ApplicationStatusMaster[] = [
    { id: 'APS-01', statusCode: 'Draft', statusName: 'Draft', badgeColor: 'slate', description: 'Application initiated by applicant but not yet submitted', status: 'Active' },
    { id: 'APS-02', statusCode: 'Submitted', statusName: 'Submitted', badgeColor: 'blue', description: 'Successfully submitted online by the applicant', status: 'Active' },
    { id: 'APS-03', statusCode: 'Payment Pending', statusName: 'Payment Pending', badgeColor: 'amber', description: 'Awaiting fee payment or bank reconciliation', status: 'Active' },
    { id: 'APS-04', statusCode: 'Payment Verified', statusName: 'Payment Verified', badgeColor: 'emerald', description: 'Fee payment verified via e-Treasury gateway', status: 'Active' },
    { id: 'APS-05', statusCode: 'Under Review', statusName: 'Under Review', badgeColor: 'indigo', description: 'Desk scrutiny underway by Department officers', status: 'Active' },
    { id: 'APS-06', statusCode: 'Committee Review', statusName: 'Committee Review', badgeColor: 'purple', description: 'Assigned to technical evaluation committee for scoring', status: 'Active' },
    { id: 'APS-07', statusCode: 'Clarification Required', statusName: 'Clarification Required', badgeColor: 'yellow', description: 'Deficiency query raised; applicant reply awaited', status: 'Active' },
    { id: 'APS-08', statusCode: 'Resubmitted', statusName: 'Resubmitted', badgeColor: 'cyan', description: 'Applicant provided clarifications/revised documents', status: 'Active' },
    { id: 'APS-09', statusCode: 'Accepted', statusName: 'Accepted', badgeColor: 'green', description: 'Technically qualified and accepted for empanelment', status: 'Active' },
    { id: 'APS-10', statusCode: 'Rejected', statusName: 'Rejected', badgeColor: 'red', description: 'Disqualified or rejected by committee due to criteria mismatch', status: 'Active' },
    { id: 'APS-11', statusCode: 'Withdrawn', statusName: 'Withdrawn', badgeColor: 'zinc', description: 'Voluntarily withdrawn by applicant organization', status: 'Active' }
  ];

  // 17. Committee Role Master
  private committeeRoles: CommitteeRoleMaster[] = [
    { id: 'CR-01', code: 'CHAIRPERSON', name: 'Chairperson', description: 'Presiding authority conducting evaluation proceedings and signing off final recommendations', status: 'Active' },
    { id: 'CR-02', code: 'MEMBER', name: 'Member', description: 'Domain technical expert evaluating and scoring individual sections', status: 'Active' },
    { id: 'CR-03', code: 'REVIEWER', name: 'Reviewer', description: 'Independent external auditor or technical assessor', status: 'Active' },
    { id: 'CR-04', code: 'SECRETARY', name: 'Secretary', description: 'Member-Secretary drafting minutes, agendas and maintaining committee records', status: 'Active' }
  ];

  // ================= SCHEMES CRUD =================
  getSchemes(): Observable<SchemeMaster[]> {
    return of([...this.schemes]);
  }

  getSchemeById(id: string): Observable<SchemeMaster | undefined> {
    const found = this.schemes.find(s => s.id === id || s.schemeCode === id);
    return of(found ? { ...found } : undefined);
  }

  saveScheme(scheme: Partial<SchemeMaster>): Observable<SchemeMaster> {
    if (scheme.id) {
      const index = this.schemes.findIndex(s => s.id === scheme.id);
      if (index !== -1) {
        const oldVal = `Scheme: ${this.schemes[index].schemeName} (${this.schemes[index].schemeCode})`;
        this.schemes[index] = { 
          ...this.schemes[index], 
          ...scheme, 
          updatedAt: new Date().toISOString() 
        };
        this.auditService.logAction({
          user: 'superadmin_rajasthan',
          role: 'SUPER_ADMIN',
          module: 'Schemes',
          action: 'Updated Scheme',
          oldValue: oldVal,
          newValue: `Updated to: ${this.schemes[index].schemeName} (${this.schemes[index].schemeCode})`,
          reason: 'Administrative update'
        });
        return of({ ...this.schemes[index] });
      }
    }
    const newScheme: SchemeMaster = {
      id: `SCH-${String(this.schemes.length + 1).padStart(3, '0')}`,
      schemeCode: scheme.schemeCode || 'SCH_NEW',
      schemeName: scheme.schemeName || 'New Scheme',
      shortName: scheme.shortName || scheme.schemeCode || '',
      department: scheme.department || 'Skill, Employment & Entrepreneurship',
      schemeCategory: scheme.schemeCategory || 'Skill Development & Training',
      description: scheme.description || '',
      objective: scheme.objective || '',
      startDate: scheme.startDate || new Date().toISOString().split('T')[0],
      endDate: scheme.endDate || new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
      status: scheme.status || 'Active',
      eoiCount: 0,
      contactDepartment: scheme.contactDepartment,
      contactEmail: scheme.contactEmail,
      contactPhone: scheme.contactPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.schemes.unshift(newScheme);
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Schemes',
      action: 'Created Scheme',
      newValue: `Created: ${newScheme.schemeName} (${newScheme.schemeCode})`,
      reason: 'New Scheme created in Scheme Master'
    });
    return of({ ...newScheme });
  }

  toggleSchemeStatus(id: string): Observable<SchemeMaster | undefined> {
    const s = this.schemes.find(item => item.id === id);
    if (s) {
      const oldStatus = s.status;
      s.status = s.status === 'Active' ? 'Inactive' : 'Active';
      s.updatedAt = new Date().toISOString();
      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'Schemes',
        action: s.status === 'Active' ? 'Activated Scheme' : 'Deactivated Scheme',
        oldValue: `Status: ${oldStatus}`,
        newValue: `Status: ${s.status}`,
        reason: 'Super Admin status toggle'
      });
      return of({ ...s });
    }
    return of(undefined);
  }

  // Soft delete for scheme (Rule 11)
  softDeleteScheme(id: string): Observable<boolean> {
    const s = this.schemes.find(item => item.id === id);
    if (s) {
      s.status = 'Inactive';
      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'Schemes',
        action: 'Deactivated Scheme (Soft Delete)',
        oldValue: `Scheme: ${s.schemeName}`,
        newValue: 'Status: Inactive / Soft Deleted',
        reason: 'Protected historical references - Soft deleted'
      });
      return of(true);
    }
    return of(false);
  }

  // ================= GENERAL MASTERS GETTERS & ACTIONS =================
  getSchemeCategories(): Observable<SchemeCategoryMaster[]> { return of([...this.schemeCategories]); }
  saveSchemeCategory(cat: Partial<SchemeCategoryMaster>): Observable<SchemeCategoryMaster> {
    if (cat.id) {
      const idx = this.schemeCategories.findIndex(c => c.id === cat.id);
      if (idx !== -1) {
        this.schemeCategories[idx] = { ...this.schemeCategories[idx], ...cat };
        return of({ ...this.schemeCategories[idx] });
      }
    }
    const newCat: SchemeCategoryMaster = {
      id: `SC-${String(this.schemeCategories.length + 1).padStart(2, '0')}`,
      categoryCode: cat.categoryCode || 'CAT',
      categoryName: cat.categoryName || '',
      description: cat.description || '',
      status: cat.status || 'Active'
    };
    this.schemeCategories.unshift(newCat);
    return of({ ...newCat });
  }

  getEoiCategories(): Observable<EoiCategoryMaster[]> { return of([...this.eoiCategories]); }
  saveEoiCategory(cat: Partial<EoiCategoryMaster>): Observable<EoiCategoryMaster> {
    if (cat.id) {
      const idx = this.eoiCategories.findIndex(c => c.id === cat.id);
      if (idx !== -1) {
        this.eoiCategories[idx] = { ...this.eoiCategories[idx], ...cat };
        return of({ ...this.eoiCategories[idx] });
      }
    }
    const newCat: EoiCategoryMaster = {
      id: `EC-${String(this.eoiCategories.length + 1).padStart(2, '0')}`,
      schemeName: cat.schemeName || 'All Schemes',
      schemeCategory: cat.schemeCategory || 'General',
      categoryName: cat.categoryName || 'New Category',
      amount: cat.amount || 0,
      processingFee: cat.processingFee || 0,
      status: cat.status || 'Active'
    };
    this.eoiCategories.unshift(newCat);
    return of({ ...newCat });
  }

  getDepartments(): Observable<DepartmentMaster[]> { return of([...this.departments]); }
  getOrganizationTypes(): Observable<OrganizationTypeMaster[]> { return of([...this.organizationTypes]); }
  getUserTypes(): Observable<UserTypeMaster[]> { return of([...this.userTypes]); }
  getDesignations(): Observable<DesignationMaster[]> { return of([...this.designations]); }
  
  getStates(): Observable<StateMaster[]> { return of([...this.states]); }
  
  getDistricts(stateCode?: string): Observable<DistrictMaster[]> {
    if (!stateCode) return of([...this.districts]);
    return of(this.districts.filter(d => d.stateCode === stateCode));
  }

  getBlocks(districtCode?: string): Observable<BlockMaster[]> {
    if (!districtCode) return of([...this.blocks]);
    return of(this.blocks.filter(b => b.districtCode === districtCode));
  }

  getDocumentTypes(): Observable<DocumentTypeMaster[]> { return of([...this.documentTypes]); }
  saveDocumentType(doc: Partial<DocumentTypeMaster>): Observable<DocumentTypeMaster> {
    if (doc.id) {
      const idx = this.documentTypes.findIndex(d => d.id === doc.id);
      if (idx !== -1) {
        this.documentTypes[idx] = { ...this.documentTypes[idx], ...doc };
        return of({ ...this.documentTypes[idx] });
      }
    }
    const newDoc: DocumentTypeMaster = {
      id: `DOC-${String(this.documentTypes.length + 1).padStart(2, '0')}`,
      schemeName: doc.schemeName || 'All Schemes',
      documentCode: doc.documentCode || 'DOC_NEW',
      documentName: doc.documentName || 'New Document',
      documentDescription: doc.documentDescription || '',
      isRequired: doc.isRequired ?? true,
      allowedFileTypes: doc.allowedFileTypes || 'PDF',
      maxFileSizeMB: doc.maxFileSizeMB || 5,
      status: doc.status || 'Active'
    };
    this.documentTypes.unshift(newDoc);
    return of({ ...newDoc });
  }

  getTransactions(): Observable<TransactionMaster[]> { return of([...this.transactions]); }
  getFees(): Observable<FeeMaster[]> { return of([...this.fees]); }
  getRoles(): Observable<RoleMaster[]> { return of([...this.roles]); }
  getAccessLevels(): Observable<AccessLevelMaster[]> { return of([...this.accessLevels]); }
  getApplicationStatuses(): Observable<ApplicationStatusMaster[]> { return of([...this.applicationStatuses]); }
  getCommitteeRoles(): Observable<CommitteeRoleMaster[]> { return of([...this.committeeRoles]); }
}
