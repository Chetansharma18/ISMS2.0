import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActionModalComponent } from '../../../shared';
import { UserManagementItem } from '../../../core/models/user-management.model';
import { roleTypeLabel } from '../user-management.util';

@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  imports: [NgClass, ActionModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="true"
      [showAccentBar]="false"
      secondaryLabel="Close"
      maxWidthClass="max-w-[580px]"
      (secondaryAction)="closed.emit()"
      (close)="closed.emit()"
    >
      <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
        User Details - {{ user()?.username }}
      </h2>
      @if (user(); as u) {
        <div class="mt-4 font-sans text-[13px] grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <span class="text-slate-500 font-medium block text-xs">User ID</span>
            <span class="font-mono font-semibold text-slate-800">{{ u.userId }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">Username</span>
            <span class="font-semibold text-slate-800">{{ u.username }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">SSO ID</span>
            <span class="font-mono text-slate-800">{{ u.ssoId }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">User Type</span>
            <span class="font-medium text-slate-800">{{ u.userType }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">Role Type</span>
            <span class="font-semibold text-brand">{{ roleTypeLabel(u.roleType) }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">Designation</span>
            <span class="text-slate-800">{{ u.designation || 'N/A' }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">Scheme Department</span>
            <span class="text-slate-800">{{ u.schemeDepartment || 'RSLDC' }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">District</span>
            <span class="text-slate-800">{{ u.districtName }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">Block Name</span>
            <span class="text-slate-800">{{ u.blockName || 'All Blocks' }}</span>
          </div>
          <div>
            <span class="text-slate-500 font-medium block text-xs">Status</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              [ngClass]="u.schemeStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
              {{ u.schemeStatus }}
            </span>
          </div>
        </div>
      }
    </app-action-modal>
  `
})
export class UserDetailsModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly user = input<UserManagementItem | null>(null);
  readonly closed = output<void>();

  protected readonly roleTypeLabel = roleTypeLabel;
}
