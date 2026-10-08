import { resolveMock } from '../mock.config';

export interface CourseMasterItem {
  sNo: number;
  id: string;
  sector: string;
  jobRoleName: string;
  jobRoleCode: string;
  version: string;
  nsqfLevel: string;
  commonNormsCategory: string;
  theoryDurationHours: number;
  practicalOjtDurationHours: string;
  itSoftSkillTrainingHours: number;
  totalQpHours: number;
  courseValidUpToDate: string;
  remark: string;
}

export interface SectorMasterItem {
  sNo: number;
  id: string;
  sectorName: string;
  sectorCode: string;
  status: 'Active' | 'Inactive';
}

export interface DesignationMasterItem {
  sNo: number;
  id: string;
  designationName: string;
  designationCode: string;
  departmentWing: string;
  status: 'Active' | 'Inactive';
}

export interface DistrictBlockMasterItem {
  sNo: number;
  id: string;
  districtName: string;
  districtCode: string;
  blockName: string;
  blockCode: string;
  status: 'Active' | 'Inactive';
}

export interface EoiCategoryItem {
  sNo: number;
  id: string;
  categoryTitle: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface PermissionMasterItem {
  sNo: number;
  id: string;
  permissionName: string;
  permissionCode: string;
  moduleName: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface SchemeMasterItem {
  sNo: number;
  id: string;
  schemeName: string;
  schemeCategory: string;
  categoryName: string;
  amount: number;
  processFees: number;
  status: 'Active' | 'Inactive';
}

export interface UserRoleMasterItem {
  sNo: number;
  id: string;
  roleTypeName: string;
  permissions: string[];
  status: 'Active' | 'Inactive';
}

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
  { sNo: 2, id: 'cat-2', categoryTitle: 'Special', description: 'Specialized scheme proposals for specific target demographics, tribal regions, or high-priority sectors.', status: 'Active' },
  { sNo: 3, id: 'cat-3', categoryTitle: 'Empanelment', description: 'Empanelment of assessment agencies, technical consultants, and industry training partners.', status: 'Active' },
  { sNo: 4, id: 'cat-4', categoryTitle: 'RTD (Recruit-Train-Deploy)', description: 'Direct employment-linked training provider empanelment under Category-III RTD model.', status: 'Active' }
]);

export const MOCK_PERMISSION_MASTER_ITEMS: PermissionMasterItem[] = resolveMock([
  { sNo: 1, id: 'perm-1', permissionName: 'View EOI Configuration', permissionCode: 'PERM_EOI_VIEW', moduleName: 'EOI Management', description: 'Allows user to view all active and published EOI configurations and details.', status: 'Active' },
  { sNo: 2, id: 'perm-2', permissionName: 'Create & Edit EOI', permissionCode: 'PERM_EOI_CREATE_EDIT', moduleName: 'EOI Management', description: 'Grants access to configure new Expression of Interest schemes and upload corrigendum documents.', status: 'Active' },
  { sNo: 3, id: 'perm-3', permissionName: 'Delete EOI Proposal', permissionCode: 'PERM_EOI_DELETE', moduleName: 'EOI Management', description: 'Allows deletion of EOI proposal configurations from super admin desk.', status: 'Active' },
  { sNo: 4, id: 'perm-4', permissionName: 'Batch Approval & Scrutiny', permissionCode: 'PERM_BATCH_APPROVE', moduleName: 'Batch Approval', description: 'Allows officer to review, approve, reject, or request clarification on training batches.', status: 'Active' },
  { sNo: 5, id: 'perm-5', permissionName: 'Manage Master Records', permissionCode: 'PERM_MASTER_MANAGE', moduleName: 'Master Data', description: 'Full administrative access to add, view, and delete EOI, Scheme, Sector, Course, and District master entries.', status: 'Active' },
  { sNo: 6, id: 'perm-6', permissionName: 'Camera CCTV Live Monitoring', permissionCode: 'PERM_CAMERA_VIEW', moduleName: 'Camera Monitoring', description: 'Access to real-time CCTV camera streams across all accredited SDC centers.', status: 'Active' }
]);

export const MOCK_SCHEME_MASTER_ITEMS: SchemeMasterItem[] = resolveMock([
  { sNo: 1, id: 'sch-1', schemeName: 'Chief Minister Skill Development Scheme', schemeCategory: 'SAMARTH', categoryName: 'GENERAL', amount: 5000000, processFees: 10000, status: 'Active' },
  { sNo: 2, id: 'sch-2', schemeName: 'Mukhyamantri Yuva Swavalamban Yojana', schemeCategory: 'SAKSHM', categoryName: 'GOVERNMENT INSTITUTION/PSU', amount: 7500000, processFees: 15000, status: 'Active' },
  { sNo: 3, id: 'sch-3', schemeName: 'Empanelment of Assessment Agencies EOI', schemeCategory: 'RAJVIK', categoryName: 'GOVERNMENT INSTITUTION/INSTITUTION', amount: 2500000, processFees: 5000, status: 'Active' },
  { sNo: 4, id: 'sch-4', schemeName: 'Recruit-Train-Deploy (RTD) Category III', schemeCategory: 'SAMARTH', categoryName: 'SPECIAL TARGET GROUP', amount: 10000000, processFees: 25000, status: 'Active' }
]);

export const MOCK_USER_ROLE_MASTER_ITEMS: UserRoleMasterItem[] = resolveMock([
  { sNo: 1, id: 'role-1', roleTypeName: 'Super Admin', permissions: ['View EOI Configuration', 'Create & Edit EOI', 'Delete EOI Proposal', 'Manage Master Records', 'Batch Approval & Scrutiny', 'Camera CCTV Live Monitoring'], status: 'Active' },
  { sNo: 2, id: 'role-2', roleTypeName: 'Department Officer', permissions: ['View EOI Configuration', 'Create & Edit EOI', 'Batch Approval & Scrutiny'], status: 'Active' },
  { sNo: 3, id: 'role-3', roleTypeName: 'Scrutiny Officer', permissions: ['View EOI Configuration', 'Batch Approval & Scrutiny'], status: 'Active' },
  { sNo: 4, id: 'role-4', roleTypeName: 'Training Partner', permissions: ['View EOI Configuration', 'Grievance Redressal Access'], status: 'Active' }
]);

