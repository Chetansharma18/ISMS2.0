import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TendersModalComponent } from '../tenders-modal/tenders-modal.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule, TendersModalComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="relative w-full min-h-[500px] sm:min-h-[560px] flex items-stretch bg-slate-200 overflow-hidden">
      
      <!-- Full-bleed Background Image -->
      <img 
        src="/raj.png" 
        alt="Skill Development Building" 
        class="absolute inset-0 w-full h-full object-cover"
        onerror="this.src='https://images.unsplash.com/photo-1541888081622-1c25143a3721?q=80&w=2000&auto=format&fit=crop'"
      />
      
      <!-- Gradient Overlay (Full bleed) -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#0B3558] via-[#0B3558]/80 to-[#0B3558]/30 sm:to-transparent"></div>

      <div class="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        <!-- Hero Content (Left) -->
        <div class="w-full lg:w-[60%]">
            <h3 class="text-[#F6A820] font-bold text-sm sm:text-base tracking-wide mb-1">
              Skills <span class="text-white font-normal">for Today</span>
            </h3>
            <h4 class="text-white text-sm sm:text-base mb-4 font-medium tracking-wide">
              Opportunities for Tomorrow
            </h4>

            <h1 class="text-white text-4xl sm:text-5xl lg:text-[54px] font-black leading-[1.1] mb-5 tracking-tight drop-shadow-md font-sans">
              Integrated Scheme <br/> Management System
            </h1>

            <p class="text-slate-100 text-sm sm:text-base mb-8 max-w-md leading-relaxed drop-shadow">
              A unified platform to manage skill development schemes, 
              training operations, assessments, certification and 
              placements across Rajasthan.
            </p>

          </div>

          <!-- Floating Tenders Sidebar (Right) -->
          <div class="hidden lg:flex absolute top-2.5 right-2.5 lg:right-6 bottom-2.5 w-[420px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/50 flex-col overflow-hidden z-20">
            <!-- Header -->
            <div class="bg-[#0B3558] px-6 py-5 flex items-center justify-between z-10 shrink-0 shadow-sm">
              <div class="flex items-center gap-2 text-white font-bold tracking-wide">
                <span class="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                Tender
              </div>
              <button (click)="isTendersModalOpen.set(true)" class="bg-[#F6A820] hover:bg-[#d89218] text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full transition-colors cursor-pointer focus:outline-none">
                View All &gt;
              </button>
            </div>

            <!-- Tenders List (Infinite Vertical Scroll) -->
            <div class="flex-1 overflow-hidden relative" (mouseenter)="isHoveringTenders.set(true)" (mouseleave)="isHoveringTenders.set(false)">
              <div class="absolute w-full animate-marquee-vertical" [style.animation-play-state]="isHoveringTenders() ? 'paused' : 'running'">
                
                <!-- Loop 1 -->
                <div class="flex flex-col">
                  @for (item of tenders; track item.id) {
                    <div (click)="downloadSamplePdf()" class="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div class="flex justify-between items-center mb-1.5">
                        <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                        <div class="flex gap-1.5">
                          @if (item.isNew) {
                            <span class="text-[9px] font-bold text-[#EA580C]">NEW</span>
                          }
                          <span class="text-[9px] font-bold text-emerald-600">{{ item.status }}</span>
                        </div>
                      </div>
                      <h4 class="text-[13px] sm:text-sm font-bold text-slate-800 leading-snug mb-1 group-hover:text-[#0B3558] transition-colors">
                        {{ item.title }}
                      </h4>
                      <p class="text-[10px] text-slate-400 font-mono">{{ item.id }}</p>
                    </div>
                  }
                </div>
                
                <!-- Loop 2 (Duplicate for Seamless Scroll) -->
                <div class="flex flex-col" aria-hidden="true">
                  @for (item of tenders; track item.id) {
                    <div (click)="downloadSamplePdf()" class="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div class="flex justify-between items-center mb-1.5">
                        <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                        <div class="flex gap-1.5">
                          @if (item.isNew) {
                            <span class="text-[9px] font-bold text-[#EA580C]">NEW</span>
                          }
                          <span class="text-[9px] font-bold text-emerald-600">{{ item.status }}</span>
                        </div>
                      </div>
                      <h4 class="text-[13px] sm:text-sm font-bold text-slate-800 leading-snug mb-1 group-hover:text-[#0B3558] transition-colors">
                        {{ item.title }}
                      </h4>
                      <p class="text-[10px] text-slate-400 font-mono">{{ item.id }}</p>
                    </div>
                  }
                </div>

              </div>
            </div>
          </div>

        </div>
    </section>

    <!-- Modals -->
    @if (isTendersModalOpen()) {
      <app-tenders-modal (close)="isTendersModalOpen.set(false)"></app-tenders-modal>
    }
  `,
  styles: [`
    @keyframes marquee-vertical {
      0% { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }
    .animate-marquee-vertical {
      animation: marquee-vertical 25s linear infinite;
    }
  `]
})
export class HeroSectionComponent {
  isTendersModalOpen = signal(false);
  isHoveringTenders = signal(false);

  tenders = [
    {
      date: '10 Mar, 2026',
      id: 'RSLDC/ADMIN/CLEAN/2026-27/01',
      category: 'Services',
      isNew: true,
      status: 'Open',
      title: 'ई.एम.आई. भवन, हॉस्टल भवन व कौशल भवन परिसर में साफ-सफाई कार्य की संविदा हेतु निविदा-2026-27'
    },
    {
      date: '20 Jan, 2025',
      id: 'RSLDC/STORE/TONER/2025/11',
      category: 'Procurement',
      isNew: false,
      status: 'Open',
      title: 'Tender regarding Toner refilling and consumable parts'
    },
    {
      date: '20 Jan, 2025',
      id: 'RSLDC/EST/CLEAN/2025/08',
      category: 'Facility Management',
      isNew: false,
      status: 'Open',
      title: 'RFP for cleaning and maintenance in RSLDC'
    },
    {
      date: '23 Oct, 2024',
      id: 'RSLDC/PMCA/RFP/2024/04',
      category: 'Consultancy',
      isNew: false,
      status: 'Open',
      title: 'Request for proposal:-Selection of Project Management Consulting Agency for providing Project Management consulting support services to Rajasthan Skill and Livelihoods Development Corporation (RSLDC).'
    },
    {
      date: '22 Jul, 2024',
      id: 'RSLDC/PROC/AMEND/2024/22',
      category: 'Corrigendum',
      isNew: false,
      status: 'Open',
      title: 'Amendment in dates of tender submission'
    },
    {
      date: '15 May, 2024',
      id: 'RSLDC/SKILL/SCA-SCSP/2024/03',
      category: 'Empanelment',
      isNew: false,
      status: 'Open',
      title: 'Empanelment of Private Training Partners (PTPs) for execution of Special Central Assistance to Scheduled Castes Sub-Plan (SCA to SCSP) training programs'
    },
    {
      date: '12 Feb, 2024',
      id: 'RSLDC/IT/SMART-CLASS/2024/15',
      category: 'Equipment',
      isNew: false,
      status: 'Open',
      title: 'Tender for Supply and Installation of Smart Classroom Equipment in Government ITIs and Skill Centers across Rajasthan'
    }
  ];

  downloadSamplePdf() {
    // Generate a dummy PDF text and create a downloadable blob
    const pdfContent = 'This is a sample PDF document for the selected tender.\\n\\nRSLDC Official Notice.';
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Tender_Document_Sample.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
