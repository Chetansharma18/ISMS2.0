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
import type {
  CommitteeSignatory,
  EmpanelledAgencyItem,
  EmpanelmentOrder,
  RejectedAgencyItem
} from '../../models/empanelment-order.model';
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
      <div class="space-y-4 p-1">
        <!-- 4-Step Progress Flow Indicator -->
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
              Upload Excel
            </span>
          </div>

          <div class="w-8 sm:w-12 h-0.5 bg-slate-200"></div>

          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              [class]="currentStep() === 2 ? 'bg-primary text-white' : (currentStep() > 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500')"
            >
              @if (currentStep() > 2) {
                <app-icon name="check" size="xs" />
              } @else {
                2
              }
            </span>
            <span class="text-xs sm:text-sm font-semibold" [class.text-primary]="currentStep() === 2">
              Editable Order
            </span>
          </div>

          <div class="w-8 sm:w-12 h-0.5 bg-slate-200"></div>

          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              [class]="currentStep() === 3 ? 'bg-primary text-white' : (isAllVerified() ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500')"
            >
              @if (isAllVerified()) {
                <app-icon name="check" size="xs" />
              } @else {
                3
              }
            </span>
            <span class="text-xs sm:text-sm font-semibold" [class.text-primary]="currentStep() === 3">
              Committee E-Sign
            </span>
          </div>

          <div class="w-8 sm:w-12 h-0.5 bg-slate-200"></div>

          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              [class]="currentStep() === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'"
            >
              4
            </span>
            <span class="text-xs sm:text-sm font-semibold" [class.text-emerald-700]="currentStep() === 4">
              Order Released
            </span>
          </div>
        </div>

        <!-- STEP 1: Upload Evaluated Excel Spreadsheet -->
        @if (currentStep() === 1) {
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary/60 transition-colors bg-slate-50/50">
            <div class="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <app-icon name="upload" size="lg" />
            </div>
            <h4 class="text-sm font-semibold text-slate-800 mb-1">
              Upload Evaluated Excel Spreadsheet (.xlsx or .csv)
            </h4>
            <p class="text-xs text-slate-500 mb-4 max-w-md mx-auto">
              Upload the completed offline evaluation file with Status (Approved / Reject), Empanelment Grades, and Reasons.
            </p>

            <div class="flex items-center justify-center gap-3">
              <label class="cursor-pointer">
                <input
                  type="file"
                  class="hidden"
                  accept=".xlsx,.csv"
                  (change)="onFileSelected($event)"
                />
                <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white shadow-2xs hover:bg-primary-hover transition-colors">
                  <app-icon name="file" size="sm" />
                  <span>Choose Evaluated File</span>
                </span>
              </label>
            </div>

            @if (uploadedFileName()) {
              <div class="mt-3 text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                <app-icon name="check-circle" size="xs" />
                <span>Uploaded: <strong>{{ uploadedFileName() }}</strong> ({{ allRows().length }} rows evaluated)</span>
              </div>
            }
          </div>

          <!-- Evaluation Summary Metrics -->
          @if (hasParsedData()) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span class="text-xs text-slate-500 block">Total Evaluated</span>
                <span class="text-lg font-bold text-slate-800">{{ allRows().length }} Agencies</span>
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
                <span class="text-xs text-rose-700 font-semibold block">Rejected / Disqualified</span>
                <span class="text-lg font-bold text-rose-800">{{ rejectedRows().length }} Agencies</span>
              </div>
            </div>

            <!-- Tabbed View: Accepted vs Rejected Table -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button
                    appButton
                    [variant]="activePreviewTab() === 'ACCEPTED' ? 'primary' : 'outline'"
                    size="sm"
                    (click)="activePreviewTab.set('ACCEPTED')"
                  >
                    <span>Empanelled ({{ acceptedRows().length }})</span>
                  </button>
                  <button
                    appButton
                    [variant]="activePreviewTab() === 'REJECTED' ? 'primary' : 'outline'"
                    size="sm"
                    (click)="activePreviewTab.set('REJECTED')"
                  >
                    <span>Rejected ({{ rejectedRows().length }})</span>
                  </button>
                </div>
                <span class="text-xs text-slate-500 font-normal">
                  Scheme Ref: {{ eoiRefNo() }}
                </span>
              </div>

              <!-- Accepted Agencies Table -->
              @if (activePreviewTab() === 'ACCEPTED') {
                <div class="overflow-x-auto max-h-56">
                  <table appDocTable class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-50 text-slate-700 uppercase font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th class="py-2 px-3 text-center w-12">S.No</th>
                        <th class="py-2 px-3">Application ID</th>
                        <th class="py-2 px-3">Applicant Agency Name</th>
                        <th class="py-2 px-3 text-center">Category / Grade</th>
                        <th class="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (row of acceptedRows(); track row.refNo; let idx = $index) {
                        <tr class="hover:bg-slate-50/70">
                          <td class="py-2 px-3 text-center font-medium text-slate-600">{{ idx + 1 }}</td>
                          <td class="py-2 px-3 font-semibold text-slate-800">{{ row.refNo }}</td>
                          <td class="py-2 px-3 text-slate-800 font-normal">{{ row.companyName }}</td>
                          <td class="py-2 px-3 text-center">
                            <span class="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                              {{ row.grade || 'A' }}
                            </span>
                          </td>
                          <td class="py-2 px-3 text-center">
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
                <div class="overflow-x-auto max-h-56">
                  <table appDocTable class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-50 text-slate-700 uppercase font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th class="py-2 px-3 text-center w-12">S.No</th>
                        <th class="py-2 px-3">Application ID</th>
                        <th class="py-2 px-3">Applicant Agency Name</th>
                        <th class="py-2 px-3 text-center">Status</th>
                        <th class="py-2 px-3">Reason for Rejection</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (row of rejectedRows(); track row.refNo; let idx = $index) {
                        <tr class="hover:bg-slate-50/70">
                          <td class="py-2 px-3 text-center font-medium text-slate-600">{{ idx + 1 }}</td>
                          <td class="py-2 px-3 font-semibold text-slate-800">{{ row.refNo }}</td>
                          <td class="py-2 px-3 text-slate-800 font-normal">{{ row.companyName }}</td>
                          <td class="py-2 px-3 text-center">
                            <span class="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium border border-rose-200">
                              Not Eligible
                            </span>
                          </td>
                          <td class="py-2 px-3 text-slate-600 font-normal">{{ row.reason }}</td>
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

        <!-- STEP 2: EDITABLE GOVERNMENT ORDER TEMPLATE -->
        @if (currentStep() === 2) {
          <!-- Order Tab Switcher -->
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <div class="flex items-center gap-2">
              <button
                appButton
                [variant]="activeOrderTab() === 'EMPANELMENT' ? 'primary' : 'outline'"
                size="sm"
                (click)="activeOrderTab.set('EMPANELMENT')"
              >
                <span>Final Empanelment Order ({{ empanelledAgencies().length }})</span>
              </button>
              <button
                appButton
                [variant]="activeOrderTab() === 'REJECTION' ? 'primary' : 'outline'"
                size="sm"
                (click)="activeOrderTab.set('REJECTION')"
              >
                <span>Final Rejection Order ({{ rejectedAgencies().length }})</span>
              </button>
            </div>
            <div class="text-[11px] text-slate-500 italic">
              * Click any field to edit text, reference numbers, or candidate rows
            </div>
          </div>

          <!-- Official Government Order Document Preview Container -->
          <div class="bg-white p-5 sm:p-6 text-slate-900 border border-slate-300 rounded-lg shadow-2xs max-h-[60vh] overflow-y-auto space-y-4">
            <!-- Official Government Letterhead -->
            <div class="text-center border-b-2 border-slate-900 pb-3">
              <div class="flex items-center justify-between gap-4 mb-2">
                <!-- Left Seal -->
                <div class="w-12 h-12 rounded-full border-2 border-slate-700 flex flex-col items-center justify-center text-[9px] font-bold uppercase tracking-tighter text-slate-700 shrink-0">
                  <span>RSLDC</span>
                  <span class="text-[7px]">JAIPUR</span>
                </div>

                <!-- Center Header Text -->
                <div class="grow text-center">
                  <h3 class="text-sm sm:text-base font-bold uppercase tracking-tight text-slate-950">
                    Rajasthan Skill & Livelihood Development Corporation
                  </h3>
                  <p class="text-[11px] text-slate-600 mt-0.5">
                    EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur 302004, Telex Fax- 0141-5103246/4
                  </p>
                </div>

                <!-- Right Seal -->
                <div class="w-12 h-12 rounded-full border-2 border-slate-700 flex flex-col items-center justify-center text-[8px] font-bold uppercase tracking-tighter text-slate-700 shrink-0">
                  <span>GOVT OF</span>
                  <span class="text-[7px]">RAJASTHAN</span>
                </div>
              </div>

              <!-- Editable File Reference & Date Row -->
              <div class="flex items-center justify-between gap-4 pt-2 border-t border-slate-300 text-xs font-bold">
                <div class="flex items-center gap-1 grow">
                  <span class="shrink-0 text-slate-700">File No.-F ()</span>
                  <input
                    appInput
                    type="text"
                    [(ngModel)]="orderFileNo"
                    class="grow py-1 px-2 text-xs font-bold border border-slate-300 rounded"
                  />
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-slate-700">Dated:</span>
                  <input
                    appInput
                    type="text"
                    [(ngModel)]="orderDate"
                    class="w-28 py-1 px-2 text-xs font-bold border border-slate-300 rounded text-center"
                  />
                </div>
              </div>
            </div>

            <!-- Document Title -->
            <div class="text-center my-3">
              <h2 class="text-base sm:text-lg font-bold uppercase underline underline-offset-4 tracking-wide text-slate-950">
                {{ activeOrderTab() === 'EMPANELMENT' ? 'Final Empanelment Order' : 'Final Rejection Order' }}
              </h2>
            </div>

            <!-- Editable Subject Line -->
            <div class="text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
              <label class="block font-bold text-slate-700 mb-1">Subject:</label>
              <textarea
                appInput
                rows="2"
                [ngModel]="activeOrderTab() === 'EMPANELMENT' ? empanelmentSubject() : rejectionSubject()"
                (ngModelChange)="onSubjectChange($event)"
                class="w-full text-xs font-medium text-slate-900 border border-slate-300 rounded p-1.5"
              ></textarea>
            </div>

            <!-- Editable Preamble Text -->
            <div class="space-y-2 text-xs text-slate-800">
              <div>
                <label class="block font-semibold text-slate-700 mb-0.5">Background Preamble:</label>
                <textarea
                  appInput
                  rows="2"
                  [ngModel]="activeOrderTab() === 'EMPANELMENT' ? empanelmentPreamble1() : rejectionPreamble1()"
                  (ngModelChange)="onPreamble1Change($event)"
                  class="w-full text-xs text-slate-800 border border-slate-300 rounded p-1.5"
                ></textarea>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-0.5">Assessment & Shortlist Decision:</label>
                <textarea
                  appInput
                  rows="2"
                  [ngModel]="activeOrderTab() === 'EMPANELMENT' ? empanelmentPreamble2() : rejectionPreamble2()"
                  (ngModelChange)="onPreamble2Change($event)"
                  class="w-full text-xs text-slate-800 border border-slate-300 rounded p-1.5"
                ></textarea>
              </div>
            </div>

            <!-- Candidates Table (Editable rows) -->
            <div class="border border-slate-800 mt-3 overflow-x-auto">
              @if (activeOrderTab() === 'EMPANELMENT') {
                <table appDocTable class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-100 font-bold border-b border-slate-800 text-slate-900">
                    <tr>
                      <th class="p-2 border-r border-slate-800 text-center w-12">Sr. No</th>
                      <th class="p-2 border-r border-slate-800 w-36">Application ID</th>
                      <th class="p-2 border-r border-slate-800">Applicant Agency Name</th>
                      <th class="p-2 border-r border-slate-800 text-center w-36">Category</th>
                      <th class="p-2 border-r border-slate-800 text-center w-24">File Status</th>
                      <th class="p-2 text-center w-28">Category as per marks</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-400">
                    @for (agency of empanelledAgencies(); track agency.applicationId; let idx = $index) {
                      <tr>
                        <td class="p-2 border-r border-slate-400 text-center font-medium">{{ idx + 1 }}</td>
                        <td class="p-2 border-r border-slate-400 font-semibold text-slate-900">{{ agency.applicationId }}</td>
                        <td class="p-2 border-r border-slate-400 font-medium text-slate-900">{{ agency.agencyName }}</td>
                        <td class="p-1 border-r border-slate-400 text-center">
                          <input
                            appInput
                            type="text"
                            [(ngModel)]="agency.category"
                            class="w-full py-0.5 px-1 text-center text-xs border border-slate-200 rounded"
                          />
                        </td>
                        <td class="p-2 border-r border-slate-400 text-center font-bold text-emerald-800">
                          Eligible
                        </td>
                        <td class="p-1 text-center font-bold">
                          <input
                            appInput
                            type="text"
                            [(ngModel)]="agency.marksGrade"
                            class="w-16 py-0.5 px-1 text-center text-xs font-bold border border-slate-200 rounded mx-auto"
                          />
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="p-4 text-center text-slate-500">No empaneled agencies listed.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <table appDocTable class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-100 font-bold border-b border-slate-800 text-slate-900">
                    <tr>
                      <th class="p-2 border-r border-slate-800 text-center w-12">Sr. No</th>
                      <th class="p-2 border-r border-slate-800 w-36">Application ID</th>
                      <th class="p-2 border-r border-slate-800">Applicant Agency Name</th>
                      <th class="p-2 border-r border-slate-800 text-center w-28">File Status</th>
                      <th class="p-2">Reason for Rejection</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-400">
                    @for (agency of rejectedAgencies(); track agency.applicationId; let idx = $index) {
                      <tr>
                        <td class="p-2 border-r border-slate-400 text-center font-medium">{{ idx + 1 }}</td>
                        <td class="p-2 border-r border-slate-400 font-semibold text-slate-900">{{ agency.applicationId }}</td>
                        <td class="p-2 border-r border-slate-400 font-medium text-slate-900">{{ agency.agencyName }}</td>
                        <td class="p-2 border-r border-slate-400 text-center font-bold text-rose-800">
                          Not Eligible
                        </td>
                        <td class="p-1">
                          <input
                            appInput
                            type="text"
                            [(ngModel)]="agency.reason"
                            class="w-full py-0.5 px-1.5 text-xs text-slate-700 border border-slate-200 rounded"
                          />
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="p-4 text-center text-slate-500">No rejected agencies listed.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>

            <!-- Approval Clause -->
            <div class="pt-2">
              <input
                appInput
                type="text"
                [(ngModel)]="orderApprovalClause"
                class="w-full text-xs font-semibold text-slate-800 italic border border-slate-200 rounded p-1.5"
              />
            </div>

            <!-- Bottom Section: Copy To List & Signatory with RajKaj Seal -->
            <div class="flex flex-col sm:flex-row items-end justify-between gap-4 border-t border-slate-300 pt-3">
              <!-- Left: Editable Copy To List -->
              <div class="text-[11px] text-slate-700 w-full sm:w-1/2 leading-normal">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-slate-800">Copy to:-</span>
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
                    (click)="addCopyItem()"
                    title="Add recipient"
                  >
                    <app-icon name="plus" size="xs" />
                    <span>Add</span>
                  </button>
                </div>
                <div class="space-y-1">
                  @for (item of copyToList(); track $index; let cIdx = $index) {
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 text-right text-slate-500">{{ cIdx + 1 }}.</span>
                      <input
                        appInput
                        type="text"
                        [ngModel]="item"
                        (ngModelChange)="updateCopyItem(cIdx, $event)"
                        class="grow py-0.5 px-1.5 text-[11px] border border-slate-200 rounded"
                      />
                      <button
                        appButton
                        variant="ghost"
                        size="sm"
                        (click)="removeCopyItem(cIdx)"
                        title="Remove"
                      >
                        <app-icon name="close" size="xs" />
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- Right: Signatory Details & RajKaj Digital Seal Box -->
              <div class="w-full sm:w-auto text-right space-y-2">
                <div class="text-right">
                  <input
                    appInput
                    type="text"
                    [ngModel]="activeOrderTab() === 'EMPANELMENT' ? empanelmentSignatoryName() : rejectionSignatoryName()"
                    (ngModelChange)="onSignatoryNameChange($event)"
                    class="py-0.5 px-2 text-right text-xs font-bold border border-slate-200 rounded mb-1"
                  />
                  <input
                    appInput
                    type="text"
                    [ngModel]="activeOrderTab() === 'EMPANELMENT' ? empanelmentSignatoryDesignation() : rejectionSignatoryDesignation()"
                    (ngModelChange)="onSignatoryDesignationChange($event)"
                    class="py-0.5 px-2 text-right text-[11px] text-slate-600 border border-slate-200 rounded"
                  />
                </div>

                <!-- RajKaj Official Seal Preview -->
                <div class="border-2 border-emerald-600 bg-emerald-50/70 p-2 rounded text-left inline-block w-52 tabular-nums text-[10px] text-slate-800">
                  <div class="font-bold text-emerald-800 text-xs flex items-center gap-1 mb-1">
                    <app-icon name="check-circle" size="xs" />
                    <span>Signature Valid</span>
                  </div>
                  <div class="text-slate-700 leading-tight space-y-0.5">
                    <p>Digitally signed by <strong>{{ activeOrderTab() === 'EMPANELMENT' ? empanelmentSignatoryName() : rejectionSignatoryName() }}</strong></p>
                    <p>Designation: <strong>{{ activeOrderTab() === 'EMPANELMENT' ? empanelmentSignatoryDesignation() : rejectionSignatoryDesignation() }}</strong></p>
                    <p>Date: {{ orderDate() }}</p>
                    <p>Reason: <strong>Approved & Issued</strong></p>
                  </div>
                  <div class="mt-1.5 pt-1 border-t border-emerald-300 flex items-center justify-between text-[9px] text-slate-500">
                    <span>RajKaj Ref: 23898348</span>
                    <span class="font-bold text-emerald-800">M e-Sign</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- STEP 3: Committee E-Sign & Multi-Party OTP Verification -->
        @if (currentStep() === 3) {
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
                          <span>Confirm OTP</span>
                        </button>
                        <button
                          appButton
                          variant="ghost"
                          size="sm"
                          (click)="quickVerifyMember(member.id)"
                          title="Auto-fill 123456 & verify"
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

          <!-- Signature Progress Status Bar -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700">
              Signatures Completed: {{ verifiedCount() }} of {{ committeeMembers().length }} Members
            </span>
            <span class="text-xs font-bold" [class]="isAllVerified() ? 'text-emerald-700' : 'text-amber-700'">
              {{ isAllVerified() ? '✓ All Members Verified & Signed' : 'Verification In-Progress' }}
            </span>
          </div>
        }

        <!-- STEP 4: Orders Released Successfully -->
        @if (currentStep() === 4) {
          <div class="py-6 text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <app-icon name="check-circle" size="xl" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800">
                Empanelment & Rejection Orders Successfully Released!
              </h3>
              <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Applicant company statuses have been officially updated. Both the Final Empanelment Order and Final Rejection Order are published with RajKaj digital seal.
              </p>
            </div>

            <!-- Two Order Actions Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left pt-2">
              <div class="border border-emerald-300 bg-emerald-50/50 rounded-xl p-4">
                <span class="text-xs uppercase font-bold text-emerald-800 tracking-wide block">Accepted Empanelment</span>
                <h5 class="font-bold text-slate-800 mt-1">Final Empanelment Order</h5>
                <p class="text-xs text-slate-600 mt-0.5">Contains {{ empanelledAgencies().length }} eligible & empaneled training partners.</p>
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
                <p class="text-xs text-slate-600 mt-0.5">Contains {{ rejectedAgencies().length }} rejected proposals with formal reasons.</p>
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
            size="sm"
            [disabled]="!hasParsedData()"
            (click)="proceedToOrderReview()"
          >
            <span>Generate Empanelment Order</span>
            <app-icon name="arrow-right" size="xs" />
          </button>
        } @else if (currentStep() === 2) {
          <button appButton variant="outline" size="sm" (click)="currentStep.set(1)">
            <app-icon name="chevron-left" size="xs" />
            <span>Back to Upload</span>
          </button>
          <button
            appButton
            variant="outline"
            size="sm"
            (click)="saveDraftOrder()"
          >
            <span>Save Draft</span>
          </button>
          <button
            appButton
            size="sm"
            (click)="proceedToCommitteeSign()"
          >
            <span>Proceed to Committee E-Sign</span>
            <app-icon name="arrow-right" size="xs" />
          </button>
        } @else if (currentStep() === 3) {
          <button appButton variant="outline" size="sm" (click)="currentStep.set(2)">
            <app-icon name="chevron-left" size="xs" />
            <span>Back to Edit Order</span>
          </button>
          <button
            appButton
            size="sm"
            [disabled]="!isAllVerified()"
            (click)="finalizeAndReleaseOrders()"
          >
            <app-icon name="shield-check" size="xs" />
            <span>Order Released</span>
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

  currentStep = signal<1 | 2 | 3 | 4>(1);
  uploadedFileName = signal<string>('');
  allRows = signal<ParsedEvaluationRow[]>([]);
  activePreviewTab = signal<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  activeOrderTab = signal<'EMPANELMENT' | 'REJECTION'>('EMPANELMENT');

  // Editable Order Document State Fields
  orderFileNo = signal<string>('RSLDC/EOI/SAMARTH/2026-27/1709-15');
  orderDate = signal<string>(formatDate(new Date()));

  empanelmentSubject = signal<string>(
    'Empanelment order against EOI published on 22.01.2026 under MMKVY Category III SAMARTH for FY 2026-2027.'
  );
  rejectionSubject = signal<string>(
    'Final Rejection & Disqualification Order against EOI published on 22.01.2026 under SAMARTH.'
  );

  empanelmentPreamble1 = signal<string>(
    'An Expression of Interest (EOI) was published under Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH scheme for empanelment of Project Implementing Agencies (PIAs).'
  );
  empanelmentPreamble2 = signal<string>(
    'Pursuant to the evaluation and De Novo Assessment process, the following agencies are hereby shortlisted and empaneled under SAMARTH scheme for FY 2026-2027.'
  );

  rejectionPreamble1 = signal<string>(
    'This bears reference to the technical proposal dossiers submitted under SAMARTH Scheme (EOI Ref No. RSLDC/EOI/SAMARTH).'
  );
  rejectionPreamble2 = signal<string>(
    'As per recommendations of the Desk Appraisal Committee followed by the De Novo Assessment process, proposals submitted by following agencies are not found eligible as per the statutory criteria laid down in EOI:'
  );

  orderApprovalClause = signal<string>('This issue with the approval of the competent authority.');

  empanelmentSignatoryName = signal<string>('(Rishav Mandal)');
  empanelmentSignatoryDesignation = signal<string>('I.A.S., Managing Director');

  rejectionSignatoryName = signal<string>('Shivkesh Jareda');
  rejectionSignatoryDesignation = signal<string>('Scheme Officer In-Charge (OIC)');

  copyToList = signal<string[]>([
    "PS to Hon'ble Minister, DSEE",
    'PS to Secretary, DSEE',
    'PS to Managing Director, RSLDC',
    'General Manager-I, RSLDC',
    'CAO, RSLDC',
    'Program Manager, PMCA',
    'OIC-MIS (To upload on website portal)',
    'Concerned Agencies (via email)',
    'Guard File'
  ]);

  empanelledAgencies = signal<EmpanelledAgencyItem[]>([]);
  rejectedAgencies = signal<RejectedAgencyItem[]>([]);

  committeeMembers = signal<CommitteeSignatory[]>([]);
  memberOtpInput: Record<string, string> = {};
  generatedOrder = signal<EmpanelmentOrder | null>(null);

  constructor() {
    const defaultTeam = this.empanelmentOrderService.getCommitteeForScheme();
    this.committeeMembers.set(defaultTeam);
  }

  modalTitle = computed(() => {
    const step = this.currentStep();
    if (step === 1) return 'Generate Empanelment & Rejection Orders';
    if (step === 2) return 'Official Government Order Review & Customization';
    if (step === 3) return 'Committee Multi-Party E-Sign & OTP';
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

      // Populate candidate items
      this.empanelledAgencies.set(
        parsed.accepted.map((row, i) => ({
          sNo: i + 1,
          applicationId: row.refNo,
          agencyName: row.companyName,
          category: row.grade === 'B' ? 'A2(Non skilling)' : (row.grade === 'C' ? 'B(skilling)' : 'A1(skilling)'),
          fileStatus: 'Eligible',
          marksGrade: row.grade || 'A'
        }))
      );

      this.rejectedAgencies.set(
        parsed.rejected.map((row, i) => ({
          sNo: i + 1,
          applicationId: row.refNo,
          agencyName: row.companyName,
          fileStatus: 'Not Eligible',
          reason: row.reason || 'Mandatory eligibility criteria not met'
        }))
      );
    } catch (err) {
      console.error('Error parsing spreadsheet:', err);
    }
  }

  proceedToOrderReview(): void {
    if (!this.hasParsedData()) return;
    this.currentStep.set(2);
  }

  proceedToCommitteeSign(): void {
    this.currentStep.set(3);
  }

  onSubjectChange(val: string): void {
    if (this.activeOrderTab() === 'EMPANELMENT') {
      this.empanelmentSubject.set(val);
    } else {
      this.rejectionSubject.set(val);
    }
  }

  onPreamble1Change(val: string): void {
    if (this.activeOrderTab() === 'EMPANELMENT') {
      this.empanelmentPreamble1.set(val);
    } else {
      this.rejectionPreamble1.set(val);
    }
  }

  onPreamble2Change(val: string): void {
    if (this.activeOrderTab() === 'EMPANELMENT') {
      this.empanelmentPreamble2.set(val);
    } else {
      this.rejectionPreamble2.set(val);
    }
  }

  onSignatoryNameChange(val: string): void {
    if (this.activeOrderTab() === 'EMPANELMENT') {
      this.empanelmentSignatoryName.set(val);
    } else {
      this.rejectionSignatoryName.set(val);
    }
  }

  onSignatoryDesignationChange(val: string): void {
    if (this.activeOrderTab() === 'EMPANELMENT') {
      this.empanelmentSignatoryDesignation.set(val);
    } else {
      this.rejectionSignatoryDesignation.set(val);
    }
  }

  addCopyItem(): void {
    this.copyToList.update(list => [...list, 'New recipient']);
  }

  updateCopyItem(index: number, val: string): void {
    this.copyToList.update(list => {
      const copy = [...list];
      copy[index] = val;
      return copy;
    });
  }

  removeCopyItem(index: number): void {
    this.copyToList.update(list => list.filter((_, i) => i !== index));
  }

  saveDraftOrder(): void {
    const order = this.buildOrderModel('DRAFT');
    this.empanelmentOrderService.saveOrder(order);
    this.generatedOrder.set(order);
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
    this.currentStep.set(4);
  }

  private buildOrderModel(status: 'DRAFT' | 'E_SIGNED'): EmpanelmentOrder {
    const today = this.orderDate() || formatDate(new Date());
    const cleanSchemeId = this.schemeId() || 'SCHEME';

    return {
      id: `ORD-${cleanSchemeId}-${Date.now().toString().slice(-4)}`,
      schemeId: cleanSchemeId,
      schemeName: this.schemeName(),
      eoiRefNo: this.eoiRefNo(),
      fileNo: this.orderFileNo(),
      orderDate: today,
      status,
      subject: this.empanelmentSubject(),
      rejectionSubject: this.rejectionSubject(),
      preamble1: this.empanelmentPreamble1(),
      preamble2: this.empanelmentPreamble2(),
      rejectionPreamble1: this.rejectionPreamble1(),
      rejectionPreamble2: this.rejectionPreamble2(),
      approvalClause: this.orderApprovalClause(),
      signatoryName: this.empanelmentSignatoryName(),
      signatoryDesignation: this.empanelmentSignatoryDesignation(),
      rejectionSignatoryName: this.rejectionSignatoryName(),
      rejectionSignatoryDesignation: this.rejectionSignatoryDesignation(),
      empanelledAgencies: this.empanelledAgencies(),
      rejectedAgencies: this.rejectedAgencies(),
      committeeMembers: this.committeeMembers(),
      createdAt: today,
      issuingAuthority: {
        name: this.empanelmentSignatoryName(),
        designation: this.empanelmentSignatoryDesignation(),
        department: 'Rajasthan Skill & Livelihoods Development Corporation'
      },
      copyToList: this.copyToList()
    };
  }
}
