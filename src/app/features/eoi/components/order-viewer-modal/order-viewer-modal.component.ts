import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import {
  ButtonComponent,
  DocTableDirective,
  IconComponent,
  ModalComponent
} from '../../../../shared';
import type { EmpanelmentOrder } from '../../models/empanelment-order.model';

@Component({
  selector: 'app-order-viewer-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ModalComponent, ButtonComponent, IconComponent, DocTableDirective],
  template: `
    <app-modal
      [title]="orderTitle()"
      [subtitle]="order()?.schemeName || ''"
      size="2xl"
      [showClose]="false"
      (close)="close.emit()"
    >
      <div id="printable-order" class="bg-white p-6 sm:p-8 text-slate-900 border border-slate-200 rounded-lg shadow-2xs max-h-[72vh] overflow-y-auto">
        <!-- Official Government Header -->
        <div class="text-center border-b-2 border-slate-800 pb-4 mb-4">
          <div class="flex items-center justify-between gap-4 mb-2">
            <!-- Left Official Emblem -->
            <div class="w-14 h-14 flex items-center justify-center shrink-0">
              <img
                src="/Rajasthan-Sarkar.png"
                alt="Government of Rajasthan"
                class="w-12 h-12 object-contain"
              />
            </div>

            <!-- Central Heading -->
            <div class="text-center grow">
              <h2 class="text-base sm:text-lg font-bold tracking-tight uppercase font-sans text-slate-900">
                Rajasthan Skill and Livelihoods Development Corporation
              </h2>
              <p class="text-xs font-sans text-slate-600 mt-0.5">
                Kaushal Bhawan, EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur-302004 (Rajasthan)
              </p>
              <p class="text-[11px] font-sans text-slate-500">
                Phone: 0141-5103246 / 2705600 | Website: livelihoods.rajasthan.gov.in
              </p>
            </div>

            <!-- Right Official Logo -->
            <div class="w-14 h-14 flex items-center justify-center shrink-0">
              <img
                src="/rsldc-logo.png"
                alt="RSLDC Jaipur"
                class="w-12 h-12 object-contain"
              />
            </div>
          </div>

          <!-- File No & Date -->
          <div class="flex items-center justify-between text-xs font-sans font-bold pt-2 border-t border-slate-300">
            <span>File No: {{ order()?.fileNo }}</span>
            <span>Date: {{ order()?.orderDate }}</span>
          </div>
        </div>

        <!-- Document Main Title -->
        <div class="text-center my-5">
          <h1 class="text-base sm:text-xl font-bold uppercase underline underline-offset-4 font-sans tracking-wide">
            {{ isEmpanelment() ? 'Final Empanelment Order' : 'Final Rejection Order' }}
          </h1>
        </div>

        <!-- Subject Line -->
        <div class="text-xs sm:text-sm font-sans mb-4 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
          <p>
            <strong>Subject:</strong>
            @if (isEmpanelment()) {
              {{ order()?.subject || ('Empanelment order against EOI Ref No. ' + (order()?.eoiRefNo || '') + ' under ' + (order()?.schemeName || '') + ' for FY 2026-2027.') }}
            } @else {
              {{ order()?.rejectionSubject || ('Final Rejection & Disqualification Order against EOI Ref No. ' + (order()?.eoiRefNo || '') + ' under ' + (order()?.schemeName || '') + '.') }}
            }
          </p>
        </div>

        <!-- Preamble text matching state order standard -->
        <div class="text-xs sm:text-sm text-slate-800 leading-relaxed mb-4 text-justify font-sans space-y-2">
          @if (isEmpanelment()) {
            <p class="indent-6">
              {{ order()?.preamble1 || ('An Expression of Interest (EOI) was published under ' + (order()?.schemeName || '') + ' for empanelment of Project Implementing Agencies (PIAs) / Training Partners.') }}
            </p>
            <p class="indent-6">
              {{ order()?.preamble2 || 'Pursuant to technical evaluation, scrutiny of submitted statutory credentials, and the State Empanelment Committee appraisal process, the following agencies are hereby shortlisted and empaneled under the scheme for Financial Year 2026-2027:' }}
            </p>
          } @else {
            <p class="indent-6">
              {{ order()?.rejectionPreamble1 || ('This bears reference to the technical proposal dossiers submitted under ' + (order()?.schemeName || '') + ' (EOI Ref No. ' + (order()?.eoiRefNo || '') + ').') }}
            </p>
            <p class="indent-6">
              {{ order()?.rejectionPreamble2 || 'As per recommendations of the Desk Appraisal Committee followed by the De Novo Assessment process, proposals submitted by following agencies are not found eligible as per the statutory criteria laid down in EOI:' }}
            </p>
          }
        </div>

        <!-- Candidates Table -->
        <div class="border border-slate-800 mb-6 font-sans">
          @if (isEmpanelment()) {
            <table appDocTable class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100 font-bold border-b border-slate-800 text-slate-900">
                <tr>
                  <th class="p-2 border-r border-slate-800 text-center w-12">Sr. No</th>
                  <th class="p-2 border-r border-slate-800 w-36">Application ID</th>
                  <th class="p-2 border-r border-slate-800">Applicant Agency Name</th>
                  <th class="p-2 border-r border-slate-800 text-center w-28">Category</th>
                  <th class="p-2 border-r border-slate-800 text-center w-24">File Status</th>
                  <th class="p-2 text-center w-28">Category as per marks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-400">
                @for (agency of order()?.empanelledAgencies; track agency.applicationId; let idx = $index) {
                  <tr>
                    <td class="p-2 border-r border-slate-400 text-center">{{ agency.sNo || idx + 1 }}</td>
                    <td class="p-2 border-r border-slate-400 font-semibold">{{ agency.applicationId }}</td>
                    <td class="p-2 border-r border-slate-400 font-medium">{{ agency.agencyName }}</td>
                    <td class="p-2 border-r border-slate-400 text-center">{{ agency.category || 'A1(skilling)' }}</td>
                    <td class="p-2 border-r border-slate-400 text-center font-bold text-emerald-800">Eligible</td>
                    <td class="p-2 text-center font-bold">{{ agency.marksGrade || 'A' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="p-4 text-center text-slate-500">No empanelled agencies listed.</td>
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
                @for (agency of order()?.rejectedAgencies; track agency.applicationId; let idx = $index) {
                  <tr>
                    <td class="p-2 border-r border-slate-400 text-center">{{ agency.sNo || idx + 1 }}</td>
                    <td class="p-2 border-r border-slate-400 font-semibold">{{ agency.applicationId }}</td>
                    <td class="p-2 border-r border-slate-400 font-medium">{{ agency.agencyName }}</td>
                    <td class="p-2 border-r border-slate-400 text-center font-bold text-rose-800">Not Eligible</td>
                    <td class="p-2 text-slate-700">{{ agency.reason }}</td>
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
        <p class="text-xs font-sans text-slate-800 mb-8 font-medium">
          {{ order()?.approvalClause || 'This issue with the approval of the competent authority.' }}
        </p>

        <!-- Signatory & Digital Signature Box -->
        <div class="flex items-end justify-between gap-4 font-sans border-t border-slate-300 pt-4">
          <!-- Left: Copy To List -->
          <div class="text-[11px] text-slate-600 max-w-xs leading-normal">
            <span class="font-bold text-slate-800 block mb-1">Copy to:</span>
            <ol class="list-decimal pl-4 space-y-0.5">
              @for (item of order()?.copyToList; track item) {
                <li>{{ item }}</li>
              }
            </ol>
          </div>

          <!-- Right: Digital Signature Seal -->
          <div class="text-right">
            <!-- Official Signer Title -->
            <div class="mb-3">
              <span class="font-bold text-sm text-slate-900 block">
                {{ isEmpanelment() ? (order()?.signatoryName || 'Managing Director') : (order()?.rejectionSignatoryName || 'Scheme OIC') }}
              </span>
              <span class="text-xs text-slate-600 block">
                {{ isEmpanelment() ? (order()?.signatoryDesignation || 'RSLDC (Govt. of Rajasthan)') : (order()?.rejectionSignatoryDesignation || (order()?.schemeName || '')) }}
              </span>
            </div>

            <!-- RajKaj Digital Signature Box matching scanned PDF -->
            <div class="border-2 border-emerald-600 bg-emerald-50/70 p-2.5 rounded text-left inline-block w-52 tabular-nums text-[10px] text-slate-800 relative">
              <div class="font-bold text-emerald-800 text-xs flex items-center gap-1 mb-1">
                <app-icon name="check-circle" size="xs" />
                <span>Signature Valid</span>
              </div>
              <div class="text-slate-700 leading-tight space-y-0.5 font-sans">
                <p>Digitally signed by <strong>{{ isEmpanelment() ? 'Rishav Mandal' : 'Shivkesh Jareda' }}</strong></p>
                <p>Designation: <strong>{{ isEmpanelment() ? 'Managing Director' : 'Scheme OIC' }}</strong></p>
                <p>Date: {{ order()?.signedAt || order()?.orderDate }}</p>
                <p>Reason: <strong>Approved & Issued</strong></p>
              </div>
              <div class="mt-2 pt-1.5 border-t border-emerald-300 flex items-center justify-between text-[9px] text-slate-500">
                <span>RajKaj Ref: {{ order()?.rajKajRefNo || '23898348' }}</span>
                <span class="font-bold text-emerald-800">M e-Sign</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-container modalFooter>
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
      </ng-container>
    </app-modal>
  `
})
export class OrderViewerModalComponent {
  readonly order = input<EmpanelmentOrder | null>(null);
  readonly orderType = input<'EMPANELMENT' | 'REJECTION'>('EMPANELMENT');
  readonly close = output<void>();

