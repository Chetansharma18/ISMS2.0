import { ApiError } from '../../../../core/http/api-error';
import { formatInr } from '../../../../shared/utils/formatters.util';
import type {
  EoiActionPlanRow,
  EoiFinancialRow,
  EoiProposalDetails,
  EoiProposalOrganisation,
  EoiProposalPerson,
  EoiTrainingCentreRow,
  EoiTrainingPlacementRow
} from './eoi-apply.model';

/*
 * The EOI Form's built-in sections (proposal details): defaults, financial-year helpers, the client copy of the
 * backend's rules (same field paths, see proposal-details-contract.md), the request body and the backend's errors.
 */

export const BUSINESS_ACTIVITIES = [
  'Training & Skill Development',
  'Education',
  'Manufacturing',
  'IT / ITeS',
  'Healthcare',
  'Services',
  'Any other industrial activity'
] as const;
export const ID_PROOF_TYPES = ['Aadhaar Card', 'PAN Card', 'Voter ID Card', 'Passport'] as const;
export const RESIDENTIAL_TYPES = ['Residential', 'Non-Residential', 'Both'] as const;
export const FINANCIAL_ROWS = 3;
export const MAX_ROWS = 50;
export const MAX_TURNOVER = 1e13;

/** The proposal as the form edits it: every section present. */
export interface ProposalForm {
  organisation: EoiProposalOrganisation;
  projectAuthorizedPerson: EoiProposalPerson;
  financials: EoiFinancialRow[];
  trainingCentres: EoiTrainingCentreRow[];
  trainingPlacements: EoiTrainingPlacementRow[];
  actionPlan: EoiActionPlanRow[];
}

export type ProposalRowList = 'trainingCentres' | 'trainingPlacements' | 'actionPlan';
export type ProposalSection = 'organisation' | 'projectAuthorizedPerson';

/** Field path (as the backend names it) -> message. `_form` is a general message. */
export type ProposalErrors = Record<string, string>;

// ---- Financial years (Indian FY, April to March) -------------------------------------------------

/** First calendar year of the financial year the date falls in (2026-05-10 -> 2026, 2026-02-10 -> 2025). */
export function fyStartYear(date: Date): number {
  return date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
}

/** 2023 -> "2023-24". */
export function fyLabel(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}

/** The last `count` completed financial years, oldest first (2026-05-10, 3 -> 2023-24, 2024-25, 2025-26). */
export function completedFinancialYears(count: number, today: Date = new Date()): string[] {
  const current = fyStartYear(today);
  return Array.from({ length: count }, (_, i) => fyLabel(current - count + i));
}

/** The current financial year and the next `ahead` ones (2026-05-10, 2 -> 2026-27, 2027-28, 2028-29). */
export function upcomingFinancialYears(ahead: number, today: Date = new Date()): string[] {
  const current = fyStartYear(today);
  return Array.from({ length: ahead + 1 }, (_, i) => fyLabel(current + i));
}

/** "2023-24": four digits, a dash, and the next year's last two digits. */
export function isFinancialYear(value: string | null | undefined): boolean {
  const m = /^(\d{4})-(\d{2})$/.exec((value ?? '').trim());
  return !!m && Number(m[2]) === (Number(m[1]) + 1) % 100;
}

// ---- Defaults ------------------------------------------------------------------------------------

export const emptyTrainingCentre = (): EoiTrainingCentreRow => ({
  district: null, centreName: null, telephone: null, classrooms: null, practicalRooms: null,
  separateWashrooms: null, labAvailable: null, address: null
});

export const emptyTrainingPlacement = (): EoiTrainingPlacementRow => ({
  sector: null, financialYear: null, trained: null, placed: null, proofCount: null
});

export const emptyActionPlanRow = (): EoiActionPlanRow => ({
  year: null, district: null, sdcCount: null, sdcLocation: null, sectors: null, courses: null, residentialType: null, batches: null
});

export const ROW_FACTORIES: Record<ProposalRowList, () => object> = {
  trainingCentres: emptyTrainingCentre,
  trainingPlacements: emptyTrainingPlacement,
  actionPlan: emptyActionPlanRow
};

