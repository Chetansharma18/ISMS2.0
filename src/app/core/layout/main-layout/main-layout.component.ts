import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      <app-header class="shrink-0 z-40"></app-header>
      
      <div class="flex-1 flex w-full overflow-hidden">
        @if (showSidebar) {
          <app-sidebar class="h-full shrink-0"></app-sidebar>
        }
        <main class="flex-1 min-w-0 h-full overflow-y-auto bg-slate-50 flex flex-col">
          <ng-content></ng-content>
          @if (showFooter) {
            <app-footer class="shrink-0 mt-auto"></app-footer>
          }
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  @Input() showSidebar: boolean = true;
  @Input() showFooter: boolean = false;
}
