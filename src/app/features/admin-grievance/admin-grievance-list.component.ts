import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../core/auth/auth.service';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';

export interface AdminGrievance {
  sNo: number;
  userName: string;
  submittedAt: string;
  title: string;
  description: string;
  issueType: 'Enquire' | 'Technical' | 'accounts';
  attachment: string;
  attachmentUrl?: SafeResourceUrl;
  status: 'Open' | 'In progress' | 'Resolved' | 'closed';
  comments?: string;
}

@Component({
  selector: 'app-admin-grievance-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    ActionModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <app-page-header
          title="Grievance Management"
          bgColor="#0B3558"
        >
        </app-page-header>

        <app-table
          [columns]="grievanceColumns"
          [data]="grievances"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="grievances"
          [customTemplates]="{
            status: statusTemplate,
            viewAction: viewActionTemplate,
            submittedAt: dateTimeTemplate,
            attachment: attachmentTemplate
          }"
        >
        </app-table>

        <ng-template #dateTimeTemplate let-item>
          <div class="flex flex-col text-center">
            <span class="text-slate-800 font-medium whitespace-nowrap">{{ item.submittedAt | date:'dd MMM yyyy' }}</span>
            <span class="text-slate-500 text-[11px] whitespace-nowrap">{{ item.submittedAt | date:'hh:mm a' }}</span>
          </div>
        </ng-template>
        
        <ng-template #attachmentTemplate let-item>
          @if (item.attachment && item.attachment !== 'None') {
            <a href="#" (click)="openPreview(item); $event.preventDefault(); $event.stopPropagation();" class="text-[13px] font-medium text-sky-600 hover:text-sky-700 hover:underline break-all max-w-[150px] inline-block">
              {{ item.attachment }}
            </a>
          } @else {
            <span class="text-slate-400">-</span>
          }
        </ng-template>

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
            (click)="viewTicket(item)"
          >
            View
          </app-button>
        </ng-template>

      </div>

      <!-- View Ticket Modal -->
      <app-action-modal
        [isOpen]="isViewModalOpen()"
        [title]="'Ticket Details'"
        [primaryLabel]="selectedTicket()?.status === 'Open' ? ((isForwarding() || isCommenting()) ? 'Submit' : 'Forward') : 'Close'"
        [secondaryLabel]="selectedTicket()?.status === 'Open' ? ((isForwarding() || isCommenting()) ? 'Cancel' : (isDeptAdmin() ? 'Comment' : 'Close')) : ''"
        [showPrimaryArrow]="false"
        [showCloseButton]="true"
        [showAccentBar]="false"
        [disablePrimary]="(isForwarding() && !isForwardFormValid()) || (isCommenting() && !isCommentFormValid())"
        (primaryAction)="handlePrimaryAction()"
        (secondaryAction)="handleSecondaryAction()"
        (close)="closeViewModal()"
      >
        @if (selectedTicket()) {
          <div class="mt-5 space-y-4 text-left">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <span class="font-semibold text-[13px]"
                  [ngClass]="{
                    'text-blue-600': selectedTicket()!.status === 'Open',
                    'text-amber-600': selectedTicket()!.status === 'In progress',
                    'text-emerald-600': selectedTicket()!.status === 'Resolved',
                    'text-slate-600': selectedTicket()!.status === 'closed'
                  }">
                  {{ selectedTicket()!.status }}
                </span>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Type</label>
                <div class="text-[13px] font-semibold text-slate-800">{{ selectedTicket()!.issueType }}</div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Name</label>
                <div class="text-[13px] font-semibold text-slate-800">{{ selectedTicket()!.userName }}</div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</label>
                <div class="text-[13px] font-semibold text-slate-800">{{ selectedTicket()!.submittedAt | date:'medium' }}</div>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Title</label>
              <div class="text-[14px] font-medium text-slate-800">{{ selectedTicket()!.title }}</div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
              <div class="text-[13px] text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200 whitespace-pre-wrap leading-relaxed">{{ selectedTicket()!.description }}</div>
            </div>

            @if (selectedTicket()!.attachment && selectedTicket()!.attachment !== 'None') {
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attachment</label>
                <a href="#" (click)="openPreview(selectedTicket()!); $event.preventDefault();" class="text-[13px] font-medium text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1.5 w-fit break-all">
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  {{ selectedTicket()!.attachment }}
                </a>
              </div>
            }

            @if (selectedTicket()!.status !== 'Open' && selectedTicket()!.comments) {
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Comments</label>
                <div class="text-[13px] text-amber-900 bg-amber-50 p-3 rounded-md border border-amber-200/60 whitespace-pre-wrap leading-relaxed">
                  {{ selectedTicket()!.comments }}
                </div>
              </div>
            }

            <!-- Forward Form Section -->
            @if (isForwarding()) {
              <div class="mt-6 pt-5 border-t border-slate-200">
                <h4 class="text-[14px] font-bold text-[#0B3558] mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Forward Ticket
                </h4>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Priority <span class="text-rose-500">*</span></label>
                      <select [(ngModel)]="forwardForm.priority" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-700 bg-white">
                        <option value="" disabled selected>Select priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Concerned User <span class="text-rose-500">*</span></label>
                      <select [(ngModel)]="forwardForm.concernedUser" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-700 bg-white">
                        <option value="" disabled selected>Select admin user</option>
                        <option value="Admin User 1">Admin User 1</option>
                        <option value="Admin User 2">Admin User 2</option>
                        <option value="Admin User 3">Admin User 3</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Comments <span class="text-rose-500">*</span></label>
                    <textarea [(ngModel)]="forwardForm.comments" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-400 bg-white" rows="3" placeholder="Enter comments for forwarding"></textarea>
                  </div>
                </div>
              </div>
            }

            <!-- Comment Form Section -->
            @if (isCommenting()) {
              <div class="mt-6 pt-5 border-t border-slate-200">
                <h4 class="text-[14px] font-bold text-[#0B3558] mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Add Comment
                </h4>
                <div>
                  <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Your Comments <span class="text-rose-500">*</span></label>
                  <textarea [(ngModel)]="commentForm.comments" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-400 bg-white" rows="4" placeholder="Enter your response or remarks here"></textarea>
                </div>
              </div>
            }
          </div>
        }
      </app-action-modal>

      <!-- Attachment Preview Modal -->
      <app-action-modal
        [isOpen]="isPreviewModalOpen()"
        [title]="'Preview: ' + previewAttachmentName()"
        primaryLabel="Close"
        secondaryLabel=""
        [showPrimaryArrow]="false"
        [showCloseButton]="true"
        [showAccentBar]="false"
        maxWidthClass="max-w-5xl"
        (primaryAction)="closePreview()"
        (close)="closePreview()"
      >
        <div class="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col items-center justify-center min-h-[400px]">
          @if (previewAttachmentUrl()) {
            <iframe [src]="previewAttachmentUrl()" class="w-full h-full min-h-[70vh] border-0 bg-white"></iframe>
          } @else {
            <svg class="w-16 h-16 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-slate-600 font-medium text-lg">No Preview Available</p>
            <p class="text-slate-400 text-sm mt-1 text-center max-w-sm leading-relaxed">
              This is a dummy file from the test data. <br> Raise a new ticket and upload a real PDF to see the live preview.
            </p>
          }
        </div>
      </app-action-modal>

    </div>
  `
})
export class AdminGrievanceListComponent {
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  readonly isDeptAdmin = computed(() => {
    return this.authService.currentUser()?.role === 'dept_admin';
  });

  readonly isViewModalOpen = signal(false);
  readonly isPreviewModalOpen = signal(false);
  readonly isForwarding = signal(false);
  readonly isCommenting = signal(false);
  readonly selectedTicket = signal<AdminGrievance | null>(null);
  
  readonly previewAttachmentName = signal('');
  readonly previewAttachmentUrl = signal<SafeResourceUrl | null>(null);

  forwardForm = {
    priority: '',
    concernedUser: '',
    comments: ''
  };

  commentForm = {
    comments: ''
  };

  readonly grievanceColumns: TableColumn<AdminGrievance>[] = [
    { key: 'sNo', label: 'Sr No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'userName', label: 'User Name', cellClass: 'font-medium text-sky-700 min-w-[120px]' },
    { key: 'submittedAt', label: 'Date & Time', align: 'center', type: 'custom', width: 'w-24' },
    { key: 'title', label: 'Title', cellClass: 'font-medium text-slate-800 min-w-[120px]' },
    { key: 'description', label: 'Description', cellClass: 'font-normal text-slate-700 min-w-[180px]' },
    { key: 'issueType', label: 'Issue Type', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'attachment', label: 'Attachment', align: 'center', type: 'custom' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom' },
    { key: 'viewAction', label: 'View', align: 'center', width: 'w-16', type: 'custom' }
  ];

  grievances: AdminGrievance[] = [
    {
      sNo: 1,
      userName: 'Alice Smith',
      submittedAt: '2026-09-27T10:15:30Z',
      title: 'Login Issue',
      description: 'Unable to login to the portal using my credentials. It shows invalid password every time.',
      issueType: 'Technical',
      attachment: 'screenshot.png',
      status: 'Open'
    },
    {
      sNo: 2,
      userName: 'Tech Solutions Inc.',
      submittedAt: '2026-09-26T14:45:00Z',
      title: 'Payment Failure',
      description: 'Amount deducted from my bank account but the receipt was not generated on the portal.',
      issueType: 'accounts',
      attachment: 'transaction.pdf',
      status: 'In progress',
      comments: 'We have escalated this to the payment gateway provider. Expecting a resolution in 24-48 hours.'
    },
    {
      sNo: 3,
      userName: 'Bob Johnson',
      submittedAt: '2026-09-25T09:12:00Z',
      title: 'Document Upload Error',
      description: 'Getting a 500 internal server error while uploading the Aadhar card in the profile section.',
      issueType: 'Technical',
      attachment: 'error_log.txt',
      status: 'Resolved',
      comments: 'The issue was caused by a temporary outage in our storage service. It has been fixed now. Please try again.'
    },
    {
      sNo: 4,
      userName: 'ABC Corp',
      submittedAt: '2026-09-24T16:30:00Z',
      title: 'Process Inquiry',
      description: 'How long does the standard scheme approval process take after submission?',
      issueType: 'Enquire',
      attachment: 'query.pdf',
      status: 'closed',
      comments: 'Standard approval takes 3-5 business days. Your application is currently under review.'
    }
  ];

  viewTicket(ticket: AdminGrievance) {
    this.selectedTicket.set(ticket);
    this.isForwarding.set(false);
    this.isCommenting.set(false);
    this.resetForms();
    this.isViewModalOpen.set(true);
  }

  handlePrimaryAction() {
    const ticket = this.selectedTicket();
    if (ticket?.status === 'Open') {
      if (this.isForwarding()) {
        this.submitForward();
      } else if (this.isCommenting()) {
        this.submitComment();
      } else {
        this.isForwarding.set(true);
      }
    } else {
      this.closeViewModal();
    }
  }

  handleSecondaryAction() {
    const ticket = this.selectedTicket();
    if (ticket?.status === 'Open') {
      if (this.isForwarding() || this.isCommenting()) {
        this.isForwarding.set(false);
        this.isCommenting.set(false);
      } else if (this.isDeptAdmin()) {
        this.isCommenting.set(true);
      } else {
        this.closeViewModal();
      }
    }
  }

  closeViewModal() {
    this.isViewModalOpen.set(false);
    setTimeout(() => {
      this.selectedTicket.set(null);
      this.isForwarding.set(false);
      this.isCommenting.set(false);
      this.resetForms();
    }, 300);
  }

  resetForms() {
    this.forwardForm = {
      priority: '',
      concernedUser: '',
      comments: ''
    };
    this.commentForm = {
      comments: ''
    };
  }

  isForwardFormValid(): boolean {
    return this.forwardForm.priority !== '' &&
           this.forwardForm.concernedUser !== '' &&
           this.forwardForm.comments.trim().length > 0;
  }

  isCommentFormValid(): boolean {
    return this.commentForm.comments.trim().length > 0;
  }

  submitForward() {
    if (!this.isForwardFormValid()) return;
    
    const ticket = this.selectedTicket();
    if (ticket) {
      ticket.status = 'In progress';
      ticket.comments = `[Forwarded to ${this.forwardForm.concernedUser} - Priority: ${this.forwardForm.priority}]\n\n${this.forwardForm.comments}`;
    }
    this.closeViewModal();
  }

  submitComment() {
    if (!this.isCommentFormValid()) return;

    const ticket = this.selectedTicket();
    if (ticket) {
      ticket.comments = this.commentForm.comments;
    }
    this.closeViewModal();
  }

  openPreview(ticket: AdminGrievance) {
    this.previewAttachmentName.set(ticket.attachment);
    this.previewAttachmentUrl.set(ticket.attachmentUrl || null);
    this.isPreviewModalOpen.set(true);
  }

  closePreview() {
    this.isPreviewModalOpen.set(false);
    setTimeout(() => {
      this.previewAttachmentName.set('');
      this.previewAttachmentUrl.set(null);
    }, 300);
  }
}
