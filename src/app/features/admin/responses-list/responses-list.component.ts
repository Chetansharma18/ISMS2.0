import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { EoiStateService, ApplicantResponse, Scheme } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';

@Component({
  selector: 'app-responses-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, NgIf, HeaderComponent, SidebarComponent, UiTableComponent],
  template: `
    <div class="h-screen flex flex-col bg-[#F6F8FA] font-sans text-[#172B3A] antialiased overflow-hidden">
      <app-header class="shrink-0"></app-header>

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
              <span class="text-xs bg-white border border-slate-200 px-3 py-1.5 font-mono text-slate-700 shadow-2xs">
                Total Submissions: <strong class="text-[#0B3558] font-bold">{{ responses().length }}</strong>
              </span>
            </div>
          </div>

          <!-- Working Table Shell -->
          <div class="bg-white border border-slate-300 shadow-sm overflow-hidden">
            <!-- Window Title Bar (#0B3558) -->
            <div class="bg-[#0B3558] text-white px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-semibold tracking-wide">
                  Incoming Expressions of Interest (EOI Working Desk)
                </h2>
              </div>
            </div>

            <!-- Dense Working Table using UiTableComponent -->
            <app-ui-table 
              [columns]="tableColumns" 
              [data]="filteredResponses()" 
              emptyMessage="No submissions found."
              [showSearch]="false"
              [showPagination]="false">
              <ng-template #rowTemplate let-row let-column="column" let-i="index">
                <ng-container [ngSwitch]="column.key">
                  <!-- Index -->
                  <div *ngSwitchCase="'index'" class="font-mono text-slate-500 font-bold">
                    {{ i + 1 }}
                  </div>

                  <!-- Applicant & Firm Name -->
                  <div *ngSwitchCase="'applicant'" class="max-w-xs">
                    <div class="font-bold text-slate-900 text-xs">
                      {{ row.organizationName }}
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">
                      {{ row.registrationNumber }}
                    </div>
                  </div>

                  <!-- Submitted Date -->
                  <div *ngSwitchCase="'date'" class="font-mono text-slate-600 whitespace-nowrap">
                    {{ row.submissionDate }}
                  </div>

                  <!-- Status -->
                  <div *ngSwitchCase="'status'" class="font-bold">
                    <span *ngIf="row.scrutinyStatus === 'UNDER_SCRUTINY'" class="text-amber-600">Pending Review</span>
                    <span *ngIf="row.scrutinyStatus === 'APPROVED'" class="text-emerald-600">Accepted</span>
                    <span *ngIf="row.scrutinyStatus === 'REJECTED'" class="text-red-600">Rejected</span>
                  </div>

                  <!-- Action Button: Review -->
                  <div *ngSwitchCase="'action'">
                    <a 
                      [routerLink]="['/admin/review', row.applicationId]"
                      class="px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#082A46] text-white font-bold text-xs rounded transition-colors shadow-2xs inline-flex items-center gap-1">
                      <span>Review</span>
                      <span>→</span>
                    </a>
                  </div>
                  
                  <div *ngSwitchDefault class="text-slate-700 text-sm font-medium">
                    {{ row[column.key] }}
                  </div>
                </ng-container>
              </ng-template>
            </app-ui-table>

          </div>
        </main>
      </div>
    </div>
  `
})
export class ResponsesListComponent implements OnInit {
  private eoiService = inject(EoiStateService);
  private route = inject(ActivatedRoute);

  responses = signal<ApplicantResponse[]>([]);
  activeFilter = signal<'ALL' | 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED'>('ALL');

  tableColumns: TableColumn[] = [
    { key: 'index', label: 'No.', width: '60px' },
    { key: 'applicant', label: 'Applicant / Legal Firm Name' },
    { key: 'date', label: 'Submitted Date' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'action', label: 'Action', align: 'center' }
  ];

  filteredResponses = computed(() => {
    const filter = this.activeFilter();
    const all = this.responses();
    if (filter === 'ALL') {
      return all;
    }
    return all.filter(r => r.scrutinyStatus === filter);
  });

  ngOnInit(): void {
    this.eoiService.applicantResponses$.subscribe(data => {
      this.responses.set(data);
    });
  }
}

