import { ChangeDetectionStrategy, Component, DestroyRef, signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  ListPageComponent,
  ButtonComponent,
  IconComponent,
  ActionModalComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  InputDirective,
  TableColumn
} from '../../shared';
import { DataEngineService } from '../../core/services/data-engine.service';
import { DocumentViewerService } from '../../core/services/document-viewer.service';

import { Grievance, GRIEVANCE_STATUS_BADGE, grievanceStatusVariant } from './grievance.shared';

export type { Grievance };

@Component({
  selector: 'app-grievance-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ListPageComponent,
    ButtonComponent,
    IconComponent,
    ActionModalComponent,
    StatusBadgeComponent,
    InputDirective
  ],
  template: `
    <app-list-page
      title="Grievance"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Grievance' }]"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search Title, Description, Issue Type..."
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
    >
      <button headerActions appButton size="sm" (click)="openRaiseTicket()">
        <app-icon name="plus" size="sm" />
        <span>Raise Ticket</span>
      </button>
    </app-list-page>

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

      <!-- Raise Ticket Modal -->
      <app-action-modal
        [isOpen]="isModalOpen()"
        [title]="'Raise Ticket'"
        primaryLabel="Forward"
        secondaryLabel="Cancel"
        [showCloseButton]="true"
        [showAccentBar]="false"
        (primaryAction)="submitTicket()"
        (secondaryAction)="closeModal()"
        (close)="closeModal()"
      >
        <div class="mt-5 space-y-4 text-left">
          <div>
            <div class="flex justify-between items-end mb-1.5">
              <label class="block text-[13px] font-semibold text-slate-700">Title <span class="text-rose-500">*</span></label>
              <span class="text-[11px]" [ngClass]="{'text-rose-500 font-medium': getWordCount(newTicket.title) > 100, 'text-slate-400': getWordCount(newTicket.title) <= 100}">
                {{ getWordCount(newTicket.title) }}/100 words
              </span>
            </div>
            <input appInput type="text" [(ngModel)]="newTicket.title" class="w-full" [invalid]="isFieldInvalid('title')" placeholder="Enter title" />
          </div>
          <div>
            <div class="flex justify-between items-end mb-1.5">
              <label class="block text-[13px] font-semibold text-slate-700">Description <span class="text-rose-500">*</span></label>
              <span class="text-[11px]" [ngClass]="{'text-rose-500 font-medium': getWordCount(newTicket.description) > 500, 'text-slate-400': getWordCount(newTicket.description) <= 500}">
                {{ getWordCount(newTicket.description) }}/500 words
              </span>
            </div>
            <textarea appInput [(ngModel)]="newTicket.description" class="w-full" [invalid]="isFieldInvalid('description')" rows="4" placeholder="Enter description"></textarea>
          </div>
          <div>
            <label class="block text-[13px] font-semibold text-slate-700 mb-1.5">Issue Type <span class="text-rose-500">*</span></label>
            <select appInput [(ngModel)]="newTicket.issueType" class="w-full" [invalid]="isFieldInvalid('issueType')">
              <option value="" disabled selected>Select issue type</option>
              <option value="Enquire">Enquire</option>
              <option value="Technical">Technical</option>
              <option value="accounts">accounts</option>
            </select>
          </div>
          <div>
            <div class="flex justify-between items-end mb-1.5">
              <label class="block text-[13px] font-semibold text-slate-700">Attachment (PDF, PNG, JPG, TXT)</label>
              <span class="text-[11px] text-slate-400">Max upload 5MB</span>
            </div>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" (change)="onFileSelected($event)" class="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[13px] file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer" />
            @if (attachmentError()) {
              <p class="text-rose-500 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                <app-icon name="alert-triangle" size="sm" [stroke]="2" />
                {{ attachmentError() }}
              </p>
            }
          </div>
        </div>
      </app-action-modal>

      <!-- View Ticket Modal -->
      <app-action-modal
        [isOpen]="isViewModalOpen()"
        [title]="'Ticket Details'"
        primaryLabel="Close"
        secondaryLabel=""
        [showPrimaryArrow]="false"
        [showCloseButton]="true"
        [showAccentBar]="false"
        (primaryAction)="closeViewModal()"
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
            
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</label>
              <div class="text-[13px] font-semibold text-slate-800">{{ selectedTicket()!.submittedAt | date:'medium' }}</div>
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
          </div>
        }
      </app-action-modal>
  `
})
export class GrievanceListComponent {
  readonly statusVariant = grievanceStatusVariant;
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  readonly isModalOpen = signal(false);
  readonly isViewModalOpen = signal(false);
  readonly isPreviewModalOpen = signal(false);
  readonly isSubmitted = signal(false);
  readonly selectedTicket = signal<Grievance | null>(null);
  private docViewer = inject(DocumentViewerService);
  
