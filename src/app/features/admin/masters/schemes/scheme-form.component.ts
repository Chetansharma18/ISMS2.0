import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../core/services/master.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DepartmentMaster, SchemeCategoryMaster } from '../../core/models/admin.models';

@Component({
  selector: 'admin-scheme-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    PageHeaderComponent
  ],
  template: `
    <div>
      <admin-page-header 
        [title]="isEditMode ? 'Edit Scheme Master: ' + schemeCode : 'Create New Scheme'"
        subtitle="Configure state government scheme information, validity periods, administrative nodal contacts, and statutory circulars"
        icon="account_balance"
        [breadcrumbs]="[
          { label: 'Masters', url: '/admin/masters/schemes' },
          { label: 'Scheme Master', url: '/admin/masters/schemes' },
          { label: isEditMode ? 'Edit Scheme' : 'Create Scheme' }
        ]">
        <div header-actions>
          <a 
            routerLink="/admin/masters/schemes" 
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            ← Back to Schemes List
          </a>
        </div>
      </admin-page-header>

      <form [formGroup]="schemeForm" (ngSubmit)="onSubmit(false)" class="space-y-6">
        
        <!-- SECTION 1: SCHEME INFORMATION -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-blue-700">info</span>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">1. Scheme Information</h3>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Scheme Code -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Scheme Code <span class="text-rose-600">*</span>
              </label>
              <input 
                type="text" 
                formControlName="schemeCode"
                placeholder="e.g. MMKVY"
                class="w-full px-3 py-2 border rounded-lg text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-300 ring-1 ring-rose-300': hasError('schemeCode')}" />
              <p *ngIf="hasError('schemeCode')" class="text-[11px] text-rose-600 mt-1">Scheme code is required.</p>
            </div>

            <!-- Scheme Name -->
            <div class="lg:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Scheme Name <span class="text-rose-600">*</span>
              </label>
              <input 
                type="text" 
                formControlName="schemeName"
                placeholder="e.g. Mukhya Mantri Kaushal Vikas Yojana"
                class="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-300 ring-1 ring-rose-300': hasError('schemeName')}" />
              <p *ngIf="hasError('schemeName')" class="text-[11px] text-rose-600 mt-1">Scheme name is required.</p>
            </div>

            <!-- Short Name -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Scheme Short Name</label>
              <input 
                type="text" 
                formControlName="shortName"
                placeholder="e.g. MMKVY-RSLDC"
                class="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- Department -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Department <span class="text-rose-600">*</span>
              </label>
              <select 
                formControlName="department"
                class="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-300 ring-1 ring-rose-300': hasError('department')}">
                <option value="">Select Administrative Department</option>
                <option *ngFor="let d of departments()" [value]="d.departmentName">{{ d.departmentName }}</option>
              </select>
              <p *ngIf="hasError('department')" class="text-[11px] text-rose-600 mt-1">Department selection is required.</p>
            </div>

            <!-- Scheme Category -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Scheme Category <span class="text-rose-600">*</span>
              </label>
              <select 
                formControlName="schemeCategory"
                class="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                [ngClass]="{'border-rose-300 ring-1 ring-rose-300': hasError('schemeCategory')}">
                <option value="">Select Scheme Category</option>
                <option *ngFor="let c of categories()" [value]="c.categoryName">{{ c.categoryName }}</option>
              </select>
              <p *ngIf="hasError('schemeCategory')" class="text-[11px] text-rose-600 mt-1">Scheme category is required.</p>
            </div>

            <!-- Description -->
            <div class="md:col-span-2 lg:col-span-3">
              <label class="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea 
                rows="2" 
                formControlName="description"
                placeholder="Detailed description of the scheme, scope, and target beneficiaries..."
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"></textarea>
            </div>

            <!-- Objective -->
            <div class="md:col-span-2 lg:col-span-3">
              <label class="block text-xs font-bold text-slate-700 mb-1">Objective & Key Milestones</label>
              <textarea 
                rows="2" 
                formControlName="objective"
                placeholder="Strategic objectives, target candidate count, industry placement ratios..."
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"></textarea>
            </div>
          </div>
        </div>

        <!-- SECTION 2: SCHEME VALIDITY & STATUS -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-blue-700">event_available</span>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">2. Scheme Validity & Status</h3>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Start Date -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input 
                type="date" 
                formControlName="startDate"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- End Date -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
              <input 
                type="date" 
                formControlName="endDate"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Status *</label>
              <select 
                formControlName="status"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECTION 3: CONTACT INFORMATION -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-blue-700">call</span>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">3. Nodal Contact Information</h3>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Contact Department -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Contact Wing / Directorate</label>
              <input 
                type="text" 
                formControlName="contactDepartment"
                placeholder="e.g. RSLDC Operations Wing"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- Contact Email -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input 
                type="email" 
                formControlName="contactEmail"
                placeholder="scheme.nodal@rajasthan.gov.in"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- Contact Phone -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input 
                type="text" 
                formControlName="contactPhone"
                placeholder="+91 141 2795400"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>
          </div>
        </div>

        <!-- SECTION 4: DOCUMENTS -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-blue-700">upload_file</span>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">4. Statutory Documents & Guidelines</h3>
          </div>

          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <span class="text-xs font-bold text-slate-800 block mb-1">Scheme Guidelines Document</span>
              <input type="file" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div class="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <span class="text-xs font-bold text-slate-800 block mb-1">State Gazette Notification</span>
              <input type="file" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div class="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <span class="text-xs font-bold text-slate-800 block mb-1">Administrative Circular</span>
              <input type="file" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div class="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <span class="text-xs font-bold text-slate-800 block mb-1">Other Supporting Documents</span>
              <input type="file" class="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
        </div>

        <!-- FORM ACTION BUTTONS -->
        <div class="flex items-center justify-end gap-3 pt-4">
          <a 
            routerLink="/admin/masters/schemes" 
            class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </a>
          <button 
            type="button" 
            (click)="schemeForm.reset()"
            class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
            Reset
          </button>
          <button 
            type="button" 
            (click)="onSubmit(true)"
            *ngIf="!isEditMode"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer">
            Save & New
          </button>
          <button 
            type="submit" 
            class="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer">
            Save Scheme
          </button>
        </div>
      </form>
    </div>
  `
})
export class SchemeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private masterService = inject(MasterService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  schemeId = '';
  schemeCode = '';

  departments = signal<DepartmentMaster[]>([]);
  categories = signal<SchemeCategoryMaster[]>([]);

  schemeForm!: FormGroup;

  ngOnInit(): void {
    this.masterService.getDepartments().subscribe(d => this.departments.set(d));
    this.masterService.getSchemeCategories().subscribe(c => this.categories.set(c));

    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.schemeId = id;
      this.loadScheme(id);
    }
  }

  initForm(): void {
    this.schemeForm = this.fb.group({
      schemeCode: ['', [Validators.required, Validators.minLength(2)]],
      schemeName: ['', [Validators.required, Validators.minLength(3)]],
      shortName: [''],
      department: ['', Validators.required],
      schemeCategory: ['', Validators.required],
      description: [''],
      objective: [''],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      endDate: [new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0], Validators.required],
      status: ['Active', Validators.required],
      contactDepartment: [''],
      contactEmail: ['', Validators.email],
      contactPhone: ['']
    });
  }

  loadScheme(id: string): void {
    this.masterService.getSchemeById(id).subscribe(sc => {
      if (sc) {
        this.schemeCode = sc.schemeCode;
        this.schemeForm.patchValue({
          schemeCode: sc.schemeCode,
          schemeName: sc.schemeName,
          shortName: sc.shortName,
          department: sc.department,
          schemeCategory: sc.schemeCategory,
          description: sc.description,
          objective: sc.objective,
          startDate: sc.startDate,
          endDate: sc.endDate,
          status: sc.status,
          contactDepartment: sc.contactDepartment,
          contactEmail: sc.contactEmail,
          contactPhone: sc.contactPhone
        });
      }
    });
  }

  hasError(field: string): boolean {
    const c = this.schemeForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(saveAndNew: boolean): void {
    if (this.schemeForm.invalid) {
      this.schemeForm.markAllAsTouched();
      this.toastService.error('Validation Error', 'Please correct the highlighted errors before saving.');
      return;
    }

    const payload = {
      ...(this.isEditMode ? { id: this.schemeId } : {}),
      ...this.schemeForm.value
    };

    this.masterService.saveScheme(payload).subscribe(saved => {
      this.toastService.success(
        this.isEditMode ? 'Scheme Updated' : 'Scheme Created',
        `${saved.schemeName} (${saved.schemeCode}) saved successfully.`
      );

      if (saveAndNew) {
        this.schemeForm.reset({
          status: 'Active',
          startDate: new Date().toISOString().split('T')[0]
        });
      } else {
        this.router.navigate(['/admin/masters/schemes']);
      }
    });
  }
}
