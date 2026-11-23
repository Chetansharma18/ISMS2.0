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
  it('correctly identifies rejected state vs non-rejected state', () => {
    // 1. Submitted tender: not rejected, canAppeal is false
    const submittedTender = makeTender({ submittedStatus: 'Submitted' });
    const tenderSignal = signal(submittedTender);

    const comp = runInInjectionContext(injector, () => {
      const c = new TenderAppealSectionComponent();
      (c as any).app = tenderSignal;
      return c;
    });

    expect((comp as any).isRejected()).toBe(false);
    expect((comp as any).canAppeal(submittedTender)).toBe(false);

    // 2. Rejected tender without appeal: isRejected is true, canAppeal is true
    const rejectedTender = makeTender({
      submittedStatus: 'Rejected',
      rejectionReason: 'Technical qualification criteria not met.'
    });
    tenderSignal.set(rejectedTender);
    expect((comp as any).isRejected()).toBe(true);
    expect((comp as any).canAppeal(rejectedTender)).toBe(true);

    // 3. Rejected tender with appeal and documents
    const appealedTender = makeTender({
      submittedStatus: 'Rejected',
      rejectionReason: 'Missing CA UDIN.',
      appeal: {
        submittedOn: '10-Oct-2026',
        reply: 'UDIN certificate is attached.',
        files: [{ fileName: 'udin.pdf', fileSize: '1 MB' }],
        status: 'Accepted',
        deptRemarks: 'Appeal approved after reviewing UDIN certificate.',
        responseDeadline: '19-Oct-2026'
      }
    });
    tenderSignal.set(appealedTender);
    expect((comp as any).isRejected()).toBe(true);
    expect((comp as any).canAppeal(appealedTender)).toBe(false);
    expect((comp as any).appealDueDate()).toBe('19-Oct-2026');
  });
});
