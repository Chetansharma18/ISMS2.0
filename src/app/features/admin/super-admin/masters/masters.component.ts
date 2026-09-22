import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, DepartmentMaster, SchemeMaster, FeeStructureMaster, CourseMaster } from '../../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-masters',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <!-- Main Super Admin Content Area -->
        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
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
              <button 
                (click)="activeTab = 'COURSES'"
                [class.bg-[#131A4D]]="activeTab === 'COURSES'"
                [class.text-white]="activeTab === 'COURSES'"
                [class.text-slate-700]="activeTab !== 'COURSES'"
                class="px-3.5 py-1.5 transition-colors rounded-xs border-l border-slate-200">
                Sectors & Courses
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
              <button (click)="openAddDeptModal()" class="px-3 py-1 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors border border-white/30">
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
                      <button (click)="openEditDeptModal(dept)" class="text-[#131A4D] hover:text-blue-700 hover:underline font-bold text-xs transition-colors">✏️ Edit</button>
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
              <button (click)="openAddSchemeModal()" class="px-3 py-1 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors border border-white/30">
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
                      <button (click)="openEditSchemeModal(sch)" class="text-[#131A4D] hover:text-blue-700 hover:underline font-bold text-xs transition-colors">✏️ Edit</button>
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
              <button (click)="openAddFeeModal()" class="px-3 py-1 bg-[#131A4D] hover:bg-[#004d73] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors border border-white/30">
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
                      <button (click)="openEditFeeModal(fee)" class="text-[#131A4D] hover:text-blue-700 hover:underline font-bold text-xs transition-colors">✏️ Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 4: SECTORS & COURSES MASTER -->
          <div *ngIf="activeTab === 'COURSES'" class="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xs">
            <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>📚</span>
                <h2 class="text-xs font-bold uppercase tracking-wider">Course Master Catalog</h2>
              </div>
              <div class="flex gap-2">
                <button (click)="openAddCourseModal()" class="px-3 py-1 bg-white text-[#131A4D] hover:bg-slate-100 text-xs font-bold rounded-xs shadow-2xs transition-colors">
                  + Add Course
                </button>
              </div>
            </div>

            <div class="p-6">
              <div class="grid grid-cols-1 gap-6">
                <!-- Courses Block -->
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                  <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 class="font-bold text-[#131A4D] text-sm">All Available Courses</h3>
                      <p class="text-xs text-slate-500">Global Course Master synced from Excel & Admin</p>
                    </div>
                  </div>
                  <div class="p-4 h-[500px] overflow-y-auto">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0 bg-white z-10">
                          <th class="pb-2 font-bold w-32">Course Code</th>
                          <th class="pb-2 font-bold">Course Name</th>
                          <th class="pb-2 font-bold">Duration (Hrs)</th>
                          <th class="pb-2 font-bold">NSQF Level</th>
                          <th class="pb-2 font-bold">Mapped Schemes</th>
                          <th class="pb-2 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr *ngFor="let course of courses$ | async" class="hover:bg-slate-50 transition-colors">
                          <td class="py-2 font-mono font-bold text-[#131A4D]">{{ course.courseCode }}</td>
                          <td class="py-2 font-bold text-slate-700">{{ course.courseName }}</td>
                          <td class="py-2">{{ course.duration }}</td>
                          <td class="py-2 font-bold">{{ course.nsqfLevel }}</td>
                          <td class="py-2">
                            <div class="flex flex-wrap gap-1">
                              <span *ngFor="let s of course.schemes" class="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded">
                                {{ s }}
                              </span>
                              <span *ngIf="!course.schemes || course.schemes.length === 0" class="text-[9px] text-slate-400 italic">Unmapped</span>
                            </div>
                          </td>
                          <td class="py-2 text-right">
                            <button (click)="openEditCourseModal(course)" class="text-blue-600 hover:text-blue-800 hover:underline font-bold text-[10px] transition-colors">✏️ Edit</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- MODAL: Add / Edit Department -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <div *ngIf="showDeptModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-slate-300 max-w-md w-full overflow-hidden shadow-2xl rounded-xs animate-fadeIn">
              <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
                <span class="font-bold text-sm">{{ editingDept ? '✏️ Edit Department' : '+ Add Department Nodal Record' }}</span>
                <button (click)="closeDeptModal()" class="text-white/70 hover:text-white text-lg leading-none">×</button>
              </div>
              <form [formGroup]="deptForm" (ngSubmit)="onSaveDept()" class="p-5 space-y-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Department Code</label>
                  <input formControlName="code" placeholder="e.g. DOITC" class="w-full px-3 py-1.5 border border-slate-300 uppercase font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="deptForm.get('code')?.invalid && deptForm.get('code')?.touched" class="text-red-500 text-[10px] mt-1">Department code is required.</p>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Department Full Legal Name</label>
                  <input formControlName="name" placeholder="e.g. Department of Information Technology" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="deptForm.get('name')?.invalid && deptForm.get('name')?.touched" class="text-red-500 text-[10px] mt-1">Name is required.</p>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Nodal Officer Name & Title</label>
                  <input formControlName="nodalOfficer" placeholder="e.g. Sh. V. K. Gupta (Director)" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="deptForm.get('nodalOfficer')?.invalid && deptForm.get('nodalOfficer')?.touched" class="text-red-500 text-[10px] mt-1">Nodal officer is required.</p>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Official Nodal Email</label>
                  <input formControlName="email" type="email" placeholder="director@rajasthan.gov.in" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="deptForm.get('email')?.invalid && deptForm.get('email')?.touched" class="text-red-500 text-[10px] mt-1">Valid email is required.</p>
                </div>
                <div *ngIf="editingDept">
                  <label class="block font-bold text-slate-700 mb-1">Active Tenders Count</label>
                  <input formControlName="activeTendersCount" type="number" placeholder="0" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                </div>
                <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-3">
                  <button type="button" (click)="closeDeptModal()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xs transition-colors">Cancel</button>
                  <button type="submit" [disabled]="deptForm.invalid" class="px-4 py-1.5 bg-[#131A4D] hover:bg-[#004d73] disabled:opacity-50 text-white text-xs font-bold rounded-xs transition-colors shadow-xs">
                    {{ editingDept ? 'Update Record' : 'Save Record' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- MODAL: Add / Edit Scheme Master -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <div *ngIf="showSchemeModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-slate-300 max-w-lg w-full overflow-hidden shadow-2xl rounded-xs animate-fadeIn">
              <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
                <span class="font-bold text-sm">{{ editingScheme ? '✏️ Edit Scheme Master' : '+ Add Scheme Master' }}</span>
                <button (click)="closeSchemeModal()" class="text-white/70 hover:text-white text-lg leading-none">×</button>
              </div>
              <form [formGroup]="schemeForm" (ngSubmit)="onSaveScheme()" class="p-5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Scheme Code</label>
                    <input formControlName="schemeCode" placeholder="e.g. MMKVY" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                    <p *ngIf="schemeForm.get('schemeCode')?.invalid && schemeForm.get('schemeCode')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Status</label>
                    <select formControlName="status" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none">
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Scheme Title</label>
                  <input formControlName="name" placeholder="e.g. Mukhyamantri Kaushal Vikas Yojana" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="schemeForm.get('name')?.invalid && schemeForm.get('name')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Department</label>
                  <input formControlName="department" placeholder="e.g. DoIT&C" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="schemeForm.get('department')?.invalid && schemeForm.get('department')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Category</label>
                  <input formControlName="category" placeholder="e.g. Skill Development" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Default EMD (₹)</label>
                    <input formControlName="defaultEmd" type="number" placeholder="50000" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Form Fee (₹)</label>
                    <input formControlName="defaultFormFee" type="number" placeholder="1000" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Target Beneficiaries</label>
                  <input formControlName="targetBeneficiaries" placeholder="e.g. Youth aged 18-35" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                </div>
                <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-3">
                  <button type="button" (click)="closeSchemeModal()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xs transition-colors">Cancel</button>
                  <button type="submit" [disabled]="schemeForm.invalid" class="px-4 py-1.5 bg-[#131A4D] hover:bg-[#004d73] disabled:opacity-50 text-white text-xs font-bold rounded-xs transition-colors shadow-xs">
                    {{ editingScheme ? 'Update Scheme' : 'Save Scheme' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- MODAL: Add / Edit Fee Structure -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <div *ngIf="showFeeModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-slate-300 max-w-md w-full overflow-hidden shadow-2xl rounded-xs animate-fadeIn">
              <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
                <span class="font-bold text-sm">{{ editingFee ? '✏️ Edit Fee Structure' : '+ Add Fee Structure' }}</span>
                <button (click)="closeFeeModal()" class="text-white/70 hover:text-white text-lg leading-none">×</button>
              </div>
              <form [formGroup]="feeForm" (ngSubmit)="onSaveFee()" class="p-5 space-y-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Category Name</label>
                  <input formControlName="categoryName" placeholder="e.g. Category A – Large Enterprise" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="feeForm.get('categoryName')?.invalid && feeForm.get('categoryName')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Min. Annual Turnover</label>
                  <input formControlName="minTurnover" placeholder="e.g. ₹5 Crore+" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Process Fee (₹)</label>
                    <input formControlName="defaultFormFee" type="number" placeholder="1000" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">EMD Amount (₹)</label>
                    <input formControlName="defaultEmd" type="number" placeholder="50000" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">MSME Exemption Applicable?</label>
                  <select formControlName="exemptionApplicable" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none">
                    <option [ngValue]="true">Yes – MSME Exemption Applicable</option>
                    <option [ngValue]="false">No – Full Fee Applies</option>
                  </select>
                </div>
                <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-3">
                  <button type="button" (click)="closeFeeModal()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xs transition-colors">Cancel</button>
                  <button type="submit" [disabled]="feeForm.invalid" class="px-4 py-1.5 bg-[#131A4D] hover:bg-[#004d73] disabled:opacity-50 text-white text-xs font-bold rounded-xs transition-colors shadow-xs">
                    {{ editingFee ? 'Update Fee Rule' : 'Save Fee Rule' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- MODAL: Add / Edit Course -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <div *ngIf="showCourseModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-slate-300 max-w-md w-full overflow-hidden shadow-2xl rounded-xs animate-fadeIn">
              <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
                <span class="font-bold text-sm">{{ editingCourse ? '✏️ Edit Course' : '+ Add Course Record' }}</span>
                <button (click)="closeCourseModal()" class="text-white/70 hover:text-white text-lg leading-none">×</button>
              </div>
              <form [formGroup]="courseForm" (ngSubmit)="onSaveCourse()" class="p-5 space-y-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Course Code</label>
                  <input formControlName="courseCode" placeholder="e.g. C-999" class="w-full px-3 py-1.5 border border-slate-300 uppercase font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="courseForm.get('courseCode')?.invalid && courseForm.get('courseCode')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Course Name</label>
                  <input formControlName="courseName" placeholder="e.g. Advanced AI Programming" class="w-full px-3 py-1.5 border border-slate-300 rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                  <p *ngIf="courseForm.get('courseName')?.invalid && courseForm.get('courseName')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Duration (Hrs)</label>
                    <input formControlName="duration" type="number" placeholder="e.g. 400" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                    <p *ngIf="courseForm.get('duration')?.invalid && courseForm.get('duration')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">NSQF Level</label>
                    <input formControlName="nsqfLevel" placeholder="e.g. Level 5" class="w-full px-3 py-1.5 border border-slate-300 font-mono rounded-xs focus:ring-2 focus:ring-[#131A4D] focus:outline-none" />
                    <p *ngIf="courseForm.get('nsqfLevel')?.invalid && courseForm.get('nsqfLevel')?.touched" class="text-red-500 text-[10px] mt-1">Required.</p>
                  </div>
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Map to Schemes</label>
                  <select formControlName="schemes" multiple class="w-full px-3 py-1.5 border border-slate-300 rounded-xs h-24 focus:ring-2 focus:ring-[#131A4D] focus:outline-none">
                    <option value="MMKVY">MMKVY</option>
                    <option value="RAJKViK">RAJKViK</option>
                    <option value="MNSKSY">MNSKSY</option>
                    <option value="PMKVY">PMKVY</option>
                    <option value="DDU-GKY">DDU-GKY</option>
                    <option value="Samarth">Samarth</option>
                  </select>
                  <p class="text-[9px] text-slate-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
                </div>
                <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-3">
                  <button type="button" (click)="closeCourseModal()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xs transition-colors">Cancel</button>
                  <button type="submit" [disabled]="courseForm.invalid" class="px-4 py-1.5 bg-[#131A4D] hover:bg-[#004d73] disabled:opacity-50 text-white text-xs font-bold rounded-xs transition-colors shadow-xs">
                    {{ editingCourse ? 'Update Course' : 'Save Course' }}
                  </button>
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
  activeTab: 'DEPT' | 'SCHEMES' | 'FEES' | 'COURSES' = 'DEPT';
  departments$!: Observable<DepartmentMaster[]>;
  schemeMasters$!: Observable<SchemeMaster[]>;
  feeStructures$!: Observable<FeeStructureMaster[]>;
  courses$!: Observable<CourseMaster[]>;

  // Modal visibility flags (single modal per type, shared for add/edit)
  showDeptModal = false;
  showSchemeModal = false;
  showFeeModal = false;
  showCourseModal = false;

  // Currently editing item (null = add mode)
  editingDept: DepartmentMaster | null = null;
  editingScheme: SchemeMaster | null = null;
  editingFee: FeeStructureMaster | null = null;
  editingCourse: CourseMaster | null = null;

  // Forms
  deptForm!: FormGroup;
  schemeForm!: FormGroup;
  feeForm!: FormGroup;
  courseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.departments$ = this.eoiService.departments$;
    this.schemeMasters$ = this.eoiService.schemeMasters$;
    this.feeStructures$ = this.eoiService.feeStructures$;
    this.courses$ = this.eoiService.courses$;

    // Read ?tab=COURSES (or any valid tab) from query params
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as 'DEPT' | 'SCHEMES' | 'FEES' | 'COURSES';
      if (tab && ['DEPT', 'SCHEMES', 'FEES', 'COURSES'].includes(tab)) {
        this.activeTab = tab;
      }
    });

    this.deptForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nodalOfficer: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      activeTendersCount: [0]
    });

    this.schemeForm = this.fb.group({
      schemeCode: ['', Validators.required],
      name: ['', Validators.required],
      department: ['', Validators.required],
      category: [''],
      defaultEmd: [0],
      defaultFormFee: [0],
      targetBeneficiaries: [''],
      status: ['Active']
    });

    this.feeForm = this.fb.group({
      categoryName: ['', Validators.required],
      minTurnover: [''],
      defaultFormFee: [0],
      defaultEmd: [0],
      exemptionApplicable: [false]
    });

    this.courseForm = this.fb.group({
      courseCode: ['', Validators.required],
      courseName: ['', Validators.required],
      duration: ['', Validators.required],
      nsqfLevel: ['', Validators.required],
      schemes: [[]]
    });
  }

  // ─── Department Handlers ────────────────────────────────────────────────────

  openAddDeptModal(): void {
    this.editingDept = null;
    this.deptForm.reset({ activeTendersCount: 0 });
    this.showDeptModal = true;
  }

  openEditDeptModal(dept: DepartmentMaster): void {
    this.editingDept = dept;
    this.deptForm.patchValue({
      code: dept.code,
      name: dept.name,
      nodalOfficer: dept.nodalOfficer,
      email: dept.email,
      activeTendersCount: dept.activeTendersCount
    });
    this.showDeptModal = true;
  }

  closeDeptModal(): void {
    this.showDeptModal = false;
    this.editingDept = null;
    this.deptForm.reset();
  }

  onSaveDept(): void {
    if (this.deptForm.invalid) { this.deptForm.markAllAsTouched(); return; }
    const val = this.deptForm.value;
    if (this.editingDept) {
      this.eoiService.updateDepartment(this.editingDept.id, {
        code: val.code,
        name: val.name,
        nodalOfficer: val.nodalOfficer,
        email: val.email,
        activeTendersCount: val.activeTendersCount ?? 0
      });
    } else {
      this.eoiService.addDepartment({
        code: val.code,
        name: val.name,
        nodalOfficer: val.nodalOfficer,
        email: val.email,
        phone: '+91 141 270 0000',
        activeTendersCount: 0
      });
    }
    this.closeDeptModal();
  }

  // ─── Scheme Handlers ─────────────────────────────────────────────────────────

  openAddSchemeModal(): void {
    this.editingScheme = null;
    this.schemeForm.reset({ defaultEmd: 0, defaultFormFee: 0, status: 'Active' });
    this.showSchemeModal = true;
  }

  openEditSchemeModal(sch: SchemeMaster): void {
    this.editingScheme = sch;
    this.schemeForm.patchValue({
      schemeCode: sch.schemeCode,
      name: sch.name,
      department: sch.department,
      category: sch.category,
      defaultEmd: sch.defaultEmd,
      defaultFormFee: sch.defaultFormFee,
      targetBeneficiaries: sch.targetBeneficiaries,
      status: sch.status
    });
    this.showSchemeModal = true;
  }

  closeSchemeModal(): void {
    this.showSchemeModal = false;
    this.editingScheme = null;
    this.schemeForm.reset();
  }

  onSaveScheme(): void {
    if (this.schemeForm.invalid) { this.schemeForm.markAllAsTouched(); return; }
    const val = this.schemeForm.value;
    if (this.editingScheme) {
      this.eoiService.updateSchemeMaster(this.editingScheme.id, val);
    } else {
      this.eoiService.addSchemeMaster(val);
    }
    this.closeSchemeModal();
  }

  // ─── Fee Structure Handlers ──────────────────────────────────────────────────

  openAddFeeModal(): void {
    this.editingFee = null;
    this.feeForm.reset({ defaultEmd: 0, defaultFormFee: 0, exemptionApplicable: false });
    this.showFeeModal = true;
  }

  openEditFeeModal(fee: FeeStructureMaster): void {
    this.editingFee = fee;
    this.feeForm.patchValue({
      categoryName: fee.categoryName,
      minTurnover: fee.minTurnover,
      defaultFormFee: fee.defaultFormFee,
      defaultEmd: fee.defaultEmd,
      exemptionApplicable: fee.exemptionApplicable
    });
    this.showFeeModal = true;
  }

  closeFeeModal(): void {
    this.showFeeModal = false;
    this.editingFee = null;
    this.feeForm.reset();
  }

  onSaveFee(): void {
    if (this.feeForm.invalid) { this.feeForm.markAllAsTouched(); return; }
    const val = this.feeForm.value;
    if (this.editingFee) {
      this.eoiService.updateFeeStructure(this.editingFee.id, val);
    } else {
      this.eoiService.addFeeStructure(val);
    }
    this.closeFeeModal();
  }

  // ─── Course Handlers ──────────────────────────────────────────────────────────

  openAddCourseModal(): void {
    this.editingCourse = null;
    this.courseForm.reset({ schemes: [] });
    this.showCourseModal = true;
  }

  openEditCourseModal(course: CourseMaster): void {
    this.editingCourse = course;
    this.courseForm.patchValue({
      courseCode: course.courseCode,
      courseName: course.courseName,
      duration: course.duration,
      nsqfLevel: course.nsqfLevel,
      schemes: course.schemes ?? []
    });
    this.showCourseModal = true;
  }

  closeCourseModal(): void {
    this.showCourseModal = false;
    this.editingCourse = null;
    this.courseForm.reset();
  }

  onSaveCourse(): void {
    if (this.courseForm.invalid) { this.courseForm.markAllAsTouched(); return; }
    const val = this.courseForm.value;
    if (this.editingCourse) {
      this.eoiService.updateCourse(this.editingCourse.id, val);
    } else {
      this.eoiService.addCourse(val);
    }
    this.closeCourseModal();
  }
}
