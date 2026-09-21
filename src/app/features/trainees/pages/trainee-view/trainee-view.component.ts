import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TraineeService, Trainee } from '../../../../core/services/trainee.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-trainee-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto pb-12">

      <!-- Loading State -->
      <div *ngIf="!trainee" class="flex items-center justify-center py-24">
        <div class="flex flex-col items-center gap-3 text-slate-400">
          <svg class="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <p class="text-sm font-medium">Loading aspirant details...</p>
        </div>
      </div>

      <ng-container *ngIf="trainee">
        <!-- Page Header -->
        <div class="flex items-center gap-4">
          <a routerLink="/trainees" class="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm text-slate-500">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </a>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-rsldc-navy">Aspirant Profile</h1>
            <p class="text-sm text-slate-500 mt-1">
              {{ trainee.registrationNo }} &nbsp;•&nbsp; {{ trainee.name }}
            </p>
          </div>
          <!-- Status Badge -->
          <span class="px-4 py-1.5 rounded-full text-sm font-bold border"
            [ngClass]="{
              'bg-approve-100 text-approve-700 border-approve-700/20': trainee.status === 'APPROVED',
              'bg-purple-100 text-purple-700 border-purple-700/20': trainee.status === 'ASSIGNED',
              'bg-pending-100 text-pending-700 border-pending-700/20': trainee.status === 'SUBMITTED',
              'bg-reject-100 text-reject-700 border-reject-700/20': trainee.status === 'REJECTED'
            }">
            {{ trainee.status === 'ASSIGNED' ? 'BATCH: ' + trainee.assignedBatchCode : trainee.status }}
          </span>
          <!-- Approve Button for Admin -->
          <button
            *ngIf="authService.hasRole(['DEPARTMENT_ADMIN', 'SUPER_ADMIN']) && trainee.status === 'SUBMITTED'"
            (click)="approve()"
            [disabled]="isApproving"
            class="inline-flex items-center gap-2 px-5 py-2 bg-approve-600 text-white font-bold text-sm rounded-lg shadow-md hover:bg-approve-700 transition disabled:opacity-50">
            <svg *ngIf="!isApproving" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <svg *ngIf="isApproving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ isApproving ? 'Approving...' : 'Approve' }}
          </button>
        </div>

        <!-- Identity Card -->
        <div class="bg-gradient-to-br from-rsldc-navy to-[#0f1540] rounded-2xl p-6 text-white shadow-xl">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black shrink-0">
              {{ trainee.name.charAt(0) }}
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-black">{{ trainee.name }}</h2>
              <p class="text-blue-200 text-sm mt-0.5">{{ trainee.gender }} &bull; {{ trainee.category }} &bull; {{ trainee.religion }}</p>
              <p class="text-blue-300 text-xs mt-1 font-mono">{{ trainee.registrationNo }}</p>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <p class="text-xs text-blue-300">Aadhaar</p>
              <p class="font-mono font-bold text-white">{{ trainee.aadhaarNo }}</p>
              <p class="text-xs text-blue-300 mt-1">Registered</p>
              <p class="text-sm font-semibold">{{ trainee.createdAt | date:'dd MMM yyyy' }}</p>
            </div>
          </div>
        </div>

        <!-- Stepper Header -->
        <div class="flex items-center justify-between">
          <ng-container *ngFor="let step of steps; let i = index">
            <div class="flex flex-col items-center flex-1 relative cursor-pointer" (click)="goToStep(i + 1)">
              <!-- Step Circle -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 relative"
                   [ngClass]="{
                     'bg-rsldc-navy text-white shadow-md shadow-rsldc-navy/30 ring-4 ring-rsldc-navy/20': currentStep === i + 1,
                     'bg-approve-500 text-white': currentStep > i + 1,
                     'bg-slate-200 text-slate-500 hover:bg-slate-300': currentStep < i + 1
                   }">
                <svg *ngIf="currentStep > i + 1" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span *ngIf="currentStep <= i + 1">{{ i + 1 }}</span>
              </div>
              <!-- Step Label -->
              <div class="text-xs font-bold mt-2 hidden sm:block text-center leading-tight"
                   [ngClass]="currentStep >= i + 1 ? 'text-rsldc-navy' : 'text-slate-400'">
                {{ step }}
              </div>
              <!-- Connector Line -->
              <div *ngIf="i < steps.length - 1"
                   class="absolute top-5 left-1/2 w-full h-[3px] -z-0 transition-all duration-500"
                   [ngClass]="currentStep > i + 1 ? 'bg-approve-500' : 'bg-slate-200'">
              </div>
            </div>
          </ng-container>
        </div>

        <!-- ─── STEP 1: Basic Info ─── -->
        <div *ngIf="currentStep === 1" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Basic Information</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <ng-container *ngFor="let f of basicFields">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ f.value || '—' }}</p>
              </div>
            </ng-container>
          </div>

          <h2 class="text-xl font-bold text-slate-800 mt-10 mb-6 pb-2 border-b">Training Preference</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <ng-container *ngFor="let f of preferenceFields">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ f.value || '—' }}</p>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- ─── STEP 2: Contact & Address ─── -->
        <div *ngIf="currentStep === 2" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Contact Details</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <ng-container *ngFor="let f of contactFields">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ f.value || '—' }}</p>
              </div>
            </ng-container>
          </div>

          <h2 class="text-xl font-bold text-slate-800 mt-10 mb-6 pb-2 border-b">Permanent Address</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <ng-container *ngFor="let f of permAddressFields">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ f.value || '—' }}</p>
              </div>
            </ng-container>
          </div>

          <h2 class="text-xl font-bold text-slate-800 mt-10 mb-6 pb-2 border-b">Communication Address</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <ng-container *ngFor="let f of commAddressFields">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ f.value || '—' }}</p>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- ─── STEP 3: Bank Details ─── -->
        <div *ngIf="currentStep === 3" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Bank Details</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <ng-container *ngFor="let f of bankFields">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ f.value || '—' }}</p>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- ─── STEP 4: Additional Details ─── -->
        <div *ngIf="currentStep === 4" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Additional Details</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <ng-container *ngFor="let f of additionalFields">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ f.label }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ f.value || '—' }}</p>
              </div>
            </ng-container>
          </div>

          <!-- Batch Info if assigned -->
          <ng-container *ngIf="trainee.status === 'ASSIGNED'">
            <h2 class="text-xl font-bold text-slate-800 mt-10 mb-6 pb-2 border-b">Batch Assignment</h2>
            <div class="flex items-center gap-6 bg-purple-50 rounded-xl p-5 border border-purple-200">
              <div class="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <svg class="w-7 h-7 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Assigned Batch</p>
                <p class="text-2xl font-black text-purple-700 mt-1">{{ trainee.assignedBatchCode }}</p>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-2">
          <button
            *ngIf="currentStep > 1"
            (click)="prevStep()"
            class="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Previous
          </button>
          <a *ngIf="currentStep === 1" routerLink="/trainees"
            class="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to List
          </a>

          <div class="flex items-center gap-3">
            <!-- Step Indicator -->
            <span class="text-xs text-slate-400 font-semibold">{{ currentStep }} / {{ steps.length }}</span>

            <!-- Approve on last step -->
            <button
              *ngIf="currentStep === steps.length && authService.hasRole(['DEPARTMENT_ADMIN', 'SUPER_ADMIN']) && trainee.status === 'SUBMITTED'"
              (click)="approve()"
              [disabled]="isApproving"
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-approve-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-approve-700 transition disabled:opacity-50 mr-2">
              <svg *ngIf="!isApproving" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg *ngIf="isApproving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ isApproving ? 'Approving...' : 'Approve Aspirant' }}
            </button>

            <button
              *ngIf="currentStep < steps.length"
              (click)="nextStep()"
              class="px-6 py-2.5 bg-rsldc-navy text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#0f1540] transition flex items-center gap-2">
              Next
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <a *ngIf="currentStep === steps.length" routerLink="/trainees"
              class="px-6 py-2.5 bg-rsldc-navy text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#0f1540] transition flex items-center gap-2">
              Done
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </a>
          </div>
        </div>

      </ng-container>
    </div>
  `
})
export class TraineeViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private traineeService = inject(TraineeService);
  authService = inject(AuthService);

  trainee: Trainee | null = null;
  isApproving = false;
  currentStep = 1;

  steps = ['Basic Info', 'Contact & Address', 'Bank Details', 'Additional Details'];

  basicFields: { label: string; value: string }[] = [];
  preferenceFields: { label: string; value: string }[] = [];
  contactFields: { label: string; value: string }[] = [];
  permAddressFields: { label: string; value: string }[] = [];
  commAddressFields: { label: string; value: string }[] = [];
  bankFields: { label: string; value: string }[] = [];
  additionalFields: { label: string; value: string }[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.traineeService.trainees$.subscribe(trainees => {
      const found = trainees.find(t => t.id === id);
      if (found) {
        this.trainee = found;
        this.buildFields(found);
      } else if (trainees.length > 0) {
        this.router.navigate(['/trainees']);
      }
    });
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < this.steps.length) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  private buildFields(t: Trainee) {
    this.basicFields = [
      { label: 'Aspirant Category', value: t.aspirantCategory },
      { label: 'Aadhaar No.', value: t.aadhaarNo },
      { label: 'Janaadhaar ID', value: t.janaadhaarId },
      { label: 'Name of Aspirant', value: t.name },
      { label: 'Gender', value: t.gender },
      { label: 'Relation Type', value: t.relationType },
      { label: "Mother's Name", value: t.motherName },
      { label: 'Date of Birth', value: t.dob },
      { label: 'Age', value: t.age?.toString() },
      { label: 'Education', value: t.education },
      { label: 'Religion', value: t.religion },
      { label: 'Category', value: t.category },
      { label: 'Category Type', value: t.aspirantCategoryType },
    ];
    this.preferenceFields = [
      { label: 'Preferred District', value: t.trainingPreferredDistrict },
      { label: 'Type of Employment', value: t.typeOfEmployment },
      { label: 'Rural / Urban', value: t.ruralUrban },
      { label: 'Work Outside Rajasthan', value: t.workOutOfRajasthan ? 'Yes' : 'No' },
    ];
    this.contactFields = [
      { label: 'Mobile Number', value: t.mobile },
      { label: 'Alternate Mobile', value: t.altMobile },
      { label: 'Landline Number', value: t.landlineNumber },
      { label: 'Email Id', value: t.email },
    ];
    const addrFields = (a: any) => [
      { label: 'House No.', value: a?.houseNo },
      { label: 'Street/Colony Name', value: a?.streetName },
      { label: 'Ward No.', value: a?.wardNo },
      { label: 'Village/Town/City', value: a?.villageTownCity },
      { label: 'District', value: a?.district },
      { label: 'Block Name', value: a?.blockName },
      { label: 'Tehsil', value: a?.tehsil },
      { label: 'Municipality/Panchayat', value: a?.municipality },
      { label: 'Pincode', value: a?.pincode },
    ];
    this.permAddressFields = addrFields(t.permanentAddress);
    this.commAddressFields = addrFields(t.communicationAddress);
    this.bankFields = [
      { label: 'Account No.', value: t.accountNo },
      { label: 'Account Name', value: t.accountName },
      { label: 'Account Type', value: t.accountType },
      { label: 'Bank Name', value: t.bankName },
      { label: 'Bank Branch', value: t.branchName },
      { label: 'IFSC Code', value: t.ifscCode },
      { label: 'MICR Code', value: t.micrCode },
    ];
    this.additionalFields = [
      { label: 'Course Name', value: t.courseName },
      { label: 'Scheme Enquiry', value: t.schemeEnquiry },
      { label: 'Special Ability', value: t.specialAbility },
      { label: 'Annual Family Income', value: t.annualFamilyIncome },
      { label: 'Economic Status', value: t.economicStatus },
      { label: 'Income Slab (Annual)', value: t.incomeSlab },
      { label: 'BOCW No.', value: t.bocwNo },
      { label: 'MGNREGA No.', value: t.mgnregaNo },
      { label: 'RSBY No.', value: t.rsbyNo },
      { label: 'NRLM No. (SHG)', value: t.nrlmNo },
      { label: 'EPIC No.', value: t.epicNo },
    ];
  }

  approve() {
    if (!this.trainee || this.isApproving) return;
    this.isApproving = true;
    this.traineeService.approveTrainee(this.trainee.id).subscribe({
      next: () => { this.isApproving = false; },
      error: () => { this.isApproving = false; }
    });
  }
}
