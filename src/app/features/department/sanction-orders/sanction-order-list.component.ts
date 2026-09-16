import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sanction-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Sanction Orders</h1>
          <p class="text-slate-500 mt-1">Manage and release approved Sanction Orders to Training Providers.</p>
        </div>
        <button routerLink="/department/sanction-orders/create" class="px-4 py-2 bg-[#131A4D] text-white font-bold rounded shadow-xs hover:bg-[#0a0e29] transition-colors">
          + Create Sanction Order
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Order Ref</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Tender / EOI</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Training Provider</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              
              <!-- Draft Order -->
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">-</div>
                  <div class="text-xs text-slate-500">Draft</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">TND-2026-001</div>
                  <div class="text-xs text-slate-500">EOI-2026-9871</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-800">TechTrain India Pvt Ltd</div>
                  <div class="text-[10px] text-slate-500">TP001 • Approved</div>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    DRAFT
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button class="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded shadow-xs transition-colors">
                    Edit
                  </button>
                </td>
              </tr>

              <!-- Pending Release -->
              <tr class="hover:bg-slate-50 transition-colors bg-blue-50/30">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">SO-2026-4412</div>
                  <div class="text-xs text-slate-500">Target: 500 Aspirants</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">TND-2026-001</div>
                  <div class="text-xs text-slate-500">EOI-2026-9871</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-800">SkillMasters Rajasthan</div>
                  <div class="text-[10px] text-slate-500">TP042 • Approved</div>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    PENDING_RELEASE
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button (click)="releaseOrder()" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-xs transition-colors">
                    Release Order
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SanctionOrderListComponent {
  releaseOrder() {
    alert('Sanction Order Released! The TP can now create an SDC.');
  }
}
