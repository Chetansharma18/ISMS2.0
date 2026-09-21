import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TraineeService, Trainee } from '../../../../core/services/trainee.service';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { UiTableComponent, TableColumn } from '../../../../shared/components/ui/ui-table/ui-table.component';

@Component({
  selector: 'app-batch-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule, FormSelectComponent, UiTableComponent],
  template: `
    <!-- Toast Notification -->
    <div *ngIf="toast.visible"
      class="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-top-4"
      [ngClass]="toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'">
      <svg *ngIf="toast.type === 'success'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <svg *ngIf="toast.type === 'error'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      {{ toast.message }}
    </div>

    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-rsldc-navy">Batch Mapping</h1>
        <p class="text-sm text-slate-500 mt-1">Assign eligible aspirants to batches or unmap currently assigned aspirants.</p>
      </div>

      <!-- Batch Selection -->
      <div class="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-4 items-end justify-between">
        <div class="w-full md:w-1/3">
          <app-form-select 
            [(ngModel)]="selectedBatch"
            (ngModelChange)="onBatchChange()"
            label="Select Target Batch"
            [options]="['B-26-0001', 'B-26-0002']">
          </app-form-select>
        </div>
        <div *ngIf="selectedBatch" class="text-sm text-slate-500 text-right">
          <span class="font-bold text-rsldc-navy">{{ mappedTrainees.length }}</span> mapped &nbsp;•&nbsp;
          <span class="font-bold text-emerald-600">{{ eligibleTrainees.length }}</span> eligible
        </div>
      </div>

      <!-- Tab View -->
      <div *ngIf="selectedBatch" class="space-y-4">
        <!-- Tabs -->
        <div class="flex gap-4 border-b border-slate-200">
          <button 
            (click)="activeTab = 'AVAILABLE'"
            class="pb-3 text-sm font-bold transition border-b-2"
            [ngClass]="activeTab === 'AVAILABLE' ? 'border-rsldc-navy text-rsldc-navy' : 'border-transparent text-slate-500 hover:text-slate-700'">
            Available Aspirants ({{ eligibleTrainees.length }})
          </button>
          <button 
            (click)="activeTab = 'MAPPED'"
            class="pb-3 text-sm font-bold transition border-b-2"
            [ngClass]="activeTab === 'MAPPED' ? 'border-rsldc-navy text-rsldc-navy' : 'border-transparent text-slate-500 hover:text-slate-700'">
            Mapped Aspirants ({{ mappedTrainees.length }})
          </button>
        </div>

        <!-- Available Aspirants Tab -->
        <div *ngIf="activeTab === 'AVAILABLE'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="mb-4 flex justify-between items-center">
            <p class="text-sm text-slate-500">Select aspirants to assign them to <span class="font-bold text-rsldc-navy">{{ selectedBatch }}</span>.</p>
            <button 
              (click)="assignSelected()"
              [disabled]="selectedAvailableIds.size === 0 || isAssigning"
              class="px-6 py-2 bg-rsldc-navy text-white font-bold text-sm rounded-lg shadow-md hover:bg-[#0f1540] transition disabled:opacity-50 flex items-center gap-2">
              <svg *ngIf="!isAssigning" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              <svg *ngIf="isAssigning" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ isAssigning ? 'Assigning...' : 'Assign Selected (' + selectedAvailableIds.size + ')' }}
            </button>
          </div>

          <app-ui-table
            [columns]="availableColumns"
            [data]="eligibleTrainees"
            [allSelected]="isAllAvailableSelected()"
            (selectAll)="toggleAllAvailable($event)"
            emptyMessage="No eligible aspirants found. Only aspirants with APPROVED status can be assigned.">
            
            <ng-template #rowTemplate let-trainee let-col="column">
              <ng-container *ngIf="col.key === 'checkbox'">
                <div class="text-center w-full">
                  <input type="checkbox" [checked]="selectedAvailableIds.has(trainee.id)" (change)="toggleAvailableSelection(trainee.id)" class="rounded text-rsldc-navy focus:ring-rsldc-navy cursor-pointer">
                </div>
              </ng-container>

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
                <div class="font-medium text-slate-800">{{ trainee.mobile }}</div>
              </ng-container>

              <ng-container *ngIf="col.key === 'status'">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold border bg-approve-100 text-approve-700 border-approve-700/20">
                  {{ trainee.status }}
                </span>
              </ng-container>
            </ng-template>
          </app-ui-table>
        </div>

        <!-- Mapped Aspirants Tab -->
        <div *ngIf="activeTab === 'MAPPED'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="mb-4 flex justify-between items-center">
            <p class="text-sm text-slate-500">Aspirants currently assigned to <span class="font-bold text-rsldc-navy">{{ selectedBatch }}</span>.</p>
            <button 
              (click)="unmapSelected()"
              [disabled]="selectedMappedIds.size === 0 || isUnmapping"
              class="px-6 py-2 bg-reject-50 text-reject-600 border border-reject-200 font-bold text-sm rounded-lg shadow-md hover:bg-reject-100 transition disabled:opacity-50 flex items-center gap-2">
              <svg *ngIf="!isUnmapping" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              <svg *ngIf="isUnmapping" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ isUnmapping ? 'Unmapping...' : 'Unmap Selected (' + selectedMappedIds.size + ')' }}
            </button>
          </div>

          <app-ui-table
            [columns]="mappedColumns"
            [data]="mappedTrainees"
            [allSelected]="isAllMappedSelected()"
            (selectAll)="toggleAllMapped($event)"
            emptyMessage="No aspirants currently assigned to this batch.">
            
            <ng-template #rowTemplate let-trainee let-col="column">
              <ng-container *ngIf="col.key === 'checkbox'">
                <div class="text-center w-full">
                  <input type="checkbox" [checked]="selectedMappedIds.has(trainee.id)" (change)="toggleMappedSelection(trainee.id)" class="rounded text-rsldc-navy focus:ring-rsldc-navy cursor-pointer">
                </div>
              </ng-container>

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
                <div class="font-medium text-slate-800">{{ trainee.mobile }}</div>
              </ng-container>

              <ng-container *ngIf="col.key === 'batchCode'">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {{ trainee.assignedBatchCode }}
                </span>
              </ng-container>
            </ng-template>
          </app-ui-table>
        </div>
      </div>
    </div>
  `
})
export class BatchMappingComponent implements OnInit {
  private traineeService = inject(TraineeService);
  
