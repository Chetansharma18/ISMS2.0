import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { HelpSupportComponent } from './help-support.component';
import { DataEngineService } from '../../core/services/data-engine.service';
import { AuthService } from '../../core/auth/auth.service';
import { OtrFormService } from '../registration/services/otr-form.service';

describe('HelpSupportComponent - Standalone Government Help & Support Page', () => {
  let fixture: ComponentFixture<HelpSupportComponent>;
  let component: HelpSupportComponent;
  let router: Router;
  let dataEngine: DataEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpSupportComponent],
      providers: [
        provideRouter([
          { path: '', children: [] }
        ]),
        DataEngineService,
        AuthService,
        OtrFormService
      ]
    }).compileComponents();

    dataEngine = TestBed.inject(DataEngineService);
    // Return synchronous observable without delay for testing
    vi.spyOn(dataEngine, 'create').mockImplementation((_key: string, payload: any) => of({ id: 999, ...payload }));

    fixture = TestBed.createComponent(HelpSupportComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('renders standalone header with ISMS branding, department name, and Back to Home button', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ISMS 2.0');
    expect(el.textContent).toContain('Rajasthan Skill and Livelihoods Development Corporation');
    expect(el.textContent).toContain('Back to Home');

    const homeBtn = el.querySelector('button[aria-label="Back to Home"]');
    expect(homeBtn).not.toBeNull();
  });

  it('navigates to home when goHome() is called', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.goHome();
    expect(spy).toHaveBeenCalledWith(['/']);
  });

  it('displays verified contact helpdesk numbers, email, and working hours', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('0141-2716091');
    expect(el.textContent).toContain('0141-2792600');
    expect(el.textContent).toContain('support@isms.rajasthan.gov.in');
    expect(el.textContent).toContain('Monday to Friday, 9:30 AM – 6:00 PM');
  });

  it('displays exactly 5 official FAQs, all collapsed by default', () => {
    expect(component.faqs.length).toBe(5);
    expect(component.expandedFaqId()).toBeNull();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('How do I log in to the ISMS 2.0 portal?');
    expect(el.textContent).toContain('How do I complete One-Time Registration (OTR)?');
    expect(el.textContent).toContain('How can I apply for an EOI or scheme?');
    expect(el.textContent).toContain('How can I check my application status?');
    expect(el.textContent).toContain('What should I do if I face a technical issue?');
  });

  it('allows expanding only one FAQ at a time and toggles when clicked again', () => {
    component.toggleFaq('faq-1');
    expect(component.expandedFaqId()).toBe('faq-1');

    component.toggleFaq('faq-2');
    expect(component.expandedFaqId()).toBe('faq-2');

    component.toggleFaq('faq-2');
    expect(component.expandedFaqId()).toBeNull();
  });

  it('validates mandatory fields on Submit a Query / Complaint form', () => {
    // Clear any prefilled values to test empty validation
    component.clearFormFields();
    expect(component.isSubmitted()).toBe(false);
    expect(component.getFieldError('fullName')).toBe('');

    component.onSubmit();
    expect(component.isSubmitted()).toBe(true);

    expect(component.getFieldError('fullName')).toBe('Full Name is required.');
    expect(component.getFieldError('mobileNumber')).toBe('Mobile Number is required.');
    expect(component.getFieldError('requestType')).toBe('Please select a request type.');
    expect(component.getFieldError('description')).toBe('Description is required.');
  });

  it('validates mobile number format and description length accurately', () => {
    component.fullName.set('Anoop Sharma');
    component.mobileNumber.set('12345');
    expect(component.validateMobile()).toBe('Enter a valid 10-digit Indian mobile number.');

    component.mobileNumber.set('9876543210');
    expect(component.validateMobile()).toBe('');

    component.email.set('invalid-email');
    expect(component.validateEmail()).toBe('Enter a valid email address.');

    component.email.set('anoop@example.com');
    expect(component.validateEmail()).toBe('');

    component.description.set('Short');
    expect(component.validateDescription()).toBe('Description must be at least 10 characters.');

    component.description.set('This is a valid detailed description explaining the technical issue encountered.');
    expect(component.validateDescription()).toBe('');
  });

  it('submits query successfully, generates reference number, and clears form fields', () => {
    component.fullName.set('Rajesh Kumar');
    component.mobileNumber.set('9876543210');
    component.email.set('rajesh@example.com');
    component.requestType.set('Technical Issue');
    component.description.set('Facing an issue when uploading agreement documents in EOI proposal.');

    component.onSubmit();

    expect(component.submittedRefNumber()).not.toBeNull();
    expect(component.submittedRefNumber()!).toMatch(/^ISMS-REQ-2026-\d{4}$/);

    expect(component.fullName()).toBe('');
    expect(component.mobileNumber()).toBe('');
    expect(component.email()).toBe('');
    expect(component.requestType()).toBe('');
    expect(component.description()).toBe('');
  });

  it('resets confirmation and form state when resetForm() is called', () => {
    component.fullName.set('Rajesh Kumar');
    component.mobileNumber.set('9876543210');
    component.requestType.set('General Query');
    component.description.set('Need information on upcoming solar training batches.');
    component.onSubmit();

    expect(component.submittedRefNumber()).not.toBeNull();

    component.resetForm();
    expect(component.submittedRefNumber()).toBeNull();
    expect(component.isSubmitted()).toBe(false);
  });
});
