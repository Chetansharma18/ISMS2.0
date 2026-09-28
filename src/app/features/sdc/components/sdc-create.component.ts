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
    <div class="min-h-full bg-white py-4 sm:py-6 px-4 sm:px-8 font-sans selection:bg-[#174A6E] selection:text-white" style="font-family: 'Inter', sans-serif;">
      
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
            
            <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug m-0">
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
        name: 'Center_Front_Building.jpg',
        url: '/center-photos/center-building.jpg',
        size: '2.4 MB',
        tag: 'Photo 1'
      },
      {
        id: 'photo-2',
        name: 'IT_Computer_Lab.jpg',
        url: '/center-photos/computer-lab.jpg',
        size: '2.8 MB',
        tag: 'Photo 2'
      },
      {
        id: 'photo-3',
        name: 'Practical_Training_Classroom.jpg',
        url: '/center-photos/practical-training.jpg',
        size: '3.1 MB',
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
