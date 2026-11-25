import { ApiFieldError } from '../../core/http/api-error';
import {
  OTR_GENERAL_ERRORS,
  OtrCondition,
  OtrDocument,
  OtrDynamicFieldDto,
  OtrErrorMap,
  OtrFieldDef,
  OtrFieldType,
  OtrFixedFieldDto,
  OtrFormDef,
  OtrFullFormResponse,
  OtrLookups,
  OtrOption,
  OtrRecords,
  OtrSectionDef,
  OtrStepDef,
  OtrStepFormDto,
  OtrStepRecord,
  OtrStepValues,
  OtrValue
} from './models/otr-api.model';
import { FileDoc, OtrFormData, createInitialOtrFormData } from './models/otr-form.model';
import {
  OTR_DECLARATION,
  OTR_DOCUMENT_ACCEPT,
  OTR_DOCUMENT_MAX_MB,
  OTR_FIELD_LAYOUT,
  OTR_STEP_SAVED_MARKER,
  OtrFieldLayout,
  OtrValueKind
} from './otr-step-layout';

/*
 * Pure helpers for the OTR screen: build what to draw from GET /otr/form, turn the saved records into screen values
 * and back into request bodies, and place the backend's error messages under their fields. None of them accepts or
 * rejects a value; every check is the backend's.
 */

export const OTR_STEP_KEYS = ['organisation', 'authorized-person', 'bank-details'] as const;
export const OTR_REVIEW_STEP_KEY = 'preview';
const DYNAMIC_PREFIX = 'dynamic.';

// ---------------------------------------------------------------- building the render model

const FIELD_TYPES: Record<string, OtrFieldType> = {
  text: 'text', textarea: 'textarea', select: 'select', multiselect: 'multiselect', date: 'date', tel: 'tel',
  phone: 'tel', email: 'email', url: 'url', checkbox: 'checkbox', file: 'file', number: 'text', radio: 'select'
};

function toOptions(list: readonly string[] | OtrOption[] | undefined): OtrOption[] | undefined {
  if (!list) return undefined;
  return list.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
}

function sectorOptions(lookups: OtrLookups): OtrOption[] {
  return lookups.sectors.map(s => ({ value: String(s.id), label: s.name }));
}

function districtsByState(lookups: OtrLookups): Record<string, OtrOption[]> {
  const map: Record<string, OtrOption[]> = {};
  for (const d of lookups.districts) {
    (map[d.state] ??= []).push({ value: d.name, label: d.name });
  }
  for (const list of Object.values(map)) list.sort((a, b) => a.label.localeCompare(b.label));
  return map;
}

function fixedField(stepKey: string, dto: OtrFixedFieldDto, lookups: OtrLookups): OtrFieldDef {
  const layout: OtrFieldLayout = OTR_FIELD_LAYOUT[stepKey]?.[dto.fieldKey] ?? {};
  const type = layout.type ?? FIELD_TYPES[dto.fieldType?.toLowerCase()] ?? 'text';
  const field: OtrFieldDef = {
    key: dto.fieldKey,
    label: dto.label,
    type,
    required: dto.isRequired,
    placeholder: layout.placeholder,
    colSpan: layout.colSpan ?? (type === 'textarea' ? 2 : 1),
    visibleWhen: layout.visibleWhen,
    default: layout.default,
    dependsOn: layout.dependsOn,
    transform: layout.transform,
    documentType: layout.documentType
  };
  if (layout.optionsSource === 'sectors') field.options = sectorOptions(lookups);
  else if (layout.optionsSource === 'districts') field.optionsByParent = districtsByState(lookups);
  else field.options = toOptions(layout.options);
  if (type === 'file') {
    field.accept = OTR_DOCUMENT_ACCEPT;
    field.maxSizeMb = OTR_DOCUMENT_MAX_MB;
    field.hint = `PDF, JPG, PNG • Max ${OTR_DOCUMENT_MAX_MB} MB`;
  }
  return field;
}

