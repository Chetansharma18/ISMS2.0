// ui-guard-allow: page-frame - the detail view of one application; the list itself uses app-list-page
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import type { FilterTab } from '../../../shared/components/filter-tabs/filter-tabs.component';
import {
  ButtonComponent,
  FilterTabsComponent,
  IconComponent,
  InputDirective,
  ListPageComponent,
  StatusBadgeComponent,
  TableColumn,
  TableComponent
} from '../../../shared';
import { NotificationService } from '../../../core/services/notification.service';
import { OtrReviewComponent } from '../../registration/parts/otr-review.component';
import { OtrFormDef, OtrRecords } from '../../registration/models/otr-api.model';
import { documentsFrom, formSteps, initialStepValues, stepFields } from '../../registration/otr-form.util';
import { OtrRegistrationService } from '../../registration/services/otr-registration.service';
import type { EoiApplyDocument } from '../../eoi/components/scheme-form/eoi-apply.model';
import { answerText, errorText, formatBytes } from '../../eoi/components/scheme-form/eoi-apply.util';
import { otrPersonName } from '../../eoi/components/scheme-form/proposal-details.util';
import { ProposalDetailsViewComponent } from '../../eoi/components/proposal-details-view/proposal-details-view.component';
import { toDisplayDay } from '../services/eoi-config.util';
import type { EoiAppealInfo, EoiStatusApplication } from './eoi-status.model';
import { EoiStatusService } from './eoi-status.service';
import {
  StatusRow,
  appealStatusLabel,
  applicationStatus,
  feeLine,
  pendingClarificationDocs,
  resultOrderFileName,
  statusTime,
  statusTimeline,
  toStatusRow
} from './eoi-status.util';

type ListTab = 'all' | 'UnderReview' | 'Reverted' | 'Approved' | 'Rejected' | 'Draft';
type DetailTab = 'profile' | 'eoiForm' | 'documents' | 'payments';

const LIST_TABS: FilterTab<ListTab>[] = [
  { id: 'all', label: 'All' },
  { id: 'UnderReview', label: 'Under Review' },
  { id: 'Reverted', label: 'Clarification Requested' },
  { id: 'Approved', label: 'Approved' },
  { id: 'Rejected', label: 'Rejected' },
  { id: 'Draft', label: 'Draft' }
];

const DETAIL_TABS: FilterTab<DetailTab>[] = [
  { id: 'profile', label: 'Registration Profile' },
  { id: 'eoiForm', label: 'EOI Form' },
  { id: 'documents', label: 'Uploaded Documents' },
  { id: 'payments', label: 'Payments' }
];

const MAX_APPEAL_FILES = 5;

/**
 * EOI Status: the training partner's EOI applications on the backend, with each one's real-time status:
 * under review, a clarification the committee asked for (answered here), the result once the orders are
 * e-signed and released (with the result order), and an appeal against it.
 */
