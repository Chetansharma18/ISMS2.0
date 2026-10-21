import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ActionModalComponent,
  ButtonComponent,
  FilterTabsComponent,
  IconComponent,
  ListPageComponent,
  TableColumn
} from '../../../shared';
import type { SsoProfile } from '../../../core/mock/data/sso-users.mock';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { SsoDirectoryService } from '../services/sso-directory.service';
import { TpUserRole, TpUserRow, buildTpUsers, filterTpUsers } from '../utils/tp-users.util';
import { CenterHeadAssignModalComponent } from './center-head-assign-modal.component';
import { TpFacultyEditModalComponent } from './tp-faculty-edit-modal.component';
import { TpUserViewModalComponent } from './tp-user-view-modal.component';

/**
 * User Management of the training partner: the users the partner has created. These are the Center Head of each SDC,
 * the Attender User of each batch and the faculty added to batches, with their details and what they are assigned to.
 * Each user can be viewed, edited (a Center Head or Attender User is changed to another person, a faculty member's
 * trainer details are changed) and unmapped.
 */
@Component({
  selector: 'app-tp-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActionModalComponent,
    ButtonComponent,
    CenterHeadAssignModalComponent,
    FilterTabsComponent,
    IconComponent,
    ListPageComponent,
    TpFacultyEditModalComponent,
    TpUserViewModalComponent
  ],
  template: `
    <app-list-page
      title="User Management"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'User Management' }]"
      [searchable]="true"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search name, SSO ID, role, mobile, e-mail, assignment..."
      [columns]="columns"
      [data]="filteredUsers()"
      [pagination]="true"
      [pageSize]="pageSize"
      itemUnit="users"
      emptyMessage="No users yet. Assign a Center Head to an SDC, an Attender User to a batch, or add faculty to a batch."
      [customTemplates]="{
        user: userTemplate,
        designation: designationTemplate,
        assignment: assignmentTemplate,
        actions: actionsTemplate
      }"
    >
      <div beforeTable class="flex items-center justify-between gap-3 pt-1">
        <app-filter-tabs [options]="filterOptions()" [value]="activeRole()" (valueChange)="setRole($event)" />
      </div>

      @if (message()) {
        <div
          beforeTable
          class="p-3 rounded-lg border text-xs flex items-center justify-between gap-2"
          [class]="messageIsError() ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'"
        >
          <span class="font-medium">{{ message() }}</span>
          <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="message.set('')"><app-icon name="close" size="xs" /></button>
        </div>
      }

      <ng-template #userTemplate let-u>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ u.name }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px tabular-nums">{{ u.ssoId }}</div>
        </div>
      </ng-template>

      <ng-template #designationTemplate let-u>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ u.designation || '—' }}</div>
          @if (u.extra) {
            <div class="text-[11px] text-secondary leading-tight mt-px">{{ u.extra }}</div>
          }
        </div>
      </ng-template>

      <ng-template #assignmentTemplate let-u>
        <div>
          <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ u.assignedTo }}</div>
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ u.assignedDetail }}</div>
        </div>
      </ng-template>

      <ng-template #actionsTemplate let-u>
        <div class="flex items-center justify-center gap-2 py-2 px-1 whitespace-nowrap">
          <button appButton variant="outline" size="sm" class="w-24 shrink-0" type="button" (click)="viewing.set(u)" title="View the details of this user">
            <app-icon name="eye" size="sm" />
            <span>View</span>
          </button>
          <button appButton variant="outline" size="sm" class="w-24 shrink-0" type="button" (click)="edit(u)" [title]="editTitle(u)">
            <app-icon name="edit" size="sm" />
            <span>Edit</span>
          </button>
          <button appButton variant="danger" size="sm" class="w-24 shrink-0" type="button" (click)="unmapping.set(u)" title="Take this user off what they are assigned to">
            <app-icon name="close" size="sm" />
            <span>Unmap</span>
          </button>
        </div>
      </ng-template>
    </app-list-page>

    @if (viewing(); as user) {
      <app-tp-user-view-modal [user]="user" (closed)="viewing.set(null)" />
    }

    @if (editingFaculty(); as user) {
      <app-tp-faculty-edit-modal [user]="user" (saved)="saveFaculty(user, $event)" (closed)="editingFaculty.set(null)" />
    }

    @if (changing(); as user) {
      <app-center-head-assign-modal
        [sdcName]="user.assignedTo"
        [role]="user.role"
        [targetKind]="user.role === 'Center Head' ? 'center' : 'batch'"
        [placeholder]="user.role === 'Center Head' ? 'e.g. CENTERHEAD1' : 'e.g. ATTENDER1'"
        [heading]="'Change ' + user.role"
        [intro]="'Enter the SSO ID of the new ' + user.role + ' of ' + user.assignedTo + '. ' + user.name + ' is replaced.'"
        confirmLabel="Confirm & Replace"
        (confirmed)="saveChange(user, $event)"
        (closed)="changing.set(null)"
      />
    }

    <app-action-modal
      [isOpen]="!!unmapping()"
      title="Unmap User"
      accentBarClass="bg-primary"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      maxWidthClass="max-w-lg"
      primaryLabel="Unmap"
      secondaryLabel="Cancel"
      (primaryAction)="confirmUnmap()"
      (secondaryAction)="unmapping.set(null)"
      (close)="unmapping.set(null)"
    >
      @if (unmapping(); as user) {
        <div class="mt-4 space-y-3 text-xs text-slate-700">
          <p class="m-0">
            Take <strong>{{ user.name }}</strong> ({{ user.ssoId }}) off
            {{ user.role === 'Faculty' ? 'the batches they are mapped to' : user.assignedTo }}?
          </p>
          @switch (user.role) {
            @case ('Center Head') {
              <p class="m-0">The center has no Center Head until another is assigned from SDC Management.</p>
            }
            @case ('Attender User') {
              <p class="m-0">The batch has no Attender User until another is assigned from Batch Management.</p>
            }
            @default {
              <p class="m-0">
                The trainer is taken off every batch that is not rejected, completed or cancelled. A batch where this is the
                only trainer keeps them.
              </p>
            }
          }
        </div>
      }
    </app-action-modal>
  `
})
export class TpUserListComponent {
  private readonly sdcs = inject(SdcService);
  private readonly batches = inject(BatchService);
  private readonly sso = inject(SsoDirectoryService);

