import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SchemeTender } from '../tenders.models';
import { formatFeeDisplay } from './scheme-detail-view.util';

/** Clean 3-column metadata grid displaying unique Scheme Details, fee structure, and description. */
@Component({
  selector: 'app-scheme-detail-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-[#EADCE2] shadow-2xs p-5 sm:p-6 space-y-5">
      <div class="pb-4 border-b border-[#EADCE2] space-y-1">
        <h2 class="text-sm sm:text-base font-bold text-[#7C0E44] m-0">Scheme Description</h2>
        <p class="text-[13.5px] text-slate-700 leading-relaxed m-0 whitespace-pre-line">
          {{ scheme().eoiDescription || 'No description provided.' }}
        </p>
      </div>

      <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 m-0">
        <div class="space-y-1">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">EOI Reference No.</dt>
          <dd class="text-[13.5px] font-semibold text-slate-900 m-0 break-all select-all">{{ scheme().refNo }}</dd>
        </div>

        <div class="space-y-1">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Scheme Category</dt>
          <dd class="text-[13.5px] font-semibold text-slate-900 m-0">{{ scheme().schemeCategory || scheme().category || '-' }}</dd>
        </div>

        <div class="space-y-1">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">EOI Category</dt>
          <dd class="text-[13.5px] font-semibold text-slate-900 m-0">{{ scheme().eoiCategory || '-' }}</dd>
        </div>

        <div class="space-y-1">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">EOI Duration</dt>
          <dd class="text-[13.5px] font-semibold text-slate-900 m-0">{{ scheme().eoiDuration || '-' }}</dd>
        </div>

        <div class="space-y-1">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">EOI Publication Date</dt>
          <dd class="text-[13.5px] font-semibold text-slate-900 m-0 tabular-nums">{{ scheme().datePublished || '-' }}</dd>
        </div>

        <div class="space-y-1">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date of Closing</dt>
          <dd class="text-[13.5px] font-bold text-rose-600 m-0 tabular-nums">{{ scheme().closingDate || '-' }}</dd>
        </div>

        @if (scheme().isFeeExempted) {
          <div class="space-y-1">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">EMD / Process Fees</dt>
            <dd class="text-[13.5px] font-semibold text-emerald-700 m-0">Exempted</dd>
          </div>
        } @else {
          <div class="space-y-1">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">EMD Amount</dt>
            <dd class="text-[13.5px] font-semibold text-slate-900 m-0 tabular-nums">
              <span>{{ formattedEmdFee() }}</span>
              <span class="text-slate-500 font-normal text-xs ml-1">(Refundable)</span>
            </dd>
          </div>

          <div class="space-y-1">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Process Fees</dt>
            <dd class="text-[13.5px] font-semibold text-slate-900 m-0 tabular-nums">
              <span>{{ formattedProcessFee() }}</span>
              <span class="text-slate-500 font-normal text-xs ml-1">(Non-Refundable)</span>
            </dd>
          </div>
        }
      </dl>

      <!-- Publish Details information the department added to the EOI (read-only for applicants) -->
      @if (scheme().publishedInfo?.length) {
        <div class="pt-4 border-t border-[#EADCE2] space-y-3">
          <h2 class="text-sm sm:text-base font-bold text-[#7C0E44] m-0">Additional EOI Information</h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 m-0">
            @for (info of scheme().publishedInfo; track $index) {
              <div class="space-y-1 min-w-0">
                <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{{ info.label }}</dt>
                <dd class="text-[13.5px] font-semibold text-slate-900 m-0 break-words whitespace-pre-line">{{ info.value }}</dd>
              </div>
            }
          </dl>
        </div>
      }
    </section>
  `
})
export class SchemeDetailSummaryComponent {
  readonly scheme = input.required<SchemeTender>();

  readonly formattedEmdFee = computed(() => formatFeeDisplay(this.scheme().emdFee, '-'));
  readonly formattedProcessFee = computed(() => formatFeeDisplay(this.scheme().processFee, '-'));
}
