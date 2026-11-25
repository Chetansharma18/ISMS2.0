import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FilterTabsComponent } from '../../../shared';

@Component({
  selector: 'app-role-filter-bar',
  standalone: true,
  imports: [FilterTabsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <app-filter-tabs
      class="w-full"
      stretch
      ariaLabel="Filter users by role"
      [options]="tabs()"
      [value]="selected()"
      (valueChange)="selectedChange.emit($event)"
    />
  `
})
export class RoleFilterBarComponent {
  readonly options = input.required<ReadonlyArray<{ value: string; label: string }>>();
  readonly selected = input.required<string>();
  readonly selectedChange = output<string>();

  protected readonly tabs = computed(() => this.options().map(option => ({ id: option.value, label: option.label })));
}
