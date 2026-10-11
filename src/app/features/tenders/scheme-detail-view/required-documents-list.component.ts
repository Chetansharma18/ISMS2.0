import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EoiRequiredInfoItem } from '../tenders.models';
import { splitInHalf } from './scheme-detail-view.util';

/** Two-column list of required supporting documents. */
@Component({
  selector: 'app-required-documents-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <h2 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5">
      <span>Required Supporting Documents</span>
      <span class="text-slate-500 font-normal text-sm">({{ requiredInfo().length }} Documents)</span>
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2 mt-2">
      <!-- Left Column (first half) -->
      <div class="space-y-1.5 text-[12px] text-slate-800 leading-snug">
        @for (req of columns().left; track req.sNo) {
          <div class="flex items-baseline gap-2">
            <span class="w-4 text-right text-slate-500 shrink-0 font-normal">{{ req.sNo }}.</span>
            <div>
              <span class="font-normal text-slate-900">{{ req.name }}</span>
              @if (req.note) {
                <span class="text-slate-500"> ({{ req.note }})</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Right Column (second half) -->
      <div class="space-y-1.5 text-[12px] text-slate-800 leading-snug">
        @for (req of columns().right; track req.sNo) {
          <div class="flex items-baseline gap-2">
            <span class="w-5 text-right text-slate-500 shrink-0 font-normal">{{ req.sNo }}.</span>
            <div>
              <span class="font-normal text-slate-900">{{ req.name }}</span>
              @if (req.note) {
                <span class="text-slate-500"> ({{ req.note }})</span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class RequiredDocumentsListComponent {
  readonly requiredInfo = input<EoiRequiredInfoItem[]>([]);

  protected readonly columns = computed(() => splitInHalf(this.requiredInfo()));
}
