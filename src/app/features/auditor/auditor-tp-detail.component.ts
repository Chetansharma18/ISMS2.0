import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auditor-tp-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/auditor/tps" class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </a>
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">SkillMasters Rajasthan</h1>
          <p class="text-slate-500 mt-1">TP042 • Scheme: MMKAY 2026-27</p>
        </div>
      </div>

      <!-- SDC List -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mt-8">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 class="font-bold text-rsldc-navy">Assigned Skill Development Centers (SDCs)</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">SDC Code & Name</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">District</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Target Coordinates</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Inspection Status</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              
              <!-- Pending SDC -->
              <tr class="hover:bg-slate-50 transition-colors bg-amber-50/30">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">Ajmer Training Inst.</div>
                  <div class="text-xs text-slate-500">SDC-0002</div>
                </td>
                <td class="p-4 font-semibold text-slate-700">Ajmer</td>
                <td class="p-4">
                  <div class="text-xs text-slate-600 font-mono">26.4499, 74.6399</div>
                  <div class="text-[10px] text-blue-600 font-bold mt-0.5 cursor-pointer">View Map</div>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    PENDING INSPECTION
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button routerLink="/auditor/inspection/SDC-0002" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs transition-colors">
                    Start Inspection
                  </button>
                </td>
              </tr>

              <!-- Approved SDC -->
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">Jaipur Tech Hub</div>
                  <div class="text-xs text-slate-500">SDC-0001</div>
                </td>
                <td class="p-4 font-semibold text-slate-700">Jaipur</td>
                <td class="p-4">
                  <div class="text-xs text-slate-600 font-mono">26.9124, 75.7873</div>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    APPROVED
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button class="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded shadow-xs transition-colors">
                    View Report
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
export class AuditorTpDetailComponent {}
