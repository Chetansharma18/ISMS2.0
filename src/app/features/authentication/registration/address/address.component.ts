import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-registration-address',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, ButtonComponent],
  template: `
    <div>
      <h2 class="text-xl font-bold text-text mb-6">Registered Address</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-text mb-1">Address Line 1 <span class="text-error">*</span></label>
            <input type="text" formControlName="addressLine1" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('addressLine1')}">
            <p *ngIf="isFieldInvalid('addressLine1')" class="mt-1 text-sm text-error">Address is required.</p>
          </div>

          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-text mb-1">Address Line 2</label>
            <input type="text" formControlName="addressLine2" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">State <span class="text-error">*</span></label>
            <select formControlName="state" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 bg-white" [ngClass]="{'border-error': isFieldInvalid('state')}">
              <option value="" disabled>Select State</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <!-- More options... -->
            </select>
            <p *ngIf="isFieldInvalid('state')" class="mt-1 text-sm text-error">State is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">District <span class="text-error">*</span></label>
            <select formControlName="district" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 bg-white" [ngClass]="{'border-error': isFieldInvalid('district')}">
              <option value="" disabled>Select District</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore Urban">Bangalore Urban</option>
            </select>
            <p *ngIf="isFieldInvalid('district')" class="mt-1 text-sm text-error">District is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">City / Block <span class="text-error">*</span></label>
            <input type="text" formControlName="city" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('city')}">
            <p *ngIf="isFieldInvalid('city')" class="mt-1 text-sm text-error">City is required.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-text mb-1">PIN Code <span class="text-error">*</span></label>
            <input type="text" formControlName="pinCode" class="block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" [ngClass]="{'border-error': isFieldInvalid('pinCode')}">
            <p *ngIf="isFieldInvalid('pinCode')" class="mt-1 text-sm text-error">Valid 6-digit PIN code is required.</p>
          </div>
        </div>

        <div class="mt-6 border-t border-border pt-4">
          <label class="flex items-center space-x-3 text-sm text-text cursor-pointer">
            <input type="checkbox" formControlName="sameAsRegistered" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary">
            <span>Communication address is same as registered address</span>
          </label>
        </div>

        <div class="flex justify-between pt-6 border-t border-border mt-8">
          <app-button type="button" variant="secondary" (click)="goBack()">Back</app-button>
          <app-button type="submit" variant="primary">Save & Continue</app-button>
        </div>
      </form>
    </div>
  `
})
export class AddressComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      state: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      sameAsRegistered: [true]
    });
  }

  ngOnInit() {
    // In a real app, you would listen to value changes on state to populate districts
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goBack() {
    this.router.navigate(['/auth/registration/contact']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/auth/registration/documents']);
  }
}
