import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  ButtonComponent,
  FilterTabsComponent,
  FormSectionComponent,
  IconComponent,
  ModalComponent,
  TableColumn,
  TableComponent
} from '../../shared';
import { BatchService } from '../sdc/services/batch.service';
import type { DayStatus } from './models/attendance.model';
import { AttendanceService } from './services/attendance.service';
import { downloadCsv } from './utils/attendance-csv.util';
import {
  DAY_STATUS_LABEL,
  dayStatus,
  dayStatusClass,
  heldSessionDates,
  isLowAttendance,
  liveMark,
  MIN_ATTENDANCE_PERCENT,
  marksOfDay,
  summariseAspirant,
  summariseDay,
  timeOf,
  toIsoDate
} from './utils/attendance.util';

interface SessionRow {
  date: string;
  present: number;
  partial: number;
  absent: number;
  pending: number;
  total: number;
  percent: number;
}

interface AspirantRow {
  id: string;
  name: string;
  present: number;
  partial: number;
  absent: number;
  pending: number;
  held: number;
  percent: number;
}

interface ParticipantRow {
  id: string;
  name: string;
  start: string;
  end: string;
  status: DayStatus;
}

/**
 * Attendance Reports: for each session day the participant list with who was present, partial or absent and the
 * attendance percentage, and for each aspirant the days present and the percentage over the sessions held. Both can be
 * exported to CSV.
 */
