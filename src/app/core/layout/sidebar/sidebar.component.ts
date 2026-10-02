import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { AspirantService } from '../../../features/sdc/services/aspirant.service';
import { BatchService, isBatchApproved, isBatchRejected } from '../../../features/sdc/services/batch.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block shrink-0 h-full'
  },
  template: `
    <!-- Premium Sidebar -->
    <aside
      class="shrink-0 bg-white border-r border-slate-200 h-full flex flex-col justify-between select-none overflow-y-auto font-sans"
      style="width: 228px;"
      aria-label="Portal Navigation Sidebar"
    >
      <!-- Top: Brand + Nav -->
      <div class="flex flex-col">

        <!-- Brand Header -->
        <div class="px-5 py-4 border-b border-slate-100">
          <span class="text-[12.5px] font-bold text-[#0B3558] uppercase" style="letter-spacing: 0.07em;">
            ISMS 2.0
          </span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 px-2.5" aria-label="Main Navigation">

          <!-- ================================================================
               ROLE: SUPER ADMIN
               ================================================================ -->
          @if (isSuperAdmin()) {
            <!-- 1. EOI Configuration -->
            <a
              routerLink="/admin/eoi-configuration"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="tracking-tight">EOI Configuration</span>
            </a>
          } @else if (isDeptAdmin()) {
            <!-- 1. EOI Responses -->
            <a
              routerLink="/admin/eoi-view"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="tracking-tight">EOI Responses</span>
            </a>

            <!-- 2. SDC Approvals -->
            <a
              routerLink="/sdc"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="tracking-tight">SDC Approvals</span>
            </a>

            <!-- 3. Batch Approvals -->
            <a
              routerLink="/admin/batch-approvals"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span class="tracking-tight">Batch Approvals</span>
            </a>

            <!-- 4. Grievance Management -->
            <a
              routerLink="/admin/grievance"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="tracking-tight">Grievance Management</span>
            </a>

            <!-- 5. Camera Monitoring -->
            <a
              routerLink="/admin/camera-monitoring"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span class="tracking-tight">Camera Monitoring</span>
            </a>
          } @else if (isExistingUser()) {
            <!-- ============================================================
                 ROLE: EXISTING USER
                 ============================================================ -->
            <a routerLink="/tenders"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="text-[13.5px] font-semibold">Active Schemes</span>
            </a>

            <a routerLink="/tender-status"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-[13.5px] font-semibold">Tender Status</span>
            </a>

            <a routerLink="/tp/sanction-orders"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span class="text-[13.5px] font-semibold">Sanction Order</span>
            </a>

            <a routerLink="/sdcs"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="text-[13.5px] font-semibold">SDC Management</span>
            </a>

            <a routerLink="/batches"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-[13.5px] font-semibold">Batch Management</span>
            </a>

            <a routerLink="/aspirants"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span class="text-[13.5px] font-semibold flex-1 whitespace-nowrap">Aspirants Management</span>
              @if (aspirantCount() > 0) {
                <span class="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#0B3558] text-white leading-none shrink-0">
                  {{ aspirantCount() }}
                </span>
              }
            </a>

            <a routerLink="/grievance"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-[13.5px] font-semibold">Grievance</span>
            </a>

            <!-- Divider before Profile -->
            <div class="my-1.5 border-t border-slate-100 mx-1"></div>

            <a routerLink="/profile"
               routerLinkActive="active-nav-item"
               [routerLinkActiveOptions]="{ exact: false }"
               class="nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#0B3558] transition-all cursor-pointer"
            >
              <svg class="nav-icon w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-[13.5px] font-semibold">Profile</span>
            </a>
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
                <span class="tracking-tight">Active Schemes</span>
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
    .nav-icon {
      color: #94a3b8;
      transition: color 0.15s ease;
    }
    .nav-item:hover .nav-icon,
    .active-nav-item .nav-icon {
      color: #0B3558;
    }
    .active-nav-item {
      background-color: #eef4fb !important;
      color: #0B3558 !important;
      font-weight: 700;
      border-left: 3px solid #0B3558;
      padding-left: calc(0.75rem - 3px) !important;
    }
    .active-nav-item span {
      color: #0B3558 !important;
      font-weight: 700;
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  aspirantService = inject(AspirantService);
  batchService = inject(BatchService);

  readonly currentUser = this.authService.currentUser;
  readonly aspirantCount = computed(() => this.aspirantService.aspirants().length);
  readonly pendingBatchApprovalsCount = computed(() => {
    return this.batchService.batches().filter(b => !isBatchApproved(b) && !isBatchRejected(b)).length;
  });

  readonly isExistingUser = computed(() => {
    const user = this.currentUser();
    return user?.role === 'existing_user';
  });

  readonly isDeptAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'dept_admin';
  });

  readonly isSuperAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'super_admin';
  });
}
