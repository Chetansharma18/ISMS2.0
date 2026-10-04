import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { AspirantService } from '../../../features/sdc/services/aspirant.service';
import { BatchService, isBatchApproved, isBatchRejected } from '../../../features/sdc/services/batch.service';

export interface SidebarNavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  badge?: () => number | string;
  badgeClass?: string;
  dividerBefore?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block shrink-0 h-full'
  },
  template: `
    <!-- Unified Reusable Sidebar -->
    <aside
      class="shrink-0 bg-white border-r border-slate-200 h-full flex flex-col justify-between select-none overflow-y-auto font-sans"
      style="width: 228px;"
      aria-label="Portal Navigation Sidebar"
    >
      <!-- Top: Nav Links -->
      <div class="flex flex-col">

        <!-- Navigation Links: Single Unified Template, Dynamic Role-Based Content -->
        <nav class="flex flex-col gap-1 px-2.5 py-3" aria-label="Main Navigation">
          @for (item of navItems(); track item.id) {
            @if (item.dividerBefore) {
              <div class="my-1.5 border-t border-slate-100 mx-1" aria-hidden="true"></div>
            }

            <a
              [routerLink]="item.route"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold border border-[#D9E1E7] active-nav"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors flex items-center justify-center">
                  @switch (item.icon) {
                    @case ('document') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    @case ('building') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    }
                    @case ('clipboard-check') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    }
                    @case ('chat-bubble') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    @case ('video-camera') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    }
                    @case ('briefcase') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    }
                    @case ('clock') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    @case ('inbox') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    }
                    @case ('users') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                    @case ('user-group') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    }
                    @case ('exclamation-circle') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    }
                    @case ('user') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                    @default {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    }
                  }
                </span>
                <span class="tracking-tight truncate">{{ item.label }}</span>
              </div>

              @if (item.badge && item.badge() !== 0 && item.badge() !== '0') {
                <span
                  class="px-2 py-0.5 rounded-full text-[11px] leading-tight shrink-0 inline-flex items-center gap-1.5 transition-all select-none"
                  [ngClass]="item.badgeClass || 'bg-[#174A6E] text-white font-semibold'"
                >
                  @if (item.badge() === 'Pending') {
                    <span class="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0 animate-pulse"></span>
                  }
                  <span>{{ item.badge() }}</span>
                </span>
              }
            </a>
          }
        </nav>
      </div>

    </aside>
  `
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

  readonly isProfilePending = computed(() => {
    const user = this.currentUser();
    return user?.role === 'new_user' || user?.isProfileComplete === false;
  });

  /**
   * Unified Navigation Items - Structure created once, content adapts by role
   */
  readonly navItems = computed<SidebarNavItem[]>(() => {
    if (this.isDeptAdmin()) {
      return [
        {
          id: 'eoi-responses',
          label: 'EOI Responses',
          route: '/admin/eoi-view',
          icon: 'document'
        },
        {
          id: 'sdc-approvals',
          label: 'SDC Approvals',
          route: '/sdc',
          icon: 'building'
        },
        {
          id: 'batch-approvals',
          label: 'Batch Approvals',
          route: '/admin/batch-approvals',
          icon: 'clipboard-check',
          badge: () => this.pendingBatchApprovalsCount(),
          badgeClass: 'bg-[#F28C28] text-white'
        },
        {
          id: 'grievance',
          label: 'Grievance Management',
          route: '/admin/grievance',
          icon: 'chat-bubble'
        },
        {
          id: 'camera-monitoring',
          label: 'Camera Monitoring',
          route: '/admin/camera-monitoring',
          icon: 'video-camera'
        }
      ];
    }

    if (this.isExistingUser()) {
      return [
        {
          id: 'active-schemes',
          label: 'Active Scheme',
          route: '/tenders',
          icon: 'briefcase'
        },
        {
          id: 'tender-status',
          label: 'Tender Status',
          route: '/tender-status',
          icon: 'clock'
        },
        {
          id: 'sanction-orders',
          label: 'Sanction Order',
          route: '/tp/sanction-orders',
          icon: 'inbox'
        },
        {
          id: 'sdc-management',
          label: 'SDC Management',
          route: '/sdcs',
          icon: 'building'
        },
        {
          id: 'batch-management',
          label: 'Batch Management',
          route: '/batches',
          icon: 'users'
        },
        {
          id: 'aspirants-management',
          label: 'Aspirants Management',
          route: '/aspirants',
          icon: 'user-group',
          badge: () => this.aspirantCount(),
          badgeClass: 'bg-[#174A6E] text-white'
        },
        {
          id: 'grievance',
          label: 'Grievance',
          route: '/grievance',
          icon: 'exclamation-circle'
        },
        {
          id: 'profile',
          label: 'Profile',
          route: '/profile',
          icon: 'user',
          badge: this.isProfilePending() ? () => 'Pending' : undefined,
          badgeClass: 'bg-amber-50 text-[#C2410C] border border-amber-300 font-semibold shadow-2xs',
          dividerBefore: true
        }
      ];
    }

    // Default / New User
    return [
      {
        id: 'active-schemes',
        label: 'Active Scheme',
        route: '/tenders',
        icon: 'briefcase'
      },
      {
        id: 'profile',
        label: 'Profile',
        route: '/profile',
        icon: 'user',
        badge: () => 'Pending',
        badgeClass: 'bg-amber-50 text-[#C2410C] border border-amber-300 font-semibold shadow-2xs',
        dividerBefore: true
      }
    ];
  });
}
