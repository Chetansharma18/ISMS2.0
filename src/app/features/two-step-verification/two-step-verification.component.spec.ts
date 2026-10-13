import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { createEnvironmentInjector, DestroyRef, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { TwoStepVerificationComponent, TwoStepVerificationItem } from './two-step-verification.component';
import { DataEngineService } from '../../core/services/data-engine.service';
import { AuthMethodType } from '../../core/models/admin-masters.model';

describe('TwoStepVerificationComponent', () => {
  function createComponentFixture() {
    const mockRepo = {
      getAll: vi.fn().mockReturnValue(of([])),
      create: vi.fn((data) => of({ id: '2fa-new', ...data })),
      update: vi.fn((id, data) => of({ id, ...data })),
      delete: vi.fn(() => of(true))
    };

    const mockRoleRepo = {
      getAll: vi.fn().mockReturnValue(
        of([
          { id: 'r-1', roleTypeName: 'Super Admin', status: 'Active' },
          { id: 'r-2', roleTypeName: 'Department Officer', status: 'Active' },
          { id: 'r-3', roleTypeName: 'Training Partner', status: 'Active' }
        ])
      )
    };

    const mockDataEngine = {
      for: vi.fn((key: string) => (key === 'TWO_STEP_VERIFICATION' ? mockRepo : mockRoleRepo))
    };

    const injector = createEnvironmentInjector(
      [
        { provide: DataEngineService, useValue: mockDataEngine },
        { provide: DestroyRef, useValue: { onDestroy: vi.fn() } }
      ],
      null as any
    );

    const comp = runInInjectionContext(injector, () => new TwoStepVerificationComponent());
    comp.ngOnInit();
    return { comp, mockRepo, mockRoleRepo };
  }

  it('initializes table columns correctly with roleType, authTypes, and action', () => {
    const { comp } = createComponentFixture();
    const keys = comp.tableColumns.map((c) => c.key);
    expect(keys).toContain('sNo');
    expect(keys).toContain('roleType');
    expect(keys).toContain('authTypes');
    expect(keys).toContain('action');
  });

  it('determines if item has a specific auth type with hasAuthType', () => {
    const { comp } = createComponentFixture();
    const item: TwoStepVerificationItem = {
      id: '2fa-1',
      roleType: 'Super Admin',
      authTypes: ['OTP', 'Auth App']
    };

    expect(comp.hasAuthType(item, 'OTP')).toBe(true);
    expect(comp.hasAuthType(item, 'Auth App')).toBe(true);
    expect(comp.hasAuthType(item, 'PIN')).toBe(false);
  });

  it('toggles auth types in form data via toggleFormAuth', () => {
    const { comp } = createComponentFixture();
    comp.formData = {
      roleType: 'Super Admin',
      authTypes: ['OTP']
    };

    expect(comp.isFormAuthSelected('OTP')).toBe(true);
    expect(comp.isFormAuthSelected('Auth App')).toBe(false);

    comp.toggleFormAuth('Auth App');
    expect(comp.formData.authTypes).toContain('Auth App');

    comp.toggleFormAuth('OTP');
    expect(comp.formData.authTypes).not.toContain('OTP');
  });

  it('removes auth type in form data via removeFormAuth', () => {
    const { comp } = createComponentFixture();
    comp.formData = {
      roleType: 'Super Admin',
      authTypes: ['OTP', 'PIN']
    };

    comp.removeFormAuth('PIN');
    expect(comp.formData.authTypes).toEqual(['OTP']);
  });

  it('filters items by search query matching roleType or authType', () => {
    const { comp } = createComponentFixture();
    comp.items.set([
      { id: '1', roleType: 'Super Admin', authTypes: ['OTP', 'Auth App', 'PIN'] },
      { id: '2', roleType: 'Training Partner', authTypes: ['OTP'] }
    ]);

    comp.searchQuery.set('partner');
    expect(comp.filteredItems().length).toBe(1);
    expect(comp.filteredItems()[0].roleType).toBe('Training Partner');

    comp.searchQuery.set('PIN');
    expect(comp.filteredItems().length).toBe(1);
    expect(comp.filteredItems()[0].roleType).toBe('Super Admin');
  });

  it('opens add modal with unconfigured role prefilled', () => {
    const { comp } = createComponentFixture();
    comp.items.set([
      { id: '1', roleType: 'Super Admin', authTypes: ['OTP'] }
    ]);

    comp.openAddModal();
    expect(comp.showModal()).toBe(true);
    expect(comp.editingId()).toBeNull();
    expect(comp.formData.roleType).toBe('Department Officer');
    expect(comp.formData.authTypes).toEqual(['OTP']);
  });

  it('opens edit modal with existing item configuration', () => {
    const { comp } = createComponentFixture();
    const item: TwoStepVerificationItem = {
      id: '2fa-1',
      roleType: 'Scrutiny Officer',
      authTypes: ['OTP', 'PIN']
    };

    comp.openEditModal(item);
    expect(comp.showModal()).toBe(true);
    expect(comp.editingId()).toBe('2fa-1');
    expect(comp.formData.roleType).toBe('Scrutiny Officer');
    expect(comp.formData.authTypes).toEqual(['OTP', 'PIN']);
  });

  it('submits and creates new two step verification item', () => {
    const { comp, mockRepo } = createComponentFixture();
    comp.openAddModal();
    comp.formData = {
      roleType: 'Training Partner',
      authTypes: ['OTP', 'Auth App']
    };

    comp.submitForm();
    expect(mockRepo.create).toHaveBeenCalledWith({
      roleType: 'Training Partner',
      authTypes: ['OTP', 'Auth App'],
      status: 'Active'
    });
    expect(comp.showModal()).toBe(false);
  });

  it('toggles item status between Active and Inactive', () => {
    const { comp, mockRepo } = createComponentFixture();
    const item: TwoStepVerificationItem = {
      id: '2fa-1',
      roleType: 'Super Admin',
      authTypes: ['OTP'],
      status: 'Active'
    };
    comp.items.set([item]);

    comp.toggleStatus(item);
    expect(mockRepo.update).toHaveBeenCalledWith('2fa-1', { status: 'Inactive' });
    expect(comp.items()[0].status).toBe('Inactive');

    const inactiveItem = comp.items()[0];
    comp.toggleStatus(inactiveItem);
    expect(mockRepo.update).toHaveBeenCalledWith('2fa-1', { status: 'Active' });
    expect(comp.items()[0].status).toBe('Active');
  });

  it('computes rowClass based on item status', () => {
    const { comp } = createComponentFixture();
    expect(comp.getRowClass({ status: 'Inactive' })).toContain('opacity-50');
    expect(comp.getRowClass({ status: 'Active' })).toContain('bg-white');
  });
});
