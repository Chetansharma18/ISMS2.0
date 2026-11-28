import type { BadgeVariant } from '../../../../shared/components/table/table.types';
import { formatDateTime } from '../../../../shared/utils/date.util';

/*
 * Evaluation Excel and result orders on the backend (/api/eoi/responses/notices/{eoiId}/decisions and /orders).
 *
 * Decisions have one source: the application's status on the backend. The Approve / Reject buttons on the
 * Scrutiny Desk and the evaluation Excel both write it (same rules, same version check), the Excel is always
 * downloaded pre-filled with the current decisions, and the orders are generated from it.
 */

/** One row of a checked Excel: Change (applied on confirm), Unchanged, Skipped (no status) or Error. */
export interface BulkRowDto {
  rowNumber: number;
  applicationNo: string;
  company: string | null;
  status: string | null;
  grade: string | null;
  remarks: string | null;
  result: 'Change' | 'Unchanged' | 'Skipped' | 'Error' | string;
  message: string | null;
  currentStatus: string | null;
  applicationId: number | null;
  version: string | null;
}

export interface BulkUploadDto {
  id: number;
  eoiId: number;
  /** Checked | HasErrors | Applied | Expired */
  status: string;
  fileName: string;
  totalRows: number;
  changeRows: number;
  unchangedRows: number;
  skippedRows: number;
  errorRows: number;
  canConfirm: boolean;
  uploadedBy: string;
  uploadedAt: string;
  appliedBy: string | null;
  appliedAt: string | null;
  expiresAt: string;
  rows: BulkRowDto[] | null;
}

export interface OrderSignoffDto {
  ssoid: string;
  name: string;
  committeeRole: string;
  mobileMasked: string | null;
  otpSentAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  /** Pending | NotSent | Expired | Locked | Verified */
  status: string;
  sendCount: number;
  failedAttempts: number;
  otpExpiresAt: string | null;
  resendAvailableAt: string | null;
}

export type OrderType = 'Empanelment' | 'Rejection';

export interface OrderDto {
  id: number;
  type: OrderType | string;
  round: number;
  version: number;
  orderNo: string;
  /** Draft | Superseded | Final | Signed | Published | Discarded */
  status: string;
  applicationCount: number;
  /** A decision changed after this draft was generated: generate a new draft before signing. */
  isStale: boolean;
  isLatest: boolean;
  generatedBy: string;
  generatedAt: string;
  fileNo: string | null;
  issuedDate: string | null;
  signedFileName: string | null;
  signedUploadedAt: string | null;
  signedOffAt: string | null;
  publishedAt: string | null;
  signoffs: OrderSignoffDto[];
  signoffVerified: number;
  signoffTotal: number;
  /** The order's own signing authority (the Empanelment and the Rejection Order have different ones). */
  signer?: OrderSignerDto | null;
}

/** Who e-signs the order. ssoId / name: the user; authorityName / authorityDesignation: the printed signature block. */
export interface OrderSignerDto {
  ssoId: string | null;
  name: string | null;
  authorityName: string | null;
  authorityDesignation: string | null;
  /** The signed-in user is this order's signing authority. */
  isMe: boolean;
  /** isMe, and the order is the latest up-to-date draft (it can be e-signed now). */
  canESign: boolean;
  /** The order is Signed or Published. */
  signed?: boolean;
  /** Who signed it (the e-signer, or who uploaded the signed copy). */
  signedBy?: string | null;
  signedAt?: string | null;
}

/** A committee member who can be chosen as an order's signing authority. */
export interface SignerOptionDto {
  ssoId: string;
  name: string;
  /** Approver | Member */
  role: string;
  designation: string | null;
}

export interface OrdersOverviewDto {
  eoiId: number;
  refNo: string;
  round: number;
  decisionsLocked: boolean;
  resultsPublishedAt: string | null;
  approved: number;
  rejected: number;
  undecided: number;
  orders: OrderDto[];
}

/** GET /results: can the orders be e-signed and released, and what is missing. */
export interface ReadinessDto {
  eoiId: number;
  refNo: string;
  round: number;
  ready: boolean;
  missing: string[];
  resultsPublishedAt: string | null;
  /** The signed-in user may e-sign (the committee approver). */
  canPublish: boolean;
}

