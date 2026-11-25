import { describe, expect, it } from 'vitest';
import { filterResponsesRows, responsesRowsFrom } from './department-eoi-view.util';

const page = {
  items: [
    {
      sNo: 1, eoiId: 1, refNo: 'RSLDC/EOI/2026-27/01', schemeName: 'Scheme 1', schemeCategory: 'Rajvik, Samarth',
      eoiCategory: 'GENERAL', publishedDate: '2026-11-24', closingDate: '2026-11-25', status: 'Open',
      responseCount: 4, isLocked: false, myRoles: ['Member']
    },
    {
      sNo: 2, eoiId: 7, refNo: 'RSLDC/EOI/2026-27/02', schemeName: 'Scheme 2', schemeCategory: '',
      eoiCategory: null, publishedDate: null, closingDate: '2026-12-31', status: 'Scheduled',
      responseCount: 0, isLocked: true, myRoles: []
    }
  ],
  total: 2, page: 1, pageSize: 100
};

describe('department-eoi-view.util', () => {
  it('maps the backend EOIs to table rows', () => {
    const [first, second] = responsesRowsFrom(page);
    expect(first).toEqual({
      id: 1, refNo: 'RSLDC/EOI/2026-27/01', schemeTitle: 'Scheme 1', category: 'Rajvik, Samarth',
      dateOfOpening: '24-Nov-2026', dateOfClosing: '25-Nov-2026', status: 'Open', responseCount: 4,
      isLocked: false, lockReason: '', myRoles: 'Member'
    });
    expect(second).toMatchObject({
      category: '-', dateOfOpening: '-', isLocked: true, responseCount: 0, lockReason: 'Submissions unlock upon Date of closing'
    });
  });

  it("shows the backend's reason when the caller is not on the committee", () => {
    const [row] = responsesRowsFrom({
      items: [{ ...page.items[0], status: 'Closed', isLocked: true, lockReason: "Only the EOI's committee members and approver can open submissions", myRoles: ['Reviewer'] }]
    });
    expect(row).toMatchObject({ isLocked: true, responseCount: 4, lockReason: "Only the EOI's committee members and approver can open submissions" });
  });

  it('reads an empty or unexpected answer as no rows', () => {
    expect(responsesRowsFrom(null)).toEqual([]);
  });

  it('searches scheme, reference number, category and status', () => {
    const rows = responsesRowsFrom(page);
    expect(filterResponsesRows(rows, 'samarth').map(r => r.id)).toEqual([1]);
    expect(filterResponsesRows(rows, '/02').map(r => r.id)).toEqual([7]);
    expect(filterResponsesRows(rows, 'scheduled').map(r => r.id)).toEqual([7]);
    expect(filterResponsesRows(rows, '')).toHaveLength(2);
  });
});