function dynamicField(dto: OtrDynamicFieldDto): OtrFieldDef {
  const type = FIELD_TYPES[dto.fieldType?.toLowerCase()] ?? 'text';
  return {
    key: `${DYNAMIC_PREFIX}${dto.fieldKey}`,
    label: dto.label,
    type: type === 'file' ? 'text' : type,
    required: dto.isRequired,
    placeholder: dto.placeholder ?? undefined,
    hint: dto.tooltip ?? undefined,
    default: dto.defaultValue ?? undefined,
    colSpan: (dto.colSpan ?? 12) > 6 ? 2 : 1,
    options: dto.options?.map(o => ({ value: o.value, label: o.label })),
    dynamic: true
  };
}

/** Consecutive fields with the same section name form one section. */
function toSections(stepKey: string, fields: { field: OtrFieldDef; section: string }[]): OtrSectionDef[] {
  const sections: OtrSectionDef[] = [];
  for (const { field, section } of fields) {
    const last = sections[sections.length - 1];
    if (last && last.title === section) last.fields.push(field);
    else sections.push({ key: `${stepKey}-${sections.length}`, title: section, fields: [field] });
  }
  return sections;
}

function toStep(dto: OtrStepFormDto, number: number, lookups: OtrLookups): OtrStepDef {
  const fixed = dto.fixedFields.map(f => ({ field: fixedField(dto.stepKey, f, lookups), section: f.sectionName || dto.stepTitle }));
  const extra = dto.hasDynamicForm && dto.dynamicSchema
    ? [...dto.dynamicSchema.fields]
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map(f => ({ field: dynamicField(f), section: f.sectionName || dto.dynamicSchema?.title || 'Additional Details' }))
    : [];
  return {
    number,
    key: dto.stepKey,
    title: dto.stepTitle,
    subtitle: dto.stepSubtitle,
    kind: 'form',
    sections: toSections(dto.stepKey, [...fixed, ...extra]),
    dynamicFormId: dto.hasDynamicForm ? dto.dynamicFormId : null,
    dynamicFormVersion: dto.hasDynamicForm ? dto.dynamicFormVersion : null
  };
}

/** The steps to draw: the backend's form steps, then "Preview & Submit". */
export function buildFormDef(response: OtrFullFormResponse, lookups: OtrLookups): OtrFormDef {
  const steps = response.steps.map((s, i) => toStep(s, i + 1, lookups));
  steps.push({
    number: steps.length + 1,
    key: OTR_REVIEW_STEP_KEY,
    title: 'Preview & Submit',
    subtitle: `Step ${steps.length + 1} of the application`,
    kind: 'review',
    sections: [],
    declaration: OTR_DECLARATION
  });
  return { version: response.version, title: response.title, description: response.description, steps };
}

// ---------------------------------------------------------------- conditions and options

export function stepFields(step: OtrStepDef): OtrFieldDef[] {
  return step.sections.flatMap(s => s.fields);
}

export function formSteps(form: OtrFormDef): OtrStepDef[] {
  return form.steps.filter(s => s.kind === 'form');
}

function conditionText(value: OtrValue | undefined): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(',');
  return value ?? '';
}

export function conditionHolds(condition: OtrCondition, values: OtrStepValues): boolean {
  const actual = values[condition.field];
  const isFlag = condition.equalTo === 'true' || condition.equalTo === 'false';
  const text = (actual === null || actual === undefined) && isFlag ? 'false' : conditionText(actual);
  return text.toLowerCase() === condition.equalTo.toLowerCase();
}

export function isFieldVisible(field: OtrFieldDef, values: OtrStepValues): boolean {
  return !field.visibleWhen || conditionHolds(field.visibleWhen, values);
}

/** The "*" marker: the backend's isRequired flag. */
export function isFieldRequired(field: OtrFieldDef, _values: OtrStepValues): boolean {
  return !!field.required;
}

export function isFieldCopied(field: OtrFieldDef, values: OtrStepValues): boolean {
  return !!field.copyFrom && !!field.copyWhen && conditionHolds(field.copyWhen, values);
}

