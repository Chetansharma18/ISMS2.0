import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auditor-tp-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Assigned Training Providers</h1>
          <p class="text-slate-500 mt-1">View TPs assigned to you for SDC physical inspection.</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">TP Code & Name</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Tender / EOI</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Sanction Order</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">SDCs (Pending)</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">SkillMasters Rajasthan</div>
                  <div class="text-xs text-slate-500">TP042</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">TND-2026-001</div>
                  <div class="text-xs text-slate-500">EOI-2026-9871</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-emerald-600">SO-2026-4412</div>
                  <div class="text-[10px] text-slate-500 uppercase">Released</div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">4</span>
                    <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold" title="Pending Inspection">2</span>
                  </div>
                </td>
                <td class="p-4 text-right">
                  <button routerLink="/auditor/tps/TP042" class="px-4 py-2 bg-white border border-[#131A4D] text-[#131A4D] hover:bg-slate-50 text-xs font-bold rounded shadow-xs transition-colors">
                    View SDCs
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
export class AuditorTpListComponent {}
