import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Step4BankDetailsComponent } from './step4-bank-details.component';
import { OtrFormService } from '../../services/otr-form.service';
import { OtrValidationService } from '../../services/otr-validation.service';

describe('Step4BankDetailsComponent - Validation & Search (Bugs 5, 6, 7, 9)', () => {
  let fixture: ComponentFixture<Step4BankDetailsComponent>;
  let component: Step4BankDetailsComponent;
  let formService: OtrFormService;
  let validationService: OtrValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Step4BankDetailsComponent],
      providers: [OtrFormService, OtrValidationService]
    });

    formService = TestBed.inject(OtrFormService);
    validationService = TestBed.inject(OtrValidationService);
    formService.resetToInitialDraft();

    fixture = TestBed.createComponent(Step4BankDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders section headings for Bank & Account Details and Verification Document', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1. Bank & Account Details');
    expect(compiled.textContent).toContain('2. Bank Verification Document');
  });

  it('validates required fields on blur or submit (Bug 7)', () => {
    expect(component.getFieldError('bankName')).toBeUndefined();
    expect(component.getFieldError('branchName')).toBeUndefined();
    expect(component.getFieldError('accountHolderName')).toBeUndefined();
    expect(component.getFieldError('accountNo')).toBeUndefined();
    expect(component.getFieldError('ifscCode')).toBeUndefined();

    // Blur on branchName marks touched and shows required
    component.markTouched('branchName');
    fixture.detectChanges();
    expect(component.getFieldError('branchName')).toBe('Branch Name is required');

    // Blur on accountNo marks touched and shows required
    component.markTouched('accountNo');
    fixture.detectChanges();
    expect(component.getFieldError('accountNo')).toBe('Bank Account Number is required');

    // Blur on ifscCode marks touched and shows required
    component.markTouched('ifscCode');
    fixture.detectChanges();
    expect(component.getFieldError('ifscCode')).toBe('IFSC Code is required');

    // Submit marks all required fields
    validationService.markStepSubmitted(3);
    fixture.detectChanges();
    expect(component.getFieldError('bankName')).toBe('Bank Name is required');
    expect(component.getFieldError('accountHolderName')).toBe('Account Holder Name is required');
  });

  it('validates account number, IFSC code, and MICR code format on input (Bug 7)', () => {
    // Account Number format (9 to 18 digits)
    formService.updateStep4({ accountNo: '1234' });
    fixture.detectChanges();
    expect(component.getFieldError('accountNo')).toBe('Invalid Account Number (9 to 18 digits)');

    formService.updateStep4({ accountNo: '123456789012' });
    fixture.detectChanges();
    expect(component.getFieldError('accountNo')).toBeUndefined();

    // IFSC Code format (e.g. SBIN0031804)
    formService.updateStep4({ ifscCode: 'INVALID' });
    fixture.detectChanges();
    expect(component.getFieldError('ifscCode')).toBe('Invalid IFSC Code (e.g. SBIN0031804)');

    formService.updateStep4({ ifscCode: 'SBIN0031804' });
    fixture.detectChanges();
    expect(component.getFieldError('ifscCode')).toBeUndefined();

    // MICR Code format (9 digits)
    formService.updateStep4({ micrCode: '123' });
    fixture.detectChanges();
    expect(component.getFieldError('micrCode')).toBe('Invalid MICR Code (9 digits)');

    formService.updateStep4({ micrCode: '123456789' });
    fixture.detectChanges();
    expect(component.getFieldError('micrCode')).toBeUndefined();
  });

  it('loads BANKS_MASTER options for bank selection (Bug 5)', () => {
    expect(component.banks.length).toBeGreaterThan(0);
    expect(component.banks.some(b => b.includes('State Bank of India'))).toBe(true);
  });
});
