import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BatchRecord } from '../../models/batch.model';

/** Page header: back button, title and the target-batch context pill. */
@Component({
  selector: 'app-aspirant-mapping-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="back.emit()"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
          title="Back to Batches"
        >
          <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
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
