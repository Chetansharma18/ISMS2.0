import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Step1OrgDetailsComponent } from './step1-org-details.component';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import { createExistingUserOtrData } from '../../models/otr-form.model';

describe('Step1OrgDetailsComponent - Heading-wise Grouping', () => {
  let fixture: ComponentFixture<Step1OrgDetailsComponent>;
  let component: Step1OrgDetailsComponent;
  let formService: OtrFormService;
  let validationService: OtrValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Step1OrgDetailsComponent],
      providers: [OtrFormService, OtrValidationService]
    });

    formService = TestBed.inject(OtrFormService);
    validationService = TestBed.inject(OtrValidationService);
    formService.resetToInitialDraft();

    fixture = TestBed.createComponent(Step1OrgDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders all four continuous section headings on the page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1. Basic Organisation Details');
    expect(compiled.textContent).toContain('2. Registration & Documents');
    expect(compiled.textContent).toContain('3. Contact Information');
    expect(compiled.textContent).toContain('4. Registered & Office Address');
  });

  it('shows conditional GST fields only when GST Registered is Yes', () => {
    formService.updateStep1({ gstRegistered: 'No' });
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('GSTIN / GST Registration Number');

    formService.updateStep1({ gstRegistered: 'Yes' });
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('GSTIN / GST Registration Number');
    expect(compiled.textContent).toContain('GST Registration Certificate');
  });

  it('shows conditional MSME fields only when MSME Registered is Yes', () => {
    formService.updateStep1({ msmeRegistered: 'No' });
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Udyam Registration Number');

    formService.updateStep1({ msmeRegistered: 'Yes' });
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Udyam Registration Number');
    expect(compiled.textContent).toContain('MSME / Udyam Certificate');
  });

  it('handles "Same as registered address" toggle and synchronizes fields', () => {
    formService.updateStep1({
      registeredAddress: '123 Main Street',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302001',
      sameAsRegistered: false,
      officeAddress: '',
      officeState: '',
      officeDistrict: '',
      officePincode: ''
    });

    component.toggleSameAsRegistered(true);

    const step1 = formService.step1();
    expect(step1.sameAsRegistered).toBe(true);
    expect(step1.officeAddress).toBe('123 Main Street');
    expect(step1.officeState).toBe('Rajasthan');
    expect(step1.officeDistrict).toBe('Jaipur');
    expect(step1.officePincode).toBe('302001');
  });

  it('displays field errors only after form submission is attempted', () => {
    // Before submission attempt, no errors shown
    expect(component.getFieldError('fullName')).toBeUndefined();

    // Mark step 1 submitted
    validationService.markStepSubmitted(1);
    fixture.detectChanges();

    expect(component.getFieldError('fullName')).toBe('Organization Name is required');
  });

  it('populates existing organisation details correctly', () => {
    const existing = createExistingUserOtrData();
    formService.updateStep1(existing.step1);
    fixture.detectChanges();

    expect(component.data().fullName).toBe(existing.step1.fullName);
    expect(component.data().registrationNumber).toBe(existing.step1.registrationNumber);
    expect(component.data().contactNo).toBe(existing.step1.contactNo);
    expect(component.data().registeredAddress).toBe(existing.step1.registeredAddress);
  });

  it('supports multiple preferred sectors selection', () => {
    formService.updateStep1({ preferredSector: 'Electronics, IT-ITeS, Healthcare' });
    fixture.detectChanges();

    expect(component.data().preferredSector).toBe('Electronics, IT-ITeS, Healthcare');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Preferred Sector');
  });
});
