import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, DepartmentMaster, SchemeMaster, FeeStructureMaster } from '../../../../core/services/eoi-state.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-masters',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe, SidebarComponent],
  template: `
    <div class="h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 antialiased overflow-hidden">
      <div class="flex flex-1 min-h-0 overflow-hidden w-full">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block shrink-0 h-full"></app-sidebar>

        <!-- Main Super Admin Content Area -->
        <main class="flex-1 min-w-0 min-h-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto overflow-x-hidden">
          
          <!-- Top Breadcrumb & Title Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div>
              <div class="text-[11px] font-mono text-[#131A4D] uppercase tracking-wider font-bold">
                Super Admin Master Records · Central System Config
              </div>
              <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">
                Master Data Administration (CRUD)
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Configure state department nodal desks, master scheme classifications & statutory fee rules.
              </p>
            </div>

            <!-- Master Tabs Switcher -->
            <div class="flex items-center bg-white border border-slate-200 p-1 shadow-2xs text-xs font-semibold rounded-xs">
              <button 
                (click)="activeTab = 'DEPT'"
                [class.bg-[#131A4D]]="activeTab === 'DEPT'"
                [class.text-white]="activeTab === 'DEPT'"
                [class.text-slate-700]="activeTab !== 'DEPT'"
                class="px-3.5 py-1.5 transition-colors rounded-xs">
                Departments ({{ (departments$ | async)?.length }})
              </button>
              <button 
                (click)="activeTab = 'SCHEMES'"
                [class.bg-[#131A4D]]="activeTab === 'SCHEMES'"
                [class.text-white]="activeTab === 'SCHEMES'"
                [class.text-slate-700]="activeTab !== 'SCHEMES'"
                class="px-3.5 py-1.5 transition-colors rounded-xs">
                Scheme Catalog ({{ (schemeMasters$ | async)?.length }})
              </button>
              <button 
                (click)="activeTab = 'FEES'"
                [class.bg-[#131A4D]]="activeTab === 'FEES'"
                [class.text-white]="activeTab === 'FEES'"
                [class.text-slate-700]="activeTab !== 'FEES'"
                class="px-3.5 py-1.5 transition-colors rounded-xs">
                Fee Structures ({{ (feeStructures$ | async)?.length }})
              </button>
            </div>
          </div>

          <!-- TAB 1: DEPARTMENTS MASTER -->
          <div *ngIf="activeTab === 'DEPT'" class="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xs">
            <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>🏛</span>
                <h2 class="text-xs font-bold uppercase tracking-wider">Government Departments & Nodal Desks</h2>
              </div>
              <button (click)="showAddDeptModal = true" class="px-3 py-1 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors">
                + Add Department
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-[#131A4D] text-white font-bold border-b border-[#082a45] uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-[#1a4f78]">Code</th>
                    <th class="p-3 border-r border-[#1a4f78]">Department Legal Name</th>
                    <th class="p-3 border-r border-[#1a4f78]">Nodal Officer</th>
                    <th class="p-3 border-r border-[#1a4f78]">Official Email</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">Active Tenders</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let dept of departments$ | async" class="hover:bg-blue-50/50 transition-colors">
                    <td class="p-3 font-mono font-bold text-[#131A4D] border-r border-slate-200">{{ dept.code }}</td>
                    <td class="p-3 font-bold text-slate-900 border-r border-slate-200">{{ dept.name }}</td>
                    <td class="p-3 border-r border-slate-200">{{ dept.nodalOfficer }}</td>
                    <td class="p-3 font-mono border-r border-slate-200 text-slate-600">{{ dept.email }}</td>
                    <td class="p-3 font-mono font-bold text-center border-r border-slate-200">{{ dept.activeTendersCount }}</td>
                    <td class="p-3 text-center">
                      <button class="text-[#131A4D] hover:underline font-bold text-xs">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 2: SCHEME CATALOG MASTER -->
          <div *ngIf="activeTab === 'SCHEMES'" class="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xs">
            <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>📑</span>
                <h2 class="text-xs font-bold uppercase tracking-wider">Master Scheme Directory</h2>
              </div>
              <button (click)="showAddSchemeModal = true" class="px-3 py-1 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors">
                + Add Scheme
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-[#131A4D] text-white font-bold border-b border-[#082a45] uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-[#1a4f78]">Scheme Code</th>
                    <th class="p-3 border-r border-[#1a4f78]">Scheme Title</th>
                    <th class="p-3 border-r border-[#1a4f78]">Department</th>
                    <th class="p-3 border-r border-[#1a4f78]">Category</th>
                    <th class="p-3 border-r border-[#1a4f78]">Default EMD</th>
                    <th class="p-3 border-r border-[#1a4f78]">Form Fee</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">Status</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let sch of schemeMasters$ | async" class="hover:bg-blue-50/50 transition-colors">
                    <td class="p-3 font-mono font-bold text-[#131A4D] border-r border-slate-200">{{ sch.schemeCode }}</td>
                    <td class="p-3 font-bold text-slate-900 border-r border-slate-200">{{ sch.name }}</td>
                    <td class="p-3 font-semibold border-r border-slate-200">{{ sch.department }}</td>
                    <td class="p-3 border-r border-slate-200">{{ sch.category }}</td>
                    <td class="p-3 font-mono font-bold border-r border-slate-200">₹{{ sch.defaultEmd | number:'1.0-0' }}</td>
                    <td class="p-3 font-mono border-r border-slate-200">₹{{ sch.defaultFormFee | number:'1.0-0' }}</td>
                    <td class="p-3 text-center border-r border-slate-200">
                      <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                        {{ sch.status }}
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      <button class="text-[#131A4D] hover:underline font-bold text-xs">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 3: FEE STRUCTURES MASTER -->
          <div *ngIf="activeTab === 'FEES'" class="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xs">
            <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>💳</span>
                <h2 class="text-xs font-bold uppercase tracking-wider">Statutory Fee Schedules & EMD Rules</h2>
              </div>
              <button (click)="showAddFeeModal = true" class="px-3 py-1 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors">
                + Add Fee Rule
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-[#131A4D] text-white font-bold border-b border-[#082a45] uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-[#1a4f78]">Category Definition</th>
                    <th class="p-3 border-r border-[#1a4f78]">Min. Annual Turnover</th>
                    <th class="p-3 border-r border-[#1a4f78]">Default Process Fee</th>
                    <th class="p-3 border-r border-[#1a4f78]">Default EMD Amount</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">MSME Exemption</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let fee of feeStructures$ | async" class="hover:bg-blue-50/50 transition-colors">
                    <td class="p-3 font-bold text-slate-900 border-r border-slate-200">{{ fee.categoryName }}</td>
                    <td class="p-3 font-mono font-semibold border-r border-slate-200">{{ fee.minTurnover }}</td>
                    <td class="p-3 font-mono border-r border-slate-200">₹{{ fee.defaultFormFee | number:'1.0-0' }}</td>
                    <td class="p-3 font-mono font-bold text-slate-900 border-r border-slate-200">₹{{ fee.defaultEmd | number:'1.0-0' }}</td>
                    <td class="p-3 text-center border-r border-slate-200">
                      <span [ngClass]="fee.exemptionApplicable ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'" class="px-2 py-0.5 border text-[10px] font-bold rounded">
                        {{ fee.exemptionApplicable ? 'Applicable' : 'No Exemption' }}
                      </span>
                    </td>
                    <td class="p-3 text-center">
                      <button class="text-[#131A4D] hover:underline font-bold text-xs">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Add Department Simple Modal -->
          <div *ngIf="showAddDeptModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-slate-300 max-w-md w-full overflow-hidden shadow-2xl rounded-xs">
              <div class="bg-[#131A4D] text-white px-5 py-3 font-bold text-sm">
                Add Department Nodal Record
              </div>
              <form [formGroup]="deptForm" (ngSubmit)="onAddDept()" class="p-5 space-y-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Department Code</label>
                  <input formControlName="code" placeholder="e.g. DOITC" class="w-full px-3 py-1.5 border border-slate-300 uppercase font-mono" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Department Full Legal Name</label>
                  <input formControlName="name" placeholder="e.g. Department of Information Technology" class="w-full px-3 py-1.5 border border-slate-300" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Nodal Officer Name & Title</label>
                  <input formControlName="nodalOfficer" placeholder="e.g. Sh. V. K. Gupta (Director)" class="w-full px-3 py-1.5 border border-slate-300" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Official Nodal Email</label>
                  <input formControlName="email" type="email" placeholder="director@rajasthan.gov.in" class="w-full px-3 py-1.5 border border-slate-300 font-mono" />
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <button type="button" (click)="showAddDeptModal = false" class="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xs">Cancel</button>
                  <button type="submit" class="px-4 py-1.5 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded-xs transition-colors shadow-xs">Save Record</button>
                </div>
              </form>
            </div>
          </div>

        </main>
      </div>

    </div>
  `
})
export class MastersComponent implements OnInit {
  activeTab: 'DEPT' | 'SCHEMES' | 'FEES' = 'DEPT';
  departments$!: Observable<DepartmentMaster[]>;
  schemeMasters$!: Observable<SchemeMaster[]>;
  feeStructures$!: Observable<FeeStructureMaster[]>;

  showAddDeptModal = false;
  showAddSchemeModal = false;
  showAddFeeModal = false;

  deptForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService
  ) {}

  ngOnInit(): void {
    this.departments$ = this.eoiService.departments$;
    this.schemeMasters$ = this.eoiService.schemeMasters$;
    this.feeStructures$ = this.eoiService.feeStructures$;

    this.deptForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nodalOfficer: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onAddDept(): void {
    if (this.deptForm.invalid) return;
    const val = this.deptForm.value;
    this.eoiService.addDepartment({
      code: val.code,
      name: val.name,
      nodalOfficer: val.nodalOfficer,
      email: val.email,
      phone: '+91 141 270 0000',
      activeTendersCount: 0
    });
    this.deptForm.reset();
    this.showAddDeptModal = false;
  }
}
