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
    </app-action-modal>
  `
})
export class UserConfirmModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly data = input<ConfirmModalData | null>(null);
  readonly confirmed = output<void>();
  readonly dismissed = output<void>();
}
