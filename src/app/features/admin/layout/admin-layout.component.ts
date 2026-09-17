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
    <div class="h-screen flex flex-col bg-[#F6F8FA] font-sans text-[#172B3A] antialiased overflow-hidden">
      <!-- Admin Top Header -->
      <admin-header class="shrink-0" (toggleSidebar)="toggleSidebar()"></admin-header>

      <!-- Main Layout Body with Sidebar and Content -->
      <div class="flex-1 min-h-0 flex overflow-hidden">
        
        <!-- Sidebar Navigation -->
        <admin-sidebar 
          class="shrink-0 h-full"
          [isOpen]="sidebarOpen()" 
          (closeSidebar)="sidebarOpen.set(false)">
        </admin-sidebar>

        <!-- Main Content Area -->
        <main class="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div class="max-w-7xl w-full mx-auto">
            <router-outlet></router-outlet>
          </div>

          <!-- Enterprise Administration Footer -->
          <footer class="mt-12 pt-6 border-t border-[#D9E1E8] text-xs text-[#5F6F7E] flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto pb-4">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-[#0B3558]">Government of Rajasthan</span>
              <span>•</span>
              <span class="font-normal text-[#5F6F7E]">Skill, Employment &amp; Entrepreneurship Department</span>
              <span>•</span>
              <span class="font-semibold text-[#0B3558]">RSLDC</span>
            </div>
            <div class="flex items-center gap-4 text-[#7A8793]">
              <span class="hover:text-[#172B3A] transition-colors">RTPP Act 2012 Compliant</span>
              <span>•</span>
              <span class="hover:text-[#172B3A] transition-colors">Jaipur-DC-02 (State Data Centre)</span>
              <span>•</span>
              <span class="font-semibold text-[#0B3558]">ISMS v2.0 Enterprise</span>
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
