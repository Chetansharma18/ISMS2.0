import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import {
  ButtonComponent,
  DocTableDirective,
  IconComponent,
  InputDirective,
  ModalComponent
} from '../../../../shared';
import { formatDate } from '../../../../shared/utils';
import type {
  CommitteeSignatory,
  EmpanelledAgencyItem,
  EmpanelmentOrder,
  RejectedAgencyItem
} from '../../models/empanelment-order.model';
import { EmpanelmentOrderService, DEFAULT_COMMITTEE_MEMBERS } from '../../services/empanelment-order.service';
import {
  EMPANELMENT_253_PAGES,
  ALL_253_EMPANELLED_AGENCIES,
  type EmpanelmentOrderPageDefinition
} from '../../data/empanelment-order-253.data';
import {
  REJECTION_78_PAGES,
  ALL_78_REJECTED_AGENCIES,
  type RejectionOrderPageDefinition
} from '../../data/rejection-order-78.data';

@Component({
  selector: 'app-order-viewer-modal',
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
      [title]="orderTitle()"
      [subtitle]="(isEditable() ? 'Editable Document • ' : '') + schemeName()"
      size="2xl"
      (close)="close.emit()"
    >
      <!-- Top Action & View Toolbar -->
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200 text-xs">
        <!-- Page Navigation Selector for Empanelment (12 Pages) or Rejection (4 Pages) -->
        @if (isEmpanelment()) {
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-bold text-slate-700">Pages:</span>
            <button
              appButton
              [variant]="viewMode() === 'all' ? 'primary' : 'outline'"
              size="sm"
              (click)="viewMode.set('all')"
              title="Show all 12 pages in continuous flow"
            >
              <span>All 12 Pages (253 PIAs)</span>
            </button>
            <div class="flex items-center gap-1 flex-wrap">
              @for (p of pages(); track p.pageNumber) {
                <button
                  appButton
                  [variant]="viewMode() === 'single' && activePageNumber() === p.pageNumber ? 'primary' : 'ghost'"
                  size="sm"
                  iconOnly
                  (click)="selectPage(p.pageNumber)"
                >
                  {{ p.pageNumber }}
                </button>
              }
            </div>
          </div>
        } @else {
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-bold text-slate-700">Pages:</span>
            <button
              appButton
              [variant]="viewMode() === 'all' ? 'primary' : 'outline'"
              size="sm"
              (click)="viewMode.set('all')"
              title="Show all 4 pages in continuous flow"
            >
              <span>All 4 Pages (78 Agencies)</span>
            </button>
            <div class="flex items-center gap-1 flex-wrap">
              @for (p of rejectionPages(); track p.pageNumber) {
                <button
                  appButton
                  [variant]="viewMode() === 'single' && activePageNumber() === p.pageNumber ? 'primary' : 'ghost'"
                  size="sm"
                  iconOnly
                  (click)="selectPage(p.pageNumber)"
                >
                  {{ p.pageNumber }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Status & Badge indicator -->
        <div class="flex items-center gap-2 ml-auto">
          @if (isSigned()) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <app-icon name="check-circle" size="xs" />
              <span>E-Signed (RajKaj #{{ rajKajRefNo() }})</span>
            </span>
          } @else if (isEmpanelment()) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              <app-icon name="lock" size="xs" />
              <span>Draft • Ready for E-Sign</span>
            </span>
          } @else {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
              <app-icon name="ban" size="xs" />
              <span>Draft Rejection Order • 78 Disqualified Agencies</span>
            </span>
          }
        </div>
      </div>

      <!-- In-Modal Notification Alert -->
      @if (feedbackMessage()) {
        <div
          class="mb-3 p-3 rounded-lg flex items-center justify-between text-xs border"
          [class]="feedbackMessage()!.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'"
        >
          <div class="flex items-center gap-2">
            <app-icon name="check-circle" size="xs" />
            <span>{{ feedbackMessage()!.text }}</span>
          </div>
          <button appButton variant="ghost" size="sm" iconOnly (click)="feedbackMessage.set(null)" title="Dismiss">
            <app-icon name="close" size="xs" />
          </button>
        </div>
      }

      <!-- Document Scroll Container -->
      <div id="printable-order" class="bg-slate-100 p-2 sm:p-4 text-slate-900 border border-slate-200 rounded-lg max-h-[75vh] overflow-y-auto space-y-6">
        @if (isEmpanelment()) {
          <!-- ================= 12-PAGE EMPANELMENT ORDER RECREATION ================= -->
          @for (page of visiblePages(); track page.pageNumber) {
            <div
              class="page-sheet bg-white text-slate-900 border border-slate-300 rounded shadow-md mx-auto p-6 sm:p-8 relative flex flex-col justify-between max-w-4xl"
              style="min-height: 297mm; box-sizing: border-box;"
            >
              <div>
                <!-- Institutional Header on EVERY page (Pages 1 to 12) -->
                <div class="text-center pb-2 mb-3">
                  <div class="flex items-center justify-between gap-3 mb-1">
                    <!-- Left Emblem: RSLDC Logo -->
                    <div class="w-14 h-14 flex items-center justify-center shrink-0">
                      <img src="/rsldc-logo.png" alt="RSLDC Logo" class="w-13 h-13 object-contain" />
                    </div>

                    <!-- Center Corporation Text -->
                    <div class="text-center grow">
                      <h2 class="text-base sm:text-lg font-bold tracking-tight font-sans text-slate-900 m-0 leading-tight">
                        Rajasthan Skill & Livelihood Development Corporation
                      </h2>
                      <p class="text-[11px] font-sans text-slate-700 mt-0.5 m-0 leading-tight">
                        EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur 302004, Telex Fax- 0141-5103246/4
                      </p>
                    </div>

                    <!-- Right Emblem: Rajasthan Sarkar Seal -->
                    <div class="w-14 h-14 flex items-center justify-center shrink-0">
                      <img src="/Rajasthan-Sarkar.png" alt="Govt of Rajasthan" class="w-13 h-13 object-contain" />
                    </div>
                  </div>
                  <div class="border-b-2 border-slate-900 mt-2"></div>
                </div>

                <!-- ================= PAGE 1 SPECIFIC PREAMBLE CONTENT ================= -->
                @if (page.pageNumber === 1) {
                  <!-- File No & Date -->
                  <div class="flex items-center justify-between text-xs font-sans font-bold mb-3">
                    <div class="flex items-center gap-1">
                      <span>File No.-</span>
                      @if (isEditable()) {
                        <input appInput size="sm" class="w-72 font-bold" [(ngModel)]="fileNo" placeholder="File No." />
                      } @else {
                        <span>{{ fileNo() }}</span>
                      }
                    </div>
                    <div class="flex items-center gap-1">
                      <span>Dated</span>
                      @if (isEditable()) {
                        <input appInput size="sm" class="w-32 font-bold text-right" [(ngModel)]="orderDate" placeholder="DD/MM/YYYY" />
                      } @else {
                        <span>{{ orderDate() }}</span>
                      }
                    </div>
                  </div>

                  <!-- Document Main Title -->
                  <div class="text-center my-4">
                    <h1 class="text-base sm:text-lg font-bold uppercase underline underline-offset-4 font-sans tracking-wide m-0">
                      Final Empanelment Order
                    </h1>
                  </div>

                  <!-- Subject Line -->
                  <div class="text-xs sm:text-[13px] font-sans font-bold mb-3 leading-relaxed">
                    <div class="flex items-start gap-1">
                      <span class="shrink-0">Subject:</span>
                      @if (isEditable()) {
                        <textarea appInput size="sm" rows="2" class="w-full font-bold leading-normal" [(ngModel)]="subject"></textarea>
                      } @else {
                        <span>{{ subject() }}</span>
                      }
                    </div>
                  </div>

                  <!-- Preamble paragraphs -->
                  <div class="text-xs sm:text-[12.5px] leading-relaxed mb-3 space-y-2 text-justify font-sans">
                    @if (isEditable()) {
                      <div class="space-y-2">
                        <textarea appInput size="sm" rows="2" class="w-full" [(ngModel)]="preamble1"></textarea>
                        <textarea appInput size="sm" rows="2" class="w-full" [(ngModel)]="preamble2"></textarea>
                        <input appInput size="sm" class="w-full font-bold" [(ngModel)]="approvalClause" />
                      </div>
                    } @else {
                      <p class="m-0 indent-4">{{ preamble1() }}</p>
                      <p class="m-0 indent-4">{{ preamble2() }}</p>
                      <p class="m-0 font-bold">{{ approvalClause() }}</p>
                    }
                  </div>
                }

                <!-- ================= CANDIDATES TABLE FOR THIS PAGE ================= -->
                <div class="border border-slate-900 mb-4 font-sans">
                  <table appDocTable class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-[11px]">
                      <tr>
                        <th class="p-1.5 border-r border-slate-800 text-center w-12">Sr. No</th>
                        <th class="p-1.5 border-r border-slate-800 text-center w-28">Application ID</th>
                        <th class="p-1.5 border-r border-slate-800">Applicant Agency Name</th>
                        <th class="p-1.5 border-r border-slate-800 text-center w-28">Category</th>
                        <th class="p-1.5 border-r border-slate-800 text-center w-20">File Status</th>
                        <th class="p-1.5 text-center w-24">Category as per marks</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-400 text-[11px]">
                      @for (agency of page.entries; track agency.sNo) {
                        <tr class="hover:bg-slate-50">
                          <td class="p-1.5 border-r border-slate-400 text-center font-medium">{{ agency.sNo }}</td>
                          <td class="p-1.5 border-r border-slate-400 text-center font-bold">
                            @if (isEditable()) {
                              <input appInput size="sm" class="w-full text-center font-bold" [(ngModel)]="agency.applicationId" />
                            } @else {
                              {{ agency.applicationId }}
                            }
                          </td>
                          <td class="p-1.5 border-r border-slate-400 font-medium">
                            @if (isEditable()) {
                              <input appInput size="sm" class="w-full font-medium" [(ngModel)]="agency.agencyName" />
                            } @else {
                              {{ agency.agencyName }}
                            }
                          </td>
                          <td class="p-1.5 border-r border-slate-400 text-center">
                            @if (isEditable()) {
                              <input appInput size="sm" class="w-full text-center" [(ngModel)]="agency.category" />
                            } @else {
                              {{ agency.category }}
                            }
                          </td>
                          <td class="p-1.5 border-r border-slate-400 text-center font-semibold text-emerald-800">
                            Eligible
                          </td>
                          <td class="p-1.5 text-center font-bold">
                            @if (isEditable()) {
                              <input appInput size="sm" class="w-12 text-center mx-auto font-bold" [(ngModel)]="agency.marksGrade" />
                            } @else {
                              {{ agency.marksGrade }}
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- ================= PAGE 12 SPECIFIC CLOSING CONTENT ================= -->
                @if (page.pageNumber === 12) {
                  <!-- Managing Director Sign-off Block (Right Aligned) -->
                  <div class="my-6 text-center w-56 ml-auto font-sans">
                    @if (isEditable()) {
                      <input appInput size="sm" class="w-full text-center font-bold" [(ngModel)]="signatoryName" placeholder="Signatory Name" />
                      <input appInput size="sm" class="w-full text-center" [(ngModel)]="signatoryCadre" placeholder="Cadre" />
                      <input appInput size="sm" class="w-full text-center font-bold" [(ngModel)]="signatoryDesignation" placeholder="Designation" />
                    } @else {
                      <p class="font-bold text-sm text-slate-900 m-0">({{ signatoryName() }})</p>
                      <p class="text-xs text-slate-700 m-0">{{ signatoryCadre() }}</p>
                      <p class="font-bold text-xs text-slate-900 m-0">{{ signatoryDesignation() }}</p>
                    }
                  </div>

                  <!-- Copy to:- Section (Left Aligned) -->
                  <div class="my-4 text-xs font-sans text-slate-800 max-w-md">
                    <span class="font-bold block mb-1">Copy to:-</span>
                    @if (isEditable()) {
                      <div class="space-y-1">
                        @for (item of copyToList(); track $index; let i = $index) {
                          <div class="flex items-center gap-1.5">
                            <span class="w-5 shrink-0 font-bold text-slate-700">{{ i + 1 }}.</span>
                            <input appInput size="sm" class="grow" [ngModel]="item" (ngModelChange)="updateCopyItem(i, $event)" />
                            <button appButton variant="ghost" size="sm" iconOnly (click)="removeCopyItem(i)" title="Remove item">
                              <app-icon name="close" size="xs" />
                            </button>
                          </div>
                        }
                        <button appButton variant="ghost" size="sm" (click)="addCopyItem()" class="mt-1">
                          <app-icon name="plus" size="xs" />
                          <span>Add Recipient</span>
                        </button>
                      </div>
                    } @else {
                      <ol class="list-decimal pl-5 space-y-0.5">
                        @for (item of copyToList(); track item) {
                          <li>{{ item }}</li>
                        }
                      </ol>
                    }
                  </div>
                }
              </div>

              <!-- ================= BOTTOM SECTION OF EACH PAGE ================= -->
              <div class="pt-4 border-t border-slate-200 mt-4 flex items-end justify-between text-xs font-sans">
                <!-- Left: Page Indicator -->
                <div class="text-[11px] font-semibold text-slate-500">
                  Page {{ page.pageNumber }} of 12
                </div>

                <!-- Right: Digital Signature Box / Stamp -->
                <div>
                  @if (isSigned()) {
                    <div class="border-2 border-emerald-600 bg-emerald-50/80 p-2 rounded text-left inline-block w-52 tabular-nums text-[9px] text-slate-800 shadow-2xs">
                      <div class="font-bold text-emerald-800 text-[10px] flex items-center gap-1 mb-0.5">
                        <app-icon name="check-circle" size="xs" />
                        <span>Signature valid</span>
                      </div>
                      <p class="m-0 leading-tight">Digitally signed by <strong>{{ signatoryName() }}</strong></p>
                      <p class="m-0 leading-tight">Designation: <strong>{{ signatoryDesignation() }}</strong></p>
                      <p class="m-0 leading-tight">Date: {{ signedAt() }}</p>
                      <p class="m-0 leading-tight">Reason: <strong>Approved</strong></p>
                      <div class="mt-1 pt-1 border-t border-emerald-300 flex items-center justify-between text-[8px] text-slate-500">
                        <span>RajKaj Ref No.: {{ rajKajRefNo() }}</span>
                        <span class="font-bold text-emerald-800">M e-Sign</span>
                      </div>
                    </div>
                  } @else {
                    <div class="border border-dashed border-slate-400 bg-slate-50 p-2 rounded text-left inline-block w-52 text-[9px] text-slate-600">
                      <div class="font-semibold text-slate-700 text-[10px] flex items-center gap-1 mb-0.5">
                        <app-icon name="lock" size="xs" />
                        <span>Signature placeholder</span>
                      </div>
                      <p class="m-0 leading-tight">RajKaj Ref No.: {{ rajKajRefNo() || '23898348' }}</p>
                      <p class="m-0 leading-tight">M e-Sign • Awaiting Authentication</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        } @else {
          <!-- ================= 4-PAGE REJECTION ORDER RECREATION ================= -->
          @for (page of visibleRejectionPages(); track page.pageNumber) {
            <div
              class="page-sheet bg-white text-slate-900 border border-slate-300 rounded shadow-md mx-auto p-6 sm:p-8 relative flex flex-col justify-between max-w-4xl"
              style="min-height: 297mm; box-sizing: border-box;"
            >
              <div>
                <!-- Institutional Header on EVERY page (Pages 1 to 4) -->
                <div class="text-center pb-2 mb-3">
                  <div class="flex items-center justify-between gap-3 mb-1">
                    <!-- Left Emblem: RSLDC Logo -->
                    <div class="w-14 h-14 flex items-center justify-center shrink-0">
                      <img src="/rsldc-logo.png" alt="RSLDC Logo" class="w-13 h-13 object-contain" />
                    </div>

                    <!-- Center Corporation Text -->
                    <div class="text-center grow">
                      <h2 class="text-base sm:text-lg font-bold tracking-tight font-sans text-slate-900 m-0 leading-tight">
                        Rajasthan Skill and Livelihoods Development Corporation
                      </h2>
                      <p class="text-[11px] font-sans text-slate-700 mt-0.5 m-0 leading-tight">
                        Kaushal Bhawan, EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur-302004 (Rajasthan)
                      </p>
                    </div>

                    <!-- Right Emblem: Govt of Rajasthan / Mahatma Celebration Seal -->
                    <div class="w-14 h-14 flex items-center justify-center shrink-0">
                      <img src="/Rajasthan-Sarkar.png" alt="Govt of Rajasthan" class="w-13 h-13 object-contain" />
                    </div>
                  </div>
                  <div class="border-b-2 border-slate-900 mt-2"></div>
                </div>

                <!-- ================= PAGE 1 SPECIFIC PREAMBLE CONTENT ================= -->
                @if (page.pageNumber === 1) {
                  <!-- File No & Date -->
                  <div class="flex items-center justify-between text-xs font-sans font-bold mb-3">
                    <div class="flex items-center gap-1">
                      <span>File No: </span>
                      @if (isEditable()) {
                        <input appInput size="sm" class="w-80 font-bold" [(ngModel)]="fileNo" />
                      } @else {
                        <span>{{ fileNo() }}</span>
                      }
                    </div>
                    <div class="flex items-center gap-1">
                      <span>Date: </span>
                      @if (isEditable()) {
                        <input appInput size="sm" class="w-28 font-bold text-right" [(ngModel)]="orderDate" />
                      } @else {
                        <span>{{ orderDate() }}</span>
                      }
                    </div>
                  </div>

                  <!-- Centered & Underlined Heading -->
                  <div class="text-center my-3">
                    <h1 class="text-base sm:text-lg font-bold underline underline-offset-4 font-sans tracking-wide m-0">
                      Final Rejection Order
                    </h1>
                  </div>

                  <!-- Preambles (Editable) -->
                  <div class="text-xs sm:text-[12.5px] leading-relaxed mb-3 space-y-2 text-justify font-sans">
                    @if (isEditable()) {
                      <textarea appInput size="sm" rows="2" class="w-full text-justify leading-relaxed" [(ngModel)]="preamble1"></textarea>
                      <textarea appInput size="sm" rows="2" class="w-full text-justify leading-relaxed" [(ngModel)]="preamble2"></textarea>
                    } @else {
                      <p class="m-0 indent-4">{{ preamble1() }}</p>
                      <p class="m-0 indent-4">{{ preamble2() }}</p>
                    }
                  </div>
                }

                <!-- ================= TABLE (PAGES 1, 2, 3, 4) ================= -->
                <div class="border border-slate-900 mb-3 font-sans">
                  <table appDocTable class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-100 font-bold border-b border-slate-900 text-slate-900 text-[11px]">
                      <tr>
                        <th class="p-1.5 border-r border-slate-800 text-center w-12">Sr. No</th>
                        <th class="p-1.5 border-r border-slate-800 text-center w-32">Application ID</th>
                        <th class="p-1.5 border-r border-slate-800">Applicant Agency Name</th>
                        <th class="p-1.5 text-center w-32">File Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-400 text-[11px]">
                      @for (item of page.entries; track item.sNo; let idx = $index) {
                        <tr class="hover:bg-slate-50/50">
                          <td class="p-1.5 border-r border-slate-400 text-center font-medium">{{ item.sNo }}</td>
                          <td class="p-1.5 border-r border-slate-400 text-center font-bold">
                            @if (isEditable()) {
                              <input appInput size="sm" class="w-full text-center" [(ngModel)]="item.applicationId" />
                            } @else {
                              {{ item.applicationId }}
                            }
                          </td>
                          <td class="p-1.5 border-r border-slate-400 font-medium">
                            @if (isEditable()) {
                              <input appInput size="sm" class="w-full" [(ngModel)]="item.agencyName" />
                            } @else {
                              {{ item.agencyName }}
                            }
                          </td>
                          <td class="p-1.5 text-center font-bold text-rose-800">
                            @if (isEditable()) {
                              <input appInput size="sm" class="w-full text-center font-bold text-rose-800" [(ngModel)]="item.fileStatus" />
                            } @else {
                              {{ item.fileStatus }}
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- ================= PAGE 4 SPECIFIC CONCLUSION & COPY-TO SECTION ================= -->
                @if (page.pageNumber === 4) {
                  <!-- Approval statement -->
                  <p class="mt-3 text-xs sm:text-[12.5px] font-sans">
                    This issue with the approval of the competent authority.
                  </p>

                  <!-- Scheme OIC Signatory block -->
                  <div class="text-right text-xs font-sans font-bold my-3">
                    @if (isEditable()) {
                      <input appInput size="sm" class="text-right font-bold w-48 ml-auto block mb-1" [(ngModel)]="signatoryDesignation" />
                      <input appInput size="sm" class="text-right font-bold w-48 ml-auto block" [(ngModel)]="schemeSectionName" />
                    } @else {
                      <p class="m-0 leading-tight font-bold">{{ signatoryDesignation() }}</p>
                      <p class="m-0 leading-tight font-bold">{{ schemeSectionName() }}</p>
                    }
                  </div>

                  <!-- Horizontal Divider Line -->
                  <div class="border-b border-slate-900 my-3"></div>

                  <!-- Second File No and Date -->
                  <div class="flex items-center justify-between text-xs font-sans font-bold mb-3">
                    <div class="flex items-center gap-1">
                      <span>File No: </span>
                      @if (isEditable()) {
                        <input appInput size="sm" class="w-80 font-bold" [(ngModel)]="secondFileNo" />
                      } @else {
                        <span>{{ secondFileNo() }}</span>
                      }
                    </div>
                    <div class="flex items-center gap-1">
                      <span>Date: </span>
                      @if (isEditable()) {
                        <input appInput size="sm" class="w-32 font-bold text-right" [(ngModel)]="secondDate" />
                      } @else {
                        <span>{{ secondDate() }}</span>
                      }
                    </div>
                  </div>

                  <!-- Copy to section (9 items) -->
                  <div class="text-xs font-sans mb-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold underline">Copy to:-</span>
                      @if (isEditable()) {
                        <button appButton variant="ghost" size="sm" (click)="addCopyItem()" title="Add recipient">
                          <app-icon name="plus" size="xs" />
                          <span>Add</span>
                        </button>
                      }
                    </div>
                    <ol class="list-decimal list-inside space-y-1 text-slate-800 text-[11.5px]">
                      @for (cp of copyToList(); track $index; let cIdx = $index) {
                        <li class="leading-relaxed">
                          @if (isEditable()) {
                            <div class="inline-flex items-center gap-1 w-[90%]">
                              <input
                                appInput
                                size="sm"
                                class="grow text-xs"
                                [value]="cp"
                                (input)="updateCopyItem(cIdx, $any($event.target).value)"
                              />
                              <button
                                appButton
                                variant="ghost"
                                size="sm"
                                iconOnly
                                (click)="removeCopyItem(cIdx)"
                                title="Delete recipient"
                              >
                                <app-icon name="trash" size="xs" />
                              </button>
                            </div>
                          } @else {
                            <span>{{ cp }}</span>
                          }
                        </li>
                      }
                    </ol>
                  </div>

                  <!-- Second Scheme OIC Signatory block under copy to -->
                  <div class="text-right text-xs font-sans font-bold my-3">
                    <p class="m-0 leading-tight font-bold">{{ signatoryDesignation() }}</p>
                    <p class="m-0 leading-tight font-bold">{{ schemeSectionName() }}</p>
                  </div>
                }
              </div>

              <!-- ================= FOOTER FOR EACH PAGE (PAGES 1 to 4) ================= -->
              <div class="pt-4 border-t border-slate-200 mt-4 flex items-end justify-between text-xs font-sans">
                <div class="text-[11px] font-semibold text-slate-500">
                  Page {{ page.pageNumber }} of 4
                </div>

                @if (page.pageNumber === 4) {
                  <!-- Official Digital Signature block with RajKaj reference -->
                  <div class="border border-emerald-300 bg-emerald-50/70 p-2.5 rounded text-left inline-block w-56 text-[9.5px] text-slate-800 shadow-xs">
                    <div class="font-bold text-emerald-800 text-[10px] flex items-center gap-1 mb-1">
                      <app-icon name="check-circle" size="xs" />
                      <span>Signature valid</span>
                    </div>
                    <p class="m-0 leading-tight">Digitally signed by <strong>Shivkesh Jareda</strong></p>
                    <p class="m-0 leading-tight">Designation: <strong>Manager</strong></p>
                    <p class="m-0 leading-tight">Date: <strong>2026.08.10 17:49:26 IST</strong></p>
                    <p class="m-0 leading-tight">Reason: <strong>Approved</strong></p>
                    <div class="mt-1 pt-1 border-t border-emerald-300 flex items-center justify-between text-[8px] text-slate-500">
                      <span>RajKaj Ref No.: {{ rajKajRefNo() || '23898382' }}</span>
                      <span class="font-bold text-emerald-800">M e-Sign</span>
                    </div>
                  </div>
                } @else {
                  <!-- Running page signature valid placeholder -->
                  <div class="border border-slate-300 bg-slate-50 p-1.5 rounded text-left inline-block w-48 text-[9px] text-slate-700">
                    <div class="font-bold text-slate-800 text-[9px] flex items-center gap-1 mb-0.5 text-emerald-700">
                      <app-icon name="check-circle" size="xs" />
                      <span>Signature valid</span>
                    </div>
                    <p class="m-0 leading-tight">Digitally signed by Shivkesh Jareda</p>
                    <p class="m-0 leading-tight">Designation: Manager</p>
                    <p class="m-0 leading-tight">Date: 2026.08.10 17:49:26 IST</p>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <ng-container modalFooter>
        @if (!isEditable()) {
          <button appButton variant="outline" size="sm" (click)="close.emit()">
            <span>Close</span>
          </button>
          <button appButton variant="outline" size="sm" (click)="printOrder()">
            <app-icon name="print" size="xs" />
            <span>Print</span>
          </button>
          <button appButton size="sm" (click)="downloadPdf()">
            <app-icon name="download" size="xs" />
            <span>Download PDF</span>
          </button>
        } @else if (isEmpanelment()) {
          @if (isSigned()) {
            <!-- Successfully signed Approved Order: Print, Download, and OK -->
            <button appButton variant="outline" size="sm" (click)="printOrder()">
              <app-icon name="print" size="xs" />
              <span>Print</span>
            </button>
            <button appButton variant="outline" size="sm" (click)="downloadPdf()">
              <app-icon name="download" size="xs" />
              <span>Download PDF</span>
            </button>
            <button appButton variant="primary" size="md" (click)="onOkAfterESign()">
              <span>OK</span>
            </button>
          } @else {
            <!-- Approved Order before E-Sign: Cancel, Save, and E-Sign -->
            <button appButton variant="ghost" size="sm" (click)="close.emit()">
              <span>Cancel</span>
            </button>
            <button appButton variant="outline" size="sm" (click)="saveDraft()">
              <app-icon name="clipboard" size="xs" />
              <span>Save</span>
            </button>
            <button appButton variant="primary" size="sm" (click)="openESignModal()">
              <app-icon name="shield-check" size="xs" />
              <span>E-Sign</span>
            </button>
          }
        } @else {
          <!-- Rejected Order: Cancel, Save, and Submit -->
          <button appButton variant="ghost" size="sm" (click)="close.emit()">
            <span>Cancel</span>
          </button>
          <button appButton variant="outline" size="sm" (click)="saveDraft()">
            <app-icon name="clipboard" size="xs" />
            <span>Save</span>
          </button>
          <button appButton variant="danger" size="sm" (click)="submitRejection()">
            <app-icon name="ban" size="xs" />
            <span>Submit</span>
          </button>
        }
      </ng-container>
    </app-modal>

    <!-- Multi-Party Sequential OTP Modal -->
    @if (showESignModal()) {
      <app-modal
        title="Multi-Party Sequential E-Sign Authentication"
        subtitle="Sequential OTP authentication of authorised committee signatories"
        size="lg"
        (close)="closeESignModal()"
      >
        <div class="space-y-4">
          <!-- Committee Contacts Sequential Status List -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            @for (member of committeeMembers(); track member.id; let idx = $index) {
              <div
                class="p-2.5 rounded-lg border flex items-center justify-between gap-2"
                [class]="member.otpVerified ? 'bg-emerald-50 border-emerald-200' : (idx === currentSignatoryIndex() ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-slate-50 border-slate-200 opacity-70')"
              >
                <div class="truncate">
                  <p class="font-semibold text-slate-900 truncate">{{ member.name }}</p>
                  <p class="text-[11px] text-slate-600 truncate">{{ member.role }}</p>
                </div>
                @if (member.otpVerified) {
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    <app-icon name="check-circle" size="xs" />
                    <span>Verified</span>
                  </span>
                } @else if (idx === currentSignatoryIndex()) {
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white shrink-0">
                    <span>Active</span>
                  </span>
                } @else {
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600 shrink-0">
                    <span>Pending</span>
                  </span>
                }
              </div>
            }
          </div>

          <!-- Current Contact Undergoing Authentication -->
          @if (currentSignatory(); as cur) {
            <div class="p-4 rounded-xl border border-slate-300 bg-white shadow-2xs space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Step {{ currentSignatoryIndex() + 1 }} of {{ committeeMembers().length }}: Authenticate Contact
                  </span>
                  <h4 class="text-sm font-bold text-slate-900">{{ cur.name }}</h4>
                  <p class="text-xs text-slate-600">{{ cur.designation }} • {{ cur.role }}</p>
                </div>
                <div class="text-right text-xs text-slate-600">
                  <p class="tabular-nums text-[11px]">{{ cur.mobile }}</p>
                  <p class="text-[11px] text-slate-500">{{ cur.email }}</p>
                </div>
              </div>

              <!-- Demo Test Helper -->
              <div class="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <app-icon name="info" size="xs" class="shrink-0 text-blue-700" />
                  <span>OTP sent to registered mobile. (Test OTP: <strong>123456</strong>)</span>
                </div>
                <button appButton variant="ghost" size="sm" (click)="fillTestOtp()" class="shrink-0">
                  Auto-fill OTP
                </button>
              </div>

              <!-- OTP Input Field -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-800">
                  Enter 6-digit OTP received by {{ cur.name }}:
                </label>
                <div class="flex items-center gap-3">
                  <input
                    appInput
                    size="sm"
                    class="w-48 text-center text-base font-bold tracking-widest tabular-nums"
                    maxlength="6"
                    placeholder="------"
                    [(ngModel)]="currentOtp"
                    (keyup.enter)="verifyCurrentOtp()"
                  />
                  <button
                    appButton
                    variant="primary"
                    size="sm"
                    [disabled]="currentOtp().trim().length < 6"
                    (click)="verifyCurrentOtp()"
                  >
                    <app-icon name="check" size="xs" />
                    <span>Verify OTP & Proceed</span>
                  </button>
                </div>
                @if (otpError()) {
                  <p class="text-xs text-rose-600 font-medium m-0">{{ otpError() }}</p>
                }
              </div>
            </div>
          }

          <!-- All Contacts Verified Success Note -->
          @if (allSignatoriesVerified()) {
            <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <app-icon name="check-circle" size="sm" class="text-emerald-700 shrink-0" />
              <span>All {{ committeeMembers().length }} committee signatories have successfully verified their OTP. Document can now be officially digitally signed and submitted.</span>
            </div>
          }
        </div>

        <ng-container modalFooter>
          <button appButton variant="outline" size="sm" (click)="closeESignModal()">
            <span>Cancel</span>
          </button>
          <button
            appButton
            variant="primary"
            size="md"
            [disabled]="!allSignatoriesVerified()"
            (click)="completeESign()"
          >
            <app-icon name="shield-check" size="sm" />
            <span>Sign & Submit Implement Order</span>
          </button>
        </ng-container>
      </app-modal>
    }
  `
})
export class OrderViewerModalComponent implements OnInit, OnChanges {
  private empanelmentOrderService = inject(EmpanelmentOrderService);

  readonly order = input<EmpanelmentOrder | null>(null);
  readonly orderType = input<'EMPANELMENT' | 'REJECTION'>('EMPANELMENT');
  readonly isEditable = input<boolean>(true);

  readonly close = output<void>();
  readonly orderSaved = output<EmpanelmentOrder>();
  readonly orderSubmitted = output<EmpanelmentOrder>();

  // Document Fields State (Signals)
  schemeId = signal<string>('SAMARTH-01');
  schemeName = signal<string>('Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH');
  eoiRefNo = signal<string>('RSLDC/EOI/SAMARTH/2026-27/1709-15');
  fileNo = signal<string>('F () RSLDC/EOI/SAMARTH/2026-27/1709-15');
  orderDate = signal<string>('01/08/2026');
  subject = signal<string>('Empanelment order against EOI published on 22.01.2026 under MMKVY Category III SAMARTH for FY 2026-2027');
  preamble1 = signal<string>('An Expression of Interest (EOI) was published on 22 January 2026 under Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH scheme for empanelment of Project Implementing Agencies (PIAs).');
  preamble2 = signal<string>('Pursuant to the evaluation and De Novo Assessment process, the following 253 agencies are hereby shortlisted and empaneled under SAMARTH scheme for FY 2026-2027.');
  approvalClause = signal<string>('List of empaneled agencies are as following:');
  signatoryName = signal<string>('Rishav Mandal');
  signatoryCadre = signal<string>('I.A.S.');
  signatoryDesignation = signal<string>('Managing Director');
  copyToList = signal<string[]>([]);

  // 12 Pages of 253 Agencies (Empanelment)
  pages = signal<EmpanelmentOrderPageDefinition[]>(EMPANELMENT_253_PAGES);

  // 4 Pages of 78 Agencies (Rejection)
  rejectionPages = signal<RejectionOrderPageDefinition[]>(REJECTION_78_PAGES);
  secondFileNo = signal<string>('F ( ) RSLDC/Skills/SAKSHM/ EOI/2026-2027');
  secondDate = signal<string>('10/08/2026');
  schemeSectionName = signal<string>('SAMARTH');

  activePageNumber = signal<number>(1);
  viewMode = signal<'all' | 'single'>('all');

  rejectedAgencies = signal<RejectedAgencyItem[]>([]);
  committeeMembers = signal<CommitteeSignatory[]>([]);

  isSigned = signal<boolean>(false);
  signedAt = signal<string>('');
  rajKajRefNo = signal<string>('23898348');

  feedbackMessage = signal<{ type: 'success' | 'info'; text: string } | null>(null);

  // E-Sign Sequential OTP Flow State
  showESignModal = signal<boolean>(false);
  currentSignatoryIndex = signal<number>(0);
  currentOtp = signal<string>('');
  otpError = signal<string>('');

  isEmpanelment = computed(() => this.orderType() === 'EMPANELMENT');
  orderTitle = computed(() => (this.isEmpanelment() ? 'Official Final Empanelment Order (12 Pages • 253 Agencies)' : 'Official Final Rejection Order (4 Pages • 78 Agencies)'));

  visiblePages = computed(() => {
    if (this.viewMode() === 'all') {
      return this.pages();
    }
    const cur = this.activePageNumber();
    return this.pages().filter(p => p.pageNumber === cur);
  });

  visibleRejectionPages = computed(() => {
    if (this.viewMode() === 'all') {
      return this.rejectionPages();
    }
    const cur = this.activePageNumber();
    return this.rejectionPages().filter(p => p.pageNumber === cur);
  });

  currentSignatory = computed(() => {
    const list = this.committeeMembers();
    const idx = this.currentSignatoryIndex();
    return list[idx] || null;
  });

  allSignatoriesVerified = computed(() => {
    const list = this.committeeMembers();
    return list.length > 0 && list.every(m => m.otpVerified);
  });

  ngOnInit(): void {
    this.initFromOrder();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] || changes['orderType']) {
      this.initFromOrder();
    }
  }

  selectPage(pageNum: number): void {
    this.activePageNumber.set(pageNum);
    this.viewMode.set('single');
  }

  private initFromOrder(): void {
    const o = this.order();
    const isEmp = this.isEmpanelment();

    const sId = o?.schemeId || 'SAMARTH-01';
    const sName = o?.schemeName || 'Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH';
    const refNo = o?.eoiRefNo || 'RSLDC/EOI/SAMARTH/2026-27/1709-15';

    this.schemeId.set(sId);
    this.schemeName.set(sName);
    this.eoiRefNo.set(refNo);
    this.fileNo.set(o?.fileNo || 'F () RSLDC/EOI/SAMARTH/2026-27/1709-15');
    this.orderDate.set(o?.orderDate || '01/08/2026');

    if (isEmp) {
      this.fileNo.set(o?.fileNo || 'F () RSLDC/EOI/SAMARTH/2026-27/1709-15');
      this.orderDate.set(o?.orderDate || '01/08/2026');
      this.subject.set(o?.subject || 'Empanelment order against EOI published on 22.01.2026 under MMKVY Category III SAMARTH for FY 2026-2027');
      this.preamble1.set(o?.preamble1 || 'An Expression of Interest (EOI) was published on 22 January 2026 under Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH scheme for empanelment of Project Implementing Agencies (PIAs).');
      this.preamble2.set(o?.preamble2 || 'Pursuant to the evaluation and De Novo Assessment process, the following 253 agencies are hereby shortlisted and empaneled under SAMARTH scheme for FY 2026-2027.');
      this.approvalClause.set(o?.approvalClause || 'List of empaneled agencies are as following:');
      this.signatoryName.set(o?.signatoryName || 'Rishav Mandal');
      this.signatoryCadre.set('I.A.S.');
      this.signatoryDesignation.set(o?.signatoryDesignation || 'Managing Director');

      // Setup 12 Pages
      this.pages.set(EMPANELMENT_253_PAGES.map(p => ({
        pageNumber: p.pageNumber,
        entries: p.entries.map(e => ({ ...e }))
      })));
    } else {
      this.fileNo.set(o?.fileNo || 'F ( ) RSLDC/Skills/SAMARTH/ EOI/2026-2027/1775-82');
      this.orderDate.set(o?.orderDate || '10/08/2026');
      this.subject.set(o?.rejectionSubject || 'Final Rejection Order against EOI No. RSLDC/EOI/MMKVY-Cat. I/II/III/2026-27/01 published on 22nd January 2026 under SAMARTH Scheme.');
      this.preamble1.set(o?.rejectionPreamble1 || 'This bears to the reference of EOI No. RSLDC/EOI/MMKVY-Cat. I/II/III/2026-27/01 published on 22nd January 2026 under SAMARTH Scheme.');
      this.preamble2.set(o?.rejectionPreamble2 || 'As per recommendations of the Desk Appraisal Committee followed by the De Novo Assessment process, proposals submitted by following agencies are not found eligible as per the criteria laid down in EOI:');
      this.approvalClause.set('This issue with the approval of the competent authority.');
      this.signatoryName.set(o?.rejectionSignatoryName || 'Shivkesh Jareda');
      this.signatoryCadre.set('');
      this.signatoryDesignation.set(o?.rejectionSignatoryDesignation || 'Scheme OIC');
      this.schemeSectionName.set('SAMARTH');
      this.secondFileNo.set('F ( ) RSLDC/Skills/SAKSHM/ EOI/2026-2027');
      this.secondDate.set(o?.orderDate || '10/08/2026');
      this.rajKajRefNo.set(o?.rajKajRefNo || '23898382');

      // Populate 4 Pages for Rejection (all 78 agencies)
      this.rejectionPages.set(REJECTION_78_PAGES.map(p => ({
        pageNumber: p.pageNumber,
        entries: p.entries.map(e => ({ ...e }))
      })));
    }

    const copies = o?.copyToList && o.copyToList.length > 0 ? [...o.copyToList] : (
      !isEmp ? [
        "PS to Hon'ble Minister, DSEE",
        'PS to Secretary, DSEE',
        'Commissioner, Department of Women Empowerment',
        'General Manager-I, RSLDC',
        'CAO, RSLDC',
        'Program Manager, PMCA',
        'OIC- MIS ( To upload on website/portal)',
        'Concerned Agencies (via email)',
        'Guard File'
      ] : [
        "PS to Hon'ble Minister, DSEE",
        'PS to ACS, DSEE',
        'PS to Managing Director, RSLDC',
        'General Manager-I, RSLDC',
        'CAO, RSLDC',
        'Program Manager, PMCA',
        'OIC-MIS (to upload on website portal)',
        'Concerned Agencies (via email)',
        'Guard file'
      ]
    );
    this.copyToList.set(copies);

    this.rejectedAgencies.set(ALL_78_REJECTED_AGENCIES.map(a => ({ ...a })));

    const members = o?.committeeMembers && o.committeeMembers.length > 0
      ? o.committeeMembers.map(m => ({ ...m }))
      : DEFAULT_COMMITTEE_MEMBERS.map(m => ({ ...m, otpSent: false, otpVerified: false }));
    this.committeeMembers.set(members);

    const alreadySigned = o?.status === 'E_SIGNED';
    this.isSigned.set(alreadySigned);
    this.signedAt.set(o?.signedAt || (alreadySigned ? '2026.08.10 17:10:28 IST' : ''));
    this.rajKajRefNo.set(o?.rajKajRefNo || '23898348');
  }

  addCopyItem(): void {
    this.copyToList.update(list => [...list, 'New Designated Authority']);
  }

  removeCopyItem(index: number): void {
    this.copyToList.update(list => list.filter((_, i) => i !== index));
  }

  updateCopyItem(index: number, val: string): void {
    this.copyToList.update(list => list.map((item, i) => (i === index ? val : item)));
  }

  removeRejectedAgency(index: number): void {
    this.rejectedAgencies.update(list => list.filter((_, i) => i !== index));
  }

  saveDraft(): void {
    const currentOrder = this.buildCurrentOrder(this.isSigned() ? 'E_SIGNED' : 'DRAFT');
    this.empanelmentOrderService.saveOrder(currentOrder);
    this.orderSaved.emit(currentOrder);
    this.feedbackMessage.set({
      type: 'success',
      text: this.isEmpanelment() ? 'Approved implement order draft (all 253 records) saved successfully.' : 'Rejection implement order draft saved successfully.'
    });
  }

  // Multi-Party Sequential OTP Methods
  openESignModal(): void {
    const firstUnverified = this.committeeMembers().findIndex(m => !m.otpVerified);
    this.currentSignatoryIndex.set(firstUnverified >= 0 ? firstUnverified : 0);
    this.currentOtp.set('');
    this.otpError.set('');
    this.showESignModal.set(true);
  }

  closeESignModal(): void {
    this.showESignModal.set(false);
    this.currentOtp.set('');
    this.otpError.set('');
  }

  fillTestOtp(): void {
    this.currentOtp.set('123456');
    this.otpError.set('');
  }

  verifyCurrentOtp(): void {
    const otp = this.currentOtp().trim();
    if (otp.length < 6) {
      this.otpError.set('Please enter a valid 6-digit OTP code.');
      return;
    }

    const idx = this.currentSignatoryIndex();
    this.committeeMembers.update(list =>
      list.map((m, i) => (i === idx ? { ...m, otpVerified: true } : m))
    );
    this.currentOtp.set('');
    this.otpError.set('');

    const nextIdx = this.committeeMembers().findIndex((m, i) => i > idx && !m.otpVerified);
    if (nextIdx >= 0) {
      this.currentSignatoryIndex.set(nextIdx);
    }
  }

  completeESign(): void {
    if (!this.allSignatoriesVerified()) {
      this.otpError.set('All committee signatories must verify their OTP before final signing.');
      return;
    }

    const now = '2026.08.10 17:10:28 IST';
    const rajKajRef = this.rajKajRefNo() || '23898348';

    this.isSigned.set(true);
    this.signedAt.set(now);
    this.rajKajRefNo.set(rajKajRef);
    this.showESignModal.set(false);

    const updatedOrder = this.buildCurrentOrder('E_SIGNED');
    this.empanelmentOrderService.saveOrder(updatedOrder);

    this.feedbackMessage.set({
      type: 'success',
      text: `Document successfully e-signed and approved under RajKaj Reference #${rajKajRef}. Click OK to complete.`
    });
  }

  onOkAfterESign(): void {
    const finalOrder = this.buildCurrentOrder('E_SIGNED');
    this.orderSubmitted.emit(finalOrder);
    this.close.emit();
  }

  submitRejection(): void {
    const updatedOrder = this.buildCurrentOrder('E_SIGNED');
    this.empanelmentOrderService.saveOrder(updatedOrder);
    this.orderSubmitted.emit(updatedOrder);
    this.close.emit();
  }

  private buildCurrentOrder(status: 'DRAFT' | 'E_SIGNED'): EmpanelmentOrder {
    const isEmp = this.isEmpanelment();
    const empanelledAgencies = isEmp ? this.pages().flatMap(p => p.entries) : (this.order()?.empanelledAgencies || []);
    const rejectedAgencies = !isEmp
      ? this.rejectionPages().flatMap(p => p.entries)
      : (this.order()?.rejectedAgencies || ALL_78_REJECTED_AGENCIES);

    return {
      id: this.order()?.id || `ORD-${this.schemeId()}`,
      schemeId: this.schemeId(),
      schemeName: this.schemeName(),
      eoiRefNo: this.eoiRefNo(),
      fileNo: this.fileNo(),
      orderDate: this.orderDate(),
      status,
      signedAt: this.signedAt(),
      rajKajRefNo: this.rajKajRefNo(),
      issuingAuthority: {
        name: this.signatoryName(),
        designation: this.signatoryDesignation(),
        department: 'Rajasthan Skill & Livelihoods Development Corporation'
      },
      copyToList: [...this.copyToList()],
      committeeMembers: [...this.committeeMembers()],
      empanelledAgencies,
      rejectedAgencies,
      createdAt: this.order()?.createdAt || formatDate(new Date()),
      subject: isEmp ? this.subject() : this.order()?.subject,
      rejectionSubject: !isEmp ? this.subject() : this.order()?.rejectionSubject,
      preamble1: isEmp ? this.preamble1() : this.order()?.preamble1,
      preamble2: isEmp ? this.preamble2() : this.order()?.preamble2,
      rejectionPreamble1: !isEmp ? this.preamble1() : this.order()?.rejectionPreamble1,
      rejectionPreamble2: !isEmp ? this.preamble2() : this.order()?.rejectionPreamble2,
      approvalClause: this.approvalClause(),
      signatoryName: isEmp ? this.signatoryName() : this.order()?.signatoryName,
      signatoryDesignation: isEmp ? this.signatoryDesignation() : this.order()?.signatoryDesignation,
      rejectionSignatoryName: !isEmp ? this.signatoryName() : this.order()?.rejectionSignatoryName,
      rejectionSignatoryDesignation: !isEmp ? this.signatoryDesignation() : this.order()?.rejectionSignatoryDesignation
    };
  }

  printOrder(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  downloadPdf(): void {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const isEmp = this.isEmpanelment();

    if (!isEmp) {
      this.generateRejectionPdf(pdf);
      return;
    }

    // 12-Page Exact Empanelment Order PDF Generation
    const pages = this.pages();
    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      if (pIdx > 0) {
        pdf.addPage();
      }
      const pageDef = pages[pIdx];
      const pageNum = pageDef.pageNumber;

      // Draw outer margin border
      pdf.setDrawColor(40, 40, 40);
      pdf.setLineWidth(0.35);
      pdf.rect(10, 10, 190, 277);

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(20, 20, 20);
      pdf.text('Rajasthan Skill & Livelihood Development Corporation', 105, 17, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(60, 60, 60);
      pdf.text('EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur 302004, Telex Fax- 0141-5103246/4', 105, 21.5, { align: 'center' });

      pdf.setDrawColor(30, 30, 30);
      pdf.setLineWidth(0.5);
      pdf.line(13, 24, 197, 24);

      let currentY = 28;

      if (pageNum === 1) {
        // File No and Date
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(20, 20, 20);
        pdf.text(`File No.-${this.fileNo()}`, 13, currentY);
        pdf.text(`Dated ${this.orderDate()}`, 197, currentY, { align: 'right' });

        // Title
        currentY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Final Empanelment Order', 105, currentY, { align: 'center' });
        const titleWidth = pdf.getTextWidth('Final Empanelment Order');
        pdf.line(105 - titleWidth / 2, currentY + 1, 105 + titleWidth / 2, currentY + 1);

        // Subject
        currentY += 6;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        const subjText = `Subject: ${this.subject()}`;
        const subjLines = pdf.splitTextToSize(subjText, 184);
        pdf.text(subjLines, 13, currentY);
        currentY += subjLines.length * 3.5 + 2;

        // Preamble 1
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        const p1Lines = pdf.splitTextToSize(this.preamble1(), 184);
        pdf.text(p1Lines, 13, currentY);
        currentY += p1Lines.length * 3.5 + 1.5;

        // Preamble 2
        const p2Lines = pdf.splitTextToSize(this.preamble2(), 184);
        pdf.text(p2Lines, 13, currentY);
        currentY += p2Lines.length * 3.5 + 1.5;

        // List notice
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.approvalClause(), 13, currentY);
        currentY += 4;
      }

      // Draw Table Header
      const tableStartY = currentY;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(13, tableStartY, 184, 8, 'F');
      pdf.setDrawColor(40, 40, 40);
      pdf.setLineWidth(0.3);
      pdf.rect(13, tableStartY, 184, 8);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(20, 20, 20);

      pdf.text('Sr.', 18, tableStartY + 3, { align: 'center' });
      pdf.text('No', 18, tableStartY + 6.5, { align: 'center' });
      pdf.text('Applicatio', 34, tableStartY + 3, { align: 'center' });
      pdf.text('n ID', 34, tableStartY + 6.5, { align: 'center' });
      pdf.text('Applicant Agency Name', 84, tableStartY + 4.5, { align: 'center' });
      pdf.text('Category', 137, tableStartY + 4.5, { align: 'center' });
      pdf.text('File Status', 162, tableStartY + 4.5, { align: 'center' });
      pdf.text('Category', 185, tableStartY + 3, { align: 'center' });
      pdf.text('as per marks', 185, tableStartY + 6.5, { align: 'center' });

      // Vertical dividers in header
      pdf.line(23, tableStartY, 23, tableStartY + 8);
      pdf.line(45, tableStartY, 45, tableStartY + 8);
      pdf.line(123, tableStartY, 123, tableStartY + 8);
      pdf.line(151, tableStartY, 151, tableStartY + 8);
      pdf.line(173, tableStartY, 173, tableStartY + 8);

      let rowY = tableStartY + 8;
      const rowHeight = pageNum === 1 ? 8 : (pageNum === 12 ? 8 : 6.8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);

      pageDef.entries.forEach(entry => {
        pdf.rect(13, rowY, 184, rowHeight);
        pdf.line(23, rowY, 23, rowY + rowHeight);
        pdf.line(45, rowY, 45, rowY + rowHeight);
        pdf.line(123, rowY, 123, rowY + rowHeight);
        pdf.line(151, rowY, 151, rowY + rowHeight);
        pdf.line(173, rowY, 173, rowY + rowHeight);

        pdf.text(String(entry.sNo), 18, rowY + 4.5, { align: 'center' });
        pdf.setFont('helvetica', 'bold');
        pdf.text(entry.applicationId, 34, rowY + 4.5, { align: 'center' });
        pdf.setFont('helvetica', 'normal');

        const nameLines = pdf.splitTextToSize(entry.agencyName, 76);
        pdf.text(nameLines[0] || '', 47, rowY + (nameLines.length > 1 ? 3 : 4.5));
        if (nameLines.length > 1) {
          pdf.text(nameLines[1], 47, rowY + 6);
        }

        pdf.text(entry.category, 137, rowY + 4.5, { align: 'center' });
        pdf.text(entry.fileStatus, 162, rowY + 4.5, { align: 'center' });
        pdf.setFont('helvetica', 'bold');
        pdf.text(entry.marksGrade, 185, rowY + 4.5, { align: 'center' });
        pdf.setFont('helvetica', 'normal');

        rowY += rowHeight;
      });

      if (pageNum === 12) {
        // Page 12: Signatory details and Copy-to section
        let p12Y = rowY + 12;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.text(`(${this.signatoryName()})`, 175, p12Y, { align: 'center' });
        pdf.text(this.signatoryCadre(), 175, p12Y + 4.5, { align: 'center' });
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.signatoryDesignation(), 175, p12Y + 9, { align: 'center' });

        p12Y += 16;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text('Copy to:-', 15, p12Y);
        p12Y += 4.5;

        this.copyToList().forEach((item, idx) => {
          pdf.text(`${idx + 1}. ${item}`, 18, p12Y);
          p12Y += 4;
        });
      }

      // Digital Signature Box at Bottom Right
      const sigBoxY = 250;
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(0.4);
      pdf.setFillColor(240, 253, 244);
      pdf.rect(135, sigBoxY, 62, 22, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(6, 95, 70);
      pdf.text('Signature valid', 138, sigBoxY + 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(30, 41, 59);
      pdf.text(`Digitally signed by ${this.signatoryName()}`, 138, sigBoxY + 8);
      pdf.text(`Designation: ${this.signatoryDesignation()}`, 138, sigBoxY + 11.5);
      pdf.text(`Date: ${this.signedAt() || '2026.08.10 17:10:28 IST'}`, 138, sigBoxY + 15);
      pdf.text('Reason: Approved', 138, sigBoxY + 18.5);

      pdf.setFontSize(5.5);
      pdf.text(`RajKaj Ref No.: ${this.rajKajRefNo() || '23898348'}`, 138, sigBoxY + 21);
      pdf.setFont('helvetica', 'bold');
      pdf.text('M e-Sign', 190, sigBoxY + 21, { align: 'right' });

      // Page Number Footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${pageNum} of 12`, 105, 283, { align: 'center' });
    }

    pdf.save(`Empanelment_Order_${this.schemeId()}.pdf`);
  }

  private generateRejectionPdf(pdf: jsPDF): void {
    const pages = this.rejectionPages();
    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      if (pIdx > 0) {
        pdf.addPage();
      }
      const pageDef = pages[pIdx];
      const pageNum = pageDef.pageNumber;

      // Outer margin border
      pdf.setDrawColor(40, 40, 40);
      pdf.setLineWidth(0.35);
      pdf.rect(10, 10, 190, 277);

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(20, 20, 20);
      pdf.text('Rajasthan Skill and Livelihoods Development Corporation', 105, 17, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Kaushal Bhawan, EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur-302004 (Rajasthan)', 105, 21.5, { align: 'center' });

      pdf.setDrawColor(30, 30, 30);
      pdf.setLineWidth(0.5);
      pdf.line(13, 24, 197, 24);

      let currentY = 28;

      if (pageNum === 1) {
        // File No and Date
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(20, 20, 20);
        pdf.text(`File No: ${this.fileNo()}`, 13, currentY);
        pdf.text(`Date: ${this.orderDate()}`, 197, currentY, { align: 'right' });

        // Title
        currentY += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Final Rejection Order', 105, currentY, { align: 'center' });
        const titleWidth = pdf.getTextWidth('Final Rejection Order');
        pdf.line(105 - titleWidth / 2, currentY + 1, 105 + titleWidth / 2, currentY + 1);

        // Introductory paragraph 1
        currentY += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        const p1Lines = pdf.splitTextToSize(this.preamble1(), 184);
        pdf.text(p1Lines, 13, currentY);
        currentY += p1Lines.length * 3.5 + 2;

        // Assessment paragraph 2
        const p2Lines = pdf.splitTextToSize(this.preamble2(), 184);
        pdf.text(p2Lines, 13, currentY);
        currentY += p2Lines.length * 3.5 + 3;
      }

      // Table Header (4 columns: Sr. No, Application ID, Applicant Agency Name, File Status)
      const colSrW = 14;
      const colAppIdW = 32;
      const colStatusW = 32;
      const colNameW = 184 - colSrW - colAppIdW - colStatusW; // 106mm

      pdf.setFillColor(245, 245, 245);
      pdf.rect(13, currentY, 184, 7, 'F');
      pdf.rect(13, currentY, 184, 7);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(20, 20, 20);
      pdf.text('Sr. No', 13 + colSrW / 2, currentY + 4.5, { align: 'center' });
      pdf.text('Application ID', 13 + colSrW + colAppIdW / 2, currentY + 4.5, { align: 'center' });
      pdf.text('Applicant Agency Name', 13 + colSrW + colAppIdW + 3, currentY + 4.5);
      pdf.text('File Status', 13 + colSrW + colAppIdW + colNameW + colStatusW / 2, currentY + 4.5, { align: 'center' });

      currentY += 7;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.2);
      const rowHeight = 6.8;

      pageDef.entries.forEach(item => {
        pdf.rect(13, currentY, 184, rowHeight);
        pdf.line(13 + colSrW, currentY, 13 + colSrW, currentY + rowHeight);
        pdf.line(13 + colSrW + colAppIdW, currentY, 13 + colSrW + colAppIdW, currentY + rowHeight);
        pdf.line(13 + colSrW + colAppIdW + colNameW, currentY, 13 + colSrW + colAppIdW + colNameW, currentY + rowHeight);

        pdf.text(String(item.sNo), 13 + colSrW / 2, currentY + 4.5, { align: 'center' });
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.applicationId, 13 + colSrW + colAppIdW / 2, currentY + 4.5, { align: 'center' });
        pdf.setFont('helvetica', 'normal');

        const cleanName = (item.agencyName || '').slice(0, 60);
        pdf.text(cleanName, 13 + colSrW + colAppIdW + 2, currentY + 4.5);

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(180, 20, 20);
        pdf.text(item.fileStatus || 'Not Eligible', 13 + colSrW + colAppIdW + colNameW + colStatusW / 2, currentY + 4.5, { align: 'center' });
        pdf.setTextColor(20, 20, 20);
        pdf.setFont('helvetica', 'normal');

        currentY += rowHeight;
      });

      if (pageNum === 4) {
        currentY += 4;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.text('This issue with the approval of the competent authority.', 13, currentY);

        currentY += 6;
        pdf.setFont('helvetica', 'bold');
        pdf.text(this.signatoryDesignation(), 197, currentY, { align: 'right' });
        pdf.text(this.schemeSectionName(), 197, currentY + 3.5, { align: 'right' });

        currentY += 7;
        pdf.setDrawColor(30, 30, 30);
        pdf.setLineWidth(0.35);
        pdf.line(13, currentY, 197, currentY);

        currentY += 4;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.text(`File No: ${this.secondFileNo()}`, 13, currentY);
        pdf.text(`Date: ${this.secondDate()}`, 197, currentY, { align: 'right' });

        currentY += 4.5;
        pdf.text('Copy to:-', 13, currentY);
        currentY += 3.5;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        const copies = this.copyToList();
        for (let i = 0; i < copies.length; i++) {
          pdf.text(`${i + 1}. ${copies[i]}`, 15, currentY);
          currentY += 3.2;
        }

        currentY += 2;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.text(this.signatoryDesignation(), 197, currentY, { align: 'right' });
        pdf.text(this.schemeSectionName(), 197, currentY + 3.5, { align: 'right' });

        // Signature box on Page 4
        const sigBoxY = 245;
        pdf.setDrawColor(16, 185, 129);
        pdf.setLineWidth(0.4);
        pdf.setFillColor(240, 253, 244);
        pdf.rect(130, sigBoxY, 67, 28, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(5, 150, 105);
        pdf.text('Signature valid', 133, sigBoxY + 5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.8);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Digitally signed by Shivkesh Jareda', 133, sigBoxY + 9.5);
        pdf.text('Designation: Manager', 133, sigBoxY + 13.5);
        pdf.text('Date: 2026.08.10 17:49:26 IST', 133, sigBoxY + 17.5);
        pdf.text('Reason: Approved', 133, sigBoxY + 21.5);

        pdf.setDrawColor(16, 185, 129);
        pdf.line(133, sigBoxY + 23.5, 194, sigBoxY + 23.5);
        pdf.setFontSize(6);
        pdf.text(`RajKaj Ref No.: ${this.rajKajRefNo() || '23898382'}`, 133, sigBoxY + 26.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(5, 150, 105);
        pdf.text('M e-Sign', 194, sigBoxY + 26.5, { align: 'right' });
      } else {
        // Page 1, 2, 3 running footer signature
        const sigBoxY = 258;
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.3);
        pdf.setFillColor(250, 250, 250);
        pdf.rect(140, sigBoxY, 57, 18, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.8);
        pdf.setTextColor(5, 150, 105);
        pdf.text('Signature valid', 143, sigBoxY + 4.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.2);
        pdf.setTextColor(60, 60, 60);
        pdf.text('Digitally signed by Shivkesh Jareda', 143, sigBoxY + 8.5);
        pdf.text('Designation: Manager', 143, sigBoxY + 12);
        pdf.text('Date: 2026.08.10 17:49:26 IST', 143, sigBoxY + 15.5);
      }

      // Page footer indicator
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${pageNum} of 4`, 15, 282);
    }

    pdf.save(`Final_Rejection_Order_${this.schemeId()}.pdf`);
  }
}
