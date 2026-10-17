import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FacultyItem } from './batch-form.util';
import { ButtonComponent, IconComponent, InputDirective, TableColumn, TableComponent } from '../../../../shared';

// Default change detection: the parent pushes/splices facultyList and rewrites facultyErrors in place.
// app-table is OnPush and only refreshes on a new array, so the grid is fed a shallow copy (`rows`) that is
// rebuilt after every add/remove. The row objects stay the parent's own, so ngModel still edits them in place.
@Component({
  selector: 'app-batch-faculty-table',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-2.5 pt-2 border-t border-slate-200">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full shrink-0"></span>
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
            Faculty Details
          </h3>
          <span class="text-[11px] text-slate-500">({{ facultyList().length }} trainer{{ facultyList().length > 1 ? 's' : '' }} assigned)</span>
        </div>

        <!-- Blue + Add Faculty Button -->
        <button
          appButton
          size="sm"
          type="button"
          (click)="onAdd()"
          title="Add Faculty Trainer"
        >
          <app-icon name="plus" size="sm" />
          <span>Add Faculty</span>
        </button>
      </div>

      <!-- Faculty Responsive Table -->
      <app-table
        [columns]="columns"
        [data]="rows()"
        [customTemplates]="{ facultyName: nameTpl, trainerType: typeTpl, qualification: qualTpl, action: actionTpl }"
      />

      <!-- Faculty Name -->
      <ng-template #nameTpl let-faculty let-i="index">
        <input
          appInput
          size="sm"
          type="text"
          [(ngModel)]="faculty.facultyName"
          [name]="'faculty_name_' + i"
          (input)="nameEdited.emit(i)"
          placeholder="e.g. Vikas Purohit"
          class="w-full"
          [invalid]="!!facultyErrors()[i]"
        />
        @if (facultyErrors()[i]) {
          <span class="text-[10.5px] text-red-600 font-medium block mt-0.5">Faculty Name is required</span>
        }
      </ng-template>

      <!-- Trainer Type -->
      <ng-template #typeTpl let-faculty let-i="index">
        <select
          appInput
          size="sm"
          [(ngModel)]="faculty.trainerType"
          [name]="'faculty_type_' + i"
          class="w-full"
        >
          <option value="Primary Trainer">Primary Trainer</option>
          <option value="Assistant Trainer">Assistant Trainer</option>
          <option value="Domain Trainer">Domain Trainer</option>
          <option value="Master Trainer">Master Trainer</option>
        </select>
      </ng-template>

      <!-- Qualification / Experience (Options: Graduate, Post Graduate, PhD) -->
      <ng-template #qualTpl let-faculty let-i="index">
        <select
          appInput
          size="sm"
          [(ngModel)]="faculty.qualification"
          [name]="'faculty_qual_' + i"
          class="w-full"
        >
          <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
          <option value="Post Graduate (M.A / M.Sc / M.Tech)">Post Graduate (M.A / M.Sc / M.Tech)</option>
          <option value="PhD">PhD</option>
        </select>
      </ng-template>

      <!-- Action: Remove -->
      <ng-template #actionTpl let-faculty let-i="index">
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="onRemove(i)"
          [disabled]="facultyList().length === 1"
          title="Remove Trainer"
          aria-label="Remove Trainer"
        >
          <app-icon name="trash" />
        </button>
      </ng-template>
    </div>
  `
})
export class BatchFacultyTableComponent {
  /** Parent-owned rows; edited in place through ngModel. */
  readonly facultyList = input.required<FacultyItem[]>();
  readonly facultyErrors = input<boolean[]>([]);

  readonly addFaculty = output<void>();
  readonly removeFaculty = output<number>();
  /** Emits the row index when its name is edited (parent clears the error flag). */
  readonly nameEdited = output<number>();

  /** Bumped after each add/remove so `rows` becomes a new array even though the parent mutates its own. */
  private readonly version = signal(0);

  /** Fresh copy handed to app-table; same row objects as the parent's list. */
  protected readonly rows = computed(() => {
    this.version();
    return [...this.facultyList()];
  });

  protected readonly columns: TableColumn<FacultyItem>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'facultyName', label: 'Faculty Name *', width: 'min-w-[200px]' },
    { key: 'trainerType', label: 'Trainer Type *', width: 'min-w-[180px]' },
    { key: 'qualification', label: 'Qualification / Experience *', width: 'min-w-[220px]' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-16' }
  ];

  protected onAdd(): void {
    this.addFaculty.emit();
    this.version.update(v => v + 1);
  }

  protected onRemove(index: number): void {
    this.removeFaculty.emit(index);
    this.version.update(v => v + 1);
  }
}
