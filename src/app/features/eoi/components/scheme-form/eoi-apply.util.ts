import { ApiError } from '../../../../core/http/api-error';
import { formatInr } from '../../../../shared/utils/formatters.util';
import { toDisplayDay } from '../../../tenders/services/eoi-config.util';
import type { EoiOpenNotice } from '../../../tenders/services/eoi-config.model';
import { EoiAnswerValue, EoiApplication, EoiApplyDocument, EoiCustomField } from './eoi-apply.model';
import { EoiDocumentItem } from './scheme-form.model';

/*
 * Pure helpers for the Apply for EOI wizard on the backend application (`/api/eoi/apply`).
 * The backend checks every rule (file type and size, mandatory documents and questions); these only shape its data.
 */

/** Steps that must be complete before the fee steps (keys of EoiApplication.steps). */
export const PRE_FEE_STEP_KEYS = ['organisation', 'authorized-person', 'bank-details', 'proposal-details', 'documents'] as const;

export const PROFILE_STEP_KEYS = ['organisation', 'authorized-person', 'bank-details'] as const;

export function isAnnexure(doc: Pick<EoiApplyDocument, 'category'>): boolean {
  return (doc.category ?? '').trim().toLowerCase() === 'annexure';
}

/** Supporting documents and annexures, each in the EOI's configured order. */
export function splitApplyDocuments(docs: readonly EoiApplyDocument[]): { supporting: EoiApplyDocument[]; annexures: EoiApplyDocument[] } {
  return { supporting: docs.filter(d => !isAnnexure(d)), annexures: docs.filter(isAnnexure) };
}

const dotted = (ext: string) => (ext.startsWith('.') ? ext : `.${ext}`).toLowerCase();

/** `accept` attribute of the file input for one document. */
export function acceptOf(doc: Pick<EoiApplyDocument, 'allowedExtensions'>): string {
  return (doc.allowedExtensions ?? []).map(dotted).join(',');
}

/** "PDF, JPG" for the hint under a document. */
export function formatsOf(doc: Pick<EoiApplyDocument, 'allowedExtensions'>): string {
  return (doc.allowedExtensions ?? []).map(e => dotted(e).slice(1).toUpperCase()).join(', ');
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The application's documents in the shape the fee, receipt and status steps already use. */
export function toWizardDocuments(docs: readonly EoiApplyDocument[]): EoiDocumentItem[] {
  return docs
    .filter(d => d.requiredDocumentId !== null)
    .map(d => ({
      id: d.requiredDocumentId as number,
      name: d.name,
      description: d.category ?? '',
      fileName: d.file?.fileName ?? '',
      fileSize: formatBytes(d.file?.sizeBytes),
      uploadedDate: toDisplayDay(d.file?.uploadedAt),
      isMandatory: d.isMandatory,
      status: d.file ? ('uploaded' as const) : ('pending' as const),
      category: isAnnexure(d) ? ('annexure' as const) : d.isMandatory ? ('mandatory' as const) : ('supporting' as const),
      comment: d.comment ?? undefined
    }));
}

/** The scheme strip at the top of the wizard. */
export interface NoticeHeader {
  title: string;
  description: string;
  refNo: string;
  schemeName: string;
  schemeCategory: string;
  eoiCategory: string;
  publishedDate: string;
  closingDate: string;
  emdFee: string;
  processFee: string;
  emdAmount: number;
  processFeeAmount: number;
}

export function noticeHeader(n: EoiOpenNotice): NoticeHeader {
  return {
    title: n.schemeName,
    description: n.description ?? '',
    refNo: n.refNo,
    schemeName: n.schemeName,
    schemeCategory: n.schemeCategory,
    eoiCategory: n.eoiCategory ?? '',
    publishedDate: toDisplayDay(n.publishedDate),
    closingDate: toDisplayDay(n.closingDate),
    emdFee: n.isFeeExempted ? 'Exempted' : formatInr(n.emdFee),
    processFee: n.isFeeExempted ? 'Exempted' : formatInr(n.processFee),
    emdAmount: n.isFeeExempted ? 0 : n.emdFee,
    processFeeAmount: n.isFeeExempted ? 0 : n.processFee
  };
}

/** An answer as the preview shows it. */
export function answerText(field: Pick<EoiCustomField, 'type'>, value: EoiAnswerValue | undefined): string {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (field.type === 'datepicker' && typeof value === 'string') return toDisplayDay(value) || value;
  if (field.type === 'currency' && value !== '') return formatInr(Number(value));
  return String(value);
}

/** The backend's field errors for the questions (`answers.<key>`), by field key. */
export function answerErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const out: Record<string, string> = {};
  for (const f of error.fieldErrors) {
    const m = /^answers\.(.+)$/i.exec(f.field);
    if (m && !out[m[1]]) out[m[1]] = f.message;
  }
  return out;
}

