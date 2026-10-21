import type { BiometricDeviceType } from '../../../core/mock/data/doitc-devices.mock';

/** A day of a batch has two attendance marks: one at the start of the day and one at the end. */
export type AttendanceSlot = 'START' | 'END';

/** Biometric: punched on the linked DoITC device. Offline: marked by hand when the device does not work. */
export type AttendanceMode = 'BIOMETRIC' | 'OFFLINE';

/** An offline mark counts only after the Attender User approves it. */
export type OfflineApproval = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceMark {
  id: string;
  batchId: string;
  aspirantId: string;
  /** yyyy-mm-dd */
  date: string;
  slot: AttendanceSlot;
  mode: AttendanceMode;
  /** ISO date-time the mark was made. */
  at: string;
  /** Biometric: the device serial. Offline: the person who marked it. */
  markedBy: string;
  /** Offline marks only. */
  reason?: string;
  approval?: OfflineApproval;
  decidedBy?: string;
  decidedAt?: string;
  decisionRemarks?: string;
}

/** The status of one aspirant for one day. */
export type DayStatus = 'PRESENT' | 'PARTIAL' | 'ABSENT' | 'PENDING';

/** A DoITC biometric device linked to a batch by its Attender User. */
export interface BiometricDevice {
  batchId: string;
  serialNo: string;
  type: BiometricDeviceType;
  model: string;
  linkedBy: string;
  /** ISO date-time. */
  linkedAt: string;
}

export type AttendanceNoticeType = 'REMINDER' | 'CONFIRMATION' | 'ABSENT_ALERT';

/** A message sent to an aspirant about attendance (simulated until the SMS gateway exists). */
export interface AttendanceNotice {
  id: string;
  batchId: string;
  aspirantId: string;
  aspirantName: string;
  mobile: string;
  type: AttendanceNoticeType;
  message: string;
  /** ISO date-time. */
  sentAt: string;
}
