import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-registration-basic',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, ButtonComponent],
  template: `
    <div>
      <h2 class="text-xl font-bold text-text mb-6">Basic Information</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-text mb-1">Full Name <span class="text-error">*</span></label>
            <input type="text" formControlName="fullName" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('fullName')}">
            <p *ngIf="isFieldInvalid('fullName')" class="mt-1 text-sm text-error">Full name is required.</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text mb-1">SSO ID</label>
            <div class="relative">
              <input type="text" formControlName="ssoId" class="block w-full px-4 py-2 rounded-md border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm" readonly>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p class="mt-1 text-xs text-success flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Verified through SSO
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Designation <span class="text-error">*</span></label>
            <input type="text" formControlName="designation" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('designation')}">
            <p *ngIf="isFieldInvalid('designation')" class="mt-1 text-sm text-error">Designation is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Date of Birth</label>
            <input type="date" formControlName="dateOfBirth" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('dateOfBirth')}">
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Email <span class="text-error">*</span></label>
            <input type="email" formControlName="email" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('email')}">
            <p *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-error">Valid email is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Mobile Number <span class="text-error">*</span></label>
            <input type="tel" formControlName="mobile" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('mobile')}">
            <p *ngIf="isFieldInvalid('mobile')" class="mt-1 text-sm text-error">Valid 10-digit mobile number required.</p>
          </div>
        </div>

        <div class="flex justify-end pt-6 border-t border-border mt-8">
          <app-button type="submit" variant="primary">Save & Continue</app-button>
        </div>
      </form>
    </div>
  `
})
export class BasicDetailsComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      ssoId: ['NEW-SSO-892', Validators.required],
      designation: ['', Validators.required],
      dateOfBirth: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Save to state/service...
    this.router.navigate(['/auth/registration/organization']);
  }
}
