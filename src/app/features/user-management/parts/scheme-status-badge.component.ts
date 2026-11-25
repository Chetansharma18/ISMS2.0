import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-scheme-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (status() === 'Active') {
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
        Active
      </span>
    } @else if (status() === 'Blacklisted') {
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
        Blacklisted
      </span>
    } @else {
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
        Inactive
      </span>
    }
  `
})
export class SchemeStatusBadgeComponent {
  readonly status = input<string | null | undefined>();
}
