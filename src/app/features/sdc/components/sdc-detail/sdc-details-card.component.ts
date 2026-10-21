import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CenterPhotoItem, SdcRecord } from '../../models/sdc.model';
import { SdcPhotoGalleryComponent } from './sdc-photo-gallery.component';

/** Read-only card with the registered centre details and infrastructure. */
@Component({
  selector: 'app-sdc-details-card',
  standalone: true,
  imports: [SdcPhotoGalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let center = sdc();
    <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-6">
      
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>Registered Center Details & Infrastructure</span>
        </h3>
        <span class="text-xs text-slate-500 tabular-nums">{{ center.sdcCode }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
        
        <!-- Row 1: Center Name (colSpan 2) + Sector (colSpan 2) -->
        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Center Name</span>
          <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ center.sdcName }}</span>
        </div>

        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sector</span>
          <span class="font-semibold text-slate-800 text-[13px] mt-0.5 block">{{ center.sector || 'Aerospace and Aviation' }}</span>
        </div>

        <!-- Row 2: State (1) + District (1) + Assembly Constituency (1) + Parliament Constituency (1) -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">State</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.state || 'Rajasthan' }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">District</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.district }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assembly Constituency</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.assemblyConstituency || 'Sanganer' }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Parliament Constituency</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.parliamentConstituency || 'Jaipur Rural' }}</span>
        </div>

        <!-- Row 3: Division (1) + Block (1) + Proposed Start Date (1) + SDC Capacity (1) -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Division</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.division || 'Jaipur' }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Block</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.block || 'Sanganer' }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Proposed Start Date</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.proposedStartDate }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">SDC Capacity</span>
          <span class="font-bold text-slate-900 text-[13px] mt-0.5 block">{{ center.sdcCapacity }} Aspirants</span>
        </div>

        <!-- Row 4: Center Email (1) + Address (2) + Pin Code (1) -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Center Email</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.centerEmail }}</span>
        </div>

        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Complete Address</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block leading-relaxed">{{ center.fullAddress }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pin Code</span>
          <span class="tabular-nums font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.pincode }}</span>
        </div>

        <!-- Row 5: Total TP Trained (1) + Total TP Placed (1) + Hostel Category (2) -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total TP Trained</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.totalTrainedAspirants ?? 500 }} Aspirants</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total TP Placed</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.totalPlacedAspirants ?? 400 }} Candidates</span>
        </div>

        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Hostel Category</span>
          <span class="font-medium text-slate-800 text-[13px] mt-0.5 block">{{ center.hostelCategory || 'Residential (Both Boys & Girls)' }}</span>
        </div>

        <!-- Row 6: Latitude (1) + Longitude (1) + Remarks (2) -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Latitude</span>
          <span class="tabular-nums text-slate-800 text-[13px] mt-0.5 block">{{ center.latitude }}</span>
        </div>

        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Longitude</span>
          <span class="tabular-nums text-slate-800 text-[13px] mt-0.5 block">{{ center.longitude }}</span>
        </div>

        <div class="sm:col-span-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Remarks</span>
          <span class="font-medium text-slate-700 text-[13px] mt-0.5 block italic">{{ center.remarks || 'Ready for auditor inspection' }}</span>
        </div>

        <!-- Row 7 (LAST): Center Photos (colSpan 4) -->
        <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100">
          <app-sdc-photo-gallery [photos]="center.centerPhotos || []" (photoOpen)="photoOpen.emit($event)" />
        </div>

      </div>

    </div>
  `
})
export class SdcDetailsCardComponent {
  readonly sdc = input.required<SdcRecord>();
  readonly photoOpen = output<CenterPhotoItem>();
}