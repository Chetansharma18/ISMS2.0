import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { DOC_MASTER_CONFIG } from './doc-master.component';

describe('Document Master (backend /api/master/doc-masters)', () => {
  const config = DOC_MASTER_CONFIG;

  it('lists one row per document with its applicable schemes and upload rules', () => {
    expect(config.dataKey).toBe('DOC_MASTERS');
    expect(config.title).toBe('Document Master');
    expect(config.hasStatus).toBe(true);
    expect(config.columns.map(c => c.key)).toEqual(['sNo', 'docName', 'schemes', 'allowedExtensions', 'maxFileSizeMb', 'isMandatory']);
    expect(config.filters?.[0]).toMatchObject({ key: 'schemes', label: 'Scheme', placeholder: 'All Schemes' });
  });

  it('asks for the name, category, at least one scheme and the upload rules', () => {
    const fields = Object.fromEntries(config.fields.map(f => [f.key, f]));
    expect(config.fields.map(f => f.key)).toEqual(['docName', 'category', 'schemes', 'allowedExtensions', 'maxFileSizeMb', 'mandatory', 'description']);
    expect(fields['schemes']).toMatchObject({ type: 'multiselect', required: true });
    expect(config.createDefaults()).toMatchObject({ allowedExtensions: '.pdf,.jpg,.jpeg,.png', mandatory: 'No', schemes: [] });
  });

  it('builds the payload the Doc Master adapter sends', () => {
    expect(
      config.buildPayload({ docName: ' Company PAN Card ', category: ' Statutory ', schemes: ['MMKVY', 'ALL'], maxFileSizeMb: '', mandatory: 'Yes' })
    ).toEqual({
      docName: 'Company PAN Card',
      category: 'Statutory',
      schemes: ['MMKVY'],
      allowedExtensions: '.pdf,.jpg,.jpeg,.png',
      maxFileSizeMb: 5,
      mandatory: 'Yes',
      description: '',
      status: 'Active'
    });
  });
});
