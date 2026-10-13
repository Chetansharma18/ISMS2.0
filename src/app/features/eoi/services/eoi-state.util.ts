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
      p => p.id === init.id || p.regNumber === init.regNumber || (p.id === 'APP-004661' && init.id === 'APP-2024-001')
    );
    if (!match) return init;
    return {
      ...init,
      ...match,
      activityLog: match.activityLog || init.activityLog,
      annualActionPlan: (match.annualActionPlan && match.annualActionPlan.length > 0) ? match.annualActionPlan : init.annualActionPlan,
      bankDetails: match.bankDetails || init.bankDetails,
      organisation: { ...init.organisation, ...match.organisation },
      authorizedSignatory: { ...init.authorizedSignatory, ...match.authorizedSignatory }
    };
  });
}

/** Seed list with Company 1 and Company 2 set to "Under Review" for presentation. */
export function withTwoCompaniesUnderReview(initial: ApplicantResponse[]): ApplicantResponse[] {
  return initial.map(resp => {
    const isCompany1 = resp.anonymousLabel === 'Company 1' || resp.id === 'APP-2024-001' || resp.id === 'APP-004661' || resp.id === 'APP-005001';
    const isCompany2 = resp.anonymousLabel === 'Company 2' || resp.id === 'APP-2024-002';
    if (isCompany1 || isCompany2) {
      return {
        ...resp,
        status: 'UNDER_SCRUTINY' as const,
        statusDisplay: 'Under Review',
        scrutinyDetails: undefined
      };
    }
    return resp;
  });
}

export const withCompany1UnderScrutiny = withTwoCompaniesUnderReview;

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
  return list.findIndex(r =>
    r.id === applicationId ||
    r.regNumber === applicationId ||
    (applicationId === 'APP-004661' && r.id === 'APP-2024-001') ||
    (applicationId === 'APP-004662' && r.id === 'APP-2024-002') ||
    (applicationId === 'APP-004663' && r.id === 'APP-2024-003') ||
    (applicationId === 'APP-004664' && r.id === 'APP-2024-004') ||
    (applicationId === 'APP-2024-001' && r.id === 'APP-004661')
  );
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
  const updatedEmdStatus = (isApproved || isReverted) ? 'PAID' : 'REFUNDED';
  const statusDisplay = isApproved ? 'Accepted' : isReverted ? 'Reverted' : 'Rejected';

  return {
    ...target,
    status: decision.status,
    statusDisplay: statusDisplay,
    emdStatus: updatedEmdStatus,
    activityLog: decision.activityLog ?? target.activityLog,
    scrutinyDetails: {
      technicalScore: Math.min(100, Math.max(0, decision.technicalScore ?? 0)),
      grade: decision.grade,
      remarks: decision.remarks,
      disqualificationReason: decision.disqualificationReason,
      approvalDocument: decision.approvalDocument,
      shortfall: decision.shortfall ?? target.scrutinyDetails?.shortfall,
      remarksHistory: decision.remarksHistory ?? target.scrutinyDetails?.remarksHistory,
      scrutinyOfficer: decision.scrutinyOfficer || 'Department Scrutiny Officer (RSLDC)',
      decisionTimestamp: `${formatDate(now)} ${formatTime(now)}`
    }
  };
}
