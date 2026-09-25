import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MOCK_SANCTION_ORDERS, SanctionOrder } from '../models/sdc.model';

@Component({
  selector: 'app-sanction-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans p-6 sm:p-8" style="font-family: 'Inter', sans-serif;">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Page Title & Subtitle -->
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sanction Orders
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            View your approved sanction orders and create Skill Development Centers (SDC).
          </p>
        </div>

        <!-- Sanction Orders Table -->
        <div class="border border-[#D9E1E7] rounded-lg overflow-hidden bg-white shadow-2xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-[13px] min-w-[900px]">
              <thead>
                <tr class="border-b border-[#D9E1E7] bg-white text-[#5F6B76] text-[11px] font-bold tracking-wider uppercase select-none">
                  <th class="py-3.5 px-4">TP CODE</th>
                  <th class="py-3.5 px-4">SCHEME</th>
                  <th class="py-3.5 px-4">MOU START DATE</th>
                  <th class="py-3.5 px-4">MOU EXPIRY</th>
                  <th class="py-3.5 px-4 text-center">Total no. of SDC</th>
                  <th class="py-3.5 px-4 text-center whitespace-nowrap">NO. OF APPROVAL SDC'S</th>
                  <th class="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#D9E1E7]/70 text-[13px] text-slate-800">
                @for (so of orders; track so.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-4 px-4 font-mono font-medium text-slate-700">
                      {{ so.tpCode }}
                    </td>
                    <td class="py-4 px-4 font-bold text-slate-900">
                      {{ so.scheme }}
                    </td>
                    <td class="py-4 px-4 text-slate-600">
                      {{ so.mouStartDate }}
                    </td>
                    <td class="py-4 px-4 text-slate-600">
                      {{ so.mouExpiryDate }}
                    </td>
                    <td class="py-4 px-4 text-center font-medium text-slate-800">
                      {{ so.totalSdc }}
                    </td>
                    <td class="py-4 px-4 text-center font-medium text-slate-800">
                      {{ so.approvedSdc ?? 1 }}
                    </td>
                    <td class="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        (click)="createSdc(so.scheme)"
                        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#123B59] active:bg-[#07233B] text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer select-none"
                        style="color: #ffffff !important;"
                      >
                        <span class="text-sm font-bold leading-none">+</span>
                        <span>Add SDC</span>
                      </button>
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
export class SanctionOrdersComponent {
  private router = inject(Router);

  readonly orders: SanctionOrder[] = MOCK_SANCTION_ORDERS;

  createSdc(scheme: string): void {
    this.router.navigate(['/sdc/create'], { queryParams: { scheme } });
  }
}
