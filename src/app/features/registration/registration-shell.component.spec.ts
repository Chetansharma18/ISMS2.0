import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { RegistrationShellComponent } from './registration-shell.component';
import { OtrFormService } from './services/otr-form.service';
import { OtrValidationService } from './services/otr-validation.service';
import { createInitialOtrFormData, createExistingUserOtrData } from './models/otr-form.model';

describe('RegistrationShellComponent - Mandatory Validation & Stepper Guards (Bugs 9, 10, 11, 12)', () => {
  let fixture: ComponentFixture<RegistrationShellComponent>;
  let component: RegistrationShellComponent;
  let formService: OtrFormService;
  let validationService: OtrValidationService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationShellComponent],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationShellComponent);
    component = fixture.componentInstance;
    formService = TestBed.inject(OtrFormService);
    validationService = TestBed.inject(OtrValidationService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('initializes at step 1 with a clean validation state (Bug 12)', () => {
    expect(component.activeStep()).toBe(1);
    expect(validationService.submittedSteps().size).toBe(0);
  });

  it('prevents jumping forward to later steps when step 1 is incomplete (Bug 9)', () => {
    // Empty/incomplete form data
    const empty = createInitialOtrFormData();
    (formService as any)._formData.set(empty);

    // Attempt to jump to Step 2
    component.goToStep(2);
    expect(component.activeStep()).toBe(1);
    expect(validationService.submittedSteps().has(1)).toBe(true);

    // Attempt to jump to Step 4 (Review & Submit)
    component.goToStep(4);
    expect(component.activeStep()).toBe(1);
  });

  it('allows backward navigation freely (Bugs 9 & 10)', () => {
    // Set valid form data so forward navigation works
    const valid = createExistingUserOtrData();
    (formService as any)._formData.set(valid);

    component.goToStep(2);
    expect(component.activeStep()).toBe(2);

    component.goToStep(1);
    expect(component.activeStep()).toBe(1);
  });

  it('blocks nextStep() when mandatory fields are missing on current step (Bug 10)', () => {
    const empty = createInitialOtrFormData();
    (formService as any)._formData.set(empty);

    // At step 1 with empty fields
    component.activeStep.set(1);
    component.nextStep();

    expect(component.activeStep()).toBe(1);
    expect(validationService.submittedSteps().has(1)).toBe(true);
  });

  it('guards Register button and blocks submission when steps are incomplete (Bug 11)', () => {
    const empty = createInitialOtrFormData();
    (formService as any)._formData.set(empty);

    expect(component.canSubmit()).toBe(false);

    component.activeStep.set(4);
    component.submitApplication();

    // Submission should be blocked and user redirected to step 1
    expect(component.submittedRegId()).toBeNull();
    expect(component.activeStep()).toBe(1);
  });

  it('clears submittedSteps when leaving or destroying component (Bug 12)', () => {
    validationService.markStepSubmitted(1);
    expect(validationService.submittedSteps().size).toBe(1);

    component.ngOnDestroy();
    expect(validationService.submittedSteps().size).toBe(0);
  });
});
