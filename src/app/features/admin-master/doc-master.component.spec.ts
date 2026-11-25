import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import {
  DocMasterComponent,
  DOC_TYPE_OPTIONS,
  FORMAT_OPTIONS,
  SIZE_OPTIONS
} from './doc-master.component';

describe('DocMasterComponent', () => {
  it('initializes config with correct title, entityLabel, and full column structure', () => {
    const comp = new DocMasterComponent();
    expect(comp.config.title).toBe('Doc Master');
    expect(comp.config.entityLabel).toBe('Document');
    expect(comp.config.dataKey).toBe('DOC_MASTERS');
    expect(comp.config.hasStatus).toBe(true);
    expect(comp.config.hideViewAction).toBe(true);
    expect(comp.config.tagsColumns).toEqual(['schemes', 'allowedFormats']);

    const columnKeys = comp.config.columns.map((c) => c.key);
    expect(columnKeys).toEqual(['sNo', 'docName', 'docType', 'allowedFormats', 'maxSizeMb', 'schemes']);
  });

  it('configures form fields for document name, type, allowed formats, size limit, schemes, and guidelines', () => {
    const comp = new DocMasterComponent();
    expect(comp.config.fields.length).toBe(6);

    // 1. Document Name
    expect(comp.config.fields[0].key).toBe('docName');
    expect(comp.config.fields[0].type).toBe('text');
    expect(comp.config.fields[0].required).toBe(true);

    // 2. Document Type
    expect(comp.config.fields[1].key).toBe('docType');
    expect(comp.config.fields[1].type).toBe('select');
    expect(comp.config.fields[1].required).toBe(true);
    expect(comp.config.fields[1].options).toEqual(DOC_TYPE_OPTIONS);

    // 3. Allowed Formats
    expect(comp.config.fields[2].key).toBe('allowedFormats');
    expect(comp.config.fields[2].type).toBe('multiselect');
    expect(comp.config.fields[2].required).toBe(true);
    expect(comp.config.fields[2].options).toEqual(FORMAT_OPTIONS);

    // 4. Max File Size Limit
    expect(comp.config.fields[3].key).toBe('maxSizeMb');
    expect(comp.config.fields[3].type).toBe('select');
    expect(comp.config.fields[3].required).toBe(true);
    expect(comp.config.fields[3].options).toEqual(SIZE_OPTIONS);

    // 5. Applicable Schemes
    expect(comp.config.fields[4].key).toBe('schemes');
    expect(comp.config.fields[4].type).toBe('multiselect');
    expect(comp.config.fields[4].required).toBe(true);

    // 6. Description / Upload Guidelines
    expect(comp.config.fields[5].key).toBe('description');
    expect(comp.config.fields[5].type).toBe('textarea');
  });

  it('builds payload correctly from form data preserving all document configuration fields', () => {
    const comp = new DocMasterComponent();
    const payload = comp.config.buildPayload({
      docName: 'Company PAN Card',
      docType: 'Statutory & Legal',
      allowedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: '5 MB',
      schemes: ['Vishwakarma Yuva Udyami Protsahan Yojana', 'Mukhyamantri Yuva Sambal Yojana'],
      description: 'Clear scanned copy with stamp'
    });

    expect(payload.docName).toBe('Company PAN Card');
    expect(payload.docType).toBe('Statutory & Legal');
    expect(payload.allowedFormats).toEqual(['PDF', 'JPG', 'PNG']);
    expect(payload.maxSizeMb).toBe('5 MB');
    expect(payload.schemes).toEqual(['Vishwakarma Yuva Udyami Protsahan Yojana', 'Mukhyamantri Yuva Sambal Yojana']);
    expect(payload.description).toBe('Clear scanned copy with stamp');
    expect(payload.status).toBe('Active');
  });

  it('configures document type and scheme filters in the filter bar', () => {
    const comp = new DocMasterComponent();
    expect(comp.config.filters?.length).toBe(2);

    expect(comp.config.filters?.[0].key).toBe('docType');
    expect(comp.config.filters?.[0].label).toBe('Document Type');
    expect(comp.config.filters?.[0].placeholder).toBe('All Document Types');

    expect(comp.config.filters?.[1].key).toBe('schemes');
    expect(comp.config.filters?.[1].label).toBe('Scheme');
    expect(comp.config.filters?.[1].placeholder).toBe('All Schemes');
  });

  it('formats file sizes and badge classes correctly', () => {
    const comp = new DocMasterComponent();
    expect(comp.formatSize(5)).toBe('5 MB');
    expect(comp.formatSize('10 MB')).toBe('10 MB');
    expect(comp.formatSize(undefined)).toBe('5 MB');

    expect(comp.getFormatBadgeClass('PDF')).toContain('rose');
    expect(comp.getFormatBadgeClass('JPG')).toContain('amber');
    expect(comp.getFormatBadgeClass('DOCX')).toContain('blue');
    expect(comp.getFormatBadgeClass('XLSX')).toContain('emerald');
  });
});
