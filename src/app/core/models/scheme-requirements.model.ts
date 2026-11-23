import { DynamicFormFieldType } from './admin-masters.model';

export type SchemeFormFieldType =
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
  | 'switch'
  | 'file';

export type RequirementType = 'DOCUMENT' | 'ANNEXURE' | 'DYNAMIC_FIELD';
export type AnnexureCompletionMethod = 'DOWNLOAD_UPLOAD' | 'FILL_ONLINE' | 'READ_ONLY';

/**
 * Normalized mapping between a Scheme and a Master Library item (Document, Annexure, or Custom Field).
 * Allows a single master item to be shared across multiple schemes, while each scheme
 * independently controls whether the item is Mandatory or Optional.
 */
export interface SchemeRequirementMapping {
  id: string;
  schemeId: string;
  schemeCode?: string;
  schemeName: string;
  requirementType: RequirementType;
  masterItemId: string;
  masterItemCode?: string;
  masterItemName: string;
  category?: string;
  isMandatory: boolean;
  applicantCategory?: 'ALL' | 'GENERAL' | 'SPECIAL';
  displayOrder: number;
  templateFileName?: string;
  templateVersion?: string;
  completionMethod?: AnnexureCompletionMethod;
  acceptedFormats?: string[];
  maxSizeMb?: number;
  instructions?: string;
  status: 'Active' | 'Inactive';
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Scheme-Specific Dynamic Custom Field definition.
 * Configured per scheme without altering frontend code.
 */
export interface SchemeCustomField {
  id: string;
  schemeId: string;
  schemeCode?: string;
  schemeName: string;
  fieldKey: string;
  label: string;
  type: SchemeFormFieldType;
  mandatory: boolean;
  placeholder?: string;
  hint?: string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  options?: string[];
  order: number;
  status: 'Active' | 'Inactive';
  createdAt?: number;
}

/**
 * Immutable EOI snapshot freezing the exact requirements at publication time.
 * Protects already published and submitted proposals against subsequent scheme edits.
 */
export interface EoiRequirementSnapshot {
  eoiRefNo: string;
  schemeId: string;
  schemeName: string;
  schemeCode?: string;
  version: string;
  publishedAt: number;
  documents: SchemeRequirementMapping[];
  annexures: SchemeRequirementMapping[];
  customFields: SchemeCustomField[];
}

/**
 * Detailed association info for displaying mapped schemes in Doc / Annexure drawers.
 */
export interface MappedSchemeDetail {
  mappingId: string;
  schemeId: string;
  schemeName: string;
  schemeCode?: string;
  schemeCategory?: string;
  categoryName?: string;
  budget?: number;
  emdAmount?: number;
  processFees?: number;
  description?: string;
  datePublished?: string;
  closingDate?: string;
  isMandatory: boolean;
  status: 'Active' | 'Inactive';
}
