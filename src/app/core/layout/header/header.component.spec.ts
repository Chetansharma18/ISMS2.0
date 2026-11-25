import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { describe, expect, it, beforeEach, vi } from 'vitest';
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
          { path: 'tenders', component: DummyComponent },
          { path: 'profile', component: DummyComponent }
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

  it('removes app-header-notification and user-menu-container on sso-login page', async () => {
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
    // Notification option and user profile menu must not show on SSO login screen
    expect(compiled.querySelector('app-header-notification')).toBeNull();
    expect(compiled.querySelector('#user-menu-container')).toBeNull();
  });

  it('routes emblem logo to role dashboard when logged in and to root when unauthenticated', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // When not logged in
    authService.currentUser.set(null);
    expect(fixture.componentInstance.homeRoute()).toBe('/');

    // When logged in as existing user
    authService.currentUser.set({
      id: 'existing-tp',
      ssoId: 'existing-tp',
      label: 'TP 1',
      subLabel: 'Existing User',
      role: 'existing_user',
      isProfileComplete: true
    });
    expect(fixture.componentInstance.homeRoute()).toBe('/tenders');

    // When logged in as dept admin
    authService.currentUser.set({
      id: 'dept-admin',
      ssoId: 'dept-admin',
      label: 'Dept Admin',
      subLabel: 'Department User',
      role: 'dept_admin',
      isProfileComplete: true
    });
    expect(fixture.componentInstance.homeRoute()).toBe('/admin/eoi-view');
  });
});
