import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { EoiStateService, DynamicFormField, Scheme } from '../../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-configure-eoi',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgFor, AsyncPipe, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
          <!-- Top Breadcrumb & Title Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div>
              <div class="text-[11px] font-mono text-[#131A4D] uppercase tracking-wider font-semibold">
                Super Admin Form Engine · Dynamic EOI Builder
              </div>
              <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">
                Configure Scheme EOI Application Forms
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Design custom dynamic fields and document requirements per tender without modifying source code.
              </p>
            </div>

            <!-- Scheme Selector Dropdown -->
            <div class="flex items-center gap-2 bg-white border border-slate-300 p-1.5 shadow-2xs">
              <span class="text-xs text-slate-500 font-semibold pl-1">Select Scheme:</span>
              <select 
                [(ngModel)]="selectedSchemeCode"
                (change)="onSchemeChange()"
                class="text-xs font-bold text-[#131A4D] border-none bg-transparent focus:outline-none">
                <option value="MMKVY">MMKVY (Kaushalya Vikas)</option>
                <option value="SAMARTH">SAMARTH (Advanced Trades)</option>
                <option value="ELSTP">ELSTP (Employment Linked)</option>
                <option value="DDU-GKY">DDU-GKY (Rural Youth)</option>
              </select>
            </div>
          </div>

          <!-- Two-Column Layout: Left (Field List & Form Builder) | Right (Live Preview) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left 7 Cols: Field Configuration & Add Field -->
            <div class="lg:col-span-7 space-y-6">
              
              <!-- Configured Fields Box -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
                  <h2 class="text-xs font-bold uppercase tracking-wider">
                    Configured Fields for [{{ selectedSchemeCode }}] ({{ currentFields.length }} Fields)
                  </h2>
                  <span class="text-[10px] text-blue-200 font-mono">Dynamic Form Schema</span>
                </div>

                <div class="p-5 space-y-3">
                  <div *ngFor="let field of currentFields; let idx = index" class="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-blue-300 transition-colors">
                    <div class="flex items-center gap-3">
                      <span class="w-5 h-5 rounded-full bg-blue-100 text-[#131A4D] flex items-center justify-center font-bold text-[10px]">
                        {{ idx + 1 }}
                      </span>
                      <div>
                        <div class="font-bold text-slate-900">
                          {{ field.label }}
                          <span *ngIf="field.required" class="text-red-600 font-bold">*</span>
                        </div>
                        <div class="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span class="bg-slate-200 px-1.5 py-0.2 rounded uppercase">{{ field.fieldType }}</span>
                          <span *ngIf="field.helpText">Help: {{ field.helpText }}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      (click)="removeField(field.id)"
                      class="text-red-600 hover:text-red-800 text-xs font-bold p-1">
                      ✕ Remove
                    </button>
                  </div>

                  <div *ngIf="currentFields.length === 0" class="text-center py-6 text-slate-400 text-xs italic">
                    No custom fields configured for this scheme yet. Add a field below.
                  </div>
                </div>
              </div>

              <!-- Add New Field Form Box -->
              <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5">
                  <h3 class="text-xs font-bold text-[#131A4D] uppercase tracking-wider">
                    + Add New Dynamic Field to [{{ selectedSchemeCode }}]
                  </h3>
                </div>

                <form [formGroup]="fieldForm" (ngSubmit)="onAddField()" class="p-5 space-y-3 text-xs">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Field Label / Question <span class="text-red-600">*</span></label>
                    <input formControlName="label" placeholder="e.g. Total Trained Candidates in Last 3 Years" class="w-full px-3 py-1.5 border border-slate-300" />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold text-slate-700 mb-1">Field Type <span class="text-red-600">*</span></label>
                      <select formControlName="fieldType" class="w-full px-3 py-1.5 border border-slate-300 bg-white">
                        <option value="text">Text Input</option>
                        <option value="number">Numeric Input</option>
                        <option value="date">Date Picker</option>
                        <option value="dropdown">Dropdown Selection</option>
                        <option value="file">File Upload (PDF/Doc)</option>
                        <option value="checkbox">Declaration Checkbox</option>
                      </select>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-700 mb-1">Mandatory Requirement</label>
                      <div class="flex items-center gap-2 pt-1.5">
                        <input type="checkbox" formControlName="required" id="reqCheck" class="w-4 h-4 text-[#131A4D]" />
                        <label for="reqCheck" class="text-slate-700 font-semibold">Mark as Required (*)</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 mb-1">Placeholder / Prompt Hint</label>
                    <input formControlName="placeholder" placeholder="e.g. Enter numerical count" class="w-full px-3 py-1.5 border border-slate-300" />
                  </div>

                  <div class="flex justify-end pt-2">
                    <button type="submit" class="px-5 py-2 bg-[#131A4D] hover:bg-[#004d73] text-white font-bold text-xs rounded transition-colors shadow-2xs">
                      + Add Field to Form
                    </button>
                  </div>
                </form>
              </div>

            </div>

            <!-- Right 5 Cols: Live Interactive Applicant Form Preview -->
            <div class="lg:col-span-5 sticky top-20">
              <div class="bg-white border-2 border-[#131A4D] shadow-md overflow-hidden">
                <div class="bg-[#131A4D] text-white px-4 py-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span>👁</span>
                    <span class="text-xs font-bold uppercase tracking-wider">Live Applicant Preview</span>
                  </div>
                  <span class="text-[10px] bg-[#131A4D] px-2 py-0.5 rounded font-mono">Simulated View</span>
                </div>

                <div class="p-5 space-y-4 text-xs bg-slate-50/50">
                  <div class="text-[11px] font-bold text-[#131A4D] uppercase pb-2 border-b border-slate-200">
                    Scheme-Specific Proposal Details ({{ selectedSchemeCode }})
                  </div>

                  <div *ngFor="let field of currentFields" class="space-y-1">
                    <label class="block font-semibold text-slate-800">
                      {{ field.label }}
                      <span *ngIf="field.required" class="text-red-600">*</span>
                    </label>

                    <!-- Text / Number -->
                    <input 
                      *ngIf="field.fieldType === 'text' || field.fieldType === 'number'"
                      [type]="field.fieldType" 
                      [placeholder]="field.placeholder || ''"
                      disabled
                      class="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-400 text-xs"
                    />

                    <!-- Date -->
                    <input 
                      *ngIf="field.fieldType === 'date'"
                      type="date" 
                      disabled
                      class="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-400 text-xs"
                    />

                    <!-- Dropdown -->
                    <select *ngIf="field.fieldType === 'dropdown'" disabled class="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-400 text-xs">
                      <option>Select from available choices...</option>
                    </select>

                    <!-- File Upload -->
                    <div *ngIf="field.fieldType === 'file'" class="border border-dashed border-slate-300 p-2 text-center bg-white text-slate-400 text-xs">
                      <span>📎 Upload Document (.pdf up to 5MB)</span>
                    </div>

                    <!-- Checkbox -->
                    <div *ngIf="field.fieldType === 'checkbox'" class="flex items-center gap-2 pt-1">
                      <input type="checkbox" disabled class="w-3.5 h-3.5" />
                      <span class="text-slate-600 text-[11px]">I confirm and declare this statement</span>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
                    Auto-synced with applicant submission pipeline
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  `
})
export class ConfigureEoiComponent implements OnInit {
  selectedSchemeCode = 'MMKVY';
  currentFields: DynamicFormField[] = [];
  fieldForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService
  ) {}

  ngOnInit(): void {
    this.fieldForm = this.fb.group({
      label: ['', Validators.required],
      fieldType: ['text', Validators.required],
      required: [true],
      placeholder: ['']
    });

    this.loadFields();
  }

  loadFields(): void {
    this.currentFields = this.eoiService.getDynamicFields(this.selectedSchemeCode);
  }

  onSchemeChange(): void {
    this.loadFields();
  }

  onAddField(): void {
    if (this.fieldForm.invalid) return;
    const val = this.fieldForm.value;

    this.eoiService.addDynamicFormField({
      schemeCode: this.selectedSchemeCode,
      label: val.label,
      fieldType: val.fieldType,
      required: val.required,
      placeholder: val.placeholder,
      order: this.currentFields.length + 1
    });

    this.fieldForm.reset({ fieldType: 'text', required: true });
    this.loadFields();
  }

  removeField(id: string): void {
    this.eoiService.removeDynamicFormField(id);
    this.loadFields();
  }
}
