import { Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent, SwitchComponent } from '../../../shared';
import { SchemeTender } from '../tenders.models';
import { isEditDisabled } from './tenders-page.util';

/**
 * Action cell of the active-schemes table: View, plus (for super admins)
 * Add Committee, Edit, and Active/Inactive toggle.
 * Displays clean icon-only buttons with descriptive tooltips.
 */
@Component({
  selector: 'app-scheme-row-actions',
  standalone: true,
  imports: [ButtonComponent, IconComponent, SwitchComponent],
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
      <!-- View Button -->
      <button
        appButton
        variant="ghost"
        size="sm"
        iconOnly
        type="button"
        (click)="$event.stopPropagation(); viewScheme.emit(item())"
        title="View"
        aria-label="View"
      >
        <app-icon name="eye" size="sm" />
      </button>

      @if (hasPendingApplication() && !isSuperAdmin()) {
        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>
        <!-- Continue Button -->
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="$event.stopPropagation(); resumeScheme.emit(item())"
          title="Continue Application"
          aria-label="Continue Application"
        >
          <app-icon name="arrow-right" size="sm" [stroke]="2" />
        </button>
      }

      @if (isSuperAdmin()) {
        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

        <!-- Create Committee Button (Super Admin Only) -->
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="$event.stopPropagation(); manageCommittee.emit(item())"
          [title]="getCommitteeTooltip(item())"
          aria-label="Create Committee"
          class="relative"
        >
          <app-icon name="users-committee" size="sm" [stroke]="2" />
          @if (committeeCount(item()) > 0) {
            <span class="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] leading-[14px] text-center rounded-full text-[9px] font-bold bg-[#7C0E44] text-white">
              {{ committeeCount(item()) }}
            </span>
          }
        </button>

        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

        <!-- Edit Button -->
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          [disabled]="isEditDisabled(item()) || item().isFrozen"
          (click)="$event.stopPropagation(); (!isEditDisabled(item()) && !item().isFrozen) ? editScheme.emit(item()) : null"
          [title]="item().isFrozen ? 'Scheme is frozen' : (isEditDisabled(item()) ? (item().editDisabledReason || 'Edit is only available within 24 hours of creation') : 'Edit')"
          aria-label="Edit"
        >
          <app-icon name="edit" size="sm" />
        </button>

        <div class="h-3.5 w-px bg-slate-200 shrink-0"></div>

        <!-- Active / Inactive Toggle -->
        <div
          class="inline-flex items-center"
          [title]="item().isFrozen ? 'Scheme is frozen' : (item().isActive === false ? 'Status: Inactive (Click to activate)' : 'Status: Active (Click to deactivate)')"
          (click)="$event.stopPropagation();"
        >
          <app-switch
            [checked]="item().isActive !== false"
            [disabled]="!!item().isFrozen"
            [label]="item().isActive === false ? 'Inactive' : 'Active'"
            (toggled)="!item().isFrozen ? toggleActive.emit(item()) : null"
          />
        </div>
      }
    </div>
  `
})
export class SchemeRowActionsComponent {
  readonly item = input.required<SchemeTender>();
  readonly isSuperAdmin = input(false);
  /** The applicant has started, but not submitted, an application for this scheme. */
  readonly hasPendingApplication = input(false);

  readonly viewScheme = output<SchemeTender>();
  readonly resumeScheme = output<SchemeTender>();
  readonly manageCommittee = output<SchemeTender>();
  readonly editScheme = output<SchemeTender>();
  readonly toggleActive = output<SchemeTender>();

  protected readonly isEditDisabled = isEditDisabled;

  protected committeeCount(item: SchemeTender): number {
    return item.committeeCount ?? (item.committeeMembers?.length || 0) + (item.committeeApprover ? 1 : 0);
  }

  protected getCommitteeTooltip(item: SchemeTender): string {
    const count = this.committeeCount(item);
    if (count > 0) {
      return `Create Committee (${count} member${count > 1 ? 's' : ''} assigned)`;
    }
    return 'Create Committee';
  }
}
