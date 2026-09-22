import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BatchFormComponent } from '../../components/batch-form/batch-form.component';
import { BatchService } from '../../../../core/services/batch.service';
import { SdcService } from '../../../../core/services/sdc.service';

@Component({
  selector: 'app-batch-create',
  standalone: true,
  imports: [CommonModule, RouterModule, BatchFormComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 pb-12">
      <div class="flex items-center gap-3 mb-2">
        <a routerLink="/batches" class="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-500">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h1 class="text-2xl font-extrabold text-[#131A4D] tracking-tight">Create New Training Batch</h1>
          <p class="text-xs text-slate-500">Configure batch capacity, training schedule, and faculty details for approved SDC.</p>
        </div>
      </div>
      
      <app-batch-form (formSubmit)="handleSubmission($event)"></app-batch-form>
    </div>
  `
})
export class BatchCreateComponent {
  private router = inject(Router);
  private batchService = inject(BatchService);
  private sdcService = inject(SdcService);

  handleSubmission(data: any) {
    this.batchService.addBatch({
      batchName: data.qpCode ? `Batch for ${data.qpCode}` : 'Skill Training Batch',
      courseName: data.qpCode || 'Skill Development Course',
      sdcCode: data.sdcCode || 'SDC-001',
      sdcName: data.sdcCode === 'SDC-002' ? 'Rajasthan Kaushal Kendra' : 'Apex Skill Development Center',
      scheme: data.schemeId || 'SAMARTH',
      targetCapacity: data.maxStrength || 30,
      startDate: data.startDate || '2026-10-01',
      endDate: data.endDate || '2026-12-31',
      status: 'APPROVED'
    });

    this.router.navigate(['/batches']);
  }
}
