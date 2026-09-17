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
    <header class="w-full bg-white border-b border-[#D9E1E8] shadow-none font-sans sticky top-0 z-40 select-none">
      <div class="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-4 min-h-[72px]">
        
        <!-- Left: Sidebar Toggle, Dual Government Emblems & Portal Title -->
        <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <!-- Sidebar Mobile & Desktop Toggle Button -->
          <button 
            type="button"
            (click)="toggleSidebar.emit()"
            class="p-2 rounded-[6px] text-[#0B3558] hover:bg-slate-100 transition-colors border border-[#D9E1E8] cursor-pointer shrink-0"
            title="Toggle Navigation Menu">
            <span class="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <!-- Dual Emblems & Branding -->
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer" routerLink="/admin/dashboard">
            <!-- Official Ashoka Lion Capital Emblem of India -->
            <div class="shrink-0 w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center">
              <img 
                src="emblem-new.png" 
                alt="Government of Rajasthan - State Emblem of India"
                class="h-full w-auto object-contain select-none" 
              />
            </div>

            <!-- Official RSLDC Circular Emblem -->
            <div class="shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              <img 
                src="rsldc-logo.png" 
                alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
                class="h-full w-full object-contain select-none drop-shadow-2xs" 
              />
            </div>

            <!-- Department Text Block -->
            <div class="text-left flex flex-col justify-center min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[10px] sm:text-[12px] font-bold text-[#0B3558] leading-[1.2] whitespace-nowrap">
                  Government of Rajasthan
                </span>
                <span class="hidden sm:inline-flex items-center px-2 py-0.2 rounded-[4px] text-[9.5px] font-bold bg-[#EEF3F7] text-[#0B3558] border border-[#D9E1E8]">
                  SUPER ADMIN
                </span>
              </div>
              <div class="text-[9.5px] sm:text-[11.5px] font-bold text-[#0B3558] leading-[1.2] whitespace-nowrap">
                Skill, Employment &amp; Entrepreneurship Department
              </div>
              <div class="text-[9px] sm:text-[11px] text-[#5F6F7E] font-medium whitespace-nowrap hidden xs:block">
                Rajasthan Skill and Livelihoods Development Corporation (RSLDC)
              </div>
            </div>

            <!-- Thin Vertical Divider Line -->
            <div class="hidden md:block h-9 w-[1.5px] bg-[#D9E1E8] mx-1 shrink-0"></div>

            <!-- System Branding: ISMS 2.0 Administration Portal -->
            <div class="hidden md:flex text-left flex-col justify-center shrink-0">
              <div class="flex items-baseline leading-none">
                <span class="text-xl sm:text-2xl font-bold text-[#0B3558] tracking-tight">ISMS</span>
                <span class="text-xl sm:text-2xl font-bold text-[#F4A300] ml-1">2.0</span>
              </div>
              <div class="text-[10.5px] text-[#5F6F7E] font-medium tracking-tight mt-0.5">
                Central Administration Portal
              </div>
            </div>
          </div>
        </div>

        <!-- Right Utilities: Accessibility, Language, Notifications, Quick Help & Super Admin Profile -->
        <div class="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          
          <!-- Font Sizing: A- A A+ -->
          <div class="hidden lg:flex items-center space-x-1.5 text-slate-700">
            <button 
              type="button" 
              (click)="setFontSize('sm')"
              [ngClass]="fontSize() === 'sm' ? 'font-extrabold text-[#002244] underline' : ''"
              class="hover:text-blue-700 text-[11px] px-1 transition cursor-pointer"
              title="Decrease text size (A-)">
              A-
            </button>
            <button 
              type="button" 
              (click)="setFontSize('md')"
              [ngClass]="fontSize() === 'md' ? 'font-extrabold text-[#002244] underline' : ''"
              class="hover:text-blue-700 text-xs px-1 transition cursor-pointer"
              title="Standard text size (A)">
              A
            </button>
            <button 
              type="button" 
              (click)="setFontSize('lg')"
              [ngClass]="fontSize() === 'lg' ? 'font-extrabold text-[#002244] underline' : ''"
              class="hover:text-blue-700 text-xs font-semibold px-1 transition cursor-pointer"
              title="Increase text size (A+)">
              A+
            </button>
          </div>

          <span class="hidden lg:block text-slate-300">|</span>

          <!-- Language Switcher: English | हिंदी -->
          <div class="hidden sm:flex items-center space-x-1 sm:space-x-1.5 text-xs">
            <button 
              (click)="setLanguage('en')" 
              [ngClass]="currentLanguage() === 'en' ? 'text-[#002244] font-bold' : 'text-slate-600'" 
              class="hover:text-blue-700 transition cursor-pointer">
              English
            </button>
            <span class="text-slate-300">|</span>
            <button 
              (click)="setLanguage('hi')" 
              [ngClass]="currentLanguage() === 'hi' ? 'text-[#002244] font-bold' : 'text-slate-600'" 
              class="hover:text-blue-700 transition cursor-pointer">
              हिंदी
            </button>
          </div>

          <span class="hidden sm:block text-slate-300">|</span>

          <!-- Quick Help Modal Toggle -->
          <button 
            type="button"
            (click)="showHelpModal.set(true)"
            class="p-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            title="Administrative System Help & Documentation">
            <span class="material-symbols-outlined text-[20px]">help_outline</span>
          </button>

          <!-- Notifications Dropdown -->
          <div class="relative">
            <button 
              type="button"
              (click)="toggleNotifications()"
              class="p-2 rounded-xs text-slate-600 hover:text-[#002244] hover:bg-slate-100 transition-colors border border-slate-200 relative cursor-pointer"
              title="System Alerts & Intimations">
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
            </button>

            <!-- Notifications Popover -->
            <div 
              *ngIf="notificationsOpen()" 
              class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <h4 class="text-xs font-bold text-[#002244] uppercase tracking-wider">Administrative Alerts</h4>
                <span class="text-[11px] font-semibold text-[#002244] bg-[#002244]/10 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div class="max-h-72 overflow-y-auto divide-y divide-slate-100">
                <div class="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                  <span class="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">schedule</span>
                  <div>
                    <p class="text-xs font-semibold text-slate-800">EOI Closing Soon: RSLDC/EOI/2025-26/003</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Closing on 15-04-2025 (29 applications received).</p>
                    <span class="text-[10px] text-slate-400">10 mins ago</span>
                  </div>
                </div>
                <div class="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                  <span class="material-symbols-outlined text-[#002244] text-[20px] mt-0.5">rate_review</span>
                  <div>
                    <p class="text-xs font-semibold text-slate-800">Committee Evaluation Pending</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">State Skill Evaluation Committee has 18 proposals ready for final scoring.</p>
                    <span class="text-[10px] text-slate-400">2 hours ago</span>
                  </div>
                </div>
                <div class="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                  <span class="material-symbols-outlined text-emerald-500 text-[20px] mt-0.5">verified</span>
                  <div>
                    <p class="text-xs font-semibold text-slate-800">Corrigendum Published</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Corrigendum-01 successfully attached and versioned to v1.1.</p>
                    <span class="text-[10px] text-slate-400">Yesterday</span>
                  </div>
                </div>
              </div>
              <div class="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <a routerLink="/admin/audit-logs" (click)="notificationsOpen.set(false)" class="text-xs font-semibold text-[#002244] hover:underline">
                  View Full Audit Activity Log →
                </a>
              </div>
            </div>
          </div>

          <span class="text-slate-300">|</span>

          <!-- Super Admin Profile Dropdown (Initial circle placed BEFORE name) -->
          <div class="relative">
            <button 
              type="button"
              (click)="toggleProfileMenu()"
              class="flex items-center gap-2 sm:gap-2.5 p-1 rounded-xs hover:bg-slate-100 transition-colors cursor-pointer group">
              
              <!-- Avatar Circle with Initial 'RS' -->
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#002244] text-amber-300 border border-[#002244]/20 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                RS
              </div>

              <!-- Admin User Name & Designation -->
              <div class="text-left hidden md:block leading-none">
                <div class="text-xs sm:text-[13px] font-extrabold text-[#002244] truncate max-w-[180px]" [title]="authService.currentUser().fullName">
                  {{ authService.currentUser().fullName }}
                </div>
                <div class="mt-1 flex items-center justify-start gap-1 text-[10.5px] text-emerald-700 font-semibold">
                  <span>✓ Super Admin • RSLDC HQ</span>
                </div>
              </div>

              <span class="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-700">
                arrow_drop_down
              </span>
            </button>

            <!-- Dropdown Menu -->
            <div 
              *ngIf="profileMenuOpen()" 
              class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div class="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <p class="text-xs font-bold text-[#002244]">{{ authService.currentUser().fullName }}</p>
                <p class="text-[11px] text-slate-500 truncate">{{ authService.currentUser().email }}</p>
                <p class="text-[10px] font-semibold text-blue-700 mt-1">SSO: {{ authService.currentUser().ssoId }}</p>
              </div>

              <div class="py-1">
                <a 
                  routerLink="/admin/settings" 
                  (click)="profileMenuOpen.set(false)"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#002244] transition-colors">
                  <span class="material-symbols-outlined text-[18px] text-slate-400">person</span>
                  My Profile
                </a>
                <button 
                  type="button"
                  (click)="openChangePasswordModal()" 
                  class="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#002244] transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[18px] text-slate-400">lock_reset</span>
                  Change Password
                </button>
                <a 
                  routerLink="/admin/audit-logs" 
                  (click)="profileMenuOpen.set(false)"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#002244] transition-colors">
                  <span class="material-symbols-outlined text-[18px] text-slate-400">manage_history</span>
                  Audit Activity
                </a>
              </div>

              <div class="border-t border-slate-100 pt-1">
                <button 
                  type="button"
                  (click)="handleLogout()" 
                  class="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Saffron / Gold Accent Line at bottom -->
      <div class="h-[2.5px] w-full bg-gradient-to-r from-[#0B3558] via-[#F4A300] to-[#0B3558]"></div>
    </header>

    <!-- Help Modal -->
    <div *ngIf="showHelpModal()" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" (click)="showHelpModal.set(false)"></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 border border-slate-200">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2 text-[#002244]">
              <span class="material-symbols-outlined text-[24px]">help</span>
              <h3 class="font-bold text-base">Super Admin Standard Operating Guidelines</h3>
            </div>
            <button (click)="showHelpModal.set(false)" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="py-4 text-xs text-slate-600 space-y-3 leading-relaxed">
            <div class="p-3 bg-blue-50/80 rounded-xs border border-blue-100 text-[#002244] font-medium">
              <strong>Order of Operations:</strong> Master Data (Schemes, Categories, Fees, Document Types) must be verified before initializing any new EOI.
            </div>
            <p><strong>Rule 1 (Scheme Master):</strong> Active Scheme must be created prior to EOI generation.</p>
            <p><strong>Rule 2 (Dynamic Form Builder):</strong> Custom form fields define applicant input schema. Fields with historical submissions cannot be physically deleted; use archive instead.</p>
            <p><strong>Rule 3 (EOI Rescheduling):</strong> Rescheduling dates strictly mandates uploading an official Corrigendum or Amendment notification document.</p>
            <p><strong>Rule 4 (Response Visibility):</strong> In compliance with Government tender secrecy, applicant submissions remain sealed until official EOI closure.</p>
          </div>
          <div class="text-right pt-3 border-t border-slate-100">
            <button (click)="showHelpModal.set(false)" class="px-4 py-2 bg-[#002244] hover:bg-[#003366] text-white font-semibold text-xs rounded-xs shadow-xs cursor-pointer">
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div *ngIf="showPasswordModal()" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" (click)="showPasswordModal.set(false)"></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-slate-200">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2 text-[#002244]">
              <span class="material-symbols-outlined text-[22px]">lock_reset</span>
              <h3 class="font-bold text-base">Change Super Admin Password</h3>
            </div>
            <button (click)="showPasswordModal.set(false)" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="py-4 space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
              <input type="password" class="w-full px-3 py-2 border border-slate-300 rounded-xs text-xs focus:ring-2 focus:ring-[#002244] focus:outline-hidden" placeholder="••••••••••••" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">New Secure Password *</label>
              <input type="password" class="w-full px-3 py-2 border border-slate-300 rounded-xs text-xs focus:ring-2 focus:ring-[#002244] focus:outline-hidden" placeholder="Minimum 8 characters with symbols" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <input type="password" class="w-full px-3 py-2 border border-slate-300 rounded-xs text-xs focus:ring-2 focus:ring-[#002244] focus:outline-hidden" placeholder="Re-enter new password" />
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="showPasswordModal.set(false)" class="px-4 py-2 border border-slate-300 text-slate-700 font-medium text-xs rounded-xs hover:bg-slate-50 cursor-pointer">
              Cancel
            </button>
            <button (click)="saveNewPassword()" class="px-4 py-2 bg-[#002244] hover:bg-[#003366] text-white font-semibold text-xs rounded-xs shadow-xs cursor-pointer">
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
