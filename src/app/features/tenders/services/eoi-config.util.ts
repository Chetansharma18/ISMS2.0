import { AnnexureMasterItem, DocMasterItem, DynamicFormField, SchemeMasterItem } from '../../../core/models/admin-masters.model';
import { ApiError, ApiFieldError } from '../../../core/http/api-error';
import { formatInr } from '../../../shared/utils/formatters.util';
import { CommitteeAdmin, EoiAttachment, EoiDocumentItem, EoiFormData, SchemeTenderItem } from '../tenders.models';
import { parseFeeNumber, toInputDate } from '../tenders-page/tenders-page.util';
import {
  EoiAttachmentDto,
  EoiDetail,
  EoiDocumentOption,
  EoiOpenNoticeDetail,
  EoiRequiredDocument,
  EoiFormOptions,
  EoiListItem,
  EoiOpenNotice,
  EoiRequiredDocumentInput,
  EoiSaveRequest,
  EoiUser
} from './eoi-config.model';

/*
 * Pure mappers between the backend's EOI Configuration API and the screen models the Active Schemes page and the
 * Configure EOI form already use (SchemeTenderItem, EoiFormData). The backend checks every save.
 */

/** Category the backend gives annexures linked from Annexure Master. */
export const ANNEXURE_CATEGORY = 'Annexure';

/** yyyy-MM-dd (or ISO date-time) -> dd/MM/yyyy, the list's date format. */
export function toDisplayDay(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** Any date the form holds (yyyy-MM-dd or dd/MM/yyyy) -> yyyy-MM-dd, or null when empty / unreadable. */
export function toIsoDay(value: string | null | undefined): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const converted = toInputDate(v);
  return /^\d{4}-\d{2}-\d{2}$/.test(converted) ? converted : null;
}

const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) || undefined : undefined);

function toStatus(status: string): SchemeTenderItem['status'] {
  return (['Open', 'Closed', 'Draft', 'Scheduled'] as const).find(s => s.toLowerCase() === status?.toLowerCase()) ?? 'Open';
}

/** One row of the Active Schemes list. `id` is the backend EOI id. */
export function listItemToScheme(item: EoiListItem): SchemeTenderItem {
  return {
    id: String(item.id),
    sNo: item.sNo,
    refNo: item.refNo,
    schemeName: item.schemeName,
    schemeCategory: item.schemeCategory,
    eoiCategory: item.eoiCategory ?? '',
    eoiDescription: '',
    datePublished: toDisplayDay(item.publishedDate),
    closingDate: toDisplayDay(item.closingDate),
    status: toStatus(item.status),
    isActive: item.isActive,
    isFrozen: item.isFrozen,
    isEditable: item.isEditable,
    editDisabledReason: item.editDisabledReason,
    committeeCount: item.committeeCount,
    createdAt: time(item.createdAt)
  };
}

const userName = (u: EoiUser) => u.name || u.ssoid;

