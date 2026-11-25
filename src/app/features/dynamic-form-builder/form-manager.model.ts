/*
 * Shapes of the backend's Form Manager API (`/api/form-manager`, Features/FormManager).
 * A form has a key, a title, a module and versions; each version holds a schema (title, description, fields).
 */

/** Field types the backend's schema knows (FormFieldTypes). */
export type FormManagerFieldType =
  | 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'file' | 'email' | 'phone';

export interface FormManagerOption {
  label: string;
  value: string;
}

export interface FormManagerValidation {
  minLength?: number | null;
  maxLength?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  regexPattern?: string | null;
  customErrorMessage?: string | null;
  /** e.g. ".pdf,.jpg" */
  allowedExtensions?: string | null;
  maxFileSizeMb?: number | null;
}

export interface FormManagerField {
  fieldKey: string;
  label: string;
  fieldType: FormManagerFieldType | string;
  placeholder?: string | null;
  defaultValue?: string | null;
  tooltip?: string | null;
  isRequired: boolean;
  displayOrder: number;
  /** 1 to 12 grid columns. */
  colSpan: number;
  /** Steps of a step form are the section names, in field order. */
  sectionName?: string | null;
  options?: FormManagerOption[];
  validation?: FormManagerValidation | null;
  /** Free text, e.g. "fieldX == 'Yes'". */
  visibilityCondition?: string | null;
}

export interface FormManagerSchema {
  title: string;
  description?: string | null;
  fields: FormManagerField[];
}

/** DynamicFormDto. `activeSchema` is only filled by GET /form-manager/{id} and by a save that published a schema. */
export interface FormManagerForm {
  id: number;
  formKey: string;
  title: string;
  moduleName: string;
  description?: string | null;
  isActive: boolean;
  currentVersion: number;
  createdAt: string;
  updatedAt?: string | null;
  activeSchema?: FormManagerSchema | null;
}

export interface CreateFormRequest {
  formKey: string;
  title: string;
  moduleName: string;
  description?: string | null;
  schema: FormManagerSchema;
  changelog?: string | null;
}

export interface UpdateFormRequest {
  title?: string | null;
  moduleName?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  newSchema?: FormManagerSchema | null;
  changelog?: string | null;
}
