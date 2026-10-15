import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AspirantProfileFormComponent } from './aspirant-profile-form.component';
import { Router } from '@angular/router';
import { AspirantPortalService } from '../services/aspirant-portal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

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
        NotificationService,
        AuthService
      ]
    });

    fixture = TestBed.createComponent(AspirantProfileFormComponent);
    component = fixture.componentInstance;
    portalService = TestBed.inject(AspirantPortalService);
    portalService.resetProfile();
    fixture.detectChanges();
  });

  it('initializes with 5 form sections for a one-page registration', () => {
    expect(component.formSections.length).toBe(5);
    expect(component.formSections[0].title).toBe('1. Personal Details');
    expect(component.formSections[1].title).toBe('2. Training and Employment Details');
    expect(component.formSections[2].title).toBe('3. Address Details');
    expect(component.formSections[3].title).toBe('4. Contact Details');
    expect(component.formSections[4].title).toBe('5. Upload and Consent');
  });

  it('contains all required fields across the 5 sections', () => {
    const totalFields = component.formSections.reduce((acc, sec) => acc + sec.fields.length, 0);
    expect(totalFields).toBe(28);

    // Section 1: 17 fields (with Other IDs and dynamic relationName)
    expect(component.formSections[0].fields.length).toBe(17);
    const sec1Keys = component.formSections[0].fields.map(f => f.key);
    expect(sec1Keys).toEqual([
      'aadhaarNo',
      'janaadhaarId',
      'otherIdType',
      'otherIdNo',
      'aspirantName',
      'gender',
      'relationType',
      'relationName',
      'motherName',
      'dob',
      'age',
      'religion',
      'category',
      'economicStatus',
      'educationalQualification',
      'specialAbility',
      'interestedSector'
    ]);

    // Other IDs options
    const otherIdField = component.formSections[0].fields.find(f => f.key === 'otherIdType');
    expect(otherIdField?.options?.map(o => o.value)).toEqual([
      'None',
      'PAN Card',
      'Voter ID (EPIC)',
      'Driving License',
      'Passport',
      'Ration Card'
    ]);

    // Relation type excludes Mother
    const relationField = component.formSections[0].fields.find(f => f.key === 'relationType');
    expect(relationField?.options?.map(o => o.value)).toEqual(['Father', 'Husband', 'Guardian']);

    // Relation name dynamic label and visibility
    const relationNameField = component.formSections[0].fields.find(f => f.key === 'relationName');
    expect(relationNameField).toBeDefined();
    if (typeof relationNameField?.label === 'function') {
      expect(relationNameField.label({ relationType: 'Father' } as any)).toBe("Father's Name");
      expect(relationNameField.label({ relationType: 'Husband' } as any)).toBe("Husband's Name");
    }

    // Section 2: 2 fields
    expect(component.formSections[1].fields.length).toBe(2);
    const sec2Keys = component.formSections[1].fields.map(f => f.key);
    expect(sec2Keys).toEqual(['trainingPreferredDistrict', 'employmentType']);

    // Employment type options
    const empField = component.formSections[1].fields.find(f => f.key === 'employmentType');
    expect(empField?.options?.map(o => o.value)).toEqual([
      'Wages Employment',
      'Self Employment',
      'Both Employment'
    ]);

    // Section 3: 4 fields
    expect(component.formSections[2].fields.length).toBe(4);
    const sec3Keys = component.formSections[2].fields.map(f => f.key);
    expect(sec3Keys).toEqual(['address', 'homeDistrict', 'ruralUrban', 'pincode']);

    // Section 4: 3 fields
    expect(component.formSections[3].fields.length).toBe(3);
    const sec4Keys = component.formSections[3].fields.map(f => f.key);
    expect(sec4Keys).toEqual(['mobileNo', 'altMobileNo', 'email']);

    // Section 5: 2 fields
    expect(component.formSections[4].fields.length).toBe(2);
    const sec5Keys = component.formSections[4].fields.map(f => f.key);
    expect(sec5Keys).toEqual(['candidatePhoto', 'termsAccepted']);

    // Candidate photo has type photo and 5MB limit
    const photoField = component.formSections[4].fields.find(f => f.key === 'candidatePhoto');
    expect(photoField?.type).toBe('photo');
    expect(photoField?.maxFileSizeMb).toBe(5);
  });

  it('auto-generates registrationNo on init if not already set', () => {
    expect(component.formData.registrationNo).toBeDefined();
    expect(component.formData.registrationNo).toContain('ASP/');
  });

  it('calculates age automatically when dob field changes', () => {
    component.onFieldChange({ key: 'dob', value: '2000-01-15', model: component.formData });
    expect(Number(component.formData.age)).toBeGreaterThan(20);
  });

  it('resets form when onResetForm is called', () => {
    component.formData.aspirantName = 'Test Candidate';
    component.onResetForm();
    expect(component.formData.aspirantName).toBe('');
    expect(portalService.isProfileComplete()).toBe(false);
  });
});
