import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EoiStateService, ApplicantResponse } from '../../services/eoi-state.service';

@Component({
  selector: 'app-applicant-submissions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Top Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 font-normal" aria-label="Breadcrumb">
          <a routerLink="/" class="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0B3558] transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </a>
          <span class="text-slate-400">/</span>
          <a routerLink="/admin/eoi-view" class="text-slate-600 hover:text-[#0B3558] transition-colors">EOI Responses</a>
          <span class="text-slate-400">/</span>
          <span class="text-slate-700 font-normal">Applicant Submissions</span>
        </nav>

        <!-- Page Title + Count Badge -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-[#0B3558] tracking-tight">
              Applicant Submissions
            </h1>
            <p class="text-xs text-slate-500 font-normal mt-0.5">
              Technical Evaluation Desk &bull; Anonymous Bidder Responses for Scrutiny
            </p>
          </div>

          <!-- Total Count Badge -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-normal shadow-2xs self-start sm:self-auto">
            <span>Total Submissions:</span>
            <span class="font-medium text-[#0B3558]">{{ totalSubmissionsCount() }}</span>
          </div>
        </div>

        <!-- Filter Buttons Bar (Pills matching user side) -->
        <div class="flex items-center gap-1.5 flex-wrap pt-1">
          <button
            type="button"
            (click)="setFilter('ALL')"
            class="px-2.5 py-1 rounded text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer border shadow-2xs"
            [class.bg-[#0B3558]]="selectedFilter() === 'ALL'"
            [class.text-white]="selectedFilter() === 'ALL'"
            [class.border-[#0B3558]]="selectedFilter() === 'ALL'"
            [class.bg-white]="selectedFilter() !== 'ALL'"
            [class.text-slate-600]="selectedFilter() !== 'ALL'"
            [class.border-slate-200]="selectedFilter() !== 'ALL'"
            [class.hover:bg-slate-50]="selectedFilter() !== 'ALL'"
          >
            <span>All</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'ALL'"
              [class.text-white]="selectedFilter() === 'ALL'"
              [class.bg-slate-100]="selectedFilter() !== 'ALL'"
              [class.text-slate-600]="selectedFilter() !== 'ALL'"
            >
              {{ totalSubmissionsCount() }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('UNDER_SCRUTINY')"
            class="px-2.5 py-1 rounded text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer border shadow-2xs"
            [class.bg-[#0B3558]]="selectedFilter() === 'UNDER_SCRUTINY'"
            [class.text-white]="selectedFilter() === 'UNDER_SCRUTINY'"
            [class.border-[#0B3558]]="selectedFilter() === 'UNDER_SCRUTINY'"
            [class.bg-white]="selectedFilter() !== 'UNDER_SCRUTINY'"
            [class.text-slate-600]="selectedFilter() !== 'UNDER_SCRUTINY'"
            [class.border-slate-200]="selectedFilter() !== 'UNDER_SCRUTINY'"
            [class.hover:bg-slate-50]="selectedFilter() !== 'UNDER_SCRUTINY'"
          >
            <span>Under Scrutiny</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'UNDER_SCRUTINY'"
              [class.text-white]="selectedFilter() === 'UNDER_SCRUTINY'"
              [class.bg-slate-100]="selectedFilter() !== 'UNDER_SCRUTINY'"
              [class.text-slate-600]="selectedFilter() !== 'UNDER_SCRUTINY'"
            >
              {{ countPending() }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('APPROVED')"
            class="px-2.5 py-1 rounded text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer border shadow-2xs"
            [class.bg-[#0B3558]]="selectedFilter() === 'APPROVED'"
            [class.text-white]="selectedFilter() === 'APPROVED'"
            [class.border-[#0B3558]]="selectedFilter() === 'APPROVED'"
            [class.bg-white]="selectedFilter() !== 'APPROVED'"
            [class.text-slate-600]="selectedFilter() !== 'APPROVED'"
            [class.border-slate-200]="selectedFilter() !== 'APPROVED'"
            [class.hover:bg-slate-50]="selectedFilter() !== 'APPROVED'"
          >
            <span>Accepted</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'APPROVED'"
              [class.text-white]="selectedFilter() === 'APPROVED'"
              [class.bg-slate-100]="selectedFilter() !== 'APPROVED'"
              [class.text-slate-600]="selectedFilter() !== 'APPROVED'"
            >
              {{ countApproved() }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('REJECTED')"
            class="px-2.5 py-1 rounded text-xs font-normal transition-colors flex items-center gap-1.5 cursor-pointer border shadow-2xs"
            [class.bg-[#0B3558]]="selectedFilter() === 'REJECTED'"
            [class.text-white]="selectedFilter() === 'REJECTED'"
            [class.border-[#0B3558]]="selectedFilter() === 'REJECTED'"
            [class.bg-white]="selectedFilter() !== 'REJECTED'"
            [class.text-slate-600]="selectedFilter() !== 'REJECTED'"
            [class.border-slate-200]="selectedFilter() !== 'REJECTED'"
            [class.hover:bg-slate-50]="selectedFilter() !== 'REJECTED'"
          >
            <span>Rejected</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class.bg-white/20]="selectedFilter() === 'REJECTED'"
              [class.text-white]="selectedFilter() === 'REJECTED'"
              [class.bg-slate-100]="selectedFilter() !== 'REJECTED'"
              [class.text-slate-600]="selectedFilter() !== 'REJECTED'"
            >
              {{ countRejected() }}
            </span>
          </button>
        </div>

        <!-- Main Submissions Table -->
        <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <!-- Soft Light Themed Table Header -->
              <thead>
                <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] sm:text-[11.5px] font-medium select-none border-b border-slate-200">
                  <th class="py-2.5 px-2.5 w-12 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                  <th class="py-2.5 px-3 border-r border-slate-200 min-w-[260px]">Applicant / Legal Firm Name</th>
                  <th class="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-center">Submitted Date</th>
                  <th class="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-center">Status</th>
                  <th class="py-2.5 px-2.5 text-center whitespace-nowrap w-24">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white font-normal text-slate-700">
                @for (item of filteredResponses(); track item.id; let idx = $index) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <!-- S. No. -->
                    <td class="py-2.5 px-2.5 text-center font-normal text-slate-700 border-r border-slate-100">
                      {{ idx + 1 }}
                    </td>

                    <!-- Applicant Identifier -->
                    <td class="py-2.5 px-3 border-r border-slate-100">
                      <div class="font-medium text-slate-800 text-xs">
                        {{ item.anonymousLabel }}
                      </div>
                      <div class="text-[11px] font-mono text-slate-500 mt-0.5">
                        {{ item.regNumber }}
                      </div>
                    </td>

                    <!-- Submitted Date -->
                    <td class="py-2.5 px-2.5 text-center font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      {{ item.submissionDate }}
                    </td>

                    <!-- Status -->
                    <td class="py-2.5 px-2.5 text-center whitespace-nowrap border-r border-slate-100">
                      @if (item.status === 'UNDER_SCRUTINY') {
                        <span class="text-amber-700 font-normal">
                          Pending Review
                        </span>
                      } @else if (item.status === 'APPROVED') {
                        <span class="text-emerald-700 font-normal">
                          Accepted
                        </span>
                      } @else if (item.status === 'REJECTED') {
                        <span class="text-rose-600 font-normal">
                          Rejected
                        </span>
                      }
                    </td>

                    <!-- Action: Review -> Button -->
                    <td class="py-2.5 px-2 text-center whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/review', item.id]"
                        class="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 transition-colors font-normal text-xs cursor-pointer shadow-2xs"
                      >
                        <span>Review &rarr;</span>
                      </a>
                    </td>

                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="py-8 text-center text-slate-500">
                      No submissions found matching the selected filter.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Table Footer -->
          <div class="px-4 py-2 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 select-none">
            <span class="text-[11px]">
              Showing 1 to {{ filteredResponses().length }} of {{ filteredResponses().length }} submissions
            </span>
            <span class="text-[11px] text-slate-400">
              EOI Working Desk
            </span>
          </div>

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
