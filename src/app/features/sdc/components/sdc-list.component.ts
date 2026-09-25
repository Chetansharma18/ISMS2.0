import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SdcService } from '../services/sdc.service';
import { SdcRecord } from '../models/sdc.model';

@Component({
  selector: 'app-sdc-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans p-6 sm:p-8" style="font-family: 'Inter', sans-serif;">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Page Header & Action (Matching Screenshot 1) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Skill Development Centers (SDC)
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
              Rajasthan Skill &amp; Livelihoods Development Corporation &bull; Approved Center Directory
            </p>
          </div>

          <!-- Register New SDC Button -->
          <button
            type="button"
            (click)="router.navigate(['/sdc/create'])"
            class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0 self-start sm:self-auto select-none"
            style="color: #ffffff !important;"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Register New SDC</span>
          </button>
        </div>

        <!-- Search Centers Bar -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">Search Centers</label>
          <div class="relative w-full max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search by SDC Code, Center Name, TP..."
              class="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all shadow-2xs"
            />
          </div>
        </div>

        <!-- SDC Centers Table -->
        <div class="border border-[#D9E1E7] rounded-lg overflow-hidden bg-white shadow-2xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr class="border-b border-[#D9E1E7] bg-white text-[#5F6B76] text-[11px] font-bold tracking-wider uppercase select-none">
                  <th class="py-3.5 px-4">SDC CODE</th>
                  <th class="py-3.5 px-4">CENTER NAME</th>
                  <th class="py-3.5 px-4">TP / PIA</th>
                  <th class="py-3.5 px-4">SCHEME</th>
                  <th class="py-3.5 px-4">STATUS</th>
                  <th class="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#D9E1E7]/70 text-[13px] text-slate-800">
                @for (sdc of filteredSdcs(); track sdc.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    
                    <!-- SDC Code -->
                    <td class="py-4 px-4 font-mono font-medium text-slate-700">
                      {{ sdc.sdcCode }}
                    </td>

                    <!-- Center Name & District -->
                    <td class="py-4 px-4">
                      <div class="font-bold text-slate-900 leading-snug">
                        {{ sdc.sdcName }}
                      </div>
                      <div class="text-xs text-slate-500 mt-0.5">
                        {{ sdc.district }}
                      </div>
                    </td>

                    <!-- TP / PIA -->
                    <td class="py-4 px-4 font-medium text-slate-700 text-xs">
                      {{ sdc.tpName }}
                    </td>

                    <!-- Scheme -->
                    <td class="py-4 px-4">
                      <span class="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {{ sdc.scheme }}
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="py-4 px-4">
                      @if (sdc.status === 'APPROVED') {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E6F9F0] text-[#15803D] border border-[#86EFAC] tracking-wider uppercase">
                          APPROVED
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] tracking-wider uppercase">
                          PENDING INSPECTION
                        </span>
                      }
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 text-right">
                      <div class="inline-flex items-center gap-2 justify-end">
                        @if (sdc.status === 'APPROVED') {
                          <button
                            type="button"
                            (click)="createBatch(sdc)"
                            class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                            style="color: #ffffff !important;"
                          >
                            <span class="text-sm font-bold leading-none">+</span>
                            <span>Create Batch</span>
                          </button>
                        }

                        <button
                          type="button"
                          (click)="viewDetails(sdc)"
                          class="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </td>

                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-8 px-4 text-center text-slate-400 text-xs">
                      No Skill Development Centers match your search criteria.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SdcListComponent {
  readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  searchQuery = signal<string>('');

  readonly filteredSdcs = computed(() => {
    let list = this.sdcService.sdcs();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(
        s =>
          s.sdcName.toLowerCase().includes(query) ||
          s.sdcCode.toLowerCase().includes(query) ||
          s.district.toLowerCase().includes(query) ||
          s.scheme.toLowerCase().includes(query) ||
          s.tpName.toLowerCase().includes(query)
      );
    }

    return list;
  });

  createBatch(sdc: SdcRecord): void {
    this.router.navigate(['/batches/create'], {
      queryParams: {
        sdcId: sdc.id,
        sdcCode: sdc.sdcCode,
        sdcName: sdc.sdcName,
        scheme: sdc.scheme
      }
    });
  }

  viewDetails(sdc: SdcRecord): void {
    this.router.navigate(['/sdc', sdc.id]);
  }
}

