import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HostelItem } from './batch-form.util';
import { ButtonComponent, IconComponent, InputDirective, TableColumn, TableComponent } from '../../../../shared';

// Default change detection: the parent pushes/splices hostelList in place.
// app-table is OnPush and only refreshes on a new array, so the grid is fed a shallow copy (`rows`) that is
// rebuilt after every add/remove. The row objects stay the parent's own, so ngModel still edits them in place.
@Component({
  selector: 'app-batch-hostel-table',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
        <div class="flex items-center gap-2" style="font-size: 13.5px !important; color: #0B3558 !important;">
          <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
          <h3 class="font-bold m-0" style="font-size: 13.5px !important; color: #0B3558 !important;">Hostel Details</h3>
          <span class="text-[11px] font-normal text-slate-500">(Residential facility, if any)</span>
        </div>

        <!-- Blue + Add Hostel Button -->
        <button
          appButton
          size="sm"
          type="button"
          (click)="onAdd()"
          title="Add Hostel"
        >
          <app-icon name="plus" size="sm" />
          <span>Add Hostel</span>
        </button>
      </div>

      <!-- Hostel Responsive Table -->
      <app-table
        [columns]="columns"
        [data]="rows()"
        [customTemplates]="{ hostelAddress: addressTpl, hostelCode: codeTpl, type: typeTpl, capacity: capacityTpl, action: actionTpl }"
      />

      <!-- Hostel Address -->
      <ng-template #addressTpl let-hostel let-i="index">
        <input
          appInput
          size="sm"
          type="text"
          [(ngModel)]="hostel.hostelAddress"
          [name]="'hostel_addr_' + i"
          placeholder="Plot / Campus Address"
          class="w-full"
        />
      </ng-template>

      <!-- Hostel Code -->
      <ng-template #codeTpl let-hostel let-i="index">
        <input
          appInput
          size="sm"
          type="text"
          [(ngModel)]="hostel.hostelCode"
          [name]="'hostel_code_' + i"
          placeholder="e.g. HST-001"
          class="w-full"
        />
      </ng-template>

      <!-- Type -->
      <ng-template #typeTpl let-hostel let-i="index">
        <select
          appInput
          size="sm"
          [(ngModel)]="hostel.type"
          [name]="'hostel_type_' + i"
          class="w-full"
        >
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
          <option value="Co-ed">Co-ed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </ng-template>

      <!-- Capacity -->
      <ng-template #capacityTpl let-hostel let-i="index">
        <input
          appInput
          size="sm"
          type="number"
          min="0"
          max="500"
          [(ngModel)]="hostel.capacity"
          [name]="'hostel_cap_' + i"
          placeholder="0"
          class="w-full"
        />
      </ng-template>

      <!-- Action: Remove -->
      <ng-template #actionTpl let-hostel let-i="index">
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="onRemove(i)"
          title="Remove Hostel"
          aria-label="Remove Hostel"
        >
          <app-icon name="trash" />
        </button>
      </ng-template>
    </div>
  `
})
export class BatchHostelTableComponent {
  /** Parent-owned rows; edited in place through ngModel. */
  readonly hostelList = input.required<HostelItem[]>();

  readonly addHostel = output<void>();
  readonly removeHostel = output<number>();

  /** Bumped after each add/remove so `rows` becomes a new array even though the parent mutates its own. */
  private readonly version = signal(0);

  /** Fresh copy handed to app-table; same row objects as the parent's list. */
  protected readonly rows = computed(() => {
    this.version();
    return [...this.hostelList()];
  });

  protected readonly columns: TableColumn<HostelItem>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'hostelAddress', label: 'Hostel Address', width: 'min-w-[260px]' },
    { key: 'hostelCode', label: 'Hostel Code', width: 'min-w-[140px]' },
    { key: 'type', label: 'Type', width: 'min-w-[140px]' },
    { key: 'capacity', label: 'Capacity', width: 'w-28' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-16' }
  ];

  protected onAdd(): void {
    this.addHostel.emit();
    this.version.update(v => v + 1);
  }

  protected onRemove(index: number): void {
    this.removeHostel.emit(index);
    this.version.update(v => v + 1);
  }
}