/** A new proposal: same authorized person as the OTR, the last three completed years, one empty row per list. */
export function emptyProposal(today: Date = new Date()): ProposalForm {
  return {
    organisation: { businessActivity: null, registeringAuthority: null, placeOfRegistration: null, isBlacklisted: null, blacklistDetails: null },
    projectAuthorizedPerson: {
      sameAsOrganisation: true, name: null, designation: null, mobile: null, email: null, idProofType: null, idNumber: null, residenceAddress: null
    },
    financials: completedFinancialYears(FINANCIAL_ROWS, today).map(financialYear => ({ financialYear, totalTurnover: null, skillTurnover: null })),
    trainingCentres: [emptyTrainingCentre()],
    trainingPlacements: [emptyTrainingPlacement()],
    actionPlan: [emptyActionPlanRow()]
  };
}

/** The saved proposal in the form's shape; missing parts come from `emptyProposal`. Financials always have 3 rows. */
export function proposalForm(saved: EoiProposalDetails | null | undefined, today: Date = new Date()): ProposalForm {
  const base = emptyProposal(today);
  if (!saved) return base;
  const savedFin = (saved.financials ?? []).slice(0, FINANCIAL_ROWS).map(r => ({ ...base.financials[0], ...r }));
  const savedYears = new Set(savedFin.map(r => r.financialYear));
  const financials = [...savedFin, ...base.financials.filter(r => !savedYears.has(r.financialYear))].slice(0, FINANCIAL_ROWS);
  financials.sort((a, b) => (a.financialYear ?? '').localeCompare(b.financialYear ?? ''));
  const rows = <T>(list: T[] | null | undefined, make: () => T): T[] =>
    list && list.length ? list.map(r => ({ ...make(), ...r })) : [make()];
  return {
    organisation: { ...base.organisation, ...(saved.organisation ?? {}) },
    projectAuthorizedPerson: {
      ...base.projectAuthorizedPerson,
      ...(saved.projectAuthorizedPerson ?? {}),
      sameAsOrganisation: saved.projectAuthorizedPerson?.sameAsOrganisation ?? true
    },
    financials,
    trainingCentres: rows(saved.trainingCentres, emptyTrainingCentre),
    trainingPlacements: rows(saved.trainingPlacements, emptyTrainingPlacement),
    actionPlan: rows(saved.actionPlan, emptyActionPlanRow)
  };
}

// ---- Value helpers -------------------------------------------------------------------------------

const textOf = (v: unknown): string => (typeof v === 'string' ? v.trim() : v === null || v === undefined ? '' : String(v).trim());

/** Trimmed text, null when empty. */
export function cleanText(v: unknown): string | null {
  const t = textOf(v);
  return t ? t : null;
}

/** A number from an input (number or numeric text), null when empty or not a number. */
export function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const t = textOf(v).replace(/,/g, '');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const toBool = (v: unknown): boolean | null => (v === true || v === false ? v : null);

// ---- Validation (mirrors the backend) ------------------------------------------------------------

const MOBILE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEPHONE = /^\d{6,15}$/;

class Checker {
  readonly errors: ProposalErrors = {};
  constructor(private readonly complete: boolean) {}

  add(path: string, message: string): void {
    if (!this.errors[path]) this.errors[path] = message;
  }

  text(path: string, value: unknown, label: string, max: number, required = true, extra?: { pattern?: RegExp; patternMessage?: string; oneOf?: readonly string[] }): void {
    const t = textOf(value);
    if (!t) {
      if (required && this.complete) this.add(path, `Enter ${label}.`);
      return;
    }
    if (t.length > max) this.add(path, `${capital(label)} can be at most ${max} characters.`);
    else if (extra?.pattern && !extra.pattern.test(t)) this.add(path, extra.patternMessage ?? `${capital(label)} is not valid.`);
    else if (extra?.oneOf && !extra.oneOf.includes(t)) this.add(path, `Choose ${label} from the list.`);
  }

  year(path: string, value: unknown, label: string): void {
    const t = textOf(value);
    if (!t) {
      if (this.complete) this.add(path, `Select ${label}.`);
    } else if (!isFinancialYear(t)) {
      this.add(path, `${capital(label)} must look like 2023-24.`);
    }
  }

