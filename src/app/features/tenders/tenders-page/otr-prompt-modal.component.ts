import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ActionModalComponent, IconComponent } from '../../../shared';

/** One-time registration (OTR) prompt shown to new users. */
@Component({
  selector: 'app-otr-prompt-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent, IconComponent],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="false"
      [showAccentBar]="true"
      accentBarClass="bg-[#7C0E44]"
      primaryLabel="Complete Registration"
      secondaryLabel="Skip for Now"
      maxWidthClass="max-w-[460px]"
      (primaryAction)="completeRegistration.emit()"
      (secondaryAction)="dismiss.emit()"
      (close)="dismiss.emit()"
    >
      <div class="flex flex-col items-center text-center pt-1 pb-2 space-y-3 font-sans">
        <div class="w-12 h-12 rounded-full bg-[#F8EDF1] border border-[#EADCE2] flex items-center justify-center text-[#7C0E44]">
          <app-icon name="clipboard-check" size="lg" [stroke]="2" />
        </div>
        <div class="space-y-1.5">
          <h2 class="m-0 text-lg font-extrabold text-[#7C0E44] tracking-tight">
            Complete Your Profile to Apply for EOI
          </h2>
          <p class="m-0 text-[13px] text-slate-600 leading-relaxed max-w-sm mx-auto">
            To participate in RSLDC schemes and submit an Expression of Interest (EOI), please complete your One-Time Registration (OTR) and organization profile.
          </p>
        </div>
      </div>
    </app-action-modal>
  `
})
export class OtrPromptModalComponent {
  readonly isOpen = input(false);
  readonly completeRegistration = output<void>();
  readonly dismiss = output<void>();
}