  availableColumns: TableColumn[] = [
    { key: 'checkbox', label: '', isCheckbox: true, width: '48px', align: 'center' },
    { key: 'registrationNo', label: 'Reg No' },
    { key: 'name', label: 'Trainee Details' },
    { key: 'aadhaarNo', label: 'Aadhaar' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' }
  ];

  mappedColumns: TableColumn[] = [
    { key: 'checkbox', label: '', isCheckbox: true, width: '48px', align: 'center' },
    { key: 'registrationNo', label: 'Reg No' },
    { key: 'name', label: 'Trainee Details' },
    { key: 'aadhaarNo', label: 'Aadhaar' },
    { key: 'contact', label: 'Contact' },
    { key: 'batchCode', label: 'Batch' }
  ];
  
  allTrainees: Trainee[] = [];
  eligibleTrainees: Trainee[] = [];
  mappedTrainees: Trainee[] = [];
  
  selectedBatch = '';
  activeTab: 'AVAILABLE' | 'MAPPED' = 'AVAILABLE';
  
  selectedAvailableIds = new Set<string>();
  selectedMappedIds = new Set<string>();

  isAssigning = false;
  isUnmapping = false;

  toast: { visible: boolean; message: string; type: 'success' | 'error' } = {
    visible: false,
    message: '',
    type: 'success'
  };

  private toastTimer: any;

  ngOnInit() {
    this.traineeService.trainees$.subscribe(trainees => {
      this.allTrainees = trainees;
      // Available = APPROVED status only (not yet assigned)
      this.eligibleTrainees = trainees.filter(t => t.status === 'APPROVED');
      this.selectedAvailableIds.clear();
      this.refreshMappedList();
    });
  }

  onBatchChange() {
    this.selectedMappedIds.clear();
    this.selectedAvailableIds.clear();
    this.activeTab = 'AVAILABLE';
    this.refreshMappedList();
  }

  private refreshMappedList() {
    if (this.selectedBatch) {
      this.mappedTrainees = this.allTrainees.filter(
        t => t.status === 'ASSIGNED' && t.assignedBatchCode === this.selectedBatch
      );
    } else {
      this.mappedTrainees = [];
    }
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message, type };
    this.toastTimer = setTimeout(() => {
      this.toast.visible = false;
    }, 3500);
  }

