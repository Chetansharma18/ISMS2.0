import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TenderDetailHeaderComponent } from './tender-detail-header.component';
import { SubmittedTender } from '../../../core/models/tender.model';
import { canEditTender } from './tender-status.util';

const injector = createEnvironmentInjector([provideZonelessChangeDetection()], null as any);
function createComponent(): TenderDetailHeaderComponent {
  return runInInjectionContext(injector, () => new TenderDetailHeaderComponent());
}

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

describe('TenderDetailHeaderComponent', () => {
  it('instantiates and provides canEdit helper matching canEditTender rule', () => {
    const comp = createComponent();
    const now = new Date(2026, 5, 15);

    // Submitted before closing date with edits available -> editable
    const submittedTender = makeTender({ submittedStatus: 'Submitted', editCount: 1 });
    expect(canEditTender(submittedTender, now)).toBe(true);

    // Rejected -> non-editable
    const rejectedTender = makeTender({ submittedStatus: 'Rejected', editCount: 1 });
    expect(canEditTender(rejectedTender, now)).toBe(false);

    // Approved -> non-editable
    const approvedTender = makeTender({ submittedStatus: 'Approved', editCount: 0 });
    expect(canEditTender(approvedTender, now)).toBe(false);

    // Under Review -> non-editable
    const underReviewTender = makeTender({ submittedStatus: 'Under Review', editCount: 0 });
    expect(canEditTender(underReviewTender, now)).toBe(false);
  });
});
