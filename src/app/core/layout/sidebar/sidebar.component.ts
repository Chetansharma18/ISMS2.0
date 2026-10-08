import { Component, inject, computed, signal, Output, EventEmitter } from '@angular/core';
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
      class="shrink-0 bg-white border-r border-slate-200 h-full flex flex-col justify-between select-none overflow-y-auto font-sans w-[228px] max-w-full"
      (click)="onNavClick($event)"
      aria-label="Portal Navigation Sidebar"
    >
      <!-- Top: Brand + Nav -->
      <div class="flex flex-col">
        
        <!-- Mobile Sidebar Close Header (Visible only < md) -->
        <div class="md:hidden flex items-center justify-between px-3.5 py-3 border-b border-slate-200 bg-[#F5F8FA]">
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-[#12365A]">ISMS 2.0</span>
            <span class="text-[11px] text-slate-500 font-medium">Menu</span>
          </div>
          <button
            type="button"
            (click)="closeMobileNav.emit()"
            class="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
            title="Close menu"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 px-2.5 py-3" aria-label="Main Navigation">

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

            <!-- 2. Master Dropdown Slider Section -->
            <div class="flex flex-col">
              <!-- Master Header Toggle -->
              <button
                type="button"
                (click)="toggleMaster()"
                class="flex items-center justify-between w-full px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
              >
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span class="tracking-tight font-medium">Master</span>
                </div>
                <svg
                  class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#174A6E] transition-transform duration-200"
                  [ngClass]="{'transform rotate-180': isMasterOpen()}"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Slider Sub-items -->
              @if (isMasterOpen()) {
                <div class="flex flex-col gap-0.5 pl-7 pr-1 pt-1 pb-1 transition-all duration-300">
                  <a
                    routerLink="/admin/master/eoi-category"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">EOI Category Master</span>
                  </a>

                  <a
                    routerLink="/admin/master/scheme"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Scheme Master</span>
                  </a>

                  <a
                    routerLink="/admin/master/sector"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Sector Master</span>
                  </a>

                  <a
                    routerLink="/admin/master/course"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Course Master</span>
                  </a>

                  <a
                    routerLink="/admin/master/district-block"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">District &amp; Block Master</span>
                  </a>

                  <a
                    routerLink="/admin/master/designation"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Designation</span>
                  </a>
                </div>
              }
            </div>

            <!-- 3. User Management Dropdown Slider Section -->
            <div class="flex flex-col">
              <!-- User Management Header Toggle -->
              <button
                type="button"
                (click)="toggleUserManagement()"
                class="flex items-center justify-between w-full px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
              >
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span class="tracking-tight font-medium">User Management</span>
                </div>
                <svg
                  class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#174A6E] transition-transform duration-200"
                  [ngClass]="{'transform rotate-180': isUserManagementOpen()}"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Slider Sub-items -->
              @if (isUserManagementOpen()) {
                <div class="flex flex-col gap-0.5 pl-7 pr-1 pt-1 pb-1 transition-all duration-300">
                  <a
                    routerLink="/admin/user-management"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    [routerLinkActiveOptions]="{ exact: true }"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Users</span>
                  </a>

                  <a
                    routerLink="/admin/master/user-role"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Role Management</span>
                  </a>

                  <a
                    routerLink="/admin/master/permission"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Permission Management</span>
                  </a>
                </div>
              }
            </div>
          } @else if (isDeptAdmin()) {
            <!-- ================================================================
                 ROLE: DEPARTMENT ADMIN
                 ================================================================ -->
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
              <span class="tracking-tight font-medium">EOI Responses</span>
            </a>

            <!-- 2. Sanction Order Section -->
            <a
              routerLink="/admin/sanction-orders"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="tracking-tight font-medium">Sanction Order</span>
            </a>

            <!-- 3. SDC Approvals -->
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

            <!-- 4. Batch Approvals -->
            <a
              routerLink="/admin/batch-approvals"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span class="tracking-tight font-medium">Batch Approvals</span>
            </a>

            <!-- 5. Grievance Management -->
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

            <!-- 6. Camera Monitoring -->
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
            <!-- ================================================================
                 ROLE: EXISTING USER
                 ================================================================ -->
            <!-- 1. Active Schemes -->
            <a
              routerLink="/tenders"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="tracking-tight">Active Schemes</span>
            </a>

            <!-- 2. Tender Status -->
            <a
              routerLink="/tender-status"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="tracking-tight">Tender Status</span>
            </a>

            <!-- 3. Sanction Order -->
            <a
              routerLink="/tp/sanction-orders"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span class="tracking-tight">Sanction Order</span>
            </a>

            <!-- 4. IPA -->
            <a
              routerLink="/ipa"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="tracking-tight">IPA</span>
            </a>

            <!-- 5. SDC Management -->
            <a
              routerLink="/sdcs"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="tracking-tight">SDC Management</span>
            </a>

            <!-- 6. Batch Management -->
            <a
              routerLink="/batches"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="tracking-tight">Batch Management</span>
            </a>

            <!-- 7. Aspirants Management -->
            <a
              routerLink="/aspirants"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span class="tracking-tight">Aspirants Management</span>
            </a>

            <!-- 8. Grievance -->
            <a
              routerLink="/grievance"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="tracking-tight">Grievance</span>
            </a>

            <!-- 9. Profile -->
            <a
              routerLink="/profile"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="tracking-tight">Profile</span>
              </div>
              @if (isProfilePending()) {
                <span class="px-2 py-0.5 rounded-full text-[11px] leading-tight shrink-0 inline-flex items-center gap-1.5 transition-all select-none bg-amber-50 text-[#C2410C] border border-amber-300 font-semibold shadow-2xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0 animate-pulse"></span>
                  Pending
                </span>
              }
            </a>
          } @else {
            <!-- ================================================================
                 ROLE: NEW USER / STANDARD
                 ================================================================ -->
            <!-- 1. Active Schemes -->
            <a
              routerLink="/tenders"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="tracking-tight">Active Schemes</span>
            </a>

            <!-- 2. Profile -->
            <a
              routerLink="/profile"
              routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-medium border border-[#D9E1E7]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center justify-between px-3 py-2 rounded-[4px] text-[13px] leading-[20px] text-[#5F6B76] hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 shrink-0 text-[#7A8792] group-hover:text-[#174A6E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="tracking-tight">Profile</span>
              </div>
              @if (isProfilePending()) {
                <span class="px-2 py-0.5 rounded-full text-[11px] leading-tight shrink-0 inline-flex items-center gap-1.5 transition-all select-none bg-amber-50 text-[#C2410C] border border-amber-300 font-semibold shadow-2xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0 animate-pulse"></span>
                  Pending
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

  readonly isSuperAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'super_admin';
  });

  readonly isProfilePending = computed(() => {
    const user = this.currentUser();
    return user?.role === 'new_user' || user?.isProfileComplete === false;
  });

  readonly isMasterOpen = signal<boolean>(true);
  readonly isUserManagementOpen = signal<boolean>(true);

  @Output() linkClicked = new EventEmitter<void>();
  @Output() closeMobileNav = new EventEmitter<void>();

  toggleMaster(): void {
    this.isMasterOpen.update((v: boolean) => !v);
  }

  toggleUserManagement(): void {
    this.isUserManagementOpen.update((v: boolean) => !v);
  }

  onNavClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('a')) {
      this.linkClicked.emit();
    }
  }
}
