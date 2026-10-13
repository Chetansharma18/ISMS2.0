import { resolveMock } from '../mock.config';

import {
  CourseMasterItem,
  SectorMasterItem,
  DesignationMasterItem,
  DistrictBlockMasterItem,
  EoiCategoryItem,
  PermissionMasterItem,
  SchemeMasterItem,
  UserRoleMasterItem,
  SchemeCategoryMasterItem,
  RemarkMasterItem,
  GradingMasterItem,
  TwoStepVerificationItem,
  AuthMethodType,
  DynamicFormBuilderItem,
  DynamicFormField,
  DynamicFormFieldType,
  FormStep
} from '../../models/admin-masters.model';

// Types live in core/models; re-exported so existing imports keep working.
export type {
  CourseMasterItem,
  SectorMasterItem,
  DesignationMasterItem,
  DistrictBlockMasterItem,
  EoiCategoryItem,
  PermissionMasterItem,
  SchemeMasterItem,
  UserRoleMasterItem,
  SchemeCategoryMasterItem,
  RemarkMasterItem,
  GradingMasterItem,
  TwoStepVerificationItem,
  AuthMethodType,
  DynamicFormBuilderItem,
  DynamicFormField,
  DynamicFormFieldType,
  FormStep
};

export const MOCK_COURSE_MASTER_ITEMS: CourseMasterItem[] = resolveMock([
  {
    sNo: 1,
    id: 'c-1',
    sector: 'Aerospace and Aviation',
    jobRoleName: 'Drone Operator - Multi Rotor',
    jobRoleCode: 'AAS/Q6301',
    version: '1.0',
    nsqfLevel: '4',
    commonNormsCategory: 'I',
    theoryDurationHours: 150,
    practicalOjtDurationHours: '180+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 490,
    courseValidUpToDate: '28-Apr-25',
    remark: 'Expired'
  },
  {
    sNo: 2,
    id: 'c-2',
    sector: 'Aerospace and Aviation',
    jobRoleName: 'Drone Operator - Multi Rotor',
    jobRoleCode: 'AAS/Q6301',
    version: '2.0',
    nsqfLevel: '4',
    commonNormsCategory: 'I',
    theoryDurationHours: 120,
    practicalOjtDurationHours: '150+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 430,
    courseValidUpToDate: '8-May-28',
    remark: 'New Version'
  },
  {
    sNo: 3,
    id: 'c-3',
    sector: 'Agriculture',
    jobRoleName: 'Design and construct Vertical Garden',
    jobRoleCode: 'AGR/N0856',
    version: '1.0',
    nsqfLevel: '4',
    commonNormsCategory: 'I',
    theoryDurationHours: 22,
    practicalOjtDurationHours: '15',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 137,
    courseValidUpToDate: '-',
    remark: 'Not Valid'
  },
  {
    sNo: 4,
    id: 'c-4',
    sector: 'Agriculture',
    jobRoleName: 'Repair & Maintenance of solar powered farm equipment/ machinery',
    jobRoleCode: 'AGR/N1150',
    version: '1.0',
    nsqfLevel: '4',
    commonNormsCategory: 'I',
    theoryDurationHours: 22,
    practicalOjtDurationHours: '15',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 137,
    courseValidUpToDate: '-',
    remark: 'Not Valid'
  },
  {
    sNo: 5,
    id: 'c-5',
    sector: 'Agriculture',
    jobRoleName: 'Seed Bank Management',
    jobRoleCode: 'AGR/N7835',
    version: '1.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 22,
    practicalOjtDurationHours: '15',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 137,
    courseValidUpToDate: '-',
    remark: 'Not Valid'
  },
  {
    sNo: 6,
    id: 'c-6',
    sector: 'Agriculture',
    jobRoleName: 'Spice Crop Cultivator',
    jobRoleCode: 'AGR/Q0603',
    version: '2.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 180,
    practicalOjtDurationHours: '150',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 430,
    courseValidUpToDate: '29-Mar-26',
    remark: 'Expired'
  },
  {
    sNo: 7,
    id: 'c-7',
    sector: 'Agriculture',
    jobRoleName: 'Floriculturist',
    jobRoleCode: 'AGR/Q0701',
    version: '3.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 160,
    practicalOjtDurationHours: '140+30',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 430,
    courseValidUpToDate: '-',
    remark: 'Expired'
  },
  {
    sNo: 8,
    id: 'c-8',
    sector: 'Agriculture',
    jobRoleName: 'Floriculturist',
    jobRoleCode: 'AGR/Q0701',
    version: '4.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 160,
    practicalOjtDurationHours: '260+30',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 550,
    courseValidUpToDate: '-',
    remark: 'Not Valid'
  },
  {
    sNo: 9,
    id: 'c-9',
    sector: 'Agriculture',
    jobRoleName: 'Floriculturist',
    jobRoleCode: 'AGR/Q0701',
    version: '4.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 120,
    practicalOjtDurationHours: '180+30',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 430,
    courseValidUpToDate: '18-Feb-28',
    remark: 'Modify version – course hours changed (previously 550)'
  },
  {
    sNo: 10,
    id: 'c-10',
    sector: 'Agriculture',
    jobRoleName: 'Florist',
    jobRoleCode: 'AGR/Q0703',
    version: '4.0',
    nsqfLevel: '2.5',
    commonNormsCategory: 'II',
    theoryDurationHours: 90,
    practicalOjtDurationHours: '120+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 370,
    courseValidUpToDate: '-',
    remark: 'Not Valid'
  },
  {
    sNo: 11,
    id: 'c-11',
    sector: 'Agriculture',
    jobRoleName: 'Florist',
    jobRoleCode: 'AGR/Q0703',
    version: '4.0',
    nsqfLevel: '2.5',
    commonNormsCategory: 'II',
    theoryDurationHours: 60,
    practicalOjtDurationHours: '120+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 340,
    courseValidUpToDate: '30-May-27',
    remark: 'Modify version – course hours changed (previously 370)'
  },
  {
    sNo: 12,
    id: 'c-12',
    sector: 'Agriculture',
    jobRoleName: 'Master Gardener',
    jobRoleCode: 'AGR/Q0801',
    version: '4.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 180,
    practicalOjtDurationHours: '150+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 490,
    courseValidUpToDate: '-',
    remark: 'Not Valid'
  },
  {
    sNo: 13,
    id: 'c-13',
    sector: 'Agriculture',
    jobRoleName: 'Master Gardener',
    jobRoleCode: 'AGR/Q0801',
    version: '4.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 120,
    practicalOjtDurationHours: '150+60',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 430,
    courseValidUpToDate: '30-May-27',
    remark: 'Modify version – course hours changed (previously 490)'
  },
  {
    sNo: 14,
    id: 'c-14',
    sector: 'Agriculture',
    jobRoleName: 'Assistant Gardener',
    jobRoleCode: 'AGR/Q0804',
    version: '3.0',
    nsqfLevel: '3',
    commonNormsCategory: 'II',
    theoryDurationHours: 120,
    practicalOjtDurationHours: '150',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 370,
    courseValidUpToDate: '-',
    remark: 'Expired'
  },
  {
    sNo: 15,
    id: 'c-15',
    sector: 'Agriculture',
    jobRoleName: 'Assistant Gardener',
    jobRoleCode: 'AGR/Q0804',
    version: '4.0',
    nsqfLevel: '3',
    commonNormsCategory: 'II',
    theoryDurationHours: 90,
    practicalOjtDurationHours: '150+30',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 370,
    courseValidUpToDate: '18-Feb-28',
    remark: 'New Version'
  },
  {
    sNo: 16,
    id: 'c-16',
    sector: 'Agriculture',
    jobRoleName: 'Hydroponics Technician',
    jobRoleCode: 'AGR/Q0808',
    version: '3.0',
    nsqfLevel: '4',
    commonNormsCategory: 'II',
    theoryDurationHours: 150,
    practicalOjtDurationHours: '120',
    itSoftSkillTrainingHours: 100,
    totalQpHours: 370,
    courseValidUpToDate: '-',
    remark: 'Expired'
  }
]);

