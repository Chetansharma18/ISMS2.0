import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../shared';

/** Bottom navigation bar of wizard steps 1-3 with a single "Proceed" button. */
@Component({
  selector: 'app-aspirant-step-nav-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
      <button
        appButton
        size="lg"
        type="button"
        (click)="proceed.emit()"
      >
        <span>{{ label() }}</span>
        <app-icon name="chevron-right" size="sm" />
      </button>
    </div>

  `
})
export class AspirantStepNavBarComponent {
  readonly label = input.required<string>();

  readonly proceed = output<void>();
}
