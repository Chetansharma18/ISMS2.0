import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <footer class="w-full bg-[#07233B] text-slate-300 border-t-4 border-[#EA580C]">
      
      <!-- Top Strip: Associated Rajasthan Government Portals -->
      <div class="border-b border-slate-700/60 bg-[#051A2C] py-5 px-4 sm:px-6 lg:px-8">
        <div class="max-w-[1440px] mx-auto flex flex-wrap items-center justify-center md:justify-between gap-6">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center md:text-left">
            Integrated Government Portals & Initiatives:
          </span>

          <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <a
              href="https://jansoochna.rajasthan.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              class="opacity-75 hover:opacity-100 transition-opacity"
              title="Jan Soochna Portal"
            >
              <img
                src="/footer-images/jansoochna.png"
                alt="Jan Soochna Portal"
                class="h-7 w-auto object-contain brightness-0 invert"
                onerror="this.style.display='none'"
              />
            </a>

            <div class="w-px h-5 bg-slate-700 hidden sm:block"></div>

            <a
              href="https://acb.rajasthan.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              class="opacity-75 hover:opacity-100 transition-opacity"
              title="Anti Corruption Bureau"
            >
              <img
                src="/footer-images/acb.png"
                alt="ACB Rajasthan"
                class="h-7 w-auto object-contain brightness-0 invert"
                onerror="this.style.display='none'"
              />
            </a>

            <div class="w-px h-5 bg-slate-700 hidden sm:block"></div>

            <a
              href="https://www.services.bis.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              class="opacity-75 hover:opacity-100 transition-opacity"
              title="Bureau of Indian Standards"
            >
              <img
                src="/footer-images/bis.png"
                alt="Bureau of Indian Standards"
                class="h-7 w-auto object-contain brightness-0 invert"
                onerror="this.style.display='none'"
              />
            </a>

            <div class="w-px h-5 bg-slate-700 hidden sm:block"></div>

            <div class="text-xs font-semibold text-slate-300">
              Sampark 181
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer Columns -->
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          <!-- Col 1: Government Branding (4 cols) -->
          <div class="lg:col-span-4 space-y-4">
            <div class="flex items-center gap-3">
              <img
                src="/Rajasthan-Sarkar.png"
                alt="Government of Rajasthan"
                class="h-12 w-auto object-contain brightness-0 invert select-none"
                onerror="this.src='/emblem-new.png'"
              />
              <div class="border-l border-slate-700 pl-3">
                <p class="text-base font-extrabold text-white tracking-tight">ISMS 2.0</p>
                <p class="text-[11px] text-slate-400">Integrated Scheme Management System</p>
              </div>
            </div>

            <p class="text-xs text-slate-400 leading-relaxed pr-4">
              Rajasthan Skill and Livelihoods Development Corporation (RSLDC), Department of Skills, 
              Employment & Entrepreneurship, Government of Rajasthan.
            </p>

            <div class="pt-2 text-xs text-slate-400 space-y-1">
              <p><strong class="text-white">State Nodal Agency:</strong> RSLDC Head Office</p>
              <p>EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur - 302004</p>
            </div>
          </div>

          <!-- Col 2: Useful Links (3 cols) -->
          <div class="lg:col-span-3 space-y-3">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-2">
              Citizen & Partner Links
            </h4>
            <ul class="space-y-2 text-xs">
              <li>
                <a href="#schemes" class="hover:text-white transition-colors">Active Schemes & Courses</a>
              </li>
              <li>
                <a href="#services" class="hover:text-white transition-colors">EOI Empanelment Guidelines</a>
              </li>
              <li>
                <a href="#services" class="hover:text-white transition-colors">Center Inspection Checklist</a>
              </li>
              <li>
                <a href="#schemes" class="hover:text-white transition-colors">Tender Circulars & Corrigenda</a>
              </li>
              <li>
                <a href="https://sampark.rajasthan.gov.in" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
                  Grievance Redressal (Sampark 181)
                </a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Policy & Statutory (2 cols) -->
          <div class="lg:col-span-2 space-y-3">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-2">
              Statutory Info
            </h4>
            <ul class="space-y-2 text-xs">
              <li><a href="#" class="hover:text-white transition-colors">Right to Information (RTI)</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Citizen Charter</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Hyperlink Policy</a></li>
            </ul>
          </div>

          <!-- Col 4: Helpdesk & Support (3 cols) -->
          <div class="lg:col-span-3 space-y-3">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-2">
              Technical Helpdesk
            </h4>
            <div class="bg-[#051A2C] p-4 rounded-lg border border-slate-700/80 space-y-2 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Toll-Free Helpline:</span>
                <span class="text-sm font-bold text-[#EA580C]">181 / 0141-2715800</span>
              </div>
              <div class="pt-1 border-t border-slate-800">
                <span class="text-slate-400 block text-[11px]">Support Email:</span>
                <span class="text-slate-200 font-mono text-[11px]">isms-helpdesk&#64;rajasthan.gov.in</span>
              </div>
              <div class="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                Operating Hours: 09:30 AM to 06:00 PM (Monday - Friday)
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Copyright & Bottom Disclaimer -->
      <div class="border-t border-slate-700/70 bg-[#041424] py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div class="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>
            &copy; 2026 Rajasthan Skill and Livelihoods Development Corporation (RSLDC), Government of Rajasthan. All Rights Reserved.
          </p>
          <p class="text-slate-400">
            Designed for Unified Single-Window Scheme Administration (ISMS 2.0)
          </p>
        </div>
      </div>

    </footer>
  `
})
export class FooterComponent {}
