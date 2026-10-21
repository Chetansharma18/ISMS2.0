import { Component, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, filter, map, switchMap } from 'rxjs';
import { FacultyItem } from './batch-form.util';
import { SsoDirectoryService } from '../../services/sso-directory.service';
import { ButtonComponent, IconComponent, InputDirective, TableColumn, TableComponent } from '../../../../shared';

/** An SSO ID shorter than this is not looked up yet. */
const MIN_SSO_ID_LENGTH = 4;

type LookupState = 'loading' | 'notFound';

// Default change detection: the parent pushes/splices facultyList and rewrites facultyErrors in place.
// app-table is OnPush and only refreshes on a new array, so the grid is fed a shallow copy (`rows`) that is
// rebuilt after every add/remove and every SSO answer. The row objects stay the parent's own, so ngModel still
// edits them in place.
@Component({
  selector: 'app-batch-faculty-table',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
        <div class="flex items-center gap-2" style="font-size: 13.5px !important; color: #0B3558 !important;">
          <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
          <h3 class="font-bold m-0" style="font-size: 13.5px !important; color: #0B3558 !important;">Faculty Details</h3>
          <span class="text-[11px] font-normal text-slate-500">({{ facultyList().length }} trainer{{ facultyList().length > 1 ? 's' : '' }} added)</span>
        </div>

        <button appButton size="sm" type="button" (click)="onAdd()" title="Add Faculty Trainer">
          <app-icon name="plus" size="sm" />
          <span>Add Faculty</span>
        </button>
      </div>

      <p class="text-[11px] text-slate-500 m-0">Enter the SSO ID of each trainer. The name is fetched from SSO.</p>

      <app-table
        [columns]="columns"
        [data]="rows()"
        [customTemplates]="{ ssoId: ssoTpl, facultyName: nameTpl, trainerType: typeTpl, qualification: qualTpl, action: actionTpl }"
      />

      <!-- SSO ID -->
      <ng-template #ssoTpl let-faculty let-i="index">
        <input
          appInput
          size="sm"
          type="text"
          autocomplete="off"
          [ngModel]="faculty.ssoId"
          (ngModelChange)="onSsoInput(faculty, $event)"
          [name]="'faculty_sso_' + i"
          placeholder="e.g. FACULTY1"
          class="w-full"
          [invalid]="!!facultyErrors()[i]"
        />
      </ng-template>

      <!-- Name fetched from SSO -->
      <ng-template #nameTpl let-faculty let-i="index">
        @if (faculty.facultyName) {
          <span class="font-medium text-slate-800">{{ faculty.facultyName }}</span>
        } @else if (stateOf(faculty) === 'loading') {
          <span class="text-slate-500">Fetching from SSO...</span>
        } @else if (stateOf(faculty) === 'notFound') {
          <span class="text-[11px] text-red-600 font-medium">No user found in SSO for this ID</span>
        } @else if (facultyErrors()[i]) {
          <span class="text-[11px] text-red-600 font-medium">Enter a valid SSO ID</span>
        } @else {
          <span class="text-muted">—</span>
        }
      </ng-template>

      <!-- Trainer Type -->
      <ng-template #typeTpl let-faculty let-i="index">
        <select appInput size="sm" [(ngModel)]="faculty.trainerType" [name]="'faculty_type_' + i" class="w-full">
          <option value="Primary Trainer">Primary Trainer</option>
          <option value="Assistant Trainer">Assistant Trainer</option>
          <option value="Domain Trainer">Domain Trainer</option>
          <option value="Master Trainer">Master Trainer</option>
        </select>
      </ng-template>

      <!-- Qualification / Experience (Options: Graduate, Post Graduate, PhD) -->
      <ng-template #qualTpl let-faculty let-i="index">
        <select appInput size="sm" [(ngModel)]="faculty.qualification" [name]="'faculty_qual_' + i" class="w-full">
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
  private readonly directory = inject(SsoDirectoryService);

  /** Parent-owned rows; edited in place through ngModel. */
  readonly facultyList = input.required<FacultyItem[]>();
  readonly facultyErrors = input<boolean[]>([]);

  readonly addFaculty = output<void>();
  readonly removeFaculty = output<number>();
  /** Emits the row index when its SSO ID is edited (parent clears the error flag). */
  readonly nameEdited = output<number>();

  /** Bumped after each add/remove/answer so `rows` becomes a new array even though the parent mutates its own. */
  private readonly version = signal(0);

  /** Lookup state of each row while it waits for or failed the SSO. */
  private readonly states = new WeakMap<FacultyItem, LookupState>();

  private readonly typed = new Subject<FacultyItem>();

  /** Fresh copy handed to app-table; same row objects as the parent's list. */
  protected readonly rows = computed(() => {
    this.version();
    return [...this.facultyList()];
  });

  protected readonly columns: TableColumn<FacultyItem>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'ssoId', label: 'SSO ID *', width: 'min-w-[170px]' },
    { key: 'facultyName', label: 'Faculty Name (from SSO)', width: 'min-w-[190px]' },
    { key: 'trainerType', label: 'Trainer Type *', width: 'min-w-[170px]' },
    { key: 'qualification', label: 'Qualification / Experience *', width: 'min-w-[220px]' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-16' }
  ];

  constructor() {
    this.typed
      .pipe(
        debounceTime(300),
        filter(row => row.ssoId.trim().length >= MIN_SSO_ID_LENGTH),
        switchMap(row => this.directory.lookup(row.ssoId).pipe(map(found => ({ row, id: row.ssoId, found })))),
        takeUntilDestroyed()
      )
      .subscribe(({ row, id, found }) => {
        // A late answer for an ID that is no longer in the box is ignored.
        if (id !== row.ssoId) return;
        row.facultyName = found?.name ?? '';
        if (found) this.states.delete(row);
        else this.states.set(row, 'notFound');
        this.version.update(v => v + 1);
      });
  }

  protected stateOf(row: FacultyItem): LookupState | undefined {
    return this.states.get(row);
  }

  /** The name belongs to the old SSO ID, so it is cleared until SSO answers for the new one. */
  protected onSsoInput(row: FacultyItem, ssoId: string): void {
    row.ssoId = ssoId;
    row.facultyName = '';
    this.states.delete(row);
    if (ssoId.trim().length >= MIN_SSO_ID_LENGTH) this.states.set(row, 'loading');
    this.nameEdited.emit(this.facultyList().indexOf(row));
    this.typed.next(row);
    this.version.update(v => v + 1);
  }

  protected onAdd(): void {
    this.addFaculty.emit();
    this.version.update(v => v + 1);
  }

  protected onRemove(index: number): void {
    this.removeFaculty.emit(index);
    this.version.update(v => v + 1);
  }
}
