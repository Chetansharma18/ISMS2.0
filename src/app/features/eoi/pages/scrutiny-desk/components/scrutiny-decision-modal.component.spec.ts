import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { ScrutinyDecisionModalComponent } from './scrutiny-decision-modal.component';

const injector = createEnvironmentInjector([provideZonelessChangeDetection()], null as any);

describe('ScrutinyDecisionModalComponent', () => {
  it('deduplicates repetitive grades so each grade appears only once', () => {
    const rawGrades = [
      { grade: 'A+', minimum: 85, maximum: 100, range: '85 - 100', schemeName: 'Scheme 1' },
      { grade: 'A+', minimum: 85, maximum: 100, range: '85 - 100', schemeName: 'Scheme 2' },
      { grade: 'A+', minimum: 85, maximum: 100, range: '85 - 100', schemeName: 'Scheme 3' },
      { grade: 'A', minimum: 70, maximum: 84, range: '70 - 84', schemeName: 'Scheme 1' },
      { grade: 'A', minimum: 70, maximum: 84, range: '70 - 84', schemeName: 'Scheme 2' },
      { grade: 'B', minimum: 55, maximum: 69, range: '55 - 69', schemeName: 'Scheme 1' },
      { grade: 'B', minimum: 55, maximum: 69, range: '55 - 69', schemeName: 'Scheme 2' }
    ];

    const gradesSignal = signal(rawGrades);

    const comp = runInInjectionContext(injector, () => {
      const c = new ScrutinyDecisionModalComponent();
      (c as any).grades = gradesSignal;
      return c;
    });

    const unique = comp.uniqueGrades();
    expect(unique.map(g => g.grade)).toEqual(['A+', 'A', 'B']);
  });
});
