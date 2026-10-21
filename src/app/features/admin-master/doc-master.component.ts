import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  inject,
  signal,
  computed,
  DestroyRef,
  HostListener
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PageHeaderComponent,
  TableComponent,
  ActionModalComponent,
  ButtonComponent,
  IconComponent,
  InputDirective,
  PageShellComponent,
  SwitchComponent,
  TableColumn
} from '../../shared';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import { SchemeMasterItem, DocMasterItem } from '../../core/models/admin-masters.model';

export type { DocMasterItem };

export const DOC_MASTER_STORAGE_KEY = 'DOC_MASTER_ITEMS';
const STORAGE_KEY = DOC_MASTER_STORAGE_KEY;

export const INITIAL_DOC_ITEMS: DocMasterItem[] = [
  {
    id: 'doc-1',
    schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana',
    documents: 'PAN Card, Registration Certificate, Bank Passbook',
    status: 'Active'
  },
  {
    id: 'doc-2',
    schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)',
    documents: 'Audited Balance Sheet, Income Proof, Caste Certificate',
    status: 'Active'
  },
  {
    id: 'doc-3',
    schemeName: 'Mukhyamantri Yuva Sambal Yojana',
    documents: 'Accreditation Certificate, Past Work Experience, GSTIN',
    status: 'Active'
  },
  {
    id: 'doc-4',
    schemeName: 'Mukhya Mantri Yuva Kaushal Yojana',
    documents: 'Tie-up Agreement, Center Infrastructure Proof',
    status: 'Active'
  }
];

