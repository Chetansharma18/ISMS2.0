import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../shared';

/** Dismissible rose-coloured validation / error banner shown above the wizard steps. */
@Component({
  selector: 'app-aspirant-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
      <div class="flex items-center gap-2">
        <app-icon name="alert-triangle" [stroke]="2" class="text-rose-600 shrink-0" />
        <span>{{ message() }}</span>
      </div>
      <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="dismiss.emit()"><app-icon name="close" size="xs" /></button>
    </div>

  `
})
export class AspirantErrorBannerComponent {
  readonly message = input.required<string>();

  readonly dismiss = output<void>();
}
