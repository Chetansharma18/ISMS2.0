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
      maxWidthClass="max-w-[560px]"
      (primaryAction)="onSave()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (scheme(); as s) {
        <div class="mt-3 font-sans text-xs space-y-4">
          <!-- Scheme Info Header Banner -->
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

          <!-- 1. APPROVER DROPDOWN (SINGLE SELECT + SEARCHABLE) -->
          <div class="relative approver-dropdown-container">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-slate-700 font-semibold text-xs">
                Approver *
              </label>
              <span class="text-[10.5px] text-slate-400">Select 1 member</span>
            </div>

            <!-- Approver Dropdown Trigger Box -->
            <div class="relative">
              <button
                appButton
                variant="outline"
                block
                type="button"
                (click)="toggleApproverDropdown($event)"
                class="justify-between text-left"
              >
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  @if (selectedApprover()) {
                    <span class="font-semibold text-slate-800 text-xs truncate">{{ selectedApprover() }}</span>
                    @if (getAdminByName(selectedApprover()); as adm) {
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                        {{ adm.role }}
                      </span>
                    }
                  } @else {
                    <span class="text-slate-400 text-xs font-normal">Select approver...</span>
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
                      <app-icon name="close" size="sm" [stroke]="2" />
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
                  class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col font-sans"
                >
                  <!-- Search Bar -->
                  <div class="p-2 border-b border-slate-100 shrink-0 bg-slate-50/60 rounded-t-lg">
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
                      <app-icon name="search" size="sm" [stroke]="2" class="text-slate-400 absolute left-2.5 top-2.5" />
                      @if (approverSearchQuery()) {
                        <button
                          appButton
                          variant="ghost"
                          size="sm"
                          iconOnly
                          type="button"
                          (click)="approverSearchQuery.set('')"
                          class="absolute right-0.5 top-1/2 -translate-y-1/2"
                          aria-label="Clear search"
                        >
                          <app-icon name="close" size="sm" />
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Admins List (Single Selection) -->
                  <div class="max-h-52 overflow-y-auto p-1.5 space-y-1">
                    @for (adm of filteredApproverAdmins(); track adm.id) {
                      <button
                        appButton
                        [variant]="selectedApprover() === adm.name ? 'secondary' : 'ghost'"
                        block
                        type="button"
                        (click)="selectApprover(adm.name)"
                        class="justify-between text-left"
                      >
                        <div class="flex items-center gap-2.5 min-w-0 text-xs">
                          <!-- Radio Indicator -->
                          <div
                            class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                            [ngClass]="selectedApprover() === adm.name ? 'border-purple-600 bg-purple-600' : 'border-slate-300 bg-white'"
                          >
                            @if (selectedApprover() === adm.name) {
                              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                            }
                          </div>
                          <div class="flex flex-col min-w-0">
                            <span class="font-semibold text-slate-800 truncate">{{ adm.name }}</span>
                            <span class="text-[10px] text-slate-400 font-mono">{{ adm.ssoId }}</span>
                          </div>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0 ml-2">
                          {{ adm.role }}
                        </span>
                      </button>
                    }
                    @if (filteredApproverAdmins().length === 0) {
                      <div class="p-4 text-center text-xs text-slate-400 italic">
                        No members found matching "{{ approverSearchQuery() }}"
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- 2. MEMBERS DROPDOWN (MULTI SELECT + SEARCHABLE) -->
          <div class="relative member-dropdown-container">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-slate-700 font-semibold text-xs">
                Members *
              </label>
              <span class="text-[10.5px] text-slate-400">Multiple selection</span>
            </div>

            <!-- Members Dropdown Trigger Box -->
            <div class="relative">
              <button
                appButton
                variant="outline"
                block
                type="button"
                (click)="toggleMemberDropdown($event)"
                class="justify-between text-left"
              >
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  @if (selectedAdminIds().length === 0) {
                    <span class="text-slate-400 text-xs font-normal">Select committee members...</span>
                  } @else {
                    <span class="text-slate-800 text-xs font-semibold">
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
                  class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col font-sans"
                >
                  <!-- Search Bar -->
                  <div class="p-2 border-b border-slate-100 shrink-0 bg-slate-50/60 rounded-t-lg">
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
                      <app-icon name="search" size="sm" [stroke]="2" class="text-slate-400 absolute left-2.5 top-2.5" />
                      @if (memberSearchQuery()) {
                        <button
                          appButton
                          variant="ghost"
                          size="sm"
                          iconOnly
                          type="button"
                          (click)="memberSearchQuery.set('')"
                          class="absolute right-0.5 top-1/2 -translate-y-1/2"
                          aria-label="Clear search"
                        >
                          <app-icon name="close" size="sm" />
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Admins List (Multi Selection) -->
                  <div class="max-h-52 overflow-y-auto p-1.5 space-y-1">
                    @for (adm of filteredMemberAdmins(); track adm.id) {
                      <label
                        class="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-purple-50/70 cursor-pointer transition-colors text-xs select-none"
                        [ngClass]="{'bg-purple-50/50': isMemberSelected(adm.name)}"
                      >
                        <div class="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            [checked]="isMemberSelected(adm.name)"
                            (change)="toggleMemberSelection(adm.name)"
                            class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer accent-purple-600"
                          />
                          <div class="flex flex-col min-w-0">
                            <span class="font-semibold text-slate-800 truncate">{{ adm.name }}</span>
                            <span class="text-[10px] text-slate-400 font-mono">{{ adm.ssoId }}</span>
                          </div>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0 ml-2">
                          {{ adm.role }}
                        </span>
                      </label>
                    }
                    @if (filteredMemberAdmins().length === 0) {
                      <div class="p-4 text-center text-xs text-slate-400 italic">
                        No members found matching "{{ memberSearchQuery() }}"
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- 3. ASSIGNED MEMBERS SUMMARY -->
          <div class="pt-1 border-t border-slate-100 space-y-3">
            <!-- Approver Badge -->
            @if (selectedApprover()) {
              <div>
                <span class="block text-slate-500 font-semibold text-[11px] mb-1">
                  Assigned Approver
                </span>
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs">
                  <app-icon name="shield-check" size="sm" [stroke]="2.5" class="text-purple-600 shrink-0" />
                  <span class="font-semibold text-purple-900">{{ selectedApprover() }}</span>
                  @if (getAdminByName(selectedApprover()); as adm) {
                    <span class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-white text-purple-800 border border-purple-200">
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
                    class="ml-1"
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
              <div class="flex items-center justify-between mb-1">
                <span class="block text-slate-500 font-semibold text-[11px]">
                  Assigned Committee Members ({{ selectedAdminIds().length }})
                </span>
                @if (selectedAdminIds().length > 0) {
                  <button appButton variant="ghost" size="sm" type="button" (click)="selectedAdminIds.set([])">
                    Clear all
                  </button>
                }
              </div>

              @if (selectedAdminIds().length === 0) {
                <p class="text-[11.5px] text-slate-400 italic m-0 bg-slate-50 border border-dashed border-slate-200 p-2.5 rounded-md text-center">
                  No committee members selected yet. Use the Members dropdown above to add members.
                </p>
              } @else {
                <div class="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-md max-h-36 overflow-y-auto">
                  @for (name of selectedAdminIds(); track name) {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">
                      <span>{{ name }}</span>
                      <button
                        appButton
                        variant="ghost"
                        size="xs"
                        iconOnly
                        type="button"
                        (click)="removeAdminSelection(name)"
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

  /** Emits the selected approver and member names when "Save Committee" is clicked. */
  readonly save = output<{ approver?: string; members: string[] }>();
  readonly close = output<void>();

  readonly selectedApprover = linkedSignal<string>(() => this.scheme()?.committeeApprover || '');
  readonly selectedAdminIds = linkedSignal<string[]>(() =>
    this.scheme()?.committeeMembers ? [...this.scheme()!.committeeMembers!] : []
  );

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

  getAdminByName(name: string): CommitteeAdmin | undefined {
    return this.admins().find((a) => a.name === name);
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
    this.save.emit({
      approver: this.selectedApprover() || undefined,
      members: this.selectedAdminIds()
    });
  }
}
