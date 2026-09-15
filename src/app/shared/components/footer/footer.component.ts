import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-ink-900 text-surface-0 border-t border-ink-700 mt-16 font-sans text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-ink-700">
          
          <!-- Col 1: Government Authority -->
          <div class="space-y-2">
            <div class="font-serif text-sm font-bold tracking-wide">Integrated Scheme Management System (ISMS)</div>
            <p class="text-paper-50/70 text-xs leading-relaxed">
              An official digital e-Tendering, Expression of Interest (EOI), and Technical Partner (TP) empanelment portal of the Government of India.
            </p>
          </div>

          <!-- Col 2: Important Guidelines -->
          <div class="space-y-2">
            <div class="font-semibold text-paper-50 uppercase tracking-wider text-[11px]">Statutory Guidelines</div>
            <ul class="space-y-1.5 text-paper-50/70">
              <li><a href="javascript:void(0)" class="hover:text-surface-0 underline">General Financial Rules (GFR 2017)</a></li>
              <li><a href="javascript:void(0)" class="hover:text-surface-0 underline">EMD Deposit & Refund Policy</a></li>
              <li><a href="javascript:void(0)" class="hover:text-surface-0 underline">TP Grading & Accreditation Framework</a></li>
              <li><a href="javascript:void(0)" class="hover:text-surface-0 underline">Grievance Redressal Mechanism</a></li>
            </ul>
          </div>

          <!-- Col 3: Technical Helpdesk -->
          <div class="space-y-2">
            <div class="font-semibold text-paper-50 uppercase tracking-wider text-[11px]">Helpdesk & Support</div>
            <div class="text-paper-50/70 space-y-1">
              <p>Toll-Free Support: 1800-11-8899</p>
              <p>Email: helpdesk-isms&#64;gov.in</p>
              <p>Hours: Mon–Sat, 09:30 AM – 06:00 PM IST</p>
            </div>
          </div>

          <!-- Col 4: Trust & Compliance -->
          <div class="space-y-2">
            <div class="font-semibold text-paper-50 uppercase tracking-wider text-[11px]">Security & Standards</div>
            <div class="p-2.5 bg-ink-700/50 border border-ink-700 rounded text-[11px] text-paper-50/80 leading-snug">
              🔒 256-Bit SSL Encrypted. Compliant with GIGW (Guidelines for Indian Government Websites) and Certified by STQC.
            </div>
          </div>
        </div>

        <!-- Copyright & Disclaimers -->
        <div class="pt-6 flex flex-col sm:flex-row justify-between items-center text-paper-50/60 text-[11px] gap-3">
          <div>
            © 2026 Integrated Scheme Management System (ISMS). All rights reserved.
          </div>
          <div class="flex space-x-4">
            <a href="javascript:void(0)" class="hover:text-surface-0">Terms of Use</a>
            <span>•</span>
            <a href="javascript:void(0)" class="hover:text-surface-0">Privacy Policy</a>
            <span>•</span>
            <a href="javascript:void(0)" class="hover:text-surface-0">Hyperlinking Policy</a>
            <span>•</span>
            <a href="javascript:void(0)" class="hover:text-surface-0">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
