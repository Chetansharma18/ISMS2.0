import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import {
  ButtonComponent,
  FilterTabsComponent,
  FormInputComponent,
  FormSectionComponent,
  IconComponent,
  TableColumn,
  TableComponent
} from '../../shared';
import { BatchService } from '../sdc/services/batch.service';
import type { AttendanceMark, AttendanceSlot, DayStatus } from './models/attendance.model';
import { AttendanceService } from './services/attendance.service';
import {
  DAY_STATUS_LABEL,
  dayStatus,
  dayStatusClass,
  defaultSessionDate,
  liveMark,
  marksOfDay,
  sessionDates,
  summariseDay,
  timeOf,
  toIsoDate
} from './utils/attendance.util';
import { AttendanceDeviceModalComponent } from './attendance-device-modal.component';
import { AttendanceOfflineModalComponent } from './attendance-offline-modal.component';

/** One aspirant of the roster for the chosen day. */
interface LiveRow {
  id: string;
  name: string;
  /** Time of the mark of each slot, and how it was made, or nothing. */
  startTime: string;
  startNote: string;
  endTime: string;
  endNote: string;
  status: DayStatus;
  /** Whether the chosen slot can still be marked for this aspirant. */
  open: boolean;
}

/** How a mark was made, in words. */
function noteOf(mark: AttendanceMark | undefined): string {
  if (!mark) return '';
  if (mark.mode === 'BIOMETRIC') return 'Biometric';
  const state = mark.approval === 'APPROVED' ? 'Approved' : mark.approval === 'PENDING' ? 'Pending approval' : 'Rejected';
  return `Offline • ${state}`;
}

/**
 * Live Attendance of a batch: the biometric device linked to it, and the roster for a session day with the start and end
 * marks of each aspirant, filling in as they punch on the device. When the device cannot be used the Attender User marks
 * aspirants offline; those marks wait for approval.
 */
