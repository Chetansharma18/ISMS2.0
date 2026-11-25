import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DataEngineService } from '../../core/services/data-engine.service';
import { CourseMasterComponent } from './course-master.component';

/** The screen loads the Sector Master's names on creation: create it in an injection context with a stub. */
function create(): CourseMasterComponent {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: DataEngineService, useValue: { for: () => ({ getAll: () => of([]) }) } }]
  });
  return TestBed.runInInjectionContext(() => new CourseMasterComponent());
}

describe('CourseMasterComponent', () => {
  it('configures exactly 6 compact table columns to prevent table slider', () => {
    const comp = create();
    expect(comp.config.title).toBe('Course Master');
    expect(comp.config.entityLabel).toBe('Course');
    expect(comp.config.dataKey).toBe('COURSES');

    // Exactly 6 primary table columns: sNo, jobRoleName, jobRoleCode, sector, nsqfLevel, totalQpHours
    expect(comp.config.columns.length).toBe(6);
    const keys = comp.config.columns.map(c => c.key);
    expect(keys).toEqual(['sNo', 'jobRoleName', 'jobRoleCode', 'sector', 'nsqfLevel', 'totalQpHours']);
  });

  it('provides all 12+ comprehensive detail columns for the View modal', () => {
    const comp = create();
    expect(comp.config.viewColumns).toBeDefined();
    expect(comp.config.viewColumns!.length).toBeGreaterThanOrEqual(12);

    const viewKeys = comp.config.viewColumns!.map(c => c.key);
    expect(viewKeys).toContain('sector');
    expect(viewKeys).toContain('jobRoleName');
    expect(viewKeys).toContain('jobRoleCode');
    expect(viewKeys).toContain('version');
    expect(viewKeys).toContain('nsqfLevel');
    expect(viewKeys).toContain('commonNormsCategory');
    expect(viewKeys).toContain('theoryDurationHours');
    expect(viewKeys).toContain('practicalOjtDurationHours');
    expect(viewKeys).toContain('itSoftSkillTrainingHours');
    expect(viewKeys).toContain('totalQpHours');
    expect(viewKeys).toContain('courseValidUpToDate');
    expect(viewKeys).toContain('remark');
  });

  it('includes sector dropdown filter on table top', () => {
    const comp = create();
    expect(comp.config.filters).toBeDefined();
    const sectorFilter = comp.config.filters!.find(f => f.key === 'sector');
    expect(sectorFilter).toBeDefined();
    expect(sectorFilter?.label).toBe('Sector');
  });
});
