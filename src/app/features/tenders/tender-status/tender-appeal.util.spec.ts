import type { SubmittedTender } from '../../../core/models/tender.model';
import { MAX_APPEAL_FILES, buildAppeal, canAppeal, isAppealReady } from './tender-appeal.util';

const tender = (overrides: Partial<SubmittedTender>): SubmittedTender => ({ submittedStatus: 'Rejected', ...overrides }) as SubmittedTender;

describe('tender appeal', () => {
  it('lets a rejected application be appealed once', () => {
    expect(canAppeal(tender({}))).toBe(true);
    expect(canAppeal(tender({ appeal: { submittedOn: '10-Oct-2026', reply: 'Attached.', files: [] } }))).toBe(false);
    expect(canAppeal(tender({ submittedStatus: 'Approved' }))).toBe(false);
    expect(canAppeal(tender({ submittedStatus: 'Under Review' }))).toBe(false);
  });

  it('needs an answer to the rejection remarks', () => {
    expect(isAppealReady('')).toBe(false);
    expect(isAppealReady('   ')).toBe(false);
    expect(isAppealReady('The CA certificate is attached.')).toBe(true);
  });

  it('trims the answer and keeps the attached files', () => {
    const files = Array.from({ length: MAX_APPEAL_FILES + 2 }, (_, i) => ({ fileName: `f${i}.pdf`, fileSize: '1 KB' }));
    const appeal = buildAppeal('  Attached.  ', files, '10-Oct-2026');
    expect(appeal.reply).toBe('Attached.');
    expect(appeal.submittedOn).toBe('10-Oct-2026');
    expect(appeal.files).toHaveLength(MAX_APPEAL_FILES);
  });
});
