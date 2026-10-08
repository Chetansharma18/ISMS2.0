import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { SchemeService } from './services/scheme.service';
import {
  PageHeaderComponent,
  TableComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';
import { SchemeDetailViewComponent } from './scheme-detail-view.component';

export interface SchemeTender {
  sNo: number;
  refNo: string;
  schemeName: string;
  schemeTitle?: string;
  schemeCategory: string;
  datePublished: string;
  closingDate: string;
  eoiCategory: string;
  eoiDescription: string;
  category?: string;
  code?: string;
  status?: 'Open' | 'Closed';
  rfpDocSize?: string;
  sopDocSize?: string;
  preBidDate?: string;
  techBidDate?: string;
  emdFee?: string;
  processFee?: string;
  attachedDocs?: EoiDocumentItem[];
  committeeMembers?: string[];
  createdAt?: number;
  isActive?: boolean;
  isFrozen?: boolean;
}

export interface EoiDocumentItem {
  sNo: number;
  name: string;
  size: string;
}

@Component({
  selector: 'app-tenders-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ActionModalComponent,
    SchemeDetailViewComponent
  ],
  template: `
    <div class="w-full min-h-full text-slate-800 font-sans" style="background-color: #ffffff; font-family: 'Inter', sans-serif;">
      
      <!-- ====================================================================
           VIEW 1: ACTIVE EOI TABLE (Using Reusable PageHeader & DataTable)
           ==================================================================== -->
      @if (!selectedScheme()) {
        <div class="p-4 sm:p-5 space-y-4 font-sans" style="background-color: #ffffff;">
          
          <!-- Themed Header Bar via Reusable PageHeaderComponent with Rajasthan Banner -->
          <app-page-header
            title="Active Schemes"
            [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Active Schemes' }]"
          >
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <!-- Integrated Search Bar (Matching User Screenshot) -->
              <div class="w-full sm:w-auto min-w-0 sm:min-w-[300px] md:min-w-[400px]">
                <div class="relative flex items-center bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden focus-within:border-[#174A6E] focus-within:ring-2 focus-within:ring-[#174A6E]/20 transition-all">
                  <input
                    type="text"
                    [ngModel]="searchQuery()"
                    (ngModelChange)="onSearchChange($event)"
                    placeholder="Search schemes by name, reference no. or keyword..."
                    class="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    class="px-3.5 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Search"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              @if (isSuperAdmin()) {
                <button
                  type="button"
                  (click)="openConfigureEoiModal()"
                  class="px-4 py-2.5 bg-[#174A6E] hover:bg-[#0B3558] text-white text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Configure New EOI</span>
                </button>
              }
            </div>
          </app-page-header>

          <!-- Schemes Table via Reusable TableComponent -->
          <app-table
            [columns]="schemeColumns()"
            [data]="filteredSchemes()"
            [pagination]="true"
            [pageSize]="pageSize"
            [rowClass]="getRowClass"
            (rowClick)="onRowClick($event)"
            itemUnit="schemes"
            [customTemplates]="{
              closingDate: closingDateTemplate,
              eoiDescription: descTemplate,
              viewAction: viewActionTemplate
            }"
          >
          </app-table>

          <!-- Custom Template for Closing Date (with prominent highlight for Closed / Expired schemes) -->
          <ng-template #closingDateTemplate let-item>
            @if (isSchemeClosed(item)) {
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs select-none"
                title="Application deadline has expired"
              >
                <span class="font-semibold text-rose-700">{{ item.closingDate }}</span>
                <span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-2xs leading-none">
                  Closed
                </span>
              </div>
            } @else {
              <span class="text-slate-800 font-medium text-[12.5px]">{{ item.closingDate }}</span>
            }
          </ng-template>

          <ng-template #descTemplate let-item>
            <span
              class="line-clamp-2 text-[11px] leading-relaxed"
              [ngClass]="isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-600'"
            >
              {{ item.eoiDescription }}
            </span>
          </ng-template>

          <ng-template #viewActionTemplate let-item>
            <div class="flex items-center justify-center gap-2 whitespace-nowrap">
              <button
                type="button"
                (click)="$event.stopPropagation(); viewSchemeDetails(item)"
                class="inline-flex items-center gap-1 text-[#0483AC] hover:text-[#03607E] font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
                title="View EOI Details"
              >
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </button>

              @if (isSuperAdmin()) {
                <div class="h-3.5 w-[1px] bg-slate-300 shrink-0"></div>

                <!-- Add Committee Button (Super Admin Only) -->
                <button
                  type="button"
                  (click)="$event.stopPropagation(); openAddCommitteeModal(item)"
                  class="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
                  title="Add / Manage Committee Members"
                >
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Add Committee</span>
                  @if (item.committeeMembers && item.committeeMembers.length > 0) {
                    <span class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                      {{ item.committeeMembers.length }}
                    </span>
                  }
                </button>

                <div class="h-3.5 w-[1px] bg-slate-300 shrink-0"></div>

                <button
                  type="button"
                  [disabled]="isEditDisabled(item) || item.isFrozen"
                  (click)="$event.stopPropagation(); (!isEditDisabled(item) && !item.isFrozen) ? editScheme(item) : null"
                  [ngClass]="(isEditDisabled(item) || item.isFrozen) ? 'text-slate-400 cursor-not-allowed' : 'text-amber-700 hover:text-amber-800 hover:underline cursor-pointer'"
                  class="inline-flex items-center gap-1 font-medium text-[12px] select-none transition-colors"
                  [title]="item.isFrozen ? 'Scheme is frozen' : (isEditDisabled(item) ? 'Edit is only available within 24 hours of creation' : 'Edit EOI Configuration')"
                >
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>

                <div class="h-3.5 w-[1px] bg-slate-300 shrink-0"></div>

                <!-- Active / Inactive Toggle -->
                <div
                  class="inline-flex items-center gap-1.5"
                  [title]="item.isFrozen ? 'Scheme is frozen' : 'Toggle Active/Inactive Status'"
                  (click)="$event.stopPropagation();"
                >
                  <button
                    type="button"
                    [disabled]="item.isFrozen"
                    (click)="!item.isFrozen ? toggleActiveStatus(item) : null"
                    class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    [ngClass]="item.isFrozen ? 'bg-slate-300 cursor-not-allowed' : (item.isActive === false ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-500 hover:bg-emerald-600')"
                    role="switch"
                    [attr.aria-checked]="item.isActive !== false"
                  >
                    <span class="sr-only">Toggle Active Status</span>
                    <span
                      class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      [ngClass]="item.isActive === false ? 'translate-x-0' : 'translate-x-3'"
                    ></span>
                  </button>
                  <span 
                    class="font-medium text-[12px] select-none transition-colors cursor-pointer"
                    (click)="!item.isFrozen ? toggleActiveStatus(item) : null"
                    [ngClass]="item.isFrozen ? 'text-slate-400 cursor-not-allowed' : (item.isActive === false ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700')"
                  >
                    {{ item.isActive === false ? 'Inactive' : 'Active' }}
                  </span>
                </div>

                <div class="h-3.5 w-[1px] bg-slate-300 shrink-0"></div>

                <!-- Freeze Button -->
                <button
                  type="button"
                  [disabled]="item.isFrozen"
                  (click)="$event.stopPropagation(); !item.isFrozen ? freezeScheme(item) : null"
                  [ngClass]="item.isFrozen ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer'"
                  class="inline-flex items-center gap-1 font-medium text-[12px] select-none transition-colors"
                  title="Freeze EOI Configuration"
                >
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{{ item.isFrozen ? 'Frozen' : 'Freeze' }}</span>
                </button>
              }
            </div>
          </ng-template>

        </div>
      }

      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS VIEW (Matching Screenshot 1 & 2)
           ==================================================================== -->
      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS VIEW (Tabular Layout matching Government eProcurement)
           ==================================================================== -->
      @if (selectedScheme(); as s) {
        <app-scheme-detail-view
          [scheme]="s"
          [rfpDocs]="rfpDocuments"
          [annexures]="annexureDocuments"
          [requiredInfo]="eoiRequiredInfo"
          [hideApplyButton]="isSuperAdmin()"
          (back)="backToList()"
          (apply)="handleApplyForScheme()"
          (download)="downloadDoc($event)"
        ></app-scheme-detail-view>
      }

      <!-- ====================================================================
           MODAL: ADD COMMITTEE MEMBERS
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showCommitteeModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="true"
        [showAccentBar]="true"
        accentBarClass="bg-purple-600"
        title="Add Committee Members"
        primaryLabel="Save Committee"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[540px]"
        (primaryAction)="saveCommittee()"
        (secondaryAction)="closeCommitteeModal()"
        (close)="closeCommitteeModal()"
      >
        @if (selectedSchemeForCommittee(); as s) {
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
                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-left flex items-center justify-between shadow-2xs hover:border-[#174A6E] focus:outline-none transition-colors"
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
                  <div class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto p-1.5 space-y-1">
                    @for (adm of availableAdmins; track adm.id) {
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

      <!-- ====================================================================
           MODAL: REUSABLE ONE-TIME REGISTRATION (OTR) POPUP PROMPT
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showOtrPromptModal()"
        [showCloseButton]="false"
        title="Complete Your Profile to Apply for EOI"
        description="To participate in RSLDC schemes and submit an Expression of Interest (EOI), please complete your One-Time Registration (OTR) and organization profile."
        primaryLabel="Complete Registration"
        secondaryLabel="Skip for Now"
        (primaryAction)="goToProfile()"
        (secondaryAction)="dismissOtrPrompt()"
        (close)="dismissOtrPrompt()"
      >
      </app-action-modal>

      <!-- ====================================================================
           MODAL: CONFIGURE NEW EOI
           ==================================================================== -->
      <!-- ====================================================================
           MODAL: CONFIGURE NEW EOI / EDIT EOI
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showConfigureEoiModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[650px]"
        (primaryAction)="submitNewEoi()"
        (secondaryAction)="closeConfigureEoiModal()"
        (close)="closeConfigureEoiModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          {{ editingSchemeRefNo() ? 'Edit EOI Configuration' : 'Configure New EOI' }}
        </h2>
        <div class="mt-4 font-sans text-[13px] max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1 sm:pr-3">
          <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] md:grid-cols-[200px_1fr] items-start sm:items-center gap-y-3 gap-x-4">
            <label class="text-slate-700 font-medium">EOI Reference No.*</label>
            <input type="text" maxlength="100" [(ngModel)]="newEoiData.refNo" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.refNo, 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.refNo)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800" />
            
            <label class="text-slate-700 font-medium">Scheme*</label>
            <select [(ngModel)]="newEoiData.scheme" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.scheme, 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.scheme)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white">
              <option value="MMKVY">MMKVY</option>
              <option value="RAJKVIK">RAJKVIK</option>
            </select>

            <label class="text-slate-700 font-medium">Scheme Category</label>
            <input type="text" value="ALL" disabled class="w-full px-2.5 py-1.5 border border-[#e2e8f0] bg-[#f8fafc] rounded text-slate-500" />

            <label class="text-slate-700 font-medium">Date of Eol Published*</label>
            <input type="date" [(ngModel)]="newEoiData.publishedDate" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.publishedDate, 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.publishedDate)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800" />

            <label class="text-slate-700 font-medium">Last Date of Eol Submission*</label>
            <input type="date" [(ngModel)]="newEoiData.submissionDate" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.submissionDate, 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.submissionDate)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800" />

            <label class="text-slate-700 font-medium">EOI Category*</label>
            <select [(ngModel)]="newEoiData.eoiCategory" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.eoiCategory, 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.eoiCategory)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white">
              <option value="General">General</option>
              <option value="Special">Special</option>
            </select>

            <label class="text-slate-700 font-medium">EOI Description</label>
            <input type="text" maxlength="100" [(ngModel)]="newEoiData.description" class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800" />

            <label class="text-slate-700 font-medium">EMD Fee*</label>
            <input type="text" maxlength="100" [(ngModel)]="newEoiData.emdFee" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.emdFee, 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.emdFee)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800" />

            <label class="text-slate-700 font-medium">Process Fee*</label>
            <input type="text" maxlength="100" [(ngModel)]="newEoiData.processFee" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.processFee, 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.processFee)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800" />

            <label class="text-slate-700 font-medium self-start pt-1">Attach File*</label>
            <div class="space-y-2 overflow-hidden w-full">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="openAttachmentModal()"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[#174A6E] text-[#174A6E] hover:bg-[#174A6E]/5 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <svg class="w-4 h-4 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>+ Attach Document</span>
                </button>
                <span class="text-[11px] text-slate-500 font-medium whitespace-nowrap">Under 25 mb</span>
                @if (newEoiSubmitted() && newEoiData.attachments.length === 0) {
                  <span class="text-xs text-red-500 font-medium">At least 1 attachment is required</span>
                }
              </div>

              <!-- List of added attachments -->
              @if (newEoiData.attachments.length > 0) {
                <div class="space-y-1.5 pt-1 max-w-full overflow-hidden">
                  @for (att of newEoiData.attachments; track att.id; let idx = $index) {
                    <div class="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs max-w-full overflow-hidden">
                      <div class="flex items-center gap-1.5 min-w-0 flex-1 pr-2 overflow-hidden">
                        <svg class="w-4 h-4 text-[#174A6E] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="font-medium text-slate-800 truncate shrink-0 max-w-[140px]" [title]="att.title">{{ att.title }}</span>
                        <span class="text-[11px] text-slate-500 truncate min-w-0">({{ att.fileName }})</span>
                      </div>
                      <button
                        type="button"
                        (click)="removeAttachment(idx)"
                        class="text-slate-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-1"
                        title="Remove attachment"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
            
            @if (fileError()) {
              <div class="col-span-1 sm:col-span-2 text-xs text-red-500 font-medium mt-[-4px]">{{ fileError() }}</div>
            }

            <!-- EOI Documents Section -->
            <div class="col-span-1 sm:col-span-2 mt-1 pt-2 border-t border-slate-200">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-[#0B3558] font-bold text-[13px] uppercase tracking-wide">EOI DOCUMENTS</h3>
                <button type="button" (click)="addEoiDocument()" class="w-6 h-6 rounded-full bg-[#174A6E] text-white flex items-center justify-center hover:bg-[#0B3558] transition-colors shadow-sm cursor-pointer" title="Add Document">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              @for (doc of newEoiData.documents; track $index) {
                <div class="flex items-center gap-3 mb-2">
                  <select [(ngModel)]="newEoiData.documents[$index]" [ngClass]="{'border-red-500': newEoiSubmitted() && !newEoiData.documents[$index], 'border-[#8FA3B6]': !(newEoiSubmitted() && !newEoiData.documents[$index])}" class="flex-1 px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800 bg-white shadow-sm">
                    <option value="">-- Select Document Required --</option>
                    @for (req of eoiRequiredInfo; track req.sNo) {
                      <option [value]="req.name">{{ req.name }}</option>
                    }
                  </select>
                  <button type="button" (click)="removeEoiDocument($index)" class="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer" title="Remove">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              }
              @if (newEoiData.documents.length === 0) {
                <div class="text-[12px] text-slate-500 italic py-3 text-center border border-dashed border-slate-300 rounded bg-slate-50/50">
                  No documents added. Click the + button to require a document.
                </div>
              }
            </div>
          </div>
        </div>
      </app-action-modal>

      <!-- ====================================================================
           MODAL: UPLOAD ATTACHMENT
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showAttachmentModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[500px]"
        (primaryAction)="submitAttachment()"
        (secondaryAction)="closeAttachmentModal()"
        (close)="closeAttachmentModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Upload Attachment
        </h2>
        <div class="mt-4 font-sans text-[13px] space-y-4">
          <div>
            <label class="block text-slate-700 font-medium mb-1">File Title*</label>
            <input type="text" maxlength="100" [(ngModel)]="attachmentFormData.title" [ngClass]="{'border-red-500': attachmentSubmitted() && !attachmentFormData.title, 'border-[#8FA3B6]': !(attachmentSubmitted() && !attachmentFormData.title)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-[#174A6E] text-slate-800" />
          </div>
          <div>
            <label class="block text-slate-700 font-medium mb-1">Upload Document*</label>
            <input type="file" accept=".pdf,.txt,.jpeg,.jpg,.png,.doc,.docx,.xls,.xlsx" (change)="onAttachmentFileSelected($event)" class="w-full text-slate-800 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#174A6E] file:text-white hover:file:bg-[#0B3558] cursor-pointer" />
            @if (attachmentSubmitted() && !attachmentFormData.file) {
              <div class="text-xs text-red-500 mt-1">Required</div>
            }
          </div>
          @if (attachmentFileError()) {
            <div class="text-xs text-red-500 font-medium">{{ attachmentFileError() }}</div>
          }
        </div>
      </app-action-modal>

      <!-- ====================================================================
           MODAL: UPLOAD CORRIGENDUM (OPTIONAL FOR EDIT EOI)
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showCorrigendumModal()"
        [showCloseButton]="true"
        [closeOnBackdrop]="false"
        [reverseButtons]="true"
        [showAccentBar]="false"
        primaryLabel="Submit"
        secondaryLabel="Cancel"
        maxWidthClass="max-w-[540px]"
        (primaryAction)="submitCorrigendumAndSave()"
        (secondaryAction)="closeCorrigendumModal()"
        (close)="closeCorrigendumModal()"
      >
        <h2 class="m-0 text-[#0B3558]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
          Upload Corrigendum (Optional)
        </h2>
        <div class="mt-4 space-y-4 font-sans text-[13px]">
          <div>
            <label class="block text-slate-700 font-medium mb-1">Corrigendum Title</label>
            <input
              type="text"
              maxlength="100"
              placeholder="e.g. Corrigendum-1: Extension of Submission Date"
              [(ngModel)]="corrigendumFormData.title"
              class="w-full px-2.5 py-1.5 border border-[#8FA3B6] rounded focus:outline-none focus:border-[#174A6E] text-slate-800"
            />
          </div>
          <div>
            <label class="block text-slate-700 font-medium mb-1">Upload Corrigendum Document</label>
            <input
              type="file"
              accept=".pdf,.txt,.jpeg,.jpg,.png,.doc,.docx,.xls,.xlsx"
              (change)="onCorrigendumFileSelected($event)"
              class="w-full text-slate-800 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#174A6E] file:text-white hover:file:bg-[#0B3558] cursor-pointer"
            />
          </div>
          @if (corrigendumFileError()) {
            <div class="text-xs text-red-500 font-medium">{{ corrigendumFileError() }}</div>
          }
        </div>
      </app-action-modal>

      <!-- ====================================================================
           MODAL: CONFIRM SUBMIT EOI
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showConfirmSubmitEoiModal()"
        [showCloseButton]="false"
        title="Confirm Submission"
        description="Are you sure you want to submit this EOI configuration?"
        primaryLabel="Yes, Submit"
        secondaryLabel="No, Cancel"
        (primaryAction)="confirmSubmitNewEoi()"
        (secondaryAction)="closeConfirmSubmitEoiModal()"
        (close)="closeConfirmSubmitEoiModal()"
      >
      </app-action-modal>

    </div>
  `
})
export class TendersPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private schemeService = inject(SchemeService);

  readonly currentUser = this.authService.currentUser;

  readonly isProfileIncomplete = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return user.role === 'new_user';
  });

  readonly isSuperAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'super_admin';
  });

  selectedScheme = signal<SchemeTender | null>(null);
  readonly showOtrPromptModal = signal<boolean>(false);
  readonly showConfigureEoiModal = signal<boolean>(false);
  readonly showConfirmSubmitEoiModal = signal<boolean>(false);
  readonly showCommitteeModal = signal<boolean>(false);
  readonly selectedSchemeForCommittee = signal<SchemeTender | null>(null);
  readonly selectedAdminIds = signal<string[]>([]);
  readonly isAdminDropdownOpen = signal<boolean>(false);

  readonly availableAdmins = this.schemeService.getAvailableAdmins();
  private promptDismissed = false;

  newEoiData = {
    refNo: '',
    scheme: 'MMKVY',
    publishedDate: '',
    submissionDate: '',
    eoiCategory: 'General',
    description: '',
    emdFee: '',
    processFee: '',
    attachments: [] as Array<{ id: string; title: string; fileName: string; size: string; file: File }>,
    documents: [] as string[]
  };
  newEoiSubmitted = signal<boolean>(false);
  fileError = signal<string>('');

  readonly showAttachmentModal = signal<boolean>(false);
  attachmentFormData = {
    title: '',
    file: null as File | null,
    fileName: ''
  };
  attachmentSubmitted = signal<boolean>(false);
  attachmentFileError = signal<string>('');

  readonly showCorrigendumModal = signal<boolean>(false);
  corrigendumFormData = {
    title: '',
    file: null as File | null,
    fileName: ''
  };
  corrigendumFileError = signal<string>('');
  private pendingEditScheme: SchemeTender | null = null;

  pageSize = 10;
  searchQuery = signal<string>('');

  readonly filteredSchemes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const all = this.schemes();
    if (!q) return all;
    return all.filter(s =>
      s.schemeName.toLowerCase().includes(q) ||
      s.refNo.toLowerCase().includes(q) ||
      s.eoiDescription.toLowerCase().includes(q) ||
      (s.schemeTitle && s.schemeTitle.toLowerCase().includes(q))
    );
  });

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  constructor() {
    this.schemeService.loadSchemes().subscribe();

    this.route.queryParams.subscribe(params => {
      const fromLogin = params['fromLogin'] === 'true';
      const promptOtr = params['promptOtr'] === 'true';
      if (fromLogin || promptOtr) {
        this.promptDismissed = false;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('isms_otr_prompt_dismissed');
        }
      }
      this.evaluateOtrModalPrompt();
    });

    effect(() => {
      // Re-evaluate whenever currentUser signal changes
      this.evaluateOtrModalPrompt();
    });
  }

  private evaluateOtrModalPrompt(): void {
    const user = this.currentUser();
    const isNewUser = user?.role === 'new_user';
    const isDismissed = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('isms_otr_prompt_dismissed') === 'true') || this.promptDismissed;

    // Show popup strictly for new_user role on their first visit / fresh login
    if (isNewUser && !isDismissed) {
      this.showOtrPromptModal.set(true);
    } else {
      this.showOtrPromptModal.set(false);
    }
  }

  dismissOtrPrompt(): void {
    this.showOtrPromptModal.set(false);
    this.promptDismissed = true;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('isms_otr_prompt_dismissed', 'true');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isms_eoi_prompt_shown_new_user', 'true');
    }
  }

  // Documents & requirements sourced from centralized mock/API store via SchemeService
  readonly rfpDocuments: EoiDocumentItem[] = this.schemeService.getRfpDocuments();
  readonly annexureDocuments: EoiDocumentItem[] = this.schemeService.getAnnexures();
  readonly eoiRequiredInfo = this.schemeService.getRequiredInfo();




  readonly schemeColumns = computed<TableColumn<SchemeTender>[]>(() => [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-20 min-w-[75px]' },
    {
      key: 'refNo',
      label: 'EOI Reference No.',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-800'}`
    },
    {
      key: 'schemeName',
      label: 'Scheme Name',
      cellClass: (_val, item) => `whitespace-nowrap font-medium ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-800'}`
    },
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      align: 'center',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-700'}`
    },
    {
      key: 'datePublished',
      label: 'Date of EOI Published',
      align: 'center',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-700'}`
    },
    {
      key: 'closingDate',
      label: 'Date of Closing',
      align: 'center',
      type: 'custom',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'eoiCategory',
      label: 'EOI Category',
      align: 'center',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-700'}`
    },
    {
      key: 'viewAction',
      label: 'Action',
      align: 'center',
      width: this.isSuperAdmin() ? 'min-w-[280px]' : 'min-w-[100px]',
      type: 'custom'
    }
  ]);

  isSchemeClosed(scheme: SchemeTender | null | undefined): boolean {
    if (!scheme) return false;
    if (scheme.status === 'Closed') return true;
    if (!scheme.closingDate) return false;

    const parts = scheme.closingDate.includes('/')
      ? scheme.closingDate.split('/')
      : scheme.closingDate.split('-');

    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const closeDate = new Date(year, month, day, 23, 59, 59);
      if (!isNaN(closeDate.getTime())) {
        return closeDate.getTime() < Date.now();
      }
    }
    return false;
  }

  getRowClass = (item: SchemeTender): string => {
    if (this.isSchemeClosed(item)) {
      return 'opacity-65 bg-white cursor-pointer hover:bg-slate-50 transition-colors';
    }
    return 'bg-white cursor-pointer hover:bg-slate-100/90 transition-colors';
  };

  onRowClick(scheme: SchemeTender): void {
    this.viewSchemeDetails(scheme);
  }

  // Schemes reactive state managed via SchemeService (connected to central Mock/API engine)
  readonly schemes = this.schemeService.schemes;

  viewSchemeDetails(scheme: SchemeTender): void {
    this.selectedScheme.set(scheme);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readonly Math = Math;


  backToList(): void {
    this.selectedScheme.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleApplyForScheme(): void {
    // Check if profile is incomplete
    if (this.isProfileIncomplete()) {
      this.showOtrPromptModal.set(true);
      return;
    }

    // Direct navigation to scheme proposal form without showing the registration preview modal
    const scheme = this.selectedScheme();
    this.router.navigate(['/scheme-form'], {
      queryParams: {
        refNo: scheme?.refNo || 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
        title: scheme?.schemeTitle || scheme?.schemeName || 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
        schemeName: scheme?.schemeName || 'MMKVY',
        category: scheme?.schemeCategory || scheme?.category || 'ALL',
        eoiCategory: scheme?.eoiCategory || 'General',
        datePublished: scheme?.datePublished || '15/09/2026',
        closingDate: scheme?.closingDate || '30/11/2026',
        emdFee: scheme?.emdFee || '₹50,000',
        processFee: scheme?.processFee || '₹2,000',
        eoiDescription: scheme?.eoiDescription || 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
      }
    });
  }

  goToProfile(): void {
    this.dismissOtrPrompt();
    this.router.navigate(['/profile']);
  }

  goToRegistration(): void {
    this.goToProfile();
  }

  downloadDoc(docType: string): void {
    const s = this.selectedScheme();
    console.log(`Downloading ${docType} for ${s?.schemeTitle || s?.schemeName} (${s?.refNo})`);
  }

  getSchemeDescription(scheme: SchemeTender | null): string {
    if (!scheme) return '';
    if (scheme.eoiDescription) return scheme.eoiDescription;
    return `Expression of Interest for Empanelment of Training Providers / PIAs to implement state skill development initiatives under ${scheme.schemeTitle || scheme.schemeName}.`;
  }

  editingSchemeRefNo = signal<string | null>(null);

  openConfigureEoiModal(): void {
    this.editingSchemeRefNo.set(null);
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
    this.newEoiData = {
      refNo: '',
      scheme: 'MMKVY',
      publishedDate: '',
      submissionDate: '',
      eoiCategory: 'General',
      description: '',
      emdFee: '',
      processFee: '',
      attachments: [],
      documents: []
    };
    this.showConfigureEoiModal.set(true);
  }

  editScheme(scheme: SchemeTender): void {
    this.editingSchemeRefNo.set(scheme.refNo);
    this.newEoiSubmitted.set(false);
    this.fileError.set('');
    
    const parseDate = (dStr?: string) => {
      if (!dStr) return '';
      const parts = dStr.includes('/') ? dStr.split('/') : dStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return dStr;
    };

    const initialDocs: EoiDocumentItem[] = scheme.attachedDocs || [
      { sNo: 1, name: 'Request for Proposal (RFP)', size: scheme.rfpDocSize || '2.4 MB' },
      { sNo: 2, name: 'Standard Operating Procedure (SOP) for Training Partners', size: scheme.sopDocSize || '1.8 MB' }
    ];

    this.newEoiData = {
      refNo: scheme.refNo,
      scheme: scheme.schemeName,
      publishedDate: parseDate(scheme.datePublished),
      submissionDate: parseDate(scheme.closingDate),
      eoiCategory: scheme.eoiCategory || 'General',
      description: scheme.eoiDescription || '',
      emdFee: scheme.emdFee || '',
      processFee: scheme.processFee || '',
      attachments: initialDocs.map((doc, i) => ({
        id: 'att_' + i + '_' + Date.now(),
        title: doc.name,
        fileName: doc.name.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.pdf',
        size: doc.size,
        file: new File([], doc.name)
      })),
      documents: []
    };
    this.showConfigureEoiModal.set(true);
  }

  isEditDisabled(scheme: SchemeTender): boolean {
    if (!scheme.createdAt) return false;
    const _24HOURS_IN_MS = 24 * 60 * 60 * 1000;
    return (Date.now() - scheme.createdAt) > _24HOURS_IN_MS;
  }

  toggleActiveStatus(scheme: SchemeTender): void {
    if (!this.isSuperAdmin() || scheme.isFrozen) return;
    scheme.isActive = scheme.isActive === false ? true : false;
    this.schemeService.updateScheme(scheme.refNo, scheme).subscribe();
  }

  freezeScheme(scheme: SchemeTender): void {
    if (!this.isSuperAdmin() || scheme.isFrozen) return;
    if (confirm(`Are you sure you want to freeze "${scheme.schemeName}"? This action cannot be undone.`)) {
      scheme.isFrozen = true;
      this.schemeService.updateScheme(scheme.refNo, scheme).subscribe();
    }
  }

  openAddCommitteeModal(scheme: SchemeTender): void {
    if (!this.isSuperAdmin()) return;
    this.selectedSchemeForCommittee.set(scheme);
    this.selectedAdminIds.set(scheme.committeeMembers ? [...scheme.committeeMembers] : []);
    this.isAdminDropdownOpen.set(false);
    this.showCommitteeModal.set(true);
  }

  closeCommitteeModal(): void {
    this.showCommitteeModal.set(false);
    this.isAdminDropdownOpen.set(false);
    this.selectedSchemeForCommittee.set(null);
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

  saveCommittee(): void {
    const scheme = this.selectedSchemeForCommittee();
    if (!scheme) return;

    const members = [...this.selectedAdminIds()];
    this.schemeService.assignCommittee(scheme.refNo, members).subscribe();
    this.closeCommitteeModal();
  }

  closeConfigureEoiModal(): void {
    this.showConfigureEoiModal.set(false);
  }

  addEoiDocument(): void {
    this.newEoiData.documents.push('');
  }

  removeEoiDocument(index: number): void {
    this.newEoiData.documents.splice(index, 1);
  }

  onAttachmentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validExtensions = ['pdf', 'txt', 'jpeg', 'jpg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (!validExtensions.includes(fileExt)) {
        this.attachmentFileError.set('Invalid file type. Supported: PDF, TXT, JPEG, PNG, WORD, EXCEL.');
        this.attachmentFormData.file = null;
        this.attachmentFormData.fileName = '';
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        this.attachmentFileError.set('File size exceeds the 25MB limit.');
        this.attachmentFormData.file = null;
        this.attachmentFormData.fileName = '';
        return;
      }

      this.attachmentFileError.set('');
      this.attachmentFormData.file = file;
      this.attachmentFormData.fileName = file.name;
    } else {
      this.attachmentFormData.file = null;
      this.attachmentFormData.fileName = '';
    }
  }

  submitAttachment(): void {
    this.attachmentSubmitted.set(true);
    if (!this.attachmentFormData.title || !this.attachmentFormData.file) {
      return; // Invalid
    }

    const file = this.attachmentFormData.file;
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const newAtt = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      title: this.attachmentFormData.title,
      fileName: file.name,
      size: formatBytes(file.size),
      file: file
    };

    this.newEoiData.attachments.push(newAtt);
    this.showAttachmentModal.set(false);
  }

  removeAttachment(index: number): void {
    this.newEoiData.attachments.splice(index, 1);
  }

  openAttachmentModal(): void {
    this.attachmentSubmitted.set(false);
    this.attachmentFileError.set('');
    this.attachmentFormData = { title: '', file: null, fileName: '' };
    this.showAttachmentModal.set(true);
  }

  closeAttachmentModal(): void {
    this.showAttachmentModal.set(false);
  }

  onCorrigendumFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validExtensions = ['pdf', 'txt', 'jpeg', 'jpg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (!validExtensions.includes(fileExt)) {
        this.corrigendumFileError.set('Invalid file type. Supported: PDF, TXT, JPEG, PNG, WORD, EXCEL.');
        this.corrigendumFormData.file = null;
        this.corrigendumFormData.fileName = '';
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        this.corrigendumFileError.set('File size exceeds the 25MB limit.');
        this.corrigendumFormData.file = null;
        this.corrigendumFormData.fileName = '';
        return;
      }

      this.corrigendumFileError.set('');
      this.corrigendumFormData.file = file;
      this.corrigendumFormData.fileName = file.name;
    } else {
      this.corrigendumFormData.file = null;
      this.corrigendumFormData.fileName = '';
    }
  }

  submitCorrigendumAndSave(): void {
    if (!this.pendingEditScheme) return;
    
    const targetScheme = { ...this.pendingEditScheme };
    if (this.corrigendumFormData.file) {
      const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
      };

      const rawTitle = this.corrigendumFormData.title.trim() || 'Corrigendum Document';
      const file = this.corrigendumFormData.file;
      const docTitle = rawTitle.toLowerCase().startsWith('corrigendum') ? rawTitle : `Corrigendum: ${rawTitle}`;

      const corrigendumDoc: EoiDocumentItem = {
        sNo: (targetScheme.attachedDocs?.length || 0) + 1,
        name: docTitle,
        size: formatBytes(file.size)
      };

      targetScheme.attachedDocs = [...(targetScheme.attachedDocs || []), corrigendumDoc];
    }

    const targetRef = this.editingSchemeRefNo();
    if (targetRef) {
      this.schemeService.updateScheme(targetRef, targetScheme).subscribe();
    }

    this.pendingEditScheme = null;
    this.showCorrigendumModal.set(false);
  }

  closeCorrigendumModal(): void {
    this.pendingEditScheme = null;
    this.showCorrigendumModal.set(false);
  }

  submitNewEoi(): void {
    this.newEoiSubmitted.set(true);
    
    // Validate mandatory fields
    const d = this.newEoiData;
    if (!d.refNo || !d.scheme || !d.publishedDate || !d.submissionDate || !d.eoiCategory || !d.emdFee || !d.processFee || d.attachments.length === 0) {
      return; // Invalid, fields will turn red / show required error
    }
    
    // Validate that if there are any required documents added, they are actually selected
    if (d.documents.some(doc => !doc)) {
      return; 
    }

    this.showConfirmSubmitEoiModal.set(true);
  }

  confirmSubmitNewEoi(): void {
    const d = this.newEoiData;
    const formatDt = (dt: string) => dt ? dt.split('-').reverse().join('/') : '';
    const attachedDocsList: EoiDocumentItem[] = d.attachments.map((att, idx) => ({
      sNo: idx + 1,
      name: att.title,
      size: att.size
    }));

    const targetRef = this.editingSchemeRefNo();
    const existingScheme = targetRef ? this.schemes().find(s => s.refNo === targetRef) : null;

    const newScheme: SchemeTender = {
      ...(existingScheme || {}),
      sNo: existingScheme ? existingScheme.sNo : 1,
      refNo: d.refNo,
      schemeName: d.scheme,
      schemeTitle: d.scheme,
      schemeCategory: 'ALL',
      category: 'ALL',
      datePublished: formatDt(d.publishedDate),
      closingDate: formatDt(d.submissionDate),
      eoiCategory: d.eoiCategory,
      eoiDescription: d.description || '',
      status: 'Open',
      emdFee: d.emdFee,
      processFee: d.processFee,
      attachedDocs: attachedDocsList,
      createdAt: existingScheme ? existingScheme.createdAt : Date.now(),
      isActive: existingScheme ? existingScheme.isActive : true,
      isFrozen: existingScheme ? existingScheme.isFrozen : false
    };
    if (targetRef) {
      // Edit mode: save updated scheme object into pendingEditScheme & open optional Corrigendum modal
      this.pendingEditScheme = newScheme;
      this.corrigendumFormData = { title: '', file: null, fileName: '' };
      this.corrigendumFileError.set('');
      this.showConfigureEoiModal.set(false);
      this.showCorrigendumModal.set(true);
    } else {
      // New EOI mode: save directly via SchemeService
      this.schemeService.createScheme(newScheme).subscribe();
      this.showConfigureEoiModal.set(false);
    }
    
    this.showConfirmSubmitEoiModal.set(false);
  }

  closeConfirmSubmitEoiModal(): void {
    this.showConfirmSubmitEoiModal.set(false);
  }
}

