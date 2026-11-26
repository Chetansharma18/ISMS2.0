import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { ApiError } from '../../core/http/api-error';
import { HttpService } from '../../core/http/http.service';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { humanizeTableName, menuLabel, tableApiPath } from '../../core/permissions/permitted-tables.util';
import { EmptyStateComponent, PageHeaderComponent, PageShellComponent, SectionCardComponent, TableComponent } from '../../shared';
import { ModuleData, moduleColumns, moduleRecordFields, toModuleData } from './table-module.util';

const METHOD_LABELS: Record<string, string> = { GET: 'View', POST: 'Add', PUT: 'Edit', DELETE: 'Delete' };

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: ModuleData }
  | { status: 'error'; message: string };

/**
 * Page for a permitted backend table that has no dedicated screen yet (`/module/:tableName`).
 * Shows what GET /auth/permissions says about the table and, read-only, the data of its `apiEndpoint`. Without an
 * endpoint nothing is fetched: the page does not guess URLs.
 */
@Component({
  selector: 'app-table-module-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, PageHeaderComponent, PageShellComponent, SectionCardComponent, TableComponent],
  template: `
    <app-page-shell>
      <app-page-header [title]="label()" />

      <app-section-card title="Module details" [subtitle]="table()?.description || ''">
        <dl class="grid gap-3 sm:grid-cols-3 m-0 text-[13px]">
          <div>
            <dt class="text-slate-500">Table</dt>
            <dd class="m-0 mt-0.5 font-medium text-slate-900">{{ tableName() }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Your access</dt>
            <dd class="m-0 mt-0.5 font-medium text-slate-900">{{ access() || 'None' }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Data source</dt>
            <dd class="m-0 mt-0.5 font-medium text-slate-900 break-all">{{ table()?.apiEndpoint || 'Not provided' }}</dd>
          </div>
        </dl>
      </app-section-card>

      @let s = load();
      @switch (s.status) {
        @case ('idle') {
          <app-empty-state
            title="Screen not available yet"
            [description]="idleMessage()"
          />
        }
        @case ('error') {
          <app-empty-state icon="error" title="Could not load the records" [description]="s.message" />
        }
        @case ('loading') {
          <app-section-card title="Records">
            <app-table [columns]="[]" [data]="[]" [loading]="true" />
          </app-section-card>
        }
        @case ('ready') {
          @if (s.data.rows) {
            <app-section-card title="Records" [subtitle]="s.data.rows.length + ' record(s)'">
              <app-table
                [columns]="columns()"
                [data]="s.data.rows"
                [searchable]="true"
                [searchFields]="searchFields()"
                [pagination]="true"
                emptyMessage="No records yet"
              />
            </app-section-card>
          } @else if (recordFields().length > 0) {
            <app-section-card title="Details">
              <dl class="grid gap-3 sm:grid-cols-2 m-0 text-[13px]">
                @for (f of recordFields(); track f.label) {
                  <div>
                    <dt class="text-slate-500">{{ f.label }}</dt>
                    <dd class="m-0 mt-0.5 font-medium text-slate-900 break-words">{{ f.value || '-' }}</dd>
                  </div>
                }
              </dl>
            </app-section-card>
          } @else {
            <app-empty-state title="No records yet" />
          }
        }
      }
    </app-page-shell>
  `
})
export class TableModulePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly tableAccess = inject(TableAccessService);
  private readonly http = inject(HttpService);

  protected readonly tableName = toSignal(this.route.paramMap.pipe(map(p => p.get('tableName') ?? '')), { initialValue: '' });
  protected readonly table = computed(() => this.tableAccess.table(this.tableName()));
  protected readonly label = computed(() => {
    const table = this.table();
    return table ? menuLabel(table) : humanizeTableName(this.tableName());
  });
  protected readonly access = computed(() => (this.table()?.methods ?? []).map(m => METHOD_LABELS[m] ?? m).join(', '));

  /** The API path to read: only with View access and a valid `apiEndpoint`. */
  private readonly path = computed(() => {
    const table = this.table();
    return table?.methods.includes('GET') ? tableApiPath(table.apiEndpoint) : null;
  });

  protected readonly idleMessage = computed(() =>
    this.table()?.apiEndpoint
      ? 'The data source of this module is not a portal API path, so its records cannot be shown here.'
      : 'You have access to this module, but its screen has not been built in the portal yet.'
  );

  protected readonly load = toSignal(
    toObservable(this.path).pipe(
      distinctUntilChanged(),
      switchMap(path =>
        !path
          ? of<LoadState>({ status: 'idle' })
          : this.http.call<unknown>({ method: 'GET', url: path }, { flags: { skipErrorToast: true } }).pipe(
              map((res): LoadState => ({ status: 'ready', data: toModuleData(res) })),
              catchError((error: unknown) =>
                of<LoadState>({ status: 'error', message: error instanceof ApiError ? error.message : 'Please try again later.' })
              ),
              startWith<LoadState>({ status: 'loading' })
            )
      )
    ),
    { initialValue: { status: 'idle' } as LoadState }
  );

  protected readonly columns = computed(() => {
    const s = this.load();
    return s.status === 'ready' && s.data.rows ? moduleColumns(s.data.rows) : [];
  });
  protected readonly searchFields = computed(() => this.columns().map(c => c.key));
  protected readonly recordFields = computed(() => {
    const s = this.load();
    return s.status === 'ready' && s.data.record ? moduleRecordFields(s.data.record) : [];
  });
}
