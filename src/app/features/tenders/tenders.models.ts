import { DynamicFormField } from '../../core/models/admin-masters.model';

export interface EoiDocumentItem {
  sNo: number;
  name: string;
  size: string;
}

export interface SchemeTender {
  sNo: number;
  refNo: string;
  schemeName: string;
  schemeTitle?: string;
  schemeCategory: string;
  datePublished: string;
  closingDate: string;
  eoiDuration?: string;
  eoiCategory: string;
  eoiDescription: string;
  category?: string;
  code?: string;
  status?: 'Open' | 'Closed' | 'Draft' | 'Scheduled' | 'Cancelled';
  rfpDocSize?: string;
  sopDocSize?: string;
  preBidDate?: string;
  techBidDate?: string;
  emdFee?: string;
  processFee?: string;
  emdAmount?: number;
  processFeeAmount?: number;
  isFeeExempted?: boolean;
  attachedDocs?: EoiDocumentItem[];
  requiredDocs?: string[];
  annexures?: string[];
  publishFields?: DynamicFormField[];
  uploadFields?: DynamicFormField[];
  customFields?: DynamicFormField[];
  committeeMembers?: string[];
  committeeApprover?: string;
  createdAt?: number;
  updatedAt?: number;
  publishedAt?: number;
  createdBy?: string;
  scheduledDate?: string;
  isActive?: boolean;
  isFrozen?: boolean;
  isNew?: boolean;
}

/** A required-information / supporting-document entry for an EOI. */
export interface EoiRequiredInfoItem {
  sNo: number;
  name: string;
  note?: string;
}

/** An admin user that can be assigned to a scheme committee. */
export interface CommitteeAdmin {
  id: string;
  name: string;
  ssoId: string;
  role: string;
}

/** A file attached while configuring an EOI. */
export interface EoiAttachment {
  id: string;
  title: string;
  fileName: string;
  size: string;
  file: File;
}

/** A document file uploaded for a specific EOI document requirement. */
export interface EoiDocumentUpload {
  name?: string;
  fileName: string;
  size: string;
  file?: File;
}

export type EoiDurationUnit = 'Years';

/** Form model used by the "Configure New EOI / Edit EOI" modal. */
export interface EoiFormData {
  refNo: string;
  scheme: string;
  schemeCategory: string;
  publishedDate: string;
  submissionDate: string;
  eoiDurationValue: string;
  eoiDurationUnit: EoiDurationUnit;
  eoiCategory: string;
  description: string;
  emdFee: string;
  processFee: string;
  attachments: EoiAttachment[];
  documents: string[];
  annexures: string[];
  publishFields?: DynamicFormField[];
  uploadFields?: DynamicFormField[];
  customFields?: DynamicFormField[];
  documentFiles?: Record<number, EoiDocumentUpload>;
  status?: 'Open' | 'Closed' | 'Draft' | 'Scheduled' | 'Cancelled';
  isFeeExempted?: boolean;
}
