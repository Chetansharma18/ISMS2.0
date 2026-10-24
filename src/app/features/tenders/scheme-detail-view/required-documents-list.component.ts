import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { EoiRequiredInfoItem } from '../tenders.models';
import { splitInHalf } from './scheme-detail-view.util';
import { IconComponent } from '../../../shared/components/icon/icon.component';

/** Two-column list of required supporting documents in a collapsible dropdown card. */
@Component({
  selector: 'app-required-documents-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: { class: 'block' },
  template: `
    <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
      <button
        type="button"
        (click)="toggleOpen()"
        class="w-full bg-slate-50/80 hover:bg-slate-100/80 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
        [attr.aria-expanded]="isOpen()"
      >
        <div class="flex items-center gap-2">
          <h2 class="text-sm sm:text-base font-bold text-slate-900 group-hover:text-navy transition-colors">
            Required Supporting Documents
          </h2>
          <span class="text-slate-500 font-normal text-xs sm:text-sm">({{ requiredInfo().length }} Documents)</span>
        </div>

        <div class="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <span class="hidden sm:inline">{{ isOpen() ? 'Hide Documents' : 'View Documents' }}</span>
          <app-icon
            name="chevron-down"
            size="md"
            class="text-slate-400 group-hover:text-slate-600 transition-transform duration-200"
            [class.rotate-180]="isOpen()"
          />
        </div>
      </button>

      @if (isOpen()) {
        <div class="p-4 sm:p-5 border-t border-slate-200 bg-white animate-in fade-in duration-150">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2.5">
            <!-- Left Column (first half) -->
            <div class="space-y-2 text-[13.5px] sm:text-[14px] text-slate-800 leading-relaxed">
              @for (req of columns().left; track req.sNo) {
                <div class="flex items-baseline gap-2.5">
                  <span class="w-5 text-right text-slate-500 shrink-0 font-medium text-[13px] sm:text-[13.5px]">{{ req.sNo }}.</span>
                  <div>
                    <span class="font-normal text-slate-900">{{ req.name }}</span>
                    @if (req.note) {
                      <span class="text-slate-500 text-[12.5px] sm:text-[13px]"> ({{ req.note }})</span>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Right Column (second half) -->
            <div class="space-y-2 text-[13.5px] sm:text-[14px] text-slate-800 leading-relaxed">
              @for (req of columns().right; track req.sNo) {
                <div class="flex items-baseline gap-2.5">
                  <span class="w-5 text-right text-slate-500 shrink-0 font-medium text-[13px] sm:text-[13.5px]">{{ req.sNo }}.</span>
                  <div>
                    <span class="font-normal text-slate-900">{{ req.name }}</span>
                    @if (req.note) {
                      <span class="text-slate-500 text-[12.5px] sm:text-[13px]"> ({{ req.note }})</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class RequiredDocumentsListComponent {
  readonly requiredInfo = input<EoiRequiredInfoItem[]>([]);
  readonly isOpen = signal<boolean>(false);

  protected readonly columns = computed(() => splitInHalf(this.requiredInfo()));

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }
}
