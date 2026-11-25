import { describe, it, expect, beforeAll } from 'vitest';
import {
  formatGradeWithRange,
  generateEvaluationExcel,
  parseEvaluationSpreadsheet,
  DEFAULT_GRADE_RANGES,
  EvaluationExcelOptions,
  getColumnDisplayHeader,
  getExcelColumnLetter,
  matchHeaderToField,
  EVALUATION_EXCEL_COLUMNS
} from './eoi-evaluation-excel.util';

beforeAll(async () => {
  if (typeof DOMParser === 'undefined') {
    try {
      const moduleName = 'jsdom';
      const { JSDOM } = await import(moduleName);
      (globalThis as any).DOMParser = new JSDOM().window.DOMParser;
    } catch {
      // In browser test environments, DOMParser is natively available.
    }
  }
});

describe('eoi-evaluation-excel.util', () => {
  describe('getColumnDisplayHeader', () => {
    it('appends ▼ to dropdown field labels automatically', () => {
      expect(getColumnDisplayHeader({ key: 'status', label: 'Status', type: 'dropdown' })).toBe('Status ▼');
      expect(getColumnDisplayHeader({ key: 'grade', label: 'Grading', type: 'dropdown' })).toBe('Grading ▼');
      expect(getColumnDisplayHeader({ key: 'category', label: 'Category', type: 'dropdown' })).toBe('Category ▼');
    });

    it('does not duplicate ▼ if already present', () => {
      expect(getColumnDisplayHeader({ key: 'status', label: 'Status ▼', type: 'dropdown' })).toBe('Status ▼');
    });

    it('does not append ▼ to non-dropdown columns', () => {
      expect(getColumnDisplayHeader({ key: 'sNo', label: 'S. No.', type: 'number' })).toBe('S. No.');
      expect(getColumnDisplayHeader({ key: 'refNo', label: 'Ref No / Application ID', type: 'text' })).toBe('Ref No / Application ID');
      expect(getColumnDisplayHeader({ key: 'reason', label: 'Reason / Remarks', type: 'text' })).toBe('Reason / Remarks');
    });
  });

  describe('getExcelColumnLetter', () => {
    it('converts indices to corresponding Excel column letters', () => {
      expect(getExcelColumnLetter(0)).toBe('A');
      expect(getExcelColumnLetter(1)).toBe('B');
      expect(getExcelColumnLetter(2)).toBe('C');
      expect(getExcelColumnLetter(3)).toBe('D');
      expect(getExcelColumnLetter(4)).toBe('E');
      expect(getExcelColumnLetter(5)).toBe('F');
      expect(getExcelColumnLetter(25)).toBe('Z');
      expect(getExcelColumnLetter(26)).toBe('AA');
    });
  });

  describe('matchHeaderToField', () => {
    it('matches headers regardless of case, punctuation, or ▼ symbols', () => {
      expect(matchHeaderToField('Status ▼')).toBe('status');
      expect(matchHeaderToField('status')).toBe('status');
      expect(matchHeaderToField('Status (Approved / Reject)')).toBe('status');

      expect(matchHeaderToField('Grading ▼')).toBe('grade');
      expect(matchHeaderToField('Grading')).toBe('grade');
      expect(matchHeaderToField('Grade')).toBe('grade');

      expect(matchHeaderToField('Reason / Remarks')).toBe('reason');
      expect(matchHeaderToField('Reason')).toBe('reason');
      expect(matchHeaderToField('Remarks')).toBe('reason');

      expect(matchHeaderToField('Ref No / Application ID')).toBe('refNo');
      expect(matchHeaderToField('Application ID')).toBe('refNo');

      expect(matchHeaderToField('Company / Agency Name')).toBe('companyName');
      expect(matchHeaderToField('Applicant Agency')).toBe('companyName');

      expect(matchHeaderToField('S. No.')).toBe('sNo');
      expect(matchHeaderToField('SNo')).toBe('sNo');
    });
  });

  describe('formatGradeWithRange', () => {
    it('formats grade and range with grade left-aligned and range right-aligned', () => {
      const formatted = formatGradeWithRange('A+', '85 - 100', 24);
      expect(formatted.startsWith('A+')).toBe(true);
      expect(formatted.endsWith('85 - 100')).toBe(true);
      expect(formatted.length).toBe(24);
    });

    it('uses DEFAULT_GRADE_RANGES when range is not provided', () => {
      const formattedA = formatGradeWithRange('A');
      expect(formattedA.startsWith('A')).toBe(true);
      expect(formattedA.endsWith(DEFAULT_GRADE_RANGES['A'])).toBe(true);

      const formattedD = formatGradeWithRange('D');
      expect(formattedD.startsWith('D')).toBe(true);
      expect(formattedD.endsWith(DEFAULT_GRADE_RANGES['D'])).toBe(true);
    });
  });

  describe('generateEvaluationExcel', () => {
    it('creates an OpenXML Excel workbook with standard styling, dynamic ranges, and dropdown indicators', async () => {
      const options: EvaluationExcelOptions = {
        fileName: 'test_evaluation.xlsx',
        schemeTitle: 'Test Scheme',
        eoiRefNo: 'EOI-TEST-01',
        rows: [
          { sNo: 1, refNo: 'APP-001', companyName: 'Agency 1', status: 'Approved', grade: 'A+' },
          { sNo: 2, refNo: 'APP-002', companyName: 'Agency 2' } // unevaluated row
        ],
        gradeOptions: [
          { grade: 'A+', range: '85 - 100' },
          { grade: 'A', range: '70 - 84' },
          { grade: 'B', range: '55 - 69' }
        ]
      };

      const blob = await generateEvaluationExcel(options);
      expect(blob).toBeTruthy();
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Verify workbook contents via JSZip
      const { default: JSZipModule } = await import('jszip');
      const zip = await JSZipModule.loadAsync(blob);

      // Check styles.xml for Calibri font, Maroon header (#800D46), and Light Yellow dropdown fill (#FFF9E8)
      const stylesXml = await zip.file('xl/styles.xml')?.async('text');
      expect(stylesXml).toBeDefined();
      expect(stylesXml).toContain('Calibri');
      expect(stylesXml).toContain('FF800D46'); // Maroon header fill
      expect(stylesXml).toContain('FFFFF9E8'); // Light yellow dropdown cell fill
      expect(stylesXml).toContain('FFCBD5E1'); // Light grey border

      // Check sheet1.xml
      const sheet1Xml = await zip.file('xl/worksheets/sheet1.xml')?.async('text');
      expect(sheet1Xml).toBeDefined();

      // Check header row height 30 and dropdown symbol in headers
      expect(sheet1Xml).toContain('<row r="1" ht="30" customHeight="1">');
      expect(sheet1Xml).toContain('Status ▼');
      expect(sheet1Xml).toContain('Grading ▼');

      // Check data row height 22
      expect(sheet1Xml).toContain('<row r="2" ht="22" customHeight="1">');
      expect(sheet1Xml).toContain('<row r="3" ht="22" customHeight="1">');

      // Check frozen pane on row 1
      expect(sheet1Xml).toContain('state="frozen"');

      // Check dynamic validation range calculated for 2 rows (D2:D3, E2:E3)
      expect(sheet1Xml).toContain('sqref="D2:D3"');
      expect(sheet1Xml).toContain('sqref="E2:E3"');

      // Check stop-style validation and allowBlank
      expect(sheet1Xml).toContain('errorStyle="stop"');
      expect(sheet1Xml).toContain('allowBlank="1"');

      // Check ValidationData sheet contains formatted grades
      const sheet2Xml = await zip.file('xl/worksheets/sheet2.xml')?.async('text');
      expect(sheet2Xml).toBeDefined();
      expect(sheet2Xml).toContain('A+');
      expect(sheet2Xml).toContain('85 - 100');
    });
  });

  describe('parseEvaluationSpreadsheet', () => {
    it('parses formatted grade strings back to clean grade letters', async () => {
      const options: EvaluationExcelOptions = {
        fileName: 'test_roundtrip.xlsx',
        schemeTitle: 'Test Scheme',
        eoiRefNo: 'EOI-TEST-02',
        rows: [
          { sNo: 1, refNo: 'APP-101', companyName: 'Agency One', status: 'Approved', grade: 'A+' },
          { sNo: 2, refNo: 'APP-102', companyName: 'Agency Two', status: 'Approved', grade: 'A' }
        ],
        gradeOptions: [
          { grade: 'A+', range: '85 - 100' },
          { grade: 'A', range: '70 - 84' }
        ]
      };

      const blob = await generateEvaluationExcel(options);
      const file = new File([blob], 'test_roundtrip.xlsx', { type: blob.type });

      const parsed = await parseEvaluationSpreadsheet(file);
      expect(parsed.isValid).toBe(true);
      expect(parsed.all.length).toBe(2);

      // Row 1 should have clean grade 'A+' extracted from the formatted string
      expect(parsed.all[0].refNo).toBe('APP-101');
      expect(parsed.all[0].grade).toBe('A+');
      expect(parsed.all[0].isApproved).toBe(true);

      // Row 2 should have grade 'A'
      expect(parsed.all[1].refNo).toBe('APP-102');
      expect(parsed.all[1].grade).toBe('A');
      expect(parsed.all[1].isApproved).toBe(true);
    });

    it('validates that Reason / Remarks is mandatory when status is Reject', async () => {
      const options: EvaluationExcelOptions = {
        fileName: 'test_reject_validation.xlsx',
        schemeTitle: 'Test Scheme',
        eoiRefNo: 'EOI-TEST-03',
        rows: [
          { sNo: 1, refNo: 'APP-201', companyName: 'Agency Alpha', status: 'Reject', reason: '' }, // Missing reason!
          { sNo: 2, refNo: 'APP-202', companyName: 'Agency Beta', status: 'Reject', reason: 'Insufficient experience certificates' }
        ],
        gradeOptions: [{ grade: 'A' }]
      };

      const blob = await generateEvaluationExcel(options);
      const file = new File([blob], 'test_reject_validation.xlsx', { type: blob.type });

      const parsed = await parseEvaluationSpreadsheet(file);
      expect(parsed.isValid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
      expect(parsed.errors.some(e => e.includes('Row 2') && e.includes('APP-201') && e.includes('mandatory'))).toBe(true);
    });
  });
});
