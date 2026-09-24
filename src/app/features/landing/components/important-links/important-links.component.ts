import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-important-links',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="py-12 bg-white border-t border-slate-200">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B3558] mb-8 tracking-tight font-sans relative inline-block">
          Important Links
          <div class="w-16 h-1 bg-[#EA580C] mt-2 mx-auto"></div>
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          
          <!-- Link 1 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[120px] transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
            <div class="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
               <img src="/skill-india-logo.png" alt="Skill India" class="w-12 h-12 object-contain" onerror="this.style.display='none'">
            </div>
            <p class="text-[11px] font-semibold text-slate-700 leading-tight">Skill India</p>
          </div>

          <!-- Link 2 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[120px] transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
            <div class="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
               <img src="/rsldc-logo.png" alt="RSLDC" class="w-12 h-12 object-contain" onerror="this.style.display='none'">
            </div>
            <p class="text-[11px] font-semibold text-slate-700 leading-tight">RSLDC</p>
          </div>

          <!-- Link 3 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[120px] transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
            <div class="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
               <img src="/department-skill-logo.png" alt="Department of Skill" class="w-12 h-12 object-contain" onerror="this.style.display='none'">
            </div>
            <p class="text-[11px] font-semibold text-slate-700 leading-tight">Department of Skill</p>
          </div>

          <!-- Link 4 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[120px] transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
            <div class="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
               <img src="/ncvet-logo.png" alt="NCVET" class="w-12 h-12 object-contain" onerror="this.style.display='none'">
            </div>
            <p class="text-[11px] font-semibold text-slate-700 leading-tight">NCVET</p>
          </div>

          <!-- Link 5 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[120px] transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
            <div class="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
               <img src="/nsdc-logo.png" alt="NSDC" class="w-12 h-12 object-contain" onerror="this.style.display='none'">
            </div>
            <p class="text-[11px] font-semibold text-slate-700 leading-tight">NSDC</p>
          </div>

          <!-- Link 6 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center min-h-[120px] transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
            <div class="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
               <img src="/india-gov-logo.png" alt="India.gov.in" class="w-12 h-12 object-contain" onerror="this.style.display='none'">
            </div>
            <p class="text-[11px] font-semibold text-slate-700 leading-tight">India.gov.in</p>
          </div>
          
        </div>
      </div>
    </section>
  `
})
export class ImportantLinksComponent {}
