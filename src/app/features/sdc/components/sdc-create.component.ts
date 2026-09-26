import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SdcFormComponent } from './sdc-form.component';
import { SdcService } from '../services/sdc.service';
import { SdcFormData } from '../models/sdc.model';

@Component({
  selector: 'app-sdc-create',
  standalone: true,
  imports: [CommonModule, RouterModule, SdcFormComponent],
  template: `
    <div class="min-h-full bg-[#F8FAFC] py-6 sm:py-10 px-4 font-sans selection:bg-slate-900 selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Central Elevated Form Card (Matching Screenshots 2-5) -->
      <div class="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-8">
        
        <!-- Header: Back Button + Title + Subtitle -->
        <div class="flex items-start gap-4">
          <button
            type="button"
            (click)="goBack()"
            class="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 shadow-2xs transition-all cursor-pointer shrink-0 mt-0.5"
            title="Go Back"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight leading-snug m-0">
              Register New SDC
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 m-0 mt-0.5">
              Complete the workflow to submit your training center for inspection.
            </p>
          </div>
        </div>

        <!-- 4-Step Stepper (Clean connector segments, no protruding lines outside nodes) -->
        <div class="max-w-2xl mx-auto px-2 sm:px-4 pt-2 pb-1">
          <div class="flex items-center justify-between">
            @for (step of steps; track step.number; let isLast = $last) {
              <!-- Step Node -->
              <div
                class="flex flex-col items-center cursor-pointer group select-none shrink-0"
                (click)="goToStep(step.number)"
                [attr.title]="'Go to: ' + step.label"
              >
                <!-- Number Circle -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs group-hover:scale-105"
                  [class.bg-[#0F172A]]="activeStep() >= step.number"
                  [class.text-white]="activeStep() >= step.number"
                  [class.bg-[#F1F5F9]]="activeStep() < step.number"
                  [class.text-slate-400]="activeStep() < step.number"
                  [class.border]="activeStep() < step.number"
                  [class.border-slate-200]="activeStep() < step.number"
                >
                  @if (activeStep() > step.number) {
                    <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    {{ step.number }}
                  }
                </div>
                <!-- Label -->
                <span
                  class="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-2.5 select-none"
                  [class.text-[#0F172A]]="activeStep() >= step.number"
                  [class.text-slate-400]="activeStep() < step.number"
                >
                  {{ step.label }}
                </span>
              </div>

              <!-- Connecting Line Strictly Between Nodes -->
              @if (!isLast) {
                <div class="flex-1 h-0.5 mx-2 sm:mx-3 -mt-6 bg-slate-200 relative overflow-hidden rounded-full">
                  <div
                    class="h-full bg-[#0F172A] transition-all duration-300 ease-out"
                    [style.width]="activeStep() > step.number ? '100%' : '0%'"
                  ></div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Floating Error Toast -->
        @if (errorMessage()) {
          <div class="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
            <button (click)="errorMessage.set('')" class="text-rose-500 hover:text-rose-800 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- Active Step Form -->
        <app-sdc-form
          [activeStep]="activeStep()"
          [data]="formData"
          (stepChange)="goToStep($event)"
        ></app-sdc-form>

        <!-- Bottom Action Buttons: Back on the left of Next -->
        <div class="pt-4 flex items-center justify-end gap-3">
          <!-- Back Button (on the left of Next) -->
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <svg class="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          <!-- Next / Submit Button -->
          @if (activeStep() < 4) {
            <button
              type="button"
              (click)="nextStep()"
              class="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              style="color: #ffffff !important;"
            >
              <span>Next</span>
              <span>&rarr;</span>
            </button>
          } @else if (activeStep() === 4) {
            <button
              type="button"
              (click)="submitSdcForm()"
              class="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              style="color: #ffffff !important;"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Submit Application</span>
            </button>
          }
        </div>

      </div>

    </div>
  `
})
export class SdcCreateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sdcService = inject(SdcService);
  private location = inject(Location);

  activeStep = signal<number>(1);
  errorMessage = signal<string>('');

  readonly steps = [
    { number: 1, label: '1. Organization' },
    { number: 2, label: '2. Location & Details' },
    { number: 3, label: '3. Courses & Docs' },
    { number: 4, label: '4. Review' }
  ];

  formData: SdcFormData = {
    step1: {
      scheme: 'SAMARTH',
      sdcName: 'Jaipur Excellence Center',
      mouRefNo: 'MOU/2026/001',
      tpName: 'SkillMasters Rajasthan',
      sdcCode: 'SDC-001',
      proposedStartDate: '2026-01-10',
      totalTrainedAspirants: 500,
      totalPlacedAspirants: 400
    },
    step2: {
      state: 'Rajasthan',
      district: 'Jaipur',
      assemblyConstituency: 'Sanganer',
      parliamentConstituency: 'Jaipur Rural',
      division: 'Jaipur',
      block: 'Jaipur',
      sdcCapacity: 100,
      centerEmail: 'center@example.com',
      pincode: '302029',
      fullAddress: 'Plot 42, Skill Industrial Area, Sanganer, Jaipur',
      latitude: 26.9124,
      longitude: 75.7873,
      remarks: 'Ready for auditor inspection'
    },
    step3: {
      allocatedCourses: [
        {
          courseName: 'Solar Panel Installation Technician',
          qpCode: 'ELE/Q5901',
          sector: 'Green Energy',
          nsqfLevel: 4,
          durationHours: 300
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Rental_Agreement_Center.pdf', fileSize: '2.8 MB' },
        fireNocDoc: { fileName: 'Fire_Safety_NOC_Certificate.pdf', fileSize: '1.1 MB' },
        signboardPhotoDoc: { fileName: 'Center_Front_Signboard.jpg', fileSize: '3.6 MB' },
        layoutDiagramDoc: { fileName: 'Layout_Classrooms_Labs.pdf', fileSize: '4.2 MB' }
      }
    },
    step4: {
      declarationAccepted: true
    }
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['scheme']) {
        const sch = params['scheme'].toUpperCase();
        this.formData.step1.scheme = sch as any;
      }
    });
  }

  goBack(): void {
    if (this.activeStep() > 1) {
      this.prevStep();
    } else {
      if (window.history.length > 1) {
        this.location.back();
      } else {
        this.router.navigate(['/sdcs']);
      }
    }
  }

  goToStep(stepNumber: number): void {
    if (stepNumber <= this.activeStep() || this.validateStep(this.activeStep())) {
      this.activeStep.set(stepNumber);
      this.errorMessage.set('');
    }
  }

  nextStep(): void {
    if (this.validateStep(this.activeStep())) {
      this.errorMessage.set('');
      this.activeStep.update(s => Math.min(s + 1, 4));
    }
  }

  prevStep(): void {
    this.errorMessage.set('');
    this.activeStep.update(s => Math.max(s - 1, 1));
  }

  validateStep(step: number): boolean {
    if (step === 1) {
      const s1 = this.formData.step1;
      if (!s1.scheme) {
        this.errorMessage.set('Please select a Scheme.');
        return false;
      }
      if (!s1.sdcName.trim()) {
        this.errorMessage.set('SDC Center Name is required.');
        return false;
      }
      if (!s1.mouRefNo.trim()) {
        this.errorMessage.set('MoU Reference No. is required.');
        return false;
      }
      if (!s1.tpName.trim()) {
        this.errorMessage.set('Training Provider (TP) Name is required.');
        return false;
      }
      if (!s1.sdcCode.trim()) {
        this.errorMessage.set('SDC Center Code is required.');
        return false;
      }
      if (!s1.proposedStartDate) {
        this.errorMessage.set('Proposed Start Date is required.');
        return false;
      }
    } else if (step === 2) {
      const s2 = this.formData.step2;
      if (!s2.district) {
        this.errorMessage.set('District is required.');
        return false;
      }
      if (!s2.sdcCapacity || s2.sdcCapacity <= 0) {
        this.errorMessage.set('Valid SDC Capacity (number of aspirants) is required.');
        return false;
      }
      if (!s2.centerEmail.trim()) {
        this.errorMessage.set('Official Center Email is required.');
        return false;
      }
      if (!s2.pincode || s2.pincode.length !== 6) {
        this.errorMessage.set('Valid 6-digit Pincode is required.');
        return false;
      }
      if (!s2.fullAddress.trim()) {
        this.errorMessage.set('Complete Physical Street Address is required.');
        return false;
      }
      if (!s2.latitude || !s2.longitude) {
        this.errorMessage.set('GPS Latitude & Longitude are required for physical auditor verification.');
        return false;
      }
    } else if (step === 3) {
      if (this.formData.step3.allocatedCourses.length === 0) {
        this.errorMessage.set('Please allocate at least one course for this center.');
        return false;
      }
    }
    return true;
  }

  submitSdcForm(): void {
    if (!this.validateStep(1) || !this.validateStep(2) || !this.validateStep(3)) {
      return;
    }

    const created = this.sdcService.createSdc(this.formData);
    this.router.navigate(['/tp/sanction-orders']);
  }
}
