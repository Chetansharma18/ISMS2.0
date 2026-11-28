import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ModalComponent } from './modal.component';

@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal title="Approved Companies" subtitle="MMKVY" (close)="closed = closed + 1">
      <p id="body">Body</p>
      <ng-container modalFooter><span id="footer">Footer</span></ng-container>
    </app-modal>
  `
})
class HostComponent {
  closed = 0;
}

function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ModalComponent', () => {
  it('shows the title, subtitle, body and footer in a dialog', () => {
    const root = render().nativeElement as HTMLElement;
    const dialog = root.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Approved Companies');
    expect(dialog?.textContent).toContain('MMKVY');
    expect(root.querySelector('#body')).not.toBeNull();
    expect(root.querySelector('#footer')).not.toBeNull();
  });

  it('closes on Escape and on a click outside the panel, but not inside it', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;

    (root.querySelector('[role="dialog"]') as HTMLElement).click();
    expect(fixture.componentInstance.closed).toBe(0);

    (root.querySelector('.fixed') as HTMLElement).click();
    expect(fixture.componentInstance.closed).toBe(1);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.closed).toBe(2);
  });

  it('shows a footer Cancel button that closes it, and no top-right close button', () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('button[aria-label="Close"]')).toBeNull();

    const cancel = Array.from(root.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Cancel');
    expect(cancel).toBeDefined();
    cancel!.click();
    expect(fixture.componentInstance.closed).toBe(1);
  });
});
