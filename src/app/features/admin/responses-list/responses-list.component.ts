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
        <main class="flex-grow px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
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

                <h2 class="text-sm font-bold tracking-wide">
                  Incoming Expressions of Interest (EOI Working Desk)
                </h2>
              </div>


            </div>

            <!-- Dense Working Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-[#131A4D] text-white font-bold border-b border-[#1a4f78] uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-[#1a4f78]">No.</th>
                    <th class="p-3 border-r border-[#1a4f78]">Applicant / Legal Firm Name</th>

                    <th class="p-3 border-r border-[#1a4f78]">Submitted Date</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">Status</th>
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
                      <div class="text-[10px] text-slate-500 mt-0.5">
                        {{ item.registrationNumber }}
                      </div>
                    </td>



                    <!-- Submitted Date -->
                    <td class="p-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">
                      {{ item.submissionDate }}
                    </td>

                    <!-- Status -->
                    <td class="p-3 border-r border-slate-200 text-center font-bold">
                      <span *ngIf="item.scrutinyStatus === 'UNDER_SCRUTINY'" class="text-amber-600">Pending Review</span>
                      <span *ngIf="item.scrutinyStatus === 'APPROVED'" class="text-emerald-600">Accepted</span>
                      <span *ngIf="item.scrutinyStatus === 'REJECTED'" class="text-red-600">Rejected</span>
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
