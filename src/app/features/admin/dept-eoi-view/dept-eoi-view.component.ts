import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EoiStateService, Scheme, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';

@Component({
  selector: 'app-dept-eoi-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgClass, FormsModule, RouterLink, HeaderComponent, SidebarComponent, UiTableComponent],
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

            <!-- Dense Working Table using UiTableComponent -->
            <app-ui-table 
              [columns]="tableColumns" 
              [data]="schemes()" 
              emptyMessage="No schemes found."
              [showSearch]="false"
              [showPagination]="false">
              <ng-template #rowTemplate let-row let-column="column" let-i="index">
                <ng-container [ngSwitch]="column.key">
                  <!-- Index -->
                  <div *ngSwitchCase="'index'" class="font-bold text-slate-500">
                    {{ i + 1 }}
                  </div>

                  <!-- Scheme Name & Reference No -->
                  <div *ngSwitchCase="'scheme'" class="max-w-sm">
                    <div class="font-bold text-slate-900 text-xs">
                      {{ row.name }}
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">
                      Ref: {{ row.eoiReferenceNo }}
                    </div>
                  </div>

                  <!-- Category -->
                  <div *ngSwitchCase="'category'" class="text-slate-600 font-medium">
                    {{ row.schemeCategory }}
                  </div>

                  <!-- Published Date -->
                  <div *ngSwitchCase="'published'" class="text-slate-600">
                    {{ row.publishDate }}
                  </div>

                  <!-- Submission Deadline -->
                  <div *ngSwitchCase="'deadline'" class="font-bold" [ngClass]="row.status === 'Closed' ? 'text-slate-400' : 'text-red-700'">
                    {{ row.submissionLastDate }}
                  </div>

                  <!-- Status Badge -->
                  <div *ngSwitchCase="'status'">
                    <span class="text-[11px] font-bold tracking-wide" [ngClass]="row.status === 'Open' ? 'text-emerald-700' : 'text-blue-700'">
                      {{ row.status }}
                    </span>
                  </div>

                  <!-- No. of Responses -->
                  <div *ngSwitchCase="'responses'">
                    <span class="font-bold text-[#131A4D] text-sm">
                      {{ row.responseCount || 4 }}
                    </span>
                    <span class="text-[10px] font-semibold text-slate-600 ml-1">EOIs</span>
                  </div>

                  <!-- Action -->
                  <div *ngSwitchCase="'action'">
                    <a 
                      [routerLink]="['/admin/responses', row.id]" 
                      class="px-2.5 py-1 text-xs text-[#131A4D] font-bold hover:underline cursor-pointer transition-colors inline-block">
                      View List
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
export class DeptEoiViewComponent implements OnInit {
  private eoiService = inject(EoiStateService);

  schemes = signal<Scheme[]>([]);
  userProfile = signal<UserProfile | null>(null);

  tableColumns: TableColumn[] = [
    { key: 'index', label: 'No.', width: '60px' },
    { key: 'scheme', label: 'EOI Ref No. & Scheme Name' },
    { key: 'category', label: 'Category' },
    { key: 'published', label: 'Published' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'responses', label: 'No. of Responses', align: 'center' },
    { key: 'action', label: 'Action', align: 'center' }
  ];

  ngOnInit(): void {
    this.eoiService.schemes$.subscribe(data => this.schemes.set(data));
    this.eoiService.userProfile$.subscribe(data => this.userProfile.set(data));
  }
}