@Component({
  selector: 'app-eoi-status',
  standalone: true,
  imports: [
    ButtonComponent,
    FilterTabsComponent,
    IconComponent,
    InputDirective,
    ListPageComponent,
    StatusBadgeComponent,
    TableComponent,
    OtrReviewComponent,
    ProposalDetailsViewComponent
  ],
  template: `
    @if (!selected()) {
      <app-list-page
        title="EOI Status"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'EOI Status' }]"
        searchPlaceholder="Search application no., EOI ref. no. or scheme..."
        [(searchQuery)]="search"
        [columns]="listColumns"
        [data]="filteredRows()"
        [pagination]="true"
        [pageSize]="10"
        [emptyMessage]="loading() ? 'Loading your applications...' : 'You have not applied for any EOI yet.'"
        [customTemplates]="{ application: appTpl, status: statusTpl, action: actionTpl }"
      >
        <div beforeTable class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 space-y-2">
          <app-filter-tabs [options]="listTabs()" [value]="tab()" (valueChange)="tab.set($event)" ariaLabel="Filter by status" />
          @if (loadError()) {
            <p class="m-0 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700" role="alert">{{ loadError() }}</p>
          }
        </div>

        <ng-template #appTpl let-row>
          <span class="block text-[13px] text-slate-800 tabular-nums">{{ row.applicationNo }}</span>
          <span class="block text-[11px] text-slate-500 tabular-nums">{{ row.refNo }}</span>
        </ng-template>
        <ng-template #statusTpl let-row>
          <app-status-badge [variant]="row.status.variant">{{ row.status.label }}</app-status-badge>
          @if (row.note) { <span class="block mt-1 text-[11px] text-slate-500">{{ row.note }}</span> }
        </ng-template>
        <ng-template #actionTpl let-row>
          @if (row.isDraft) {
            <button appButton variant="outline" size="sm" type="button" (click)="resume(row)">Resume</button>
          } @else {
            <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="open(row.id)" title="View status" aria-label="View status">
              <app-icon name="eye" size="sm" />
            </button>
          }
        </ng-template>
      </app-list-page>
    } @else {
      @let app = selected()!;
      <div class="w-full min-h-full bg-slate-50/50 px-4 sm:px-6 lg:px-8 py-5 space-y-5 text-slate-800">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <button appButton variant="outline" size="sm" type="button" (click)="closeDetail()">
            <app-icon name="back" />
            <span>Back to EOI Status</span>
          </button>
          <button appButton variant="ghost" size="sm" type="button" [disabled]="busy()" (click)="refresh()" title="Refresh the status">
            <app-icon name="refresh" size="sm" />
            <span>Refresh</span>
          </button>
        </div>

        <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="m-0 text-xl sm:text-2xl font-bold text-slate-900">{{ app.notice.schemeName }}</h1>
            <app-status-badge [variant]="status().variant">{{ status().label }}</app-status-badge>
          </div>
          <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-xs">
            @for (item of summary(); track item.label) {
              <div class="min-w-0">
                <dt class="text-[11.5px] text-slate-500">{{ item.label }}</dt>
                <dd class="m-0 mt-1 text-[13px] font-semibold text-slate-900 tabular-nums break-words">{{ item.value }}</dd>
              </div>
            }
          </dl>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <!-- Progress -->
          <section class="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5" aria-labelledby="progress-heading">
            <h2 id="progress-heading" class="m-0 mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Application Progress</h2>
            <ol class="m-0 p-0 list-none">
              @for (step of timeline(); track step.key; let last = $last) {
                <li class="relative flex gap-3 pb-5" [class.pb-0]="last">
                  @if (!last) { <span class="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200" aria-hidden="true"></span> }
                  <span
                    class="relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                    [class.bg-navy]="step.state === 'done'" [class.border-navy]="step.state === 'done' || step.state === 'current'"
                    [class.text-white]="step.state === 'done'" [class.bg-white]="step.state !== 'done'"
                    [class.border-amber-500]="step.state === 'alert'" [class.border-slate-300]="step.state === 'todo'"
                  >
                    @if (step.state === 'done') { <app-icon name="check" size="xs" /> }
                    @else if (step.state === 'alert') { <span class="w-2 h-2 rounded-full bg-amber-500"></span> }
                    @else if (step.state === 'current') { <span class="w-2 h-2 rounded-full bg-navy"></span> }
                  </span>
                  <div class="min-w-0 text-xs">
                    <p class="m-0 font-semibold" [class.text-slate-900]="step.state !== 'todo'" [class.text-slate-500]="step.state === 'todo'">{{ step.title }}</p>
                    @if (step.when) { <p class="m-0 mt-0.5 text-[11px] text-slate-500 tabular-nums">{{ step.when }}</p> }
                    @if (step.detail) { <p class="m-0 mt-1 text-slate-600 leading-relaxed">{{ step.detail }}</p> }
                  </div>
                </li>
              }
            </ol>
          </section>

          <div class="lg:col-span-8 space-y-5">
            <!-- Result (after the orders are released) -->
            @if (app.decision; as d) {
              <section class="bg-white rounded-xl border shadow-2xs p-5 space-y-3"
                       [class.border-emerald-200]="d.status === 'Approved'" [class.border-rose-200]="d.status !== 'Approved'"
                       aria-labelledby="result-heading">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <h2 id="result-heading" class="m-0 text-base font-bold text-slate-900">
                    {{ d.status === 'Approved' ? 'Your application is approved' : 'Your application is not approved' }}
                  </h2>
                  @if (app.resultOrder) {
                    <button appButton size="sm" type="button" [disabled]="busy()" (click)="downloadOrder()">
                      <app-icon name="download" size="sm" />
                      <span>Download {{ d.status === 'Approved' ? 'Empanelment' : 'Rejection' }} Order</span>
                    </button>
                  }
                </div>
                <dl class="m-0 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  @if (d.status === 'Approved') {
                    <div><dt class="text-[11.5px] text-slate-500">Grade</dt><dd class="m-0 mt-1 text-[13px] font-semibold text-slate-900">{{ d.grade || '-' }}</dd></div>
                  }
                  <div><dt class="text-[11.5px] text-slate-500">Order No.</dt><dd class="m-0 mt-1 text-[13px] font-semibold text-slate-900 tabular-nums break-all">{{ app.resultOrder?.orderNo || '-' }}</dd></div>
                  <div><dt class="text-[11.5px] text-slate-500">Released On</dt><dd class="m-0 mt-1 text-[13px] font-semibold text-slate-900 tabular-nums">{{ time(app.resultOrder?.publishedAt) }}</dd></div>
                </dl>
                @if (d.remarks) {
                  <p class="m-0 text-xs text-slate-700 leading-relaxed whitespace-pre-line"><span class="font-semibold">Remarks:</span> {{ d.remarks }}</p>
                }
              </section>
            }

            <!-- Clarification requested by the committee -->
            @if (app.clarification; as c) {
              <section class="bg-white rounded-xl border shadow-2xs p-5 space-y-3" [class.border-amber-200]="c.isOpen" [class.border-slate-200]="!c.isOpen" aria-labelledby="clar-heading">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <h2 id="clar-heading" class="m-0 text-base font-bold text-slate-900">{{ c.isOpen ? 'Clarification requested' : 'Clarification sent' }}</h2>
                  <span class="text-xs text-slate-500 tabular-nums">
                    Requested {{ time(c.requestedAt) }}{{ c.isOpen ? ' · reply by ' + time(c.dueAt) : ' · replied ' + time(c.respondedAt) }}
                  </span>
                </div>
                @if (c.comment) { <p class="m-0 text-xs text-slate-700 whitespace-pre-line">{{ c.comment }}</p> }
                <ul class="m-0 p-0 list-none space-y-2">
                  @for (doc of c.documents; track doc) {
                    <li class="flex items-center justify-between gap-3 flex-wrap rounded-lg border border-slate-200 px-3 py-2 text-xs">
                      <span class="font-medium text-slate-800">{{ doc }}</span>
                      <span class="flex items-center gap-2">
                        @if (uploadFor(c.uploads, doc); as up) {
                          <button appButton variant="ghost" size="sm" type="button" (click)="viewDocument(up)">
                            <app-icon name="eye" size="sm" />
                            <span class="max-w-[180px] truncate">{{ up.file?.fileName }}</span>
                          </button>
                        }
                        @if (c.isOpen) {
                          <input #clarFile type="file" class="hidden" (change)="uploadClarification(doc, $event)" />
                          @if (uploadFor(c.uploads, doc)) {
                            <button appButton variant="ghost" size="sm" iconOnly type="button" [disabled]="busy()" (click)="clarFile.click()" title="Replace Document" aria-label="Replace Document">
                              <app-icon name="refresh" size="sm" />
                            </button>
                          } @else {
                            <button appButton variant="outline" size="sm" type="button" [disabled]="busy()" (click)="clarFile.click()">
                              Upload
                            </button>
                          }
                        }
                      </span>
                    </li>
                  }
                </ul>
                @if (c.isOpen) {
                  <textarea appInput rows="2" class="w-full" placeholder="Comment to the committee (optional)" aria-label="Comment to the committee"
                            [value]="clarComment()" (input)="clarComment.set($any($event.target).value)"></textarea>
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <span class="text-xs text-slate-500">{{ pendingDocs().length ? 'Still to upload: ' + pendingDocs().join(', ') : 'Every requested document is uploaded.' }}</span>
                    <button appButton size="sm" type="button" [disabled]="busy() || pendingDocs().length > 0" (click)="sendClarification()">Send to Committee</button>
                  </div>
                }
              </section>
            }

            <!-- Appeal against the released result -->
            @if (app.appeal; as info) {
              @if (info.appeal; as appeal) {
                <section class="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3" aria-labelledby="appeal-heading">
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h2 id="appeal-heading" class="m-0 text-base font-bold text-slate-900">Appeal</h2>
                    <app-status-badge [variant]="appeal.status === 'Rejected' || appeal.status === 'Lapsed' ? 'danger' : appeal.status === 'Closed' ? 'success' : 'submitted'">
                      {{ appealLabel(appeal) }}
                    </app-status-badge>
                  </div>
                  <p class="m-0 text-xs text-slate-500 tabular-nums">Submitted {{ time(appeal.submittedAt) }}</p>
                  <p class="m-0 text-xs text-slate-700 whitespace-pre-line"><span class="font-semibold">Your reason:</span> {{ appeal.reason }}</p>
                  @if (appeal.authorityRemark) {
                    <p class="m-0 text-xs text-slate-700 whitespace-pre-line"><span class="font-semibold">Appeal Authority:</span> {{ appeal.authorityRemark }}</p>
                  }
                  @if (appeal.status === 'Closed' && appeal.redecidedStatus) {
                    <p class="m-0 text-xs text-slate-700">
                      <span class="font-semibold">Result after appeal:</span>
                      {{ appeal.redecidedStatus }}{{ appeal.redecidedGrade ? ' (grade ' + appeal.redecidedGrade + ')' : '' }}{{ appeal.redecidedRemark ? '. ' + appeal.redecidedRemark : '' }}
                    </p>
                  }
                  @if (appeal.documents.length) {
                    <div class="flex flex-wrap gap-2">
                      @for (doc of appeal.documents; track doc.id) {
                        <button appButton variant="ghost" size="sm" type="button" (click)="viewAppealDocument(doc.id)">
                          <app-icon name="eye" size="sm" />
                          <span class="max-w-[200px] truncate">{{ doc.title || doc.fileName }}</span>
                        </button>
                      }
                    </div>
                  }
                  @if (appeal.canRespond) {
                    <div class="rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                      <p class="m-0 text-xs text-amber-900">
                        The committee asked for your response by {{ day(appeal.windowEnd) }}{{ appeal.windowComment ? ': ' + appeal.windowComment : '.' }}
                      </p>
                      @for (doc of appeal.requestedDocuments; track doc) {
                        <div class="flex items-center justify-between gap-3 text-xs">
                          <span class="font-medium text-slate-800">{{ doc }}</span>
                          <input #appealFile type="file" class="hidden" (change)="uploadAppealDocument(doc, $event)" />
                          <button appButton variant="outline" size="sm" type="button" [disabled]="busy()" (click)="appealFile.click()">Upload</button>
                        </div>
                      }
                      <textarea appInput rows="3" class="w-full" placeholder="Your response to the committee" aria-label="Your response to the committee"
                                [value]="appealResponse()" (input)="appealResponse.set($any($event.target).value)"></textarea>
                      <div class="flex justify-end">
                        <button appButton size="sm" type="button" [disabled]="busy() || !appealResponse().trim()" (click)="sendAppealResponse()">Send Response</button>
                      </div>
                    </div>
                  }
                </section>
              } @else if (info.canAppeal) {
                <section class="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3" aria-labelledby="new-appeal-heading">
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h2 id="new-appeal-heading" class="m-0 text-base font-bold text-slate-900">Appeal against the result</h2>
                    <span class="text-xs text-slate-500 tabular-nums">Open until {{ time(info.appealDeadline) }}</span>
                  </div>
                  <textarea appInput rows="3" class="w-full" placeholder="Why should the result be reconsidered?" aria-label="Reason for the appeal"
                            [value]="appealReason()" (input)="appealReason.set($any($event.target).value)"></textarea>
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-2 flex-wrap text-xs">
                      <input #appealFiles type="file" multiple class="hidden" (change)="pickAppealFiles($event)" />
                      <button appButton variant="outline" size="sm" type="button" [disabled]="appealFilesList().length >= maxAppealFiles" (click)="appealFiles.click()">
                        <app-icon name="file" size="sm" />
                        <span>Attach Documents</span>
                      </button>
                      @for (f of appealFilesList(); track f.name; let i = $index) {
                        <span class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 pl-2 text-slate-700">
                          <span class="max-w-[160px] truncate">{{ f.name }}</span>
                          <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="removeAppealFile(i)" [attr.aria-label]="'Remove ' + f.name">
                            <app-icon name="close" size="xs" />
                          </button>
                        </span>
                      }
                    </div>
                    <button appButton size="sm" type="button" [disabled]="busy() || appealReason().trim().length < 10" (click)="submitAppeal()">Submit Appeal</button>
                  </div>
                </section>
              }
            }

            <!-- What was submitted -->
            <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <app-filter-tabs [options]="detailTabs" [value]="detailTab()" (valueChange)="detailTab.set($event)" ariaLabel="Application sections" />
              @switch (detailTab()) {
                @case ('profile') {
                  @if (otrForm(); as form) {
                    <app-otr-review [form]="form" [values]="profileValues()" [documents]="profileDocuments()" [readOnly]="true" (viewDocument)="viewOtrDocument($event)" />
                  } @else {
                    <p class="m-0 text-xs text-slate-500">{{ otrFormFailed() ? 'The registration form could not be loaded.' : 'Loading the registration profile...' }}</p>
                  }
                }
                @case ('eoiForm') {
                  <!-- Step 2 "EOI Form" as submitted: the built-in sections, then the EOI's own questions -->
                  <app-proposal-details-view [details]="app.proposalDetails" [otrPersonName]="otrPerson()" />
                  @if (customAnswers().length > 0) {
                    <div class="space-y-2 pt-2">
                      <h3 class="m-0 text-[13px] font-semibold text-slate-700">Details Required by this EOI</h3>
                      <dl class="m-0 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                        @for (row of customAnswers(); track row.key) {
                          <div class="min-w-0">
                            <dt class="text-[11.5px] font-medium text-slate-500">{{ row.label }}</dt>
                            <dd class="m-0 text-[13px] text-slate-900 break-words whitespace-pre-line">{{ row.value || '-' }}</dd>
                          </div>
                        }
                      </dl>
                    </div>
                  }
                }
                @case ('documents') {
                  <app-table [columns]="docColumns" [data]="app.documents" [customTemplates]="{ file: fileTpl, view: viewTpl }" />
                  <ng-template #fileTpl let-doc>
                    @if (doc.file) {
                      <span class="block text-xs text-slate-800 break-all">{{ doc.file.fileName }}</span>
                      <span class="block text-[11px] text-slate-500">{{ size(doc.file.sizeBytes) }}</span>
                    } @else {
                      <span class="text-xs text-slate-400">{{ doc.comment || 'Not uploaded' }}</span>
                    }
                  </ng-template>
                  <ng-template #viewTpl let-doc>
                    @if (doc.documentId) {
                      <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="viewDocument(doc)" title="View document" aria-label="View document">
                        <app-icon name="eye" size="sm" />
                      </button>
                    }
                  </ng-template>
                }
                @case ('payments') {
                  <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div class="rounded-lg border border-slate-200 p-4">
                      <dt class="text-[11.5px] text-slate-500">Processing Fee</dt>
                      <dd class="m-0 mt-1 text-[13px] font-semibold text-slate-900 tabular-nums">{{ fee(app.processFee) }}</dd>
                      @if (app.processFee.prn) { <dd class="m-0 mt-1 text-[11px] text-slate-500 tabular-nums">PRN {{ app.processFee.prn }}</dd> }
                    </div>
                    <div class="rounded-lg border border-slate-200 p-4">
                      <dt class="text-[11.5px] text-slate-500">EMD</dt>
                      <dd class="m-0 mt-1 text-[13px] font-semibold text-slate-900 tabular-nums">{{ fee(app.emd) }}</dd>
                      @if (app.emd.prn) { <dd class="m-0 mt-1 text-[11px] text-slate-500 tabular-nums">PRN {{ app.emd.prn }}</dd> }
                    </div>
                  </dl>
                }
              }
            </section>
          </div>
        </div>
      </div>
    }
  `
})
export class EoiStatusComponent implements OnInit {
  private readonly api = inject(EoiStatusService);
  private readonly otrApi = inject(OtrRegistrationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly applications = signal<EoiStatusApplication[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly search = signal('');
  readonly tab = signal<ListTab>('all');

  readonly selected = signal<EoiStatusApplication | null>(null);
  readonly busy = signal(false);
  readonly detailTab = signal<DetailTab>('profile');
  /** The organisation-level authorized person's name (for "Same as organisation-level authorized person"). */
  readonly otrPerson = computed(() => otrPersonName(this.selected()?.profile));
  /** The EOI's own "Details Required" questions with the answers given. */
  readonly customAnswers = computed(() => {
    const app = this.selected();
    const answers = app?.dynamicAnswers ?? {};
    return (app?.customFields ?? []).map(field => ({ key: field.key, label: field.label, value: answerText(field, answers[field.key]) }));
  });
  readonly otrForm = signal<OtrFormDef | null>(null);
  readonly otrFormFailed = signal(false);
  readonly clarComment = signal('');
  readonly appealReason = signal('');
  readonly appealResponse = signal('');
  readonly appealFilesList = signal<File[]>([]);

  protected readonly detailTabs = DETAIL_TABS;
  protected readonly maxAppealFiles = MAX_APPEAL_FILES;

  readonly rows = computed(() => this.applications().map(toStatusRow));
  readonly listTabs = computed<FilterTab<ListTab>[]>(() => {
    const rows = this.rows();
    return LIST_TABS.map(t => ({ ...t, count: t.id === 'all' ? rows.length : rows.filter(r => this.rowStatus(r) === t.id).length }));
  });
  readonly filteredRows = computed(() => {
    const q = this.search().trim().toLowerCase();
    const tab = this.tab();
    return this.rows().filter(r =>
      (tab === 'all' || this.rowStatus(r) === tab) &&
      (!q || [r.applicationNo, r.refNo, r.schemeName, r.schemeCategory].some(v => v.toLowerCase().includes(q)))
    );
  });

  readonly status = computed(() => applicationStatus(this.selected() ?? { status: '', decision: null }));
  readonly timeline = computed(() => (this.selected() ? statusTimeline(this.selected()!) : []));
  readonly pendingDocs = computed(() => (this.selected() ? pendingClarificationDocs(this.selected()!) : []));
  readonly summary = computed(() => {
    const app = this.selected();
    if (!app) return [];
    return [
      { label: 'Application No.', value: app.applicationNo },
      { label: 'EOI Reference No.', value: app.notice.refNo },
      { label: 'Scheme Category', value: app.notice.schemeCategory || '-' },
      { label: 'Submitted On', value: statusTime(app.submittedAt) },
      { label: 'Last Date of Submission', value: toDisplayDay(app.notice.closingDate ?? '') || '-' },
      { label: 'OTR Reference No.', value: app.otrReferenceNo || '-' }
    ];
  });

  readonly profileValues = computed(() => {
    const form = this.otrForm();
    const records = (this.selected()?.profile ?? {}) as OtrRecords;
    if (!form) return {};
    return Object.fromEntries(formSteps(form).map(step => [step.key, initialStepValues(step, records[step.key])]));
  });
  readonly profileDocuments = computed(() => {
    const form = this.otrForm();
    return form ? documentsFrom(form, (this.selected()?.profile ?? {}) as OtrRecords) : {};
  });

  protected readonly listColumns: TableColumn<StatusRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'application', label: 'Application / EOI Ref. No.', type: 'custom', width: 'min-w-[200px]' },
    { key: 'schemeName', label: 'Scheme Name' },
    { key: 'schemeCategory', label: 'Scheme Category' },
    { key: 'submittedOn', label: 'Submitted On', cellClass: 'whitespace-nowrap tabular-nums' },
    { key: 'status', label: 'Status', type: 'custom', align: 'center' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-24' }
  ];

  protected readonly docColumns: TableColumn<EoiApplyDocument>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Document' },
    { key: 'file', label: 'File', type: 'custom' },
    { key: 'view', label: 'Action', type: 'custom', align: 'center', width: 'w-20' }
  ];

