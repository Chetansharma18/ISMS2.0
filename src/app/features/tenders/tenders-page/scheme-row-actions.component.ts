import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonComponent, IconComponent, SwitchComponent } from '../../../shared';
import { SchemeTender } from '../tenders.models';
import { isEditDisabled } from './tenders-page.util';

/**
 * Action cell of the active-schemes table: View, plus (for super admins)
 * Add Committee, Edit, Active/Inactive toggle and Freeze.
 *
 * Stays on Default change detection because the parent mutates the scheme
 * object in place (isActive / isFrozen).
 */
@Component({
  selector: 'app-scheme-row-actions',
  standalone: true,
  imports: [NgClass, ButtonComponent, IconComponent, SwitchComponent],
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-center gap-2 whitespace-nowrap">
      <button
        appButton
        variant="ghost"
        size="sm"
        type="button"
        (click)="$event.stopPropagation(); viewScheme.emit(item())"
        title="View EOI Details"
      >
        <app-icon name="eye" size="sm" />
        <span>View</span>
      </button>

      @if (hasPendingApplication() && !isSuperAdmin()) {
        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>
        <button
          appButton
          variant="ghost"
          size="sm"
          type="button"
          (click)="$event.stopPropagation(); resumeScheme.emit(item())"
          title="Continue your pending application"
        >
          <app-icon name="arrow-right" size="sm" [stroke]="2" />
          <span>Continue</span>
        </button>
      }

      @if (isSuperAdmin()) {
        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        <!-- Create Committee Button (Super Admin Only) -->
        <button
          appButton
          variant="ghost"
          size="sm"
          type="button"
          (click)="$event.stopPropagation(); manageCommittee.emit(item())"
          title="Create / Manage Committee Members"
        >
          <app-icon name="users-committee" size="sm" [stroke]="2" />
          <span>Create Committee</span>
          @if ((item().committeeMembers && item().committeeMembers!.length > 0) || item().committeeApprover) {
            <span class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
              {{ (item().committeeMembers?.length || 0) + (item().committeeApprover ? 1 : 0) }}
            </span>
          }
        </button>

        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        <button
          appButton
          variant="ghost"
          size="sm"
          type="button"
          [disabled]="isEditDisabled(item()) || item().isFrozen"
          (click)="$event.stopPropagation(); (!isEditDisabled(item()) && !item().isFrozen) ? editScheme.emit(item()) : null"
          [title]="item().isFrozen ? 'Scheme is frozen' : (isEditDisabled(item()) ? 'Edit is only available within 24 hours of creation' : 'Edit EOI Configuration')"
        >
          <app-icon name="edit" size="sm" />
          <span>Edit</span>
        </button>

        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        <!-- Active / Inactive Toggle -->
        <div
          class="inline-flex items-center gap-1.5"
          [title]="item().isFrozen ? 'Scheme is frozen' : 'Toggle Active/Inactive Status'"
          (click)="$event.stopPropagation();"
        >
          <app-switch
            [checked]="item().isActive !== false"
            [disabled]="!!item().isFrozen"
            label="Toggle Active Status"
            (toggled)="!item().isFrozen ? toggleActive.emit(item()) : null"
          />
          <span 
            class="font-medium text-[12px] select-none transition-colors cursor-pointer"
            (click)="!item().isFrozen ? toggleActive.emit(item()) : null"
            [ngClass]="item().isFrozen ? 'text-slate-400 cursor-not-allowed' : (item().isActive === false ? 'text-slate-700 font-semibold hover:text-slate-900' : 'text-emerald-600 hover:text-emerald-700')"
          >
            {{ item().isActive === false ? 'Inactive' : 'Active' }}
          </span>
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
}
