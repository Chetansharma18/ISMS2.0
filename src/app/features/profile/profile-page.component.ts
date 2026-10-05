import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OtrFormService } from '../registration/services/otr-form.service';
import { OtrValidationService } from '../registration/services/otr-validation.service';
import { OtrPdfService } from '../registration/services/otr-pdf.service';
import { DocumentViewerModalComponent } from '../../shared/components/document-viewer-modal/document-viewer-modal.component';
import { FileDoc } from '../registration/models/otr-form.model';

export interface RegistrationStepItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  icon: 'building' | 'user' | 'bank' | 'document';
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DocumentViewerModalComponent],
  template: `
    <div class="w-full min-h-full font-sans bg-white p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1400px] mx-auto select-none" style="font-family: 'Inter', sans-serif;">

      <!-- ====================================================================
           1. HERO BANNER: Profile Summary with Heritage Backdrop & Alert Box
           ==================================================================== -->
      <div class="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 bg-[#f4f8fb]">
        <!-- Panoramic Fort Heritage Image -->
        <div
          class="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
          style="background-image: url('/hero-bg.png'); background-position: right 25%; opacity: 0.95;"
        ></div>
        <!-- Soft Gradient Overlay: seamlessly fades fort into left background -->
        <div
          class="absolute inset-0 pointer-events-none"
          style="background: linear-gradient(90deg, #f4f8fb 0%, #f4f8fb 32%, rgba(244, 248, 251, 0.88) 55%, rgba(244, 248, 251, 0.3) 78%, transparent 100%);"
        ></div>

        <!-- Left: Title & Subtitle -->
        <div class="relative z-10">
          <h1 class="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#0B3558] m-0">
            Profile Summary
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 m-0 font-normal">
            Complete your registration steps to become eligible for scheme proposals under RSLDC.
          </p>
        </div>

        <!-- Right: Status Badge Alert Card -->
        <div class="relative z-10 shrink-0">
          @if (isProfileIncomplete()) {
            <div class="flex items-center gap-3 bg-[#FFFDF5] border border-[#FDE68A] rounded-xl px-4 py-3 shadow-xs">
              <!-- Amber Exclamation Circle -->
              <div class="w-7 h-7 rounded-full bg-[#D97706] text-white flex items-center justify-center shrink-0">
                <span class="font-bold text-sm">!</span>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#92400E] leading-tight">Profile Incomplete</div>
                <div class="text-[11px] text-[#A16207] mt-0.5 leading-tight">Complete all steps to apply for EOI opportunities.</div>
              </div>
            </div>
          } @else {
            <div class="flex items-center gap-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl px-4 py-3 shadow-xs">
              <!-- Green Checkmark Circle -->
              <div class="w-7 h-7 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div class="text-[13px] font-bold text-[#166534] leading-tight">Profile Complete</div>
                <div class="text-[11px] text-[#15803D] mt-0.5 leading-tight">All registration steps verified and active.</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ====================================================================
           2. OTR PROGRESS CARD: Circular Donut Chart + Details + CTA
           ==================================================================== -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <!-- Left: Donut Chart + Information + Progress Bar -->
        <div class="flex items-center gap-5 sm:gap-6 flex-1 min-w-0">
          
          <!-- Circular Progress Donut Chart (SVG) -->
          <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <!-- Track Circle -->
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#E2E8F0"
                stroke-width="8"
                fill="none"
              />
              <!-- Progress Arc -->
              <circle
                cx="50"
                cy="50"
                r="38"
                [attr.stroke]="isProfileIncomplete() ? '#0B3558' : '#15803D'"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                stroke-dasharray="238.76"
                [attr.stroke-dashoffset]="donutDashOffset()"
                class="transition-all duration-700 ease-out"
              />
            </svg>
            <!-- Center Percentage -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-bold text-slate-800 leading-none">
                {{ completionPercentage() }}%
              </span>
            </div>
          </div>

          <!-- Text Details -->
          <div class="flex-1 min-w-0 space-y-2">
            <h2 class="text-base sm:text-[17px] font-bold text-slate-900 m-0">One Time Registration (OTR)</h2>
            <p class="text-xs sm:text-[13px] text-slate-500 leading-relaxed m-0 max-w-xl">
              Complete all mandatory registration steps to become eligible for scheme proposals under RSLDC. Once complete, you can apply for all open EOI opportunities.
            </p>

        
           
          </div>
        </div>

        <!-- Right: Primary Action Button + Mandatory Warning Notice -->
        <div class="shrink-0 flex flex-col items-start lg:items-end gap-2.5">
          <button
            type="button"
            (click)="goToRegistration()"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white text-[13.5px] font-semibold bg-[#0B3558] hover:bg-[#07243c] shadow-sm transition-all cursor-pointer"
          >
            <span>{{ ctaButtonText() }}</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- ====================================================================
           3. REGISTRATION STEPS (Vertical Connected Timeline with 4 Steps)
           ==================================================================== -->
      <div class="space-y-3 pt-1">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 m-0">Registration Steps</h3>
          <p class="text-xs sm:text-[13px] text-slate-500 mt-0.5 m-0 font-normal">
            Follow the steps below to complete your profile. You can continue from where you left off.
          </p>
        </div>

        <!-- Timeline Items List -->
        <div class="space-y-0 pt-2">
          @for (step of sections(); track step.stepNumber; let last = $last) {
            <div class="flex items-stretch gap-3 sm:gap-5">
              
              <!-- Timeline Node: Number Circle + Vertical Connecting Line -->
              <div class="flex flex-col items-center shrink-0 w-8">
                <!-- Step Number Circle -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 z-10 shadow-2xs transition-colors"
                  [ngClass]="{
                    'bg-[#15803D] text-white': step.isCompleted,
                    'bg-[#0B3558] text-white': !step.isCompleted && isCurrentStep(step.stepNumber),
                    'bg-[#E2E8F0] text-slate-600': !step.isCompleted && !isCurrentStep(step.stepNumber)
                  }"
                >
                  {{ step.stepNumber }}
                </div>

                <!-- Vertical Connector Line -->
                @if (!last) {
                  <div class="w-[2px] flex-1 bg-slate-200 my-1"></div>
                }
              </div>

              <!-- Step Card Box -->
              <div
                class="flex-1 bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all mb-4"
              >
                <!-- Left: Icon Box + Title & Description -->
                <div class="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <!-- Icon Container Box -->
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    [ngClass]="{
                      'bg-[#ECFDF5] text-[#15803D]': step.isCompleted,
                      'bg-[#EFF6FF] text-[#1D4ED8]': !step.isCompleted && isCurrentStep(step.stepNumber),
                      'bg-[#F8FAFC] text-[#0B3558] border border-slate-100': !step.isCompleted && !isCurrentStep(step.stepNumber)
                    }"
                  >
                    @switch (step.icon) {
                      @case ('building') {
                        <!-- Organization Details Icon -->
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                      @case ('user') {
                        <!-- Authorized Person User Icon -->
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                      @case ('bank') {
                        <!-- Bank Columns Icon -->
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M12 3L2 8h20L12 3z" />
                        </svg>
                      }
                      @case ('document') {
                        <!-- Preview & Submit Document Icon -->
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    }
                  </div>

                  <!-- Title & Subtitle -->
                  <div class="min-w-0">
                    <h4 class="text-[15px] font-bold text-slate-800 m-0 leading-snug">{{ step.title }}</h4>
                    <p class="text-xs text-slate-500 m-0 mt-0.5 leading-relaxed">{{ step.description }}</p>
                  </div>
                </div>

                <!-- Right: Status Pill & Action Button -->
                <div class="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <!-- Status Pill -->
                  @if (step.isCompleted) {
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] select-none">
                      <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Completed</span>
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] select-none">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="9"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 3"/>
                      </svg>
                      <span>Pending</span>
                    </span>
                  }

                  <!-- Action Button -->
                  @if (step.isCompleted) {
                    <button
                      type="button"
                      (click)="navigateToStep(step.stepNumber)"
                      class="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer min-w-[105px]"
                    >
                      <span>View Details</span>
                    </button>
                  } @else if (isCurrentStep(step.stepNumber)) {
                    <button
                      type="button"
                      (click)="navigateToStep(step.stepNumber)"
                      class="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg text-xs font-semibold bg-[#0B3558] hover:bg-[#07243c] text-white shadow-sm transition-colors cursor-pointer min-w-[125px]"
                    >
                      <span>Continue Step</span>
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  } @else {
                    <button
                      type="button"
                      (click)="navigateToStep(step.stepNumber)"
                      class="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer min-w-[105px]"
                    >
                      <span>Start Step</span>
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  }
                </div>
              </div>

            </div>
          }
        </div>
      </div>

     
      <!-- Reusable Document Preview Modal (preserved for document review) -->
      <app-document-viewer-modal
        [isOpen]="isDocViewerOpen"
        [doc]="selectedDoc"
        [title]="selectedDocTitle"
        (close)="isDocViewerOpen = false"
      ></app-document-viewer-modal>

    </div>
  `
})
export class ProfilePageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private otrFormService = inject(OtrFormService);
  private validationService = inject(OtrValidationService);
  private pdfService = inject(OtrPdfService);

  readonly currentUser = this.authService.currentUser;
  readonly formData = this.otrFormService.formData;

  /** Document viewer modal state */
  isDocViewerOpen = false;
  selectedDoc: FileDoc | null = null;
  selectedDocTitle = '';

  /** 4 Standard Registration Steps */
  readonly sections = computed<RegistrationStepItem[]>(() => {
    const data = this.formData();
    const isSubmitted = data.status === 'Submitted';

    const isStep1Complete = this.validationService.validateStep1(data.step1).length === 0;
    const isStep2Complete = this.validationService.validateStep3(data.step3).length === 0;
    const isStep3Complete = this.validationService.validateStep4(data.step4).length === 0;
    const isStep4Complete = isSubmitted;

    return [
      {
        id: 'org',
        stepNumber: 1,
        title: 'Organization Details',
        description: 'Provide your organization / company details, registration information and documents.',
        isCompleted: isStep1Complete,
        icon: 'building'
      },
      {
        id: 'auth',
        stepNumber: 2,
        title: 'Authorized Person',
        description: 'Provide details of the authorized person who can represent the organization.',
        isCompleted: isStep2Complete,
        icon: 'user'
      },
      {
        id: 'bank',
        stepNumber: 3,
        title: 'Bank Details',
        description: 'Provide your bank account details for payment and fund transfer.',
        isCompleted: isStep3Complete,
        icon: 'bank'
      },
      {
        id: 'preview',
        stepNumber: 4,
        title: 'Preview & Submit',
        description: 'Review all details and submit your registration.',
        isCompleted: isStep4Complete,
        icon: 'document'
      }
    ];
  });

  /** Count of completed sections (0 to 4) */
  readonly completedSectionsCount = computed(() => {
    return this.sections().filter(s => s.isCompleted).length;
  });

  /** Overall completion percentage (0% to 100%) */
  readonly completionPercentage = computed(() => {
    const data = this.formData();
    if (data.status === 'Submitted') return 100;
    const count = this.completedSectionsCount();
    return Math.round((count / 4) * 100);
  });

  /** SVG circle stroke dashoffset for the 38-radius donut wheel */
  readonly donutDashOffset = computed(() => {
    const circumference = 238.76;
    const pct = this.completionPercentage();
    return circumference * (1 - pct / 100);
  });

  /** Identifies the earliest incomplete step number (1 to 4) */
  readonly currentPendingStep = computed(() => {
    const list = this.sections();
    const firstIncomplete = list.find(s => !s.isCompleted);
    return firstIncomplete ? firstIncomplete.stepNumber : 1;
  });

  /** Whether a step number is the next one pending completion */
  isCurrentStep(stepNumber: number): boolean {
    return this.currentPendingStep() === stepNumber;
  }

  /** Checks if profile is incomplete */
  readonly isProfileIncomplete = computed(() => {
    const user = this.currentUser();
    const data = this.formData();
    if (data.status === 'Submitted') return false;
    if (!user) return true;
    if (user.role === 'new_user') {
      return this.completedSectionsCount() < 4;
    }
    return user.isProfileComplete === false;
  });

  /** Primary CTA button text */
  readonly ctaButtonText = computed(() => {
    const count = this.completedSectionsCount();
    if (count === 0) return 'Start Registration';
    if (count === 4) return 'Review Registration';
    return 'Continue Registration';
  });

  /** Navigates to a specific step in the registration form */
  navigateToStep(stepNumber: number): void {
    this.router.navigate(['/registration'], { queryParams: { step: stepNumber } });
  }

  /** Navigates to the first incomplete step */
  goToRegistration(): void {
    this.navigateToStep(this.currentPendingStep());
  }

  /** Opens document viewer modal */
  openDoc(doc: FileDoc | null, title: string, defaultName = 'document.pdf'): void {
    this.selectedDoc = doc || {
      fileName: defaultName,
      fileSize: '1.45 MB',
      uploadDate: new Date().toLocaleDateString('en-GB'),
      status: 'uploaded'
    };
    this.selectedDocTitle = title;
    this.isDocViewerOpen = true;
  }

  /** Print / Download profile PDF */
  downloadProfilePdf(): void {
    this.pdfService.printOtrProfile(this.formData());
  }
}
