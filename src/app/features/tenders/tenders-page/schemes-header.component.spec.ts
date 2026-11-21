import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { SchemesHeaderComponent } from './schemes-header.component';

describe('SchemesHeaderComponent & PageHeader - Search and Suggestions (Bug 5)', () => {
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

  it('renders search input with placeholder', () => {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.placeholder).toBe('Search active schemes...');
  });

  it('emits searchChange when typing in the search input', () => {
    let emitted = '';
    component.searchChange.subscribe(val => {
      emitted = val;
    });

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Solar';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitted).toBe('Solar');
  });

  it('displays suggestions dropdown with visible, non-truncated items matching query', () => {
    fixture.componentRef.setInput('suggestions', [
      'Empanelment of Training Partners under PMKVY Scheme 4.0 Rajasthan',
      'Solar Panel Technician Scheme 2026'
    ]);
    fixture.componentRef.setInput('searchQuery', 'Solar');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="text"]') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const dropdown = el.querySelector('.shadow-lg');
    expect(dropdown).not.toBeNull();
    const items = el.querySelectorAll('.shadow-lg button');
    expect(items.length).toBe(1);
    expect(items[0].textContent?.trim()).toBe('Solar Panel Technician Scheme 2026');
    // Verify whitespace-normal and break-words classes prevent truncation
    expect(items[0].className).toContain('whitespace-normal');
    expect(items[0].className).toContain('break-words');
  });

  it('filters correctly for PMKVY in suggestions dropdown', () => {
    fixture.componentRef.setInput('suggestions', [
      'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
      'Rooftop Solar Skill Development Scheme'
    ]);
    fixture.componentRef.setInput('searchQuery', 'PMKVY');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="text"]') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const dropdown = el.querySelector('.shadow-lg');
    expect(dropdown).not.toBeNull();
    const items = el.querySelectorAll('.shadow-lg button');
    expect(items.length).toBe(1);
    expect(items[0].textContent?.trim()).toBe('Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)');
  });

  it('emits searchChange when a suggestion is selected', () => {
    let emitted = '';
    component.searchChange.subscribe(val => {
      emitted = val;
    });

    fixture.componentRef.setInput('suggestions', ['Solar Panel Scheme']);
    fixture.componentRef.setInput('searchQuery', 'Sol');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="text"]') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const suggestionBtn = el.querySelector('.shadow-lg button') as HTMLButtonElement;
    suggestionBtn.dispatchEvent(new MouseEvent('mousedown'));
    fixture.detectChanges();

    expect(emitted).toBe('Solar Panel Scheme');
  });
});
