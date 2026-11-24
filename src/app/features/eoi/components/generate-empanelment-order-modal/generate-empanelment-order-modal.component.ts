import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  DocTableDirective,
  IconComponent,
  InputDirective,
  ModalComponent
} from '../../../../shared';
import { formatDate } from '../../../../shared/utils';
import type { ApplicantResponse } from '../../services/eoi-state.models';
import { EoiStateService } from '../../services/eoi-state.service';
import type { CommitteeSignatory, EmpanelmentOrder } from '../../models/empanelment-order.model';
import { EmpanelmentOrderService } from '../../services/empanelment-order.service';
import {
  parseEvaluationSpreadsheet,
  ParsedEvaluationRow
} from '../../utils/eoi-evaluation-excel.util';

@Component({
  selector: 'app-generate-empanelment-order-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ButtonComponent,
    IconComponent,
    DocTableDirective,
    InputDirective
  ],
  template: `
    <app-modal
      [title]="modalTitle()"
      [subtitle]="schemeName()"
      size="2xl"
      (close)="close.emit()"
    >
      <div class="space-y-5 p-1">
        <!-- Step Indicators -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              [class]="currentStep() === 1 ? 'bg-primary text-white' : 'bg-emerald-100 text-emerald-800'"
            >
              @if (currentStep() > 1) {
                <app-icon name="check" size="xs" />
              } @else {
                1
              }
            </span>
            <span class="text-xs sm:text-sm font-semibold" [class.text-primary]="currentStep() === 1">
              Upload Evaluation & Review
            </span>
          </div>

          <div class="w-12 h-0.5 bg-slate-200"></div>

          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              [class]="currentStep() === 2 ? 'bg-primary text-white' : (isAllVerified() ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500')"
            >
              @if (isAllVerified()) {
                <app-icon name="check" size="xs" />
              } @else {
                2
              }
            </span>
            <span class="text-xs sm:text-sm font-semibold" [class.text-primary]="currentStep() === 2">
              Committee E-Sign & OTP
            </span>
          </div>

          <div class="w-12 h-0.5 bg-slate-200"></div>

          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              [class]="currentStep() === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'"
            >
              3
            </span>
            <span class="text-xs sm:text-sm font-semibold" [class.text-emerald-700]="currentStep() === 3">
              Orders Released
            </span>
          </div>
        </div>

        <!-- STEP 1: Upload Evaluation Excel & Preview Results -->
        @if (currentStep() === 1) {
          <!-- Upload Area -->
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary/60 transition-colors bg-slate-50/50">
            <div class="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <app-icon name="upload" size="lg" />
            </div>
            <h4 class="text-sm font-semibold text-slate-800 mb-1">
              Upload Evaluated Excel Spreadsheet (.xlsx or .csv)
            </h4>
            <p class="text-xs text-slate-500 mb-4 max-w-md mx-auto">
              Upload the evaluation excel file with completed Status (Approved / Reject), Empanelment Grades, and Rejection Reasons.
            </p>

            <div class="flex items-center justify-center gap-3 flex-wrap">
              <label class="cursor-pointer">
                <input
                  type="file"
                  class="hidden"
                  accept=".xlsx,.csv"
                  (change)="onFileSelected($event)"
                />
                <span class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-white shadow-2xs hover:bg-primary-hover transition-colors">
                  <app-icon name="file" size="sm" />
                  <span>Choose Evaluated File</span>
                </span>
              </label>

              <!-- Quick loader with default submissions -->
              <button
                appButton
                variant="outline"
                size="sm"
                (click)="loadFromCurrentSubmissions()"
                title="Populate directly from portal applicant list"
              >
                <span>Quick Load Portal Submissions</span>
              </button>
            </div>

            @if (uploadedFileName()) {
              <div class="mt-3 text-xs text-emerald-700 font-medium flex items-center justify-center gap-1.5">
                <app-icon name="check-circle" size="xs" />
                <span>Loaded file: <strong>{{ uploadedFileName() }}</strong></span>
              </div>
            }
          </div>

          <!-- Evaluation Summary Metrics -->
          @if (hasParsedData()) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span class="text-xs text-slate-500 block">Total Evaluated</span>
                <span class="text-lg font-bold text-slate-800">{{ allRows().length }}</span>
              </div>
              <div
                class="border rounded-lg p-3 text-center cursor-pointer transition-colors"
                [class]="activePreviewTab() === 'ACCEPTED' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-slate-50 border-slate-200'"
                (click)="activePreviewTab.set('ACCEPTED')"
              >
                <span class="text-xs text-emerald-700 font-semibold block">Empanelled / Accepted</span>
                <span class="text-lg font-bold text-emerald-800">{{ acceptedRows().length }} Agencies</span>
              </div>
              <div
                class="border rounded-lg p-3 text-center cursor-pointer transition-colors"
                [class]="activePreviewTab() === 'REJECTED' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400' : 'bg-slate-50 border-slate-200'"
                (click)="activePreviewTab.set('REJECTED')"
              >
                <span class="text-xs text-rose-700 font-semibold block">Rejected</span>
                <span class="text-lg font-bold text-rose-800">{{ rejectedRows().length }} Agencies</span>
              </div>
            </div>

            <!-- Tabbed View: Accepted vs Rejected Table -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button
                    appButton
                    [variant]="activePreviewTab() === 'ACCEPTED' ? 'primary' : 'outline'"
                    size="sm"
                    (click)="activePreviewTab.set('ACCEPTED')"
                  >
                    <span>Empanelled Agencies ({{ acceptedRows().length }})</span>
                  </button>
                  <button
                    appButton
                    [variant]="activePreviewTab() === 'REJECTED' ? 'primary' : 'outline'"
                    size="sm"
                    (click)="activePreviewTab.set('REJECTED')"
                  >
                    <span>Rejected Agencies ({{ rejectedRows().length }})</span>
                  </button>
                </div>
                <span class="text-xs text-slate-500 font-normal">
                  Scheme Ref: {{ eoiRefNo() }}
                </span>
              </div>

              <!-- Accepted Agencies Table -->
              @if (activePreviewTab() === 'ACCEPTED') {
                <div class="overflow-x-auto max-h-64">
                  <table appDocTable class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-50 text-slate-700 uppercase font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3 text-center w-12">S.No</th>
                        <th class="py-2.5 px-3">Application ID</th>
                        <th class="py-2.5 px-3">Applicant Agency Name</th>
                        <th class="py-2.5 px-3 text-center">Category / Grade</th>
                        <th class="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (row of acceptedRows(); track row.refNo; let idx = $index) {
                        <tr class="hover:bg-slate-50/70">
                          <td class="py-2.5 px-3 text-center font-medium text-slate-600">{{ idx + 1 }}</td>
                          <td class="py-2.5 px-3 font-semibold text-slate-800">{{ row.refNo }}</td>
                          <td class="py-2.5 px-3 text-slate-800 font-normal">{{ row.companyName }}</td>
                          <td class="py-2.5 px-3 text-center">
                            <span class="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                              {{ row.grade || 'A' }}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <span class="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                              Eligible
                            </span>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="py-6 text-center text-slate-500">No accepted agencies found in the uploaded file.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <!-- Rejected Agencies Table -->
                <div class="overflow-x-auto max-h-64">
                  <table appDocTable class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-50 text-slate-700 uppercase font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3 text-center w-12">S.No</th>
                        <th class="py-2.5 px-3">Application ID</th>
                        <th class="py-2.5 px-3">Applicant Agency Name</th>
                        <th class="py-2.5 px-3 text-center">Status</th>
                        <th class="py-2.5 px-3">Reason for Rejection</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (row of rejectedRows(); track row.refNo; let idx = $index) {
                        <tr class="hover:bg-slate-50/70">
                          <td class="py-2.5 px-3 text-center font-medium text-slate-600">{{ idx + 1 }}</td>
                          <td class="py-2.5 px-3 font-semibold text-slate-800">{{ row.refNo }}</td>
                          <td class="py-2.5 px-3 text-slate-800 font-normal">{{ row.companyName }}</td>
                          <td class="py-2.5 px-3 text-center">
                            <span class="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium border border-rose-200">
                              Not Eligible
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-slate-600 font-normal">{{ row.reason }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="py-6 text-center text-slate-500">No rejected agencies found in the uploaded file.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }
        }

        <!-- STEP 2: Committee E-Sign & Multi-Party OTP Verification -->
        @if (currentStep() === 2) {
          <div class="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <app-icon name="info" size="sm" class="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p class="font-bold">Official Statutory Requirement: Multi-Member Committee E-Sign</p>
              <p class="mt-0.5 text-amber-800">
                Each designated committee member assigned to this scheme must verify their identity via OTP to digitally sign and release the final Empanelment & Rejection Orders.
              </p>
            </div>
          </div>

          <div class="space-y-3">
            @for (member of committeeMembers(); track member.id; let idx = $index) {
              <div class="border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                   [class]="member.otpVerified ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                       [class]="member.otpVerified ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'">
                    {{ idx + 1 }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-slate-800 text-sm">{{ member.name }}</span>
                      <span class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {{ member.designation }}
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>Phone: {{ member.mobile }}</span>
                      <span>Email: {{ member.email }}</span>
                    </div>
                    @if (member.otpVerified) {
                      <div class="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <app-icon name="check-circle" size="xs" />
                        <span>Digitally Signed (RajKaj Ref: {{ member.rajKajRefNo || 'RK-23898348' }}) on {{ member.signedAt }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- OTP Actions per Member -->
                <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                  @if (member.otpVerified) {
                    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                      <app-icon name="check" size="xs" />
                      <span>E-Signed</span>
                    </span>
                  } @else {
                    @if (!member.otpSent) {
                      <button
                        appButton
                        variant="outline"
                        size="sm"
                        (click)="sendOtpToMember(member.id)"
                      >
                        <app-icon name="phone" size="xs" />
                        <span>Send OTP</span>
                      </button>
                    } @else {
                      <div class="flex items-center gap-1.5">
                        <input
                          appInput
                          type="text"
                          maxlength="6"
                          placeholder="Enter OTP"
                          class="w-24 px-2 py-1 text-xs border border-slate-300 rounded text-center tabular-nums font-bold tracking-widest focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                          [(ngModel)]="memberOtpInput[member.id]"
                        />
                        <button
                          appButton
                          size="sm"
                          (click)="verifyOtpForMember(member.id)"
                        >
                          <span>Verify</span>
                        </button>
                        <button
                          appButton
                          variant="ghost"
                          size="sm"
                          (click)="quickVerifyMember(member.id)"
                          title="Simulate Instant Verification"
                        >
                          <span class="text-[11px] text-primary">Auto</span>
                        </button>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>

          <!-- Signature Completion Progress -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700">
              Signatures Completed: {{ verifiedCount() }} of {{ committeeMembers().length }} Members
            </span>
            <span class="text-xs font-bold" [class]="isAllVerified() ? 'text-emerald-700' : 'text-amber-700'">
              {{ isAllVerified() ? '✓ All Members Verified & Signed' : 'Verification In-Progress' }}
            </span>
          </div>
        }

        <!-- STEP 3: Order Generated & Released Successfully -->
        @if (currentStep() === 3) {
          <div class="py-6 text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <app-icon name="check-circle" size="xl" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800">
                Empanelment & Rejection Orders Successfully Released!
              </h3>
              <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The evaluation decisions have been finalized. Applicant statuses have been updated, and digitally signed official orders have been published with RajKaj digital seal.
              </p>
            </div>

            <!-- Two Order Actions Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left pt-2">
              <div class="border border-emerald-300 bg-emerald-50/50 rounded-xl p-4">
                <span class="text-xs uppercase font-bold text-emerald-800 tracking-wide block">Accepted Empanelment</span>
                <h5 class="font-bold text-slate-800 mt-1">Final Empanelment Order</h5>
                <p class="text-xs text-slate-600 mt-0.5">Contains {{ acceptedRows().length }} eligible & empaneled training partners.</p>
                <button
                  appButton
                  size="sm"
                  class="mt-3 w-full"
                  (click)="viewEmpanelmentOrder.emit(generatedOrder()!)"
                >
                  <app-icon name="eye" size="xs" />
                  <span>View Empanelment Order</span>
                </button>
              </div>

              <div class="border border-rose-300 bg-rose-50/50 rounded-xl p-4">
                <span class="text-xs uppercase font-bold text-rose-800 tracking-wide block">Disqualified Agencies</span>
                <h5 class="font-bold text-slate-800 mt-1">Final Rejection Order</h5>
                <p class="text-xs text-slate-600 mt-0.5">Contains {{ rejectedRows().length }} rejected proposals with formal reasons.</p>
                <button
                  appButton
                  variant="outline"
                  size="sm"
                  class="mt-3 w-full"
                  (click)="viewRejectionOrder.emit(generatedOrder()!)"
                >
                  <app-icon name="eye" size="xs" />
                  <span>View Rejection Order</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Modal Footer Actions -->
      <ng-container modalFooter>
        @if (currentStep() === 1) {
          <button appButton variant="outline" size="sm" (click)="close.emit()">
            <span>Cancel</span>
          </button>
          <button
            appButton
            variant="outline"
            size="sm"
            [disabled]="!hasParsedData()"
            (click)="saveDraftOrder()"
          >
            <span>Save Draft</span>
          </button>
          <button
            appButton
            size="sm"
            [disabled]="!hasParsedData()"
            (click)="goToStep2()"
          >
            <span>Proceed to Committee E-Sign</span>
            <app-icon name="arrow-right" size="xs" />
          </button>
        } @else if (currentStep() === 2) {
          <button appButton variant="outline" size="sm" (click)="currentStep.set(1)">
            <app-icon name="chevron-left" size="xs" />
            <span>Back to Review</span>
          </button>
          <button
            appButton
            size="sm"
            [disabled]="!isAllVerified()"
            (click)="finalizeAndReleaseOrders()"
          >
            <app-icon name="shield-check" size="xs" />
            <span>Finalize & Release Orders</span>
          </button>
        } @else {
          <button appButton variant="outline" size="sm" (click)="close.emit()">
            <span>Close</span>
          </button>
        }
      </ng-container>
    </app-modal>
  `
})
export class GenerateEmpanelmentOrderModalComponent {
  private eoiStateService = inject(EoiStateService);
  private empanelmentOrderService = inject(EmpanelmentOrderService);

