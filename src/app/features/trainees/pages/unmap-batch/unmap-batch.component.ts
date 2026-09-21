import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraineeService, Trainee } from '../../../../core/services/trainee.service';
import { UiSelectComponent } from '../../../../shared/components/ui/ui-select/ui-select.component';

@Component({
  selector: 'app-unmap-batch',
  standalone: true,
  imports: [CommonModule, FormsModule, UiSelectComponent],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-rsldc-navy">Unmap Aspirants</h1>
        <p class="text-sm text-slate-500 mt-1">Select a batch to view its mapped aspirants and unmap them if needed.</p>
      </div>

      <!-- Batch Selection -->
      <div class="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div class="max-w-md">
          <app-ui-select 
            [(ngModel)]="selectedBatch"
            (ngModelChange)="onBatchChange()"
            label="Select Batch to Unmap from"
            [options]="[{label:'B-26-0001 (Web Development)',value:'B-26-0001'},{label:'B-26-0002 (Data Entry)',value:'B-26-0002'}]">
          </app-ui-select>
        </div>
      </div>

      <!-- Aspirant Table -->
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden" *ngIf="selectedBatch">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reg No</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trainee Details</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aadhaar</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let trainee of mappedTrainees" class="hover:bg-slate-50 transition">
                <td class="p-4 font-mono font-semibold text-rsldc-navy">{{ trainee.registrationNo }}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-800">{{ trainee.name }}</div>
                  <div class="text-xs text-slate-500">{{ trainee.gender }} • {{ trainee.category }}</div>
                </td>
                <td class="p-4 font-mono text-slate-600 tracking-wider">{{ trainee.aadhaarNo }}</td>
                <td class="p-4 font-medium text-slate-800">{{ trainee.mobile }}</td>
                <td class="p-4 text-right">
                  <button 
                    (click)="unmap(trainee.id)"
                    class="px-3 py-1.5 bg-reject-50 text-reject-600 hover:bg-reject-100 border border-reject-200 font-bold text-xs rounded-lg transition">
                    Unmap Aspirant
                  </button>
                </td>
              </tr>
              
              <tr *ngIf="mappedTrainees.length === 0">
                <td colspan="5" class="p-12 text-center text-slate-500">
                  <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                  <p class="font-bold">No aspirants found in this batch.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UnmapBatchComponent implements OnInit {
  private traineeService = inject(TraineeService);
  
  allTrainees: Trainee[] = [];
  mappedTrainees: Trainee[] = [];
  selectedBatch = '';

  ngOnInit() {
    this.traineeService.trainees$.subscribe(trainees => {
      this.allTrainees = trainees;
      this.onBatchChange();
    });
  }

  onBatchChange() {
    if (this.selectedBatch) {
      this.mappedTrainees = this.allTrainees.filter(t => t.status === 'ASSIGNED' && t.assignedBatchCode === this.selectedBatch);
    } else {
      this.mappedTrainees = [];
    }
  }

  unmap(id: string) {
    this.traineeService.unmapFromBatch(id).subscribe();
  }
}
