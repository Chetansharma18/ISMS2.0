import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UserManagementItem } from '../../../core/models/user-management.model';
import { isTrainingPartner } from '../user-management.util';
import { ButtonComponent, IconComponent, SwitchComponent } from '../../../shared';

@Component({
  selector: 'app-user-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, SwitchComponent],
  host: { class: 'block' },
  template: `
    @let item = user();
    <div class="flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
      <!-- View -->
      <button
        appButton
        variant="ghost"
        size="sm"
        iconOnly
        type="button"
        (click)="$event.stopPropagation(); view.emit(item)"
        title="View Details"
        aria-label="View Details"
      >
        <app-icon name="eye" size="sm" />
      </button>

      <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

      <!-- Edit -->
      <button
        appButton
        variant="ghost"
        size="sm"
        iconOnly
        type="button"
        (click)="$event.stopPropagation(); edit.emit(item)"
        title="Edit User"
        aria-label="Edit User"
      >
        <app-icon name="edit" size="sm" />
      </button>

      <!-- Active / Inactive Toggle (hidden for blacklisted users) -->
      @if (item.schemeStatus !== 'Blacklisted') {
        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

        <div
          class="inline-flex items-center"
          [title]="item.schemeStatus === 'Active' ? 'Status: Active (Click to deactivate)' : 'Status: Inactive (Click to activate)'"
          (click)="$event.stopPropagation();"
        >
          <app-switch
            [checked]="item.schemeStatus === 'Active'"
            [label]="item.schemeStatus === 'Active' ? 'Active' : 'Inactive'"
            (toggled)="toggleStatus.emit(item)"
          />
        </div>
      }

      <!-- Blacklist control (Training Partners only) -->
      @if (isTp()) {
        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

        @if (item.schemeStatus === 'Blacklisted') {
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="$event.stopPropagation(); toggleBlacklist.emit(item)"
            title="Remove from Blacklist"
            aria-label="Remove Blacklist"
          >
            <app-icon name="check-circle" size="sm" class="text-emerald-600" />
          </button>
        } @else {
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            (click)="$event.stopPropagation(); toggleBlacklist.emit(item)"
            title="Mark this Training Partner as blacklisted"
            aria-label="Mark Blacklisted"
          >
            <app-icon name="ban" size="sm" [stroke]="2" class="text-rose-600 shrink-0" />
          </button>
        }
      }
    </div>
  `
})
export class UserActionsCellComponent {
  readonly user = input.required<UserManagementItem>();
  readonly view = output<UserManagementItem>();
  readonly edit = output<UserManagementItem>();
  readonly toggleStatus = output<UserManagementItem>();
  readonly toggleBlacklist = output<UserManagementItem>();

  protected readonly isTp = computed(() => isTrainingPartner(this.user()));
}
