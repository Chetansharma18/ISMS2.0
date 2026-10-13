import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AspirantProfileFormComponent } from './aspirant-profile-form.component';
import { Router } from '@angular/router';
import { AspirantPortalService } from '../services/aspirant-portal.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('AspirantProfileFormComponent', () => {
  let fixture: ComponentFixture<AspirantProfileFormComponent>;
  let component: AspirantProfileFormComponent;
  let portalService: AspirantPortalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AspirantProfileFormComponent],
      providers: [
        {
          provide: Router,
          useValue: { navigate: () => Promise.resolve(true) }
        },
        AspirantPortalService,
        NotificationService
      ]
    });

    fixture = TestBed.createComponent(AspirantProfileFormComponent);
    component = fixture.componentInstance;
    portalService = TestBed.inject(AspirantPortalService);
    portalService.resetProfile();
    fixture.detectChanges();
  });

  it('initializes with 5 steps including Preview & Submit', () => {
    expect(component.wizardSteps.length).toBe(5);
    expect(component.wizardSteps[0].label).toBe('Identity Particulars');
    expect(component.wizardSteps[4].label).toBe('Preview & Submit');
    expect(component.currentStep()).toBe(1);
  });

  it('allows jumping directly to any step (1-5) via top numbers without validation blocking (demo mode)', () => {
    // Jump straight to Step 4
    component.goToStep(4);
    expect(component.currentStep()).toBe(4);
    expect(component.errorMessage()).toBe('');

    // Jump straight to Step 5 (Preview)
    component.goToStep(5);
    expect(component.currentStep()).toBe(5);

    // Jump back to Step 2
    component.goToStep(2);
    expect(component.currentStep()).toBe(2);
  });

  it('validates mandatory fields and populates stepErrors when clicking bottom proceed button', () => {
    // Attempting to proceed to step 2 with empty mandatory fields
    component.proceedToStep(2);

    expect(component.currentStep()).toBe(1); // blocked on bottom button
    expect(component.errorMessage()).toBe('Please fill all mandatory fields marked with *');
    expect(Object.keys(component.stepErrors()).length).toBeGreaterThan(0);
    expect(component.stepErrors()['aspirantName']).toBeDefined();
    expect(component.stepErrors()['aadhaarNo']).toBeDefined();
    expect(component.stepErrors()['aadhaarDocProof']).toBe('Aadhaar Card document proof is required');
  });

  it('clears specific field error when field changes', () => {
    component.proceedToStep(2);
    expect(component.stepErrors()['aspirantName']).toBeDefined();

    component.onFieldChange({ key: 'aspirantName', value: 'John Doe' });
    expect(component.stepErrors()['aspirantName']).toBeUndefined();
  });

  it('toggles preview sections in Step 5', () => {
    component.goToStep(5);
    expect(component.isPreviewSectionOpen(1)).toBe(true);

    component.togglePreviewSection(1);
    expect(component.isPreviewSectionOpen(1)).toBe(false);

    component.togglePreviewSection(1);
    expect(component.isPreviewSectionOpen(1)).toBe(true);
  });

  it('triggers top-right floating toast when validation fails on proceedToStep', () => {
    component.proceedToStep(2);
    expect(component.validationToast()).toEqual({
      message: 'Please fill all mandatory fields marked with *',
      type: 'error'
    });

    component.clearValidationToast();
    expect(component.validationToast()).toBeNull();
  });
});
