import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../auth/auth.service';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('HeaderComponent', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'sso-login', component: DummyComponent },
          { path: 'tenders', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
  });

  it('renders app-header-notification on internal pages when logged in', async () => {
    authService.currentUser.set({
      id: 'test-user',
      ssoId: 'test-user',
      label: 'Test User',
      subLabel: 'Registered User',
      role: 'existing_user',
      isProfileComplete: true
    });

    await router.navigateByUrl('/tenders');
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header-notification')).not.toBeNull();
    expect(compiled.querySelector('#user-menu-container')).not.toBeNull();
  });

  it('removes app-header-notification on sso-login page', async () => {
    authService.currentUser.set({
      id: 'test-user',
      ssoId: 'test-user',
      label: 'Test User',
      subLabel: 'Registered User',
      role: 'existing_user',
      isProfileComplete: true
    });

    await router.navigateByUrl('/sso-login');
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Notification option must not show on SSO login screen
    expect(compiled.querySelector('app-header-notification')).toBeNull();
    // User menu is still retained
    expect(compiled.querySelector('#user-menu-container')).not.toBeNull();
  });

  it('does not render app-header-notification on landing page', async () => {
    await router.navigateByUrl('/');
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header-notification')).toBeNull();
  });
});
