import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { DocMasterComponent } from './doc-master.component';

describe('DocMasterComponent', () => {
  it('initializes config with correct title, entityLabel, and column order (docName first, schemes second)', () => {
    const comp = new DocMasterComponent();
    expect(comp.config.title).toBe('Doc Master');
    expect(comp.config.entityLabel).toBe('Document');
    expect(comp.config.dataKey).toBe('DOC_MASTERS');
    expect(comp.config.hasStatus).toBe(true);
    expect(comp.config.hideViewAction).toBe(true);
    expect(comp.config.tagsColumns).toEqual(['schemes']);

    const columnKeys = comp.config.columns.map((c) => c.key);
    expect(columnKeys).toEqual(['sNo', 'docName', 'schemes']);
  });

  it('configures form fields with single docName (text) first and schemes (multiselect) second', () => {
    const comp = new DocMasterComponent();
    expect(comp.config.fields.length).toBe(2);
    expect(comp.config.fields[0].key).toBe('docName');
    expect(comp.config.fields[0].type).toBe('text');
    expect(comp.config.fields[0].required).toBe(true);

    expect(comp.config.fields[1].key).toBe('schemes');
    expect(comp.config.fields[1].type).toBe('multiselect');
    expect(comp.config.fields[1].required).toBe(true);
  });

  it('builds payload correctly from form data', () => {
    const comp = new DocMasterComponent();
    const payload = comp.config.buildPayload({
      docName: 'Company PAN Card',
      schemes: ['Vishwakarma Yuva Udyami Protsahan Yojana', 'Mukhyamantri Yuva Sambal Yojana']
    });

    expect(payload.docName).toBe('Company PAN Card');
    expect(payload.schemes).toEqual(['Vishwakarma Yuva Udyami Protsahan Yojana', 'Mukhyamantri Yuva Sambal Yojana']);
    expect(payload.status).toBe('Active');
  });

  it('configures scheme filter in filter bar', () => {
    const comp = new DocMasterComponent();
    expect(comp.config.filters?.length).toBe(1);
    expect(comp.config.filters?.[0].key).toBe('schemes');
    expect(comp.config.filters?.[0].label).toBe('Scheme');
    expect(comp.config.filters?.[0].placeholder).toBe('All Schemes');
  });
});
