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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 animate-in fade-in duration-150">
      
      <!-- Modal Container -->
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        <!-- Header -->
        <div class="bg-primary text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0" style="background-color: var(--color-primary, #174A6E);">
          <div>
            <h3 class="text-base sm:text-lg font-bold leading-tight text-white">Official Tenders & RFP Notices</h3>
            <p class="text-[11px] text-blue-100 mt-0.5">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</p>
          </div>
          
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="text-[11px] sm:text-xs font-medium text-slate-200 hidden xs:inline">Total Tenders: <span class="text-white font-bold">{{ tenders.length }}</span></span>
            <button (click)="close.emit()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-xl leading-none text-white" aria-label="Close">
              &times;
            </button>
          </div>
        </div>

        <!-- Body / Scrollable List -->
        <div class="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50">
          
          @for (item of tenders; track item.id) {
            <div (click)="openLoginPrompt(item)" class="group relative bg-white border border-[#0B3558]/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-lg p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:shadow-[0_0_20px_rgba(11,53,88,0.15)] hover:border-[#0B3558]/40 transition-all cursor-pointer">
              
              @if (item.isNew) {
                <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-9 sm:w-11 h-9 sm:h-11 object-cover z-10 pointer-events-none drop-shadow-sm rounded-tl-lg" />
              }

              <div class="flex-1 pl-2 sm:pl-0">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 font-mono">{{ item.id }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[10px] font-semibold text-[#174A6E] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">{{ item.category }}</span>
                </div>
                
                <h4 class="text-xs sm:text-sm font-bold text-slate-800 leading-snug group-hover:text-[#174A6E] transition-all m-0">
                  {{ item.title }}
                </h4>
              </div>

              <!-- Action -->
              <div class="shrink-0">
                <button (click)="openLoginPrompt(item); $event.stopPropagation()" class="w-full sm:w-auto inline-flex items-center justify-center bg-[#174A6E] hover:bg-[#123B59] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs">
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
      <div class="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-150">
        <div class="absolute inset-0" (click)="closeLoginPrompt()"></div>

        <div class="relative bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm p-6 z-10 animate-in zoom-in-95 duration-150">
          <button
            type="button"
            (click)="closeLoginPrompt()"
            class="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>

          <div class="pr-6 pt-1">
            <p class="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed m-0">
              Please login to view Active Scheme and apply.
            </p>
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
