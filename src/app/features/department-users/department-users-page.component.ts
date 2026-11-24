import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import {
  ActionModalComponent,
  ButtonComponent,
  DropdownComponent,
  IconComponent,
  InputDirective,
  ListPageComponent,
  ModalComponent,
  TableColumn
} from '../../shared';
import type { DropdownItem } from '../../shared/components/dropdown/dropdown.component';
import { AuthService } from '../../core/auth/auth.service';
import { humanizeRoleName } from '../../core/auth/sso-session.util';
import type {
  DesignationMasterItem,
  DistrictBlockMasterItem,
  SchemeMasterItem,
  UserRoleMasterItem
} from '../../core/models/admin-masters.model';
import { PortalUser, formatUserDate } from '../../core/models/portal-user.normalizer';
import { toUserRoleItem } from '../../core/models/role.normalizer';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import { UsersApiService } from '../users/users-api.service';
import { DepartmentUsersApiService } from './department-users-api.service';
import {
  DepartmentUser,
  DepartmentUserForm,
  SSO_ID_PATTERN,
  departmentUserFormError,
  namesOf,
  toDepartmentUserForm,
  toDepartmentUserRequest
} from './department-user.util';

/** Backend table that grants this screen (TableList). */
const TABLE = 'departmentUserManagement';

interface Row extends DepartmentUser {
  sNo: number;
}

type ConfirmAction = { kind: 'deactivate' | 'delete'; user: DepartmentUser };

/** Result of the live SSO ID check. */
interface SsoCheck {
  state: 'idle' | 'invalid' | 'checking' | 'found' | 'missing' | 'error';
  user?: PortalUser;
}

/** Wait this long after the last keystroke before checking the SSO ID. */
const SSO_CHECK_DELAY_MS = 400;

/**
 * Department users (`/api/department-users`): an SSO ID mapped to a role, a designation and the schemes, districts
 * and blocks the officer covers, under an associated portal user.
 * - The SSO ID is checked against the portal's users while it is typed (tick + basic details, or a cross).
 * - Saving a new record calls activate right after the create: it assigns the role when the SSO ID exists as a
 *   portal user. Otherwise the row stays "Not activated" with a "Verify user" button that calls activate again.
 * - Deactivate only marks the record inactive; the role stays with the user (revoke it on User Roles).
 */
