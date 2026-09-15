import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-registration-contact',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, ButtonComponent],
  template: `
    <div>
      <h2 class="text-xl font-bold text-text mb-6">Contact Details</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-text mb-1">Official Email <span class="text-error">*</span></label>
            <input type="email" formControlName="officialEmail" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('officialEmail')}">
            <p *ngIf="isFieldInvalid('officialEmail')" class="mt-1 text-sm text-error">Valid official email is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Mobile Number <span class="text-error">*</span></label>
            <input type="tel" formControlName="mobileNumber" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('mobileNumber')}">
            <p *ngIf="isFieldInvalid('mobileNumber')" class="mt-1 text-sm text-error">Valid 10-digit mobile number required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Alternate Contact Number</label>
            <input type="tel" formControlName="alternateContact" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('alternateContact')}">
             <p *ngIf="isFieldInvalid('alternateContact')" class="mt-1 text-sm text-error">Must be a valid 10-digit number if provided.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">Website URL</label>
            <input type="url" formControlName="website" placeholder="https://" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('website')}">
            <p *ngIf="isFieldInvalid('website')" class="mt-1 text-sm text-error">Please enter a valid URL (e.g., https://example.com).</p>
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
export class ContactComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    // Basic regex for URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    this.form = this.fb.group({
      officialEmail: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      alternateContact: ['', [Validators.pattern('^[0-9]{10}$')]],
      website: ['', [Validators.pattern(urlRegex)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goBack() {
    this.router.navigate(['/auth/registration/organization']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/auth/registration/address']);
  }
}
