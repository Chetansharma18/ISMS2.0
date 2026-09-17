import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex flex-col h-screen bg-background font-sans overflow-hidden">
      <app-header class="shrink-0" [isAuthenticated]="true"></app-header>
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <app-sidebar class="shrink-0 h-full"></app-sidebar>
        <main class="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AuthenticatedLayoutComponent {}
