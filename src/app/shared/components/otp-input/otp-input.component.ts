import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, input, model, output, viewChildren } from '@angular/core';

/**
 * A one-time-password field made of one box per digit. It handles typing, backspace, arrow keys and
 * pasting a whole code, and moves the cursor between the boxes.
 *
 *   <app-otp-input [(value)]="otp" [invalid]="!!error()" (completed)="verify()" />
 *
 * `value` holds the digits typed so far (up to `length`). `completed` fires when all boxes are filled.
 */
@Component({
  selector: 'app-otp-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-between gap-1 sm:gap-1.5', '(paste)': 'onPaste($event)' },
  template: `
    @for (digit of digits(); track $index; let i = $index) {
      <input
        #box
        type="text"
        inputmode="numeric"
        maxlength="1"
        pattern="[0-9]*"
        autocomplete="one-time-code"
        [attr.aria-label]="'Digit ' + (i + 1)"
        [value]="digit"
        [disabled]="disabled()"
        (input)="onInput($event, i)"
        (keydown)="onKeydown($event, i)"
        (focus)="selectAll($event)"
        class="w-10 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold text-navy bg-white border rounded-xl outline-none transition-all shadow-2xs select-none focus:border-navy focus:ring-2 focus:ring-navy/15 disabled:opacity-50"
        [class.border-rose-400]="invalid()"
        [class.border-navy]="digit !== '' && !invalid()"
        [class.border-slate-300]="digit === '' && !invalid()"
      />
      @if (i < length() - 1) {
        <span class="w-1.5 sm:w-2.5 h-0.5 bg-slate-300 shrink-0"></span>
      }
    }
  `
})
export class OtpInputComponent {
  readonly length = input(6);
  readonly value = model('');
  readonly invalid = input(false);
  readonly disabled = input(false);
  /** Focus the first box when the field appears. */
  readonly autofocus = input(true);

  readonly completed = output<string>();

  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');

  protected readonly digits = computed(() => {
    const value = this.value();
    return Array.from({ length: this.length() }, (_, i) => value.charAt(i));
  });

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) this.focus(0);
    });
  }

  /** Moves the cursor to a box, for example back to the first one after a resend. */
  focus(index: number): void {
    this.boxes()[index]?.nativeElement.focus();
  }

  protected selectAll(event: Event): void {
    (event.target as HTMLInputElement).select();
  }

  protected onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    input.value = digit;
    const current = this.value();
    // The code never has gaps: a digit typed past the end is added at the end.
    const at = Math.min(index, current.length);
    this.update(digit ? current.slice(0, at) + digit + current.slice(at + 1) : current.slice(0, at) + current.slice(at + 1));
    if (digit && index < this.length() - 1) this.focus(index + 1);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.digits()[index] && index > 0) {
        event.preventDefault();
        const current = this.value();
        this.update(current.slice(0, index - 1) + current.slice(index));
        this.focus(index - 1);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focus(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.length() - 1) {
      this.focus(index + 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, this.length());
    if (!pasted) return;
    event.preventDefault();
    this.update(pasted);
    this.focus(Math.min(pasted.length, this.length() - 1));
  }

  private update(value: string): void {
    const next = value.slice(0, this.length());
    this.value.set(next);
    if (next.length === this.length()) this.completed.emit(next);
  }
}
