import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common';
import { EoiStateService, UserProfile } from '../../../core/services/eoi-state.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Observable, filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  template: `
    <aside class="w-72 bg-white border-r border-slate-200 flex flex-col h-full font-['Poppins',sans-serif] text-xs flex-shrink-0 select-none shadow-2xs">
      
      <!-- Main Navigation Menu (Clean, Consistent Font Sizes & Active Accents) -->
      <nav class="flex-grow py-4 px-3 space-y-1.5 overflow-y-auto" *ngIf="userProfile$ | async as profile">
        
        <!-- ================= APPLICANT (NEW USER) ================= -->
        <ng-container *ngIf="authService.currentUser()?.role === 'citizen'">
          <!-- 1. Active Schemes -->
          <a 
            routerLink="/schemes" 
            [ngClass]="isSchemesActive() ? 'nav-item-active' : 'nav-item-inactive'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
            <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSchemesActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <span class="tracking-tight whitespace-nowrap">Active Schemes &amp; Tenders</span>
          </a>

          <!-- 2. Profile with Sub-points -->
          <div class="space-y-1">
            <div 
              (click)="toggleProfile()"
              [ngClass]="isProfileActive() ? 'nav-item-active' : 'nav-item-inactive'"
              class="flex items-center justify-between px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer select-none">
              <div class="flex items-center gap-3">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isProfileActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">Profile</span>
              </div>
              <div class="p-0.5 rounded transition-colors" [ngClass]="isProfileActive() ? 'text-[#002244]' : 'text-slate-400 group-hover:text-[#002244]'">
                <svg class="w-3.5 h-3.5 transition-transform duration-200" [ngClass]="{'rotate-180': isProfileOpen}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Sub-points (4 sections) -->
            <div *ngIf="isProfileOpen" class="pl-2 space-y-1 mt-1">
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 1 }"
                [ngClass]="isSectionActive(1) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(1) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M11 11h2M11 15h2M16 11h2M16 15h2M9 21V3h6v18"></path>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">1. Organisation Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 2 }"
                [ngClass]="isSectionActive(2) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(2) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="11" cy="7" r="4"></circle>
                    <polyline points="16 11 18 13 22 9"></polyline>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">2. Authorized Person Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 3 }"
                [ngClass]="isSectionActive(3) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(3) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <line x1="3" y1="21" x2="21" y2="21"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <polyline points="3 10 12 3 21 10"></polyline>
                    <line x1="6" y1="10" x2="6" y2="21"></line>
                    <line x1="10" y1="10" x2="10" y2="21"></line>
                    <line x1="14" y1="10" x2="14" y2="21"></line>
                    <line x1="18" y1="10" x2="18" y2="21"></line>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">3. Bank Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 4 }"
                [ngClass]="isSectionActive(4) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(4) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">4. Uploaded Documents</span>
              </a>
            </div>
          </div>
        </ng-container>

        <!-- ================= APPLICANT (EXISTING USER) ================= -->
        <ng-container *ngIf="authService.currentUser()?.role === 'TP_PIA'">
          <!-- 1. Active Schemes & Tenders -->
          <a 
            routerLink="/schemes" 
            [ngClass]="isSchemesActive() ? 'nav-item-active' : 'nav-item-inactive'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
            <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSchemesActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <span class="tracking-tight whitespace-nowrap">Active Schemes &amp; Tenders</span>
          </a>

          <!-- 2. Tender Status -->
          <a 
            routerLink="/eoi/tender-status" 
            [ngClass]="isTenderStatusActive() ? 'nav-item-active' : 'nav-item-inactive'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
            <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isTenderStatusActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span class="tracking-tight whitespace-nowrap">Tender Status</span>
          </a>

          <!-- 3. Profile with Sub-points (4 Sub-points from Step 3) -->
          <div class="space-y-1">
            <div 
              (click)="toggleProfile()"
              [ngClass]="isProfileActive() ? 'nav-item-active' : 'nav-item-inactive'"
              class="flex items-center justify-between px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer select-none">
              <div class="flex items-center gap-3">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isProfileActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span class="tracking-tight">Profile</span>
              </div>
              <div class="p-0.5 rounded transition-colors" [ngClass]="isProfileActive() ? 'text-[#002244]' : 'text-slate-400 group-hover:text-[#002244]'">
                <svg class="w-3.5 h-3.5 transition-transform duration-200" [ngClass]="{'rotate-180': isProfileOpen}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Sub-points (4 sections) -->
            <div *ngIf="isProfileOpen" class="pl-2 space-y-1 mt-1">
              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 1 }"
                [ngClass]="isSectionActive(1) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(1) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M11 11h2M11 15h2M16 11h2M16 15h2M9 21V3h6v18"></path>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">1. Organisation Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 2 }"
                [ngClass]="isSectionActive(2) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(2) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="11" cy="7" r="4"></circle>
                    <polyline points="16 11 18 13 22 9"></polyline>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">2. Authorized Person Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 3 }"
                [ngClass]="isSectionActive(3) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(3) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <line x1="3" y1="21" x2="21" y2="21"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <polyline points="3 10 12 3 21 10"></polyline>
                    <line x1="6" y1="10" x2="6" y2="21"></line>
                    <line x1="10" y1="10" x2="10" y2="21"></line>
                    <line x1="14" y1="10" x2="14" y2="21"></line>
                    <line x1="18" y1="10" x2="18" y2="21"></line>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">3. Bank Details</span>
              </a>

              <a 
                routerLink="/profile" 
                [queryParams]="{ section: 4 }"
                [ngClass]="isSectionActive(4) ? 'nav-item-active' : 'nav-item-inactive'"
                class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
                <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSectionActive(4) ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <span class="tracking-tight whitespace-nowrap">4. Uploaded Documents</span>
              </a>
            </div>
          </div>
        </ng-container>

        <!-- ================= DEPARTMENT ADMIN ================= -->
        <ng-container *ngIf="authService.currentUser()?.role === 'DEPARTMENT_ADMIN'">
          <!-- 1. EOI Requests -->
          <a 
            routerLink="/admin/eoi-view" 
            [ngClass]="isDeptEoiActive() ? 'nav-item-active' : 'nav-item-inactive'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
            <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isDeptEoiActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <span class="tracking-tight whitespace-nowrap">EOI Requests Desk</span>
          </a>
        </ng-container>

        <!-- ================= SUPER ADMIN ================= -->
        <ng-container *ngIf="authService.currentUser()?.role === 'SUPER_ADMIN'">
          <!-- 1. Master Configurations -->
          <a 
            routerLink="/admin/masters" 
            [ngClass]="isSuperMastersActive() ? 'nav-item-active' : 'nav-item-inactive'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
            <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSuperMastersActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <span class="tracking-tight whitespace-nowrap">Master Configs (CRUD)</span>
          </a>

          <!-- 2. Configure Dynamic EOI -->
          <a 
            routerLink="/admin/configure-eoi" 
            [ngClass]="isSuperConfigureActive() ? 'nav-item-active' : 'nav-item-inactive'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
            <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSuperConfigureActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <span class="tracking-tight whitespace-nowrap">Configure EOI Forms</span>
          </a>

          <!-- 3. User Governance -->
          <a 
            routerLink="/admin/manage-users" 
            [ngClass]="isSuperUsersActive() ? 'nav-item-active' : 'nav-item-inactive'"
            class="flex items-center gap-3 px-3 py-2.5 transition-all text-xs rounded-xs group cursor-pointer">
            <div class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" [ngClass]="isSuperUsersActive() ? 'text-[#002244]' : 'text-slate-500 group-hover:text-[#002244]'">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span class="tracking-tight whitespace-nowrap">Manage System Users</span>
          </a>
        </ng-container>

        <!-- ================= DEPARTMENT WORKFLOW MENUS ================= -->
        <ng-container *ngIf="authService.hasRole(['SUPER_ADMIN', 'DEPARTMENT_ADMIN'])">
          <div class="pt-2 mt-2 border-t border-slate-200">
             <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               Dept Workflow (ISMS 2.0)
             </div>

             <!-- Course Scrutiny Queue -->
             <a 
               routerLink="/admin/courses" 
               routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
               class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
               <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
                 <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                   <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                   <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                 </svg>
               </div>
               <span class="tracking-tight">Course Scrutiny Queue</span>
             </a>
             
             <!-- Tender Management -->
             <a 
               routerLink="/department/tenders" 
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
               <span class="tracking-tight">Tender Management</span>
             </a>

             <!-- Sanction Orders -->
             <a 
               routerLink="/department/sanction-orders" 
               routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
               class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
               <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
                 <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                 </svg>
               </div>
               <span class="tracking-tight">Sanction Orders</span>
             </a>
          </div>
        </ng-container>

        <!-- ================= TP / EXECUTION MENUS ================= -->
        <ng-container *ngIf="authService.currentUser()?.role === 'TP_PIA'">
          <div class="pt-2 mt-2 border-t border-slate-200">
             <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               Execution (ISMS 2.0)
             </div>

             <!-- Propose Courses -->
             <a 
               routerLink="/tp/courses" 
               routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
               class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
               <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
                 <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                   <path d="M12 20h9"></path>
                   <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                 </svg>
               </div>
               <span class="tracking-tight">Propose Courses</span>
             </a>
             
             <!-- SDC Management -->
             <a 
               routerLink="/sdcs" 
               routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
               class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
               <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
                 <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                   <polyline points="9 22 9 12 15 12 15 22"></polyline>
                 </svg>
               </div>
               <span class="tracking-tight">SDC Management</span>
             </a>

             <!-- Batch Management -->
             <a 
               routerLink="/batches" 
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
               <span class="tracking-tight">Batch Management</span>
             </a>
          </div>
        </ng-container>

        <!-- ================= AUDITOR MENUS ================= -->
        <ng-container *ngIf="authService.hasRole(['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'AUDITOR'])">
          <div class="pt-2 mt-2 border-t border-slate-200">
             <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
               Auditor Workflow
             </div>
             
             <!-- Assigned TPs -->
             <a 
               routerLink="/auditor/tps" 
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
               <span class="tracking-tight">Assigned TPs</span>
             </a>
             
             <!-- Dashboard / Overviews -->
             <a 
               routerLink="/auditor/dashboard" 
               routerLinkActive="bg-[#002244]/10 text-[#002244] font-black border-l-[3.5px] border-[#002244]" 
               class="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-bold text-xs rounded-xs border-l-[3.5px] border-transparent group">
               <div class="w-6 h-6 rounded flex items-center justify-center text-slate-500 group-hover:text-[#002244]">
                 <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                   <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
                 </svg>
               </div>
               <span class="tracking-tight">My Inspections</span>
             </a>
          </div>
        </ng-container>

      </nav>
    </aside>
  `,
  styles: [`
    .nav-item-active {
      background-color: rgba(0, 34, 68, 0.08) !important;
      color: #002244 !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      border-left: 4px solid #002244 !important;
    }
    .nav-item-inactive {
      color: #334155 !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      border-left: 4px solid transparent !important;
    }
    .nav-item-inactive:hover {
      background-color: #f1f5f9 !important;
      color: #002244 !important;
    }
  `]
})
export class SidebarComponent implements OnInit {
  userProfile$!: Observable<UserProfile>;
  isProfileOpen = true;
  authService = inject(AuthService);

  constructor(private eoiService: EoiStateService, private router: Router) { }

  ngOnInit(): void {
    this.userProfile$ = this.eoiService.userProfile$;
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  isSchemesActive(): boolean {
    return this.router.url === '/schemes' || this.router.url.startsWith('/schemes');
  }

  isTenderStatusActive(): boolean {
    return this.router.url.includes('/eoi/tender-status') || this.router.url.includes('/eoi/my-applications') || this.router.url.includes('/eoi/tracker') || this.router.url.includes('/eoi/status');
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

  isDeptEoiActive(): boolean {
    return this.router.url.includes('/admin/eoi-view') || this.router.url.includes('/admin/responses') || this.router.url.includes('/admin/review');
  }

  isSuperMastersActive(): boolean {
    return this.router.url.includes('/admin/masters');
  }

  isSuperConfigureActive(): boolean {
    return this.router.url.includes('/admin/configure-eoi');
  }

  isSuperUsersActive(): boolean {
    return this.router.url.includes('/admin/manage-users');
  }
}
