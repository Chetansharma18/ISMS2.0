import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DropdownComponent, DropdownOption } from './dropdown.component';

@Component({
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <app-dropdown
      inputId="field"
      placeholder="Pick one"
      [options]="options"
      [multiple]="multiple"
      [searchable]="searchable"
      [disabled]="disabled"
      [otherLabel]="otherLabel"
      [otherSelected]="otherSelected"
      [selectAllLabel]="selectAllLabel"
      [clearable]="clearable"
      [(value)]="value"
      [(values)]="values"
      (other)="otherClicks = otherClicks + 1"
    />
    <button id="outside" type="button">outside</button>
  `
})
class HostComponent {
  options: DropdownOption[] = ['Alpha', 'Beta', 'Gamma'];
  multiple = false;
  searchable = false;
  disabled = false;
  otherLabel = '';
  otherSelected = false;
  selectAllLabel = '';
  clearable = false;
  value = '';
  values: string[] = [];
  otherClicks = 0;
}

function render(setup: (host: HostComponent) => void = () => undefined) {
  const fixture = TestBed.createComponent(HostComponent);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

const root = (fixture: ComponentFixture<HostComponent>) => fixture.nativeElement as HTMLElement;
const trigger = (fixture: ComponentFixture<HostComponent>) =>
  root(fixture).querySelector('[role="combobox"]') as HTMLButtonElement;
const optionEls = (fixture: ComponentFixture<HostComponent>) =>
  Array.from(root(fixture).querySelectorAll('[role="option"]')) as HTMLElement[];
const press = (fixture: ComponentFixture<HostComponent>, key: string, target: HTMLElement = trigger(fixture)) => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
};
const open = (fixture: ComponentFixture<HostComponent>) => {
  trigger(fixture).click();
  fixture.detectChanges();
};

describe('DropdownComponent', () => {
  it('shows the placeholder and the combobox attributes while closed', () => {
    const fixture = render();
    const button = trigger(fixture);
    expect(button.textContent).toContain('Pick one');
    expect(button.id).toBe('field');
    expect(button.getAttribute('aria-haspopup')).toBe('listbox');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(root(fixture).querySelector('[role="listbox"]')).toBeNull();
  });

  it('opens a listbox of options and closes it after choosing in single mode', () => {
    const fixture = render();
    open(fixture);

    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
    expect(root(fixture).querySelector('[role="listbox"]')).not.toBeNull();
    expect(optionEls(fixture).map(o => o.textContent?.trim())).toEqual(['Alpha', 'Beta', 'Gamma']);

    optionEls(fixture)[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe('Beta');
    expect(trigger(fixture).textContent).toContain('Beta');
    expect(root(fixture).querySelector('[role="listbox"]')).toBeNull();
  });

  it('marks the chosen option with aria-selected', () => {
    const fixture = render(host => (host.value = 'Gamma'));
    open(fixture);
    expect(optionEls(fixture).map(o => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
  });

  it('accepts options with a separate label and ignores disabled ones', () => {
    const fixture = render(host => {
      host.options = [
        { value: 'a', label: 'First' },
        { value: 'b', label: 'Second', disabled: true }
      ];
    });
    open(fixture);
    expect(optionEls(fixture)[1].getAttribute('aria-disabled')).toBe('true');

    optionEls(fixture)[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('');

    optionEls(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('a');
    expect(trigger(fixture).textContent).toContain('First');
  });

  it('closes on Escape and on a click outside', () => {
    const fixture = render();
    open(fixture);
    press(fixture, 'Escape');
    expect(root(fixture).querySelector('[role="listbox"]')).toBeNull();

    open(fixture);
    (root(fixture).querySelector('#outside') as HTMLElement).click();
    fixture.detectChanges();
    expect(root(fixture).querySelector('[role="listbox"]')).toBeNull();
  });

  it('keeps the list open on a click inside it in multi mode', () => {
    const fixture = render(host => (host.multiple = true));
    open(fixture);
    optionEls(fixture)[0].click();
    fixture.detectChanges();
    expect(root(fixture).querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('moves with the arrow keys and picks with Enter', () => {
    const fixture = render();
    press(fixture, 'ArrowDown');
    expect(root(fixture).querySelector('[role="listbox"]')).not.toBeNull();

    press(fixture, 'ArrowDown');
    press(fixture, 'ArrowDown');
    expect(trigger(fixture).getAttribute('aria-activedescendant')).toBe(optionEls(fixture)[1].id);

    press(fixture, 'Enter');
    expect(fixture.componentInstance.value).toBe('Beta');
    expect(root(fixture).querySelector('[role="listbox"]')).toBeNull();
  });

  it('toggles with Space in multi mode and skips disabled options', () => {
    const fixture = render(host => {
      host.multiple = true;
      host.options = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
        { value: 'c', label: 'C' }
      ];
    });
    press(fixture, 'ArrowDown');
    press(fixture, 'ArrowDown');
    press(fixture, 'ArrowDown');
    press(fixture, ' ');
    expect(fixture.componentInstance.values).toEqual(['c']);
  });

  it('ticks several options in multi mode and summarises them', () => {
    const fixture = render(host => (host.multiple = true));
    open(fixture);
    expect(root(fixture).querySelectorAll('input[type="checkbox"]').length).toBe(3);

    optionEls(fixture)[0].click();
    fixture.detectChanges();
    optionEls(fixture)[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.values).toEqual(['Alpha', 'Gamma']);
    expect(trigger(fixture).textContent).toContain('Alpha, Gamma');

    optionEls(fixture)[1].click();
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('3 selected');

    optionEls(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.values).toEqual(['Gamma', 'Beta']);
  });

  it('filters the options with the search box', () => {
    const fixture = render(host => (host.searchable = true));
    open(fixture);
    const box = root(fixture).querySelector('input[type="text"]') as HTMLInputElement;
    box.value = 'ga';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(optionEls(fixture).map(o => o.textContent?.trim())).toEqual(['Gamma']);

    box.value = 'zzz';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(optionEls(fixture).length).toBe(0);
    expect(root(fixture).textContent).toContain('No matching options');
  });

  it('adds a "Select all" row that ticks every enabled option', () => {
    const fixture = render(host => {
      host.multiple = true;
      host.selectAllLabel = 'All items';
    });
    open(fixture);
    expect(optionEls(fixture)[0].textContent).toContain('All items');

    optionEls(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.values).toEqual(['Alpha', 'Beta', 'Gamma']);

    optionEls(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.values).toEqual([]);
  });

  it('reports the "Other" row through the other output and closes in single mode', () => {
    const fixture = render(host => (host.otherLabel = 'Other (type your own)'));
    open(fixture);
    const rows = optionEls(fixture);
    expect(rows[rows.length - 1].textContent).toContain('Other (type your own)');

    rows[rows.length - 1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.otherClicks).toBe(1);
    expect(fixture.componentInstance.value).toBe('');
    expect(root(fixture).querySelector('[role="listbox"]')).toBeNull();
  });

  it('shows the "Other" label on the trigger once it is chosen', () => {
    const fixture = render(host => {
      host.otherLabel = 'Other (type your own)';
      host.otherSelected = true;
    });
    expect(trigger(fixture).textContent).toContain('Other (type your own)');
  });

  it('does not open when disabled', () => {
    const fixture = render(host => (host.disabled = true));
    expect(trigger(fixture).disabled).toBe(true);
    open(fixture);
    expect(root(fixture).querySelector('[role="listbox"]')).toBeNull();
  });

  it('clears the selection with the clear button', () => {
    const fixture = render(host => {
      host.clearable = true;
      host.value = 'Alpha';
    });
    const clear = root(fixture).querySelector('button[aria-label="Clear selection"]') as HTMLButtonElement;
    expect(clear).not.toBeNull();
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('');
    expect(trigger(fixture).textContent).toContain('Pick one');
  });
});
