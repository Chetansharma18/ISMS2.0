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
  budget?: number;
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
  docName: string;
  docType?: string;
  allowedFormats?: string[];
  maxSizeMb?: string | number;
  description?: string;
  schemes: string[];
  documents?: string;
  schemeName?: string;
  status: 'Active' | 'Inactive';
}

export interface AnnexureMasterItem {
  id: string;
  sNo?: number;
  annexureName: string;
  schemes: string[];
  annexures?: string;
  schemeName?: string;
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

export type AuthMethodType = 'OTP' | 'PIN';

export interface TwoStepVerificationItem {
  id: string;
  sNo?: number;
  roleType: string;
  authTypes: AuthMethodType[];
  status?: 'Active' | 'Inactive';
}

export type DynamicFormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'email'
  | 'phone'
  | 'datepicker'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'photo'
  | 'file'
  | 'heading'
  | 'divider';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  pastOnly?: boolean;
  futureOnly?: boolean;
  customError?: string;
  minPhotos?: number;
  maxPhotos?: number;
  maxSizeMb?: number;
}

export interface FormFieldCondition {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isNotEmpty' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export interface DynamicFormField {
  id: string;
  key?: string;
  fieldKey?: string;
  label: string;
  type: DynamicFormFieldType;
  mandatory: boolean;
  placeholder?: string;
  hint?: string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  readOnly?: boolean;
  options?: string[]; // for dropdown/radio list (comma-separated or items)
  optionsText?: string; // raw input string helper for comma-separated options
  structuredOptions?: FormFieldOption[];
  minPhotos?: number; // for photo upload
  maxPhotos?: number; // for photo upload
  maxSizeMb?: number; // for photo upload in MB
  validation?: FormFieldValidation;
  conditions?: FormFieldCondition[];
}

export interface FormStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  fields: DynamicFormField[];
}

export type DynamicFormStatus = 'Active' | 'Inactive' | 'Draft' | 'Published' | 'Paused' | 'Archived';

export interface DynamicFormBuilderItem {
  id: string;
  sNo?: number;
  formCode?: string;
  formType: string; // Form Name / Type
  description?: string;
  module?: string;
  isStepForm: boolean; // Yes / No
  steps?: FormStep[]; // When isStepForm is true
  fields: DynamicFormField[];
  status?: DynamicFormStatus;
  version?: number;
  submissionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicFormSubmission {
  id: string;
  formId: string;
  formVersion?: number;
  formType?: string;
  values: Record<string, any>;
  status: 'In Progress' | 'Submitted' | 'Approved' | 'Rejected';
  submittedAt: string;
  referenceNo: string;
}
