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
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

export type NewUserCategory = 'student' | 'citizen';

@Component({
  selector: 'app-new-user-category-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent, IconComponent, ModalComponent],
  template: `
    @if (isOpen) {
      <app-modal
        title="Choose New User Category"
        subtitle="Select User Category / उपयोगकर्ता प्रकार"
        widthOverride="max-w-xl"
        [closeOnBackdrop]="false"
        (close)="cancel()"
      >
          <!-- Description -->
          <div class="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
            Please choose the option that matches your purpose on the ISMS 2.0 portal:
          </div>

          <!-- Category Options Body -->
          <div class="pt-4 space-y-3.5">

            <!-- OPTION 1: ASPIRANT (Training Related Interest) -->
            <div
              (click)="selectCategory('student')"
              class="group relative rounded-xl border-2 p-4 sm:p-4.5 transition-all cursor-pointer select-none"
              [class.border-indigo-600]="selectedCategory() === 'student'"
              [class.bg-indigo-50/50]="selectedCategory() === 'student'"
              [class.ring-2]="selectedCategory() === 'student'"
              [class.ring-indigo-600/15]="selectedCategory() === 'student'"
              [class.border-slate-200]="selectedCategory() !== 'student'"
              [class.bg-white]="selectedCategory() !== 'student'"
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
                  <app-icon name="academic-cap" size="lg" [stroke]="2" />
                </div>

                <!-- Content -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">
                      Aspirant
                    </h3>
                  </div>

                  <div class="mt-1 text-xs font-semibold text-indigo-700">
                    Training Related Interest
                  </div>

                  <p class="mt-1 text-xs text-slate-600 leading-relaxed m-0">
                    Interested in taking up skill training programs, enrolling in specialized courses, tracking batch learning, and obtaining state certifications.
                  </p>
                </div>
              </div>
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
                  <app-icon name="building" size="lg" [stroke]="2" />
                </div>

                <!-- Content -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 m-0">
                      Citizen
                    </h3>
                  </div>

                  <div class="mt-1 text-xs font-semibold text-emerald-700">
                    Express Interest &amp; Conduct Schemes
                  </div>

                  <p class="mt-1 text-xs text-slate-600 leading-relaxed m-0">
                    Express interest to conduct skill training programs, submit Expression of Interest (EOI).
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <ng-container modalFooter>
            <button
              appButton
              variant="outline"
              type="button"
              (click)="cancel()"
              class="mr-auto"
            >
              Cancel &amp; Go Back
            </button>

            @if (selectedCategory() === 'citizen') {
              <button
                appButton
                [loading]="isSubmitting()"
                type="button"
                (click)="confirmSelection()"
                [disabled]="isSubmitting()"
              >
                @if (isSubmitting()) {
                  <span>Continuing...</span>
                } @else {
                  <span>Continue as Citizen &rarr;</span>
                }
              </button>
            } @else if (selectedCategory() === 'student') {
              <button
                appButton
                [loading]="isSubmitting()"
                type="button"
                (click)="confirmSelection()"
                [disabled]="isSubmitting()"
              >
                @if (isSubmitting()) {
                  <span>Continuing...</span>
                } @else {
                  <span>Continue as Aspirant &rarr;</span>
                }
              </button>
            } @else {
              <button
                appButton
                type="button"
                disabled
              >
                <span>Continue &rarr;</span>
              </button>
            }
          </ng-container>
      </app-modal>
    }
  `
})
export class NewUserCategoryModalComponent {
  private router = inject(Router, { optional: true });

  private _isOpen = false;
  @Input()
  set isOpen(val: boolean) {
    this._isOpen = val;
    this.isSubmitting.set(false);
    if (val) {
      this.selectedCategory.set(null);
    }
  }
  get isOpen(): boolean {
    return this._isOpen;
  }

  @Output() categoryConfirmed = new EventEmitter<'citizen' | 'student'>();
  @Output() proceedWithCitizen = new EventEmitter<void>();
  @Output() proceedWithStudent = new EventEmitter<void>();
  @Output() proceedWithAspirant = new EventEmitter<{ skip: boolean }>();
  @Output() cancelled = new EventEmitter<void>();

  selectedCategory = signal<NewUserCategory | null>(null);
  isSubmitting = signal<boolean>(false);

  selectCategory(cat: NewUserCategory): void {
    this.selectedCategory.set(cat);
  }

  confirmSelection(): void {
    const cat = this.selectedCategory();
    if (!cat || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.categoryConfirmed.emit(cat);

    if (cat === 'citizen') {
      this.proceedWithCitizen.emit();
    } else {
      this.proceedWithAspirant.emit({ skip: false });
      this.proceedWithStudent.emit();
    }
  }

  confirmCitizen(): void {
    this.selectedCategory.set('citizen');
    this.confirmSelection();
  }

  cancel(): void {
    this.isSubmitting.set(false);
    this.cancelled.emit();
  }
}
