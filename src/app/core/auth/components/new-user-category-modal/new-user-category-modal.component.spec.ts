import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NewUserCategoryModalComponent } from './new-user-category-modal.component';

@Component({
  standalone: true,
  imports: [NewUserCategoryModalComponent],
  template: `
    <app-new-user-category-modal
      [isOpen]="open()"
      (proceedWithCitizen)="proceedCount = proceedCount + 1"
      (cancelled)="cancelCount = cancelCount + 1"
    ></app-new-user-category-modal>
  `
})
class TestHostComponent {
  open = signal(false);
  proceedCount = 0;
  cancelCount = 0;
}

describe('NewUserCategoryModalComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const openModal = () => {
    host.open.set(true);
    fixture.detectChanges();
  };

  it('renders nothing when closed', () => {
    expect(el().querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders student and citizen options when open', () => {
    openModal();
    const dialog = el().querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();

    const text = dialog?.textContent || '';
    expect(text).toContain('Student');
    expect(text).toContain('Training Related Interest');
    expect(text).toContain('Citizen');
    expect(text).toContain('Express Interest & Conduct Schemes');
  });

  it('switches between Student and Citizen selections', () => {
    openModal();
    const studentCard = el().querySelectorAll('.group.relative')[0] as HTMLElement;
    studentCard.click();
    fixture.detectChanges();

    expect(el().textContent).toContain('Student Module Coming Soon');

    const citizenCard = el().querySelectorAll('.group.relative')[1] as HTMLElement;
    citizenCard.click();
    fixture.detectChanges();

    expect(el().textContent).toContain('Continue as Citizen');
  });

  it('emits proceedWithCitizen on confirming citizen', () => {
    openModal();
    const continueBtn = Array.from(el().querySelectorAll('button')).find(b =>
      b.textContent?.includes('Continue as Citizen')
    );
    expect(continueBtn).toBeDefined();
    continueBtn?.click();
    fixture.detectChanges();

    expect(host.proceedCount).toBe(1);
  });

  it('emits cancelled on clicking close button', () => {
    openModal();
    const closeBtn = el().querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    fixture.detectChanges();

    expect(host.cancelCount).toBe(1);
  });
});
