import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { ApiError } from '../../core/http/api-error';
import { HttpService } from '../../core/http/http.service';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { humanizeTableName, menuLabel, tableApiPath } from '../../core/permissions/permitted-tables.util';
import type { ResourceRepository } from '../../core/services/data-engine.service';
import {
  EmptyStateComponent,
  MasterCrudPageComponent,
  PageHeaderComponent,
  PageShellComponent,
  SectionCardComponent,
  TableComponent
} from '../../shared';
import type { MasterCrudConfig, MasterFieldConfig } from '../../shared/components/master-crud/master-crud.types';
import {
  ModuleData,
  ModuleItem,
  ModuleRow,
  ModuleShape,
  entityName,
  moduleColumns,
  moduleDefaults,
  moduleRecordFields,
  moduleShape,
  toModuleBody,
  toModuleData,
  toModuleItem
} from './table-module.util';

const METHOD_LABELS: Record<string, string> = { GET: 'View', POST: 'Add', PUT: 'Edit', DELETE: 'Delete' };

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; path: string; data: ModuleData }
  | { status: 'error'; message: string };

/**
 * Page for a permitted backend table that has no dedicated screen yet (`/module/:tableName`). It reads the table's
 * `apiEndpoint` (GET /auth/permissions) and, when the endpoint returns a list of records with an id, shows them in
 * the masters' table (`app-master-crud-page`): search, View, and Add / Edit / Active switch / Delete as the user's
 * permissions on the table allow (POST / PUT / DELETE on `apiEndpoint` and `apiEndpoint/{id}`). The form fields are
 * the ones the records have. Without an endpoint nothing is fetched: the page does not guess URLs.
 */
