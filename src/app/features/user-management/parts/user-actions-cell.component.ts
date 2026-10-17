import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { UserManagementItem } from '../../../core/models/user-management.model';
import { isTrainingPartner } from '../user-management.util';
import { ButtonComponent, IconComponent, SwitchComponent } from '../../../shared';

@Component({
  selector: 'app-user-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ButtonComponent, IconComponent, SwitchComponent],
  host: { class: 'block' },
  template: `
    @let item = user();
    <div class="flex items-center justify-center gap-2 whitespace-nowrap">
      <!-- View -->
      <button
        appButton
        variant="ghost"
        size="sm"
        type="button"
        (click)="$event.stopPropagation(); view.emit(item)"
        title="View Details"
      >
        <app-icon name="eye" size="sm" />
        <span>View</span>
      </button>

      <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

      <!-- Edit -->
      <button
        appButton
        variant="ghost"
        size="sm"
        type="button"
        (click)="$event.stopPropagation(); edit.emit(item)"
        title="Edit User"
      >
        <app-icon name="edit" size="sm" />
        <span>Edit</span>
      </button>

      <!-- Active / Inactive Toggle (hidden for blacklisted users) -->
      @if (item.schemeStatus !== 'Blacklisted') {
        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        <div
          class="inline-flex items-center gap-1.5"
          title="Toggle Status"
          (click)="$event.stopPropagation();"
        >
          <app-switch
            [checked]="item.schemeStatus === 'Active'"
            label="Toggle Active Status"
            (toggled)="toggleStatus.emit(item)"
          />
          <span 
            class="font-medium text-[12px] select-none transition-colors cursor-pointer"
            (click)="toggleStatus.emit(item)"
            [ngClass]="item.schemeStatus !== 'Active' ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'"
          >
            {{ item.schemeStatus !== 'Active' ? 'Inactive' : 'Active' }}
          </span>
        </div>
      }

      <!-- Blacklist control (Training Partners only) -->
      @if (isTp()) {
        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        @if (item.schemeStatus === 'Blacklisted') {
          <button
            appButton
            variant="ghost"
            size="sm"
            type="button"
            (click)="$event.stopPropagation(); toggleBlacklist.emit(item)"
            title="Remove this Training Partner from the blacklist"
          >
            <app-icon name="check-circle" size="sm" />
            <span>Remove Blacklist</span>
          </button>
        } @else {
          <button
            appButton
            variant="danger"
            size="sm"
            type="button"
            (click)="$event.stopPropagation(); toggleBlacklist.emit(item)"
            title="Mark this Training Partner as blacklisted"
          >
            <app-icon name="ban" size="sm" [stroke]="2" class="shrink-0" />
            <span>Mark Blacklisted</span>
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
