import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MasterCrudPageComponent,
  MasterCrudConfig,
  TableColumn,
  ButtonComponent,
  InputDirective,
  IconComponent,
  SwitchComponent,
  PageShellComponent,
  formatInr
} from '../../shared';
import { SchemeMasterItem } from '../../core/models/admin-masters.model';
import { PermissionService } from '../../core/permissions/permission.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import { SchemeRequirementsModalComponent } from './scheme-requirements-modal.component';

export type { SchemeMasterItem };

const SCHEME_CATEGORY_OPTIONS = ['ALL', 'Rajvik', 'samarth', 'saksham', 'na'];
const CATEGORY_NAME_OPTIONS = [
  'GENERAL',
  'GOVERNMENT INSTITUTION/PSU',
  'GOVERNMENT INSTITUTION/INSTITUTION',
  'SPECIAL TARGET GROUP'
];

const COLUMNS: TableColumn<SchemeMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-14 min-w-[55px]' },
  { key: 'schemeName', label: 'Scheme Name', cellClass: 'font-semibold text-slate-800 min-w-[200px]' },
  { key: 'schemeCategory', label: 'Scheme Category', cellClass: 'whitespace-nowrap font-medium text-slate-700 w-36' },
  {
    key: 'budget',
    label: 'Budget',
    align: 'right',
    type: 'custom',
    width: 'w-36 min-w-[120px]',
    cellClass: 'whitespace-nowrap font-medium text-slate-800',
    format: (value: number) => formatInr(value ?? 0, { fractionDigits: 2 })
  },
  {
    key: 'amount',
    label: 'EMD amount',
    align: 'right',
    width: 'w-32 min-w-[110px]',
    cellClass: 'whitespace-nowrap font-medium text-slate-800',
    format: (value: number) => formatInr(value ?? 0, { fractionDigits: 2 })
  },
  {
    key: 'processFees',
    label: 'Process Fees',
    align: 'right',
    width: 'w-32 min-w-[110px]',
    cellClass: 'whitespace-nowrap font-medium text-slate-800',
    format: (value: number) => formatInr(value ?? 0, { fractionDigits: 2 })
  }
];

const CONFIG: MasterCrudConfig<SchemeMasterItem> = {
  dataKey: 'SCHEME_MASTERS',
  entityLabel: 'Scheme',
  title: 'Scheme Master',
  searchPlaceholder: 'Search by scheme name or category...',
  searchFields: ['schemeName', 'schemeCategory'],
  itemUnit: 'schemes',
  columns: COLUMNS,
  hasStatus: true,
  hideViewAction: true,
  actionColumnWidth: 'w-44 min-w-[175px]',
  modalWidthClass: 'max-w-[840px]',
  filters: [
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      placeholder: 'All Scheme Categories',
      options: ['Rajvik', 'samarth', 'saksham', 'na']
    },
    {
      key: 'categoryName',
      label: 'EOI Category',
      placeholder: 'All EOI Categories',
      options: CATEGORY_NAME_OPTIONS
    }
  ],
  fields: [
    { key: 'schemeName', label: 'Scheme Name', type: 'text', required: true, maxLength: 120, placeholder: 'Enter scheme name', colSpan: 1 },
    { key: 'schemeCategory', label: 'Scheme Category', type: 'multiselect', required: true, options: SCHEME_CATEGORY_OPTIONS, colSpan: 1 },
    { key: 'categoryName', label: 'EOI Category', type: 'select', required: true, options: CATEGORY_NAME_OPTIONS, colSpan: 1 },
    { key: 'budget', label: 'Budget (\u20B9)', type: 'number', required: true, min: 0, placeholder: 'Enter budget amount', colSpan: 1 },
    { key: 'amount', label: 'EMD amount (\u20B9)', type: 'number', required: true, min: 0, placeholder: 'Enter amount', colSpan: 1 },
    { key: 'processFees', label: 'Process Fees (\u20B9)', type: 'number', required: true, min: 0, placeholder: 'Enter process fees', colSpan: 1 }
  ],
  createDefaults: () => ({
    schemeName: '',
    schemeCategory: [],
    categoryName: '',
    budget: null,
    amount: null,
    processFees: null
  }),
  buildPayload: (formData) => ({
    schemeName: formData.schemeName.trim(),
    schemeCategory: Array.isArray(formData.schemeCategory)
      ? formData.schemeCategory.join(', ')
      : String(formData.schemeCategory || '').trim(),
    categoryName: formData.categoryName.trim(),
    budget: Number(formData.budget) || 0,
    amount: Number(formData.amount),
    processFees: Number(formData.processFees),
    status: 'Active'
  }),
  deleteConfirmText: (item) => `Are you sure you want to delete scheme "${item.schemeName}"?`
};

