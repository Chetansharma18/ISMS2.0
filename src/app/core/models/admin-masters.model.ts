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

/** One district (`/api/master/districts`: `{ id, name, code, state, isActive }`), District tab of the District & Block screen. */
export interface DistrictMasterItem {
  sNo: number;
  id: string;
  districtName: string;
  districtCode: string;
  state: string;
  /** Blocks of the district, counted from the block list; null when the blocks could not be read. */
  blockCount: number | null;
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
  /** The role name (backend `name`, e.g. "superAdmin"). */
  roleTypeName: string;
  permissions: string[];
  status: 'Active' | 'Inactive';
  /** Backend fields (GET /api/roles); absent in mock data. */
  description?: string;
  userCount?: number;
  /** The role's table permissions (backend `permissions`). */
  tablePermissions?: RoleTablePermission[];
}

/** One table permission of a role (backend RolePermission, GET /api/roles and /api/roles/{id}/permissions). */
export interface RoleTablePermission {
  id: number;
  roleId: number;
  tableName: string;
  /** false: the grant exists but is switched off. */
  status: boolean;
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
  /** The table gets a sidebar link for this role. */
  enableInMenu: boolean;
  /** Sidebar label; null means the table name is shown. */
  menuCallingName: string | null;
}

export interface SchemeCategoryMasterItem {
  sNo: number;
  id: string;
  categoryName: string;
  schemeName?: string;
  status: 'Active' | 'Inactive';
}

/** What Doc Master and Annexure Master records share: the schemes they apply to and the upload rules. */
export interface SchemeLinkedMasterFields {
  /** Names of the applicable schemes (backend `applicableSchemes[].schemeName`). */
  schemes: string[];
  /** Their Scheme Master ids (backend `applicableSchemes[].id`). */
  schemeIds?: number[];
  /** The scheme names joined with ", " (for code that reads one scheme name). */
  schemeName?: string;
  schemeCount?: number;
  /** e.g. ".pdf,.jpg,.jpeg,.png" */
  allowedExtensions?: string;
  maxFileSizeMb?: number | null;
  /** Default "mandatory" when an EOI lists the record. */
  isMandatory?: boolean;
  /** isMandatory as the form's Yes / No choice. */
  mandatory?: 'Yes' | 'No';
  description?: string;
  status: 'Active' | 'Inactive';
}

/** Doc Master (backend `/api/master/doc-masters`): a document an applicant uploads, for one or more schemes. */
export interface DocMasterItem extends SchemeLinkedMasterFields {
  id: string;
  sNo?: number;
  /** Document name (backend `documentName`). */
  docName: string;
  /** Same as docName. */
  documents?: string;
  /** Grouping shown to applicants in an EOI (e.g. Statutory / Supporting). */
  category?: string;
}

/** Annexure Master (backend `/api/master/annexures`): a prescribed format applicants fill in, for one or more schemes. */
export interface AnnexureMasterItem extends SchemeLinkedMasterFields {
  id: string;
  sNo?: number;
  annexureName: string;
  /** Same as annexureName. */
  annexures?: string;
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
  | 'multiselect'
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
  /**
   * EOI "Publish Details" fields: the value the department enters, shown read-only to applicants with the EOI
   * (a checkbox holds true / false). Not used by fields the applicant fills in.
   */
  value?: string | boolean;
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
