import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../auth/auth.service';

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
          { path: 'terms-and-conditions', component: DummyComponent },
          { path: 'help-support', component: DummyComponent },
          { path: 'privacy-policy', component: DummyComponent }
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

  it('displays only "Terms & Conditions" when /terms-and-conditions opens (no other sidebar items)', async () => {
    await router.navigateByUrl('/terms-and-conditions');
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.activeKey()).toBe('terms-and-conditions');
    expect(comp.activeContextItem()?.label).toBe('Terms & Conditions');

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a'));

    // Only the active section should be shown in the sidebar
    expect(links.length).toBe(1);
    const termsLink = links[0];
    expect(termsLink.textContent?.includes('Terms & Conditions')).toBe(true);
    expect(termsLink.classList.contains('active-link')).toBe(true);
    expect(termsLink.getAttribute('href')).toBe('/terms-and-conditions');
  });

  it('displays only "Help & Support" when /help-support opens (no other sidebar items)', async () => {
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

  it('displays only "Privacy Policy" when /privacy-policy opens (no other sidebar items)', async () => {
    await router.navigateByUrl('/privacy-policy');
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.activeKey()).toBe('privacy-policy');
    expect(comp.activeContextItem()?.label).toBe('Privacy Policy');

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a'));

    // Only the active section should be shown in the sidebar
    expect(links.length).toBe(1);
    const privacyLink = links[0];
    expect(privacyLink.textContent?.includes('Privacy Policy')).toBe(true);
    expect(privacyLink.classList.contains('active-link')).toBe(true);
    expect(privacyLink.getAttribute('href')).toBe('/privacy-policy');
  });

  it('automatically updates active state and restores full navigation when navigating back to normal routes', async () => {
    await router.navigateByUrl('/terms-and-conditions');
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.activeKey()).toBe('terms-and-conditions');
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(1);

    // Navigate to Help & Support
    await router.navigateByUrl('/help-support');
    fixture.detectChanges();
    expect(comp.activeKey()).toBe('help-support');
    expect(comp.activeContextItem()?.label).toBe('Help & Support');
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(1);

    // Navigate to Privacy Policy
    await router.navigateByUrl('/privacy-policy');
    fixture.detectChanges();
    expect(comp.activeKey()).toBe('privacy-policy');
    expect(comp.activeContextItem()?.label).toBe('Privacy Policy');
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
