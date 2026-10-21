import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import {
  ButtonComponent,
  FormInputComponent,
  FormSectionComponent,
  IconComponent,
  TableColumn,
  TableComponent
} from '../../shared';
import { BatchService } from '../sdc/services/batch.service';
import type { AttendanceNotice, AttendanceNoticeType } from './models/attendance.model';
import { AttendanceService } from './services/attendance.service';
import { defaultSessionDate, toIsoDate } from './utils/attendance.util';

const TYPE_LABEL: Record<AttendanceNoticeType, string> = {
  REMINDER: 'Reminder',
  CONFIRMATION: 'Confirmation',
  ABSENT_ALERT: 'Absent alert'
};

interface NoticeRow {
  id: string;
  sentAt: string;
  aspirant: string;
  mobile: string;
  type: string;
  message: string;
}

/**
 * Notifications to aspirants about attendance: a confirmation each time a mark is recorded, a reminder before a session,
 * and an alert to those who were absent. The messages are written to this log; they go out as SMS once the gateway is
 * connected.
 */
@Component({
  selector: 'app-attendance-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, FormInputComponent, FormSectionComponent, IconComponent, TableComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
      <app-form-section class="block" title="Send Notifications">
        @if (message()) {
          <div class="mb-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between gap-2">
            <span class="font-medium">{{ message() }}</span>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="message.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5 items-end">
          <div class="lg:col-span-3">
            <app-form-input label="Session Date" type="date" [value]="date()" (valueChange)="date.set($event)"></app-form-input>
          </div>
          <div class="lg:col-span-9 flex flex-wrap items-center gap-2 pb-0.5">
            <button appButton variant="outline" size="sm" type="button" (click)="remind()" title="Remind every aspirant about this session">
              <app-icon name="clock" size="sm" />
              <span>Send Reminders</span>
            </button>
            <button appButton variant="outline" size="sm" type="button" (click)="alertAbsent()" title="Tell the aspirants who were absent on this day">
              <app-icon name="alert-triangle" size="sm" />
              <span>Notify Absentees</span>
            </button>
          </div>
        </div>
        <p class="text-[11px] text-slate-500 mt-2 mb-0">A confirmation goes to the aspirant each time an attendance mark is recorded or an offline mark is approved.</p>
      </app-form-section>

      <app-form-section class="block" [title]="'Sent Messages (' + rows().length + ')'">
        <app-table
          [columns]="columns"
          [data]="rows()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="messages"
          emptyMessage="No message has been sent for this batch yet."
          [customTemplates]="{ aspirant: aspirantTpl }"
        />
      </app-form-section>
    </div>

    <ng-template #aspirantTpl let-r>
      <div>
        <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ r.aspirant }}</div>
        <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ r.mobile }}</div>
      </div>
    </ng-template>
  `
})
export class AttendanceNotificationsComponent implements OnInit {
  private readonly attendance = inject(AttendanceService);
  private readonly batchService = inject(BatchService);

  readonly batchId = input.required<string>();

  protected readonly date = signal<string>('');
  protected readonly message = signal<string>('');

  protected readonly columns: TableColumn<NoticeRow>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'sentAt', label: 'Sent At', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-40' },
    { key: 'aspirant', label: 'Aspirant', type: 'custom', width: 'min-w-[160px]' },
    { key: 'type', label: 'Type', cellClass: 'whitespace-nowrap font-normal text-slate-800 text-[13px]', width: 'w-32' },
    { key: 'message', label: 'Message', cellClass: 'font-normal text-slate-800 text-[13px]', width: 'min-w-[360px]' }
  ];

  protected readonly rows = computed<NoticeRow[]>(() =>
    this.attendance.noticesOf(this.batchId()).map((notice: AttendanceNotice) => ({
      id: notice.id,
      sentAt: `${notice.sentAt.slice(0, 10)} ${notice.sentAt.slice(11, 16)}`,
      aspirant: notice.aspirantName,
      mobile: notice.mobile,
      type: TYPE_LABEL[notice.type],
      message: notice.message
    }))
  );

  ngOnInit(): void {
    const batch = this.batchService.getBatchById(this.batchId());
    this.date.set(batch ? defaultSessionDate(batch, toIsoDate(new Date())) : toIsoDate(new Date()));
  }

  protected remind(): void {
    const count = this.attendance.sendReminders(this.batchId(), this.date());
    this.message.set(`Reminder sent to ${count} ${count === 1 ? 'aspirant' : 'aspirants'} for ${this.date()}.`);
  }

  protected alertAbsent(): void {
    const count = this.attendance.sendAbsentAlerts(this.batchId(), this.date());
    this.message.set(count > 0 ? `Absent alert sent to ${count} ${count === 1 ? 'aspirant' : 'aspirants'} for ${this.date()}.` : `No aspirant was absent on ${this.date()}.`);
  }
}
