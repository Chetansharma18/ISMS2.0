import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  effect,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActionModalComponent,
  ButtonComponent,
  IconComponent,
  InputDirective,
  formatInr
} from '../../shared';
import { SchemeRequirementsService } from '../../core/services/scheme-requirements.service';
import { MappedSchemeDetail, RequirementType } from '../../core/models/scheme-requirements.model';
import { SchemeMasterItem } from '../../core/models/admin-masters.model';
import { MOCK_SCHEME_MASTER_ITEMS } from '../../core/mock/data/admin-masters.mock';
import { MOCK_SCHEMES } from '../../core/mock/data/schemes.mock';
import { DataEngineService } from '../../core/services/data-engine.service';

export interface MasterItemTarget {
  id: string;
  name: string;
  type: RequirementType;
  schemes?: string[];
}

@Component({
  selector: 'app-associated-schemes-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ActionModalComponent,
    ButtonComponent,
    IconComponent,
    InputDirective
  ],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="true"
      [showAccentBar]="false"
      primaryLabel="Done"
      secondaryLabel=""
      maxWidthClass="max-w-[760px]"
      (primaryAction)="closeModal()"
      (secondaryAction)="closeModal()"
      (close)="closeModal()"
    >
      <!-- Modal Header -->
      <div class="border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-lg bg-[#F8EDF1] text-[#7C0E44] flex items-center justify-center shrink-0">
            <app-icon name="clipboard-check" size="sm" />
          </span>
          <div class="min-w-0">
            <h2 class="m-0 text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Associated Schemes &amp; Requirement Policies
            </h2>
            <p class="m-0 text-xs text-slate-500 mt-0.5 truncate max-w-[560px]">
              {{ targetItem()?.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Summary Strip -->
      <div class="my-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span class="text-slate-700">
          Total Associated: <strong class="text-slate-900 font-bold">{{ mappedSchemes().length }} Schemes</strong>
        </span>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            {{ mandatoryCount() }} Mandatory
          </span>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span class="w-2 h-2 rounded-full bg-slate-400"></span>
            {{ optionalCount() }} Optional
          </span>
        </div>
      </div>

      <!-- Schemes List Table / Cards -->
      <div class="max-h-[380px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
        @if (mappedSchemes().length === 0) {
          <div class="p-6 text-center text-xs text-slate-500">
            No schemes currently associated with this {{ targetItem()?.type === 'DOCUMENT' ? 'document' : 'annexure' }}.
          </div>
        } @else {
          @for (item of mappedSchemes(); track item.mappingId; let idx = $index) {
            <div class="p-3.5 hover:bg-slate-50/70 transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                <!-- Left: S.No + Scheme Name + Detailed Metadata Badges -->
                <div class="min-w-0 space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <span class="text-xs sm:text-[13px] font-bold text-slate-900 truncate" [title]="item.schemeName">
                      {{ item.schemeName }}
                    </span>
                  </div>

                  <!-- Metadata Badges Row: Complete Scheme Details -->
                  <div class="flex flex-wrap items-center gap-1.5 pl-7">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                      Category: {{ item.schemeCategory || 'General' }}
                    </span>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      EOI: {{ item.categoryName || 'GENERAL' }}
                    </span>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Budget: {{ formatBudget(item.budget) }}
                    </span>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      EMD: {{ formatAmount(item.emdAmount) }}
                    </span>
                    @if (item.processFees) {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
                        Fee: {{ formatAmount(item.processFees) }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Right: Check Details + Mandatory/Optional Toggle + Remove -->
                <div class="flex items-center gap-2 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                  <!-- Check Scheme Details Button -->
                  <button
                    appButton
                    variant="ghost"
                    size="xs"
                    type="button"
                    (click)="toggleDetail(item.mappingId)"
                    [title]="expandedId() === item.mappingId ? 'Hide Scheme Details' : 'Check Complete Scheme Details'"
                  >
                    <app-icon [name]="expandedId() === item.mappingId ? 'chevron-up' : 'eye'" size="xs" />
                    <span>{{ expandedId() === item.mappingId ? 'Hide' : 'Check Details' }}</span>
                  </button>

                  <!-- Inline Mandatory / Optional Toggle -->
                  <button
                    appButton
                    [variant]="item.isMandatory ? 'primary' : 'outline'"
                    size="xs"
                    type="button"
                    (click)="toggleMandatory(item)"
                    [title]="item.isMandatory ? 'Currently Mandatory - click to make Optional' : 'Currently Optional - click to make Mandatory'"
                  >
                    <span>{{ item.isMandatory ? 'Mandatory' : 'Optional' }}</span>
                  </button>

                  <!-- Unlink / Remove button -->
                  <button
                    appButton
                    variant="ghost"
                    size="xs"
                    iconOnly
                    type="button"
                    (click)="removeMapping(item)"
                    title="Remove scheme from this requirement"
                    aria-label="Remove scheme"
                  >
                    <app-icon name="trash" size="xs" class="text-rose-500 hover:text-rose-700" />
                  </button>
                </div>
              </div>

              <!-- Complete Scheme Details Accordion Panel -->
              @if (expandedId() === item.mappingId) {
                <div class="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-3 animate-in fade-in duration-150">
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">Scheme Code / Identifier</span>
                      <span class="font-bold text-slate-800 text-xs">{{ item.schemeCode || 'GENERAL' }}</span>
                    </div>
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">Department / Agency</span>
                      <span class="font-semibold text-slate-800 text-xs">RSLDC, Rajasthan</span>
                    </div>
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">Scheme Category</span>
                      <span class="font-semibold text-sky-800 text-xs">{{ item.schemeCategory || 'General' }}</span>
                    </div>
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">EOI Target Category</span>
                      <span class="font-semibold text-slate-800 text-xs">{{ item.categoryName || 'GENERAL' }}</span>
                    </div>
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">Scheme Budget Allocation</span>
                      <span class="font-bold text-emerald-800 text-xs">{{ formatBudget(item.budget) }}</span>
                    </div>
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">Earnest Money Deposit (EMD)</span>
                      <span class="font-bold text-amber-800 text-xs">{{ formatAmount(item.emdAmount) }}</span>
                    </div>
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">Non-refundable Process Fee</span>
                      <span class="font-bold text-purple-800 text-xs">{{ formatAmount(item.processFees) }}</span>
                    </div>
                    <div>
                      <span class="text-[10.5px] text-slate-500 font-medium block">Scheme Status</span>
                      <span class="font-bold text-emerald-700 text-xs">&bull; Active</span>
                    </div>
                  </div>

                  @if (item.description) {
                    <div class="pt-2 border-t border-slate-200">
                      <span class="text-[10.5px] text-slate-500 font-medium block mb-0.5">Scheme Description &amp; Scope:</span>
                      <p class="m-0 text-slate-700 text-[11.5px] leading-relaxed">{{ item.description }}</p>
                    </div>
                  }

                  <div class="pt-1.5 flex items-center justify-between text-[11.5px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                    <span>
                      Requirement Status for this Scheme:
                      @if (item.isMandatory) {
                        <strong class="text-rose-700">MANDATORY (Applicant must submit to proceed)</strong>
                      } @else {
                        <strong class="text-slate-700">OPTIONAL (Supporting document)</strong>
                      }
                    </span>
                    <button
                      appButton
                      variant="outline"
                      size="xs"
                      type="button"
                      (click)="toggleMandatory(item)"
                    >
                      Switch to {{ item.isMandatory ? 'Optional' : 'Mandatory' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- Add / Map to Another Scheme Section -->
      <div class="mt-4 pt-3.5 border-t border-slate-200 space-y-2">
        <label class="block text-xs font-bold text-slate-800">
          Map to Another Scheme
        </label>
        
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            appInput
            size="sm"
            [(ngModel)]="selectedSchemeToAdd"
            class="flex-1 text-xs"
          >
            <option value="" disabled selected>
              {{ unmappedSchemes().length > 0 ? 'Select a scheme to associate...' : 'All available schemes are already mapped' }}
            </option>
            @for (scheme of unmappedSchemes(); track scheme.id) {
              <option [value]="scheme.schemeName">
                {{ scheme.schemeName }} (Category: {{ scheme.schemeCategory || 'General' }} | EMD: {{ formatAmount(scheme.amount) }})
              </option>
            }
          </select>

          <label class="flex items-center gap-1.5 text-xs text-slate-700 select-none cursor-pointer whitespace-nowrap px-1">
            <input
              type="checkbox"
              [(ngModel)]="newMappingMandatory"
              class="w-3.5 h-3.5 rounded border-slate-300 text-[#7C0E44] focus:ring-[#7C0E44]"
            />
            <span>Mandatory</span>
          </label>

          <button
            appButton
            size="sm"
            type="button"
            [disabled]="!selectedSchemeToAdd"
            (click)="addSchemeMapping()"
            class="shrink-0"
          >
            <app-icon name="plus" size="xs" />
            <span>Map Scheme</span>
          </button>
        </div>

        <!-- Selected Scheme Live Detail Preview Card -->
        @if (selectedSchemePreview(); as s) {
          <div class="p-2.5 rounded-lg bg-[#FCF8FA] border border-[#EADCE2] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-100">
            <div class="min-w-0">
              <strong class="text-[#7C0E44] font-bold block truncate">{{ s.schemeName }}</strong>
              <div class="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600">
                <span>Category: <strong>{{ s.schemeCategory }}</strong></span>
                <span>&bull;</span>
                <span>EOI: <strong>{{ s.categoryName }}</strong></span>
                <span>&bull;</span>
                <span>Budget: <strong>{{ formatBudget(s.budget) }}</strong></span>
                <span>&bull;</span>
                <span>EMD: <strong>{{ formatAmount(s.amount) }}</strong></span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0 self-start sm:self-center">
              &check; Ready to Map
            </span>
          </div>
        }
      </div>
    </app-action-modal>
  `
})
export class AssociatedSchemesModalComponent {
  private schemeReqService = inject(SchemeRequirementsService);
  private dataEngine = inject(DataEngineService);
  private cdr = inject(ChangeDetectorRef);

  readonly isOpen = input<boolean>(false);
  readonly targetItem = input<MasterItemTarget | null>(null);

  readonly close = output<void>();
  readonly schemesUpdated = output<{ itemId: string; schemes: string[] }>();

  readonly mappedSchemes = signal<MappedSchemeDetail[]>([]);
  readonly expandedId = signal<string | null>(null);

  selectedSchemeToAdd = '';
  newMappingMandatory = true;

  readonly mandatoryCount = computed(() => this.mappedSchemes().filter(m => m.isMandatory).length);
  readonly optionalCount = computed(() => this.mappedSchemes().filter(m => !m.isMandatory).length);

  /** All available schemes in the portal, dynamically populated from Scheme Master */
  readonly allAvailableSchemes = signal<SchemeMasterItem[]>([]);

  readonly unmappedSchemes = computed(() => {
    const mapped = new Set(this.mappedSchemes().map(m => m.schemeName.trim().toLowerCase()));
    return this.allAvailableSchemes().filter(s => !mapped.has(s.schemeName.trim().toLowerCase()));
  });

  readonly selectedSchemePreview = computed(() => {
    const sel = this.selectedSchemeToAdd?.trim().toLowerCase();
    if (!sel) return null;
    return this.allAvailableSchemes().find(s => s.schemeName.trim().toLowerCase() === sel) || null;
  });

  constructor() {
    this.loadAllSchemes();

    effect(() => {
      const open = this.isOpen();
      const item = this.targetItem();
      if (open && item) {
        this.reloadMappings(item);
      }
    });
  }

  private loadAllSchemes(): void {
    // 1. Start with enriched default mock schemes
    const masterLookup = new Map<string, SchemeMasterItem>();
    for (const s of MOCK_SCHEME_MASTER_ITEMS) {
      masterLookup.set(s.schemeName.trim().toLowerCase(), s);
    }

    // 2. Also incorporate any additional schemes from MOCK_SCHEMES (e.g. PMKVY, Solar)
    let nextId = masterLookup.size + 1;
    for (const t of MOCK_SCHEMES) {
      const key = t.schemeName.trim().toLowerCase();
      if (!masterLookup.has(key)) {
        masterLookup.set(key, {
          sNo: nextId++,
          id: `sch-${nextId}`,
          schemeName: t.schemeName,
          schemeCategory: t.schemeCategory || t.category || 'General',
          categoryName: t.eoiCategory || 'GENERAL',
          budget: 50000000,
          amount: t.emdAmount || 50000,
          processFees: t.processFeeAmount || 2000,
          status: 'Active'
        });
      }
    }

    // 3. Query repository for any dynamic schemes added by admin
    this.dataEngine.for<SchemeMasterItem>('SCHEME_MASTERS', { idKey: 'id' }).getAll().subscribe({
      next: (dbItems) => {
        if (dbItems && dbItems.length > 0) {
          for (const item of dbItems) {
            masterLookup.set(item.schemeName.trim().toLowerCase(), item);
          }
        }
        this.allAvailableSchemes.set(Array.from(masterLookup.values()));
        this.cdr.markForCheck();
      },
      error: () => {
        this.allAvailableSchemes.set(Array.from(masterLookup.values()));
        this.cdr.markForCheck();
      }
    });
  }

  private reloadMappings(item: MasterItemTarget): void {
    const list = this.schemeReqService.getSchemesForMasterItem(item.id, item.type);
    if (list.length === 0 && item.schemes && item.schemes.length > 0) {
      const available = this.allAvailableSchemes();
      for (const sch of item.schemes) {
        const found = available.find(s => s.schemeName.trim().toLowerCase() === sch.trim().toLowerCase());
        this.schemeReqService.addMapping({
          schemeId: found?.id || `sch-${Date.now()}`,
          schemeName: sch,
          schemeCode: found?.categoryName || 'GENERAL',
          requirementType: item.type,
          masterItemId: item.id,
          masterItemCode: `${item.type.substring(0, 3)}-${item.id}`,
          masterItemName: item.name,
          category: 'Standard',
          isMandatory: true,
          applicantCategory: 'ALL',
          displayOrder: 1,
          status: 'Active'
        });
      }
      this.mappedSchemes.set(this.schemeReqService.getSchemesForMasterItem(item.id, item.type));
    } else {
      this.mappedSchemes.set(list);
    }
  }

  toggleDetail(mappingId: string): void {
    this.expandedId.update(curr => curr === mappingId ? null : mappingId);
  }

  toggleMandatory(item: MappedSchemeDetail): void {
    this.schemeReqService.toggleMandatory(item.mappingId);
    const target = this.targetItem();
    if (target) {
      this.mappedSchemes.set(this.schemeReqService.getSchemesForMasterItem(target.id, target.type));
    }
  }

  removeMapping(item: MappedSchemeDetail): void {
    this.schemeReqService.removeMapping(item.mappingId);
    const target = this.targetItem();
    if (target) {
      const updated = this.schemeReqService.getSchemesForMasterItem(target.id, target.type);
      this.mappedSchemes.set(updated);
      this.schemesUpdated.emit({
        itemId: target.id,
        schemes: updated.map(m => m.schemeName)
      });
    }
  }

  addSchemeMapping(): void {
    const target = this.targetItem();
    if (!target || !this.selectedSchemeToAdd) return;

    const schName = this.selectedSchemeToAdd;
    const found = this.allAvailableSchemes().find(s => s.schemeName.trim().toLowerCase() === schName.trim().toLowerCase());

    this.schemeReqService.addMapping({
      schemeId: found?.id || `sch-${Date.now()}`,
      schemeName: schName,
      schemeCode: found?.categoryName || 'GENERAL',
      requirementType: target.type,
      masterItemId: target.id,
      masterItemCode: `${target.type.substring(0, 3)}-${target.id}`,
      masterItemName: target.name,
      category: 'Standard',
      isMandatory: this.newMappingMandatory,
      applicantCategory: 'ALL',
      displayOrder: this.mappedSchemes().length + 1,
      status: 'Active'
    });

    const updated = this.schemeReqService.getSchemesForMasterItem(target.id, target.type);
    this.mappedSchemes.set(updated);
    this.selectedSchemeToAdd = '';
    this.schemesUpdated.emit({
      itemId: target.id,
      schemes: updated.map(m => m.schemeName)
    });
  }

  formatBudget(val: number | undefined | null): string {
    if (val == null) return '₹ 50.00 Cr';
    return formatInr(val, { fractionDigits: 2 });
  }

  formatAmount(val: number | undefined | null): string {
    if (val == null) return '₹ 50,000';
    return formatInr(val, { fractionDigits: 0 });
  }

  closeModal(): void {
    this.close.emit();
  }
}
