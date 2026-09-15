import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-registration-documents',
  standalone: true,
  imports: [NgIf, NgFor, ButtonComponent],
  template: `
    <div>
      <h2 class="text-xl font-bold text-text mb-6">Document Uploads</h2>
      <div class="bg-blue-50 border-l-4 border-primary p-4 mb-8 text-sm text-blue-800">
        <p class="font-semibold mb-1">Important Instructions:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Upload clear, legible scanned copies of original documents.</li>
          <li>Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB per document.</li>
          <li>Ensure all documents are self-attested by the authorized signatory.</li>
        </ul>
      </div>

      <div class="space-y-6">
        <!-- Document Item -->
        <div class="border border-border rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex-grow">
            <h3 class="font-semibold text-text mb-1 flex items-center gap-2">
              Registration Certificate <span class="text-error text-sm">*</span>
            </h3>
            <p class="text-xs text-textMuted">Certificate of Incorporation or Registration Certificate</p>
          </div>
          <div class="flex-none w-full md:w-auto text-right">
            <input type="file" class="hidden" #regCert id="regCert" accept=".pdf,.jpg,.png">
            <app-button type="button" variant="secondary" class="w-full md:w-auto" (click)="regCert.click()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload
            </app-button>
          </div>
        </div>

        <!-- Document Item -->
        <div class="border border-border rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex-grow">
            <h3 class="font-semibold text-text mb-1 flex items-center gap-2">
              PAN Card <span class="text-error text-sm">*</span>
            </h3>
            <p class="text-xs text-textMuted">Organization PAN Card</p>
          </div>
          <div class="flex-none w-full md:w-auto text-right">
            <input type="file" class="hidden" #panCard id="panCard" accept=".pdf,.jpg,.png">
            <app-button type="button" variant="secondary" class="w-full md:w-auto" (click)="panCard.click()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload
            </app-button>
          </div>
        </div>

        <!-- Document Item -->
        <div class="border border-green-200 rounded-lg p-4 bg-green-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex-grow flex items-center gap-3">
             <div class="w-10 h-10 bg-white rounded flex items-center justify-center text-success border border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             </div>
            <div>
              <h3 class="font-semibold text-text mb-1 flex items-center gap-2">
                Authorization Letter <span class="text-error text-sm">*</span>
              </h3>
              <p class="text-xs text-green-700">authorization_letter_signed.pdf (1.2MB)</p>
            </div>
          </div>
          <div class="flex-none flex items-center gap-3">
            <span class="text-xs font-semibold text-success flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
               Uploaded
            </span>
            <button type="button" class="text-error hover:text-red-700 p-2" aria-label="Remove document">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

      </div>

      <div class="flex justify-between pt-6 border-t border-border mt-8">
        <app-button type="button" variant="secondary" (click)="goBack()">Back</app-button>
        <app-button type="button" variant="primary" (click)="onSubmit()">Save & Continue</app-button>
      </div>
    </div>
  `
})
export class DocumentsComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/auth/registration/address']);
  }

  onSubmit() {
    // Basic validation mock logic
    this.router.navigate(['/auth/registration/review']);
  }
}
