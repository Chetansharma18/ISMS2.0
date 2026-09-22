import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';

@Component({
  selector: 'app-department-eoi-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 p-6 sm:p-8 font-sans">
      
      <!-- Top Page Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-[#0B3558] tracking-tight">
            EOI Responses
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Departmental Scrutiny Desk · Overview of Published Tenders and Incoming EOI Applications
          </p>
        </div>

        <!-- Role Badge -->
        <div class="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#0B3558] px-3 py-1.5 rounded-lg text-xs font-bold">
          <svg class="w-4 h-4 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Scrutiny Officer Desk</span>
        </div>
      </div>

      <!-- Main Container -->
      <div class="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        
        <!-- Table Banner Header (Matching Screenshot 1) -->
        <div class="bg-[#0B3558] text-white px-5 py-3.5 flex items-center justify-between">
          <h2 class="text-sm font-bold tracking-wide">
            Published Tenders &amp; Live Submissions
          </h2>
          <span class="text-xs font-semibold bg-white/15 px-2.5 py-0.5 rounded text-white/90">
            Total Schemes: {{ schemes().length }}
          </span>
        </div>

        <!-- Table Responsive Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 select-none">
                <th class="py-3 px-4 w-12 text-center">No.</th>
                <th class="py-3 px-4 min-w-[280px]">EOI Ref No. &amp; Scheme Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4 whitespace-nowrap">Date of opening</th>
                <th class="py-3 px-4 whitespace-nowrap">Date of closing</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-center whitespace-nowrap">No. of Responses</th>
                <th class="py-3 px-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              @for (scheme of schemes(); track scheme.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <!-- No. -->
                  <td class="py-4 px-4 text-center font-bold text-slate-700">
                    {{ $index + 1 }}
                  </td>

                  <!-- EOI Ref No. & Scheme Name -->
                  <td class="py-4 px-4">
                    <p class="font-bold text-slate-900 text-[13px] leading-snug">
                      {{ scheme.schemeTitle }}
                    </p>
                    <p class="text-[11px] font-mono text-slate-500 mt-0.5">
                      Ref: {{ scheme.refNo }}
                    </p>
                  </td>

                  <!-- Category -->
                  <td class="py-4 px-4 font-semibold text-slate-600">
                    {{ scheme.category }}
                  </td>

                  <!-- Date of opening (renamed from Published) -->
                  <td class="py-4 px-4 text-slate-600 whitespace-nowrap">
                    {{ scheme.dateOfOpening }}
                  </td>

                  <!-- Date of closing (renamed from Deadline) -->
                  <td class="py-4 px-4 whitespace-nowrap" [class.text-red-600]="scheme.status === 'Open'" [class.font-bold]="scheme.status === 'Open'">
                    {{ scheme.dateOfClosing }}
                  </td>

                  <!-- Status -->
                  <td class="py-4 px-4 text-center whitespace-nowrap">
                    @if (scheme.status === 'Closed') {
                      <span class="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        Closed
                      </span>
                    } @else {
                      <span class="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        Open
                      </span>
                    }
                  </td>

                  <!-- No. of Responses -->
                  <td class="py-4 px-4 text-center font-extrabold text-slate-800 whitespace-nowrap">
                    {{ scheme.responseCount }} <span class="font-medium text-slate-500 text-[11px]">EOIs</span>
                  </td>

                  <!-- Action -->
                  <td class="py-4 px-4 text-center whitespace-nowrap">
                    @if (scheme.status === 'Closed') {
                      <!-- Active router link to submissions list when Closed -->
                      <a
                        [routerLink]="['/admin/responses', scheme.id]"
                        class="inline-flex items-center justify-center font-bold text-[#0B3558] hover:text-[#EA580C] hover:underline cursor-pointer transition-colors text-xs"
                      >
                        <span>View List</span>
                      </a>
                    } @else {
                      <!-- Disabled button with tooltip when Open -->
                      <div class="relative group inline-block">
                        <button
                          type="button"
                          disabled
                          class="inline-flex items-center gap-1 font-semibold text-slate-400 cursor-not-allowed text-xs select-none opacity-60"
                        >
                          <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>View List</span>
                        </button>
                        <!-- Tooltip -->
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10.5px] rounded px-2 py-1 whitespace-nowrap z-30 shadow-md font-medium">
                          Submissions unlock upon Date of closing
                        </div>
                      </div>
                    }
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
export class DepartmentEoiViewComponent {
  private eoiStateService = inject(EoiStateService);
  schemes = signal<Scheme[]>([]);

  constructor() {
    this.eoiStateService.getSchemes().subscribe(data => {
      this.schemes.set(data);
    });
  }
}
