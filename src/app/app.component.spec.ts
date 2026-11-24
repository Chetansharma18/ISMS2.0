import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { describe, expect, it, beforeEach } from 'vitest';
import { AppComponent } from './app.component';
import { ConnectivityService } from './core/services/connectivity.service';
import { AuthService } from './core/auth/auth.service';

@Component({ standalone: true, template: '<div id="dummy-view">Page Content</div>' })
class DummyRouteComponent {}

describe('AppComponent - Global Offline Detection', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let connectivityService: ConnectivityService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', component: DummyRouteComponent },
          { path: 'profile', component: DummyRouteComponent },
          { path: 'tenders', component: DummyRouteComponent },
          { path: 'help-support', component: DummyRouteComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    connectivityService = TestBed.inject(ConnectivityService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('does not display offline modal when internet is connected', () => {
    connectivityService.isOnline.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const modal = el.querySelector('[role="dialog"]');
    expect(modal).toBeNull();
  });

  it('immediately displays No Internet Connection popup when connectivity is lost on Home route', async () => {
    await router.navigateByUrl('/');
    connectivityService.isOnline.set(false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const modal = el.querySelector('[role="dialog"]');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('No Internet Connection');
    expect(modal?.textContent).toContain('Please enable your internet connection and try again.');
  });

  it('displays offline popup across other routes such as /profile', async () => {
    await router.navigateByUrl('/profile');
    connectivityService.isOnline.set(false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const modal = el.querySelector('[role="dialog"]');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('No Internet Connection');
  });

  it('automatically dismisses popup when connectivity is restored', () => {
    // Loss of internet
    connectivityService.isOnline.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();

    // Restoration of internet
    connectivityService.isOnline.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  describe('Initial Route Detection (Bugs 3 & 7 - Prevent Flash on Refresh)', () => {
    it('sets isLandingRoute correctly when navigating to internal routes', async () => {
      await router.navigateByUrl('/tenders');
      fixture.detectChanges();

      expect(component.isLandingRoute()).toBe(false);
      expect(component.isSsoRoute()).toBe(false);
    });

    it('sets isLandingRoute to true on root URL', async () => {
      await router.navigateByUrl('/');
      fixture.detectChanges();

      expect(component.isLandingRoute()).toBe(true);
    });

    it('suppresses ISMS header and sidebar on /help-support route', async () => {
      await router.navigateByUrl('/help-support');
      fixture.detectChanges();

      expect(component.isHelpSupportRoute()).toBe(true);
      expect(component.showHeader()).toBe(false);
      expect(component.showSidebar()).toBe(false);

      const headerEl = fixture.nativeElement.querySelector('app-header');
      expect(headerEl).toBeNull();
    });
  });
});