  readonly schemeId = input<string>('MMKVY-01');
  readonly schemeName = input<string>('Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)');
  readonly eoiRefNo = input<string>('RSLDC/EOI/2026/MMKVY-01');
  readonly currentApplicants = input<ApplicantResponse[]>([]);

  readonly close = output<void>();
  readonly orderGenerated = output<EmpanelmentOrder>();
  readonly viewEmpanelmentOrder = output<EmpanelmentOrder>();
  readonly viewRejectionOrder = output<EmpanelmentOrder>();

  currentStep = signal<1 | 2 | 3>(1);
  uploadedFileName = signal<string>('');
  allRows = signal<ParsedEvaluationRow[]>([]);
  activePreviewTab = signal<'ACCEPTED' | 'REJECTED'>('ACCEPTED');

  committeeMembers = signal<CommitteeSignatory[]>([]);
  memberOtpInput: Record<string, string> = {};
  generatedOrder = signal<EmpanelmentOrder | null>(null);

  constructor() {
    // Initialize committee
    const defaultTeam = this.empanelmentOrderService.getCommitteeForScheme();
    this.committeeMembers.set(defaultTeam);
  }

  modalTitle = computed(() => {
    const step = this.currentStep();
    if (step === 1) return 'Generate Empanelment & Rejection Orders';
    if (step === 2) return 'Committee Digital Signature (E-Sign)';
    return 'Official Orders Released';
  });

