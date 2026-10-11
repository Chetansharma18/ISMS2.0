import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Bottom navigation bar of wizard steps 1-3 with a single "Proceed" button. */
@Component({
  selector: 'app-aspirant-step-nav-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
      <button
        type="button"
        (click)="proceed.emit()"
        class="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
      >
        <span>{{ label() }}</span>
        <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

  `
})
export class AspirantStepNavBarComponent {
  readonly label = input.required<string>();

  readonly proceed = output<void>();
}
