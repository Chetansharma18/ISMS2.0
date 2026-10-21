import { Injectable, computed, inject } from '@angular/core';
import { INITIAL_ATTENDANCE_DEVICES, INITIAL_ATTENDANCE_MARKS } from '../../../core/mock/data/attendance.mock';
import { DOITC_DEVICES } from '../../../core/mock/data/doitc-devices.mock';
import { createPersistedStore } from '../../../core/services/persisted-store';
import { AspirantService } from '../../sdc/services/aspirant.service';
import { BatchService } from '../../sdc/services/batch.service';
import type { AttendanceMark, AttendanceNotice, AttendanceNoticeType, AttendanceSlot, BiometricDevice } from '../models/attendance.model';
import { absentText, buildMarkIndex, confirmationText, dayStatus, liveMark, marksOfDay, reminderText } from '../utils/attendance.util';

/**
 * Attendance of aspirants: two marks a day (start and end), taken on the DoITC biometric device linked to the batch by
 * its Attender User, or by hand (offline) when the device does not work. An offline mark counts only after the Attender
 * User approves it. The device is simulated for now: `punch` is what the device sends when an aspirant punches.
 */
@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly aspirantService = inject(AspirantService);
  private readonly batchService = inject(BatchService);

  private readonly markStore = createPersistedStore<AttendanceMark>({ key: 'isms_attendance_marks', seed: INITIAL_ATTENDANCE_MARKS });
  private readonly deviceStore = createPersistedStore<BiometricDevice>({ key: 'isms_attendance_devices', seed: INITIAL_ATTENDANCE_DEVICES });
  private readonly noticeStore = createPersistedStore<AttendanceNotice>({ key: 'isms_attendance_notices', seed: [] });

  readonly marks = this.markStore.items.asReadonly();
  readonly devices = this.deviceStore.items.asReadonly();
  readonly notices = this.noticeStore.items.asReadonly();

  /** The aspirants in a batch now; a student who dropped out is no longer on the roster. */
  rosterOf(batchId: string) {
    return this.aspirantService.aspirants().filter(a => a.batchId === batchId && a.trainingStatus !== 'DROPOUT');
  }

  marksOf(batchId: string): AttendanceMark[] {
    return this.marks().filter(mark => mark.batchId === batchId);
  }

  /** The marks of a batch by aspirant and day. Reads the marks signal, so it can be used inside a computed. */
  indexOf(batchId: string) {
    return buildMarkIndex(this.marksOf(batchId));
  }

  deviceOf(batchId: string): BiometricDevice | undefined {
    return this.devices().find(device => device.batchId === batchId);
  }

  noticesOf(batchId: string): AttendanceNotice[] {
    return this.notices().filter(notice => notice.batchId === batchId);
  }

  readonly pendingCount = computed(() => this.marks().filter(mark => mark.approval === 'PENDING').length);

  // ---- Device --------------------------------------------------------------------------------

  /**
   * Links a DoITC device to the batch. Returns an empty text on success, or what is wrong: the serial is not in the DoITC
   * registry, the device is linked to another batch, or the batch already has a device.
   */
  linkDevice(batchId: string, serialNo: string, linkedBy: string): string {
    const serial = serialNo.trim().toUpperCase();
    if (!serial) return 'Enter the serial number of the device.';
    const registered = DOITC_DEVICES.find(device => device.serialNo === serial);
    if (!registered) return 'This serial number is not in the DoITC device registry. Check it and try again.';
    if (this.deviceOf(batchId)) return 'This batch already has a device. Unlink it first.';
    const other = this.devices().find(device => device.serialNo === serial);
    if (other) {
      const batch = this.batchService.getBatchById(other.batchId);
      return `This device is already linked to batch ${batch?.batchCode ?? other.batchId}.`;
    }
    this.deviceStore.items.update(list => [...list, { batchId, serialNo: serial, type: registered.type, model: registered.model, linkedBy, linkedAt: new Date().toISOString() }]);
    this.deviceStore.persist();
    return '';
  }

  unlinkDevice(batchId: string): void {
    this.deviceStore.items.update(list => list.filter(device => device.batchId !== batchId));
    this.deviceStore.persist();
  }

  // ---- Marks ---------------------------------------------------------------------------------

  private hasLiveMark(batchId: string, aspirantId: string, date: string, slot: AttendanceSlot): boolean {
    return !!liveMark(marksOfDay(this.indexOf(batchId), aspirantId, date), slot);
  }

  private addMarks(marks: AttendanceMark[]): void {
    if (marks.length === 0) return;
    this.markStore.items.update(list => [...list, ...marks]);
    this.markStore.persist();
  }

  /** What the device sends when an aspirant punches: the mark is recorded and the aspirant is told. False if it cannot be. */
  punch(batchId: string, aspirantId: string, date: string, slot: AttendanceSlot): boolean {
    const device = this.deviceOf(batchId);
    if (!device || this.hasLiveMark(batchId, aspirantId, date, slot)) return false;
    this.addMarks([
      { id: `${batchId}|${aspirantId}|${date}|${slot}|${Date.now()}`, batchId, aspirantId, date, slot, mode: 'BIOMETRIC', at: new Date().toISOString(), markedBy: device.serialNo }
    ]);
    this.notify(batchId, aspirantId, 'CONFIRMATION', date, slot);
    return true;
  }

  /** Marks the aspirants by hand; the marks wait for the Attender User's approval. Returns how many were marked. */
  markOffline(batchId: string, aspirantIds: readonly string[], date: string, slot: AttendanceSlot, reason: string, markedBy: string): number {
    const marks: AttendanceMark[] = aspirantIds
      .filter(id => !this.hasLiveMark(batchId, id, date, slot))
      .map((aspirantId, i) => ({
        id: `${batchId}|${aspirantId}|${date}|${slot}|${Date.now()}-${i}`,
        batchId,
        aspirantId,
        date,
        slot,
        mode: 'OFFLINE' as const,
        at: new Date().toISOString(),
        markedBy,
        reason,
        approval: 'PENDING' as const
      }));
    this.addMarks(marks);
    return marks.length;
  }

  /** The Attender User approves or rejects offline marks. An approved mark counts and the aspirant is told. */
  decide(markIds: readonly string[], decision: 'APPROVED' | 'REJECTED', remarks: string, officer: string): number {
    const wanted = new Set(markIds);
    const decided: AttendanceMark[] = [];
    const at = new Date().toISOString();
    this.markStore.items.update(list =>
      list.map(mark => {
        if (!wanted.has(mark.id) || mark.approval !== 'PENDING') return mark;
        const updated: AttendanceMark = { ...mark, approval: decision, decidedBy: officer, decidedAt: at, decisionRemarks: remarks || undefined };
        decided.push(updated);
        return updated;
      })
    );
    this.markStore.persist();
    if (decision === 'APPROVED') {
      for (const mark of decided) this.notify(mark.batchId, mark.aspirantId, 'CONFIRMATION', mark.date, mark.slot);
    }
    return decided.length;
  }

  // ---- Notifications -------------------------------------------------------------------------

  private notify(batchId: string, aspirantId: string, type: AttendanceNoticeType, date: string, slot?: AttendanceSlot): boolean {
    const batch = this.batchService.getBatchById(batchId);
    const aspirant = this.aspirantService.getAspirantById(aspirantId);
    if (!batch || !aspirant) return false;
    const message =
      type === 'REMINDER'
        ? reminderText(aspirant.aspirantName, batch.batchCode, date, batch.startTime)
        : type === 'ABSENT_ALERT'
          ? absentText(aspirant.aspirantName, batch.batchCode, date)
          : confirmationText(aspirant.aspirantName, batch.batchCode, date, slot ?? 'START');
    const notice: AttendanceNotice = {
      id: `ntc-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      batchId,
      aspirantId,
      aspirantName: aspirant.aspirantName,
      mobile: aspirant.mobileNo,
      type,
      message,
      sentAt: new Date().toISOString()
    };
    this.noticeStore.items.update(list => [notice, ...list]);
    this.noticeStore.persist();
    return true;
  }

  /** Reminds every aspirant of the batch about the session. Returns how many were told. */
  sendReminders(batchId: string, date: string): number {
    return this.rosterOf(batchId).filter(a => this.notify(batchId, a.id, 'REMINDER', date)).length;
  }

  /** Tells the aspirants who were absent (no mark at all) on the day. Returns how many were told. */
  sendAbsentAlerts(batchId: string, date: string): number {
    const index = this.indexOf(batchId);
    const absent = this.rosterOf(batchId).filter(a => dayStatus(marksOfDay(index, a.id, date)) === 'ABSENT');
    return absent.filter(a => this.notify(batchId, a.id, 'ABSENT_ALERT', date)).length;
  }
}
