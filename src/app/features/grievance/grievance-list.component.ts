import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';

export interface Grievance {
  sNo: number;
  title: string;
  description: string;
  issueType: 'Enquire' | 'Technical' | 'accounts';
  attachment: string;
  status: 'Open' | 'In progress' | 'Resolved' | 'closed';
}

@Component({
  selector: 'app-grievance-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    ActionModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1">
            <app-page-header
              title="Grievance"
              bgColor="#0B3558"
            ></app-page-header>
          </div>
          <button (click)="openRaiseTicket()" class="shrink-0 px-4 py-2 mt-1 bg-[#0B3558] text-white text-sm font-semibold rounded-md shadow-xs hover:bg-[#07233B] transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Raise Ticket
          </button>
        </div>

        <app-table
          [columns]="grievanceColumns"
          [data]="grievances"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="grievances"
          [customTemplates]="{
            status: statusTemplate,
            viewAction: viewActionTemplate
          }"
        >
        </app-table>

        <ng-template #statusTemplate let-item>
          <span class="font-semibold"
            [ngClass]="{
              'text-blue-600': item.status === 'Open',
              'text-amber-600': item.status === 'In progress',
              'text-emerald-600': item.status === 'Resolved',
              'text-slate-600': item.status === 'closed'
            }">
            {{ item.status }}
          </span>
        </ng-template>

        <ng-template #viewActionTemplate let-item>
          <app-button
            variant="pdf-view"
            size="sm"
            title="View Details"
          >
            View
          </app-button>
        </ng-template>

      </div>

      <!-- Raise Ticket Modal -->
      <app-action-modal
        [isOpen]="isModalOpen()"
        title="Raise Ticket"
        primaryLabel="Forward"
        secondaryLabel="Cancel"
        [showCloseButton]="true"
        (primaryAction)="submitTicket()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <div class="mt-5 space-y-4 text-left">
          <div>
            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Title <span class="text-rose-500">*</span></label>
            <input type="text" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-400" placeholder="Enter title" />
          </div>
          <div>
            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Description <span class="text-rose-500">*</span></label>
            <textarea class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-400" rows="4" placeholder="Enter description"></textarea>
          </div>
          <div>
            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Issue Type <span class="text-rose-500">*</span></label>
            <select class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-700">
              <option value="" disabled selected>Select issue type</option>
              <option value="Enquire">Enquire</option>
              <option value="Technical">Technical</option>
              <option value="accounts">accounts</option>
            </select>
          </div>
          <div>
            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Attachment</label>
            <input type="file" class="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[13px] file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer" />
          </div>
        </div>
      </app-action-modal>

    </div>
  `
})
export class GrievanceListComponent {
  readonly isModalOpen = signal(false);

  readonly grievanceColumns: TableColumn<Grievance>[] = [
    { key: 'sNo', label: 'Sr No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'title', label: 'Title', cellClass: 'whitespace-nowrap font-medium text-slate-800' },
    { key: 'description', label: 'Description', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'issueType', label: 'Issue Type', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'attachment', label: 'Attachment', align: 'center', cellClass: 'whitespace-nowrap font-normal text-sky-600 underline cursor-pointer' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom' },
    { key: 'viewAction', label: 'View', align: 'center', width: 'w-20', type: 'custom' }
  ];

  grievances: Grievance[] = [
    {
      sNo: 1,
      title: 'Login Issue',
      description: 'Unable to login to the portal using my credentials.',
      issueType: 'Technical',
      attachment: 'screenshot.png',
      status: 'Open'
    },
    {
      sNo: 2,
      title: 'Payment Failure',
      description: 'Amount deducted but receipt not generated.',
      issueType: 'accounts',
      attachment: 'transaction.pdf',
      status: 'In progress'
    },
    {
      sNo: 3,
      title: 'Document Upload Error',
      description: 'Getting an error while uploading the Aadhar card.',
      issueType: 'Technical',
      attachment: 'error_log.txt',
      status: 'Resolved'
    },
    {
      sNo: 4,
      title: 'Process Inquiry',
      description: 'How long does the approval process take?',
      issueType: 'Enquire',
      attachment: 'query.pdf',
      status: 'closed'
    }
  ];

  openRaiseTicket() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  submitTicket() {
    // In a real application, form values would be collected and submitted here.
    alert('Ticket Forwarded Successfully!');
    this.closeModal();
  }
}
