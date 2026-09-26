import { Component, inject, signal, computed, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormSdcComponent, FormSectionConfig } from '../../../shared/components/form-sdc';
import { SdcService } from '../services/sdc.service';
import {
  SdcFormData,
  SdcScheme,
  SDC_SCHEME_OPTIONS,
  RAJASTHAN_DISTRICTS,
  SCHEME_COURSE_CATALOG
} from '../models/sdc.model';

@Component({
  selector: 'app-sdc-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormSdcComponent],
  template: `
    <div class="min-h-full bg-[#F8FAFC] py-6 sm:py-10 px-4 font-sans selection:bg-slate-900 selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Central Elevated Card -->
      <div class="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-8">
        
        <!-- Header: Back Button + Title + Subtitle -->
        <div class="flex items-start gap-4 pb-2 border-b border-slate-100">
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
              Submit your training center profile, infrastructure, courses, and documents for departmental inspection.
            </p>
          </div>
        </div>

        <!-- Notification Banner -->
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

        <!-- Single Page Dynamic SDC Form -->
        <app-form-sdc
          [sections]="formSections"
          [(model)]="formData"
          submitLabel="Submit Application"
          cancelLabel="Cancel"
          [showCancel]="true"
          [showSubmit]="true"
          [submitLoading]="isSubmitting()"
          (formSubmit)="submitSdcForm()"
          (formCancel)="goBack()"
        ></app-form-sdc>

      </div>

    </div>

    <!-- Custom Template: Course Allocation Selector -->
    <ng-template #courseAllocationTemplate>
      <div class="space-y-4 pt-1">
        
        <!-- Two-Column Sector & Course Selectors -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <!-- Sector Select -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Sector for {{ formData.step1.scheme || 'SAMARTH' }} <span class="text-rose-500">*</span>
            </label>
            <select
              [ngModel]="selectedSector()"
              (ngModelChange)="onSectorSelect($event)"
              class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
            >
              <option value="" disabled selected>-- Choose Sector --</option>
              @for (sec of availableSectors(); track sec) {
                <option [value]="sec">{{ sec }}</option>
              }
            </select>
            <p class="text-[11px] text-slate-400 mt-1">Select a sector under {{ formData.step1.scheme || 'SAMARTH' }} scheme.</p>
          </div>

          <!-- Course Select -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Course to Allocate <span class="text-rose-500">*</span>
            </label>
            <select
              [ngModel]="selectedCourseQp()"
              (ngModelChange)="onCourseSelectAutoAdd($event)"
              [disabled]="!selectedSector()"
              class="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="" disabled selected>
                {{ selectedSector() ? '-- Select Course --' : '-- Select Sector First --' }}
              </option>
              @for (c of availableCoursesForSector(); track c.qpCode) {
                <option [value]="c.qpCode">{{ c.courseName }} (QP: {{ c.qpCode }})</option>
              }
            </select>
            <p class="text-[11px] text-slate-400 mt-1">Select sector first to enable course selection.</p>
          </div>

        </div>

        <!-- Allocated Courses List -->
        @if (formData.step3.allocatedCourses.length > 0) {
          <div class="pt-2 space-y-2.5">
            <span class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Allocated Approved Courses ({{ formData.step3.allocatedCourses.length }}):
            </span>

            @for (c of formData.step3.allocatedCourses; track c.qpCode; let idx = $index) {
              <div class="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shadow-2xs">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </div>

                  <div class="space-y-0.5 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h4 class="text-xs sm:text-sm font-bold text-slate-900 truncate m-0">
                        {{ c.courseName }}
                      </h4>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        NSQF Level {{ c.nsqfLevel }}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {{ c.sector.toUpperCase() }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-500 font-mono m-0">
                      QP Code: <span class="font-bold text-slate-700">{{ c.qpCode }}</span> &bull; Duration: {{ c.durationHours }} Hrs
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="removeCourse(idx)"
                  class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                >
                  ✕ Remove
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-500">
            No courses allocated yet. Select a sector and course above to add courses to this SDC.
          </div>
        }

      </div>
    </ng-template>
  `
})
export class SdcCreateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sdcService = inject(SdcService);
  private location = inject(Location);

  @ViewChild('courseAllocationTemplate', { static: true })
  courseAllocationTemplate!: TemplateRef<any>;

  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  selectedSector = signal<string>('Green Energy');
  selectedCourseQp = signal<string>('');

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
          courseName: 'Solar Panel Installation Tech',
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

  /** Scheme dropdown options */
  readonly schemeOptions = SDC_SCHEME_OPTIONS.map(s => ({
    label: s.label,
    value: s.value
  }));

  /** Rajasthan district options */
  readonly districtOptions = RAJASTHAN_DISTRICTS.map(d => ({
    label: d,
    value: d
  }));

  /** Available sectors based on currently chosen scheme */
  availableSectors = computed(() => {
    const scheme = this.formData.step1.scheme || 'SAMARTH';
    const list = SCHEME_COURSE_CATALOG.filter(c => c.scheme === scheme);
    return Array.from(new Set(list.map(c => c.sector)));
  });

  /** Available courses for the selected sector */
  availableCoursesForSector = computed(() => {
    const scheme = this.formData.step1.scheme || 'SAMARTH';
    const sec = this.selectedSector();
    if (!sec) return [];
    return SCHEME_COURSE_CATALOG.filter(c => c.scheme === scheme && c.sector === sec);
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['scheme']) {
        const sch = params['scheme'].toUpperCase() as SdcScheme;
        this.formData.step1.scheme = sch;
        const sectors = this.availableSectors();
        if (sectors.length > 0 && !sectors.includes(this.selectedSector())) {
          this.selectedSector.set(sectors[0]);
        }
      }
    });
  }

  /**
   * Dynamic form configuration defining all sections and fields
   * Rendered together in one single page!
   */
  get formSections(): FormSectionConfig[] {
    return [
      // =======================================================================
      // SECTION 1: ORGANIZATION DETAILS
      // =======================================================================
      {
        id: 'sec-org',
        title: 'Organization Details',
        subtitle: 'Scheme accreditation, TP details and proposed center operational parameters',
        icon: 'building',
        gridCols: 2,
        fields: [
          {
            key: 'step1.scheme',
            label: 'Scheme',
            type: 'select',
            required: true,
            options: this.schemeOptions,
            onChange: () => {
              const sectors = this.availableSectors();
              this.selectedSector.set(sectors.length > 0 ? sectors[0] : '');
              this.selectedCourseQp.set('');
            }
          },
          {
            key: 'step1.sdcName',
            label: 'SDC Name',
            type: 'text',
            required: true,
            placeholder: 'Jaipur Excellence Center'
          },
          {
            key: 'step1.mouRefNo',
            label: 'MoU Reference No.',
            type: 'text',
            required: true,
            placeholder: 'MOU/2026/001'
          },
          {
            key: 'step1.tpName',
            label: 'TP Name',
            type: 'text',
            required: true,
            placeholder: 'SkillMasters Rajasthan'
          },
          {
            key: 'step1.sdcCode',
            label: 'SDC Code',
            type: 'text',
            required: true,
            placeholder: 'SDC-001'
          },
          {
            key: 'step1.proposedStartDate',
            label: 'Proposed Start Date',
            type: 'date',
            required: true
          },
          {
            key: 'step1.totalTrainedAspirants',
            label: 'Total Trained Aspirants',
            type: 'number',
            placeholder: '500'
          },
          {
            key: 'step1.totalPlacedAspirants',
            label: 'Total TP Placed Aspirants',
            type: 'number',
            placeholder: '400'
          }
        ]
      },

      // =======================================================================
      // SECTION 2: LOCATION & CENTRE DETAILS
      // =======================================================================
      {
        id: 'sec-location',
        title: 'Location and Centre Details',
        subtitle: 'Physical center location, district, capacity, and GPS coordinates for inspection',
        icon: 'location',
        gridCols: 3,
        fields: [
          {
            key: 'step2.state',
            label: 'State',
            type: 'text',
            disabled: true,
            colSpan: 1
          },
          {
            key: 'step2.district',
            label: 'District',
            type: 'select',
            required: true,
            options: this.districtOptions,
            colSpan: 1
          },
          {
            key: 'step2.assemblyConstituency',
            label: 'Assembly Constituency',
            type: 'text',
            placeholder: 'Sanganer',
            colSpan: 1
          },
          {
            key: 'step2.parliamentConstituency',
            label: 'Parliament Constituency',
            type: 'text',
            placeholder: 'Jaipur Rural',
            colSpan: 1
          },
          {
            key: 'step2.division',
            label: 'Division',
            type: 'text',
            placeholder: 'Jaipur',
            colSpan: 1
          },
          {
            key: 'step2.block',
            label: 'Block',
            type: 'text',
            placeholder: 'Jaipur',
            colSpan: 1
          },
          {
            key: 'step2.sdcCapacity',
            label: 'SDC Capacity (Aspirants)',
            type: 'number',
            required: true,
            placeholder: '100',
            colSpan: 1
          },
          {
            key: 'step2.centerEmail',
            label: 'Official Center Email',
            type: 'email',
            required: true,
            placeholder: 'center@example.com',
            colSpan: 1
          },
          {
            key: 'step2.pincode',
            label: 'Pincode',
            type: 'text',
            required: true,
            maxLength: 6,
            placeholder: '302029',
            colSpan: 1
          },
          {
            key: 'step2.fullAddress',
            label: 'Full Physical Address',
            type: 'textarea',
            required: true,
            rows: 2,
            placeholder: 'Plot 42, Skill Industrial Area, Sanganer, Jaipur',
            colSpan: 'full'
          },
          {
            key: 'geo_heading',
            label: 'Center Geo-Location (GPS Coordinates for Physical Inspection)',
            type: 'heading',
            hint: 'Auditor verification requires GPS match within 100 meters'
          },
          {
            key: 'step2.latitude',
            label: 'Latitude',
            type: 'number',
            required: true,
            placeholder: '26.9124',
            colSpan: 1
          },
          {
            key: 'step2.longitude',
            label: 'Longitude',
            type: 'number',
            required: true,
            placeholder: '75.7873',
            colSpan: 1
          },
          {
            key: 'step2.remarks',
            label: 'Remarks / Infrastructure Notes',
            type: 'textarea',
            rows: 2,
            placeholder: 'Ready for auditor inspection',
            colSpan: 1
          }
        ]
      },

      // =======================================================================
      // SECTION 3: COURSES & SUPPORTING DOCUMENTS
      // =======================================================================
      {
        id: 'sec-courses-docs',
        title: 'Courses & Supporting Documents',
        subtitle: 'Sanctioned courses and mandatory compliance proof documents',
        icon: 'academic',
        gridCols: 2,
        fields: [
          {
            key: 'step3.allocatedCourses',
            label: 'Course Allocation',
            type: 'custom',
            template: this.courseAllocationTemplate,
            colSpan: 'full',
            validator: (_val, model) => {
              if (!model.step3?.allocatedCourses || model.step3.allocatedCourses.length === 0) {
                return 'Please allocate at least one course for this center.';
              }
              return null;
            }
          },
          {
            key: 'docs_heading',
            label: 'Mandatory Compliance Documents',
            type: 'heading',
            hint: 'Upload verifiable PDF documents and photos for auditor inspection'
          },
          {
            key: 'step3.documents.rentalAgreementDoc',
            label: 'Rental Agreement / Ownership Proof (PDF)',
            type: 'file',
            required: true,
            accept: '.pdf',
            colSpan: 1
          },
          {
            key: 'step3.documents.fireNocDoc',
            label: 'Fire Safety NOC Certificate (PDF)',
            type: 'file',
            required: true,
            accept: '.pdf',
            colSpan: 1
          },
          {
            key: 'step3.documents.signboardPhotoDoc',
            label: 'Center Front Signboard Photo (JPG/PNG)',
            type: 'file',
            required: true,
            accept: '.jpg,.jpeg,.png',
            colSpan: 1
          },
          {
            key: 'step3.documents.layoutDiagramDoc',
            label: 'Classrooms & Labs Layout Blueprint (PDF)',
            type: 'file',
            required: true,
            accept: '.pdf',
            colSpan: 1
          }
        ]
      },

      // =======================================================================
      // SECTION 4: SELF DECLARATION
      // =======================================================================
      {
        id: 'sec-declaration',
        title: 'Self Declaration & Undertaking',
        subtitle: 'Formal declaration under RSLDC and Government of Rajasthan guidelines',
        icon: 'shield',
        gridCols: 1,
        fields: [
          {
            key: 'step4.declarationAccepted',
            label: 'I hereby declare and affirm that all the information, documents, and infrastructure details provided above are true, complete, and authentic to the best of my knowledge.',
            type: 'checkbox',
            required: true,
            requiredMessage: 'You must accept the self-declaration to submit this application',
            hint: 'Any false declaration or non-compliance during physical auditor inspection will result in immediate disqualification or cancellation of SDC accreditation under ISMS Rajasthan guidelines.'
          }
        ]
      }
    ];
  }

  onSectorSelect(sector: string): void {
    this.selectedSector.set(sector);
    this.selectedCourseQp.set('');
  }

  onCourseSelectAutoAdd(qpCode: string): void {
    if (!qpCode) return;
    const course = SCHEME_COURSE_CATALOG.find(c => c.qpCode === qpCode);
    if (course) {
      const exists = this.formData.step3.allocatedCourses.some(c => c.qpCode === qpCode);
      if (!exists) {
        this.formData.step3.allocatedCourses.push({
          courseName: course.courseName,
          qpCode: course.qpCode,
          sector: course.sector,
          nsqfLevel: course.nsqfLevel,
          durationHours: course.durationHours
        });
      }
    }
    this.selectedCourseQp.set('');
  }

  removeCourse(index: number): void {
    this.formData.step3.allocatedCourses.splice(index, 1);
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
      this.sdcService.createSdc(this.formData);
      this.router.navigate(['/tp/sanction-orders']);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to submit SDC application.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
