import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActionModalComponent,
  ButtonComponent,
  DropdownComponent,
  IconComponent,
  InputDirective,
  PageHeaderComponent,
  PageShellComponent,
  SwitchComponent,
  TableColumn,
  TableComponent
} from '../../shared';
import type { DropdownItem } from '../../shared/components/dropdown/dropdown.component';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { HttpService } from '../../core/http/http.service';
import type { RoleTablePermission, UserRoleMasterItem } from '../../core/models/admin-masters.model';
import { toTablePermissionRequest, toUserRoleItem } from '../../core/models/role.normalizer';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { TABLE_SCREENS } from '../../core/permissions/table-screens';
import { humanizeTableName } from '../../core/permissions/permitted-tables.util';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  GrantableTable,
  PermissionRow,
  filterPermissionRows,
  toGrantableTables,
  toPermissionRows
} from './role-permissions.util';

type Access = Pick<RoleTablePermission, 'get' | 'post' | 'put' | 'delete'>;
type AccessKey = keyof Access;

const ACCESS_OPTIONS: { key: AccessKey; label: string }[] = [
  { key: 'get', label: 'View' },
  { key: 'post', label: 'Add' },
  { key: 'put', label: 'Edit' },
  { key: 'delete', label: 'Delete' }
];

interface PermissionForm extends Access {
  roleId: string;
  tables: string[];
  status: boolean;
  enableInMenu: boolean;
  menuCallingName: string;
}

const emptyForm = (roleId = ''): PermissionForm => ({
  roleId,
  tables: [],
  get: true,
  post: false,
  put: false,
  delete: false,
  status: true,
  enableInMenu: false,
  menuCallingName: ''
});

/**
 * Role Permissions (backend RolePermissions, managed through `/api/roles`):
 * - rows: every role's table grants, from GET /api/roles (each role lists its permissions);
 * - add / edit: POST /api/roles/{roleId}/permissions (adds or updates by table, other tables are kept);
 * - the access ticks, the menu fields and the Active switch save at once with the same call;
 * - remove: DELETE /api/roles/{roleId}/permissions/{permissionId}.
 * The tables to grant come from GET /api/tablelist. A change to the signed-in user's own role shows in their sidebar
 * after the permissions reload (next sign-in, role switch, or when the cache expires).
 */
