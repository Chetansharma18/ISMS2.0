import { describe, it, expect } from 'vitest';
import type { BatchRecord } from '../models/batch.model';
import type { SdcRecord } from '../models/sdc.model';
import { buildTpUsers, filterTpUsers } from './tp-users.util';

const sdc = {
  id: 'sdc-1',
  sdcCode: 'SDC-0001',
  sdcName: 'Jaipur Skill Center',
  district: 'Jaipur',
  centerHead: { ssoId: 'CENTERHEAD1', name: 'Center Head 1', mobile: '9876500001', email: 'ch1@example.com', designation: 'Center Manager', assignedAt: '2026-09-10T10:00:00.000Z' }
} as unknown as SdcRecord;

const batch = (id: string, code: string, faculty: object[], extra: object = {}): BatchRecord =>
  ({ id, batchCode: code, courseName: 'Course', sdcName: 'Jaipur Skill Center', createdAt: '2026-09-01T10:00:00.000Z', faculty, ...extra }) as unknown as BatchRecord;

const lookup = (id: string) =>
  id.toLowerCase() === 'faculty1'
    ? { ssoId: 'FACULTY1', name: 'Faculty 1', mobile: '9876500011', email: 'f1@example.com', designation: 'Trainer', department: 'Skill Development' }
    : undefined;

describe('tp users', () => {
  it('lists the center head, the attender user and the faculty', () => {
    const batches = [
      batch('b1', 'B-1', [{ ssoId: 'FACULTY1', facultyName: 'Faculty 1', trainerType: 'Primary Trainer', qualification: 'PhD' }], {
        attender: { ssoId: 'ATTENDER1', name: 'Attender 1', mobile: '1', email: 'a@example.com', designation: 'Officer', assignedAt: '2026-09-20T10:00:00.000Z' }
      })
    ];
    const rows = buildTpUsers([sdc], batches, lookup);
    expect(rows.map(r => r.role).sort()).toEqual(['Attender User', 'Center Head', 'Faculty']);
    expect(rows.find(r => r.role === 'Center Head')?.assignedTo).toBe('Jaipur Skill Center (SDC-0001)');
    expect(rows.find(r => r.role === 'Attender User')?.assignedTo).toBe('Batch B-1');
    const faculty = rows.find(r => r.role === 'Faculty');
    expect(faculty?.mobile).toBe('9876500011');
    expect(faculty?.extra).toBe('Primary Trainer • PhD');
  });

  it('gives a faculty member one row for all their batches and skips faculty without an SSO ID', () => {
    const batches = [
      batch('b1', 'B-1', [{ ssoId: 'FACULTY1', facultyName: 'Faculty 1' }, { facultyName: 'No SSO' }]),
      batch('b2', 'B-2', [{ ssoId: 'faculty1', facultyName: 'Faculty 1' }])
    ];
    const faculty = buildTpUsers([], batches, lookup);
    expect(faculty).toHaveLength(1);
    expect(faculty[0].assignedTo).toBe('2 batches');
    expect(faculty[0].assignedDetail).toBe('B-1, B-2');
  });

  it('filters by role and by search text', () => {
    const rows = buildTpUsers([sdc], [batch('b1', 'B-1', [{ ssoId: 'FACULTY1', facultyName: 'Faculty 1' }])], lookup);
    expect(filterTpUsers(rows, 'Faculty', '')).toHaveLength(1);
    expect(filterTpUsers(rows, 'All', 'centerhead1')).toHaveLength(1);
    expect(filterTpUsers(rows, 'All', 'nothing like this')).toHaveLength(0);
  });
});
