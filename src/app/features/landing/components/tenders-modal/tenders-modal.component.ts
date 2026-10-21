import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActionModalComponent, ButtonComponent, ModalComponent } from '../../../../shared';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ActionModalComponent, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      title="Official Tenders & RFP Notices"
      subtitle="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
      widthOverride="max-w-3xl"
      (close)="onModalClose()"
    >
        <div class="space-y-3">
          <p class="text-[11px] sm:text-xs font-medium text-slate-500 text-right m-0">Total Tenders: <span class="text-slate-900 font-bold">{{ tenders.length }}</span></p>

          @for (item of tenders; track item.id) {
            <div (click)="openLoginPrompt(item)" class="group relative bg-white border border-navy/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-lg p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:shadow-[0_0_20px_rgba(11,53,88,0.15)] hover:border-navy/40 transition-all cursor-pointer">
              
              @if (item.isNew) {
                <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-8 sm:w-9 h-8 sm:h-9 object-cover z-10 pointer-events-none drop-shadow-xs rounded-tl-lg" />
              }

              <div class="flex-1 min-w-0 pl-1.5 sm:pl-0">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <span class="text-[11px] text-slate-500 font-medium">{{ item.date }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[11px] text-slate-500 tabular-nums truncate max-w-[200px] sm:max-w-none">{{ item.id }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-[10px] font-semibold text-brand bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">{{ item.category }}</span>
                </div>
                
                <h4 class="text-xs sm:text-sm font-bold text-slate-800 leading-snug group-hover:text-brand transition-all m-0">
                  {{ item.title }}
                </h4>
              </div>

              <!-- Action -->
              <div class="shrink-0">
                <button appButton size="sm" (click)="openLoginPrompt(item); $event.stopPropagation()" class="w-full sm:w-auto">
                  <span>Login to View</span>
                </button>
              </div>

            </div>
          }

        </div>
    </app-modal>

    <!-- Login Required Modal -->
    <app-action-modal
      [isOpen]="showLoginModal()"
      title="Login required"
      description="Please login to view Active Scheme and apply."
      [showCloseButton]="true"
      maxWidthClass="max-w-sm"
      primaryLabel="OK"
      secondaryLabel=""
      (primaryAction)="closeLoginPrompt()"
      (close)="closeLoginPrompt()"
    ></app-action-modal>
  `
})
export class TendersModalComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();

  readonly showLoginModal = signal(false);
  readonly selectedTender = signal<Tender | null>(null);

  /** Fired by the modal shell on Escape, backdrop click and the close button. */
  onModalClose(): void {
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
