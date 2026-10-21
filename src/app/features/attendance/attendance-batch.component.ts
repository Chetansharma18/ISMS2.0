import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ButtonComponent, FilterTabsComponent, IconComponent, PageShellComponent } from '../../shared';
import { BatchService } from '../sdc/services/batch.service';
import { AttendanceService } from './services/attendance.service';
import { AttendanceAnalyticsComponent } from './attendance-analytics.component';
import { AttendanceApprovalsComponent } from './attendance-approvals.component';
import { AttendanceLiveComponent } from './attendance-live.component';
import { AttendanceNotificationsComponent } from './attendance-notifications.component';
import { AttendanceReportsComponent } from './attendance-reports.component';

type Tab = 'LIVE' | 'APPROVALS' | 'REPORTS' | 'ANALYTICS' | 'NOTIFICATIONS';

/**
 * Attendance of one batch, in the same page layout as the batch details: Back, the batch code with its course, and a tab
 * for each part of attendance - Live Attendance, Offline Approvals, Reports, Analytics and Notifications.
 */
@Component({
  selector: 'app-attendance-batch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    ButtonComponent,
    FilterTabsComponent,
    IconComponent,
    PageShellComponent,
    AttendanceAnalyticsComponent,
    AttendanceApprovalsComponent,
    AttendanceLiveComponent,
    AttendanceNotificationsComponent,
    AttendanceReportsComponent
  ],
  template: `
    <app-page-shell>
      @if (batch(); as b) {
        <div class="space-y-3">
          <div>
            <a appButton variant="outline" size="sm" routerLink="/attendance" title="Back to Attendance Management">
              <app-icon name="back" />
              <span>Back</span>
            </a>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 flex-wrap min-w-0">
              <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0 tabular-nums">{{ b.batchCode }}</h1>
              <span class="text-xs font-semibold text-slate-500">{{ b.courseName }}</span>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
            Attendance of the aspirants of {{ b.sdcName }} ({{ b.sdcCode }}), {{ b.startDate }} to {{ b.endDate }}, {{ b.startTime }} to {{ b.endTime }}.
            It is marked twice a day: at the start and at the end.
          </p>
        </div>

        <app-filter-tabs [options]="tabs()" [value]="tab()" (valueChange)="onTab($event)" />

        @switch (tab()) {
          @case ('LIVE') { <app-attendance-live [batchId]="b.id" /> }
          @case ('APPROVALS') { <app-attendance-approvals [batchId]="b.id" /> }
          @case ('REPORTS') { <app-attendance-reports [batchId]="b.id" /> }
          @case ('ANALYTICS') { <app-attendance-analytics [batchId]="b.id" /> }
          @case ('NOTIFICATIONS') { <app-attendance-notifications [batchId]="b.id" /> }
        }
      } @else {
        <div class="p-8 max-w-xl mx-auto text-center space-y-4 py-16">
          <h2 class="text-base font-bold text-slate-800">Batch Not Found</h2>
          <p class="text-xs text-slate-500">The batch could not be found.</p>
          <a appButton routerLink="/attendance">Back to Attendance Management</a>
        </div>
      }
    </app-page-shell>
  `
})
export class AttendanceBatchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly batchService = inject(BatchService);
  private readonly attendance = inject(AttendanceService);

  private readonly batchId = toSignal(this.route.paramMap.pipe(map(params => params.get('batchId') ?? '')), { initialValue: '' });
  protected readonly batch = computed(() => this.batchService.getBatchById(this.batchId()));
  protected readonly tab = signal<Tab>('LIVE');

  protected readonly tabs = computed(() => {
    const pending = this.attendance.marksOf(this.batchId()).filter(mark => mark.approval === 'PENDING').length;
    return [
      { id: 'LIVE', label: 'Live Attendance' },
      { id: 'APPROVALS', label: 'Offline Approvals', count: pending },
      { id: 'REPORTS', label: 'Reports' },
      { id: 'ANALYTICS', label: 'Analytics' },
      { id: 'NOTIFICATIONS', label: 'Notifications' }
    ];
  });

  protected onTab(id: string): void {
    this.tab.set(id as Tab);
  }
}
