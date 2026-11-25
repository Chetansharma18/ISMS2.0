import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { TendersPageComponent } from '../tenders-page.component';

describe('TendersPageComponent - Table Navigation Guard (Bug 8)', () => {
  let fixture: ComponentFixture<TendersPageComponent>;
  let component: TendersPageComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TendersPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TendersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not define cursor-pointer on table rows (Bug 8)', () => {
    const dummyScheme: any = { refNo: 'SCH-001', schemeName: 'Sample Scheme', isActive: true };
    const rowClass = component.getRowClass(dummyScheme);
    expect(rowClass).not.toContain('cursor-pointer');
  });

  it('keeps selectedScheme null initially and opens scheme details only when viewSchemeDetails is called', () => {
    const dummyScheme: any = { refNo: 'SCH-001', schemeName: 'Sample Scheme', isActive: true };

    expect(component.selectedScheme()).toBeNull();

    // Calling viewSchemeDetails (from View button action) opens the details
    component.viewSchemeDetails(dummyScheme);
    expect(component.selectedScheme()).toBe(dummyScheme);

    // Returning back to list
    component.backToList();
    expect(component.selectedScheme()).toBeNull();
  });

  it('proceeds to /scheme-form when Skip for Now is clicked after applying with incomplete profile (Bug 1)', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const dummyScheme: any = {
      refNo: 'RSLDC/TEST/01',
      schemeName: 'Test Scheme',
      schemeTitle: 'Test Scheme Title',
      schemeCategory: 'Rajvik',
      eoiCategory: 'General'
    };

    component.selectedScheme.set(dummyScheme);
    // Mock profile incomplete
    vi.spyOn(component as any, 'isProfileIncomplete').mockReturnValue(true);

    component.handleApplyForScheme();
    expect(component.showOtrPromptModal()).toBe(true);

    // Click "Skip for Now" (dismiss)
    component.dismissOtrPrompt();
    expect(component.showOtrPromptModal()).toBe(false);

    expect(navigateSpy).toHaveBeenCalledWith(['/scheme-form'], expect.objectContaining({
      queryParams: expect.objectContaining({
        refNo: 'RSLDC/TEST/01',
        schemeName: 'Test Scheme'
      })
    }));
  });

  it('does not navigate to /scheme-form when Skip is clicked from initial visit popup without applying', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.showOtrPromptModal.set(true);

    component.dismissOtrPrompt();
    expect(component.showOtrPromptModal()).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalledWith(['/scheme-form'], expect.anything());
  });

  it('prevents nextEoiStep() when step 1 Publish Details has invalid/missing fields', () => {
    component.newEoiData = {
      refNo: '',
      scheme: '',
      schemeCategory: '',
      publishedDate: '',
      submissionDate: '',
      eoiDurationValue: '',
      eoiDurationUnit: 'Years',
      eoiCategory: '',
      description: '',
      emdFee: '',
      processFee: '',
      attachments: [],
      documents: [],
      annexures: [],
      publishFields: [],
      uploadFields: [],
      documentFiles: {}
    };

    component.eoiCurrentStep.set(1);
    component.nextEoiStep();

    expect(component.eoiCurrentStep()).toBe(1);
    expect(component.newEoiSubmitted()).toBe(true);
  });

  it('switches to step 1 and alerts when submitNewEoi() is clicked with invalid Step 1 fields', () => {
    component.newEoiData = {
      refNo: 'RSLDC/EOI/2026/01',
      scheme: '',
      schemeCategory: '',
      publishedDate: '',
      submissionDate: '',
      eoiDurationValue: '',
      eoiDurationUnit: 'Years',
      eoiCategory: '',
      description: '',
      emdFee: '',
      processFee: '',
      attachments: [],
      documents: [],
      annexures: [],
      publishFields: [],
      uploadFields: [],
      documentFiles: {}
    };

    component.eoiCurrentStep.set(2);
    component.submitNewEoi();

    expect(component.eoiCurrentStep()).toBe(1);
    expect(component.showConfirmSubmitEoiModal()).toBe(false);
  });

  it('opens confirm submit modal when submitNewEoi() is called with a fully valid EOI', () => {
    component.newEoiData = {
      refNo: 'RSLDC/EOI/2026-27/01',
      scheme: 'Vishwakarma Yuva Udyami Protsahan Yojana',
      schemeCategory: 'Rajvik',
      publishedDate: '2026-11-25',
      submissionDate: '2026-12-25',
      eoiDurationValue: '3',
      eoiDurationUnit: 'Years',
      eoiCategory: 'General',
      description: 'Standard skill development EOI proposal',
      emdFee: '₹50,000',
      processFee: '₹10,000',
      attachments: [],
      documents: ['Company PAN Card'],
      annexures: ['Annexure-1'],
      publishFields: [],
      uploadFields: [],
      documentFiles: {}
    };

    // Ensure schemeMasterItems has matching amounts
    component.schemeMasterItems.set([
      { sNo: 1, id: 'sch-1', schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana', schemeCategory: 'Rajvik', categoryName: 'GENERAL', budget: 50000000, amount: 50000, processFees: 10000, status: 'Active' }
    ]);

    component.eoiCurrentStep.set(2);
    component.submitNewEoi();

    expect(component.showConfirmSubmitEoiModal()).toBe(true);
  });
});
