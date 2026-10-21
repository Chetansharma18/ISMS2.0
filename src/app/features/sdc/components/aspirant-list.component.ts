import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AspirantService } from '../services/aspirant.service';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { AspirantRecord, AspirantTrainingStatus, DROP_REASONS } from '../models/aspirant.model';
import { isBatchApproved } from '../utils/batch-approval.util';
import type { BatchRecord } from '../models/batch.model';
import { categoryLabel } from '../../eoi/pages/sanction-order-list/sanction-order-list.component';
import { downloadAspirantsCsv } from '../utils/aspirant-csv.util';
import {
  ButtonComponent,
  FilterTabsComponent,
  IconComponent,
  InputDirective,
  ListPageComponent,
  ModalComponent,
  TableColumn
} from '../../../shared';

/** A running approved batch: students can still be dropped from it. */
function isRunningApproved(b: BatchRecord | undefined): boolean {
  return !!b && isBatchApproved(b) && b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
}

/** Training status in words, as the tables and the details show it. */
export const ASPIRANT_STATUS_LABEL: Record<AspirantTrainingStatus, string> = {
  ENROLLED: 'Enrolled',
  IN_TRAINING: 'In training',
  COMPLETED: 'Completed',
  CERTIFIED: 'Certified',
  DROPOUT: 'Dropout'
};

/** Colour of the status text (the same palette as the status of batches and SDCs). */
export function aspirantStatusClass(status: AspirantTrainingStatus): string {
  switch (status) {
    case 'IN_TRAINING':
      return 'text-sky-700';
    case 'COMPLETED':
    case 'CERTIFIED':
      return 'text-emerald-700';
    case 'DROPOUT':
      return 'text-red-600';
    default:
      return 'text-slate-700';
  }
}

/**
 * Aspirants Management: every aspirant registered in the partner's batches, with the details taken at registration,
 * the batch and center they are in, and their training status.
 */
