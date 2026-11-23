import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { SsoLoginComponent } from './sso-login.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('SsoLoginComponent - Direct Login Flow (Bug 4 Modal Removed)', () => {
  let fixture: ComponentFixture<SsoLoginComponent>;
  let component: SsoLoginComponent;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsoLoginComponent],
      providers: [
        provideRouter([
          { path: 'training-calendar', children: [] },
          { path: 'tenders', children: [] }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SsoLoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('selects new_user role without any category modal', () => {
    component.selectRole('new_user');
    fixture.detectChanges();

    expect(component.selectedRole()).toBe('new_user');
  });

  it('proceeds directly into application as new_user without displaying Choose Category modal (Bug 4)', () => {
    vi.useFakeTimers();
    component.selectedRole.set('new_user');
    component.handleLogin();

    expect(component.isLoading()).toBe(true);

    vi.runAllTimers();
    expect(authService.currentUser()?.role).toBe('new_user');
  });

  it('proceeds directly without category modal when Aspirant persona logs in (Bug 2)', () => {
    vi.useFakeTimers();
    component.selectRole('aspirant');

    component.handleLogin();
    expect(component.isLoading()).toBe(true);

    vi.runAllTimers();
    expect(authService.currentUser()?.role).toBe('aspirant');
  });

  it('navigates to department dashboard upon OTP verification without login flash', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as any);
    component.showDeptAdminOtp.set(true);

    component.onDeptAdminOtpVerified('123456');

    expect(authService.currentUser()?.role).toBe('dept_admin');
    expect(authService.isDeptAdminOtpVerified()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/eoi-view']);

    await Promise.resolve();
    expect(component.showDeptAdminOtp()).toBe(false);
  });
});
