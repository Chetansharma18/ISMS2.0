import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';

@Component({
  selector: 'app-department-eoi-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Breadcrumbs with Home Icon -->
        <nav class="flex items-center gap-2 text-xs text-slate-500 font-normal" aria-label="Breadcrumb">
          <a routerLink="/" class="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0B3558] transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </a>
          <span class="text-slate-400">/</span>
          <span class="text-slate-700 font-normal">EOI Responses</span>
        </nav>

        <!-- Top Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-[#0B3558] tracking-tight">
              EOI Responses
            </h1>
       
            
          </div>

          <!-- Role Badge -->
      
        </div>

        <!-- Main Schemes Table Container -->
        <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <!-- Soft Light Themed Table Header matching user side -->
              <thead>
                <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] sm:text-[11.5px] font-medium select-none border-b border-slate-200">
                  <th class="py-2.5 px-2.5 w-12 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                  <th class="py-2.5 px-3 border-r border-slate-200 min-w-[280px]">EOI Ref No. &amp; Scheme Name</th>
                  <th class="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-center">Category</th>
                  <th class="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-center">Date of Opening</th>
                  <th class="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-center">Date of Closing</th>
                  <th class="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-center">Status</th>
                  <th class="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-center">No. of Responses</th>
                  <th class="py-2.5 px-2.5 text-center whitespace-nowrap w-24">Action</th>
                </tr>
              </thead>

              <!-- Table Rows: Regular non-bold typography -->
              <tbody class="divide-y divide-slate-100 bg-white font-normal text-slate-700">
                @for (scheme of schemes(); track scheme.id; let idx = $index) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <!-- S. No. -->
                    <td class="py-2.5 px-2.5 text-center font-normal text-slate-700 border-r border-slate-100">
                      {{ idx + 1 }}
                    </td>

                    <!-- EOI Ref No. & Scheme Name -->
                    <td class="py-2.5 px-3 border-r border-slate-100">
                      <div class="font-medium text-slate-800 text-xs leading-snug">
                        {{ scheme.schemeTitle }}
                      </div>
                      <div class="text-[11px] font-mono text-slate-500 mt-0.5">
                        Ref: {{ scheme.refNo }}
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="py-2.5 px-2.5 text-center font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      {{ scheme.category }}
                    </td>

                    <!-- Date of Opening -->
                    <td class="py-2.5 px-2.5 text-center font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      {{ scheme.dateOfOpening }}
                    </td>

                    <!-- Date of Closing -->
                    <td class="py-2.5 px-2.5 text-center font-normal whitespace-nowrap border-r border-slate-100" [class.text-rose-600]="scheme.status === 'Open'">
                      {{ scheme.dateOfClosing }}
                    </td>

                    <!-- Status -->
                    <td class="py-2.5 px-2.5 text-center whitespace-nowrap border-r border-slate-100">
                      @if (scheme.status === 'Closed') {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-700 border border-slate-200">
                          Closed
                        </span>
                      } @else {
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-normal bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Open
                        </span>
                      }
                    </td>

                    <!-- No. of Responses -->
                    <td class="py-2.5 px-2.5 text-center font-normal text-slate-700 whitespace-nowrap border-r border-slate-100">
                      <span class="font-medium text-slate-800">{{ scheme.responseCount }}</span>
                      <span class="text-slate-500 text-[11px] ml-1">EOIs</span>
                    </td>

                    <!-- Action -->
                    <td class="py-2.5 px-2 text-center whitespace-nowrap">
                      @if (scheme.status === 'Closed') {
                        <a
                          [routerLink]="['/admin/responses', scheme.id]"
                          class="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 transition-colors font-normal text-xs cursor-pointer shadow-2xs"
                        >
                          <span>View List</span>
                        </a>
                      } @else {
                        <div class="relative group inline-block">
                          <button
                            type="button"
                            disabled
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 text-slate-400 border border-slate-200 text-xs font-normal cursor-not-allowed opacity-60"
                          >
                            <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>View List</span>
                          </button>
                          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-800 text-white text-[10.5px] rounded px-2 py-0.5 whitespace-nowrap z-30 shadow-md font-normal">
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

          <!-- Table Footer -->
          <div class="px-4 py-2 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 select-none">
            <span class="text-[11px]">
              Showing 1 to {{ schemes().length }} of {{ schemes().length }} published schemes
            </span>
            <span class="text-[11px] text-slate-400">
              Departmental Scrutiny Registry
            </span>
          </div>

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