@Component({
  selector: 'app-scheme-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MasterCrudPageComponent,
    ButtonComponent,
    InputDirective,
    IconComponent,
    SwitchComponent,
    PageShellComponent,
    SchemeRequirementsModalComponent
  ],
  template: `
    @if (!isReqModalOpen()) {
      <app-master-crud-page [config]="config" [extraTemplates]="extraTemplates">
      </app-master-crud-page>
    } @else {
      <app-page-shell>
        <app-scheme-requirements-modal
          [scheme]="selectedSchemeForReq()"
          (close)="closeRequirementsModal()"
        />
      </app-page-shell>
    }

    <!-- Custom Budget Cell Template with Click-to-Edit for Super Admin -->
    <ng-template #budgetTemplate let-item>
      @if (editingItemId() === item.id) {
        <div class="inline-flex items-center gap-1.5 justify-end w-full py-0.5" (click)="$event.stopPropagation()">
          <span class="text-xs text-slate-500 font-semibold select-none">₹</span>
          <input
            appInput
            size="sm"
            type="number"
            class="w-32"
            [value]="editingBudgetValue()"
            (input)="onInputChange($event)"
            (keydown.enter)="saveBudget(item, $event)"
            (keydown.escape)="cancelEdit($event)"
            min="0"
            step="100000"
            placeholder="Enter budget"
          />
          <button
            appButton
            size="xs"
            iconOnly
            type="button"
            (click)="saveBudget(item, $event)"
            title="Save (Enter)"
            aria-label="Save Budget"
          >
            <app-icon name="check" size="xs" />
          </button>
          <button
            appButton
            variant="outline"
            size="xs"
            iconOnly
            type="button"
            (click)="cancelEdit($event)"
            title="Cancel (Esc)"
            aria-label="Cancel Edit"
          >
            <app-icon name="close" size="xs" />
          </button>
        </div>
      } @else {
        <div
          class="inline-flex items-center justify-end w-full py-0.5"
          [class.cursor-pointer]="isSuperAdmin()"
          (click)="onBudgetClick(item, $event)"
          [title]="isSuperAdmin() ? 'Click to edit budget' : 'Scheme Budget'"
        >
          <span
            class="font-medium text-slate-800 transition-colors whitespace-nowrap"
            [class.hover:text-brand]="isSuperAdmin()"
            [class.hover:underline]="isSuperAdmin()"
          >
            {{ formatBudget(item.budget) }}
          </span>
        </div>
      }
    </ng-template>

    <!-- Action Cell Template: Requirements Manager + Edit + Switch -->
    <ng-template #actionTemplate let-item>
      <div class="flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
        <!-- Requirements Manager Button -->
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="$event.stopPropagation(); openRequirementsModal(item)"
          title="Manage Scheme Requirements (Docs, Annexures, Custom Fields)"
          aria-label="Manage Scheme Requirements"
        >
          <app-icon name="clipboard-check" size="sm" class="text-[#7C0E44]" />
        </button>

        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

        <!-- Edit Button -->
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="$event.stopPropagation(); openEditModal(item)"
          title="Edit"
          aria-label="Edit"
        >
          <app-icon name="edit" size="sm" />
        </button>

        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

        <!-- Active / Inactive Toggle -->
        <div
          class="inline-flex items-center"
          [title]="item.status === 'Inactive' ? 'Status: Inactive (Click to activate)' : 'Status: Active (Click to deactivate)'"
          (click)="$event.stopPropagation()"
        >
          <app-switch
            [checked]="item.status !== 'Inactive'"
            [label]="item.status === 'Inactive' ? 'Inactive' : 'Active'"
            (toggled)="toggleStatus(item)"
          />
        </div>
      </div>
    </ng-template>
  `
})
export class SchemeMasterComponent {
  @ViewChild('budgetTemplate', { static: true }) budgetTemplate!: TemplateRef<unknown>;
  @ViewChild('actionTemplate', { static: true }) actionTemplate!: TemplateRef<unknown>;
  @ViewChild(MasterCrudPageComponent) masterCrud?: MasterCrudPageComponent<SchemeMasterItem>;

  private permissionService = inject(PermissionService);
  private dataEngine = inject(DataEngineService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  private schemeRepo = this.dataEngine.for<SchemeMasterItem>('SCHEME_MASTERS', { idKey: 'id' });

  readonly config = CONFIG;
  readonly isSuperAdmin = computed(() => this.permissionService.hasRole('super_admin'));

  readonly editingItemId = signal<string | null>(null);
  readonly editingBudgetValue = signal<number>(0);

  readonly isReqModalOpen = signal<boolean>(false);
  readonly selectedSchemeForReq = signal<SchemeMasterItem | null>(null);

  get extraTemplates(): Record<string, TemplateRef<unknown>> {
    return {
      budget: this.budgetTemplate,
      action: this.actionTemplate
    };
  }

  openRequirementsModal(item: SchemeMasterItem): void {
    this.selectedSchemeForReq.set(item);
    this.isReqModalOpen.set(true);
    this.cdr.markForCheck();
  }

  closeRequirementsModal(): void {
    this.isReqModalOpen.set(false);
    this.selectedSchemeForReq.set(null);
    this.cdr.markForCheck();
  }

  openEditModal(item: SchemeMasterItem): void {
    this.masterCrud?.openEditModal(item);
  }

  toggleStatus(item: SchemeMasterItem): void {
    this.masterCrud?.toggleStatus(item);
  }

  formatBudget(val: number | undefined | null): string {
    return formatInr(val ?? 0, { fractionDigits: 2 });
  }

  onBudgetClick(item: SchemeMasterItem, event: MouseEvent): void {
    if (!this.isSuperAdmin()) return;
    event.stopPropagation();
    this.editingItemId.set(item.id);
    this.editingBudgetValue.set(item.budget ?? 0);
    this.cdr.markForCheck();
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[placeholder="Enter budget"]');
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const num = parseFloat(target.value);
    this.editingBudgetValue.set(isNaN(num) ? 0 : num);
  }

  saveBudget(item: SchemeMasterItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const val = Number(this.editingBudgetValue());
    if (isNaN(val) || val < 0) {
      this.notificationService.error('Please enter a valid non-negative budget amount');
      return;
    }

    this.schemeRepo.update(item.id, { budget: val }).subscribe({
      next: () => {
        item.budget = val;
        this.masterCrud?.items.update(list => list.map(it => it.id === item.id ? { ...it, budget: val } : it));
        this.notificationService.success(`Budget for "${item.schemeName}" updated to ${this.formatBudget(val)}`);
        this.editingItemId.set(null);
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.error('Failed to update budget. Please try again.');
      }
    });
  }

  cancelEdit(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.editingItemId.set(null);
    this.cdr.markForCheck();
  }
}
