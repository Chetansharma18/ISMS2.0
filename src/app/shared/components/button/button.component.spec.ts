import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <button id="plain" appButton>Go</button>
    <button id="outline" appButton variant="outline" size="sm" block>Back</button>
    <button id="submit" appButton type="submit">Save</button>
    <button id="busy" appButton [loading]="true">Saving</button>
    <button id="off" appButton [disabled]="true">Off</button>
    <a id="link" appButton variant="ghost" href="#">Home</a>
    <a id="link-off" appButton href="#" [disabled]="true">Home</a>
  `
})
class HostComponent {}

function render(): HTMLElement {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ButtonComponent (appButton)', () => {
  it('styles a plain button as a primary, button-type button', () => {
    const button = render().querySelector('#plain') as HTMLButtonElement;
    expect(button.className).toContain('btn');
    expect(button.className).toContain('btn-primary');
    expect(button.type).toBe('button');
  });

  it('applies variant, size and block as classes', () => {
    const button = render().querySelector('#outline') as HTMLButtonElement;
    expect(button.className).toContain('btn-outline');
    expect(button.className).toContain('btn-sm');
    expect(button.className).toContain('btn-block');
  });

  it('keeps type="submit" when asked for', () => {
    expect((render().querySelector('#submit') as HTMLButtonElement).type).toBe('submit');
  });

  it('disables a button while loading or when disabled', () => {
    const root = render();
    expect((root.querySelector('#busy') as HTMLButtonElement).disabled).toBe(true);
    expect((root.querySelector('#off') as HTMLButtonElement).disabled).toBe(true);
  });

  it('works on an anchor without a type attribute', () => {
    const root = render();
    const link = root.querySelector('#link') as HTMLAnchorElement;
    expect(link.className).toContain('btn-ghost');
    expect(link.getAttribute('type')).toBeNull();
    expect((root.querySelector('#link-off') as HTMLAnchorElement).getAttribute('aria-disabled')).toBe('true');
  });
});