/** The backend's message for a failed call: its field messages, else the general message. */
export function errorText(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  const fields = Array.from(new Set(error.fieldErrors.map(f => f.message)));
  return fields.length ? fields.join(' ') : error.message || fallback;
}

export function stepDone(app: EoiApplication | null, key: string): boolean {
  return !!app?.steps.find(s => s.key === key)?.completed;
}

/** What is still open before the fee steps, as the backend reports it per step. */
export function pendingBeforeFees(app: EoiApplication | null): string[] {
  if (!app) return [];
  const pending: string[] = [];
  for (const step of app.steps.filter(s => (PRE_FEE_STEP_KEYS as readonly string[]).includes(s.key) && !s.completed)) {
    if (step.key === 'documents') {
      for (const d of app.documents.filter(x => x.isMandatory && !x.file)) pending.push(`Upload the mandatory document: ${d.name}.`);
    } else {
      pending.push(`Complete: ${step.title}.`);
    }
  }
  return pending;
}

/** What RPP's browser return put on the wizard URL (see EoiPaymentReturnController). */
export interface PaymentReturn {
  fee: 'process-fee' | 'emd' | null;
  prn: string | null;
  /** success | failed | cancelled | pending | unknown */
  result: string;
  message: string;
}

export function paymentReturnFrom(params: Record<string, unknown>): PaymentReturn | null {
  const payment = typeof params['payment'] === 'string' ? params['payment'] : '';
  const result = typeof params['result'] === 'string' ? params['result'] : '';
  if (!payment && !result) return null;
  const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  return {
    fee: payment === 'process-fee' || payment === 'emd' ? payment : null,
    prn: text(params['prn']),
    result: result || 'unknown',
    message: text(params['message']) ?? ''
  };
}

/** "RPP (UPI)" for the receipt, from the payment mode RPP reported. */
export function paymentModeText(fee: { paymentMode?: string | null } | null | undefined): string {
  const mode = fee?.paymentMode?.trim();
  return mode ? `RPP (${mode})` : 'Rajasthan Payment Platform (RPP)';
}

/**
 * Opens the payment gateway: posts the fields the backend prepared (Format A or the encrypted Format B) to RPP.
 * The browser leaves the portal; RPP returns it to /api/eoi/apply/payments/return, which reopens the wizard.
 */
export function postToGateway(targetUrl: string, fields: Record<string, string>, doc: Document = document): void {
  const form = doc.createElement('form');
  form.method = 'POST';
  form.action = targetUrl;
  form.style.display = 'none';
  for (const [name, value] of Object.entries(fields ?? {})) {
    const field = doc.createElement('input');
    field.type = 'hidden';
    field.name = name;
    field.value = value ?? '';
    form.appendChild(field);
  }
  doc.body.appendChild(form);
  form.submit();
}

/** Answers keyed by field key, with every configured question present. */
export function initialAnswers(fields: readonly EoiCustomField[], saved: Record<string, EoiAnswerValue> | null | undefined): Record<string, EoiAnswerValue> {
  const out: Record<string, EoiAnswerValue> = {};
  for (const f of fields) {
    const v = saved?.[f.key];
    out[f.key] = v ?? (f.type === 'multiselect' ? [] : f.type === 'checkbox' ? false : '');
  }
  return out;
}
