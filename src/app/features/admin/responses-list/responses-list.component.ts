import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { EoiStateService, ApplicantResponse, Scheme } from '../../../core/services/eoi-state.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-responses-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, NgClass, AsyncPipe, DecimalPipe, SidebarComponent],
  template: `
    <div class="h-screen flex flex-col bg-[#F6F8FA] font-sans text-[#172B3A] antialiased overflow-hidden">
      <div class="flex flex-1 min-h-0 w-full overflow-hidden">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block shrink-0 h-full"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-1 min-h-0 min-w-0 w-full p-6 overflow-y-auto overflow-x-hidden bg-[#F6F8FA]">
          
          <!-- Top Title & Navigation Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#D9E1E8] mb-6">
            <div>
              <div class="flex items-center gap-2 text-xs text-[#5F6F7E] mb-1">
                <a routerLink="/admin/eoi-view" class="text-[#0B3558] font-medium hover:underline">← Back to EOI View</a>
                <span>/</span>
                <span>Applicant Responses</span>
              </div>
              <h1 class="text-[28px] font-bold text-[#0B3558] tracking-tight leading-[36px]">
                APPLICANT SUBMISSIONS
              </h1>
            </div>

            <!-- Total Submissions Count Badge -->
            <div class="flex items-center gap-3">
              <span class="text-xs bg-white border border-[#D9E1E8] px-3 py-1.5 rounded-[6px] text-[#172B3A]">
                Total Submissions: <strong class="text-[#0B3558] font-bold">{{ responses.length }}</strong>
              </span>
            </div>
          </div>

          <!-- Working Table Shell -->
          <div class="bg-white border border-[#D9E1E8] rounded-[6px] shadow-none overflow-hidden">
            
            <!-- Window Title Bar -->
            <div class="bg-[#0B3558] text-white px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-semibold tracking-wide">
                  Incoming Expressions of Interest (EOI Working Desk)
                </h2>
              </div>
            </div>

            <!-- Working Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr class="bg-[#EEF3F7] text-[#173B59] font-semibold border-b border-[#D9E1E8] text-[13px]">
                    <th class="p-3 border-r border-[#D9E1E8]">No.</th>
                    <th class="p-3 border-r border-[#D9E1E8]">Applicant / Legal Firm Name</th>
                    <th class="p-3 border-r border-[#D9E1E8]">Submitted Date</th>
                    <th class="p-3 border-r border-[#D9E1E8] text-center">Status</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E8EDF2]">
                  <tr *ngFor="let item of filteredResponses; let idx = index" class="hover:bg-[#F7FAFC] transition-colors">
                    
                    <!-- Index -->
                    <td class="p-3 text-[#5F6F7E] font-semibold border-r border-[#D9E1E8]">
                      {{ idx + 1 }}
                    </td>

                    <!-- Applicant & Firm Name -->
                    <td class="p-3 border-r border-[#D9E1E8] max-w-xs">
                      <div class="font-semibold text-[#172B3A] text-[13px]">
                        {{ item.organizationName }}
                      </div>
                      <div class="text-[11px] text-[#5F6F7E] mt-0.5">
                        {{ item.registrationNumber }}
                      </div>
                    </td>

                    <!-- Submitted Date -->
                    <td class="p-3 border-r border-[#D9E1E8] text-[#172B3A] whitespace-nowrap">
                      {{ item.submissionDate }}
                    </td>

                    <!-- Status -->
                    <td class="p-3 border-r border-[#D9E1E8] text-center">
                      <span *ngIf="item.scrutinyStatus === 'UNDER_SCRUTINY'" class="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-semibold bg-[#FEF3C7] text-[#B7791F]">Pending Review</span>
                      <span *ngIf="item.scrutinyStatus === 'APPROVED'" class="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-semibold bg-[#E8F5E9] text-[#16834B]">Accepted</span>
                      <span *ngIf="item.scrutinyStatus === 'REJECTED'" class="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-semibold bg-[#FFEBEE] text-[#C62828]">Rejected</span>
                    </td>

                    <!-- Action Button: Review -->
                    <td class="p-3 text-center">
                      <a 
                        [routerLink]="['/admin/review', item.applicationId]"
                        class="px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#082A46] text-white font-semibold text-xs rounded-[6px] transition-colors inline-flex items-center gap-1">
                        <span>Review</span>
                        <span>→</span>
                      </a>
                    </td>

                  </tr>
                </tbody>
              </table>
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
  ) { }

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
