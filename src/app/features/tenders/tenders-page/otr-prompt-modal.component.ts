import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ActionModalComponent } from '../../../shared';

/** One-time registration (OTR) prompt shown to new users. */
@Component({
  selector: 'app-otr-prompt-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="false"
      title="Complete Your Profile to Apply for EOI"
      description="To participate in RSLDC schemes and submit an Expression of Interest (EOI), please complete your One-Time Registration (OTR) and organization profile."
      primaryLabel="Complete Registration"
      secondaryLabel="Skip for Now"
      (primaryAction)="completeRegistration.emit()"
      (secondaryAction)="dismiss.emit()"
      (close)="dismiss.emit()"
    >
    </app-action-modal>
  `
})
export class OtrPromptModalComponent {
  readonly isOpen = input(false);
  readonly completeRegistration = output<void>();
  readonly dismiss = output<void>();
}