export const MOCK_SECTOR_MASTER_ITEMS: SectorMasterItem[] = resolveMock([
  { sNo: 1, id: 'sec-1', sectorName: 'Aerospace and Aviation', sectorCode: 'SEC-AERO-01', status: 'Active' },
  { sNo: 2, id: 'sec-2', sectorName: 'Agriculture', sectorCode: 'SEC-AGRI-02', status: 'Active' },
  { sNo: 3, id: 'sec-3', sectorName: 'Apparel', sectorCode: 'SEC-APP-03', status: 'Active' },
  { sNo: 4, id: 'sec-4', sectorName: 'Automotive', sectorCode: 'SEC-AUTO-04', status: 'Active' },
  { sNo: 5, id: 'sec-5', sectorName: 'Beauty & Wellness', sectorCode: 'SEC-BW-05', status: 'Active' },
  { sNo: 6, id: 'sec-6', sectorName: 'Healthcare', sectorCode: 'SEC-HC-06', status: 'Active' },
  { sNo: 7, id: 'sec-7', sectorName: 'IT-ITeS', sectorCode: 'SEC-IT-07', status: 'Active' },
  { sNo: 8, id: 'sec-8', sectorName: 'Logistics', sectorCode: 'SEC-LOG-08', status: 'Active' }
]);

export const MOCK_DESIGNATION_MASTER_ITEMS: DesignationMasterItem[] = resolveMock([
  { sNo: 1, id: 'desig-1', designationName: 'Managing Director', designationCode: 'MD', departmentWing: 'Administration', status: 'Active' },
  { sNo: 2, id: 'desig-2', designationName: 'Joint Director', designationCode: 'JD', departmentWing: 'Operations & Skill Training', status: 'Active' },
  { sNo: 3, id: 'desig-3', designationName: 'Deputy Director', designationCode: 'DD', departmentWing: 'Scrutiny & Approvals', status: 'Active' },
  { sNo: 4, id: 'desig-4', designationName: 'District Nodal Officer', designationCode: 'DNO', departmentWing: 'Operations & Skill Training', status: 'Active' },
  { sNo: 5, id: 'desig-5', designationName: 'Assistant Manager - Accounts', designationCode: 'AM-ACC', departmentWing: 'Finance & Accounts', status: 'Active' },
  { sNo: 6, id: 'desig-6', designationName: 'IT Project Lead', designationCode: 'IT-LEAD', departmentWing: 'IT & CCTV Monitoring', status: 'Active' }
]);

