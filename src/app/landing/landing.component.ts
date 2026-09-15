import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
// import { ServicesComponent } from './components/services/services.component';
import { MobileAppComponent } from './components/mobile-app/mobile-app.component';
import { ImportantLinksComponent } from './components/important-links/important-links.component';
import { FooterComponent } from './components/footer/footer.component';
import { HelpdeskChatComponent } from './components/helpdesk-chat/helpdesk-chat.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    AboutComponent,
    // ServicesComponent,
    MobileAppComponent,
    ImportantLinksComponent,
    FooterComponent,
    HelpdeskChatComponent
  ],
  template: `
    <div class="min-h-screen bg-[#f0f6fc] flex flex-col selection:bg-amber-400 selection:text-slate-900 overflow-x-hidden w-full max-w-full scroll-smooth">
      <app-navbar />
      <main id="main-content" class="flex-grow">
        <app-hero />
        <app-about />
        <!-- <app-services /> -->
        <app-mobile-app />
      </main>
      <div class="w-full bg-[#001f3f]">
        <app-important-links />
        <app-footer />
      </div>
      <app-helpdesk-chat />
    </div>
  `
})
export class LandingComponent implements OnInit {
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('scroll') || (window.location.hash ? window.location.hash.slice(1) : null);
      if (target) {
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) {
            el.scrollIntoView({ behavior: 'auto' });
          }
        }, 300);
      }
    }
  }
}
