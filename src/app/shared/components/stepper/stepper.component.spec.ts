import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperComponent>;
  let component: StepperComponent;

  const steps = [{ label: 'Fee' }, { label: 'Profile' }, { label: 'Docs' }];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StepperComponent] });
    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
    component.steps = steps;
    component.currentStep = 2;
    fixture.detectChanges();
  });

  const buttons = () => Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

  it('renders one button per step', () => {
    expect(buttons().length).toBe(3);
  });

  it('marks earlier steps completed and the current step with aria-current', () => {
    expect(component.isCompleted(1)).toBe(true);
    expect(component.isCompleted(2)).toBe(false);
    expect(buttons()[1].getAttribute('aria-current')).toBe('step');
    expect(buttons()[0].getAttribute('aria-current')).toBeNull();
  });

  it('treats explicitly listed steps as completed even when ahead of the current one', () => {
    component.completedSteps = [3];
    expect(component.isCompleted(3)).toBe(true);
  });

  it('keeps aria-current on the last step even when it is also completed', () => {
    component.currentStep = 3;
    component.completedSteps = [3];
    fixture.componentRef.changeDetectorRef.detectChanges();
    expect(component.isCurrent(3)).toBe(true);
  });

  it('exposes an accessible name that includes completion state', () => {
    const text = buttons()[0].textContent ?? '';
    expect(text).toContain('Step 1: Fee (completed)');
  });

  it('emits the 1-based step number on click', () => {
    const emitted: number[] = [];
    component.stepClick.subscribe((n: number) => emitted.push(n));
    buttons()[2].click();
    expect(emitted).toEqual([3]);
  });

  describe('wizard variant (Organization Registration Form look)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('variant', 'wizard');
      fixture.detectChanges();
    });

    it('renders plain labels, one button per step, with the current step marked', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(buttons().length).toBe(3);
      expect(text).toContain('Fee');
      expect(text).not.toContain('1. Fee');
      expect(buttons()[1].getAttribute('aria-current')).toBe('step');
    });

    it('fills finished and active circles navy and leaves upcoming ones white', () => {
      expect(component.wizardCircleClass(1)).toContain('bg-navy');
      expect(component.wizardCircleClass(2)).toContain('bg-navy');
      expect(component.wizardCircleClass(3)).toContain('bg-white');
    });

    it('draws navy connectors only after finished steps', () => {
      const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('ol > li > span.flex-1'));
      expect(lines.length).toBe(2);
      expect(lines[0].className).toContain('bg-navy');
      expect(lines[1].className).toContain('bg-slate-200');
    });

    it('emits the 1-based step number on click', () => {
      const emitted: number[] = [];
      component.stepClick.subscribe((n: number) => emitted.push(n));
      buttons()[0].click();
      expect(emitted).toEqual([1]);
    });
  });

  it('uses the success colour for completed circles and brand colour for the current one', () => {
    expect(component.circleClass(1)).toContain('bg-emerald-600');
    expect(component.circleClass(2)).toContain('bg-primary');
    expect(component.circleClass(3)).toContain('bg-slate-200');
  });
});
