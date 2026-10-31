import { formatDate, formatTime } from '../../../shared/utils/date.util';
import type { ApplicantResponse, Scheme, ScrutinyDecisionInput } from './eoi-state.models';

/** Pure helpers behind EoiStateService (no Angular, storage or clock access). */

/**
 * Overlays responses restored from storage onto the seed list. Seed records without a stored
 * counterpart are kept as-is; legacy `APP-004661` ids map onto `APP-2024-001`.
 */
export function mergeStoredResponses(
  initial: ApplicantResponse[],
  stored: ApplicantResponse[]
): ApplicantResponse[] {
  return initial.map(init => {
    const match = stored.find(
      p => matchesApplicationId(p, init.id) || matchesApplicationId(init, p.id)
    );
    if (!match) return init;
    return {
      ...init,
      ...match,
      activityLog: match.activityLog || init.activityLog,
      annualActionPlan: (match.annualActionPlan && match.annualActionPlan.length > 0) ? match.annualActionPlan : init.annualActionPlan,
      bankDetails: match.bankDetails || init.bankDetails,
      organisation: { ...init.organisation, ...match.organisation },
      authorizedSignatory: { ...init.authorizedSignatory, ...match.authorizedSignatory },
      appeal: match.appeal ? {
        ...init.appeal,
        ...match.appeal,
        response: match.appeal.response ?? init.appeal?.response
      } : init.appeal
    };
  });
}

/** Seed list with Company 1 set to "Under Review" for presentation: the one application left to review. */
export function withCompany1UnderScrutiny(initial: ApplicantResponse[]): ApplicantResponse[] {
  return initial.map(resp => {
    const isCompany1 = resp.anonymousLabel === 'Company 1' || resp.id === 'APP-2024-001' || resp.id === 'APP-004661' || resp.id === 'APP-005001';
    if (isCompany1) {
      return {
        ...resp,
        status: 'UNDER_SCRUTINY' as const,
        statusDisplay: 'Under Review',
        scrutinyDetails: undefined,
        appeal: resp.appeal
      };
    }
    return resp;
  });
}

/**
 * Company 2 used to be forced to "Under Review", so saved data still holds it that way. While a saved Company 2 is
 * still under review, it takes the decision it has in the seed, so only Company 1 is left under review.
 */
export function withCompany2SeedDecision(list: ApplicantResponse[], seed: ApplicantResponse[]): ApplicantResponse[] {
  const seeded = seed.find(r => r.id === 'APP-2024-002');
  if (!seeded || seeded.status === 'UNDER_SCRUTINY') return list;
  return list.map(resp =>
    resp.id === 'APP-2024-002' && resp.status === 'UNDER_SCRUTINY'
      ? {
          ...resp,
          status: seeded.status,
          statusDisplay: seeded.statusDisplay,
          emdStatus: seeded.emdStatus,
          scrutinyDetails: seeded.scrutinyDetails
        }
      : resp
  );
}

/** Scheme lookup used by `getSchemeById` (matches the id, or a ref number containing it). */
export function findSchemeById(schemes: Scheme[], schemeId: string): Scheme | undefined {
  return schemes.find(s => s.id === schemeId || s.refNo.includes(schemeId));
}

/** Responses belonging to a scheme; no id (or 'ALL') returns every response. */
export function filterResponsesByScheme(responses: ApplicantResponse[], schemeId?: string): ApplicantResponse[] {
  if (!schemeId || schemeId === 'ALL') return responses;
  return responses.filter(r => r.schemeId === schemeId || r.eoiRefNo.includes(schemeId));
}

/** Lookup used by `getResponseById`: accepts the response id, reg number, or either legacy/new application id. */
export function matchesApplicationId(r: ApplicantResponse, applicationId: string): boolean {
  return (
    r.id === applicationId ||
    r.regNumber === applicationId ||
    (applicationId === 'APP-004661' && (r.id === 'APP-2024-001' || r.anonymousLabel === 'Company 1')) ||
    (applicationId === 'APP-004662' && (r.id === 'APP-2024-002' || r.anonymousLabel === 'Company 2')) ||
    (applicationId === 'APP-004663' && (r.id === 'APP-2024-003' || r.anonymousLabel === 'Company 3')) ||
    (applicationId === 'APP-004664' && (r.id === 'APP-2024-004' || r.anonymousLabel === 'Company 4')) ||
    (applicationId === 'APP-2024-001' && (r.id === 'APP-004661' || r.anonymousLabel === 'Company 1')) ||
    (applicationId === 'APP-2024-002' && (r.id === 'APP-004662' || r.anonymousLabel === 'Company 2')) ||
    (applicationId === 'APP-2024-003' && (r.id === 'APP-004663' || r.anonymousLabel === 'Company 3')) ||
    (applicationId === 'APP-2024-004' && (r.id === 'APP-004664' || r.anonymousLabel === 'Company 4'))
  );
}

/** Index of the response a scrutiny decision applies to (narrower alias set than `matchesApplicationId`). */
export function findDecisionTargetIndex(list: ApplicantResponse[], applicationId: string): number {
  return list.findIndex(r => matchesApplicationId(r, applicationId));
}

/**
 * Returns the response with a scrutiny decision applied (immutably):
 * - REJECTED refunds the EMD, APPROVED keeps it as PAID
 * - the technical score is clamped to 0-100
 */
export function applyScrutinyDecision(
  target: ApplicantResponse,
  decision: ScrutinyDecisionInput,
  now: Date = new Date()
): ApplicantResponse {
  const isApproved = decision.status === 'APPROVED';
  const isReverted = decision.status === 'REVERTED';
  const isUnderScrutiny = decision.status === 'UNDER_SCRUTINY';
  const updatedEmdStatus = (isApproved || isReverted || isUnderScrutiny) ? 'PAID' : 'REFUNDED';
  const statusDisplay = isApproved
    ? 'Approved'
    : isReverted
      ? 'Reverted'
      : isUnderScrutiny
        ? 'Under Review'
        : 'Rejected';

  return {
    ...target,
    status: decision.status,
    statusDisplay: statusDisplay,
    emdStatus: updatedEmdStatus,
    activityLog: decision.activityLog ?? target.activityLog,
    appeal: decision.appeal !== undefined ? decision.appeal : target.appeal,
    uploadedDocuments: decision.uploadedDocuments ?? target.uploadedDocuments,
    scrutinyDetails: {
      technicalScore: Math.min(100, Math.max(0, decision.technicalScore ?? target.scrutinyDetails?.technicalScore ?? 0)),
      grade: decision.grade ?? target.scrutinyDetails?.grade,
      remarks: decision.remarks ?? target.scrutinyDetails?.remarks,
      disqualificationReason: decision.disqualificationReason !== undefined
        ? decision.disqualificationReason
        : target.scrutinyDetails?.disqualificationReason,
      approvalDocument: decision.approvalDocument ?? target.scrutinyDetails?.approvalDocument,
      shortfall: decision.shortfall ?? target.scrutinyDetails?.shortfall,
      remarksHistory: decision.remarksHistory ?? target.scrutinyDetails?.remarksHistory,
      scrutinyOfficer: decision.scrutinyOfficer || target.scrutinyDetails?.scrutinyOfficer || 'Committee Member 1',
      decisionTimestamp: `${formatDate(now)} ${formatTime(now)}`
    }
  };
}
