import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../services/batch.service';
import { BatchRecord } from '../models/batch.model';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans p-6 sm:p-8" style="font-family: 'Inter', sans-serif;">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Page Header & Action (Matching Screenshot 2) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Batch Management
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
              Rajasthan Skill &amp; Livelihoods Development Corporation &bull; Candidate Allocation Desk
            </p>
          </div>

          <!-- Create New Batch Button -->
          <button
            type="button"
            (click)="router.navigate(['/batches/create'])"
            class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0 self-start sm:self-auto select-none"
            style="color: #ffffff !important;"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Create New Batch</span>
          </button>
        </div>

        <!-- Search Bar & Batch Count Row -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="relative w-full max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search by Batch Code, Course Name, Center, or Scheme..."
              class="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all shadow-2xs"
            />
          </div>

          <div class="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            Total Batches: <strong class="text-slate-800">{{ filteredBatches().length }}</strong>
          </div>
        </div>

        <!-- Batches Table -->
        <div class="border border-[#D9E1E7] rounded-lg overflow-hidden bg-white shadow-2xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr class="border-b border-[#D9E1E7] bg-white text-[#5F6B76] text-[11px] font-bold tracking-wider uppercase select-none">
                  <th class="py-3.5 px-4">BATCH INFO</th>
                  <th class="py-3.5 px-4">COURSE &amp; SCHEME</th>
                  <th class="py-3.5 px-4">CENTER (SDC)</th>
                  <th class="py-3.5 px-4">CAPACITY &amp; MAPPED</th>
                  <th class="py-3.5 px-4">BATCH DURATION</th>
                  <th class="py-3.5 px-4">STATUS</th>
                  <th class="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#D9E1E7]/70 text-[13px] text-slate-800">
                @for (b of filteredBatches(); track b.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    
                    <!-- Batch Info -->
                    <td class="py-4 px-4 font-mono">
                      <div class="font-bold text-slate-900 leading-snug">
                        {{ b.batchCode }}
                      </div>
                      <div class="text-xs text-slate-500 mt-0.5">
                        {{ b.batchName || 'General Batch' }}
                      </div>
                    </td>

                    <!-- Course & Scheme -->
                    <td class="py-4 px-4">
                      <div class="font-bold text-slate-900 leading-snug">
                        {{ b.courseName }}
                      </div>
                      <div class="mt-1">
                        <span class="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {{ b.scheme }}
                        </span>
                      </div>
                    </td>

                    <!-- Center (SDC) -->
                    <td class="py-4 px-4">
                      <div class="font-bold text-slate-900 leading-snug">
                        {{ b.sdcName }}
                      </div>
                      <div class="text-xs text-slate-500 mt-0.5">
                        {{ b.sdcCode }}
                      </div>
                    </td>

                    <!-- Capacity & Mapped -->
                    <td class="py-4 px-4 min-w-[150px]">
                      <div class="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>{{ b.mappedAspirantsCount }}/{{ b.maxStrength }} Aspirants</span>
                        <span class="text-slate-400 font-normal text-[11px]">{{ getMappedPercent(b) }}%</span>
                      </div>
                      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          [style.width]="getMappedPercent(b) + '%'"
                        ></div>
                      </div>
                    </td>

                    <!-- Batch Duration -->
                    <td class="py-4 px-4 text-xs text-slate-600 space-y-0.5">
                      <div><span class="text-slate-400">From:</span> {{ b.startDate }}</div>
                      <div><span class="text-slate-400">To:</span> {{ b.endDate }}</div>
                    </td>

                    <!-- Status -->
                    <td class="py-4 px-4">
                      @if (b.status === 'ONGOING') {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F9F0] text-[#15803D] border border-[#86EFAC] tracking-wider uppercase">
                          ONGOING
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-300 tracking-wider uppercase">
                          APPROVED
                        </span>
                      }
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 text-right">
                      <button
                        type="button"
                        class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                        style="color: #ffffff !important;"
                      >
                        <span class="text-sm font-bold leading-none">+</span>
                        <span>Select &amp; Map Aspirants</span>
                      </button>
                    </td>

                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-8 px-4 text-center text-slate-400 text-xs">
                      No Batches match your search criteria.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `
})
export class BatchListComponent {
  readonly batchService = inject(BatchService);
  readonly router = inject(Router);

  searchQuery = signal<string>('');

  readonly filteredBatches = computed(() => {
    let list = this.batchService.batches();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(
        b =>
          b.batchCode.toLowerCase().includes(query) ||
          (b.batchName && b.batchName.toLowerCase().includes(query)) ||
          b.courseName.toLowerCase().includes(query) ||
          b.sdcName.toLowerCase().includes(query) ||
          b.scheme.toLowerCase().includes(query)
      );
    }

    return list;
  });

  getMappedPercent(b: BatchRecord): number {
    if (!b.maxStrength) return 0;
    return Math.round((b.mappedAspirantsCount / b.maxStrength) * 100);
  }
}
