import type { CurrentUserResponse } from '../../core/auth/auth-api.models';
import type { OtrFormDef, OtrRecords, OtrStepDef } from '../registration/models/otr-api.model';
import { formSteps, hasSavedStep, isSubmitted } from '../registration/otr-form.util';

/*
 * What the profile page shows (organisation side; aspirants have their own profile):
 * - 'otr': the user has saved an OTR (any step, whatever their role): their registration as filled;
 * - 'otr-start': no OTR yet and signed in with the default role (`User`, given to every new RajSSO user): the OTR
 *   steps to start from;
 * - 'account': no OTR and any other role: the account details of GET /auth/me.
 */
export type ProfileMode = 'otr' | 'otr-start' | 'account';

/** Backend name of the default role of new RajSSO users (SsoSettings:DefaultRole). */
export const DEFAULT_ROLE_NAME = 'user';

const normalize = (name: string) => name.trim().toLowerCase().replace(/[\s_-]+/g, '');

/** True when the session is signed in with the default role. */
export function isDefaultRole(sessionRoleName: string | null | undefined): boolean {
  return !!sessionRoleName && normalize(sessionRoleName) === DEFAULT_ROLE_NAME;
}

/** True when the backend holds at least one saved OTR step of the user. */
export function hasFilledOtr(form: OtrFormDef | null, records: OtrRecords): boolean {
  if (isSubmitted(records)) return true;
  return !!form && formSteps(form).some(s => hasSavedStep(s.key, records[s.key]));
}

export function profileMode(hasOtr: boolean, defaultRole: boolean): ProfileMode {
  if (hasOtr) return 'otr';
  return defaultRole ? 'otr-start' : 'account';
}

export interface ProfileStep {
  number: number;
  title: string;
  subtitle: string;
  completed: boolean;
  current: boolean;
}

/** The registration steps for the timeline: the form's steps, done when the backend holds their record. */
export function profileSteps(form: OtrFormDef, records: OtrRecords): ProfileStep[] {
  const submitted = isSubmitted(records);
  const done = (step: OtrStepDef) => submitted || (step.kind === 'form' ? hasSavedStep(step.key, records[step.key]) : false);
  const firstOpen = form.steps.find(s => !done(s))?.number ?? null;
  return form.steps.map(step => ({
    number: step.number,
    title: step.title,
    subtitle: step.kind === 'review' ? (submitted ? 'Registration submitted.' : 'Review all details and submit.') : step.subtitle,
    completed: done(step),
    current: step.number === firstOpen
  }));
}

/** Completion in percent: saved form steps out of all steps (100 once submitted). */
export function profileCompletion(steps: readonly ProfileStep[]): number {
  if (steps.length === 0) return 0;
  return Math.round((steps.filter(s => s.completed).length / steps.length) * 100);
}

export interface AccountField {
  label: string;
  value: string;
}

/** Fields of GET /auth/me shown on the account profile, in this order and with these labels. */
const ACCOUNT_FIELDS: [key: string, label: string][] = [
  ['displayName', 'Name'],
  ['name', 'Name'],
  ['SSOID', 'SSO ID'],
  ['mailOfficial', 'Official Email'],
  ['email', 'Email'],
  ['mailPersonal', 'Personal Email'],
  ['mobile', 'Mobile'],
  ['telephoneNumber', 'Telephone'],
  ['designation', 'Designation'],
  ['department', 'Department'],
  ['employeeNumber', 'Employee Number'],
  ['gender', 'Gender'],
  ['dateOfBirth', 'Date of Birth'],
  ['postalAddress', 'Address'],
  ['l', 'City'],
  ['st', 'State'],
  ['postalCode', 'PIN Code'],
  ['aadhaarId', 'Aadhaar'],
  ['bhamashahId', 'Bhamashah ID']
];

const MASKED = new Set(['aadhaarId']);

/** Keeps the last 4 characters: "XXXX XXXX 1234". */
export function maskId(value: string): string {
  const v = value.replace(/\s+/g, '');
  return v.length <= 4 ? v : `${'X'.repeat(v.length - 4).replace(/(.{4})/g, '$1 ').trim()} ${v.slice(-4)}`;
}

/** The non-empty account fields of /auth/me (one Name; Aadhaar masked). */
export function accountFields(me: CurrentUserResponse | null): AccountField[] {
  if (!me) return [];
  const raw = me as unknown as Record<string, unknown>;
  const fields: AccountField[] = [];
  for (const [key, label] of ACCOUNT_FIELDS) {
    const value = raw[key];
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    const text = String(value).trim();
    if (!text || fields.some(f => f.label === label)) continue;
    fields.push({ label, value: MASKED.has(key) ? maskId(text) : text });
  }
  return fields;
}

/** The session's role name from /auth/me: the chosen role, else the only one. */
export function sessionRoleName(me: CurrentUserResponse | null): string | null {
  return me?.selectedRole?.name ?? (me?.roles?.length === 1 ? me.roles[0] : null);
}
