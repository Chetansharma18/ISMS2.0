import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ActionModalComponent } from './action-modal.component';

describe('ActionModalComponent', () => {
  let fixture: ComponentFixture<ActionModalComponent>;
  let component: ActionModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionModalComponent);
    component = fixture.componentInstance;
  });

  it('renders divider above action buttons by default', () => {
    component.isOpen = true;
    component.primaryLabel = 'Submit';
    component.secondaryLabel = 'Cancel';
    component.showFooterDivider = true;
    fixture.detectChanges();

    const divider = fixture.nativeElement.querySelector('.border-t.border-\\[\\#EADCE2\\]');
    expect(divider).not.toBeNull();
  });

  it('removes divider above action buttons when showFooterDivider is false', () => {
    component.isOpen = true;
    component.primaryLabel = 'Submit';
    component.secondaryLabel = 'Cancel';
    component.showFooterDivider = false;
    fixture.detectChanges();

    const divider = fixture.nativeElement.querySelector('.border-t.border-\\[\\#EADCE2\\]');
    expect(divider).toBeNull();
  });

  it('renders content container with scrollable overflow-y-auto class', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const scrollContainer = fixture.nativeElement.querySelector('.overflow-y-auto');
    expect(scrollContainer).not.toBeNull();
  });
});
