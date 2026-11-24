import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormSelectComponent } from './form-select.component';

describe('FormSelectComponent (Bugs 1 & 6)', () => {
  let component: FormSelectComponent;
  let fixture: ComponentFixture<FormSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSelectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormSelectComponent);
    component = fixture.componentInstance;
    component.options = ['Rajasthan', 'Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Punjab', 'Haryana', 'Kerala'];
    component.label = 'State / UT of Registration';
    fixture.detectChanges();
  });

  it('verifies Bug 1: clearSearch resets search query, restores entries, and keeps dropdown open', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    // Initially no clear button when search is empty
    let clearBtn = fixture.nativeElement.querySelector('.form-select-search-clear');
    expect(clearBtn).toBeNull();
    expect(component.filteredEntries().length).toBe(8);

    // Enter search text
    component.searchQuery.set('Delhi');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(1);
    clearBtn = fixture.nativeElement.querySelector('.form-select-search-clear');
    expect(clearBtn).toBeTruthy();
    expect(clearBtn.getAttribute('aria-label')).toBe('Clear search');

    // Click clear button
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropSpy = vi.spyOn(clickEvent, 'stopPropagation');
    clearBtn.dispatchEvent(clickEvent);
    fixture.detectChanges();

    expect(stopPropSpy).toHaveBeenCalled();
    expect(component.searchQuery()).toBe('');
    expect(component.filteredEntries().length).toBe(8);
    expect(component.isOpen()).toBe(true);
  });

  it('verifies Bug 6: disableLabelClick prevents label click from opening dropdown', () => {
    component.disableLabelClick = true;
    fixture.detectChanges();

    const labelEl: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    expect(labelEl).toBeTruthy();
    expect(labelEl.getAttribute('for')).toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

    labelEl.dispatchEvent(clickEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.isOpen()).toBe(false);
  });
});
