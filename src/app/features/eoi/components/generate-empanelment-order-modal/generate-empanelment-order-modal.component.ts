import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  ButtonComponent,
  IconComponent,
  ModalComponent,
  StatusBadgeComponent,
  StepperComponent,
  StepperStep,
  TableColumn,
  TableComponent
} from '../../../../shared';
import { NotificationService } from '../../../../core/services/notification.service';
import { errorText } from '../scheme-form/eoi-apply.util';
import { ResultOrdersService } from './result-orders.service';
import {
  BulkRowDto,
  BulkUploadDto,
  ESignAction,
  ORDER_TITLE,
  OrderDto,
  OrderSlot,
  OrderStep,
  OrderType,
  OrdersOverviewDto,
  PublishResultDto,
  ReadinessDto,
  eSignActions,
  generateBlockers,
  initialOrderStep,
  isOrderComplete,
  isOrderFinal,
  orderSlots,
  orderStatusBadge,
  orderTime,
  rowResultBadge,
  signingAuthorityText
} from './result-orders.util';
import { OrderEsignModalComponent } from './order-esign-modal.component';

const STEPS: StepperStep[] = [
  { label: 'Decisions' },
  { label: 'Draft Orders' },
  { label: 'Sign & Verify' },
  { label: 'Orders Released' }
];

/**
 * Generate Empanelment & Rejection Orders, on the backend.
 *
 * 1. Decisions: the decisions already recorded (Approve / Reject on the Scrutiny Desk), and the evaluation Excel:
 *    upload it, read the backend's row-by-row check, then apply it. Both methods write the same decision.
 * 2. Draft Orders: the approver generates the draft PDF of each order from the current decisions.
 * 3. Sign & Verify: each order has its own signing authority (set in the draft editor). "E-Sign Empanelment Order"
 *    and "E-Sign Rejection Order" each open the OTP e-sign of that order only, for its signing authority only: every
 *    page of that order gets the e-signature and it becomes final (decisions lock).
 * 4. Orders Released: once every order is signed, the approver (or a results publisher) publishes them with an OTP.
 */
