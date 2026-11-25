import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { PermissionMasterComponent } from './permission-master.component';
import { DataEngineService } from '../../core/services/data-engine.service';
import { PermissionMasterItem, UserRoleMasterItem } from '../../core/models/admin-masters.model';

describe('PermissionMasterComponent', () => {
  let mockPerms: PermissionMasterItem[];
  let mockRoles: UserRoleMasterItem[];
  let mockDataEngine: any;

  beforeEach(() => {
    mockPerms = [
      { sNo: 1, id: 'p1', roleType: 'Super Admin', moduleName: 'EOI Configuration', canView: true, canEdit: true, canDelete: true, status: 'Active' },
      { sNo: 2, id: 'p2', roleType: 'Department Officer', moduleName: 'Scheme Master', canView: true, canEdit: false, canDelete: false, status: 'Active' },
      { sNo: 3, id: 'p3', roleType: 'Training Partner', moduleName: 'Grievance Redressal', canView: true, canEdit: true, canDelete: false, status: 'Inactive' }
    ];

    mockRoles = [
      { sNo: 1, id: 'r1', roleTypeName: 'Super Admin', permissions: [], status: 'Active' },
      { sNo: 2, id: 'r2', roleTypeName: 'Department Officer', permissions: [], status: 'Active' },
      { sNo: 3, id: 'r3', roleTypeName: 'Training Partner', permissions: [], status: 'Active' },
      { sNo: 4, id: 'r4', roleTypeName: 'Retired Role', permissions: [], status: 'Inactive' }
    ];

    mockDataEngine = {
      for: (key: string) => {
        if (key === 'PERMISSIONS') {
          return {
            getAll: () => of(mockPerms),
            create: (item: PermissionMasterItem) => {
              mockPerms.push(item);
              return of(item);
            },
            update: (id: string, patch: Partial<PermissionMasterItem>) => {
              const idx = mockPerms.findIndex(p => p.id === id);
              if (idx >= 0) {
                mockPerms[idx] = { ...mockPerms[idx], ...patch };
                return of(mockPerms[idx]);
              }
              return of(patch as PermissionMasterItem);
            },
            delete: (id: string) => {
              mockPerms = mockPerms.filter(p => p.id !== id);
              return of(true);
            }
          };
        }
        if (key === 'USER_ROLES') {
          return {
            getAll: () => of(mockRoles)
          };
        }
        return {
          getAll: () => of([])
        };
      }
    };
  });

  function createComponent(): PermissionMasterComponent {
    const injector = createEnvironmentInjector([
      { provide: DataEngineService, useValue: mockDataEngine }
    ], null as any);

    return runInInjectionContext(injector, () => new PermissionMasterComponent());
  }

  it('initializes items and active role options from repositories', () => {
    const comp = createComponent();
    expect(comp.items().length).toBe(3);
    // Only active roles should be included
    expect(comp.activeRoleOptions()).toEqual(['Super Admin', 'Department Officer', 'Training Partner']);
    expect(comp.activeRoleOptions()).not.toContain('Retired Role');
  });

  it('filters items by search query and role filter', () => {
    const comp = createComponent();

    // No filter
    expect(comp.filteredItems().length).toBe(3);

    // Filter by role
    comp.selectedRoleFilter.set('Super Admin');
    expect(comp.filteredItems().length).toBe(1);
    expect(comp.filteredItems()[0].moduleName).toBe('EOI Configuration');

    // Filter by search text
    comp.selectedRoleFilter.set('all');
    comp.searchQuery.set('Grievance');
    expect(comp.filteredItems().length).toBe(1);
    expect(comp.filteredItems()[0].roleType).toBe('Training Partner');
  });

  it('toggles permission checkbox and updates repository', () => {
    const comp = createComponent();
    const item = comp.items()[1]; // Department Officer: canEdit = false

    expect(item.canEdit).toBe(false);
    comp.togglePermission(item, 'canEdit', { target: { checked: true } } as any);

    const updated = comp.items().find(p => p.id === 'p2');
    expect(updated?.canEdit).toBe(true);
  });

  it('handles multi-model selection and adds permissions for each selected model', () => {
    const comp = createComponent();
    comp.openAddModal();

    comp.addForm.roleType = 'Super Admin';
    comp.addForm.models = ['Course Master', 'Sector Master'];
    comp.addForm.canView = true;
    comp.addForm.canEdit = true;
    comp.addForm.canDelete = false;

    comp.submitAdd();

    expect(comp.showAddModal()).toBe(false);
    expect(comp.items().length).toBe(5);
    expect(comp.items().some(p => p.roleType === 'Super Admin' && p.moduleName === 'Course Master')).toBe(true);
    expect(comp.items().some(p => p.roleType === 'Super Admin' && p.moduleName === 'Sector Master')).toBe(true);

    // Verifies that both Course Master and Sector Master were saved
    const coursePerm = mockPerms.find(p => p.roleType === 'Super Admin' && p.moduleName === 'Course Master');
    const sectorPerm = mockPerms.find(p => p.roleType === 'Super Admin' && p.moduleName === 'Sector Master');

    expect(coursePerm).toBeDefined();
    expect(coursePerm?.canView).toBe(true);
    expect(coursePerm?.canEdit).toBe(true);
    expect(coursePerm?.canDelete).toBe(false);

    expect(sectorPerm).toBeDefined();
    expect(sectorPerm?.canView).toBe(true);
    expect(sectorPerm?.canEdit).toBe(true);
    expect(sectorPerm?.canDelete).toBe(false);
  });

  it('toggles status between Active and Inactive', () => {
    const comp = createComponent();
    const item = comp.items()[0];
    expect(item.status).toBe('Active');

    comp.toggleStatus(item);
    const updated = comp.items().find(p => p.id === 'p1');
    expect(updated?.status).toBe('Inactive');
  });

  it('manages model dropdown open state and search filtering', () => {
    const comp = createComponent();
    comp.openAddModal();
    expect(comp.isModelDropdownOpen()).toBe(false);

    // Toggle dropdown open
    comp.toggleModelDropdown();
    expect(comp.isModelDropdownOpen()).toBe(true);

    // Initial models count
    expect(comp.filteredAvailableModels().length).toBe(comp.availableModels.length);

    // Search for a specific model
    comp.modelSearchText.set('Sector');
    expect(comp.filteredAvailableModels()).toEqual(['Sector Master']);

    // Non-matching search
    comp.modelSearchText.set('XYZNotExisting');
    expect(comp.filteredAvailableModels().length).toBe(0);

    // Document click outside closes dropdown
    comp.onDocumentClick({ target: { closest: () => null } } as any);
    expect(comp.isModelDropdownOpen()).toBe(false);
  });

  it('initializes with empty permission items and allows adding fresh permissions', () => {
    mockPerms = [];
    const comp = createComponent();
    expect(comp.items().length).toBe(0);
    expect(comp.filteredItems().length).toBe(0);

    comp.openAddModal();
    comp.addForm.roleType = 'Super Admin';
    comp.addForm.models = ['User Management'];
    comp.addForm.canView = true;
    comp.addForm.canEdit = true;
    comp.addForm.canDelete = true;
    comp.submitAdd();

    expect(comp.items().length).toBe(1);
    expect(comp.items()[0].moduleName).toBe('User Management');
  });
});
