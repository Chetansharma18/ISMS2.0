import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-registration-review',
  standalone: true,
  imports: [NgIf, FormsModule, ButtonComponent],
  template: `
    <div>
      <h2 class="text-xl font-bold text-text mb-6">Review & Submit</h2>
      
      <div class="bg-yellow-50 border-l-4 border-warning p-4 mb-8 text-sm text-yellow-800">
        <p class="font-semibold mb-1">Please review carefully.</p>
        <p>Ensure all information provided is accurate. Any discrepancies may lead to rejection of your registration profile.</p>
      </div>

      <div class="space-y-8">
        <!-- Basic Info Summary -->
        <div>
          <div class="flex justify-between items-center border-b border-border pb-2 mb-4">
            <h3 class="text-lg font-semibold text-text">Basic Information</h3>
            <button class="text-primary hover:underline text-sm font-medium" (click)="editStep('basic')">Edit</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="block text-textMuted">Full Name</span>
              <span class="font-medium text-text">Jane Doe</span>
            </div>
            <div>
              <span class="block text-textMuted">SSO ID</span>
              <span class="font-medium text-text">NEW-SSO-892</span>
            </div>
            <div>
              <span class="block text-textMuted">Email</span>
              <span class="font-medium text-text">jane.doe&#64;example.com</span>
            </div>
          </div>
        </div>

        <!-- Org Info Summary -->
        <div>
          <div class="flex justify-between items-center border-b border-border pb-2 mb-4">
            <h3 class="text-lg font-semibold text-text">Organization Details</h3>
            <button class="text-primary hover:underline text-sm font-medium" (click)="editStep('organization')">Edit</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="block text-textMuted">Organization Name</span>
              <span class="font-medium text-text">Acme Technologies Pvt Ltd</span>
            </div>
            <div>
              <span class="block text-textMuted">PAN</span>
              <span class="font-medium text-text">ABCDE1234F</span>
            </div>
            <div>
              <span class="block text-textMuted">Industry</span>
              <span class="font-medium text-text">Information Technology</span>
            </div>
          </div>
        </div>

        <div class="mt-8 border border-border p-4 rounded bg-gray-50">
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" class="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" [(ngModel)]="declarationChecked">
            <span class="text-sm text-textMuted leading-relaxed">
              I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that if any information is found to be false/incorrect, my registration is liable to be cancelled and I may be subject to legal action under applicable laws.
            </span>
          </label>
        </div>
      </div>

      <div class="flex justify-between pt-6 border-t border-border mt-8">
        <app-button type="button" variant="secondary" (click)="goBack()">Back</app-button>
        <app-button type="button" variant="primary" (click)="onSubmit()" [disabled]="!declarationChecked">Submit Registration</app-button>
      </div>
    </div>
  `
})
export class ReviewComponent {
  declarationChecked = false;

  constructor(private router: Router) {}

  editStep(stepId: string) {
    this.router.navigate(['/auth/registration', stepId]);
  }

  goBack() {
    this.router.navigate(['/auth/registration/documents']);
  }

  onSubmit() {
    if (!this.declarationChecked) return;
    // Call API to submit
    this.router.navigate(['/auth/registration-success']);
  }
}
