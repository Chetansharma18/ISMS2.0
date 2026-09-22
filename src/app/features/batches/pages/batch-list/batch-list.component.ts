import { Component, inject, OnInit, ChangeDetectorRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { BatchService, Batch } from '../../../../core/services/batch.service';
import { TraineeService, Trainee } from '../../../../core/services/trainee.service';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Toast Notification -->
    @if (toastMessage()) {
      <div class="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl bg-emerald-600 text-white text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        <span>{{ toastMessage() }}</span>
        <button (click)="toastMessage.set(null)" class="ml-2 text-emerald-200 hover:text-white text-lg">&times;</button>
      </div>
    }

    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">Batch Management & Aspirant Mapping</h1>
          <p class="text-sm text-slate-500 mt-1">Manage training batches, track capacity, and map/unmap approved aspirants.</p>
        </div>
        <a 
          *ngIf="authService.hasRole('TP_PIA')"
          routerLink="/batches/create"
          class="inline-flex items-center gap-2 bg-[#131A4D] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0a0e29] transition shadow-md shrink-0">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          + Create New Batch
        </a>
      </div>

      <!-- Search & Filters Bar -->
      <div class="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div class="flex-grow max-w-md relative">
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilter()"
            class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#131A4D]" 
            placeholder="Search by Batch Code, Course, SDC, or Scheme...">
        </div>
        <div class="text-xs font-semibold text-slate-500">
          Showing <span class="font-bold text-slate-800">{{ filteredBatches.length }}</span> Batch(es)
        </div>
      </div>

      <!-- Batches Table -->
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Batch Info</th>
              <th class="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Course & Scheme</th>
              <th class="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Center (SDC)</th>
              <th class="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Capacity & Mapped</th>
              <th class="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Batch Duration</th>
              <th class="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngIf="filteredBatches.length === 0">
              <td colspan="7" class="px-5 py-12 text-center text-slate-400">
                No training batches found matching criteria.
              </td>
            </tr>

            <tr *ngFor="let batch of filteredBatches" class="hover:bg-slate-50/80 transition-colors">
              
              <!-- Batch Code & Name -->
              <td class="px-5 py-4">
                <div class="font-mono font-bold text-[#131A4D] text-sm">{{ batch.batchCode }}</div>
                <div class="text-xs text-slate-600 font-semibold mt-0.5">{{ batch.batchName }}</div>
              </td>

              <!-- Course & Scheme -->
              <td class="px-5 py-4">
                <div class="font-bold text-slate-800 text-xs">{{ batch.courseName }}</div>
                <span class="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200 uppercase">
                  {{ batch.scheme }}
                </span>
              </td>

              <!-- SDC -->
              <td class="px-5 py-4">
                <div class="font-semibold text-slate-800 text-xs">{{ batch.sdcName }}</div>
                <div class="text-[11px] font-mono text-slate-500">{{ batch.sdcCode }}</div>
              </td>

              <!-- Capacity Progress -->
              <td class="px-5 py-4 w-48">
                <div class="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>{{ batch.mappedAspirantsCount }} / {{ batch.targetCapacity }}</span>
                  <span class="text-[10px] text-slate-500 font-semibold">{{ calculatePercent(batch) }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    class="h-full rounded-full transition-all duration-300"
                    [ngClass]="batch.mappedAspirantsCount >= batch.targetCapacity ? 'bg-amber-500' : 'bg-emerald-500'"
                    [style.width.%]="calculatePercent(batch)">
                  </div>
                </div>
              </td>

              <!-- Dates -->
              <td class="px-5 py-4 text-xs font-semibold text-slate-600">
                <div>From: {{ batch.startDate }}</div>
                <div>To: {{ batch.endDate }}</div>
              </td>

              <!-- Status -->
              <td class="px-5 py-4">
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase inline-block"
                  [ngClass]="{
                    'bg-emerald-100 text-emerald-800 border-emerald-300': batch.status === 'ONGOING',
                    'bg-blue-100 text-blue-800 border-blue-300': batch.status === 'APPROVED',
                    'bg-slate-100 text-slate-700 border-slate-300': batch.status === 'DRAFT',
                    'bg-purple-100 text-purple-800 border-purple-300': batch.status === 'COMPLETED'
                  }">
                  {{ batch.status }}
                </span>
              </td>

              <!-- ACTION BUTTONS: MAP & UNMAP -->
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    (click)="openMappingModal(batch)"
                    class="px-3.5 py-2 bg-[#131A4D] hover:bg-[#0a0e29] text-white text-xs font-bold rounded shadow-xs hover:shadow transition-all inline-flex items-center gap-1.5 cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    Select & Map Aspirants
                  </button>
                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- MODAL: ASPIRANT MAPPING & UNMAPPING                              -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      @if (activeMappingBatch()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <!-- Modal Header -->
            <div class="bg-[#131A4D] px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 class="text-base font-bold flex items-center gap-2">
                  <span>👥 Batch Aspirant Management</span>
                  <span class="bg-blue-800 px-2.5 py-0.5 rounded text-xs font-mono font-bold">{{ activeMappingBatch()?.batchCode }}</span>
                </h3>
                <p class="text-xs text-blue-200 mt-0.5">
                  Course: <strong class="text-white">{{ activeMappingBatch()?.courseName }}</strong> | Center: {{ activeMappingBatch()?.sdcName }}
                </p>
              </div>
              <button (click)="activeMappingBatch.set(null)" class="text-slate-300 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <!-- Modal Sub-Header Tabs -->
            <div class="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex gap-4">
              <button 
                (click)="activeModalTab.set('MAP')"
                class="pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2"
                [ngClass]="activeModalTab() === 'MAP' ? 'border-[#131A4D] text-[#131A4D]' : 'border-transparent text-slate-500 hover:text-slate-700'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                Map New Aspirants ({{ eligibleAvailableCount }})
              </button>
              
              <button 
                (click)="activeModalTab.set('UNMAP')"
                class="pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2"
                [ngClass]="activeModalTab() === 'UNMAP' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                Currently Mapped Aspirants ({{ currentlyMappedCount }})
              </button>
            </div>

            <!-- Search Bar inside Modal -->
            <div class="px-6 py-3 bg-white border-b border-slate-200">
              <input 
                type="text" 
                [(ngModel)]="modalSearch"
                (ngModelChange)="applyModalSearch()"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]"
                [placeholder]="activeModalTab() === 'MAP' ? 'Search eligible candidates to map...' : 'Search currently mapped candidates to unmap...'">
            </div>

            <!-- TAB 1: MAP NEW ASPIRANTS -->
            <div *ngIf="activeModalTab() === 'MAP'" class="p-6 max-h-[55vh] overflow-y-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th class="w-10 px-3 py-2 text-center">Select</th>
                    <th class="px-3 py-2">Reg No</th>
                    <th class="px-3 py-2">Aspirant Name</th>
                    <th class="px-3 py-2">Aadhaar</th>
                    <th class="px-3 py-2">Mobile</th>
                    <th class="px-3 py-2">Education</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngIf="eligibleAspirants.length === 0">
                    <td colspan="6" class="px-4 py-8 text-center text-slate-400">
                      No eligible approved aspirants available to map.
                    </td>
                  </tr>

                  <tr *ngFor="let t of eligibleAspirants" class="hover:bg-slate-50" [ngClass]="{'bg-emerald-50/70': selectedToAssign.has(t.id)}">
                    <td class="px-3 py-2.5 text-center">
                      <input 
                        type="checkbox" 
                        [checked]="selectedToAssign.has(t.id)"
                        (change)="toggleAssign(t.id)"
                        class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4">
                    </td>
                    <td class="px-3 py-2.5 font-mono font-bold text-[#131A4D]">{{ t.registrationNo }}</td>
                    <td class="px-3 py-2.5 font-bold text-slate-800">{{ t.name }}</td>
                    <td class="px-3 py-2.5 font-mono text-slate-600">{{ t.aadhaarNo }}</td>
                    <td class="px-3 py-2.5 font-semibold text-slate-700">{{ t.mobile }}</td>
                    <td class="px-3 py-2.5 font-semibold text-slate-600">{{ t.education }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- TAB 2: CURRENTLY MAPPED ASPIRANTS (UNMAP TAB) -->
            <div *ngIf="activeModalTab() === 'UNMAP'" class="p-6 max-h-[55vh] overflow-y-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-purple-100/70 text-purple-900 font-bold uppercase border-b border-purple-200">
                  <tr>
                    <th class="px-3 py-2">Reg No</th>
                    <th class="px-3 py-2">Aspirant Name</th>
                    <th class="px-3 py-2">Aadhaar</th>
                    <th class="px-3 py-2">Mobile</th>
                    <th class="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngIf="mappedAspirants.length === 0">
                    <td colspan="5" class="px-4 py-8 text-center text-slate-400">
                      No aspirants are currently mapped to this batch.
                    </td>
                  </tr>

                  <tr *ngFor="let t of mappedAspirants" class="hover:bg-purple-50/50">
                    <td class="px-3 py-2.5 font-mono font-bold text-[#131A4D]">{{ t.registrationNo }}</td>
                    <td class="px-3 py-2.5 font-bold text-slate-800">{{ t.name }}</td>
                    <td class="px-3 py-2.5 font-mono text-slate-600">{{ t.aadhaarNo }}</td>
                    <td class="px-3 py-2.5 font-semibold text-slate-700">{{ t.mobile }}</td>
                    
                    <!-- DIRECT UNMAP BUTTON -->
                    <td class="px-3 py-2.5 text-right">
                      <button 
                        (click)="unmapSingle(t)"
                        class="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded text-[11px] transition-colors flex items-center gap-1 ml-auto">
                        <svg class="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        Unmap Candidate
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Modal Footer -->
            <div class="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <button (click)="activeMappingBatch.set(null)" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-50 transition-colors">
                Close
              </button>
              
              <div *ngIf="activeModalTab() === 'MAP'">
                <button 
                  [disabled]="selectedToAssign.size === 0 || isSaving"
                  (click)="mapSelectedAspirants()"
                  class="px-5 py-2 bg-[#131A4D] hover:bg-[#0a0e29] text-white text-xs font-bold rounded shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  Confirm & Map Aspirants ({{ selectedToAssign.size }})
                </button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class BatchListComponent implements OnInit {
  authService = inject(AuthService);
  private batchService = inject(BatchService);
  private traineeService = inject(TraineeService);
  private cdr = inject(ChangeDetectorRef);

  batches: Batch[] = [];
  filteredBatches: Batch[] = [];
  searchQuery = '';

  allTrainees: Trainee[] = [];
  modalTrainees: Trainee[] = [];
  modalSearch = '';

  activeMappingBatch = signal<Batch | null>(null);
  activeModalTab = signal<'MAP' | 'UNMAP'>('MAP');

  selectedToAssign = new Set<string>();
  toastMessage = signal<string | null>(null);
  isSaving = false;

  get currentlyMappedCount(): number {
    const batch = this.activeMappingBatch();
    if (!batch) return 0;
    return this.allTrainees.filter(t => t.status === 'ASSIGNED' && t.assignedBatchCode === batch.batchCode).length;
  }

  get eligibleAvailableCount(): number {
    return this.allTrainees.filter(t => t.status === 'APPROVED').length;
  }

  get eligibleAspirants(): Trainee[] {
    const q = this.modalSearch.toLowerCase().trim();
    return this.allTrainees
      .filter(t => t.status === 'APPROVED')
      .filter(t => !q || t.name.toLowerCase().includes(q) || t.registrationNo.toLowerCase().includes(q) || t.aadhaarNo.includes(q));
  }

  get mappedAspirants(): Trainee[] {
    const batch = this.activeMappingBatch();
    if (!batch) return [];
    const q = this.modalSearch.toLowerCase().trim();
    return this.allTrainees
      .filter(t => t.status === 'ASSIGNED' && t.assignedBatchCode === batch.batchCode)
      .filter(t => !q || t.name.toLowerCase().includes(q) || t.registrationNo.toLowerCase().includes(q) || t.aadhaarNo.includes(q));
  }

  ngOnInit() {
    this.batchService.batches$.subscribe(b => {
      this.batches = b;
      this.applyFilter();
      this.cdr.markForCheck();
    });

    this.traineeService.trainees$.subscribe(t => {
      this.allTrainees = t;
      this.applyModalSearch();
      this.cdr.markForCheck();
    });
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredBatches = q
      ? this.batches.filter(b => 
          b.batchCode.toLowerCase().includes(q) ||
          b.batchName.toLowerCase().includes(q) ||
          b.courseName.toLowerCase().includes(q) ||
          b.sdcName.toLowerCase().includes(q) ||
          b.scheme.toLowerCase().includes(q)
        )
      : [...this.batches];
  }

  calculatePercent(batch: Batch): number {
    if (!batch.targetCapacity) return 0;
    return Math.min(100, Math.round((batch.mappedAspirantsCount / batch.targetCapacity) * 100));
  }

  openMappingModal(batch: Batch) {
    this.activeMappingBatch.set(batch);
    this.activeModalTab.set('MAP');
    this.selectedToAssign.clear();
    this.modalSearch = '';
  }

  applyModalSearch() {
    // Handled reactively by getters
  }

  toggleAssign(id: string) {
    if (this.selectedToAssign.has(id)) this.selectedToAssign.delete(id);
    else this.selectedToAssign.add(id);
  }

  mapSelectedAspirants() {
    const batch = this.activeMappingBatch();
    if (!batch || this.selectedToAssign.size === 0) return;

    const ids = Array.from(this.selectedToAssign);
    this.isSaving = true;

    this.traineeService.bulkAssignToBatch(ids, batch.batchCode).subscribe({
      next: () => {
        this.isSaving = false;
        const newCount = this.currentlyMappedCount;
        this.batchService.updateMappedCount(batch.batchCode, newCount);
        this.showToast(`✓ ${ids.length} aspirant(s) successfully mapped to batch ${batch.batchCode}!`);
        this.selectedToAssign.clear();
        this.activeMappingBatch.set(null);
      }
    });
  }

  /** Direct Unmap Action for a candidate */
  unmapSingle(trainee: Trainee) {
    const batch = this.activeMappingBatch();
    if (!batch) return;

    this.traineeService.unmapFromBatch(trainee.id).subscribe({
      next: () => {
        const newCount = this.currentlyMappedCount;
        this.batchService.updateMappedCount(batch.batchCode, newCount);
        this.showToast(`✓ ${trainee.name} (${trainee.registrationNo}) has been unmapped from batch ${batch.batchCode}.`);
      }
    });
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 5000);
  }
}
