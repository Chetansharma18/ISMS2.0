import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside 
      class="w-64 bg-white border-r border-slate-200 flex flex-col h-full font-sans text-xs shrink-0 select-none shadow-2xs transition-all duration-300 z-40"
      [ngClass]="{ 'hidden md:flex': !isOpen, 'fixed inset-y-0 left-0 flex md:relative': isOpen }">
      
      <!-- Top Brand Header inside Sidebar -->
      <div class="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-full bg-[#002244] text-amber-300 flex items-center justify-center font-black text-xs shadow-xs shrink-0">
            🏛
          </div>
          <div class="leading-tight min-w-0">
            <span class="text-[12px] font-extrabold text-[#002244] tracking-tight block truncate">ISMS 2.0 Governance</span>
            <span class="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.2 rounded-2xs mt-0.5">
              <span>★ State Super Admin</span>
            </span>
          </div>
        </div>

        <button 
          type="button"
          (click)="closeSidebar.emit()"
          class="md:hidden p-1.5 rounded-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Close Navigation Menu">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Navigation Links Container -->
      <nav class="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 text-xs font-medium min-h-0">
        
        <!-- DASHBOARD (Commented out per request) -->
        <!--
        <a 
          routerLink="/admin/dashboard" 
          routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-[3.5px] border-[#002244]"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="onNavigate()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-semibold border-l-[3.5px] border-transparent group">
          <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors">dashboard</span>
          <span>DASHBOARD</span>
        </a>
        -->

        <!-- MASTERS (Collapsible Accordion) -->
        <div>
          <button 
            type="button"
            (click)="toggleSection('masters')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer border-l-[3.5px]"
            [ngClass]="mastersOpen() ? 'text-[#002244] font-bold bg-slate-50 border-[#002244]/40' : 'border-transparent'">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors" [ngClass]="mastersOpen() ? 'text-[#002244]' : ''">database</span>
              <span>MASTERS</span>
            </div>
            <span class="material-symbols-outlined text-[16px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': mastersOpen() }">
              expand_more
            </span>
          </button>

          <!-- 16 Master Sub-items -->
          <div *ngIf="mastersOpen()" class="pl-7 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 ml-5 my-1 text-[11px]">
            <a routerLink="/admin/masters/schemes" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Scheme Master</a>
            <a routerLink="/admin/masters/scheme-categories" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Scheme Category Master</a>
            <a routerLink="/admin/masters/eoi-categories" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Category Master</a>
            <a routerLink="/admin/masters/departments" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Department Master</a>
            <a routerLink="/admin/masters/organization-types" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Organization Type Master</a>
            <a routerLink="/admin/masters/user-types" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">User Type Master</a>
            <a routerLink="/admin/masters/designations" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Designation Master</a>
            <a routerLink="/admin/masters/states" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">State Master</a>
            <a routerLink="/admin/masters/districts" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">District Master</a>
            <a routerLink="/admin/masters/blocks" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Block Master</a>
            <a routerLink="/admin/masters/document-types" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Document Type Master</a>
            <a routerLink="/admin/masters/transactions" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Transaction Master</a>
            <a routerLink="/admin/masters/fees" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Fee Master</a>
            <a routerLink="/admin/masters/roles" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Role Master</a>
            <a routerLink="/admin/masters/access-levels" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Access Level Master</a>
            <a routerLink="/admin/masters/application-status" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Application Status Master</a>
            <a routerLink="/admin/masters/committee-roles" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Committee Role Master</a>
          </div>
        </div>

        <!-- EOI MANAGEMENT (Collapsible Accordion) -->
        <div>
          <button 
            type="button"
            (click)="toggleSection('eoi')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer border-l-[3.5px]"
            [ngClass]="eoiOpen() ? 'text-[#002244] font-bold bg-slate-50 border-[#002244]/40' : 'border-transparent'">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors" [ngClass]="eoiOpen() ? 'text-[#002244]' : ''">assignment</span>
              <span>EOI MANAGEMENT</span>
            </div>
            <span class="material-symbols-outlined text-[16px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': eoiOpen() }">
              expand_more
            </span>
          </button>

          <div *ngIf="eoiOpen()" class="pl-7 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 ml-5 my-1 text-[11px]">
            <a routerLink="/admin/eoi" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">All EOI</a>
            <!--
            <a routerLink="/admin/eoi/create" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">+ Create EOI</a>
            <a routerLink="/admin/masters/eoi-categories" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Categories</a>
            <a routerLink="/admin/eoi/EOI-2025-001/form-builder" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Form Builder</a>
            <a routerLink="/admin/masters/document-types" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Documents</a>
            <a routerLink="/admin/masters/transactions" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Transactions</a>
            <a routerLink="/admin/masters/fees" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Fees</a>
            <a routerLink="/admin/eoi/EOI-2025-002/responses" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Responses</a>
            <a routerLink="/admin/eoi/EOI-2025-001/amendments" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Corrigendum &amp; Amendments</a>
            <a routerLink="/admin/eoi/EOI-2025-001/reschedule" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Reschedule EOI</a>
            <a routerLink="/admin/eoi/EOI-2025-001/history" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI History &amp; Versions</a>
            -->
          </div>
        </div>

        <!-- COMMITTEE MANAGEMENT (Collapsible Accordion) -->
        <div>
          <button 
            type="button"
            (click)="toggleSection('committee')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer border-l-[3.5px]"
            [ngClass]="committeeOpen() ? 'text-[#002244] font-bold bg-slate-50 border-[#002244]/40' : 'border-transparent'">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors" [ngClass]="committeeOpen() ? 'text-[#002244]' : ''">groups</span>
              <span>COMMITTEE MGMT</span>
            </div>
            <span class="material-symbols-outlined text-[16px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': committeeOpen() }">
              expand_more
            </span>
          </button>

          <div *ngIf="committeeOpen()" class="pl-7 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 ml-5 my-1 text-[11px]">
            <a routerLink="/admin/committees" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Committee List</a>
            <a routerLink="/admin/committees/create" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">+ Create Committee</a>
            <a routerLink="/admin/eoi/committee-assign" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">EOI Committee Assignment</a>
          </div>
        </div>

        <!-- USER MANAGEMENT (Collapsible Accordion) -->
        <div>
          <button 
            type="button"
            (click)="toggleSection('users')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer border-l-[3.5px]"
            [ngClass]="usersOpen() ? 'text-[#002244] font-bold bg-slate-50 border-[#002244]/40' : 'border-transparent'">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors" [ngClass]="usersOpen() ? 'text-[#002244]' : ''">manage_accounts</span>
              <span>USER MANAGEMENT</span>
            </div>
            <span class="material-symbols-outlined text-[16px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': usersOpen() }">
              expand_more
            </span>
          </button>

          <div *ngIf="usersOpen()" class="pl-7 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 ml-5 my-1 text-[11px]">
            <a routerLink="/admin/users" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">User List</a>
            <a routerLink="/admin/users/create" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">+ Create User</a>
            <a routerLink="/admin/masters/roles" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Roles</a>
            <a routerLink="/admin/masters/access-levels" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">Access Levels</a>
            <a routerLink="/admin/users" [queryParams]="{ filter: 'sso' }" routerLinkActive="text-[#002244] font-bold bg-[#002244]/10" (click)="onNavigate()" class="block py-1.5 px-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-[#002244]/5 transition-colors">SSO Mapping</a>
          </div>
        </div>

        <!-- APPLICATIONS -->
        <a 
          routerLink="/admin/applications" 
          routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-[3.5px] border-[#002244]"
          (click)="onNavigate()"
          class="flex items-center justify-between px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-semibold border-l-[3.5px] border-transparent group">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors">inventory</span>
            <span>APPLICATIONS</span>
          </div>
          <span class="bg-[#002244] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">42</span>
        </a>

        <!-- REPORTS -->
        <a 
          routerLink="/admin/reports" 
          routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-[3.5px] border-[#002244]"
          (click)="onNavigate()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-semibold border-l-[3.5px] border-transparent group">
          <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors">analytics</span>
          <span>REPORTS</span>
        </a>

        <!-- AUDIT LOGS -->
        <a 
          routerLink="/admin/audit-logs" 
          routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-[3.5px] border-[#002244]"
          (click)="onNavigate()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-semibold border-l-[3.5px] border-transparent group">
          <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors">fact_check</span>
          <span>AUDIT LOGS</span>
        </a>

        <!-- SETTINGS -->
        <a 
          routerLink="/admin/settings" 
          routerLinkActive="bg-[#002244]/10 text-[#002244] font-bold border-l-[3.5px] border-[#002244]"
          (click)="onNavigate()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xs text-slate-700 hover:bg-slate-100 hover:text-[#002244] transition-all font-semibold border-l-[3.5px] border-transparent group">
          <span class="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-[#002244] transition-colors">settings</span>
          <span>SETTINGS</span>
        </a>

      </nav>

      <!-- Bottom Session Info -->
      <div class="p-3 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-600">
        <div class="flex items-center justify-between mb-1">
          <span class="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Secured Session
          </span>
          <span class="text-slate-400 text-[10px] font-mono">TLS 1.3</span>
        </div>
        <p class="truncate text-[10.5px] text-slate-500 font-mono">SSO: RAJ_GOV_ADMIN_01</p>
      </div>

    </aside>
  `
})
export class AdminSidebarComponent {
  @Input() isOpen: boolean = true;
  @Output() closeSidebar = new EventEmitter<void>();

  mastersOpen = signal<boolean>(false);
  eoiOpen = signal<boolean>(true);
  committeeOpen = signal<boolean>(false);
  usersOpen = signal<boolean>(false);

  toggleSection(section: 'masters' | 'eoi' | 'committee' | 'users'): void {
    if (section === 'masters') this.mastersOpen.update(v => !v);
    if (section === 'eoi') this.eoiOpen.update(v => !v);
    if (section === 'committee') this.committeeOpen.update(v => !v);
    if (section === 'users') this.usersOpen.update(v => !v);
  }

  onNavigate(): void {
    if (window.innerWidth < 768) {
      this.closeSidebar.emit();
    }
  }
}
