import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Step1OrgDetailsComponent } from './step1-org-details.component';
import { FormSelectComponent } from '../../../../shared/components/form-controls/form-select/form-select.component';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import { createExistingUserOtrData, STATES_MASTER, DISTRICTS_BY_STATE } from '../../models/otr-form.model';

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

  it('verifies Bug 2: State / UT of Registration is clearable', () => {
    formService.updateStep1({ stateOfLegalReg: 'Rajasthan' });
    fixture.detectChanges();
    expect(component.data().stateOfLegalReg).toBe('Rajasthan');

    component.update('stateOfLegalReg', '');
    fixture.detectChanges();
    expect(component.data().stateOfLegalReg).toBe('');
  });

  it('verifies Bug 2: State / UT of Registration search input has a working clear option', () => {
    const selectDebugEls = fixture.debugElement.queryAll(By.directive(FormSelectComponent));
    const stateSelectDebugEl = selectDebugEls.find(de => de.componentInstance.label === 'State / UT of Registration');
    expect(stateSelectDebugEl).toBeDefined();

    const stateSelect = stateSelectDebugEl!.componentInstance as FormSelectComponent;
    stateSelect.isOpen.set(true);
    fixture.detectChanges();

    expect(stateSelect.shouldShowSearch()).toBe(true);
    const searchInputEl = stateSelectDebugEl!.nativeElement.querySelector('input[placeholder="Search options..."]') as HTMLInputElement;
    expect(searchInputEl).not.toBeNull();

    expect(stateSelectDebugEl!.nativeElement.querySelector('.form-select-search-clear')).toBeNull();

    stateSelect.searchQuery.set('Delhi');
    fixture.detectChanges();

    const clearBtn = stateSelectDebugEl!.nativeElement.querySelector('.form-select-search-clear') as HTMLButtonElement;
    expect(clearBtn).not.toBeNull();
    expect(clearBtn.getAttribute('aria-label')).toBe('Clear search');
    expect(stateSelect.filteredEntries().length).toBe(1);

    clearBtn.click();
    fixture.detectChanges();

    expect(stateSelect.searchQuery()).toBe('');
    expect(stateSelect.filteredEntries().length).toBeGreaterThan(1);
    expect(stateSelect.isOpen()).toBe(true);
  });

  it('verifies Bug 5: Preferred Sector label has no "for" attribute linking to toggle button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = Array.from(compiled.querySelectorAll('label'));
    const sectorLabel = labels.find(l => l.textContent?.includes('Preferred Sector'));
    expect(sectorLabel).toBeDefined();
    expect(sectorLabel?.getAttribute('for')).toBeNull();
  });

  it('verifies Bug 6: Date of Registration label has no "for" attribute linking to date input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = Array.from(compiled.querySelectorAll('label'));
    const dateLabel = labels.find(l => l.textContent?.includes('Date of Registration'));
    expect(dateLabel).toBeDefined();
    expect(dateLabel?.getAttribute('for')).toBeNull();
  });

  it('verifies Bug 6: Registration Number label has no "for" attribute linking to input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = Array.from(compiled.querySelectorAll('label'));
    const regLabel = labels.find(l => l.querySelector('span')?.textContent?.trim() === 'Registration Number');
    expect(regLabel).toBeDefined();
    expect(regLabel?.getAttribute('for')).toBeNull();
  });

  it('verifies Bug 7: Contact number rejects invalid mobile numbers', () => {
    formService.updateStep1({ contactNo: '123' });
    component.markTouched('contactNo');
    fixture.detectChanges();
    expect(component.getFieldError('contactNo')).toBe('Invalid 10-digit mobile number');

    formService.updateStep1({ contactNo: '9876543210' });
    fixture.detectChanges();
    expect(component.getFieldError('contactNo')).toBeUndefined();
  });

  it('verifies Bug 8: Email validation displays error for invalid formats', () => {
    formService.updateStep1({ emailId: 'not-an-email' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBe('Invalid Email ID format');

    formService.updateStep1({ emailId: 'dfghgj' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBe('Invalid Email ID format');

    formService.updateStep1({ emailId: '86rnvhgxchgn@gfhkj.cc' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBe('Invalid Email ID format');

    formService.updateStep1({ emailId: '86rnvhgxchgnb@gfhkj.cc' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBe('Invalid Email ID format');

    formService.updateStep1({ emailId: 'info@validcompany.com' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBeUndefined();

    formService.updateStep1({ emailId: 'contact@skilltech.org' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBeUndefined();
  });

  it('verifies Bug 9: Website field validates URL format when provided', () => {
    formService.updateStep1({ website: 'invalid url with spaces' });
    fixture.detectChanges();
    expect(component.getFieldError('website')).toBe('Invalid Website URL format');

    formService.updateStep1({ website: '1' });
    fixture.detectChanges();
    expect(component.getFieldError('website')).toBe('Invalid Website URL format');

    formService.updateStep1({ website: 'ab.dc' });
    fixture.detectChanges();
    expect(component.getFieldError('website')).toBe('Invalid Website URL format');

    formService.updateStep1({ website: 'skilltech.org' });
    fixture.detectChanges();
    expect(component.getFieldError('website')).toBeUndefined();

    formService.updateStep1({ website: 'https://skilltech.org' });
    fixture.detectChanges();
    expect(component.getFieldError('website')).toBeUndefined();

    formService.updateStep1({ website: 'https://www.validwebsite.gov.in' });
    fixture.detectChanges();
    expect(component.getFieldError('website')).toBeUndefined();

    // Optional when empty
    formService.updateStep1({ website: '' });
    fixture.detectChanges();
    expect(component.getFieldError('website')).toBeUndefined();
  });

  it('verifies Bug 10: PIN Code validates 6-digit numeric pattern', () => {
    formService.updateStep1({ registeredPincode: '123' });
    component.markTouched('registeredPincode');
    fixture.detectChanges();
    expect(component.getFieldError('registeredPincode')).toBe('Invalid 6-digit PIN Code');

    formService.updateStep1({ registeredPincode: '302001' });
    fixture.detectChanges();
    expect(component.getFieldError('registeredPincode')).toBeUndefined();
  });

  it('verifies Bug 11 & 12: All 36 States/UTs populate districts for Registered and Office Address', () => {
    expect(STATES_MASTER.length).toBe(36);

    for (const state of STATES_MASTER) {
      expect(DISTRICTS_BY_STATE[state]).toBeDefined();
      expect(DISTRICTS_BY_STATE[state].length).toBeGreaterThan(0);

      // Verify Registered Address dynamic update
      component.onRegisteredStateChange(state);
      fixture.detectChanges();
      expect(component.registeredDistricts().length).toBeGreaterThan(0);
      expect(component.registeredDistricts()).toEqual(DISTRICTS_BY_STATE[state]);

      // Verify Office Address dynamic update
      component.onOfficeStateChange(state);
      fixture.detectChanges();
      expect(component.officeDistricts().length).toBeGreaterThan(0);
      expect(component.officeDistricts()).toEqual(DISTRICTS_BY_STATE[state]);
    }
  });

  it('verifies Bug 8: Date of Registration limits picker to today and rejects future dates', () => {
    expect(component.maxRegistrationDate).toBe(new Date().toISOString().split('T')[0]);

    // Future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureStr = futureDate.toISOString().split('T')[0];

    formService.updateStep1({ dateOfRegistration: futureStr });
    fixture.detectChanges();
    expect(component.getFieldError('dateOfRegistration')).toBe('Date cannot be in the future');

    // Valid past/current date
    formService.updateStep1({ dateOfRegistration: '2020-01-15' });
    fixture.detectChanges();
    expect(component.getFieldError('dateOfRegistration')).toBeUndefined();
  });
});
