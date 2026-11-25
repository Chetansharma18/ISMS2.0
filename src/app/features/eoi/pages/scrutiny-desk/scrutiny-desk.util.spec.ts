import { describe, it, expect } from 'vitest';
import {
  GRADE_OPTIONS,
  buildDocFileName,
  buildRefCode,
  buildZipEntryName,
  buildZipFolderName,
  clampScore,
  gradeFromScore,
  isAcceptFormValid,
  isRejectFormValid,
  toActivePreviewDocument
} from './scrutiny-desk.util';

describe('scrutiny-desk.util', () => {
  it('gradeFromScore applies the grade thresholds', () => {
    expect(gradeFromScore(100)).toBe('Grade A');
    expect(gradeFromScore(85)).toBe('Grade A');
    expect(gradeFromScore(84)).toBe('Grade B');
    expect(gradeFromScore(70)).toBe('Grade B');
    expect(gradeFromScore(69)).toBe('Grade C');
    expect(gradeFromScore(55)).toBe('Grade C');
    expect(gradeFromScore(54)).toBe('Grade D');
    expect(gradeFromScore(40)).toBe('Grade D');
    expect(gradeFromScore(39)).toBe('Grade E');
    expect(gradeFromScore(0)).toBe('Grade E');
  });

  it('clampScore keeps scores within 0 - 100', () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(50)).toBe(50);
    expect(clampScore(140)).toBe(100);
  });

  it('GRADE_OPTIONS lists grades A to E', () => {
    expect(GRADE_OPTIONS.map(g => g.value)).toEqual(['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E']);
  });

  it('isAcceptFormValid requires an in-range score and a grade', () => {
    expect(isAcceptFormValid(88, 'Grade A')).toBe(true);
    expect(isAcceptFormValid(0, 'Grade E')).toBe(true);
    expect(isAcceptFormValid(100, 'Grade A')).toBe(true);
    expect(isAcceptFormValid(null, 'Grade A')).toBe(false);
    expect(isAcceptFormValid(undefined, 'Grade A')).toBe(false);
    expect(isAcceptFormValid(101, 'Grade A')).toBe(false);
    expect(isAcceptFormValid(-1, 'Grade A')).toBe(false);
    expect(isAcceptFormValid(80, '')).toBe(false);
  });

  it('isRejectFormValid requires more than 3 trimmed characters', () => {
    expect(isRejectFormValid('')).toBe(false);
    expect(isRejectFormValid('   abc   ')).toBe(false);
    expect(isRejectFormValid('abcd')).toBe(true);
    expect(isRejectFormValid('  abcd  ')).toBe(true);
  });

  it('buildRefCode upper-cases the document id and falls back to APP', () => {
    expect(buildRefCode('APP-2024-001', 'doc-pan')).toBe('RSLDC-APP-2024-001-DOC-PAN-2026');
    expect(buildRefCode(undefined, 'd1')).toBe('RSLDC-APP-D1-2026');
    expect(buildRefCode('', 'd1')).toBe('RSLDC-APP-D1-2026');
  });

  it('buildDocFileName replaces non alphanumeric characters', () => {
    expect(buildDocFileName('PAN Card (Company)')).toBe('PAN_Card__Company_.pdf');
  });

  it('toActivePreviewDocument builds the viewer model', () => {
    const result = toActivePreviewDocument(
      { id: 'd1', title: 'GST Certificate', fileSize: '1.2 MB', category: 'Statutory', verified: true },
      'APP-1'
    );
    expect(result).toEqual({
      id: 'd1',
      title: 'GST Certificate',
      fileName: 'GST_Certificate.pdf',
      fileSize: '1.2 MB',
      category: 'Statutory',
      refCode: 'RSLDC-APP-1-D1-2026'
    });
  });

  it('buildZipFolderName and buildZipEntryName build archive names', () => {
    expect(buildZipFolderName('Company 1', 'APP-1')).toBe('Company_1_APP-1_Documents');
    expect(buildZipFolderName(undefined, 'APP-1')).toBe('Applicant_APP-1_Documents');
    expect(buildZipEntryName(0, 'GST Certificate')).toBe('1_GST_Certificate.pdf');
    expect(buildZipEntryName(4, 'A-B')).toBe('5_A_B.pdf');
  });
});
