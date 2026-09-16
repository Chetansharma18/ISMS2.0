import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, ApplicantResponse, Scheme } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-responses-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
          <!-- Top Title & Navigation Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div>
              <div class="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                <a routerLink="/admin/eoi-view" class="text-[#131A4D] hover:underline">← Back to EOI View</a>
                <span>/</span>
                <span>Applicant Responses</span>
              </div>
              <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">
                Applicant Scrutiny Submissions
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Working evaluation desk for submitted tenders, technical partner eligibility & EMD verification.
              </p>
            </div>

            <!-- Total Submissions Count Badge -->
            <div class="flex items-center gap-3">
              <span class="text-xs bg-white border border-slate-200 px-3 py-1.5 font-mono text-slate-700 shadow-2xs">
                Total Submissions: <strong class="text-[#131A4D] font-bold">{{ responses.length }}</strong>
              </span>
            </div>
          </div>

          <!-- Working Table Shell -->
          <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
            
            <!-- Window Title Bar (#131A4D) -->
            <div class="bg-[#131A4D] text-white px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div class="flex items-center gap-2">
                <span class="text-base">📑</span>
                <h2 class="text-sm font-bold tracking-wide">
                  Incoming Expressions of Interest (EOI Working Desk)
                </h2>
              </div>

              <!-- Quick Status Filter Pills -->
              <div class="flex items-center gap-1.5 text-xs">
                <button 
                  (click)="activeFilter = 'ALL'"
                  [ngClass]="activeFilter === 'ALL' ? 'border-white text-white font-bold' : 'border-transparent text-blue-100'"
                  class="px-3 py-1 border rounded-md hover:bg-white/10 transition-colors">
                  All ({{ responses.length }})
                </button>
                <button 
                  (click)="activeFilter = 'UNDER_SCRUTINY'"
                  [ngClass]="activeFilter === 'UNDER_SCRUTINY' ? 'border-white text-white font-bold' : 'border-transparent text-blue-100'"
                  class="px-3 py-1 border rounded-md hover:bg-white/10 transition-colors">
                  Pending Review (1)
                </button>
                <button 
                  (click)="activeFilter = 'APPROVED'"
                  [ngClass]="activeFilter === 'APPROVED' ? 'border-white text-white font-bold' : 'border-transparent text-blue-100'"
                  class="px-3 py-1 border rounded-md hover:bg-white/10 transition-colors">
                  Approved (2)
                </button>
              </div>
            </div>

            <!-- Dense Working Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-[#131A4D] text-white font-bold border-b border-[#1a4f78] uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-[#1a4f78]">#</th>
                    <th class="p-3 border-r border-[#1a4f78]">Applicant / Legal Firm Name</th>
                    <th class="p-3 border-r border-[#1a4f78]">Applied Scheme</th>
                    <th class="p-3 border-r border-[#1a4f78]">Submitted Date</th>
                    <th class="p-3 border-r border-[#1a4f78]">EMD Fee Status</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">Current Grade</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">Scrutiny Status</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let item of filteredResponses; let idx = index" class="hover:bg-blue-50/40 transition-colors">
                    
                    <!-- Index -->
                    <td class="p-3 font-mono text-slate-500 font-bold border-r border-slate-200">
                      {{ idx + 1 }}
                    </td>

                    <!-- Applicant & Firm Name -->
                    <td class="p-3 border-r border-slate-200 max-w-xs">
                      <div class="font-bold text-slate-900 text-xs">
                        {{ item.organizationName }}
                      </div>
                      <div class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>Signatory: <strong>{{ item.applicantName }}</strong></span>
                        <span>•</span>
                        <span class="font-mono text-[10px]">{{ item.registrationNumber }}</span>
                      </div>
                    </td>

                    <!-- Applied Scheme -->
                    <td class="p-3 border-r border-slate-200 text-slate-700 max-w-xs">
                      <div class="font-semibold text-[#131A4D] line-clamp-1">
                        {{ item.schemeName }}
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        ID: {{ item.applicationId }}
                      </div>
                    </td>

                    <!-- Submitted Date -->
                    <td class="p-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">
                      {{ item.submissionDate }}
                    </td>

                    <!-- EMD Fee Status -->
                    <td class="p-3 border-r border-slate-200">
                      <div class="font-mono font-bold text-slate-800">
                        ₹{{ item.emdAmount | number:'1.0-0' }}
                      </div>
                      <span 
                        [ngClass]="item.emdStatus === 'PAID' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-slate-100 border-slate-300'"
                        class="inline-block px-1.5 py-0.2 border text-[9px] font-bold rounded-xs uppercase tracking-wider mt-0.5">
                        {{ item.emdStatus }}
                      </span>
                    </td>

                    <!-- Current Grade -->
                    <td class="p-3 border-r border-slate-200 text-center">
                      <span *ngIf="item.currentGrade" class="px-2 py-0.5 bg-blue-100 text-[#131A4D] border border-blue-300 text-xs font-bold rounded-xs font-mono">
                        Grade {{ item.currentGrade }}
                      </span>
                      <span *ngIf="!item.currentGrade" class="text-slate-400 text-[11px] italic">
                        Not Graded
                      </span>
                    </td>

                    <!-- Scrutiny Status Badge -->
                    <td class="p-3 border-r border-slate-200 text-center">
                      <span *ngIf="item.scrutinyStatus === 'UNDER_SCRUTINY'" class="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-xs inline-flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>Under Scrutiny</span>
                      </span>

                      <span *ngIf="item.scrutinyStatus === 'APPROVED'" class="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-xs inline-flex items-center gap-1">
                        <span>✓</span>
                        <span>Approved (TP)</span>
                      </span>

                      <span *ngIf="item.scrutinyStatus === 'REJECTED'" class="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 text-[11px] font-bold rounded-xs inline-flex items-center gap-1">
                        <span>✕</span>
                        <span>Rejected (Refunded)</span>
                      </span>
                    </td>

                    <!-- Action Button: Review -->
                    <td class="p-3 text-center">
                      <a 
                        [routerLink]="['/admin/review', item.applicationId]"
                        class="px-3.5 py-1.5 bg-[#131A4D] hover:bg-[#004d73] text-white font-bold text-xs rounded transition-colors shadow-2xs inline-flex items-center gap-1">
                        <span>Review</span>
                        <span>→</span>
                      </a>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Bottom Information Footer -->
            <div class="bg-slate-50 px-5 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span>RSLDC Directorate of Technical Scrutiny & Evaluation</span>
              <span class="font-mono">Secure Admin Desk</span>
            </div>

          </div>

        </main>
      </div>

    </div>
  `
})
export class ResponsesListComponent implements OnInit {
  responses: ApplicantResponse[] = [];
  activeFilter: 'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' = 'ALL';

  constructor(
    private eoiService: EoiStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.eoiService.applicantResponses$.subscribe(data => {
      this.responses = data;
    });
  }

  get filteredResponses(): ApplicantResponse[] {
    if (this.activeFilter === 'ALL') {
      return this.responses;
    }
    return this.responses.filter(r => r.scrutinyStatus === this.activeFilter);
  }
}
