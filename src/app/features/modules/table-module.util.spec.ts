import { describe, expect, it } from 'vitest';
import {
  entityName,
  fieldLabel,
  moduleCellText,
  moduleColumns,
  moduleDefaults,
  moduleRecordFields,
  moduleShape,
  toModuleBody,
  toModuleData,
  toModuleItem
} from './table-module.util';

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

  describe('masters table for a generic module', () => {
    const NEWS = [
      { id: 4, title: 'Notice 1', content: 'Long body', attachmentUrl: null, isPinned: false, sortOrder: 2, isActive: true, createdAt: '2026-11-19T07:36:00Z', author: { name: 'Scheme OIC' } },
      { id: 3, title: 'Notice 2', content: 'Body', attachmentUrl: '/files/a.pdf', isPinned: true, sortOrder: 1, isActive: false, createdAt: '2026-11-17T07:36:00Z' }
    ];

    it('learns the id, the Active flag, the editable fields and the columns from the records', () => {
      const shape = moduleShape(NEWS)!;
      expect(shape.idKey).toBe('id');
      expect(shape.activeKey).toBe('isActive');
      expect(shape.fields).toEqual([
        { key: 'title', label: 'Title', kind: 'text' },
        { key: 'content', label: 'Content', kind: 'textarea' },
        { key: 'attachmentUrl', label: 'Attachment Url', kind: 'text' },
        { key: 'isPinned', label: 'Is Pinned', kind: 'flag' },
        { key: 'sortOrder', label: 'Sort Order', kind: 'number' }
      ]);
      expect(shape.columns.map(c => c.key)).toEqual(['sNo', 'title', 'attachmentUrl', 'isPinned', 'sortOrder', 'status']);
    });

    it('gives no table without records or without an id', () => {
      expect(moduleShape([])).toBeNull();
      expect(moduleShape([{ name: 'a' }, { name: 'b' }])).toBeNull();
      expect(moduleShape([{ refundId: 1, amount: 5 }, { refundId: 2, amount: 6 }])?.idKey).toBe('refundId');
    });

    it('turns a record into a row and the form back into the request body', () => {
      const shape = moduleShape(NEWS)!;
      const row = toModuleItem(NEWS[1], 1, shape);
      expect(row).toMatchObject({ id: '3', sNo: 2, status: 'Inactive', isPinned: 'Yes', title: 'Notice 2' });

      const edited = toModuleBody(shape, { title: ' Notice 2b ', content: '', attachmentUrl: '/files/a.pdf', isPinned: 'No', sortOrder: '5' }, row);
      expect(edited).toMatchObject({ id: 3, title: 'Notice 2b', content: null, isPinned: false, sortOrder: 5, isActive: false, createdAt: NEWS[1].createdAt });

      // The Active switch sends the whole record with the flag changed.
      expect(toModuleBody(shape, { status: 'Active' }, row)).toMatchObject({ id: 3, title: 'Notice 2', isActive: true });

      const created = toModuleBody(shape, { ...moduleDefaults(shape), title: 'New' }, null);
      expect(created).toEqual({ title: 'New', content: null, attachmentUrl: null, isPinned: false, sortOrder: null, isActive: true });
    });

    it('names the entity in the singular', () => {
      expect(entityName('News')).toBe('News');
      expect(entityName('Payment Refunds')).toBe('Payment Refund');
      expect(entityName('Categories')).toBe('Category');
    });
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
