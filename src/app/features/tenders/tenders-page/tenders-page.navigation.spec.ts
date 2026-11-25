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
      id: '7',
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
        eoiId: 7,
        refNo: 'RSLDC/TEST/01'
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
});