  hasParsedData = computed(() => this.allRows().length > 0);
  acceptedRows = computed(() => this.allRows().filter(r => r.isApproved));
  rejectedRows = computed(() => this.allRows().filter(r => !r.isApproved));

  verifiedCount = computed(() => this.committeeMembers().filter(m => m.otpVerified).length);
  isAllVerified = computed(() => {
    const list = this.committeeMembers();
    return list.length > 0 && list.every(m => m.otpVerified);
  });

  async onFileSelected(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    if (!inputEl.files || inputEl.files.length === 0) return;

    const file = inputEl.files[0];
    try {
      const parsed = await parseEvaluationSpreadsheet(file);
      this.uploadedFileName.set(file.name);
      this.allRows.set(parsed.all);
    } catch (err) {
      console.error('Error parsing spreadsheet:', err);
    }
  }

  loadFromCurrentSubmissions(): void {
    const apps = this.currentApplicants();
    const rows: ParsedEvaluationRow[] = (apps && apps.length > 0 ? apps : [
      { id: 'APP-004036', anonymousLabel: 'Company 1', actualLegalName: 'Company 1', regNumber: 'ISMS-REG-2026-8819' } as ApplicantResponse,
      { id: 'APP-004684', anonymousLabel: 'Company 2', actualLegalName: 'Company 2', regNumber: 'ISMS-REG-2026-3391' } as ApplicantResponse,
      { id: 'APP-003844', anonymousLabel: 'Company 3', actualLegalName: 'Company 3', regNumber: 'ISMS-REG-2026-1104' } as ApplicantResponse,
      { id: 'APP-004275', anonymousLabel: 'Company 4', actualLegalName: 'Company 4', regNumber: 'ISMS-REG-2026-9871' } as ApplicantResponse
    ]).map((app, idx) => {
      // Create a balanced preview where 2 are accepted and 2 are rejected
      const isApproved = idx % 2 === 0;
      return {
        sNo: idx + 1,
        refNo: app.regNumber || app.id,
        companyName: app.actualLegalName || app.anonymousLabel,
        status: isApproved ? 'Approved' : 'Reject',
        grade: isApproved ? 'A' : '-',
        reason: isApproved
          ? 'Meets technical infrastructure, trainer eligibility, and turnover norms'
          : 'Annual turnover criteria not fulfilled / CA turnover certificate missing valid UDIN',
        isApproved
      };
    });

    this.uploadedFileName.set('Portal_Current_Submissions_Evaluated.xlsx');
    this.allRows.set(rows);
  }

