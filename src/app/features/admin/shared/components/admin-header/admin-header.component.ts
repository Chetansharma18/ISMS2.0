import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService, Language } from '../../../../../core/services/language.service';

export type FontSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="w-full bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border-b border-slate-200/60 font-sans sticky top-0 z-40 select-none">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4 min-h-[72px]">
        
        <!-- Left: Dual Government Emblems & Portal Title -->
        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
          <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0 cursor-pointer group" routerLink="/admin/dashboard">
            <!-- Official Ashoka Lion Capital Emblem of India -->
            <div class="shrink-0 w-9 h-11 sm:w-11 sm:h-14 flex items-center justify-center transition-transform group-hover:scale-105">
              <img 
                src="emblem-new.png" 
                alt="Government of Rajasthan - State Emblem of India"
                class="h-full w-auto object-contain select-none" 
              />
            </div>

            <!-- Official RSLDC Circular Emblem -->
            <div class="shrink-0 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition-transform group-hover:scale-105">
              <img 
                src="rsldc-logo.png" 
                alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
                class="h-full w-full object-contain select-none drop-shadow-sm" 
              />
            </div>

            <!-- Department Text Block -->
            <div class="text-left flex flex-col justify-center min-w-0 ml-1">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-[11px] sm:text-[13px] font-black text-[#002244] uppercase tracking-wide leading-tight whitespace-nowrap">
                  Government of Rajasthan
                </span>
                <span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-sm text-[9.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                  Super Admin
                </span>
              </div>
              <div class="text-[10px] sm:text-[12px] font-bold text-[#002244] leading-tight whitespace-nowrap">
                Skill, Employment &amp; Entrepreneurship Department
              </div>
              <div class="text-[9.5px] sm:text-[11px] text-slate-500 font-semibold whitespace-nowrap hidden xs:block mt-0.5">
                Rajasthan Skill and Livelihoods Development Corporation (RSLDC)
              </div>
            </div>

            <!-- Thin Vertical Divider Line -->
            <div class="hidden lg:block h-10 w-[1.5px] bg-slate-200 mx-3 shrink-0"></div>

            <!-- System Branding: ISMS 2.0 Administration Portal -->
            <div class="hidden lg:flex text-left flex-col justify-center shrink-0">
              <div class="flex items-baseline leading-none mb-0.5">
                <span class="text-2xl sm:text-[26px] font-black text-[#002244] tracking-tight drop-shadow-sm">ISMS</span>
                <span class="text-2xl sm:text-[26px] font-black text-[#f59e0b] ml-1 drop-shadow-sm">2.0</span>
              </div>
              <div class="text-[10.5px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Central Administration
              </div>
            </div>
          </div>
        </div>

        <!-- Right Utilities: Accessibility, Language, Notifications, Quick Help & Super Admin Profile -->
        <div class="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
          
          <!-- Font Sizing: A- A A+ -->
          <div class="hidden lg:flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-md p-1 shadow-sm">
            <button 
              type="button" 
              (click)="setFontSize('sm')"
              [ngClass]="fontSize() === 'sm' ? 'bg-white font-extrabold text-[#002244] shadow-sm rounded-sm' : 'text-slate-600'"
              class="hover:text-[#002244] text-[11px] px-2 py-0.5 transition cursor-pointer"
              title="Decrease text size (A-)">
              A-
            </button>
            <button 
              type="button" 
              (click)="setFontSize('md')"
              [ngClass]="fontSize() === 'md' ? 'bg-white font-extrabold text-[#002244] shadow-sm rounded-sm' : 'text-slate-600'"
              class="hover:text-[#002244] text-xs px-2 py-0.5 transition cursor-pointer"
              title="Standard text size (A)">
              A
            </button>
            <button 
              type="button" 
              (click)="setFontSize('lg')"
              [ngClass]="fontSize() === 'lg' ? 'bg-white font-extrabold text-[#002244] shadow-sm rounded-sm' : 'text-slate-600'"
              class="hover:text-[#002244] text-xs font-semibold px-2 py-0.5 transition cursor-pointer"
              title="Increase text size (A+)">
              A+
            </button>
          </div>

          <span class="hidden lg:block w-[1px] h-6 bg-slate-200"></span>

          <!-- Language Switcher: English | हिंदी -->
          <div class="hidden sm:flex items-center space-x-2 text-xs font-semibold">
            <button 
              (click)="setLanguage('en')" 
              [ngClass]="currentLanguage() === 'en' ? 'text-[#002244] border-b-2 border-[#002244]' : 'text-slate-500 border-b-2 border-transparent hover:text-slate-700'" 
              class="pb-1 transition cursor-pointer uppercase tracking-wider text-[11px]">
              Eng
            </button>
            <button 
              (click)="setLanguage('hi')" 
              [ngClass]="currentLanguage() === 'hi' ? 'text-[#002244] border-b-2 border-[#002244]' : 'text-slate-500 border-b-2 border-transparent hover:text-slate-700'" 
              class="pb-1 transition cursor-pointer uppercase tracking-wider text-[11px]">
              हिंदी
            </button>
          </div>

          <span class="hidden sm:block w-[1px] h-6 bg-slate-200"></span>

          <!-- Quick Help Modal Toggle -->
          <button 
            type="button"
            (click)="showHelpModal.set(true)"
            class="p-2.5 rounded-full text-slate-500 hover:text-[#002244] hover:bg-slate-100 hover:shadow-sm transition-all cursor-pointer"
            title="Administrative System Help & Documentation">
            <span class="material-symbols-outlined text-[20px]">help</span>
          </button>

          <!-- Notifications Dropdown -->
          <div class="relative">
            <button 
              type="button"
              (click)="toggleNotifications()"
              class="p-2.5 rounded-full text-slate-500 hover:text-[#002244] hover:bg-slate-100 hover:shadow-sm transition-all relative cursor-pointer"
              title="System Alerts & Intimations">
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white animate-pulse"></span>
            </button>

            <!-- Notifications Popover -->
            <div 
              *ngIf="notificationsOpen()" 
              class="absolute right-0 mt-3 w-80 sm:w-[400px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 py-2 z-50 animate-fade-in overflow-hidden">
              <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <h4 class="text-xs font-black text-[#002244] uppercase tracking-widest">Alerts</h4>
                <span class="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full shadow-sm">3 New Alerts</span>
              </div>
              <div class="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
                <div class="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3.5 cursor-pointer">
                  <div class="p-2 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    <span class="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  <div>
                    <p class="text-[13px] font-bold text-slate-800">EOI Closing Soon: RSLDC/EOI/2025-26/003</p>
                    <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">Closing on 15-04-2025 (29 applications received).</p>
                    <span class="text-[10px] font-semibold text-slate-400 mt-1.5 block uppercase tracking-wider">10 mins ago</span>
                  </div>
                </div>
                <div class="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3.5 cursor-pointer">
                  <div class="p-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    <span class="material-symbols-outlined text-[18px]">rate_review</span>
                  </div>
                  <div>
                    <p class="text-[13px] font-bold text-slate-800">Committee Evaluation Pending</p>
                    <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">State Skill Evaluation Committee has 18 proposals ready for final scoring.</p>
                    <span class="text-[10px] font-semibold text-slate-400 mt-1.5 block uppercase tracking-wider">2 hours ago</span>
                  </div>
                </div>
                <div class="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3.5 cursor-pointer">
                  <div class="p-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span class="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div>
                    <p class="text-[13px] font-bold text-slate-800">Corrigendum Published</p>
                    <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">Corrigendum-01 successfully attached and versioned to v1.1.</p>
                    <span class="text-[10px] font-semibold text-slate-400 mt-1.5 block uppercase tracking-wider">Yesterday</span>
                  </div>
                </div>
              </div>
              <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/80 text-center">
                <a routerLink="/admin/audit-logs" (click)="notificationsOpen.set(false)" class="text-xs font-bold text-[#002244] hover:text-[#003366] hover:underline transition-all">
                  View Full Audit Activity Log &rarr;
                </a>
              </div>
            </div>
          </div>

          <span class="w-[1px] h-6 bg-slate-200 ml-1 mr-1"></span>

          <!-- Super Admin Profile Dropdown -->
          <div class="relative">
            <button 
              type="button"
              (click)="toggleProfileMenu()"
              class="flex items-center gap-2 sm:gap-3 p-1.5 rounded-full hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
              
              <!-- Avatar Circle with Initial 'RS' -->
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#002244] to-[#003366] text-amber-300 border-2 border-white shadow-sm flex items-center justify-center font-black text-sm shrink-0">
                RS
              </div>

              <!-- Admin User Name & Designation -->
              <div class="text-left hidden md:block leading-tight">
                <div class="text-[13px] font-extrabold text-[#002244] truncate max-w-[180px] group-hover:text-[#003366] transition-colors" [title]="authService.currentUser().fullName">
                  {{ authService.currentUser().fullName }}
                </div>
                <div class="flex items-center justify-start gap-1 text-[11px] text-emerald-700 font-bold tracking-wide mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  RSLDC HQ
                </div>
              </div>

              <span class="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-[#002244] transition-colors pl-1">
                arrow_drop_down
              </span>
            </button>

            <!-- Dropdown Menu -->
            <div 
              *ngIf="profileMenuOpen()" 
              class="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 py-2 z-50 animate-fade-in overflow-hidden">
              <div class="px-5 py-4 border-b border-slate-100 bg-[#002244] text-white">
                <p class="text-sm font-black tracking-wide">{{ authService.currentUser().fullName }}</p>
                <p class="text-xs text-blue-200 font-medium mt-0.5 truncate">{{ authService.currentUser().email }}</p>
                <div class="mt-3 inline-block px-2 py-1 rounded-md bg-white/10 border border-white/20 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  SSO: {{ authService.currentUser().ssoId }}
                </div>
              </div>

              <div class="py-2">
                <a 
                  routerLink="/admin/settings" 
                  (click)="profileMenuOpen.set(false)"
                  class="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#002244] transition-colors">
                  <span class="material-symbols-outlined text-[18px] text-slate-400">person</span>
                  My Profile
                </a>
                <button 
                  type="button"
                  (click)="openChangePasswordModal()" 
                  class="w-full text-left flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#002244] transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[18px] text-slate-400">lock_reset</span>
                  Change Password
                </button>
                <a 
                  routerLink="/admin/audit-logs" 
                  (click)="profileMenuOpen.set(false)"
                  class="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#002244] transition-colors">
                  <span class="material-symbols-outlined text-[18px] text-slate-400">manage_history</span>
                  Audit Activity
                </a>
              </div>

              <div class="border-t border-slate-100 pt-2 pb-1">
                <button 
                  type="button"
                  (click)="handleLogout()" 
                  class="w-full text-left flex items-center gap-3 px-5 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                  Secure Logout
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Saffron / White / Green Accent Line at bottom for National Colors -->
      <div class="h-[3.5px] w-full flex">
        <div class="h-full bg-[#f59e0b] w-1/3"></div>
        <div class="h-full bg-white w-1/3 border-y border-slate-200/50"></div>
        <div class="h-full bg-emerald-600 w-1/3"></div>
      </div>
    </header>

    <!-- Help Modal -->
    <div *ngIf="showHelpModal()" class="fixed inset-0 z-[100] overflow-y-auto">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" (click)="showHelpModal.set(false)"></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden transform transition-all">
          <div class="flex items-center justify-between px-6 py-4 bg-[#002244] text-white">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[24px] text-amber-300">menu_book</span>
              <h3 class="font-black text-sm uppercase tracking-wider">Super Admin SOP Guidelines</h3>
            </div>
            <button (click)="showHelpModal.set(false)" class="text-slate-300 hover:text-white p-1 cursor-pointer transition-colors">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="px-6 py-6 text-[13px] text-slate-600 space-y-5 leading-relaxed">
            <div class="p-4 bg-blue-50/80 rounded-xl border-l-4 border-l-blue-600 text-blue-900 font-medium">
              <strong>Order of Operations:</strong> Master Data (Schemes, Categories, Fees, Document Types) must be verified before initializing any new EOI.
            </div>
            <p><strong class="text-slate-800">Rule 1 (Scheme Master):</strong> Active Scheme must be created prior to EOI generation.</p>
            <p><strong class="text-slate-800">Rule 2 (Dynamic Form Builder):</strong> Custom form fields define applicant input schema. Fields with historical submissions cannot be physically deleted; use archive instead.</p>
            <p><strong class="text-slate-800">Rule 3 (EOI Rescheduling):</strong> Rescheduling dates strictly mandates uploading an official Corrigendum or Amendment notification document.</p>
            <p><strong class="text-slate-800">Rule 4 (Response Visibility):</strong> In compliance with Government tender secrecy, applicant submissions remain sealed until official EOI closure.</p>
          </div>
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
            <button (click)="showHelpModal.set(false)" class="px-6 py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors">
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div *ngIf="showPasswordModal()" class="fixed inset-0 z-[100] overflow-y-auto">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" (click)="showPasswordModal.set(false)"></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all">
          <div class="flex items-center justify-between px-6 py-4 bg-[#002244] text-white">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[22px] text-amber-300">lock_reset</span>
              <h3 class="font-black text-sm uppercase tracking-wider">Change Password</h3>
            </div>
            <button (click)="showPasswordModal.set(false)" class="text-slate-300 hover:text-white p-1 cursor-pointer transition-colors">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="px-6 py-6 space-y-5">
            <div>
              <label class="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">Current Password *</label>
              <input type="password" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:bg-white focus:ring-2 focus:ring-[#002244] focus:border-[#002244] transition-all outline-hidden" placeholder="••••••••••••" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">New Secure Password *</label>
              <input type="password" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:bg-white focus:ring-2 focus:ring-[#002244] focus:border-[#002244] transition-all outline-hidden" placeholder="Minimum 8 characters with symbols" />
            </div>
            <div>
              <label class="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">Confirm New Password *</label>
              <input type="password" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:bg-white focus:ring-2 focus:ring-[#002244] focus:border-[#002244] transition-all outline-hidden" placeholder="Re-enter new password" />
            </div>
          </div>
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button (click)="showPasswordModal.set(false)" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
              Cancel
            </button>
            <button (click)="saveNewPassword()" class="px-5 py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminHeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AdminAuthService);
  toastService = inject(ToastService);
  languageService = inject(LanguageService);
  router = inject(Router);

  fontSize = signal<FontSize>('md');
  currentLanguage = this.languageService.currentLanguage;

  notificationsOpen = signal<boolean>(false);
  profileMenuOpen = signal<boolean>(false);
  showHelpModal = signal<boolean>(false);
  showPasswordModal = signal<boolean>(false);

  setFontSize(size: FontSize): void {
    this.fontSize.set(size);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('text-size-sm', 'text-size-md', 'text-size-lg');
      root.classList.add(`text-size-${size}`);
    }
  }

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update(v => !v);
    this.profileMenuOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(v => !v);
    this.notificationsOpen.set(false);
  }

  openChangePasswordModal(): void {
    this.profileMenuOpen.set(false);
    this.showPasswordModal.set(true);
  }

  saveNewPassword(): void {
    this.showPasswordModal.set(false);
    this.toastService.success('Password Changed', 'Super Admin credential updated successfully.');
  }

  handleLogout(): void {
    this.profileMenuOpen.set(false);
    this.toastService.info('Session Ended', 'Logged out of Super Admin Portal.');
    this.router.navigate(['/auth/login']);
  }
}
