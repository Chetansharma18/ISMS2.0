import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseProposalService, CourseProposal } from '../../../core/services/course-proposal.service';
import { SdcService } from '../../../core/services/sdc.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormInputComponent } from '../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent } from '../../../shared/components/form-controls/form-select/form-select.component';
import { UiModalComponent } from '../../../shared/components/ui/ui-modal/ui-modal.component';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tp-courses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormInputComponent, 
    FormSelectComponent, 
    UiModalComponent, 
    UiTableComponent
  ],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Proposed Courses</h1>
          <p class="text-slate-500 mt-1">Manage and track your course proposals for SDC integration.</p>
        </div>
        <button (click)="showCreateModal.set(true)" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
          + Propose New Course
        </button>
      </div>

      <app-ui-table
        [columns]="columns"
        [data]="courses() || []"
        emptyMessage="No courses proposed yet. Click '+ Propose New Course' to get started.">
        
        <ng-template #rowTemplate let-course let-col="column">
          
          <ng-container *ngIf="col.key === 'course'">
            <div class="font-bold text-[#131A4D]">{{ course.courseName }}</div>
            <div class="text-xs text-slate-500">{{ course.courseCode }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'sector'">
            <div class="font-semibold text-slate-700">{{ course.sector }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'duration'">
            <div class="font-bold text-slate-700">{{ course.durationHrs }} Hrs</div>
            <div class="text-[10px] text-slate-500 uppercase">{{ course.nsqfLevel }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span *ngIf="course.status === 'APPROVED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase inline-block">
              Approved
            </span>
            <span *ngIf="course.status === 'PENDING_ADMIN_REVIEW'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase inline-block">
              Pending Admin Review
            </span>
            <span *ngIf="course.status === 'REJECTED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase inline-flex flex-col items-center">
              Rejected
            </span>
            <div *ngIf="course.status === 'REJECTED'" class="text-[9px] text-red-500 mt-1 cursor-pointer hover:underline" [title]="course.rejectionReason">View Reason</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <button class="text-blue-600 hover:underline font-bold text-xs">
              {{ course.status === 'REJECTED' ? 'Re-apply' : 'View' }}
            </button>
          </ng-container>

        </ng-template>
      </app-ui-table>

      <!-- Add Course Modal -->
      <app-ui-modal 
        [isOpen]="showCreateModal()" 
        title="Propose New Course" 
        maxWidth="lg" 
        (closed)="showCreateModal.set(false)">
        
        <form [formGroup]="courseForm" (ngSubmit)="submitCourse()" class="space-y-4">
          <app-form-select
            formControlName="sdcId"
            label="Select Skill Development Center (SDC)"
            [required]="true"
            [options]="sdcOptions() || []">
          </app-form-select>

          <app-form-input
            formControlName="courseName"
            label="Course Name"
            [required]="true"
            placeholder="e.g. Advanced Solar Technician">
          </app-form-input>

          <div class="grid grid-cols-2 gap-4">
            <app-form-select
              formControlName="sector"
              label="Sector"
              [required]="true"
              [options]="sectorOptions">
            </app-form-select>

            <app-form-select
              formControlName="nsqfLevel"
              label="NSQF Level"
              [required]="true"
              [options]="nsqfOptions">
            </app-form-select>

            <app-form-input
              formControlName="durationHrs"
              type="number"
              label="Duration (Hrs)"
              [required]="true"
              placeholder="400">
            </app-form-input>

            <app-form-input
              formControlName="targetCapacity"
              type="number"
              label="Target Capacity"
              [required]="true"
              placeholder="100">
            </app-form-input>
          </div>
          
          <div class="mt-4">
            <label class="block font-bold text-slate-700 text-sm mb-1">Required Infrastructure (Labs/Eq) <span class="text-red-500">*</span></label>
            <textarea formControlName="infrastructure" rows="3" placeholder="Describe the physical lab requirements for this course" class="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#131A4D] outline-none"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <button type="button" (click)="showCreateModal.set(false)" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" [disabled]="courseForm.invalid" class="px-6 py-2 bg-[#131A4D] text-white font-bold rounded-lg hover:bg-blue-900 transition disabled:opacity-50">Submit Proposal</button>
          </div>
        </form>

      </app-ui-modal>

    </div>
  `
})
export class TpCoursesComponent implements OnInit {
  private courseService = inject(CourseProposalService);
  private sdcService = inject(SdcService);
  private fb = inject(FormBuilder);

  showCreateModal = signal(false);
  
  // Use toSignal to convert observables to signals for the template
  courses = toSignal(this.courseService.getProposalsByTp('TP042'), { initialValue: [] });
  
  sdcOptions = toSignal(
    this.sdcService.sdcs$.pipe(
      map(sdcs => (sdcs || []).filter(sdc => sdc.status === 'APPROVED').map(sdc => ({
        label: `${sdc.name} (${sdc.sdcCode})`,
        value: sdc.id
      })))
    ),
    { initialValue: [] }
  );

  courseForm!: FormGroup;

  columns: TableColumn[] = [
    { key: 'course', label: 'Course Details' },
    { key: 'sector', label: 'Sector' },
    { key: 'duration', label: 'Duration & Level' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'action', label: 'Action', align: 'right' }
  ];

  sectorOptions: string[] = [
    'IT & ITeS',
    'Apparel',
    'Green Energy'
  ];

  nsqfOptions: string[] = Array.from({length: 10}, (_, i) => `Level ${i + 1}`);

  ngOnInit() {
    this.courseForm = this.fb.group({
      sdcId: ['', Validators.required],
      courseName: ['', Validators.required],
      sector: ['IT & ITeS', Validators.required],
      nsqfLevel: ['Level 4', Validators.required],
      durationHrs: ['', [Validators.required, Validators.min(1)]],
      targetCapacity: ['', [Validators.required, Validators.min(1)]],
      infrastructure: ['', Validators.required]
    });
  }

  submitCourse() {
    if (this.courseForm.valid) {
      const formVal = this.courseForm.value;
      this.courseService.addProposal({
        ...formVal,
        tpId: 'TP042',
        tpName: 'SkillMasters Rajasthan',
        sdcName: 'Skill Center Jaipur', // In reality, fetch from SdcService
        courseCode: 'CRS-' + Math.floor(1000 + Math.random() * 9000)
      });
      this.showCreateModal.set(false);
      this.courseForm.reset({
        sector: 'IT & ITeS',
        nsqfLevel: 'Level 4'
      });
    }
  }
}
