import { describe, it, expect } from 'vitest';
import {
  BatchFormData,
  DEFAULT_QUALIFICATION,
  buildCreateBatchDto,
  createAdditionalHostelRow,
  createFacultyRow,
  createInitialHostelRow,
  generateReceiptNumber,
  generateTransactionId,
  toIsoDateOnly,
  validateBatchDetails
} from './batch-form.util';

describe('batch-form.util', () => {
  const validBatch = {
    course: 'Aircraft Maintenance',
    batchDurationHours: 300,
    startDate: '2026-04-01',
    startTime: '09:00',
    endTime: '17:00'
  };

  const fullBatch: BatchFormData = {
    psdFee: 500,
    psdPaymentStatus: 'SUCCESS',
    psdPaymentMode: 'UPI',
    psdPaymentRef: 'TXN-PSD-2026-123456',
    psdPaymentDate: '2026-03-05',
    sector: 'Aerospace and Aviation',
    course: 'Aircraft Maintenance',
    batchDurationHours: 0,
    startDate: '2026-04-01',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    approvedBatchStrength: 0,
    remarks: ''
  };

  const ctx = {
    sdcId: 'sdc-1',
    sdcCode: 'SDC-0001',
    sdcName: 'Jaipur Skill Center',
    tpName: 'ARNOLD SAMARTH',
    scheme: 'SAMARTH',
    sector: 'Fallback Sector'
  };

  it('generateTransactionId / generateReceiptNumber use a 6 digit number', () => {
    expect(generateTransactionId(() => 0)).toBe('TXN-PSD-2026-100000');
    expect(generateReceiptNumber(() => 0)).toBe('RCP-PSD-100000');
    expect(generateTransactionId(() => 0.5)).toBe('TXN-PSD-2026-550000');
    expect(generateReceiptNumber(() => 0.999999)).toMatch(/^RCP-PSD-\d{6}$/);
    expect(generateTransactionId()).toMatch(/^TXN-PSD-2026-\d{6}$/);
  });

  it('toIsoDateOnly returns the yyyy-mm-dd part', () => {
    expect(toIsoDateOnly(new Date('2026-03-05T10:20:30Z'))).toBe('2026-03-05');
  });

  it('createFacultyRow defaults to a primary trainer with an empty name', () => {
    expect(createFacultyRow()).toEqual({
      facultyName: '',
      trainerType: 'Primary Trainer',
      qualification: DEFAULT_QUALIFICATION
    });
    expect(createFacultyRow('Assistant Trainer').trainerType).toBe('Assistant Trainer');
  });

  it('hostel row factories produce the expected defaults', () => {
    expect(createInitialHostelRow()).toEqual({ hostelAddress: '', hostelCode: '', type: 'Boys', capacity: 0 });
    expect(createAdditionalHostelRow(1)).toEqual({
      hostelAddress: '',
      hostelCode: 'HST-002',
      type: 'Co-ed',
      capacity: 30
    });
    expect(createAdditionalHostelRow(0).hostelCode).toBe('HST-001');
  });

  it('validateBatchDetails accepts a complete form', () => {
    const result = validateBatchDetails(validBatch, [{ ...createFacultyRow(), facultyName: 'Vikas' }]);
    expect(result.hasError).toBe(false);
    expect(result.formErrors).toEqual({});
    expect(result.facultyErrors).toEqual([false]);
  });

  it('validateBatchDetails reports each missing field', () => {
    const result = validateBatchDetails(
      { course: '  ', batchDurationHours: 0, startDate: '', startTime: ' ', endTime: '' },
      []
    );
    expect(result.hasError).toBe(true);
    expect(Object.keys(result.formErrors)).toEqual(['course', 'batchDurationHours', 'startDate', 'startTime', 'endTime']);
    expect(result.formErrors['course']).toBe('Course selection is mandatory.');
    expect(result.formErrors['endTime']).toBe('Batch End Time is mandatory.');
  });

  it('validateBatchDetails flags blank faculty names per row', () => {
    const named = { ...createFacultyRow(), facultyName: 'Vikas' };
    const blank = { ...createFacultyRow(), facultyName: '   ' };
    const result = validateBatchDetails(validBatch, [named, blank]);
    expect(result.facultyErrors).toEqual([false, true]);
    expect(result.hasError).toBe(true);
    expect(result.formErrors).toEqual({});
  });

  it('buildCreateBatchDto applies fallbacks and mirrors duplicated fields', () => {
    const dto = buildCreateBatchDto(
      ctx,
      fullBatch,
      [{ facultyName: 'Vikas', trainerType: 'Master Trainer', qualification: 'PhD' }],
      [{ hostelAddress: 'Plot 1', hostelCode: 'HST-001', type: 'Boys', capacity: 20 }]
    );
    expect(dto.sdcId).toBe('sdc-1');
    expect(dto.sector).toBe('Aerospace and Aviation');
    expect(dto.batchDurationHours).toBe(300);
    expect(dto.totalHours).toBe(300);
    expect(dto.endDate).toBe('2026-04-01');
    expect(dto.batchEndDate).toBe('2026-04-01');
    expect(dto.approvedBatchStrength).toBe(30);
    expect(dto.remarks).toBe('');
    expect(dto.psdFee).toBe(500);
    expect(dto.faculty?.[0].name).toBe('Vikas');
    expect(dto.faculty?.[0].experienceYears).toBe(5);
    expect(dto.hostels?.[0].address).toBe('Plot 1');
    expect(dto.hostels?.[0].code).toBe('HST-001');
  });

  it('buildCreateBatchDto falls back to the context sector when the form has none', () => {
    const dto = buildCreateBatchDto(ctx, { ...fullBatch, sector: '' }, [], []);
    expect(dto.sector).toBe('Fallback Sector');
  });
});
