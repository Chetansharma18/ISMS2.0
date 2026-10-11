import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Dismissible rose-coloured validation / error banner shown above the wizard steps. */
@Component({
  selector: 'app-aspirant-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ message() }}</span>
      </div>
      <button (click)="dismiss.emit()" class="text-rose-500 hover:text-rose-800 cursor-pointer font-bold">✕</button>
    </div>

  `
})
export class AspirantErrorBannerComponent {
  readonly message = input.required<string>();

  readonly dismiss = output<void>();
}
