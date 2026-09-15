export type EoiStatus = 
  | 'DRAFT' 
  | 'CONFIGURED' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'OPEN' 
  | 'CLOSED' 
  | 'UNDER_REVIEW' 
  | 'COMPLETED' 
  | 'ARCHIVED' 
  | 'RESCHEDULED' 
  | 'CANCELLED';

export type ApplicationStatus = 
  | 'Draft'
  | 'Submitted'
  | 'Payment Pending'
  | 'Payment Verified'
  | 'Under Review'
  | 'Committee Review'
  | 'Clarification Required'
  | 'Resubmitted'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export interface SchemeMaster {
  id: string;
  schemeCode: string;
  schemeName: string;
  shortName: string;
  department: string;
  schemeCategory: string;
  description: string;
  objective?: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
  eoiCount: number;
  contactDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  guidelinesDoc?: string;
  notificationDoc?: string;
  circularDoc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeCategoryMaster {
  id: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface EoiCategoryMaster {
  id: string;
  schemeName: string;
  schemeCategory: string;
  categoryName: string;
  amount: number;
  processingFee: number;
  status: 'Active' | 'Inactive';
}

export interface DepartmentMaster {
  id: string;
  departmentCode: string;
  departmentName: string;
  shortName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Active' | 'Inactive';
}

export interface OrganizationTypeMaster {
  id: string;
  code: string;
  organizationType: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface UserTypeMaster {
  id: string;
  userTypeCode: string;
  userTypeName: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface DesignationMaster {
  id: string;
  designationCode: string;
  designationName: string;
  department: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface StateMaster {
  id: string;
  stateCode: string;
  stateName: string;
  stateShortCode: string;
  status: 'Active' | 'Inactive';
}

export interface DistrictMaster {
  id: string;
  stateCode: string;
  stateName: string;
  districtCode: string;
  districtName: string;
  status: 'Active' | 'Inactive';
}

export interface BlockMaster {
  id: string;
  stateCode: string;
  stateName: string;
  districtCode: string;
  districtName: string;
  blockCode: string;
  blockName: string;
  status: 'Active' | 'Inactive';
}

export interface DocumentTypeMaster {
  id: string;
  schemeName: string;
  documentCode: string;
  documentName: string;
  documentDescription: string;
  isRequired: boolean;
  allowedFileTypes: string; // e.g., 'PDF, DOC, DOCX'
  maxFileSizeMB: number;
  status: 'Active' | 'Inactive';
}

export interface TransactionMaster {
  id: string;
  transactionCode: string;
  transactionName: string;
  transactionType: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface FeeMaster {
  id: string;
  feeCode: string;
  feeName: string;
  feeType: 'EMD' | 'EOI Fee' | 'Application Fee' | 'Processing Fee' | 'Other Charges';
  calculationType: 'Fixed' | 'Percentage' | 'Dynamic';
  amount: number;
  percentage?: number;
  gstApplicable: boolean;
  gstRate?: number;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface RoleMaster {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface ModulePermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  update: boolean;
  delete: boolean;
  publish: boolean;
  approve: boolean;
  export: boolean;
}

export interface AccessLevelMaster {
  id: string;
  roleCode: string;
  roleName: string;
  permissions: ModulePermission[];
  status: 'Active' | 'Inactive';
}

export interface ApplicationStatusMaster {
  id: string;
  statusCode: string;
  statusName: string;
  badgeColor: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface CommitteeRoleMaster {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

// EOI Models
export interface EoiDocumentConfig {
  id: string;
  documentTypeId: string;
  documentName: string;
  documentType: string;
  isRequired: boolean;
  version: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  status: 'Active' | 'Inactive';
}

export interface EoiTransactionConfig {
  id: string;
  transactionCode: string;
  transactionName: string;
  transactionIdRef: string;
  amount: number;
  status: 'Active' | 'Inactive';
}

export interface EoiEligibilityCriteria {
  id: string;
  organizationTypes: string[];
  minExperienceYears: number;
  minTurnoverCrores: number;
  allowedLocations: string[];
  department: string;
  customCriteria: string[];
}

export interface EoiFeeStructure {
  emdFee: number;
  applicationFee: number;
  processingFee: number;
  gstPercentage: number;
  gstAmount: number;
  otherCharges: number;
  totalFee: number;
}

export interface EoiItem {
  id: string;
  referenceNo: string;
  title: string;
  schemeId: string;
  schemeName: string;
  schemeCategory: string;
  department: string;
  eoiCategory: string;
  description: string;
  publishedDate: string;
  applicationStartDate: string;
  closingDate: string;
  openingDate: string;
  reviewStartDate: string;
  status: EoiStatus;
  version: string;
  applicationCount: number;
  committeeId?: string;
  committeeName?: string;
  attachedFilePath?: string;
  attachedFileName?: string;
  attachedFileSize?: string;
  fees: EoiFeeStructure;
  eligibility: EoiEligibilityCriteria;
  documents: EoiDocumentConfig[];
  transactions: EoiTransactionConfig[];
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Builder Models
export type FormFieldType = 
  | 'Text' 
  | 'Textarea' 
  | 'Number' 
  | 'Decimal' 
  | 'Currency' 
  | 'Percentage' 
  | 'Email' 
  | 'Mobile' 
  | 'Date' 
  | 'Dropdown' 
  | 'Multi Select' 
  | 'Radio' 
  | 'Checkbox' 
  | 'File Upload';

export interface FormOption {
  label: string;
  value: string;
}

export interface EoiFormField {
  id: string;
  eoiId: string;
  fieldLabel: string;
  fieldCode: string;
  fieldType: FormFieldType;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  required: boolean;
  displayOrder: number;
  active: boolean;
  archived?: boolean;
  // Validations
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  // Options for Dropdown/Radio/Checkbox
  options?: FormOption[];
  // File upload configuration
  allowedFileTypes?: string;
  maxFileSizeMB?: number;
  multipleFiles?: boolean;
  hasHistoricalResponses?: boolean;
}

// Committee Models
export interface CommitteeMember {
  id: string;
  name: string;
  userId: string;
  designation: string;
  department: string;
  role: 'Chairperson' | 'Member' | 'Reviewer' | 'Secretary';
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
}

export interface Committee {
  id: string;
  committeeName: string;
  committeeCode: string;
  department: string;
  description: string;
  chairpersonName: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
  members: CommitteeMember[];
  assignedEoiCount: number;
  createdAt: string;
}

// Corrigendum / Amendment
export interface CorrigendumAmendment {
  id: string;
  eoiId: string;
  eoiReferenceNo: string;
  version: string;
  type: 'Corrigendum' | 'Amendment';
  documentNumber: string;
  title: string;
  description: string;
  publishedDate: string;
  attachmentFileName: string;
  attachmentFileSize: string;
  publishedBy: string;
  status: 'Draft' | 'Published';
  previousStartDate?: string;
  previousClosingDate?: string;
  newStartDate?: string;
  newClosingDate?: string;
  reason?: string;
}

export interface EoiVersionHistory {
  id: string;
  eoiId: string;
  version: string;
  date: string;
  changedBy: string;
  changeType: 'Created' | 'Configured' | 'Published' | 'Rescheduled' | 'Corrigendum' | 'Amendment' | 'Committee Assigned' | 'Status Changed';
  reason: string;
  oldValue: string;
  newValue: string;
  documentTitle?: string;
  documentPath?: string;
}

// User Models
export interface UserRoleAssignment {
  id: string;
  role: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
}

export interface UserSchemeAssignment {
  id: string;
  schemeId: string;
  schemeName: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
}

export interface AdminUser {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  alternateMobile?: string;
  alternateEmail?: string;
  dob?: string;
  ssoId?: string;
  userType: string;
  designation: string;
  department: string;
  district?: string;
  block?: string;
  aadhaarMasked?: string;
  active: boolean;
  roles: UserRoleAssignment[];
  schemes: UserSchemeAssignment[];
  customPermissions?: ModulePermission[];
  createdAt: string;
}

// Committee Approval & Evidence Attachment Models
export interface CommitteeSignedMember {
  name: string;
  designation: string;
  department: string;
  signedAt: string;
  status: 'E-Signed & Approved';
  ipAddress?: string;
}

export interface CommitteeApprovalDocument {
  documentTitle: string;
  fileName: string;
  fileSize: string;
  certificateRefNo: string;
  uploadedDate: string;
  uploadedBy: string;
  committeeName: string;
  signedMembers: CommitteeSignedMember[];
  documentUrl?: string;
}

// Application Response Models
export interface ApplicationItem {
  id: string;
  applicationNumber: string;
  registrationNumber: string;
  eoiId: string;
  eoiReferenceNo: string;
  eoiTitle: string;
  schemeId: string;
  schemeName: string;
  category: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  organizationName: string;
  organizationType: string;
  submissionDate: string;
  amount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Exempted' | 'Failed';
  transactionId?: string;
  status: ApplicationStatus;
  assignedCommitteeId?: string;
  assignedCommitteeName?: string;
  formResponses: Record<string, any>;
  uploadedDocuments: {
    documentName: string;
    fileName: string;
    fileSize: string;
    verified: boolean;
  }[];
  reviewComments?: {
    reviewerName: string;
    date: string;
    comment: string;
    status: string;
  }[];
  grading?: string;
  assignedCategory?: string;
  decisionRemarks?: string;
  committeeAttachment?: CommitteeApprovalDocument;
  currentStage?: string;
}

// Audit Log Model
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  module: string;
  action: string;
  eoiId?: string;
  applicationId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress: string;
}

// Dashboard Summary Model
export interface DashboardSummary {
  totalSchemes: number;
  activeSchemes: number;
  totalEOIs: number;
  draftEOIs: number;
  publishedEOIs: number;
  openEOIs: number;
  closedEOIs: number;
  rescheduledEOIs: number;
  totalApplications: number;
  underReview: number;
  accepted: number;
  rejected: number;
}
