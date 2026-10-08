import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormSdcComponent } from '../../../shared/components/form-sdc';
import { PageHeaderComponent } from '../../../shared';
import { SdcService } from '../services/sdc.service';
import { SdcNewRegistrationData, SdcScheme, CenterPhotoItem } from '../models/sdc.model';
import { getSdcFormFields, RAJASTHAN_LOCATION_DATA } from '../config/sdc-form.config';

@Component({
  selector: 'app-sdc-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormSdcComponent, PageHeaderComponent],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-4 font-sans">
        
        <!-- Standard Panoramic Page Header with Back Button and IPA badge -->
        <app-page-header
          title="Register New SDC"
          [showBack]="true"
          (back)="goBack()"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'IPA', url: '/ipa' },
            { label: 'Register SDC' }
          ]"
          [badge]="linkedIpaNumber() ? 'Linked IPA: ' + linkedIpaNumber() : undefined"
        >
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        </app-page-header>

        <!-- Notification Banner -->
        @if (errorMessage()) {
          <div class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
            <button (click)="errorMessage.set('')" class="text-rose-500 hover:text-rose-800 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- Single Page Dynamic SDC Form Directly on Page (Full Screen, No Modal) -->
        <app-form-sdc
          [fields]="formFields"
          [(model)]="formData"
          density="compact"
          layout="plain"
          [card]="false"
          [gridCols]="4"
          submitLabel="Submit Application"
          [showCancel]="false"
          [showSubmit]="true"
          [submitLoading]="isSubmitting()"
          (formSubmit)="submitSdcForm()"
        ></app-form-sdc>

      </div>
    </div>
  `
})
export class SdcCreateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sdcService = inject(SdcService);
  private location = inject(Location);

  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);
  linkedIpaNumber = signal<string>('');

  /** Exact 22 fields configured in user sequence */
  formFields: any[] = [];

  /** Form data */
  formData: SdcNewRegistrationData = {
    sdcName: '',
    tpName: 'ARNOLD SAMARTH',
    mouRefNo: '',
    sector: '',
    scheme: '' as SdcScheme,
    schemeCategory: '',
    state: 'Rajasthan',
    district: 'Jaipur',
    assemblyConstituency: '',
    parliamentConstituency: '',
    division: '',
    block: '',
    proposedStartDate: '',
    sdcCapacity: 60,
    centerEmail: '',
    fullAddress: '',
    pincode: '302029',
    remarks: 'Equipped with dedicated smart labs and biometrics',
    totalTrainedAspirants: 500,
    totalPlacedAspirants: 400,
    hostelCategory: 'Residential (Both Boys & Girls)',
    latitude: 26.8524,
    longitude: 75.8073,
    tpRemarks: 'Equipped with dedicated smart labs and biometrics',
    centerPhotos: []
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const dist = params['district'] || 'Jaipur';
      const locInfo = RAJASTHAN_LOCATION_DATA[dist] || RAJASTHAN_LOCATION_DATA['Jaipur'];

      if (params['ipaNumber']) {
        this.linkedIpaNumber.set(params['ipaNumber']);
        this.formData.mouRefNo = params['ipaNumber'];
      }
      if (params['tpName']) {
        this.formData.tpName = params['tpName'];
      }
      if (params['sector']) {
        this.formData.sector = params['sector'];
      }
      if (params['scheme']) {
        this.formData.scheme = params['scheme'].toUpperCase() as SdcScheme;
      }
      if (params['schemeCategory'] || params['category']) {
        this.formData.schemeCategory = params['schemeCategory'] || params['category'];
      }
      if (params['sanctionTarget']) {
        this.formData.sdcCapacity = Math.min(Number(params['sanctionTarget']), 100) || 60;
      }

      this.formData.district = dist;
      this.formData.state = 'Rajasthan';
      this.formData.division = locInfo?.division || dist;
      this.formData.assemblyConstituency = locInfo?.assemblyConstituencies?.[0] || 'Sanganer';
      this.formData.parliamentConstituency = locInfo?.parliamentConstituencies?.[0] || 'Jaipur Rural';
      this.formData.block = locInfo?.blocks?.[0] || dist;
      this.formData.proposedStartDate = new Date().toISOString().split('T')[0];
      this.formData.centerEmail = `sdc.${dist.toLowerCase().replace(/\s+/g, '')}@skillmasters.in`;
      this.formData.fullAddress = `Plot No. 42, Institutional Area, Jhalana Doongri, ${dist}, Rajasthan`;

      if (!this.formData.sdcName) {
        this.formData.sdcName = `${dist} Skill Development Center`;
      }

      const defaultPhotos: CenterPhotoItem[] = [
        { id: 'p1', name: 'Center_Front_Building.jpg', url: '/center-photos/center-building.jpg', size: '2.1 MB', tag: 'Photo 1' },
        { id: 'p2', name: 'IT_Computer_Lab.jpg', url: '/center-photos/computer-lab.jpg', size: '2.8 MB', tag: 'Photo 2' },
        { id: 'p3', name: 'Practical_Training_Classroom.jpg', url: '/center-photos/practical-training.jpg', size: '3.1 MB', tag: 'Photo 3' }
      ];
      this.formData.centerPhotos = defaultPhotos;

      this.formFields = getSdcFormFields({
        onSectorChange: (sector: string) => {
          this.formData.sector = sector;
        },
        onSchemeChange: (scheme: SdcScheme) => {
          this.formData.scheme = scheme;
        },
        initialDistrict: this.formData.district
      });
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/ipa']);
    }
  }

  submitSdcForm(): void {
    if (!this.formData.sdcName) {
      this.errorMessage.set('Center Name is required.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const defaultPhotos: CenterPhotoItem[] = [
        { id: 'p1', name: 'Center_Front_Building.jpg', url: '/center-photos/center-building.jpg', size: '2.1 MB', tag: 'Photo 1' },
        { id: 'p2', name: 'IT_Computer_Lab.jpg', url: '/center-photos/computer-lab.jpg', size: '2.8 MB', tag: 'Photo 2' },
        { id: 'p3', name: 'Practical_Training_Classroom.jpg', url: '/center-photos/practical-training.jpg', size: '3.1 MB', tag: 'Photo 3' }
      ];

      const payload = {
        ...this.formData,
        centerPhotos: this.formData.centerPhotos && this.formData.centerPhotos.length >= 3
          ? this.formData.centerPhotos
          : defaultPhotos
      };

      this.sdcService.createSdc(payload as any);
      this.router.navigate(['/sdcs']);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to submit SDC application.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