@Component({
  selector: 'app-permission-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ActionModalComponent,
    ButtonComponent,
    DropdownComponent,
    IconComponent,
    InputDirective,
    PageHeaderComponent,
    PageShellComponent,
    SwitchComponent,
    TableComponent
  ],
  template: `
    <app-page-shell>
      <app-page-header
        title="Role Permissions"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Role Permissions' }]"
        [searchable]="true"
        searchPlaceholder="Search by role, table or menu name..."
        [(searchQuery)]="searchQuery"
      >
        <select
          appInput
          size="sm"
          aria-label="Filter by role"
          class="w-auto whitespace-nowrap shrink-0"
          [ngModel]="roleFilter()"
          (ngModelChange)="roleFilter.set($event)"
        >
          <option value="all">All roles</option>
          @for (role of roles(); track role.id) {
            <option [value]="role.id">{{ role.roleTypeName }}</option>
          }
        </select>
        @if (canAdd()) {
          <button appButton size="sm" type="button" class="shrink-0" (click)="openAdd()">
            <app-icon name="plus" size="sm" />
            <span>Add Permission</span>
          </button>
        }
      </app-page-header>

      <app-table
        [columns]="columns"
        [data]="visibleRows()"
        [loading]="loading()"
        [pagination]="true"
        [pageSize]="10"
        itemUnit="permissions"
        [rowClass]="rowClass"
        emptyMessage="No permissions found. Use Add Permission to grant a role access to a table."
        [customTemplates]="{ access: accessTpl, menu: menuTpl, action: actionTpl }"
      />

      <!-- Access ticks: each change is saved at once -->
      <ng-template #accessTpl let-row>
        <div class="flex items-center gap-4 select-none py-1">
          @for (opt of accessOptions; track opt.key) {
            <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700" [class.cursor-pointer]="canEdit()">
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer accent-primary"
                [checked]="row[opt.key]"
                [disabled]="!canEdit() || saving()"
                (change)="toggleAccess(row, opt.key, $event)"
              />
              <span>{{ opt.label }}</span>
            </label>
          }
        </div>
      </ng-template>

      <ng-template #menuTpl let-row>
        @if (row.enableInMenu) {
          <span class="inline-flex items-center gap-1.5 text-[13px] text-slate-800">
            <app-icon name="list" size="sm" class="text-slate-400" />
            {{ row.menuCallingName || row.tableLabel }}
          </span>
        } @else {
          <span class="text-xs text-slate-400">Not in menu</span>
        }
      </ng-template>

      <ng-template #actionTpl let-row>
        <div class="flex items-center justify-center whitespace-nowrap">
          @if (canEdit()) {
            <button appButton variant="ghost" size="sm" type="button" title="Edit" (click)="$event.stopPropagation(); openEdit(row)">
              <app-icon name="edit" size="sm" />
              <span>Edit</span>
            </button>
          }
          @if (canRemove()) {
            <div class="h-3.5 w-px bg-slate-300 shrink-0 mx-2"></div>
            <button appButton variant="ghost" size="sm" type="button" title="Remove" (click)="$event.stopPropagation(); remove(row)">
              <app-icon name="trash" size="sm" />
              <span>Remove</span>
            </button>
          }
          @if (canEdit()) {
            <div class="h-3.5 w-px bg-slate-300 shrink-0 mx-2"></div>
            <div class="inline-flex items-center gap-1.5" (click)="$event.stopPropagation()">
              <app-switch [checked]="row.status" label="Active" [disabled]="saving()" (toggled)="toggleStatus(row)" />
              <span class="text-[12px] font-semibold" [class.text-emerald-700]="row.status" [class.text-slate-500]="!row.status">
                {{ row.status ? 'Active' : 'Inactive' }}
              </span>
            </div>
          }
        </div>
      </ng-template>

      <!-- Add / edit -->
      <app-action-modal
        [isOpen]="modalOpen()"
        [title]="editing() ? 'Edit Permission' : 'Add Permission'"
        [description]="editing() ? 'Change what this role may do on the table and how it appears in the menu.' : 'Grant a role access to one or more tables.'"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        [disablePrimary]="saving()"
        [primaryLabel]="saving() ? 'Saving...' : 'Save'"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[560px]"
        (primaryAction)="submit()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <div class="mt-4 space-y-4 text-[13px]">
          <div>
            <label class="block mb-1 font-medium text-slate-700" for="perm-role">Role*</label>
            <select
              appInput
              id="perm-role"
              class="w-full"
              [disabled]="!!editing()"
              [invalid]="submitted() && !form.roleId"
              [(ngModel)]="form.roleId"
            >
              <option value="" disabled>Select role</option>
              @for (role of roles(); track role.id) {
                <option [value]="role.id">{{ role.roleTypeName }}{{ role.status === 'Inactive' ? ' (inactive)' : '' }}</option>
              }
            </select>
            @if (submitted() && !form.roleId) {
              <p class="m-0 mt-1 text-xs font-medium text-rose-700">Select a role.</p>
            }
          </div>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <label class="font-medium text-slate-700">{{ editing() ? 'Table' : 'Tables*' }}</label>
              @if (!editing()) {
                <span class="text-xs text-slate-500">{{ form.tables.length }} selected</span>
              }
            </div>
            @if (editing(); as row) {
              <p class="m-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-800">
                {{ row.tableLabel }} <span class="text-xs text-slate-500">({{ row.tableName }})</span>
              </p>
            } @else {
              <app-dropdown
                multiple
                [searchable]="true"
                searchPlaceholder="Search tables..."
                emptyText="No table matches"
                placeholder="Select tables"
                selectAllLabel="Select all tables"
                [options]="tableOptions()"
                [(values)]="form.tables"
                [invalid]="submitted() && form.tables.length === 0"
              />
              @if (submitted() && form.tables.length === 0) {
                <p class="m-0 mt-1 text-xs font-medium text-rose-700">Select at least one table.</p>
              } @else if (form.tables.length > 0 && alreadyGranted().length > 0) {
                <p class="m-0 mt-1 text-xs text-slate-500">
                  Already granted to this role, will be updated: {{ alreadyGranted().join(', ') }}
                </p>
              }
            }
          </div>

          <div>
            <label class="block mb-1.5 font-medium text-slate-700">Access*</label>
            <div
              class="flex flex-wrap items-center gap-6 rounded-lg border bg-slate-50/70 p-3"
              [class.border-rose-500]="submitted() && !hasAccess()"
              [class.border-slate-200]="!(submitted() && !hasAccess())"
            >
              @for (opt of accessOptions; track opt.key) {
                <label class="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input type="checkbox" class="h-4 w-4 cursor-pointer accent-primary" [(ngModel)]="form[opt.key]" />
                  <span>{{ opt.label }}</span>
                </label>
              }
            </div>
            @if (submitted() && !hasAccess()) {
              <p class="m-0 mt-1 text-xs font-medium text-rose-700">Tick at least one access right.</p>
            } @else if (form.enableInMenu && !form.get) {
              <p class="m-0 mt-1 text-xs text-amber-700">A menu link needs View access to open the screen.</p>
            }
          </div>

          <div class="rounded-lg border border-slate-200 p-3 space-y-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="m-0 font-medium text-slate-800">Show in menu</p>
                <p class="m-0 text-xs text-slate-500">Adds a sidebar link for this role.</p>
              </div>
              <app-switch [checked]="form.enableInMenu" label="Show in menu" (toggled)="form.enableInMenu = $event" />
            </div>
            @if (form.enableInMenu) {
              @if (editing() || form.tables.length <= 1) {
                <div>
                  <label class="block mb-1 font-medium text-slate-700" for="perm-menu-name">Menu name</label>
                  <input
                    appInput
                    id="perm-menu-name"
                    class="w-full"
                    maxlength="150"
                    [placeholder]="menuNamePlaceholder()"
                    [(ngModel)]="form.menuCallingName"
                  />
                  <p class="m-0 mt-1 text-xs text-slate-500">Leave empty to use the table name.</p>
                </div>
              } @else {
                <p class="m-0 text-xs text-slate-500">Each table uses its table name. Edit a row to give it its own menu name.</p>
              }
            }
          </div>

          @if (editing()) {
            <div class="flex items-center justify-between gap-3">
              <span class="font-medium text-slate-700">Active</span>
              <app-switch [checked]="form.status" label="Active" (toggled)="form.status = $event" />
            </div>
          }
        </div>
      </app-action-modal>
    </app-page-shell>
  `
})
export class PermissionMasterComponent {
  private readonly http = inject(HttpService);
  private readonly dataEngine = inject(DataEngineService);
  private readonly tableAccess = inject(TableAccessService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly roleRepo = this.dataEngine.for<UserRoleMasterItem>('USER_ROLES', { normalizer: item => toUserRoleItem(item) });

  protected readonly accessOptions = ACCESS_OPTIONS;

  readonly roles = signal<UserRoleMasterItem[]>([]);
  readonly tables = signal<GrantableTable[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly searchQuery = signal('');
  readonly roleFilter = signal('all');

  readonly modalOpen = signal(false);
  readonly editing = signal<PermissionRow | null>(null);
  readonly submitted = signal(false);
  form: PermissionForm = emptyForm();

  readonly rows = computed(() => toPermissionRows(this.roles()));
  readonly visibleRows = computed(() => filterPermissionRows(this.rows(), this.roleFilter(), this.searchQuery()));

  /** Tables to choose from: the table list, plus any table a role already has a grant on. */
  readonly tableOptions = computed<DropdownItem[]>(() => {
    const byName = new Map(this.tables().map(t => [t.tableName.toLowerCase(), t]));
    for (const row of this.rows()) {
      if (!byName.has(row.tableName.toLowerCase())) {
        byName.set(row.tableName.toLowerCase(), { tableName: row.tableName, label: row.tableLabel, description: '' });
      }
    }
    return [...byName.values()]
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(t => ({ value: t.tableName, label: t.label }));
  });

  // Buttons follow the signed-in user's own rights on the RolePermissions table.
  readonly canAdd = computed(() => this.tableAccess.can('RolePermissions', 'POST'));
  readonly canEdit = computed(() => this.tableAccess.can('RolePermissions', 'PUT') || this.tableAccess.can('RolePermissions', 'POST'));
  readonly canRemove = computed(() => this.tableAccess.can('RolePermissions', 'DELETE'));

  readonly columns: TableColumn<PermissionRow>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'roleName', label: 'Role', cellClass: 'whitespace-nowrap font-semibold text-slate-800 min-w-[140px]' },
    { key: 'tableLabel', label: 'Table', cellClass: 'whitespace-nowrap font-medium text-slate-700 min-w-[180px]' },
    { key: 'access', label: 'Access', type: 'custom', cellClass: 'min-w-[260px]' },
    { key: 'menu', label: 'Menu', type: 'custom', cellClass: 'min-w-[160px]' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'min-w-[260px]' }
  ];

