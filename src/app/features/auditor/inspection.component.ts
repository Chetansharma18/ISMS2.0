import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inspection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">SDC Inspection</h1>
        <div class="px-3 py-1 bg-amber-100 text-amber-800 rounded font-bold text-sm">INSPECTION IN PROGRESS</div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Target Location -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 class="font-bold text-rsldc-navy border-b pb-2">TP Submitted Location</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-slate-500 font-bold uppercase">Latitude</p>
              <p class="font-mono text-sm">26.912400</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 font-bold uppercase">Longitude</p>
              <p class="font-mono text-sm">75.787300</p>
            </div>
          </div>
          <div class="h-32 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-300 relative">
            <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 10px 10px;"></div>
            <span class="text-xs font-bold text-slate-400 relative z-10">Map View</span>
          </div>
        </div>

        <!-- Auditor Geo-Match -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 border-t-4 border-t-blue-500">
          <h3 class="font-bold text-rsldc-navy border-b pb-2">Inspection Geo-Match</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-slate-500 font-bold uppercase">Captured Lat</p>
              <p class="font-mono text-sm text-blue-600 font-bold">26.912450</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 font-bold uppercase">Captured Lng</p>
              <p class="font-mono text-sm text-blue-600 font-bold">75.787380</p>
            </div>
          </div>
          <div class="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
            <span class="text-sm font-bold text-blue-800">Distance: 12 meters</span>
            <span class="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-bold">WITHIN TOLERANCE</span>
          </div>
          <button class="w-full py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 transition">
            Recapture Location
          </button>
        </div>

      </div>

      <!-- Checklist -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 class="font-bold text-rsldc-navy border-b pb-2">Inspection Checklist</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
            <input type="checkbox" checked class="w-5 h-5 rounded text-blue-600">
            <span class="font-bold text-sm text-slate-700">Center exists at the physical address</span>
          </label>
          <label class="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
            <input type="checkbox" checked class="w-5 h-5 rounded text-blue-600">
            <span class="font-bold text-sm text-slate-700">Signboard is available and clearly visible</span>
          </label>
          <label class="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
            <input type="checkbox" class="w-5 h-5 rounded text-blue-600">
            <span class="font-bold text-sm text-slate-700">Infrastructure matches submitted documents</span>
          </label>
        </div>
      </div>

      <!-- Photos -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 class="font-bold text-rsldc-navy border-b pb-2">Inspection Photos</h3>
        <div class="border-2 border-dashed border-slate-300 rounded p-8 text-center hover:bg-slate-50 cursor-pointer">
          <p class="font-bold text-blue-600">+ Upload Geotagged Photos</p>
          <p class="text-xs text-slate-500">Building front, Classrooms, Labs</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <button class="px-6 py-2 bg-red-100 text-red-700 font-bold rounded shadow hover:bg-red-200 transition">
          Reject SDC
        </button>
        <button class="px-6 py-2 bg-amber-100 text-amber-700 font-bold rounded shadow hover:bg-amber-200 transition">
          Request Re-Inspection
        </button>
        <button class="px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 transition">
          Approve SDC
        </button>
      </div>

    </div>
  `
})
export class InspectionComponent {}
