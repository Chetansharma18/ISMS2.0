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

  it('calculates word count accurately and validates 250 word limit in remark mode', () => {
    const comp = runInInjectionContext(injector, () => {
      const c = new ScrutinyDecisionModalComponent();
      (c as any).mode = signal('remark');
      (c as any).initialRemark = signal('');
      return c;
    });

    expect(comp.getWordCount('')).toBe(0);
    expect(comp.getWordCount('   ')).toBe(0);
    expect(comp.getWordCount('All documents verified successfully.')).toBe(4);

    // Empty remark is invalid
    (comp as any).custom.set('');
    expect((comp as any).isValid()).toBe(false);

    // Normal remark under 250 words is valid
    (comp as any).custom.set('Proposal is satisfactory.');
    expect((comp as any).wordCount()).toBe(3);
    expect((comp as any).isValid()).toBe(true);

    // Over 250 words is invalid
    const words251 = Array(251).fill('word').join(' ');
    (comp as any).custom.set(words251);
    expect((comp as any).wordCount()).toBe(251);
    expect((comp as any).isValid()).toBe(false);

    // Exactly 250 words is valid
    const words250 = Array(250).fill('word').join(' ');
    (comp as any).custom.set(words250);
    expect((comp as any).wordCount()).toBe(250);
    expect((comp as any).isValid()).toBe(true);
  });
});
