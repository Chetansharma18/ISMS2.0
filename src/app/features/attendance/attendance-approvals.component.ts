import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  ActionModalComponent,
  ButtonComponent,
  FormInputComponent,
  FormSectionComponent,
  IconComponent,
  TableColumn,
  TableComponent
} from '../../shared';
import { BatchService } from '../sdc/services/batch.service';
import { AttendanceService } from './services/attendance.service';
import { timeOf } from './utils/attendance.util';

/** One offline mark waiting for the Attender User. */
interface PendingRow {
  id: string;
  aspirant: string;
  aspirantId: string;
  date: string;
  slot: string;
  reason: string;
  markedBy: string;
  markedAt: string;
}

/**
 * Offline Approvals: the marks made by hand while the device could not be used. The Attender User approves them, which
 * makes them count, or rejects them with a remark.
 */
@Component({
  selector: 'app-attendance-approvals',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ActionModalComponent, ButtonComponent, FormInputComponent, FormSectionComponent, IconComponent, TableComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-4 font-sans">
      <app-form-section class="block" [title]="'Offline Marks Waiting for Approval (' + rows().length + ')'">
        @if (message()) {
          <div class="mb-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between gap-2">
            <span class="font-medium">{{ message() }}</span>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="message.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
            <input
              type="checkbox"
              [checked]="allSelected()"
              [disabled]="rows().length === 0"
              (change)="toggleAll()"
              class="w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer"
            />
            <span>Select all</span>
          </label>
          <span class="text-slate-600 tabular-nums">{{ selectedCount() }} selected</span>
          <div class="flex items-center gap-2">
            <button appButton variant="danger" size="sm" type="button" [disabled]="selectedCount() === 0" (click)="rejecting.set(true)">
              <app-icon name="close" size="sm" />
              <span>Reject Selected</span>
            </button>
            <button appButton size="sm" type="button" [disabled]="selectedCount() === 0" (click)="approve()">
              <app-icon name="check" size="sm" />
              <span>Approve Selected{{ selectedCount() ? ' (' + selectedCount() + ')' : '' }}</span>
            </button>
          </div>
        </div>

        <div class="mt-3">
          <app-table
            [columns]="columns"
            [data]="rows()"
            [pagination]="true"
            [pageSize]="10"
            itemUnit="marks"
            emptyMessage="No offline marks are waiting for approval."
            [customTemplates]="{ pick: pickTpl, aspirant: aspirantTpl }"
          />
        </div>
      </app-form-section>
    </div>

    <ng-template #pickTpl let-r>
      <input
        type="checkbox"
        [checked]="selected().has(r.id)"
        (change)="toggle(r.id)"
        [attr.aria-label]="'Select ' + r.aspirant"
        class="w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer"
      />
    </ng-template>
    <ng-template #aspirantTpl let-r>
      <div>
        <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ r.aspirant }}</div>
        <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ r.aspirantId }}</div>
      </div>
    </ng-template>

    <app-action-modal
      [isOpen]="rejecting()"
      title="Reject Offline Marks"
      accentBarClass="bg-primary"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      maxWidthClass="max-w-lg"
      primaryLabel="Reject"
      secondaryLabel="Cancel"
      (primaryAction)="reject()"
      (secondaryAction)="closeReject()"
      (close)="closeReject()"
    >
      <div class="mt-4 space-y-3 text-xs text-slate-700">
        <p class="m-0">The {{ selectedCount() }} selected {{ selectedCount() === 1 ? 'mark does' : 'marks do' }} not count. Say why.</p>
        <app-form-input
          label="Remarks"
          placeholder="Why the marks are rejected"
          [required]="true"
          [maxLength]="200"
          [value]="remarks()"
          (valueChange)="remarks.set($event)"
          [error]="remarkError()"
        ></app-form-input>
      </div>
    </app-action-modal>
  `
})
export class AttendanceApprovalsComponent {
  private readonly attendance = inject(AttendanceService);
  private readonly batchService = inject(BatchService);

  readonly batchId = input.required<string>();

  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly rejecting = signal<boolean>(false);
  protected readonly remarks = signal<string>('');
  protected readonly remarkError = signal<string>('');
  protected readonly message = signal<string>('');

  protected readonly columns: TableColumn<PendingRow>[] = [
    { key: 'pick', label: '', type: 'custom', align: 'center', width: 'w-12' },
    { key: 'aspirant', label: 'Aspirant', type: 'custom', width: 'min-w-[170px]' },
    { key: 'date', label: 'Date', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-28' },
    { key: 'slot', label: 'Mark', cellClass: 'whitespace-nowrap font-normal text-slate-800 text-[13px]', width: 'w-32' },
    { key: 'reason', label: 'Reason', cellClass: 'font-normal text-slate-800 text-[13px]', width: 'min-w-[220px]' },
    { key: 'markedBy', label: 'Marked By', cellClass: 'font-normal text-slate-800 text-[13px]', width: 'min-w-[120px]' },
    { key: 'markedAt', label: 'Marked At', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-28' }
  ];

  protected readonly rows = computed<PendingRow[]>(() => {
    const names = new Map(this.attendance.rosterOf(this.batchId()).map(a => [a.id, a.aspirantName]));
    return this.attendance
      .marksOf(this.batchId())
      .filter(mark => mark.approval === 'PENDING')
      .sort((a, b) => b.date.localeCompare(a.date) || a.aspirantId.localeCompare(b.aspirantId) || a.slot.localeCompare(b.slot))
      .map(mark => ({
        id: mark.id,
        aspirant: names.get(mark.aspirantId) ?? mark.aspirantId,
        aspirantId: mark.aspirantId,
        date: mark.date,
        slot: mark.slot === 'START' ? 'Start of day' : 'End of day',
        reason: mark.reason ?? '—',
        markedBy: mark.markedBy,
        markedAt: timeOf(mark.at)
      }));
  });

  protected readonly selectedCount = computed(() => this.rows().filter(row => this.selected().has(row.id)).length);
  protected readonly allSelected = computed(() => this.rows().length > 0 && this.selectedCount() === this.rows().length);

  /** The Attender User of the batch decides. */
  private officer(): string {
    return this.batchService.getBatchById(this.batchId())?.attender?.name ?? 'Attender User';
  }

  private pickedIds(): string[] {
    return this.rows().filter(row => this.selected().has(row.id)).map(row => row.id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.rows().map(row => row.id)));
  }

  protected approve(): void {
    const count = this.attendance.decide(this.pickedIds(), 'APPROVED', '', this.officer());
    this.selected.set(new Set());
    this.message.set(`${count} offline ${count === 1 ? 'mark' : 'marks'} approved. They now count in the attendance.`);
  }

  protected reject(): void {
    if (!this.remarks().trim()) {
      this.remarkError.set('Enter the remarks.');
      return;
    }
    const count = this.attendance.decide(this.pickedIds(), 'REJECTED', this.remarks().trim(), this.officer());
    this.closeReject();
    this.selected.set(new Set());
    this.message.set(`${count} offline ${count === 1 ? 'mark' : 'marks'} rejected.`);
  }

  protected closeReject(): void {
    this.rejecting.set(false);
    this.remarks.set('');
    this.remarkError.set('');
  }
}