  isEmpanelment = computed(() => this.orderType() === 'EMPANELMENT');
  orderTitle = computed(() => (this.isEmpanelment() ? 'Official Final Empanelment Order' : 'Official Final Rejection Order'));

  printOrder(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  downloadPdf(): void {
    const o = this.order();
    if (!o) return;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const isEmp = this.isEmpanelment();

    // Border
    pdf.setDrawColor(30, 41, 59);
    pdf.setLineWidth(0.35);
    pdf.rect(10, 10, 190, 277);

    // Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION', 105, 18, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text('Kaushal Bhawan, EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur-302004 (Rajasthan)', 105, 23, { align: 'center' });

    pdf.setDrawColor(148, 163, 184);
    pdf.line(15, 27, 195, 27);

    // File No & Date
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`File No: ${o.fileNo}`, 15, 32);
    pdf.text(`Date: ${o.orderDate}`, 195, 32, { align: 'right' });

    // Document Title
    let y = 42;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(11, 53, 88);
    pdf.text(isEmp ? 'FINAL EMPANELMENT ORDER' : 'FINAL REJECTION ORDER', 105, y, { align: 'center' });

    // Subject
    y += 8;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(15, y, 180, 12, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Subject:', 18, y + 4.5);
    pdf.setFont('helvetica', 'normal');
    const subj = isEmp
      ? `Empanelment order against EOI Ref No. ${o.eoiRefNo} under ${o.schemeName} for FY 2026-27.`
      : `Rejection order against EOI Ref No. ${o.eoiRefNo} under ${o.schemeName}.`;
    const subjSplit = pdf.splitTextToSize(subj, 160);
    pdf.text(subjSplit, 32, y + 4.5);

    // Table Header
    y += 18;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(15, y, 180, 7, 'F');
    pdf.setDrawColor(148, 163, 184);
    pdf.rect(15, y, 180, 7);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text('Sr. No', 18, y + 4.5);
    pdf.text('Application ID', 35, y + 4.5);
    pdf.text('Applicant Agency Name', 75, y + 4.5);

    if (isEmp) {
      pdf.text('Category', 135, y + 4.5);
      pdf.text('File Status', 155, y + 4.5);
      pdf.text('Grade', 180, y + 4.5);
    } else {
      pdf.text('File Status', 135, y + 4.5);
      pdf.text('Reason for Rejection', 155, y + 4.5);
    }

    // Rows
    y += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);

    const agencies = isEmp ? o.empanelledAgencies : o.rejectedAgencies;
    agencies.forEach((item, idx) => {
      if (y > 230) {
        pdf.addPage();
        y = 20;
      }
      pdf.rect(15, y, 180, 6);
      pdf.text(String(item.sNo || idx + 1), 18, y + 4);
      pdf.text(item.applicationId, 35, y + 4);
      pdf.text(item.agencyName.slice(0, 32), 75, y + 4);

      if (isEmp) {
        const empItem = item as any;
        pdf.text(empItem.category || 'A1(skilling)', 135, y + 4);
        pdf.text('Eligible', 155, y + 4);
        pdf.text(empItem.marksGrade || 'A', 180, y + 4);
      } else {
        const rejItem = item as any;
        pdf.text('Not Eligible', 135, y + 4);
        pdf.text((rejItem.reason || '').slice(0, 22), 155, y + 4);
      }
      y += 6;
    });

    // Signatory
    y = Math.max(y + 10, 245);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.text(isEmp ? 'Managing Director' : 'Scheme OIC', 195, y, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text('RSLDC, Jaipur (Govt. of Rajasthan)', 195, y + 4.5, { align: 'right' });
    pdf.text(`RajKaj e-Sign Ref: ${o.rajKajRefNo || '23898348'} | Verified`, 195, y + 9, { align: 'right' });

    pdf.save(`${isEmp ? 'Empanelment_Order' : 'Rejection_Order'}_${o.schemeId}.pdf`);
  }
}
