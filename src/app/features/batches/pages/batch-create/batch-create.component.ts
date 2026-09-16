import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BatchFormComponent } from '../../components/batch-form/batch-form.component';

@Component({
  selector: 'app-batch-create',
  standalone: true,
  imports: [CommonModule, RouterModule, BatchFormComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <a routerLink="/batches" class="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-500">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Create New Batch</h1>
          <p class="text-sm text-slate-500">Configure batch capacity, faculty, and training dates.</p>
        </div>
      </div>
      <app-batch-form (formSubmit)="handleSubmission($event)"></app-batch-form>
    </div>
  `
})
export class BatchCreateComponent {
  private router = inject(Router);

  handleSubmission(data: any) {
    console.log('Batch Submitted:', data);
    alert('Batch Created Successfully! It is now Pending Approval.');
    this.router.navigate(['/batches']);
  }
}
