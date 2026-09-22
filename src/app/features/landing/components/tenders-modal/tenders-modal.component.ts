import { Component, EventEmitter, Output } from '@angular/core';
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
        <div class="bg-[#0B3558] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-lg font-bold leading-tight">Official Tenders &amp; RFP Notices</h3>
            <p class="text-[11px] text-blue-200 mt-0.5">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</p>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-xs font-medium text-slate-300">Total Tenders: <span class="text-white font-bold">{{ tenders.length }}</span></span>
            <button (click)="close.emit()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body / Scrollable List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          
          @for (item of tenders; track item.id) {
            <div (click)="downloadPdf()" class="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
              
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 font-mono">{{ item.id }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.category }}</span>
                  
                  @if (item.isNew) {
                    <span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-[#EA580C] bg-orange-50 border border-orange-200">
                      NEW
                    </span>
                  }
                  <span class="ml-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {{ item.status }}
                  </span>
                </div>
                
                <h4 class="text-sm font-bold text-slate-800 leading-snug">
                  {{ item.title }}
                </h4>
              </div>

              <!-- Download Action -->
              <div class="shrink-0">
                <button (click)="downloadPdf(); $event.stopPropagation()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B3558] hover:bg-[#07233B] text-white px-5 py-2.5 rounded-md text-xs font-bold transition-colors cursor-pointer">
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
  `
})
export class TendersModalComponent {
  @Output() close = new EventEmitter<void>();

  tenders: Tender[] = [
    { date: '28 Sep, 2026', id: 'NIB 28 2026-27', category: 'Procurement', isNew: true, status: 'Open', title: 'Procurement of various sizes C.I. Detachable Joints for HDPE Pipe at Divisional Store of Distt Rural Div I Bikaner' },
    { date: '21 Sep, 2026', id: 'NIT 03/2026-27 ACE PWD Zone Tonk', category: 'Construction', isNew: true, status: 'Open', title: 'CONSTRUCTION OF ROAD FROM SH-122 TO KARIRI UPTO DISTRICT BOARDER' },
    { date: '11 Jun, 2026', id: 'RCVET/2026/01', category: 'Services', isNew: false, status: 'Open', title: 'Tender for Computer Operator for RCVET Jodhpur' },
    { date: '07 Feb, 2026', id: 'CORR/2026/09', category: 'Corrigendum', isNew: false, status: 'Open', title: 'Corrigendum - 9 (Old RO Number is 4424)' },
    { date: '07 Feb, 2026', id: 'CORR/2026/04', category: 'Corrigendum', isNew: false, status: 'Open', title: 'CORRIGENDUM-4' },
    { date: '07 Feb, 2026', id: 'CORR/2026/05', category: 'Corrigendum', isNew: false, status: 'Open', title: 'Corrigendum-5 API for PM-SETU' },
    { date: '07 Feb, 2026', id: 'CORR/2026/06', category: 'Corrigendum', isNew: false, status: 'Open', title: 'Corrigendum-6 API for PM-SETU' }
  ];

  downloadPdf() {
    const pdfContent = 'This is a sample PDF document for the selected tender.\n\nRSLDC Official Notice.';
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
