import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EoiDocumentItem } from '../tenders.models';

/** Numbered list of prescribed annexure formats (no download buttons). */
@Component({
  selector: 'app-scheme-annexures-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <h2 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5">
      <span>Annexures</span>
      <span class="text-slate-500 font-normal text-sm">({{ annexures().length }} Formats)</span>
    </h2>

    <div class="space-y-1">
      @for (ann of annexures(); track ann.sNo) {
        <div class="flex items-baseline gap-2 text-[12.5px] text-slate-800 leading-snug py-0.5">
          <span class="w-5 text-right text-slate-500 shrink-0 font-normal">{{ ann.sNo }}.</span>
          <span class="font-normal">{{ ann.name }}</span>
        </div>
      }
    </div>
  `
})
export class SchemeAnnexuresListComponent {
  readonly annexures = input<EoiDocumentItem[]>([]);
}
