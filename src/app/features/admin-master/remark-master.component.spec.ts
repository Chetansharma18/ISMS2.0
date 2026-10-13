import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { RemarkMasterComponent } from './remark-master.component';

describe('RemarkMasterComponent', () => {
  it('initializes config with correct title, entityLabel, and columns', () => {
    const comp = new RemarkMasterComponent();
    expect(comp.config.title).toBe('Remark Master');
    expect(comp.config.entityLabel).toBe('Remarks');
    expect(comp.config.dataKey).toBe('REMARK_MASTERS');

    const columnKeys = comp.config.columns.map((c) => c.key);
    expect(columnKeys).toContain('sNo');
    expect(columnKeys).toContain('remarkType');
    expect(columnKeys).toContain('description');
    expect(columnKeys).toContain('status');
  });

  it('configures form fields for remarkType (dropdown) and description', () => {
    const comp = new RemarkMasterComponent();
    const typeField = comp.config.fields.find((f) => f.key === 'remarkType');
    const descField = comp.config.fields.find((f) => f.key === 'description');

    expect(typeField).toBeDefined();
    expect(typeField?.type).toBe('select');
    expect(typeField?.options).toEqual(['Positive remark', 'Negative remark']);
    expect(typeField?.required).toBe(true);

    expect(descField).toBeDefined();
    expect(descField?.type).toBe('textarea');
    expect(descField?.required).toBe(true);
  });

  it('builds payload correctly from form data', () => {
    const comp = new RemarkMasterComponent();
    const payload = comp.config.buildPayload({
      remarkType: 'Positive remark',
      description: 'Document verified.'
    });

    expect(payload.remarkType).toBe('Positive remark');
    expect(payload.description).toBe('Document verified.');
    expect(payload.status).toBe('Active');
  });
});
