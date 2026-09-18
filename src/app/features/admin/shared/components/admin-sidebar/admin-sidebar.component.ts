import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EoiService } from '../../../core/services/eoi.service';

@Component({
  selector: 'admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside 
      class="w-[270px] bg-white border-r border-slate-200/80 flex flex-col h-full font-sans text-xs shrink-0 select-none shadow-[4px_0_24px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 z-40 relative"
      [ngClass]="{ 'hidden lg:flex': !isOpen, 'fixed inset-y-0 left-0 flex lg:relative': isOpen }">
      
      <!-- Top Brand Header inside Sidebar -->
      <div class="p-4 bg-[#002244] flex items-center justify-between shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-white/5 bg-no-repeat bg-right-bottom opacity-10 blur-[1px]"></div>
        
        <div class="flex items-center gap-3 min-w-0 relative z-10">
          <div class="w-10 h-10 rounded-lg bg-white/10 border border-white/20 text-amber-300 flex items-center justify-center font-black text-sm shadow-sm shrink-0 backdrop-blur-sm">
            🏛
          </div>
          <div class="leading-tight min-w-0">
            <span class="text-[13px] font-black text-white tracking-wide block truncate uppercase">ISMS 2.0 Gov</span>
            <span class="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-300 bg-black/20 border border-amber-300/30 px-1.5 py-0.5 rounded-sm mt-1 uppercase tracking-wider">
              <span>★ State Admin</span>
            </span>
          </div>
        </div>

        <button 
          type="button"
          (click)="closeSidebar.emit()"
          class="lg:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
          title="Close Navigation Menu">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Navigation Links Container -->
      <nav class="flex-1 overflow-y-auto px-3 py-5 space-y-1.5 text-xs font-semibold min-h-0 bg-slate-50/30">
        
        <!-- DASHBOARD (Commented out per request) -->
        <!--
        <a 
          routerLink="/admin/dashboard" 
          routerLinkActive="bg-[#002244] text-white shadow-md font-bold"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="onNavigate()"
          class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all cursor-pointer group">
          <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">dashboard</span>
          <span class="uppercase tracking-wide">DASHBOARD</span>
        </a>
        -->

        <!-- MASTERS (Collapsible Accordion) -->
        <div class="rounded-lg overflow-hidden transition-all" [ngClass]="mastersOpen() ? 'bg-slate-100/80 border border-slate-200/60 shadow-sm' : ''">
          <button 
            type="button"
            (click)="toggleSection('masters')"
            class="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer"
            [ngClass]="mastersOpen() ? 'text-[#002244] font-bold bg-white shadow-sm' : ''">
            <div class="flex items-center gap-3.5">
              <span class="material-symbols-outlined text-[20px] transition-colors" [ngClass]="mastersOpen() ? 'text-[#002244]' : 'text-slate-400 group-hover:text-[#002244]'">database</span>
              <span class="uppercase tracking-wide">MASTERS</span>
            </div>
            <span class="material-symbols-outlined text-[18px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': mastersOpen() }">
              expand_more
            </span>
          </button>

          <!-- Master Sub-items -->
          <div *ngIf="mastersOpen()" class="px-2 py-2 space-y-1 text-[11px] bg-slate-100/50">
            <a routerLink="/admin/masters/schemes" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">Scheme Master</a>
            <a routerLink="/admin/masters/eoi-categories" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">EOI Category Master</a>
            <a routerLink="/admin/masters/departments" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">Department Master</a>
          </div>
        </div>

        <!-- EOI MANAGEMENT (Collapsible Accordion) -->
        <div class="rounded-lg overflow-hidden transition-all" [ngClass]="eoiOpen() ? 'bg-slate-100/80 border border-slate-200/60 shadow-sm' : ''">
          <button 
            type="button"
            (click)="toggleSection('eoi')"
            class="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer"
            [ngClass]="eoiOpen() ? 'text-[#002244] font-bold bg-white shadow-sm' : ''">
            <div class="flex items-center gap-3.5">
              <span class="material-symbols-outlined text-[20px] transition-colors" [ngClass]="eoiOpen() ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-600'">assignment</span>
              <span class="uppercase tracking-wide">EOI MANAGEMENT</span>
            </div>
            <span class="material-symbols-outlined text-[18px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': eoiOpen() }">
              expand_more
            </span>
          </button>

          <div *ngIf="eoiOpen()" class="px-2 py-2 space-y-1 text-[11px] bg-slate-100/50">
            <a routerLink="/admin/eoi" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all relative">EOI Configure <span class="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-amber-500"></span></a>
            <a routerLink="/admin/eoi/create" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">+ Create New EOI</a>
            <a routerLink="/admin/eoi/EOI-2025-002/responses" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">EOI Responses</a>
          </div>
        </div>

        <!-- COMMITTEE MANAGEMENT (Collapsible Accordion) -->
        <div class="rounded-lg overflow-hidden transition-all" [ngClass]="committeeOpen() ? 'bg-slate-100/80 border border-slate-200/60 shadow-sm' : ''">
          <button 
            type="button"
            (click)="toggleSection('committee')"
            class="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer"
            [ngClass]="committeeOpen() ? 'text-[#002244] font-bold bg-white shadow-sm' : ''">
            <div class="flex items-center gap-3.5">
              <span class="material-symbols-outlined text-[20px] transition-colors" [ngClass]="committeeOpen() ? 'text-[#002244]' : 'text-slate-400 group-hover:text-[#002244]'">groups</span>
              <span class="uppercase tracking-wide">COMMITTEE MGMT</span>
            </div>
            <span class="material-symbols-outlined text-[18px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': committeeOpen() }">
              expand_more
            </span>
          </button>

          <div *ngIf="committeeOpen()" class="px-2 py-2 space-y-1 text-[11px] bg-slate-100/50">
            <a routerLink="/admin/committees" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">Committee List</a>
            <a routerLink="/admin/committees/create" routerLinkActive="text-white font-bold bg-[#002244] shadow-md" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">+ Create Committee</a>
            <a routerLink="/admin/eoi/committee-assign" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">EOI Committee Assignment</a>
          </div>
        </div>

        <!-- USER MANAGEMENT (Collapsible Accordion) -->
        <div class="rounded-lg overflow-hidden transition-all" [ngClass]="usersOpen() ? 'bg-slate-100/80 border border-slate-200/60 shadow-sm' : ''">
          <button 
            type="button"
            (click)="toggleSection('users')"
            class="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all group cursor-pointer"
            [ngClass]="usersOpen() ? 'text-[#002244] font-bold bg-white shadow-sm' : ''">
            <div class="flex items-center gap-3.5">
              <span class="material-symbols-outlined text-[20px] transition-colors" [ngClass]="usersOpen() ? 'text-[#002244]' : 'text-slate-400 group-hover:text-[#002244]'">manage_accounts</span>
              <span class="uppercase tracking-wide">USER MANAGEMENT</span>
            </div>
            <span class="material-symbols-outlined text-[18px] transition-transform duration-200 text-slate-400 group-hover:text-[#002244]" [ngClass]="{ 'rotate-180': usersOpen() }">
              expand_more
            </span>
          </button>

          <div *ngIf="usersOpen()" class="px-2 py-2 space-y-1 text-[11px] bg-slate-100/50">
            <a routerLink="/admin/users" routerLinkActive="text-[#002244] font-bold bg-white shadow-sm border border-slate-200" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">User List</a>
            <a routerLink="/admin/users/create" routerLinkActive="text-white font-bold bg-[#002244] shadow-md" (click)="onNavigate()" class="block py-2 px-3 rounded-md text-slate-600 hover:text-[#002244] hover:bg-white transition-all">+ Create User</a>
          </div>
        </div>

        <div class="h-4"></div> <!-- Spacer -->

        <!-- APPLICATIONS -->
        <a 
          routerLink="/admin/applications" 
          routerLinkActive="bg-[#002244] text-white shadow-md font-bold"
          (click)="onNavigate()"
          class="flex items-center justify-between px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all cursor-pointer group border border-transparent">
          <div class="flex items-center gap-3.5">
            <span class="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-[#002244] transition-colors">inventory</span>
            <span class="uppercase tracking-wide">APPLICATIONS</span>
          </div>
          <span class="bg-[#f59e0b] text-[#002244] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">{{ appCount() }}</span>
        </a>

        <!-- REPORTS -->
        <a 
          routerLink="/admin/reports" 
          routerLinkActive="bg-[#002244] text-white shadow-md font-bold"
          (click)="onNavigate()"
          class="flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all cursor-pointer group border border-transparent">
          <span class="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-[#002244] transition-colors">analytics</span>
          <span class="uppercase tracking-wide">REPORTS</span>
        </a>

        <!-- AUDIT LOGS -->
        <a 
          routerLink="/admin/audit-logs" 
          routerLinkActive="bg-[#002244] text-white shadow-md font-bold"
          (click)="onNavigate()"
          class="flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all cursor-pointer group border border-transparent">
          <span class="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-[#002244] transition-colors">fact_check</span>
          <span class="uppercase tracking-wide">AUDIT LOGS</span>
        </a>

        <!-- SETTINGS -->
        <a 
          routerLink="/admin/settings" 
          routerLinkActive="bg-[#002244] text-white shadow-md font-bold"
          (click)="onNavigate()"
          class="flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#002244] transition-all cursor-pointer group border border-transparent">
          <span class="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-[#002244] transition-colors">settings</span>
          <span class="uppercase tracking-wide">SETTINGS</span>
        </a>

      </nav>

      <!-- Bottom Session Info -->
      <div class="p-4 border-t border-slate-200/80 bg-slate-50 text-[11px] text-slate-600 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.02)]">
        <div class="flex items-center justify-between mb-2">
          <span class="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wide">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Secured Session
          </span>
          <span class="text-slate-400 text-[9px] font-black tracking-widest bg-slate-200 px-1.5 py-0.5 rounded-sm">TLS 1.3</span>
        </div>
        <p class="truncate text-[10.5px] text-slate-500 font-bold tracking-wide">SSO: RAJ_GOV_ADMIN_01</p>
      </div>

    </aside>
  `
})
export class AdminSidebarComponent implements OnInit {
  @Input() isOpen: boolean = true;
  @Output() closeSidebar = new EventEmitter<void>();

  mastersOpen = signal<boolean>(false);
  eoiOpen = signal<boolean>(true);
  committeeOpen = signal<boolean>(false);
  usersOpen = signal<boolean>(false);
  appCount = signal<number>(0);

  private eoiService = inject(EoiService);

  ngOnInit(): void {
    this.eoiService.getAllApplications().subscribe(apps => this.appCount.set(apps.length));
  }

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
