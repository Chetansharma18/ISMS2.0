import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BatchRecord } from '../../models/batch.model';
import { ButtonComponent, IconComponent } from '../../../../shared';

/** Page header: back button, title and the target-batch context pill. */
@Component({
  selector: 'app-aspirant-mapping-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
      <div class="flex items-center gap-3">
        <button
          appButton
          variant="outline"
          size="sm"
          class="shrink-0"
          type="button"
          (click)="back.emit()"
          title="Back to Batches"
        >
          <app-icon name="chevron-left" size="sm" />
          <span>Back</span>
        </button>
        
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug m-0">
              Register Aspirant
            </h1>
           
          </div>
         
        </div>
      </div>

      <!-- Batch Context Header Pill -->
      @if (batch(); as b) {
        <div class="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs self-start sm:self-auto shadow-2xs">
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400 font-medium">Batch:</span>
            <span class="font-bold text-slate-900 font-mono">{{ b.batchCode }}</span>
          </div>
          <span class="w-1 h-1 rounded-full bg-slate-300"></span>
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400 font-medium">Course:</span>
            <span class="font-semibold text-slate-800">{{ b.courseName }}</span>
          </div>
          <span class="w-1 h-1 rounded-full bg-slate-300"></span>
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400 font-medium">Capacity:</span>
            <span class="font-bold text-emerald-700 font-mono">{{ b.mappedAspirantsCount }}/{{ b.maxStrength }} Mapped</span>
          </div>
        </div>
      }
    </div>

  `
})
export class AspirantMappingHeaderComponent {
  readonly batch = input<BatchRecord | undefined>();

  readonly back = output<void>();
}
