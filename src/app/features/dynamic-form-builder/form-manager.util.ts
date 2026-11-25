import {
  DynamicFormBuilderItem,
  DynamicFormField,
  DynamicFormFieldType,
  FormFieldCondition,
  FormStep
} from '../../core/models/admin-masters.model';
import {
  FormManagerField,
  FormManagerFieldType,
  FormManagerForm,
  FormManagerSchema,
  FormManagerValidation
} from './form-manager.model';

/*
 * Pure helpers between the backend's Form Manager schema and the Dynamic Form Builder screen.
 * The screen edits an `EditorForm`; saving turns it into the backend schema (`toSchema`); the preview draws the
 * schema with the shared form renderer (`toRendererItem`). Nothing here accepts or rejects a form: the backend does.
 */

export interface FieldTypeChoice {
  value: FormManagerFieldType;
  label: string;
}

/** The field types the backend schema supports (Features/FormManager/Model/FormFieldDefinition.cs). */
export const FIELD_TYPE_CHOICES: readonly FieldTypeChoice[] = [
  { value: 'text', label: 'Single-Line Text' },
  { value: 'textarea', label: 'Multi-Line Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Mobile / Phone No.' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown List' },
  { value: 'multiselect', label: 'Multi-Select List' },
  { value: 'radio', label: 'Radio Options' },
  { value: 'checkbox', label: 'Checkbox (Yes / No)' },
  { value: 'file', label: 'Document Upload' }
];

const OPTION_TYPES = new Set<string>(['select', 'multiselect', 'radio']);
const LENGTH_TYPES = new Set<string>(['text', 'textarea', 'email', 'phone']);

export const hasOptions = (type: string): boolean => OPTION_TYPES.has(type);
export const hasLengthRules = (type: string): boolean => LENGTH_TYPES.has(type);
export const isNumberType = (type: string): boolean => type === 'number';
export const isFileType = (type: string): boolean => type === 'file';

/** Modules a form can belong to; the backend stores free text, these are the ones the product uses. */
export const DEFAULT_MODULES = ['EOI', 'OTR'];

export interface EditorField {
  uid: string;
  fieldKey: string;
  /** False until the user edits the key: the key follows the label. */
  keyEdited: boolean;
  label: string;
  fieldType: FormManagerFieldType | string;
  isRequired: boolean;
  placeholder: string;
  defaultValue: string;
  tooltip: string;
  /** 6 = half width, 12 = full width (the backend's 12-column grid). */
  colSpan: number;
  optionsText: string;
  minLength: string;
  maxLength: string;
  minValue: string;
  maxValue: string;
  regexPattern: string;
  customErrorMessage: string;
  allowedExtensions: string;
  maxFileSizeMb: string;
  visibilityCondition: string;
}

export interface EditorStep {
  uid: string;
  title: string;
  fields: EditorField[];
}

export interface EditorForm {
  id: number | null;
  formKey: string;
  /** False until the user edits the key: on a new form the key follows the name. */
  keyEdited: boolean;
  title: string;
  moduleName: string;
  description: string;
  isActive: boolean;
  isStepForm: boolean;
  /** A direct form has one step whose title is not used. */
  steps: EditorStep[];
  changelog: string;
  currentVersion: number;
}

let uidCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(++uidCounter).toString(36)}`;

export function newEditorField(): EditorField {
  return {
    uid: uid('fld'), fieldKey: '', keyEdited: false, label: '', fieldType: 'text', isRequired: false,
    placeholder: '', defaultValue: '', tooltip: '', colSpan: 6, optionsText: '',
    minLength: '', maxLength: '', minValue: '', maxValue: '', regexPattern: '', customErrorMessage: '',
    allowedExtensions: '', maxFileSizeMb: '', visibilityCondition: ''
  };
}

export function newEditorStep(number: number): EditorStep {
  return { uid: uid('stp'), title: `Step ${number}`, fields: [newEditorField()] };
}

export function newEditorForm(): EditorForm {
  return {
    id: null, formKey: '', keyEdited: false, title: '', moduleName: 'EOI', description: '', isActive: true,
    isStepForm: false, steps: [{ uid: uid('stp'), title: '', fields: [newEditorField()] }], changelog: '', currentVersion: 0
  };
}

/** "Center Name" -> "center_name" (field keys). */
export function slugKey(text: string, separator = '_'): string {
  return (text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
}

/** A form key from its name: "Center Inspection Form" -> "center-inspection-form". */
export function suggestFormKey(title: string): string {
  return slugKey(title, '-');
}

/** Keeps a field key following its label until the user edits the key; keys stay unique in the form. */
export function syncFieldKey(form: EditorForm, field: EditorField): void {
  if (field.keyEdited) return;
  const base = slugKey(field.label);
  if (!base) {
    field.fieldKey = '';
    return;
  }
  const taken = new Set(
    form.steps.flatMap(s => s.fields).filter(f => f !== field).map(f => f.fieldKey)
  );
  let key = base;
  for (let n = 2; taken.has(key); n++) key = `${base}_${n}`;
  field.fieldKey = key;
}

export function parseOptions(text: string): string[] {
  return (text || '').split(',').map(o => o.trim()).filter(Boolean);
}

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => {
  const t = v.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

function toEditorField(f: FormManagerField): EditorField {
  const v = f.validation ?? {};
  return {
    uid: uid('fld'),
    fieldKey: f.fieldKey,
    keyEdited: true,
    label: f.label,
    fieldType: f.fieldType,
    isRequired: !!f.isRequired,
    placeholder: str(f.placeholder),
    defaultValue: str(f.defaultValue),
    tooltip: str(f.tooltip),
    colSpan: (f.colSpan ?? 12) > 6 ? 12 : 6,
    optionsText: (f.options ?? []).map(o => o.label || o.value).join(', '),
    minLength: str(v.minLength),
    maxLength: str(v.maxLength),
    minValue: str(v.minValue),
    maxValue: str(v.maxValue),
    regexPattern: str(v.regexPattern),
    customErrorMessage: str(v.customErrorMessage),
    allowedExtensions: str(v.allowedExtensions),
    maxFileSizeMb: str(v.maxFileSizeMb),
    visibilityCondition: str(f.visibilityCondition)
  };
}

/** Fields in display order. */
function orderedFields(schema: FormManagerSchema | null | undefined): FormManagerField[] {
  return [...(schema?.fields ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

/** A schema is a step form when its fields carry section names. */
export function isStepSchema(schema: FormManagerSchema | null | undefined): boolean {
  return (schema?.fields ?? []).some(f => !!f.sectionName?.trim());
}

/** Steps of a schema: consecutive fields with the same section name. */
export function schemaSteps(schema: FormManagerSchema | null | undefined): { title: string; fields: FormManagerField[] }[] {
  const steps: { title: string; fields: FormManagerField[] }[] = [];
  for (const field of orderedFields(schema)) {
    const title = field.sectionName?.trim() || '';
    const last = steps[steps.length - 1];
    if (last && last.title === title) last.fields.push(field);
    else steps.push({ title, fields: [field] });
  }
  return steps;
}

/** The editable copy of a form the backend returned (GET /form-manager/{id}). */
export function toEditorForm(form: FormManagerForm): EditorForm {
  const schema = form.activeSchema;
  const isStep = isStepSchema(schema);
  const steps = isStep
    ? schemaSteps(schema).map(s => ({ uid: uid('stp'), title: s.title, fields: s.fields.map(toEditorField) }))
    : [{ uid: uid('stp'), title: '', fields: orderedFields(schema).map(toEditorField) }];
  return {
    id: form.id,
    formKey: form.formKey,
    keyEdited: true,
    title: form.title,
    moduleName: form.moduleName,
    description: str(form.description),
    isActive: form.isActive,
    isStepForm: isStep,
    steps: steps.length > 0 ? steps : [{ uid: uid('stp'), title: '', fields: [] }],
    changelog: '',
    currentVersion: form.currentVersion
  };
}

/** Switches between a step form and a direct form without losing fields. */
export function setStepMode(form: EditorForm, isStepForm: boolean): void {
  if (form.isStepForm === isStepForm) return;
  form.isStepForm = isStepForm;
  if (isStepForm) {
    form.steps = form.steps.map((s, i) => ({ ...s, title: s.title || `Step ${i + 1}` }));
  } else {
    form.steps = [{ uid: uid('stp'), title: '', fields: form.steps.flatMap(s => s.fields) }];
  }
}

function toValidation(f: EditorField): FormManagerValidation | null {
  const v: FormManagerValidation = {};
  if (hasLengthRules(f.fieldType)) {
    const min = num(f.minLength), max = num(f.maxLength);
    if (min !== null) v.minLength = min;
    if (max !== null) v.maxLength = max;
    if (f.regexPattern.trim()) v.regexPattern = f.regexPattern.trim();
  }
  if (isNumberType(f.fieldType)) {
    const min = num(f.minValue), max = num(f.maxValue);
    if (min !== null) v.minValue = min;
    if (max !== null) v.maxValue = max;
  }
  if (isFileType(f.fieldType)) {
    if (f.allowedExtensions.trim()) v.allowedExtensions = f.allowedExtensions.trim();
    const size = num(f.maxFileSizeMb);
    if (size !== null) v.maxFileSizeMb = size;
  }
  if (f.customErrorMessage.trim()) v.customErrorMessage = f.customErrorMessage.trim();
  return Object.keys(v).length > 0 ? v : null;
}

/** The schema to save: fields in screen order; on a step form each field carries its step title. */
export function toSchema(form: EditorForm): FormManagerSchema {
  let order = 0;
  const fields: FormManagerField[] = form.steps.flatMap(step =>
    // A new field row left completely empty (no label, no key) is not part of the form.
    step.fields.filter(f => f.label.trim() || f.fieldKey.trim()).map(f => {
      const field: FormManagerField = {
        fieldKey: f.fieldKey.trim(),
        label: f.label.trim(),
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        displayOrder: ++order,
        colSpan: f.colSpan > 6 ? 12 : 6,
        sectionName: form.isStepForm ? step.title.trim() : null,
        options: hasOptions(f.fieldType) ? parseOptions(f.optionsText).map(o => ({ label: o, value: o })) : [],
        validation: toValidation(f),
        placeholder: f.placeholder.trim() || null,
        defaultValue: f.defaultValue.trim() || null,
        tooltip: f.tooltip.trim() || null,
        visibilityCondition: f.visibilityCondition.trim() || null
      };
      return field;
    })
  );
  return { title: form.title.trim(), description: form.description.trim() || null, fields };
}

export function fieldCount(schema: FormManagerSchema | null | undefined): number {
  return schema?.fields?.length ?? 0;
}

export function moduleOptions(forms: FormManagerForm[]): string[] {
  const all = new Set<string>(DEFAULT_MODULES);
  for (const f of forms) if (f.moduleName?.trim()) all.add(f.moduleName.trim());
  return [...all];
}

// ---------------------------------------------------------------- preview (shared renderer)

const RENDERER_TYPES: Record<string, DynamicFormFieldType> = {
  text: 'text', textarea: 'textarea', number: 'number', email: 'email', phone: 'phone', date: 'datepicker',
  select: 'dropdown', multiselect: 'multiselect', radio: 'radio', checkbox: 'checkbox', file: 'file'
};

/** `fieldX == 'Yes'` / `fieldX != 'No'` -> a show condition. Other expressions are not evaluated in the preview. */
export function parseVisibility(expression: string | null | undefined): FormFieldCondition[] {
  const match = /^\s*([A-Za-z0-9_.-]+)\s*(==|!=)\s*['"]?([^'"]*)['"]?\s*$/.exec(expression ?? '');
  if (!match) return [];
  return [{ fieldId: match[1], operator: match[2] === '==' ? 'equals' : 'notEquals', value: match[3], action: 'show' }];
}

function toRendererField(f: FormManagerField): DynamicFormField {
  const v = f.validation ?? {};
  return {
    id: f.fieldKey,
    fieldKey: f.fieldKey,
    label: f.label,
    type: RENDERER_TYPES[String(f.fieldType).toLowerCase()] ?? 'text',
    mandatory: !!f.isRequired,
    placeholder: f.placeholder ?? undefined,
    hint: f.tooltip ?? undefined,
    defaultValue: f.defaultValue ?? undefined,
    options: (f.options ?? []).map(o => o.label || o.value),
    maxSizeMb: v.maxFileSizeMb ?? undefined,
    validation: {
      minLength: v.minLength ?? undefined,
      maxLength: v.maxLength ?? undefined,
      min: v.minValue ?? undefined,
      max: v.maxValue ?? undefined,
      pattern: v.regexPattern ?? undefined,
      customError: v.customErrorMessage ?? undefined
    },
    conditions: parseVisibility(f.visibilityCondition)
  };
}

/** A saved schema in the shape the shared form renderer draws. */
export function toRendererItem(meta: { id: number | null; title: string; description?: string | null; version?: number }, schema: FormManagerSchema): DynamicFormBuilderItem {
  const isStep = isStepSchema(schema);
  const steps: FormStep[] = schemaSteps(schema).map((s, i) => ({
    id: `step-${i + 1}`,
    stepNumber: i + 1,
    title: s.title || meta.title,
    fields: s.fields.map(toRendererField)
  }));
  return {
    id: String(meta.id ?? 'preview'),
    formType: meta.title || 'Untitled Form',
    description: meta.description ?? undefined,
    isStepForm: isStep,
    steps: isStep ? steps : undefined,
    fields: steps.flatMap(s => s.fields),
    version: meta.version
  };
}
