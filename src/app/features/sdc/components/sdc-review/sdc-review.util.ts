import type { SdcActivityEntry, SdcRecord } from '../../models/sdc.model';

/** A field value for a read-only box: a dash when there is nothing to show. */
export function show(value: string | number | null | undefined): string {
  return value == null || value === '' ? '—' : String(value);
}

/** The department can approve, reject or return an SDC only while it waits for inspection or approval. */
export function canDecideSdc(status: string | undefined): boolean {
  return status === 'SUBMITTED' || status === 'PENDING_INSPECTION' || status === 'INSPECTION_COMPLETED' || status === 'PENDING_APPROVAL';
}

/** Numbers of the cards on the review page. The IPA card is 1 and the centre card 2; the others follow, 0 when not shown. */
export function sectionNumbers(
  hasCourses: boolean,
  hasInspection: boolean
): { courses: number; location: number; photos: number; inspection: number; remarks: number } {
  let n = 2;
  const courses = hasCourses ? ++n : 0;
  const location = ++n;
  const photos = ++n;
  const inspection = hasInspection ? ++n : 0;
  const remarks = ++n;
  return { courses, location, photos, inspection, remarks };
}

/** An SDC is approved only after it has been inspected; before that it can still be rejected or returned. */
export function canApproveSdc(status: string | undefined): boolean {
  return status === 'INSPECTION_COMPLETED' || status === 'PENDING_APPROVAL';
}

/** The inspection form is filled once, while the SDC waits for its inspection. */
export function canInspectSdc(status: string | undefined): boolean {
  return status === 'SUBMITTED' || status === 'PENDING_INSPECTION';
}

/** What is typed in the inspection form. Numbers are kept as typed so they can be checked before they are used. */
export interface InspectionDraft {
  auditorName: string;
  auditorPhone: string;
  /** yyyy-mm-dd. */
  inspectionDate: string;
  physicalExistenceVerified: boolean;
  signboardVerified: boolean;
  classroomsLabsVerified: boolean;
  biometricAebasVerified: boolean;
  auditorLatitude: string;
  auditorLongitude: string;
  recommendation: string;
  auditorRemarks: string;
}

export type InspectionErrors = Partial<Record<'auditorName' | 'auditorPhone' | 'inspectionDate' | 'auditorLatitude' | 'auditorLongitude' | 'recommendation' | 'auditorRemarks', string>>;

const RECOMMENDATIONS = ['RECOMMENDED', 'CORRECTION_REQUIRED', 'REJECTED'];

/** What is wrong with the inspection form, by field; an empty object when it can be submitted. `today` is yyyy-mm-dd. */
export function validateInspection(draft: InspectionDraft, today: string): InspectionErrors {
  const errors: InspectionErrors = {};
  if (!draft.auditorName.trim()) errors.auditorName = 'Enter the name of the auditor.';
  if (!/^[6-9]\d{9}$/.test(draft.auditorPhone.trim())) errors.auditorPhone = 'Enter a 10-digit mobile number.';
  if (!draft.inspectionDate) errors.inspectionDate = 'Select the date of the inspection.';
  else if (draft.inspectionDate > today) errors.inspectionDate = 'The inspection date cannot be in the future.';

  const latitude = draft.auditorLatitude.trim() === '' ? NaN : Number(draft.auditorLatitude);
  if (!(latitude >= -90 && latitude <= 90)) errors.auditorLatitude = 'Enter a latitude between -90 and 90.';
  const longitude = draft.auditorLongitude.trim() === '' ? NaN : Number(draft.auditorLongitude);
  if (!(longitude >= -180 && longitude <= 180)) errors.auditorLongitude = 'Enter a longitude between -180 and 180.';

  if (!RECOMMENDATIONS.includes(draft.recommendation)) errors.recommendation = 'Select the recommendation.';
  if (!draft.auditorRemarks.trim()) errors.auditorRemarks = 'Enter the remarks of the auditor.';
  return errors;
}

/** What the department decided, for the card shown once the SDC is approved, rejected or returned. */
export interface SdcDecisionRecord {
  kind: 'APPROVED' | 'REJECTED' | 'RETURNED';
  /** ISO date-time or date; empty when it is not known. */
  at: string;
  /** The remark of the decision. Who decided is shown with the remarks, not here. */
  text: string;
  /** Capacity sanctioned, for an approval. */
  capacity?: number;
}

const RETURN_PREFIX = /^Returned by Department:\s*/;

/** The decision on an SDC that has been decided or returned, or null while it is still open. */
export function decisionRecordOf(sdc: SdcRecord): SdcDecisionRecord | null {
  const kind = sdc.status === 'APPROVED' ? 'APPROVED' : sdc.status === 'REJECTED' ? 'REJECTED' : sdc.status === 'RETURNED_TO_TP' ? 'RETURNED' : null;
  if (!kind) return null;

  const logged = [...(sdc.activityLog ?? [])].reverse().find(entry => entry.action === kind);
  if (logged) return { kind, at: logged.at, text: logged.text, capacity: logged.capacity };

  // Records from before the log existed carry the decision in their approval data.
  if (kind === 'RETURNED') {
    return { kind, at: '', text: (sdc.remarks ?? '').replace(RETURN_PREFIX, '') };
  }
  return {
    kind,
    at: sdc.approval?.approvedDate ?? '',
    text: sdc.approval?.approvalRemarks ?? '',
    capacity: kind === 'APPROVED' ? sdc.approval?.approvedTargetCapacity : undefined
  };
}

/** A remark or decision written by a department officer. */
export interface SdcRemark {
  id: string;
  author: string;
  /** Designation of the author; empty for older entries. */
  designation: string;
  at: string;
  kind: string;
  text: string;
}

const KIND_LABEL: Record<SdcActivityEntry['action'], string> = {
  REMARK_ADDED: 'Remark',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned to TP'
};

/** The remarks of the department officers on an SDC, oldest first. Entries without text are left out. */
export function remarksOf(sdc: SdcRecord): SdcRemark[] {
  return (sdc.activityLog ?? [])
    .filter(entry => entry.text.trim().length > 0)
    .map(entry => ({ id: entry.id, author: entry.actor, designation: entry.designation ?? '', at: entry.at, kind: KIND_LABEL[entry.action], text: entry.text }));
}
