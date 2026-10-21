import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BarChartComponent, BarChartItem, FormSectionComponent } from '../../shared';
import { BatchService } from '../sdc/services/batch.service';
import { AttendanceService } from './services/attendance.service';
import {
  MIN_ATTENDANCE_PERCENT,
  attendancePercent,
  countsAsMarked,
  heldSessionDates,
  isLowAttendance,
  summariseAspirant,
  summariseDay,
  toIsoDate
} from './utils/attendance.util';

/** The number of latest sessions drawn in the trend. */
const TREND_SESSIONS = 14;

/** Shows a day as "05 Oct" under a bar. */
function shortDate(iso: string): string {
  const [, month, day] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[Number(month) - 1] ?? ''}`;
}

/**
 * Attendance Analytics: how attendance has gone over the latest sessions, how many marks came from the device and how
 * many were made by hand, and the aspirants who are below the minimum attendance.
 */
@Component({
  selector: 'app-attendance-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [BarChartComponent, FormSectionComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
      <app-form-section class="block" title="At a Glance">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          @for (card of cards(); track card.label) {
            <div class="rounded-lg border border-slate-200 px-4 py-3">
              <div class="text-[11px] text-secondary">{{ card.label }}</div>
              <div class="text-xl font-bold tabular-nums mt-0.5" [class]="card.className">{{ card.value }}</div>
              <div class="text-[11px] text-secondary mt-0.5">{{ card.note }}</div>
            </div>
          }
        </div>
      </app-form-section>

      <app-form-section class="block" [title]="'Attendance Trend (latest ' + trend().length + ' sessions)'">
        <app-bar-chart [items]="trend()" unit="%" orientation="vertical" [height]="190" emptyMessage="No session has been held yet." />
        <p class="text-[11px] text-slate-500 mt-2 mb-0">Amber bars are sessions below {{ minPercent }}%. A partial day counts as half a day.</p>
      </app-form-section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-form-section class="block" title="How Attendance Was Marked">
          <app-bar-chart [items]="modeSplit()" unit="%" orientation="horizontal" emptyMessage="No attendance has been marked yet." />
        </app-form-section>

        <app-form-section class="block" [title]="'Below ' + minPercent + '% (' + lowCount() + ')'">
          <app-bar-chart [items]="lowAspirants()" unit="%" orientation="horizontal" emptyMessage="Every aspirant is at or above the minimum." />
        </app-form-section>
      </div>
    </div>
  `
})
export class AttendanceAnalyticsComponent {
  private readonly attendance = inject(AttendanceService);
  private readonly batchService = inject(BatchService);

  readonly batchId = input.required<string>();

  protected readonly minPercent = MIN_ATTENDANCE_PERCENT;
  private readonly today = toIsoDate(new Date());

  private readonly batch = computed(() => this.batchService.getBatchById(this.batchId()));
  private readonly roster = computed(() => this.attendance.rosterOf(this.batchId()));
  private readonly held = computed(() => {
    const batch = this.batch();
    return batch ? heldSessionDates(batch, this.today) : [];
  });

  private readonly aspirantSummaries = computed(() => {
    const index = this.attendance.indexOf(this.batchId());
    return this.roster().map(a => ({ name: a.aspirantName, ...summariseAspirant(index, a.id, this.held()) }));
  });

  protected readonly overall = computed(() => {
    const all = this.aspirantSummaries();
    const present = all.reduce((sum, s) => sum + s.present, 0);
    const partial = all.reduce((sum, s) => sum + s.partial, 0);
    return attendancePercent(present, partial, all.length * this.held().length);
  });

  protected readonly lowCount = computed(() => this.aspirantSummaries().filter(s => isLowAttendance(s.percent)).length);

  private readonly marks = computed(() => this.attendance.marksOf(this.batchId()));

  protected readonly cards = computed(() => {
    const counted = this.marks().filter(countsAsMarked);
    const biometric = counted.filter(mark => mark.mode === 'BIOMETRIC').length;
    const share = counted.length > 0 ? Math.round((biometric / counted.length) * 1000) / 10 : 0;
    const roster = this.roster().length;
    return [
      {
        label: 'Average Attendance',
        value: this.held().length > 0 ? `${this.overall()}%` : '—',
        note: `${roster} aspirants`,
        className: isLowAttendance(this.overall()) && this.held().length > 0 ? 'text-red-600' : 'text-emerald-700'
      },
      { label: 'Sessions Held', value: String(this.held().length), note: 'up to today', className: 'text-slate-800' },
      {
        label: `Below ${MIN_ATTENDANCE_PERCENT}%`,
        value: String(this.lowCount()),
        note: this.lowCount() === 1 ? 'aspirant' : 'aspirants',
        className: this.lowCount() > 0 ? 'text-red-600' : 'text-slate-800'
      },
      { label: 'Marked on Device', value: counted.length > 0 ? `${share}%` : '—', note: 'of the marks that count', className: 'text-slate-800' }
    ];
  });

  protected readonly trend = computed<BarChartItem[]>(() => {
    const index = this.attendance.indexOf(this.batchId());
    const ids = this.roster().map(a => a.id);
    return this.held()
      .slice(-TREND_SESSIONS)
      .map(date => {
        const percent = summariseDay(index, ids, date).percent;
        return { label: shortDate(date), value: percent, tone: isLowAttendance(percent) ? ('warn' as const) : ('default' as const) };
      });
  });

  protected readonly modeSplit = computed<BarChartItem[]>(() => {
    const marks = this.marks();
    const total = marks.length;
    if (total === 0) return [];
    const share = (count: number) => Math.round((count / total) * 1000) / 10;
    const biometric = marks.filter(mark => mark.mode === 'BIOMETRIC').length;
    const approved = marks.filter(mark => mark.mode === 'OFFLINE' && mark.approval === 'APPROVED').length;
    const pending = marks.filter(mark => mark.approval === 'PENDING').length;
    const rejected = marks.filter(mark => mark.approval === 'REJECTED').length;
    return [
      { label: 'Biometric (device)', value: share(biometric), hint: `${biometric} marks` },
      { label: 'Offline, approved', value: share(approved), tone: 'warn', hint: `${approved} marks` },
      { label: 'Offline, pending', value: share(pending), tone: 'warn', hint: `${pending} marks` },
      { label: 'Offline, rejected', value: share(rejected), tone: 'bad', hint: `${rejected} marks` }
    ];
  });

  protected readonly lowAspirants = computed<BarChartItem[]>(() =>
    this.aspirantSummaries()
      .filter(s => isLowAttendance(s.percent))
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 10)
      .map(s => ({ label: s.name, value: s.percent, tone: 'bad' as const }))
  );
}
