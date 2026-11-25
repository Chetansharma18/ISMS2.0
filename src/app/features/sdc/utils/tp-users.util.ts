import type { BatchRecord } from '../models/batch.model';
import type { SdcRecord } from '../models/sdc.model';
import type { SsoProfile } from '../../../core/mock/data/sso-users.mock';
import { batchStatusLabel } from './batch-approval.util';

export type TpUserRole = 'Center Head' | 'Faculty' | 'Attender User';

/** One SDC or batch a user is assigned to. */
export interface TpAssignment {
  /** The SDC name with its code, or the batch code. */
  label: string;
  /** The district of the SDC, or the course and center of the batch. */
  detail: string;
  /** Where the SDC or batch stands, in words. */
  status: string;
}

/** One user the training partner has created, with their details and what they are assigned to. */
export interface TpUserRow {
  /** Role and SSO ID together, so a person with two roles has two rows. */
  id: string;
  name: string;
  ssoId: string;
  role: TpUserRole;
  mobile: string;
  email: string;
  designation: string;
  /** Faculty only: trainer type and qualification, joined for display. */
  extra: string;
  /** Faculty only: the two parts of `extra`, to edit. */
  trainerType?: string;
  qualification?: string;
  /** What the user is assigned to: the SDC, or the batches. */
  assignedTo: string;
  /** Under the assignment: the district of the SDC, or the courses of the batches. */
  assignedDetail: string;
  /** yyyy-mm-dd of the first assignment. */
  assignedOn: string;
  /** Every SDC or batch the user is assigned to. */
  assignments: TpAssignment[];
  /** The SDC of a Center Head, to change or unmap. */
  sdcId?: string;
  /** The batch of an Attender User, or the batches of a faculty member, to change or unmap. */
  batchIds: string[];
}

/** "PENDING_APPROVAL" as "Pending approval". */
function sentence(status: string | undefined): string {
  const text = (status ?? '').replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Details of an SSO ID from the SSO directory, or nothing when it has none. */
export type SsoLookup = (ssoId: string) => SsoProfile | undefined;

const day = (iso: string | undefined): string => (iso ?? '').slice(0, 10);

/** Unique texts in their first-seen order. */
function unique(values: string[]): string[] {
  return values.filter((value, index) => value && values.indexOf(value) === index);
}

/**
 * The users the training partner has created: the Center Head of each SDC, the Attender User of each batch, and the
 * faculty added to batches (one row per person, listing all their batches). Faculty without an SSO ID are not users
 * of the portal and are left out. Each person's mobile, e-mail and designation come from the SSO directory.
 */
export function buildTpUsers(sdcs: readonly SdcRecord[], batches: readonly BatchRecord[], lookup: SsoLookup): TpUserRow[] {
  const rows: TpUserRow[] = [];

  for (const sdc of sdcs) {
    const head = sdc.centerHead;
    if (!head) continue;
    rows.push({
      id: `head-${head.ssoId}-${sdc.id}`,
      name: head.name,
      ssoId: head.ssoId,
      role: 'Center Head',
      mobile: head.mobile,
      email: head.email,
      designation: head.designation,
      extra: '',
      assignedTo: `${sdc.sdcName} (${sdc.sdcCode})`,
      assignedDetail: sdc.district,
      assignedOn: day(head.assignedAt),
      assignments: [{ label: `${sdc.sdcName} (${sdc.sdcCode})`, detail: sdc.district, status: sentence(sdc.status) }],
      sdcId: sdc.id,
      batchIds: []
    });
  }

  for (const batch of batches) {
    const attender = batch.attender;
    if (!attender) continue;
    rows.push({
      id: `attender-${attender.ssoId}-${batch.id}`,
      name: attender.name,
      ssoId: attender.ssoId,
      role: 'Attender User',
      mobile: attender.mobile,
      email: attender.email,
      designation: attender.designation,
      extra: '',
      assignedTo: `Batch ${batch.batchCode}`,
      assignedDetail: `${batch.courseName} • ${batch.sdcName}`,
      assignedOn: day(attender.assignedAt),
      assignments: [{ label: batch.batchCode, detail: `${batch.courseName} • ${batch.sdcName}`, status: batchStatusLabel(batch) }],
      batchIds: [batch.id]
    });
  }

  const faculty = new Map<string, { batches: BatchRecord[]; name: string; trainerType: string; qualification: string }>();
  for (const batch of batches) {
    for (const member of batch.faculty ?? []) {
      const ssoId = member.ssoId?.trim();
      if (!ssoId) continue;
      const entry = faculty.get(ssoId.toLowerCase()) ?? { batches: [], name: '', trainerType: '', qualification: '' };
      entry.batches.push(batch);
      entry.name = entry.name || member.facultyName || member.name || '';
      entry.trainerType = entry.trainerType || member.trainerType || member.type || '';
      entry.qualification = entry.qualification || member.qualification || '';
      faculty.set(ssoId.toLowerCase(), entry);
    }
  }
  for (const [key, entry] of faculty) {
    const person = lookup(key);
    const codes = entry.batches.map(batch => batch.batchCode);
    const dates = entry.batches.map(batch => day(batch.createdAt)).filter(Boolean).sort();
    rows.push({
      id: `faculty-${key}`,
      name: person?.name || entry.name,
      ssoId: person?.ssoId || key.toUpperCase(),
      role: 'Faculty',
      mobile: person?.mobile ?? '',
      email: person?.email ?? '',
      designation: person?.designation ?? '',
      extra: [entry.trainerType, entry.qualification].filter(Boolean).join(' • '),
      trainerType: entry.trainerType,
      qualification: entry.qualification,
      assignedTo: codes.length === 1 ? `Batch ${codes[0]}` : `${codes.length} batches`,
      assignedDetail: codes.length === 1 ? entry.batches[0].courseName : unique(codes).join(', '),
      assignedOn: dates[0] ?? '',
      assignments: entry.batches.map(batch => ({
        label: batch.batchCode,
        detail: `${batch.courseName} • ${batch.sdcName}`,
        status: batchStatusLabel(batch)
      })),
      batchIds: entry.batches.map(batch => batch.id)
    });
  }

  return rows;
}

/** Rows whose name, SSO ID, role, contact details or assignment contain the search text. */
export function filterTpUsers(rows: readonly TpUserRow[], role: TpUserRole | 'All', query: string): TpUserRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter(row => {
    if (role !== 'All' && row.role !== role) return false;
    if (!q) return true;
    return [row.name, row.ssoId, row.role, row.mobile, row.email, row.designation, row.assignedTo, row.assignedDetail]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });
}
