import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseProposalService, CourseProposal } from '../../../core/services/course-proposal.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';
import { UiModalComponent } from '../../../shared/components/ui/ui-modal/ui-modal.component';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, UiTableComponent, UiModalComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Course Scrutiny Queue</h1>
          <p class="text-slate-500 mt-1">Review and approve custom course proposals submitted by Training Providers.</p>
        </div>
      </div>

      <app-ui-table
        [columns]="columns"
        [data]="(pendingProposals$ | async) || []"
        emptyMessage="No pending course proposals to review.">
        
        <ng-template #rowTemplate let-p let-col="column">
          
          <ng-container *ngIf="col.key === 'tp'">
            <div class="font-bold text-[#131A4D]">{{ p.tpName }}</div>
            <div class="text-[10px] text-slate-500 uppercase">{{ p.tpId }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'course'">
            <div class="font-bold text-slate-700">{{ p.courseName }} ({{ p.courseCode }})</div>
            <div class="text-[10px] text-slate-500 uppercase">{{ p.sector }} • {{ p.nsqfLevel }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'capacity'">
            <div class="font-bold text-slate-700">{{ p.targetCapacity }} Aspirants</div>
            <div class="text-[10px] text-slate-500 uppercase">{{ p.durationHrs }} Hrs</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'infra'">
            <button (click)="viewInfra(p.infrastructure)" class="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-200">
              View Requirements
            </button>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end gap-2">
              <button (click)="reject(p.id)" class="px-3 py-1 bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 shadow-xs">
                Reject
              </button>
              <button (click)="approve(p.id)" class="px-3 py-1 bg-approve-700 text-white rounded text-xs font-bold hover:bg-green-800 shadow-xs">
                Approve
              </button>
            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>

      <!-- Infrastructure Modal -->
      <app-ui-modal 
        [isOpen]="selectedInfra !== null" 
        title="Infrastructure Requirements" 
        maxWidth="md"
        [showFooter]="true"
        (closed)="closeInfra()">
        
        <p class="text-slate-600 text-sm whitespace-pre-wrap">{{ selectedInfra }}</p>
        
        <div modal-footer>
          <button (click)="closeInfra()" class="px-4 py-2 bg-[#131A4D] text-white rounded font-bold text-sm hover:bg-[#002855] transition-colors shadow-sm">
            Close
          </button>
        </div>
      </app-ui-modal>

    </div>
  `
})
export class AdminCoursesComponent implements OnInit {
  pendingProposals$!: Observable<CourseProposal[]>;
  selectedInfra: string | null = null;

  columns: TableColumn[] = [
    { key: 'tp', label: 'TP Details' },
    { key: 'course', label: 'Proposed Course' },
    { key: 'capacity', label: 'Capacity & Duration' },
    { key: 'infra', label: 'Infrastructure', align: 'center' },
    { key: 'action', label: 'Action', align: 'right' }
  ];

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

  viewInfra(infra: string) {
    this.selectedInfra = infra || 'No specific infrastructure requirements provided.';
  }

  closeInfra() {
    this.selectedInfra = null;
  }
}
