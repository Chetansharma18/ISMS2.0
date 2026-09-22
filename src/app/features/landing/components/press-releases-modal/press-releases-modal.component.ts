import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PressRelease {
  date: string;
  type: string;
  typeColor: string;
  typeBg: string;
  text: string;
}

@Component({
  selector: 'app-press-releases-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      
      <!-- Modal Container -->
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-full overflow-hidden border border-slate-200">
        
        <!-- Header -->
        <div class="bg-[#0B3558] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-[#EA580C] flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold leading-tight">Press Releases &amp; Official Statements</h3>
              <p class="text-[11px] text-blue-200 mt-0.5">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</p>
            </div>
          </div>
          
          <button (click)="close.emit()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body / Scrollable List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          
          @for (item of releases; track item.date; let last = $last) {
            <div class="group">
              <div class="flex items-center gap-3 mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#07233B] text-white">
                  {{ item.date }}
                </span>
                <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border ' + item.typeColor + ' ' + item.typeBg">
                  {{ item.type }}
                </span>
              </div>
              <p class="text-sm text-slate-800 leading-relaxed font-medium">
                {{ item.text }}
              </p>
              @if (!last) {
                <div class="h-px bg-slate-200 w-full mt-6"></div>
              }
            </div>
          }

        </div>

        <!-- Footer -->
        <div class="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-500 font-medium">Source: RSLDC Public Relations &amp; Media</span>
          <button (click)="close.emit()" class="bg-[#0B3558] hover:bg-[#07233B] text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  `
})
export class PressReleasesModalComponent {
  @Output() close = new EventEmitter<void>();

  releases: PressRelease[] = [
    {
      date: '17 Aug, 2026',
      type: 'Meeting',
      typeColor: 'text-[#EA580C] border-[#EA580C]/30',
      typeBg: 'bg-orange-50',
      text: 'राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित - युवाओं को उद्योग की मांग के अनुरूप आधुनिक प्रशिक्षण देने एवं कौशल विकास योजनाओं में तेजी लाने पर विस्तृत चर्चा'
    },
    {
      date: '15 Jul, 2026',
      type: 'Event',
      typeColor: 'text-[#EA580C] border-[#EA580C]/30',
      typeBg: 'bg-orange-50',
      text: 'विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित, कौशल विकास के क्षेत्र में उत्कृष्ट प्रतिभाओं का हुआ सम्मान'
    },
    {
      date: '05 Jun, 2026',
      type: 'Statement',
      typeColor: 'text-[#EA580C] border-[#EA580C]/30',
      typeBg: 'bg-orange-50',
      text: 'बोर्ड का उद्देश्य कौशल विकास के माध्यम से युवाओं को आत्मनिर्भर बनाना तथा उनके लिए बेहतर रोजगार के अवसर सुनिश्चित करना है - अध्यक्ष, श्री विश्वकर्मा कौशल विकास बोर्ड'
    },
    {
      date: '23 Apr, 2026',
      type: 'Skill Initiative',
      typeColor: 'text-[#EA580C] border-[#EA580C]/30',
      typeBg: 'bg-orange-50',
      text: 'राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित'
    },
    {
      date: '07 Apr, 2026',
      type: 'Rozgar Mela',
      typeColor: 'text-[#EA580C] border-[#EA580C]/30',
      typeBg: 'bg-orange-50',
      text: 'युवा संबल मेला 2026 का किया आयोजन - 42 आशार्थियों को मेला स्थल पर ही ऑफर लेटर वितरित'
    }
  ];
}
