import { CreateBatchDto } from '../../models/batch.model';

export interface FacultyItem {
  /** SSO ID of the trainer; the name below is the one SSO returns for it. */
  ssoId: string;
  facultyName: string;
  trainerType: string;
  qualification: string;
}

/** One camera of the centre that records the batch: its vendor, address, credentials and live feed link. */
export interface CameraItem {
  vendor: string;
  ipAddress: string;
  username: string;
  password: string;
  liveFeedUrl: string;
}

export const CAMERA_VENDORS = ['Hikvision', 'CP Plus', 'Dahua', 'Axis', 'Bosch', 'Honeywell', 'Other'];

/** An empty camera row to fill in. */
export function createCameraRow(): CameraItem {
  return { vendor: '', ipAddress: '', username: '', password: '', liveFeedUrl: '' };
}

/** A camera row with nothing filled in. */
export function isCameraRowBlank(camera: CameraItem): boolean {
  return !camera.vendor && !camera.ipAddress.trim() && !camera.username.trim() && !camera.password && !camera.liveFeedUrl.trim();
}

const LIVE_FEED_PATTERN = /^(rtsp|rtmp|http|https):\/\/\S+$/i;

/** Message for each camera row, or an empty text when the row is fine. At least one camera is required. */
export function validateCameras(cameras: CameraItem[]): string[] {
  return cameras.map(camera => {
    if (isCameraRowBlank(camera)) return 'Enter the camera details.';
    if (!camera.vendor) return 'Select the camera vendor.';
    if (!camera.username.trim() || !camera.password) return 'Enter the camera user name and password.';
    if (!LIVE_FEED_PATTERN.test(camera.liveFeedUrl.trim())) return 'Enter a live feed link starting with rtsp://, rtmp://, http:// or https://.';
    return '';
  });
}

export interface HostelItem {
  hostelAddress: string;
  hostelCode: string;
  type: string;
  capacity: number;
}

/** Unified batch form model: Step 1 PSD payment fields + Step 2 batch parameters. */
export interface BatchFormData {
  psdFee: number;
  psdPaymentStatus: string;
  psdPaymentMode: string;
  psdPaymentRef: string;
  psdPaymentDate: string;
  sector: string;
  course: string;
  batchDurationHours: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  approvedBatchStrength: number;
  remarks: string;
  /** "allocationId|courseRowId" of the IPA course this batch runs under (centres with IPA allocations). */
  ipaSlot?: string;
}

/** SDC / scheme context copied onto the created batch. */
export interface BatchFormContext {
  sdcId: string;
  sdcCode: string;
  sdcName: string;
  tpName: string;
  scheme: string;
  sector: string;
}

export interface BatchValidationResult {
  formErrors: Record<string, string>;
  facultyErrors: boolean[];
  hasError: boolean;
}

/** Performance Security Deposit (PSD) taken before a batch is created. It is separate from the batch fee. */
export const PSD_AMOUNT = 500;
export const PSD_AMOUNT_IN_WORDS = 'Five Hundred Rupees Only';

export const DEFAULT_QUALIFICATION = 'Graduate (B.A / B.Sc / B.Com / B.Tech)';

/** Pseudo-random 6 digit number (100000 - 999999). `random` is injectable for tests. */
function sixDigits(random: () => number): number {
  return Math.floor(100000 + random() * 900000);
}

export function generateTransactionId(random: () => number = Math.random): string {
  return `TXN-PSD-2026-${sixDigits(random)}`;
}

export function generateReceiptNumber(random: () => number = Math.random): string {
  return `RCP-PSD-${sixDigits(random)}`;
}

/** yyyy-mm-dd (UTC) part of an ISO timestamp. */
export function toIsoDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * A saved time ("09:00 AM", "5:30 PM" or "17:30") as the 24-hour "HH:mm" a time field takes.
 * An empty text is returned when the value cannot be read.
 */
export function toTimeInput(value: string | undefined): string {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(value ?? '');
  if (!match) return '';
  let hours = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (hours > 23) return '';
  return `${String(hours).padStart(2, '0')}:${match[2]}`;
}

export function createFacultyRow(trainerType: string = 'Primary Trainer'): FacultyItem {
  return {
    ssoId: '',
    facultyName: '',
    trainerType,
    qualification: DEFAULT_QUALIFICATION
  };
}

