import { describe, it, expect } from 'vitest';
import { SubmittedTender } from '../../../core/models/tender.model';
import { FileDoc } from '../../registration/models/otr-form.model';
import {
  applyOtrDocument,
  calculateTotalFee,
  canEditTender,
  documentCategoryLabel,
  filterTenders,
  formatUploadedFileSize,
  isBeforeClosingDate,
  remainingEdits
} from './tender-status.util';

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
    orgDetails: {} as SubmittedTender['orgDetails'],
    signatoryDetails: {} as SubmittedTender['signatoryDetails'],
    officers: [],
    bankDetails: {} as SubmittedTender['bankDetails'],
    documents: [],
    ...overrides
  };
}

describe('isBeforeClosingDate', () => {
  const now = new Date(2026, 5, 15, 12, 0, 0);

  it('treats a missing closing date as open', () => {
    expect(isBeforeClosingDate(undefined, now)).toBe(true);
    expect(isBeforeClosingDate('', now)).toBe(true);
  });

  it('treats strings without three date parts as open', () => {
    expect(isBeforeClosingDate('garbage', now)).toBe(true);
  });

  it('parses DD-Mon-YYYY', () => {
    expect(isBeforeClosingDate('15-Jun-2026', now)).toBe(true);
    expect(isBeforeClosingDate('14-Jun-2026', now)).toBe(false);
  });

  it('parses numeric months and two digit years', () => {
    expect(isBeforeClosingDate('16/06/26', now)).toBe(true);
    expect(isBeforeClosingDate('01/06/2026', now)).toBe(false);
  });
});

describe('canEditTender / remainingEdits', () => {
  const now = new Date(2026, 5, 15, 12, 0, 0);

  it('allows editing before closing while edits remain', () => {
    expect(canEditTender(makeTender({ editCount: 2 }), now)).toBe(true);
  });

  it('blocks editing once the edit limit is reached', () => {
    expect(canEditTender(makeTender({ editCount: 3 }), now)).toBe(false);
  });

  it('blocks editing after the closing date', () => {
    expect(canEditTender(makeTender({ closingDate: '01-Jan-2026' }), now)).toBe(false);
  });

  it('computes remaining edits and never goes negative', () => {
    expect(remainingEdits(makeTender({ editCount: 1 }))).toBe(2);
    expect(remainingEdits(makeTender({ editCount: 5 }))).toBe(0);
  });

  it('falls back to 3 max edits', () => {
    expect(remainingEdits(makeTender({ editCount: 0, maxEdits: 0 }))).toBe(3);
  });
});

describe('filterTenders', () => {
  const list = [
    makeTender({ id: '1', appRef: 'REF-001', schemeTitle: 'Alpha Scheme' }),
    makeTender({ id: '2', appRef: 'REF-002', schemeTitle: 'Beta Scheme', submittedStatus: 'Rejected', rejectionReason: 'Missing PAN' })
  ];

  it('returns everything for a blank query', () => {
    expect(filterTenders(list, '   ')).toBe(list);
  });

  it('matches case-insensitively on title and ref', () => {
    expect(filterTenders(list, 'alpha').map(t => t.id)).toEqual(['1']);
    expect(filterTenders(list, 'ref-002').map(t => t.id)).toEqual(['2']);
  });

  it('matches on rejection reason and status', () => {
    expect(filterTenders(list, 'missing pan').map(t => t.id)).toEqual(['2']);
    expect(filterTenders(list, 'rejected').map(t => t.id)).toEqual(['2']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterTenders(list, 'zzz')).toEqual([]);
  });
});

describe('documentCategoryLabel', () => {
  it('maps categories to labels', () => {
    expect(documentCategoryLabel('mandatory')).toBe('Mandatory Statutory');
    expect(documentCategoryLabel('annexure')).toBe('Scheme Annexure');
    expect(documentCategoryLabel('supporting')).toBe('Supporting');
  });
});

describe('formatUploadedFileSize', () => {
  it('uses MB from 1 MB upwards', () => {
    expect(formatUploadedFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatUploadedFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  it('uses KB below 1 MB with a 1 KB floor', () => {
    expect(formatUploadedFileSize(512 * 1024)).toBe('512 KB');
    expect(formatUploadedFileSize(10)).toBe('1 KB');
  });
});

describe('applyOtrDocument', () => {
  const fileDoc: FileDoc = { fileName: 'new.pdf', fileSize: '1 KB', uploadDate: '01-Jan-2026', status: 'uploaded' };

  it('writes the document to the matching slot', () => {
    const tender = makeTender({
      orgDetails: {} as SubmittedTender['orgDetails'],
      signatoryDetails: {} as SubmittedTender['signatoryDetails'],
      bankDetails: {} as SubmittedTender['bankDetails']
    });

    applyOtrDocument(tender, 'regCert', fileDoc);
    applyOtrDocument(tender, 'authLetter', fileDoc);
    applyOtrDocument(tender, 'bankDoc', fileDoc);

    expect(tender.orgDetails.registrationCertDoc).toBe(fileDoc);
    expect(tender.signatoryDetails.authorizationLetterDoc).toBe(fileDoc);
    expect(tender.bankDetails.cancelledChequeDoc).toBe(fileDoc);
    expect(tender.orgDetails.panCardDoc).toBeUndefined();
  });
});

describe('calculateTotalFee', () => {
  it('sums processing fee and EMD fee accurately with Indian Rupee formatting', () => {
    // MMKVY
    expect(calculateTotalFee('₹ 2,000', '₹ 50,000')).toBe('₹ 52,000.00');
    expect(calculateTotalFee('₹ 2,000.00', '₹ 50,000.00')).toBe('₹ 52,000.00');
    // MNSKSY
    expect(calculateTotalFee('₹ 2,500', '₹ 75,000')).toBe('₹ 77,500.00');
    // IM-Shakti
    expect(calculateTotalFee('₹ 3,000', '₹ 1,00,000')).toBe('₹ 1,03,000.00');
    // RYSY
    expect(calculateTotalFee('₹ 1,500', '₹ 40,000')).toBe('₹ 41,500.00');
  });

  it('handles missing or non-numeric inputs gracefully', () => {
    expect(calculateTotalFee(undefined, '₹ 50,000')).toBe('₹ 50,000.00');
    expect(calculateTotalFee('₹ 2,000', undefined)).toBe('₹ 2,000.00');
    expect(calculateTotalFee('', '')).toBe('₹ 0.00');
  });
});
