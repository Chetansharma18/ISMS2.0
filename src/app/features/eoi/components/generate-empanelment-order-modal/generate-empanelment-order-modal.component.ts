import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatDate } from '../../../../shared/utils';
import type { ApplicantResponse } from '../../services/eoi-state.service';
import type { EmpanelmentOrder } from '../../models/empanelment-order.model';
import { EmpanelmentOrderService, DEFAULT_COMMITTEE_MEMBERS } from '../../services/empanelment-order.service';
import { ALL_253_EMPANELLED_AGENCIES } from '../../data/empanelment-order-253.data';
import { ALL_78_REJECTED_AGENCIES } from '../../data/rejection-order-78.data';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-generate-empanelment-order-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    IconComponent
  ],
  template: `
    <app-modal
      title="Generate Implement Order"
      subtitle="Select outcome to generate and issue the official order"
      size="md"
      (close)="close.emit()"
    >
      <div class="py-10 px-4 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
        <!-- Approved Button -->
        <button
          appButton
          variant="primary"
          size="lg"
          class="w-full sm:w-48 justify-center font-semibold"
          (click)="onApprovedClick()"
        >
          <app-icon name="check-circle" size="md" />
          <span>Approved</span>
        </button>

        <!-- Rejected Button -->
        <button
          appButton
          variant="danger"
          size="lg"
          class="w-full sm:w-48 justify-center font-semibold"
          (click)="onRejectedClick()"
        >
          <app-icon name="ban" size="md" />
          <span>Rejected</span>
        </button>
      </div>

      <ng-container modalFooter>
        <button appButton variant="outline" size="sm" (click)="close.emit()">
          <span>Cancel</span>
        </button>
      </ng-container>
    </app-modal>
  `
})
export class GenerateEmpanelmentOrderModalComponent {
  private empanelmentOrderService = inject(EmpanelmentOrderService);

  readonly schemeId = input<string>('MMKVY-01');
  readonly schemeName = input<string>('Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)');
  readonly eoiRefNo = input<string>('RSLDC/EOI/2026/MMKVY-01');
  readonly currentApplicants = input<ApplicantResponse[]>([]);

  readonly close = output<void>();
  readonly orderGenerated = output<EmpanelmentOrder>();
  readonly viewEmpanelmentOrder = output<EmpanelmentOrder>();
  readonly viewRejectionOrder = output<EmpanelmentOrder>();

  private getOrCreateOrder(): EmpanelmentOrder {
    const sId = this.schemeId() || 'MMKVY-01';
    let existingOrder: EmpanelmentOrder | undefined;
    this.empanelmentOrderService.getOrderBySchemeId(sId).subscribe(o => (existingOrder = o)).unsubscribe();
    if (!existingOrder) {
      this.empanelmentOrderService.getOrders().subscribe(list => (existingOrder = list[0])).unsubscribe();
    }

    const applicants = this.currentApplicants();
    const empanelled = applicants
      .filter(a => a.status === 'APPROVED' || a.statusDisplay === 'Approved')
      .map((a, i) => ({
        sNo: i + 1,
        applicationId: a.regNumber || a.id,
        agencyName: a.anonymousLabel || a.actualLegalName || `Agency ${i + 1}`,
        category: 'A1(skilling)',
        fileStatus: 'Eligible' as const,
        marksGrade: a.evaluationGrade || 'A'
      }));

    const rejected = applicants
      .filter(a => a.status === 'REJECTED' || a.statusDisplay === 'Rejected')
      .map((a, i) => ({
        sNo: i + 1,
        applicationId: a.regNumber || a.id,
        agencyName: a.anonymousLabel || a.actualLegalName || `Agency ${i + 1}`,
        fileStatus: 'Not Eligible' as const,
        reason: a.evaluationRemarks || 'Statutory eligibility criteria not met'
      }));

    const baseOrder: EmpanelmentOrder = {
      id: `ORD-${sId}`,
      schemeId: sId,
      schemeName: this.schemeName() || 'Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH',
      eoiRefNo: this.eoiRefNo() || 'RSLDC/EOI/SAMARTH/2026-27/1709-15',
      fileNo: 'F () RSLDC/EOI/SAMARTH/2026-27/1709-15',
      orderDate: '01/08/2026',
      status: 'DRAFT',
      signedAt: '',
      rajKajRefNo: '23898348',
      issuingAuthority: {
        name: 'Rishav Mandal',
        designation: 'Managing Director, I.A.S.',
        department: 'Rajasthan Skill & Livelihoods Development Corporation'
      },
      subject: 'Empanelment order against EOI published on 22.01.2026 under MMKVY Category III SAMARTH for FY 2026-2027',
      preamble1: 'An Expression of Interest (EOI) was published on 22 January 2026 under Mukhya Mantri Kaushal Vikas Karyakram (MMKVY) category III SAMARTH scheme for empanelment of Project Implementing Agencies (PIAs).',
      preamble2: 'Pursuant to the evaluation and De Novo Assessment process, the following 253 agencies are hereby shortlisted and empaneled under SAMARTH scheme for FY 2026-2027.',
      approvalClause: 'List of empaneled agencies are as following:',
      signatoryName: 'Rishav Mandal',
      signatoryDesignation: 'Managing Director, I.A.S.',
      copyToList: [
        "PS to Hon'ble Minister, DSEE",
        'PS to ACS, DSEE',
        'PS to Managing Director, RSLDC',
        'General Manager-I, RSLDC',
        'CAO, RSLDC',
        'Program Manager, PMCA',
        'OIC-MIS (to upload on website portal)',
        'Concerned Agencies (via email)',
        'Guard file'
      ],
      committeeMembers: DEFAULT_COMMITTEE_MEMBERS.map(m => ({ ...m, otpSent: false, otpVerified: false })),
      empanelledAgencies: ALL_253_EMPANELLED_AGENCIES,
      rejectedAgencies: ALL_78_REJECTED_AGENCIES,
      createdAt: formatDate(new Date())
    };

    this.empanelmentOrderService.saveOrder(baseOrder);
    this.orderGenerated.emit(baseOrder);
    return baseOrder;
  }

  onApprovedClick(): void {
    const order = this.getOrCreateOrder();
    this.viewEmpanelmentOrder.emit(order);
  }

  onRejectedClick(): void {
    const order = this.getOrCreateOrder();
    const rejectionOrder: EmpanelmentOrder = {
      ...order,
      fileNo: 'F ( ) RSLDC/Skills/SAMARTH/ EOI/2026-2027/1775-82',
      orderDate: '10/08/2026',
      rejectionSubject: 'Final Rejection Order against EOI No. RSLDC/EOI/MMKVY-Cat. I/II/III/2026-27/01 published on 22nd January 2026 under SAMARTH Scheme.',
      rejectionPreamble1: 'This bears to the reference of EOI No. RSLDC/EOI/MMKVY-Cat. I/II/III/2026-27/01 published on 22nd January 2026 under SAMARTH Scheme.',
      rejectionPreamble2: 'As per recommendations of the Desk Appraisal Committee followed by the De Novo Assessment process, proposals submitted by following agencies are not found eligible as per the criteria laid down in EOI:',
      rejectionSignatoryName: 'Shivkesh Jareda',
      rejectionSignatoryDesignation: 'Scheme OIC',
      rejectedAgencies: ALL_78_REJECTED_AGENCIES
    };
    this.empanelmentOrderService.saveOrder(rejectionOrder);
    this.viewRejectionOrder.emit(rejectionOrder);
  }
}
