import { BatchRecord } from '../../models/batch.model';

/** Faculty row shown when a batch has no faculty configured. */
export const DEFAULT_FACULTY: readonly any[] = [
  {
    id: 'fac-1',
    name: 'Vikas Purohit',
    facultyName: 'Vikas Purohit',
    type: 'Primary Trainer',
    trainerType: 'Primary Trainer',
    qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
  }
];

/** Hostel row shown when a batch has no hostel configured. */
export const DEFAULT_HOSTELS: readonly any[] = [
  {
    id: 'hostel-1',
    hostelAddress: 'Plot / Campus Address',
    address: 'Plot / Campus Address',
    hostelCode: 'HST-JP-001',
    code: 'HST-JP-001',
    type: 'Boys',
    hostelType: 'Boys',
    capacity: 0
  }
];

export function isBatchRejected(b: BatchRecord): boolean {
  if (!b) return false;
  return b.status === 'REJECTED' || b.approvalStatus === 'REJECTED';
}

export function isBatchApproved(b: BatchRecord): boolean {
  if (!b) return false;
  if (b.status === 'REJECTED' || b.approvalStatus === 'REJECTED') return false;
  const count = b.mappedAspirantsCount ?? b.trainees?.length ?? 0;
  const max = b.approvedBatchStrength || b.maxStrength || 30;
  return count >= 25 && count <= max;
}

export function formatBatchStatus(b: BatchRecord): string {
  if (isBatchRejected(b)) return 'REJECTED';
  if (isBatchApproved(b)) return 'APPROVED';
  return 'PENDING';
}

export function getBatchFacultyList(b: BatchRecord): any[] {
  if (b.faculty && b.faculty.length > 0) {
    return b.faculty;
  }
  return DEFAULT_FACULTY as any[];
}

export function getBatchHostelList(b: BatchRecord): any[] {
  if (b.hostels && b.hostels.length > 0) {
    return b.hostels;
  }
  if (b.hostel) {
    return [b.hostel];
  }
  return DEFAULT_HOSTELS as any[];
}

export function createFacultyRow(): any {
  return {
    id: `fac-${Date.now()}`,
    facultyName: '',
    trainerType: 'Primary Trainer',
    qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
  };
}

export function createHostelRow(): any {
  return {
    id: `hostel-${Date.now()}`,
    hostelAddress: '',
    hostelCode: '',
    type: 'Boys',
    capacity: 0
  };
}

/** Builds the editable form model for a batch. `availableCourses` are the courses of the batch's sector. */
export function buildBatchEditModel(
  b: BatchRecord,
  currentSector: string,
  availableCourses: { courseName: string }[]
): any {
  const faculty = getBatchFacultyList(b).map((f, idx) => ({
    id: f.id || `fac-${idx}`,
    facultyName: f.facultyName || f.name || '',
    trainerType: f.trainerType || f.type || 'Primary Trainer',
    qualification: f.qualification || 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
  }));

  const hostels = getBatchHostelList(b).map((h, idx) => ({
    id: h.id || `hostel-${idx}`,
    hostelAddress: h.hostelAddress || h.address || '',
    hostelCode: h.hostelCode || h.code || '',
    type: h.type || h.hostelType || 'Boys',
    capacity: h.capacity ?? 0
  }));

  return {
    id: b.id,
    batchCode: b.batchCode,
    sector: currentSector,
    courseName: b.courseName || b.course || (availableCourses[0]?.courseName || ''),
    batchDurationHours: b.batchDurationHours || b.totalHours || 400,
    startDate: b.startDate || b.batchStartDate || '2026-10-01',
    endDate: b.endDate || b.batchEndDate || '2026-12-31',
    startTime: b.startTime || b.batchStartTime || '09:00 AM',
    endTime: b.endTime || b.batchEndTime || '05:00 PM',
    approvedBatchStrength: b.approvedBatchStrength || b.maxStrength || 30,
    remarks: b.remarks || '',
    faculty: faculty.length > 0 ? faculty : [{ ...DEFAULT_FACULTY[0] }],
    hostels: hostels.length > 0 ? hostels : [{ ...DEFAULT_HOSTELS[0] }]
  };
}

/** Maps the edit form model back to a partial BatchRecord update. */
export function buildBatchUpdates(editModel: any): Partial<BatchRecord> {
  return {
    sector: editModel.sector,
    courseName: editModel.courseName,
    course: editModel.courseName,
    batchDurationHours: Number(editModel.batchDurationHours) || 400,
    totalHours: Number(editModel.batchDurationHours) || 400,
    startDate: editModel.startDate,
    batchStartDate: editModel.startDate,
    endDate: editModel.endDate,
    batchEndDate: editModel.endDate,
    startTime: editModel.startTime,
    batchStartTime: editModel.startTime,
    endTime: editModel.endTime,
    batchEndTime: editModel.endTime,
    approvedBatchStrength: Number(editModel.approvedBatchStrength) || 30,
    maxStrength: Number(editModel.approvedBatchStrength) || 30,
    remarks: editModel.remarks,
    faculty: editModel.faculty.map((f: any) => ({
      id: f.id,
      name: f.facultyName,
      facultyName: f.facultyName,
      type: f.trainerType,
      trainerType: f.trainerType,
      qualification: f.qualification
    })),
    hostels: editModel.hostels.map((h: any) => ({
      id: h.id,
      address: h.hostelAddress,
      hostelAddress: h.hostelAddress,
      code: h.hostelCode,
      hostelCode: h.hostelCode,
      type: h.type,
      hostelType: h.type,
      capacity: Number(h.capacity) || 0
    }))
  };
}
