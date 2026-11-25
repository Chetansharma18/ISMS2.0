import { describe, it, expect } from 'vitest';
import type { SubmittedTender } from '../../../core/models/tender.model';
import {
  MAX_APPEAL_FILES,
  buildAppeal,
  canAppeal,
  getAppealDeadline,
  isAppealReady,
  isAppealWindowOpen,
  remainingDaysText,
  remainingAppealDaysText
} from './tender-appeal.util';

const tender = (overrides: Partial<SubmittedTender>): SubmittedTender => ({ submittedStatus: 'Rejected', ...overrides }) as SubmittedTender;

describe('tender appeal', () => {
  const baseNow = new Date(2026, 10, 24); // 24-Nov-2026

  it('lets both rejected and approved applications be appealed once within the 7-day window', () => {
    // Within 7 days: can appeal
    expect(canAppeal(tender({ submittedStatus: 'Rejected', decisionDate: '20-Nov-2026' }), baseNow)).toBe(true);
    expect(canAppeal(tender({ submittedStatus: 'Approved', decisionDate: '21-Nov-2026' }), baseNow)).toBe(true);
    expect(canAppeal(tender({ submittedStatus: 'Accepted', decisionDate: '22-Nov-2026' }), baseNow)).toBe(true);

    // Other statuses cannot appeal
    expect(canAppeal(tender({ submittedStatus: 'Under Review' }), baseNow)).toBe(false);
    expect(canAppeal(tender({ submittedStatus: 'Submitted' }), baseNow)).toBe(false);

    // Already appealed cannot appeal again (single appeal constraint)
    expect(canAppeal(tender({ submittedStatus: 'Rejected', appeal: { submittedOn: '10-Oct-2026', reply: 'Remarks.' } }), baseNow)).toBe(false);
    expect(canAppeal(tender({ submittedStatus: 'Approved', appeal: { submittedOn: '10-Oct-2026', reply: 'Remarks.' } }), baseNow)).toBe(false);
  });

  it('enforces that the apply appeal button stays for 7 days only from decision date', () => {
    // Decision made 3 days ago (21-Nov-2026 relative to 24-Nov-2026) -> Within 7 days: TRUE
    const recentApproved = tender({
      submittedStatus: 'Approved',
      decisionDate: '21-Nov-2026'
    });
    expect(isAppealWindowOpen(recentApproved, baseNow)).toBe(true);
    expect(canAppeal(recentApproved, baseNow)).toBe(true);

    // Decision made 10 days ago (14-Nov-2026 relative to 24-Nov-2026) -> More than 7 days: FALSE
    const expiredApproved = tender({
      submittedStatus: 'Approved',
      decisionDate: '14-Nov-2026'
    });
    expect(isAppealWindowOpen(expiredApproved, baseNow)).toBe(false);
    expect(canAppeal(expiredApproved, baseNow)).toBe(false);

    // Rejected decision made 8 days ago -> More than 7 days: FALSE
    const expiredRejected = tender({
      submittedStatus: 'Rejected',
      decisionDate: '15-Nov-2026'
    });
    expect(isAppealWindowOpen(expiredRejected, baseNow)).toBe(false);
    expect(canAppeal(expiredRejected, baseNow)).toBe(false);
  });

  it('needs an answer to the appeal remarks (text-only)', () => {
    expect(isAppealReady('')).toBe(false);
    expect(isAppealReady('   ')).toBe(false);
    expect(isAppealReady('We request reconsideration of our approved target.')).toBe(true);
  });

  it('builds text-only appeal correctly', () => {
    const appeal = buildAppeal('  Appeal remarks explanation.  ', '24-Nov-2026');
    expect(appeal.reply).toBe('Appeal remarks explanation.');
    expect(appeal.submittedOn).toBe('24-Nov-2026');
    expect(appeal.files).toEqual([]);
  });

  it('calculates remaining days and appeal deadline properly', () => {
    expect(getAppealDeadline(tender({ decisionDate: '20-Nov-2026' }))).toBe('27-Nov-2026');
    expect(remainingDaysText('27-Nov-2026', baseNow)).toBe('3 days remaining');
    expect(remainingDaysText('25-Nov-2026', baseNow)).toBe('1 day remaining');
    expect(remainingDaysText('24-Nov-2026', baseNow)).toBe('Due today (Last day)');
    expect(remainingDaysText('20-Nov-2026', baseNow)).toBe('Appeal window closed (Expired)');
  });
});
