import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  linkedSignal,
  output,
  signal
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionModalComponent, ButtonComponent, IconComponent, InputDirective } from '../../../shared';
import { CommitteeAdmin, SchemeTender } from '../tenders.models';
import { filterAdmins } from './tenders-page.util';

/**
 * Modal used by super admins to assign an Approver and Committee Members to an EOI scheme.
 * Features two searchable dropdowns populated with the same list of committee admins:
 * - Approver: single-selection dropdown with live search.
 * - Members: multi-selection dropdown with live search.
 */
@Component({
  selector: 'app-committee-assignment-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, FormsModule, ActionModalComponent, ButtonComponent, IconComponent, InputDirective],
  styles: [`
    .thin-scroll::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .thin-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .thin-scroll::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.5);
      border-radius: 9999px;
    }
    .thin-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(100, 116, 139, 0.7);
    }
    .thin-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
    }
  `],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="false"
      [closeOnBackdrop]="true"
      [scrollable]="false"
      [showAccentBar]="false"
      title="Create Committee"
      [primaryLabel]="saving() ? 'Saving...' : 'Save Committee'"
      [disablePrimary]="saving()"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[600px]"
      (primaryAction)="onSave()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (scheme(); as s) {
        <div class="mt-2 font-sans text-[13px] space-y-4 pb-1">
          <!-- Scheme Info Banner -->
          <div class="bg-[#FAF5F7] border border-[#EADCE2] rounded-lg px-3.5 py-2.5 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[13.5px] font-bold text-[#7C0E44] leading-snug">{{ s.schemeName }}</span>
              <span class="tabular-nums text-[11px] px-2 py-0.5 rounded bg-white text-[#7C0E44] font-semibold border border-[#EADCE2] shrink-0">
                {{ s.refNo }}
              </span>
            </div>
            @if (s.eoiDescription) {
              <p class="text-xs text-slate-600 m-0 leading-relaxed line-clamp-2" [title]="s.eoiDescription">
                {{ s.eoiDescription }}
              </p>
            }
          </div>

          @if (errorMessage() || serverError()) {
            <div class="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {{ errorMessage() || serverError() }}
            </div>
          }
          @if (admins().length === 0) {
            <p class="text-xs text-slate-500 m-0">No eligible users found. Committee users need an active role other than User / Tp.</p>
          }

          <!-- 1. APPROVER DROPDOWN (SINGLE SELECT + SEARCHABLE) -->
          <div class="relative approver-dropdown-container" [class.z-30]="isApproverDropdownOpen()">
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-slate-700 font-semibold text-xs">
                Approver <span class="text-[#DC2626] font-bold">*</span>
              </label>
              <span class="text-[11px] text-slate-400">Select 1 member</span>
            </div>

            <!-- Approver Dropdown Trigger -->
            <div class="relative">
              <button
                appButton
                variant="outline"
                block
                type="button"
                (click)="toggleApproverDropdown($event)"
                class="justify-between text-left"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  @if (selectedApprover()) {
                    <span class="font-medium text-slate-800 text-[13px] truncate">{{ nameOf(selectedApprover()) }}</span>
                    @if (getAdmin(selectedApprover()); as adm) {
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2] shrink-0">
                        {{ adm.role }}
                      </span>
                    }
                  } @else {
                    <span class="text-slate-400 text-[13px] font-normal">Select approver...</span>
                  }
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  @if (selectedApprover()) {
                    <span
                      role="button"
                      tabindex="0"
                      (click)="clearApprover($event); $event.stopPropagation()"
                      (keydown.enter)="clearApprover($event); $event.stopPropagation()"
                      (keydown.space)="clearApprover($event); $event.stopPropagation()"
                      class="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                      title="Clear approver"
                    >
                      <app-icon name="close" size="xs" [stroke]="2" />
                    </span>
                  }
                  <app-icon
                    name="chevron-down"
                    [stroke]="2"
                    class="text-slate-400 transition-transform duration-200"
                    [ngClass]="{'rotate-180': isApproverDropdownOpen()}"
                  />
                </div>
              </button>

              <!-- Approver Popup -->
              @if (isApproverDropdownOpen()) {
                <div
                  (click)="$event.stopPropagation()"
                  class="absolute left-0 right-0 top-full mt-1 bg-white border border-theme rounded-lg shadow-[0_12px_28px_rgba(31,41,51,0.14)] flex flex-col font-sans z-50"
                >
                  <!-- Search Bar -->
                  <div class="p-2 border-b border-slate-100 shrink-0 bg-slate-50/70 rounded-t-lg">
                    <div class="relative">
                      <input
                        appInput
                        size="sm"
                        type="text"
                        placeholder="Search approver by name..."
                        [ngModel]="approverSearchQuery()"
                        (ngModelChange)="approverSearchQuery.set($event)"
                        class="w-full pl-9 pr-8"
                      />
                      <app-icon name="search" size="sm" [stroke]="2" class="text-slate-400 absolute left-2.5 top-2" />
                      @if (approverSearchQuery()) {
                        <button
                          appButton
                          variant="ghost"
                          size="xs"
                          iconOnly
                          type="button"
                          (click)="approverSearchQuery.set('')"
                          class="absolute right-1 top-1/2 -translate-y-1/2"
                          aria-label="Clear search"
                        >
                          <app-icon name="close" size="xs" />
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Admins List (Single Selection) -->
                  <div class="max-h-44 overflow-y-auto thin-scroll p-1.5 space-y-0.5">
                    @for (adm of filteredApproverAdmins(); track adm.id) {
                      <div
                        role="button"
                        tabindex="0"
                        (click)="selectApprover(adm.ssoId)"
                        (keydown.enter)="selectApprover(adm.ssoId)"
                        (keydown.space)="selectApprover(adm.ssoId); $event.preventDefault()"
                        class="flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer transition-colors text-[13px] select-none"
                        [ngClass]="selectedApprover() === adm.ssoId ? 'bg-[#FAF5F7] text-[#7C0E44]' : 'hover:bg-slate-50 text-slate-800'"
                      >
                        <div class="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            [checked]="selectedApprover() === adm.ssoId"
                            tabindex="-1"
                            class="w-4 h-4 rounded text-[#7C0E44] border-slate-300 accent-[#7C0E44] pointer-events-none shrink-0"
                          />
                          <div class="flex flex-col min-w-0">
                            <span class="font-medium truncate" [class.text-[#7C0E44]]="selectedApprover() === adm.ssoId" [class.text-slate-800]="selectedApprover() !== adm.ssoId">
                              {{ adm.name }}
                            </span>
                            <span class="text-[11px] tabular-nums" [class.text-[#AA5E7A]]="selectedApprover() === adm.ssoId" [class.text-slate-400]="selectedApprover() !== adm.ssoId">
                              {{ adm.ssoId }}
                            </span>
                          </div>
                        </div>
                        <span
                          class="px-2 py-0.5 rounded text-[10.5px] font-medium shrink-0 ml-2 border"
                          [ngClass]="selectedApprover() === adm.ssoId ? 'bg-[#F8EDF1] text-[#7C0E44] border-[#EADCE2]' : 'bg-slate-100 text-slate-600 border-slate-200'"
                        >
                          {{ adm.role }}
                        </span>
                      </div>
                    }
                    @if (filteredApproverAdmins().length === 0) {
                      <div class="p-4 text-center text-xs text-slate-400">
                        No members found matching "{{ approverSearchQuery() }}"
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            @if (submitted() && !selectedApprover()) {
              <p class="text-[11px] text-rose-600 font-medium mt-1 m-0">Approver is required.</p>
            }
          </div>

          <!-- 2. MEMBERS DROPDOWN (MULTI SELECT + SEARCHABLE) -->
          <div class="relative member-dropdown-container" [class.z-20]="isMemberDropdownOpen()">
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-slate-700 font-semibold text-xs">
                Members <span class="text-[#DC2626] font-bold">*</span>
              </label>
              <span class="text-[11px] text-slate-400">Multiple selection</span>
            </div>

            <!-- Members Dropdown Trigger -->
            <div class="relative">
              <button
                appButton
                variant="outline"
                block
                type="button"
                (click)="toggleMemberDropdown($event)"
                class="justify-between text-left"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  @if (selectedAdminIds().length === 0) {
                    <span class="text-slate-400 text-[13px] font-normal">Select committee members...</span>
                  } @else {
                    <span class="text-slate-800 text-[13px] font-medium">
                      {{ selectedAdminIds().length }} member(s) selected
                    </span>
                  }
                </div>

                <app-icon
                  name="chevron-down"
                  [stroke]="2"
                  class="text-slate-400 transition-transform duration-200 shrink-0"
                  [ngClass]="{'rotate-180': isMemberDropdownOpen()}"
                />
              </button>

              <!-- Members Popup -->
              @if (isMemberDropdownOpen()) {
                <div
                  (click)="$event.stopPropagation()"
                  class="absolute left-0 right-0 top-full mt-1 bg-white border border-theme rounded-lg shadow-[0_12px_28px_rgba(31,41,51,0.14)] flex flex-col font-sans z-50"
                >
                  <!-- Search Bar -->
                  <div class="p-2 border-b border-slate-100 shrink-0 bg-slate-50/70 rounded-t-lg">
                    <div class="relative">
                      <input
                        appInput
                        size="sm"
                        type="text"
                        placeholder="Search members by name..."
                        [ngModel]="memberSearchQuery()"
                        (ngModelChange)="memberSearchQuery.set($event)"
                        class="w-full pl-9 pr-8"
                      />
                      <app-icon name="search" size="sm" [stroke]="2" class="text-slate-400 absolute left-2.5 top-2" />
                      @if (memberSearchQuery()) {
                        <button
                          appButton
                          variant="ghost"
                          size="xs"
                          iconOnly
                          type="button"
                          (click)="memberSearchQuery.set('')"
                          class="absolute right-1 top-1/2 -translate-y-1/2"
                          aria-label="Clear search"
                        >
                          <app-icon name="close" size="xs" />
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Admins List (Multi Selection) -->
                  <div class="max-h-44 overflow-y-auto thin-scroll p-1.5 space-y-0.5">
                    @for (adm of filteredMemberAdmins(); track adm.id) {
                      <label
                        class="flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer transition-colors text-[13px] select-none"
                        [ngClass]="isMemberSelected(adm.ssoId) ? 'bg-[#FAF5F7] text-[#7C0E44]' : 'hover:bg-slate-50 text-slate-800'"
                      >
                        <div class="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            [checked]="isMemberSelected(adm.ssoId)"
                            (change)="toggleMemberSelection(adm.ssoId)"
                            class="w-4 h-4 rounded text-[#7C0E44] border-slate-300 cursor-pointer accent-[#7C0E44] shrink-0"
                          />
                          <div class="flex flex-col min-w-0">
                            <span class="font-medium truncate" [class.text-[#7C0E44]]="isMemberSelected(adm.ssoId)" [class.text-slate-800]="!isMemberSelected(adm.ssoId)">
                              {{ adm.name }}
                            </span>
                            <span class="text-[11px] tabular-nums" [class.text-[#AA5E7A]]="isMemberSelected(adm.ssoId)" [class.text-slate-400]="!isMemberSelected(adm.ssoId)">
                              {{ adm.ssoId }}
                            </span>
                          </div>
                        </div>
                        <span
                          class="px-2 py-0.5 rounded text-[10.5px] font-medium shrink-0 ml-2 border"
                          [ngClass]="isMemberSelected(adm.ssoId) ? 'bg-[#F8EDF1] text-[#7C0E44] border-[#EADCE2]' : 'bg-slate-100 text-slate-600 border-slate-200'"
                        >
                          {{ adm.role }}
                        </span>
                      </label>
                    }
                    @if (filteredMemberAdmins().length === 0) {
                      <div class="p-4 text-center text-xs text-slate-400">
                        No members found matching "{{ memberSearchQuery() }}"
                      </div>
                    }
                  </div>

                  <!-- Multi-select Footer with Done button -->
                  <div class="px-3 py-2 border-t border-slate-200 bg-slate-50/90 rounded-b-lg flex items-center justify-between gap-2 text-xs">
                    <span class="text-slate-600 font-medium">{{ selectedAdminIds().length }} selected</span>
                    <button appButton variant="primary" size="sm" type="button" (click)="isMemberDropdownOpen.set(false)">
                      Done
                    </button>
                  </div>
                </div>
              }
            </div>
            @if (submitted() && selectedAdminIds().length === 0) {
              <p class="text-[11px] text-rose-600 font-medium mt-1 m-0">At least one committee member is required.</p>
            }
          </div>

          <!-- 3. ASSIGNED MEMBERS SUMMARY -->
          <div class="pt-3 border-t border-slate-200/80 space-y-3">
            <!-- Approver Badge -->
            @if (selectedApprover()) {
              <div>
                <span class="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider mb-1.5">
                  Assigned Approver
                </span>
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF5F7] border border-[#EADCE2] text-xs">
                  <app-icon name="shield-check" size="sm" [stroke]="2.2" class="text-[#7C0E44] shrink-0" />
                  <span class="font-semibold text-[#7C0E44]">{{ nameOf(selectedApprover()) }}</span>
                  @if (getAdmin(selectedApprover()); as adm) {
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-[#7C0E44] border border-[#EADCE2]">
                      {{ adm.role }}
                    </span>
                  }
                  <button
                    appButton
                    variant="ghost"
                    size="xs"
                    iconOnly
                    type="button"
                    (click)="clearApprover($event)"
                    title="Remove approver"
                    aria-label="Remove approver"
                  >
                    <app-icon name="close" size="xs" [stroke]="2.5" />
                  </button>
                </div>
              </div>
            }

            <!-- Committee Members Badges -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  Assigned Committee Members ({{ selectedAdminIds().length }})
                </span>
                @if (selectedAdminIds().length > 0) {
                  <button appButton variant="ghost" size="xs" type="button" (click)="selectedAdminIds.set([])">
                    Clear all
                  </button>
                }
              </div>

              @if (selectedAdminIds().length === 0) {
                <p class="text-xs text-slate-400 m-0 bg-slate-50 border border-dashed border-slate-200 py-3 px-4 rounded-lg text-center">
                  No committee members selected yet. Use the Members dropdown above to add members.
                </p>
              } @else {
                <div class="flex flex-wrap gap-1.5 bg-slate-50/70 border border-slate-200 p-2.5 rounded-lg max-h-28 overflow-y-auto thin-scroll">
                  @for (ssoId of selectedAdminIds(); track ssoId) {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2]">
                      <span>{{ nameOf(ssoId) }}</span>
                      <button
                        appButton
                        variant="ghost"
                        size="xs"
                        iconOnly
                        type="button"
                        (click)="removeAdminSelection(ssoId)"
                        title="Remove member"
                        aria-label="Remove member"
                      >
                        <app-icon name="close" size="xs" [stroke]="2.5" />
                      </button>
                    </span>
                  }
                </div>
              }
            </div>
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
  /** The backend's message when the last save was rejected. */
  readonly serverError = input('');
  /** True while the save request is running. */
  readonly saving = input(false);

  /** Emits the selected approver and member SSO IDs when "Save Committee" is clicked. */
  readonly save = output<{ approver?: string; members: string[] }>();
  readonly close = output<void>();

  readonly selectedApprover = linkedSignal<string>(() => this.scheme()?.committeeApprover || '');
  readonly selectedAdminIds = linkedSignal<string[]>(() =>
    this.scheme()?.committeeMembers ? [...this.scheme()!.committeeMembers!] : []
  );

  readonly submitted = linkedSignal<boolean>(() => {
    this.scheme();
    return false;
  });
  readonly errorMessage = linkedSignal<string>(() => {
    this.scheme();
    return '';
  });

  readonly isApproverDropdownOpen = linkedSignal<boolean>(() => {
    // Closes whenever the scheme changes
    this.scheme();
    return false;
  });
  readonly isMemberDropdownOpen = linkedSignal<boolean>(() => {
    this.scheme();
    return false;
  });

  readonly approverSearchQuery = linkedSignal<string>(() => {
    this.scheme();
    return '';
  });
  readonly memberSearchQuery = linkedSignal<string>(() => {
    this.scheme();
    return '';
  });

  readonly filteredApproverAdmins = computed(() =>
    filterAdmins(this.admins(), this.approverSearchQuery())
  );
  readonly filteredMemberAdmins = computed(() =>
    filterAdmins(this.admins(), this.memberSearchQuery())
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.approver-dropdown-container')) {
      this.isApproverDropdownOpen.set(false);
    }
    if (!target.closest('.member-dropdown-container')) {
      this.isMemberDropdownOpen.set(false);
    }
  }

  getAdmin(ssoId: string): CommitteeAdmin | undefined {
    return this.admins().find((a) => a.ssoId === ssoId);
  }

  /** Display name for a selected SSO ID. */
  nameOf(ssoId: string): string {
    return this.getAdmin(ssoId)?.name || ssoId;
  }

  toggleApproverDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isMemberDropdownOpen.set(false);
    this.isApproverDropdownOpen.update((v) => !v);
  }

  toggleMemberDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isApproverDropdownOpen.set(false);
    this.isMemberDropdownOpen.update((v) => !v);
  }

  selectApprover(name: string): void {
    this.selectedApprover.set(name);
    this.errorMessage.set('');
    this.isApproverDropdownOpen.set(false);
    this.approverSearchQuery.set('');
  }

  clearApprover(event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedApprover.set('');
  }

  isMemberSelected(name: string): boolean {
    return this.selectedAdminIds().includes(name);
  }

  toggleMemberSelection(name: string): void {
    this.errorMessage.set('');
    this.selectedAdminIds.update((current) => {
      if (current.includes(name)) {
        return current.filter((n) => n !== name);
      } else {
        return [...current, name];
      }
    });
  }

  removeAdminSelection(name: string): void {
    this.selectedAdminIds.update((current) => current.filter((n) => n !== name));
  }

  onSave(): void {
    if (this.saving()) return;
    this.submitted.set(true);
    if (!this.selectedApprover() && this.selectedAdminIds().length === 0) {
      this.errorMessage.set('Please select an Approver and at least one Committee Member.');
      return;
    }
    if (!this.selectedApprover()) {
      this.errorMessage.set('Please select an Approver.');
      return;
    }
    if (this.selectedAdminIds().length === 0) {
      this.errorMessage.set('Please select at least one Committee Member.');
      return;
    }
    this.errorMessage.set('');
    this.save.emit({
      approver: this.selectedApprover(),
      members: this.selectedAdminIds()
    });
  }
}