  readonly previewAttachmentName = signal('');
  readonly previewAttachmentUrl = signal<SafeResourceUrl | null>(null);
  readonly attachmentError = signal('');

  newTicket = {
    title: '',
    description: '',
    issueType: '' as 'Enquire' | 'Technical' | 'accounts' | '',
    attachment: '',
    attachmentUrl: null as SafeResourceUrl | null
  };

  readonly searchQuery = signal<string>('');

  readonly grievanceColumns: TableColumn<Grievance>[] = [
    { key: 'sNo', label: 'Sr No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'submittedAt', label: 'Date & Time', align: 'center', type: 'custom', width: 'w-24' },
    { key: 'title', label: 'Title', cellClass: 'font-normal text-slate-800 min-w-[120px]' },
    { key: 'description', label: 'Description', cellClass: 'font-normal text-slate-700 min-w-[180px]' },
    { key: 'issueType', label: 'Issue Type', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'attachment', label: 'Attachment', align: 'center', type: 'custom' },
    { key: 'status', label: 'Status', align: 'center', type: 'status', badgeVariantMap: GRIEVANCE_STATUS_BADGE },
    { key: 'viewAction', label: 'View', align: 'center', width: 'w-16', type: 'custom' }
  ];

  private readonly repo = inject(DataEngineService).for<Grievance>('GRIEVANCES');

  readonly grievances = signal<Grievance[]>([]);

  readonly filteredGrievances = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.grievances();
    return this.grievances().filter(g =>
      (g.title && g.title.toLowerCase().includes(q)) ||
      (g.description && g.description.toLowerCase().includes(q)) ||
      (g.issueType && g.issueType.toLowerCase().includes(q)) ||
      (g.status && g.status.toLowerCase().includes(q))
    );
  });

  constructor() {
    this.repo.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(list => this.grievances.set(this.renumber(list)));
  }

  private renumber(list: Grievance[]): Grievance[] {
    return list.map((g, i) => ({ ...g, sNo: i + 1 }));
  }

  openRaiseTicket() {
    this.newTicket = { title: '', description: '', issueType: '', attachment: '', attachmentUrl: null };
    this.attachmentError.set('');
    this.isSubmitted.set(false);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  viewTicket(ticket: Grievance) {
    this.selectedTicket.set(ticket);
    this.isViewModalOpen.set(true);
  }

  closeViewModal() {
    this.isViewModalOpen.set(false);
    setTimeout(() => this.selectedTicket.set(null), 300);
  }

  openPreview(ticket: Grievance) {
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

  getWordCount(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  isFormValid(): boolean {
    return this.newTicket.title.trim().length > 0 &&
           this.getWordCount(this.newTicket.title) <= 100 &&
           this.newTicket.description.trim().length > 0 &&
           this.getWordCount(this.newTicket.description) <= 500 &&
           this.newTicket.issueType !== '';
  }

  isFieldInvalid(field: 'title' | 'description' | 'issueType'): boolean {
    if (!this.isSubmitted()) {
      if (field === 'title') return this.getWordCount(this.newTicket.title) > 100;
      if (field === 'description') return this.getWordCount(this.newTicket.description) > 500;
      return false;
    }
    
    if (field === 'title') {
      return this.newTicket.title.trim().length === 0 || this.getWordCount(this.newTicket.title) > 100;
    }
    if (field === 'description') {
      return this.newTicket.description.trim().length === 0 || this.getWordCount(this.newTicket.description) > 500;
    }
    if (field === 'issueType') {
      return this.newTicket.issueType === '';
    }
    return false;
  }

  onFileSelected(event: Event) {
    this.attachmentError.set('');
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.attachmentError.set('File size exceeds the 5MB limit.');
        input.value = ''; // Reset input
        this.newTicket.attachment = '';
        this.newTicket.attachmentUrl = null;
        return;
      }
      this.newTicket.attachment = file.name;
      // Create a local blob URL for the selected file to render in an iframe
      const objectUrl = URL.createObjectURL(file);
      this.newTicket.attachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    }
  }

  submitTicket() {
    this.isSubmitted.set(true);
    if (!this.isFormValid()) return;

    // The blob preview URL only exists in the browser, so it is kept out of the persisted record.
    const attachmentUrl = this.newTicket.attachmentUrl || undefined;
    const record: Partial<Grievance> = {
      submittedAt: new Date().toISOString(),
      title: this.newTicket.title,
      description: this.newTicket.description,
      issueType: this.newTicket.issueType as 'Enquire' | 'Technical' | 'accounts',
      attachment: this.newTicket.attachment || 'None',
      status: 'Open'
    };

    this.repo.create(record).subscribe(created => {
      this.grievances.update(list => this.renumber([{ ...created, attachmentUrl }, ...list]));
      this.closeModal();
    });
  }
}
