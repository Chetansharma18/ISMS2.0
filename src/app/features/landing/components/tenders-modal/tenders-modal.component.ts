import { Component, EventEmitter, Output, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

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
    <div class="fixed top-[64px] sm:top-[76px] lg:top-[80px] inset-x-0 bottom-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      
      <!-- Backdrop with blur and click-to-close -->
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" (click)="close.emit()" aria-hidden="true"></div>

      <!-- Modal Container -->
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[calc(100vh-110px)] sm:max-h-[580px] overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
        
        <!-- Header -->
        <div class="bg-primary text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between shrink-0" style="background-color: var(--color-primary, #174A6E);">
          <div>
            <h3 class="text-sm sm:text-base font-bold leading-tight text-white m-0">Official Tenders & RFP Notices</h3>
            <p class="text-[11px] text-blue-100 mt-0.5 m-0">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</p>
          </div>
          
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="text-[11px] sm:text-xs font-medium text-slate-200 hidden xs:inline">Total Tenders: <span class="text-white font-bold">{{ tenders.length }}</span></span>
            <button
              type="button"
              (click)="close.emit()"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors cursor-pointer text-lg sm:text-xl leading-none text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Body / Scrollable List -->
        <div class="flex-1 overflow-y-auto modal-custom-scroll p-3.5 sm:p-5 space-y-3 bg-slate-50">
          
          @for (item of tenders; track item.id) {
            <div
              (click)="openLoginPrompt(item)"
              class="group relative bg-white border border-[#0B3558]/15 shadow-xs rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:shadow-md hover:border-[#0B3558]/35 transition-all cursor-pointer"
            >
              @if (item.isNew) {
                <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-8 sm:w-9 h-8 sm:h-9 object-cover z-10 pointer-events-none drop-shadow-xs rounded-tl-lg" />
              }

              <div class="flex-1 min-w-0 pl-1.5 sm:pl-0">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-none">{{ item.id }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[10px] font-semibold text-[#174A6E] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">{{ item.category }}</span>
                </div>
                
                <h4 class="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug group-hover:text-[#174A6E] transition-colors m-0 line-clamp-2">
                  {{ item.title }}
                </h4>
              </div>

              <!-- Action -->
              <div class="shrink-0">
                <button
                  type="button"
                  (click)="openLoginPrompt(item); $event.stopPropagation()"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#174A6E] hover:bg-[#123B59] active:bg-[#0E2F47] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs font-semibold transition-colors duration-150 cursor-pointer shadow-xs hover:shadow-sm"
                  aria-label="View Tender Details"
                >
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
                </button>
              </div>

            </div>
          }

        </div>
      </div>
    </div>

    <!-- Login Required Modal -->
    @if (showLoginModal()) {
      <div class="fixed top-[64px] sm:top-[76px] lg:top-[80px] inset-x-0 bottom-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div class="absolute inset-0" (click)="closeLoginPrompt()" aria-hidden="true"></div>

        <div class="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 sm:p-6 z-10 animate-in zoom-in-95 duration-150">
          <button
            type="button"
            (click)="closeLoginPrompt()"
            class="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>

          <div class="flex items-start gap-3.5 pt-1">
            <div class="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#174A6E]">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="flex-1 pr-4">
              <h4 class="text-sm font-bold text-slate-900 m-0">Authentication Required</h4>
              <p class="text-xs text-slate-600 mt-1.5 leading-relaxed m-0">
                Please login with your Rajasthan SSO credentials to view active scheme details and apply.
              </p>
            </div>
          </div>

          <div class="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="closeLoginPrompt()"
              class="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="proceedToLogin()"
              class="px-4 py-1.5 text-xs font-semibold text-white bg-[#174A6E] hover:bg-[#123B59] active:bg-[#0E2F47] rounded-md transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Login to Continue</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-custom-scroll {
      scrollbar-width: thin;
      scrollbar-color: #CBD5E1 #F8FAFC;
    }
    .modal-custom-scroll::-webkit-scrollbar {
      width: 5px;
    }
    .modal-custom-scroll::-webkit-scrollbar-track {
      background: #F8FAFC;
    }
    .modal-custom-scroll::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 4px;
    }
    .modal-custom-scroll::-webkit-scrollbar-thumb:hover {
      background: #94A3B8;
    }
  `]
})
export class TendersModalComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();

  readonly showLoginModal = signal(false);
  readonly selectedTender = signal<Tender | null>(null);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showLoginModal()) {
      this.closeLoginPrompt();
    } else {
      this.close.emit();
    }
  }

  openLoginPrompt(tender: Tender): void {
    if (this.authService.currentUser()) {
      this.close.emit();
      this.router.navigate(['/tenders']);
    } else {
      this.selectedTender.set(tender);
      this.showLoginModal.set(true);
    }
  }

  closeLoginPrompt(): void {
    this.showLoginModal.set(false);
    this.selectedTender.set(null);
  }

  proceedToLogin(): void {
    this.closeLoginPrompt();
    this.close.emit();
    this.authService.triggerSsoRedirect();
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
}
