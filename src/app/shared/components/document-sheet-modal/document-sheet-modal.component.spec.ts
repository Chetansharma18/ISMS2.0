import { describe, it, expect, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DocumentSheetModalComponent } from './document-sheet-modal.component';

@Component({
  standalone: true,
  imports: [DocumentSheetModalComponent],
  template: `
    <app-document-sheet-modal
      [isOpen]="open()"
      [title]="'Sheet Title'"
      subtitle="Sheet Subtitle"
      [printLabel]="printLabel()"
      (print)="printCount = printCount + 1"
      (close)="closeCount = closeCount + 1"
    >
      <p class="sheet-body">Body text</p>
    </app-document-sheet-modal>
  `
})
class HostComponent {
  open = signal(false);
  printLabel = signal('Print Sheet');
  printCount = 0;
  closeCount = 0;
}

describe('DocumentSheetModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const open = () => {
    host.open.set(true);
    fixture.detectChanges();
  };
  const buttons = () => Array.from(el().querySelectorAll('button')) as HTMLButtonElement[];
  const pressEscape = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
  };

  it('renders nothing when closed', () => {
    expect(el().querySelector('[role="dialog"]')).toBeNull();
    expect(el().textContent).not.toContain('Sheet Title');
    expect(el().querySelector('.sheet-body')).toBeNull();
  });

  it('renders title, subtitle and projected content when open', () => {
    open();
    const dialog = el().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialog.getAttribute('aria-labelledby') as string;
    expect(el().querySelector('#' + labelledBy)?.textContent).toContain('Sheet Title');
    expect(el().textContent).toContain('Sheet Subtitle');
    expect(el().querySelector('.sheet-body')?.textContent).toContain('Body text');
  });

  it('emits close when the close button is clicked', () => {
    open();
    const closeBtn = el().querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    closeBtn.click();
    expect(host.closeCount).toBe(1);
  });

  it('emits close on Escape while open', () => {
    open();
    pressEscape();
    expect(host.closeCount).toBe(1);
  });

  it('ignores Escape while closed', () => {
    pressEscape();
    expect(host.closeCount).toBe(0);
  });

  it('shows the print button with the configured label and emits print', () => {
    open();
    const printBtn = buttons().find(b => (b.textContent ?? '').includes('Print Sheet'));
    expect(printBtn).toBeDefined();
    printBtn?.click();
    expect(host.printCount).toBe(1);
  });

  it('hides the print button when printLabel is empty', () => {
    host.printLabel.set('');
    open();
    expect(buttons().length).toBe(1);
    expect(buttons()[0].getAttribute('aria-label')).toBe('Close');
  });
});
