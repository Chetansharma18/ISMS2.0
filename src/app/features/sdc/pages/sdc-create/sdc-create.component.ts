import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SdcFormComponent } from '../../components/sdc-form/sdc-form.component';

@Component({
  selector: 'app-sdc-create',
  standalone: true,
  imports: [CommonModule, RouterModule, SdcFormComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <div class="flex items-center gap-3 mb-2">
        <a routerLink="/sdcs" class="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-500">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Register New SDC</h1>
          <p class="text-sm text-slate-500">Complete the workflow to submit your training center for inspection.</p>
        </div>
      </div>

      <!-- Multi-step form component -->
      <app-sdc-form (formSubmit)="handleSubmission($event)"></app-sdc-form>

    </div>
  `
})
export class SdcCreateComponent {
  private router = inject(Router);

  handleSubmission(data: any) {
    // In a real app, this calls the backend API to save the SDC Draft -> Submit workflow.
    console.log('SDC Submitted:', data);
    alert('SDC Successfully Submitted for Inspection!');
    this.router.navigate(['/sdcs']);
  }
}
