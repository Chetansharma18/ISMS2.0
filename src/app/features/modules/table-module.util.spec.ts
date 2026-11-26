import { describe, expect, it } from 'vitest';
import { fieldLabel, moduleCellText, moduleColumns, moduleRecordFields, toModuleData } from './table-module.util';

describe('table-module.util (generic page of a permitted table)', () => {
  it('finds the list in a plain array or the usual envelopes', () => {
    expect(toModuleData([{ id: 1 }]).rows).toEqual([{ id: 1 }]);
    expect(toModuleData({ success: true, data: [{ id: 2 }] }).rows).toEqual([{ id: 2 }]);
    expect(toModuleData({ data: { items: [{ id: 3 }], totalCount: 1 } }).rows).toEqual([{ id: 3 }]);
    expect(toModuleData({ Items: [{ id: 4 }] }).rows).toEqual([{ id: 4 }]);
  });

  it('keeps a single object as a record without envelope fields or secrets', () => {
    const data = toModuleData({ success: true, message: 'ok', data: { version: '1.0', healthy: true, apiKey: 'x' } });
    expect(data.rows).toBeNull();
    expect(data.record).toEqual({ version: '1.0', healthy: true });
    expect(moduleRecordFields(data.record!)).toEqual([
      { label: 'Version', value: '1.0' },
      { label: 'Healthy', value: 'Yes' }
    ]);
  });

  it('builds columns from plain fields, id first, without nested objects or secrets', () => {
    const columns = moduleColumns([
      { title: 'Notice 1', id: 7, isActive: true, passwordHash: 'h', author: { name: 'Scheme OIC' }, tags: ['a', 'b'] }
    ]);
    expect(columns.map(c => c.key)).toEqual(['id', 'title', 'isActive', 'tags']);
    expect(columns.map(c => c.label)).toEqual(['ID', 'Title', 'Is Active', 'Tags']);
    expect(moduleColumns([{ a: 1, b: 2, c: 3 }], 2).length).toBe(2);
  });

  it('formats cell values', () => {
    expect(moduleCellText(true)).toBe('Yes');
    expect(moduleCellText(null)).toBe('');
    expect(moduleCellText(['a', 'b'])).toBe('a, b');
    expect(moduleCellText({ x: 1 })).toBe('');
    expect(moduleCellText('2026-01-02')).toBe('2026-01-02');
    expect(moduleCellText('2026-01-02T10:00:00Z')).toContain('2026');
    expect(fieldLabel('createdAt')).toBe('Created At');
  });
});
