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
  /** Theory hours; 'NA' for the few legacy NSQF units that publish no theory duration. */
  theoryDurationHours: number | 'NA';
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
  roleType: string;
  moduleName: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  permissionName?: string;
  permissionCode?: string;
  description?: string;
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
  schemeName?: string;
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

export type DynamicFormFieldType = 'text' | 'number' | 'datepicker' | 'dropdown' | 'photo';

export interface DynamicFormField {
  id: string;
  label: string;
  type: DynamicFormFieldType;
  mandatory: boolean;
  options?: string[]; // for dropdown list (comma-separated or items)
  optionsText?: string; // raw input string helper for comma-separated options
  minPhotos?: number; // for photo upload
  maxPhotos?: number; // for photo upload
  maxSizeMb?: number; // for photo upload in MB
}

export interface FormStep {
  id: string;
  stepNumber: number;
  title: string;
  fields: DynamicFormField[];
}

export interface DynamicFormBuilderItem {
  id: string;
  sNo?: number;
  formType: string; // Form Name / Type
  isStepForm: boolean; // Yes / No
  steps?: FormStep[]; // When isStepForm is true
  fields: DynamicFormField[];
  status?: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}
