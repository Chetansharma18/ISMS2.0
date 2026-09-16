import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseProposalService, CourseProposal } from '../../../core/services/course-proposal.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tp-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Proposed Courses</h1>
          <p class="text-slate-500 mt-1">Manage and track your course proposals for SDC integration.</p>
        </div>
        <button (click)="showCreateModal = true" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
          + Propose New Course
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Course Details</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Sector</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Duration & Level</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr *ngFor="let course of courses$ | async" class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">{{ course.courseName }}</div>
                  <div class="text-xs text-slate-500">{{ course.courseCode }}</div>
                </td>
                <td class="p-4 font-semibold text-slate-700">{{ course.sector }}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">{{ course.durationHrs }} Hrs</div>
                  <div class="text-[10px] text-slate-500 uppercase">{{ course.nsqfLevel }}</div>
                </td>
                <td class="p-4 text-center">
                  <span *ngIf="course.status === 'APPROVED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase">
                    Approved
                  </span>
                  <span *ngIf="course.status === 'PENDING_ADMIN_REVIEW'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                    Pending Admin Review
                  </span>
                  <span *ngIf="course.status === 'REJECTED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase flex flex-col items-center">
                    Rejected
                  </span>
                  <div *ngIf="course.status === 'REJECTED'" class="text-[9px] text-red-500 mt-1 cursor-pointer hover:underline" [title]="course.rejectionReason">View Reason</div>
                </td>
                <td class="p-4 text-right">
                  <button class="text-blue-600 hover:underline font-bold text-xs">
                    {{ course.status === 'REJECTED' ? 'Re-apply' : 'View' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="(courses$ | async)?.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500">
                  No courses proposed yet. Click "+ Propose New Course" to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Course Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white border border-slate-300 max-w-lg w-full overflow-hidden shadow-2xl rounded-xl">
          <div class="bg-[#131A4D] text-white px-5 py-4 font-bold">
            Propose New Course
          </div>
          <form [formGroup]="courseForm" (ngSubmit)="submitCourse()" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
               <div class="col-span-2">
                 <label class="block font-bold text-slate-700 text-sm mb-1">Course Name</label>
                 <input formControlName="courseName" type="text" placeholder="e.g. Advanced Solar Technician" class="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#131A4D] outline-none" />
               </div>
               <div>
                 <label class="block font-bold text-slate-700 text-sm mb-1">Sector</label>
                 <select formControlName="sector" class="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#131A4D] outline-none">
                   <option value="IT & ITeS">IT & ITeS</option>
                   <option value="Apparel">Apparel</option>
                   <option value="Green Energy">Green Energy</option>
                 </select>
               </div>
               <div>
                 <label class="block font-bold text-slate-700 text-sm mb-1">NSQF Level</label>
                 <select formControlName="nsqfLevel" class="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#131A4D] outline-none">
                   <option value="Level 1">Level 1</option>
                   <option value="Level 2">Level 2</option>
                   <option value="Level 3">Level 3</option>
                   <option value="Level 4">Level 4</option>
                   <option value="Level 5">Level 5</option>
                   <option value="Level 6">Level 6</option>
                   <option value="Level 7">Level 7</option>
                   <option value="Level 8">Level 8</option>
                   <option value="Level 9">Level 9</option>
                   <option value="Level 10">Level 10</option>
                 </select>
               </div>
               <div>
                 <label class="block font-bold text-slate-700 text-sm mb-1">Duration (Hrs)</label>
                 <input formControlName="durationHrs" type="number" placeholder="400" class="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#131A4D] outline-none" />
               </div>
               <div>
                 <label class="block font-bold text-slate-700 text-sm mb-1">Target Capacity</label>
                 <input formControlName="targetCapacity" type="number" placeholder="100" class="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#131A4D] outline-none" />
               </div>
               <div class="col-span-2">
                 <label class="block font-bold text-slate-700 text-sm mb-1">Required Infrastructure (Labs/Eq)</label>
                 <textarea formControlName="infrastructure" rows="2" placeholder="Describe the physical lab requirements for this course" class="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#131A4D] outline-none"></textarea>
               </div>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
              <button type="button" (click)="showCreateModal = false" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">Cancel</button>
              <button type="submit" [disabled]="courseForm.invalid" class="px-6 py-2 bg-[#131A4D] text-white font-bold rounded-lg hover:bg-blue-900 transition disabled:opacity-50">Submit Proposal</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class TpCoursesComponent implements OnInit {
  showCreateModal = false;
  courses$!: Observable<CourseProposal[]>;
  courseForm!: FormGroup;

  constructor(
    private courseService: CourseProposalService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.courses$ = this.courseService.getProposalsByTp('TP042');
    this.courseForm = this.fb.group({
      courseName: ['', Validators.required],
      sector: ['IT & ITeS', Validators.required],
      nsqfLevel: ['Level 4', Validators.required],
      durationHrs: ['', [Validators.required, Validators.min(10)]],
      targetCapacity: ['', [Validators.required, Validators.min(10)]],
      infrastructure: ['', Validators.required]
    });
  }

  submitCourse() {
    if (this.courseForm.invalid) return;
    
    this.courseService.addProposal({
      tpId: 'TP042',
      tpName: 'SkillMasters Rajasthan',
      ...this.courseForm.value
    });
    
    this.showCreateModal = false;
    this.courseForm.reset({ sector: 'IT & ITeS', nsqfLevel: 'Level 4' });
  }
}
