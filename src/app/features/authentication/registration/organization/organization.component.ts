import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-registration-organization',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, ButtonComponent],
  template: `
    <div>
      <h2 class="text-xl font-bold text-text mb-6">Organization Details</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-text mb-1">Organization Name <span class="text-error">*</span></label>
            <input type="text" formControlName="organizationName" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('organizationName')}">
            <p *ngIf="isFieldInvalid('organizationName')" class="mt-1 text-sm text-error">Organization name is required.</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text mb-1">Organization Type <span class="text-error">*</span></label>
            <select formControlName="organizationType" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 bg-white" [ngClass]="{'border-error': isFieldInvalid('organizationType')}">
              <option value="" disabled>Select type</option>
              <option value="Private Limited">Private Limited</option>
              <option value="Public Limited">Public Limited</option>
              <option value="Partnership">Partnership</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="NGO">NGO / Trust</option>
              <option value="Government">Government Entity</option>
            </select>
            <p *ngIf="isFieldInvalid('organizationType')" class="mt-1 text-sm text-error">Organization type is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Registration Number <span class="text-error">*</span></label>
            <input type="text" formControlName="registrationNumber" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('registrationNumber')}">
            <p *ngIf="isFieldInvalid('registrationNumber')" class="mt-1 text-sm text-error">Registration number is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">PAN <span class="text-error">*</span></label>
            <input type="text" formControlName="pan" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 uppercase" [ngClass]="{'border-error': isFieldInvalid('pan')}">
            <p *ngIf="isFieldInvalid('pan')" class="mt-1 text-sm text-error">Valid PAN is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">GSTIN</label>
            <input type="text" formControlName="gstin" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 uppercase">
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Industry / Sector <span class="text-error">*</span></label>
            <select formControlName="industry" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 bg-white" [ngClass]="{'border-error': isFieldInvalid('industry')}">
              <option value="" disabled>Select sector</option>
              <option value="IT">Information Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
            <p *ngIf="isFieldInvalid('industry')" class="mt-1 text-sm text-error">Industry/Sector is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Year of Establishment <span class="text-error">*</span></label>
            <input type="number" formControlName="yearEstablished" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" min="1800" max="2026" [ngClass]="{'border-error': isFieldInvalid('yearEstablished')}">
            <p *ngIf="isFieldInvalid('yearEstablished')" class="mt-1 text-sm text-error">Valid year is required.</p>
          </div>
        </div>

        <div class="flex justify-between pt-6 border-t border-border mt-8">
          <app-button type="button" variant="secondary" (click)="goBack()">Back</app-button>
          <app-button type="submit" variant="primary">Save & Continue</app-button>
        </div>
      </form>
    </div>
  `
})
export class OrganizationComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      organizationName: ['', Validators.required],
      organizationType: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      pan: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      gstin: [''],
      industry: ['', Validators.required],
      yearEstablished: ['', [Validators.required, Validators.min(1800), Validators.max(2026)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goBack() {
    this.router.navigate(['/auth/registration/basic']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/auth/registration/contact']);
  }
}