@Component({
  selector: 'app-generate-empanelment-order-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent, IconComponent, StatusBadgeComponent, StepperComponent, TableComponent, OrderEsignModalComponent],
  template: `
    <app-modal title="Generate Empanelment & Rejection Orders" [subtitle]="schemeName()" size="2xl" [showClose]="false" (close)="close.emit()">
      <div class="space-y-4 p-1 text-xs">
        <div class="pb-4 mb-1 border-b border-slate-200">
          <app-stepper variant="line" [bare]="true" [steps]="steps" [currentStep]="step()" (stepClick)="goTo($event)" ariaLabel="Order progress" />
        </div>

        @if (error()) {
          <p class="m-0 p-2.5 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium" role="alert">{{ error() }}</p>
        }

        @if (!overview()) {
          <p class="m-0 py-8 text-xs text-center text-slate-500">{{ loading() ? 'Loading the decisions and orders...' : '' }}</p>
        } @else {
          @switch (step()) {
            @case (1) {
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <span class="block text-xs font-medium text-slate-500">Approved</span>
                  <span class="block mt-1 text-2xl font-bold leading-none text-slate-900 tabular-nums">{{ overview()!.approved }}</span>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <span class="block text-xs font-medium text-slate-500">Rejected</span>
                  <span class="block mt-1 text-2xl font-bold leading-none text-slate-900 tabular-nums">{{ overview()!.rejected }}</span>
                </div>
                <div class="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <span class="block text-xs font-medium text-slate-500">Not decided yet</span>
                  <span class="block mt-1 text-2xl font-bold leading-none text-slate-900 tabular-nums">{{ overview()!.undecided }}</span>
                </div>
              </div>
              <p class="m-0 text-xs leading-relaxed text-slate-500">
                These are the decisions recorded so far, whether made with Approve / Reject on each response or with the evaluation Excel.
                The Excel downloads pre-filled with them; upload it here to change several at once.
              </p>

              @if (overview()!.decisionsLocked) {
                <p class="m-0 p-2.5 text-xs rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  Decisions are locked: an order has been signed. Discard it to change decisions.
                </p>
              } @else {
                <div class="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/50 space-y-3">
                  <div class="w-11 h-11 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <app-icon name="upload" size="md" />
                  </div>
                  <div>
                    <p class="m-0 text-sm font-semibold text-slate-800">Upload Evaluated Excel (.xlsx)</p>
                    <p class="m-0 mt-1 text-xs text-slate-500">
                      Use the sheet from "Download Evaluation Excel": choose Approve or Reject, a Grade for approvals and a Reason for rejections.
                    </p>
                  </div>
                  <input #excelInput type="file" accept=".xlsx" class="hidden" (change)="onExcelPicked($event)" />
                  <button appButton size="sm" type="button" [disabled]="isBusy()" (click)="excelInput.click()">
                    <app-icon name="file" size="sm" />
                    <span>{{ busy() === 'upload' ? 'Checking...' : 'Choose Evaluated File' }}</span>
                  </button>
                </div>
              }

              @if (upload(); as up) {
                <section class="rounded-xl border border-slate-200 overflow-hidden" aria-labelledby="check-heading">
                  <div class="flex items-center justify-between gap-3 flex-wrap px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                    <h3 id="check-heading" class="m-0 text-[13px] font-semibold text-slate-800">{{ up.fileName }}</h3>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <app-status-badge variant="info">{{ up.changeRows }} to change</app-status-badge>
                      <app-status-badge variant="neutral">{{ up.unchangedRows }} unchanged</app-status-badge>
                      @if (up.skippedRows) { <app-status-badge variant="warning">{{ up.skippedRows }} without status</app-status-badge> }
                      @if (up.errorRows) { <app-status-badge variant="danger">{{ up.errorRows }} with errors</app-status-badge> }
                    </div>
                  </div>
                  <div class="max-h-64 overflow-y-auto">
                    <app-table [columns]="rowColumns" [data]="up.rows ?? []" [customTemplates]="{ application: appTpl, decision: decisionTpl, result: resultTpl }" />
                  </div>
                  <ng-template #appTpl let-row>
                    <span class="block tabular-nums text-slate-800">{{ row.applicationNo || '-' }}</span>
                    <span class="block text-[11px] text-slate-500">{{ row.company }}</span>
                  </ng-template>
                  <ng-template #decisionTpl let-row>
                    <span class="block text-slate-800">{{ row.status || '-' }}@if (row.grade) { &middot; {{ row.grade }} }</span>
                    @if (row.remarks) { <span class="block text-[11px] text-slate-500 max-w-[240px] break-words">{{ row.remarks }}</span> }
                  </ng-template>
                  <ng-template #resultTpl let-row>
                    <app-status-badge [variant]="resultBadge(row.result).variant">{{ resultBadge(row.result).label }}</app-status-badge>
                    @if (row.message) { <span class="block mt-1 text-[11px] text-slate-600 max-w-[260px] break-words">{{ row.message }}</span> }
                  </ng-template>
                  <div class="px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                    <span class="text-slate-600">
                      @if (up.status === 'Applied') {
                        Applied {{ time(up.appliedAt) }}.
                      } @else if (up.errorRows > 0) {
                        Correct the rows with errors in the Excel and upload it again. Nothing has been changed.
                      } @else if (up.changeRows === 0) {
                        Nothing to change: every row matches the recorded decisions or has no status.
                      } @else {
                        Nothing is saved until you apply. The check is valid until {{ time(up.expiresAt) }}.
                      }
                    </span>
                    @if (up.canConfirm) {
                      <button appButton size="sm" type="button" [disabled]="isBusy()" (click)="applyExcel(up)">
                        {{ busy() === 'confirm' ? 'Applying...' : 'Apply ' + up.changeRows + ' decision' + (up.changeRows === 1 ? '' : 's') }}
                      </button>
                    }
                  </div>
                </section>
              }
            }

            @case (2) {
              @if (blockers().length) {
                <ul class="m-0 p-2.5 pl-6 text-xs rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  @for (b of blockers(); track b) { <li>{{ b }}</li> }
                </ul>
              }
              @if (!isApprover()) {
                <p class="m-0 text-xs text-slate-500">Only the committee approver can generate the orders. You can view the drafts once generated.</p>
              }
              @for (slot of slots(); track slot.type) {
                <section class="rounded-xl border border-slate-200 p-4 space-y-2">
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 class="m-0 text-sm font-bold text-slate-900">{{ slot.title }}</h3>
                      <p class="m-0 text-xs text-slate-500">{{ slot.applications }} application{{ slot.applications === 1 ? '' : 's' }}</p>
                    </div>
                    @if (slot.order; as o) {
                      <app-status-badge [variant]="statusBadge(o.status).variant">{{ statusBadge(o.status).label }}</app-status-badge>
                    }
                  </div>
                  @if (slot.order; as o) {
                    <p class="m-0 text-xs text-slate-600 tabular-nums">{{ o.orderNo }} &middot; version {{ o.version }} &middot; generated {{ time(o.generatedAt) }}</p>
                    @if (o.isStale) {
                      <p class="m-0 text-xs text-amber-800">A decision changed after this draft was generated. Generate a new draft before signing.</p>
                    }
                  } @else {
                    <p class="m-0 text-xs text-slate-500">No draft yet.</p>
                  }
                  <div class="flex items-center gap-2 flex-wrap pt-1">
                    @if (slot.order) {
                      @if (slot.order.status === 'Draft') {
                        <button appButton variant="outline" size="sm" type="button" (click)="openEditor(slot.order)">
                          <app-icon name="edit" size="sm" />
                          <span>{{ isApprover() ? 'Edit Draft' : 'Open Draft' }}</span>
                        </button>
                      }
                      <button appButton variant="outline" size="sm" type="button" (click)="openFile(slot.order!, isFinal(slot.order))">
                        <app-icon name="eye" size="sm" />
                        <span>{{ isFinal(slot.order) ? 'View Signed Copy' : 'View Draft PDF' }}</span>
                      </button>
                    }
                    @if (canGenerate(slot)) {
                      <button appButton size="sm" type="button" [disabled]="isBusy()" (click)="generate(slot.type)">
                        {{ busy() === 'generate-' + slot.type ? 'Generating...' : (slot.order ? 'Generate New Draft' : 'Generate Draft') }}
                      </button>
                    }
                  </div>
                </section>
              } @empty {
                <p class="m-0 text-xs text-slate-500">No application has been approved or rejected yet, so there is no order to generate.</p>
              }
            }

            @case (3) {
              @for (slot of slots(); track slot.type) {
                <section class="rounded-xl border border-slate-200 p-4 space-y-3">
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h3 class="m-0 text-sm font-bold text-slate-900">{{ slot.title }}</h3>
                    @if (slot.order; as o) {
                      <app-status-badge [variant]="statusBadge(o.status).variant">{{ statusBadge(o.status).label }}</app-status-badge>
                    }
                  </div>

                  @if (!slot.order) {
                    <p class="m-0 text-xs text-slate-500">Generate the draft first (Draft Orders).</p>
                  } @else {
                    <p class="m-0 text-xs text-slate-600 tabular-nums">
                      {{ slot.order.orderNo }} &middot; {{ slot.applications }} application{{ slot.applications === 1 ? '' : 's' }}
                      @if (isFinal(slot.order) && slot.order.fileNo) { &middot; File No. {{ slot.order.fileNo }} }
                      @if (slot.order.publishedAt) { &middot; released {{ time(slot.order.publishedAt) }} }
                    </p>
                    @if (slot.order.isStale) {
                      <p class="m-0 text-xs text-amber-800">A decision changed after this draft was generated. Generate a new draft before signing.</p>
                    }
                    @if (slot.order.signer; as s) {
                      <p class="m-0 text-xs text-slate-600">
                        Signing authority:
                        <span class="font-semibold text-slate-800">{{ authority(s) }}</span>
                        @if (s.name && s.name !== s.authorityName) { <span class="text-slate-500">(e-signed by {{ s.name }})</span> }
                      </p>
                    }
                    <div class="flex items-center gap-2 flex-wrap">
                      @if (slot.order.status === 'Draft') {
                        <button appButton variant="outline" size="sm" type="button" (click)="openEditor(slot.order)">
                          <app-icon name="edit" size="sm" />
                          <span>{{ isApprover() ? 'Edit Draft' : 'Open Draft' }}</span>
                        </button>
                      }
                      <button appButton variant="outline" size="sm" type="button" (click)="openFile(slot.order, isFinal(slot.order))">
                        <app-icon name="eye" size="sm" />
                        <span>{{ isFinal(slot.order) ? 'View E-Signed Order' : 'View Draft PDF' }}</span>
                      </button>
                      @if (actionFor(slot.type); as a) {
                        @if (!a.done) {
                          <button appButton size="sm" type="button" [disabled]="isBusy() || !a.canSign" (click)="eSignOrder.set(a.order)">
                            <app-icon name="shield-check" size="sm" />
                            <span>{{ a.label }}</span>
                          </button>
                        }
                      }
                    </div>
                    @if (actionFor(slot.type); as a) {
                      @if (a.done) {
                        <p class="m-0 text-xs font-semibold text-slate-700">{{ a.signedText }}@if (slot.order.signer?.signedAt) { <span class="font-normal text-slate-500"> &middot; {{ time(slot.order.signer!.signedAt) }}</span> }</p>
                      } @else if (a.note) {
                        <p class="m-0 text-xs text-slate-500">{{ a.note }}</p>
                      }
                    }
                  }
                </section>
              }
              <p class="m-0 text-xs text-slate-500 leading-relaxed">
                Each order is e-signed separately by its own signing authority, with an OTP to their mobile. E-signing puts the
                e-signature on every page of that order and makes it final (decisions lock). Once every order is signed, the
                results can be published.
              </p>
            }

            @case (4) {
              <div class="py-4 text-center space-y-1">
                <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <app-icon name="check-circle" size="lg" />
                </div>
                <h3 class="m-0 text-base font-bold text-slate-900">
                  {{ released() ? 'The orders are e-signed and released' : allComplete() ? 'The orders are signed' : 'The orders are not e-signed yet' }}
                </h3>
                <p class="m-0 text-xs text-slate-500">
                  {{ released() ? 'Applicants can now see their result and download their order.'
                     : allComplete() ? 'Publish the results to release the e-signed orders to the applicants.'
                     : 'E-sign every order in Sign & Verify first.' }}
                </p>
              </div>
              @if (allComplete() && !released()) {
                <section class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <h3 class="m-0 text-sm font-bold text-slate-900">Publish Results</h3>
                  @if (readiness()?.missing?.length) {
                    <ul class="m-0 p-2.5 pl-6 text-xs rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                      @for (m of readiness()!.missing; track m) { <li>{{ m }}</li> }
                    </ul>
                  }
                  @if (readiness()?.canPublish) {
                    <button appButton size="sm" type="button" [disabled]="isBusy()" (click)="showPublish.set(true)">
                      <app-icon name="shield-check" size="sm" />
                      <span>Publish Results</span>
                    </button>
                  } @else {
                    <p class="m-0 text-xs text-slate-500">Only the committee approver (or a results publisher) can publish the results.</p>
                  }
                </section>
              }
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (slot of slots(); track slot.type) {
                  <section class="rounded-xl border border-slate-200 p-4 space-y-2">
                    <h3 class="m-0 text-sm font-bold text-slate-900">{{ slot.title }}</h3>
                    <p class="m-0 text-xs text-slate-500">{{ slot.applications }} application{{ slot.applications === 1 ? '' : 's' }}</p>
                    @if (slot.order; as o) {
                      <app-status-badge [variant]="statusBadge(o.status).variant">{{ statusBadge(o.status).label }}</app-status-badge>
                      <div>
                        <button appButton variant="outline" size="sm" type="button" (click)="openFile(o, isFinal(o))">
                          <app-icon name="eye" size="sm" />
                          <span>{{ isFinal(o) ? 'View E-Signed Order' : 'View Draft PDF' }}</span>
                        </button>
                      </div>
                    }
                  </section>
                }
              </div>
            }
          }
        }
      </div>

      <ng-container modalFooter>
        @if (step() > 1) {
          <button appButton variant="outline" size="sm" type="button" (click)="goTo(step() - 1)">
            <app-icon name="chevron-left" size="xs" />
            <span>Back</span>
          </button>
        } @else {
          <button appButton variant="outline" size="sm" type="button" (click)="close.emit()">Cancel</button>
        }
        @if (step() < 4) {
          <button appButton size="sm" type="button" [disabled]="!canAdvance()" (click)="goTo(step() + 1)">
            <span>{{ nextLabel() }}</span>
            <app-icon name="arrow-right" size="xs" />
          </button>
        } @else {
          <button appButton size="sm" type="button" (click)="close.emit()">Close</button>
        }
      </ng-container>
    </app-modal>

    @if (eSignOrder(); as o) {
      <app-order-esign-modal [eoiId]="eoiId()" [order]="o" (signed)="onOrderSigned($event)" (close)="eSignOrder.set(null)" />
    }
    @if (showPublish()) {
      <app-order-esign-modal [eoiId]="eoiId()" [orderNames]="orderNames()" (published)="onPublished($event)" (close)="showPublish.set(false)" />
    }
  `
})
export class GenerateEmpanelmentOrderModalComponent implements OnInit {
  private readonly api = inject(ResultOrdersService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly eoiId = input.required<number>();
  readonly schemeName = input('');
  readonly eoiRefNo = input('');
  /** The signed-in user is the EOI's committee approver (generates and signs the orders). */
  readonly isApprover = input(false);

  readonly close = output<void>();
  /** Decisions were applied from the Excel: the submissions list should reload. */
  readonly decisionsChanged = output<void>();

  protected readonly steps = STEPS;
  readonly step = signal<OrderStep>(1);
  readonly overview = signal<OrdersOverviewDto | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  /** The action in progress ('upload', 'confirm', 'generate-Empanelment'), or ''. */
  readonly busy = signal('');
  readonly upload = signal<BulkUploadDto | null>(null);
  readonly isBusy = computed(() => this.busy() !== '');
  /** Can the orders be e-signed now (and by me), and what is missing. */
  readonly readiness = signal<ReadinessDto | null>(null);
  /** The order whose e-sign dialog is open (each order is e-signed by its own signing authority). */
  readonly eSignOrder = signal<OrderDto | null>(null);
  readonly showPublish = signal(false);
  /** "Final Empanelment Order and Final Rejection Order", for the publish dialog. */
  readonly orderNames = computed(() => this.slots().map(s => s.title).join(' and ') || 'result orders');

  readonly slots = computed(() => orderSlots(this.overview()));
  /** "E-Sign Empanelment Order" / "E-Sign Rejection Order": one per order type the EOI has. */
  readonly eSignActions = computed(() => eSignActions(this.slots()));
  readonly blockers = computed(() => generateBlockers(this.overview()));
  readonly allComplete = computed(() => this.slots().length > 0 && this.slots().every(s => isOrderComplete(s.order)));
  readonly released = computed(() => this.slots().length > 0 && this.slots().every(s => s.order?.status === 'Published'));

  readonly canAdvance = computed(() => {
    const slots = this.slots();
    switch (this.step()) {
      case 1: return !!this.overview() && slots.length > 0;
      case 2: return slots.length > 0 && slots.every(s => s.order !== null && !s.order.isStale);
      case 3: return this.allComplete();
      default: return false;
    }
  });

  readonly nextLabel = computed(() => `Next: ${STEPS[this.step()]?.label ?? ''}`);

  protected readonly rowColumns: TableColumn<BulkRowDto>[] = [
    { key: 'rowNumber', label: 'Row', align: 'center', width: 'w-12' },
    { key: 'application', label: 'Application / Company', type: 'custom' },
    { key: 'decision', label: 'Decision in Excel', type: 'custom' },
    { key: 'result', label: 'Check', type: 'custom' }
  ];

  ngOnInit(): void {
    this.reload(true);
  }

  goTo(step: number): void {
    if (step >= 1 && step <= 4) this.step.set(step as OrderStep);
  }

  protected resultBadge = rowResultBadge;
  protected statusBadge = orderStatusBadge;
  protected time = orderTime;
  protected isFinal = isOrderFinal;
  protected complete = isOrderComplete;

  canGenerate(slot: OrderSlot): boolean {
    const o = this.overview();
    return this.isApprover() && !!o && !o.decisionsLocked && slot.applications > 0 && (!slot.order || slot.order.status === 'Draft');
  }

  // ---- Step 1: evaluation Excel ----------------------------------------------------------------

  onExcelPicked(event: Event): void {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    el.value = '';
    if (!file || this.busy()) return;
    this.run('upload', this.api.uploadDecisions(this.eoiId(), file), up => this.upload.set(up), 'The Excel could not be checked.');
  }

  applyExcel(up: BulkUploadDto): void {
    this.run('confirm', this.api.confirmDecisions(this.eoiId(), up.id), applied => {
      this.upload.set(applied);
      this.notifications.success(`${applied.changeRows} decision${applied.changeRows === 1 ? '' : 's'} applied from the Excel.`);
      this.decisionsChanged.emit();
      this.reload(false);
    }, 'The decisions could not be applied.');
  }

  // ---- Step 2: drafts --------------------------------------------------------------------------

  generate(type: OrderType): void {
    this.run(`generate-${type}`, this.api.generate(this.eoiId(), type), () => this.reload(false), 'The draft could not be generated.');
  }

  /** The draft's text editor (like the sanction order and IPA drafts). */
  openEditor(order: OrderDto): void {
    this.close.emit();
    void this.router.navigate(['/admin/result-orders', this.eoiId(), order.id]);
  }

  openFile(order: OrderDto, signed: boolean): void {
    this.api
      .file(this.eoiId(), order.id, signed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank', 'noopener');
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (e: unknown) => this.error.set(errorText(e, 'The PDF could not be opened.'))
      });
  }

