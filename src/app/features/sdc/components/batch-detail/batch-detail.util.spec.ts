import { describe, it, expect } from 'vitest';
import {
  DEFAULT_FACULTY,
  DEFAULT_HOSTELS,
  buildBatchEditModel,
  buildBatchUpdates,
  createFacultyRow,
  createHostelRow,
  formatBatchStatus,
  getBatchFacultyList,
  getBatchHostelList,
  isBatchApproved,
  isBatchRejected
} from './batch-detail.util';
import { BatchRecord } from '../../models/batch.model';

const batch = (overrides: Record<string, unknown> = {}): BatchRecord =>
  ({ id: 'b1', batchCode: 'B-001', ...overrides }) as unknown as BatchRecord;

describe('batch-detail.util', () => {
  describe('status helpers', () => {
    it('is approved only when the department approved it, however many aspirants are registered', () => {
      expect(isBatchApproved(batch({ approvalStatus: 'APPROVED', status: 'APPROVED' }))).toBe(true);
      expect(isBatchApproved(batch({ mappedAspirantsCount: 30, maxStrength: 30 }))).toBe(false);
    });

    it('detects rejection via status or approvalStatus and never approves rejected batches', () => {
      expect(isBatchRejected(batch({ status: 'REJECTED' }))).toBe(true);
      expect(isBatchRejected(batch({ approvalStatus: 'REJECTED' }))).toBe(true);
      expect(isBatchRejected(batch({ status: 'ONGOING' }))).toBe(false);
      expect(isBatchApproved(batch({ approvalStatus: 'REJECTED', status: 'REJECTED' }))).toBe(false);
    });

    it('formats status as RETURNED, PENDING, APPROVED or REJECTED', () => {
      expect(formatBatchStatus(batch({ status: 'REJECTED' }))).toBe('REJECTED');
      expect(formatBatchStatus(batch({ status: 'APPROVED', approvalStatus: 'APPROVED' }))).toBe('APPROVED');
      expect(formatBatchStatus(batch({ status: 'PENDING_APPROVAL', approvalStatus: 'PENDING' }))).toBe('PENDING');
      expect(formatBatchStatus(batch({ status: 'RETURNED_TO_TP' }))).toBe('RETURNED');
    });
  });

  describe('faculty / hostel lists', () => {
    it('returns the batch faculty when present, otherwise the default row', () => {
      const faculty = [{ facultyName: 'A' }];
      expect(getBatchFacultyList(batch({ faculty }))).toBe(faculty);
      expect(getBatchFacultyList(batch({ faculty: [] }))).toBe(DEFAULT_FACULTY);
    });

    it('returns hostels, then the single hostel, then the default row', () => {
      const hostels = [{ hostelCode: 'H1' }];
      expect(getBatchHostelList(batch({ hostels }))).toBe(hostels);
      const single = { hostelCode: 'H2' };
      expect(getBatchHostelList(batch({ hostel: single }))).toEqual([single]);
      expect(getBatchHostelList(batch())).toBe(DEFAULT_HOSTELS);
    });

    it('creates blank rows with the expected defaults', () => {
      const f = createFacultyRow();
      expect(f.facultyName).toBe('');
      expect(f.trainerType).toBe('Primary Trainer');
      expect(f.id.startsWith('fac-')).toBe(true);
      const h = createHostelRow();
      expect(h.type).toBe('Boys');
      expect(h.capacity).toBe(0);
      expect(h.id.startsWith('hostel-')).toBe(true);
    });
  });

  describe('edit model round trip', () => {
    it('builds an edit model with fallbacks', () => {
      const model = buildBatchEditModel(batch(), 'Aerospace and Aviation', [{ courseName: 'First Course' }]);
      expect(model.id).toBe('b1');
      expect(model.courseName).toBe('First Course');
      expect(model.batchDurationHours).toBe(400);
      expect(model.startDate).toBe('2026-10-01');
      expect(model.startTime).toBe('09:00 AM');
      expect(model.approvedBatchStrength).toBe(30);
      expect(model.faculty.length).toBe(1);
      expect(model.faculty[0].facultyName).toBe('Vikas Purohit');
      expect(model.hostels[0].hostelCode).toBe('HST-JP-001');
    });

    it('maps legacy field names into the edit model', () => {
      const model = buildBatchEditModel(
        batch({
          course: 'Legacy Course',
          totalHours: 120,
          batchStartDate: '2027-01-01',
          faculty: [{ id: 'x', name: 'Legacy Name', type: 'Master Trainer' }],
          hostels: [{ address: 'Addr', code: 'C1', hostelType: 'Girls', capacity: 12 }]
        }),
        'Sector',
        []
      );
      expect(model.courseName).toBe('Legacy Course');
      expect(model.batchDurationHours).toBe(120);
      expect(model.startDate).toBe('2027-01-01');
      expect(model.faculty[0]).toEqual({
        id: 'x',
        facultyName: 'Legacy Name',
        trainerType: 'Master Trainer',
        qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
      });
      expect(model.hostels[0]).toEqual({
        id: 'hostel-0',
        hostelAddress: 'Addr',
        hostelCode: 'C1',
        type: 'Girls',
        capacity: 12
      });
    });

    it('maps the edit model back to record updates with numeric coercion', () => {
      const updates = buildBatchUpdates({
        sector: 'S',
        courseName: 'C',
        batchDurationHours: '200',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        approvedBatchStrength: '35',
        remarks: 'ok',
        faculty: [{ id: 'f1', facultyName: 'N', trainerType: 'Domain Trainer', qualification: 'PhD' }],
        hostels: [{ id: 'h1', hostelAddress: 'A', hostelCode: 'HC', type: 'Co-ed', capacity: '15' }]
      });
      expect(updates.batchDurationHours).toBe(200);
      expect(updates.totalHours).toBe(200);
      expect(updates.approvedBatchStrength).toBe(35);
      expect(updates.maxStrength).toBe(35);
      expect(updates.course).toBe('C');
      expect(updates.batchStartDate).toBe('2026-01-01');
      expect((updates.faculty as any[])[0]).toEqual({
        id: 'f1',
        name: 'N',
        facultyName: 'N',
        type: 'Domain Trainer',
        trainerType: 'Domain Trainer',
        qualification: 'PhD'
      });
      expect((updates.hostels as any[])[0].capacity).toBe(15);
      expect((updates.hostels as any[])[0].hostelType).toBe('Co-ed');
    });

    it('falls back to defaults for non-numeric duration and strength', () => {
      const updates = buildBatchUpdates({
        batchDurationHours: '',
        approvedBatchStrength: 'abc',
        faculty: [],
        hostels: []
      });
      expect(updates.batchDurationHours).toBe(400);
      expect(updates.approvedBatchStrength).toBe(30);
    });
  });
});