  protected readonly rowClass = (row: PermissionRow): string => (row.status ? 'bg-white' : 'opacity-60 !bg-slate-100/70');

  constructor() {
    this.loadRoles();
    this.loadTables();
  }

  protected hasAccess(): boolean {
    return this.form.get || this.form.post || this.form.put || this.form.delete;
  }

  /** Tables picked in the add dialog that the chosen role already has (they are updated, not duplicated). */
  protected alreadyGranted(): string[] {
    const role = this.roles().find(r => r.id === this.form.roleId);
    const granted = new Set((role?.tablePermissions ?? []).map(p => p.tableName.toLowerCase()));
    return this.form.tables.filter(t => granted.has(t.toLowerCase())).map(humanizeTableName);
  }

  protected menuNamePlaceholder(): string {
    const table = this.editing()?.tableName ?? this.form.tables[0];
    return table ? humanizeTableName(table) : 'Menu name';
  }

  openAdd(): void {
    const filtered = this.roleFilter() !== 'all' ? this.roleFilter() : '';
    this.form = emptyForm(filtered);
    this.editing.set(null);
    this.submitted.set(false);
    this.modalOpen.set(true);
  }

  openEdit(row: PermissionRow): void {
    this.form = {
      roleId: String(row.roleId),
      tables: [row.tableName],
      get: row.get,
      post: row.post,
      put: row.put,
      delete: row.delete,
      status: row.status,
      enableInMenu: row.enableInMenu,
      menuCallingName: row.menuCallingName ?? ''
    };
    this.editing.set(row);
    this.submitted.set(false);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (this.saving()) return;
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.form.roleId || this.form.tables.length === 0 || !this.hasAccess()) return;

