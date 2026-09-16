import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Batch Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage training batches, faculty, and candidate attendance.</p>
        </div>
        <a 
          *ngIf="authService.hasRole('TP_PIA')"
          routerLink="/batches/create"
          class="inline-flex items-center gap-2 bg-rsldc-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rsldc-navyLight transition shadow-md">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Batch
        </a>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap gap-4 items-end">
        <div class="flex-grow max-w-md">
          <label class="block text-xs font-bold text-slate-700 mb-1">Search</label>
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy" placeholder="Search by Batch Code, SDC Code...">
          </div>
        </div>
        <div class="w-48">
          <label class="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy bg-white">
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING">Pending Verification</option>
            <option value="APPROVED">Approved</option>
            <option value="ONGOING">Ongoing</option>
          </select>
        </div>
        <button class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition border border-slate-300">
          Filter
        </button>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th class="px-6 py-4">Batch Code</th>
                <th class="px-6 py-4">SDC</th>
                <th class="px-6 py-4">Course</th>
                <th class="px-6 py-4">Strength</th>
                <th class="px-6 py-4">Dates</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-mono font-semibold text-rsldc-navy">B-26-0001</td>
                <td class="px-6 py-4 text-slate-600">SDC-0001</td>
                <td class="px-6 py-4 font-semibold text-slate-800">Data Entry Operator</td>
                <td class="px-6 py-4 text-slate-600">30</td>
                <td class="px-6 py-4 text-slate-600 text-xs">
                  <div>Start: 01 Oct 2026</div>
                  <div>End: 31 Dec 2026</div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold border bg-approve-100 text-approve-700 border-approve-700/20">
                    APPROVED
                  </span>
                </td>
              </tr>
              <tr class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-mono font-semibold text-rsldc-navy">B-26-0002</td>
                <td class="px-6 py-4 text-slate-600">SDC-0001</td>
                <td class="px-6 py-4 font-semibold text-slate-800">Web Developer</td>
                <td class="px-6 py-4 text-slate-600">25</td>
                <td class="px-6 py-4 text-slate-600 text-xs">
                  <div>Start: 15 Oct 2026</div>
                  <div>End: 15 Jan 2027</div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold border bg-pending-100 text-pending-700 border-pending-700/20">
                    PENDING VERIFICATION
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class BatchListComponent {
  authService = inject(AuthService);
}