export function fieldOptions(field: OtrFieldDef, values: OtrStepValues): OtrOption[] {
  if (field.optionsByParent && field.dependsOn) {
    const parent = conditionText(values[field.dependsOn]);
    if (!parent) return [];
    const key = Object.keys(field.optionsByParent).find(k => k.toLowerCase() === parent.toLowerCase());
    return key ? field.optionsByParent[key] : [];
  }
  return field.options ?? [];
}

/** Sets one value; a district that does not belong to a newly chosen state is cleared. */
export function setStepValue(step: OtrStepDef, values: OtrStepValues, key: string, value: OtrValue): OtrStepValues {
  const next: OtrStepValues = { ...values, [key]: value };
  for (const field of stepFields(step)) {
    if (field.dependsOn !== key) continue;
    const current = next[field.key];
    const options = fieldOptions(field, next);
    if (typeof current === 'string' && current && options.length > 0 && !options.some(o => o.value === current)) {
      next[field.key] = '';
    }
  }
  return next;
}

// ---------------------------------------------------------------- records <-> screen values <-> request bodies

function valueKind(stepKey: string, field: OtrFieldDef): OtrValueKind {
  const kind = OTR_FIELD_LAYOUT[stepKey]?.[field.key]?.value;
  if (kind) return kind;
  if (field.type === 'checkbox') return 'flag';
  if (field.type === 'multiselect') return 'ids';
  if (field.type === 'date') return 'date';
  return 'text';
}

function emptyValue(field: OtrFieldDef): OtrValue {
  if (field.type === 'checkbox') return field.default?.toLowerCase() === 'true';
  if (field.type === 'multiselect') return [];
  return field.default ?? '';
}

function fromRecordValue(kind: OtrValueKind, field: OtrFieldDef, raw: unknown): OtrValue {
  if (raw === undefined || raw === null || raw === '') return emptyValue(field);
  switch (kind) {
    case 'yesNo': return raw === true || String(raw).toLowerCase() === 'true' ? 'Yes' : 'No';
    case 'flag': return raw === true || String(raw).toLowerCase() === 'true';
    case 'ids': return Array.isArray(raw) ? raw.map(String) : String(raw).split(',').map(s => s.trim()).filter(Boolean);
    case 'date': {
      const text = String(raw).slice(0, 10);
      return text === '0001-01-01' ? '' : text;
    }
    default: return String(raw);
  }
}

function dynamicKey(field: OtrFieldDef): string {
  return field.key.slice(DYNAMIC_PREFIX.length);
}

/** The editable values of a step: what the backend has saved, else each field's default. */
export function initialStepValues(step: OtrStepDef, record: OtrStepRecord | null | undefined): OtrStepValues {
  const values: OtrStepValues = {};
  const answers = (record?.dynamicFormAnswers ?? {}) as Record<string, unknown>;
  const saved = !!record && hasSavedStep(step.key, record);
  for (const field of stepFields(step)) {
    if (field.type === 'file') continue;
    if (field.dynamic) {
      const raw = answers[dynamicKey(field)];
      values[field.key] = fromRecordValue(field.type === 'multiselect' ? 'ids' : field.type === 'checkbox' ? 'flag' : 'text', field, raw);
      continue;
    }
    // A record created only by an upload holds the backend's empty defaults: show the screen defaults instead.
    values[field.key] = saved ? fromRecordValue(valueKind(step.key, field), field, record?.[field.key]) : emptyValue(field);
  }
  return values;
}

function toRequestValue(kind: OtrValueKind, value: OtrValue | undefined): unknown {
  switch (kind) {
    case 'yesNo': return value === 'Yes' || value === true;
    case 'flag': return value === true;
    case 'ids': return (Array.isArray(value) ? value : []).map(Number).filter(n => Number.isFinite(n));
    case 'date':
    case 'optionalText': return typeof value === 'string' && value !== '' ? value : null;
    default: return Array.isArray(value) ? value.join(',') : typeof value === 'boolean' ? String(value) : value ?? '';
  }
}