  // ---- Step 3: e-sign, step 4: publish ---------------------------------------------------------

  protected authority = signingAuthorityText;

  actionFor(type: OrderType): ESignAction | null {
    return this.eSignActions().find(a => a.type === type) ?? null;
  }

  /** One order was e-signed by its signing authority; the other one is signed separately. */
  onOrderSigned(order: OrderDto): void {
    this.eSignOrder.set(null);
    this.notifications.success(`The ${ORDER_TITLE[order.type as OrderType] ?? 'order'} is e-signed.`);
    this.decisionsChanged.emit();
    this.reload(false);
  }

  /** The publishing OTP was verified: the e-signed orders are released. */
  onPublished(result: PublishResultDto): void {
    this.showPublish.set(false);
    this.notifications.success(
      `The results are published${result.applicantsNotified ? `; ${result.applicantsNotified} applicant(s) notified` : ''}.`
    );
    this.decisionsChanged.emit();
    this.reload(false, 4);
  }

  // ---- helpers ---------------------------------------------------------------------------------

  /** The orders and (for Sign & Verify) whether they can be e-signed now. */
  private reload(moveToStep: boolean, thenStep?: OrderStep): void {
    this.loading.set(true);
    this.api
      .overview(this.eoiId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: o => {
          this.overview.set(o);
          this.loading.set(false);
          if (moveToStep) this.step.set(initialOrderStep(o));
          if (thenStep) this.step.set(thenStep);
        },
        error: (e: unknown) => {
          this.loading.set(false);
          this.error.set(errorText(e, 'The decisions and orders could not be loaded.'));
        }
      });
    this.api
      .readiness(this.eoiId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: r => this.readiness.set(r), error: () => this.readiness.set(null) });
  }

  private run<T>(key: string, call: Observable<T>, done: (value: T) => void, fallback: string): void {
    if (this.busy()) return;
    this.busy.set(key);
    this.error.set('');
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.busy.set('');
        done(value);
      },
      error: (e: unknown) => {
        this.busy.set('');
        this.error.set(errorText(e, fallback));
      }
    });
  }
}
