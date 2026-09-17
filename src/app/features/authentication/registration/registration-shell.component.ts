import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiStateService } from '../../../core/services/eoi-state.service';
import { TpPiaRegistrationService } from './services/tp-pia-registration.service';
import { FormValidationService } from './services/form-validation.service';
import { TabOrgDetailsComponent } from './components/tab-org-details/tab-org-details.component';
import { TabAuthorizedOrgComponent } from './components/tab-authorized-org/tab-authorized-org.component';
import { TabBankDetailsComponent } from './components/tab-bank-details/tab-bank-details.component';
import { TabDocumentsComponent } from './components/tab-documents/tab-documents.component';

export interface TabItem {
  id: number;
  label: string;
  shortLabel: string;
  icon: string;
}

@Component({
  selector: 'app-registration-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TpPiaRegistrationService, FormValidationService],
  imports: [
    CommonModule,
    FormsModule,
    TabOrgDetailsComponent,
    TabAuthorizedOrgComponent,
    TabBankDetailsComponent,
    TabDocumentsComponent,
  ],
  template: `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans text-sm relative">
      <div>
        <!-- Government of Rajasthan Official Header matching ISMS Portal Theme -->
        <header class="w-full bg-[#f0f6fc] border-b border-slate-200/90 font-['Poppins',sans-serif] shadow-2xs select-none">
          <div class="max-w-[1400px] mx-auto py-2 sm:py-2.5 lg:py-3 px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
            
            <!-- Left Branding Group: Emblems + Divider + ISMS 2.0 -->
            <div class="flex items-center gap-1.5 sm:gap-3.5 lg:gap-4 min-w-0 cursor-pointer" routerLink="/">
              <!-- Official Ashoka Lion Capital (State Emblem of India) -->
              <div class="flex-shrink-0 flex items-center justify-center">
                <img src="Rajasthan-Sarkar.png" alt="Government of Rajasthan" class="h-9 sm:h-[52px] lg:h-[60px] w-auto object-contain select-none" />
              </div>
              <!-- Official RSLDC Circular Emblem -->
              <div class="flex-shrink-0 flex items-center justify-center">
                <img src="rsldc-logo.png" alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)" class="h-9 w-9 sm:h-[52px] sm:w-[52px] lg:h-[60px] lg:w-[60px] object-contain select-none drop-shadow-2xs" />
              </div>

              <!-- Thin Vertical Divider Line -->
              <div class="h-7 sm:h-10 lg:h-11 w-[1.5px] bg-slate-300 mx-0.5 sm:mx-2 lg:mx-2.5 shrink-0"></div>

              <!-- System Branding: ISMS in Navy, 2.0 in Orange/Amber -->
              <div class="flex text-left flex-col justify-center shrink-0">
                <div class="flex items-baseline leading-none">
                  <span class="text-lg sm:text-2xl lg:text-[27px] font-extrabold text-[#092244] tracking-tight">ISMS</span>
                  <span class="text-lg sm:text-2xl lg:text-[27px] font-extrabold text-[#f59e0b] ml-1">2.0</span>
                </div>
                <div class="hidden sm:block text-[10.5px] sm:text-[11.5px] lg:text-[12px] text-slate-600 font-medium tracking-tight mt-0.5 sm:mt-1">
                  Integrated Scheme Management System · One-Time Registration (OTR)
                </div>
              </div>
            </div>

            <!-- Right: Skip to Citizen Portal Button -->
            <div class="flex items-center shrink-0">
              <button
                type="button"
                (click)="skipToPortal()"
                class="px-2.5 py-1 sm:px-4 sm:py-2 bg-[#002244] hover:bg-[#001730] text-white text-[11px] sm:text-sm font-bold rounded-lg shadow-xs tracking-tight transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap"
                title="Skip registration and continue as citizen">
                <span>Skip → Citizen<span class="hidden sm:inline"> Portal</span></span>
              </button>
            </div>
          </div>
        </header>

        <!-- Connected Stepper Bar -->
        <nav class="bg-white border-b border-slate-200 shadow-2xs">
          <div class="w-full px-2.5 sm:px-5 lg:px-8 py-2 sm:py-2.5">
            <div class="flex items-center justify-start md:justify-between overflow-x-auto no-scrollbar scroll-smooth gap-1 sm:gap-2 w-full pb-0.5">
              @for (tab of tabs; track tab.id; let idx = $index; let last = $last) {
                <button
                  type="button"
                  [id]="'step-btn-' + tab.id"
                  (click)="switchTab(tab.id)"
                  class="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer text-left group focus:outline-none py-1 px-1.5 sm:px-2 rounded-lg hover:bg-slate-50 transition"
                  [attr.aria-label]="tab.label"
                >
                  <!-- Step Circle -->
                  <div
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition"
                    [ngClass]="activeTab() === tab.id
                      ? 'bg-[#131A4D] text-white shadow-xs'
                      : tabStatuses()[tab.id].isCompleted
                        ? 'bg-emerald-600 text-white'
                        : tabStatuses()[tab.id].isSubmittedInvalid
                          ? 'bg-rose-500 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-slate-400'"
                  >
                    @if (activeTab() === tab.id) {
                      {{ tab.id }}
                    } @else if (tabStatuses()[tab.id].isCompleted) {
                      ✓
                    } @else if (tabStatuses()[tab.id].isSubmittedInvalid) {
                      !
                    } @else {
                      {{ tab.id }}
                    }
                  </div>

                  <!-- Step Label -->
                  <div>
                    <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
                      STEP {{ tab.id }}
                    </div>
                    <div
                      class="text-[11px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition leading-tight"
                      [ngClass]="activeTab() === tab.id ? 'text-[#131A4D] font-bold' : 'text-slate-700 group-hover:text-slate-900'"
                    >
                      <span class="inline md:hidden">{{ tab.shortLabel }}</span>
                      <span class="hidden md:inline">{{ tab.label }}</span>
                    </div>
                  </div>
                </button>

                <!-- Connector Line -->
                @if (!last) {
                  <div class="h-0.5 bg-slate-200 flex-1 min-w-[8px] sm:min-w-[12px] mx-0.5 sm:mx-1 shrink-0"></div>
                }
              }
            </div>
          </div>
        </nav>

        <!-- Main Form Container -->
        <main class="w-full px-3 sm:px-6 lg:px-8 mt-4 sm:mt-5 pb-24 sm:pb-28">
          <!-- Step Title Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-3.5 mb-4 sm:mb-5 border-b border-slate-200 gap-2">
            <div>
              <h2 class="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {{ currentStepInfo.title }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                {{ currentStepInfo.subtitle }}
              </p>
            </div>
            <div class="self-start sm:self-center shrink-0 flex items-center gap-2">
              <button
                type="button"
                (click)="openPreviewModal()"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition cursor-pointer shadow-2xs"
              >
                <svg class="w-3.5 h-3.5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview</span>
              </button>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                Step {{ activeTab() }} of {{ tabs.length }}
              </span>
            </div>
          </div>

          <!-- Active Step Component -->
          <div class="w-full">
            <div [class.hidden]="activeTab() !== 1">
              <app-tab-org-details />
            </div>
            <div [class.hidden]="activeTab() !== 2">
              <app-tab-authorized-org />
            </div>
            <div [class.hidden]="activeTab() !== 3">
              <app-tab-bank-details />
            </div>
            <div [class.hidden]="activeTab() !== 4">
              <app-tab-documents />
            </div>
          </div>
        </main>
      </div>

      <!-- Fixed Bottom Action Bar -->
      <footer class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] py-2 sm:py-2.5 will-change-transform">
        <div class="w-full px-2.5 sm:px-6 lg:px-8 pr-12 sm:pr-6 flex items-center justify-between gap-1.5 sm:gap-3">
          <!-- Left: Reset + Progress -->
          <div class="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              (click)="resetFormWithConfirm()"
              class="h-9 px-2.5 sm:px-3.5 rounded-full border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
            >
              <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden sm:inline">Reset Form</span>
              <span class="sm:hidden">Reset</span>
            </button>

            <div class="h-4 sm:h-5 w-px bg-slate-200"></div>

            <div class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
              <span class="font-bold text-slate-800">
                <span class="sm:hidden">Step </span><span class="hidden sm:inline">Tab </span>{{ activeTab() }}/4
              </span>
            </div>
          </div>

          <!-- Right: Nav Buttons -->
          <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <!-- Save Draft -->
            <button
              type="button"
              (click)="saveDraft()"
              class="h-9 px-2.5 sm:px-4 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span class="hidden sm:inline">Save Draft</span>
            </button>

            <!-- Prev -->
            @if (activeTab() > 1) {
              <button
                type="button"
                (click)="prevTab()"
                class="h-9 px-3 sm:px-4 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1 transition cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="hidden sm:inline">Previous</span>
              </button>
            }

            <!-- Next / Submit -->
            @if (activeTab() < 4) {
              <button
                type="button"
                (click)="nextTab()"
                class="h-9 px-3.5 sm:px-5 rounded-full bg-[#131A4D] hover:bg-[#1D246B] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span>Next</span>
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            } @else {
              <button
                type="button"
                (click)="openReviewModal()"
                class="h-9 px-3.5 sm:px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Review &amp; Submit</span>
              </button>
            }
          </div>
        </div>
      </footer>

      <!-- Toast Notification -->
      @if (valService.toastMessage()) {
        <div
          class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold max-w-sm w-full mx-2 sm:mx-0 will-change-transform"
          [ngClass]="valService.toastMessage()?.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (valService.toastMessage()?.type === 'success') {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            }
          </svg>
          <span>{{ valService.toastMessage()?.text }}</span>
        </div>
      }

      <!-- Preview / Review Modal -->
      @if (showReviewModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 class="text-base sm:text-lg font-bold text-slate-900">Application Review</h3>
              <button type="button" (click)="showReviewModal.set(false)" class="text-slate-400 hover:text-slate-700 transition cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div class="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Organisation</div>
                <div class="grid grid-cols-2 gap-y-1.5 gap-x-3">
                  <span class="text-slate-500">Full Name</span>
                  <span class="font-semibold text-slate-800 break-words">{{ data.basicInfo.fullName || '—' }}</span>
                  <span class="text-slate-500">Registration No.</span>
                  <span class="font-mono text-slate-800">{{ data.basicInfo.registrationNumber || '—' }}</span>
                  <span class="text-slate-500">PAN</span>
                  <span class="font-mono text-slate-800 uppercase">{{ data.basicInfo.panNo || '—' }}</span>
                  <span class="text-slate-500">GST No.</span>
                  <span class="font-mono text-slate-800 uppercase">{{ data.basicInfo.gstNo || '—' }}</span>
                  <span class="text-slate-500">Email</span>
                  <span class="text-slate-800 break-words">{{ data.basicInfo.emailId || '—' }}</span>
                  <span class="text-slate-500">Contact</span>
                  <span class="text-slate-800">{{ data.basicInfo.contactNo || '—' }}</span>
                </div>
              </div>

              <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div class="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Bank Details</div>
                <div class="grid grid-cols-2 gap-y-1.5 gap-x-3">
                  <span class="text-slate-500">Bank Name</span>
                  <span class="text-slate-800">{{ data.bankDetails.bankName || '—' }}</span>
                  <span class="text-slate-500">Account No.</span>
                  <span class="font-mono text-slate-800">{{ data.bankDetails.accountNo || '—' }}</span>
                  <span class="text-slate-500">IFSC Code</span>
                  <span class="font-mono text-slate-800 uppercase">{{ data.bankDetails.ifscCode || '—' }}</span>
                </div>
              </div>

              <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div class="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Documents</div>
                <div class="space-y-1.5">
                  @for (doc of data.documents; track doc.id) {
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600 truncate pr-2">{{ doc.label }}</span>
                      <span class="text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-full"
                        [ngClass]="doc.status === 'uploaded' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                        {{ doc.status === 'uploaded' ? '✓ Uploaded' : 'Pending' }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Declaration -->
              <div class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <input type="checkbox" id="declaration" [(ngModel)]="declarationAgreed" class="mt-0.5 accent-[#131A4D] shrink-0 w-4 h-4 cursor-pointer" />
                <label for="declaration" class="text-xs text-amber-900 cursor-pointer leading-relaxed">
                  I hereby certify that the information provided is true, accurate, and complete. I understand that any false declaration may disqualify the application.
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 px-5 sm:px-6 pb-5 pt-2 border-t border-slate-200">
              <button
                type="button"
                (click)="confirmSubmit()"
                [disabled]="!declarationAgreed"
                class="flex-1 h-10 px-5 rounded-full font-bold text-sm transition cursor-pointer"
                [ngClass]="declarationAgreed ? 'bg-[#131A4D] hover:bg-[#1D246B] text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
              >
                Confirm &amp; Submit Registration
              </button>
              <button
                type="button"
                (click)="showReviewModal.set(false)"
                class="flex-1 h-10 px-5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-full font-semibold transition cursor-pointer text-xs sm:text-sm"
              >
                Edit Application
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Success Modal -->
      @if (showSuccessModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center px-6 py-8">
            <div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-1">Registration Submitted!</h3>
            <p class="text-sm text-slate-500 mb-1">Your TP/PIA profile has been registered successfully.</p>
            <p class="text-xs text-slate-400 mb-6">You will be redirected to the portal shortly.</p>
            <button
              type="button"
              (click)="goToPortal()"
              class="w-full h-10 bg-[#131A4D] hover:bg-[#1D246B] text-white rounded-full font-bold text-sm transition cursor-pointer mb-2"
            >
              Go to Portal →
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class RegistrationShellComponent implements OnInit {
  readonly service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);
  readonly eoiService = inject(EoiStateService);
  readonly router = inject(Router);

  readonly activeTab = signal<number>(1);
  readonly showReviewModal = signal<boolean>(false);
  readonly showSuccessModal = signal<boolean>(false);
  declarationAgreed: boolean = false;
  currentSsoId: string = 'new_user_rj';

  readonly tabs: TabItem[] = [
    { id: 1, label: 'Organisation Details', shortLabel: 'Organisation', icon: '🏢' },
    { id: 2, label: 'Auth Person (Org)', shortLabel: 'Auth (Org)', icon: '✍️' },
    { id: 3, label: 'Bank Details', shortLabel: 'Bank Details', icon: '🏦' },
    { id: 4, label: 'Document Upload', shortLabel: 'Documents', icon: '📁' },
  ];

  ngOnInit(): void {
    const p = this.eoiService.getProfile();
    this.currentSsoId = p.ssoId || 'new_user_rj';
  }

  get currentStepInfo(): { title: string; subtitle: string } {
    switch (this.activeTab()) {
      case 1: return { title: 'Step 1: Organisation / Company Basic Details', subtitle: 'Primary profile, legal constitution, address records, and workflow authority' };
      case 2: return { title: 'Step 2: Authorized Person Details (Organisation Level)', subtitle: 'Statutory corporate signatory, identity proofs, and legal credentials' };
      case 3: return { title: 'Step 3: Bank Details', subtitle: 'PFMS / DBT disbursal dedicated bank account, transfer mode, and verification records' };
      case 4: return { title: 'Step 4: Document Upload', subtitle: 'Mandatory statutory compliance documents, registration certificate, PAN, GST, and affidavits' };
      default: return { title: `Step ${this.activeTab()}`, subtitle: 'Application form details' };
    }
  }

  get data() { return this.service.formData(); }

  readonly tabStatuses = computed(() => {
    const data = this.service.formData();
    const submitted = this.valService.submittedTabs();
    const completed = this.valService.completedTabs();
    const map: Record<number, { isCompleted: boolean; isSubmittedInvalid: boolean }> = {};
    for (let id = 1; id <= 4; id++) {
      const isValid = this.valService.isTabValid(id, data);
      map[id] = {
        isCompleted: completed.has(id) && isValid,
        isSubmittedInvalid: submitted.has(id) && !isValid,
      };
    }
    return map;
  });

  private scrollStepIntoView(tabId: number) {
    if (typeof document !== 'undefined') {
      requestAnimationFrame(() => {
        const el = document.getElementById(`step-btn-${tabId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    }
  }

  switchTab(tabId: number) {
    const current = this.activeTab();
    if (this.valService.isTabValid(current, this.data)) {
      this.valService.markTabCompleted(current);
    }
    this.activeTab.set(tabId);
    this.valService.clearToast();
    this.scrollStepIntoView(tabId);
  }

  nextTab() {
    const current = this.activeTab();
    this.valService.markTabSubmitted(current);
    if (!this.valService.isTabValid(current, this.data)) {
      const tabName = this.tabs[current - 1]?.label || `Tab ${current}`;
      this.valService.showToast(`Please fill all required fields correctly in "${tabName}" before proceeding.`);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    this.valService.markTabCompleted(current);
    this.valService.clearToast();
    if (current < 4) {
      const nextId = current + 1;
      this.activeTab.set(nextId);
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.scrollStepIntoView(nextId);
    }
  }

  prevTab() {
    if (this.activeTab() > 1) {
      const prevId = this.activeTab() - 1;
      this.activeTab.set(prevId);
      this.valService.clearToast();
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.scrollStepIntoView(prevId);
    }
  }

  saveDraft() {
    this.service.saveDraft();
    const current = this.activeTab();
    if (this.valService.isTabValid(current, this.data)) {
      this.valService.markTabCompleted(current);
    }
    this.valService.showToast('Draft progress saved successfully.', 'success');
  }

  resetFormWithConfirm() {
    if (confirm('Are you sure you want to reset all fields? All unsaved data will be cleared.')) {
      this.service.resetForm();
      this.valService.resetSubmitted();
      this.valService.clearToast();
      this.activeTab.set(1);
    }
  }

  openPreviewModal() {
    this.valService.clearToast();
    this.showReviewModal.set(true);
  }

  openReviewModal() {
    for (let t = 1; t <= 4; t++) {
      this.valService.markTabSubmitted(t);
    }
    const firstInvalid = this.valService.getFirstInvalidTab(this.data);
    if (firstInvalid !== null) {
      this.activeTab.set(firstInvalid);
      const tabName = this.tabs[firstInvalid - 1]?.label || `Tab ${firstInvalid}`;
      this.valService.showToast(`Cannot review: Please complete all mandatory fields in "${tabName}".`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.valService.clearToast();
    this.showReviewModal.set(true);
  }

  confirmSubmit() {
    this.service.updateFormData(curr => ({ ...curr, status: 'Submitted' }));
    // Update the portal state as a registered user
    const d = this.data;
    this.eoiService.updateProfile({
      isRegistered: true,
      userState: 'existing',
      registrationNumber: 'ISMS-REG-2026-9104',
      personal: {
        ...this.eoiService.getProfile().personal,
        fullName: d.basicInfo.fullName,
        email: d.basicInfo.emailId,
        mobile: d.basicInfo.contactNo,
      },
      organization: {
        ...this.eoiService.getProfile().organization,
        name: d.basicInfo.fullName,
        pan: d.basicInfo.panNo,
        gstin: d.basicInfo.gstNo,
        registeredAddress: d.registeredAddress.address,
        state: d.registeredAddress.state,
        pincode: d.registeredAddress.pincode,
      }
    });
    this.showReviewModal.set(false);
    this.showSuccessModal.set(true);
  }

  goToPortal() {
    this.showSuccessModal.set(false);
    this.router.navigate(['/schemes']);
  }

  skipToPortal() {
    this.eoiService.resetToNewCitizen(this.currentSsoId || 'new_citizen_rj');
    this.router.navigate(['/schemes']);
  }
}
