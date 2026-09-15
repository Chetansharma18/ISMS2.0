import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../shared/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../shared/components/admin-sidebar/admin-sidebar.component';
import { ToastContainerComponent } from '../shared/components/toast/toast.component';

@Component({
  selector: 'admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    AdminHeaderComponent, 
    AdminSidebarComponent, 
    ToastContainerComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 antialiased">
      <!-- Admin Top Header -->
      <admin-header (toggleSidebar)="toggleSidebar()"></admin-header>

      <!-- Main Layout Body with Sidebar and Content -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Sidebar Navigation -->
        <admin-sidebar 
          [isOpen]="sidebarOpen()" 
          (closeSidebar)="sidebarOpen.set(false)">
        </admin-sidebar>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div class="max-w-7xl w-full mx-auto">
            <router-outlet></router-outlet>
          </div>

          <!-- Enterprise Administration Footer -->
          <footer class="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto pb-4">
            <div class="flex items-center gap-2">
              <span class="font-bold text-[#002244]">Government of Rajasthan</span>
              <span>•</span>
              <span class="font-medium text-slate-600">Skill, Employment &amp; Entrepreneurship Department</span>
              <span>•</span>
              <span class="font-bold text-[#002244]">RSLDC</span>
            </div>
            <div class="flex items-center gap-4 text-slate-400">
              <span class="hover:text-slate-600 transition-colors">RTPP Act 2012 Compliant</span>
              <span>•</span>
              <span class="hover:text-slate-600 transition-colors">Jaipur-DC-02 (State Data Centre)</span>
              <span>•</span>
              <span class="font-semibold text-[#002244]">ISMS v2.0 Enterprise</span>
            </div>
          </footer>
        </main>
      </div>

      <!-- Toast Notification Container -->
      <admin-toast-container></admin-toast-container>
    </div>
  `
})
export class AdminLayoutComponent {
  sidebarOpen = signal<boolean>(true);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
