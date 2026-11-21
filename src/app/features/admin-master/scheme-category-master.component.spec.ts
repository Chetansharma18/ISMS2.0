import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { SchemeCategoryMasterComponent } from './scheme-category-master.component';
import { SectorMasterComponent } from './sector-master.component';

describe('SchemeCategoryMaster & SectorMaster - Action View Configuration', () => {
  it('hides View action in Scheme Category Master', () => {
    const comp = new SchemeCategoryMasterComponent();
    expect(comp.config.hideViewAction).toBe(true);
  });

  it('hides View action in Sector Master', () => {
    const comp = new SectorMasterComponent();
    expect(comp.config.hideViewAction).toBe(true);
  });
});
