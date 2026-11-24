import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { AnnexureMasterComponent } from './annexure-master.component';

describe('AnnexureMasterComponent', () => {
  it('initializes config with correct title, entityLabel, and column order (annexureName first, schemes second)', () => {
    const comp = new AnnexureMasterComponent();
    expect(comp.config.title).toBe('Annexure Master');
    expect(comp.config.entityLabel).toBe('Annexure');
    expect(comp.config.dataKey).toBe('ANNEXURE_MASTERS');
    expect(comp.config.hasStatus).toBe(true);
    expect(comp.config.hideViewAction).toBe(true);
    expect(comp.config.tagsColumns).toEqual(['schemes']);

    const columnKeys = comp.config.columns.map((c) => c.key);
    expect(columnKeys).toEqual(['sNo', 'annexureName', 'schemes']);
  });

  it('configures form fields with single annexureName (text) first and schemes (multiselect) second', () => {
    const comp = new AnnexureMasterComponent();
    expect(comp.config.fields.length).toBe(2);
    expect(comp.config.fields[0].key).toBe('annexureName');
    expect(comp.config.fields[0].type).toBe('text');
    expect(comp.config.fields[0].required).toBe(true);

    expect(comp.config.fields[1].key).toBe('schemes');
    expect(comp.config.fields[1].type).toBe('multiselect');
    expect(comp.config.fields[1].required).toBe(true);
  });

  it('builds payload correctly from form data', () => {
    const comp = new AnnexureMasterComponent();
    const payload = comp.config.buildPayload({
      annexureName: 'Annexure-1: Covering Letter',
      schemes: ['Vishwakarma Yuva Udyami Protsahan Yojana']
    });

    expect(payload.annexureName).toBe('Annexure-1: Covering Letter');
    expect(payload.schemes).toEqual(['Vishwakarma Yuva Udyami Protsahan Yojana']);
    expect(payload.status).toBe('Active');
  });

  it('configures scheme filter in filter bar', () => {
    const comp = new AnnexureMasterComponent();
    expect(comp.config.filters?.length).toBe(1);
    expect(comp.config.filters?.[0].key).toBe('schemes');
    expect(comp.config.filters?.[0].label).toBe('Scheme');
    expect(comp.config.filters?.[0].placeholder).toBe('All Schemes');
  });
});
