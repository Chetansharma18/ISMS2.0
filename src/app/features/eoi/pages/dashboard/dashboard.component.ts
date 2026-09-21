import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs p-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-[#0B3558] tracking-tight">
              ISMS 2.0 Portal Dashboard
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              Integrated Scheme Management System &bull; Government of Rajasthan
            </p>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            System Operational
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-5 rounded-lg border border-slate-200 bg-slate-50/50">
            <h2 class="text-sm font-semibold text-slate-600 uppercase tracking-wider">Active Schemes</h2>
            <p class="text-3xl font-extrabold text-[#0B3558] mt-2">--</p>
            <p class="text-xs text-slate-400 mt-1">Schemes open for application</p>
          </div>

          <div class="p-5 rounded-lg border border-slate-200 bg-slate-50/50">
            <h2 class="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Applications</h2>
            <p class="text-3xl font-extrabold text-[#0B3558] mt-2">--</p>
            <p class="text-xs text-slate-400 mt-1">Submitted submissions</p>
          </div>

          <div class="p-5 rounded-lg border border-slate-200 bg-slate-50/50">
            <h2 class="text-sm font-semibold text-slate-600 uppercase tracking-wider">Pending Approvals</h2>
            <p class="text-3xl font-extrabold text-[#EA580C] mt-2">--</p>
            <p class="text-xs text-slate-400 mt-1">Awaiting department verification</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