@Component({
  selector: 'app-table-module-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, MasterCrudPageComponent, PageHeaderComponent, PageShellComponent, SectionCardComponent, TableComponent],
  template: `
    @if (crudConfig(); as config) {
      <!-- One master table per module: recreated when the module changes -->
      @for (c of [config]; track tableName()) {
        <app-master-crud-page [config]="c" />
      }
    } @else {
      <app-page-shell>
        <app-page-header [title]="label()" [subtitle]="table()?.description || ''" />

        @let s = load();
        @switch (s.status) {
          @case ('idle') {
            <app-empty-state title="Screen not available yet" [description]="idleMessage()" />
          }
          @case ('error') {
            <app-empty-state title="No data found" />
          }
          @case ('loading') {
            <app-section-card title="Records">
              <app-table [columns]="[]" [data]="[]" [loading]="true" />
            </app-section-card>
          }
          @case ('ready') {
            @if (s.data.rows) {
              <!-- Records without an id cannot be edited here: shown read-only -->
              <app-section-card title="Records" [subtitle]="s.data.rows.length + ' record(s)'">
                <app-table
                  [columns]="readOnlyColumns()"
                  [data]="s.data.rows"
                  [searchable]="true"
                  [searchFields]="searchFields()"
                  [pagination]="true"
                  emptyMessage="No data found"
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
              <app-empty-state title="No data found" />
            }
          }
        }

        <p class="m-0 text-xs text-slate-500">Your access: {{ access() || 'None' }}</p>
      </app-page-shell>
    }
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
          : this.get(path).pipe(
              map((res): LoadState => ({ status: 'ready', path, data: toModuleData(res) })),
              catchError((error: unknown) =>
                of<LoadState>({ status: 'error', message: error instanceof ApiError ? error.message : 'Please try again later.' })
              ),
              startWith<LoadState>({ status: 'loading' })
            )
      )
    ),
    { initialValue: { status: 'idle' } as LoadState }
  );

  /** The masters' table for the module, when its records have an id to edit and delete by. */
  protected readonly crudConfig = computed<MasterCrudConfig<ModuleItem> | null>(() => {
    const s = this.load();
    if (s.status !== 'ready' || !s.data.rows) return null;
    const shape = moduleShape(s.data.rows);
    return shape ? this.buildConfig(s.path, s.data.rows, shape) : null;
  });

  protected readonly readOnlyColumns = computed(() => {
    const s = this.load();
    return s.status === 'ready' && s.data.rows ? moduleColumns(s.data.rows) : [];
  });
  protected readonly searchFields = computed(() => this.readOnlyColumns().map(c => c.key));
  protected readonly recordFields = computed(() => {
    const s = this.load();
    return s.status === 'ready' && s.data.record ? moduleRecordFields(s.data.record) : [];
  });

  private get(path: string): Observable<unknown> {
    return this.http.call<unknown>({ method: 'GET', url: path }, { flags: { skipErrorToast: true } });
  }

  private buildConfig(path: string, firstRows: ModuleRowList, shape: ModuleShape): MasterCrudConfig<ModuleItem> {
    const tableName = this.tableName();
    const label = this.label();
    const entity = entityName(label);
    const normalize = (raw: unknown, i: number) => toModuleItem(raw, i, shape);
    const fields: MasterFieldConfig<ModuleItem>[] = shape.fields.map(f => ({
      key: f.key,
      label: f.label,
      type: f.kind === 'flag' ? 'select' : f.kind === 'number' ? 'number' : f.kind === 'textarea' ? 'textarea' : 'text',
      options: f.kind === 'flag' ? ['Yes', 'No'] : undefined,
      rows: f.kind === 'textarea' ? 3 : undefined,
      colSpan: f.kind === 'textarea' ? 3 : 1,
      placeholder: f.kind === 'flag' ? undefined : `Enter ${f.label.toLowerCase()}`
    }));
    return {
      dataKey: `MODULE_${tableName}`,
      permissionTable: tableName,
      repository: this.repository(path, firstRows, normalize),
      entityLabel: entity,
      title: label,
      subtitle: this.table()?.description || undefined,
      searchPlaceholder: `Search ${label.toLowerCase()}...`,
      searchFields: shape.columns.map(c => c.key).filter(k => k !== 'sNo' && k !== 'status'),
      itemUnit: 'records',
      columns: shape.columns,
      viewColumns: shape.fields.map(f => ({ key: f.key, label: f.label })),
      hasStatus: !!shape.activeKey,
      hideStatusToggle: !shape.activeKey,
      showDeleteAction: true,
      reloadAfterSave: true,
      fields,
      createDefaults: () => moduleDefaults(shape),
      buildPayload: (form: Record<string, unknown>) =>
        Object.fromEntries(shape.fields.map(f => [f.key, form[f.key]])) as Partial<ModuleItem>,
      normalizer: normalize,
      toApiPayload: (payload, current) => toModuleBody(shape, payload as Record<string, unknown>, current),
      deleteConfirmText: () => `Are you sure you want to delete this ${entity.toLowerCase()}?`
    };
  }

  /**
   * CRUD on the table's endpoint: GET / POST `path`, PUT / DELETE `path/{id}`. The first load reuses the records
   * already fetched for the page; failures show the HTTP layer's toast.
   */
  private repository(path: string, firstRows: ModuleRowList, normalize: (raw: unknown, i: number) => ModuleItem): ResourceRepository<ModuleItem> {
    let cached: ModuleRowList | null = firstRows;
    const byId = (id: string | number) => `${path}/${encodeURIComponent(String(id))}`;
    const rowsOf = (res: unknown) => (toModuleData(res).rows ?? []).map(normalize);
    const one = (res: unknown) => normalize(toModuleData(res).record ?? {}, 0);
    const getAll = () => {
      if (cached) {
        const rows = cached.map(normalize);
        cached = null;
        return of(rows);
      }
      return this.http.call<unknown>({ method: 'GET', url: path }).pipe(map(rowsOf));
    };
    return {
      getAll,
      list: () => getAll().pipe(map(items => ({ items, total: items.length, page: 1, pageSize: items.length, totalPages: 1 }))),
      getById: id => this.http.call<unknown>({ method: 'GET', url: byId(id) }).pipe(map(one)),
      create: body => this.http.call<unknown>({ method: 'POST', url: path }, { body }).pipe(map(one)),
      update: (id, body) => this.http.call<unknown>({ method: 'PUT', url: byId(id) }, { body }).pipe(map(one)),
      delete: id => this.http.call<unknown>({ method: 'DELETE', url: byId(id) }).pipe(map(() => true))
    };
  }
}

type ModuleRowList = ModuleRow[];