/**
 * The body of PUT /otr/me/<step>: every fixed field of the step (hidden ones empty), the DistrictMasters id of the
 * chosen districts and the step's extra FormManager answers. Values are sent as typed: the backend trims,
 * upper-cases and checks them.
 */
export function toStepPayload(step: OtrStepDef, values: OtrStepValues, lookups: OtrLookups): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const answers: Record<string, unknown> = {};
  for (const field of stepFields(step)) {
    if (field.type === 'file') continue;
    const visible = isFieldVisible(field, values);
    if (field.dynamic) {
      if (visible) answers[dynamicKey(field)] = values[field.key] ?? null;
      continue;
    }
    const kind = valueKind(step.key, field);
    body[field.key] = toRequestValue(kind, visible ? values[field.key] : emptyValue(field));
    if (kind === 'district') {
      const state = field.dependsOn ? conditionText(values[field.dependsOn]) : '';
      const name = visible ? conditionText(values[field.key]) : '';
      body[field.key] = name;
      body[`${field.key}Id`] = lookups.districts.find(
        d => d.name.toLowerCase() === name.toLowerCase() && d.state.toLowerCase() === state.toLowerCase()
      )?.id ?? null;
    }
  }
  body['dynamicFormId'] = step.dynamicFormId ?? null;
  body['dynamicFormVersion'] = step.dynamicFormVersion ?? null;
  body['dynamicFormAnswers'] = Object.keys(answers).length > 0 ? answers : null;
  return body;
}

/** Whether the step itself was saved (not just a document uploaded into it). */
export function hasSavedStep(stepKey: string, record: OtrStepRecord | null | undefined): boolean {
  const marker = OTR_STEP_SAVED_MARKER[stepKey];
  if (!record) return false;
  if (!marker) return record.id !== null && record.id !== undefined;
  const value = record[marker];
  return typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined;
}

/** Steps the backend holds a saved record for. */
export function savedStepNumbers(form: OtrFormDef, records: OtrRecords): number[] {
  return formSteps(form).filter(s => hasSavedStep(s.key, records[s.key])).map(s => s.number);
}

/** The first step without a saved record, or the review step when every step is saved. */
export function currentStepNumber(form: OtrFormDef, records: OtrRecords): number {
  const open = formSteps(form).find(s => !hasSavedStep(s.key, records[s.key]));
  return open?.number ?? form.steps[form.steps.length - 1].number;
}

export function isSubmitted(records: OtrRecords): boolean {
  return String(records['organisation']?.status ?? '').toLowerCase() === 'submitted';
}

/** The reference number, when the backend sends one with the organisation record. */
export function referenceNumber(records: OtrRecords): string | null {
  const value = records['organisation']?.['referenceNo'];
  return typeof value === 'string' && value ? value : null;
}

// ---------------------------------------------------------------- documents

function documentBase(fieldKey: string): string {
  return fieldKey.endsWith('Doc') ? fieldKey.slice(0, -3) : fieldKey;
}

/** The uploaded documents of every step, from `<base>FileName` / `<base>Url` on the records. */
export function documentsFrom(form: OtrFormDef, records: OtrRecords): Record<string, OtrDocument> {
  const docs: Record<string, OtrDocument> = {};
  for (const step of formSteps(form)) {
    const record = records[step.key];
    if (!record) continue;
    for (const field of stepFields(step).filter(f => f.type === 'file')) {
      const base = documentBase(field.key);
      const fileName = record[`${base}FileName`];
      if (typeof fileName === 'string' && fileName) {
        const url = record[`${base}Url`];
        docs[field.key] = { fieldKey: field.key, fileName, url: typeof url === 'string' ? url : null };
      }
    }
  }
  return docs;
}

/** The step whose record holds a document field. */
export function stepOfField(form: OtrFormDef, fieldKey: string): OtrStepDef | undefined {
  return formSteps(form).find(s => stepFields(s).some(f => f.key === fieldKey));
}

