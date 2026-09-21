import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TraineeService } from '../../../../core/services/trainee.service';
import { UiInputComponent } from '../../../../shared/components/ui/ui-input/ui-input.component';
import { UiSelectComponent } from '../../../../shared/components/ui/ui-select/ui-select.component';

@Component({
  selector: 'app-trainee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UiInputComponent, UiSelectComponent],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto pb-12">
      <!-- Page Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/trainees" class="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm text-slate-500">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Aspirant Registration Form</h1>
          <p class="text-sm text-slate-500 mt-1">Register a new candidate in the ISMS portal.</p>
        </div>
      </div>

      <!-- Stepper Header -->
      <div class="flex items-center justify-between mb-8">
        <ng-container *ngFor="let step of steps; let i = index">
          <div class="flex flex-col items-center flex-1 relative">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 relative"
                 [ngClass]="{
                   'bg-rsldc-navy text-white shadow-md': currentStep === i + 1,
                   'bg-approve-500 text-white': currentStep > i + 1,
                   'bg-slate-200 text-slate-500': currentStep < i + 1
                 }">
              {{ currentStep > i + 1 ? '✓' : i + 1 }}
            </div>
            <div class="text-xs font-bold mt-2 hidden sm:block" 
                 [ngClass]="currentStep >= i + 1 ? 'text-rsldc-navy' : 'text-slate-400'">
              {{ step }}
            </div>
            <!-- Connector Line -->
            <div *ngIf="i < steps.length - 1" class="absolute top-5 left-1/2 w-full h-[3px] -z-0"
                 [ngClass]="currentStep > i + 1 ? 'bg-approve-500' : 'bg-slate-200'"></div>
          </div>
        </ng-container>
      </div>

      <form [formGroup]="traineeForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- STEP 1: Basic Info -->
        <div *ngIf="currentStep === 1" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Basic Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <app-ui-select formControlName="aspirantCategory" label="Aspirant Category" [required]="true" [options]="[{label:'General',value:'General'}]"></app-ui-select>
            <app-ui-input formControlName="aadhaarNo" label="Aadhaar No." [required]="true"></app-ui-input>
            <app-ui-input formControlName="janaadhaarId" label="Janaadhaar ID"></app-ui-input>
            <app-ui-input formControlName="name" label="Name of Aspirant" [required]="true"></app-ui-input>
            <app-ui-select formControlName="gender" label="Gender" [required]="true" [options]="[{label:'Male',value:'Male'},{label:'Female',value:'Female'},{label:'Other',value:'Other'}]"></app-ui-select>
            <app-ui-select formControlName="relationType" label="Select Relation" [required]="true" [options]="[{label:'Father',value:'Father'},{label:'Mother',value:'Mother'},{label:'Guardian',value:'Guardian'}]"></app-ui-select>
            <app-ui-input formControlName="motherName" label="Mother's Name"></app-ui-input>
            <app-ui-input formControlName="dob" type="date" label="Date of Birth" [required]="true"></app-ui-input>
            <app-ui-input formControlName="age" type="number" label="Age"></app-ui-input>
            <app-ui-select formControlName="education" label="Educational Qualification" [required]="true" [options]="[{label:'8th Pass',value:'8th Pass'},{label:'10th Pass',value:'10th Pass'},{label:'12th Pass',value:'12th Pass'},{label:'Graduate',value:'Graduate'}]"></app-ui-select>
            <app-ui-select formControlName="religion" label="Religion" [required]="true" [options]="[{label:'Hindu',value:'Hindu'},{label:'Muslim',value:'Muslim'},{label:'Sikh',value:'Sikh'}]"></app-ui-select>
            <app-ui-select formControlName="category" label="Category" [required]="true" [options]="[{label:'OBC',value:'OBC'},{label:'SC',value:'SC'},{label:'ST',value:'ST'},{label:'General',value:'General'}]"></app-ui-select>
            <app-ui-select formControlName="aspirantCategoryType" label="Aspirant Category Type" [required]="true" [options]="[{label:'Type A',value:'Type A'}]"></app-ui-select>
          </div>
          
          <h2 class="text-xl font-bold text-slate-800 mt-8 mb-6 pb-2 border-b">Training Preference</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <app-ui-select formControlName="trainingPreferredDistrict" label="Training Preferred District" [options]="[{label:'Ajmer',value:'Ajmer'},{label:'Jaipur',value:'Jaipur'}]"></app-ui-select>
            <app-ui-select formControlName="typeOfEmployment" label="Type of Employment" [options]="[{label:'Wage Employment',value:'Wage Employment'},{label:'Self Employment',value:'Self Employment'}]"></app-ui-select>
            <app-ui-select formControlName="ruralUrban" label="Rural/Urban" [options]="[{label:'Rural',value:'Rural'},{label:'Urban',value:'Urban'}]"></app-ui-select>
          </div>
        </div>

        <!-- STEP 2: Contact & Address -->
        <div *ngIf="currentStep === 2" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Contact Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <app-ui-input formControlName="mobile" type="tel" label="Mobile Number" [required]="true"></app-ui-input>
            <app-ui-input formControlName="altMobile" type="tel" label="Alternate Mobile Number"></app-ui-input>
            <app-ui-input formControlName="landlineNumber" label="Landline Number"></app-ui-input>
            <app-ui-input formControlName="email" type="email" label="Email Id"></app-ui-input>
          </div>

          <h2 class="text-xl font-bold text-slate-800 mt-8 mb-6 pb-2 border-b">Permanent Address</h2>
          <div formGroupName="permanentAddress" class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <app-ui-input formControlName="houseNo" label="House No."></app-ui-input>
            <app-ui-input formControlName="streetName" label="Street/Colony Name"></app-ui-input>
            <app-ui-input formControlName="wardNo" label="Ward No."></app-ui-input>
            <app-ui-input formControlName="villageTownCity" label="Village/Town/City Name"></app-ui-input>
            <app-ui-input formControlName="district" label="District"></app-ui-input>
            <app-ui-input formControlName="blockName" label="Block Name"></app-ui-input>
            <app-ui-input formControlName="tehsil" label="Tehsil"></app-ui-input>
            <app-ui-input formControlName="municipality" label="Municipality/Panchayat"></app-ui-input>
            <app-ui-input formControlName="pincode" label="Pincode"></app-ui-input>
          </div>

          <div class="flex items-center gap-3 mt-8 mb-6 pb-2 border-b">
            <h2 class="text-xl font-bold text-slate-800">Communication Address</h2>
            <label class="flex items-center gap-2 text-sm text-rsldc-navy font-semibold bg-rsldc-navy/5 px-3 py-1 rounded cursor-pointer">
              <input type="checkbox" (change)="copyAddress($event)" class="rounded text-rsldc-navy focus:ring-rsldc-navy"> Same as Permanent
            </label>
          </div>
          <div formGroupName="communicationAddress" class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <app-ui-input formControlName="houseNo" label="House No."></app-ui-input>
            <app-ui-input formControlName="streetName" label="Street/Colony Name"></app-ui-input>
            <app-ui-input formControlName="wardNo" label="Ward No."></app-ui-input>
            <app-ui-input formControlName="villageTownCity" label="Village/Town/City Name"></app-ui-input>
            <app-ui-input formControlName="district" label="District"></app-ui-input>
            <app-ui-input formControlName="blockName" label="Block Name"></app-ui-input>
            <app-ui-input formControlName="tehsil" label="Tehsil"></app-ui-input>
            <app-ui-input formControlName="municipality" label="Municipality/Panchayat"></app-ui-input>
            <app-ui-input formControlName="pincode" label="Pincode"></app-ui-input>
          </div>
        </div>

        <!-- STEP 3: Bank Details -->
        <div *ngIf="currentStep === 3" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Bank Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <app-ui-input formControlName="accountNo" label="Account No"></app-ui-input>
            <app-ui-input formControlName="accountName" label="Account Name"></app-ui-input>
            <app-ui-select formControlName="accountType" label="Account Type" [options]="[{label:'Savings',value:'Savings'},{label:'Current',value:'Current'}]"></app-ui-select>
            <app-ui-input formControlName="bankName" label="Bank Name"></app-ui-input>
            <app-ui-input formControlName="branchName" label="Bank Branch"></app-ui-input>
            <app-ui-input formControlName="ifscCode" label="IFSC Code"></app-ui-input>
            <app-ui-input formControlName="micrCode" label="MICR Code"></app-ui-input>
          </div>
        </div>

        <!-- STEP 4: Additional Details -->
        <div *ngIf="currentStep === 4" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Additional Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <app-ui-input formControlName="courseName" label="Course Name"></app-ui-input>
            <app-ui-select formControlName="schemeEnquiry" label="Scheme Enquiry" [options]="[{label:'Yes',value:'Yes'},{label:'No',value:'No'}]"></app-ui-select>
            <app-ui-select formControlName="specialAbility" label="Person with Special Ability" [options]="[{label:'Yes',value:'Yes'},{label:'No',value:'No'}]"></app-ui-select>
            <app-ui-input formControlName="annualFamilyIncome" label="Annual Family Income"></app-ui-input>
            <app-ui-input formControlName="economicStatus" label="Economic Status"></app-ui-input>
            
            <app-ui-input formControlName="bocwNo" label="BOCW No."></app-ui-input>
            <app-ui-input formControlName="mgnregaNo" label="MGNREGA No."></app-ui-input>
            <app-ui-input formControlName="rsbyNo" label="RSBY No."></app-ui-input>
            <app-ui-input formControlName="nrlmNo" label="NRLM No. of SHG Member"></app-ui-input>
            <app-ui-input formControlName="epicNo" label="EPIC No."></app-ui-input>
            <app-ui-input formControlName="incomeSlab" label="Income Slab (Annual)"></app-ui-input>
          </div>
        </div>

        <!-- STEP 5: Attachments & Submit -->
        <div *ngIf="currentStep === 5" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-6 pb-2 border-b">Attachments</h2>
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
            <div class="mx-auto w-12 h-12 bg-rsldc-navy/10 text-rsldc-navy rounded-full flex items-center justify-center mb-3">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p class="font-bold text-slate-700">Upload Candidate Photograph & Documents</p>
            <p class="text-xs text-slate-500 mt-1">JPEG, PNG, PDF up to 5MB</p>
            <button type="button" class="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Browse Files</button>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8">
          <button type="button" *ngIf="currentStep > 1" (click)="prevStep()" class="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition">Previous</button>
          <div *ngIf="currentStep === 1"></div> <!-- Spacer -->
          
          <button type="button" *ngIf="currentStep < 5" (click)="nextStep()" class="px-6 py-2.5 bg-rsldc-navy text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#0f1540] transition">Next</button>
          <button type="submit" *ngIf="currentStep === 5" [disabled]="traineeForm.invalid" class="px-8 py-2.5 bg-approve-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-approve-700 transition disabled:opacity-50 flex items-center gap-2">
            Submit Registration
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </form>
    </div>
  `
})
export class TraineeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private traineeService = inject(TraineeService);
  private router = inject(Router);

  steps = ['Basic Info', 'Contact & Address', 'Bank Details', 'Additional Details', 'Attachments'];
  currentStep = 1;
  traineeForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.traineeForm = this.fb.group({
      // Basic Info
      aspirantCategory: ['', Validators.required],
      aadhaarNo: ['', Validators.required],
      janaadhaarId: [''],
      name: ['', Validators.required],
      gender: ['', Validators.required],
      relationType: ['', Validators.required],
      motherName: [''],
      dob: ['', Validators.required],
      age: [''],
      education: ['', Validators.required],
      religion: ['', Validators.required],
      category: ['', Validators.required],
      aspirantCategoryType: ['', Validators.required],
      
      // Preference & Employment
      trainingPreferredDistrict: [''],
      typeOfEmployment: [''],
      ruralUrban: [''],

      // Contact
      mobile: ['', Validators.required],
      altMobile: [''],
      landlineNumber: [''],
      email: [''],

      // Address Groups
      permanentAddress: this.fb.group({
        houseNo: [''], streetName: [''], wardNo: [''], villageTownCity: [''], 
        district: [''], blockName: [''], tehsil: [''], municipality: [''], pincode: ['']
      }),
      communicationAddress: this.fb.group({
        houseNo: [''], streetName: [''], wardNo: [''], villageTownCity: [''], 
        district: [''], blockName: [''], tehsil: [''], municipality: [''], pincode: ['']
      }),

      // Bank
      accountNo: [''],
      accountName: [''],
      accountType: [''],
      bankName: [''],
      branchName: [''],
      ifscCode: [''],
      micrCode: [''],

      // Additional
      courseName: [''],
      schemeEnquiry: [''],
      specialAbility: [''],
      annualFamilyIncome: [''],
      economicStatus: [''],
      bocwNo: [''],
      mgnregaNo: [''],
      rsbyNo: [''],
      nrlmNo: [''],
      epicNo: [''],
      incomeSlab: ['']
    });
  }

  copyAddress(event: any) {
    if (event.target.checked) {
      const permAddress = this.traineeForm.get('permanentAddress')?.value;
      this.traineeForm.get('communicationAddress')?.patchValue(permAddress);
    } else {
      this.traineeForm.get('communicationAddress')?.reset();
    }
  }

  nextStep() {
    if (this.currentStep < 5) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit() {
    if (this.traineeForm.valid) {
      this.traineeService.registerTrainee(this.traineeForm.value).subscribe({
        next: () => {
          this.router.navigate(['/trainees']);
        }
      });
    } else {
      this.traineeForm.markAllAsTouched();
    }
  }
}
