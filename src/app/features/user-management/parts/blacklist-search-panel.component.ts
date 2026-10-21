import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputDirective } from '../../../shared';

@Component({
  selector: 'app-blacklist-search-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-white border border-rose-200 p-4 rounded-xl shadow-sm mt-3 mb-1 flex flex-col md:flex-row gap-4 items-end">
      <div class="flex-1 w-full">
        <label class="block text-slate-700 font-semibold mb-1.5 text-sm">Search User to Blacklist (SSO ID or Name)</label>
        <div class="flex gap-2">
          <input appInput type="text" [ngModel]="value()" (ngModelChange)="valueChange.emit($event)" placeholder="Enter SSO ID or Name..." class="flex-1">
          <button appButton variant="danger" (click)="blacklist.emit()" class="whitespace-nowrap">
            Blacklist User
          </button>
        </div>
        @if (error()) {
          <div class="text-xs text-rose-500 mt-1.5 font-medium">{{ error() }}</div>
        }
        @if (success()) {
          <div class="text-xs text-emerald-600 mt-1.5 font-medium">{{ success() }}</div>
        }
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
