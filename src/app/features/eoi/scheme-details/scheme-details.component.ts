import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgIf, DatePipe, CurrencyPipe } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SchemeService, Scheme } from '../../../core/services/scheme.service';

@Component({
  selector: 'app-scheme-details',
  standalone: true,
  imports: [RouterLink, NgIf, DatePipe, CurrencyPipe, CardComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <div class="flex items-center gap-3 text-textMuted mb-2">
        <a routerLink="/eoi/schemes" class="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Open Schemes
        </a>
      </div>

      <div class="bg-primaryLight/10 border border-primary/20 rounded-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary text-white mb-2">
            {{ scheme?.id }}
          </span>
          <h1 class="text-2xl sm:text-3xl font-bold text-text">{{ scheme?.title }}</h1>
          <p class="text-sm text-textMuted mt-1">Sector: {{ scheme?.sector }} | Nodal Agency: {{ scheme?.agency }}</p>
        </div>
        <div class="text-left md:text-right flex-shrink-0">
           <a [routerLink]="['/eoi/apply', scheme?.id]" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primaryDark transition-colors">
              Apply Now
           </a>
        </div>
      </div>

      <app-card>
         <h2 class="text-xl font-bold text-text mb-4 border-b border-border pb-2">Scheme Overview</h2>
         <p class="text-textMuted leading-relaxed">
            {{ scheme?.description }}
         </p>
      </app-card>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <app-card>
            <h2 class="text-lg font-bold text-text mb-4 border-b border-border pb-2">Key Dates</h2>
            <div class="space-y-4">
               <div>
                  <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Published Date</p>
                  <p class="text-sm font-medium text-text">August 1, 2026</p>
               </div>
               <div>
                  <p class="text-xs font-medium text-textMuted uppercase tracking-wider mb-1">Pre-bid Meeting</p>
                  <p class="text-sm font-medium text-text">August 20, 2026</p>
               </div>
               <div class="bg-red-50 p-3 rounded border border-red-100">
                  <p class="text-xs font-bold text-error uppercase tracking-wider mb-1">Submission Deadline</p>
                  <p class="text-sm font-bold text-error">{{ scheme?.deadline | date:'mediumDate' }}</p>
               </div>
            </div>
         </app-card>

         <app-card>
            <h2 class="text-lg font-bold text-text mb-4 border-b border-border pb-2">Financial Requirements</h2>
            <div class="space-y-4">
               <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span class="text-sm text-textMuted font-medium">Processing Fee (Non-Refundable)</span>
                  <span class="text-sm font-bold text-text">{{ scheme?.fee === 0 ? 'Exempted' : (scheme?.fee | currency:'INR') }}</span>
               </div>
               <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span class="text-sm text-textMuted font-medium">Earnest Money Deposit (EMD)</span>
                  <span class="text-sm font-bold text-text">{{ scheme?.emd === 0 ? 'N/A' : (scheme?.emd | currency:'INR') }}</span>
               </div>
               <div class="pt-1">
                  <p class="text-xs text-textMuted italic">* MSME registered entities are exempt from EMD.</p>
               </div>
            </div>
         </app-card>
      </div>

      <app-card>
         <h2 class="text-lg font-bold text-text mb-4 border-b border-border pb-2">Downloads</h2>
         <ul class="space-y-3">
            <li class="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
               <div class="p-2 bg-red-50 text-red-600 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               </div>
               <div class="flex-grow">
                  <p class="text-sm font-medium text-text">Official EOI Document & Guidelines</p>
                  <p class="text-xs text-textMuted">PDF • 2.5 MB</p>
               </div>
               <button class="text-primary hover:text-primaryDark text-sm font-medium">Download</button>
            </li>
            <li class="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
               <div class="p-2 bg-red-50 text-red-600 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               </div>
               <div class="flex-grow">
                  <p class="text-sm font-medium text-text">Corrigendum 1 - Extended Deadline</p>
                  <p class="text-xs text-textMuted">PDF • 450 KB</p>
               </div>
               <button class="text-primary hover:text-primaryDark text-sm font-medium">Download</button>
            </li>
         </ul>
      </app-card>

    </div>
  `
})
export class SchemeDetailsComponent implements OnInit {
  schemeId = '';
  scheme: Scheme | undefined;

  constructor(private route: ActivatedRoute, private schemeService: SchemeService) {}

  ngOnInit() {
    this.schemeId = this.route.snapshot.paramMap.get('id') || 'SCH-2026-101';
    this.scheme = this.schemeService.getSchemeById(this.schemeId);
  }
}
