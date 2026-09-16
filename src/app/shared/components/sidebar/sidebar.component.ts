import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common';
import { EoiStateService, UserProfile } from '../../../core/services/eoi-state.service';
import { Observable, filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  template: `
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col h-full font-['Poppins',sans-serif] text-xs flex-shrink-0 select-none shadow-2xs">
      
      <!-- Main Navigation Menu (Stylish, Bold Typography & Modern Hover/Active Accents) -->
      <nav class="flex-grow py-4 px-2.5 space-y-1.5 overflow-y-auto" *ngIf="userProfile$ | async as profile">
        
        <!-- ================= APPLICANT (NEW USER) ================= -->
        <ng-container *ngIf="profile.role === 'applicant' && (profile.userState === 'new' || !profile.isRegistered)">
          <!-- 1. Active Schemes -->
          <a 
            routerLink="/schemes" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <span class="tracking-tight">Active Schemes &amp; Tenders</span>
          </a>

          <!-- 2. Profile with Sub-points -->
          <div class="space-y-1">
            <div 
              (click)="toggleProfile()"
              [ngClass]="isProfileActive() ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]' : 'text-slate-700 hover:bg-slate-100 hover:text-[#002244] border-l-[3.5px] border-transparent'"
              class="flex items-center justify-between px-3 py-2.5 transition-all font-bold text-xs rounded-xs group cursor-pointer select-none">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]" [ngClass]="{'text-[#002244]': isProfileActive()}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span class="tracking-tight">Profile</span>
              </div>
              <div class="p-0.5 rounded text-slate-400 group-hover:text-[#002244]">
                <svg class="w-3.5 h-3.5 transition-transform duration-200" [ngClass]="{'rotate-180 text-[#002244]': isProfileOpen}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Sub-points (4 sections) -->
            <div *ngIf="isProfileOpen" class="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-4.5">
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 1 }"
                [ngClass]="isSectionActive(1) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="isSectionActive(1) ? 'bg-[#002244]' : 'bg-slate-300'"></span>
                <span class="truncate">1. Organisation Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 2 }"
                [ngClass]="isSectionActive(2) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="isSectionActive(2) ? 'bg-[#002244]' : 'bg-slate-300'"></span>
                <span class="truncate">2. Authorized Person Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 3 }"
                [ngClass]="isSectionActive(3) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="isSectionActive(3) ? 'bg-[#002244]' : 'bg-slate-300'"></span>
                <span class="truncate">3. Bank Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 4 }"
                [ngClass]="isSectionActive(4) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="isSectionActive(4) ? 'bg-[#002244]' : 'bg-slate-300'"></span>
                <span class="truncate">4. Uploaded Documents</span>
              </a>
            </div>
          </div>
        </ng-container>

        <!-- ================= APPLICANT (EXISTING USER) ================= -->
        <ng-container *ngIf="profile.role === 'applicant' && profile.userState === 'existing' && profile.isRegistered">
          <!-- 1. Active Schemes & Tenders -->
          <a 
            routerLink="/schemes" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <span class="tracking-tight">Active Schemes &amp; Tenders</span>
          </a>

          <!-- 2. Tender Status -->
          <a 
            routerLink="/eoi/tender-status" 
            [ngClass]="isTenderStatusActive() ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]' : 'text-slate-700 hover:bg-slate-100 hover:text-[#002244] border-l-[3.5px] border-transparent'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all font-bold text-xs rounded-xs group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]" [ngClass]="{'text-[#002244]': isTenderStatusActive()}">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span class="tracking-tight">Tender Status</span>
          </a>

          <!-- 3. Profile with Sub-points (4 Sub-points from Step 3) -->
          <div class="space-y-1">
            <div 
              (click)="toggleProfile()"
              [ngClass]="isProfileActive() ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]' : 'text-slate-700 hover:bg-slate-100 hover:text-[#002244] border-l-[3.5px] border-transparent'"
              class="flex items-center justify-between px-3 py-2.5 transition-all font-bold text-xs rounded-xs group cursor-pointer select-none">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]" [ngClass]="{'text-[#002244]': isProfileActive()}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span class="tracking-tight">Profile</span>
              </div>
              <div class="p-0.5 rounded text-slate-400 group-hover:text-[#002244]">
                <svg class="w-3.5 h-3.5 transition-transform duration-200" [ngClass]="{'rotate-180 text-[#002244]': isProfileOpen}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Sub-points (4 sections) -->
            <div *ngIf="isProfileOpen" class="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-4.5">
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 1 }"
                [ngClass]="isSectionActive(1) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight group/sub">
                <span class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors" [ngClass]="isSectionActive(1) ? 'bg-[#002244]' : 'bg-slate-300 group-hover/sub:bg-slate-500'"></span>
                <span class="truncate">1. Organisation Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 2 }"
                [ngClass]="isSectionActive(2) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight group/sub">
                <span class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors" [ngClass]="isSectionActive(2) ? 'bg-[#002244]' : 'bg-slate-300 group-hover/sub:bg-slate-500'"></span>
                <span class="truncate">2. Authorized Person Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 3 }"
                [ngClass]="isSectionActive(3) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight group/sub">
                <span class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors" [ngClass]="isSectionActive(3) ? 'bg-[#002244]' : 'bg-slate-300 group-hover/sub:bg-slate-500'"></span>
                <span class="truncate">3. Bank Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 4 }"
                [ngClass]="isSectionActive(4) ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[2.5px] border-[#002244]' : 'text-slate-600 hover:text-[#002244] hover:bg-slate-50 border-l-[2.5px] border-transparent'"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all text-[11px] leading-tight group/sub">
                <span class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors" [ngClass]="isSectionActive(4) ? 'bg-[#002244]' : 'bg-slate-300 group-hover/sub:bg-slate-500'"></span>
                <span class="truncate">4. Uploaded Documents</span>
              </a>
            </div>
          </div>
        </ng-container>

        <!-- ================= DEPARTMENT ADMIN ================= -->
        <ng-container *ngIf="profile.role === 'dept_admin'">
          <!-- 1. EOI Requests -->
          <a 
            routerLink="/admin/eoi-view" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <span class="tracking-tight">EOI Requests Desk</span>
          </a>

        </ng-container>

        <!-- ================= SUPER ADMIN ================= -->
        <ng-container *ngIf="profile.role === 'super_admin'">
          <!-- 1. Master Configurations -->
          <a 
            routerLink="/admin/masters" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <span class="tracking-tight">Master Configs (CRUD)</span>
          </a>

          <!-- 2. Configure Dynamic EOI -->
          <a 
            routerLink="/admin/configure-eoi" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <span class="tracking-tight">Configure EOI Forms</span>
          </a>

          <!-- 3. User Governance -->
          <a 
            routerLink="/admin/manage-users" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span class="tracking-tight">Manage System Users</span>
          </a>
        </ng-container>

      </nav>

    </aside>
  `
})
export class SidebarComponent implements OnInit {
  userProfile$!: Observable<UserProfile>;
  isProfileOpen = true;

  constructor(private eoiService: EoiStateService, private router: Router) {}

  ngOnInit(): void {
    this.userProfile$ = this.eoiService.userProfile$;
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  isProfileActive(): boolean {
    return this.router.url.startsWith('/profile');
  }

  isSectionActive(sectionId: number): boolean {
    if (!this.isProfileActive()) return false;
    const url = this.router.url;
    if (url.includes(`section=${sectionId}`)) return true;
    // Default to section 1 when just on /profile without queryParams
    if (sectionId === 1 && !url.includes('section=')) return true;
    return false;
  }

  isTenderStatusActive(): boolean {
    return this.router.url.includes('/eoi/tender-status') || this.router.url.includes('/eoi/my-applications') || this.router.url.includes('/eoi/tracker') || this.router.url.includes('/eoi/status');
  }

  isTrackerActive(): boolean {
    return this.isTenderStatusActive();
  }
}