  ngOnInit(): void {
    this.loadList();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params.get('applicationId'));
      if (Number.isInteger(id) && id > 0) this.loadDetail(id);
      else this.selected.set(null);
    });
  }

  open(id: number): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { applicationId: id } });
  }

  closeDetail(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    this.loadList();
  }

  resume(row: StatusRow): void {
    void this.router.navigate(['/scheme-form'], { queryParams: { eoiId: row.eoiId, refNo: row.refNo } });
  }

  refresh(): void {
    const app = this.selected();
    if (app) this.loadDetail(app.id);
  }

  protected time = statusTime;
  protected fee = feeLine;
  protected appealLabel = appealStatusLabel;
  protected day(value: string | null): string {
    return (value && toDisplayDay(value)) || value || '-';
  }
  protected size(bytes: number): string {
    return formatBytes(bytes);
  }
  protected uploadFor(uploads: EoiApplyDocument[], name: string): EoiApplyDocument | undefined {
    return uploads.find(u => !!u.file && u.name.trim().toLowerCase() === name.trim().toLowerCase());
  }

  // ---- result order and documents ---------------------------------------------------------------

  downloadOrder(): void {
    const app = this.selected();
    if (!app?.resultOrder) return;
    this.busy.set(true);
    this.api.resultOrder(app.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: blob => {
        this.busy.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resultOrderFileName(app.resultOrder!.orderNo);
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (e: unknown) => {
        this.busy.set(false);
        this.notifications.error(errorText(e, 'The order could not be downloaded.'));
      }
    });
  }

  viewDocument(doc: EoiApplyDocument): void {
    const app = this.selected();
    if (app && doc.documentId) this.openBlob(this.api.document(app.id, doc.documentId));
  }

  viewAppealDocument(documentId: number): void {
    const app = this.selected();
    if (app) this.openBlob(this.api.appealDocument(app.id, documentId));
  }

  viewOtrDocument(fieldKey: string): void {
    const form = this.otrForm();
    const field = form ? formSteps(form).flatMap(stepFields).find(f => f.key === fieldKey) : undefined;
    if (field?.documentType) this.openBlob(this.otrApi.documentBlob(field.documentType));
  }

  // ---- clarification ----------------------------------------------------------------------------

  uploadClarification(title: string, event: Event): void {
    const file = this.pickFile(event);
    const app = this.selected();
    if (!file || !app) return;
    this.act(this.api.uploadClarification(app.id, title, file), updated => this.selected.set(updated), `${title} uploaded.`);
  }

  sendClarification(): void {
    const app = this.selected();
    if (!app) return;
    this.act(this.api.submitClarification(app.id, this.clarComment().trim()), updated => {
      this.selected.set(updated);
      this.clarComment.set('');
    }, 'The documents have been sent to the committee.');
  }

  // ---- appeal -----------------------------------------------------------------------------------

  pickAppealFiles(event: Event): void {
    const el = event.target as HTMLInputElement;
    const files = Array.from(el.files ?? []);
    el.value = '';
    this.appealFilesList.update(list => [...list, ...files.filter(f => !list.some(x => x.name === f.name))].slice(0, MAX_APPEAL_FILES));
  }

  removeAppealFile(index: number): void {
    this.appealFilesList.update(list => list.filter((_, i) => i !== index));
  }

  submitAppeal(): void {
    const app = this.selected();
    if (!app) return;
    const files = this.appealFilesList().map(file => ({ title: file.name.replace(/\.[^.]+$/, ''), file }));
    this.act(this.api.submitAppeal(app.id, this.appealReason().trim(), files), info => {
      this.setAppeal(info);
      this.appealReason.set('');
      this.appealFilesList.set([]);
    }, 'Your appeal has been submitted.');
  }

  uploadAppealDocument(title: string, event: Event): void {
    const file = this.pickFile(event);
    const app = this.selected();
    if (!file || !app) return;
    this.act(this.api.uploadAppealDocument(app.id, title, file), info => this.setAppeal(info), `${title} uploaded.`);
  }

  sendAppealResponse(): void {
    const app = this.selected();
    if (!app) return;
    this.act(this.api.submitAppealResponse(app.id, this.appealResponse().trim()), info => {
      this.setAppeal(info);
      this.appealResponse.set('');
    }, 'Your response has been sent to the committee.');
  }

  // ---- helpers ----------------------------------------------------------------------------------

  private rowStatus(row: StatusRow): ListTab {
    const app = this.applications().find(a => a.id === row.id);
    return (app?.decision?.status ?? app?.status ?? 'all') as ListTab;
  }

  private loadList(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.api.list(null).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: page => {
        this.applications.set(page.items ?? []);
        this.loading.set(false);
      },
      error: (e: unknown) => {
        this.loading.set(false);
        this.loadError.set(errorText(e, 'Your applications could not be loaded. Please try again.'));
      }
    });
  }

  private loadDetail(id: number): void {
    this.busy.set(true);
    this.loadOtrForm();
    this.api.get(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: app => {
        this.busy.set(false);
        this.selected.set(app);
      },
      error: (e: unknown) => {
        this.busy.set(false);
        this.selected.set(null);
        this.loadError.set(errorText(e, 'The application could not be opened.'));
      }
    });
  }

  private loadOtrForm(): void {
    if (this.otrForm()) return;
    this.otrFormFailed.set(false);
    this.otrApi
      .loadForm()
      .pipe(
        catchError(() => {
          this.otrFormFailed.set(true);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(form => this.otrForm.set(form));
  }

  private setAppeal(info: EoiAppealInfo): void {
    this.selected.update(app => (app ? { ...app, appeal: info } : app));
  }

  private act<T>(call: Observable<T>, done: (value: T) => void, message: string): void {
    if (this.busy()) return;
    this.busy.set(true);
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.busy.set(false);
        done(value);
        this.notifications.success(message);
      },
      error: (e: unknown) => {
        this.busy.set(false);
        this.notifications.error(errorText(e, 'The action could not be completed. Please try again.'));
      }
    });
  }

  private pickFile(event: Event): File | null {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0] ?? null;
    el.value = '';
    return file;
  }

  private openBlob(blob$: Observable<Blob>): void {
    blob$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (e: unknown) => this.notifications.error(errorText(e, 'The document could not be opened.'))
    });
  }
}