  readonly searchQuery = signal<string>('');
  readonly activeRole = signal<string>('All');
  readonly pageSize = 10;

  readonly viewing = signal<TpUserRow | null>(null);
  readonly editingFaculty = signal<TpUserRow | null>(null);
  /** The Center Head or Attender User whose person is being changed. */
  readonly changing = signal<TpUserRow | null>(null);
  readonly unmapping = signal<TpUserRow | null>(null);
  readonly message = signal<string>('');
  readonly messageIsError = signal<boolean>(false);

  readonly columns: TableColumn<TpUserRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'user', label: 'User', type: 'custom', width: 'min-w-[160px]' },
    { key: 'role', label: 'Role', cellClass: 'whitespace-nowrap font-normal text-slate-800 text-[13px]', width: 'w-32' },
    { key: 'mobile', label: 'Mobile No.', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-32' },
    { key: 'email', label: 'E-mail', cellClass: 'font-normal text-slate-800 text-[13px]', width: 'min-w-[200px]' },
    { key: 'designation', label: 'Designation', type: 'custom', width: 'min-w-[200px]' },
    { key: 'assignment', label: 'Assigned To', type: 'custom', width: 'min-w-[240px]' },
    { key: 'assignedOn', label: 'Assigned On', align: 'center', cellClass: 'whitespace-nowrap tabular-nums font-normal text-slate-800 text-[13px]', width: 'w-32' },
    { key: 'actions', label: 'Actions', type: 'custom', align: 'center', width: 'min-w-[340px]' }
  ];

  private readonly users = computed(() => buildTpUsers(this.sdcs.sdcs(), this.batches.batches(), id => this.sso.find(id)));

  protected readonly filterOptions = computed(() => {
    const all = this.users();
    const count = (role: TpUserRole) => all.filter(u => u.role === role).length;
    return [
      { id: 'All', label: 'All Users', count: all.length },
      { id: 'Center Head', label: 'Center Heads', count: count('Center Head') },
      { id: 'Faculty', label: 'Faculty', count: count('Faculty') },
      { id: 'Attender User', label: 'Attender Users', count: count('Attender User') }
    ];
  });

  readonly filteredUsers = computed(() => filterTpUsers(this.users(), this.activeRole() as TpUserRole | 'All', this.searchQuery()));

  setRole(id: string): void {
    this.activeRole.set(id);
  }

  protected editTitle(user: TpUserRow): string {
    return user.role === 'Faculty'
      ? 'Change the trainer type and qualification'
      : `Change the ${user.role} to another person`;
  }

  /** Faculty: change the trainer details. Center Head and Attender User: pick another person from SSO. */
  protected edit(user: TpUserRow): void {
    if (user.role === 'Faculty') this.editingFaculty.set(user);
    else this.changing.set(user);
  }

  private show(text: string, isError = false): void {
    this.messageIsError.set(isError);
    this.message.set(text);
  }

  protected saveFaculty(user: TpUserRow, changes: { trainerType: string; qualification: string }): void {
    const batches = this.batches.updateFacultyProfile(user.ssoId, changes);
    this.editingFaculty.set(null);
    this.show(`${user.name} updated in ${batches} ${batches === 1 ? 'batch' : 'batches'}.`);
  }

  protected saveChange(user: TpUserRow, person: SsoProfile): void {
    const details = { ssoId: person.ssoId, name: person.name, mobile: person.mobile, email: person.email, designation: person.designation };
    const done =
      user.role === 'Center Head'
        ? !!user.sdcId && this.sdcs.changeCenterHead(user.sdcId, details)
        : this.batches.changeAttender(user.batchIds[0], details);
    this.changing.set(null);
    this.show(
      done ? `${person.name} is now the ${user.role} of ${user.assignedTo}.` : `The ${user.role} of ${user.assignedTo} could not be changed.`,
      !done
    );
  }

  protected confirmUnmap(): void {
    const user = this.unmapping();
    if (!user) return;
    this.unmapping.set(null);

    if (user.role === 'Center Head') {
      const done = !!user.sdcId && this.sdcs.unassignCenterHead(user.sdcId);
      this.show(done ? `${user.name} is no longer the Center Head of ${user.assignedTo}.` : 'The Center Head could not be unmapped.', !done);
    } else if (user.role === 'Attender User') {
      const done = this.batches.unassignAttender(user.batchIds[0]);
      this.show(done ? `${user.name} is no longer the Attender User of ${user.assignedTo}.` : 'The Attender User could not be unmapped.', !done);
    } else {
      const { removed, kept } = this.batches.unmapFaculty(user.ssoId);
      const keptText = kept > 0 ? ` ${kept} ${kept === 1 ? 'batch keeps' : 'batches keep'} them, as ${kept === 1 ? 'it is' : 'they are'} closed or have no other trainer.` : '';
      this.show(
        removed > 0 ? `${user.name} was taken off ${removed} ${removed === 1 ? 'batch' : 'batches'}.${keptText}` : `${user.name} could not be taken off any batch.${keptText}`,
        removed === 0
      );
    }
  }
}
