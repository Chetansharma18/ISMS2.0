import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, ChangeDetectorRef } from '@angular/core';
import { EoiCategoryMasterComponent } from './eoi-category-master.component';
import { SchemeMasterComponent } from './scheme-master.component';
import { PermissionService } from '../../core/permissions/permission.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';

describe('EoiCategoryMaster & SchemeMaster - View Action Removed', () => {
  it('hides View action in EOI Category Master', () => {
    const comp = new EoiCategoryMasterComponent();
    expect(comp.config.hideViewAction).toBe(true);
  });

  it('hides View action in Scheme Master', () => {
    const mockPermissionService = { hasRole: () => true };
    const mockDataEngine = { for: () => ({ getAll: () => ({ pipe: () => ({ subscribe: () => {} }) }) }) };
    const mockNotificationService = { success: () => {}, error: () => {} };
    const mockCdr = { markForCheck: () => {} };

    const injector = createEnvironmentInjector([
      { provide: PermissionService, useValue: mockPermissionService },
      { provide: DataEngineService, useValue: mockDataEngine },
      { provide: NotificationService, useValue: mockNotificationService },
      { provide: ChangeDetectorRef, useValue: mockCdr }
    ], null as any);

    const comp = runInInjectionContext(injector, () => new SchemeMasterComponent());
    expect(comp.config.hideViewAction).toBe(true);
  });
});

