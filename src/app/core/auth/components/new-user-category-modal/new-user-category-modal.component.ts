import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type NewUserCategory = 'student' | 'citizen';

@Component({
  selector: 'app-new-user-category-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-120 flex items-center justify-center p-4 bg-white select-none font-sans animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        <!-- Modal Card Container -->
        <div
          class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Gov Accent Gradient -->
          <div class="h-1.5 w-full bg-gradient-to-r from-sso-blue via-navy to-ocean"></div>

          <!-- Header -->
          <div class="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-light text-navy flex items-center justify-center shrink-0 shadow-2xs">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div class="text-[11px] font-bold uppercase tracking-wider text-sso-blue">
                  Select User Category / उपयोगकर्ता प्रकार
                </div>
                <h2 id="category-modal-title" class="text-lg sm:text-xl font-black text-slate-900 tracking-tight m-0">
                  Choose New User Category
                </h2>
              </div>
            </div>

            <!-- Close Button -->
            <button
              type="button"
              (click)="cancel()"
              class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Description -->
          <div class="px-5 sm:px-6 pt-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
            Please choose the option that matches your purpose on the ISMS 2.0 portal:
          </div>

          <!-- Category Options Body -->
          <div class="p-5 sm:p-6 space-y-3.5">

            <!-- OPTION 1: STUDENT (Training Related Interest) -->
            <div
              (click)="selectCategory('student')"
              class="group relative rounded-xl border-2 p-4 sm:p-4.5 transition-all cursor-pointer select-none"
              [class.border-indigo-600]="selectedCategory() === 'student'"
              [class.bg-indigo-50/50]="selectedCategory() === 'student'"
              [class.border-slate-200]="selectedCategory() !== 'student'"
              [class.bg-slate-50/60]="selectedCategory() !== 'student'"
              [class.hover:border-indigo-300]="selectedCategory() !== 'student'"
              [class.hover:bg-slate-50]="selectedCategory() !== 'student'"
            >
              <div class="flex items-start gap-3.5">
                <!-- Radio indicator -->
                <div class="mt-0.5 shrink-0">
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                    [class.border-indigo-600]="selectedCategory() === 'student'"
                    [class.border-slate-300]="selectedCategory() !== 'student'"
                    [class.bg-indigo-600]="selectedCategory() === 'student'"
                  >
                    @if (selectedCategory() === 'student') {
                      <div class="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </div>

                <!-- Icon -->
                <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7" />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">
                      Student
                    </h3>
                    <span class="text-xs text-slate-500 font-normal">(छात्र / शिक्षार्थी)</span>
                  </div>

                  <div class="mt-1 text-xs font-semibold text-indigo-700">
                    Training Related Interest
                  </div>

                  <p class="mt-1 text-xs text-slate-600 leading-relaxed m-0">
                    Interested in taking up skill training programs, enrolling in specialized courses, tracking batch learning, and obtaining state certifications.
                  </p>
                </div>
              </div>

              <!-- Inline Coming Soon Alert for Student -->
              @if (selectedCategory() === 'student') {
                <div class="mt-3.5 pt-3 border-t border-indigo-200/80 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/90 p-2.5 rounded-lg border border-amber-200 animate-in fade-in">
                  <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong class="font-bold">Student Module Coming Soon:</strong>
                    Direct candidate admission & training interest registration will be introduced in the next release. To participate in active schemes, please proceed as Citizen.
                  </div>
                </div>
              }
            </div>

            <!-- OPTION 2: CITIZEN (Express Interest & Conduct Schemes) -->
            <div
              (click)="selectCategory('citizen')"
              class="group relative rounded-xl border-2 p-4 sm:p-4.5 transition-all cursor-pointer select-none"
              [class.border-navy]="selectedCategory() === 'citizen'"
              [class.bg-blue-50/40]="selectedCategory() === 'citizen'"
              [class.ring-2]="selectedCategory() === 'citizen'"
              [class.ring-navy/15]="selectedCategory() === 'citizen'"
              [class.border-slate-200]="selectedCategory() !== 'citizen'"
              [class.bg-white]="selectedCategory() !== 'citizen'"
              [class.hover:border-navy/60]="selectedCategory() !== 'citizen'"
              [class.hover:bg-slate-50]="selectedCategory() !== 'citizen'"
            >
              <div class="flex items-start gap-3.5">
                <!-- Radio indicator -->
                <div class="mt-0.5 shrink-0">
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                    [class.border-navy]="selectedCategory() === 'citizen'"
                    [class.border-slate-300]="selectedCategory() !== 'citizen'"
                    [class.bg-navy]="selectedCategory() === 'citizen'"
                  >
                    @if (selectedCategory() === 'citizen') {
                      <div class="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </div>

                <!-- Icon -->
                <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">
                      Citizen
                    </h3>
                    <span class="text-xs text-slate-500 font-normal">(नागरिक / संस्था / TP)</span>
                  </div>

                  <div class="mt-1 text-xs font-semibold text-emerald-700">
                    Express Interest &amp; Conduct Schemes
                  </div>

                  <p class="mt-1 text-xs text-slate-600 leading-relaxed m-0">
                    Express interest to conduct skill training programs, submit Expression of Interest (EOI), empanel as Training Partner / PIA, and complete One-Time Registration (OTR).
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="p-5 sm:p-6 pt-3 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              (click)="cancel()"
              class="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel &amp; Go Back
            </button>

            @if (selectedCategory() === 'citizen') {
              <button
                type="button"
                (click)="confirmCitizen()"
                class="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-navy hover:bg-[#07243c] rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue as Citizen &rarr;</span>
              </button>
            } @else {
              <button
                type="button"
                (click)="selectCategory('citizen')"
                class="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-navy bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Switch to Citizen &rarr;</span>
              </button>
            }
          </div>

        </div>
      </div>
    }
  `
})
export class NewUserCategoryModalComponent {
  private router = inject(Router, { optional: true });

  @Input() isOpen = false;

  @Output() categoryConfirmed = new EventEmitter<'citizen' | 'student'>();
  @Output() proceedWithCitizen = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  selectedCategory = signal<NewUserCategory>('citizen');

  selectCategory(cat: NewUserCategory): void {
    this.selectedCategory.set(cat);
  }

  confirmCitizen(): void {
    this.categoryConfirmed.emit('citizen');
    this.proceedWithCitizen.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
