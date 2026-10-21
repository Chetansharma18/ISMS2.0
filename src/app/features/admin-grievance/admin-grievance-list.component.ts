import { ChangeDetectionStrategy, Component, DestroyRef, signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PermissionService } from '../../core/permissions/permission.service';
import {
  ListPageComponent,
  ButtonComponent,
  ActionModalComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  IconComponent,
  InputDirective,
  TableColumn
} from '../../shared';
import { DataEngineService } from '../../core/services/data-engine.service';
import { DocumentViewerService } from '../../core/services/document-viewer.service';

import { AdminGrievance, GRIEVANCE_STATUS_BADGE, grievanceStatusVariant } from '../grievance/grievance.shared';

export type { AdminGrievance };

@Component({
  selector: 'app-admin-grievance-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ListPageComponent,
    ButtonComponent,
    ActionModalComponent,
    StatusBadgeComponent,
    IconComponent,
    InputDirective
  ],
  template: `
    <app-list-page
      title="Grievance Management"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Grievance Management' }]"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search User, Title, Description, Issue Type..."
      [columns]="grievanceColumns"
      [data]="filteredGrievances()"
      [pageSize]="10"
      itemUnit="grievances"
      emptyMessage="No grievances match your search query."
      [customTemplates]="{
        viewAction: viewActionTemplate,
        submittedAt: dateTimeTemplate,
        attachment: attachmentTemplate
      }"
    />

    <ng-template #dateTimeTemplate let-item>
      <div class="flex flex-col text-center">
        <span class="text-slate-800 font-normal whitespace-nowrap">{{ item.submittedAt | date:'dd MMM yyyy' }}</span>
        <span class="text-slate-500 text-[11px] whitespace-nowrap">{{ item.submittedAt | date:'hh:mm a' }}</span>
      </div>
    </ng-template>

    <ng-template #attachmentTemplate let-item>
      @if (item.attachment && item.attachment !== 'None') {
        <a href="#" (click)="openPreview(item); $event.preventDefault(); $event.stopPropagation();" class="text-[13px] font-normal text-sky-600 hover:text-sky-700 hover:underline break-all max-w-37.5 inline-block">
          {{ item.attachment }}
        </a>
      } @else {
        <span class="text-slate-400">-</span>
      }
    </ng-template>

    <ng-template #viewActionTemplate let-item>
      <button appButton variant="outline" size="sm" (click)="viewTicket(item)">
        View
      </button>
    </ng-template>

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
                <app-status-badge [variant]="statusVariant(selectedTicket()!.status)">
                  {{ selectedTicket()!.status }}
                </app-status-badge>
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
                  <app-icon name="paperclip" [stroke]="2" class="shrink-0" />
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
                <h4 class="text-[14px] font-bold text-navy mb-4 flex items-center gap-2">
                  <app-icon name="forward" [stroke]="2" />
                  Forward Ticket
                </h4>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Priority <span class="text-rose-500">*</span></label>
                      <select appInput [(ngModel)]="forwardForm.priority" class="w-full">
                        <option value="" disabled selected>Select priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Concerned User <span class="text-rose-500">*</span></label>
                      <select appInput [(ngModel)]="forwardForm.concernedUser" class="w-full">
                        <option value="" disabled selected>Select admin user</option>
                        <option value="Admin User 1">Admin User 1</option>
                        <option value="Admin User 2">Admin User 2</option>
                        <option value="Admin User 3">Admin User 3</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Comments <span class="text-rose-500">*</span></label>
                    <textarea appInput [(ngModel)]="forwardForm.comments" class="w-full" rows="3" placeholder="Enter comments for forwarding"></textarea>
                  </div>
                </div>
              </div>
            }

            <!-- Comment Form Section -->
            @if (isCommenting()) {
              <div class="mt-6 pt-5 border-t border-slate-200">
                <h4 class="text-[14px] font-bold text-navy mb-4 flex items-center gap-2">
                  <app-icon name="chat-bubble" [stroke]="2" />
                  Add Comment
                </h4>
                <div>
                  <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Your Comments <span class="text-rose-500">*</span></label>
                  <textarea appInput [(ngModel)]="commentForm.comments" class="w-full" rows="4" placeholder="Enter your response or remarks here"></textarea>
                </div>
              </div>
            }
          </div>
        }
      </app-action-modal>
  `
})
export class AdminGrievanceListComponent {
  readonly statusVariant = grievanceStatusVariant;
  private sanitizer = inject(DomSanitizer);
  private permissions = inject(PermissionService);
  private docViewer = inject(DocumentViewerService);
  private destroyRef = inject(DestroyRef);

