import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { humanizeTableName } from '../../core/permissions/permitted-tables.util';
import { EmptyStateComponent, PageHeaderComponent, PageShellComponent, SectionCardComponent } from '../../shared';

const METHOD_LABELS: Record<string, string> = { GET: 'View', POST: 'Add', PUT: 'Edit', DELETE: 'Delete' };

/**
 * Page for a permitted backend table that has no dedicated screen yet (`/module/:tableName`).
 * Shows what GET /auth/permissions says about the table, so every permitted table is reachable from the sidebar.
 */
@Component({
  selector: 'app-table-module-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, PageHeaderComponent, PageShellComponent, SectionCardComponent],
  template: `
    <app-page-shell>
      <app-page-header [title]="label()" />

      <app-section-card title="Module details" [subtitle]="table()?.description || ''">
        <dl class="grid gap-3 sm:grid-cols-2 m-0 text-[13px]">
          <div>
            <dt class="text-slate-500">Table</dt>
            <dd class="m-0 mt-0.5 font-medium text-slate-900">{{ tableName() }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Your access</dt>
            <dd class="m-0 mt-0.5 font-medium text-slate-900">{{ access() || 'None' }}</dd>
          </div>
        </dl>
      </app-section-card>

      <app-empty-state
        title="Screen not available yet"
        description="You have access to this module, but its screen has not been built in the portal yet."
      />
    </app-page-shell>
  `
})
export class TableModulePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly tableAccess = inject(TableAccessService);

  protected readonly tableName = toSignal(this.route.paramMap.pipe(map(p => p.get('tableName') ?? '')), { initialValue: '' });
  protected readonly table = computed(() => this.tableAccess.table(this.tableName()));
  protected readonly label = computed(() => humanizeTableName(this.tableName()));
  protected readonly access = computed(() => (this.table()?.methods ?? []).map(m => METHOD_LABELS[m] ?? m).join(', '));
}
