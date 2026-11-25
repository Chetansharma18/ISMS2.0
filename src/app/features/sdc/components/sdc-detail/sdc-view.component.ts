import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  FormInputComponent,
  FormPhotosComponent,
  FormSectionComponent,
  FormTextareaComponent
} from '../../../../shared';
import type { IpaCourseRow } from '../../../eoi/services/eoi-state.models';
import { categoryLabel } from '../../../eoi/pages/sanction-order-list/sanction-order-list.component';
import { SdcRecord } from '../../models/sdc.model';
import { IpaAllocationService } from '../../services/ipa-allocation.service';
import { IpaAllocationTableComponent } from '../ipa-allocation-table.component';

/** A field value for a read-only box: a dash when there is nothing to show. */
function show(value: string | number | null | undefined): string {
  return value == null || value === '' ? '—' : String(value);
}

/**
 * The registered SDC as the Register New SDC form shows it: same card, sections, fields and order, but read-only.
 * Every field is a disabled form control, so it looks like the form and cannot be changed here.
 */
@Component({
  selector: 'app-sdc-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormInputComponent,
    FormTextareaComponent,
    FormPhotosComponent,
    FormSectionComponent,
    IpaAllocationTableComponent
  ],
  host: { class: 'block' },
  template: `
    @let c = sdc();
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
      <!-- 1. The IPA this SDC was registered under -->
      <app-form-section class="block" title="In-Principal Approval">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-input label="IPA No." [disabled]="true" [value]="text(c.mouRefNo)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Scheme" [disabled]="true" [value]="text(c.scheme)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Scheme Category" [disabled]="true" [value]="categoryText()"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-input label="Training Partner" [disabled]="true" [value]="text(c.tpName)"></app-form-input>
          </div>
        </div>
      </app-form-section>

      <!-- 2. Center details -->
      <app-form-section class="block" title="Center Details">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Center Code" [disabled]="true" [value]="text(c.sdcCode)"></app-form-input>
          </div>
          <div class="lg:col-span-9 sm:col-span-1">
            <app-form-input label="Center Name" [disabled]="true" [value]="text(c.sdcName)"></app-form-input>
          </div>

          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="District" [disabled]="true" [value]="text(c.district)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Sector" [disabled]="true" [value]="text(c.sector)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-input label="Proposed Start Date" [disabled]="true" [value]="text(c.proposedStartDate)"></app-form-input>
          </div>

          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Training Target" [disabled]="true" [value]="target()"></app-form-input>
          </div>
          <div class="lg:col-span-8 sm:col-span-1">
            <app-form-input label="Hostel Category" [disabled]="true" [value]="text(c.hostelCategory)"></app-form-input>
          </div>

          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Total TP Trained Aspirant" [disabled]="true" [value]="text(c.totalTrainedAspirants)"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Total TP Placed Aspirant" [disabled]="true" [value]="text(c.totalPlacedAspirants)"></app-form-input>
          </div>
          <div class="lg:col-span-6 sm:col-span-2">
            <app-form-input label="Center Email" [disabled]="true" [value]="text(c.centerEmail)"></app-form-input>
          </div>
        </div>
      </app-form-section>

      <!-- 3. Courses, batches and trainees set by the IPA for this district and sector -->
      @if (ipaCourses().length > 0) {
        <app-form-section class="block" title="Courses Set by the IPA">
          <app-ipa-allocation-table [rows]="ipaCourses()"></app-ipa-allocation-table>
        </app-form-section>
      }

      <!-- 4. Location -->
      <app-form-section class="block" title="Location Details">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="State" [disabled]="true" [value]="text(c.state)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Division" [disabled]="true" [value]="text(c.division)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-input label="Block" [disabled]="true" [value]="text(c.block)"></app-form-input>
          </div>

          <div class="lg:col-span-6 sm:col-span-1">
            <app-form-input label="Assembly Constituency" [disabled]="true" [value]="text(c.assemblyConstituency)"></app-form-input>
          </div>
          <div class="lg:col-span-6 sm:col-span-1">
            <app-form-input label="Parliament Constituency" [disabled]="true" [value]="text(c.parliamentConstituency)"></app-form-input>
          </div>

          <div class="lg:col-span-9 sm:col-span-2">
            <app-form-textarea label="Address" [disabled]="true" [rows]="2" [value]="text(c.fullAddress)"></app-form-textarea>
          </div>
          <div class="lg:col-span-3 sm:col-span-2">
            <app-form-input label="Pin Code" [disabled]="true" [value]="text(c.pincode)"></app-form-input>
          </div>

          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Latitude (GPS)" [disabled]="true" [value]="text(c.latitude)"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Longitude (GPS)" [disabled]="true" [value]="text(c.longitude)"></app-form-input>
          </div>
          <div class="lg:col-span-6 sm:col-span-2">
            <app-form-input label="Remarks" [disabled]="true" [value]="text(c.remarks)"></app-form-input>
          </div>
        </div>
      </app-form-section>

      <!-- 5. Photos -->
      <app-form-section class="block" title="Center Photos">
        <app-form-photos label="Center Photos" [disabled]="true" [photos]="c.centerPhotos ?? []"></app-form-photos>
      </app-form-section>
    </div>
  `
})
export class SdcViewComponent {
  private readonly allocationService = inject(IpaAllocationService);

  readonly sdc = input.required<SdcRecord>();

  protected text(value: string | number | null | undefined): string {
    return show(value);
  }

  protected categoryText(): string {
    return categoryLabel(this.sdc().schemeCategory);
  }

  /** The target the department approved, or the one asked for. */
  protected target(): string {
    const c = this.sdc();
    return show(c.approval?.approvedTargetCapacity || c.sdcCapacity);
  }

  /** IPA course rows given to this SDC (empty for an SDC that was not registered under an IPA). */
  protected readonly ipaCourses = computed<IpaCourseRow[]>(() =>
    this.allocationService.forSdc(this.sdc().id).flatMap(allocation => {
      const ipa = this.allocationService.resolveIpa(allocation.ipaId);
      return ipa ? this.allocationService.coursesFor(ipa, allocation.district, allocation.sectors[0]) : [];
    })
  );
}
