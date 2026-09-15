import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TpPiaRegistrationService } from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';
import { AwardItem } from '../../models/tp-pia-registration.model';

@Component({
  selector: 'app-tab-awards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 sm:space-y-6">
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div 
          (click)="isOpen.set(!isOpen())"
          class="px-4 sm:px-6 py-3 sm:py-3.5 flex flex-row items-center justify-between gap-2 sm:gap-3 bg-white hover:bg-slate-50/80 cursor-pointer select-none transition"
          [class.border-b]="isOpen()"
          [class.border-slate-200]="isOpen()"
        >
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <span class="px-2 sm:px-2.5 py-0.5 rounded bg-[#1a2656] text-white text-[11px] sm:text-xs font-bold tracking-wide select-none shrink-0">
              Section 6.1
            </span>
            <h3 class="text-xs sm:text-sm md:text-base font-bold text-slate-800 truncate sm:whitespace-normal">
              Awards & Citations Received by Organization
            </h3>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            @if (isOpen()) {
              <button 
                type="button" 
                (click)="$event.stopPropagation(); openAddModal()"
                class="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1a2656] hover:bg-[#233373] text-white rounded-md text-xs sm:text-sm font-semibold tracking-wide transition shadow-xs cursor-pointer active:scale-98 whitespace-nowrap"
              >
                + Add Award
              </button>
            }
            <div class="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition">
              <svg 
                class="w-5 h-5 transition-transform duration-200"
                [class.rotate-180]="isOpen()"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        @if (isOpen()) {
        <div class="p-4 sm:p-6">
          @if (awards.length === 0) {
            <div class="text-center py-8 sm:py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p class="text-xs sm:text-sm font-medium text-slate-600">No awards recorded yet</p>
              <button 
                type="button" 
                (click)="openAddModal()"
                class="mt-2.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-900 hover:underline cursor-pointer"
              >
                + Click to add state / national / international award
              </button>
            </div>
          } @else {
            <!-- Mobile Card View (block md:hidden) -->
            <div class="block md:hidden space-y-3">
              @for (award of awards; track award.id; let idx = $index) {
                <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5 hover:border-slate-300 transition">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-xs font-bold text-slate-400">#{{ idx + 1 }}</span>
                        <h4 class="font-bold text-slate-900 text-sm truncate">{{ award.awardName }}</h4>
                      </div>
                      <p class="text-xs text-slate-600 mt-0.5">{{ award.awardingAgency }}</p>
                    </div>
                    @if (award.level) {
                      <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold shadow-2xs border shrink-0"
                        [ngClass]="{
                          'bg-amber-50 text-amber-900 border-amber-200': award.level === 'National',
                          'bg-indigo-50 text-indigo-900 border-indigo-200': award.level === 'International',
                          'bg-emerald-50 text-emerald-900 border-emerald-200': award.level === 'State'
                        }">
                        {{ award.level }}
                      </span>
                    }
                  </div>

                  <div class="pt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Year: <b class="font-mono text-slate-700">{{ award.year || '—' }}</b></span>
                    @if (award.documentName) {
                      <span class="text-blue-900 font-medium truncate max-w-40" [title]="award.documentName">📎 {{ award.documentName }}</span>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button 
                      type="button" 
                      (click)="editAward(award)"
                      class="px-3 py-1 text-xs text-blue-900 font-semibold hover:bg-blue-50 rounded-md border border-blue-200 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      (click)="deleteAward(award.id)"
                      class="px-3 py-1 text-xs text-rose-600 font-semibold hover:bg-rose-50 rounded-md border border-rose-200 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Desktop Table View (hidden md:block) -->
            <div class="hidden md:block overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table class="w-full text-left text-sm text-slate-700">
                <thead class="bg-slate-50/90 border-b border-slate-200 text-slate-800 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th class="py-3.5 px-4 w-12 text-center">#</th>
                    <th class="py-3.5 px-4">Award Name</th>
                    <th class="py-3.5 px-4">Awarding Agency</th>
                    <th class="py-3.5 px-4 w-24">Year</th>
                    <th class="py-3.5 px-4 w-28">Level</th>
                    <th class="py-3.5 px-4">Supporting Doc</th>
                    <th class="py-3.5 px-4 text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (award of awards; track award.id; let idx = $index) {
                    <tr class="hover:bg-slate-50/70 transition">
                      <td class="py-3.5 px-4 font-mono text-slate-400 text-xs text-center">{{ idx + 1 }}</td>
                      <td class="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {{ award.awardName }}
                      </td>
                      <td class="py-3.5 px-4 text-slate-700 text-sm font-medium">
                        {{ award.awardingAgency }}
                      </td>
                      <td class="py-3.5 px-4 font-mono text-slate-700 text-sm">
                        {{ award.year || '—' }}
                      </td>
                      <td class="py-3.5 px-4">
                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold shadow-2xs border"
                          [ngClass]="{
                            'bg-amber-50 text-amber-900 border-amber-200': award.level === 'National',
                            'bg-indigo-50 text-indigo-900 border-indigo-200': award.level === 'International',
                            'bg-emerald-50 text-emerald-900 border-emerald-200': award.level === 'State',
                            'bg-slate-100 text-slate-700 border-slate-200': !award.level
                          }">
                          {{ award.level || '—' }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-xs text-slate-600">
                        @if (award.documentName) {
                          <span class="text-blue-900 font-medium">📎 {{ award.documentName }}</span>
                        } @else {
                          <span class="text-slate-400 italic">None</span>
                        }
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <div class="inline-flex items-center gap-2">
                          <button 
                            type="button" 
                            (click)="editAward(award)"
                            class="px-3 py-1 text-xs text-blue-900 font-semibold hover:bg-blue-50 rounded-full border border-blue-200 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            (click)="deleteAward(award.id)"
                            class="px-3 py-1 text-xs text-rose-600 font-semibold hover:bg-rose-50 rounded-full border border-rose-200 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
        }
      </section>

      <!-- Add / Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div class="bg-[#0f1738] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
              <h4 class="text-sm sm:text-base font-bold uppercase tracking-wider truncate">
                {{ isEditing() ? 'Edit Award Record' : 'Add Award Record' }}
              </h4>
              <button type="button" (click)="closeModal()" class="text-slate-300 hover:text-white text-2xl font-bold cursor-pointer leading-none">&times;</button>
            </div>

            <div class="p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Award / Recognition Name <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="currentAward.awardName" 
                  placeholder="e.g. Best Skill Development Partner"
                  [ngClass]="isModalFieldInvalid('awardName') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                  required
                />
                @if (isModalFieldInvalid('awardName')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('awardName') }}</p>
                }
              </div>

              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Awarding Agency / Body <span class="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="currentAward.awardingAgency" 
                  placeholder="e.g. NSDC / Ministry of Skill Development"
                  [ngClass]="isModalFieldInvalid('awardingAgency') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                  class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                  required
                />
                @if (isModalFieldInvalid('awardingAgency')) {
                  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('awardingAgency') }}</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Year of Award
                  </label>
                  <input 
                    type="number" 
                    [(ngModel)]="currentAward.year" 
                    placeholder="2025"
                    [ngClass]="isModalFieldInvalid('year') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
                    class="w-full h-10 px-3.5 border rounded-lg text-sm text-slate-800 font-mono placeholder-slate-400 hover:border-slate-400 focus:ring-2 transition outline-none" 
                  />
                  @if (isModalFieldInvalid('year')) {
                    <p class="text-xs text-rose-600 mt-1 font-medium">{{ getModalFieldError('year') }}</p>
                  }
                </div>

                <div>
                  <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Level
                  </label>
                  <select 
                    [(ngModel)]="currentAward.level"
                    class="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none"
                  >
                    <option value="">-- Select Level --</option>
                    <option value="State">State Level</option>
                    <option value="National">National Level</option>
                    <option value="International">International Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Description / Remarks
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="currentAward.description" 
                  placeholder="Brief details about the recognition..."
                  class="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition outline-none" 
                />
              </div>

              <div>
                <label class="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Supporting Document
                </label>
                <input 
                  type="file" 
                  (change)="onAwardFileSelected($event)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="block w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                />
                @if (currentAward.documentName) {
                  <p class="text-xs text-emerald-600 mt-1 font-medium">Attached: {{ currentAward.documentName }}</p>
                }
              </div>
            </div>

            <div class="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button 
                type="button" 
                (click)="closeModal()"
                class="px-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button 
                type="button" 
                (click)="saveAward()"
                class="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs text-center"
              >
                {{ isEditing() ? 'Update Award' : 'Save Award' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TabAwardsComponent {
  private service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);

  readonly showModal = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly modalSubmitted = signal<boolean>(false);
  readonly isOpen = signal<boolean>(true);

  currentAward: AwardItem = this.getEmptyAward();

  get awards(): AwardItem[] {
    return this.service.formData().awards;
  }

  get awardErrors(): Record<string, string> {
    return this.valService.validateAward(this.currentAward).errors;
  }

  isModalFieldInvalid(field: keyof AwardItem): boolean {
    const error = this.awardErrors[field];
    if (!error) return false;

    const val = this.currentAward[field];
    const hasValue = val !== undefined && val !== null && String(val).trim().length > 0;
    if (hasValue) {
      return true; // User entered input and it is incorrect
    }

    return this.modalSubmitted();
  }

  getModalFieldError(field: keyof AwardItem): string {
    return this.isModalFieldInvalid(field) ? (this.awardErrors[field] || '') : '';
  }

  openAddModal() {
    this.isEditing.set(false);
    this.modalSubmitted.set(false);
    this.currentAward = this.getEmptyAward();
    this.showModal.set(true);
  }

  editAward(award: AwardItem) {
    this.isEditing.set(true);
    this.modalSubmitted.set(false);
    this.currentAward = { ...award };
    this.showModal.set(true);
  }

  deleteAward(id: string) {
    if (confirm('Delete this award record?')) {
      this.service.updateFormData(curr => ({
        ...curr,
        awards: curr.awards.filter(a => a.id !== id)
      }));
    }
  }

  onAwardFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.currentAward.documentName = input.files[0].name;
    }
  }

  saveAward() {
    this.modalSubmitted.set(true);
    const validation = this.valService.validateAward(this.currentAward);
    if (!validation.isValid) {
      return;
    }

    if (this.isEditing()) {
      this.service.updateFormData(curr => ({
        ...curr,
        awards: curr.awards.map(a => a.id === this.currentAward.id ? this.currentAward : a)
      }));
    } else {
      this.service.updateFormData(curr => ({
        ...curr,
        awards: [...curr.awards, { ...this.currentAward, id: 'aw-' + Date.now() }]
      }));
    }
    this.closeModal();
  }

  closeModal() {
    this.showModal.set(false);
  }

  private getEmptyAward(): AwardItem {
    return {
      id: '',
      awardName: '',
      awardingAgency: '',
      year: new Date().getFullYear().toString(),
      level: 'National',
      description: '',
    };
  }
}