  // --- Available (Assign) Logic ---
  toggleAvailableSelection(id: string) {
    if (this.selectedAvailableIds.has(id)) {
      this.selectedAvailableIds.delete(id);
    } else {
      this.selectedAvailableIds.add(id);
    }
  }

  toggleAllAvailable(event: any) {
    if (event) {
      this.eligibleTrainees.forEach(t => this.selectedAvailableIds.add(t.id));
    } else {
      this.selectedAvailableIds.clear();
    }
  }

  isAllAvailableSelected() {
    return this.eligibleTrainees.length > 0 && this.selectedAvailableIds.size === this.eligibleTrainees.length;
  }

  assignSelected() {
    if (this.selectedBatch && this.selectedAvailableIds.size > 0 && !this.isAssigning) {
      const ids = Array.from(this.selectedAvailableIds);
      const count = ids.length;
      this.isAssigning = true;
      this.traineeService.bulkAssignToBatch(ids, this.selectedBatch).subscribe({
        next: () => {
          this.isAssigning = false;
          // Switch to Mapped tab so user immediately sees the result
          this.activeTab = 'MAPPED';
          this.showToast(`✓ Successfully assigned ${count} aspirant(s) to batch ${this.selectedBatch}.`);
        },
        error: () => {
          this.isAssigning = false;
          this.showToast('Failed to assign aspirants. Please try again.', 'error');
        }
      });
    }
  }

  // --- Mapped (Unmap) Logic ---
  toggleMappedSelection(id: string) {
    if (this.selectedMappedIds.has(id)) {
      this.selectedMappedIds.delete(id);
    } else {
      this.selectedMappedIds.add(id);
    }
  }

  toggleAllMapped(event: any) {
    if (event) {
      this.mappedTrainees.forEach(t => this.selectedMappedIds.add(t.id));
    } else {
      this.selectedMappedIds.clear();
    }
  }

  isAllMappedSelected() {
    return this.mappedTrainees.length > 0 && this.selectedMappedIds.size === this.mappedTrainees.length;
  }

  unmapSelected() {
    if (this.selectedMappedIds.size > 0 && !this.isUnmapping) {
      if (confirm(`Are you sure you want to unmap ${this.selectedMappedIds.size} aspirant(s) from ${this.selectedBatch}?`)) {
        const ids = Array.from(this.selectedMappedIds);
        const count = ids.length;
        this.isUnmapping = true;
        const requests = ids.map(id => this.traineeService.unmapFromBatch(id));
        
        forkJoin(requests).subscribe({
          next: () => {
            this.isUnmapping = false;
            this.showToast(`✓ Successfully unmapped ${count} aspirant(s) from batch ${this.selectedBatch}.`);
          },
          error: () => {
            this.isUnmapping = false;
            this.showToast('Failed to unmap aspirants. Please try again.', 'error');
          }
        });
      }
    }
  }
}
