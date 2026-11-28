import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { FooterComponent } from './footer.component';
import { EXTERNAL_LEGAL_URL } from '../sidebar/sidebar-nav.config';
import { formatDateMedium } from '../../../shared/utils/date.util';

describe('FooterComponent - Privacy Policy & Terms and Conditions External Redirect', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders Privacy Policy link with external URL opening in a new tab', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a'));
    const privacyLink = links.find(l => l.textContent?.includes('Privacy Policy')) as HTMLAnchorElement;

    expect(privacyLink).toBeDefined();
    expect(privacyLink.href).toBe(EXTERNAL_LEGAL_URL);
    expect(privacyLink.getAttribute('target')).toBe('_blank');
    expect(privacyLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders Terms & Conditions link with external URL opening in a new tab', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a'));
    const termsLink = links.find(l => l.textContent?.includes('Terms & Conditions')) as HTMLAnchorElement;

    expect(termsLink).toBeDefined();
    expect(termsLink.href).toBe(EXTERNAL_LEGAL_URL);
    expect(termsLink.getAttribute('target')).toBe('_blank');
    expect(termsLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('retains internal routing for Help & Support', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('a'));
    const helpLink = links.find(l => l.textContent?.includes('Help & Support')) as HTMLAnchorElement;

    expect(helpLink).toBeDefined();
    const linkTarget = helpLink.getAttribute('href') || helpLink.getAttribute('ng-reflect-router-link') || '';
    expect(linkTarget).toContain('help-support');
    expect(helpLink.getAttribute('target')).toBeNull();
  });

  it('displays today date dynamically for Last Updated', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(formatDateMedium(new Date()));
  });
});
