import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { MasterFilterBarComponent } from './master-filter-bar.component';
import { MasterFilterConfig } from '../master-crud/master-crud.types';

describe('MasterFilterBarComponent', () => {
  function createComponent(): MasterFilterBarComponent {
    const injector = createEnvironmentInjector([], null as any);
    return runInInjectionContext(injector, () => new MasterFilterBarComponent());
  }

  it('instantiates and initializes default signals', () => {
    const comp = createComponent();
    expect(comp.searchQuery()).toBe('');
    expect(comp.status()).toBe('ALL');
    expect(comp.filterValues()).toEqual({});
    expect(comp.isFilterActive()).toBe(false);
  });

  it('detects when filter is active via search or filter values', () => {
    const comp = createComponent();
    expect(comp.isFilterActive()).toBe(false);

    comp.searchQuery.set('jaipur');
    expect(comp.isFilterActive()).toBe(true);

    comp.searchQuery.set('');
    expect(comp.isFilterActive()).toBe(false);

    comp.status.set('Active');
    expect(comp.isFilterActive()).toBe(true);

    comp.status.set('ALL');
    expect(comp.isFilterActive()).toBe(false);

    comp.setFilterValue('sector', 'Healthcare');
    expect(comp.isFilterActive()).toBe(true);
  });

  it('resolves static and function filter options properly', () => {
    const comp = createComponent();
    const staticFilter: MasterFilterConfig = {
      key: 'static',
      label: 'Static',
      options: ['Opt 1', 'Opt 2']
    };
    const dynamicFilter: MasterFilterConfig = {
      key: 'dynamic',
      label: 'Dynamic',
      options: () => ['Dyn 1', 'Dyn 2']
    };

    expect(comp.resolveFilterOptions(staticFilter)).toEqual(['Opt 1', 'Opt 2']);
    expect(comp.resolveFilterOptions(dynamicFilter)).toEqual(['Dyn 1', 'Dyn 2']);
  });

  it('resets all filters and emits reset event on onReset', () => {
    const comp = createComponent();
    let resetEmitted = false;
    comp.resetFilters.subscribe(() => {
      resetEmitted = true;
    });

    comp.searchQuery.set('test');
    comp.status.set('Inactive');
    comp.setFilterValue('scheme', 'MMKVY');

    expect(comp.isFilterActive()).toBe(true);

    comp.onReset();

    expect(comp.searchQuery()).toBe('');
    expect(comp.status()).toBe('ALL');
    expect(comp.filterValues()).toEqual({});
    expect(comp.isFilterActive()).toBe(false);
    expect(resetEmitted).toBe(true);
  });
});
