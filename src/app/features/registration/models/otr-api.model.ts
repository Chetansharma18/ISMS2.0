/*
 * One Time Registration (OTR) against the backend's `/api/otr` API.
 *
 * Backend shapes (`Otr*Dto`): GET /otr/form returns the steps with their fixed fields (key, label, type, required,
 * section) and an optional FormManager schema of extra fields per step. Each step is its own record:
 * GET/PUT /otr/me (organisation), /otr/me/authorized-person, /otr/me/bank-details.
 *
 * Render model (`OtrFormDef` ...): what the screen draws, built from GET /otr/form plus display settings
 * (dropdown lists, which fields show for "GST registered = Yes"). The backend does every check; the screen only
 * shows the messages it returns.
 */

// ---------------------------------------------------------------- backend: form definition

export interface OtrFixedFieldDto {
  fieldKey: string;
  label: string;
  fieldType: string;
  isRequired: boolean;
  sectionName?: string | null;
}

/** A field of a FormManager schema attached to a step (`otr-<stepKey>`). */
export interface OtrDynamicFieldDto {
  fieldKey: string;
  label: string;
  fieldType: string;
  placeholder?: string | null;
  defaultValue?: string | null;
  tooltip?: string | null;
  isRequired: boolean;
  displayOrder: number;
  /** 1 to 12 grid columns. */
  colSpan: number;
  sectionName?: string | null;
  options?: { label: string; value: string }[];
  validation?: OtrDynamicValidationDto | null;
  /** `fieldKey == 'value'` or `fieldKey != 'value'`. The backend stores it as text and never evaluates it. */
  visibilityCondition?: string | null;
}

/** FormManager `FieldValidation`. The backend does not apply it to OTR answers, so the screen does. */
export interface OtrDynamicValidationDto {
  minLength?: number | null;
  maxLength?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  regexPattern?: string | null;
  customErrorMessage?: string | null;
  allowedExtensions?: string[] | null;
  maxFileSizeMb?: number | null;
}

export interface OtrDynamicSchemaDto {
  title: string;
  description?: string | null;
  fields: OtrDynamicFieldDto[];
}

export interface OtrStepFormDto {
  stepKey: string;
  stepTitle: string;
  stepSubtitle: string;
  dynamicFormId: number | null;
  dynamicFormVersion: number | null;
  hasDynamicForm: boolean;
  dynamicSchema: OtrDynamicSchemaDto | null;
  fixedFields: OtrFixedFieldDto[];
}

export interface OtrFullFormResponse {
  version: number;
  title: string;
  description: string;
  steps: OtrStepFormDto[];
}

// ---------------------------------------------------------------- backend: saved records

/**
 * One saved step as the backend returns it (OtrOrganisationDetailsDto, OtrAuthorizedPersonDto, OtrBankDetailsDto):
 * the common fields below plus the step's own camelCase fields (organisationName, mobileNumber, ifscCode ...).
 */
export interface OtrStepRecord {
  id: number | null;
  status: string;
  dynamicFormId?: number | null;
  dynamicFormVersion?: number | null;
  dynamicFormAnswers?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  submittedAt?: string | null;
  [field: string]: unknown;
}

/** One entry of GET /otr/me/update-logs (OtrUpdateLogDto): a create or update of one step. */
export interface OtrUpdateLogDto {
  id: number;
  section: string;
  action: string;
  targetRecordId: number;
  reason?: string | null;
  /** Changed properties of the step (camelCase), or `["*"]` for the first save. */
  changedFields: string[];
  oldValuesJson?: string | null;
  newValuesJson?: string | null;
  createdAt: string;
}

/** The user's records per step key; null when the step has not been saved yet. */
export type OtrRecords = Record<string, OtrStepRecord | null>;

/** Lookups the form needs from the master tables. */
export interface OtrLookups {
  sectors: { id: number; name: string }[];
  districts: { id: number; name: string; state: string }[];
}

// ---------------------------------------------------------------- render model

export type OtrFieldType =
  | 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'date' | 'tel' | 'email' | 'url' | 'checkbox' | 'file';

/**
 * "field equals value" (or "does not equal" with `notEqual`). Checkbox values compare as "true" / "false", a Yes / No
 * choice also matches "true" / "false", and a multi select matches when it contains the value.
 */
export interface OtrCondition {
  field: string;
  equalTo: string;
  notEqual?: boolean;
}

/** Checks the screen applies to a FormManager field before saving (the backend does not check them). */
export interface OtrFieldRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface OtrOption {
  value: string;
  label: string;
}

export interface OtrFieldDef {
  key: string;
  label: string;
  type: OtrFieldType;
  placeholder?: string;
  hint?: string;
  /** Grid columns the field spans in a 2-column section. */
  colSpan?: number;
  /** The "*" marker, from the backend's isRequired. */
  required?: boolean;
  /** Shown only when the condition holds; with a list, when every condition holds. */
  visibleWhen?: OtrCondition | OtrCondition[];
  copyFrom?: string;
  copyWhen?: OtrCondition;
  default?: string;
  options?: OtrOption[];
  dependsOn?: string;
  /** Options per value of `dependsOn` (districts per state). */
  optionsByParent?: Record<string, OtrOption[]>;
  /** Shown upper case while typing (PAN, GSTIN, IFSC). The backend stores the value. */
  transform?: string;
  accept?: string;
  maxSizeMb?: number;
  /** File fields: the backend's document type in /otr/me/documents/{documentType}. */
  documentType?: string;
  /** An extra field from the step's FormManager schema, saved in dynamicFormAnswers. */
  dynamic?: boolean;
  /** FormManager validation of a dynamic field. */
  rules?: OtrFieldRules;
}

export interface OtrSectionDef {
  key: string;
  title: string;
  fields: OtrFieldDef[];
  group?: string;
}

export interface OtrStepDef {
  number: number;
  key: string;
  title: string;
  subtitle: string;
  /** "form" steps are saved to their own endpoint; "review" is the preview + declaration + submit. */
  kind: 'form' | 'review';
  sections: OtrSectionDef[];
  declaration?: string;
  dynamicFormId?: number | null;
  dynamicFormVersion?: number | null;
}

export interface OtrFormDef {
  version: number;
  title: string;
  description: string;
  steps: OtrStepDef[];
}

/** An uploaded document as far as the backend reports it. */
export interface OtrDocument {
  fieldKey: string;
  fileName: string;
  url?: string | null;
  sizeBytes?: number;
  uploadedAt?: string;
}

/** A field's answer: text, a checkbox flag or the values of a multi select. */
export type OtrValue = string | boolean | string[] | null;
export type OtrStepValues = Record<string, OtrValue>;

/** Backend messages per step and field: `{ stepKey: { fieldKey: message } }`. */
export type OtrErrorMap = Record<string, Record<string, string>>;

/** Key in `OtrErrorMap` for messages that are not about a step field (e.g. the declaration). */
export const OTR_GENERAL_ERRORS = '_';