@Component({
  selector: 'app-doc-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent,
    ActionModalComponent,
    ButtonComponent,
    IconComponent,
    InputDirective,
    PageShellComponent,
    SwitchComponent
  ],
  template: `
    <app-page-shell>

      <!-- Page Header -->
      <app-page-header
        title="Doc Master"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Doc Master' }]"
        [searchable]="true"
        searchPlaceholder="Search by scheme name or document..."
        [(searchQuery)]="searchQuery"
      >
        <!-- Add Doc Button -->
        <button
          appButton
          size="sm"
          type="button"
          (click)="openAddModal()"
          class="shrink-0"
        >
          <app-icon name="plus" size="sm" />
          <span>Add Doc</span>
        </button>
      </app-page-header>

      <!-- Table with Inactive Row Darkening (Consistent with other masters) -->
      <app-table
        [rowClass]="getRowClass"
        [columns]="columns"
        [data]="filteredItems()"
        [loading]="loading()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="documents"
        [customTemplates]="customTemplates()"
      >
      </app-table>

      <!-- Action Cell Template: View, Edit, Active/Inactive Toggle -->
      <ng-template #actionTemplate let-item>
        <div class="flex items-center justify-center whitespace-nowrap">
          <!-- View Button -->
          <button
            appButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="$event.stopPropagation(); openViewModal(item)"
            title="View Details"
          >
            <app-icon name="eye" size="sm" />
            <span>View</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Edit Button -->
          <button
            appButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="$event.stopPropagation(); openEditModal(item)"
            title="Edit Document"
          >
            <app-icon name="edit" size="sm" />
            <span>Edit</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Active / Inactive Toggle -->
          <div class="inline-flex items-center gap-1.5" title="Toggle Status" (click)="$event.stopPropagation()">
            <app-switch
              [checked]="item.status === 'Active'"
              label="Toggle Active Status"
              (toggled)="toggleStatus(item)"
            />
            <span
              class="font-medium text-[12px] select-none transition-colors cursor-pointer"
              (click)="toggleStatus(item)"
              [ngClass]="item.status === 'Inactive' ? 'text-slate-700 font-semibold hover:text-slate-900' : 'text-emerald-600 hover:text-emerald-700'"
            >
              {{ item.status === 'Inactive' ? 'Inactive' : 'Active' }}
            </span>
          </div>
        </div>
      </ng-template>

      <!-- Add / Edit Modal -->
      <app-action-modal
        [isOpen]="showModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Save"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[520px]"
        (primaryAction)="saveDoc()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <h2 class="m-0 text-brand-dark" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ isEditing() ? 'Edit Doc' : 'Add Doc' }}
        </h2>

        <div
          class="mt-4 font-sans text-[13px] space-y-4 min-h-[170px] pb-2"
          (pointerdown)="closeDropdownIfOutside($any($event.target))"
          (click)="closeDropdownIfOutside($any($event.target))"
          (focusin)="closeDropdownIfOutside($any($event.target))"
        >
          <!-- Scheme Name Field (Combobox: Dropdown from Scheme Master + Editable input) -->
          <div class="relative" id="scheme-combobox-wrapper">
            <label class="block text-slate-700 font-medium mb-1">
              Scheme Name <span class="text-rose-500">*</span>
            </label>
            <div class="relative flex items-center">
              <input
                appInput
                type="text"
                [(ngModel)]="formData.schemeName"
                (focus)="openSchemeDropdown()"
                (input)="onSchemeInput()"
                placeholder="Select from dropdown or type scheme name..."
                [invalid]="submitted() && !formData.schemeName.trim()"
                class="pr-9"
                autocomplete="off"
              />
              <button
                appButton
                variant="ghost"
                size="sm"
                iconOnly
                type="button"
                (click)="toggleSchemeDropdown($event)"
                class="absolute right-2"
                title="Toggle Scheme List"
                aria-label="Toggle Scheme List"
              >
                <app-icon
                  name="chevron-down"
                  class="transition-transform duration-200"
                  [class.rotate-180]="isSchemeDropdownOpen()"
                />
              </button>
            </div>

            @if (submitted() && !formData.schemeName.trim()) {
              <p class="text-xs text-red-500 mt-1 font-medium">Scheme Name is required</p>
            }

            <!-- Floating Scheme Options (Closes immediately when option is selected) -->
            @if (isSchemeDropdownOpen() && filteredSchemeOptions().length > 0) {
              <div
                class="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden font-sans max-h-48 overflow-y-auto"
                role="listbox"
              >
                <ul class="py-1 divide-y divide-slate-100 text-xs sm:text-[13px]">
                  @for (scheme of filteredSchemeOptions(); track scheme) {
                    <li
                      (click)="selectScheme(scheme)"
                      class="px-3.5 py-2 cursor-pointer transition-colors flex items-center justify-between hover:bg-slate-50 text-slate-700"
                      [class.bg-sky-50]="scheme === formData.schemeName"
                      [class.text-brand]="scheme === formData.schemeName"
                      [class.font-semibold]="scheme === formData.schemeName"
                      role="option"
                    >
                      <span class="truncate">{{ scheme }}</span>
                      @if (scheme === formData.schemeName) {
                        <app-icon name="check" [stroke]="2.5" class="text-brand shrink-0 ml-2" />
                      }
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <!-- Doc Name Field (Never covered or hidden) -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">
              Doc Name <span class="text-rose-500">*</span>
            </label>
            <input
              appInput
              type="text"
              [(ngModel)]="formData.docName"
              (focus)="isSchemeDropdownOpen.set(false)"
              placeholder="Enter document name (e.g. Aadhaar Card, PAN Card, Income Certificate)"
              [invalid]="submitted() && !formData.docName.trim()"
            />
            @if (submitted() && !formData.docName.trim()) {
              <p class="text-xs text-red-500 mt-1 font-medium">Doc Name is required</p>
            }
          </div>
        </div>
      </app-action-modal>

      <!-- View Details Modal -->
      <app-action-modal
        [isOpen]="showViewModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="false"
        primaryLabel=""
        secondaryLabel="Close"
        maxWidthClass="max-w-[480px]"
        (secondaryAction)="closeViewModal()"
        (close)="closeViewModal()"
      >
        <h2 class="m-0 text-brand-dark" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Document Details
        </h2>

        @if (selectedDoc(); as doc) {
          <div class="mt-4 font-sans text-[13px] space-y-3.5 divide-y divide-slate-100">
            <div class="pt-1 flex flex-col gap-1">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheme Name</span>
              <span class="text-sm font-semibold text-slate-800">{{ doc.schemeName }}</span>
            </div>

            <div class="pt-3 flex flex-col gap-1">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents</span>
              <span class="text-sm font-medium text-slate-800">{{ doc.documents }}</span>
            </div>

            <div class="pt-3 flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none"
                [ngClass]="doc.status === 'Inactive' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
              >
                {{ doc.status }}
              </span>
            </div>
          </div>
        }
      </app-action-modal>

    </app-page-shell>
  `
})
export class DocMasterComponent implements OnInit, AfterViewInit {
  private storage = inject(StorageService);
  private notification = inject(NotificationService);
  private dataEngine = inject(DataEngineService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('actionTemplate', { static: true }) actionTemplate!: TemplateRef<unknown>;

  // Active & inactive schemes from Scheme Master
  readonly schemeMasterActiveNames = signal<string[]>([]);
  readonly schemeMasterInactiveNames = signal<string[]>([]);

  // Dropdown options strictly reflect active schemes from Scheme Master
  readonly schemeOptions = computed(() => {
    return this.schemeMasterActiveNames();
  });

  // Filtered dropdown list based on user search/input
  readonly filteredSchemeOptions = computed(() => {
    const all = this.schemeOptions();
    const search = this.formData.schemeName?.toLowerCase().trim() || '';
    if (!search) return all;
    return all.filter((s) => s.toLowerCase().includes(search));
  });

  readonly columns: TableColumn<DocMasterItem>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'schemeName', label: 'Scheme Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[220px]' },
    { key: 'documents', label: 'Documents', cellClass: 'font-medium text-slate-700 min-w-[260px]' },
    { key: 'action', label: 'Action', align: 'center', width: 'min-w-[210px]', cellClass: 'whitespace-nowrap' }
  ];

  searchQuery = signal<string>('');
  loading = signal<boolean>(false);
  items = signal<DocMasterItem[]>([]);

  // Add / Edit Modal state
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingId = signal<string | null>(null);
  submitted = signal<boolean>(false);
  formData = { schemeName: '', docName: '' };
  isSchemeDropdownOpen = signal<boolean>(false);

  // View Modal state
  showViewModal = signal<boolean>(false);
  selectedDoc = signal<DocMasterItem | null>(null);

  customTemplates = signal<Record<string, TemplateRef<unknown>>>({});

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.items();
    if (!q) return all;
    return all.filter(
      (item) =>
        item.schemeName.toLowerCase().includes(q) ||
        item.documents.toLowerCase().includes(q)
    );
  });

  getRowClass = (item: { status?: string }): string => {
    const isInactive = item.status === 'Inactive';
    return isInactive ? 'opacity-50 !bg-slate-100/70 transition-colors' : 'bg-white transition-colors';
  };

  closeDropdownIfOutside(target: HTMLElement | null): void {
    if (!target || !target.closest('#scheme-combobox-wrapper')) {
      this.isSchemeDropdownOpen.set(false);
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    this.closeDropdownIfOutside(event.target as HTMLElement);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.closeDropdownIfOutside(event.target as HTMLElement);
  }

  @HostListener('document:focusin', ['$event'])
  onDocumentFocusIn(event: FocusEvent): void {
    this.closeDropdownIfOutside(event.target as HTMLElement);
  }

  ngOnInit(): void {
    this.loadData();
    this.loadSchemes();
  }

  ngAfterViewInit(): void {
    this.customTemplates.set({
      action: this.actionTemplate
    });
  }

  private loadSchemes(): void {
    const schemeRepo = this.dataEngine.for<SchemeMasterItem>('SCHEME_MASTERS', { idKey: 'id' });
    schemeRepo
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (schemes) => {
          const activeNames = (schemes || [])
            .filter((s) => s.status !== 'Inactive')
            .map((s) => s.schemeName?.trim())
            .filter((name): name is string => !!name);

          const inactiveNames = (schemes || [])
            .filter((s) => s.status === 'Inactive')
            .map((s) => s.schemeName?.trim())
            .filter((name): name is string => !!name);

          this.schemeMasterActiveNames.set(activeNames);
          this.schemeMasterInactiveNames.set(inactiveNames);
        },
        error: () => {
          this.schemeMasterActiveNames.set([]);
          this.schemeMasterInactiveNames.set([]);
        }
      });
  }

  private loadData(): void {
    const cached = this.storage.getItem<DocMasterItem[]>(STORAGE_KEY);
    const hasTargetSchemes = cached && Array.isArray(cached) && cached.some(
      (item) => item.schemeName === 'Vishwakarma Yuva Udyami Protsahan Yojana'
    );
    if (hasTargetSchemes && cached && Array.isArray(cached)) {
      const dummyNames = [
        'hi',
        'Chief Minister Skill Development Scheme',
        'Mukhyamantri Yuva Swavalamban Yojana',
        'Empanelment of Assessment Agencies EOI',
        'Recruit-Train-Deploy (RTD) Category III',
        'SAMARTH',
        'DDU-GKY'
      ];
      const sanitized = cached.filter((item) => !dummyNames.includes(item.schemeName));
      this.items.set(sanitized);
      this.storage.setItem(STORAGE_KEY, sanitized);
    } else {
      this.items.set(INITIAL_DOC_ITEMS);
      this.storage.setItem(STORAGE_KEY, INITIAL_DOC_ITEMS);
    }
  }

  private persistData(updated: DocMasterItem[]): void {
    this.items.set(updated);
    this.storage.setItem(STORAGE_KEY, updated);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  openAddModal(): void {
    this.loadSchemes();
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formData = { schemeName: '', docName: '' };
    this.isSchemeDropdownOpen.set(false);
    this.submitted.set(false);
    this.showModal.set(true);
  }

  openEditModal(item: DocMasterItem): void {
    this.loadSchemes();
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.formData = { schemeName: item.schemeName, docName: item.documents };
    this.isSchemeDropdownOpen.set(false);
    this.submitted.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.isSchemeDropdownOpen.set(false);
    this.submitted.set(false);
  }

  toggleSchemeDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isSchemeDropdownOpen.update((v) => !v);
  }

  openSchemeDropdown(): void {
    this.isSchemeDropdownOpen.set(true);
  }

  onSchemeInput(): void {
    if (!this.isSchemeDropdownOpen()) {
      this.isSchemeDropdownOpen.set(true);
    }
  }

  selectScheme(scheme: string): void {
    this.formData.schemeName = scheme;
    this.isSchemeDropdownOpen.set(false);
  }

  saveDoc(): void {
    this.submitted.set(true);
    const schemeName = this.formData.schemeName.trim();
    const docName = this.formData.docName.trim();

    if (!schemeName || !docName) {
      return;
    }

    if (this.isEditing()) {
      const id = this.editingId();
      const updated = this.items().map((it) => {
        if (it.id === id) {
          return { ...it, schemeName, documents: docName };
        }
        return it;
      });
      this.persistData(updated);
      this.notification.success('Document updated successfully');
    } else {
      const newItem: DocMasterItem = {
        id: 'doc-' + Date.now(),
        schemeName,
        documents: docName,
        status: 'Active'
      };
      this.persistData([newItem, ...this.items()]);
      this.notification.success('Document added successfully');
    }

    this.closeModal();
  }

  openViewModal(item: DocMasterItem): void {
    this.selectedDoc.set(item);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedDoc.set(null);
  }

  toggleStatus(item: DocMasterItem): void {
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    const updated = this.items().map((it) => {
      if (it.id === item.id) {
        return { ...it, status: newStatus as 'Active' | 'Inactive' };
      }
      return it;
    });
    this.persistData(updated);
    this.notification.success(`Document marked as ${newStatus}`);
  }
}