@Component({
  selector: 'app-aspirant-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FilterTabsComponent, ListPageComponent, ButtonComponent, IconComponent, InputDirective, ModalComponent],
  template: `
    <app-list-page
      title="Aspirants Management"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Aspirants Management' }]"
      [searchable]="true"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search Aspirant ID, Name, Aadhaar, Mobile, Batch, Center..."
      [columns]="columns"
      [data]="filteredAspirants()"
      [pagination]="true"
      [pageSize]="pageSize"
      itemUnit="aspirants"
      emptyMessage="No aspirants match the selected filters or search."
      [customTemplates]="{
        aspirant: aspirantTemplate,
        person: personTemplate,
        background: backgroundTemplate,
        contact: contactTemplate,
        district: districtTemplate,
        batch: batchTemplate,
        center: centerTemplate,
        scheme: schemeTemplate,
        status: statusTemplate,
        actions: actionsTemplate
      }"
    >
      <button headerActions appButton size="sm" variant="outline" type="button" (click)="exportToCsv()" title="Export the list to CSV">
        <app-icon name="download" size="sm" />
        <span>Export CSV</span>
      </button>

      <div beforeTable class="flex items-center justify-between gap-3 pt-1">
        <app-filter-tabs [options]="statusTabs()" [value]="activeStatus()" (valueChange)="activeStatus.set($event)" />
      </div>

      @if (message()) {
        <div beforeTable class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs">
          <span class="font-medium">{{ message() }}</span>
          <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="message.set('')"><app-icon name="close" size="xs" /></button>
        </div>
      }

      <div beforeTable class="bg-slate-50 border border-border rounded-lg p-2.5 flex flex-wrap items-center gap-2.5 text-xs shadow-2xs">
        <div class="flex items-center gap-1.5">
          <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">Center:</label>
          <select appInput size="sm" [ngModel]="selectedSdc()" (ngModelChange)="selectedSdc.set($event)" class="max-w-[220px]">
            <option value="ALL">All Centers ({{ sdcOptions().length }})</option>
            @for (s of sdcOptions(); track s.code) {
              <option [value]="s.code">{{ s.name }}</option>
            }
          </select>
        </div>
        <div class="flex items-center gap-1.5">
          <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">Batch:</label>
          <select appInput size="sm" [ngModel]="selectedBatch()" (ngModelChange)="selectedBatch.set($event)" class="max-w-[220px]">
            <option value="ALL">All Batches ({{ batchOptions().length }})</option>
            @for (b of batchOptions(); track b.code) {
              <option [value]="b.code">{{ b.code }} - {{ b.course }}</option>
            }
          </select>
        </div>
        <div class="flex items-center gap-1.5">
          <label class="font-semibold text-slate-700 whitespace-nowrap text-[11px] uppercase tracking-wider">Scheme:</label>
          <select appInput size="sm" [ngModel]="selectedScheme()" (ngModelChange)="selectedScheme.set($event)">
            <option value="ALL">All Schemes</option>
            @for (s of schemeOptions(); track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
        @if (hasActiveFilters()) {
          <button appButton variant="danger" size="sm" type="button" (click)="resetFilters()" class="ml-auto">Reset Filters</button>
        }
      </div>

      <!-- Aspirant: name with the ID below -->
      <ng-template #aspirantTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ a.aspirantName }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ a.id }}</div>
        </div>
      </ng-template>

      <!-- Gender and age, with the father / husband name below -->
      <ng-template #personTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ a.gender }}, {{ a.age }} yrs</div>
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ a.relationType || 'Father' }}: {{ a.relationName || '—' }}</div>
        </div>
      </ng-template>

      <!-- Category, with the educational qualification below -->
      <ng-template #backgroundTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ a.category || '—' }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ a.educationalQualification || '—' }}</div>
        </div>
      </ng-template>

      <!-- Aadhaar (masked), with the mobile number below -->
      <ng-template #contactTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ a.aadhaarMasked }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ a.mobileNo }}</div>
        </div>
      </ng-template>

      <!-- District of the permanent address, with rural or urban below -->
      <ng-template #districtTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ a.permDistrict || '—' }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ a.areaType || '—' }}</div>
        </div>
      </ng-template>

      <!-- Batch code, with the course below -->
      <ng-template #batchTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight tabular-nums">{{ a.batchCode }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ a.courseName }}</div>
        </div>
      </ng-template>

      <!-- Center, with its code below -->
      <ng-template #centerTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ a.sdcName }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ a.sdcCode }}</div>
        </div>
      </ng-template>

      <!-- Scheme, with its category below -->
      <ng-template #schemeTemplate let-a>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ a.scheme }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ schemeCategory(a) }}</div>
        </div>
      </ng-template>

      <ng-template #statusTemplate let-a>
        <span class="whitespace-nowrap font-normal text-[13px]" [class]="statusClass(a.trainingStatus)">{{ statusText(a.trainingStatus) }}</span>
      </ng-template>

      <ng-template #actionsTemplate let-a>
        <div class="flex items-center justify-center py-2 px-1 whitespace-nowrap">
          <button appButton variant="outline" size="sm" class="w-24 shrink-0" type="button" (click)="viewDetails(a)" title="View aspirant details">
            <app-icon name="eye" size="sm" />
            <span>View</span>
          </button>
          <!-- Drop an active student, or register a replacement for one who has dropped. One fixed slot keeps the rows in line. -->
          <div class="w-28 shrink-0 ml-2">
            @if (canDrop(a)) {
              <button appButton variant="outline" size="sm" block type="button" (click)="askToDrop(a)" title="Drop this student from the batch">
                <app-icon name="close" size="sm" />
                <span>Drop</span>
              </button>
            } @else if (canReplace(a)) {
              <button appButton variant="primary" size="sm" block type="button" (click)="registerReplacement(a)" title="Register a student in the seat this student left">
                <app-icon name="plus" size="sm" />
                <span>Replace</span>
              </button>
            }
          </div>
        </div>
      </ng-template>

    </app-list-page>

      @if (dropping(); as target) {
        <app-modal
          title="Drop Student"
          [subtitle]="target.aspirantName + ' · Batch ' + target.batchCode"
          size="sm"
          [closeOnBackdrop]="false"
          (close)="dropping.set(null)"
        >
          <div class="space-y-3 text-xs text-slate-700">
            <p class="m-0">
              The seat in batch <strong class="tabular-nums">{{ target.batchCode }}</strong> is freed. You can register a replacement now or later,
              also after registration for new aspirants has closed.
            </p>
            <div>
              <label for="drop-reason" class="block mb-1 font-semibold text-slate-700">Reason for dropping <span class="text-rose-500">*</span></label>
              <select id="drop-reason" appInput [ngModel]="dropReason()" (ngModelChange)="dropReason.set($event)">
                <option value="">Select a reason</option>
                @for (reason of dropReasons; track reason) {
                  <option [value]="reason">{{ reason }}</option>
                }
              </select>
            </div>
          </div>
          <ng-container modalFooter>
            <button appButton variant="outline" type="button" (click)="dropping.set(null)">Cancel</button>
            <button appButton variant="outline" type="button" [disabled]="!dropReason()" (click)="confirmDrop(false)">Drop Only</button>
            <button appButton type="button" [disabled]="!dropReason()" (click)="confirmDrop(true)">Drop &amp; Register Replacement</button>
          </ng-container>
        </app-modal>
      }
  `
})
export class AspirantListComponent {
  readonly aspirantService = inject(AspirantService);
  readonly batchService = inject(BatchService);
  readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  readonly searchQuery = signal<string>('');
  readonly activeStatus = signal<string>('ALL');
  readonly selectedSdc = signal<string>('ALL');
  readonly selectedBatch = signal<string>('ALL');
  readonly selectedScheme = signal<string>('ALL');
  readonly message = signal<string>('');
  readonly pageSize = 10;

