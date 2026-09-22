import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EoiStateService, ApplicantResponse } from '../../services/eoi-state.service';

@Component({
  selector: 'app-applicant-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 p-6 sm:p-8 font-sans">
      
      <!-- Top Breadcrumb -->
      <div class="mb-3">
        <a
          routerLink="/admin/eoi-view"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B3558] transition-colors cursor-pointer"
        >
          <span>&larr; Back to EOI View</span>
          <span class="text-slate-300">/</span>
          <span class="text-slate-700">Applicant Responses</span>
        </a>
      </div>

      <!-- Page Title + Count Badge (Matching Screenshot 2) -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-[#0B3558] tracking-tight">
            APPLICANT SUBMISSIONS
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Technical Evaluation Desk · Anonymous Bidder Responses for Scrutiny
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Total Count Badge -->
          <div class="bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
            Total Submissions: <span class="text-[#0B3558] font-black">{{ totalSubmissionsCount() }}</span>
          </div>
        </div>
      </div>

      <!-- Filter Buttons Bar -->
      <div class="flex flex-wrap items-center gap-2 mb-5">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
          Filter Status:
        </span>
        
        <button
          type="button"
          (click)="setFilter('ALL')"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border"
          [class.bg-[#0B3558]]="selectedFilter() === 'ALL'"
          [class.text-white]="selectedFilter() === 'ALL'"
          [class.border-[#0B3558]]="selectedFilter() === 'ALL'"
          [class.bg-white]="selectedFilter() !== 'ALL'"
          [class.text-slate-700]="selectedFilter() !== 'ALL'"
          [class.border-slate-300]="selectedFilter() !== 'ALL'"
          [class.hover:bg-slate-50]="selectedFilter() !== 'ALL'"
        >
          ALL ({{ totalSubmissionsCount() }})
        </button>

        <button
          type="button"
          (click)="setFilter('UNDER_SCRUTINY')"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5"
          [class.bg-amber-500]="selectedFilter() === 'UNDER_SCRUTINY'"
          [class.text-white]="selectedFilter() === 'UNDER_SCRUTINY'"
          [class.border-amber-600]="selectedFilter() === 'UNDER_SCRUTINY'"
          [class.bg-amber-50]="selectedFilter() !== 'UNDER_SCRUTINY'"
          [class.text-amber-800]="selectedFilter() !== 'UNDER_SCRUTINY'"
          [class.border-amber-200]="selectedFilter() !== 'UNDER_SCRUTINY'"
        >
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>UNDER SCRUTINY ({{ countPending() }})</span>
        </button>

        <button
          type="button"
          (click)="setFilter('APPROVED')"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5"
          [class.bg-[#16834B]]="selectedFilter() === 'APPROVED'"
          [class.text-white]="selectedFilter() === 'APPROVED'"
          [class.border-[#16834B]]="selectedFilter() === 'APPROVED'"
          [class.bg-emerald-50]="selectedFilter() !== 'APPROVED'"
          [class.text-emerald-800]="selectedFilter() !== 'APPROVED'"
          [class.border-emerald-200]="selectedFilter() !== 'APPROVED'"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>APPROVED ({{ countApproved() }})</span>
        </button>

        <button
          type="button"
          (click)="setFilter('REJECTED')"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5"
          [class.bg-[#C62828]]="selectedFilter() === 'REJECTED'"
          [class.text-white]="selectedFilter() === 'REJECTED'"
          [class.border-[#C62828]]="selectedFilter() === 'REJECTED'"
          [class.bg-red-50]="selectedFilter() !== 'REJECTED'"
          [class.text-red-800]="selectedFilter() !== 'REJECTED'"
          [class.border-red-200]="selectedFilter() !== 'REJECTED'"
        >
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          <span>REJECTED ({{ countRejected() }})</span>
        </button>
      </div>

      <!-- Main Submissions Table (Exact match to Screenshot 2) -->
      <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        
        <!-- Navy Banner Bar -->
        <div class="bg-[#0B3558] text-white px-5 py-3.5 flex items-center justify-between">
          <h2 class="text-sm font-bold tracking-wide">
            Incoming Expressions of Interest (EOI Working Desk)
          </h2>
          <span class="text-xs font-medium text-slate-200">
            Active Bidder Records
          </span>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 select-none">
                <th class="py-3.5 px-4 w-12 text-center">No.</th>
                <th class="py-3.5 px-4 min-w-[260px]">Applicant / Legal Firm Name</th>
                <th class="py-3.5 px-4 whitespace-nowrap">Submitted Date</th>
                <th class="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                <th class="py-3.5 px-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (item of filteredResponses(); track item.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <!-- No. -->
                  <td class="py-4 px-4 text-center font-bold text-slate-700">
                    {{ $index + 1 }}
                  </td>

                  <!-- Applicant Anonymous Identifier (Company 1, Company 2 per user spec) -->
                  <td class="py-4 px-4">
                    <p class="font-bold text-slate-900 text-sm">
                      {{ item.anonymousLabel }}
                    </p>
                    <p class="text-[11px] font-mono text-slate-500 mt-0.5">
                      {{ item.regNumber }}
                    </p>
                  </td>

                  <!-- Submitted Date -->
                  <td class="py-4 px-4 text-slate-600 whitespace-nowrap font-medium">
                    {{ item.submissionDate }}
                  </td>

                  <!-- Status Badge -->
                  <td class="py-4 px-4 text-center whitespace-nowrap">
                    @if (item.status === 'UNDER_SCRUTINY') {
                      <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Pending Review
                      </span>
                    } @else if (item.status === 'APPROVED') {
                      <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Accepted
                      </span>
                    } @else if (item.status === 'REJECTED') {
                      <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        Rejected
                      </span>
                    }
                  </td>

                  <!-- Action: Review -> Button -->
                  <td class="py-4 px-4 text-center whitespace-nowrap">
                    <a
                      [routerLink]="['/admin/review', item.id]"
                      class="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded bg-[#0B3558] hover:bg-[#07233B] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Review &rarr;</span>
                    </a>
                  </td>

                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-8 text-center text-slate-400 italic">
                    No submissions found matching the selected filter.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `
})
export class ApplicantSubmissionsComponent {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);

  responses = signal<ApplicantResponse[]>([]);
  selectedFilter = signal<'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED'>('ALL');
  schemeId = signal<string>('');

  constructor() {
    this.route.params.subscribe(params => {
      const sId = params['schemeId'] || 'ALL';
      this.schemeId.set(sId);
      this.loadResponses(sId);
    });
  }

  loadResponses(sId: string): void {
    this.eoiStateService.getResponses(sId).subscribe(data => {
      this.responses.set(data);
    });
  }

  setFilter(filter: 'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED'): void {
    this.selectedFilter.set(filter);
  }

  totalSubmissionsCount = computed(() => this.responses().length);

  countPending = computed(() => this.responses().filter(r => r.status === 'UNDER_SCRUTINY').length);
  countApproved = computed(() => this.responses().filter(r => r.status === 'APPROVED').length);
  countRejected = computed(() => this.responses().filter(r => r.status === 'REJECTED').length);

  filteredResponses = computed(() => {
    const filter = this.selectedFilter();
    const list = this.responses();
    if (filter === 'ALL') return list;
    return list.filter(r => r.status === filter);
  });
}
