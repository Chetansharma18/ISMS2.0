import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TenderAppealSectionComponent } from './tender-appeal-section.component';
import { SubmittedTender } from '../../../core/models/tender.model';

const injector = createEnvironmentInjector([provideZonelessChangeDetection()], null as any);

function makeTender(overrides: Partial<SubmittedTender> = {}): SubmittedTender {
  return {
    id: 't1',
    appRef: 'RSLDC/EOI/2026/001',
    appliedDate: '01-Jan-2026',
    closingDate: '31-Dec-2099',
    schemeTitle: 'Skill Scheme Alpha',
    schemeName: 'Alpha',
    schemeCategory: 'General',
    department: 'Department of Skills',
    emdAmount: '₹ 50,000',
    processingFee: '₹ 2,000',
    transactionRef: 'GRN-100',
    emdTransactionRef: 'GRN-101',
    submittedStatus: 'Submitted',
    eoiStatus: '-',
    editCount: 0,
    maxEdits: 3,
    orgDetails: {} as any,
    signatoryDetails: {} as any,
    officers: [],
    bankDetails: {} as any,
    documents: [],
    ...overrides
  };
}

describe('TenderAppealSectionComponent', () => {
  it('correctly identifies appeal state and supports appeal in both rejected and approved cases within 7 days', () => {
    // 1. Submitted tender: not eligible for appeal, canAppeal is false
    const submittedTender = makeTender({ submittedStatus: 'Submitted' });
    const tenderSignal = signal(submittedTender);

    const comp = runInInjectionContext(injector, () => {
      const c = new TenderAppealSectionComponent();
      (c as any).app = tenderSignal;
      return c;
    });

    expect((comp as any).isRejected()).toBe(false);
    expect((comp as any).canAppeal(submittedTender)).toBe(false);

    // 2. Rejected tender within 7-day window: eligible for appeal, canAppeal is true
    const rejectedTender = makeTender({
      submittedStatus: 'Rejected',
      decisionDate: '22-Nov-2026',
      appealDeadline: '29-Nov-2026',
      rejectionReason: 'Technical qualification criteria not met.'
    });
    tenderSignal.set(rejectedTender);
    expect((comp as any).isRejected()).toBe(true);
    expect((comp as any).canAppeal(rejectedTender)).toBe(true);
    expect((comp as any).appealDueDate()).toBe('29-Nov-2026');

    // 3. Approved tender within 7-day window: eligible for appeal, canAppeal is true
    const approvedTender = makeTender({
      submittedStatus: 'Approved',
      decisionDate: '21-Nov-2026',
      appealDeadline: '28-Nov-2026',
      scrutinyRemarks: 'Proposal approved by scrutiny committee.'
    });
    tenderSignal.set(approvedTender);
    expect((comp as any).isRejected()).toBe(true);
    expect((comp as any).canAppeal(approvedTender)).toBe(true);
    expect((comp as any).appealDueDate()).toBe('28-Nov-2026');

    // 4. Tender with expired 7-day window: canAppeal is false (button disappears after 7 days)
    const expiredTender = makeTender({
      submittedStatus: 'Approved',
      decisionDate: '10-Nov-2026',
      appealDeadline: '17-Nov-2026'
    });
    tenderSignal.set(expiredTender);
    expect((comp as any).isRejected()).toBe(true);
    expect((comp as any).canAppeal(expiredTender)).toBe(false);

    // 5. Rejected tender with appeal already submitted: canAppeal is false (single appeal constraint)
    const appealedTender = makeTender({
      submittedStatus: 'Rejected',
      rejectionReason: 'Missing CA UDIN.',
      appeal: {
        submittedOn: '10-Oct-2026',
        reply: 'UDIN certificate is verified.',
        status: 'Accepted',
        deptRemarks: 'Appeal approved after reviewing UDIN.'
      }
    });
    tenderSignal.set(appealedTender);
    expect((comp as any).isRejected()).toBe(true);
    expect((comp as any).canAppeal(appealedTender)).toBe(false);

    // 6. Approved tender with appeal already submitted: canAppeal is false
    const approvedAppealedTender = makeTender({
      submittedStatus: 'Approved',
      scrutinyRemarks: 'Proposal approved.',
      appeal: {
        submittedOn: '11-Oct-2026',
        reply: 'Requesting target revision from 100 to 200.',
        status: 'Pending'
      }
    });
    tenderSignal.set(approvedAppealedTender);
    expect((comp as any).isRejected()).toBe(true);
    expect((comp as any).canAppeal(approvedAppealedTender)).toBe(false);
  });
});
