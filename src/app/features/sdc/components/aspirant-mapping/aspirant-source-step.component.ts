import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActionModalComponent, ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../shared';
import type {
  AspirantSourceProfile,
  EmploymentDeptRecord,
  ExpressedInterestApplicant
} from '../../../../core/mock/data/aspirant-sources.mock';
import { BatchRecord } from '../../models/batch.model';
import { AspirantSourceService } from '../../services/aspirant-source.service';

/** The three ways a training partner can register an aspirant. */
export type AspirantSourceMethod = 'EXPRESSED_INTEREST' | 'EMPLOYMENT_DEPT' | 'MANUAL';

/** The details a source gave for one aspirant, and which source they came from. */
export interface AspirantSourcePick {
  profile: AspirantSourceProfile;
  /** "Expressed Interest" or "Employment Department". */
  source: string;
}

/** Several aspirants of one source, to be registered in the batch at once. */
export interface AspirantBulkPick {
  profiles: AspirantSourceProfile[];
  source: string;
}

interface MethodOption {
  id: AspirantSourceMethod;
  title: string;
  description: string;
  icon: 'user' | 'shield-check' | 'edit';
}

/**
 * Step 1 of the aspirant registration: how the aspirant's details are brought in.
 *  - Expressed Interest: the aspirants who expressed interest in the batch's course on the portal.
 *  - Employment Department: the Employment Department's records that fit the batch, fetched as soon as the option is
 *    chosen; nothing has to be typed.
 *  - Manual: fill the form in the next steps, starting with the Aadhaar number.
 * For the first two the partner either selects one aspirant, whose details fill the form for review, or ticks several
 * and registers them all at once.
 */
