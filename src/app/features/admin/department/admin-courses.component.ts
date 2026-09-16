import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseProposalService, CourseProposal } from '../../../core/services/course-proposal.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Course Scrutiny Queue</h1>
          <p class="text-slate-500 mt-1">Review and approve custom course proposals submitted by Training Providers.</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">TP Details</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Proposed Course</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase">Capacity & Duration</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-center">Infrastructure</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <!-- Dynamic Proposals -->
              <tr *ngFor="let p of pendingProposals$ | async" class="hover:bg-amber-50/30 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-[#131A4D]">{{ p.tpName }}</div>
                  <div class="text-[10px] text-slate-500 uppercase">{{ p.tpId }}</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">{{ p.courseName }} ({{ p.courseCode }})</div>
                  <div class="text-[10px] text-slate-500 uppercase">{{ p.sector }} • {{ p.nsqfLevel }}</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">{{ p.targetCapacity }} Aspirants</div>
                  <div class="text-[10px] text-slate-500 uppercase">{{ p.durationHrs }} Hrs</div>
                </td>
                <td class="p-4 text-center">
                  <button class="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-200" [title]="p.infrastructure">
                    View Requirements
                  </button>
                </td>
                <td class="p-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button (click)="reject(p.id)" class="px-3 py-1 bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 shadow-xs">
                      Reject
                    </button>
                    <button (click)="approve(p.id)" class="px-3 py-1 bg-approve-700 text-white rounded text-xs font-bold hover:bg-green-800 shadow-xs">
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="(pendingProposals$ | async)?.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500">
                  No pending course proposals to review.
                </td>
              </tr>            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminCoursesComponent implements OnInit {
  pendingProposals$!: Observable<CourseProposal[]>;

  constructor(private courseService: CourseProposalService) {}

  ngOnInit() {
    this.pendingProposals$ = this.courseService.proposals$.pipe(
      map(proposals => proposals.filter(p => p.status === 'PENDING_ADMIN_REVIEW'))
    );
  }

  approve(id: string) {
    this.courseService.updateStatus(id, 'APPROVED');
  }

  reject(id: string) {
    const reason = prompt('Enter rejection reason:');
    if (reason !== null) {
      this.courseService.updateStatus(id, 'REJECTED', reason);
    }
  }
}
