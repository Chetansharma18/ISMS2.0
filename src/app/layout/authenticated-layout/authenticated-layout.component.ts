import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-background font-sans">
      <app-header [isAuthenticated]="true"></app-header>
      <div class="flex flex-grow overflow-hidden">
        <app-sidebar></app-sidebar>
        <main class="flex-grow overflow-y-auto p-4 md:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AuthenticatedLayoutComponent {}
