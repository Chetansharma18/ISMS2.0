import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { EoiStateService, Scheme, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dept-eoi-view',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, AsyncPipe, DatePipe, DecimalPipe, NgClass, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow font-['Poppins']">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <!-- Main Department Content Area -->
        <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
          <!-- Top Breadcrumb & Department Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6" *ngIf="userProfile$ | async as profile">
            <div>
              <div class="text-[11px] text-cyan-800 uppercase tracking-wider font-semibold">
                Department Scrutiny Cell · {{ profile.department || 'RSLDC' }}
              </div>
              <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">
                EOI View (Department Tenders)
              </h1>
              <p class="text-xs text-slate-500 mt-0.5">
                Active schemes and tenders published by your department with incoming Expression of Interest (EOI) applicant response counts.
              </p>
            </div>

            <!-- Department Quick Stats Badge -->
            <div class="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 shadow-2xs">
              <div class="text-right">
                <div class="text-[10px] text-slate-400 uppercase">Total Responses</div>
                <div class="text-lg font-bold text-[#131A4D]">47 Submissions</div>
              </div>
            </div>
          </div>

          <!-- Department Tenders Table Window Shell -->
          <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
            
            <!-- Window Title Bar (#131A4D) -->
            <div class="bg-[#131A4D] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-bold tracking-wide">
                  Published Tenders & Live Submissions
                </h2>
              </div>

              <div class="text-xs text-blue-200">
                Showing {{ (schemes$ | async)?.length || 0 }} Tenders
              </div>
            </div>

            <!-- Dense Working Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-[#131A4D] text-white font-bold border-b border-[#1a4f78] uppercase tracking-wider text-[11px]">
                    <th class="p-3 border-r border-[#1a4f78]">#</th>
                    <th class="p-3 border-r border-[#1a4f78]">EOI Ref No. & Scheme Name</th>
                    <th class="p-3 border-r border-[#1a4f78]">Category</th>
                    <th class="p-3 border-r border-[#1a4f78]">Published</th>
                    <th class="p-3 border-r border-[#1a4f78]">Deadline</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">Status</th>
                    <th class="p-3 border-r border-[#1a4f78] text-center">No. of Responses</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr *ngFor="let scheme of schemes$ | async; let i = index" class="hover:bg-blue-50/40 transition-colors">
                    
                    <!-- Index -->
                    <td class="p-3 font-bold text-slate-500 border-r border-slate-200">
                      {{ i + 1 }}
                    </td>

                    <!-- Scheme Name & Reference No -->
                    <td class="p-3 border-r border-slate-200 max-w-sm">
                      <div class="font-bold text-slate-900 text-xs">
                        {{ scheme.name }}
                      </div>
                      <div class="text-[10px] text-slate-500 mt-0.5">
                        Ref: {{ scheme.eoiReferenceNo }}
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="p-3 border-r border-slate-200 text-slate-600 font-medium">
                      {{ scheme.schemeCategory }}
                    </td>

                    <!-- Published Date -->
                    <td class="p-3 border-r border-slate-200 text-slate-600">
                      {{ scheme.publishDate }}
                    </td>

                    <!-- Submission Deadline -->
                    <td class="p-3 border-r border-slate-200 font-bold"
                        [ngClass]="scheme.status === 'Closed' ? 'text-slate-400' : 'text-red-700'">
                      {{ scheme.submissionLastDate }}
                    </td>

                    <!-- Status Badge -->
                    <td class="p-3 border-r border-slate-200 text-center">
                      <span class="text-[11px] font-bold tracking-wide"
                            [ngClass]="scheme.status === 'Open' ? 'text-emerald-700' : 'text-blue-700'">
                        {{ scheme.status }}
                      </span>
                    </td>

                    <!-- No. of Responses (Plain Text) -->
                    <td class="p-3 border-r border-slate-200 text-center">
                      <span class="font-bold text-[#131A4D] text-sm">
                        {{ scheme.responseCount || 14 }}
                      </span>
                      <span class="text-[10px] font-semibold text-slate-600 ml-1">EOIs</span>
                    </td>

                    <!-- Action -->
                    <td class="p-3 text-center">
                      <a *ngIf="scheme.status === 'Closed'"
                        [routerLink]="['/admin/responses', scheme.id]" 
                        class="px-2.5 py-1 text-xs text-[#131A4D] font-bold hover:underline cursor-pointer transition-colors inline-block">
                        View List
                      </a>
                      <span *ngIf="scheme.status !== 'Closed'"
                        class="px-2.5 py-1 text-xs text-slate-400 font-bold cursor-not-allowed inline-block" title="List can only be viewed once status is Closed">
                        View List
                      </span>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Bottom Information Footer -->
            <div class="bg-slate-50 px-5 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span>Rajasthan Government e-Tendering & Scrutiny Portal</span>
              <span>RSLDC Scrutiny Node 2026-v2</span>
            </div>

          </div>

        </main>
      </div>

    </div>
  `
})
export class DeptEoiViewComponent implements OnInit {
  schemes$!: Observable<Scheme[]>;
  userProfile$!: Observable<UserProfile>;

  constructor(private eoiService: EoiStateService) {}

  ngOnInit(): void {
    this.schemes$ = this.eoiService.schemes$;
    this.userProfile$ = this.eoiService.userProfile$;
  }
}
