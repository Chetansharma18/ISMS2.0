import { describe, it, expect, beforeAll } from 'vitest';
import {
  formatGradeWithRange,
  generateEvaluationExcel,
  parseEvaluationSpreadsheet,
  GRADE_DROPDOWN_PROMPT,
  DEFAULT_GRADE_RANGES,
  EvaluationExcelOptions
} from './eoi-evaluation-excel.util';

beforeAll(async () => {
  if (typeof DOMParser === 'undefined') {
    try {
      const moduleName = 'jsdom';
      const { JSDOM } = await import(moduleName);
      (globalThis as any).DOMParser = new JSDOM().window.DOMParser;
    } catch {
      // In browser test environments (e.g. Karma / Chrome), DOMParser is natively available.
    }
  }
});

describe('eoi-evaluation-excel.util', () => {
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
    it('creates an OpenXML Excel workbook blob containing prompt option and aligned grades', async () => {
      const options: EvaluationExcelOptions = {
        fileName: 'test_evaluation.xlsx',
        schemeTitle: 'Test Scheme',
        eoiRefNo: 'EOI-TEST-01',
        rows: [
          { sNo: 1, refNo: 'APP-001', companyName: 'Agency 1' },
          { sNo: 2, refNo: 'APP-002', companyName: 'Agency 2', grade: 'B' }
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

      const sheet1Xml = await zip.file('xl/worksheets/sheet1.xml')?.async('text');
      expect(sheet1Xml).toBeDefined();

      // Check Column E width
      expect(sheet1Xml).toContain('<col min="5" max="5" width="26" customWidth="1"/>');

      // Check in-cell placeholder for unassigned row 1
      expect(sheet1Xml).toContain(GRADE_DROPDOWN_PROMPT);

      // Check data validation formula points to ValidationData
      expect(sheet1Xml).toContain('<formula1>ValidationData!$B$1:$B$4</formula1>');

      // Check ValidationData sheet contains prompt and formatted grades
      const sheet2Xml = await zip.file('xl/worksheets/sheet2.xml')?.async('text');
      expect(sheet2Xml).toBeDefined();
      expect(sheet2Xml).toContain(GRADE_DROPDOWN_PROMPT);
      expect(sheet2Xml).toContain('A+');
      expect(sheet2Xml).toContain('85 - 100');
    });
  });

  describe('parseEvaluationSpreadsheet', () => {
    it('parses formatted grade strings back to clean grade letters and ignores prompt option', async () => {
      const options: EvaluationExcelOptions = {
        fileName: 'test_roundtrip.xlsx',
        schemeTitle: 'Test Scheme',
        eoiRefNo: 'EOI-TEST-02',
        rows: [
          { sNo: 1, refNo: 'APP-101', companyName: 'Agency One', status: 'Approved', grade: 'A+' },
          { sNo: 2, refNo: 'APP-102', companyName: 'Agency Two', status: 'Approved', grade: '' }
        ],
        gradeOptions: [
          { grade: 'A+', range: '85 - 100' },
          { grade: 'A', range: '70 - 84' }
        ]
      };

      const blob = await generateEvaluationExcel(options);
      const file = new File([blob], 'test_roundtrip.xlsx', { type: blob.type });

      const parsed = await parseEvaluationSpreadsheet(file);
      expect(parsed.all.length).toBe(2);

      // Row 1 should have clean grade 'A+' extracted from the formatted string
      expect(parsed.all[0].refNo).toBe('APP-101');
      expect(parsed.all[0].grade).toBe('A+');
      expect(parsed.all[0].isApproved).toBe(true);

      // Row 2 should have fallback grade since it had the prompt option (not selected)
      expect(parsed.all[1].refNo).toBe('APP-102');
      expect(parsed.all[1].grade).toBe('A');
    });
  });
});
