import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ButtonComponent,
  DocTableDirective,
  DocumentPageComponent,
  IconComponent,
  InputDirective,
  ModalComponent
} from '../../../../shared';
import { formatDate } from '../../../../shared/utils';
import type {
  CommitteeSignatory,
  EmpanelledAgencyItem,
  EmpanelmentOrder
} from '../../models/empanelment-order.model';
import {
  EmpanelmentOrderService,
  DEFAULT_COMMITTEE_MEMBERS
} from '../../services/empanelment-order.service';

const INITIAL_10_COMPANIES: EmpanelledAgencyItem[] = [
  { sNo: 1, applicationId: 'ISMS-REG-2026-8819', agencyName: 'Company 1', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A+' },
  { sNo: 2, applicationId: 'ISMS-REG-2026-8820', agencyName: 'Company 2', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A+' },
  { sNo: 3, applicationId: 'ISMS-REG-2026-8821', agencyName: 'Company 3', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
  { sNo: 4, applicationId: 'ISMS-REG-2026-8822', agencyName: 'Company 4', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
  { sNo: 5, applicationId: 'ISMS-REG-2026-8823', agencyName: 'Company 5', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
  { sNo: 6, applicationId: 'ISMS-REG-2026-8824', agencyName: 'Company 6', category: 'A2(Non-skilling)', fileStatus: 'Eligible', marksGrade: 'B+' },
  { sNo: 7, applicationId: 'ISMS-REG-2026-8825', agencyName: 'Company 7', category: 'A2(Non-skilling)', fileStatus: 'Eligible', marksGrade: 'B+' },
  { sNo: 8, applicationId: 'ISMS-REG-2026-8826', agencyName: 'Company 8', category: 'A2(Non-skilling)', fileStatus: 'Eligible', marksGrade: 'B' },
  { sNo: 9, applicationId: 'ISMS-REG-2026-8827', agencyName: 'Company 9', category: 'A2(Non-skilling)', fileStatus: 'Eligible', marksGrade: 'B' },
  { sNo: 10, applicationId: 'ISMS-REG-2026-8828', agencyName: 'Company 10', category: 'A2(Non-skilling)', fileStatus: 'Eligible', marksGrade: 'B' }
];

const DEFAULT_TERMS: string[] = [
  'The empanelment is strictly valid for Financial Year 2026-2027, subject to continuous compliance with RSLDC guidelines and periodic performance appraisal.',
  'Empaneled agencies must register all sanctioned training centers on the ISMS 2.0 portal with geo-tagged IP CCTV live stream feeds and AEBAS biometric attendance.',
  'Target allocation shall be issued through a separate official Sanction Order post submission of the mandatory Bank Guarantee (Performance Security).',
  'Any discrepancy or false declaration discovered during post-empanelment verification will result in immediate disqualification and de-empanelment without prior notice.'
];

const DEFAULT_COPY_TO: string[] = [
  "PS to Hon'ble Minister, Skill, Employment & Entrepreneurship, Govt. of Rajasthan",
  'PS to Principal Secretary, Skill & Livelihoods Department, Govt. of Rajasthan',
  'PS to Managing Director, Rajasthan Skill & Livelihoods Development Corporation',
  'General Manager (Admin / Operations / Finance), RSLDC',
  'All Concerned Project Implementing Agencies (PIAs) via Email and ISMS Portal',
  'OIC-MIS for immediate web portal publication & IT record',
  'Guard File'
];

@Component({
  selector: 'app-eoi-empanelment-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DocumentPageComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    InputDirective,
    DocTableDirective
  ],
  template: `
    <app-document-page
      title="Official Final Empanelment Order"
      [badge]="isSigned() ? 'Released' : 'Draft'"
      subtitle="Review and edit the empanelment order below, then release it."
      [toast]="toastMessage()"
      (back)="goBack()"
    >
      <!-- Institutional Header on Official Letterhead -->
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-900">
        <div class="flex items-center justify-between gap-4 mb-2">
          <!-- Left Emblem: RSLDC Logo -->
          <div class="w-16 h-16 flex items-center justify-center shrink-0">
            <img src="/rsldc-logo.png" alt="RSLDC Logo" class="w-14 h-14 object-contain" />
          </div>

          <!-- Center Corporation Identity -->
          <div class="text-center grow space-y-1">
            <h2 class="text-base sm:text-xl font-bold tracking-tight font-sans text-slate-900 m-0 uppercase leading-snug">
              {{ headerTitle }}
            </h2>
            <p class="text-xs font-semibold text-slate-700 m-0 font-sans">
              {{ headerSubtitle }}
            </p>
            <p class="text-[11px] text-slate-600 m-0 font-sans leading-tight">
              {{ headerAddress }}
            </p>
            <p class="text-[10.5px] text-slate-500 m-0 font-sans">
              {{ headerContact }}
            </p>
          </div>

          <!-- Right Emblem: Rajasthan Government Seal -->
          <div class="w-16 h-16 flex items-center justify-center shrink-0">
            <img src="/Rajasthan-Sarkar.png" alt="Govt. of Rajasthan" class="w-14 h-14 object-contain" />
          </div>
        </div>
      </div>

      <!-- File Number & Order Date (Editable) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans font-bold mb-5 pb-1">
        <div class="flex items-center gap-2">
          <span class="text-slate-800 shrink-0">File No:</span>
          @if (!isSigned()) {
            <input
              appInput
              size="sm"
              class="w-72 sm:w-96 font-bold text-xs"
              [(ngModel)]="fileNo"
              placeholder="e.g. RSLDC/EOI/SAMARTH/2026-27/1709-15"
            />
          } @else {
            <span class="text-slate-900">{{ fileNo }}</span>
          }
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-800 shrink-0">Date:</span>
          @if (!isSigned()) {
            <input
              appInput
              size="sm"
              class="w-32 font-bold text-right text-xs"
              [(ngModel)]="orderDate"
              placeholder="DD/MM/YYYY"
            />
          } @else {
            <span class="text-slate-900">{{ orderDate }}</span>
          }
        </div>
      </div>

      <!-- Main Document Title -->
      <div class="text-center my-5">
        <h1 class="text-base sm:text-lg font-bold uppercase underline underline-offset-4 tracking-wide font-sans m-0 text-slate-900">
          {{ documentTitle }}
        </h1>
      </div>

      <!-- Subject Block (Editable) -->
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-5 text-xs sm:text-[13px] font-sans">
        <div class="flex flex-col sm:flex-row sm:items-start gap-2">
          <span class="font-bold text-slate-900 shrink-0">Subject:</span>
          @if (!isSigned()) {
            <textarea
              appInput
              size="sm"
              rows="2"
              class="w-full font-medium leading-relaxed text-xs"
              [(ngModel)]="subjectText"
            ></textarea>
          } @else {
            <span class="font-semibold text-slate-800 leading-relaxed">{{ subjectText }}</span>
          }
        </div>
      </div>

      <!-- Preamble Section (Editable) -->
      <div class="text-xs sm:text-[12.5px] leading-relaxed mb-5 space-y-2.5 font-sans text-slate-800">
        @if (!isSigned()) {
          <div class="space-y-2">
            <textarea
              appInput
              size="sm"
              rows="2"
              class="w-full text-xs"
              [(ngModel)]="preamble1"
              placeholder="Preamble paragraph 1..."
            ></textarea>
            <textarea
              appInput
              size="sm"
              rows="2"
              class="w-full text-xs"
              [(ngModel)]="preamble2"
              placeholder="Preamble paragraph 2..."
            ></textarea>
          </div>
        } @else {
          <p class="m-0 text-justify leading-relaxed">{{ preamble1 }}</p>
          <p class="m-0 text-justify leading-relaxed">{{ preamble2 }}</p>
        }
      </div>

      <!-- 10 EMPANELLED ELIGIBLE COMPANIES TABLE (Editable) -->
      <div class="mb-6 space-y-2 font-sans">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-xs sm:text-sm font-bold text-slate-900 m-0 uppercase tracking-tight">
            List of Shortlisted & Empaneled Eligible Agencies ({{ tableRows.length }} PIAs):
          </h3>
          @if (!isSigned()) {
            <button appButton variant="outline" size="xs" (click)="addCompanyRow()">
              <app-icon name="plus" size="xs" />
              <span>Add Agency Row</span>
            </button>
          }
        </div>

        <div class="overflow-x-auto border border-slate-300 rounded shadow-2xs">
          <!-- ui-guard-allow: official printed letter table -->
          <table appDocTable class="w-full text-left border-collapse bg-white">
            <thead class="bg-slate-100 border-b border-slate-300 text-[11.5px] text-slate-800 font-bold uppercase">
              <tr>
                <th class="p-2 border-r border-slate-300 text-center w-14">Sr. No</th>
                <th class="p-2 border-r border-slate-300 text-center min-w-[150px]">Application ID</th>
                <th class="p-2 border-r border-slate-300 min-w-[220px]">Applicant Agency Name</th>
                <th class="p-2 border-r border-slate-300 text-center min-w-[130px]">Category</th>
                <th class="p-2 border-r border-slate-300 text-center min-w-[110px]">File Status</th>
                <th class="p-2 border-r border-slate-300 text-center min-w-[130px]">Category as per marks</th>
                @if (!isSigned()) {
                  <th class="p-2 text-center w-12">Action</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-xs">
              @for (row of tableRows; track row.sNo; let idx = $index) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="p-2 border-r border-slate-200 text-center font-semibold text-slate-600">
                    {{ idx + 1 }}
                  </td>
                  <td class="p-2 border-r border-slate-200 text-center">
                    @if (!isSigned()) {
                      <input
                        appInput
                        size="sm"
                        class="w-full text-center text-xs font-semibold tabular-nums"
                        [(ngModel)]="row.applicationId"
                      />
                    } @else {
                      <span class="font-semibold text-slate-900 tabular-nums">{{ row.applicationId }}</span>
                    }
                  </td>
                  <td class="p-2 border-r border-slate-200">
                    @if (!isSigned()) {
                      <input
                        appInput
                        size="sm"
                        class="w-full text-xs font-medium text-slate-900"
                        [(ngModel)]="row.agencyName"
                        placeholder="Company Name"
                      />
                    } @else {
                      <span class="font-semibold text-slate-900">{{ row.agencyName }}</span>
                    }
                  </td>
                  <td class="p-2 border-r border-slate-200 text-center">
                    @if (!isSigned()) {
                      <input
                        appInput
                        size="sm"
                        class="w-full text-center text-xs"
                        [(ngModel)]="row.category"
                      />
                    } @else {
                      <span class="text-slate-700 text-xs">{{ row.category }}</span>
                    }
                  </td>
                  <td class="p-2 border-r border-slate-200 text-center">
                    @if (!isSigned()) {
                      <input
                        appInput
                        size="sm"
                        class="w-full text-center text-xs font-bold text-emerald-700"
                        [(ngModel)]="row.fileStatus"
                      />
                    } @else {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {{ row.fileStatus }}
                      </span>
                    }
                  </td>
                  <td class="p-2 border-r border-slate-200 text-center">
                    @if (!isSigned()) {
                      <input
                        appInput
                        size="sm"
                        class="w-full text-center text-xs font-bold text-slate-800"
                        [(ngModel)]="row.marksGrade"
                      />
                    } @else {
                      <span class="font-bold text-slate-900 text-xs">{{ row.marksGrade }}</span>
                    }
                  </td>
                  @if (!isSigned()) {
                    <td class="p-2 text-center">
                      <button
                        appButton
                        variant="ghost"
                        size="xs"
                        iconOnly
                        type="button"
                        (click)="removeCompanyRow(idx)"
                        title="Remove agency"
                        [disabled]="tableRows.length <= 1"
                      >
                        <app-icon name="trash" size="xs" class="text-rose-500 hover:text-rose-700" />
                      </button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Terms & Conditions Section (Editable) -->
      <div class="mb-6 space-y-2 font-sans text-xs">
        <div class="flex items-center justify-between gap-2">
          <span class="font-bold text-slate-900 block">General Terms &amp; Conditions:</span>
          @if (!isSigned()) {
            <button appButton variant="ghost" size="xs" (click)="addTermClause()">
              <app-icon name="plus" size="xs" />
              <span>Add Clause</span>
            </button>
          }
        </div>
        <ol class="list-decimal list-inside space-y-1.5 text-slate-800 leading-relaxed pl-1">
          @for (clause of terms; track $index; let cIdx = $index) {
            <li>
              @if (!isSigned()) {
                <div class="inline-flex items-center gap-1.5 w-[94%]">
                  <input
                    appInput
                    size="sm"
                    class="grow text-xs"
                    [value]="clause"
                    (input)="updateTermClause(cIdx, $any($event.target).value)"
                  />
                  <button
                    appButton
                    variant="ghost"
                    size="xs"
                    iconOnly
                    (click)="removeTermClause(cIdx)"
                    title="Remove clause"
                    [disabled]="terms.length <= 1"
                  >
                    <app-icon name="close" size="xs" />
                  </button>
                </div>
              } @else {
                <span>{{ clause }}</span>
              }
            </li>
          }
        </ol>
      </div>

      <!-- Competent Authority Approval Statement -->
      <p class="text-xs sm:text-[12.5px] font-sans font-medium text-slate-800 mb-6 italic">
        This issues with the approval of the competent authority.
      </p>

      <!-- Signatory Block & Digital Signature Stamp -->
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 pt-4 border-t border-slate-200 font-sans">
        <!-- Left: Copy to Recipients -->
        <div class="space-y-1.5 text-xs text-slate-700 max-w-md">
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-slate-900">Copy forwarded for information and necessary action:</span>
            @if (!isSigned()) {
              <button appButton variant="ghost" size="xs" (click)="addCopyItem()">
                <app-icon name="plus" size="xs" />
                <span>Add</span>
              </button>
            }
          </div>
          <ol class="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
            @for (cp of copyToList; track $index; let cpIdx = $index) {
              <li>
                @if (!isSigned()) {
                  <div class="inline-flex items-center gap-1.5 w-[90%]">
                    <input
                      appInput
                      size="sm"
                      class="grow text-xs"
                      [value]="cp"
                      (input)="updateCopyItem(cpIdx, $any($event.target).value)"
                    />
                    <button
                      appButton
                      variant="ghost"
                      size="xs"
                      iconOnly
                      (click)="removeCopyItem(cpIdx)"
                      title="Remove recipient"
                    >
                      <app-icon name="close" size="xs" />
                    </button>
                  </div>
                } @else {
                  <span>{{ cp }}</span>
                }
              </li>
            }
          </ol>
        </div>

        <!-- Right: Official Signatory Box -->
        <div class="shrink-0 text-right">
          @if (isSigned()) {
            <!-- Official Green RajKaj E-Sign Seal -->
            <div class="border-2 border-emerald-600 bg-emerald-50/90 p-3 rounded-lg text-left inline-block w-64 shadow-xs text-xs text-slate-800">
              <div class="font-bold text-emerald-800 text-[11px] flex items-center gap-1.5 mb-1">
                <app-icon name="check-circle" size="xs" class="text-emerald-700" />
                <span>Signature Valid &amp; Authenticated</span>
              </div>
              <p class="m-0 leading-snug text-[10.5px]">Digitally signed by <strong>{{ signatoryName }}</strong></p>
              <p class="m-0 leading-snug text-[10px] text-slate-600">{{ signatoryDesignation }}, RSLDC</p>
              <p class="m-0 leading-snug text-[10px] text-slate-600">Signed: {{ signedAt() }}</p>
              <div class="mt-1.5 pt-1.5 border-t border-emerald-300 flex items-center justify-between text-[9px] text-emerald-900 font-semibold">
                <span>RajKaj Ref: {{ rajKajRefNo() }}</span>
                <span class="px-1.5 py-0.5 rounded bg-emerald-200/80">Committee Approved</span>
              </div>
            </div>
          } @else {
            <!-- Pending Signature Placeholder Box -->
            <div class="border border-dashed border-slate-400 bg-slate-50 p-3 rounded-lg text-left inline-block w-64 text-xs text-slate-600">
              <div class="font-semibold text-slate-700 text-[11px] flex items-center gap-1.5 mb-1">
                <app-icon name="shield-check" size="xs" class="text-slate-500" />
                <span>Digital E-Sign Pending</span>
              </div>
              <p class="m-0 text-[10.5px] font-bold text-slate-800">{{ signatoryName }}</p>
              <p class="m-0 text-[10px] text-slate-600">{{ signatoryDesignation }}</p>
              <p class="m-0 text-[9.5px] text-slate-500 mt-1">Requires 4 committee signatories authentication</p>
            </div>
          }
        </div>
      </div>

      <!-- Action Buttons Bar -->
      <ng-container actions>
        @if (!isSigned()) {
          <button appButton variant="outline" size="lg" (click)="saveDraft()" title="Save current draft order">
            <app-icon name="clipboard-check" size="sm" />
            <span>Save</span>
          </button>
          <button appButton size="lg" (click)="openEsignModal()" title="Complete committee E-Sign authentication">
            <app-icon name="shield-check" size="sm" />
            <span>E-Sign</span>
          </button>
        } @else {
          <button appButton variant="outline" size="lg" (click)="printOrder()">
            <app-icon name="print" size="sm" />
            <span>Print</span>
          </button>
          <button appButton variant="outline" size="lg" (click)="downloadPdf()">
            <app-icon name="download" size="sm" />
            <span>Download PDF</span>
          </button>
          <button appButton size="lg" (click)="goBack()">
            <app-icon name="check" size="sm" />
            <span>Back to Responses</span>
          </button>
        }
      </ng-container>

      <!-- Multi-Party Committee E-Sign Authentication Modal -->
      @if (showEsign()) {
        <div overlay>
          <app-modal
            title="Committee Multi-Party E-Sign Authentication"
            subtitle="Sequential Aadhaar / SSO OTP verification for all 4 committee members"
            size="lg"
            (close)="closeEsignModal()"
          >
            <div class="space-y-4">
              <!-- Committee Contacts Status Indicator -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                @for (member of committeeMembers(); track member.id; let idx = $index) {
                  <div
                    class="p-2.5 rounded-lg border flex items-center justify-between gap-2"
                    [class]="member.otpVerified ? 'bg-emerald-50 border-emerald-200' : (idx === activeSignatoryIndex() ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-slate-50 border-slate-200 opacity-70')"
                  >
                    <div class="truncate">
                      <p class="font-semibold text-slate-900 truncate m-0">{{ member.name }}</p>
                      <p class="text-[11px] text-slate-600 truncate m-0">{{ member.role }}</p>
                    </div>
                    @if (member.otpVerified) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        <app-icon name="check-circle" size="xs" />
                        <span>Verified</span>
                      </span>
                    } @else if (idx === activeSignatoryIndex()) {
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

              <!-- Active Member OTP Entry Block -->
              @if (currentSignatory(); as cur) {
                <div class="p-4 rounded-xl border border-slate-300 bg-white shadow-2xs space-y-3">
                  <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span class="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider">
                        Step {{ activeSignatoryIndex() + 1 }} of {{ committeeMembers().length }}: Committee Member Signatory
                      </span>
                      <h4 class="text-sm font-bold text-slate-900 m-0 mt-0.5">{{ cur.name }}</h4>
                      <p class="text-xs text-slate-600 m-0">{{ cur.designation }} &bull; {{ cur.role }}</p>
                    </div>
                    <div class="text-right text-xs text-slate-600">
                      <p class="tabular-nums text-[11px] font-medium m-0">{{ cur.mobile }}</p>
                      <p class="text-[11px] text-slate-500 m-0">{{ cur.email }}</p>
                    </div>
                  </div>

                  <!-- Test Helper & Notice -->
                  <div class="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <app-icon name="info" size="xs" class="shrink-0 text-blue-700" />
                      <span>OTP sent to registered mobile. (Test OTP: <strong>123456</strong>)</span>
                    </div>
                    <button appButton variant="ghost" size="xs" (click)="fillTestOtp()" class="shrink-0 font-semibold">
                      Auto-fill OTP
                    </button>
                  </div>

                  <!-- OTP Input Control -->
                  <div class="space-y-1.5 pt-1">
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
                        size="sm"
                        [disabled]="currentOtp.trim().length < 6"
                        (click)="verifyCurrentOtp()"
                      >
                        <app-icon name="check" size="xs" />
                        <span>Verify OTP &amp; Proceed</span>
                      </button>
                    </div>
                    @if (otpError()) {
                      <p class="text-xs text-rose-600 font-medium m-0">{{ otpError() }}</p>
                    }
                  </div>
                </div>
              }

              <!-- All Signatories Authenticated Message -->
              @if (allSignatoriesVerified()) {
                <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <app-icon name="check-circle" size="sm" class="text-emerald-700 shrink-0" />
                  <span>All {{ committeeMembers().length }} committee signatories have successfully authenticated. Document is ready to be released.</span>
                </div>
              }
            </div>

            <ng-container modalFooter>
              <button
                appButton
                size="md"
                class="w-full sm:w-auto"
                [disabled]="!allSignatoriesVerified()"
                (click)="releaseOrder()"
              >
                <app-icon name="shield-check" size="sm" />
                <span>Released Order</span>
              </button>
            </ng-container>
          </app-modal>
        </div>
      }
    </app-document-page>
  `
})
export class EoiEmpanelmentEditorComponent implements OnInit {
  private empanelmentOrderService = inject(EmpanelmentOrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  schemeId = signal<string>('MMKVY-01');
  schemeName = signal<string>('Mukhya Mantri Kaushal Vikas Karyakram (MMKVY)');
  eoiRefNo = signal<string>('RSLDC/EOI/2026/MMKVY-01');
  toastMessage = signal<string>('');
  showEsign = signal<boolean>(false);
  isSigned = signal<boolean>(false);
  signedAt = signal<string>('');
  rajKajRefNo = signal<string>('');

  // Header Details
  headerTitle = 'Rajasthan Skill and Livelihoods Development Corporation';
  headerSubtitle = '(A Government of Rajasthan Enterprise)';
  headerAddress = 'EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur-302004 (Rajasthan)';
  headerContact = 'Phone: 0141-5103246 / 2705600 | Website: livelihoods.rajasthan.gov.in';

  // Document Fields
  fileNo = 'RSLDC/EOI/SAMARTH/2026-27/1709-15';
  orderDate = formatDate(new Date());
  documentTitle = 'FINAL EMPANELMENT ORDER';
  subjectText = 'Empanelment order against EOI published on 22.01.2026 under MMKVY Category III SAMARTH for FY 2026-2027.';
  preamble1 = 'An Expression of Interest (EOI) was published under Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH scheme for empanelment of Project Implementing Agencies (PIAs).';
  preamble2 = 'Pursuant to the evaluation and De Novo Assessment process, the following agencies are hereby shortlisted and empaneled under SAMARTH scheme for FY 2026-2027.';

  // 10 Companies Table Rows (Editable)
  tableRows: EmpanelledAgencyItem[] = [...INITIAL_10_COMPANIES];

  // Clauses & Copy To
  terms: string[] = [...DEFAULT_TERMS];
  copyToList: string[] = [...DEFAULT_COPY_TO];

  // Signatory
  signatoryName = 'Rishav Mandal, I.A.S.';
  signatoryDesignation = 'Managing Director';

  // Multi-Party Committee Members for E-Sign
  committeeMembers = signal<CommitteeSignatory[]>([
    ...DEFAULT_COMMITTEE_MEMBERS.map(m => ({ ...m, otpVerified: false, otpSent: false }))
  ]);
  activeSignatoryIndex = signal<number>(0);
  currentOtp = '';
  otpError = signal<string>('');

  readonly currentSignatory = computed(() => {
    const list = this.committeeMembers();
    const idx = this.activeSignatoryIndex();
    return idx < list.length ? list[idx] : null;
  });

  readonly allSignatoriesVerified = computed(() => {
    return this.committeeMembers().every(m => m.otpVerified);
  });

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      this.schemeId.set(sId);
      this.loadOrderData(sId);
    });
  }

  private loadOrderData(sId: string): void {
    this.empanelmentOrderService.getOrderBySchemeId(sId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(existing => {
      if (existing) {
        this.schemeName.set(existing.schemeName || this.schemeName());
        this.eoiRefNo.set(existing.eoiRefNo || this.eoiRefNo());
        this.fileNo = existing.fileNo || this.fileNo;
        this.orderDate = existing.orderDate || this.orderDate;
        this.subjectText = existing.subject || this.subjectText;
        if (existing.empanelledAgencies && existing.empanelledAgencies.length > 0) {
          this.tableRows = existing.empanelledAgencies.slice(0, 10).map((a, i) => ({
            ...a,
            sNo: i + 1,
            agencyName: a.agencyName || `Company ${i + 1}`
          }));
        }
        if (existing.status === 'E_SIGNED') {
          this.isSigned.set(true);
          this.signedAt.set(existing.signedAt || '25/11/2026 11:30:00 IST');
          this.rajKajRefNo.set(existing.rajKajRefNo || '23898348');
        }
      }
    });
  }

  addCompanyRow(): void {
    const nextIdx = this.tableRows.length + 1;
    this.tableRows.push({
      sNo: nextIdx,
      applicationId: `ISMS-REG-2026-${8820 + nextIdx}`,
      agencyName: `Company ${nextIdx}`,
      category: 'A1(skilling)',
      fileStatus: 'Eligible',
      marksGrade: 'A'
    });
  }

  removeCompanyRow(index: number): void {
    if (this.tableRows.length > 1) {
      this.tableRows.splice(index, 1);
      this.tableRows.forEach((r, idx) => (r.sNo = idx + 1));
    }
  }

  addTermClause(): void {
    this.terms.push('New statutory clause inserted by State Empanelment Committee.');
  }

  updateTermClause(index: number, value: string): void {
    if (index >= 0 && index < this.terms.length) {
      this.terms[index] = value;
    }
  }

  removeTermClause(index: number): void {
    if (this.terms.length > 1) {
      this.terms.splice(index, 1);
    }
  }

  addCopyItem(): void {
    this.copyToList.push('New designated department authority / official');
  }

  updateCopyItem(index: number, value: string): void {
    if (index >= 0 && index < this.copyToList.length) {
      this.copyToList[index] = value;
    }
  }

  removeCopyItem(index: number): void {
    this.copyToList.splice(index, 1);
  }

  saveDraft(): void {
    const order = this.buildOrderModel('DRAFT');
    this.empanelmentOrderService.saveOrder(order);
    this.showToast('Draft order saved successfully.');
  }

  openEsignModal(): void {
    this.currentOtp = '';
    this.otpError.set('');
    this.showEsign.set(true);
  }

  closeEsignModal(): void {
    this.showEsign.set(false);
  }

  fillTestOtp(): void {
    this.currentOtp = '123456';
    this.otpError.set('');
  }

  verifyCurrentOtp(): void {
    const cur = this.currentSignatory();
    if (!cur) return;

    if (this.currentOtp.trim() !== '123456' && this.currentOtp.trim().length !== 6) {
      this.otpError.set('Invalid OTP. Please enter the valid 6-digit verification code.');
      return;
    }

    // Mark current committee member as verified
    this.committeeMembers.update(list =>
      list.map((m, i) => (i === this.activeSignatoryIndex() ? { ...m, otpVerified: true } : m))
    );

    this.currentOtp = '';
    this.otpError.set('');

    // Advance to next committee signatory if pending
    const nextIdx = this.activeSignatoryIndex() + 1;
    if (nextIdx < this.committeeMembers().length) {
      this.activeSignatoryIndex.set(nextIdx);
    }
  }

  releaseOrder(): void {
    if (!this.allSignatoriesVerified()) return;

    const refNo = `RK-EMP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nowStr = `${formatDate(new Date())} ${new Date().toLocaleTimeString('en-IN')} IST`;

    this.rajKajRefNo.set(refNo);
    this.signedAt.set(nowStr);
    this.isSigned.set(true);
    this.showEsign.set(false);

    const releasedOrder = this.buildOrderModel('E_SIGNED');
    this.empanelmentOrderService.saveOrder(releasedOrder);

    this.showToast('Empanelment Order released and published.', () => {
      this.goBack();
    });
  }

  printOrder(): void {
    window.print();
  }

  downloadPdf(): void {
    const order = this.buildOrderModel(this.isSigned() ? 'E_SIGNED' : 'DRAFT');
    void this.empanelmentOrderService.openOrderPdf(order, 'EMPANELMENT');
  }

  goBack(): void {
    const sId = this.schemeId();
    this.router.navigate(['/admin/responses', sId || 'ALL']);
  }

  private buildOrderModel(status: 'DRAFT' | 'E_SIGNED'): EmpanelmentOrder {
    const sId = this.schemeId() || 'MMKVY-01';
    return {
      id: `ORD-${sId}`,
      schemeId: sId,
      schemeName: this.schemeName(),
      eoiRefNo: this.eoiRefNo(),
      fileNo: this.fileNo,
      orderDate: this.orderDate,
      status: status,
      signedAt: this.signedAt() || undefined,
      rajKajRefNo: this.rajKajRefNo() || undefined,
      subject: this.subjectText,
      preamble1: this.preamble1,
      preamble2: this.preamble2,
      issuingAuthority: {
        name: this.signatoryName,
        designation: this.signatoryDesignation,
        department: 'Rajasthan Skill & Livelihoods Development Corporation'
      },
      copyToList: [...this.copyToList],
      committeeMembers: this.committeeMembers(),
      empanelledAgencies: this.tableRows.map((r, idx) => ({ ...r, sNo: idx + 1 })),
      rejectedAgencies: [],
      createdAt: this.orderDate
    };
  }

  private showToast(message: string, afterwards?: () => void): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set('');
      afterwards?.();
    }, afterwards ? 1400 : 2000);
  }
}
