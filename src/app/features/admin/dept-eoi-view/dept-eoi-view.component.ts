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
    <div class="h-screen flex flex-col bg-[#F6F8FA] font-sans text-[#172B3A] antialiased overflow-hidden">
      <app-header class="shrink-0"></app-header>

      <div class="flex flex-1 min-h-0 w-full overflow-hidden">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block shrink-0 h-full"></app-sidebar>

        <!-- Main Department Content Area -->
        <main class="flex-1 min-h-0 min-w-0 w-full p-6 overflow-y-auto overflow-x-hidden bg-[#F6F8FA]">
          
          <!-- Top Breadcrumb & Department Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#D9E1E8] mb-6">
            <div>
              <h1 class="text-[28px] font-bold text-[#0B3558] tracking-tight leading-[36px]">
                EOI Responses
              </h1>
            </div>
          </div>

          <!-- Department Tenders Table Window Shell -->
          <div class="bg-white border border-[#D9E1E8] rounded-[6px] shadow-none overflow-hidden">
            
            <!-- Window Title Bar -->
            <div class="bg-[#0B3558] text-white px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-semibold tracking-wide">
                  Published Tenders & Live Submissions
                </h2>
              </div>
            </div>

            <!-- Working Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr class="bg-[#EEF3F7] text-[#173B59] font-semibold border-b border-[#D9E1E8] text-[13px]">
                    <th class="p-3 border-r border-[#D9E1E8]">No.</th>
                    <th class="p-3 border-r border-[#D9E1E8]">EOI Ref No. & Scheme Name</th>
                    <th class="p-3 border-r border-[#D9E1E8]">Category</th>
                    <th class="p-3 border-r border-[#D9E1E8]">Published</th>
                    <th class="p-3 border-r border-[#D9E1E8]">Deadline</th>
                    <th class="p-3 border-r border-[#D9E1E8] text-center">Status</th>
                    <th class="p-3 border-r border-[#D9E1E8] text-center">No. of Responses</th>
                    <th class="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E8EDF2]">
                  <tr *ngFor="let scheme of schemes$ | async; let i = index" class="hover:bg-[#F7FAFC] transition-colors">
                    
                    <!-- Index -->
                    <td class="p-3 font-semibold text-[#5F6F7E] border-r border-[#D9E1E8]">
                      {{ i + 1 }}
                    </td>

                    <!-- Scheme Name & Reference No -->
                    <td class="p-3 border-r border-[#D9E1E8] max-w-sm">
                      <div class="font-semibold text-[#172B3A] text-[13px]">
                        {{ scheme.name }}
                      </div>
                      <div class="text-[11px] text-[#5F6F7E] mt-0.5">
                        Ref: {{ scheme.eoiReferenceNo }}
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="p-3 border-r border-[#D9E1E8] text-[#172B3A] font-normal">
                      {{ scheme.schemeCategory }}
                    </td>

                    <!-- Published Date -->
                    <td class="p-3 border-r border-[#D9E1E8] text-[#172B3A]">
                      {{ scheme.publishDate }}
                    </td>

                    <!-- Submission Deadline -->
                    <td class="p-3 border-r border-[#D9E1E8] font-semibold"
                        [ngClass]="scheme.status === 'Closed' ? 'text-[#7A8793]' : 'text-[#C62828]'">
                      {{ scheme.submissionLastDate }}
                    </td>

                    <!-- Status Badge -->
                    <td class="p-3 border-r border-[#D9E1E8] text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-semibold"
                            [ngClass]="scheme.status === 'Open' ? 'bg-[#E8F5E9] text-[#16834B]' : 'bg-[#F1F5F9] text-[#5F6F7E]'">
                        {{ scheme.status }}
                      </span>
                    </td>

                    <!-- No. of Responses (Plain Text) -->
                    <td class="p-3 border-r border-[#D9E1E8] text-center">
                      <span class="font-bold text-[#0B3558] text-sm">
                        {{ scheme.responseCount || 4 }}
                      </span>
                      <span class="text-[11px] font-medium text-[#5F6F7E] ml-1">EOIs</span>
                    </td>

                    <!-- Action -->
                    <td class="p-3 text-center">
                      <a 
                        [routerLink]="['/admin/responses', scheme.id]" 
                        class="px-2.5 py-1 text-[13px] text-[#0B3558] font-semibold hover:underline cursor-pointer transition-colors inline-block">
                        View List
                      </a>
                      <span 
                        *ngIf="scheme.status !== 'Closed'"
                        class="px-2.5 py-1 text-[13px] text-[#7A8793] font-medium cursor-not-allowed inline-block select-none opacity-50"
                        title="Tender is currently Open. Submissions can only be viewed after tender is Closed.">
                        View List
                      </span>
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
export class DeptEoiViewComponent implements OnInit {
  schemes$!: Observable<Scheme[]>;
  userProfile$!: Observable<UserProfile>;

  constructor(private eoiService: EoiStateService) { }

  ngOnInit(): void {
    this.schemes$ = this.eoiService.schemes$;
    this.userProfile$ = this.eoiService.userProfile$;
  }
}
