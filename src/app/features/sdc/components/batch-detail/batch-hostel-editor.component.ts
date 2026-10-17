import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createHostelRow } from './batch-detail.util';
import { ButtonComponent, IconComponent, InputDirective, TableColumn, TableComponent } from '../../../../shared';

/**
 * Editable hostel rows. Mutates the supplied array in place (it belongs to the parent edit model).
 * app-table is OnPush and only refreshes on a new array, so the grid is fed a shallow copy (`tableRows`)
 * that is rebuilt after every add/remove. The row objects are the parent's own, so ngModel edits them in place.
 */
@Component({
  selector: 'app-batch-hostel-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, TableComponent],
  host: { class: 'block' },
  template: `
    <!-- Hostel Details Editable Table -->
    <div class="space-y-2.5 pt-3 border-t border-slate-200">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <label class="block font-semibold text-slate-800 text-xs uppercase tracking-wider m-0">
          Hostel Details (Residential facility configuration)
        </label>
        <button
          appButton
          size="sm"
          type="button"
          (click)="addHostelRow()"
        >
          <span>+ Add Hostel</span>
        </button>
      </div>

      <app-table
        [columns]="columns"
        [data]="tableRows()"
        [customTemplates]="{ hostelAddress: addressTpl, hostelCode: codeTpl, type: typeTpl, capacity: capacityTpl, action: actionTpl }"
      />

      <ng-template #addressTpl let-hostel>
        <input
          appInput
          size="sm"
          type="text"
          [(ngModel)]="hostel.hostelAddress"
          placeholder="Plot / Campus Address"
          class="w-full"
        />
      </ng-template>

      <ng-template #codeTpl let-hostel>
        <input
          appInput
          size="sm"
          type="text"
          [(ngModel)]="hostel.hostelCode"
          placeholder="HST-JP-001"
          class="w-full"
        />
      </ng-template>

      <ng-template #typeTpl let-hostel>
        <select
          appInput
          size="sm"
          [(ngModel)]="hostel.type"
          class="w-full"
        >
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
          <option value="Co-ed">Co-ed</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </ng-template>

      <ng-template #capacityTpl let-hostel>
        <input
          appInput
          size="sm"
          type="number"
          min="0"
          max="500"
          [(ngModel)]="hostel.capacity"
          class="w-full"
        />
      </ng-template>

      <ng-template #actionTpl let-hostel let-i="index">
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="removeHostelRow(i)"
          title="Remove Hostel"
          aria-label="Remove Hostel"
        >
          <app-icon name="close" size="xs" />
        </button>
      </ng-template>
    </div>
  `
})
export class BatchHostelEditorComponent {
  readonly rows = input.required<any[]>();

  /** Bumped after each add/remove so `tableRows` becomes a new array even though `rows` is mutated in place. */
  private readonly version = signal(0);

  /** Fresh copy handed to app-table; same row objects as `rows`. */
  protected readonly tableRows = computed(() => {
    this.version();
    return [...this.rows()];
  });

  protected readonly columns: TableColumn[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'hostelAddress', label: 'Hostel Address', width: 'min-w-65' },
    { key: 'hostelCode', label: 'Hostel Code', width: 'min-w-35' },
    { key: 'type', label: 'Type', width: 'min-w-35' },
    { key: 'capacity', label: 'Capacity', width: 'w-28' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-16' }
  ];

  addHostelRow(): void {
    this.rows().push(createHostelRow());
    this.version.update(v => v + 1);
  }

  removeHostelRow(index: number): void {
    this.rows().splice(index, 1);
    this.version.update(v => v + 1);
  }
}
