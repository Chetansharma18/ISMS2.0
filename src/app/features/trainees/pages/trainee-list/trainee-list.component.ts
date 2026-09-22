import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { TraineeService, Trainee } from '../../../../core/services/trainee.service';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';

@Component({
  selector: 'app-trainee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormSelectComponent],
  template: `
    <!-- Toast -->
    <div *ngIf="toast.visible"
      class="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300"
      [ngClass]="toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'">
      <svg *ngIf="toast.type === 'success'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <svg *ngIf="toast.type === 'error'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      {{ toast.message }}
    </div>

    <div class="space-y-5 animate-in fade-in zoom-in-95 duration-300">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Trainee Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage aspirants, approve registrations, and map to batches.</p>
        </div>
        <a
          *ngIf="authService.hasRole('TP_PIA')"
          routerLink="/trainees/register"
          class="inline-flex items-center gap-2 bg-rsldc-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f1540] transition shadow-md shrink-0">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Register Aspirant
        </a>
      </div>



      <!-- Search & Filter -->
      <div class="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap gap-4 items-end">
        <div class="flex-grow max-w-md">
          <label class="block text-xs font-bold text-slate-700 mb-1">Search</label>
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy focus:border-rsldc-navy"
              placeholder="Search by Registration No, Name, Aadhaar...">
          </div>
        </div>
        <div class="text-xs text-slate-400 font-semibold">
          {{ filteredTrainees.length }} aspirant(s) found
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th *ngIf="selectedBatch && authService.hasRole('TP_PIA')" class="w-10 px-4 py-3 text-center">
                <!-- no global select all since two pools -->
              </th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reg No</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trainee Details</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aadhaar</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Education</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngIf="filteredTrainees.length === 0">
              <td [colSpan]="selectedBatch ? 8 : 7" class="px-4 py-16 text-center text-slate-400 text-sm">
                No aspirants found. Register an aspirant to get started.
              </td>
            </tr>
            <tr *ngFor="let trainee of filteredTrainees"
              class="hover:bg-slate-50/70 transition-colors duration-100"
              [ngClass]="{
                'bg-emerald-50/40': selectedBatch && selectedToAssign.has(trainee.id),
                'bg-purple-50/40': selectedBatch && selectedToUnmap.has(trainee.id)
              }">

              <!-- Checkbox column -->
              <td *ngIf="selectedBatch && authService.hasRole('TP_PIA')" class="px-4 py-3 text-center">
                <!-- APPROVED → can map to batch -->
                <input *ngIf="trainee.status === 'APPROVED'"
                  type="checkbox"
                  [checked]="selectedToAssign.has(trainee.id)"
                  (change)="toggleAssign(trainee.id)"
                  title="Select to map to {{ selectedBatch }}"
                  class="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer">

                <!-- ASSIGNED to this batch → can unmap -->
                <input *ngIf="trainee.status === 'ASSIGNED' && trainee.assignedBatchCode === selectedBatch"
                  type="checkbox"
                  [checked]="selectedToUnmap.has(trainee.id)"
                  (change)="toggleUnmap(trainee.id)"
                  title="Select to unmap from {{ selectedBatch }}"
                  class="rounded border-purple-400 text-purple-600 focus:ring-purple-500 cursor-pointer">

                <!-- Other statuses — no checkbox -->
                <span *ngIf="trainee.status === 'SUBMITTED' || trainee.status === 'REJECTED' || (trainee.status === 'ASSIGNED' && trainee.assignedBatchCode !== selectedBatch)"
                  class="block w-4 h-4 rounded border border-slate-200 bg-slate-100 mx-auto" title="Not eligible">
                </span>
              </td>

              <!-- Reg No -->
              <td class="px-4 py-3">
                <div class="font-mono font-semibold text-rsldc-navy text-sm">{{ trainee.registrationNo }}</div>
              </td>

              <!-- Name -->
              <td class="px-4 py-3">
                <div class="font-bold text-slate-800">{{ trainee.name }}</div>
                <div class="text-xs text-slate-500">{{ trainee.gender }} &bull; {{ trainee.category }}</div>
              </td>

              <!-- Aadhaar -->
              <td class="px-4 py-3">
                <div class="font-mono text-slate-600 tracking-wider text-sm">{{ trainee.aadhaarNo }}</div>
              </td>

              <!-- Mobile -->
              <td class="px-4 py-3">
                <div class="text-slate-800 font-medium">{{ trainee.mobile }}</div>
              </td>

              <!-- Education -->
              <td class="px-4 py-3">
                <div class="text-slate-600">{{ trainee.education }}</div>
              </td>

              <!-- Status only -->
              <td class="px-4 py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold border w-fit"
                  [ngClass]="{
                    'bg-approve-100 text-approve-700 border-approve-700/20': trainee.status === 'APPROVED',
                    'bg-purple-100 text-purple-700 border-purple-700/20': trainee.status === 'ASSIGNED',
                    'bg-pending-100 text-pending-700 border-pending-700/20': trainee.status === 'SUBMITTED',
                    'bg-reject-100 text-reject-700 border-reject-700/20': trainee.status === 'REJECTED'
                  }">
                  {{ trainee.status === 'ASSIGNED' ? 'MAPPED' : trainee.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    *ngIf="authService.hasRole(['DEPARTMENT_ADMIN', 'SUPER_ADMIN']) && trainee.status === 'SUBMITTED'"
                    (click)="approve(trainee.id)"
                    class="text-approve-700 hover:text-approve-800 font-semibold text-xs bg-approve-50 hover:bg-approve-100 px-3 py-1.5 rounded transition">
                    Approve
                  </button>
                  <a
                    [routerLink]="['/trainees/view', trainee.id]"
                    class="text-rsldc-blueAccent hover:text-rsldc-navy font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
                    View
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class TraineeListComponent implements OnInit {
  authService = inject(AuthService);
  private traineeService = inject(TraineeService);
  private cdr = inject(ChangeDetectorRef);

  allTrainees: Trainee[] = [];
  filteredTrainees: Trainee[] = [];
  searchQuery = '';

  selectedBatch = '';
  selectedToAssign = new Set<string>(); // APPROVED → map
  selectedToUnmap = new Set<string>();  // ASSIGNED to this batch → unmap

  isAssigning = false;
  isUnmapping = false;

  toast: { visible: boolean; message: string; type: 'success' | 'error' } = {
    visible: false, message: '', type: 'success'
  };
  private toastTimer: any;

  get eligibleCount() {
    return this.allTrainees.filter(t => t.status === 'APPROVED').length;
  }

  get mappedCount() {
    return this.allTrainees.filter(t => t.status === 'ASSIGNED' && t.assignedBatchCode === this.selectedBatch).length;
  }

  ngOnInit() {
    this.traineeService.trainees$.subscribe(trainees => {
      this.allTrainees = trainees;
      this.applySearch();
      this.cdr.markForCheck();
    });
  }

  onBatchChange() {
    this.selectedToAssign.clear();
    this.selectedToUnmap.clear();
  }

  applySearch() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredTrainees = q
      ? this.allTrainees.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.registrationNo.toLowerCase().includes(q) ||
          t.aadhaarNo.toLowerCase().includes(q) ||
          t.mobile.includes(q)
        )
      : [...this.allTrainees];
  }

  toggleAssign(id: string) {
    if (this.selectedToAssign.has(id)) this.selectedToAssign.delete(id);
    else this.selectedToAssign.add(id);
  }

  toggleUnmap(id: string) {
    if (this.selectedToUnmap.has(id)) this.selectedToUnmap.delete(id);
    else this.selectedToUnmap.add(id);
  }

  assignSelected() {
    if (!this.selectedBatch || this.selectedToAssign.size === 0 || this.isAssigning) return;
    const ids = Array.from(this.selectedToAssign);
    this.isAssigning = true;
    this.traineeService.bulkAssignToBatch(ids, this.selectedBatch).subscribe({
      next: () => {
        this.isAssigning = false;
        this.selectedToAssign.clear();
        this.showToast(`✓ ${ids.length} aspirant(s) mapped to ${this.selectedBatch}.`);
      },
      error: () => {
        this.isAssigning = false;
        this.showToast('Failed to map aspirants. Please try again.', 'error');
      }
    });
  }

  unmapSelected() {
    if (this.selectedToUnmap.size === 0 || this.isUnmapping) return;
    if (!confirm(`Unmap ${this.selectedToUnmap.size} aspirant(s) from ${this.selectedBatch}?`)) return;
    const ids = Array.from(this.selectedToUnmap);
    this.isUnmapping = true;
    forkJoin(ids.map(id => this.traineeService.unmapFromBatch(id))).subscribe({
      next: () => {
        this.isUnmapping = false;
        this.selectedToUnmap.clear();
        this.showToast(`✓ ${ids.length} aspirant(s) unmapped from ${this.selectedBatch}.`);
      },
      error: () => {
        this.isUnmapping = false;
        this.showToast('Failed to unmap aspirants. Please try again.', 'error');
      }
    });
  }

  approve(id: string) {
    this.traineeService.approveTrainee(id).subscribe();
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message, type };
    this.toastTimer = setTimeout(() => { this.toast.visible = false; }, 3500);
  }
}
