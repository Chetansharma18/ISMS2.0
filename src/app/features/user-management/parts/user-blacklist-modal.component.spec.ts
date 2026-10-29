import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { UserBlacklistModalComponent } from './user-blacklist-modal.component';
import { UserManagementItem } from '../../../core/models/user-management.model';

describe('UserBlacklistModalComponent', () => {
  function createComponent(targetUser?: Partial<UserManagementItem>) {
    const injector = createEnvironmentInjector([], null as any);
    const comp = runInInjectionContext(injector, () => new UserBlacklistModalComponent());

    const userSig = signal<UserManagementItem | null>(
      targetUser
        ? {
            sNo: 1,
            id: 'u-1',
            userId: 'USR-1008',
            username: 'Training Partner 1',
            ssoId: 'SSO_TP_01',
            userType: 'TP',
            roleType: 'tp',
            districtName: 'Jaipur',
            schemeStatus: 'Active',
            ...targetUser
          }
        : null
    );
    const schemeOptionsSig = signal<readonly string[]>([
      'Vishwakarma Yuva Udyami Protsahan Yojana',
      'Mukhyamantri Yuva Swarojgar Yojana (2026)'
    ]);

    (comp as any).isOpen = signal(true);
    (comp as any).user = userSig;
    (comp as any).schemeOptions = schemeOptionsSig;

    return { comp, userSig, schemeOptionsSig };
  }

  it('instantiates and defines default duration options', () => {
    const { comp } = createComponent();
    expect(comp.yearsOptions).toContain('1 Year');
    expect(comp.yearsOptions).toContain('3 Years');
    expect(comp.yearsOptions).toContain('Permanent (Indefinite)');
    expect(comp.selectedScheme()).toBe('All Schemes');
    expect(comp.selectedYears()).toBe('3 Years');
  });

  it('emits configuration on proceed', () => {
    const { comp } = createComponent({ userId: 'USR-1008', username: 'Training Partner 1' });
    let emitted: any = null;
    comp.proceed.subscribe((val: any) => {
      emitted = val;
    });

    comp.selectedScheme.set('Vishwakarma Yuva Udyami Protsahan Yojana');
    comp.selectedYears.set('2 Years');
    comp.remarks.set('Audit violation');

    comp.onProceed();

    expect(emitted).toEqual({
      scheme: 'Vishwakarma Yuva Udyami Protsahan Yojana',
      years: '2 Years',
      remarks: 'Audit violation'
    });
  });

  it('includes All Schemes in resolvedSchemeOptions', () => {
    const { comp } = createComponent();
    const options = comp.resolvedSchemeOptions();
    expect(options[0]).toBe('All Schemes');
    expect(options).toContain('Vishwakarma Yuva Udyami Protsahan Yojana');
  });
});
