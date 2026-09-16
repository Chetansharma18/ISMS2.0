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
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased">
      <app-header></app-header>

      <div class="flex flex-grow font-['Poppins']">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block"></app-sidebar>

        <!-- Main Department Content Area -->
        <main class="flex-grow px-4 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">
          
          <!-- Top Breadcrumb & Department Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 mb-6">
            <div>
              <h1 class="text-2xl font-bold text-[#131A4D] tracking-tight">
                EOI RESPONSES
              </h1>
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