export function createInitialHostelRow(): HostelItem {
  return {
    hostelAddress: '',
    hostelCode: '',
    type: 'Boys',
    capacity: 0
  };
}

/** Row appended by "Add Hostel": code is numbered after the rows already present. */
export function createAdditionalHostelRow(existingCount: number): HostelItem {
  return {
    hostelAddress: '',
    hostelCode: `HST-00${existingCount + 1}`,
    type: 'Co-ed',
    capacity: 30
  };
}

/**
 * Validates the compulsory Step 2 fields.
 * Returns field-level messages, a per-row flag for empty faculty names and an overall flag.
 */
export function validateBatchDetails(
  batch: Pick<BatchFormData, 'course' | 'batchDurationHours' | 'startDate' | 'startTime' | 'endTime'>,
  faculty: FacultyItem[]
): BatchValidationResult {
  const formErrors: Record<string, string> = {};
  let hasError = false;

  if (!batch.course || batch.course.trim() === '') {
    formErrors['course'] = 'Course selection is mandatory.';
    hasError = true;
  }
  if (!batch.batchDurationHours || Number(batch.batchDurationHours) <= 0) {
    formErrors['batchDurationHours'] = 'Batch Duration in hours is mandatory.';
    hasError = true;
  }
  if (!batch.startDate || batch.startDate.trim() === '') {
    formErrors['startDate'] = 'Batch Start Date is mandatory.';
    hasError = true;
  }
  if (!batch.startTime || batch.startTime.trim() === '') {
    formErrors['startTime'] = 'Batch Start Time is mandatory.';
    hasError = true;
  }
  if (!batch.endTime || batch.endTime.trim() === '') {
    formErrors['endTime'] = 'Batch End Time is mandatory.';
    hasError = true;
  }

  // Check each trainer in faculty list
  const facultyErrors = faculty.map(f => !f.facultyName || f.facultyName.trim().length === 0);
  if (facultyErrors.some(err => err)) {
    hasError = true;
  }

  return { formErrors, facultyErrors, hasError };
}

/** Maps the form state to the payload handed to BatchService.createBatch. */
export function buildCreateBatchDto(
  ctx: BatchFormContext,
  batch: BatchFormData,
  facultyList: FacultyItem[],
  hostelList: HostelItem[],
  cameraList: CameraItem[] = []
): CreateBatchDto {
  return {
    sdcId: ctx.sdcId,
    sdcCode: ctx.sdcCode,
    sdcName: ctx.sdcName,
    tpName: ctx.tpName,
    scheme: ctx.scheme,
    sector: batch.sector || ctx.sector,
    course: batch.course,
    courseName: batch.course,
    batchDurationHours: batch.batchDurationHours || 300,
    totalHours: batch.batchDurationHours || 300,
    startDate: batch.startDate,
    batchStartDate: batch.startDate,
    endDate: batch.endDate || batch.startDate,
    batchEndDate: batch.endDate || batch.startDate,
    startTime: batch.startTime,
    batchStartTime: batch.startTime,
    endTime: batch.endTime,
    batchEndTime: batch.endTime,
    approvedBatchStrength: batch.approvedBatchStrength || 30,
    remarks: batch.remarks || '',
    psdFee: batch.psdFee || 500,
    psdPaymentStatus: batch.psdPaymentStatus,
    psdPaymentRef: batch.psdPaymentRef,
    psdPaymentMode: batch.psdPaymentMode,
    psdPaymentDate: batch.psdPaymentDate,
    cameras: cameraList.map(c => ({ ...c })),
    faculty: facultyList.map(f => ({
      ssoId: f.ssoId,
      name: f.facultyName,
      facultyName: f.facultyName,
      type: f.trainerType as any,
      trainerType: f.trainerType,
      qualification: f.qualification,
      experienceYears: 5
    })),
    hostels: hostelList.map(h => ({
      hostelAddress: h.hostelAddress,
      address: h.hostelAddress,
      hostelCode: h.hostelCode,
      code: h.hostelCode,
      type: h.type as any,
      hostelType: h.type,
      capacity: h.capacity
    }))
  };
}