@Component({
  selector: 'app-attendance-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, FilterTabsComponent, FormSectionComponent, IconComponent, ModalComponent, TableComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-4 font-sans">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <app-filter-tabs [options]="viewTabs" [value]="view()" (valueChange)="view.set($event === 'ASPIRANT' ? 'ASPIRANT' : 'SESSION')" />
        <button appButton variant="outline" size="sm" type="button" (click)="exportCsv()" title="Export this report to CSV">
          <app-icon name="download" size="sm" />
          <span>Export CSV</span>
        </button>
      </div>

      @if (view() === 'SESSION') {
        <app-form-section class="block" [title]="'Session-wise Report (' + sessionRows().length + ' sessions)'">
          <app-table
            [columns]="sessionColumns"
            [data]="sessionRows()"
            [pagination]="true"
            [pageSize]="10"
            itemUnit="sessions"
            emptyMessage="No session has been held yet."
            [customTemplates]="{ percent: sessionPercentTpl, actions: sessionActionTpl }"
          />
        </app-form-section>
      } @else {
        <app-form-section class="block" [title]="'Aspirant-wise Report (' + aspirantRows().length + ' aspirants)'">
          <app-table
            [columns]="aspirantColumns"
            [data]="aspirantRows()"
            [pagination]="true"
            [pageSize]="10"
            itemUnit="aspirants"
            emptyMessage="No aspirants are registered in this batch."
            [customTemplates]="{ aspirant: aspirantTpl, percent: aspirantPercentTpl }"
          />
        </app-form-section>
      }
    </div>

    <ng-template #sessionPercentTpl let-r>
      <span class="whitespace-nowrap font-normal text-[13px] tabular-nums" [class]="low(r.percent) ? 'text-red-600' : 'text-emerald-700'">{{ r.percent }}%</span>
    </ng-template>
    <ng-template #sessionActionTpl let-r>
      <button appButton variant="outline" size="sm" type="button" class="w-24" (click)="openSession(r.date)" title="See who was present on this day">
        <app-icon name="eye" size="sm" />
        <span>View</span>
      </button>
    </ng-template>
    <ng-template #aspirantTpl let-r>
      <div>
        <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ r.name }}</div>
        <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ r.id }}</div>
      </div>
    </ng-template>
    <ng-template #aspirantPercentTpl let-r>
      <div>
        <div class="font-normal text-[13px] leading-tight tabular-nums" [class]="low(r.percent) ? 'text-red-600' : 'text-emerald-700'">{{ r.percent }}%</div>
        @if (low(r.percent)) {
          <div class="text-[11px] text-red-600 leading-tight mt-px">Below {{ minPercent }}%</div>
        }
      </div>
    </ng-template>

    @if (openDate(); as date) {
      <app-modal [title]="'Attendance on ' + date" [subtitle]="batchTitle()" size="lg" (close)="openDate.set(null)">
        <app-table
          [columns]="participantColumns"
          [data]="participantRows()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="aspirants"
          emptyMessage="No aspirants are registered in this batch."
          [customTemplates]="{ status: participantStatusTpl }"
        />
        <ng-container modalFooter>
          <button appButton variant="outline" type="button" (click)="exportSessionCsv(date)">
            <app-icon name="download" size="sm" />
            <span>Export CSV</span>
          </button>
          <button appButton variant="outline" type="button" (click)="openDate.set(null)">Close</button>
        </ng-container>
      </app-modal>
    }
    <ng-template #participantStatusTpl let-r>
      <span class="whitespace-nowrap font-normal text-[13px]" [class]="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
    </ng-template>
  `
})
export class AttendanceReportsComponent {
  private readonly attendance = inject(AttendanceService);
  private readonly batchService = inject(BatchService);

  readonly batchId = input.required<string>();

  protected readonly minPercent = MIN_ATTENDANCE_PERCENT;
  protected readonly view = signal<'SESSION' | 'ASPIRANT'>('SESSION');
  protected readonly viewTabs = [
    { id: 'SESSION', label: 'Session-wise' },
    { id: 'ASPIRANT', label: 'Aspirant-wise' }
  ];
  protected readonly openDate = signal<string | null>(null);

  private readonly batch = computed(() => this.batchService.getBatchById(this.batchId()));
  protected readonly batchTitle = computed(() => `${this.batch()?.batchCode ?? ''} • ${this.batch()?.courseName ?? ''}`);
  private readonly today = toIsoDate(new Date());

  private readonly roster = computed(() => this.attendance.rosterOf(this.batchId()));
  private readonly held = computed(() => {
    const batch = this.batch();
    return batch ? heldSessionDates(batch, this.today) : [];
  });

  protected readonly sessionColumns: TableColumn<SessionRow>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'date', label: 'Session Date', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-32' },
    { key: 'total', label: 'Aspirants', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'present', label: 'Present', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'partial', label: 'Partial', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'absent', label: 'Absent', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'pending', label: 'Pending', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'percent', label: 'Attendance', type: 'custom', align: 'center', width: 'w-28' },
    { key: 'actions', label: 'Participants', type: 'custom', align: 'center', width: 'w-32' }
  ];

  protected readonly aspirantColumns: TableColumn<AspirantRow>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'aspirant', label: 'Aspirant', type: 'custom', width: 'min-w-[180px]' },
    { key: 'held', label: 'Sessions Held', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-28' },
    { key: 'present', label: 'Present', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'partial', label: 'Partial', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'absent', label: 'Absent', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'pending', label: 'Pending', align: 'center', cellClass: 'tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-24' },
    { key: 'percent', label: 'Attendance', type: 'custom', width: 'w-32' }
  ];

  protected readonly participantColumns: TableColumn<ParticipantRow>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'name', label: 'Aspirant', cellClass: 'font-normal text-slate-800 text-[13px]', width: 'min-w-[160px]' },
    { key: 'id', label: 'Aspirant ID', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'min-w-[150px]' },
    { key: 'start', label: 'Start of Day', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-28' },
    { key: 'end', label: 'End of Day', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-28' },
    { key: 'status', label: 'Status', type: 'custom', width: 'min-w-[140px]' }
  ];

  protected readonly sessionRows = computed<SessionRow[]>(() => {
    const index = this.attendance.indexOf(this.batchId());
    const ids = this.roster().map(a => a.id);
    return [...this.held()].reverse().map(date => ({ date, ...summariseDay(index, ids, date) }));
  });

  protected readonly aspirantRows = computed<AspirantRow[]>(() => {
    const index = this.attendance.indexOf(this.batchId());
    return this.roster().map(a => {
      const s = summariseAspirant(index, a.id, this.held());
      return { id: a.id, name: a.aspirantName, present: s.present, partial: s.partial, absent: s.absent, pending: s.pending, held: s.held, percent: s.percent };
    });
  });

  protected readonly participantRows = computed<ParticipantRow[]>(() => {
    const date = this.openDate();
    return date ? this.participantsOn(date) : [];
  });

  private participantsOn(date: string): ParticipantRow[] {
    const index = this.attendance.indexOf(this.batchId());
    return this.roster().map(a => {
      const marks = marksOfDay(index, a.id, date);
      const start = liveMark(marks, 'START');
      const end = liveMark(marks, 'END');
      return {
        id: a.id,
        name: a.aspirantName,
        start: start ? timeOf(start.at) : '—',
        end: end ? timeOf(end.at) : '—',
        status: dayStatus(marks)
      };
    });
  }

  protected low(percent: number): boolean {
    return isLowAttendance(percent);
  }

  protected statusLabel(status: DayStatus): string {
    return DAY_STATUS_LABEL[status];
  }

  protected statusClass(status: DayStatus): string {
    return dayStatusClass(status);
  }

  protected openSession(date: string): void {
    this.openDate.set(date);
  }

  protected exportCsv(): void {
    const code = this.batch()?.batchCode ?? 'batch';
    if (this.view() === 'SESSION') {
      downloadCsv(
        `Attendance_Sessions_${code}.csv`,
        ['Session Date', 'Aspirants', 'Present', 'Partial', 'Absent', 'Pending Approval', 'Attendance %'],
        this.sessionRows().map(r => [r.date, r.total, r.present, r.partial, r.absent, r.pending, r.percent])
      );
    } else {
      downloadCsv(
        `Attendance_Aspirants_${code}.csv`,
        ['Aspirant ID', 'Aspirant', 'Sessions Held', 'Present', 'Partial', 'Absent', 'Pending Approval', 'Attendance %'],
        this.aspirantRows().map(r => [r.id, r.name, r.held, r.present, r.partial, r.absent, r.pending, r.percent])
      );
    }
  }

  protected exportSessionCsv(date: string): void {
    downloadCsv(
      `Attendance_${this.batch()?.batchCode ?? 'batch'}_${date}.csv`,
      ['Aspirant ID', 'Aspirant', 'Start of Day', 'End of Day', 'Status'],
      this.participantsOn(date).map(r => [r.id, r.name, r.start, r.end, DAY_STATUS_LABEL[r.status]])
    );
  }
}
