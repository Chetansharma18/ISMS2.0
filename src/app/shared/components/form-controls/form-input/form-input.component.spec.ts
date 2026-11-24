import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormInputComponent } from './form-input.component';

describe('FormInputComponent - Label Click Guard (Bugs 2 & 6)', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
  });

  it('omits "for" attribute and prevents click propagation when disableLabelClick is true', () => {
    component.label = 'Registration Number';
    component.disableLabelClick = true;
    fixture.detectChanges();

    const labelEl: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    expect(labelEl).toBeTruthy();
    expect(labelEl.getAttribute('for')).toBeNull();

    const event = new MouseEvent('click', { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropSpy = vi.spyOn(event, 'stopPropagation');

    labelEl.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropSpy).toHaveBeenCalled();
  });

  it('preserves label click prevention for date inputs without disableLabelClick', () => {
    component.label = 'Date of Registration';
    component.type = 'date';
    component.disableLabelClick = false;
    fixture.detectChanges();

    const labelEl: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    expect(labelEl.getAttribute('for')).toBeNull();

    const event = new MouseEvent('click', { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    labelEl.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('keeps "for" attribute when disableLabelClick is false and type is normal text', () => {
    component.label = 'Standard Input';
    component.type = 'text';
    component.disableLabelClick = false;
    fixture.detectChanges();

    const labelEl: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    expect(labelEl.getAttribute('for')).toBe(component.id);
  });
});
