import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { UserRoleMasterComponent } from './user-role-master.component';

describe('UserRoleMasterComponent', () => {
  it('configures role management correctly with hidden view action and consistent breadcrumbs', () => {
    const comp = new UserRoleMasterComponent();
    expect(comp.config.title).toBe('Role Management');
    expect(comp.config.entityLabel).toBe('Role Type');
    expect(comp.config.dataKey).toBe('USER_ROLES');
    expect(comp.config.hideViewAction).toBe(true);
    expect(comp.config.breadcrumbs).toEqual([
      { label: 'Home', url: '/' },
      { label: 'User Management' },
      { label: 'Role Management' }
    ]);
  });
});
