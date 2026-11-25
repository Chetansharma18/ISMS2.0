import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, IconComponent, ListPageComponent, TableColumn } from '../../shared';
import { BatchService } from '../sdc/services/batch.service';
import { isBatchApproved } from '../sdc/utils/batch-approval.util';
import { AttendanceService } from './services/attendance.service';
import { attendancePercent, heldSessionDates, isLowAttendance, sessionDates, summariseAspirant, toIsoDate } from './utils/attendance.util';

/** One approved batch with how its attendance stands. */
interface AttendanceBatchRow {
  id: string;
  batchCode: string;
  courseName: string;
  sdcName: string;
  sdcCode: string;
  startDate: string;
  endDate: string;
  time: string;
  held: number;
  total: number;
  registered: number;
  device: string;
  deviceType: string;
  percent: number;
  pending: number;
}

/**
 * Attendance Management: the approved batches, with the device linked to each, the sessions held and the attendance so
 * far. "Open" takes the Attender User to the batch to take attendance, approve offline marks, and see reports.
 */
@Component({
  selector: 'app-attendance-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, ListPageComponent],
  template: `
    <app-list-page
      title="Attendance Management"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Attendance Management' }]"
      [searchable]="true"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search Batch Code, Course, Center, Device..."
      [columns]="columns"
      [data]="filteredRows()"
      [pagination]="true"
      [pageSize]="pageSize"
      itemUnit="batches"
      emptyMessage="No approved batches yet. Attendance opens once a batch is approved."
      [customTemplates]="{
        batch: batchTemplate,
        center: centerTemplate,
        schedule: scheduleTemplate,
        sessions: sessionsTemplate,
        device: deviceTemplate,
        percent: percentTemplate,
        actions: actionsTemplate
      }"
    >
      <ng-template #batchTemplate let-r>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ r.batchCode }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ r.courseName }}</div>
        </div>
      </ng-template>

      <ng-template #centerTemplate let-r>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ r.sdcName }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ r.sdcCode }}</div>
        </div>
      </ng-template>

      <ng-template #scheduleTemplate let-r>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums whitespace-nowrap">{{ r.startDate }} to {{ r.endDate }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ r.time }}</div>
        </div>
      </ng-template>

      <ng-template #sessionsTemplate let-r>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ r.held }} of {{ r.total }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ r.registered }} aspirants</div>
        </div>
      </ng-template>

      <ng-template #deviceTemplate let-r>
        @if (r.device) {
          <div>
            <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ r.device }}</div>
            <div class="text-[11px] text-secondary leading-tight mt-px">{{ r.deviceType }}</div>
          </div>
        } @else {
          <span class="font-normal text-[13px] text-amber-700">Not linked</span>
        }
      </ng-template>

      <ng-template #percentTemplate let-r>
        @if (r.held > 0) {
          <div>
            <div class="font-normal text-[13px] leading-tight tabular-nums" [class]="isLow(r.percent) ? 'text-red-600' : 'text-emerald-700'">{{ r.percent }}%</div>
            @if (r.pending > 0) {
              <div class="text-[11px] text-secondary leading-tight mt-px">{{ r.pending }} offline to approve</div>
            }
          </div>
        } @else {
          <span class="text-muted">—</span>
        }
      </ng-template>

      <ng-template #actionsTemplate let-r>
        <div class="flex items-center justify-center py-2 px-1 whitespace-nowrap">
          <button appButton size="sm" class="w-28 shrink-0" type="button" (click)="open(r)" title="Take attendance and see the reports of this batch">
            <app-icon name="clipboard-check" size="sm" />
            <span>Open</span>
          </button>
        </div>
      </ng-template>
    </app-list-page>
  `
})
export class AttendanceListComponent {
  private readonly batchService = inject(BatchService);
  private readonly attendance = inject(AttendanceService);
  private readonly router = inject(Router);

  readonly searchQuery = signal<string>('');
  readonly pageSize = 10;

  readonly columns: TableColumn<AttendanceBatchRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'batch', label: 'Batch & Course', type: 'custom', width: 'min-w-[210px]' },
    { key: 'center', label: 'Center (SDC)', type: 'custom', width: 'min-w-[170px]' },
    { key: 'schedule', label: 'Schedule', type: 'custom', width: 'min-w-[200px]' },
    { key: 'sessions', label: 'Sessions Held', type: 'custom', width: 'min-w-[130px]' },
    { key: 'device', label: 'Biometric Device', type: 'custom', width: 'min-w-[160px]' },
    { key: 'percent', label: 'Attendance', type: 'custom', width: 'min-w-[130px]' },
    { key: 'actions', label: 'Actions', type: 'custom', align: 'center', width: 'w-36' }
  ];

  private readonly rows = computed<AttendanceBatchRow[]>(() => {
    const today = toIsoDate(new Date());
    return this.batchService
      .batches()
      .filter(batch => isBatchApproved(batch))
      .map(batch => {
        const roster = this.attendance.rosterOf(batch.id);
        const index = this.attendance.indexOf(batch.id);
        const held = heldSessionDates(batch, today);
        const summaries = roster.map(a => summariseAspirant(index, a.id, held));
        const present = summaries.reduce((sum, s) => sum + s.present, 0);
        const partial = summaries.reduce((sum, s) => sum + s.partial, 0);
        const device = this.attendance.deviceOf(batch.id);
        return {
          id: batch.id,
          batchCode: batch.batchCode,
          courseName: batch.courseName,
          sdcName: batch.sdcName,
          sdcCode: batch.sdcCode,
          startDate: batch.startDate,
          endDate: batch.endDate,
          time: `${batch.startTime} – ${batch.endTime}`,
          held: held.length,
          total: sessionDates(batch).length,
          registered: roster.length,
          device: device?.serialNo ?? '',
          deviceType: device?.type ?? '',
          percent: attendancePercent(present, partial, roster.length * held.length),
          pending: this.attendance.marksOf(batch.id).filter(mark => mark.approval === 'PENDING').length
        };
      });
  });

  readonly filteredRows = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.rows();
    return this.rows().filter(r => [r.batchCode, r.courseName, r.sdcName, r.sdcCode, r.device].join(' ').toLowerCase().includes(q));
  });

  isLow(percent: number): boolean {
    return isLowAttendance(percent);
  }

  open(row: AttendanceBatchRow): void {
    this.router.navigate(['/attendance', row.id]);
  }
}