  saveDraftOrder(): void {
    const order = this.buildOrderModel('DRAFT');
    this.empanelmentOrderService.saveOrder(order);
    this.generatedOrder.set(order);
  }

  goToStep2(): void {
    this.currentStep.set(2);
  }

  sendOtpToMember(memberId: string): void {
    this.committeeMembers.update(members =>
      members.map(m => (m.id === memberId ? { ...m, otpSent: true, otpCode: '123456' } : m))
    );
    this.memberOtpInput[memberId] = '123456';
  }

  verifyOtpForMember(memberId: string): void {
    const inputVal = this.memberOtpInput[memberId]?.trim();
    if (!inputVal) return;

    const now = formatDate(new Date()) + ' ' + new Date().toLocaleTimeString('en-IN');
    this.committeeMembers.update(members =>
      members.map(m =>
        m.id === memberId
          ? {
              ...m,
              otpVerified: true,
              signedAt: now,
              rajKajRefNo: `RK-${m.name.slice(0, 3).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`
            }
          : m
      )
    );
  }

  quickVerifyMember(memberId: string): void {
    this.sendOtpToMember(memberId);
    this.verifyOtpForMember(memberId);
  }

  finalizeAndReleaseOrders(): void {
    if (!this.isAllVerified()) return;

    const order = this.buildOrderModel('E_SIGNED');
    order.signedAt = formatDate(new Date()) + ' ' + new Date().toLocaleTimeString('en-IN');
    order.rajKajRefNo = '23898348';

    // 1. Save order in empanelment order service
    this.empanelmentOrderService.saveOrder(order);
    this.generatedOrder.set(order);

    // 2. Formally update each applicant's status in EoiStateService
    this.allRows().forEach(row => {
      this.eoiStateService.updateScrutinyDecision(row.refNo, {
        status: row.isApproved ? 'APPROVED' : 'REJECTED',
        grade: row.grade,
        remarks: row.reason,
        disqualificationReason: row.isApproved ? undefined : row.reason,
        scrutinyOfficer: 'Empanelment Committee'
      });
    });

    this.orderGenerated.emit(order);
    this.currentStep.set(3);
  }