export const MOCK_DISTRICT_BLOCK_MASTER_ITEMS: DistrictBlockMasterItem[] = resolveMock([
  { sNo: 1, id: 'db-1', districtName: 'Jaipur', districtCode: 'JPR', blockName: 'Amber', blockCode: 'JPR-AMB', status: 'Active' },
  { sNo: 2, id: 'db-2', districtName: 'Jaipur', districtCode: 'JPR', blockName: 'Sanganer', blockCode: 'JPR-SNG', status: 'Active' },
  { sNo: 3, id: 'db-3', districtName: 'Jodhpur', districtCode: 'JDH', blockName: 'Mandore', blockCode: 'JDH-MND', status: 'Active' },
  { sNo: 4, id: 'db-4', districtName: 'Udaipur', districtCode: 'UDP', blockName: 'Girwa', blockCode: 'UDP-GRW', status: 'Active' },
  { sNo: 5, id: 'db-5', districtName: 'Ajmer', districtCode: 'AJM', blockName: 'Kishangarh', blockCode: 'AJM-KSG', status: 'Active' },
  { sNo: 6, id: 'db-6', districtName: 'Kota', districtCode: 'KTA', blockName: 'Ladpura', blockCode: 'KTA-LDP', status: 'Active' }
]);

export const MOCK_EOI_CATEGORY_ITEMS: EoiCategoryItem[] = resolveMock([
  { sNo: 1, id: 'cat-1', categoryTitle: 'General', description: 'Standard Expression of Interest for all eligible training partners across general sectors.', status: 'Active' },
  { sNo: 2, id: 'cat-2', categoryTitle: 'Special', description: 'Specialized scheme proposals for specific target demographics, tribal regions, or high-priority sectors.', status: 'Active' }
]);

export const MOCK_PERMISSION_MASTER_ITEMS: PermissionMasterItem[] = resolveMock([]);

