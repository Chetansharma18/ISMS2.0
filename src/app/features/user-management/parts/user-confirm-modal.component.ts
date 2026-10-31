import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ActionModalComponent } from '../../../shared';
import { ConfirmModalData } from '../user-management.util';

@Component({
  selector: 'app-user-confirm-modal',
  standalone: true,
  imports: [ActionModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="true"
      [showAccentBar]="true"
      [accentBarClass]="data()?.accentBarClass || 'bg-primary'"
      [title]="data()?.title || 'Confirmation'"
      [primaryLabel]="data()?.confirmLabel || 'Confirm'"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[460px]"
      (primaryAction)="confirmed.emit()"
      (secondaryAction)="dismissed.emit()"
      (close)="dismissed.emit()"
    >
      <p class="text-sm text-slate-600 mt-2 mb-0 leading-relaxed font-sans">
        {{ data()?.message }}
      </p>

      @if (data()?.metadata?.scheme || data()?.metadata?.years) {
        <div class="mt-3.5 p-3 rounded-lg bg-rose-50/80 border border-rose-200/80 text-xs font-sans space-y-1.5 text-left">
          @if (data()?.metadata?.scheme) {
            <div class="flex items-start justify-between gap-2">
              <span class="text-slate-500 font-medium shrink-0">Target Scheme:</span>
              <span class="font-bold text-slate-800 text-right">{{ data()?.metadata?.scheme }}</span>
            </div>
          }
          @if (data()?.metadata?.years) {
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500 font-medium shrink-0">Blacklist Duration:</span>
              <span class="font-bold text-rose-700 tabular-nums">{{ data()?.metadata?.years }}</span>
            </div>
          }
          @if (data()?.metadata?.remarks) {
            <div class="flex items-start justify-between gap-2 pt-1 border-t border-rose-200/60">
              <span class="text-slate-500 font-medium shrink-0">Remarks / Order:</span>
              <span class="text-slate-700 italic text-right">{{ data()?.metadata?.remarks }}</span>
            </div>
          }
        </div>
      }
    </app-action-modal>
  `
})
export class UserConfirmModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly data = input<ConfirmModalData | null>(null);
  readonly confirmed = output<void>();
  readonly dismissed = output<void>();
}
