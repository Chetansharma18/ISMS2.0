import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Auditor Dashboard</h1>
      <p class="text-slate-500">Welcome to your inspection overview.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 class="text-sm font-bold text-slate-500 uppercase">Assigned SDCs</h3>
          <p class="text-3xl font-black text-rsldc-navy mt-2">14</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 class="text-sm font-bold text-slate-500 uppercase">Pending Inspections</h3>
          <p class="text-3xl font-black text-amber-600 mt-2">3</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 class="text-sm font-bold text-slate-500 uppercase">Completed</h3>
          <p class="text-3xl font-black text-green-600 mt-2">11</p>
        </div>
      </div>
    </div>
  `
})
export class AuditorDashboardComponent {}
