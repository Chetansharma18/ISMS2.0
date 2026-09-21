import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { TraineeService } from '../../../../core/services/trainee.service';
import { UiTableComponent, TableColumn } from '../../../../shared/components/ui/ui-table/ui-table.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';

@Component({
  selector: 'app-trainee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UiTableComponent, FormSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Trainee Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage and track registered aspirants across all schemes.</p>
        </div>
        <a 
          *ngIf="authService.hasRole('TP_PIA')"
          routerLink="/trainees/register"
          class="inline-flex items-center gap-2 bg-rsldc-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f1540] transition shadow-md">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Register Aspirant
        </a>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap gap-4 items-end">
        <div class="flex-grow max-w-md">
          <label class="block text-xs font-bold text-slate-700 mb-1">Search</label>
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy focus:border-rsldc-navy" placeholder="Search by Registration No, Name, Aadhaar...">
          </div>
        </div>
        <button class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition border border-slate-300">
          Filter
        </button>
      </div>

      <!-- Trainee Data Table -->
      <app-ui-table
        [columns]="columns"
        [data]="(trainees$ | async) || []"
        emptyMessage="No trainees found. Register an aspirant to get started.">
        
        <ng-template #rowTemplate let-trainee let-col="column">
          
          <ng-container *ngIf="col.key === 'registrationNo'">
            <div class="font-mono font-semibold text-rsldc-navy">{{ trainee.registrationNo }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'name'">
            <div class="font-bold text-slate-800">{{ trainee.name }}</div>
            <div class="text-xs text-slate-500">{{ trainee.gender }} • {{ trainee.category }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'aadhaarNo'">
            <div class="font-mono text-slate-600 tracking-wider">{{ trainee.aadhaarNo }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'contact'">
            <div class="text-slate-800 font-medium">{{ trainee.mobile }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'education'">
            <div class="text-slate-600">{{ trainee.education }}</div>
          </ng-container>
          
          <ng-container *ngIf="col.key === 'district'">
            <div class="text-slate-600">{{ trainee.trainingPreferredDistrict || '-' }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
              [ngClass]="{
                'bg-approve-100 text-approve-700 border-approve-700/20': trainee.status === 'APPROVED',
                'bg-purple-100 text-purple-700 border-purple-700/20': trainee.status === 'ASSIGNED',
                'bg-pending-100 text-pending-700 border-pending-700/20': trainee.status === 'SUBMITTED',
                'bg-reject-100 text-reject-700 border-reject-700/20': trainee.status === 'REJECTED'
              }">
              {{ trainee.status === 'ASSIGNED' ? 'BATCH: ' + trainee.assignedBatchCode : trainee.status }}
            </span>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end gap-2">
              <button 
                *ngIf="authService.hasRole(['DEPARTMENT_ADMIN', 'SUPER_ADMIN']) && trainee.status === 'SUBMITTED'"
                (click)="approve(trainee.id)"
                class="text-approve-700 hover:text-approve-800 font-semibold text-xs bg-approve-50 hover:bg-approve-100 px-3 py-1.5 rounded transition">
                Approve
              </button>
              <button class="text-rsldc-blueAccent hover:text-rsldc-navy font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
                View
              </button>
            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>

    </div>
  `
})
export class TraineeListComponent {
  authService = inject(AuthService);
  private traineeService = inject(TraineeService);
  
  trainees$ = this.traineeService.trainees$;

  columns: TableColumn[] = [
    { key: 'registrationNo', label: 'Reg No' },
    { key: 'name', label: 'Trainee Details' },
    { key: 'aadhaarNo', label: 'Aadhaar' },
    { key: 'contact', label: 'Mobile' },
    { key: 'education', label: 'Education' },
    { key: 'district', label: 'Preferred District' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Actions', align: 'right' }
  ];

  approve(id: string) {
    this.traineeService.approveTrainee(id).subscribe();
  }
}