/** POST /results/publish/challenge: the e-sign OTP was sent to this mobile. */
export interface ESignChallengeDto {
  challengeId: number;
  mobileMasked: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface PublishResultDto {
  eoiId: number;
  round: number;
  publishedAt: string;
  publishedBy: string;
  applicantsNotified: number;
}

/** Seconds until another OTP may be requested (0 when it may be requested now). */
export function secondsUntil(iso: string | null | undefined, now: number = Date.now()): number {
  if (!iso) return 0;
  const at = Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isFinite(at) ? Math.max(0, Math.ceil((at - now) / 1000)) : 0;
}

/** The edited text of an order (EoiOrderContent). Rows edit only Category and File Status; the rest is the decision. */
export interface OrderRowContent {
  applicationId: number;
  category: string | null;
  fileStatus: string | null;
}

export interface OrderContent {
  fileNo: string | null;
  dated: string | null;
  title: string | null;
  subject: string | null;
  paragraphs: string[] | null;
  rows: OrderRowContent[] | null;
  signatoryName: string | null;
  signatoryDesignation: string | null;
  copyTo: string[] | null;
  /** Letterhead name and address (the two RSLDC orders use different ones). */
  headerTitle: string | null;
  headerAddress: string | null;
  /** The line under the list, e.g. "This issue with the approval of the competent authority." */
  closingText: string | null;
  /** Dispatch line above "Copy to" (Rejection Order); empty leaves it out. */
  dispatchFileNo: string | null;
  dispatchDated: string | null;
  /** The user who may e-sign the order (one of the EOI's committee); null on save = unchanged. */
  signerSsoId?: string | null;
}

export interface OrderEditorRow {
  applicationId: number;
  applicationNo: string;
  agencyName: string;
  grade: string | null;
  remarks: string | null;
  earlierResult: string | null;
  category: string;
  fileStatus: string;
}

/** GET /orders/{id}/content. canEdit: the approver on the latest draft. */
export interface OrderEditorDto {
  order: OrderDto;
  refNo: string;
  schemeName: string;
  content: OrderContent;
  rows: OrderEditorRow[];
  canEdit: boolean;
  /** Who can be chosen as the signing authority (the EOI's committee, approver first). */
  signerOptions?: SignerOptionDto[];
}

/** What the editor page binds to (arrays of objects, so each line keeps its input while typing). */
export interface OrderDraftForm {
  fileNo: string;
  dated: string;
  title: string;
  subject: string;
  paragraphs: { text: string }[];
  rows: OrderEditorRow[];
  signatoryName: string;
  signatoryDesignation: string;
  copyTo: { text: string }[];
  headerTitle: string;
  headerAddress: string;
  closingText: string;
  dispatchFileNo: string;
  dispatchDated: string;
  /** SSO ID of the signing authority ('' = none chosen). */
  signerSsoId: string;
}

export function toDraftForm(dto: OrderEditorDto): OrderDraftForm {
  const c = dto.content;
  return {
    fileNo: c.fileNo ?? '',
    dated: c.dated ?? '',
    title: c.title ?? '',
    subject: c.subject ?? '',
    paragraphs: (c.paragraphs ?? []).map(text => ({ text })),
    rows: dto.rows.map(r => ({ ...r })),
    signatoryName: c.signatoryName ?? '',
    signatoryDesignation: c.signatoryDesignation ?? '',
    copyTo: (c.copyTo ?? []).map(text => ({ text })),
    headerTitle: c.headerTitle ?? '',
    headerAddress: c.headerAddress ?? '',
    closingText: c.closingText ?? '',
    dispatchFileNo: c.dispatchFileNo ?? '',
    dispatchDated: c.dispatchDated ?? '',
    signerSsoId: c.signerSsoId ?? dto.order.signer?.ssoId ?? ''
  };
}

/** The PUT body: trimmed text, empty paragraphs and copy-to lines dropped. */
export function toContentRequest(form: OrderDraftForm): OrderContent {
  const lines = (list: { text: string }[]) => list.map(l => l.text.trim()).filter(t => t.length > 0);
  return {
    fileNo: form.fileNo.trim(),
    dated: form.dated.trim(),
    title: form.title.trim() || null,
    subject: form.subject.trim(),
    paragraphs: lines(form.paragraphs),
    rows: form.rows.map(r => ({ applicationId: r.applicationId, category: r.category.trim(), fileStatus: r.fileStatus.trim() })),
    signatoryName: form.signatoryName.trim(),
    signatoryDesignation: form.signatoryDesignation.trim(),
    copyTo: lines(form.copyTo),
    headerTitle: form.headerTitle.trim() || null,
    headerAddress: form.headerAddress.trim(),
    closingText: form.closingText.trim(),
    dispatchFileNo: form.dispatchFileNo.trim(),
    dispatchDated: form.dispatchDated.trim(),
    signerSsoId: form.signerSsoId.trim() || null
  };
}

/**
 * Choosing a signing authority: sets the signer, and fills the printed name and designation from that person when
 * they are still empty or still show the previous signer's details (text typed by hand is kept).
 */
export function applySigner(form: OrderDraftForm, option: SignerOptionDto | null, previous: SignerOptionDto | null): OrderDraftForm {
  if (!option) return { ...form, signerSsoId: '' };
  const replace = (current: string, old: string | null | undefined) => !current.trim() || (!!old && current.trim() === old.trim());
  return {
    ...form,
    signerSsoId: option.ssoId,
    signatoryName: replace(form.signatoryName, previous?.name) ? option.name : form.signatoryName,
    signatoryDesignation:
      option.designation && replace(form.signatoryDesignation, previous?.designation) ? option.designation : form.signatoryDesignation
  };
}

/** "Committee Member 1 (Approver, Director)": a signer in the signing-authority list. */
export function signerOptionLabel(option: SignerOptionDto): string {
  return `${option.name} (${[option.role, option.designation].filter(Boolean).join(', ')})`;
}

/** "Scheme OIC, Scheme 1": the printed signing authority of an order (the signer's name when none is printed). */
export function signingAuthorityText(signer: OrderSignerDto | null | undefined): string {
  if (!signer) return '-';
  const name = signer.authorityName?.trim() || signer.name?.trim() || '';
  return [name, signer.authorityDesignation?.trim() ?? ''].filter(Boolean).join(', ') || '-';
}

/** One e-sign action per order that needs signing: "E-Sign Empanelment Order" / "E-Sign Rejection Order". */
export interface ESignAction {
  type: OrderType;
  label: string;
  order: OrderDto;
  /** Signed (or published) already. */
  done: boolean;
  /** The signed-in user is this order's signing authority and it can be e-signed now. */
  canSign: boolean;
  /** Why the button is disabled for me (empty when I can sign it, or it is done). */
  note: string;
  /** "Signed by Committee Member 1" once done, else empty. */
  signedText: string;
}

export const ESIGN_LABEL: Record<OrderType, string> = {
  Empanelment: 'E-Sign Empanelment Order',
  Rejection: 'E-Sign Rejection Order'
};

/** The e-sign actions of the needed orders: only the order types that exist (one button if the EOI has one type). */
export function eSignActions(slots: OrderSlot[]): ESignAction[] {
  return slots
    .filter((s): s is OrderSlot & { order: OrderDto } => s.order !== null)
    .map(s => eSignActionFor(s.order, s.type));
}

/** The e-sign action of one order: enabled only for its own signing authority, "Signed by ..." once signed. */
export function eSignActionFor(o: OrderDto, type: OrderType = o.type === 'Rejection' ? 'Rejection' : 'Empanelment'): ESignAction {
  const done = isOrderComplete(o);
  const signer = o.signer ?? null;
  const who = signer?.name || signer?.authorityName || 'the signing authority';
  let note = '';
  if (!done && !signer?.canESign) {
    if (!signer?.ssoId) note = 'No signing authority is set. Choose one in the draft editor.';
    else if (!signer.isMe) note = `Only ${who} can e-sign this order.`;
    else if (o.isStale) note = 'A decision changed after this draft was generated. Generate a new draft first.';
    else if (o.status === 'Final') note = 'The signed copy is uploaded; the committee OTP sign-off completes it.';
    else note = 'This order cannot be e-signed now.';
  }
  const signedBy = signer?.signedBy?.trim() || signer?.name?.trim() || '';
  const signedText = done ? (signedBy ? `Signed by ${signedBy}` : 'Signed') : '';
  return { type, label: ESIGN_LABEL[type], order: o, done, canSign: !done && !!signer?.canESign, note, signedText };
}

/** UTC time from the backend, in the browser's time. */
export function orderTime(value: string | null | undefined): string {
  if (!value) return '-';
  return formatDateTime(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`);
}

const ROW_RESULT: Record<string, { label: string; variant: BadgeVariant }> = {
  Change: { label: 'Will change', variant: 'info' },
  Unchanged: { label: 'Unchanged', variant: 'neutral' },
  Skipped: { label: 'No status', variant: 'warning' },
  Error: { label: 'Error', variant: 'danger' }
};

export function rowResultBadge(result: string): { label: string; variant: BadgeVariant } {
  return ROW_RESULT[result] ?? { label: result, variant: 'neutral' };
}

const ORDER_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  Draft: { label: 'Draft', variant: 'submitted' },
  Superseded: { label: 'Superseded', variant: 'neutral' },
  Final: { label: 'Signed copy uploaded', variant: 'info' },
  Signed: { label: 'Signed', variant: 'success' },
  Published: { label: 'E-signed & released', variant: 'success' },
  Discarded: { label: 'Discarded', variant: 'danger' }
};

export function orderStatusBadge(status: string): { label: string; variant: BadgeVariant } {
  return ORDER_STATUS[status] ?? { label: status, variant: 'neutral' };
}

export const ORDER_TITLE: Record<OrderType, string> = {
  Empanelment: 'Final Empanelment Order',
  Rejection: 'Final Rejection Order'
};

export interface OrderSlot {
  type: OrderType;
  title: string;
  /** Applications with this result (Approved for Empanelment, Rejected for Rejection). */
  applications: number;
  /** The current order of this type (latest version, not discarded), or null. */
  order: OrderDto | null;
}

/** One slot per order type that is needed (at least one application with that result, or an order already exists). */
export function orderSlots(overview: OrdersOverviewDto | null): OrderSlot[] {
  if (!overview) return [];
  const current = (type: OrderType) =>
    overview.orders.find(o => o.type === type && o.isLatest && o.status !== 'Discarded' && o.status !== 'Superseded') ?? null;
  return (['Empanelment', 'Rejection'] as const)
    .map(type => ({
      type,
      title: ORDER_TITLE[type],
      applications: type === 'Empanelment' ? overview.approved : overview.rejected,
      order: current(type)
    }))
    .filter(slot => slot.applications > 0 || slot.order !== null);
}

/** Signed by every committee member (or published). */
export function isOrderComplete(order: OrderDto | null): boolean {
  return !!order && (order.status === 'Signed' || order.status === 'Published');
}

/** Signed copy uploaded (Final) or later. */
export function isOrderFinal(order: OrderDto | null): boolean {
  return !!order && (order.status === 'Final' || isOrderComplete(order));
}

export type OrderStep = 1 | 2 | 3 | 4;

/**
 * Where the dialog opens: Decisions (1) until a draft exists, Draft Orders (2) while a needed order has no current
 * draft, Sign (3) until every needed order is signed by the committee, then Orders Released (4).
 */
export function initialOrderStep(overview: OrdersOverviewDto | null): OrderStep {
  const slots = orderSlots(overview);
  if (slots.length === 0 || slots.every(s => s.order === null)) return 1;
  if (slots.every(s => isOrderComplete(s.order))) return 4;
  if (slots.every(s => s.order !== null && !s.order.isStale)) return 3;
  return 2;
}

/** Why the orders cannot be generated yet (empty when they can). */
export function generateBlockers(overview: OrdersOverviewDto | null): string[] {
  if (!overview) return ['The decisions are still loading.'];
  const out: string[] = [];
  if (overview.approved + overview.rejected === 0) out.push('No application has been approved or rejected yet.');
  if (overview.undecided > 0) {
    out.push(`${overview.undecided} application${overview.undecided === 1 ? ' is' : 's are'} still undecided. Decide every application before the orders are signed.`);
  }
  return out;
}


