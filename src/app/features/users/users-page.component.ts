import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  IconComponent,
  InputDirective,
  ListPageComponent,
  ModalComponent,
  TableColumn
} from '../../shared';
import { humanizeRoleName } from '../../core/auth/sso-session.util';
import { PortalUser, formatUserDate, userMatches } from '../../core/models/portal-user.normalizer';
import { UsersApiService } from './users-api.service';

interface UserRow extends PortalUser {
  sNo: number;
}

interface DetailField {
  label: string;
  value: string;
}

/** Filter value for users who have no role yet. */
const NO_ROLE = '__none__';

/**
 * Users (backend `/api/users`): every user with their SSO profile details and roles, read-only.
 * Roles are given and taken away on the User Roles screen.
 */
@Component({
  selector: 'app-users-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, ListPageComponent, ModalComponent],
  template: `
    <app-list-page
      title="Users"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Users' }]"
      searchPlaceholder="Search name, SSO ID, email, mobile or role..."
      [(searchQuery)]="searchQuery"
      [columns]="columns"
      [data]="rows()"
      itemUnit="users"
      [emptyMessage]="loading() ? 'Loading users...' : 'No users found.'"
      [customTemplates]="{ name: nameTpl, roles: rolesTpl, action: actionTpl }"
    >
      <select
        headerActions
        appInput
        size="sm"
        aria-label="Filter by role"
        class="w-auto whitespace-nowrap shrink-0"
        [ngModel]="roleFilter()"
        (ngModelChange)="roleFilter.set($event)"
      >
        <option value="all">All roles</option>
        @for (role of roleNames(); track role) {
          <option [value]="role">{{ roleLabel(role) }}</option>
        }
        <option [value]="noRole">No role</option>
      </select>
    </app-list-page>

    <ng-template #nameTpl let-row>
      <div class="min-w-[180px]">
        <p class="m-0 font-semibold text-slate-800">{{ row.name || '-' }}</p>
        <p class="m-0 text-xs text-slate-500 tabular-nums">{{ row.ssoId }}</p>
      </div>
    </ng-template>

    <ng-template #rolesTpl let-row>
      <div class="flex flex-wrap gap-1">
        @for (role of row.roles; track role.name) {
          <span class="inline-flex items-center rounded-full border border-[#EADCE2] bg-[#FCF0F2] px-2 py-0.5 text-[11px] font-semibold text-[#7C0E44]">
            {{ roleLabel(role.name) }}
          </span>
        } @empty {
          <span class="text-xs text-slate-400">No role</span>
        }
      </div>
    </ng-template>

    <ng-template #actionTpl let-row>
      <button appButton variant="ghost" size="sm" type="button" (click)="$event.stopPropagation(); open(row)">
        <app-icon name="eye" size="sm" />
        <span>View</span>
      </button>
    </ng-template>

    @if (selected(); as user) {
      <app-modal [title]="user.name || user.ssoId" [subtitle]="user.ssoId" size="lg" [showClose]="false" (close)="selected.set(null)">
        <div class="space-y-5 text-[13px]">
          <div class="flex flex-wrap gap-1.5">
            @for (role of user.roles; track role.name) {
              <span class="inline-flex items-center rounded-full border border-[#EADCE2] bg-[#FCF0F2] px-2.5 py-0.5 text-xs font-semibold text-[#7C0E44]">
                {{ roleLabel(role.name) }}
              </span>
            } @empty {
              <span class="text-xs text-slate-500">This user has no role yet.</span>
            }
          </div>
          @for (section of detailSections(); track section.title) {
            <section>
              <h3 class="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{{ section.title }}</h3>
              <dl class="m-0 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                @for (field of section.fields; track field.label) {
                  <div>
                    <dt class="text-xs text-slate-500">{{ field.label }}</dt>
                    <dd class="m-0 mt-0.5 font-medium text-slate-900 break-words">{{ field.value || '-' }}</dd>
                  </div>
                }
              </dl>
            </section>
          }
        </div>
        <ng-container modalFooter>
          <button appButton variant="outline" type="button" (click)="selected.set(null)">Close</button>
        </ng-container>
      </app-modal>
    }
  `
})
export class UsersPageComponent {
  private readonly api = inject(UsersApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly noRole = NO_ROLE;
  readonly users = signal<PortalUser[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly roleFilter = signal('all');
  readonly selected = signal<PortalUser | null>(null);

  readonly roleNames = computed(() => [...new Set(this.users().flatMap(u => u.roles.map(r => r.name)))].sort());

  readonly rows = computed<UserRow[]>(() => {
    const filter = this.roleFilter();
    return this.users()
      .filter(u => (filter === 'all' ? true : filter === NO_ROLE ? u.roles.length === 0 : u.roles.some(r => r.name === filter)))
      .filter(u => userMatches(u, this.searchQuery()))
      .map((u, i) => ({ ...u, sNo: i + 1 }));
  });

  readonly columns: TableColumn<UserRow>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: 'name', label: 'Name / SSO ID', type: 'custom' },
    { key: 'email', label: 'Email', cellClass: 'whitespace-nowrap text-slate-700' },
    { key: 'mobile', label: 'Mobile', cellClass: 'whitespace-nowrap tabular-nums text-slate-700', format: v => (v as string) || '-' },
    { key: 'designation', label: 'Designation', cellClass: 'text-slate-700', format: (_v, row) => [row.designation, row.department].filter(Boolean).join(', ') || '-' },
    { key: 'roles', label: 'Roles', type: 'custom', cellClass: 'min-w-[140px]' },
    { key: 'lastLogin', label: 'Last Login', cellClass: 'whitespace-nowrap text-slate-600', format: v => formatUserDate(v as string | null) },
    { key: 'action', label: 'Action', type: 'custom', align: 'center' }
  ];

  readonly detailSections = computed<{ title: string; fields: DetailField[] }[]>(() => {
    const u = this.selected();
    if (!u) return [];
    return [
      {
        title: 'Account',
        fields: [
          { label: 'User ID', value: String(u.id || '') },
          { label: 'SSO ID', value: u.ssoId },
          { label: 'User type', value: u.userType },
          { label: 'Created', value: formatUserDate(u.createdAt) },
          { label: 'Last login', value: formatUserDate(u.lastLogin) },
          { label: 'Last updated', value: formatUserDate(u.updatedAt) }
        ]
      },
      {
        title: 'Contact',
        fields: [
          { label: 'Login email', value: u.email },
          { label: 'Mobile', value: u.mobile },
          { label: 'Official email', value: u.mailOfficial },
          { label: 'Personal email', value: u.mailPersonal }
        ]
      },
      {
        title: 'Work',
        fields: [
          { label: 'Designation', value: u.designation },
          { label: 'Department', value: u.department },
          { label: 'Employee number', value: u.employeeNumber }
        ]
      },
      {
        title: 'Personal and address',
        fields: [
          { label: 'Gender', value: u.gender },
          { label: 'Date of birth', value: u.dateOfBirth },
          { label: 'Address', value: u.postalAddress },
          { label: 'City', value: u.city },
          { label: 'State', value: u.state },
          { label: 'PIN code', value: u.postalCode }
        ]
      }
    ];
  });

  constructor() {
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

  protected roleLabel(name: string): string {
    return humanizeRoleName(name);
  }

  /** Shows the row at once, then the full record from GET /api/users/{id}. */
  open(user: PortalUser): void {
    this.selected.set(user);
    if (!user.id) return;
    this.api.get(user.id).subscribe({
      next: full => {
        if (this.selected()?.id === user.id) this.selected.set(full);
      },
      error: () => {}
    });
  }
}
