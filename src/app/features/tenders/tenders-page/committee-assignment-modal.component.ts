import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionModalComponent } from '../../../shared';
import { CommitteeAdmin, SchemeTender } from '../tenders.models';
import { filterAdmins } from './tenders-page.util';

/**
 * Modal used by super admins to assign committee members to a scheme.
 * Owns the dropdown / selection state; emits the chosen member names on save.
 */
@Component({
  selector: 'app-committee-assignment-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, FormsModule, ActionModalComponent],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="true"
      [showAccentBar]="true"
      accentBarClass="bg-purple-600"
      title="Add Committee Members"
      primaryLabel="Save Committee"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[540px]"
      (primaryAction)="save.emit(selectedAdminIds())"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (scheme(); as s) {
        <div class="mt-3 font-sans text-xs space-y-4">
          <!-- Scheme Info Header -->
          <div class="bg-purple-50/80 border border-purple-200 rounded-lg p-3 flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-purple-900">{{ s.schemeName }}</span>
              <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                {{ s.refNo }}
              </span>
            </div>
            <p class="text-[11px] text-slate-600 m-0 line-clamp-1">
              {{ s.eoiDescription }}
            </p>
          </div>

          <!-- Multi-select Dropdown Section -->
          <div>
            <label class="block text-slate-700 font-semibold text-xs mb-1.5">
              Select Admin Name(s) for Committee *
            </label>

            <!-- Dropdown Trigger Box -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleAdminDropdown()"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-left flex items-center justify-between shadow-2xs hover:border-primary focus:outline-none transition-colors"
              >
                <span class="text-slate-700 text-xs font-medium">
                  {{ selectedAdminIds().length === 0 ? 'Select admin names...' : (selectedAdminIds().length + ' admin(s) selected') }}
                </span>
                <svg class="w-4 h-4 text-slate-400 transition-transform" [ngClass]="{'rotate-180': isAdminDropdownOpen()}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown List Popup -->
              @if (isAdminDropdownOpen()) {
                <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col">
                  <div class="p-1.5 border-b border-slate-100 shrink-0">
                    <div class="relative">
                      <input
                        type="text"
                        placeholder="Search admin name..."
                        [ngModel]="adminSearchQuery()"
                        (ngModelChange)="adminSearchQuery.set($event)"
                        (click)="$event.stopPropagation()"
                        class="w-full pl-7 pr-2 py-1.5 text-[11px] border border-slate-200 rounded focus:outline-none focus:border-primary text-slate-700"
                      />
                      <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div class="max-h-56 overflow-y-auto p-1.5 space-y-1">
                  @for (adm of filteredAvailableAdmins(); track adm.id) {
                    <label
                      class="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-purple-50/70 cursor-pointer transition-colors text-xs"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          [checked]="isAdminSelected(adm.name)"
                          (change)="toggleAdminSelection(adm.name)"
                          class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                        />
                        <div class="flex flex-col">
                          <span class="font-semibold text-slate-800">{{ adm.name }}</span>
                          <span class="text-[10.5px] text-slate-400 font-mono">{{ adm.ssoId }}</span>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {{ adm.role }}
                      </span>
                    </label>
                  }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Selected Members Badges -->
          <div>
            <span class="block text-slate-500 font-medium text-[11px] mb-1.5">
              Assigned Committee Members ({{ selectedAdminIds().length }})
            </span>
            @if (selectedAdminIds().length === 0) {
              <p class="text-[11.5px] text-slate-400 italic m-0 bg-slate-50 border border-dashed border-slate-200 p-2.5 rounded-md text-center">
                No committee members selected yet. Use the dropdown above to add admins.
              </p>
            } @else {
              <div class="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-md">
                @for (name of selectedAdminIds(); track name) {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">
                    <span>{{ name }}</span>
                    <button
                      type="button"
                      (click)="removeAdminSelection(name)"
                      class="text-purple-600 hover:text-purple-900 rounded-full hover:bg-purple-200 p-0.5 transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                }
              </div>
            }
          </div>
        </div>
      }
    </app-action-modal>
  `
})
export class CommitteeAssignmentModalComponent {
  readonly isOpen = input(false);
  /** Scheme being edited; null while the modal is closed. */
  readonly scheme = input<SchemeTender | null>(null);
  readonly admins = input<CommitteeAdmin[]>([]);

  /** Emits the selected member names when "Save Committee" is clicked. */
  readonly save = output<string[]>();
  readonly close = output<void>();

  readonly selectedAdminIds = signal<string[]>([]);
  readonly isAdminDropdownOpen = signal<boolean>(false);
  readonly adminSearchQuery = signal<string>('');

  readonly filteredAvailableAdmins = computed(() => filterAdmins(this.admins(), this.adminSearchQuery()));

  constructor() {
    // Each time a scheme is (re)opened, seed the selection from its current committee.
    effect(() => {
      const s = this.scheme();
      if (s) {
        this.selectedAdminIds.set(s.committeeMembers ? [...s.committeeMembers] : []);
        this.isAdminDropdownOpen.set(false);
      }
    });
  }

  toggleAdminDropdown(): void {
    this.isAdminDropdownOpen.update(v => !v);
  }

  isAdminSelected(name: string): boolean {
    return this.selectedAdminIds().includes(name);
  }

  toggleAdminSelection(name: string): void {
    this.selectedAdminIds.update(current => {
      if (current.includes(name)) {
        return current.filter(n => n !== name);
      } else {
        return [...current, name];
      }
    });
  }

  removeAdminSelection(name: string): void {
    this.selectedAdminIds.update(current => current.filter(n => n !== name));
  }
}