  number(path: string, value: unknown, label: string, min: number, max: number, integer: boolean, maxMessage?: string): number | null {
    const raw = textOf(value);
    if (!raw) {
      if (this.complete) this.add(path, `Enter ${label}.`);
      return null;
    }
    const n = toNumber(value);
    if (n === null) this.add(path, `${capital(label)} must be a number.`);
    else if (integer && !Number.isInteger(n)) this.add(path, `${capital(label)} must be a whole number.`);
    else if (n < min) this.add(path, `${capital(label)} cannot be less than ${min}.`);
    else if (n > max) this.add(path, maxMessage ?? `${capital(label)} cannot be more than ${max}.`);
    else return n;
    return null;
  }

  flag(path: string, value: unknown, label: string): void {
    if (toBool(value) === null && this.complete) this.add(path, `Choose Yes or No for ${label}.`);
  }

  list(path: string, length: number, label: string, min: number, max: number): void {
    if (length > max) this.add(path, `Add at most ${max} ${label}.`);
    else if (this.complete && length < min) this.add(path, `Add at least one ${label.replace(/s$/, '')}.`);
  }
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The backend's rules. Always: lengths, ranges, formats and list sizes. `complete` (Next, Submit): also every
 * required field and the row counts. Answers `{ path: message }` with the backend's paths (`financials[1].skillTurnover`).
 */
export function validateProposal(form: ProposalForm, complete: boolean): ProposalErrors {
  const c = new Checker(complete);

  const o = form.organisation;
  c.text('organisation.businessActivity', o.businessActivity, 'the type of business / activity', 200);
  c.text('organisation.registeringAuthority', o.registeringAuthority, 'the name of the registering authority', 200);
  c.text('organisation.placeOfRegistration', o.placeOfRegistration, 'the place of registration', 100);
  c.flag('organisation.isBlacklisted', o.isBlacklisted, 'blacklisted');
  c.text('organisation.blacklistDetails', o.blacklistDetails, 'the blacklisting details', 1000, o.isBlacklisted === true);

  const p = form.projectAuthorizedPerson;
  if (toBool(p.sameAsOrganisation) === null) {
    if (complete) c.add('projectAuthorizedPerson.sameAsOrganisation', 'Choose whether the project authorized person is the same as the OTR one.');
  } else if (p.sameAsOrganisation === false) {
    const P = 'projectAuthorizedPerson.';
    c.text(P + 'name', p.name, 'the name', 150);
    c.text(P + 'designation', p.designation, 'the designation', 100);
    c.text(P + 'mobile', p.mobile, 'the mobile number', 20, true, { pattern: MOBILE, patternMessage: 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.' });
    c.text(P + 'email', p.email, 'the email', 150, true, { pattern: EMAIL, patternMessage: 'Enter a valid email address.' });
    c.text(P + 'idProofType', p.idProofType, 'the ID proof type', 50, true, { oneOf: ID_PROOF_TYPES });
    c.text(P + 'idNumber', p.idNumber, 'the ID number', 30);
    c.text(P + 'residenceAddress', p.residenceAddress, 'the residence address', 500);
  }

  if (form.financials.length > FINANCIAL_ROWS) c.add('financials', `Enter exactly ${FINANCIAL_ROWS} financial years.`);
  else if (complete && form.financials.length !== FINANCIAL_ROWS) c.add('financials', `Enter exactly ${FINANCIAL_ROWS} financial years.`);
  const years = form.financials.map(r => textOf(r.financialYear)).filter(Boolean);
  if (new Set(years).size !== years.length) c.add('financials', 'Each financial year can appear only once.');
  form.financials.forEach((r, i) => {
    const P = `financials[${i}].`;
    c.year(P + 'financialYear', r.financialYear, 'the financial year');
    const total = c.number(P + 'totalTurnover', r.totalTurnover, 'the total turnover', 0, MAX_TURNOVER, false);
    const skillMax = total ?? MAX_TURNOVER;
    c.number(P + 'skillTurnover', r.skillTurnover, 'the skill development turnover', 0, skillMax, false,
      total !== null ? 'The skill development turnover cannot be more than the total turnover.' : undefined);
  });

  c.list('trainingCentres', form.trainingCentres.length, 'training centres', 1, MAX_ROWS);
  form.trainingCentres.forEach((r, i) => {
    const P = `trainingCentres[${i}].`;
    c.text(P + 'district', r.district, 'the district', 100);
    c.text(P + 'centreName', r.centreName, 'the centre name', 200);
    c.text(P + 'telephone', r.telephone, 'the telephone number', 20, false, { pattern: TELEPHONE, patternMessage: 'Enter 6 to 15 digits.' });
    c.number(P + 'classrooms', r.classrooms, 'the number of classrooms', 0, 1000, true);
    c.number(P + 'practicalRooms', r.practicalRooms, 'the number of practical rooms', 0, 1000, true);
    c.flag(P + 'separateWashrooms', r.separateWashrooms, 'separate washrooms');
    c.flag(P + 'labAvailable', r.labAvailable, 'lab available');
    c.text(P + 'address', r.address, 'the address', 500);
  });

  c.list('trainingPlacements', form.trainingPlacements.length, 'training & placement rows', 1, MAX_ROWS);
  form.trainingPlacements.forEach((r, i) => {
    const P = `trainingPlacements[${i}].`;
    c.text(P + 'sector', r.sector, 'the sector', 200);
    c.year(P + 'financialYear', r.financialYear, 'the financial year');
    const trained = c.number(P + 'trained', r.trained, 'the number trained', 0, 1_000_000, true);
    const placed = c.number(P + 'placed', r.placed, 'the number placed', 0, trained ?? 1_000_000, true,
      trained !== null ? 'The number placed cannot be more than the number trained.' : undefined);
    c.number(P + 'proofCount', r.proofCount, 'the number of placement proofs', 0, placed ?? 1_000_000, true,
      placed !== null ? 'The placement proofs cannot be more than the number placed.' : undefined);
  });

  c.list('actionPlan', form.actionPlan.length, 'action plan rows', 1, MAX_ROWS);
  form.actionPlan.forEach((r, i) => {
    const P = `actionPlan[${i}].`;
    c.year(P + 'year', r.year, 'the year');
    c.text(P + 'district', r.district, 'the district', 100);
    c.number(P + 'sdcCount', r.sdcCount, 'the number of SDCs', 1, 100, true);
    c.text(P + 'sdcLocation', r.sdcLocation, 'the SDC location', 200);
    c.text(P + 'sectors', r.sectors, 'the sectors', 500);
    c.text(P + 'courses', r.courses, 'the courses', 1000);
    c.text(P + 'residentialType', r.residentialType, 'residential / non-residential', 50, true, { oneOf: RESIDENTIAL_TYPES });
    c.number(P + 'batches', r.batches, 'the number of batches', 1, 1000, true);
  });

  return c.errors;
}

// ---- Request -------------------------------------------------------------------------------------

/** The PUT body: trimmed text (empty -> null), numbers as numbers, the person's fields null when same as the OTR. */
export function toProposalRequest(form: ProposalForm): EoiProposalDetails {
  const o = form.organisation;
  const p = form.projectAuthorizedPerson;
  const same = p.sameAsOrganisation !== false;
  const blacklisted = toBool(o.isBlacklisted);
  return {
    organisation: {
      businessActivity: cleanText(o.businessActivity),
      registeringAuthority: cleanText(o.registeringAuthority),
      placeOfRegistration: cleanText(o.placeOfRegistration),
      isBlacklisted: blacklisted,
      blacklistDetails: blacklisted === true ? cleanText(o.blacklistDetails) : null
    },
    projectAuthorizedPerson: {
      sameAsOrganisation: toBool(p.sameAsOrganisation) ?? true,
      name: same ? null : cleanText(p.name),
      designation: same ? null : cleanText(p.designation),
      mobile: same ? null : cleanText(p.mobile),
      email: same ? null : cleanText(p.email),
      idProofType: same ? null : cleanText(p.idProofType),
      idNumber: same ? null : cleanText(p.idNumber),
      residenceAddress: same ? null : cleanText(p.residenceAddress)
    },
    financials: form.financials.map(r => ({
      financialYear: cleanText(r.financialYear),
      totalTurnover: toNumber(r.totalTurnover),
      skillTurnover: toNumber(r.skillTurnover)
    })),
    trainingCentres: form.trainingCentres.map(r => ({
      district: cleanText(r.district),
      centreName: cleanText(r.centreName),
      telephone: cleanText(r.telephone),
      classrooms: toNumber(r.classrooms),
      practicalRooms: toNumber(r.practicalRooms),
      separateWashrooms: toBool(r.separateWashrooms),
      labAvailable: toBool(r.labAvailable),
      address: cleanText(r.address)
    })),
    trainingPlacements: form.trainingPlacements.map(r => ({
      sector: cleanText(r.sector),
      financialYear: cleanText(r.financialYear),
      trained: toNumber(r.trained),
      placed: toNumber(r.placed),
      proofCount: toNumber(r.proofCount)
    })),
    actionPlan: form.actionPlan.map(r => ({
      year: cleanText(r.year),
      district: cleanText(r.district),
      sdcCount: toNumber(r.sdcCount),
      sdcLocation: cleanText(r.sdcLocation),
      sectors: cleanText(r.sectors),
      courses: cleanText(r.courses),
      residentialType: cleanText(r.residentialType),
      batches: toNumber(r.batches)
    }))
  };
}

// ---- Backend errors ------------------------------------------------------------------------------

const PROPOSAL_ROOTS = ['organisation', 'projectAuthorizedPerson', 'financials', 'trainingCentres', 'trainingPlacements', 'actionPlan', 'proposalDetails'];

/** "Financials[1].SkillTurnover" or "body.financials[1].skillTurnover" -> "financials[1].skillTurnover". */
export function normalizeProposalPath(field: string): string {
  const parts = (field ?? '').trim().replace(/^\$\./, '').split('.').filter(Boolean);
  while (parts.length > 1 && !PROPOSAL_ROOTS.includes(lowerFirst(parts[0]).replace(/\[.*$/, ''))) parts.shift();
  return parts.map(lowerFirst).join('.');
}

const lowerFirst = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** The backend's 400 field errors on the proposal details, by the form's paths. */
export function proposalErrorsFrom(error: unknown): ProposalErrors {
  if (!(error instanceof ApiError)) return {};
  const out: ProposalErrors = {};
  for (const f of error.fieldErrors) {
    const path = normalizeProposalPath(f.field);
    const root = path.replace(/[[.].*$/, '');
    if (!PROPOSAL_ROOTS.includes(root)) continue;
    const key = root === 'proposalDetails' ? '_form' : path;
    if (!out[key]) out[key] = f.message;
  }
  return out;
}

/** Errors without the ones of a list (used when a row is added or removed and the indexes move). */
export function withoutListErrors(errors: ProposalErrors, list: string): ProposalErrors {
  return Object.fromEntries(Object.entries(errors).filter(([k]) => k !== list && !k.startsWith(`${list}[`)));
}

// ---- Read-only display ---------------------------------------------------------------------------

export function yesNo(v: boolean | null | undefined): string {
  return v === true ? 'Yes' : v === false ? 'No' : '-';
}

export function amountText(v: number | null | undefined): string {
  return v === null || v === undefined ? '-' : formatInr(v, { fractionDigits: 2 });
}

export function countText(v: number | null | undefined): string {
  return v === null || v === undefined ? '-' : new Intl.NumberFormat('en-IN').format(v);
}

export function plainText(v: string | null | undefined): string {
  return cleanText(v) ?? '-';
}

/** The organisation-level authorized person's name from the OTR copy in the application ('' when unknown). */
export function otrPersonName(profile: Record<string, Record<string, unknown> | undefined> | null | undefined): string {
  const rec: Record<string, unknown> = profile?.['authorized-person'] ?? profile?.['authorizedPerson'] ?? {};
  return cleanText(rec['name']) ?? cleanText(rec['fullName']) ?? cleanText(rec['authorizedPersonName']) ?? '';
}
