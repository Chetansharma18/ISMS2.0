import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BatchRecord } from '../../models/batch.model';
import { ButtonComponent, IconComponent } from '../../../../shared';

/** Page header in the same layout as the registration forms: Back, title with the mandatory-fields note, and the batch. */
@Component({
  selector: 'app-aspirant-mapping-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="space-y-3">
      <div>
        <button appButton variant="outline" size="sm" type="button" (click)="back.emit()" title="Back to Batches">
          <app-icon name="back" />
          <span>Back</span>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">{{ replacedName() ? 'Register Replacement' : 'Register Aspirant' }}</h1>
        <span class="text-xs text-slate-500 font-medium select-none">
          Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
        </span>
      </div>

      @if (batch(); as b) {
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
          Batch <strong class="tabular-nums text-slate-900">{{ b.batchCode }}</strong> ({{ b.courseName }}) at {{ b.sdcName }}.
          <span class="tabular-nums">{{ b.mappedAspirantsCount }} of {{ b.approvedBatchStrength || b.maxStrength }}</span> aspirants registered.
        </p>
      }

      @if (replacedName()) {
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
          The new aspirant takes the seat of <strong class="text-slate-900">{{ replacedName() }}</strong>, who has dropped out.
        </p>
      }
    </div>
  `
})
export class AspirantMappingHeaderComponent {
  readonly batch = input<BatchRecord | undefined>();
  /** Name of the dropped student being replaced; empty for a normal registration. */
  readonly replacedName = input<string>('');

  readonly back = output<void>();
}
