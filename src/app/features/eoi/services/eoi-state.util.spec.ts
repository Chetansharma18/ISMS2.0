import { describe, it, expect } from 'vitest';
import { formatDate, formatTime } from '../../../shared/utils/date.util';
import { buildInitialResponses, buildInitialSchemes } from './eoi-state.seed';
import {
  applyScrutinyDecision,
  filterResponsesByScheme,
  findDecisionTargetIndex,
  findSchemeById,
  matchesApplicationId,
  mergeStoredResponses,
  withCompany1UnderScrutiny
} from './eoi-state.util';

describe('eoi-state.util', () => {
  it('withCompany1UnderScrutiny resets only Company 1', () => {
    const list = withCompany1UnderScrutiny(buildInitialResponses());
    const company1 = list.find(r => r.anonymousLabel === 'Company 1')!;
    expect(company1.status).toBe('UNDER_SCRUTINY');
    expect(company1.statusDisplay).toBe('Under Review');
    expect(company1.scrutinyDetails).toBeUndefined();
    expect(list.filter(r => r.schemeId === 'MMKVY-01' && r.status === 'APPROVED').length).toBe(1);
  });

  it('mergeStoredResponses overlays stored data and keeps unmatched seed records', () => {
    const initial = buildInitialResponses();
    const stored = [{ ...initial[1], statusDisplay: 'Rejected', status: 'REJECTED' as const, annualActionPlan: [] }];
    const merged = mergeStoredResponses(initial, stored);

    expect(merged.length).toBe(initial.length);
    expect(merged[0]).toBe(initial[0]);
    expect(merged[1].status).toBe('REJECTED');
    expect(merged[1].annualActionPlan).toEqual(initial[1].annualActionPlan);
  });

  it('mergeStoredResponses maps the legacy APP-004661 id onto Company 1', () => {
    const initial = buildInitialResponses();
    const legacy = { ...initial[0], id: 'APP-004661', regNumber: 'OTHER', statusDisplay: 'Legacy' };
    const merged = mergeStoredResponses(initial, [legacy]);
    expect(merged[0].statusDisplay).toBe('Legacy');
  });

  it('findSchemeById matches by id or ref number', () => {
    const schemes = buildInitialSchemes();
    expect(findSchemeById(schemes, 'MMKVY-01')?.id).toBe('MMKVY-01');
    expect(findSchemeById(schemes, 'RSLDC/EOI/2026/SAMARTH-02')?.id).toBe('SAMARTH-02');
    expect(findSchemeById(schemes, 'unknown')).toBeUndefined();
  });

  it('filterResponsesByScheme returns everything for no id or ALL', () => {
    const responses = buildInitialResponses();
    expect(filterResponsesByScheme(responses)).toBe(responses);
    expect(filterResponsesByScheme(responses, 'ALL')).toBe(responses);
    expect(filterResponsesByScheme(responses, 'MMKVY-01').length).toBe(4);
    expect(filterResponsesByScheme(responses, 'NOPE')).toEqual([]);
  });

  it('matchesApplicationId resolves legacy and new application ids', () => {
    const [c1, c2] = buildInitialResponses();
    expect(matchesApplicationId(c1, 'APP-2024-001')).toBe(true);
    expect(matchesApplicationId(c1, 'APP-004661')).toBe(true);
    expect(matchesApplicationId(c1, c1.regNumber)).toBe(true);
    expect(matchesApplicationId(c1, 'APP-004662')).toBe(false);
    expect(matchesApplicationId(c2, 'APP-004662')).toBe(true);
  });

  it('findDecisionTargetIndex resolves ids and returns -1 when missing', () => {
    const list = buildInitialResponses();
    expect(findDecisionTargetIndex(list, 'APP-2024-003')).toBe(2);
    expect(findDecisionTargetIndex(list, 'APP-004664')).toBe(3);
    expect(findDecisionTargetIndex(list, 'APP-2024-009')).toBe(-1);
  });

  it('applyScrutinyDecision approves with a clamped score and keeps the EMD paid', () => {
    const [target] = buildInitialResponses();
    const now = new Date(2026, 8, 10, 16, 40);
    const result = applyScrutinyDecision(
      target,
      { status: 'APPROVED', grade: 'Grade A', technicalScore: 140, remarks: 'ok' },
      now
    );

    expect(result).not.toBe(target);
    expect(result.status).toBe('APPROVED');
    expect(result.statusDisplay).toBe('Approved');
    expect(result.emdStatus).toBe('PAID');
    expect(result.scrutinyDetails?.technicalScore).toBe(100);
    expect(result.scrutinyDetails?.scrutinyOfficer).toBe('Committee Member 1');
    expect(result.scrutinyDetails?.decisionTimestamp).toBe(`${formatDate(now)} ${formatTime(now)}`);
  });

  it('applyScrutinyDecision rejects, refunds the EMD and clamps a negative score', () => {
    const [target] = buildInitialResponses();
    const result = applyScrutinyDecision(target, {
      status: 'REJECTED',
      grade: 'Grade E',
      technicalScore: -5,
      remarks: 'no',
      disqualificationReason: 'Incomplete',
      scrutinyOfficer: 'Officer X'
    });

    expect(result.status).toBe('REJECTED');
    expect(result.statusDisplay).toBe('Rejected');
    expect(result.emdStatus).toBe('REFUNDED');
    expect(result.scrutinyDetails?.technicalScore).toBe(0);
    expect(result.scrutinyDetails?.disqualificationReason).toBe('Incomplete');
    expect(result.scrutinyDetails?.scrutinyOfficer).toBe('Officer X');
  });
});