@Component({
  selector: 'app-department-users-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ActionModalComponent,
    ButtonComponent,
    DropdownComponent,
    IconComponent,
    InputDirective,
    ListPageComponent,
    ModalComponent
  ],
  template: `
    <app-list-page
      title="Department Users"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Department Users' }]"
      searchPlaceholder="Search SSO ID, role, designation, scheme or district..."
      [(searchQuery)]="searchQuery"
      [columns]="columns"
      [data]="rows()"
      itemUnit="department users"
      [rowClass]="rowClass"
      [emptyMessage]="loading() ? 'Loading department users...' : 'No department users yet.'"
      [customTemplates]="{ user: userTpl, role: roleTpl, coverage: coverageTpl, status: statusTpl, action: actionTpl }"
    >
      <ng-container headerActions>
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
            <option [value]="role.id">{{ roleLabel(role.roleTypeName) }}</option>
          }
        </select>
        <select
          appInput
          size="sm"
          aria-label="Filter by status"
          class="w-auto whitespace-nowrap shrink-0"
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event)"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Not activated</option>
        </select>
        @if (canAdd()) {
          <button appButton size="sm" type="button" class="shrink-0" (click)="openAdd()">
            <app-icon name="plus" size="sm" />
            <span>Add Department User</span>
          </button>
        }
      </ng-container>
    </app-list-page>

    <ng-template #userTpl let-row>
      <div class="min-w-[170px]">
        <p class="m-0 font-semibold text-slate-800 tabular-nums">{{ row.ssoId }}</p>
        <p class="m-0 text-xs text-slate-500">{{ designationOf(row) || 'No designation' }}</p>
      </div>
    </ng-template>

    <ng-template #roleTpl let-row>
      <span class="inline-flex items-center rounded-full border border-[#EADCE2] bg-[#FCF0F2] px-2 py-0.5 text-[11px] font-semibold text-[#7C0E44]">
        {{ roleLabel(roleNameOf(row)) }}
      </span>
    </ng-template>

    <ng-template #coverageTpl let-row>
      <div class="min-w-[220px] space-y-0.5 text-xs text-slate-700">
        <p class="m-0"><span class="text-slate-500">Schemes:</span> {{ summary(schemeNames(row)) }}</p>
        <p class="m-0"><span class="text-slate-500">Districts:</span> {{ summary(districtNames(row)) }}</p>
        <p class="m-0"><span class="text-slate-500">Blocks:</span> {{ summary(blockNames(row)) }}</p>
      </div>
    </ng-template>

    <ng-template #statusTpl let-row>
      @if (row.active) {
        <span class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span>
      } @else {
        <div class="flex flex-col items-center gap-0.5">
          <span class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Not activated</span>
          @if (row.existsInPortal === false) {
            <span class="text-[11px] text-slate-500">Not signed in yet</span>
          } @else if (row.existsInPortal === true) {
            <span class="text-[11px] text-emerald-700">Signed in, ready to verify</span>
          }
        </div>
      }
    </ng-template>

    <ng-template #actionTpl let-row>
      <div class="flex items-center justify-center gap-0.5 whitespace-nowrap">
        <button appButton variant="ghost" size="sm" type="button" (click)="$event.stopPropagation(); openView(row)">
          <app-icon name="eye" size="sm" />
          <span>View</span>
        </button>
        @if (canEdit()) {
          <button appButton variant="ghost" size="sm" type="button" (click)="$event.stopPropagation(); openEdit(row)">
            <app-icon name="edit" size="sm" />
            <span>Edit</span>
          </button>
          @if (row.active) {
            <button appButton variant="ghost" size="sm" type="button" (click)="$event.stopPropagation(); confirm.set({ kind: 'deactivate', user: row })">
              <app-icon name="close" size="sm" />
              <span>Deactivate</span>
            </button>
          } @else {
            <!-- Not activated yet (e.g. the SSO ID had not signed in): try the activation again -->
            <button
              appButton
              variant="secondary"
              size="sm"
              type="button"
              [loading]="verifyingId() === row.id"
              [disabled]="verifyingId() !== null"
              (click)="$event.stopPropagation(); verify(row)"
            >
              @if (verifyingId() !== row.id) {
                <app-icon name="shield-check" size="sm" />
              }
              <span>Verify user</span>
            </button>
          }
        }
        @if (canDelete()) {
          <button appButton variant="ghost" size="sm" type="button" (click)="$event.stopPropagation(); confirm.set({ kind: 'delete', user: row })">
            <app-icon name="trash" size="sm" />
            <span>Delete</span>
          </button>
        }
      </div>
    </ng-template>

    <!-- Add / edit -->
    @if (formOpen()) {
      <app-modal
        [title]="editing() ? 'Edit Department User' : 'Add Department User'"
        subtitle="Map an SSO ID to a role, designation and the schemes, districts and blocks it covers."
        size="lg"
        [closeOnBackdrop]="false"
        (close)="closeForm()"
      >
        <div class="grid gap-4 text-[13px] sm:grid-cols-2">
          <div>
            <label class="block mb-1 font-medium text-slate-700" for="du-sso">SSO ID*</label>
            <!-- Checked as it is typed: does a portal user with this SSO ID exist? -->
            <div class="flex items-center gap-2">
              <input
                appInput
                id="du-sso"
                class="min-w-0 flex-1"
                maxlength="100"
                placeholder="e.g. RJ.OFFICER1"
                autocomplete="off"
                [invalid]="ssoCheck().state === 'invalid'"
                [ngModel]="form.ssoId"
                (ngModelChange)="onSsoInput($event)"
              />
              <span class="flex w-5 shrink-0 items-center justify-center" aria-live="polite">
                @switch (ssoCheck().state) {
                  @case ('checking') {
                    <app-icon name="spinner" size="sm" class="animate-spin text-slate-400" aria-label="Checking SSO ID" />
                  }
                  @case ('found') {
                    <app-icon name="check" size="sm" [stroke]="2.5" class="text-emerald-600" aria-label="User found" />
                  }
                  @case ('missing') {
                    <app-icon name="close" size="sm" [stroke]="2.5" class="text-rose-600" aria-label="User not found" />
                  }
                  @case ('invalid') {
                    <app-icon name="close" size="sm" [stroke]="2.5" class="text-rose-600" aria-label="Invalid SSO ID" />
                  }
                }
              </span>
            </div>
          </div>
          <div>
            <label class="block mb-1 font-medium text-slate-700" for="du-role">Role*</label>
            <select appInput id="du-role" class="w-full" [(ngModel)]="form.roleId">
              <option value="" disabled>Select role</option>
              @for (role of activeRoles(); track role.id) {
                <option [value]="role.id">{{ roleLabel(role.roleTypeName) }}</option>
              }
            </select>
          </div>
          <!-- Result of the SSO ID check -->
          @if (ssoCheck(); as check) {
            @if (check.state === 'found' && check.user) {
              <div class="sm:col-span-2 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5" role="status">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold uppercase text-white" aria-hidden="true">
                  {{ (check.user.name || check.user.ssoId).charAt(0) }}
                </span>
                <div class="min-w-0 text-xs text-slate-700">
                  <p class="m-0 text-[13px] font-semibold text-slate-900">{{ check.user.name || check.user.ssoId }}</p>
                  <p class="m-0">{{ joined(' | ', check.user.email, check.user.mobile) || 'No contact details' }}</p>
                  @if (check.user.designation || check.user.department) {
                    <p class="m-0">{{ joined(', ', check.user.designation, check.user.department) }}</p>
                  }
                  <p class="m-0 mt-0.5">
                    Current roles: {{ check.user.roles.length ? roleList(check.user) : 'none' }}
                  </p>
                </div>
              </div>
            } @else if (check.state === 'missing') {
              <div
                class="sm:col-span-2 -mt-1 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900"
                role="status"
              >
                <app-icon name="info" size="sm" class="mt-0.5 shrink-0 text-amber-600" />
                <p class="m-0">
                  <span class="font-semibold">Note:</span>
                  No portal user has this SSO ID yet. You can still save; verify the user once they have signed in.
                </p>
              </div>
            } @else if (check.state === 'invalid') {
              <p class="sm:col-span-2 m-0 -mt-2 text-xs text-rose-700">Only letters, numbers, dots, underscores and hyphens.</p>
            } @else if (check.state === 'error') {
              <p class="sm:col-span-2 m-0 -mt-2 text-xs text-amber-700">The SSO ID could not be checked right now.</p>
            }
          }
          <div class="sm:col-span-2">
            <label class="block mb-1 font-medium text-slate-700">Associated with*</label>
            <app-dropdown
              [searchable]="true"
              searchPlaceholder="Search name or SSO ID..."
              emptyText="No user matches"
              placeholder="Select user"
              [options]="userOptions()"
              [(value)]="form.associatedUserId"
            />
            <p class="m-0 mt-1 text-xs text-slate-500">The portal user this department user works under.</p>
          </div>
          <div class="sm:col-span-2">
            <label class="block mb-1 font-medium text-slate-700" for="du-designation">Designation</label>
            <select appInput id="du-designation" class="w-full" [(ngModel)]="form.designationId">
              <option value="">No designation</option>
              @for (d of activeDesignations(); track d.id) {
                <option [value]="d.id">{{ d.designationName }}</option>
              }
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="block mb-1 font-medium text-slate-700">Schemes</label>
            <app-dropdown
              multiple
              [searchable]="true"
              placeholder="Select schemes"
              selectAllLabel="All schemes"
              [options]="schemeOptions()"
              [(values)]="form.schemeIds"
            />
          </div>
          <div>
            <label class="block mb-1 font-medium text-slate-700">Districts</label>
            <app-dropdown
              multiple
              [searchable]="true"
              placeholder="Select districts"
              selectAllLabel="All districts"
              [options]="districtOptions()"
              [(values)]="form.districtIds"
            />
          </div>
          <div>
            <label class="block mb-1 font-medium text-slate-700">Blocks</label>
            <app-dropdown
              multiple
              [searchable]="true"
              placeholder="Select blocks"
              selectAllLabel="All blocks"
              emptyText="No blocks in the selected districts"
              [options]="blockOptions()"
              [(values)]="form.blockIds"
            />
            @if (form.districtIds.length > 0) {
              <p class="m-0 mt-1 text-xs text-slate-500">Blocks of the selected districts.</p>
            }
          </div>
          <div class="sm:col-span-2">
            <label class="block mb-1 font-medium text-slate-700" for="du-remarks">Remarks</label>
            <textarea appInput id="du-remarks" class="w-full" rows="2" maxlength="500" [placeholder]="editing() ? 'Reason for the change (kept in the role history)' : 'Optional'" [(ngModel)]="form.remarks"></textarea>
          </div>
        </div>
        @if (formError()) {
          <p class="m-0 mt-3 text-xs font-semibold text-rose-700" role="alert">{{ formError() }}</p>
        }
        <ng-container modalFooter>
          <button appButton variant="outline" type="button" [disabled]="busy()" (click)="closeForm()">Cancel</button>
          <button appButton type="button" [loading]="busy()" (click)="submit()">{{ editing() ? 'Save changes' : 'Create' }}</button>
        </ng-container>
      </app-modal>
    }

    <!-- View -->
    @if (viewing(); as u) {
      <app-modal [title]="u.ssoId" [subtitle]="roleLabel(roleNameOf(u)) + (u.active ? ' - Active' : ' - Not activated')" size="lg" (close)="viewing.set(null)">
        <div class="space-y-5 text-[13px]">
          <dl class="m-0 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            @for (field of viewFields(); track field.label) {
              <div [class]="field.wide ? 'sm:col-span-2' : ''">
                <dt class="text-xs text-slate-500">{{ field.label }}</dt>
                <dd class="m-0 mt-0.5 font-medium text-slate-900 break-words">{{ field.value || '-' }}</dd>
              </div>
            }
          </dl>
          <section>
            <h3 class="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Role history</h3>
            <ol class="m-0 list-none space-y-2 p-0">
              @for (h of u.roleHistory; track $index) {
                <li class="rounded-lg border border-slate-200 px-3 py-2">
                  <p class="m-0 font-semibold text-slate-800">{{ roleLabel(h.roleName || '#' + h.roleId) }}</p>
                  <p class="m-0 text-xs text-slate-500">By {{ h.assignedBySsoId || '#' + h.assignedByUserId }} on {{ date(h.assignedAt) }}</p>
                  @if (h.remarks) {
                    <p class="m-0 mt-1 text-xs text-slate-700">{{ h.remarks }}</p>
                  }
                </li>
              } @empty {
                <li class="text-xs text-slate-500">No role changes recorded.</li>
              }
            </ol>
          </section>
        </div>
        <ng-container modalFooter>
          <button appButton variant="outline" type="button" (click)="viewing.set(null)">Close</button>
        </ng-container>
      </app-modal>
    }

    <!-- Activate / deactivate / delete confirmation -->
    <app-action-modal
      [isOpen]="!!confirm()"
      [title]="confirmTitle()"
      [description]="confirmText()"
      primaryVariant="danger"
      [primaryLabel]="busy() ? 'Please wait...' : confirmLabel()"
      [showPrimaryArrow]="false"
      secondaryLabel="Cancel"
      [reverseButtons]="true"
      [showCloseButton]="true"
      [closeOnBackdrop]="!busy()"
      [disablePrimary]="busy()"
      maxWidthClass="max-w-[460px]"
      (primaryAction)="runConfirm()"
      (secondaryAction)="cancelConfirm()"
      (close)="cancelConfirm()"
    />
  `
})
export class DepartmentUsersPageComponent {
  private readonly api = inject(DepartmentUsersApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly dataEngine = inject(DataEngineService);
  private readonly tableAccess = inject(TableAccessService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<DepartmentUser[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly searchQuery = signal('');
  readonly roleFilter = signal('all');
  readonly statusFilter = signal<'all' | 'active' | 'pending'>('all');

  // Lookups from the masters.
  readonly roles = signal<UserRoleMasterItem[]>([]);
  readonly designations = signal<DesignationMasterItem[]>([]);
  readonly schemes = signal<SchemeMasterItem[]>([]);
  readonly districts = signal<{ id: number; name: string; active: boolean }[]>([]);
  readonly blocks = signal<(DistrictBlockMasterItem & { districtId?: number })[]>([]);
  readonly users = signal<PortalUser[]>([]);

  readonly formOpen = signal(false);
  readonly editing = signal<DepartmentUser | null>(null);
  readonly formError = signal<string | null>(null);
  form: DepartmentUserForm = toDepartmentUserForm(null);

  /** Live check of the typed SSO ID against the portal's users. */
  readonly ssoCheck = signal<SsoCheck>({ state: 'idle' });
  private readonly ssoInput$ = new Subject<string>();
  /** Row whose "Verify user" call is running. */
  readonly verifyingId = signal<number | null>(null);

  readonly viewing = signal<DepartmentUser | null>(null);
  readonly confirm = signal<ConfirmAction | null>(null);

  readonly canAdd = computed(() => this.tableAccess.can(TABLE, 'POST'));
  readonly canEdit = computed(() => this.tableAccess.can(TABLE, 'PUT') || this.tableAccess.can(TABLE, 'POST'));
  readonly canDelete = computed(() => this.tableAccess.can(TABLE, 'DELETE'));

  private readonly roleNames = computed(() => new Map(this.roles().map(r => [Number(r.id), r.roleTypeName])));
  private readonly designationNames = computed(() => new Map(this.designations().map(d => [Number(d.id), d.designationName])));
  private readonly schemeNameMap = computed(() => new Map(this.schemes().map(s => [Number(s.id), s.schemeName])));
  private readonly districtNameMap = computed(() => new Map(this.districts().map(d => [d.id, d.name])));
  private readonly blockNameMap = computed(() => new Map(this.blocks().map(b => [Number(b.id), b.blockName])));

  readonly activeRoles = computed(() => this.roles().filter(r => r.status !== 'Inactive'));
  readonly activeDesignations = computed(() => this.designations().filter(d => d.status !== 'Inactive'));

  readonly userOptions = computed<DropdownItem[]>(() =>
    [...this.users()]
      .sort((a, b) => (a.name || a.ssoId).localeCompare(b.name || b.ssoId))
      .map(u => ({ value: String(u.id), label: `${u.name || u.ssoId} (${u.ssoId})` }))
  );
  readonly schemeOptions = computed<DropdownItem[]>(() =>
    this.schemes().filter(s => s.status !== 'Inactive').map(s => ({ value: String(s.id), label: s.schemeName }))
  );
  readonly districtOptions = computed<DropdownItem[]>(() =>
    this.districts().filter(d => d.active).map(d => ({ value: String(d.id), label: d.name }))
  );
  /** Blocks of the selected districts (all blocks while no district is selected). */
  blockOptions(): DropdownItem[] {
    const chosen = new Set(this.form.districtIds.map(Number));
    return this.blocks()
      .filter(b => b.status !== 'Inactive' && (chosen.size === 0 || (b.districtId !== undefined && chosen.has(b.districtId))))
      .map(b => {
        const district = b.districtId !== undefined ? this.districtNameMap().get(b.districtId) : '';
        return { value: String(b.id), label: district && chosen.size !== 1 ? `${b.blockName} (${district})` : b.blockName };
      });
  }

  readonly rows = computed<Row[]>(() => {
    const role = this.roleFilter();
    const status = this.statusFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.items()
      .filter(u => role === 'all' || String(u.roleId) === role)
      .filter(u => status === 'all' || (status === 'active' ? u.active : !u.active))
      .filter(u => {
        if (!q) return true;
        const haystack = [
          u.ssoId,
          this.roleNameOf(u),
          this.designationOf(u),
          u.associatedUserName,
          u.associatedUserSsoId,
          ...this.schemeNames(u),
          ...this.districtNames(u),
          ...this.blockNames(u)
        ];
        return haystack.some(v => v.toLowerCase().includes(q));
      })
      .map((u, i) => ({ ...u, sNo: i + 1 }));
  });

  readonly columns: TableColumn<Row>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'user', label: 'SSO ID / Designation', type: 'custom' },
    { key: 'role', label: 'Role', type: 'custom' },
    { key: 'coverage', label: 'Schemes / Districts / Blocks', type: 'custom' },
    {
      key: 'associatedUserName',
      label: 'Associated With',
      cellClass: 'whitespace-nowrap text-slate-700',
      format: (_v, row) => row.associatedUserName || row.associatedUserSsoId || `#${row.associatedUserId}`
    },
    { key: 'status', label: 'Status', type: 'custom', align: 'center' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'min-w-[320px]' }
  ];

  protected readonly rowClass = (row: Row): string => (row.active ? 'bg-white' : 'bg-amber-50/30');

  readonly viewFields = computed<{ label: string; value: string; wide?: boolean }[]>(() => {
    const u = this.viewing();
    if (!u) return [];
    return [
      { label: 'SSO ID', value: u.ssoId },
      { label: 'Role', value: humanizeRoleName(this.roleNameOf(u)) },
      { label: 'Designation', value: this.designationOf(u) },
      { label: 'Associated with', value: [u.associatedUserName, u.associatedUserSsoId && `(${u.associatedUserSsoId})`].filter(Boolean).join(' ') },
      { label: 'Schemes', value: this.schemeNames(u).join(', '), wide: true },
      { label: 'Districts', value: this.districtNames(u).join(', ') },
      { label: 'Blocks', value: this.blockNames(u).join(', ') },
      { label: 'Created by', value: [u.createdByName, u.createdBySsoId && `(${u.createdBySsoId})`].filter(Boolean).join(' ') },
      { label: 'Created', value: formatUserDate(u.createdAt) },
      { label: 'Last updated', value: formatUserDate(u.updatedAt) }
    ];
  });

  constructor() {
    this.load();
    this.loadLookups();

    // Check the SSO ID shortly after typing stops; a newer value cancels the pending check.
    this.ssoInput$
      .pipe(
        map(value => value.trim()),
        distinctUntilChanged(),
        tap(value => this.ssoCheck.set(!value ? { state: 'idle' } : !SSO_ID_PATTERN.test(value) ? { state: 'invalid' } : { state: 'checking' })),
        debounceTime(SSO_CHECK_DELAY_MS),
        switchMap(value => {
          if (!value || !SSO_ID_PATTERN.test(value)) return of(null);
          return this.usersApi.findBySsoId(value).pipe(
            map((user): SsoCheck => (user ? { state: 'found', user } : { state: 'missing' })),
            catchError(() => of<SsoCheck>({ state: 'error' }))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        if (result) this.ssoCheck.set(result);
      });
  }

  onSsoInput(value: string): void {
    this.form.ssoId = value;
    this.ssoInput$.next(value);
  }

  protected joined(separator: string, ...parts: (string | null | undefined)[]): string {
    return parts.filter(p => !!p && p.trim() !== '').join(separator);
  }

  protected roleList(user: PortalUser): string {
    return user.roles.map(r => humanizeRoleName(r.name)).join(', ');
  }

  // ---- display helpers ----

  protected roleLabel(name: string): string {
    return humanizeRoleName(name);
  }

  protected date(value: string | null): string {
    return formatUserDate(value);
  }

  protected roleNameOf(u: DepartmentUser): string {
    return u.roleName || this.roleNames().get(u.roleId) || `#${u.roleId}`;
  }

  protected designationOf(u: DepartmentUser): string {
    return (u.designationId ? this.designationNames().get(u.designationId) : '') || u.designationName;
  }

  protected schemeNames(u: DepartmentUser): string[] {
    const lookup = new Map(this.schemeNameMap());
    if (u.schemeIds[0] && u.primarySchemeName) lookup.set(u.schemeIds[0], u.primarySchemeName);
    return namesOf(u.schemeIds, lookup);
  }

  protected districtNames(u: DepartmentUser): string[] {
    const lookup = new Map(this.districtNameMap());
    if (u.districtIds[0] && u.primaryDistrictName) lookup.set(u.districtIds[0], u.primaryDistrictName);
    return namesOf(u.districtIds, lookup);
  }

  protected blockNames(u: DepartmentUser): string[] {
    const lookup = new Map(this.blockNameMap());
    if (u.blockIds[0] && u.primaryBlockName) lookup.set(u.blockIds[0], u.primaryBlockName);
    return namesOf(u.blockIds, lookup);
  }

  /** "All" style summary for a table cell: up to two names, then "+N more". */
  protected summary(names: string[]): string {
    if (names.length === 0) return '-';
    return names.length <= 2 ? names.join(', ') : `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  }

  // ---- add / edit ----

  openAdd(): void {
    const me = this.auth.userDetails()?.id;
    this.form = toDepartmentUserForm(null, me ? String(me) : '');
    this.editing.set(null);
    this.formError.set(null);
    this.resetSsoCheck('');
    this.formOpen.set(true);
  }

  openEdit(user: DepartmentUser): void {
    this.form = toDepartmentUserForm(user);
    this.editing.set(user);
    this.formError.set(null);
    this.resetSsoCheck(user.ssoId);
    this.formOpen.set(true);
  }

  /** Starts the check for a new dialog (the same SSO ID as last time must be checked again). */
  private resetSsoCheck(ssoId: string): void {
    this.ssoInput$.next('');
    this.ssoCheck.set({ state: 'idle' });
    if (ssoId) this.ssoInput$.next(ssoId);
  }

  openView(user: DepartmentUser): void {
    this.viewing.set(user);
    this.api.get(user.id).subscribe({
      next: full => {
        if (this.viewing()?.id === user.id) this.viewing.set(full);
      },
      error: () => {}
    });
  }

  closeForm(): void {
    if (!this.busy()) this.formOpen.set(false);
  }

  submit(): void {
    const error = departmentUserFormError(this.form);
    this.formError.set(error);
    if (error || this.busy()) return;

    const editing = this.editing();
    // Choosing "No designation" on edit clears the stored designation name too.
    const body = toDepartmentUserRequest(this.form, editing ? '' : undefined);
    this.busy.set(true);

    // A new department user is activated at once (the role is assigned to the portal user). When that fails, e.g.
    // the SSO ID has not signed in yet, the record is kept as "Not activated" and can be verified later.
    const save$: Observable<DepartmentUser> = editing
      ? this.api.update(editing.id, body)
      : this.api.create(body).pipe(
          // The backend already activates on create when the SSO ID exists; call activate only when it did not.
          switchMap(created =>
            created.active ? of(created) : this.api.activate(created.id, true).pipe(catchError(() => of(created)))
          )
        );

    save$.subscribe({
      next: saved => {
        this.busy.set(false);
        this.formOpen.set(false);
        this.upsert(saved);
        if (editing) {
          this.notifications.success('Department user updated.');
        } else if (saved.active) {
          this.notifications.success(`${saved.ssoId} created and activated.`);
        } else {
          this.notifications.warning(
            `${saved.ssoId} was created but could not be activated yet, usually because this SSO ID has not signed in to the portal. Use "Verify user" once it has.`,
            'Not activated'
          );
        }
      },
      // The HTTP layer shows the backend's reason (duplicate SSO ID, inactive role, unknown ids...).
      error: () => this.busy.set(false)
    });
  }

  // ---- verify / deactivate / delete ----

  /** "Verify user": calls activate again; the row turns Active once the SSO ID exists as a portal user. */
  verify(row: DepartmentUser): void {
    if (this.verifyingId() !== null) return;
    this.verifyingId.set(row.id);
    this.api.activate(row.id, true).subscribe({
      next: saved => {
        this.verifyingId.set(null);
        this.upsert(saved);
        if (saved.active) {
          this.notifications.success(`${saved.ssoId} verified and activated.`);
        } else {
          this.notifications.warning(`${saved.ssoId} is still not activated.`, 'Not activated');
        }
      },
      error: err => {
        this.verifyingId.set(null);
        this.notifications.warning(
          err?.message || `${row.ssoId} could not be verified. The SSO ID has probably not signed in to the portal yet.`,
          'Not activated'
        );
      }
    });
  }

  protected confirmTitle(): string {
    const c = this.confirm();
    if (!c) return '';
    return c.kind === 'deactivate' ? 'Deactivate department user?' : 'Delete department user?';
  }

  protected confirmLabel(): string {
    return this.confirm()?.kind === 'deactivate' ? 'Deactivate' : 'Delete';
  }

  protected confirmText(): string {
    const c = this.confirm();
    if (!c) return '';
    const role = humanizeRoleName(this.roleNameOf(c.user));
    if (c.kind === 'deactivate') {
      return `The record of ${c.user.ssoId} will be marked inactive. The ${role} role stays assigned to the user; revoke it on User Roles to remove access.`;
    }
    return `The department user record of ${c.user.ssoId} will be deleted. A role already assigned to the user is not removed.`;
  }

  cancelConfirm(): void {
    if (!this.busy()) this.confirm.set(null);
  }

  runConfirm(): void {
    const c = this.confirm();
    if (!c || this.busy()) return;
    this.busy.set(true);
    const done = () => {
      this.busy.set(false);
      this.confirm.set(null);
    };
    if (c.kind === 'delete') {
      this.api.delete(c.user.id).subscribe({
        next: () => {
          done();
          this.items.update(list => list.filter(u => u.id !== c.user.id));
          this.notifications.success('Department user deleted.');
        },
        error: () => this.busy.set(false)
      });
      return;
    }
    this.api.deactivate(c.user.id).subscribe({
      next: saved => {
        done();
        this.upsert(saved);
        this.notifications.success(`${saved.ssoId} deactivated.`);
      },
      error: () => this.busy.set(false)
    });
  }

  // ---- data ----

  private load(): void {
    this.loading.set(true);
    this.api
      .loadAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: list => {
          this.items.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  /** Masters for the dropdowns and the names in the table; a failing one only leaves its names as ids. */
  private loadLookups(): void {
    const quietly = <T>(source: Observable<T[]>, set: (value: T[]) => void) =>
      source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: set, error: () => {} });

    quietly(this.dataEngine.for<UserRoleMasterItem>('USER_ROLES', { normalizer: item => toUserRoleItem(item) }).getAll(), v => this.roles.set(v));
    quietly(this.dataEngine.for<DesignationMasterItem>('DESIGNATIONS').getAll(), v => this.designations.set(v));
    quietly(this.dataEngine.for<SchemeMasterItem>('SCHEME_MASTERS').getAll(), v => this.schemes.set(v));
    quietly(this.dataEngine.for<DistrictBlockMasterItem & { districtId?: number }>('DISTRICTS').getAll(), v => this.blocks.set(v));
    quietly(this.dataEngine.for<Record<string, unknown>>('DISTRICT_MASTERS').getAll(), v =>
      this.districts.set(
        v
          .map(d => ({ id: Number(d['id']), name: String(d['name'] ?? d['districtName'] ?? ''), active: d['isActive'] !== false }))
          .filter(d => Number.isFinite(d.id) && d.name)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
    );
    quietly(this.usersApi.loadAll(), v => this.users.set(v));
  }

  private upsert(saved: DepartmentUser): void {
    this.items.update(list => (list.some(u => u.id === saved.id) ? list.map(u => (u.id === saved.id ? saved : u)) : [saved, ...list]));
  }
}
