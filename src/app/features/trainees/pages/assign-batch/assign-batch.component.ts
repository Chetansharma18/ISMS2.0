import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraineeService, Trainee } from '../../../../core/services/trainee.service';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-assign-batch',
  standalone: true,
  imports: [CommonModule, FormsModule, FormSelectComponent],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-rsldc-navy">Assign Aspirants to Batch</h1>
        <p class="text-sm text-slate-500 mt-1">Select a batch and assign eligible, approved aspirants to it.</p>
      </div>

      <!-- Batch Selection & Actions -->
      <div class="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-4 items-end justify-between">
        <div class="w-full md:w-1/3">
          <app-form-select 
            [(ngModel)]="selectedBatch"
            label="Select Target Batch"
            [options]="['B-26-0001', 'B-26-0002']">
          </app-form-select>
        </div>
        
        <button 
          (click)="assignSelected()"
          [disabled]="!selectedBatch || selectedIds.size === 0"
          class="px-6 py-2.5 bg-rsldc-navy text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#0f1540] transition disabled:opacity-50 flex items-center gap-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Assign Selected ({{ selectedIds.size }})
        </button>
      </div>

      <!-- Aspirant Table -->
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 w-12 text-center">
                  <input type="checkbox" (change)="toggleAll($event)" [checked]="isAllSelected()" class="rounded text-rsldc-navy focus:ring-rsldc-navy">
                </th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reg No</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trainee Details</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aadhaar</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let trainee of eligibleTrainees" class="hover:bg-slate-50 transition">
                <td class="p-4 text-center">
                  <input type="checkbox" [checked]="selectedIds.has(trainee.id)" (change)="toggleSelection(trainee.id)" class="rounded text-rsldc-navy focus:ring-rsldc-navy">
                </td>
                <td class="p-4 font-mono font-semibold text-rsldc-navy">{{ trainee.registrationNo }}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-800">{{ trainee.name }}</div>
                  <div class="text-xs text-slate-500">{{ trainee.gender }} • {{ trainee.category }}</div>
                </td>
                <td class="p-4 font-mono text-slate-600 tracking-wider">{{ trainee.aadhaarNo }}</td>
                <td class="p-4 font-medium text-slate-800">{{ trainee.mobile }}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold border bg-approve-100 text-approve-700 border-approve-700/20">
                    {{ trainee.status }}
                  </span>
                </td>
              </tr>
              
              <tr *ngIf="eligibleTrainees.length === 0">
                <td colspan="6" class="p-12 text-center text-slate-500">
                  <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <p class="font-bold">No eligible aspirants found.</p>
                  <p class="text-sm mt-1">Only aspirants with APPROVED status can be assigned.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AssignBatchComponent implements OnInit {
  private traineeService = inject(TraineeService);
  
  eligibleTrainees: Trainee[] = [];
  selectedIds = new Set<string>();
  selectedBatch = '';

  ngOnInit() {
    this.fetchTrainees();
  }

  fetchTrainees() {
    this.traineeService.trainees$.subscribe(trainees => {
      // Only APPROVED trainees can be assigned to a batch
      this.eligibleTrainees = trainees.filter(t => t.status === 'APPROVED');
      // Clear selection when data refreshes
      this.selectedIds.clear();
    });
  }

  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.eligibleTrainees.forEach(t => this.selectedIds.add(t.id));
    } else {
      this.selectedIds.clear();
    }
  }

  isAllSelected() {
    return this.eligibleTrainees.length > 0 && this.selectedIds.size === this.eligibleTrainees.length;
  }

  assignSelected() {
    if (this.selectedBatch && this.selectedIds.size > 0) {
      const ids = Array.from(this.selectedIds);
      this.traineeService.bulkAssignToBatch(ids, this.selectedBatch).subscribe();
    }
  }
}