// ---------------------------------------------------------------- backend errors

/**
 * Normalises a backend error field name to a field key: `OrganisationName` (FluentValidation), `$.dateOfRegistration`
 * (JSON binding), `request.ifscCode`, `registeredDistrictId` -> the matching field of the step, case-insensitively.
 */
function matchField(raw: string, keys: string[]): string | undefined {
  let name = raw.trim();
  if (name.startsWith('$.')) name = name.slice(2);
  if (name.toLowerCase().startsWith('request.')) name = name.slice(8);
  name = name.split(/[.[]/)[0];
  const lower = name.toLowerCase();
  return keys.find(k => k.toLowerCase() === lower)
    ?? (lower.endsWith('id') ? keys.find(k => k.toLowerCase() === lower.slice(0, -2)) : undefined);
}

/**
 * Groups backend validation errors by step and field. A name like `"<stepKey>.<field>"` goes to that step; otherwise
 * to `stepKey` when it names one of its fields; everything else to `OTR_GENERAL_ERRORS`.
 */
export function mapFieldErrors(errors: ApiFieldError[], form: OtrFormDef, stepKey?: string): OtrErrorMap {
  const map: OtrErrorMap = {};
  const add = (step: string, field: string, message: string) => {
    const bucket = (map[step] ??= {});
    if (!bucket[field]) bucket[field] = message;
  };
  for (const error of errors) {
    const dot = error.field.indexOf('.');
    const prefix = dot > 0 ? error.field.slice(0, dot) : '';
    const prefixed = prefix ? form.steps.find(s => s.key === prefix) : undefined;
    const step = prefixed ?? (stepKey ? form.steps.find(s => s.key === stepKey) : undefined);
    const name = prefixed ? error.field.slice(dot + 1) : error.field;
    const key = step ? matchField(name, stepFields(step).map(f => f.key)) : undefined;
    if (step && key) add(step.key, key, error.message);
    else add(OTR_GENERAL_ERRORS, matchField(name, ['declarationAccepted']) ?? error.field, error.message);
  }
  return map;
}

export function firstStepWithErrors(form: OtrFormDef, errors: OtrErrorMap): OtrStepDef | undefined {
  return formSteps(form).find(s => Object.keys(errors[s.key] ?? {}).length > 0);
}

// ---------------------------------------------------------------- display

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

export function toFileDoc(doc: OtrDocument | undefined): FileDoc | null {
  if (!doc) return null;
  return {
    fileName: doc.fileName,
    fileSize: doc.sizeBytes ? formatFileSize(doc.sizeBytes) : 'Uploaded',
    uploadDate: formatDate(doc.uploadedAt),
    status: 'uploaded'
  };
}

export function displayValue(field: OtrFieldDef, value: OtrValue | undefined, values: OtrStepValues): string {
  if (field.type === 'checkbox') return value === true ? 'Yes' : 'No';
  const options = fieldOptions(field, values);
  const label = (v: string) => options.find(o => o.value.toLowerCase() === v.toLowerCase())?.label ?? v;
  if (Array.isArray(value)) return value.map(label).join(', ');
  if (value === null || value === undefined || value === '') return '';
  if (field.type === 'date') return formatDate(value as string);
  return label(String(value));
}

// ---------------------------------------------------------------- legacy shape for other screens

/**
 * The saved registration in the older `OtrFormData` shape, for the screens that still read it (profile page,
 * profile preview, scheme form, PDF). Built only from what the backend returned.
 */
export function toOtrFormData(records: OtrRecords, form: OtrFormDef | null, lookups: OtrLookups | null): OtrFormData {
  const base = createInitialOtrFormData();
  const org = records['organisation'] ?? null;
  const person = records['authorized-person'] ?? null;
  const bank = records['bank-details'] ?? null;
  const str = (r: OtrStepRecord | null, key: string) => {
    const v = r?.[key];
    return v === null || v === undefined ? '' : String(v);
  };
  const docs = form ? documentsFrom(form, records) : {};
  const doc = (key: string) => toFileDoc(docs[key]);
  const sectorIds = Array.isArray(org?.['preferredSectorIds']) ? (org!['preferredSectorIds'] as unknown[]).map(Number) : [];
  const sectors = sectorIds.map(id => lookups?.sectors.find(s => s.id === id)?.name ?? String(id)).join(', ');
  const firstName = str(person, 'firstName');
  const lastName = str(person, 'lastName');
  const idType = str(person, 'identityDocumentType');
  const idNumber = str(person, 'identityDocumentNumber');
  const date = str(org, 'dateOfRegistration');

  return {
    ...base,
    step1: {
      ...base.step1,
      shortName: str(org, 'organisationName'),
      fullName: str(org, 'organisationName'),
      natureOfEntity: str(org, 'natureOfEntity'),
      registrationNumber: str(org, 'registrationNumber'),
      dateOfRegistration: date.startsWith('0001') ? '' : date,
      stateOfLegalReg: str(org, 'stateOfRegistration'),
      registrationCertDoc: doc('registrationCertificateDoc'),
      companyPan: str(org, 'organisationPan'),
      panCardDoc: doc('panCardDoc'),
      gstRegistered: org?.['isGstRegistered'] === true ? 'Yes' : 'No',
      gstin: str(org, 'gstNumber'),
      gstCertDoc: doc('gstCertificateDoc'),
      msmeRegistered: org?.['isMsmeRegistered'] === true ? 'Yes' : 'No',
      udyamNumber: str(org, 'udyamNumber'),
      msmeCertDoc: doc('msmeCertificateDoc'),
      nsdcPartner: str(org, 'nsdcPartner'),
      preferredSector: sectors,
      contactNo: str(org, 'contactNumber'),
      emailId: str(org, 'organisationEmail'),
      website: str(org, 'website'),
      registeredAddress: str(org, 'registeredAddress'),
      registeredState: str(org, 'registeredState'),
      registeredDistrict: str(org, 'registeredDistrict'),
      registeredPincode: str(org, 'registeredPinCode'),
      sameAsRegistered: org?.['officeSameAsRegistered'] === true,
      officeAddress: str(org, 'officeAddress'),
      officeState: str(org, 'officeState'),
      officeDistrict: str(org, 'officeDistrict'),
      officePincode: str(org, 'officePinCode')
    },
    step2: [],
    step3: {
      ...base.step3,
      firstName,
      lastName,
      name: [firstName, lastName].filter(Boolean).join(' '),
      designation: str(person, 'designation'),
      identityDocType: idType,
      identityDocNumber: idNumber,
      pan: idType === 'PAN Card' ? idNumber : '',
      aadhaarNo: idType === 'Aadhaar Card' ? idNumber : '',
      voterIdNo: idType === 'Voter ID Card' ? idNumber : '',
      passportNo: idType === 'Passport' ? idNumber : '',
      emailId: str(person, 'emailAddress'),
      mobileNo: str(person, 'mobileNumber'),
      state: str(person, 'state'),
      residenceAddress: str(person, 'residentialAddress'),
      authorizationLetterDoc: doc('authorizationLetterDoc'),
      idProofDoc: doc('identityDocumentDoc')
    },
    step4: {
      ...base.step4,
      bankName: str(bank, 'bankName'),
      branchName: str(bank, 'branchName'),
      accountHolderName: str(bank, 'accountHolderName'),
      accountNo: str(bank, 'accountNumber'),
      ifscCode: str(bank, 'ifscCode'),
      micrCode: str(bank, 'micrCode'),
      cancelledChequeDoc: doc('cancelledChequeDoc')
    },
    step5DeclarationAgreed: isSubmitted(records),
    status: isSubmitted(records) ? 'Submitted' : 'Draft',
    registrationId: referenceNumber(records) ?? undefined,
    submittedAt: org?.submittedAt ?? undefined
  };
}
