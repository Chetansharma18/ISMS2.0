import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Recipient details block (To, PIA name, address lines and SAR number). */
@Component({
  selector: 'app-ipa-recipient-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-1 mb-4 font-sans text-xs">
      <p class="font-bold text-slate-900">To,</p>
      <input
        appInput
        variant="plain"
        type="text"
        [ngModel]="recipientName()" (ngModelChange)="recipientName.set($event)"
        class="font-bold w-full block"
      />
      <input
        appInput
        variant="plain"
        type="text"
        [(ngModel)]="recipientAddress1"
        class="w-full block"
      />
      <input
        appInput
        variant="plain"
        type="text"
        [(ngModel)]="recipientAddress2"
        class="w-full block"
      />
      <input
        appInput
        variant="plain"
        type="text"
        [ngModel]="recipientSar()" (ngModelChange)="recipientSar.set($event)"
        class="font-mono w-64 block mt-1"
      />
    </div>
  `
})
export class IpaRecipientBlockComponent {
  readonly recipientName = model<string>('');
  readonly recipientAddress1 = model<string>('');
  readonly recipientAddress2 = model<string>('');
  readonly recipientSar = model<string>('');
}
