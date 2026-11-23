import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { TendersPageComponent } from '../tenders-page.component';

describe('TendersPageComponent - Table Navigation Guard (Bug 8)', () => {
  let fixture: ComponentFixture<TendersPageComponent>;
  let component: TendersPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TendersPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

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
});
