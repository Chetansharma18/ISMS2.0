import { describe, it, expect } from 'vitest';
import {
  ANNEXURE_ADAPTER,
  COURSE_ADAPTER,
  DESIGNATION_ADAPTER,
  DISTRICT_BLOCK_ADAPTER,
  DOC_ADAPTER,
  EOI_CATEGORY_ADAPTER,
  GRADING_ADAPTER,
  REMARK_ADAPTER,
  SCHEME_ADAPTER,
  SCHEME_CATEGORY_ADAPTER,
  SECTOR_ADAPTER,
  formatShortDate,
  withDistrictNames
} from './master-adapters';

describe('master adapters', () => {
  it('sector: reads and writes the backend shape', () => {
    expect(SECTOR_ADAPTER.fromApi({ id: 3, sectorName: 'Agriculture', sectorCode: 'AGR', isActive: false }, 0)).toEqual({
      sNo: 1, id: '3', sectorName: 'Agriculture', sectorCode: 'AGR', status: 'Inactive'
    });
    expect(SECTOR_ADAPTER.toApi({ sectorName: ' Agriculture ', sectorCode: 'AGR', status: 'Active', sNo: 1, id: '3' })).toEqual({
      sectorName: 'Agriculture', sectorCode: 'AGR', isActive: true
    });
    expect(SECTOR_ADAPTER.toApi({ status: 'Inactive' })).toEqual({ isActive: false });
  });

  it('designation, EOI category, scheme category and remark rename their fields', () => {
    expect(DESIGNATION_ADAPTER.fromApi({ id: 1, name: 'Joint Director', code: 'JD', department: 'Administration' }, 0)).toMatchObject({
      designationName: 'Joint Director', designationCode: 'JD', departmentWing: 'Administration', status: 'Active'
    });
    expect(DESIGNATION_ADAPTER.toApi({ designationName: 'JD', departmentWing: 'IT' })).toEqual({ designationName: 'JD', department: 'IT' });

    expect(EOI_CATEGORY_ADAPTER.fromApi({ id: 2, title: 'GENERAL', description: 'All' }, 1)).toMatchObject({ sNo: 2, categoryTitle: 'GENERAL', description: 'All' });
    expect(EOI_CATEGORY_ADAPTER.toApi({ categoryTitle: 'GENERAL' })).toEqual({ title: 'GENERAL' });

    expect(SCHEME_CATEGORY_ADAPTER.toApi({ categoryName: 'Rajvik', schemeName: 'Rajvik' })).toEqual({ categoryName: 'Rajvik' });
    expect(REMARK_ADAPTER.fromApi({ id: 4, category: 'Positive remark', title: 'x', description: 'Verified' }, 0)).toMatchObject({
      remarkType: 'Positive remark', description: 'Verified'
    });
  });

  it('scheme: EMD amount is the backend emdAmount', () => {
    expect(SCHEME_ADAPTER.fromApi({ id: 5, schemeName: 'MMKVY', schemeCategory: 'ALL', categoryName: 'GENERAL', emdAmount: 5000, processFees: 100, budget: 1e6 }, 0)).toMatchObject({
      schemeName: 'MMKVY', amount: 5000, processFees: 100, budget: 1e6
    });
    expect(SCHEME_ADAPTER.toApi({ amount: 5000, budget: 10 })).toEqual({ emdAmount: 5000, budget: 10 });
  });

  it('course: maps job role, durations and the validity date', () => {
    const row = COURSE_ADAPTER.fromApi(
      {
        id: 7,
        sectorName: 'Aerospace',
        qpJobRoleName: 'Cabin Crew',
        qpJobRoleCode: 'AAS/Q0101',
        version: '2.0',
        nsqfLevel: 4.5,
        commonNormsCategory: 'II',
        theoryDurationHours: 120,
        practicalOjtDuration: '150+60',
        itSoftSkillDurationHours: 30,
        totalQpHours: 360,
        validUpToDate: '2026-04-28T00:00:00',
        remark: 'New Version'
      },
      0
    );
    expect(row).toMatchObject({
      sector: 'Aerospace', jobRoleName: 'Cabin Crew', jobRoleCode: 'AAS/Q0101', nsqfLevel: '4.5',
      practicalOjtDurationHours: '150+60', itSoftSkillTrainingHours: 30, courseValidUpToDate: '28-Apr-26', status: 'Active'
    });
    expect(COURSE_ADAPTER.fromApi({ id: 8, sector: { sectorName: 'Retail' } }, 0).sector).toBe('Retail');

    expect(
      COURSE_ADAPTER.toApi({ sector: 'Aerospace', jobRoleName: 'Cabin Crew', nsqfLevel: '4', theoryDurationHours: 'NA', courseValidUpToDate: '-' })
    ).toEqual({ sectorName: 'Aerospace', qpJobRoleName: 'Cabin Crew', nsqfLevel: 4, theoryDurationHours: null });
    expect(COURSE_ADAPTER.toApi({ courseValidUpToDate: '28-Apr-25' })).toEqual({ validUpToDateStr: '28-Apr-25' });
  });

  it('district & block: fills district names from the district list', () => {
    const rows = [DISTRICT_BLOCK_ADAPTER.fromApi({ id: 11, districtId: 2, name: 'Amber', code: 'JPR-AMB', isActive: true }, 0)];
    expect(rows[0]).toMatchObject({ blockName: 'Amber', blockCode: 'JPR-AMB', districtName: '' });
    expect(withDistrictNames(rows, [{ id: 2, name: 'Jaipur', code: 'JPR' }])[0]).toMatchObject({ districtName: 'Jaipur', districtCode: 'JPR' });
    expect(DISTRICT_BLOCK_ADAPTER.toApi({ districtName: 'Jaipur', blockName: 'Amber', districtId: 2 } as never)).toEqual({ districtName: 'Jaipur', blockName: 'Amber' });
  });

  it('grading and doc: "ALL Schemes" is no scheme on the backend', () => {
    expect(GRADING_ADAPTER.fromApi({ id: 1, grade: 'A', minScore: 80, maxScore: 100, schemeName: null }, 0)).toMatchObject({
      schemeName: 'ALL Schemes', minimum: 80, maximum: 100, range: '80 - 100'
    });
    expect(GRADING_ADAPTER.toApi({ schemeName: 'ALL Schemes', grade: 'A', minimum: 80, maximum: 100, range: '80 - 100' })).toEqual({
      schemeName: '', grade: 'A', minimum: 80, maximum: 100
    });

  });

  it('doc master: one document, many applicable schemes', () => {
    const row = DOC_ADAPTER.fromApi(
      {
        id: 3,
        code: 'DOC-PAN',
        documentName: 'Company PAN Card',
        applicableSchemes: [{ id: 5, schemeName: 'MMKVY' }, { id: 6, schemeName: 'PMKVY' }],
        schemeCount: 2,
        category: 'Statutory',
        allowedExtensions: '.pdf',
        maxFileSizeMb: 5,
        isMandatory: true,
        isActive: false
      },
      0
    );
    expect(row).toMatchObject({
      id: '3', docName: 'Company PAN Card', documents: 'Company PAN Card', schemes: ['MMKVY', 'PMKVY'], schemeIds: [5, 6],
      schemeName: 'MMKVY, PMKVY', schemeCount: 2, category: 'Statutory', isMandatory: true, mandatory: 'Yes', status: 'Inactive'
    });

    // Schemes go out as names; the form's Yes / No sets isMandatory; screen-only keys stay out.
    expect(
      DOC_ADAPTER.toApi({ ...row, schemes: ['MMKVY', 'ALL', 'Rajvik'], mandatory: 'No', status: 'Active' })
    ).toEqual({
      documentName: 'Company PAN Card',
      category: 'Statutory',
      allowedExtensions: '.pdf',
      maxFileSizeMb: 5,
      isMandatory: false,
      description: '',
      isActive: true,
      schemeNames: ['MMKVY', 'Rajvik']
    });
    // The status switch sends only the status.
    expect(DOC_ADAPTER.toApi({ status: 'Inactive' })).toEqual({ isActive: false });
  });

  it('annexure master: same shape with annexureName', () => {
    const row = ANNEXURE_ADAPTER.fromApi({ id: 9, annexureName: 'Annexure-1: Covering Letter', applicableSchemes: [{ id: 5, schemeName: 'MMKVY' }] }, 1);
    expect(row).toMatchObject({ sNo: 2, id: '9', annexureName: 'Annexure-1: Covering Letter', schemes: ['MMKVY'], status: 'Active' });
    expect(ANNEXURE_ADAPTER.toApi({ annexureName: ' Annexure-2 ', schemes: ['MMKVY'] })).toEqual({
      annexureName: 'Annexure-2',
      schemeNames: ['MMKVY']
    });
  });

  it('formats backend dates the way the course list shows them', () => {
    expect(formatShortDate('2025-04-28T00:00:00')).toBe('28-Apr-25');
    expect(formatShortDate(null)).toBe('-');
    expect(formatShortDate('31-Dec-26')).toBe('31-Dec-26');
  });
});
