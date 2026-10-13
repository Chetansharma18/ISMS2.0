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
  eoiCategory: string;
  eoiDescription: string;
  category?: string;
  code?: string;
  status?: 'Open' | 'Closed';
  rfpDocSize?: string;
  sopDocSize?: string;
  preBidDate?: string;
  techBidDate?: string;
  emdFee?: string;
  processFee?: string;
  attachedDocs?: EoiDocumentItem[];
  requiredDocs?: string[];
  committeeMembers?: string[];
  createdAt?: number;
  isActive?: boolean;
  isFrozen?: boolean;
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

/** Form model used by the "Configure New EOI / Edit EOI" modal. */
export interface EoiFormData {
  refNo: string;
  scheme: string;
  schemeCategory: string;
  publishedDate: string;
  submissionDate: string;
  eoiCategory: string;
  description: string;
  emdFee: string;
  processFee: string;
  attachments: EoiAttachment[];
  documents: string[];
  documentFiles?: Record<number, EoiDocumentUpload>;
}
