import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormSdcComponent, FormSectionConfig } from '../../../shared/components/form-sdc';
import { SdcService } from '../services/sdc.service';
import { SdcNewRegistrationData, SdcScheme } from '../models/sdc.model';
import { getSdcFormFields } from '../config/sdc-form.config';

@Component({
  selector: 'app-sdc-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormSdcComponent],
  template: `
    <div class="min-h-full bg-white py-4 sm:py-6 px-4 sm:px-8 font-sans selection:bg-slate-900 selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Direct-on-Page Container (No card wrapper, directly on the page) -->
      <div class="max-w-7xl mx-auto space-y-4">
        
        <!-- Header: Back Button (with arrow + 'Back' label) + Title -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Go Back"
            >
              <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            
            <h1 class="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight leading-snug m-0">
              Register New SDC
            </h1>
          </div>
        </div>

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

        <!-- Single Page Dynamic SDC Form Directly on Page (No Card Wrapper) -->
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

  /** Exact 22 fields configured in user sequence */
  formFields: any[] = [];

  /** Form data populated with the exact fields requested by user */
  formData: SdcNewRegistrationData = {
    sdcName: 'Jaipur Skill Development Center',
    tpName: 'SkillMasters Rajasthan',
    sector: 'Aerospace and Aviation',
    scheme: 'SAMARTH',
    schemeCategory: 'RAJKVIK',
    state: 'Rajasthan',
    district: 'Jaipur',
    assemblyConstituency: 'Sanganer',
    parliamentConstituency: 'Jaipur Rural',
    division: 'Jaipur',
    block: 'Sanganer',
    proposedStartDate: '2026-01-10',
    sdcCapacity: 100,
    centerEmail: 'center@example.com',
    fullAddress: 'Plot 42, Skill Industrial Area, Sanganer, Jaipur',
    pincode: '302029',
    remarks: 'Ready for auditor inspection',
    totalTrainedAspirants: 500,
    totalPlacedAspirants: 400,
    hostelCategory: 'Residential (Both Boys & Girls)',
    latitude: 26.9124,
    longitude: 75.7873,
    tpRemarks: 'Ready for auditor inspection',
    centerPhotos: [
      {
        id: 'photo-1',
        name: 'Center_Photo_1.jpg',
        url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%230b3558"/%3E%3Ccircle cx="150" cy="80" r="30" fill="%23174a6e"/%3E%3Cpath d="M135 85 L150 70 L165 85" stroke="%23ffffff" stroke-width="3" fill="none"/%3E%3Crect x="142" y="85" width="16" height="20" fill="%23ffffff"/%3E%3Ctext x="50%25" y="140" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="13" font-weight="bold"%3ECENTER PHOTO 1%3C/text%3E%3Ctext x="50%25" y="160" dominant-baseline="middle" text-anchor="middle" fill="%2393c5fd" font-family="sans-serif" font-size="10"%3EHigh Resolution JPG%3C/text%3E%3C/svg%3E',
        size: '1.8 MB',
        tag: 'Photo 1'
      },
      {
        id: 'photo-2',
        name: 'Center_Photo_2.jpg',
        url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%230483ac"/%3E%3Crect x="80" y="40" width="140" height="70" rx="4" fill="%230b3558" stroke="%23ffffff" stroke-width="2"/%3E%3Ctext x="150" y="80" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="11"%3EPHOTO 2%3C/text%3E%3Ctext x="50%25" y="145" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="13" font-weight="bold"%3ECENTER PHOTO 2%3C/text%3E%3Ctext x="50%25" y="165" dominant-baseline="middle" text-anchor="middle" fill="%23e0f2fe" font-family="sans-serif" font-size="10"%3EHigh Resolution JPG%3C/text%3E%3C/svg%3E',
        size: '2.1 MB',
        tag: 'Photo 2'
      },
      {
        id: 'photo-3',
        name: 'Center_Photo_3.jpg',
        url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%231e3a5f"/%3E%3Crect x="110" y="45" width="80" height="50" rx="3" fill="%230b3558" stroke="%2338bdf8" stroke-width="2"/%3E%3Cpath d="M140 95 L140 110 M125 110 L155 110" stroke="%2338bdf8" stroke-width="3"/%3E%3Ctext x="50%25" y="145" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="13" font-weight="bold"%3ECENTER PHOTO 3%3C/text%3E%3Ctext x="50%25" y="165" dominant-baseline="middle" text-anchor="middle" fill="%23bae6fd" font-family="sans-serif" font-size="10"%3EHigh Resolution JPG%3C/text%3E%3C/svg%3E',
        size: '2.4 MB',
        tag: 'Photo 3'
      }
    ]
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['sector']) {
        this.formData.sector = params['sector'];
      }
      if (params['scheme']) {
        this.formData.scheme = params['scheme'].toUpperCase() as SdcScheme;
      }
      if (params['schemeCategory'] || params['category']) {
        this.formData.schemeCategory = params['schemeCategory'] || params['category'];
      }
    });

    this.formFields = getSdcFormFields({
      onSectorChange: (sector: string) => {
        this.formData.sector = sector;
      },
      onSchemeChange: (scheme: SdcScheme) => {
        this.formData.scheme = scheme;
      },
      initialDistrict: this.formData.district
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/sdcs']);
    }
  }

  submitSdcForm(): void {
    this.isSubmitting.set(true);
    try {
      this.sdcService.createSdc(this.formData as any);
      this.router.navigate(['/sdcs']);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to submit SDC application.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
