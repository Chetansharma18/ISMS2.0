import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../auth/auth.service';
import { EXTERNAL_LEGAL_URL, PRIVACY_POLICY_NAV, TERMS_AND_CONDITIONS_NAV } from './sidebar-nav.config';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('SidebarComponent', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'tenders', component: DummyComponent },
          { path: 'profile', component: DummyComponent },
          { path: 'help-support', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    authService.currentUser.set({
      id: 'test-user',
      ssoId: 'test-user',
      label: 'Test User',
      subLabel: 'Registered User',
      role: 'existing_user',
      isProfileComplete: true
    });
  });

  it('configures Terms & Conditions and Privacy Policy with external URL and target _blank', () => {
    expect(TERMS_AND_CONDITIONS_NAV.link).toBe(EXTERNAL_LEGAL_URL);
    expect(TERMS_AND_CONDITIONS_NAV.external).toBe(true);

    expect(PRIVACY_POLICY_NAV.link).toBe(EXTERNAL_LEGAL_URL);
    expect(PRIVACY_POLICY_NAV.external).toBe(true);
  });

  it('displays only "Help & Support" when internal /help-support opens', async () => {
    await router.navigateByUrl('/help-support');
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.activeKey()).toBe('help-support');
    expect(comp.activeContextItem()?.label).toBe('Help & Support');

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a'));

    // Only the active section should be shown in the sidebar
    expect(links.length).toBe(1);
    const helpLink = links[0];
    expect(helpLink.textContent?.includes('Help & Support')).toBe(true);
    expect(helpLink.classList.contains('active-link')).toBe(true);
    expect(helpLink.getAttribute('href')).toBe('/help-support');
  });

  it('automatically updates active state and restores full navigation when navigating back to normal routes', async () => {
    await router.navigateByUrl('/help-support');
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.activeKey()).toBe('help-support');
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(1);

    // Navigate back to Active Schemes (normal route)
    await router.navigateByUrl('/tenders');
    fixture.detectChanges();
    expect(comp.activeKey()).toBe('active-schemes');
    expect(comp.activeContextItem()).toBeNull();
    // Standard role menu items should now be restored
    expect(fixture.nativeElement.querySelectorAll('a').length).toBeGreaterThan(1);
  });
});
