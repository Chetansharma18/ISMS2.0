import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { HelpSupportComponent } from './help-support.component';

describe('HelpSupportComponent - Standalone FAQ Page', () => {
  let fixture: ComponentFixture<HelpSupportComponent>;
  let component: HelpSupportComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpSupportComponent],
      providers: [
        provideRouter([
          { path: '', children: [] }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpSupportComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('renders standalone header with ISMS branding and Back/Home navigation buttons', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ISMS 2.0');
    expect(el.textContent).toContain('Help Center');
    expect(el.textContent).toContain('Back to Home');

    const backBtn = el.querySelector('button[aria-label="Back to Previous Page"]');
    expect(backBtn).not.toBeNull();

    const homeBtn = el.querySelector('button[aria-label="Go to ISMS 2.0 Home"]');
    expect(homeBtn).not.toBeNull();
  });

  it('navigates to home when goHome() is called', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.goHome();
    expect(spy).toHaveBeenCalledWith(['/']);
  });

  it('organizes FAQs into the 5 required categories', () => {
    const categories = component.categories;
    expect(categories).toContain('All');
    expect(categories).toContain('Login & Registration');
    expect(categories).toContain('User Account');
    expect(categories).toContain('Schemes & Applications');
    expect(categories).toContain('Documents & Verification');
    expect(categories).toContain('Technical Issues');

    // Verify all 5 categories have populated FAQ items
    for (const cat of ['Login & Registration', 'User Account', 'Schemes & Applications', 'Documents & Verification', 'Technical Issues'] as const) {
      expect(component.getCategoryCount(cat)).toBeGreaterThan(0);
    }
  });

  it('allows expanding and collapsing accordion questions', () => {
    const firstFaq = component.faqs()[0];
    const initialOpen = firstFaq.isOpen;

    component.toggleFaq(firstFaq.id);
    expect(component.faqs()[0].isOpen).toBe(!initialOpen);

    component.toggleFaq(firstFaq.id);
    expect(component.faqs()[0].isOpen).toBe(initialOpen);
  });

  it('supports Expand All and Collapse All', () => {
    component.collapseAll();
    expect(component.faqs().every(f => !f.isOpen)).toBe(true);

    component.expandAll();
    expect(component.faqs().every(f => f.isOpen)).toBe(true);
  });

  it('filters questions by category when a category tab is selected', () => {
    component.selectCategory('Documents & Verification');
    fixture.detectChanges();

    const filtered = component.filteredFaqs();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(f => f.category === 'Documents & Verification')).toBe(true);
  });

  it('filters questions dynamically by search keywords', () => {
    component.onSearchInput('biometric');
    fixture.detectChanges();

    const filtered = component.filteredFaqs();
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every(f =>
        f.question.toLowerCase().includes('biometric') ||
        f.answer.toLowerCase().includes('biometric')
      )
    ).toBe(true);

    component.clearSearch();
    fixture.detectChanges();
    expect(component.filteredFaqs().length).toBe(component.faqs().length);
  });

  it('displays official helpline and support channels', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('0141-2716091');
    expect(el.textContent).toContain('support@isms.rajasthan.gov.in');
  });

  it('resets scroll to top on initialization and when scrollToTop is called', () => {
    const mainEl = document.createElement('main');
    mainEl.scrollTop = 500;
    mainEl.appendChild(fixture.nativeElement);
    document.body.appendChild(mainEl);

    try {
      const windowScrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const mainScrollSpy = vi.fn();
      mainEl.scrollTo = mainScrollSpy;

      component.scrollToTop(false);

      expect(windowScrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
      expect(mainScrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });

      component.scrollToTop(true);
      expect(windowScrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      expect(mainScrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    } finally {
      document.body.removeChild(mainEl);
    }
  });
});
