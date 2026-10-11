import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Recipient details block (To, PIA name, address lines and SAR number). */
@Component({
  selector: 'app-ipa-recipient-block',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-1 mb-4 font-sans text-xs">
      <p class="font-bold text-slate-900">To,</p>
      <input
        type="text"
        [ngModel]="recipientName()" (ngModelChange)="recipientName.set($event)"
        class="font-bold text-slate-900 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none w-full block"
      />
      <input
        type="text"
        [(ngModel)]="recipientAddress1"
        class="text-slate-700 bg-transparent border-b border-dashed border-slate-200 focus:border-slate-800 focus:outline-none w-full block"
      />
      <input
        type="text"
        [(ngModel)]="recipientAddress2"
        class="text-slate-700 bg-transparent border-b border-dashed border-slate-200 focus:border-slate-800 focus:outline-none w-full block"
      />
      <input
        type="text"
        [ngModel]="recipientSar()" (ngModelChange)="recipientSar.set($event)"
        class="font-mono text-slate-800 text-[11px] bg-transparent border-b border-dashed border-slate-200 focus:border-slate-800 focus:outline-none w-64 block mt-1"
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
