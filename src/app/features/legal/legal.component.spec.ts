import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';

describe('Legal Components', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyComponent, TermsAndConditionsComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renders PrivacyPolicyComponent with statutory sections', () => {
    const fixture: ComponentFixture<PrivacyPolicyComponent> = TestBed.createComponent(PrivacyPolicyComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Privacy Policy');
    expect(compiled.textContent).toContain('Rajasthan Skill and Livelihoods Development Corporation');
    expect(compiled.textContent).toContain('Information Collection and Identity Verification');
    expect(compiled.textContent).toContain('Information Security & Encryption');
  });

  it('renders TermsAndConditionsComponent with legal sections', () => {
    const fixture: ComponentFixture<TermsAndConditionsComponent> = TestBed.createComponent(TermsAndConditionsComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Terms and Conditions');
    expect(compiled.textContent).toContain('Acceptance of Terms');
    expect(compiled.textContent).toContain('One-Time Registration (OTR)');
    expect(compiled.textContent).toContain('Biometric Attendance & Training Center Compliance');
  });
});
