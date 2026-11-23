import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TenderListComponent } from './tender-list.component';

const injector = createEnvironmentInjector([provideZonelessChangeDetection()], null as any);
function createComponent(): TenderListComponent {
  return runInInjectionContext(injector, () => new TenderListComponent());
}

describe('TenderListComponent', () => {
  it('defines the clean list columns without Remarks, Appeal Request, or Appeal Response', () => {
    const component = createComponent();
    const columns = component.tenderColumns;
    const keys = columns.map(c => c.key);
    const labels = columns.map(c => c.label);

    // Verify removed columns are absent
    expect(keys).not.toContain('rejectionReason');
    expect(keys).not.toContain('appeal');
    expect(keys).not.toContain('shortfall');
    expect(labels).not.toContain('Remarks');
    expect(labels).not.toContain('Appeal Request');
    expect(labels).not.toContain('Appeal Response');

    // Verify remaining required columns are present in order
    expect(keys).toEqual([
      '$index',
      'appRef',
      'schemeTitle',
      'schemeCategory',
      'appliedDate',
      'submittedStatus',
      'view'
    ]);
    expect(labels).toEqual([
      'S. No.',
      'Application Ref. No.',
      'Scheme Name',
      'Scheme Category',
      'Applied Date',
      'Status',
      'Action'
    ]);
  });
});
