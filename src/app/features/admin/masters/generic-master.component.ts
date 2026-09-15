import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterService } from '../core/services/master.service';
import { ToastService } from '../core/services/toast.service';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../shared/components/modal/modal.component';

export interface MasterConfig {
  title: string;
  subtitle: string;
  icon: string;
  codeField: string;
  nameField: string;
  columns: { key: string; header: string; type?: 'text' | 'badge' | 'currency' | 'boolean' }[];
}

@Component({
  selector: 'admin-generic-master',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div>
      <admin-page-header 
        [title]="config.title"
        [subtitle]="config.subtitle"
        [icon]="config.icon"
        [breadcrumbs]="[{ label: 'Masters', url: '/admin/masters/schemes' }, { label: config.title }]">
        <div header-actions>
          <button 
            (click)="openAddModal()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            + Add New {{ config.title.replace('Master', '').trim() }}
          </button>
        </div>
      </admin-page-header>

      <!-- Search & Filters -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="relative w-full sm:w-80">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search master records..."
            class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
        </div>

        <div class="flex items-center gap-3">
          <!-- Cascade state selector for District / Block -->
          <div *ngIf="masterType === 'districts' || masterType === 'blocks'" class="flex items-center gap-1.5">
            <label class="text-xs font-semibold text-slate-600">State:</label>
            <select 
              [(ngModel)]="selectedState" 
              (ngModelChange)="onStateChange()"
              class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
              <option value="">All States</option>
              <option value="08">Rajasthan (08)</option>
              <option value="07">Delhi (07)</option>
              <option value="24">Gujarat (24)</option>
            </select>
          </div>

          <!-- Cascade district selector for Block -->
          <div *ngIf="masterType === 'blocks'" class="flex items-center gap-1.5">
            <label class="text-xs font-semibold text-slate-600">District:</label>
            <select 
              [(ngModel)]="selectedDistrict" 
              (ngModelChange)="onDistrictChange()"
              class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
              <option value="">All Districts</option>
              <option value="0801">Jaipur</option>
              <option value="0802">Jodhpur</option>
              <option value="0803">Udaipur</option>
              <option value="0804">Kota</option>
            </select>
          </div>

          <span class="text-xs text-slate-500 font-semibold">
            Count: {{ filteredItems().length }}
          </span>
        </div>
      </div>

      <!-- Table View -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-3 py-3.5 text-center w-12">Sr. No.</th>
                <th *ngFor="let col of config.columns" class="px-4 py-3.5">
                  {{ col.header }}
                </th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of filteredItems(); let i = index" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-3 py-3 text-center text-slate-400 font-medium">
                  {{ i + 1 }}
                </td>

                <td *ngFor="let col of config.columns" class="px-4 py-3 align-middle">
                  <ng-container *ngIf="col.type === 'currency'">
                    <span class="font-semibold text-slate-900">₹{{ item[col.key] | number:'1.0-0' }}</span>
                  </ng-container>
                  <ng-container *ngIf="col.type === 'boolean'">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold" [ngClass]="item[col.key] ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'">
                      {{ item[col.key] ? 'Required' : 'Optional' }}
                    </span>
                  </ng-container>
                  <ng-container *ngIf="!col.type || col.type === 'text'">
                    <span class="font-medium text-slate-800">{{ item[col.key] }}</span>
                  </ng-container>
                </td>

                <td class="px-4 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="item.status || 'Active'"></admin-status-badge>
                </td>

                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <button 
                      (click)="editItem(item)"
                      class="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" 
                      title="Edit Master Record">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      (click)="toggleStatus(item)"
                      class="p-1.5 rounded-md transition-colors cursor-pointer"
                      [ngClass]="item.status === 'Active' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'"
                      [title]="item.status === 'Active' ? 'Deactivate' : 'Activate'">
                      <span class="material-symbols-outlined text-[18px]">
                        {{ item.status === 'Active' ? 'toggle_on' : 'toggle_off' }}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredItems().length === 0">
                <td [attr.colspan]="config.columns.length + 3" class="py-10 text-center text-slate-400">
                  <span class="material-symbols-outlined text-[32px] text-slate-300 block mb-1">inventory_2</span>
                  No master records found matching filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Access Level Matrix Special Section (when viewing access-levels) -->
      <div *ngIf="masterType === 'access-levels'" class="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div class="flex items-center gap-2 text-blue-900">
            <span class="material-symbols-outlined text-[24px]">vpn_key</span>
            <div>
              <h3 class="font-bold text-sm">Granular Permission Matrix (Module vs Action)</h3>
              <p class="text-xs text-slate-500">Configured permissions for Super Admin, Department Admin, and Committee roles</p>
            </div>
          </div>
          <button (click)="savePermissionsMatrix()" class="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs">
            Save Permissions Matrix
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-700">
              <tr>
                <th class="p-3">Module</th>
                <th class="p-3 text-center">View</th>
                <th class="p-3 text-center">Create</th>
                <th class="p-3 text-center">Edit</th>
                <th class="p-3 text-center">Update</th>
                <th class="p-3 text-center">Delete</th>
                <th class="p-3 text-center">Publish</th>
                <th class="p-3 text-center">Approve</th>
                <th class="p-3 text-center">Export</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr *ngFor="let perm of currentMatrix()" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-900">{{ perm.module }}</td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.view" class="rounded text-blue-600" /></td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.create" class="rounded text-blue-600" /></td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.edit" class="rounded text-blue-600" /></td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.update" class="rounded text-blue-600" /></td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.delete" class="rounded text-blue-600" /></td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.publish" class="rounded text-blue-600" /></td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.approve" class="rounded text-blue-600" /></td>
                <td class="p-3 text-center"><input type="checkbox" [(ngModel)]="perm.export" class="rounded text-blue-600" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <admin-modal 
        [isOpen]="isModalOpen()" 
        [title]="isEditing() ? 'Edit Master Record' : 'Add ' + config.title"
        [icon]="config.icon"
        (close)="isModalOpen.set(false)">
        <form [formGroup]="masterForm" (ngSubmit)="saveModalItem()" modal-body class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Code / Identifier *</label>
            <input 
              type="text" 
              formControlName="code"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Title / Name *</label>
            <input 
              type="text" 
              formControlName="name"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <div *ngIf="masterType === 'eoi-categories' || masterType === 'fees'">
            <label class="block text-xs font-bold text-slate-700 mb-1">Amount (INR)</label>
            <input 
              type="number" 
              formControlName="amount"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Description / Remarks</label>
            <textarea 
              rows="2" 
              formControlName="description"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select 
              formControlName="status"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>

        <div modal-footer class="flex items-center gap-2">
          <button (click)="isModalOpen.set(false)" class="px-3.5 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100">
            Cancel
          </button>
          <button (click)="saveModalItem()" class="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs">
            Save Record
          </button>
        </div>
      </admin-modal>
    </div>
  `
})
export class GenericMasterComponent implements OnInit {
  private masterService = inject(MasterService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  masterType = '';
  config: MasterConfig = {
    title: 'Master Management',
    subtitle: '',
    icon: 'database',
    codeField: 'code',
    nameField: 'name',
    columns: []
  };

  items = signal<any[]>([]);
  searchQuery = '';
  selectedState = '';
  selectedDistrict = '';

  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingId: string | null = null;
  masterForm!: FormGroup;

  currentMatrix = signal<any[]>([]);

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.masterType = data['type'] || 'scheme-categories';
      this.setupMasterConfig();
      this.loadMasterData();
    });

    this.masterForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      amount: [0],
      description: [''],
      status: ['Active', Validators.required]
    });
  }

  setupMasterConfig(): void {
    switch (this.masterType) {
      case 'scheme-categories':
        this.config = {
          title: 'Scheme Category Master',
          subtitle: 'Classifications of State and Centrally Sponsored schemes (SDT, CSS, Affirmative, Infrastructure)',
          icon: 'category',
          codeField: 'categoryCode',
          nameField: 'categoryName',
          columns: [
            { key: 'categoryCode', header: 'Category Code' },
            { key: 'categoryName', header: 'Category Name' },
            { key: 'description', header: 'Description' }
          ]
        };
        break;

      case 'eoi-categories':
        this.config = {
          title: 'EOI Category Master',
          subtitle: 'Application fee and processing fee rates based on organization classifications (General, PSU, NGO, MSME)',
          icon: 'loyalty',
          codeField: 'categoryName',
          nameField: 'categoryName',
          columns: [
            { key: 'schemeName', header: 'Scheme Name' },
            { key: 'categoryName', header: 'Category Name' },
            { key: 'amount', header: 'EMD Amount', type: 'currency' },
            { key: 'processingFee', header: 'Processing Fee', type: 'currency' }
          ]
        };
        break;

      case 'departments':
        this.config = {
          title: 'Department Master',
          subtitle: 'Administrative Departments, Directorates, and statutory mission corporations in Rajasthan',
          icon: 'corporate_fare',
          codeField: 'departmentCode',
          nameField: 'departmentName',
          columns: [
            { key: 'departmentCode', header: 'Dept Code' },
            { key: 'departmentName', header: 'Department Name' },
            { key: 'shortName', header: 'Short Name' },
            { key: 'contactEmail', header: 'Contact Email' }
          ]
        };
        break;

      case 'organization-types':
        this.config = {
          title: 'Organization Type Master',
          subtitle: 'Legal entity types permitted to submit EOI applications (Govt, Society, Trust, Private Ltd, PSU)',
          icon: 'domain',
          codeField: 'code',
          nameField: 'organizationType',
          columns: [
            { key: 'code', header: 'Code' },
            { key: 'organizationType', header: 'Organization Type' },
            { key: 'description', header: 'Description' }
          ]
        };
        break;

      case 'user-types':
        this.config = {
          title: 'User Type Master',
          subtitle: 'System administrative classifications (Super Admin, Dept Admin, Dept User, Third Party, Committee)',
          icon: 'badge',
          codeField: 'userTypeCode',
          nameField: 'userTypeName',
          columns: [
            { key: 'userTypeCode', header: 'Type Code' },
            { key: 'userTypeName', header: 'User Type Name' },
            { key: 'description', header: 'Description' }
          ]
        };
        break;

      case 'designations':
        this.config = {
          title: 'Designation Master',
          subtitle: 'Official government designations assigned to system users and committee members',
          icon: 'military_tech',
          codeField: 'designationCode',
          nameField: 'designationName',
          columns: [
            { key: 'designationCode', header: 'Code' },
            { key: 'designationName', header: 'Designation' },
            { key: 'department', header: 'Department' }
          ]
        };
        break;

      case 'states':
        this.config = {
          title: 'State Master',
          subtitle: 'State and Union Territory geographical jurisdictions across India',
          icon: 'map',
          codeField: 'stateCode',
          nameField: 'stateName',
          columns: [
            { key: 'stateCode', header: 'State Code' },
            { key: 'stateName', header: 'State Name' },
            { key: 'stateShortCode', header: 'Short Code' }
          ]
        };
        break;

      case 'districts':
        this.config = {
          title: 'District Master',
          subtitle: 'Districts mapped under State jurisdiction (State → District cascade)',
          icon: 'location_city',
          codeField: 'districtCode',
          nameField: 'districtName',
          columns: [
            { key: 'stateName', header: 'State' },
            { key: 'districtCode', header: 'District Code' },
            { key: 'districtName', header: 'District Name' }
          ]
        };
        break;

      case 'blocks':
        this.config = {
          title: 'Block Master',
          subtitle: 'Sub-divisional revenue blocks (State → District → Block cascade)',
          icon: 'signpost',
          codeField: 'blockCode',
          nameField: 'blockName',
          columns: [
            { key: 'stateName', header: 'State' },
            { key: 'districtName', header: 'District' },
            { key: 'blockCode', header: 'Block Code' },
            { key: 'blockName', header: 'Block Name' }
          ]
        };
        break;

      case 'document-types':
        this.config = {
          title: 'Document Type Master',
          subtitle: 'Checklist of statutory compliance documents, file formats, and upload constraints',
          icon: 'upload_file',
          codeField: 'documentCode',
          nameField: 'documentName',
          columns: [
            { key: 'schemeName', header: 'Scheme' },
            { key: 'documentCode', header: 'Document Code' },
            { key: 'documentName', header: 'Document Name' },
            { key: 'allowedFileTypes', header: 'Allowed Format' },
            { key: 'isRequired', header: 'Required', type: 'boolean' }
          ]
        };
        break;

      case 'transactions':
        this.config = {
          title: 'Transaction Master',
          subtitle: 'Standardized payment and scrutiny transaction heads',
          icon: 'receipt_long',
          codeField: 'transactionCode',
          nameField: 'transactionName',
          columns: [
            { key: 'transactionCode', header: 'Code' },
            { key: 'transactionName', header: 'Transaction Name' },
            { key: 'transactionType', header: 'Type' }
          ]
        };
        break;

      case 'fees':
        this.config = {
          title: 'Fee Master',
          subtitle: 'Standard fee rates, EMD deposits, GST applicability, and calculation models',
          icon: 'payments',
          codeField: 'feeCode',
          nameField: 'feeName',
          columns: [
            { key: 'feeCode', header: 'Code' },
            { key: 'feeName', header: 'Fee Head' },
            { key: 'feeType', header: 'Type' },
            { key: 'calculationType', header: 'Calculation' },
            { key: 'amount', header: 'Base Amount', type: 'currency' }
          ]
        };
        break;

      case 'roles':
        this.config = {
          title: 'Role Master',
          subtitle: 'Security authorization roles defined across the EOI administration system',
          icon: 'admin_panel_settings',
          codeField: 'roleCode',
          nameField: 'roleName',
          columns: [
            { key: 'roleCode', header: 'Role Code' },
            { key: 'roleName', header: 'Role Name' },
            { key: 'description', header: 'Description' }
          ]
        };
        break;

      case 'access-levels':
        this.config = {
          title: 'Access Level Master',
          subtitle: 'Granular permissions matrix (View, Create, Edit, Update, Delete, Publish, Approve, Export) across 14 modules',
          icon: 'security',
          codeField: 'roleCode',
          nameField: 'roleName',
          columns: [
            { key: 'roleCode', header: 'Role Code' },
            { key: 'roleName', header: 'Profile Name' }
          ]
        };
        break;

      case 'application-status':
        this.config = {
          title: 'Application Status Master',
          subtitle: 'Lifecycle states of applicant submissions from Draft to Acceptance or Rejection',
          icon: 'timeline',
          codeField: 'statusCode',
          nameField: 'statusName',
          columns: [
            { key: 'statusCode', header: 'Status Code' },
            { key: 'statusName', header: 'Status Title' },
            { key: 'description', header: 'Description' }
          ]
        };
        break;

      case 'committee-roles':
        this.config = {
          title: 'Committee Role Master',
          subtitle: 'Roles within technical evaluation committee (Chairperson, Member, Reviewer, Secretary)',
          icon: 'groups',
          codeField: 'code',
          nameField: 'name',
          columns: [
            { key: 'code', header: 'Code' },
            { key: 'name', header: 'Role Name' },
            { key: 'description', header: 'Description' }
          ]
        };
        break;

      default:
        this.config = {
          title: 'Master Catalog',
          subtitle: 'Master configuration values',
          icon: 'database',
          codeField: 'code',
          nameField: 'name',
          columns: []
        };
    }
  }

  loadMasterData(): void {
    switch (this.masterType) {
      case 'scheme-categories':
        this.masterService.getSchemeCategories().subscribe(data => this.items.set(data));
        break;
      case 'eoi-categories':
        this.masterService.getEoiCategories().subscribe(data => this.items.set(data));
        break;
      case 'departments':
        this.masterService.getDepartments().subscribe(data => this.items.set(data));
        break;
      case 'organization-types':
        this.masterService.getOrganizationTypes().subscribe(data => this.items.set(data));
        break;
      case 'user-types':
        this.masterService.getUserTypes().subscribe(data => this.items.set(data));
        break;
      case 'designations':
        this.masterService.getDesignations().subscribe(data => this.items.set(data));
        break;
      case 'states':
        this.masterService.getStates().subscribe(data => this.items.set(data));
        break;
      case 'districts':
        this.masterService.getDistricts(this.selectedState).subscribe(data => this.items.set(data));
        break;
      case 'blocks':
        this.masterService.getBlocks(this.selectedDistrict).subscribe(data => this.items.set(data));
        break;
      case 'document-types':
        this.masterService.getDocumentTypes().subscribe(data => this.items.set(data));
        break;
      case 'transactions':
        this.masterService.getTransactions().subscribe(data => this.items.set(data));
        break;
      case 'fees':
        this.masterService.getFees().subscribe(data => this.items.set(data));
        break;
      case 'roles':
        this.masterService.getRoles().subscribe(data => this.items.set(data));
        break;
      case 'access-levels':
        this.masterService.getAccessLevels().subscribe(data => {
          this.items.set(data);
          if (data.length > 0 && data[0].permissions) {
            this.currentMatrix.set(JSON.parse(JSON.stringify(data[0].permissions)));
          }
        });
        break;
      case 'application-status':
        this.masterService.getApplicationStatuses().subscribe(data => this.items.set(data));
        break;
      case 'committee-roles':
        this.masterService.getCommitteeRoles().subscribe(data => this.items.set(data));
        break;
    }
  }

  onStateChange(): void {
    if (this.masterType === 'districts') {
      this.masterService.getDistricts(this.selectedState).subscribe(d => this.items.set(d));
    }
  }

  onDistrictChange(): void {
    if (this.masterType === 'blocks') {
      this.masterService.getBlocks(this.selectedDistrict).subscribe(b => this.items.set(b));
    }
  }

  filteredItems(): any[] {
    if (!this.searchQuery) return this.items();
    const q = this.searchQuery.toLowerCase();
    return this.items().filter(item => 
      Object.values(item).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(q))
    );
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId = null;
    this.masterForm.reset({
      code: '',
      name: '',
      amount: 0,
      description: '',
      status: 'Active'
    });
    this.isModalOpen.set(true);
  }

  editItem(item: any): void {
    this.isEditing.set(true);
    this.editingId = item.id;
    this.masterForm.patchValue({
      code: item[this.config.codeField] || item.code || '',
      name: item[this.config.nameField] || item.name || '',
      amount: item.amount || 0,
      description: item.description || '',
      status: item.status || 'Active'
    });
    this.isModalOpen.set(true);
  }

  saveModalItem(): void {
    if (this.masterForm.invalid) {
      this.toastService.error('Validation Error', 'Please complete required fields.');
      return;
    }

    const val = this.masterForm.value;
    const current = this.items();

    if (this.isEditing() && this.editingId) {
      const idx = current.findIndex(i => i.id === this.editingId);
      if (idx !== -1) {
        current[idx] = {
          ...current[idx],
          [this.config.codeField]: val.code,
          [this.config.nameField]: val.name,
          amount: val.amount,
          description: val.description,
          status: val.status
        };
        this.items.set([...current]);
        this.toastService.success('Record Updated', `Master record updated successfully.`);
      }
    } else {
      const newItem = {
        id: `REC-${Date.now()}`,
        [this.config.codeField]: val.code,
        [this.config.nameField]: val.name,
        amount: val.amount,
        description: val.description,
        status: val.status
      };
      this.items.set([newItem, ...current]);
      this.toastService.success('Record Created', `New record added to ${this.config.title}.`);
    }

    this.isModalOpen.set(false);
  }

  toggleStatus(item: any): void {
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    this.toastService.success('Status Updated', `${item[this.config.nameField] || 'Item'} marked ${item.status}`);
  }

  savePermissionsMatrix(): void {
    this.toastService.success('Permissions Updated', 'State Access Level Matrix saved and enforced globally.');
  }
}
