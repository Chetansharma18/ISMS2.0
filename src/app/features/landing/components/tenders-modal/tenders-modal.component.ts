import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <!-- Modal Container -->
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        <!-- Header -->
        <div class="bg-primary text-white px-6 py-4 flex items-center justify-between shrink-0" style="background-color: var(--color-primary, #174A6E);">
          <div>
            <h3 class="text-lg font-bold leading-tight text-white">Official Tenders & RFP Notices</h3>
            <p class="text-[11px] text-blue-100 mt-0.5">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</p>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-xs font-medium text-slate-200">Total Tenders: <span class="text-white font-bold">{{ tenders.length }}</span></span>
            <button (click)="close.emit()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body / Scrollable List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          
          @for (item of tenders; track item.id) {
            <div (click)="openLoginPrompt(item)" class="group relative bg-white border border-[#0B3558]/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-[0_0_20px_rgba(11,53,88,0.15)] hover:border-[#0B3558]/40 transition-all cursor-pointer">
              
              @if (item.isNew) {
                <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-11 h-11 object-cover z-10 pointer-events-none drop-shadow-sm rounded-tl-lg" />
              }

              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 font-mono">{{ item.id }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[10px] font-semibold text-[#174A6E] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">{{ item.category }}</span>
                </div>
                
                <h4 class="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#174A6E] transition-all">
                  {{ item.title }}
                </h4>
              </div>

              <!-- Action -->
              <div class="shrink-0">
                <button (click)="openLoginPrompt(item); $event.stopPropagation()" class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#174A6E] hover:bg-[#123B59] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Login to View</span>
                </button>
              </div>

            </div>
          }

        </div>
      </div>
    </div>

    <!-- Login Required Modal -->
    @if (showLoginModal()) {
      <div class="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div class="absolute inset-0" (click)="closeLoginPrompt()"></div>

        <div class="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
          
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div class="flex-1">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Login Required
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Please log in with your Rajasthan Single Sign-On (SSO) account to access tender notices, scheme information, and application forms.
              </p>
            </div>
          </div>

          @if (selectedTender()) {
            <div class="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-left">
              <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#174A6E]/10 text-[#174A6E] mb-1">
                {{ selectedTender()?.category }}
              </span>
              <p class="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                {{ selectedTender()?.title }}
              </p>
              <p class="text-[10px] text-slate-400 font-mono mt-1">
                {{ selectedTender()?.id }}
              </p>
            </div>
          }

          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="closeLoginPrompt()"
              class="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="proceedToLogin()"
              class="inline-flex items-center gap-2 bg-[#174A6E] hover:bg-[#123B59] text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <span>Login to Continue</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class TendersModalComponent {
  private authService = inject(AuthService);

  @Output() close = new EventEmitter<void>();

  readonly showLoginModal = signal(false);
  readonly selectedTender = signal<Tender | null>(null);

  openLoginPrompt(tender: Tender): void {
    this.selectedTender.set(tender);
    this.showLoginModal.set(true);
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
