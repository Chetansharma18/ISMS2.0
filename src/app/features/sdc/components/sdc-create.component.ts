import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  FormInputComponent,
  FormPhotosComponent,
  FormSectionComponent,
  FormSelectComponent,
  FormTextareaComponent,
  IconComponent,
  PageShellComponent
} from '../../../shared';
import { REGEX_PATTERNS } from '../../../shared/utils/validators.util';
import { SdcService } from '../services/sdc.service';
import { categoryLabel } from '../../eoi/pages/sanction-order-list/sanction-order-list.component';
import { IpaAllocationService } from '../services/ipa-allocation.service';
import type { ResolvedIpa } from '../models/ipa-allocation.model';
import type { IpaCourseRow } from '../../eoi/services/eoi-state.models';
import { IpaAllocationTableComponent } from './ipa-allocation-table.component';
import { SdcNewRegistrationData, SdcScheme, SDC_SECTOR_OPTIONS } from '../models/sdc.model';
import { DistrictInfo, HOSTEL_CATEGORY_OPTIONS, RAJASTHAN_LOCATION_DATA } from '../config/sdc-form.config';

type NumberKey = 'sdcCapacity' | 'totalTrainedAspirants' | 'totalPlacedAspirants' | 'latitude' | 'longitude';

const MIN_PHOTOS = 3;

/** District data of a district that is not chosen yet (or has no data): the dependent dropdowns are empty. */
const NO_LOCATION: DistrictInfo = { division: '', assemblyConstituencies: [], parliamentConstituencies: [], blocks: [] };

/**
 * Register New SDC: one page, same design as the Organization Registration form and the Apply for EOI form
 * (back button, title row, white card, app-form-* controls in a 12-column grid, large footer buttons),
 * but without steps: the sections sit one below the other and everything is submitted together.
 *
 * Nothing is prefilled. When the SDC is registered against an IPA, the district and the sector can only be
 * the ones the IPA sanctions: a single district or sector is already selected and locked, and when the IPA
 * has more than one the partner picks from those only. The IPA then sets the courses, batches and target.
 *
 * The form object is edited in place, so this component stays on the default change detection.
 */
