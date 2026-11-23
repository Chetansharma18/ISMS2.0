import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `
    <app-status-badge variant="warning">
      In Progress
    </app-status-badge>
  `
})
class TestHostComponent {}

describe('StatusBadgeComponent (Bug 5)', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('renders with whitespace-nowrap and proper padding to prevent text cropping (Bug 5)', () => {
    const span = fixture.nativeElement.querySelector('span');
    expect(span).toBeTruthy();
    expect(span.textContent.trim()).toBe('In Progress');
    expect(span.classList.contains('whitespace-nowrap')).toBe(true);
    expect(span.classList.contains('min-w-fit')).toBe(true);
  });
});