  private buildOrderModel(status: 'DRAFT' | 'E_SIGNED'): EmpanelmentOrder {
    const today = formatDate(new Date());
    const cleanSchemeId = this.schemeId() || 'SCHEME';

    return {
      id: `ORD-${cleanSchemeId}-${Date.now().toString().slice(-4)}`,
      schemeId: cleanSchemeId,
      schemeName: this.schemeName(),
      eoiRefNo: this.eoiRefNo(),
      fileNo: `F () RSLDC/Skills/${cleanSchemeId}/EOI/2026-2027/${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      orderDate: today,
      status,
      empanelledAgencies: this.acceptedRows().map((row, i) => ({
        sNo: i + 1,
        applicationId: row.refNo,
        agencyName: row.companyName,
        category: row.grade === 'A' ? 'A1(skilling)' : row.grade === 'B' ? 'A2(Non skilling)' : 'B(skilling)',
        fileStatus: 'Eligible',
        marksGrade: row.grade || 'A'
      })),
      rejectedAgencies: this.rejectedRows().map((row, i) => ({
        sNo: i + 1,
        applicationId: row.refNo,
        agencyName: row.companyName,
        fileStatus: 'Not Eligible',
        reason: row.reason
      })),
      committeeMembers: this.committeeMembers(),
      createdAt: today,
      issuingAuthority: {
        name: 'Rishav Mandal',
        designation: 'Managing Director, I.A.S.',
        department: 'Rajasthan Skill & Livelihoods Development Corporation'
      },
      copyToList: [
        "PS to Hon'ble Minister, DSEE",
        'PS to Secretary, DSEE',
        'PS to Managing Director, RSLDC',
        'General Manager-I, RSLDC',
        'CAO, RSLDC',
        'Program Manager, PMCA',
        'OIC-MIS (To upload on website portal)',
        'Concerned Agencies (via email)',
        'Guard File'
      ]
    };
  }
}
