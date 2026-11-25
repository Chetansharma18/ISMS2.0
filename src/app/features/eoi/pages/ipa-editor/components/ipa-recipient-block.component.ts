import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputDirective } from '../../../../../shared';

/** Recipient details block (To, PIA name, address lines and SAR number), in bold serif as on the printed IPA. */
@Component({
  selector: 'app-ipa-recipient-block',
  standalone: true,
  imports: [FormsModule, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-0.5 mb-4 font-serif text-[13px] sm:text-sm font-bold text-slate-900">
      <p class="m-0">To,</p>
      <input
        appInput
        variant="plain"
        type="text"
        aria-label="Name of the agency"
        [ngModel]="recipientName()" (ngModelChange)="recipientName.set($event)"
        class="font-bold w-full block"
      />
      <input
        appInput
        variant="plain"
        type="text"
        aria-label="Address line 1"
        [ngModel]="recipientAddress1()" (ngModelChange)="recipientAddress1.set($event)"
        class="font-bold w-full block"
      />
      <input
        appInput
        variant="plain"
        type="text"
        aria-label="Address line 2"
        [ngModel]="recipientAddress2()" (ngModelChange)="recipientAddress2.set($event)"
        class="font-bold w-full block"
      />
      <input
        appInput
        variant="plain"
        type="text"
        aria-label="SAR number"
        [ngModel]="recipientSar()" (ngModelChange)="recipientSar.set($event)"
        class="font-bold tabular-nums w-full block"
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
