import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      <!-- Welcome Header -->
      <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-rsldc-navy">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Welcome back, {{ $any(authService.currentUser())?.name }}!</h1>
          <p class="text-slate-500 mt-1">Here's your ISMS 2.0 system overview for today.</p>
        </div>
        <div class="flex gap-2">
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{{ $any(authService.currentUser())?.role?.replace('_', ' ') }}</span>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 hover:shadow-md transition">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Active Schemes</p>
              <h2 class="text-3xl font-black text-rsldc-navy mt-2">12</h2>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
          </div>
          <p class="text-xs text-emerald-600 font-bold mt-4 flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            +2 this month
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 hover:shadow-md transition">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Approved SDCs</p>
              <h2 class="text-3xl font-black text-rsldc-navy mt-2">485</h2>
            </div>
            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
          </div>
          <p class="text-xs text-emerald-600 font-bold mt-4 flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            98% active
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 hover:shadow-md transition">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Ongoing Batches</p>
              <h2 class="text-3xl font-black text-rsldc-navy mt-2">1,204</h2>
            </div>
            <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          <p class="text-xs text-slate-500 font-bold mt-4 flex items-center gap-1">
            Across all districts
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-2xs border border-slate-200 p-6 hover:shadow-md transition">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Aspirants</p>
              <h2 class="text-3xl font-black text-rsldc-navy mt-2">35.2K</h2>
            </div>
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>
          <p class="text-xs text-emerald-600 font-bold mt-4 flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            +1,200 this week
          </p>
        </div>
      </div>

      <!-- Action Required Section -->
      <div class="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-800">Pending Actions / Workflow Queue</h3>
          <button class="text-sm text-rsldc-blueAccent font-bold hover:underline">View All</button>
        </div>
        <div class="p-0">
          <ul class="divide-y divide-slate-100">
            
            <li class="p-4 sm:px-6 hover:bg-slate-50 transition flex items-center justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                <div>
                  <p class="text-sm font-bold text-rsldc-navy">SDC Inspection Pending (SDC-0002)</p>
                  <p class="text-xs text-slate-500 mt-1">Ajmer Training Inst. requires physical inspection report upload.</p>
                </div>
              </div>
              <button class="px-3 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-white transition whitespace-nowrap">Review</button>
            </li>

            <li class="p-4 sm:px-6 hover:bg-slate-50 transition flex items-center justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <p class="text-sm font-bold text-rsldc-navy">Batch Approval Request (B-26-0002)</p>
                  <p class="text-xs text-slate-500 mt-1">Web Developer batch strength and dates require department verification.</p>
                </div>
              </div>
              <button class="px-3 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-white transition whitespace-nowrap">Review</button>
            </li>

          </ul>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
}
