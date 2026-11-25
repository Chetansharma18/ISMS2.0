/*
 * Shapes of the backend's EOI Configuration API (`/api/eoi/configurations`, Features/Eoi) and of the applicant
 * notices list (`/api/eoi/apply/notices`). Dates are ISO calendar dates (yyyy-MM-dd); fees are numbers.
 */

export interface EoiSchemeOption {
  id: number;
  schemeName: string;
  schemeCategory: string;
  eoiCategoryId: number | null;
  eoiCategory: string | null;
  emdFee: number;
  processFee: number;
}

export interface EoiOption {
  id: number;
  name: string;
}

/** A Doc Master document or Annexure Master annexure. `schemeIds` empty = usable with every scheme. */
export interface EoiDocumentOption {
  id: number;
  name: string;
  category: string | null;
  isMandatory: boolean;
  schemeIds: number[];
  allowedExtensions: string[];
  maxFileSizeMb: number;
}

export interface EoiFormLimits {
  refNoMaxLength: number;
  refNoPattern: string;
  descriptionMaxLength: number;
  maxDurationYears: number;
  maxSubmissionWindowDays: number;
  maxFileBytes: number;
  attachmentExtensions: string[];
}

export interface EoiFormOptions {
  schemes: EoiSchemeOption[];
  eoiCategories: EoiOption[];
  documents: EoiDocumentOption[];
  limits: EoiFormLimits;
  annexures?: EoiDocumentOption[] | null;
  dynamicForms?: EoiOption[] | null;
  /** Active Scheme Category Master entries. */
  schemeCategories?: EoiOption[] | null;
}

export interface EoiListItem {
  sNo: number;
  id: number;
  refNo: string;
  schemeName: string;
  schemeCategory: string;
  eoiCategory: string | null;
  publishedDate: string | null;
  closingDate: string | null;
  /** Draft | Scheduled | Open | Closed */
  status: string;
  isActive: boolean;
  isFrozen: boolean;
  isEditable: boolean;
  editDisabledReason: string | null;
  committeeCount: number;
  hasApprover: boolean;
  responseCount: number;
  createdAt: string;
}

export interface EoiRequiredDocument {
  id: number;
  name: string;
  category: string | null;
  isMandatory: boolean;
  docMasterId: number | null;
  sortOrder: number;
  allowedExtensions: string[];
  maxFileSizeMb: number;
  annexureMasterId?: number | null;
}

export interface EoiAttachmentDto {
  id: number;
  /** Document | Corrigendum */
  kind: string;
  title: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  url: string;
}

export interface EoiUser {
  ssoid: string;
  name: string;
  designation: string | null;
  roles: string[];
}

export interface EoiDetail {
  id: number;
  refNo: string;
  schemeId: number;
  schemeName: string;
  schemeCategory: string;
  eoiCategoryId: number | null;
  eoiCategory: string | null;
  description: string | null;
  publishedDate: string | null;
  closingDate: string | null;
  durationYears: number | null;
  emdFee: number;
  processFee: number;
  isFeeExempted: boolean;
  status: string;
  isActive: boolean;
  isFrozen: boolean;
  isEditable: boolean;
  editDisabledReason: string | null;
  responseCount: number;
  requiredDocuments: EoiRequiredDocument[];
  attachments: EoiAttachmentDto[];
  approver: EoiUser | null;
  members: EoiUser[];
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  concurrencyStamp: string;
  dynamicFormId?: number | null;
  dynamicFormVersion?: number | null;
  publishFields?: unknown[] | null;
  uploadFields?: unknown[] | null;
}

export interface EoiRequiredDocumentInput {
  id?: number | null;
  name?: string | null;
  docMasterId?: number | null;
  annexureMasterId?: number | null;
  category?: string | null;
  isMandatory?: boolean | null;
}

export interface EoiSaveRequest {
  refNo: string;
  schemeId: number | null;
  /** Scheme Category Master names chosen on the form. */
  schemeCategories: string[];
  eoiCategoryId: number | null;
  description: string | null;
  publishedDate: string | null;
  closingDate: string | null;
  durationYears: number | null;
  emdFee: number | null;
  processFee: number | null;
  isFeeExempted: boolean;
  saveAsDraft: boolean;
  requiredDocuments: EoiRequiredDocumentInput[];
  publishFields: unknown[];
  uploadFields: unknown[];
}

export interface EoiCommittee {
  eoiId: number;
  refNo: string;
  schemeName: string;
  description: string | null;
  approver: EoiUser | null;
  members: EoiUser[];
}

/** An EOI open to applicants (EoiOpenNoticeDto). */
export interface EoiOpenNotice {
  id: number;
  refNo: string;
  schemeName: string;
  schemeCategory: string;
  eoiCategory: string | null;
  description: string | null;
  publishedDate: string | null;
  closingDate: string | null;
  durationYears: number | null;
  emdFee: number;
  processFee: number;
  isFeeExempted: boolean;
  myApplication: { id: number; applicationNo: string; status: string } | null;
}

/** GET /eoi/apply/notices/{id}: an open EOI with its required documents and published files (EoiOpenNoticeDetailDto). */
export interface EoiOpenNoticeDetail {
  notice: EoiOpenNotice;
  requiredDocuments: EoiRequiredDocument[];
  attachments: EoiAttachmentDto[];
  /** False until the applicant's One Time Registration is submitted. */
  otrCompleted: boolean;
  acceptsApplications: boolean;
}
