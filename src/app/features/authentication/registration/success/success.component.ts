import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl w-full bg-white rounded-lg shadow-sm border border-border p-8 md:p-12 text-center">
        
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 class="text-3xl font-bold text-text mb-4">Registration Submitted!</h1>
        
        <p class="text-textMuted mb-6 leading-relaxed">
          Your organization profile has been successfully submitted to the Integrated Scheme Management System.
        </p>
        
        <div class="bg-gray-50 border border-gray-200 rounded p-4 mb-8 text-left max-w-sm mx-auto">
           <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-textMuted">Application ID:</span>
              <span class="font-bold text-text">REG-2026-8924</span>
           </div>
           <div class="flex justify-between items-center">
              <span class="text-sm text-textMuted">Status:</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-primary">Under Review</span>
           </div>
        </div>
        
        <p class="text-sm text-textMuted mb-8">
          The registration is currently under review by the competent authority. You will receive an email notification once it has been approved. You can track the status using your SSO login.
        </p>
        
        <div class="flex justify-center gap-4">
          <a routerLink="/eoi/dashboard" class="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-white bg-primary hover:bg-primaryDark transition-colors w-full cursor-pointer">Go to Dashboard</a>
        </div>
      </div>
    </div>
  `
})
export class SuccessComponent {}
