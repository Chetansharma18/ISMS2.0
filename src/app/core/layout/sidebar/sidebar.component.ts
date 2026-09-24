import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block shrink-0 h-full'
  },
  template: `
    <!-- Fixed Clean Themed Sidebar Container -->
    <aside
      class="w-52 sm:w-60 shrink-0 bg-white border-r border-[#D9E1E7] h-full py-3.5 flex flex-col justify-between select-none shadow-[0_1px_3px_rgba(31,41,51,0.06)] overflow-y-auto font-sans"
      aria-label="Portal Navigation Sidebar"
    >
      <!-- Top Navigation Group -->
      <div>
        <!-- Mini Portal Brand Header -->
        <div class="px-4 pb-2.5 mb-2 border-b border-[#D9E1E7] flex items-center justify-between">
          <span class="text-[13px] font-semibold text-[#1F2933] tracking-tight flex items-center gap-1">
            ISMS 2.0
          </span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 px-2.5" aria-label="Main Navigation">
          
          <!-- ================================================================
               ROLE: DEPARTMENT ADMIN (Scrutiny Officer)
               ================================================================ -->
          @if (isDeptAdmin()) {
            <!-- 1. EOI Responses -->
            <a
              routerLink="/admin/eoi-view"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7] active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="tracking-tight">EOI Responses</span>
              </div>
            </a>

            <!-- 2. Applicant Submissions -->
            <a
              routerLink="/admin/responses"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7] active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="tracking-tight">Applicant Submissions</span>
              </div>
            </a>
          } @else if (isExistingUser()) {
            <!-- ================================================================
                 ROLE: EXISTING USER
                 ================================================================ -->
            <!-- 1. Active Schemes & Tenders -->
            <a
              routerLink="/tenders"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7] active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span class="tracking-tight">Active EOI</span>
              </div>
            </a>

            <!-- 2. Tender Status -->
            <a
              routerLink="/tender-status"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7] active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="tracking-tight">Tender Status</span>
              </div>
            </a>

            <!-- 3. Profile Accordion Section -->
            <div class="pt-0.5">
              <button
                type="button"
                (click)="toggleProfileAccordion()"
                class="w-full flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
                [class.text-[#174A6E]]="profileExpanded()"
                [class.font-medium]="profileExpanded()"
              >
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="tracking-tight">Profile</span>
                </div>
                <svg
                  class="w-3.5 h-3.5 text-[#7A8792] transition-transform duration-200"
                  [class.rotate-180]="profileExpanded()"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Profile Sub-Items List -->
              @if (profileExpanded()) {
                <div class="flex flex-col gap-0.5 pl-3 pr-1 pt-0.5 border-l-2 border-[#D9E1E7] ml-4">
                  
                  <!-- 1. Organisation Details -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'org' }"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-[12px] leading-[18px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer"
                  >
                    <span class="truncate">1. Organisation Details</span>
                  </a>

                  <!-- 2. Authorized Person Details -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'auth' }"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-[12px] leading-[18px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer"
                  >
                    <span class="truncate">2. Authorized Person</span>
                  </a>

                  <!-- 3. Bank Details -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'bank' }"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-[12px] leading-[18px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer"
                  >
                    <span class="truncate">3. Bank Details</span>
                  </a>

                  <!-- 4. Uploaded Documents -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'docs' }"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-[12px] leading-[18px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer"
                  >
                    <span class="truncate">4. Documents</span>
                  </a>

                </div>
              }
            </div>
          } @else {
            <!-- ================================================================
                 ROLE: NEW USER / STANDARD
                 ================================================================ -->
            <!-- Active EOI Nav Item -->
            <a
              routerLink="/tenders"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7] active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span class="tracking-tight">Active EOI</span>
              </div>
            </a>

            <!-- Profile Nav Item -->
            <a
              routerLink="/profile"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7] active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="tracking-tight">Profile</span>
              </div>
            </a>
          }

        </nav>
      </div>

    </aside>
  `,
  styles: [`
    .active-nav svg {
      color: #174A6E !important;
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);

  profileExpanded = signal<boolean>(true);

  readonly currentUser = this.authService.currentUser;

  readonly isExistingUser = computed(() => {
    const user = this.currentUser();
    return user?.role === 'existing_user';
  });

  readonly isDeptAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'dept_admin';
  });

  toggleProfileAccordion(): void {
    this.profileExpanded.update(v => !v);
  }
}
