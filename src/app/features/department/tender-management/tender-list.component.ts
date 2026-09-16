import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tender-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Tender Management</h1>
          <p class="text-slate-500 mt-1">Manage tenders, process TP applications, and prepare Sanction Orders.</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Tender Ref</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Scheme / EOI</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">TP Applicants</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">TND-2026-001</div>
                  <div class="text-xs text-slate-500">IT & ITeS Sector</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">MMKAY 2026-27</div>
                  <div class="text-xs text-slate-500">EOI-2026-9871</div>
                </td>
                <td class="p-4">
                  <div class="flex gap-4">
                    <div class="text-center">
                      <div class="font-black text-[#131A4D]">42</div>
                      <div class="text-[10px] text-slate-500 uppercase">Applied</div>
                    </div>
                    <div class="text-center">
                      <div class="font-black text-green-600">18</div>
                      <div class="text-[10px] text-green-600 uppercase">Approved</div>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    Processing
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button routerLink="/department/sanction-orders/create" class="px-4 py-2 bg-[#131A4D] hover:bg-[#0a0e29] text-white text-xs font-bold rounded shadow-xs transition-colors">
                    Prepare Sanction Order
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
export class TenderListComponent {}
