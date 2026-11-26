import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { SchemesHeaderComponent } from './schemes-header.component';

describe('SchemesHeaderComponent', () => {
  let fixture: ComponentFixture<SchemesHeaderComponent>;
  let component: SchemesHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemesHeaderComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SchemesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders Active EOI title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Active EOI');
  });

  it('renders Configure New EOI button when isSuperAdmin is true and emits configureEoi', () => {
    fixture.componentRef.setInput('isSuperAdmin', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Configure New EOI');

    let clicked = false;
    component.configureEoi.subscribe(() => {
      clicked = true;
    });

    btn?.click();
    expect(clicked).toBe(true);
  });

  it('does not render Configure New EOI button when isSuperAdmin is false', () => {
    fixture.componentRef.setInput('isSuperAdmin', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Configure New EOI');
  });
});
