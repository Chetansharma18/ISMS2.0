import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
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
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-center gap-2 whitespace-nowrap">
      <button
        type="button"
        (click)="$event.stopPropagation(); viewScheme.emit(item())"
        class="inline-flex items-center gap-1 text-ocean hover:text-[#03607E] font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
        title="View EOI Details"
      >
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>View</span>
      </button>

      @if (hasPendingApplication() && !isSuperAdmin()) {
        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>
        <button
          type="button"
          (click)="$event.stopPropagation(); resumeScheme.emit(item())"
          class="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold text-[12px] hover:underline cursor-pointer select-none transition-colors"
          title="Continue your pending application"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span>Continue</span>
        </button>
      }

      @if (isSuperAdmin()) {
        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        <!-- Add Committee Button (Super Admin Only) -->
        <button
          type="button"
          (click)="$event.stopPropagation(); manageCommittee.emit(item())"
          class="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
          title="Add / Manage Committee Members"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Add Committee</span>
          @if ((item().committeeMembers && item().committeeMembers!.length > 0) || item().committeeApprover) {
            <span class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
              {{ (item().committeeMembers?.length || 0) + (item().committeeApprover ? 1 : 0) }}
            </span>
          }
        </button>

        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        <button
          type="button"
          [disabled]="isEditDisabled(item()) || item().isFrozen"
          (click)="$event.stopPropagation(); (!isEditDisabled(item()) && !item().isFrozen) ? editScheme.emit(item()) : null"
          [ngClass]="(isEditDisabled(item()) || item().isFrozen) ? 'text-slate-400 cursor-not-allowed' : 'text-amber-700 hover:text-amber-800 hover:underline cursor-pointer'"
          class="inline-flex items-center gap-1 font-medium text-[12px] select-none transition-colors"
          [title]="item().isFrozen ? 'Scheme is frozen' : (isEditDisabled(item()) ? 'Edit is only available within 24 hours of creation' : 'Edit EOI Configuration')"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>

        <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

        <!-- Active / Inactive Toggle -->
        <div
          class="inline-flex items-center gap-1.5"
          [title]="item().isFrozen ? 'Scheme is frozen' : 'Toggle Active/Inactive Status'"
          (click)="$event.stopPropagation();"
        >
          <button
            type="button"
            [disabled]="item().isFrozen"
            (click)="!item().isFrozen ? toggleActive.emit(item()) : null"
            class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            [ngClass]="item().isFrozen ? 'bg-slate-300 cursor-not-allowed' : (item().isActive === false ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-500 hover:bg-emerald-600')"
            role="switch"
            [attr.aria-checked]="item().isActive !== false"
          >
            <span class="sr-only">Toggle Active Status</span>
            <span
              class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              [ngClass]="item().isActive === false ? 'translate-x-0' : 'translate-x-3'"
            ></span>
          </button>
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
