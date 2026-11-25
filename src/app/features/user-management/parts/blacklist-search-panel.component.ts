import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective } from '../../../shared';

@Component({
  selector: 'app-blacklist-search-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-white border border-[#EADCE2] p-4 sm:p-5 rounded-[10px] shadow-2xs mt-1 mb-4 font-sans">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Info & Instructions -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
              Debarment Action
            </span>
            <h3 class="m-0 text-sm sm:text-base font-bold text-slate-800">
              Blacklist User via SSO ID
            </h3>
          </div>
        </div>

        <!-- Search SSO ID Input & Action -->
        <div class="w-full md:w-auto md:min-w-[420px] shrink-0">
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <app-icon name="search" size="xs" />
              </span>
              <input
                appInput
                size="sm"
                type="text"
                [ngModel]="value()"
                (ngModelChange)="valueChange.emit($event)"
                (keydown.enter)="blacklist.emit()"
                placeholder="Search SSO ID or Username..."
                class="w-full pl-8 text-xs font-medium"
              />
            </div>
            <button
              appButton
              variant="danger"
              size="sm"
              type="button"
              (click)="blacklist.emit()"
              class="shrink-0 whitespace-nowrap"
            >
              <app-icon name="ban" size="xs" />
              <span>Search & Blacklist</span>
            </button>
          </div>

          @if (error()) {
            <div class="flex items-center gap-1.5 text-xs text-rose-600 mt-2 font-medium">
              <app-icon name="error-circle" size="xs" />
              <span>{{ error() }}</span>
            </div>
          }
          @if (success()) {
            <div class="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
              <app-icon name="check-circle" size="xs" />
              <span>{{ success() }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class BlacklistSearchPanelComponent {
  readonly value = input.required<string>();
  readonly error = input<string>('');
  readonly success = input<string>('');
  readonly valueChange = output<string>();
  readonly blacklist = output<void>();
}
