import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TendersModalComponent } from './tenders-modal.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('TendersModalComponent', () => {
  let fixture: ComponentFixture<TendersModalComponent>;
  let component: TendersModalComponent;
  let mockAuthService: { currentUser: ReturnType<typeof signal>; triggerSsoRedirect: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal(null),
      triggerSsoRedirect: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TendersModalComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TendersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders modal dialog with correct title, subtitle and all tenders', () => {
    const el = fixture.nativeElement as HTMLElement;
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Official Tenders & RFP Notices');
    expect(dialog?.textContent).toContain('Rajasthan Skill and Livelihoods Development Corporation');
    expect(dialog?.textContent).toContain(`Total Tenders: 10`);
    expect(component.tenders.length).toBe(10);
  });

  it('renders tender items with details and Login to View buttons', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('.group.cursor-pointer');
    expect(items.length).toBe(10);
    expect(items[0].textContent).toContain('MMKVY');
    expect(items[0].textContent).toContain('Login to View');
  });

  it('opens login required modal when an unauthenticated user clicks a tender', () => {
    expect(component.showLoginModal()).toBe(false);
    const firstTender = component.tenders[0];
    component.openLoginPrompt(firstTender);
    fixture.detectChanges();

    expect(component.showLoginModal()).toBe(true);
    expect(component.selectedTender()?.id).toBe(firstTender.id);
  });

  it('navigates directly to /tenders if user is already authenticated', () => {
    mockAuthService.currentUser.set({ id: 'u1', name: 'Test User' } as any);
    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);

    component.openLoginPrompt(component.tenders[0]);
    expect(closeSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tenders']);
  });

  it('closes login prompt and triggers SSO redirect on proceedToLogin', () => {
    component.openLoginPrompt(component.tenders[0]);
    expect(component.showLoginModal()).toBe(true);

    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);

    component.proceedToLogin();
    expect(component.showLoginModal()).toBe(false);
    expect(closeSpy).toHaveBeenCalled();
    expect(mockAuthService.triggerSsoRedirect).toHaveBeenCalled();
  });

  it('emits close event on onModalClose when login modal is not open', () => {
    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);

    component.onModalClose();
    expect(closeSpy).toHaveBeenCalled();
  });
});

