import { describe, it, expect } from 'vitest';
import {
  createDefaultCourseRows,
  createDefaultTerms,
  createNewCourseRow,
  recalculateRowTotal,
  sumCourseRows
} from './ipa-editor.util';

describe('ipa-editor.util', () => {
  it('recalculateRowTotal derives per-trainee cost, batch cost and budget', () => {
    const row = createNewCourseRow('x');
    row.costC = 1000;
    row.costH = 500;
    row.approvedTrainees = 10;
    row.cycles = 2;
    recalculateRowTotal(row);
    expect(row.totalCostPerTrainee).toBe(1500);
    expect(row.costPerBatch).toBe(15000);
    expect(row.totalBudget).toBe(30000);
  });

  it('recalculateRowTotal treats empty cost fields as zero', () => {
    const row = createNewCourseRow('x');
    row.costC = null as unknown as number;
    row.costH = 200;
    row.approvedTrainees = 5;
    row.cycles = 1;
    recalculateRowTotal(row);
    expect(row.totalCostPerTrainee).toBe(200);
    expect(row.costPerBatch).toBe(1000);
    expect(row.totalBudget).toBe(1000);
  });

  it('sumCourseRows adds up the requested field', () => {
    const rows = createDefaultCourseRows();
    expect(rows.length).toBe(3);
    expect(sumCourseRows(rows, 'approvedTrainees')).toBe(90);
    expect(sumCourseRows(rows, 'cycles')).toBe(3);
    expect(sumCourseRows(rows, 'costPerBatch')).toBe(1713900 + 765900 + 765900);
    expect(sumCourseRows(rows, 'totalBudget')).toBe(1713900 + 765900 + 765900);
  });

  it('createNewCourseRow uses the given id', () => {
    expect(createNewCourseRow('7').id).toBe('7');
  });

  it('default factories return fresh objects each time', () => {
    const a = createDefaultCourseRows();
    const b = createDefaultCourseRows();
    expect(a).not.toBe(b);
    expect(a[0]).not.toBe(b[0]);
    expect(createDefaultTerms().length).toBe(8);
  });
});
