import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../core/services/admin-auth.service';
import { ToastService } from '../core/services/toast.service';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

@Component({
  selector: 'admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div>
      <admin-page-header 
        title="Super Admin System Settings"
        subtitle="Global platform configuration, state security policies, RajSSO gateway, and automated notification dispatchers"
        icon="settings"
        [breadcrumbs]="[{ label: 'Settings', url: '/admin/settings' }]">
        <div header-actions>
          <button (click)="saveSettings()" class="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">save</span>
            Save System Configurations
          </button>
        </div>
      </admin-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Super Admin Profile Card -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-xs">
                RS
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">{{ authService.currentUser().fullName }}</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  SUPER ADMIN
                </span>
                <p class="text-[11px] text-slate-500 mt-0.5">{{ authService.currentUser().designation }}</p>
              </div>
            </div>

            <div class="space-y-2 text-xs pt-3 border-t border-slate-100">
              <div class="flex justify-between">
                <span class="text-slate-500">Official SSO:</span>
                <span class="font-mono font-bold text-blue-900">{{ authService.currentUser().ssoId }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Email:</span>
                <span class="font-semibold text-slate-700">{{ authService.currentUser().email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Department:</span>
                <span class="font-semibold text-slate-700">{{ authService.currentUser().department }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Last Login:</span>
                <span class="text-slate-600 font-mono">{{ authService.currentUser().lastLogin }}</span>
              </div>
            </div>
          </div>

          <!-- Security Status -->
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span class="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
              Security & Compliance Parameters
            </h4>
            <div class="space-y-2">
              <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-900 font-semibold">
                <span>RTPP Act 2012 Rule Check</span>
                <span class="text-[10px] bg-emerald-200 px-2 py-0.5 rounded">Enforced</span>
              </div>
              <div class="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-900 font-semibold">
                <span>Rajasthan SSO SAML 2.0</span>
                <span class="text-[10px] bg-blue-200 px-2 py-0.5 rounded">Connected</span>
              </div>
              <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-slate-800 font-semibold">
                <span>Database Audit Trails</span>
                <span class="text-[10px] bg-slate-200 px-2 py-0.5 rounded">Retain 7 Yrs</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: System Configuration Forms -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- EOI Default Policies -->
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-700 text-[18px]">tune</span>
              EOI Publishing Defaults & Validation Policies
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Default Application Window (Days)</label>
                <input type="number" [(ngModel)]="defaultWindowDays" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Statutory Standard GST Rate (%)</label>
                <input type="number" [(ngModel)]="defaultGst" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tender Submission Secrecy Rule</label>
                <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
                  <option>Strict: Lock Responses until Official EOI Closure</option>
                  <option>Restricted: Aggregate Counts Only</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Rescheduling Requirement</label>
                <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
                  <option>Mandatory Corrigendum / Amendment Upload</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Notification Gateways -->
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-700 text-[18px]">outgoing_mail</span>
              State Notification & Communication Dispatchers
            </h3>

            <div class="space-y-3 text-xs">
              <label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <div>
                  <span class="font-bold text-slate-800 block">Dispatch Corrigendum Notifications</span>
                  <span class="text-slate-500">Auto SMS / Email to all registered applicants when dates change</span>
                </div>
                <input type="checkbox" checked class="rounded text-blue-600" />
              </label>

              <label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <div>
                  <span class="font-bold text-slate-800 block">Committee Evaluation Intimations</span>
                  <span class="text-slate-500">Notify committee chairperson and members immediately upon EOI closure</span>
                </div>
                <input type="checkbox" checked class="rounded text-blue-600" />
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  authService = inject(AdminAuthService);
  private toastService = inject(ToastService);

  defaultWindowDays = 45;
  defaultGst = 18;

  ngOnInit(): void {}

  saveSettings(): void {
    this.toastService.success('Settings Saved', 'Super Admin platform parameters updated successfully.');
  }
}
