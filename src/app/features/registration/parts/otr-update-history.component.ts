import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FilterTab, FilterTabsComponent } from '../../../shared/components/filter-tabs/filter-tabs.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableColumn } from '../../../shared/components/table/table.types';
import { OtrFormDef, OtrUpdateLogDto } from '../models/otr-api.model';
import { formSteps } from '../otr-form.util';
import { OTR_LOG_SECTIONS, OtrUpdateLogRow, toUpdateLogRows } from '../otr-update-log.util';

const ALL = 'all';

/** The registration's change history (GET /otr/me/update-logs), filterable by step. */
@Component({
  selector: 'app-otr-update-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, FilterTabsComponent, TableComponent],
  template: `
    <div class="mt-3 space-y-3">
      @if (error(); as message) {
        <app-empty-state icon="error" title="The history could not be loaded" [description]="message" />
      } @else {
        <app-filter-tabs ariaLabel="Step" [options]="tabs()" [(value)]="filter" />
        <app-table
          [columns]="columns"
          [data]="rows()"
          [loading]="loading()"
          [pagination]="true"
          [pageSize]="8"
          itemUnit="changes"
          emptyMessage="No changes recorded yet."
        />
      }
    </div>
  `
})
export class OtrUpdateHistoryComponent {
  readonly form = input<OtrFormDef | null>(null);
  readonly logs = input<OtrUpdateLogDto[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly filter = signal<string>(ALL);

  private readonly allRows = computed(() => toUpdateLogRows(this.logs(), this.form()));

  readonly tabs = computed<FilterTab[]>(() => {
    const logs = this.logs();
    const count = (section: string) => logs.filter(l => l.section.toLowerCase() === section.toLowerCase()).length;
    const steps = this.form() ? formSteps(this.form()!) : [];
    return [
      { id: ALL, label: 'All', count: logs.length },
      ...steps
        .filter(s => OTR_LOG_SECTIONS[s.key])
        .map(s => ({ id: OTR_LOG_SECTIONS[s.key], label: s.title, count: count(OTR_LOG_SECTIONS[s.key]) }))
    ];
  });

  readonly rows = computed<OtrUpdateLogRow[]>(() => {
    const filter = this.filter();
    if (filter === ALL) return this.allRows();
    const ids = new Set(this.logs().filter(l => l.section.toLowerCase() === filter.toLowerCase()).map(l => l.id));
    return this.allRows().filter(r => ids.has(r.id)).map((r, i) => ({ ...r, sNo: i + 1 }));
  });

  readonly columns: TableColumn<OtrUpdateLogRow>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'when', label: 'Date & Time', cellClass: 'whitespace-nowrap tabular-nums' },
    { key: 'step', label: 'Step', cellClass: 'whitespace-nowrap' },
    { key: 'action', label: 'Action' },
    { key: 'reason', label: 'Reason', cellClass: 'min-w-[160px] whitespace-normal' },
    { key: 'changes', label: 'Changed Fields', cellClass: 'min-w-[200px] whitespace-normal' }
  ];
}
