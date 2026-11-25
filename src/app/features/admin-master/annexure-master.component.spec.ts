import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { ANNEXURE_MASTER_CONFIG } from './annexure-master.component';

describe('Annexure Master (backend /api/master/annexures)', () => {
  const config = ANNEXURE_MASTER_CONFIG;

  it('lists one row per annexure with its applicable schemes and upload rules', () => {
    expect(config.dataKey).toBe('ANNEXURE_MASTERS');
    expect(config.title).toBe('Annexure Master');
    expect(config.entityLabel).toBe('Annexure');
    expect(config.hasStatus).toBe(true);
    expect(config.columns.map(c => c.key)).toEqual(['sNo', 'annexureName', 'schemes', 'allowedExtensions', 'maxFileSizeMb', 'isMandatory']);
    expect(config.filters?.[0]).toMatchObject({ key: 'schemes', label: 'Scheme', placeholder: 'All Schemes' });
  });

  it('asks for the name and at least one scheme; new annexures default to PDF and mandatory', () => {
    expect(config.fields[0]).toMatchObject({ key: 'annexureName', type: 'text', required: true });
    expect(config.fields.find(f => f.key === 'schemes')).toMatchObject({ type: 'multiselect', required: true });
    expect(config.createDefaults()).toMatchObject({ allowedExtensions: '.pdf', mandatory: 'Yes' });
  });

  it('builds the payload the Annexure adapter sends', () => {
    const payload = config.buildPayload({ annexureName: 'Annexure-1: Covering Letter', schemes: ['MMKVY'], mandatory: 'Yes' });
    expect(payload).toMatchObject({ annexureName: 'Annexure-1: Covering Letter', schemes: ['MMKVY'], mandatory: 'Yes', status: 'Active' });
  });
});