/** A full EOI as the detail view and the edit form read it. */
/** The EOI's required documents, annexures and published files, as the detail view lists them. */
export function documentFields(
  requiredDocuments: EoiRequiredDocument[] | null | undefined,
  attachments: EoiAttachmentDto[] | null | undefined
): Pick<SchemeTenderItem, 'requiredDocs' | 'annexures' | 'attachedDocs'> {
  const docs = [...(requiredDocuments ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  const isAnnexure = (d: EoiRequiredDocument) =>
    !!d.annexureMasterId || (d.category ?? '').toLowerCase() === ANNEXURE_CATEGORY.toLowerCase();
  return {
    requiredDocs: docs.filter(d => !isAnnexure(d)).map(d => d.name),
    annexures: docs.filter(isAnnexure).map(d => d.name),
    attachedDocs: (attachments ?? []).map((a, i): EoiDocumentItem => ({ sNo: i + 1, name: a.title, size: formatBytes(a.sizeBytes) }))
  };
}

/** An open EOI as an applicant (TP / User) sees it: GET /eoi/apply/notices/{id}. */
export function noticeDetailToScheme(detail: EoiOpenNoticeDetail): SchemeTenderItem {
  return { ...noticeToScheme(detail.notice, 0), ...documentFields(detail.requiredDocuments, detail.attachments) };
}

export function detailToScheme(detail: EoiDetail): SchemeTenderItem {
  return {
    id: String(detail.id),
    sNo: 0,
    refNo: detail.refNo,
    schemeName: detail.schemeName,
    schemeCategory: detail.schemeCategory,
    eoiCategory: detail.eoiCategory ?? '',
    eoiDescription: detail.description ?? '',
    datePublished: toDisplayDay(detail.publishedDate),
    closingDate: toDisplayDay(detail.closingDate),
    eoiDuration: detail.durationYears ? `${detail.durationYears} Years` : '',
    emdFee: formatInr(detail.emdFee),
    processFee: formatInr(detail.processFee),
    emdAmount: detail.emdFee,
    processFeeAmount: detail.processFee,
    isFeeExempted: detail.isFeeExempted,
    status: toStatus(detail.status),
    isActive: detail.isActive,
    isFrozen: detail.isFrozen,
    isEditable: detail.isEditable,
    editDisabledReason: detail.editDisabledReason,
    committeeCount: (detail.approver ? 1 : 0) + (detail.members?.length ?? 0),
    ...documentFields(detail.requiredDocuments, detail.attachments),
    publishFields: (detail.publishFields ?? []) as DynamicFormField[],
    uploadFields: (detail.uploadFields ?? []) as DynamicFormField[],
    // The committee dialog lists and selects people by name; saving turns the names back into SSO IDs.
    committeeApprover: detail.approver ? userName(detail.approver) : '',
    committeeMembers: (detail.members ?? []).map(userName),
    createdAt: time(detail.createdAt),
    updatedAt: time(detail.updatedAt),
    publishedAt: time(detail.publishedAt),
    createdBy: detail.createdBy
  };
}

/** An EOI open to applicants, for the /tenders list. */
export function noticeToScheme(n: EoiOpenNotice, index: number): SchemeTenderItem {
  return {
    id: String(n.id),
    sNo: index + 1,
    refNo: n.refNo,
    schemeName: n.schemeName,
    schemeCategory: n.schemeCategory,
    eoiCategory: n.eoiCategory ?? '',
    eoiDescription: n.description ?? '',
    datePublished: toDisplayDay(n.publishedDate),
    closingDate: toDisplayDay(n.closingDate),
    eoiDuration: n.durationYears ? `${n.durationYears} Years` : '',
    emdFee: formatInr(n.emdFee),
    processFee: formatInr(n.processFee),
    emdAmount: n.emdFee,
    processFeeAmount: n.processFee,
    isFeeExempted: n.isFeeExempted,
    status: 'Open',
    isActive: true
  };
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The edit form for a saved EOI. Saved attachments carry no file: their id is "srv-<attachmentId>". */
export function detailToForm(detail: EoiDetail): EoiFormData {
  const scheme = detailToScheme(detail);
  return {
    refNo: detail.refNo,
    scheme: detail.schemeName,
    schemeCategory: detail.schemeCategory,
    publishedDate: detail.publishedDate ?? '',
    submissionDate: detail.closingDate ?? '',
    eoiDurationValue: detail.durationYears ? String(detail.durationYears) : '',
    eoiDurationUnit: 'Years',
    eoiCategory: detail.eoiCategory ?? '',
    description: detail.description ?? '',
    emdFee: formatInr(detail.emdFee),
    processFee: formatInr(detail.processFee),
    isFeeExempted: detail.isFeeExempted,
    attachments: (detail.attachments ?? [])
      .filter(a => a.kind !== 'Corrigendum')
      .map((a): EoiAttachment => ({
        id: `srv-${a.id}`,
        title: a.title,
        fileName: a.fileName,
        size: formatBytes(a.sizeBytes),
        file: new File([], a.fileName)
      })),
    documents: [...(scheme.requiredDocs ?? [])],
    annexures: [...(scheme.annexures ?? [])],
    publishFields: JSON.parse(JSON.stringify(detail.publishFields ?? [])),
    uploadFields: JSON.parse(JSON.stringify(detail.uploadFields ?? [])),
    documentFiles: {},
    status: scheme.status
  };
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The backend scheme for the scheme name the form holds. */
export function findScheme(options: EoiFormOptions | null, schemeName: string) {
  return options?.schemes.find(s => sameName(s.schemeName, schemeName)) ?? null;
}

function documentInputs(
  names: string[],
  masters: EoiDocumentOption[],
  link: 'docMasterId' | 'annexureMasterId',
  existing: EoiDetail | null
): EoiRequiredDocumentInput[] {
  return names
    .map(n => n.trim())
    .filter(Boolean)
    .map(name => {
      const master = masters.find(m => sameName(m.name, name));
      const previous = existing?.requiredDocuments.find(d => sameName(d.name, name));
      return master
        ? { id: previous?.id ?? null, [link]: master.id }
        : { id: previous?.id ?? null, name, category: link === 'annexureMasterId' ? ANNEXURE_CATEGORY : null };
    });
}

/**
 * The body of POST / PUT /eoi/configurations from the form: scheme and EOI category by id, ISO dates, fees as
 * numbers, documents and annexures linked to their Doc / Annexure Master entries, and the custom fields.
 */
export function formToRequest(
  form: EoiFormData,
  options: EoiFormOptions | null,
  saveAsDraft: boolean,
  existing: EoiDetail | null = null
): EoiSaveRequest {
  const scheme = findScheme(options, form.scheme);
  const category = options?.eoiCategories.find(c => sameName(c.name, form.eoiCategory ?? ''));
  const duration = Number.parseInt(form.eoiDurationValue, 10);
  const fee = (v: string) => (String(v ?? '').trim() === '' ? null : parseFeeNumber(v));
  return {
    refNo: (form.refNo ?? '').trim(),
    schemeId: scheme?.id ?? null,
    schemeCategories: (form.schemeCategory ?? '').split(',').map(s => s.trim()).filter(Boolean),
    eoiCategoryId: category?.id ?? null,
    description: (form.description ?? '').trim() || null,
    publishedDate: toIsoDay(form.publishedDate),
    closingDate: toIsoDay(form.submissionDate),
    durationYears: Number.isFinite(duration) ? duration : null,
    emdFee: form.isFeeExempted ? 0 : fee(form.emdFee),
    processFee: form.isFeeExempted ? 0 : fee(form.processFee),
    isFeeExempted: !!form.isFeeExempted,
    saveAsDraft,
    requiredDocuments: [
      ...documentInputs(form.documents ?? [], options?.documents ?? [], 'docMasterId', existing),
      ...documentInputs(form.annexures ?? [], options?.annexures ?? [], 'annexureMasterId', existing)
    ],
    publishFields: form.publishFields ?? [],
    uploadFields: form.uploadFields ?? []
  };
}

/** Saved attachments removed from the form (to DELETE) and new files added to it (to upload). */
export function attachmentChanges(form: EoiFormData, existing: EoiDetail | null): { removed: number[]; added: EoiAttachment[] } {
  const kept = new Set(form.attachments.filter(a => a.id.startsWith('srv-')).map(a => Number(a.id.slice(4))));
  const removed = (existing?.attachments ?? []).filter(a => a.kind !== 'Corrigendum' && !kept.has(a.id)).map(a => a.id);
  const added = form.attachments.filter(a => !a.id.startsWith('srv-') && a.file && a.file.size > 0);
  return { removed, added };
}

/** Backend field names (refNo, schemeId, requiredDocuments[2].docMasterId ...) -> the form's field names. */
const FIELD_MAP: Record<string, string> = {
  refno: 'refNo',
  schemeid: 'scheme',
  eoicategoryid: 'eoiCategory',
  description: 'description',
  publisheddate: 'publishedDate',
  closingdate: 'submissionDate',
  durationyears: 'eoiDurationValue',
  emdfee: 'emdFee',
  processfee: 'processFee',
  requireddocuments: 'documents',
  schemecategories: 'schemeCategory',
  publishfields: 'publishFields',
  uploadfields: 'uploadFields'
};

export function mapSaveErrors(errors: ApiFieldError[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of errors) {
    const root = e.field.replace(/^\$\./, '').split(/[.[]/)[0].toLowerCase();
    const key = FIELD_MAP[root] ?? e.field;
    out[key] ??= e.message;
  }
  return out;
}

/** Scheme Master rows for the form's scheme dropdown and fee auto-fill, from the backend's options. */
export function schemeItemsFrom(options: EoiFormOptions): SchemeMasterItem[] {
  return options.schemes.map((s, i) => ({
    sNo: i + 1,
    id: String(s.id),
    schemeName: s.schemeName,
    schemeCategory: s.schemeCategory,
    categoryName: s.eoiCategory ?? '',
    amount: s.emdFee,
    processFees: s.processFee,
    status: 'Active'
  }));
}

function schemeNames(ids: number[], options: EoiFormOptions): string[] {
  if (ids.length === 0) return ['All Schemes'];
  return ids.map(id => options.schemes.find(s => s.id === id)?.schemeName).filter((n): n is string => !!n);
}

/** Doc Master rows (only those the backend offers for EOIs), with their scheme names. */
export function docItemsFrom(options: EoiFormOptions): DocMasterItem[] {
  return options.documents.map((d, i) => ({
    id: String(d.id),
    sNo: i + 1,
    docName: d.name,
    documents: d.name,
    category: d.category ?? undefined,
    schemes: schemeNames(d.schemeIds, options),
    schemeIds: d.schemeIds,
    isMandatory: d.isMandatory,
    status: 'Active'
  }));
}

export function annexureItemsFrom(options: EoiFormOptions): AnnexureMasterItem[] {
  return (options.annexures ?? []).map((a, i) => ({
    id: String(a.id),
    sNo: i + 1,
    annexureName: a.name,
    annexures: a.name,
    schemes: schemeNames(a.schemeIds, options),
    schemeIds: a.schemeIds,
    isMandatory: a.isMandatory,
    status: 'Active'
  }));
}

/** A committee candidate as the committee dialog lists it; its value is the SSO ID. */
export function toCommitteeAdmin(u: EoiUser): CommitteeAdmin {
  return { id: u.ssoid, ssoId: u.ssoid, name: userName(u), role: u.designation || u.roles.join(', ') };
}

/**
 * The dialog's people: the eligible candidates plus anyone already on the committee who is not in that list
 * (for example a user whose role was removed later), so the current selection always shows a name.
 */
export function mergeCommitteePeople(candidates: CommitteeAdmin[], current: CommitteeAdmin[]): CommitteeAdmin[] {
  const seen = new Set(candidates.map(c => c.ssoId.toLowerCase()));
  return [...candidates, ...current.filter(p => !seen.has(p.ssoId.toLowerCase()))];
}

/** The backend's reason a committee save was rejected: field messages first, then the general message. */
export function committeeErrorText(error: unknown): string {
  if (!(error instanceof ApiError)) return 'The committee could not be saved. Please try again.';
  const fields = error.fieldErrors.map(f => f.message);
  return fields.length > 0 ? Array.from(new Set(fields)).join(' ') : error.message;
}
