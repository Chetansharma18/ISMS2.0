import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createFacultyRow } from './batch-detail.util';
import { ButtonComponent, IconComponent, InputDirective, TableColumn, TableComponent } from '../../../../shared';

/**
 * Editable faculty rows. Mutates the supplied array in place (it belongs to the parent edit model).
 * app-table is OnPush and only refreshes on a new array, so the grid is fed a shallow copy (`tableRows`)
 * that is rebuilt after every add/remove. The row objects are the parent's own, so ngModel edits them in place.
 */
@Component({
  selector: 'app-batch-faculty-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, TableComponent],
  host: { class: 'block' },
  template: `
    <!-- Faculty Details Editable Table -->
    <div class="space-y-2.5 pt-3 border-t border-slate-200">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <label class="block font-semibold text-slate-800 text-xs uppercase tracking-wider m-0">
          Faculty Details ({{ rows().length }} Trainers)
        </label>
        <button
          appButton
          size="sm"
          type="button"
          (click)="addFacultyRow()"
        >
          <span>+ Add Faculty</span>
        </button>
      </div>

      <app-table
        [columns]="columns"
        [data]="tableRows()"
        [customTemplates]="{ facultyName: nameTpl, trainerType: typeTpl, qualification: qualTpl, action: actionTpl }"
      />

      <ng-template #nameTpl let-fac>
        <input
          appInput
          size="sm"
          type="text"
          [(ngModel)]="fac.facultyName"
          placeholder="Faculty Name"
          class="w-full"
        />
      </ng-template>

      <ng-template #typeTpl let-fac>
        <select
          appInput
          size="sm"
          [(ngModel)]="fac.trainerType"
          class="w-full"
        >
          <option value="Primary Trainer">Primary Trainer</option>
          <option value="Assistant Trainer">Assistant Trainer</option>
          <option value="Domain Trainer">Domain Trainer</option>
          <option value="Master Trainer">Master Trainer</option>
        </select>
      </ng-template>

      <ng-template #qualTpl let-fac>
        <select
          appInput
          size="sm"
          [(ngModel)]="fac.qualification"
          class="w-full"
        >
          <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
          <option value="Post Graduate (M.A / M.Sc / M.Tech)">Post Graduate (M.A / M.Sc / M.Tech)</option>
          <option value="PhD">PhD</option>
        </select>
      </ng-template>

      <ng-template #actionTpl let-fac let-i="index">
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="removeFacultyRow(i)"
          [disabled]="rows().length <= 1"
          title="Remove Trainer"
          aria-label="Remove Trainer"
        >
          <app-icon name="close" size="xs" />
        </button>
      </ng-template>
    </div>
  `
})
export class BatchFacultyEditorComponent {
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
    { key: 'facultyName', label: 'Faculty Name *', width: 'min-w-50' },
    { key: 'trainerType', label: 'Trainer Type *', width: 'min-w-45' },
    { key: 'qualification', label: 'Qualification / Experience *', width: 'min-w-55' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-16' }
  ];

  addFacultyRow(): void {
    this.rows().push(createFacultyRow());
    this.version.update(v => v + 1);
  }

  removeFacultyRow(index: number): void {
    if (this.rows().length > 1) {
      this.rows().splice(index, 1);
      this.version.update(v => v + 1);
    }
  }
}
