import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-ticker',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <div class="bg-[#0B3558] text-white border-b border-[#07233B]/40 py-2 px-3 sm:px-6">
      <div class="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs">
        
        <!-- Left: Badge & Live Ticker Headline -->
        <div class="flex items-center gap-2.5 min-w-0 w-full sm:w-auto overflow-hidden">
          <span class="inline-flex items-center gap-1 bg-[#EA580C] text-white font-bold px-2.5 py-0.5 rounded text-[11px] tracking-wide shrink-0 uppercase shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            Updates
          </span>

          <div class="truncate text-slate-100 font-medium">
            <span class="text-orange-300 font-semibold mr-1.5">[Notice]</span>
            EOI Phase-IV for Skill Training Partners (2026-27) is now live &bull; Last date for application submission: 15th Oct 2026.
          </div>
        </div>

        <!-- Right: Quick Links / Helpline -->
        <div class="flex items-center gap-3 shrink-0 text-slate-300 text-[11px] self-end sm:self-auto">
          <a
            href="#schemes"
            class="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            EOI Guidelines (PDF)
          </a>
          <span class="text-slate-500" aria-hidden="true">&bull;</span>
          <span class="text-slate-200">
            Helpline: <strong class="text-white font-semibold">181</strong> (Toll Free)
          </span>
        </div>
      </div>
    </div>
  `
})
export class NewsTickerComponent {}
