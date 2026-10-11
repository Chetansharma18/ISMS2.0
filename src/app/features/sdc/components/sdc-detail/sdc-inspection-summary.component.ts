import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SdcInspectionData } from '../../models/sdc.model';

/** Auditor physical inspection summary shown inside the approval panel. */
@Component({
  selector: 'app-sdc-inspection-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let i = inspection();
    <div class="bg-slate-50 border-b border-slate-200 p-4 text-xs">
      <div class="font-semibold text-slate-800 mb-2 flex items-center justify-between">
        <span>Auditor Physical Inspection Summary:</span>
        <span class="px-2 py-0.5 rounded text-[10.5px] font-bold"
              [class.bg-emerald-100]="i.recommendation === 'RECOMMENDED'"
              [class.text-emerald-800]="i.recommendation === 'RECOMMENDED'"
              [class.bg-amber-100]="i.recommendation !== 'RECOMMENDED'"
              [class.text-amber-800]="i.recommendation !== 'RECOMMENDED'">
          Recommendation: {{ i.recommendation }}
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11.5px] text-slate-600">
        <div>
          <span class="text-slate-400 block text-[10.5px]">Auditor</span>
          <strong class="text-slate-800">{{ i.auditorName }}</strong>
        </div>
        <div>
          <span class="text-slate-400 block text-[10.5px]">Inspection Date</span>
          <strong class="text-slate-800">{{ i.inspectionDate }}</strong>
        </div>
        <div>
          <span class="text-slate-400 block text-[10.5px]">Geo Distance</span>
          <strong [class.text-emerald-700]="i.geoMatched" [class.text-rose-700]="!i.geoMatched">
            {{ i.geoDistanceMeters }}m ({{ i.geoMatched ? 'Within 100m' : 'Exceeded' }})
          </strong>
        </div>
        <div>
          <span class="text-slate-400 block text-[10.5px]">AEBAS Biometric</span>
          <strong class="text-emerald-700">Functional & Verified</strong>
        </div>
      </div>

      <div class="mt-2 text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
        "{{ i.auditorRemarks }}"
      </div>
    </div>
  `
})
export class SdcInspectionSummaryComponent {
  readonly inspection = input.required<SdcInspectionData>();
}