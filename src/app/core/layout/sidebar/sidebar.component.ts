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
    <!-- Fixed Clean Themed Sidebar Container (Never scrolls with main content) -->
    <aside
      class="w-52 sm:w-60 shrink-0 bg-white border-r border-slate-200 h-full py-3.5 flex flex-col justify-between select-none shadow-2xs overflow-y-auto font-sans"
      style="font-family: 'Inter', sans-serif;"
      aria-label="Portal Navigation Sidebar"
    >
      <!-- Top Navigation Group -->
      <div>
        <!-- Mini Portal Brand Header -->
        <div class="px-4 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
            ISMS <span class="text-[#EA580C]">2.0</span>
          </span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 px-2.5" aria-label="Main Navigation">
          
          <!-- ================================================================
               ROLE: DEPARTMENT ADMIN (Scrutiny Officer)
               ================================================================ -->
          @if (isDeptAdmin()) {
            <!-- 1. EOI Request -->
            <a
              routerLink="/admin/eoi-view"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-normal cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="tracking-tight">EOI Request</span>
              </div>
            </a>
          } @else if (isExistingUser()) {
            <!-- 1. Active Schemes & Tenders -->
            <a
              routerLink="/tenders"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-normal cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span class="tracking-tight">Active EOI</span>
              </div>
            </a>

            <!-- 2. Tender Status -->
            <a
              routerLink="/tender-status"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-normal cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="tracking-tight">Tender Status</span>
              </div>
            </a>

            <!-- 3. Profile Accordion Section -->
            <div class="pt-1">
              <button
                type="button"
                (click)="toggleProfileAccordion()"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-normal cursor-pointer group"
                [class.text-slate-900]="profileExpanded()"
                [class.font-semibold]="profileExpanded()"
              >
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="tracking-tight">Profile</span>
                </div>
                <svg
                  class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
                  [class.rotate-180]="profileExpanded()"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Profile Sub-Items List (Clean neutral style) -->
              @if (profileExpanded()) {
                <div class="flex flex-col gap-1 pl-3 pr-1 pt-1 border-l-2 border-slate-200 ml-4 animate-in fade-in slide-in-from-top-1 duration-150">
                  
                  <!-- 1. Organisation Details -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'org' }"
                    routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
                    class="flex items-center gap-2 px-2.5 py-2 rounded-md text-[11.5px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer font-normal"
                  >
                    <svg class="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span class="truncate">1. Organisation Details</span>
                  </a>

                  <!-- 2. Authorized Person Details -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'auth' }"
                    routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
                    class="flex items-center gap-2 px-2.5 py-2 rounded-md text-[11.5px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer font-normal"
                  >
                    <svg class="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="truncate">2. Authorized Person Details</span>
                  </a>

                  <!-- 3. Bank Details -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'bank' }"
                    routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
                    class="flex items-center gap-2 px-2.5 py-2 rounded-md text-[11.5px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer font-normal"
                  >
                    <svg class="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span class="truncate">3. Bank Details</span>
                  </a>

                  <!-- 4. Uploaded Documents -->
                  <a
                    routerLink="/profile"
                    [queryParams]="{ tab: 'docs' }"
                    routerLinkActive="bg-slate-100 text-slate-900 font-semibold"
                    class="flex items-center gap-2 px-2.5 py-2 rounded-md text-[11.5px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer font-normal"
                  >
                    <svg class="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="truncate">4. Uploaded Documents</span>
                  </a>

                </div>
              }
            </div>
          } @else {
            <!-- ================================================================
                 ROLE: NEW USER / STANDARD (Tenders + Profile only)
                 ================================================================ -->
            <!-- Tenders Nav Item -->
            <a
              routerLink="/tenders"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-normal cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="tracking-tight">Active EOI</span>
              </div>
            </a>

            <!-- Profile Nav Item -->
            <a
              routerLink="/profile"
              routerLinkActive="bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-normal cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      color: #0f172a !important;
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