  readonly isDeptAdmin = computed(() => this.permissions.hasRole('dept_admin'));

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

  readonly searchQuery = signal<string>('');

  readonly grievanceColumns: TableColumn<AdminGrievance>[] = [
    { key: 'sNo', label: 'Sr No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'userName', label: 'User Name', cellClass: 'font-normal text-sky-700 min-w-[120px]' },
    { key: 'submittedAt', label: 'Date & Time', align: 'center', type: 'custom', width: 'w-24' },
    { key: 'title', label: 'Title', cellClass: 'font-normal text-slate-800 min-w-[120px]' },
    { key: 'description', label: 'Description', cellClass: 'font-normal text-slate-700 min-w-[180px]' },
    { key: 'issueType', label: 'Issue Type', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'attachment', label: 'Attachment', align: 'center', type: 'custom' },
    { key: 'status', label: 'Status', align: 'center', type: 'status', badgeVariantMap: GRIEVANCE_STATUS_BADGE },
    { key: 'viewAction', label: 'View', align: 'center', width: 'w-16', type: 'custom' }
  ];

  // Admin rows are keyed by their serial number in the seed data.
  private readonly repo = inject(DataEngineService).for<AdminGrievance>('ADMIN_GRIEVANCES', { idKey: 'sNo' });

  readonly grievances = signal<AdminGrievance[]>([]);

  readonly filteredGrievances = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.grievances();
    return this.grievances().filter(g =>
      (g.userName && g.userName.toLowerCase().includes(q)) ||
      (g.title && g.title.toLowerCase().includes(q)) ||
      (g.description && g.description.toLowerCase().includes(q)) ||
      (g.issueType && g.issueType.toLowerCase().includes(q)) ||
      (g.status && g.status.toLowerCase().includes(q))
    );
  });

  constructor() {
    this.repo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => this.grievances.set(list));
  }

  /** Persists a change and swaps the updated row in immutably so OnPush tables re-render. */
  private patchTicket(ticket: AdminGrievance, patch: Partial<AdminGrievance>): void {
    this.repo.update(ticket.sNo, patch).subscribe(updated => {
      this.grievances.update(list => list.map(g => (g.sNo === ticket.sNo ? { ...g, ...updated } : g)));
    });
  }

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
      this.patchTicket(ticket, {
        status: 'In progress',
        comments: `[Forwarded to ${this.forwardForm.concernedUser} - Priority: ${this.forwardForm.priority}]\n\n${this.forwardForm.comments}`
      });
    }
    this.closeViewModal();
  }

  submitComment() {
    if (!this.isCommentFormValid()) return;

    const ticket = this.selectedTicket();
    if (ticket) {
      this.patchTicket(ticket, { comments: this.commentForm.comments });
    }
    this.closeViewModal();
  }

  openPreview(ticket: AdminGrievance) {
    if (ticket.attachment && ticket.attachment !== 'None') {
      this.docViewer.openDocument({
        fileName: ticket.attachment,
        status: 'uploaded'
      }, `Grievance Attachment - ${ticket.title}`);
    }
  }

  closePreview() {
    this.isPreviewModalOpen.set(false);
  }
}
