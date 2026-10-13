import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { GradingMasterComponent } from './grading-master.component';

describe('GradingMasterComponent', () => {
  it('initializes config with correct title, entityLabel, and columns', () => {
    const comp = new GradingMasterComponent();
    expect(comp.config.title).toBe('Grading Master');
    expect(comp.config.entityLabel).toBe('Grade');
    expect(comp.config.dataKey).toBe('GRADING_MASTERS');

    const columnKeys = comp.config.columns.map((c) => c.key);
    expect(columnKeys).toContain('sNo');
    expect(columnKeys).toContain('grade');
    expect(columnKeys).toContain('range');
  });

  it('configures form fields for grade, minimum, and maximum', () => {
    const comp = new GradingMasterComponent();
    const gradeField = comp.config.fields.find((f) => f.key === 'grade');
    const minField = comp.config.fields.find((f) => f.key === 'minimum');
    const maxField = comp.config.fields.find((f) => f.key === 'maximum');

    expect(gradeField).toBeDefined();
    expect(gradeField?.type).toBe('text');
    expect(gradeField?.required).toBe(true);

    expect(minField).toBeDefined();
    expect(minField?.type).toBe('number');
    expect(minField?.required).toBe(true);

    expect(maxField).toBeDefined();
    expect(maxField?.type).toBe('number');
    expect(maxField?.required).toBe(true);
  });

  it('builds payload and calculates range correctly from form data', () => {
    const comp = new GradingMasterComponent();
    const payload = comp.config.buildPayload({
      grade: 'A+',
      minimum: 85,
      maximum: 100
    });

    expect(payload.grade).toBe('A+');
    expect(payload.minimum).toBe(85);
    expect(payload.maximum).toBe(100);
    expect(payload.range).toBe('85 - 100');
    expect(payload.status).toBe('Active');
  });
});