@Component({
  selector: 'app-attendance-live',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [
    AttendanceDeviceModalComponent,
    AttendanceOfflineModalComponent,
    ButtonComponent,
    FilterTabsComponent,
    FormInputComponent,
    FormSectionComponent,
    IconComponent,
    TableComponent
  ],
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
      <!-- The DoITC device of the batch -->
      <app-form-section class="block" title="Biometric Device">
        @if (device(); as d) {
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1">
              <div><span class="text-slate-500 block text-[11px]">Serial Number</span><span class="tabular-nums text-slate-800 text-[13px]">{{ d.serialNo }}</span></div>
              <div><span class="text-slate-500 block text-[11px]">Type</span><span class="text-slate-800 text-[13px]">{{ d.type }}</span></div>
              <div><span class="text-slate-500 block text-[11px]">Linked By</span><span class="text-slate-800 text-[13px]">{{ d.linkedBy }}</span></div>
              <div><span class="text-slate-500 block text-[11px]">Linked On</span><span class="tabular-nums text-slate-800 text-[13px]">{{ d.linkedAt.slice(0, 10) }}</span></div>
            </div>
            <button appButton variant="outline" size="sm" type="button" (click)="unlink()" title="Unlink this device from the batch">
              <app-icon name="close" size="sm" />
              <span>Unlink Device</span>
            </button>
          </div>
        } @else {
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
            <p class="m-0 text-amber-700">No device is linked to this batch. Link the DoITC biometric device to record punches; until then, attendance can only be marked offline.</p>
            <button appButton size="sm" type="button" (click)="deviceModalOpen.set(true)">
              <app-icon name="plus" size="sm" />
              <span>Link Device</span>
            </button>
          </div>
        }
      </app-form-section>

      <!-- Session day and slot -->
      <app-form-section class="block" title="Session Attendance">
        @if (message()) {
          <div class="mb-3 p-3 rounded-lg border text-xs flex items-center justify-between gap-2" [class]="messageIsError() ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'">
            <span class="font-medium">{{ message() }}</span>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="message.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5 items-end">
          <div class="lg:col-span-3">
            <app-form-input label="Session Date" type="date" [value]="date()" (valueChange)="onDate($event)"></app-form-input>
          </div>
          <div class="lg:col-span-5 pb-0.5">
            <app-filter-tabs [options]="slotTabs()" [value]="slot()" (valueChange)="onSlot($event)" />
          </div>
          <div class="lg:col-span-4 text-xs text-slate-600 pb-1.5 tabular-nums">
            Present {{ summary().present }} • Partial {{ summary().partial }} • Absent {{ summary().absent }} • Pending {{ summary().pending }}
          </div>
        </div>

        @if (notice()) {
          <p class="m-0 mt-3 text-xs text-amber-700">{{ notice() }}</p>
        }

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
            <input
              type="checkbox"
              [checked]="allSelected()"
              [disabled]="!canMark() || openRows().length === 0"
              (change)="toggleAll()"
              class="w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer"
            />
            <span>Select all not yet marked</span>
          </label>
          <span class="text-slate-600 tabular-nums">{{ selectedCount() }} selected</span>
          <div class="flex items-center gap-2">
            <button
              appButton
              variant="outline"
              size="sm"
              type="button"
              [disabled]="selectedCount() === 0 || !device()"
              (click)="simulatePunches()"
              [title]="device() ? 'Stands in for the aspirants punching on the linked device' : 'Link the device first'"
            >
              <app-icon name="identification" size="sm" />
              <span>Simulate Punch</span>
            </button>
            <button appButton size="sm" type="button" [disabled]="selectedCount() === 0" (click)="offlineOpen.set(true)" title="Mark the selected aspirants by hand">
              <app-icon name="edit" size="sm" />
              <span>Mark Offline{{ selectedCount() ? ' (' + selectedCount() + ')' : '' }}</span>
            </button>
          </div>
        </div>

        <div class="mt-3">
          <app-table
            [columns]="columns"
            [data]="rows()"
            [pagination]="true"
            [pageSize]="10"
            itemUnit="aspirants"
            emptyMessage="No aspirants are registered in this batch."
            [customTemplates]="{ pick: pickTpl, aspirant: aspirantTpl, start: startTpl, end: endTpl, status: statusTpl }"
          />
        </div>
      </app-form-section>
    </div>

    <ng-template #pickTpl let-r>
      <input
        type="checkbox"
        [checked]="isSelected(r.id)"
        [disabled]="!r.open || !canMark()"
        (change)="toggle(r.id)"
        [attr.aria-label]="'Select ' + r.name"
        class="w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer"
      />
    </ng-template>
    <ng-template #aspirantTpl let-r>
      <div>
        <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ r.name }}</div>
        <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ r.id }}</div>
      </div>
    </ng-template>
    <ng-template #startTpl let-r>
      <div>
        <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ r.startTime || '—' }}</div>
        @if (r.startNote) { <div class="text-[11px] text-secondary leading-tight mt-px">{{ r.startNote }}</div> }
      </div>
    </ng-template>
    <ng-template #endTpl let-r>
      <div>
        <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ r.endTime || '—' }}</div>
        @if (r.endNote) { <div class="text-[11px] text-secondary leading-tight mt-px">{{ r.endNote }}</div> }
      </div>
    </ng-template>
    <ng-template #statusTpl let-r>
      <span class="whitespace-nowrap font-normal text-[13px]" [class]="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
    </ng-template>

    @if (deviceModalOpen()) {
      <app-attendance-device-modal
        [batchCode]="batch()?.batchCode ?? ''"
        [error]="deviceError()"
        (link)="link($event)"
        (closed)="closeDeviceModal()"
      />
    }

    @if (offlineOpen()) {
      <app-attendance-offline-modal
        [count]="selectedCount()"
        [date]="date()"
        [slotLabel]="slot() === 'START' ? 'Start of day' : 'End of day'"
        (confirmed)="markOffline($event)"
        (closed)="offlineOpen.set(false)"
      />
    }
  `
})
export class AttendanceLiveComponent implements OnInit {
  private readonly batchService = inject(BatchService);
  private readonly attendance = inject(AttendanceService);

  readonly batchId = input.required<string>();

  protected readonly batch = computed(() => this.batchService.getBatchById(this.batchId()));
  protected readonly device = computed(() => this.attendance.deviceOf(this.batchId()));
  private readonly today = toIsoDate(new Date());

  protected readonly date = signal<string>('');
  protected readonly slot = signal<AttendanceSlot>('START');
  private readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly deviceModalOpen = signal<boolean>(false);
  protected readonly deviceError = signal<string>('');
  protected readonly offlineOpen = signal<boolean>(false);
  protected readonly message = signal<string>('');
  protected readonly messageIsError = signal<boolean>(false);

  protected readonly slotTabs = computed(() => {
    const batch = this.batch();
    return [
      { id: 'START', label: `Start of Day${batch ? ' • ' + batch.startTime : ''}` },
      { id: 'END', label: `End of Day${batch ? ' • ' + batch.endTime : ''}` }
    ];
  });

  protected readonly columns: TableColumn<LiveRow>[] = [
    { key: 'pick', label: '', type: 'custom', align: 'center', width: 'w-12' },
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'aspirant', label: 'Aspirant', type: 'custom', width: 'min-w-[170px]' },
    { key: 'start', label: 'Start of Day', type: 'custom', width: 'min-w-[150px]' },
    { key: 'end', label: 'End of Day', type: 'custom', width: 'min-w-[150px]' },
    { key: 'status', label: 'Day Status', type: 'custom', width: 'min-w-[140px]' }
  ];

  /** The day is a session day of the batch, and not in the future. */
  protected readonly canMark = computed(() => {
    const batch = this.batch();
    return !!batch && sessionDates(batch).includes(this.date()) && this.date() <= this.today;
  });

  protected readonly notice = computed(() => {
    const batch = this.batch();
    if (!batch || !this.date()) return '';
    if (!sessionDates(batch).includes(this.date())) return 'There is no session on this date (outside the batch dates, or the weekly off).';
    if (this.date() > this.today) return 'This session has not started. Attendance can be marked for today and earlier days only.';
    return '';
  });

  protected readonly rows = computed<LiveRow[]>(() => {
    const index = this.attendance.indexOf(this.batchId());
    const date = this.date();
    const slot = this.slot();
    return this.attendance.rosterOf(this.batchId()).map(a => {
      const marks = marksOfDay(index, a.id, date);
      const start = liveMark(marks, 'START');
      const end = liveMark(marks, 'END');
      return {
        id: a.id,
        name: a.aspirantName,
        startTime: start ? timeOf(start.at) : '',
        startNote: noteOf(start),
        endTime: end ? timeOf(end.at) : '',
        endNote: noteOf(end),
        status: dayStatus(marks),
        open: !liveMark(marks, slot)
      };
    });
  });

  protected readonly openRows = computed(() => this.rows().filter(row => row.open));

  protected readonly summary = computed(() =>
    summariseDay(
      this.attendance.indexOf(this.batchId()),
      this.attendance.rosterOf(this.batchId()).map(a => a.id),
      this.date()
    )
  );

  protected readonly selectedCount = computed(() => this.openRows().filter(row => this.selected().has(row.id)).length);
  protected readonly allSelected = computed(() => this.openRows().length > 0 && this.selectedCount() === this.openRows().length);

  ngOnInit(): void {
    const batch = this.batch();
    this.date.set(batch ? defaultSessionDate(batch, this.today) : this.today);
  }

  protected statusLabel(status: DayStatus): string {
    return DAY_STATUS_LABEL[status];
  }

  protected statusClass(status: DayStatus): string {
    return dayStatusClass(status);
  }

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected onDate(value: string): void {
    this.date.set(value);
    this.selected.set(new Set());
  }

  protected onSlot(id: string): void {
    this.slot.set(id === 'END' ? 'END' : 'START');
    this.selected.set(new Set());
  }

  protected toggle(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.openRows().map(row => row.id)));
  }

  private show(text: string, isError = false): void {
    this.messageIsError.set(isError);
    this.message.set(text);
  }

  private pickedIds(): string[] {
    return this.openRows().filter(row => this.selected().has(row.id)).map(row => row.id);
  }

  /** The device is simulated: this is what it sends when the selected aspirants punch. */
  protected simulatePunches(): void {
    const ids = this.pickedIds();
    const done = ids.filter(id => this.attendance.punch(this.batchId(), id, this.date(), this.slot())).length;
    this.selected.set(new Set());
    this.show(`${done} ${done === 1 ? 'punch' : 'punches'} recorded from the device.`, done === 0);
  }

  protected markOffline(reason: string): void {
    const attender = this.batch()?.attender?.name ?? 'Attender User';
    const count = this.attendance.markOffline(this.batchId(), this.pickedIds(), this.date(), this.slot(), reason, attender);
    this.offlineOpen.set(false);
    this.selected.set(new Set());
    this.show(`${count} ${count === 1 ? 'aspirant' : 'aspirants'} marked offline. They count after approval in the Offline Approvals tab.`);
  }

  protected link(serial: string): void {
    const attender = this.batch()?.attender?.name ?? 'Attender User';
    const error = this.attendance.linkDevice(this.batchId(), serial, attender);
    this.deviceError.set(error);
    if (!error) {
      this.deviceModalOpen.set(false);
      this.show(`Device ${serial.trim().toUpperCase()} is linked to this batch.`);
    }
  }

  protected closeDeviceModal(): void {
    this.deviceModalOpen.set(false);
    this.deviceError.set('');
  }

  protected unlink(): void {
    if (!confirm('Unlink the device from this batch? Punches will not be recorded until a device is linked again.')) return;
    this.attendance.unlinkDevice(this.batchId());
    this.show('Device unlinked.');
  }
}
