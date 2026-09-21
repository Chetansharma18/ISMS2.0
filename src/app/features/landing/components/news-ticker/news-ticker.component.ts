import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PressReleasesModalComponent } from '../press-releases-modal/press-releases-modal.component';

@Component({
  selector: 'app-news-ticker',
  standalone: true,
  imports: [CommonModule, PressReleasesModalComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <div class="bg-[#0B3558] text-white border-b border-[#07233B] py-2.5 px-4 md:px-6 shadow-inner relative z-40 overflow-hidden">
      <div class="max-w-[1440px] mx-auto flex items-center gap-4 text-xs md:text-[13px] relative h-6">
        
        <!-- Left: Static Badge (Fixed Position) -->
        <div class="flex items-center gap-3 shrink-0 z-20 bg-[#0B3558] pr-2 relative h-full">
          <!-- NEWS Badge -->
          <span class="inline-flex items-center gap-1.5 bg-[#EA580C] text-white font-bold px-3 py-1 rounded text-xs tracking-wide shadow-sm cursor-pointer hover:bg-orange-600 transition-colors" (click)="isModalOpen.set(true)">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            NEWS
          </span>

          <span class="text-slate-300 mx-1 hidden sm:inline" aria-hidden="true">|</span>
        </div>

        <!-- Ticker Text (Seamless Auto Scrolling Loop) -->
        <div class="flex-1 overflow-hidden relative h-full flex items-center cursor-pointer group" (click)="isModalOpen.set(true)">
          <div class="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
            
            <!-- Loop 1 -->
            <div class="flex items-center gap-6 pr-6">
              <div class="flex items-center gap-2 group/item">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[11px] whitespace-nowrap">17 Aug, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors">राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित</span>
              </div>
              <span class="text-slate-500">|</span>
              
              <div class="flex items-center gap-2 group/item">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[11px] whitespace-nowrap">15 Jul, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors">विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित</span>
              </div>
              <span class="text-slate-500">|</span>
              
              <div class="flex items-center gap-2 group/item">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[11px] whitespace-nowrap">23 Apr, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors">राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित</span>
              </div>
            </div>

            <!-- Loop 2 (Duplicate for seamless continuous scroll) -->
            <div class="flex items-center gap-6 pr-6" aria-hidden="true">
              <div class="flex items-center gap-2 group/item">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[11px] whitespace-nowrap">17 Aug, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors">राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित</span>
              </div>
              <span class="text-slate-500">|</span>
              
              <div class="flex items-center gap-2 group/item">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[11px] whitespace-nowrap">15 Jul, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors">विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित</span>
              </div>
              <span class="text-slate-500">|</span>
              
              <div class="flex items-center gap-2 group/item">
                <span class="inline-flex items-center bg-[#1E4E79] text-[#fcd34d] font-semibold px-2 py-0.5 rounded text-[11px] whitespace-nowrap">23 Apr, 2026</span>
                <span class="text-slate-200 font-medium group-hover/item:text-yellow-300 group-hover/item:underline transition-colors">राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Modal -->
    @if (isModalOpen()) {
      <app-press-releases-modal (close)="isModalOpen.set(false)"></app-press-releases-modal>
    }
  `,
  styles: [`
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      width: max-content;
      animation: marquee 30s linear infinite;
    }
  `]
})
export class NewsTickerComponent {
  isModalOpen = signal(false);
}