    const single = this.form.tables.length === 1;
    const permissions = this.form.tables.map(tableName =>
      toTablePermissionRequest({
        tableName,
        status: this.editing() ? this.form.status : true,
        get: this.form.get,
        post: this.form.post,
        put: this.form.put,
        delete: this.form.delete,
        enableInMenu: this.form.enableInMenu,
        menuCallingName: this.form.enableInMenu && single ? this.form.menuCallingName : null
      })
    );
    const message = permissions.length === 1 ? 'Permission saved.' : `${permissions.length} permissions saved.`;
    this.save(this.form.roleId, permissions, () => {
      this.modalOpen.set(false);
      this.editing.set(null);
      this.notifications.success(message);
    });
  }

  toggleAccess(row: PermissionRow, key: AccessKey, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = { ...row, [key]: checked };
    if (!next.get && !next.post && !next.put && !next.delete) {
      (event.target as HTMLInputElement).checked = true;
      this.notifications.warning('A permission needs at least one access right. Use Remove to take the table away.');
      return;
    }
    this.save(String(row.roleId), [toTablePermissionRequest(next)]);
  }

  toggleStatus(row: PermissionRow): void {
    this.save(String(row.roleId), [toTablePermissionRequest({ ...row, status: !row.status })]);
  }

  remove(row: PermissionRow): void {
    if (!confirm(`Remove the ${row.tableLabel} permission from ${row.roleName}?`)) return;
    this.saving.set(true);
    this.http.call<unknown>(API_ENDPOINTS.ROLE_PERMISSIONS.REMOVE, { id: `${row.roleId}/${row.id}` }).subscribe({
      next: res => {
        this.saving.set(false);
        this.applyRole(row.roleId, res);
        this.syncOwnPermissions();
        this.notifications.success('Permission removed.');
      },
      error: () => this.saving.set(false)
    });
  }

  // ---- internals ----

  private loadRoles(): void {
    this.loading.set(true);
    this.roleRepo
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: roles => {
          this.roles.set(roles);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  /** The grantable tables (GET /api/tablelist). Without access to it, the screens' tables and existing grants are offered. */
  private loadTables(): void {
    const fallback = (): GrantableTable[] =>
      toGrantableTables([...Object.keys(TABLE_SCREENS), ...this.tableAccess.tables().map(t => t.tableName)].map(tableName => ({ tableName })));
    this.http
      .call<unknown>(API_ENDPOINTS.TABLE_LIST.LIST, { flags: { skipErrorToast: true } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          const tables = toGrantableTables(res);
          this.tables.set(tables.length > 0 ? tables : fallback());
        },
        error: () => this.tables.set(fallback())
      });
  }

  /** POST /api/roles/{roleId}/permissions; the answer is the updated role, which replaces the one shown. */
  private save(roleId: string, permissions: Record<string, unknown>[], done?: () => void): void {
    if (!/^\d+$/.test(roleId)) {
      this.notifications.error('This role is not stored on the server, so its permissions cannot be changed.');
      return;
    }
    this.saving.set(true);
    this.http.call<unknown>(API_ENDPOINTS.ROLE_PERMISSIONS.ASSIGN, { id: roleId, body: { permissions } }).subscribe({
      next: res => {
        this.saving.set(false);
        this.applyRole(Number(roleId), res);
        this.syncOwnPermissions();
        done?.();
      },
      // The error toast is shown by the HTTP layer; reload so the ticks show what is really stored.
      error: () => {
        this.saving.set(false);
        this.loadRoles();
      }
    });
  }

  /**
   * Reloads the signed-in user's own permissions (GET /auth/permissions) after a change, so the sidebar, menu names and
   * buttons follow at once when the changed role is the one in use. The backend scopes the answer to the active role,
   * so a change to another role leaves this user's menu as it is. Other signed-in users pick changes up on their next
   * reload of the permissions (sign-in, role switch, or when their cache expires).
   */
  private syncOwnPermissions(): void {
    this.tableAccess.refresh();
  }

  /** Puts the updated role from a permissions response in place (reloads everything when the answer is not a role). */
  private applyRole(roleId: number, response: unknown): void {
    const raw = response && typeof response === 'object' ? (response as Record<string, unknown>) : null;
    const body = raw && raw['id'] === undefined && raw['data'] ? raw['data'] : raw;
    const updated = body && (body as Record<string, unknown>)['id'] !== undefined ? toUserRoleItem(body) : null;
    if (!updated || Number(updated.id) !== roleId) {
      this.loadRoles();
      return;
    }
    this.roles.update(list => list.map(r => (Number(r.id) === roleId ? { ...updated, sNo: r.sNo } : r)));
  }
}