@Component({
  selector: 'app-sdc-create',
  standalone: true,
  imports: [
    ButtonComponent,
    IconComponent,
    PageShellComponent,
    FormSectionComponent,
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormPhotosComponent,
    IpaAllocationTableComponent
  ],
  template: `
    <app-page-shell>
      @let errs = errors();

      <!-- Back button, title row and subtitle (same as the registration form) -->
      <div class="space-y-3">
        <div>
          <button appButton variant="outline" size="sm" type="button" (click)="goBack()">
            <app-icon name="back" />
            <span>Back</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 flex-wrap min-w-0">
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">Register New SDC</h1>
          </div>
          <span class="text-xs text-slate-500 font-medium select-none">
            Fields marked with <span class="text-rose-500 font-bold">*</span> are mandatory
          </span>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
          Please provide the details of the Skill Development Centre to be registered under the approved target.
        </p>
      </div>

      @if (errorMessage()) {
        <div id="sdc-form-error" role="alert" class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <app-icon name="alert-triangle" [stroke]="2" class="text-rose-600 shrink-0" />
            <span>{{ errorMessage() }}</span>
          </div>
          <button appButton variant="ghost" size="sm" iconOnly type="button" aria-label="Dismiss" (click)="errorMessage.set('')">
            <app-icon name="close" size="xs" />
          </button>
        </div>
      }

      <!-- A div, not a <form>: the app-form-select search box uses ngModel, which must not sit inside an NgForm. -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
        <!-- 1. The IPA this SDC is registered under -->
        @if (ipa(); as ipa) {
          <app-form-section class="block" title="In-Principal Approval">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
              <div class="lg:col-span-4 sm:col-span-2">
                <app-form-input label="IPA No." [disabled]="true" [value]="ipa.ipaNumber"></app-form-input>
              </div>
              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-input label="Scheme" [disabled]="true" [value]="formData.scheme ?? ''"></app-form-input>
              </div>
              <div class="lg:col-span-2 sm:col-span-1">
                <app-form-input label="Scheme Category" [disabled]="true" [value]="schemeCategoryLabel"></app-form-input>
              </div>
              <div class="lg:col-span-4 sm:col-span-2">
                <app-form-input label="Training Partner" [disabled]="true" [value]="formData.tpName"></app-form-input>
              </div>
            </div>
          </app-form-section>
        }

        <!-- 2. Center details -->
        <app-form-section class="block" title="Center Details">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
            <div class="lg:col-span-12 sm:col-span-2">
              <app-form-input
                label="Center Name"
                placeholder="Enter center name"
                [required]="true"
                [maxLength]="150"
                [value]="formData.sdcName ?? ''"
                (valueChange)="formData.sdcName = $event"
                [error]="errs['sdcName']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-4 sm:col-span-1">
              <app-form-select
                label="District"
                placeholder="Select district"
                [required]="true"
                [disabled]="districtLocked"
                [options]="districtOptions"
                [value]="formData.district"
                (valueChange)="onDistrictChange($event)"
                [error]="errs['district']"
              ></app-form-select>
            </div>

            <div class="lg:col-span-4 sm:col-span-1">
              <app-form-select
                label="Sector"
                placeholder="Select sector"
                [required]="true"
                [disabled]="sectorLocked"
                [options]="sectorOptions"
                [value]="formData.sector ?? ''"
                (valueChange)="onSectorChange($event)"
                [error]="errs['sector']"
              ></app-form-select>
            </div>

            <div class="lg:col-span-4 sm:col-span-2">
              <app-form-input
                label="Proposed Start Date"
                type="date"
                [required]="true"
                [value]="formData.proposedStartDate"
                (valueChange)="formData.proposedStartDate = $event"
                [error]="errs['proposedStartDate']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-4 sm:col-span-1">
              <app-form-input
                [label]="ipa() ? 'Training Target (from IPA)' : 'SDC Capacity'"
                type="number"
                placeholder="Enter capacity"
                [required]="true"
                [readonly]="!!ipa()"
                [value]="numText.sdcCapacity"
                (valueChange)="setNumber('sdcCapacity', $event)"
                [error]="errs['sdcCapacity']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-8 sm:col-span-1">
              <app-form-select
                label="Hostel Category"
                placeholder="Select hostel category"
                [options]="hostelOptions"
                [value]="formData.hostelCategory ?? ''"
                (valueChange)="formData.hostelCategory = $event"
              ></app-form-select>
            </div>

            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input
                label="Total TP Trained Aspirant"
                type="number"
                placeholder="Enter number"
                [value]="numText.totalTrainedAspirants"
                (valueChange)="setNumber('totalTrainedAspirants', $event)"
                [error]="errs['totalTrainedAspirants']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input
                label="Total TP Placed Aspirant"
                type="number"
                placeholder="Enter number"
                [value]="numText.totalPlacedAspirants"
                (valueChange)="setNumber('totalPlacedAspirants', $event)"
                [error]="errs['totalPlacedAspirants']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-6 sm:col-span-2">
              <app-form-input
                label="Center Email"
                type="email"
                placeholder="center@example.com"
                [required]="true"
                [maxLength]="80"
                [value]="formData.centerEmail"
                (valueChange)="formData.centerEmail = $event"
                [error]="errs['centerEmail']"
              ></app-form-input>
            </div>
          </div>
        </app-form-section>

        <!-- 3. Courses, batches and trainees set by the IPA for the chosen district and sector -->
        @if (ipa()) {
          <app-form-section class="block" title="Courses Set by the IPA">
            @if (ipaCourses.length > 0) {
              <p class="text-xs text-slate-600 leading-relaxed m-0 mb-2">
                The IPA sets these courses, batches and trainees for {{ formData.sector }} in {{ formData.district }}. This new SDC
                runs all of them. It is a new SDC for this IPA, even if the building is the same as an earlier one.
              </p>
              <app-ipa-allocation-table [rows]="ipaCourses"></app-ipa-allocation-table>
            } @else {
              <p class="text-xs text-slate-500 m-0">Select the district and sector to see the courses the IPA sets for them.</p>
            }
            @if (errs['allocation']) {
              <p class="text-xs text-rose-600 m-0 mt-2" role="alert">{{ errs['allocation'] }}</p>
            }
          </app-form-section>
        }

        <!-- 4. Location -->
        <app-form-section class="block" title="Location Details">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
            <div class="lg:col-span-4 sm:col-span-1">
              <app-form-select
                label="State"
                [required]="true"
                [disabled]="true"
                [options]="stateOptions"
                [value]="formData.state"
              ></app-form-select>
            </div>

            <div class="lg:col-span-4 sm:col-span-1">
              <app-form-input
                label="Division"
                placeholder="Filled from the district"
                [readonly]="true"
                [value]="formData.division ?? ''"
              ></app-form-input>
            </div>

            <div class="lg:col-span-4 sm:col-span-2">
              <app-form-select
                label="Block"
                placeholder="Select block"
                [required]="true"
                [options]="locationInfo.blocks"
                [value]="formData.block ?? ''"
                (valueChange)="formData.block = $event"
                [error]="errs['block']"
              ></app-form-select>
            </div>

            <div class="lg:col-span-6 sm:col-span-1">
              <app-form-select
                label="Assembly Constituency"
                placeholder="Select assembly constituency"
                [required]="true"
                [options]="locationInfo.assemblyConstituencies"
                [value]="formData.assemblyConstituency ?? ''"
                (valueChange)="formData.assemblyConstituency = $event"
                [error]="errs['assemblyConstituency']"
              ></app-form-select>
            </div>

            <div class="lg:col-span-6 sm:col-span-1">
              <app-form-select
                label="Parliament Constituency"
                placeholder="Select parliament constituency"
                [required]="true"
                [options]="locationInfo.parliamentConstituencies"
                [value]="formData.parliamentConstituency ?? ''"
                (valueChange)="formData.parliamentConstituency = $event"
                [error]="errs['parliamentConstituency']"
              ></app-form-select>
            </div>

            <div class="lg:col-span-9 sm:col-span-2">
              <app-form-textarea
                label="Address"
                placeholder="Enter the full address of the center"
                [required]="true"
                [rows]="2"
                [maxLength]="250"
                [value]="formData.fullAddress"
                (valueChange)="formData.fullAddress = $event"
                [error]="errs['fullAddress']"
              ></app-form-textarea>
            </div>

            <div class="lg:col-span-3 sm:col-span-2">
              <app-form-input
                label="Pin Code"
                placeholder="6-digit pin code"
                [required]="true"
                [maxLength]="6"
                [value]="formData.pincode"
                (valueChange)="formData.pincode = $event"
                [error]="errs['pincode']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input
                label="Latitude (GPS)"
                placeholder="e.g. 26.9124"
                [value]="numText.latitude"
                (valueChange)="setNumber('latitude', $event)"
                [error]="errs['latitude']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input
                label="Longitude (GPS)"
                placeholder="e.g. 75.7873"
                [value]="numText.longitude"
                (valueChange)="setNumber('longitude', $event)"
                [error]="errs['longitude']"
              ></app-form-input>
            </div>

            <div class="lg:col-span-6 sm:col-span-2">
              <app-form-input
                label="Remarks"
                placeholder="Any note for the department"
                [maxLength]="300"
                [value]="formData.remarks ?? ''"
                (valueChange)="onRemarksChange($event)"
              ></app-form-input>
            </div>
          </div>
        </app-form-section>

        <!-- 5. Photos -->
        <app-form-section class="block" title="Center Photos">
          <app-form-photos
            label="Upload Center Photos"
            [required]="true"
            [minPhotos]="minPhotos"
            [photos]="formData.centerPhotos ?? []"
            (photosChange)="formData.centerPhotos = $event"
            [error]="errs['centerPhotos']"
          ></app-form-photos>
        </app-form-section>

        <!-- Footer buttons (same as the registration form) -->
        <div class="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button appButton variant="outline" size="lg" type="button" (click)="goBack()">
            <app-icon name="close" />
            <span>Cancel</span>
          </button>
          <button appButton size="lg" type="button" [loading]="isSubmitting()" (click)="submitSdcForm()">
            <span>Submit Application</span>
          </button>
        </div>
      </div>
    </app-page-shell>
  `
})
export class SdcCreateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private sdcService = inject(SdcService);
  private location = inject(Location);
  private allocationService = inject(IpaAllocationService);

  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  /** Turns on the field messages after the first submit attempt. */
  submitted = signal<boolean>(false);

  readonly minPhotos = MIN_PHOTOS;
  readonly hostelOptions = HOSTEL_CATEGORY_OPTIONS;
  readonly stateOptions = ['Rajasthan'];

  /** The IPA this SDC is registered against (empty for an SDC registered without one). */
  readonly ipa = signal<ResolvedIpa | null>(null);
  /** Scheme category of the IPA in normal case ("Rajvik", "Samarth"). */
  schemeCategoryLabel = '';

  /** Districts the partner can pick: the open districts of the IPA, or every district without an IPA. */
  districtOptions: string[] = Object.keys(RAJASTHAN_LOCATION_DATA);
  /** Sectors the partner can pick for the chosen district. */
  sectorOptions: string[] = [...SDC_SECTOR_OPTIONS];
  /** Course rows the IPA sets for the chosen district and sector. The new SDC runs all of them. */
  ipaCourses: IpaCourseRow[] = [];

  /** With an IPA, a single district (or sector) is already selected and locked. */
  get districtLocked(): boolean {
    return !!this.ipa() && this.districtOptions.length <= 1;
  }

  get sectorLocked(): boolean {
    return !!this.ipa() && (!this.formData.district || this.sectorOptions.length <= 1);
  }

  /** Form data: nothing is prefilled. */
  formData: SdcNewRegistrationData = {
    sdcName: '',
    tpName: '',
    mouRefNo: '',
    sector: '',
    scheme: '' as SdcScheme,
    schemeCategory: '',
    state: 'Rajasthan',
    district: '',
    assemblyConstituency: '',
    parliamentConstituency: '',
    division: '',
    block: '',
    proposedStartDate: '',
    sdcCapacity: null,
    centerEmail: '',
    fullAddress: '',
    pincode: '',
    remarks: '',
    totalTrainedAspirants: null,
    totalPlacedAspirants: null,
    hostelCategory: '',
    latitude: null,
    longitude: null,
    tpRemarks: '',
    centerPhotos: []
  };

  /** What the number boxes show (text), so typing "26." or clearing a box is not rewritten. */
  numText: Record<NumberKey, string> = {
    sdcCapacity: '',
    totalTrainedAspirants: '',
    totalPlacedAspirants: '',
    latitude: '',
    longitude: ''
  };

  /** District data for the dependent dropdowns (assembly, parliament, block); empty until a district is chosen. */
  get locationInfo(): DistrictInfo {
    return RAJASTHAN_LOCATION_DATA[this.formData.district] ?? NO_LOCATION;
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['tpName']) this.formData.tpName = params['tpName'];
      if (params['scheme']) this.formData.scheme = params['scheme'].toUpperCase() as SdcScheme;
      if (params['schemeCategory'] || params['category']) {
        this.formData.schemeCategory = params['schemeCategory'] || params['category'];
      }

      const ipa = params['ipaId'] ? this.allocationService.resolveIpa(params['ipaId']) : null;
      this.ipa.set(ipa);
      if (!ipa) return;

      this.formData.mouRefNo = ipa.ipaNumber;
      this.formData.tpName = ipa.tpName || this.formData.tpName;
      this.schemeCategoryLabel = categoryLabel(this.formData.schemeCategory);

      // The IPA allows one new SDC for each of its districts and sectors; only those still without one are offered.
      this.districtOptions = this.allocationService.openDistricts(ipa);
      if (this.districtOptions.length === 0) {
        this.districtOptions = ipa.districts;
        this.errorMessage.set('Every SDC of this IPA is already registered.');
      } else if (this.districtOptions.length === 1) {
        this.onDistrictChange(this.districtOptions[0]);
      } else {
        this.refreshSectors();
      }
    });
  }

  onDistrictChange(district: string): void {
    this.formData.district = district;
    const info = RAJASTHAN_LOCATION_DATA[district] ?? NO_LOCATION;
    // The location dropdowns depend on the district, so they start empty again.
    this.formData.division = info.division;
    this.formData.assemblyConstituency = '';
    this.formData.parliamentConstituency = '';
    this.formData.block = '';
    this.refreshSectors();
  }

  onSectorChange(sector: string): void {
    this.formData.sector = sector;
    this.refreshIpaCourses();
  }

  /** Sectors the partner can pick in the chosen district; a single one is selected for them. */
  private refreshSectors(): void {
    const ipa = this.ipa();
    if (!ipa) return;
    this.sectorOptions = this.formData.district ? this.allocationService.openSectors(ipa, this.formData.district) : [];
    if (this.sectorOptions.length === 1) {
      this.formData.sector = this.sectorOptions[0];
    } else if (!this.sectorOptions.includes(this.formData.sector ?? '')) {
      this.formData.sector = '';
    }
    this.refreshIpaCourses();
  }

  /** Reads the courses the IPA sets for the chosen district and sector: they fix the training target. */
  private refreshIpaCourses(): void {
    const ipa = this.ipa();
    if (!ipa) return;
    const { district, sector } = this.formData;
    this.ipaCourses = district && sector ? this.allocationService.coursesFor(ipa, district, sector) : [];
    const target = this.ipaCourses.length > 0 ? this.allocationService.ipaTarget(ipa, district, sector) : null;
    this.formData.sdcCapacity = target;
    this.numText.sdcCapacity = target == null ? '' : String(target);
  }

  onRemarksChange(value: string): void {
    this.formData.remarks = value;
    this.formData.tpRemarks = value;
  }

  setNumber(key: NumberKey, raw: string): void {
    this.numText[key] = raw;
    const text = raw.trim();
    this.formData[key] = text === '' || Number.isNaN(Number(text)) ? null : Number(text);
  }

  /** Field messages (empty until the first submit attempt). */
  errors(): Record<string, string> {
    if (!this.submitted()) return {};
    const f = this.formData;
    const e: Record<string, string> = {};

    if (!f.sdcName?.trim()) e['sdcName'] = 'Center Name is required';
    if (!f.district) e['district'] = 'Please select a District';
    if (!f.sector) e['sector'] = 'Please select a Sector';
    const ipa = this.ipa();
    if (ipa) {
      const slotOpen = this.allocationService
        .openSlots(ipa)
        .some(s => s.district.trim().toLowerCase() === f.district.trim().toLowerCase() && s.sector.trim().toLowerCase() === (f.sector ?? '').trim().toLowerCase());
      if (f.district && f.sector && this.ipaCourses.length === 0) {
        e['allocation'] = 'The IPA sets no course for this district and sector';
      } else if (f.district && f.sector && !slotOpen) {
        e['allocation'] = 'The SDC for this district and sector of the IPA is already registered';
      }
    } else if (f.sdcCapacity == null || f.sdcCapacity < 1 || f.sdcCapacity > 5000) {
      e['sdcCapacity'] = 'Enter a capacity between 1 and 5000';
    }
    if (!f.proposedStartDate) e['proposedStartDate'] = 'Proposed Start Date is required';
    if (f.totalTrainedAspirants != null && f.totalTrainedAspirants < 0) e['totalTrainedAspirants'] = 'Enter 0 or more';
    if (f.totalPlacedAspirants != null && f.totalPlacedAspirants < 0) e['totalPlacedAspirants'] = 'Enter 0 or more';

    if (!f.centerEmail?.trim()) e['centerEmail'] = 'Center Email is required';
    else if (!REGEX_PATTERNS.EMAIL.test(f.centerEmail.trim())) e['centerEmail'] = 'Enter a valid email address';

    if (!f.assemblyConstituency) e['assemblyConstituency'] = 'Please select an Assembly Constituency';
    if (!f.parliamentConstituency) e['parliamentConstituency'] = 'Please select a Parliament Constituency';
    if (!f.block) e['block'] = 'Please select a Block';
    if (!REGEX_PATTERNS.PINCODE.test((f.pincode ?? '').trim())) e['pincode'] = 'Pin Code must be a 6-digit numeric code';
    if ((f.fullAddress ?? '').trim().length < 10) e['fullAddress'] = 'Address must be at least 10 characters';

    if (this.numText.latitude.trim() !== '' && (f.latitude == null || f.latitude < -90 || f.latitude > 90)) {
      e['latitude'] = 'Latitude must be between -90 and 90';
    }
    if (this.numText.longitude.trim() !== '' && (f.longitude == null || f.longitude < -180 || f.longitude > 180)) {
      e['longitude'] = 'Longitude must be between -180 and 180';
    }

    if ((f.centerPhotos?.length ?? 0) < MIN_PHOTOS) e['centerPhotos'] = `Upload at least ${MIN_PHOTOS} center photos`;

    return e;
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/ipa']);
    }
  }

  submitSdcForm(): void {
    this.submitted.set(true);
    if (Object.keys(this.errors()).length > 0) {
      this.errorMessage.set('Please correct the highlighted fields before submitting.');
      setTimeout(() => document.getElementById('sdc-form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);
    try {
      const ipa = this.ipa();
      const sdc = this.sdcService.createSdc({ ...this.formData } as never);
      if (ipa) {
        // The new SDC needs the department's approval; the IPA allocation follows the status of the SDC.
        this.allocationService.create({
          ipa,
          scheme: [this.formData.scheme, this.formData.schemeCategory].filter(Boolean).join('-'),
          sdcId: sdc.id,
          sdcName: sdc.sdcName,
          district: this.formData.district,
          sector: this.formData.sector ?? ''
        });
      }
      this.router.navigate(['/sdcs']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to submit SDC application.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
