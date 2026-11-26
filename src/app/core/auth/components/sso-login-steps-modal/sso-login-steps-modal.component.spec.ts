import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import type { BackendRoleSummary, TwoStepMethod } from '../../auth-api.models';
import { SsoLoginFlowService, type SsoLoginStep } from '../../sso-login-flow.service';
import { SsoLoginStepsModalComponent, roleSelectionLayout } from './sso-login-steps-modal.component';

function createFlowStub(initialRoles: BackendRoleSummary[] = []) {
  return {
    step: signal<SsoLoginStep>('select-role'),
    roles: signal<BackendRoleSummary[]>(initialRoles),
    methods: signal<TwoStepMethod[]>([]),
    otpSent: signal(false),
    pinSet: signal<boolean | null>(null),
    otpDestination: signal<string | null>(null),
    canSetPinNow: signal(false),
    resettingPin: signal(false),
    busy: signal(false),
    error: signal<string | null>(null),
    switchTargetName: signal<string | null>(null),
    chooseRole: vi.fn(),
    sendOtp: vi.fn(),
    verify: vi.fn(),
    setupPinAndSignIn: vi.fn(),
    forgotPin: vi.fn(() => false),
    cancelForgotPin: vi.fn(),
    cancel: vi.fn()
  };
}

function makeRoles(count: number): BackendRoleSummary[] {
  const names = ['superAdmin', 'admin', 'Tp', 'user', 'schemeOic', 'committeeMember', 'deptUser', 'aspirant', 'auditor'];
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, name: names[i] ?? `role${i + 1}` }));
}

describe('roleSelectionLayout', () => {
  it('uses horizontal single-column layouts for 0 or 1 role', () => {
    expect(roleSelectionLayout(0)).toEqual({
      widthOverride: 'max-w-[420px]',
      columns: 1,
      gridClass: 'grid-cols-1'
    });
    expect(roleSelectionLayout(1)).toEqual({
      widthOverride: 'max-w-[420px]',
      columns: 1,
      gridClass: 'grid-cols-1 max-w-[190px] mx-auto'
    });
  });

  it('uses 2 columns in a horizontal modal for 2 or 4 roles (e.g. 2x2 for 4 roles)', () => {
    for (const count of [2, 4]) {
      expect(roleSelectionLayout(count)).toEqual({
        widthOverride: 'max-w-[440px]',
        columns: 2,
        gridClass: 'grid-cols-2'
      });
    }
  });

  it('uses 3 columns for 3, 5 or 6 roles', () => {
    for (const count of [3, 5, 6]) {
      expect(roleSelectionLayout(count)).toEqual({
        widthOverride: 'max-w-[540px]',
        columns: 3,
        gridClass: 'grid-cols-2 sm:grid-cols-3'
      });
    }
  });

  it('uses 4 columns for 7 or more roles', () => {
    for (const count of [7, 8, 10, 12]) {
      expect(roleSelectionLayout(count)).toEqual({
        widthOverride: 'max-w-[680px]',
        columns: 4,
        gridClass: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
      });
    }
  });
});

describe('SsoLoginStepsModalComponent (select-role layout)', () => {
  function mount(roles: BackendRoleSummary[]) {
    const flow = createFlowStub(roles);
    TestBed.configureTestingModule({
      imports: [SsoLoginStepsModalComponent],
      providers: [{ provide: SsoLoginFlowService, useValue: flow }]
    });
    const fixture = TestBed.createComponent(SsoLoginStepsModalComponent);
    fixture.detectChanges();
    return { fixture, flow, el: fixture.nativeElement as HTMLElement };
  }

  it('renders 4 roles as burgundy sharp icon tiles in a horizontal 2x2 grid', () => {
    const { el, flow } = mount(makeRoles(4));
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    const grid = el.querySelector('[role="group"][aria-label="Your roles"]') as HTMLElement;
    const buttons = Array.from(grid.querySelectorAll('button'));

    expect(dialog.className).toContain('max-w-[440px]');
    expect(grid.className).toContain('grid');
    expect(grid.className).toContain('grid-cols-2');
    expect(buttons).toHaveLength(4);
    expect(
      buttons.every(
        b => b.className.includes('btn-primary') && b.className.includes('btn-square') && b.className.includes('btn-tile')
      )
    ).toBe(true);
    expect(buttons.every(b => b.querySelector('app-icon svg') !== null)).toBe(true);
    expect(buttons.map(b => b.getAttribute('title'))).toEqual(['Super Admin', 'Admin', 'TP', 'User']);

    buttons[1].click();
    expect(flow.chooseRole).toHaveBeenCalledWith(2);
  });

  it('adjusts modal width and grid columns dynamically as backend role count changes', () => {
    const { fixture, flow, el } = mount(makeRoles(1));

    const dialog = () => el.querySelector('[role="dialog"]') as HTMLElement;
    const grid = () => el.querySelector('[role="group"][aria-label="Your roles"]') as HTMLElement;

    expect(dialog().className).toContain('max-w-[420px]');
    expect(grid().className).toContain('grid-cols-1');

    flow.roles.set(makeRoles(4));
    fixture.detectChanges();
    expect(dialog().className).toContain('max-w-[440px]');
    expect(grid().className).toContain('grid-cols-2');

    flow.roles.set(makeRoles(6));
    fixture.detectChanges();
    expect(dialog().className).toContain('max-w-[540px]');
    expect(grid().className).toContain('sm:grid-cols-3');
    expect(grid().querySelectorAll('button')).toHaveLength(6);

    flow.roles.set(makeRoles(8));
    fixture.detectChanges();
    expect(dialog().className).toContain('max-w-[680px]');
    expect(grid().className).toContain('md:grid-cols-4');
    expect(grid().querySelectorAll('button')).toHaveLength(8);
  });
});
