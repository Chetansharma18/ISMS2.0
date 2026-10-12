import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProfilePageComponent } from './profile-page.component';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { OtrFormService } from '../registration/services/otr-form.service';
import { OtrValidationService } from '../registration/services/otr-validation.service';
import { createExistingUserOtrData } from '../registration/models/otr-form.model';
import { signal } from '@angular/core';

describe('ProfilePageComponent - Sequential Steps', () => {
  let fixture: ComponentFixture<ProfilePageComponent>;
  let component: ProfilePageComponent;
  let otrFormService: OtrFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        {
          provide: Router,
          useValue: { navigate: () => Promise.resolve(true) }
        },
        {
          provide: AuthService,
          useValue: { currentUser: signal({ role: 'new_user', isProfileComplete: false }) }
        },
        {
          provide: PermissionService,
          useValue: { hasRole: (role: string) => role === 'new_user' }
        }
      ]
    });

    fixture = TestBed.createComponent(ProfilePageComponent);
    component = fixture.componentInstance;
    otrFormService = TestBed.inject(OtrFormService);
    otrFormService.resetToInitialDraft();
    fixture.detectChanges();
  });

  it('only unlocks Step 1 when no steps are completed', () => {
    const list = component.sections();
    expect(list[0].isCompleted).toBe(false);
    expect(list[1].isCompleted).toBe(false);

    expect(component.isCurrentStep(1)).toBe(true);
    expect(component.isCurrentStep(2)).toBe(false);
    expect(component.isStepAccessible(1)).toBe(true);
    expect(component.isStepAccessible(2)).toBe(false);

    const el = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll('button')).map(b => b.textContent?.trim());
    expect(buttons).toContain('Continue Step');
    expect(buttons).not.toContain('Start Step');

    const lockedSpans = el.querySelectorAll('span');
    const hasLocked = Array.from(lockedSpans).some(s => s.textContent?.includes('Locked'));
    expect(hasLocked).toBe(false);
  });

  it('unlocks Step 2 only after Step 1 is completed', () => {
    // Fill out mandatory step 1 data using valid mock dataset
    otrFormService.updateStep1(createExistingUserOtrData().step1);
    fixture.detectChanges();

    const list = component.sections();
    expect(list[0].isCompleted).toBe(true);
    expect(list[1].isCompleted).toBe(false);

    expect(component.isCurrentStep(2)).toBe(true);
    expect(component.isStepAccessible(2)).toBe(true);
    expect(component.isStepAccessible(3)).toBe(false);
  });
});
