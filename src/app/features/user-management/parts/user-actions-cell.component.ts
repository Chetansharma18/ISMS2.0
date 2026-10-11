import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { UserManagementItem } from '../../../core/models/user-management.model';
import { isTrainingPartner } from '../user-management.util';

@Component({
  selector: 'app-user-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    @let item = user();
    <div class="flex items-center justify-center gap-2 whitespace-nowrap">
      <!-- View -->
      <button
        type="button"
        (click)="$event.stopPropagation(); view.emit(item)"
        class="inline-flex items-center gap-1 text-brand hover:text-navy font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
        title="View Details"
      >
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>View</span>
      </button>

      <div class="h-3.5 w-px bg-slate-300 shrink-0"></div>

      <!-- Edit -->
      <button
        type="button"
        (click)="$event.stopPropagation(); edit.emit(item)"
        class="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
        title="Edit User"
      >
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
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
          <button
            type="button"
            (click)="toggleStatus.emit(item)"
            class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            [ngClass]="item.schemeStatus !== 'Active' ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-500 hover:bg-emerald-600'"
            role="switch"
            [attr.aria-checked]="item.schemeStatus === 'Active'"
          >
            <span class="sr-only">Toggle Active Status</span>
            <span
              class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              [ngClass]="item.schemeStatus !== 'Active' ? 'translate-x-0' : 'translate-x-3'"
            ></span>
          </button>
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
            type="button"
            (click)="$event.stopPropagation(); toggleBlacklist.emit(item)"
            class="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Remove this Training Partner from the blacklist"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Remove Blacklist</span>
          </button>
        } @else {
          <button
            type="button"
            (click)="$event.stopPropagation(); toggleBlacklist.emit(item)"
            class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Mark this Training Partner as blacklisted"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
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
