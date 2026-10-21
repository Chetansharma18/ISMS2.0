import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormPhotosComponent } from '../../../../shared';
import type { IpaCourseRow } from '../../../eoi/services/eoi-state.models';
import { categoryLabel } from '../../../eoi/pages/sanction-order-list/sanction-order-list.component';
import type { SdcRecord } from '../../models/sdc.model';
import { IpaAllocationService } from '../../services/ipa-allocation.service';
import { IpaAllocationTableComponent } from '../ipa-allocation-table.component';
import { SdcRemarksComponent } from './sdc-remarks.component';
import { sectionNumbers, show } from './sdc-review.util';

/**
 * The registered SDC, in the same numbered-card style as the applicant review page: the IPA it was registered under,
 * the centre, the courses set by the IPA, the location, the photos, the inspection and the remarks of the department.
 */
@Component({
  selector: 'app-sdc-review-sections',
  standalone: true,
  imports: [FormPhotosComponent, IpaAllocationTableComponent, SdcRemarksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  template: `
    @let c = sdc();
    @let n = numbers();

    <!-- 1. In-Principal Approval -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="sdc-ipa-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">1</span>
        <h2 id="sdc-ipa-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">In-Principal Approval</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">IPA No.</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(c.mouRefNo) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Scheme</span>
          <span class="font-medium text-slate-900">{{ text(c.scheme) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Scheme Category</span>
          <span class="font-medium text-slate-900">{{ category() }}</span>
        </div>
        <div class="col-span-2 sm:col-span-3 lg:col-span-4">
          <span class="text-slate-500 block text-[11px] mb-0.5">Training Partner</span>
          <span class="font-medium text-slate-900">{{ text(c.tpName) }}</span>
        </div>
      </div>
    </section>

    <!-- 2. Centre details -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="sdc-centre-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">2</span>
        <h2 id="sdc-centre-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Centre Details</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">District</span>
          <span class="font-medium text-slate-900">{{ text(c.district) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Sector</span>
          <span class="font-medium text-slate-900">{{ text(c.sector) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Proposed Start Date</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(c.proposedStartDate) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Training Target</span>
          <span class="font-medium text-slate-900">{{ target() }}</span>
        </div>
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">Hostel Category</span>
          <span class="font-medium text-slate-900">{{ text(c.hostelCategory) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Total TP Trained Aspirants</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(c.totalTrainedAspirants) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Total TP Placed Aspirants</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(c.totalPlacedAspirants) }}</span>
        </div>
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">Centre Email</span>
          <span class="font-medium text-slate-900">{{ text(c.centerEmail) }}</span>
        </div>
      </div>
    </section>

    <!-- 3. Courses, batches and trainees set by the IPA for this district and sector -->
    @if (n.courses) {
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="sdc-courses-heading">
        <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">{{ n.courses }}</span>
          <h2 id="sdc-courses-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Courses Set by the IPA</h2>
        </div>
        <app-ipa-allocation-table [rows]="ipaCourses()"></app-ipa-allocation-table>
      </section>
    }

    <!-- Location -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="sdc-location-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">{{ n.location }}</span>
        <h2 id="sdc-location-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Location Details</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">State</span>
          <span class="font-medium text-slate-900">{{ text(c.state) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Division</span>
          <span class="font-medium text-slate-900">{{ text(c.division) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Block</span>
          <span class="font-medium text-slate-900">{{ text(c.block) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Pin Code</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(c.pincode) }}</span>
        </div>
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">Assembly Constituency</span>
          <span class="font-medium text-slate-900">{{ text(c.assemblyConstituency) }}</span>
        </div>
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">Parliament Constituency</span>
          <span class="font-medium text-slate-900">{{ text(c.parliamentConstituency) }}</span>
        </div>
        <div class="col-span-2 sm:col-span-3 lg:col-span-4">
          <span class="text-slate-500 block text-[11px] mb-0.5">Address</span>
          <span class="text-slate-900 leading-relaxed">{{ text(c.fullAddress) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Latitude (GPS)</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(c.latitude) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Longitude (GPS)</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(c.longitude) }}</span>
        </div>
        <div class="col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">Remarks of the Training Partner</span>
          <span class="text-slate-900 leading-relaxed">{{ text(c.remarks) }}</span>
        </div>
      </div>
    </section>

    <!-- Photos -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="sdc-photos-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">{{ n.photos }}</span>
        <h2 id="sdc-photos-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Centre Photos</h2>
      </div>
      <app-form-photos label="Centre Photos" [disabled]="true" [photos]="c.centerPhotos ?? []"></app-form-photos>
    </section>

    <!-- Inspection -->
    @if (c.inspection; as i) {
      <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="sdc-inspection-heading">
        <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">{{ n.inspection }}</span>
          <h2 id="sdc-inspection-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Physical Inspection</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Auditor</span>
            <span class="font-medium text-slate-900">{{ text(i.auditorName) }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Auditor Mobile No.</span>
            <span class="tabular-nums text-slate-900">{{ text(i.auditorPhone) }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Inspection Date</span>
            <span class="tabular-nums text-slate-900 font-medium">{{ text(i.inspectionDate) }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Recommendation</span>
            <span class="font-medium text-slate-900">{{ recommendation() }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Distance from the Centre</span>
            <span class="font-medium" [class.text-slate-900]="i.geoMatched" [class.text-red-600]="!i.geoMatched">
              {{ i.geoDistanceMeters }} m ({{ i.geoMatched ? 'within 100 m' : 'more than 100 m' }})
            </span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Centre Exists at the Address</span>
            <span class="font-medium text-slate-900">{{ yesNo(i.physicalExistenceVerified) }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Signboard Verified</span>
            <span class="font-medium text-slate-900">{{ yesNo(i.signboardVerified) }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Classrooms and Labs Verified</span>
            <span class="font-medium text-slate-900">{{ yesNo(i.classroomsLabsVerified) }}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[11px] mb-0.5">Biometric (AEBAS) Verified</span>
            <span class="font-medium text-slate-900">{{ yesNo(i.biometricAebasVerified) }}</span>
          </div>
          <div class="col-span-2 sm:col-span-3 lg:col-span-4">
            <span class="text-slate-500 block text-[11px] mb-0.5">Auditor's Remarks</span>
            <span class="text-slate-900 leading-relaxed">{{ text(i.auditorRemarks) }}</span>
          </div>
        </div>
      </section>
    }

    <!-- Remarks of the department -->
    <app-sdc-remarks [sdc]="c" [number]="n.remarks" />
  `
})
export class SdcReviewSectionsComponent {
  private readonly allocationService = inject(IpaAllocationService);

  readonly sdc = input.required<SdcRecord>();

  /** IPA course rows given to this SDC (empty for an SDC that was not registered under an IPA). */
  protected readonly ipaCourses = computed<IpaCourseRow[]>(() =>
    this.allocationService.forSdc(this.sdc().id).flatMap(allocation => {
      const ipa = this.allocationService.resolveIpa(allocation.ipaId);
      return ipa ? this.allocationService.coursesFor(ipa, allocation.district, allocation.sectors[0]) : [];
    })
  );

  protected readonly numbers = computed(() => sectionNumbers(this.ipaCourses().length > 0, !!this.sdc().inspection));

  protected readonly category = computed(() => categoryLabel(this.sdc().schemeCategory));

  /** The target the department approved, or the one asked for. */
  protected readonly target = computed(() => {
    const c = this.sdc();
    return show(c.approval?.approvedTargetCapacity || c.sdcCapacity);
  });

  protected readonly recommendation = computed(() => {
    switch (this.sdc().inspection?.recommendation) {
      case 'RECOMMENDED':
        return 'Recommended';
      case 'REJECTED':
        return 'Not recommended';
      case 'CORRECTION_REQUIRED':
        return 'Correction required';
      default:
        return '—';
    }
  });

  protected text(value: string | number | null | undefined): string {
    return show(value);
  }

  protected yesNo(value: boolean | undefined): string {
    return value ? 'Yes' : 'No';
  }
}