@Component({
  selector: 'app-aspirant-source-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ActionModalComponent, ButtonComponent, IconComponent, NgTemplateOutlet, TableComponent],
  template: `
    <div class="space-y-5">
      <div role="radiogroup" aria-label="Registration method" class="grid grid-cols-1 md:grid-cols-3 gap-3">
        @for (option of options; track option.id) {
          <div
            role="radio"
            tabindex="0"
            [attr.aria-checked]="method() === option.id"
            (click)="methodChange.emit(option.id)"
            (keydown.enter)="methodChange.emit(option.id)"
            (keydown.space)="methodChange.emit(option.id); $event.preventDefault()"
            class="rounded-xl border p-4 cursor-pointer transition-colors flex items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
            [class]="method() === option.id ? 'border-navy bg-sky-50/60' : 'border-slate-200 bg-white hover:border-slate-400'"
          >
            <span
              class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              [class]="method() === option.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'"
            >
              <app-icon [name]="option.icon" [stroke]="2" />
            </span>
            <div class="min-w-0">
              <div class="text-[13px] font-bold text-slate-900 leading-snug">{{ option.title }}</div>
              <p class="m-0 mt-0.5 text-xs text-slate-600 leading-snug">{{ option.description }}</p>
            </div>
          </div>
        }
      </div>

      @switch (method()) {
        @case ('EXPRESSED_INTEREST') {
          <div class="space-y-3">
            <p class="m-0 text-xs text-slate-600">
              Aspirants who expressed interest in this course or sector on the portal and are not registered in this batch yet.
              Tick several to register them together, or use Select to review one aspirant's details in the form.
            </p>
            <ng-container *ngTemplateOutlet="bulkBar"></ng-container>
            <app-table
              [columns]="interestColumns"
              [data]="candidates()"
              [pagination]="true"
              [pageSize]="5"
              itemUnit="aspirants"
              emptyMessage="No aspirant has expressed interest in this course or sector yet."
              [customTemplates]="{ pick: pickTpl, action: selectTpl }"
            />
          </div>
        }
        @case ('EMPLOYMENT_DEPT') {
          <div class="space-y-3">
            <p class="m-0 text-xs text-slate-600">
              Records of the Employment Department that fit this batch (same sector or district), not registered in it yet.
              Tick several to register them together, or use Select to review one aspirant's details in the form.
            </p>
            @if (loading()) {
              <div class="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-center gap-2.5" role="status">
                <span class="inline-block w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-navy animate-spin" aria-hidden="true"></span>
                Fetching records from the Employment Department...
              </div>
            } @else {
              <ng-container *ngTemplateOutlet="bulkBar"></ng-container>
              <app-table
                [columns]="employmentColumns"
                [data]="employmentRows()"
                [pagination]="true"
                [pageSize]="5"
                itemUnit="aspirants"
                emptyMessage="The Employment Department has no record that fits this batch."
                [customTemplates]="{ pick: pickTpl, action: selectTpl }"
              />
            }
          </div>
        }
        @case ('MANUAL') {
          <p class="m-0 text-xs text-slate-600">
            You will enter the aspirant's details yourself in the next steps, starting with the Aadhaar number.
          </p>
        }
      }

      @if (loadedNote()) {
        <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center gap-2" role="status">
          <app-icon name="check" size="sm" [stroke]="2.5" class="text-navy shrink-0" />
          <span>{{ loadedNote() }}</span>
        </div>
      }
    </div>

    <!-- Select all, how many are ticked, and the bulk button -->
    <ng-template #bulkBar>
      <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
          <input
            type="checkbox"
            [checked]="allSelected()"
            [disabled]="rows().length === 0 || seatsLeft() === 0"
            (change)="toggleAll()"
            class="w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer"
          />
          <span>Select all</span>
        </label>
        <span class="text-slate-600 tabular-nums">
          {{ selectedCount() }} selected • {{ seatsLeft() }} {{ seatsLeft() === 1 ? 'seat' : 'seats' }} left in the batch
        </span>
        <button appButton type="button" [disabled]="selectedCount() === 0" (click)="confirmOpen.set(true)">
          <app-icon name="plus" size="sm" />
          <span>Register Selected{{ selectedCount() ? ' (' + selectedCount() + ')' : '' }}</span>
        </button>
      </div>
    </ng-template>

    <!-- A tick box per row -->
    <ng-template #pickTpl let-row>
      <input
        type="checkbox"
        [checked]="isSelected(row)"
        [disabled]="!isSelected(row) && selectedCount() >= seatsLeft()"
        (change)="toggle(row)"
        [attr.aria-label]="'Select ' + row.aspirantName"
        class="w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer"
      />
    </ng-template>

    <!-- Select one aspirant: the details fill the form for review -->
    <ng-template #selectTpl let-row>
      <button
        appButton
        size="sm"
        type="button"
        [variant]="row.aadhaarNo === chosenAadhaar() ? 'secondary' : 'outline'"
        (click)="pickOne(row)"
      >
        <span>{{ row.aadhaarNo === chosenAadhaar() ? 'Selected' : 'Select' }}</span>
      </button>
    </ng-template>

    <app-action-modal
      [isOpen]="confirmOpen()"
      title="Register Selected Aspirants"
      accentBarClass="bg-primary"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      maxWidthClass="max-w-lg"
      [primaryLabel]="'Register ' + selectedCount() + (selectedCount() === 1 ? ' Aspirant' : ' Aspirants')"
      secondaryLabel="Cancel"
      (primaryAction)="registerSelected()"
      (secondaryAction)="confirmOpen.set(false)"
      (close)="confirmOpen.set(false)"
    >
      <div class="mt-4 space-y-3 text-xs text-slate-700">
        <p class="m-0">
          Register <strong class="tabular-nums">{{ selectedCount() }}</strong> {{ selectedCount() === 1 ? 'aspirant' : 'aspirants' }}
          in batch <strong class="tabular-nums">{{ batch().batchCode }}</strong> with the details received from the
          {{ sourceName() }}.
        </p>
        <p class="m-0">The form steps are skipped. Bank details, the photograph and the documents are not part of these records.</p>
      </div>
    </app-action-modal>
  `
})
export class AspirantSourceStepComponent {
  private readonly sources = inject(AspirantSourceService);
  private readonly destroyRef = inject(DestroyRef);

  /** The method chosen so far (none until the partner picks one). */
  readonly method = input<AspirantSourceMethod | null>(null);
  readonly batch = input.required<BatchRecord>();
  /** Aspirants who expressed interest in this batch's course or sector and are not registered in it yet. */
  readonly candidates = input<ExpressedInterestApplicant[]>([]);
  /** Aadhaar numbers already registered in this batch, left out of the Employment Department list. */
  readonly registeredAadhaars = input<ReadonlySet<string>>(new Set());
  /** Places still free in the batch; no more than this many can be ticked. */
  readonly seatsLeft = input<number>(0);
  /** Aadhaar number of the aspirant whose details are loaded into the form, to mark the row as selected. */
  readonly chosenAadhaar = input<string>('');
  /** Line shown once an aspirant's details are loaded, or after a bulk registration. */
  readonly loadedNote = input<string>('');

  readonly methodChange = output<AspirantSourceMethod>();
  readonly profileChosen = output<AspirantSourcePick>();
  readonly bulkRegister = output<AspirantBulkPick>();

  protected readonly options: MethodOption[] = [
    {
      id: 'EXPRESSED_INTEREST',
      title: 'From Expressed Interest',
      description: 'Pick aspirants who expressed interest in this course on the portal, one or many.',
      icon: 'user'
    },
    {
      id: 'EMPLOYMENT_DEPT',
      title: 'From Employment Department',
      description: "Records of the Employment Department that fit this batch are fetched for you, one or many.",
      icon: 'shield-check'
    },
    {
      id: 'MANUAL',
      title: 'Fill Manually with Aadhaar',
      description: 'Enter the details yourself, starting with the Aadhaar number.',
      icon: 'edit'
    }
  ];