  readonly columns: TableColumn<AspirantRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'aspirant', label: 'Aspirant', type: 'custom', width: 'min-w-[150px]' },
    { key: 'person', label: 'Gender & Age', type: 'custom', width: 'min-w-[170px]' },
    { key: 'background', label: 'Category & Qualification', type: 'custom', width: 'min-w-[170px]' },
    { key: 'contact', label: 'Aadhaar & Mobile', type: 'custom', width: 'min-w-[140px]' },
    { key: 'district', label: 'District', type: 'custom', width: 'min-w-[110px]' },
    { key: 'batch', label: 'Batch & Course', type: 'custom', width: 'min-w-[200px]' },
    { key: 'center', label: 'Center (SDC)', type: 'custom', width: 'min-w-[170px]' },
    { key: 'scheme', label: 'Scheme & Category', type: 'custom', width: 'min-w-[140px]' },
    { key: 'enrollmentDate', label: 'Enrolled On', align: 'center', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-28' },
    { key: 'status', label: 'Status', type: 'custom', width: 'min-w-[110px]' },
    { key: 'actions', label: 'Actions', align: 'center', type: 'custom', width: 'min-w-[260px]' }
  ];

  readonly sdcOptions = computed(() => {
    const used = new Set(this.aspirantService.aspirants().map(a => a.sdcCode));
    return this.sdcService
      .sdcs()
      .filter(s => used.has(s.sdcCode))
      .map(s => ({ code: s.sdcCode, name: `${s.sdcName} (${s.sdcCode})` }));
  });

  readonly batchOptions = computed(() => {
    const used = new Set(this.aspirantService.aspirants().map(a => a.batchCode));
    return this.batchService
      .batches()
      .filter(b => used.has(b.batchCode))
      .map(b => ({ code: b.batchCode, course: b.courseName }));
  });

  readonly schemeOptions = computed(() => Array.from(new Set(this.aspirantService.aspirants().map(a => a.scheme).filter(Boolean))));

  readonly statusTabs = computed(() => {
    const list = this.aspirantService.aspirants();
    const count = (status: AspirantTrainingStatus) => list.filter(a => a.trainingStatus === status).length;
    return [
      { id: 'ALL', label: 'All Aspirants', count: list.length },
      { id: 'ENROLLED', label: 'Enrolled', count: count('ENROLLED') },
      { id: 'IN_TRAINING', label: 'In Training', count: count('IN_TRAINING') },
      { id: 'COMPLETED', label: 'Completed', count: count('COMPLETED') },
      { id: 'CERTIFIED', label: 'Certified', count: count('CERTIFIED') },
      { id: 'DROPOUT', label: 'Dropout', count: count('DROPOUT') }
    ];
  });

  readonly hasActiveFilters = computed(
    () => this.selectedSdc() !== 'ALL' || this.selectedBatch() !== 'ALL' || this.selectedScheme() !== 'ALL' || this.activeStatus() !== 'ALL' || this.searchQuery().trim() !== ''
  );

  readonly filteredAspirants = computed(() => {
    let list = this.aspirantService.aspirants();
    if (this.activeStatus() !== 'ALL') list = list.filter(a => a.trainingStatus === this.activeStatus());
    if (this.selectedSdc() !== 'ALL') list = list.filter(a => a.sdcCode === this.selectedSdc());
    if (this.selectedBatch() !== 'ALL') list = list.filter(a => a.batchCode === this.selectedBatch());
    if (this.selectedScheme() !== 'ALL') list = list.filter(a => a.scheme === this.selectedScheme());

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(a =>
        [a.id, a.aspirantName, a.aadhaarMasked, a.aadhaarNo, a.mobileNo, a.email, a.sdcName, a.sdcCode, a.sdcDistrict, a.batchCode, a.courseName, a.scheme, a.relationName, a.permCity, a.permDistrict, a.janaadhaarId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  });

  resetFilters(): void {
    this.activeStatus.set('ALL');
    this.selectedSdc.set('ALL');
    this.selectedBatch.set('ALL');
    this.selectedScheme.set('ALL');
    this.searchQuery.set('');
  }

  statusText(status: AspirantTrainingStatus): string {
    return ASPIRANT_STATUS_LABEL[status] ?? status;
  }

  statusClass(status: AspirantTrainingStatus): string {
    return aspirantStatusClass(status);
  }

  /** Scheme category of the center the aspirant's batch belongs to, in normal case. */
  schemeCategory(a: AspirantRecord): string {
    return categoryLabel(this.sdcService.getSdcById(a.sdcId)?.schemeCategory);
  }

  // ---- Drop and replace --------------------------------------------------------------------------

  protected readonly dropReasons = DROP_REASONS;
  /** The student the partner is about to drop (waiting for the reason and confirmation). */
  readonly dropping = signal<AspirantRecord | null>(null);
  readonly dropReason = signal<string>('');

  /** An active student of an approved batch that is still running can be dropped. */
  canDrop(a: AspirantRecord): boolean {
    return a.trainingStatus !== 'DROPOUT' && isRunningApproved(this.batchService.getBatchById(a.batchId));
  }

  /** A dropped student whose seat is still empty can be replaced. */
  canReplace(a: AspirantRecord): boolean {
    return this.aspirantService.canRegisterReplacementFor(a);
  }

  askToDrop(a: AspirantRecord): void {
    this.dropReason.set('');
    this.dropping.set(a);
  }

  confirmDrop(thenReplace: boolean): void {
    const target = this.dropping();
    if (!target) return;
    const dropped = this.aspirantService.dropAspirant(target.id, this.dropReason());
    this.dropping.set(null);
    if (!dropped) {
      this.message.set(`${target.aspirantName} could not be dropped.`);
      return;
    }
    if (thenReplace) {
      this.registerReplacement(target);
      return;
    }
    this.message.set(`${target.aspirantName} dropped from batch ${target.batchCode}. A seat is free for a replacement.`);
  }

  /** Opens the registration for the batch, to put a new student in the seat of the dropped one. */
  registerReplacement(a: AspirantRecord): void {
    this.router.navigate(['/batches', a.batchId, 'map-aspirant'], { queryParams: { replace: a.id } });
  }

  viewDetails(aspirant: AspirantRecord): void {
    this.router.navigate(['/aspirants', aspirant.id]);
  }

  exportToCsv(): void {
    const data = this.filteredAspirants().length > 0 ? this.filteredAspirants() : this.aspirantService.aspirants();
    if (!data.length) return;
    downloadAspirantsCsv(data);
    this.message.set(`Exported ${data.length} aspirant record${data.length === 1 ? '' : 's'} to CSV.`);
  }
}
