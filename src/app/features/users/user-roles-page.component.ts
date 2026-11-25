import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
import { humanizeRoleName } from '../../core/auth/sso-session.util';
import type { UserRoleMasterItem } from '../../core/models/admin-masters.model';
import { PortalUser, UserRoleRow, toUserRoleRows, userMatches } from '../../core/models/portal-user.normalizer';
import { toUserRoleItem } from '../../core/models/role.normalizer';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';
import { UsersApiService } from './users-api.service';

const NO_ROLE = '__none__';

/**
 * User Roles (backend UserRoles): which user holds which role.
 * - rows: every user × role, from GET /api/users (each user lists their roles); users without a role show once;
 * - assign: POST /api/roles/{roleId}/users `{ email }`; revoke: DELETE /api/roles/{roleId}/users/{email}.
 * The backend refuses inactive roles and taking a system role from its last user, and says why.
 */
@Component({
  selector: 'app-user-roles-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent, FormsModule, ButtonComponent, DropdownComponent, IconComponent, InputDirective, ListPageComponent, ModalComponent],
  template: `
    <app-list-page
      title="User Roles"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'User Roles' }]"
      searchPlaceholder="Search user, SSO ID, email or role..."
      [(searchQuery)]="searchQuery"
      [columns]="columns"
      [data]="rows()"
      itemUnit="users"
      [emptyMessage]="loading() ? 'Loading...' : 'No users found.'"
      [customTemplates]="{ user: userTpl, role: roleTpl, action: actionTpl }"
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
            <option [value]="role.roleTypeName">{{ roleLabel(role.roleTypeName) }}</option>
          }
          <option [value]="noRole">No role</option>
        </select>
        @if (canAssign()) {
          <button appButton size="sm" type="button" class="shrink-0" (click)="openAssign()">
            <app-icon name="plus" size="sm" />
            <span>Assign Role</span>
          </button>
        }
      </ng-container>
    </app-list-page>

    <ng-template #userTpl let-row>
      <div class="min-w-[180px]">
        <p class="m-0 font-semibold text-slate-800">{{ row.user.name || '-' }}</p>
        <p class="m-0 text-xs text-slate-500 tabular-nums">{{ row.user.ssoId }}</p>
      </div>
    </ng-template>

    <!-- All roles of the user in one cell; each chip has its own revoke (x) -->
    <ng-template #roleTpl let-row>
      <div class="flex min-w-[200px] flex-wrap items-center gap-1.5 py-0.5">
        @for (role of row.roles; track role.name) {
          <span
            class="inline-flex items-center gap-0.5 rounded-full border border-[#EADCE2] bg-[#FCF0F2] py-0.5 pl-2.5 text-[11px] font-semibold text-[#7C0E44]"
            [class.pr-2.5]="!canRevoke()"
            [class.pr-0.5]="canRevoke()"
          >
            {{ roleLabel(role.name) }}
            @if (canRevoke()) {
              <button
                appButton
                variant="ghost"
                size="xs"
                iconOnly
                type="button"
                [disabled]="busy()"
                [attr.aria-label]="'Revoke ' + roleLabel(role.name) + ' from ' + (row.user.name || row.user.ssoId)"
                [title]="'Revoke ' + roleLabel(role.name)"
                (click)="$event.stopPropagation(); revoke(row.user, role)"
              >
                <app-icon name="close" size="xs" />
              </button>
            }
          </span>
        } @empty {
          <span class="text-xs text-slate-400">No role</span>
        }
      </div>
    </ng-template>

    <ng-template #actionTpl let-row>
      <div class="flex items-center justify-center whitespace-nowrap">
        @if (canAssign()) {
          <button appButton variant="ghost" size="sm" type="button" (click)="$event.stopPropagation(); openAssign(row.user)">
            <app-icon name="plus" size="sm" />
            <span>Add role</span>
          </button>
        }
      </div>
    </ng-template>

    <!-- Revoke confirmation -->
    <app-action-modal
      [isOpen]="!!pendingRevoke()"
      [title]="'Revoke ' + roleLabel(pendingRevoke()?.role?.name ?? '') + ' role?'"
      [description]="revokeDescription()"
      primaryVariant="danger"
      [primaryLabel]="busy() ? 'Revoking...' : 'Revoke role'"
      [showPrimaryArrow]="false"
      secondaryLabel="Cancel"
      [reverseButtons]="true"
      [showCloseButton]="true"
      [closeOnBackdrop]="!busy()"
      [disablePrimary]="busy()"
      accentBarClass="bg-rose-600"
      maxWidthClass="max-w-[440px]"
      (primaryAction)="confirmRevoke()"
      (secondaryAction)="cancelRevoke()"
      (close)="cancelRevoke()"
    />

    @if (assignOpen()) {
      <app-modal title="Assign Role" subtitle="Give a user one more role. Their current roles are kept." size="md" (close)="closeAssign()">
        <div class="space-y-4 text-[13px]">
          <div>
            <label class="block mb-1 font-medium text-slate-700">User*</label>
            <app-dropdown
              [searchable]="true"
              searchPlaceholder="Search name, SSO ID or email..."
              emptyText="No user matches"
              placeholder="Select user"
              [options]="userOptions()"
              [(value)]="assignUserId"
              [invalid]="assignSubmitted() && !assignUserId"
            />
            @if (assignSubmitted() && !assignUserId) {
              <p class="m-0 mt-1 text-xs font-medium text-rose-700">Select a user.</p>
            } @else if (assignUser(); as user) {
              <p class="m-0 mt-1 text-xs text-slate-500">
                Current roles: {{ user.roles.length ? roleList(user) : 'none' }}
              </p>
            }
          </div>
          <div>
            <label class="block mb-1 font-medium text-slate-700" for="assign-role">Role*</label>
            <select
              appInput
              id="assign-role"
              class="w-full"
              [invalid]="assignSubmitted() && !assignRoleId"
              [(ngModel)]="assignRoleId"
            >
              <option value="" disabled>Select role</option>
              @for (role of assignableRoles(); track role.id) {
                <option [value]="role.id">{{ roleLabel(role.roleTypeName) }}</option>
              }
            </select>
            @if (assignSubmitted() && !assignRoleId) {
              <p class="m-0 mt-1 text-xs font-medium text-rose-700">Select a role.</p>
            } @else if (assignUser() && assignableRoles().length === 0) {
              <p class="m-0 mt-1 text-xs text-slate-500">This user already has every active role.</p>
            }
          </div>
        </div>
        <ng-container modalFooter>
          <button appButton variant="outline" type="button" [disabled]="busy()" (click)="closeAssign()">Cancel</button>
          <button appButton type="button" [loading]="busy()" (click)="submitAssign()">Assign</button>
        </ng-container>
      </app-modal>
    }
  `
})
export class UserRolesPageComponent {
  private readonly api = inject(UsersApiService);
  private readonly dataEngine = inject(DataEngineService);
  private readonly tableAccess = inject(TableAccessService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly roleRepo = this.dataEngine.for<UserRoleMasterItem>('USER_ROLES', { normalizer: item => toUserRoleItem(item) });

  protected readonly noRole = NO_ROLE;
  readonly users = signal<PortalUser[]>([]);
  readonly roles = signal<UserRoleMasterItem[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly searchQuery = signal('');
  readonly roleFilter = signal('all');

  readonly assignOpen = signal(false);
  readonly assignSubmitted = signal(false);
  assignUserId = '';
  assignRoleId = '';

  // Buttons follow the signed-in user's rights on the UserRoles table.
  readonly canAssign = computed(() => this.tableAccess.can('UserRoles', 'POST'));
  readonly canRevoke = computed(() => this.tableAccess.can('UserRoles', 'DELETE'));

  readonly rows = computed<UserRoleRow[]>(() => {
    const filter = this.roleFilter();
    const q = this.searchQuery();
    return toUserRoleRows(this.users())
      .filter(r => (filter === 'all' ? true : filter === NO_ROLE ? r.roles.length === 0 : r.roles.some(x => x.name === filter)))
      .filter(r => userMatches(r.user, q))
      .map((r, i) => ({ ...r, sNo: i + 1 }));
  });

  readonly userOptions = computed<DropdownItem[]>(() =>
    [...this.users()]
      .sort((a, b) => (a.name || a.ssoId).localeCompare(b.name || b.ssoId))
      .map(u => ({ value: String(u.id), label: `${u.name || u.ssoId} (${u.ssoId}${u.email ? ', ' + u.email : ''})`, disabled: !u.email }))
  );

  readonly columns: TableColumn<UserRoleRow>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'user', label: 'User / SSO ID', type: 'custom' },
    { key: 'email', label: 'Email', cellClass: 'whitespace-nowrap text-slate-700', format: (_v, row) => row.user.email || '-' },
    { key: 'role', label: 'Roles', type: 'custom' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'min-w-[120px]' }
  ];

