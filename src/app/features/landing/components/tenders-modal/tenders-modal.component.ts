import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tender {
  date: string;
  id: string;
  category: string;
  isNew: boolean;
  status: string;
  title: string;
}

@Component({
  selector: 'app-tenders-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      
      <!-- Modal Container -->
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-full overflow-hidden border border-slate-200">
        
        <!-- Header -->
        <div class="bg-primary text-white px-6 py-4 flex items-center justify-between shrink-0" style="background-color: var(--color-primary, #174A6E);">
          <div>
            <h3 class="text-lg font-bold leading-tight text-white">Official Tenders & RFP Notices</h3>
            <p class="text-[11px] text-blue-100 mt-0.5">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</p>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-xs font-medium text-slate-200">Total Tenders: <span class="text-white font-bold">{{ tenders.length }}</span></span>
            <button (click)="close.emit()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body / Scrollable List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          
          @for (item of tenders; track item.id) {
            <div (click)="openTenderPreview(item)" class="group relative bg-white border border-[#0B3558]/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-[0_0_20px_rgba(11,53,88,0.15)] hover:border-[#0B3558]/40 transition-all cursor-pointer">
              
              @if (item.isNew) {
                <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-11 h-11 object-cover z-10 pointer-events-none drop-shadow-sm rounded-tl-lg" />
              }

              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 font-mono">{{ item.id }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.category }}</span>
                </div>
                
                <h4 class="text-sm font-bold text-slate-800 leading-snug group-hover:text-primary transition-all">
                  {{ item.title }}
                </h4>
              </div>

              <!-- Download Action -->
              <div class="shrink-0">
                <button (click)="downloadPdf(); $event.stopPropagation()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-md text-xs font-bold transition-colors" style="background-color: var(--color-primary, #174A6E);">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>

            </div>
          }

        </div>
      </div>
    </div>

    <!-- Tender Preview Sidebar (Drawer) -->
    @if (selectedPreviewTender()) {
      <div class="fixed inset-0 z-[60] flex justify-end">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300" 
          (click)="closeTenderPreview()">
        </div>

        <!-- Sidebar Panel -->
        <div class="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
          
          <!-- Header -->
          <div class="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start gap-4">
            <div>
              <h3 class="text-sm font-bold text-slate-800 leading-snug">{{ selectedPreviewTender().title }}</h3>
              <p class="text-xs text-slate-500 font-mono mt-1">{{ selectedPreviewTender().id }}</p>
            </div>
            <button (click)="closeTenderPreview()" class="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0">
              <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Preview Area -->
          <div class="flex-1 overflow-y-auto p-6 bg-slate-100/50 flex flex-col items-center justify-start">
            <p class="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">Document Preview (Page 1)</p>
            <div class="w-full aspect-[1/1.4] bg-white shadow-md border border-slate-200 rounded shrink-0 p-8 flex flex-col relative overflow-hidden">
              <div class="w-full h-12 border-b-2 border-blue-900/10 mb-6 flex items-center justify-between">
                <div class="w-16 h-4 bg-slate-200 rounded"></div>
                <div class="w-8 h-8 bg-blue-900/10 rounded-full"></div>
              </div>
              <div class="w-3/4 h-6 bg-slate-200 rounded mb-8"></div>
              <div class="space-y-3">
                <div class="w-full h-3 bg-slate-100 rounded"></div>
                <div class="w-full h-3 bg-slate-100 rounded"></div>
                <div class="w-5/6 h-3 bg-slate-100 rounded"></div>
                <div class="w-full h-3 bg-slate-100 rounded"></div>
                <div class="w-4/5 h-3 bg-slate-100 rounded"></div>
              </div>
              <div class="mt-auto pt-6 border-t border-slate-100 flex justify-between">
                <div class="w-20 h-4 bg-slate-200 rounded"></div>
                <div class="w-24 h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Footer Action -->
          <div class="p-4 sm:p-6 border-t border-slate-100 bg-white">
            <button (click)="downloadPdf()" class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg" style="background-color: var(--color-primary, #174A6E);">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Document
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class TendersModalComponent {
  @Output() close = new EventEmitter<void>();

  selectedPreviewTender = signal<any | null>(null);

  openTenderPreview(tender: any) {
    this.selectedPreviewTender.set(tender);
  }

  closeTenderPreview() {
    this.selectedPreviewTender.set(null);
  }

  tenders: Tender[] = [
    {
      date: '23/01/2026',
      id: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
      category: 'MMKVY',
      isNew: true,
      status: 'Open',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
    },
    {
      date: '17/02/2026',
      id: 'RSLDC/EOI/MNSKSY/2025-26/01',
      category: 'MNSKSY',
      isNew: true,
      status: 'Open',
      title: 'Expression of Interest (EOI) MNSKSY in RSLDC.'
    },
    {
      date: '26/09/2024',
      id: 'RSLDC/EOI/MMKVY Cat I II III/2024-25/01',
      category: 'MMKVY',
      isNew: false,
      status: 'Closed',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
    },
    {
      date: '26/09/2024',
      id: 'RSLDC/EOI/IMSHAKTI/2024-25/01',
      category: 'IM_Shakti',
      isNew: false,
      status: 'Closed',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under IM Shakti Scheme'
    },
    {
      date: '02/05/2023',
      id: 'RSLDC/EOI2023-24/Cat-III/RAJKVik RTD',
      category: 'RAJKVIKRTD',
      isNew: false,
      status: 'Closed',
      title: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK)' scheme of RSLDC"
    },
    {
      date: '05/07/2023',
      id: 'RSLDC/MMYKY2/EoI23-24/01',
      category: 'MMYKY',
      isNew: false,
      status: 'Closed',
      title: 'EoI for MMYKY 2.O for RSLDC'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1/MMKVYSAMARTH',
      category: 'SAMARTH',
      isNew: false,
      status: 'Closed',
      title: 'EoI for submission of proposal to undertake the project under MMKVY(Cat-III: SAMARTH) scheme of RSLDC'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1-RAJKVIK General',
      category: 'RAJKVIK',
      isNew: false,
      status: 'Closed',
      title: 'Eol for submission of proposal to undertake the project under RAJKVIK scheme of RSLDC.'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1/MMKVYSAKSHM',
      category: 'SAKSHM',
      isNew: false,
      status: 'Closed',
      title: 'Eol for submission of proposal to undertake the project under MMKVY(Cat-II: SAKSHM) scheme of RSLDC'
    },
    {
      date: '08/07/2022',
      id: 'RSLDC/EOI/2022-23/1MMKVYRTD',
      category: 'RAJKVIK',
      isNew: false,
      status: 'Closed',
      title: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan"
    }
  ];

  downloadPdf() {
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
