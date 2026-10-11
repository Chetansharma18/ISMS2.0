import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-filter-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full flex flex-col sm:flex-row gap-3">
      @for (option of options(); track option.value) {
        <button
          type="button"
          (click)="selectedChange.emit(option.value)"
          [ngClass]="selected() === option.value ? 'bg-primary text-white shadow-md border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-brand hover:border-primary/30'"
          class="px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex-1 text-center shadow-sm"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `
})
export class RoleFilterBarComponent {
  readonly options = input.required<ReadonlyArray<{ value: string; label: string }>>();
  readonly selected = input.required<string>();
  readonly selectedChange = output<string>();
}
