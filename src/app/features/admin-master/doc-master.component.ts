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
  TableColumn
} from '../../shared';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import { SchemeMasterItem } from '../../core/models/admin-masters.model';

export interface DocMasterItem {
  id: string;
  sNo?: number;
  schemeName: string;
  documents: string;
  status: 'Active' | 'Inactive';
}

const STORAGE_KEY = 'DOC_MASTER_ITEMS';

const INITIAL_DOC_ITEMS: DocMasterItem[] = [
  {
    id: 'doc-1',
    schemeName: 'Chief Minister Skill Development Scheme',
    documents: 'PAN Card, Registration Certificate, Bank Passbook',
    status: 'Active'
  },
  {
    id: 'doc-2',
    schemeName: 'Mukhyamantri Yuva Swavalamban Yojana',
    documents: 'Audited Balance Sheet, Income Proof, Caste Certificate',
    status: 'Inactive'
  },
  {
    id: 'doc-3',
    schemeName: 'Empanelment of Assessment Agencies EOI',
    documents: 'Accreditation Certificate, Past Work Experience, GSTIN',
    status: 'Inactive'
  },
  {
    id: 'doc-4',
    schemeName: 'Recruit-Train-Deploy (RTD) Category III',
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
    ActionModalComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-6">

      <!-- Page Header -->
      <app-page-header title="Doc Master">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <!-- Search Input -->
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative w-full">
              <input
                type="text"
                placeholder="Search by scheme name or document..."
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Add Doc Button -->
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Doc</span>
          </button>
        </div>
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
            type="button"
            (click)="$event.stopPropagation(); openViewModal(item)"
            class="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="View Details"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Edit Button -->
          <button
            type="button"
            (click)="$event.stopPropagation(); openEditModal(item)"
            class="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Edit Document"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>

          <!-- Active / Inactive Toggle -->
          <div class="inline-flex items-center gap-1.5" title="Toggle Status" (click)="$event.stopPropagation()">
            <button
              type="button"
              (click)="toggleStatus(item)"
              class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="item.status === 'Inactive' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-500 hover:bg-emerald-600'"
              role="switch"
              [attr.aria-checked]="item.status === 'Active'"
            >
              <span class="sr-only">Toggle Active Status</span>
              <span
                class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="item.status === 'Inactive' ? 'translate-x-0' : 'translate-x-3'"
              ></span>
            </button>
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
                type="text"
                [(ngModel)]="formData.schemeName"
                (focus)="openSchemeDropdown()"
                (input)="onSchemeInput()"
                placeholder="Select from dropdown or type scheme name..."
                [ngClass]="submitted() && !formData.schemeName.trim() ? 'border-red-500' : 'border-slate-300'"
                class="w-full pl-3 pr-9 py-2 border rounded-lg focus:outline-none focus:border-primary text-slate-800 text-sm bg-white"
                autocomplete="off"
              />
              <button
                type="button"
                (click)="toggleSchemeDropdown($event)"
                class="absolute right-2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded transition-colors"
                title="Toggle Scheme List"
              >
                <svg
                  class="w-4 h-4 transition-transform duration-200"
                  [class.rotate-180]="isSchemeDropdownOpen()"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
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
                        <svg class="w-4 h-4 text-brand shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
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
              type="text"
              [(ngModel)]="formData.docName"
              (focus)="isSchemeDropdownOpen.set(false)"
              placeholder="Enter document name (e.g. Aadhaar Card, PAN Card, Income Certificate)"
              [ngClass]="submitted() && !formData.docName.trim() ? 'border-red-500' : 'border-slate-300'"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-slate-800 text-sm bg-white"
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

    </div>
  `
})
export class DocMasterComponent implements OnInit, AfterViewInit {
  private storage = inject(StorageService);
  private notification = inject(NotificationService);
  private dataEngine = inject(DataEngineService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('actionTemplate', { static: true }) actionTemplate!: TemplateRef<any>;

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
    { key: 'action', label: 'Action', align: 'center', cellClass: 'whitespace-nowrap min-w-[220px]' }
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

  customTemplates = signal<Record<string, TemplateRef<any>>>({});

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

  getRowClass = (item: any): string => {
    const isInactive = item.status === 'Inactive';
    return isInactive ? 'opacity-50 bg-slate-100/70 transition-colors' : 'bg-white transition-colors';
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
    if (cached && Array.isArray(cached) && cached.length > 0) {
      const sanitized = cached.filter(
        (item) => item.schemeName !== 'SAMARTH' && item.schemeName !== 'DDU-GKY'
      );
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
