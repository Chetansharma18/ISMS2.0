import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common';
import { EoiStateService, UserProfile } from '../../../core/services/eoi-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  template: `
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col h-full text-xs flex-shrink-0 select-none shadow-2xs">
      
      <!-- Top Section: Company / Organization Name (Directly displayed without uppercase category tag) -->
      <ng-container *ngIf="userProfile$ | async as profile">
      <div class="p-4 border-b border-slate-200 bg-slate-50/70" *ngIf="profile.role === 'applicant'">
        
        <!-- Applicant Header: Focused directly on Company Name -->
          
          <!-- Incomplete / Unregistered Profile State -->
          <ng-container *ngIf="profile.userState === 'new' || !profile.isRegistered">
            <div class="font-extrabold text-[13px] text-[#002244] leading-snug line-clamp-2 tracking-tight" [title]="profile.organization.name || 'Company Name Pending'">
              {{ profile.organization.name || 'Company Name Pending' }}
            </div>

            <div class="mt-1.5 flex items-center gap-1.5">
              <span class="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-xs">
                <span>⚠️ OTR Incomplete</span>
              </span>
            </div>

            <div class="text-[11px] text-slate-500 mt-2 font-mono font-medium flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span>SSO: <strong class="text-[#002244] font-bold">{{ profile.ssoId || 'new_citizen_rj' }}</strong></span>
              <a routerLink="/auth/register" class="text-[11px] font-bold text-[#002244] hover:underline">Complete →</a>
            </div>
          </ng-container>

          <!-- Registered & Verified Organization State -->
          <ng-container *ngIf="profile.userState === 'existing' && profile.isRegistered">
            <div class="font-black text-[13px] text-[#002244] leading-snug line-clamp-2 tracking-tight" [title]="profile.organization.name">
              {{ profile.organization.name }}
            </div>

            <div class="mt-1.5 flex items-center gap-1.5">
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-xs">
                <span>✓ Verified Training Partner</span>
              </span>
            </div>

            <div class="text-[11px] text-slate-500 mt-2 font-mono font-medium flex items-center justify-between border-t border-slate-200 pt-1.5">
              <span>REG ID: <strong class="text-slate-800 font-bold">{{ profile.registrationNumber }}</strong></span>
            </div>
          </ng-container>

      </div>
      </ng-container>

      <!-- Main Navigation Menu (Stylish, Bold Typography & Modern Hover/Active Accents) -->
      <nav class="flex-grow py-3 px-2.5 space-y-1.5 overflow-y-auto" *ngIf="userProfile$ | async as profile">
        
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

          <!-- 2. Profile -->
          <a 
            routerLink="/profile" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span class="tracking-tight">Profile</span>
          </a>
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

          <!-- 2. My EOI Applications -->
          <a 
            routerLink="/eoi/my-applications" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span class="tracking-tight">My EOI Applications</span>
          </a>

          <!-- 3. Tender Status -->
          <a 
            routerLink="/eoi/tracker/ISMS-EOI-2026-9871" 
            [ngClass]="isTrackerActive() ? 'bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]' : 'text-slate-700 hover:bg-slate-100 hover:text-[#002244] border-l-[3.5px] border-transparent'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all font-bold text-xs rounded-xs group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]" [ngClass]="{'text-[#002244]': isTrackerActive()}">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span class="tracking-tight">Tender Status</span>
          </a>

          <!-- 4. Profile -->
          <a 
            routerLink="/profile" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span class="tracking-tight">Profile</span>
          </a>
        </ng-container>

        <!-- ================= DEPARTMENT ADMIN ================= -->
        <ng-container *ngIf="profile.role === 'dept_admin'">
          <!-- 1. EOI Requests -->
          <a 
            routerLink="/admin/eoi-view" 
            routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
            class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
            <span class="tracking-tight">EOI RESPONSES</span>
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

      <!-- Bottom Persona Switcher & Help Desk -->
      <div class="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <a 
          routerLink="/profile" 
          class="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xs transition-colors">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Portal Settings</span>
          </span>
          <span class="text-slate-400">→</span>
        </a>
      </div>

    </aside>
  `
})
export class SidebarComponent implements OnInit {
  userProfile$!: Observable<UserProfile>;

  constructor(private eoiService: EoiStateService, private router: Router) {}

  ngOnInit(): void {
    this.userProfile$ = this.eoiService.userProfile$;
  }

  isTrackerActive(): boolean {
    return this.router.url.includes('/eoi/tracker') || this.router.url.includes('/eoi/status') || this.router.url.includes('/tender-status');
  }
}
