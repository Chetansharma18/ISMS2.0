import { describe, it, expect } from 'vitest';
import type { ApplicantResponse } from '../../services/eoi-state.service';
import {
  AVAILABLE_DISTRICTS,
  AVAILABLE_SECTORS,
  buildRowsFromApproved,
  buildSubjectForScheme,
  createDefaultCopyTo,
  createDefaultTerms,
  createFallbackTableRows,
  createNewTableRow,
  gradeToLetter,
  syncRowsWithApproved
} from './eoi-sanction-editor.util';

function approved(overrides: Partial<ApplicantResponse>): ApplicantResponse {
  return {
    id: 'APP-1',
    anonymousLabel: 'Company 1',
    actualLegalName: 'Apex Pvt Ltd',
    trainingCentres: [],
    placementTrackRecord: [],
    ...overrides
  } as unknown as ApplicantResponse;
}

describe('eoi-sanction-editor.util', () => {
  it('gradeToLetter maps Grade A / B and defaults to A', () => {
    expect(gradeToLetter('Grade A')).toBe('A');
    expect(gradeToLetter('Grade B')).toBe('B');
    expect(gradeToLetter('Grade C')).toBe('A');
    expect(gradeToLetter(undefined)).toBe('A');
  });

  it('buildRowsFromApproved uses the company label, centre district and track-record sector', () => {
    const rows = buildRowsFromApproved([
      approved({
        trainingCentres: [{ district: 'Kota' }] as unknown as ApplicantResponse['trainingCentres'],
        placementTrackRecord: [{ sector: 'Textile' }] as unknown as ApplicantResponse['placementTrackRecord'],
        scrutinyDetails: { grade: 'Grade B', scrutinyOfficer: 'X', decisionTimestamp: 'now' }
      })
    ]);
    expect(rows).toEqual([
      {
        id: 'APP-1',
        appId: 'APP-1',
        agencyName: 'Company 1',
        district: 'Kota',
        sector: 'Textile',
        category: 'A-1 (Skill)',
        grade: 'B',
        target: 150
      }
    ]);
  });

  it('buildRowsFromApproved falls back to cycling districts / sectors and the anonymous label', () => {
    const rows = buildRowsFromApproved([
      approved({ id: 'A', actualLegalName: '' }),
      approved({ id: 'B', actualLegalName: '' })
    ]);
    expect(rows[0].agencyName).toBe('Company 1');
    expect(rows[0].district).toBe(AVAILABLE_DISTRICTS[0]);
    expect(rows[1].district).toBe(AVAILABLE_DISTRICTS[1]);
    expect(rows[1].sector).toBe(AVAILABLE_SECTORS[1]);
    expect(rows[0].grade).toBe('A');
  });

  it('syncRowsWithApproved follows the approved companies and keeps earlier edits', () => {
    const c1 = approved({ id: 'APP-2024-001', anonymousLabel: 'Company 1', regNumber: 'R1' } as Partial<ApplicantResponse>);
    const c2 = approved({ id: 'APP-2024-002', anonymousLabel: 'Company 2', regNumber: 'R2' } as Partial<ApplicantResponse>);
    const saved = [
      // Stale row of a company that is not approved, with a real name
      { id: 'x', appId: 'APP-2024-002', agencyName: 'Marwar Skill Foundation', district: 'Kota', sector: 'S', category: 'C', grade: 'A', target: 90 },
      // Edited row of an approved company
      { id: 'y', appId: 'APP-2024-001', agencyName: 'Apex Technical', district: 'Sikar', sector: 'Retail', category: 'A-2', grade: 'A', target: 200 },
      // Row added by hand
      { id: 'z', appId: 'APP-004750', agencyName: 'Agency 5', district: 'Jaipur', sector: 'S', category: 'C', grade: 'A', target: 150 }
    ];

    const rows = syncRowsWithApproved(saved, [c1], [c1, c2]);

    expect(rows.map(r => r.agencyName)).toEqual(['Company 1', 'Agency 5']);
    expect(rows[0].district).toBe('Sikar');
    expect(rows[0].target).toBe(200);
  });

  it('createNewTableRow numbers the row after the existing ones', () => {
    const row = createNewTableRow(4);
    expect(row.id).toBe('5');
    expect(row.appId).toBe('APP-004754');
    expect(row.agencyName).toBe('Agency 5');
    expect(row.district).toBe('Jaipur');
    expect(row.target).toBe(150);
  });

  it('createFallbackTableRows returns four fresh rows', () => {
    const a = createFallbackTableRows();
    const b = createFallbackTableRows();
    expect(a.length).toBe(4);
    expect(a).not.toBe(b);
    expect(a[0]).toEqual(b[0]);
  });

  it('buildSubjectForScheme quotes the scheme title', () => {
    expect(buildSubjectForScheme('MMKVY')).toBe(
      'Sanction order for allocation of physical targets for Financial Year 2026-27 to PIAs under "MMKVY".'
    );
  });

  it('default terms and copy-to lists are fresh arrays', () => {
    expect(createDefaultTerms().length).toBe(11);
    expect(createDefaultTerms()).not.toBe(createDefaultTerms());
    expect(createDefaultCopyTo().length).toBe(9);
    expect(createDefaultCopyTo()[0]).toBe("PS to Hon'ble Minister, DSEE, GoR");
  });
});