export const MOCK_SCHEME_MASTER_ITEMS: SchemeMasterItem[] = resolveMock([
  { sNo: 1, id: 'sch-1', schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana', schemeCategory: 'Rajvik', categoryName: 'GENERAL', amount: 5000000, processFees: 10000, status: 'Active' },
  { sNo: 2, id: 'sch-2', schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)', schemeCategory: 'samarth', categoryName: 'GOVERNMENT INSTITUTION/PSU', amount: 7500000, processFees: 15000, status: 'Active' },
  { sNo: 3, id: 'sch-3', schemeName: 'Mukhyamantri Yuva Sambal Yojana', schemeCategory: 'saksham', categoryName: 'GOVERNMENT INSTITUTION/INSTITUTION', amount: 2500000, processFees: 5000, status: 'Active' },
  { sNo: 4, id: 'sch-4', schemeName: 'Mukhya Mantri Yuva Kaushal Yojana', schemeCategory: 'Rajvik, samarth', categoryName: 'SPECIAL TARGET GROUP', amount: 10000000, processFees: 25000, status: 'Active' }
]);

export const MOCK_USER_ROLE_MASTER_ITEMS: UserRoleMasterItem[] = resolveMock([
  { sNo: 1, id: 'role-1', roleTypeName: 'Super Admin', permissions: ['View EOI Configuration', 'Create & Edit EOI', 'Delete EOI Proposal', 'Manage Master Records', 'Batch Approval & Scrutiny', 'Camera CCTV Live Monitoring'], status: 'Active' },
  { sNo: 2, id: 'role-2', roleTypeName: 'Department Officer', permissions: ['View EOI Configuration', 'Create & Edit EOI', 'Batch Approval & Scrutiny'], status: 'Active' },
  { sNo: 3, id: 'role-3', roleTypeName: 'Scrutiny Officer', permissions: ['View EOI Configuration', 'Batch Approval & Scrutiny'], status: 'Active' },
  { sNo: 4, id: 'role-4', roleTypeName: 'Training Partner', permissions: ['View EOI Configuration', 'Grievance Redressal Access'], status: 'Active' }
]);

export const MOCK_SCHEME_CATEGORY_MASTER_ITEMS: SchemeCategoryMasterItem[] = resolveMock([
  { sNo: 1, id: 'sc-1', categoryName: 'Rajvik', schemeName: 'Rajvik', status: 'Active' },
  { sNo: 2, id: 'sc-2', categoryName: 'samarth', schemeName: 'samarth', status: 'Active' },
  { sNo: 3, id: 'sc-3', categoryName: 'saksham', schemeName: 'saksham', status: 'Active' },
  { sNo: 4, id: 'sc-4', categoryName: 'na', schemeName: 'na', status: 'Active' },
  { sNo: 5, id: 'sc-5', categoryName: 'ALL', schemeName: 'ALL', status: 'Active' }
]);

export const MOCK_REMARK_MASTER_ITEMS: RemarkMasterItem[] = resolveMock([
  {
    sNo: 1,
    id: 'rem-1',
    remarkType: 'Positive remark',
    description: 'All submitted compliance documents verified and approved.',
    status: 'Active'
  },
  {
    sNo: 2,
    id: 'rem-2',
    remarkType: 'Positive remark',
    description: 'Infrastructure and training center facilities meet required standards.',
    status: 'Active'
  },
  {
    sNo: 3,
    id: 'rem-3',
    remarkType: 'Negative remark',
    description: 'Discrepancy observed in financial turnover documents.',
    status: 'Active'
  },
  {
    sNo: 4,
    id: 'rem-4',
    remarkType: 'Negative remark',
    description: 'Incomplete trainer certification details provided.',
    status: 'Active'
  }
]);

export const MOCK_GRADING_MASTER_ITEMS: GradingMasterItem[] = resolveMock([
  {
    sNo: 1,
    id: 'grade-1',
    grade: 'A+',
    minimum: 85,
    maximum: 100,
    range: '85 - 100',
    status: 'Active'
  },
  {
    sNo: 2,
    id: 'grade-2',
    grade: 'A',
    minimum: 70,
    maximum: 84,
    range: '70 - 84',
    status: 'Active'
  },
  {
    sNo: 3,
    id: 'grade-3',
    grade: 'B',
    minimum: 55,
    maximum: 69,
    range: '55 - 69',
    status: 'Active'
  },
  {
    sNo: 4,
    id: 'grade-4',
    grade: 'C',
    minimum: 40,
    maximum: 54,
    range: '40 - 54',
    status: 'Active'
  },
  {
    sNo: 5,
    id: 'grade-5',
    grade: 'D',
    minimum: 0,
    maximum: 39,
    range: '0 - 39',
    status: 'Active'
  }
]);

export const MOCK_TWO_STEP_VERIFICATION_ITEMS: TwoStepVerificationItem[] = resolveMock([
  {
    sNo: 1,
    id: '2fa-1',
    roleType: 'Super Admin',
    authTypes: ['OTP', 'Auth App', 'PIN'],
    status: 'Active'
  },
  {
    sNo: 2,
    id: '2fa-2',
    roleType: 'Department Officer',
    authTypes: ['OTP', 'Auth App'],
    status: 'Active'
  },
  {
    sNo: 3,
    id: '2fa-3',
    roleType: 'Scrutiny Officer',
    authTypes: ['OTP', 'PIN'],
    status: 'Active'
  },
  {
    sNo: 4,
    id: '2fa-4',
    roleType: 'Training Partner',
    authTypes: ['OTP'],
    status: 'Active'
  }
]);

export const MOCK_DYNAMIC_FORM_BUILDER_ITEMS: DynamicFormBuilderItem[] = resolveMock([
  {
    sNo: 1,
    id: 'form-company-reg',
    formType: 'Organisation Registration Form',
    isStepForm: true,
    status: 'Active',
    createdAt: '2026-10-13',
    steps: [
      {
        id: 'stp-cr-1',
        stepNumber: 1,
        title: 'Organisation Details',
        fields: [
          { id: 'crf-1', label: 'Organisation Name', type: 'text', mandatory: true },
          { id: 'crf-2', label: 'Nature of Entity', type: 'dropdown', mandatory: true, options: ['Private Limited Company', 'Public Limited Company', 'Partnership Firm', 'Limited Liability Partnership (LLP)', 'Sole Proprietorship', 'Society / Trust / NGO'], optionsText: 'Private Limited Company, Public Limited Company, Partnership Firm, Limited Liability Partnership (LLP), Sole Proprietorship, Society / Trust / NGO' },
          { id: 'crf-3', label: 'Registration No. (CIN / Reg. No.)', type: 'text', mandatory: true },
          { id: 'crf-4', label: 'Date of Registration', type: 'datepicker', mandatory: true },
          { id: 'crf-5', label: 'State / UT of Registration', type: 'dropdown', mandatory: true, options: ['Rajasthan', 'Delhi', 'Maharashtra', 'Gujarat', 'Uttar Pradesh', 'Karnataka', 'Haryana', 'Madhya Pradesh', 'Punjab', 'Tamil Nadu'], optionsText: 'Rajasthan, Delhi, Maharashtra, Gujarat, Uttar Pradesh, Karnataka, Haryana, Madhya Pradesh, Punjab, Tamil Nadu' },
          { id: 'crf-6', label: 'Certificate of Registration / Incorporation', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 3, maxSizeMb: 5 },
          { id: 'crf-7', label: 'Organisation PAN', type: 'text', mandatory: true },
          { id: 'crf-8', label: 'Organisation PAN Card', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 2, maxSizeMb: 5 },
          { id: 'crf-9', label: 'GST Registered', type: 'dropdown', mandatory: true, options: ['Yes', 'No'], optionsText: 'Yes, No' },
          { id: 'crf-10', label: 'MSME / Udyam Registered', type: 'dropdown', mandatory: true, options: ['Yes', 'No'], optionsText: 'Yes, No' },
          { id: 'crf-11', label: 'NSDC Partner', type: 'dropdown', mandatory: false, options: ['Not Applicable', 'Yes', 'No'], optionsText: 'Not Applicable, Yes, No' },
          { id: 'crf-12', label: 'Organisation Contact No.', type: 'number', mandatory: true },
          { id: 'crf-13', label: 'Organisation Email ID', type: 'text', mandatory: true },
          { id: 'crf-14', label: 'Website', type: 'text', mandatory: false },
          { id: 'crf-15', label: 'Registered Address', type: 'text', mandatory: true },
          { id: 'crf-16', label: 'State / UT', type: 'dropdown', mandatory: true, options: ['Rajasthan', 'Delhi', 'Maharashtra', 'Gujarat', 'Uttar Pradesh', 'Karnataka'], optionsText: 'Rajasthan, Delhi, Maharashtra, Gujarat, Uttar Pradesh, Karnataka' },
          { id: 'crf-17', label: 'District', type: 'dropdown', mandatory: true, options: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'], optionsText: 'Jaipur, Jodhpur, Udaipur, Kota, Ajmer, Bikaner' },
          { id: 'crf-18', label: 'PIN Code', type: 'number', mandatory: true },
          { id: 'crf-19', label: 'Office Address', type: 'text', mandatory: true },
          { id: 'crf-20', label: 'Office State / UT', type: 'dropdown', mandatory: true, options: ['Rajasthan', 'Delhi', 'Maharashtra', 'Gujarat', 'Uttar Pradesh', 'Karnataka'], optionsText: 'Rajasthan, Delhi, Maharashtra, Gujarat, Uttar Pradesh, Karnataka' },
          { id: 'crf-21', label: 'Office District', type: 'dropdown', mandatory: true, options: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'], optionsText: 'Jaipur, Jodhpur, Udaipur, Kota, Ajmer, Bikaner' },
          { id: 'crf-22', label: 'Office PIN Code', type: 'number', mandatory: true }
        ]
      },
      {
        id: 'stp-cr-2',
        stepNumber: 2,
        title: 'Authorized Person',
        fields: [
          { id: 'crf-201', label: 'Full Name', type: 'text', mandatory: true },
          { id: 'crf-202', label: 'Designation', type: 'dropdown', mandatory: false, options: ['Director', 'Managing Director', 'Partner', 'Proprietor', 'Authorized Signatory', 'CEO / President'], optionsText: 'Director, Managing Director, Partner, Proprietor, Authorized Signatory, CEO / President' },
          { id: 'crf-203', label: 'Date of Birth', type: 'datepicker', mandatory: true },
          { id: 'crf-204', label: 'Age', type: 'number', mandatory: false },
          { id: 'crf-205', label: 'PAN', type: 'text', mandatory: true },
          { id: 'crf-206', label: 'Mobile No.', type: 'number', mandatory: true },
          { id: 'crf-207', label: 'Email Address', type: 'text', mandatory: true },
          { id: 'crf-208', label: 'Aadhaar No. (Optional)', type: 'number', mandatory: false },
          { id: 'crf-209', label: 'Bhamashah No. (Optional)', type: 'text', mandatory: false },
          { id: 'crf-210', label: 'Voter ID No. (Optional)', type: 'text', mandatory: false },
          { id: 'crf-211', label: 'Passport No. (Optional)', type: 'text', mandatory: false },
          { id: 'crf-212', label: 'State', type: 'dropdown', mandatory: false, options: ['Rajasthan', 'Delhi', 'Maharashtra', 'Gujarat', 'Uttar Pradesh'], optionsText: 'Rajasthan, Delhi, Maharashtra, Gujarat, Uttar Pradesh' },
          { id: 'crf-213', label: 'Residential Address', type: 'text', mandatory: false },
          { id: 'crf-214', label: 'Authorization Letter / Board Resolution', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 3, maxSizeMb: 5 },
          { id: 'crf-215', label: 'Authorized Person Identity Proof', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 2, maxSizeMb: 5 }
        ]
      },
      {
        id: 'stp-cr-3',
        stepNumber: 3,
        title: 'Bank Details',
        fields: [
          { id: 'crf-301', label: 'Name of the Bank', type: 'dropdown', mandatory: true, options: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank', 'Bank of Baroda', 'Axis Bank', 'Canara Bank', 'Union Bank of India'], optionsText: 'State Bank of India, HDFC Bank, ICICI Bank, Punjab National Bank, Bank of Baroda, Axis Bank, Canara Bank, Union Bank of India' },
          { id: 'crf-302', label: 'Branch Name', type: 'text', mandatory: true },
          { id: 'crf-303', label: 'Transfer Mode', type: 'dropdown', mandatory: true, options: ['NEFT', 'RTGS', 'IMPS'], optionsText: 'NEFT, RTGS, IMPS' },
          { id: 'crf-304', label: 'Account Type', type: 'dropdown', mandatory: true, options: ['Current', 'Savings', 'Cash Credit', 'Overdraft'], optionsText: 'Current, Savings, Cash Credit, Overdraft' },
          { id: 'crf-305', label: 'Account Holder Name', type: 'text', mandatory: true },
          { id: 'crf-306', label: 'Account Number', type: 'number', mandatory: true },
          { id: 'crf-307', label: 'IFSC Code', type: 'text', mandatory: true },
          { id: 'crf-308', label: 'MICR Code (Optional)', type: 'number', mandatory: false },
          { id: 'crf-309', label: 'Branch Address', type: 'text', mandatory: true },
          { id: 'crf-310', label: 'Upload Cancelled Cheque / Bank Passbook', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 2, maxSizeMb: 5 }
        ]
      },
      {
        id: 'stp-cr-4',
        stepNumber: 4,
        title: 'Preview & Submit',
        fields: [
          { id: 'crf-401', label: 'Declaration & Verification', type: 'text', mandatory: true },
          { id: 'crf-402', label: 'Authorized Signatory Undertaking', type: 'dropdown', mandatory: true, options: ['I agree and declare all details are accurate', 'Details verified by Authorized Person'], optionsText: 'I agree and declare all details are accurate, Details verified by Authorized Person' },
          { id: 'crf-403', label: 'Signatory Signature / Stamp', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 1, maxSizeMb: 2 }
        ]
      }
    ],
    fields: []
  },
  {
    sNo: 2,
    id: 'form-eoi-config',
    formType: 'EOI Configuration Form',
    isStepForm: false,
    status: 'Active',
    createdAt: '2026-10-13',
    fields: [
      { id: 'eoi-1', label: 'EOI Reference No.', type: 'text', mandatory: true },
      {
        id: 'eoi-2',
        label: 'Scheme',
        type: 'dropdown',
        mandatory: true,
        options: [
          'Vishwakarma Yuva Udyami Protsahan Yojana',
          'Mukhyamantri Yuva Swarojgar Yojana (2026)',
          'Mukhyamantri Yuva Sambal Yojana',
          'Mukhya Mantri Yuva Kaushal Yojana'
        ],
        optionsText: 'Vishwakarma Yuva Udyami Protsahan Yojana, Mukhyamantri Yuva Swarojgar Yojana (2026), Mukhyamantri Yuva Sambal Yojana, Mukhya Mantri Yuva Kaushal Yojana'
      },
      {
        id: 'eoi-3',
        label: 'Scheme Category',
        type: 'dropdown',
        mandatory: false,
        options: ['Rajvik', 'samarth', 'saksham', 'na', 'ALL'],
        optionsText: 'Rajvik, samarth, saksham, na, ALL'
      },
      { id: 'eoi-4', label: 'Date of EoI Published', type: 'datepicker', mandatory: true },
      { id: 'eoi-5', label: 'Last Date of EoI Submission', type: 'datepicker', mandatory: true },
      {
        id: 'eoi-6',
        label: 'EOI Category',
        type: 'dropdown',
        mandatory: true,
        options: ['General', 'Special'],
        optionsText: 'General, Special'
      },
      { id: 'eoi-7', label: 'EOI Description', type: 'text', mandatory: false },
      { id: 'eoi-8', label: 'EMD Fee', type: 'number', mandatory: true },
      { id: 'eoi-9', label: 'Process Fee', type: 'number', mandatory: true },
      {
        id: 'eoi-10',
        label: 'Attach File',
        type: 'photo',
        mandatory: true,
        minPhotos: 1,
        maxPhotos: 5,
        maxSizeMb: 25
      },
      {
        id: 'eoi-11',
        label: 'EOI Documents',
        type: 'dropdown',
        mandatory: true,
        options: [
          'Registration Certificate / Incorporation',
          'Audited Balance Sheet & Financial Statements',
          'PAN Card & GST Registration Certificate',
          'Past Experience & Work Order Copies',
          'Power of Attorney / Board Resolution',
          'Affidavit / Non-Blacklisting Declaration'
        ],
        optionsText: 'Registration Certificate / Incorporation, Audited Balance Sheet & Financial Statements, PAN Card & GST Registration Certificate, Past Experience & Work Order Copies, Power of Attorney / Board Resolution, Affidavit / Non-Blacklisting Declaration'
      }
    ]
  },
  {
    sNo: 3,
    id: 'form-apply-eoi',
    formType: 'Apply for EOI Form',
    isStepForm: true,
    status: 'Active',
    createdAt: '2026-10-13',
    steps: [
      {
        id: 'step-otr',
        stepNumber: 1,
        title: 'OTR Profile',
        fields: [
          { id: 'eoi-otr-1', label: 'NAME (SHORT NAME)', type: 'text', mandatory: true },
          { id: 'eoi-otr-2', label: 'FULL NAME OF ORGANIZATION', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-3',
            label: 'NATURE OF ENTITY',
            type: 'dropdown',
            mandatory: true,
            options: ['Private Limited', 'Public Limited', 'Partnership', 'Proprietorship', 'Society / Trust', 'LLP'],
            optionsText: 'Private Limited, Public Limited, Partnership, Proprietorship, Society / Trust, LLP'
          },
          { id: 'eoi-otr-4', label: 'REGISTRATION NUMBER (CIN)', type: 'text', mandatory: true },
          { id: 'eoi-otr-5', label: 'DATE OF REGISTRATION', type: 'datepicker', mandatory: true },
          {
            id: 'eoi-otr-6',
            label: 'STATE / UT OF REGISTRATION',
            type: 'dropdown',
            mandatory: true,
            options: ['Rajasthan', 'Delhi', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Maharashtra'],
            optionsText: 'Rajasthan, Delhi, Haryana, Uttar Pradesh, Gujarat, Maharashtra'
          },
          { id: 'eoi-otr-7', label: 'COMPANY PAN', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-8',
            label: 'GST REGISTERED',
            type: 'dropdown',
            mandatory: true,
            options: ['Yes', 'No'],
            optionsText: 'Yes, No'
          },
          { id: 'eoi-otr-9', label: 'GSTIN', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-10',
            label: 'MSME / UDYAM REGISTERED',
            type: 'dropdown',
            mandatory: true,
            options: ['Yes', 'No'],
            optionsText: 'Yes, No'
          },
          { id: 'eoi-otr-11', label: 'UDYAM REGISTRATION NO.', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-12',
            label: 'NSDC PARTNER STATUS',
            type: 'dropdown',
            mandatory: false,
            options: ['Approved', 'Applied', 'Not Applicable'],
            optionsText: 'Approved, Applied, Not Applicable'
          },
          { id: 'eoi-otr-13', label: 'COMPANY CONTACT NO.', type: 'text', mandatory: true },
          { id: 'eoi-otr-14', label: 'COMPANY EMAIL-ID', type: 'text', mandatory: true },
          { id: 'eoi-otr-15', label: 'WEBSITE', type: 'text', mandatory: false },
          { id: 'eoi-otr-16', label: 'REGISTERED ADDRESS', type: 'text', mandatory: true },
          { id: 'eoi-otr-17', label: 'OFFICE ADDRESS', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-18',
            label: 'ATTACHED REGISTRATION DOCUMENTS',
            type: 'photo',
            mandatory: true,
            minPhotos: 1,
            maxPhotos: 4,
            maxSizeMb: 25
          },
          { id: 'eoi-otr-19', label: 'FULL NAME', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-20',
            label: 'DESIGNATION',
            type: 'dropdown',
            mandatory: true,
            options: ['Authorized Representative', 'Director', 'Partner', 'Proprietor', 'Managing Trustee'],
            optionsText: 'Authorized Representative, Director, Partner, Proprietor, Managing Trustee'
          },
          { id: 'eoi-otr-21', label: 'DATE OF BIRTH / AGE', type: 'datepicker', mandatory: true },
          { id: 'eoi-otr-22', label: 'OFFICIAL MOBILE NO.', type: 'text', mandatory: true },
          { id: 'eoi-otr-23', label: 'OFFICIAL EMAIL-ID', type: 'text', mandatory: true },
          { id: 'eoi-otr-24', label: 'PAN', type: 'text', mandatory: true },
          { id: 'eoi-otr-25', label: 'AADHAAR NUMBER', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-26',
            label: 'STATE',
            type: 'dropdown',
            mandatory: true,
            options: ['Rajasthan', 'Delhi', 'Haryana', 'Uttar Pradesh', 'Gujarat'],
            optionsText: 'Rajasthan, Delhi, Haryana, Uttar Pradesh, Gujarat'
          },
          { id: 'eoi-otr-27', label: 'RESIDENCE ADDRESS', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-28',
            label: 'ATTACHED SIGNATORY DOCUMENTS',
            type: 'photo',
            mandatory: true,
            minPhotos: 1,
            maxPhotos: 2,
            maxSizeMb: 25
          },
          {
            id: 'eoi-otr-29',
            label: 'BANK NAME',
            type: 'dropdown',
            mandatory: true,
            options: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank', 'Bank of Baroda'],
            optionsText: 'State Bank of India, HDFC Bank, ICICI Bank, Punjab National Bank, Bank of Baroda'
          },
          { id: 'eoi-otr-30', label: 'BRANCH NAME', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-31',
            label: 'ACCOUNT TYPE',
            type: 'dropdown',
            mandatory: true,
            options: ['Current Account', 'Savings Account'],
            optionsText: 'Current Account, Savings Account'
          },
          { id: 'eoi-otr-32', label: 'ACCOUNT HOLDER NAME', type: 'text', mandatory: true },
          { id: 'eoi-otr-33', label: 'ACCOUNT NUMBER', type: 'text', mandatory: true },
          { id: 'eoi-otr-34', label: 'IFSC CODE', type: 'text', mandatory: true },
          {
            id: 'eoi-otr-35',
            label: 'TRANSFER MODE',
            type: 'dropdown',
            mandatory: true,
            options: ['NEFT', 'RTGS', 'IMPS'],
            optionsText: 'NEFT, RTGS, IMPS'
          },
          {
            id: 'eoi-otr-36',
            label: 'CANCELLED CHEQUE / PASSBOOK',
            type: 'photo',
            mandatory: true,
            minPhotos: 1,
            maxPhotos: 1,
            maxSizeMb: 10
          }
        ]
      },
      {
        id: 'step-upload-docs',
        stepNumber: 2,
        title: 'Upload Documents',
        fields: [
          { id: 'eoi-doc-1', label: 'Covering Letter (Annexure 1)', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-2', label: 'Audited Financial Statements (Annexure 3)', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-3', label: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-4', label: 'Statutory Compliance Self-Declaration (Annexure 7)', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-5', label: 'Signed & Sealed EOI Document', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-6', label: 'Debarment Undertaking Document', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-7', label: 'Training & Placement Track Record (Annexure 5)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-8', label: 'Active Skill Development Centres (Annexure 4)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-9', label: 'Board of Directors Details (Annexure 8)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-10', label: 'Industry Placement Tie-ups & MOUs (Annexure 9)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-11', label: 'Relevant Sector Experience Proof (Annexure 10)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-12', label: 'District Cluster Mobilization Plan (Annexure 11)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-13', label: 'Technical Evaluation Matrix (Annexure 12)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-14', label: 'Supporting Credentials & Accreditations (Annexure 13)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-15', label: 'NSDC Stake Partner Certificate', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 },
          { id: 'eoi-doc-16', label: 'CA Turnover Certificate with UDIN (Annexure 14)', type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 1, maxSizeMb: 25 }
        ]
      }
    ],
    fields: []
  },
  {
    sNo: 4,
    id: 'form-dept-user',
    formType: 'Department User Registration Form',
    isStepForm: false,
    status: 'Active',
    createdAt: '2026-10-13',
    fields: [
      { id: 'du-1', label: 'SSO ID', type: 'text', mandatory: true },
      {
        id: 'du-2',
        label: 'Role Type',
        type: 'dropdown',
        mandatory: true,
        options: ['Super Admin', 'Admin', 'Department User', 'Training Partner', 'Inspection Agency', 'Finance Officer'],
        optionsText: 'Super Admin, Admin, Department User, Training Partner, Inspection Agency, Finance Officer'
      },
      { id: 'du-3', label: 'First Name', type: 'text', mandatory: true },
      { id: 'du-4', label: 'Last Name', type: 'text', mandatory: true },
      { id: 'du-5', label: 'E-Mail', type: 'text', mandatory: true },
      { id: 'du-6', label: 'Mobile No.', type: 'number', mandatory: true },
      { id: 'du-7', label: 'Date Of Birth', type: 'datepicker', mandatory: false },
      { id: 'du-8', label: 'Aadhaar Id', type: 'number', mandatory: false },
      {
        id: 'du-9',
        label: 'Designation',
        type: 'dropdown',
        mandatory: false,
        options: ['Joint Director', 'Deputy Director', 'Assistant Director', 'Section Officer', 'Project Officer', 'Clerk'],
        optionsText: 'Joint Director, Deputy Director, Assistant Director, Section Officer, Project Officer, Clerk'
      },
      {
        id: 'du-10',
        label: 'Scheme Name',
        type: 'dropdown',
        mandatory: false,
        options: [
          'All Schemes (4 selected)',
          'Vishwakarma Yuva Udyami Protsahan Yojana',
          'Mukhyamantri Yuva Swarojgar Yojana (2026)',
          'Mukhyamantri Yuva Sambal Yojana',
          'Mukhya Mantri Yuva Kaushal Yojana'
        ],
        optionsText: 'All Schemes (4 selected), Vishwakarma Yuva Udyami Protsahan Yojana, Mukhyamantri Yuva Swarojgar Yojana (2026), Mukhyamantri Yuva Sambal Yojana, Mukhya Mantri Yuva Kaushal Yojana'
      },
      {
        id: 'du-11',
        label: 'District',
        type: 'dropdown',
        mandatory: false,
        options: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bharatpur', 'Bhilwara'],
        optionsText: 'Jaipur, Jodhpur, Udaipur, Kota, Bikaner, Ajmer, Alwar, Bharatpur, Bhilwara'
      },
      {
        id: 'du-12',
        label: 'Block Name',
        type: 'dropdown',
        mandatory: false,
        options: ['All Blocks', 'Amber', 'Bassi', 'Chaksu', 'Govindgarh', 'Jamwa Ramgarh', 'Jhotwara', 'Kotputli', 'Sanganer', 'Shahpura', 'Viratnagar'],
        optionsText: 'All Blocks, Amber, Bassi, Chaksu, Govindgarh, Jamwa Ramgarh, Jhotwara, Kotputli, Sanganer, Shahpura, Viratnagar'
      }
    ]
  }
]);