  protected readonly interestColumns: TableColumn<ExpressedInterestApplicant>[] = [
    { key: 'pick', label: '', type: 'custom', align: 'center', width: 'w-12' },
    { key: 'aspirantName', label: 'Aspirant', width: 'min-w-[150px]' },
    { key: 'mobileNo', label: 'Mobile No.', width: 'min-w-[120px]' },
    { key: 'permDistrict', label: 'District', width: 'min-w-[110px]' },
    { key: 'course', label: 'Course', width: 'min-w-[220px]' },
    { key: 'expressedOn', label: 'Expressed On', align: 'center', width: 'w-32' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-32' }
  ];

  protected readonly employmentColumns: TableColumn<EmploymentDeptRecord>[] = [
    { key: 'pick', label: '', type: 'custom', align: 'center', width: 'w-12' },
    { key: 'aspirantName', label: 'Aspirant', width: 'min-w-[150px]' },
    { key: 'registrationNo', label: 'Registration No.', width: 'min-w-[130px]' },
    { key: 'mobileNo', label: 'Mobile No.', width: 'min-w-[120px]' },
    { key: 'permDistrict', label: 'District', width: 'min-w-[110px]' },
    { key: 'sector', label: 'Sector', width: 'min-w-[170px]' },
    { key: 'educationalQualification', label: 'Qualification', width: 'min-w-[120px]' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-32' }
  ];

  protected readonly loading = signal<boolean>(false);
  private readonly employment = signal<EmploymentDeptRecord[]>([]);
  /** Aadhaar numbers ticked in the list. */
  private readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly confirmOpen = signal<boolean>(false);

  /** The Employment Department's records that fit the batch and are not registered in it yet. */
  protected readonly employmentRows = computed(() => this.employment().filter(r => !this.registeredAadhaars().has(r.aadhaarNo)));

  /** The rows of the list shown for the chosen method. */
  protected readonly rows = computed<(ExpressedInterestApplicant | EmploymentDeptRecord)[]>(() => {
    const method = this.method();
    if (method === 'EXPRESSED_INTEREST') return this.candidates();
    if (method === 'EMPLOYMENT_DEPT') return this.employmentRows();
    return [];
  });

  protected readonly selectedCount = computed(() => this.rows().filter(r => this.selected().has(r.aadhaarNo)).length);
  protected readonly allSelected = computed(() => {
    const limit = Math.min(this.rows().length, this.seatsLeft());
    return limit > 0 && this.selectedCount() >= limit;
  });
  protected readonly sourceName = computed(() => (this.method() === 'EMPLOYMENT_DEPT' ? 'Employment Department' : 'Expressed Interest list'));

  constructor() {
    // A new method starts with nothing ticked; the Employment Department's records are fetched as soon as it is chosen.
    effect(() => {
      const method = this.method();
      untracked(() => {
        this.selected.set(new Set());
        if (method === 'EMPLOYMENT_DEPT') this.loadEmployment();
      });
    });
  }

  private loadEmployment(): void {
    this.loading.set(true);
    this.sources
      .fetchFromEmploymentDept(this.batch())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(records => {
        this.employment.set(records);
        this.loading.set(false);
      });
  }

  protected isSelected(row: AspirantSourceProfile): boolean {
    return this.selected().has(row.aadhaarNo);
  }

  /** Ticks or unticks a row; no more rows can be ticked than the batch has seats left. */
  protected toggle(row: AspirantSourceProfile): void {
    const next = new Set(this.selected());
    if (next.has(row.aadhaarNo)) next.delete(row.aadhaarNo);
    else if (this.selectedCount() < this.seatsLeft()) next.add(row.aadhaarNo);
    this.selected.set(next);
  }

  /** Ticks as many rows as the batch has seats for, or unticks all when they are all ticked. */
  protected toggleAll(): void {
    if (this.allSelected()) {
      this.selected.set(new Set());
      return;
    }
    this.selected.set(new Set(this.rows().slice(0, this.seatsLeft()).map(r => r.aadhaarNo)));
  }

  protected pickOne(row: AspirantSourceProfile): void {
    this.profileChosen.emit({ profile: row, source: this.method() === 'EMPLOYMENT_DEPT' ? 'Employment Department' : 'Expressed Interest' });
  }

  protected registerSelected(): void {
    const profiles = this.rows().filter(r => this.selected().has(r.aadhaarNo));
    this.confirmOpen.set(false);
    if (profiles.length === 0) return;
    this.bulkRegister.emit({ profiles, source: this.sourceName() });
    this.selected.set(new Set());
  }
}