  constructor() {
    this.loadUsers();
    this.roleRepo
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: roles => this.roles.set(roles), error: () => {} });
  }

  protected roleLabel(name: string): string {
    return humanizeRoleName(name);
  }

  protected roleList(user: PortalUser): string {
    return user.roles.map(r => humanizeRoleName(r.name)).join(', ');
  }

  protected assignUser(): PortalUser | null {
    return this.users().find(u => String(u.id) === this.assignUserId) ?? null;
  }

  /** Active roles the chosen user does not have yet. */
  protected assignableRoles(): UserRoleMasterItem[] {
    const held = new Set((this.assignUser()?.roles ?? []).map(r => r.id));
    return this.roles().filter(r => r.status !== 'Inactive' && !held.has(Number(r.id)));
  }

  openAssign(user?: PortalUser): void {
    this.assignUserId = user ? String(user.id) : '';
    this.assignRoleId = '';
    this.assignSubmitted.set(false);
    this.assignOpen.set(true);
  }

  closeAssign(): void {
    if (this.busy()) return;
    this.assignOpen.set(false);
  }

  submitAssign(): void {
    this.assignSubmitted.set(true);
    const user = this.assignUser();
    const roleId = Number(this.assignRoleId);
    if (!user || !roleId) return;
    if (!user.email) {
      this.notifications.error('This user has no email address, so a role cannot be assigned.');
      return;
    }
    const role = this.roles().find(r => Number(r.id) === roleId);
    this.busy.set(true);
    this.api.assignRole(roleId, user.email).subscribe({
      next: () => {
        this.busy.set(false);
        this.assignOpen.set(false);
        this.setUserRoles(user.id, [...user.roles, { id: roleId, name: role?.roleTypeName ?? '' }]);
        this.notifications.success(`${humanizeRoleName(role?.roleTypeName ?? 'Role')} assigned to ${user.name || user.ssoId}.`);
      },
      error: () => this.busy.set(false)
    });
  }

  /** The role waiting for the user to confirm its revoke (the confirmation dialog is open while set). */
  readonly pendingRevoke = signal<{ user: PortalUser; role: PortalUser['roles'][number] } | null>(null);

  /** Asks for confirmation in a dialog before revoking. */
  revoke(user: PortalUser, role: PortalUser['roles'][number]): void {
    if (!user.email) {
      this.notifications.error('This user has no email address, so the role cannot be revoked here.');
      return;
    }
    this.pendingRevoke.set({ user, role });
  }

  cancelRevoke(): void {
    if (!this.busy()) this.pendingRevoke.set(null);
  }

  confirmRevoke(): void {
    const pending = this.pendingRevoke();
    if (!pending || this.busy()) return;
    const { user, role } = pending;
    const name = humanizeRoleName(role.name);
    const who = user.name || user.ssoId;
    const roleId = role.id || Number(this.roles().find(r => r.roleTypeName === role.name)?.id);
    if (!roleId) {
      this.pendingRevoke.set(null);
      return;
    }
    this.busy.set(true);
    this.api.revokeRole(roleId, user.email).subscribe({
      next: () => {
        this.busy.set(false);
        this.pendingRevoke.set(null);
        this.setUserRoles(user.id, user.roles.filter(r => r.name !== role.name));
        this.notifications.success(`${name} revoked from ${who}.`);
      },
      // The HTTP layer shows the reason (e.g. the last superAdmin); the dialog stays open to retry or cancel.
      error: () => this.busy.set(false)
    });
  }

  protected revokeDescription(): string {
    const pending = this.pendingRevoke();
    if (!pending) return '';
    const who = pending.user.name || pending.user.ssoId;
    const others = pending.user.roles.filter(r => r.name !== pending.role.name).map(r => humanizeRoleName(r.name));
    const remaining = others.length ? `They will keep: ${others.join(', ')}.` : 'They will have no role left.';
    return `${who} (${pending.user.ssoId}) will lose access given by the ${humanizeRoleName(pending.role.name)} role. ${remaining}`;
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.api
      .loadAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: users => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  private setUserRoles(userId: number, roles: PortalUser['roles']): void {
    this.users.update(list => list.map(u => (u.id === userId ? { ...u, roles } : u)));
  }
}
