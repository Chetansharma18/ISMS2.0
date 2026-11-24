import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Step3AuthPersonComponent } from './step3-auth-person.component';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';
import { createExistingUserOtrData } from '../../models/otr-form.model';

describe('Step3AuthPersonComponent - Heading-wise Grouping & Dynamic Identity Verification', () => {
  let fixture: ComponentFixture<Step3AuthPersonComponent>;
  let component: Step3AuthPersonComponent;
  let formService: OtrFormService;
  let validationService: OtrValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Step3AuthPersonComponent],
      providers: [OtrFormService, OtrValidationService]
    });

    formService = TestBed.inject(OtrFormService);
    validationService = TestBed.inject(OtrValidationService);
    formService.resetToInitialDraft();

    fixture = TestBed.createComponent(Step3AuthPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders all four continuous section headings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1. Personal Information');
    expect(compiled.textContent).toContain('2. Contact Information');
    expect(compiled.textContent).toContain('3. Identity Verification');
    expect(compiled.textContent).toContain('4. Authorization Documents');
  });

  it('completely removes Date of Birth and Age fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Date of Birth');
    expect(compiled.textContent).not.toContain('Age');
    expect(compiled.textContent).not.toContain('Auto-calculated');
  });

  it('updates document number label and placeholder dynamically based on selected document type', () => {
    component.onDocTypeChange('Aadhaar Card');
    fixture.detectChanges();
    expect(component.currentDocConfig().label).toBe('Aadhaar Number');
    expect(component.currentDocConfig().placeholder).toBe('Enter Aadhaar number');

    component.onDocTypeChange('PAN Card');
    fixture.detectChanges();
    expect(component.currentDocConfig().label).toBe('PAN Number');
    expect(component.currentDocConfig().placeholder).toBe('Enter PAN number');

    component.onDocTypeChange('Voter ID Card');
    fixture.detectChanges();
    expect(component.currentDocConfig().label).toBe('Voter ID Number');
    expect(component.currentDocConfig().placeholder).toBe('Enter Voter ID number');

    component.onDocTypeChange('Jan Aadhaar Card');
    fixture.detectChanges();
    expect(component.currentDocConfig().label).toBe('Jan Aadhaar Number');
    expect(component.currentDocConfig().placeholder).toBe('Enter Jan Aadhaar number');

    component.onDocTypeChange('Passport');
    fixture.detectChanges();
    expect(component.currentDocConfig().label).toBe('Passport Number');
    expect(component.currentDocConfig().placeholder).toBe('Enter passport number');
  });

  it('clears previous document number and file upload when document type changes', () => {
    // Populate Aadhaar Card data
    formService.updateStep3({
      firstName: 'Ramesh',
      mobileNo: '9876543210',
      identityDocType: 'Aadhaar Card',
      identityDocNumber: '765432109876',
      aadhaarNo: '765432109876',
      idProofDoc: {
        fileName: 'aadhaar.pdf',
        fileSize: '1.0 MB',
        uploadDate: '2026-01-01',
        status: 'uploaded'
      }
    });
    fixture.detectChanges();

    expect(component.currentDocNumber()).toBe('765432109876');
    expect(formService.step3().idProofDoc).not.toBeNull();

    // Change doc type to PAN Card
    component.onDocTypeChange('PAN Card');
    fixture.detectChanges();

    expect(component.selectedDocType()).toBe('PAN Card');
    expect(component.currentDocNumber()).toBe('');
    expect(formService.step3().idProofDoc).toBeNull();
    // Personal info should be preserved
    expect(formService.step3().firstName).toBe('Ramesh');
    expect(formService.step3().mobileNo).toBe('9876543210');
  });

  it('maps dynamic document numbers to statutory model properties for backward compatibility', () => {
    component.onDocTypeChange('PAN Card');
    component.onDocNumberChange('abcde1234f');
    fixture.detectChanges();

    const s3 = formService.step3();
    expect(s3.identityDocNumber).toBe('abcde1234f');
    expect(s3.pan).toBe('ABCDE1234F');

    component.onDocTypeChange('Aadhaar Card');
    component.onDocNumberChange('987654321012');
    fixture.detectChanges();

    const s3Updated = formService.step3();
    expect(s3Updated.identityDocNumber).toBe('987654321012');
    expect(s3Updated.aadhaarNo).toBe('987654321012');
  });

  it('validates required fields after submission or when touched on blur (Bug 3)', () => {
    expect(component.getFieldError('firstName')).toBeUndefined();
    expect(component.getFieldError('mobileNo')).toBeUndefined();
    expect(component.getFieldError('emailId')).toBeUndefined();

    // Blur on firstName marks touched and shows required
    component.markTouched('firstName');
    fixture.detectChanges();
    expect(component.getFieldError('firstName')).toBe('Authorized Person First Name is required');
    expect(component.getFieldError('mobileNo')).toBeUndefined();

    // Blur on mobileNo marks touched and shows required
    component.markTouched('mobileNo');
    fixture.detectChanges();
    expect(component.getFieldError('mobileNo')).toBe('Mobile Number is required');

    // On submission, all required fields show
    validationService.markStepSubmitted(2);
    fixture.detectChanges();

    expect(component.getFieldError('emailId')).toBe('Email Address is required');
  });

  it('validates format errors on input for mobile, email, and identity documents (Bug 2 & 3)', () => {
    // Mobile format
    formService.updateStep3({ mobileNo: '12345' });
    fixture.detectChanges();
    expect(component.getFieldError('mobileNo')).toBe('Invalid 10-digit Mobile Number');

    formService.updateStep3({ mobileNo: '9876543210' });
    fixture.detectChanges();
    expect(component.getFieldError('mobileNo')).toBeUndefined();

    // Email format (Bug 3)
    formService.updateStep3({ emailId: 'invalid-email' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBe('Invalid Email Address format');

    formService.updateStep3({ emailId: '86rnvhgxchgnb@gfhkj.cc' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBe('Invalid Email Address format');

    formService.updateStep3({ emailId: 'dfghgj' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBe('Invalid Email Address format');

    formService.updateStep3({ emailId: 'person@example.com' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBeUndefined();

    formService.updateStep3({ emailId: 'contact@skilltech.org' });
    fixture.detectChanges();
    expect(component.getFieldError('emailId')).toBeUndefined();

    // PAN Card format (Bug 2)
    component.onDocTypeChange('PAN Card');
    component.onDocNumberChange('INVALID123');
    fixture.detectChanges();
    expect(component.getFieldError('identityDocNumber')).toBe('Invalid PAN format (e.g. ABCDE1234F)');

    component.onDocNumberChange('ABCDE1234F');
    fixture.detectChanges();
    expect(component.getFieldError('identityDocNumber')).toBeUndefined();

    // Aadhaar format
    component.onDocTypeChange('Aadhaar Card');
    component.onDocNumberChange('123');
    fixture.detectChanges();
    expect(component.getFieldError('identityDocNumber')).toBe('Invalid 12-digit Aadhaar Number');

    component.onDocNumberChange('123456789012');
    fixture.detectChanges();
    expect(component.getFieldError('identityDocNumber')).toBeUndefined();
  });

  it('populates existing user authorized person details correctly', () => {
    const existing = createExistingUserOtrData();
    formService.updateStep3(existing.step3);
    fixture.detectChanges();

    expect(component.data().name).toBe('Vikram Singh Mehta');
    expect(component.selectedDocType()).toBe('Aadhaar Card');
    expect(component.currentDocNumber()).toBe('765432109876');
    expect(component.data().mobileNo).toBe('9829154321');
    expect(component.data().authorizationLetterDoc).not.toBeNull();
  });
});
