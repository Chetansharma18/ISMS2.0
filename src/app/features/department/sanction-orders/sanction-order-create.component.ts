import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputComponent } from '../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../shared/components/form-controls/form-select/form-select.component';
import { SanctionOrderService } from '../../../core/services/sanction-order.service';

@Component({
  selector: 'app-sanction-order-create',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto space-y-6 pb-12">
      
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/department/sanction-orders" class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Prepare Sanction Order</h1>
          <p class="text-slate-500 mt-1">Allocate capacity and issue Sanction Order for an approved TP.</p>
        </div>
      </div>

      <!-- Form Skeleton -->
      <form [formGroup]="soForm" (ngSubmit)="submit()" class="bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8 space-y-8">
        
        <!-- Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-form-select
            formControlName="tenderId"
            label="Select Tender"
            [required]="true"
            [options]="['TND-2026-001']"
            placeholder="Select a Tender">
          </app-form-select>

          <app-form-select
            formControlName="tpId"
            label="Select Approved TP"
            [required]="true"
            [options]="['TP042']"
            placeholder="Select an Approved TP">
          </app-form-select>
        </div>

        <hr class="border-slate-100">

        <!-- Capacity Allocation -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-[#131A4D]">Capacity & Validity</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <app-form-input
              formControlName="capacity"
              type="number"
              label="Approved Capacity (Aspirants)"
              [required]="true"
              placeholder="e.g. 500">
            </app-form-input>

            <app-form-input
              formControlName="validFrom"
              type="date"
              label="Valid From"
              [required]="true">
            </app-form-input>

            <app-form-input
              formControlName="validTo"
              type="date"
              label="Valid To"
              [required]="true">
            </app-form-input>
          </div>
        </div>

        <hr class="border-slate-100">

        <!-- Document -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-[#131A4D]">Official Document</h3>
          
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <p class="font-bold text-slate-700">Upload Sanction Order PDF</p>
            <p class="text-xs text-slate-500 mt-1">Maximum file size 5MB.</p>
          </div>
        </div>
      </form>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-4 mt-6">
        <button routerLink="/department/sanction-orders" class="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button (click)="saveDraft()" class="px-6 py-3 border-2 border-[#131A4D] text-[#131A4D] font-bold rounded-lg hover:bg-slate-50 transition-colors">
          Save as Draft
        </button>
        <button (click)="submit()" [disabled]="soForm.invalid" class="px-6 py-3 bg-[#131A4D] text-white font-bold rounded-lg shadow-md hover:bg-[#0a0e29] hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          Save & Submit for Release
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

    </div>
  `
})
export class SanctionOrderCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sanctionOrderService = inject(SanctionOrderService);

  soForm = this.fb.group({
    tenderId: ['TND-2026-001', Validators.required],
    tpId: ['TP042', Validators.required],
    capacity: [500, Validators.required],
    validFrom: ['', Validators.required],
    validTo: ['', Validators.required],
  });

  submit() {
    if (this.soForm.valid) {
      this.sanctionOrderService.addOrder({
        status: 'PENDING_RELEASE',
        target: this.soForm.value.capacity ?? undefined
      });
      this.router.navigate(['/department/sanction-orders']);
    }
  }

  saveDraft() {
    this.sanctionOrderService.addOrder({
      status: 'DRAFT',
      target: this.soForm.value.capacity ?? undefined
    });
    alert('Sanction Order saved as draft successfully!');
    this.router.navigate(['/department/sanction-orders']);
  }
}
