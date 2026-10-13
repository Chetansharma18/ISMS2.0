/** Row shapes for the admin "master data" lookup tables. */

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
  status?: 'Active' | 'Inactive';
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

export interface SchemeCategoryMasterItem {
  sNo: number;
  id: string;
  categoryName: string;
  schemeName?: string;
  status: 'Active' | 'Inactive';
}

export interface DocMasterItem {
  id: string;
  sNo?: number;
  schemeName: string;
  documents: string;
  status: 'Active' | 'Inactive';
}

export interface RemarkMasterItem {
  id: string;
  sNo?: number;
  remarkType: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface GradingMasterItem {
  id: string;
  sNo?: number;
  grade: string;
  minimum: number;
  maximum: number;
  range: string;
  status: 'Active' | 'Inactive';
}

export type AuthMethodType = 'OTP' | 'Auth App' | 'PIN';

export interface TwoStepVerificationItem {
  id: string;
  sNo?: number;
  roleType: string;
  authTypes: AuthMethodType[];
  status?: 'Active' | 'Inactive';
}
