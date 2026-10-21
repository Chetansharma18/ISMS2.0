import { ChangeDetectionStrategy, Component, DestroyRef, Input, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { BackdropComponent } from '../../../shared/components/backdrop/backdrop.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, SidebarComponent, FooterComponent, BackdropComponent],
  template: `
    <div class="h-screen overflow-hidden flex flex-col text-slate-900 antialiased font-sans" style="background-color: #FEFEFD;">
      <app-header
        class="shrink-0 z-40"
        (toggleMobileMenu)="toggleMobileSidebar()"
      ></app-header>
      
      <div class="flex-1 flex w-full overflow-hidden relative">
        @if (showSidebar) {
          <!-- Mobile Sidebar Backdrop Overlay -->
          @if (mobileSidebarOpen()) {
            <app-backdrop z="z-40" class="md:hidden duration-200" (click)="closeMobileSidebar()" />
          }

          <!-- Sidebar Drawer on Mobile / Fixed Column on Desktop -->
          <div
            class="fixed inset-y-0 left-0 z-50 md:static md:z-auto transition-transform duration-300 ease-in-out h-full shrink-0 shadow-xl md:shadow-none bg-white"
            [class.-translate-x-full]="!mobileSidebarOpen()"
            [class.translate-x-0]="mobileSidebarOpen()"
            [class.md:translate-x-0]="true"
          >
            <app-sidebar
              class="h-full shrink-0"
              (linkClicked)="closeMobileSidebar()"
              (closeMobileNav)="closeMobileSidebar()"
            ></app-sidebar>
          </div>
        }
        
        <main class="flex-1 min-w-0 h-full overflow-y-auto flex flex-col" style="background-color: #FEFEFD;">
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
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @Input() showSidebar: boolean = true;
  @Input() showFooter: boolean = false;

  readonly mobileSidebarOpen = signal<boolean>(false);

  constructor() {
    // Auto-close mobile sidebar whenever router navigates
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.closeMobileSidebar();
    });
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
