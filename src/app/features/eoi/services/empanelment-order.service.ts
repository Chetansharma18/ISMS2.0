import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import { formatDate } from '../../../shared/utils';
import type { CommitteeSignatory, EmpanelmentOrder } from '../models/empanelment-order.model';
import { EoiStorage } from './eoi-state.storage';
import { loadImage, printable, showPdf } from '../pages/eoi-sanction-editor/pdf-common';

const STORAGE_KEY = 'isms_empanelment_orders_v1';

export const DEFAULT_COMMITTEE_MEMBERS: CommitteeSignatory[] = [
  {
    id: 'comm-1',
    name: 'Rishav Mandal, I.A.S.',
    designation: 'Managing Director',
    role: 'Approver / Chairperson',
    mobile: '+91 94140 12890',
    email: 'md.rsldc@rajasthan.gov.in',
    otpSent: false,
    otpVerified: false
  },
  {
    id: 'comm-2',
    name: 'Shivkesh Jareda',
    designation: 'Scheme Officer In-Charge (OIC)',
    role: 'Scheme OIC',
    mobile: '+91 98290 44512',
    email: 'oic.samarth@rajasthan.gov.in',
    otpSent: false,
    otpVerified: false
  },
  {
    id: 'comm-3',
    name: 'Priya Singh',
    designation: 'General Manager (Operations)',
    role: 'Committee Member',
    mobile: '+91 94141 88321',
    email: 'gm.ops@rajasthan.gov.in',
    otpSent: false,
    otpVerified: false
  },
  {
    id: 'comm-4',
    name: 'Rahul Sharma',
    designation: 'Chief Accounts Officer (CAO)',
    role: 'Finance Member',
    mobile: '+91 99280 55670',
    email: 'cao.rsldc@rajasthan.gov.in',
    otpSent: false,
    otpVerified: false
  }
];

const INITIAL_ORDERS: EmpanelmentOrder[] = [
  {
    id: 'ORD-SAMARTH-01',
    schemeId: 'SAMARTH-02',
    schemeName: 'SAMARTH Skill Development Scheme',
    eoiRefNo: 'RSLDC/EOI/2026/SAMARTH-02',
    fileNo: 'F () RSLDC/Skills/SAMARTH/EOI/2026-2027/1709-15',
    orderDate: '10/08/2026',
    status: 'E_SIGNED',
    signedAt: '10/08/2026 17:49:26 IST',
    rajKajRefNo: '23898348',
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
    ],
    committeeMembers: [
      {
        id: 'comm-1',
        name: 'Rishav Mandal, I.A.S.',
        designation: 'Managing Director',
        role: 'Approver / Chairperson',
        mobile: '+91 94140 12890',
        email: 'md.rsldc@rajasthan.gov.in',
        otpSent: true,
        otpVerified: true,
        signedAt: '10/08/2026 17:45:10 IST',
        rajKajRefNo: 'RK-MD-23898348'
      },
      {
        id: 'comm-2',
        name: 'Shivkesh Jareda',
        designation: 'Scheme Officer In-Charge (OIC)',
        role: 'Scheme OIC',
        mobile: '+91 98290 44512',
        email: 'oic.samarth@rajasthan.gov.in',
        otpSent: true,
        otpVerified: true,
        signedAt: '10/08/2026 17:47:30 IST',
        rajKajRefNo: 'RK-OIC-23898382'
      },
      {
        id: 'comm-3',
        name: 'Priya Singh',
        designation: 'General Manager (Operations)',
        role: 'Committee Member',
        mobile: '+91 94141 88321',
        email: 'gm.ops@rajasthan.gov.in',
        otpSent: true,
        otpVerified: true,
        signedAt: '10/08/2026 17:48:15 IST',
        rajKajRefNo: 'RK-GM-23898399'
      },
      {
        id: 'comm-4',
        name: 'Rahul Sharma',
        designation: 'Chief Accounts Officer (CAO)',
        role: 'Finance Member',
        mobile: '+91 99280 55670',
        email: 'cao.rsldc@rajasthan.gov.in',
        otpSent: true,
        otpVerified: true,
        signedAt: '10/08/2026 17:49:00 IST',
        rajKajRefNo: 'RK-CAO-23898410'
      }
    ],
    empanelledAgencies: [
      { sNo: 1, applicationId: 'APP-003844', agencyName: '7 Haxegon Tech Labs Private Limited', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
      { sNo: 2, applicationId: 'APP-004640', agencyName: 'Abhyas Shiksha Samiti', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'B' },
      { sNo: 3, applicationId: 'APP-003957', agencyName: 'ABS Healthcare Group', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
      { sNo: 4, applicationId: 'APP-004551', agencyName: 'Adarsh Education Society', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
      { sNo: 5, applicationId: 'APP-003691', agencyName: 'Advik Educational and Welfare Society', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
      { sNo: 6, applicationId: 'APP-004322', agencyName: 'Banasia Ventures Pvt. Ltd', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'B' },
      { sNo: 7, applicationId: 'APP-003890', agencyName: 'Brain Tree Skill Development Training Institute', category: 'A1(skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
      { sNo: 8, applicationId: 'APP-004601', agencyName: 'A.S Motors', category: 'A2(Non skilling)', fileStatus: 'Eligible', marksGrade: 'A' },
      { sNo: 9, applicationId: 'APP-004239', agencyName: 'AB Enterprises', category: 'A2(Non skilling)', fileStatus: 'Eligible', marksGrade: 'B' },
      { sNo: 10, applicationId: 'APP-003893', agencyName: 'Abhijeet Shikshan Seva Sansthan', category: 'A2(Non skilling)', fileStatus: 'Eligible', marksGrade: 'D' }
    ],
    rejectedAgencies: [
      { sNo: 1, applicationId: 'APP-004036', agencyName: 'A.P Electrical', fileStatus: 'Not Eligible', reason: 'Annual turnover criteria not fulfilled for last 3 financial years' },
      { sNo: 2, applicationId: 'APP-004684', agencyName: 'Aashi Plastic Pvt. Ltd.', fileStatus: 'Not Eligible', reason: 'Mandatory technical lab infrastructure norms not met' },
      { sNo: 3, applicationId: 'APP-004243', agencyName: 'Arya Shiksha Samiti', fileStatus: 'Not Eligible', reason: 'UDIN missing on CA certified financial statements' },
      { sNo: 4, applicationId: 'APP-004275', agencyName: 'Bahu Uddeshiya Kunal Academy Sansthan', fileStatus: 'Not Eligible', reason: 'Past verified placement records below statutory benchmark' },
      { sNo: 5, applicationId: 'APP-004014', agencyName: 'Bhartiya Pashupalan Nigam Limited', fileStatus: 'Not Eligible', reason: 'Incomplete statutory affidavit documentation' }
    ],
    createdAt: '10/08/2026'
  }
];

@Injectable({
  providedIn: 'root'
})
export class EmpanelmentOrderService {
  private readonly storage = inject(EoiStorage);
  private ordersSubject = new BehaviorSubject<EmpanelmentOrder[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = this.storage.getString(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.ordersSubject.next(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading stored empanelment orders, falling back to seed', e);
    }
    this.ordersSubject.next(INITIAL_ORDERS);
    this.saveToStorage(INITIAL_ORDERS);
  }

  private saveToStorage(orders: EmpanelmentOrder[]): void {
    try {
      this.storage.setString(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving empanelment orders to storage', e);
    }
  }

  getOrders(): Observable<EmpanelmentOrder[]> {
    return this.orders$;
  }

  getOrderBySchemeId(schemeId: string): Observable<EmpanelmentOrder | undefined> {
    return this.orders$.pipe(
      map(orders => orders.find(o => o.schemeId === schemeId || o.eoiRefNo.includes(schemeId)))
    );
  }

  getOrderById(orderId: string): Observable<EmpanelmentOrder | undefined> {
    return this.orders$.pipe(
      map(orders => orders.find(o => o.id === orderId))
    );
  }

  /**
   * Saves or updates an empanelment order in storage.
   */
  saveOrder(order: EmpanelmentOrder): void {
    const current = this.ordersSubject.getValue();
    const idx = current.findIndex(o => o.id === order.id || o.schemeId === order.schemeId);
    let updated: EmpanelmentOrder[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...order, orderDate: order.orderDate || formatDate(new Date()) };
    } else {
      updated = [{ ...order, orderDate: order.orderDate || formatDate(new Date()) }, ...current];
    }
    this.ordersSubject.next(updated);
    this.saveToStorage(updated);
  }

  /**
   * Returns committee members assigned to a scheme.
   */
  getCommitteeForScheme(schemeMembers?: string[], approverName?: string): CommitteeSignatory[] {
    const list: CommitteeSignatory[] = [];

    if (approverName) {
      list.push({
        id: `approver-${approverName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
        name: approverName,
        designation: 'Managing Director / Committee Approver',
        role: 'Approver',
        mobile: '+91 94140 12890',
        email: 'approver.rsldc@rajasthan.gov.in',
        otpSent: false,
        otpVerified: false
      });
    }

    if (schemeMembers && schemeMembers.length > 0) {
      schemeMembers.forEach((member, i) => {
        if (member !== approverName) {
          list.push({
            id: `comm-dyn-${i + 1}`,
            name: member,
            designation: i === 0 ? 'Scheme Officer In-Charge (OIC)' : i === 1 ? 'General Manager (Operations)' : 'Technical Scrutiny Member',
            role: i === 0 ? 'Scheme OIC' : 'Committee Member',
            mobile: `+91 98290 ${40000 + i * 111}`,
            email: `${member.split(' ')[0].toLowerCase()}.rsldc@rajasthan.gov.in`,
            otpSent: false,
            otpVerified: false
          });
        }
      });
    }

    if (list.length === 0) {
      return DEFAULT_COMMITTEE_MEMBERS.map(m => ({ ...m, otpSent: false, otpVerified: false }));
    }

    return list;
  }

  /**
   * Generates the official Empanelment or Rejection Order PDF with official logos,
   * detailed company tables, terms, and RajKaj e-Sign validation, and displays it
   * directly in the browser's PDF viewer in a new tab.
   */
  async openOrderPdf(
    order: EmpanelmentOrder,
    type: 'EMPANELMENT' | 'REJECTION',
    tab: Window | null = null
  ): Promise<void> {
    const pdf = await this.buildOrderPdf(order, type);
    showPdf(pdf, tab);
  }

  async buildOrderPdf(
    order: EmpanelmentOrder,
    type: 'EMPANELMENT' | 'REJECTION'
  ): Promise<jsPDF> {
    const isEmp = type === 'EMPANELMENT';
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const orderTitle = isEmp ? 'FINAL EMPANELMENT ORDER' : 'FINAL REJECTION ORDER';
    pdf.setProperties({ title: `${orderTitle} - ${order.fileNo}` });

    // 1. Load Official Rajasthan Government & RSLDC Logos
    const [leftLogo, rightLogo] = await Promise.all([
      loadImage('/Rajasthan-Sarkar.png'),
      loadImage('/rsldc-logo.png')
    ]);

    // Outer Decorative Border
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.35);
    pdf.rect(10, 10, 190, 277);

    // Left Official Logo (Rajasthan Government Emblem)
    if (leftLogo) {
      try {
        pdf.addImage(leftLogo, 'PNG', 14, 12, 16, 16);
      } catch {
        this.drawLogoFallback(pdf, 14, 12, 'RAJ');
      }
    } else {
      this.drawLogoFallback(pdf, 14, 12, 'RAJ');
    }

    // Right Official Logo (RSLDC Emblem)
    if (rightLogo) {
      try {
        pdf.addImage(rightLogo, 'PNG', 180, 12, 16, 16);
      } catch {
        this.drawLogoFallback(pdf, 180, 12, 'RSLDC');
      }
    } else {
      this.drawLogoFallback(pdf, 180, 12, 'RSLDC');
    }

    // Central Official Header Text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION', 105, 17, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text('Kaushal Bhawan, EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur-302004 (Rajasthan)', 105, 22, { align: 'center' });
    pdf.text('Phone: 0141-5103246 / 2705600 | Website: livelihoods.rajasthan.gov.in', 105, 26, { align: 'center' });

    // Divider Line
    pdf.setDrawColor(30, 41, 59);
    pdf.setLineWidth(0.35);
    pdf.line(14, 30, 196, 30);

    // File No & Date
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`File No: ${order.fileNo || 'F () RSLDC/Skills/EOI/2026/1709-15'}`, 14, 35);
    pdf.text(`Date: ${order.orderDate || formatDate(new Date())}`, 196, 35, { align: 'right' });

    // Document Main Title (Centered & Underlined)
    let y = 43;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11.5);
    pdf.setTextColor(11, 53, 88);
    pdf.text(orderTitle, 105, y, { align: 'center' });
    const titleWidth = pdf.getTextWidth(orderTitle);
    pdf.setLineWidth(0.3);
    pdf.line(105 - titleWidth / 2, y + 1.2, 105 + titleWidth / 2, y + 1.2);

    // Subject Box
    y += 6;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(14, y, 182, 12, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Subject:', 17, y + 4.5);

    pdf.setFont('helvetica', 'normal');
    const subj = isEmp
      ? (order.subject || `Empanelment order against EOI Ref No. ${order.eoiRefNo} under ${order.schemeName} for FY 2026-2027.`)
      : (order.rejectionSubject || `Final Rejection & Disqualification Order against EOI Ref No. ${order.eoiRefNo} under ${order.schemeName}.`);
    const subjLines = pdf.splitTextToSize(subj, 155);
    pdf.text(subjLines, 31, y + 4.5);

    // Preamble Text
    y += 16;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);

    const p1 = isEmp
      ? (order.preamble1 || `An Expression of Interest (EOI) was published under ${order.schemeName} for empanelment of Project Implementing Agencies (PIAs) / Training Partners.`)
      : (order.rejectionPreamble1 || `This bears reference to the technical proposal dossiers submitted under ${order.schemeName} (EOI Ref No. ${order.eoiRefNo}).`);
    const p1Lines = pdf.splitTextToSize(p1, 180);
    pdf.text(p1Lines, 15, y);
    y += p1Lines.length * 4 + 2;

    const p2 = isEmp
      ? (order.preamble2 || 'Pursuant to technical evaluation, scrutiny of submitted statutory credentials, and State Empanelment Committee appraisal process, the following agencies are hereby shortlisted and empaneled under the scheme for Financial Year 2026-2027:')
      : (order.rejectionPreamble2 || 'Following detailed verification of eligibility criteria, statutory compliances, and evaluation matrix parameters, the following agencies have been found disqualified and rejected due to reasons specified below:');
    const p2Lines = pdf.splitTextToSize(p2, 180);
    pdf.text(p2Lines, 15, y);
    y += p2Lines.length * 4 + 4;

    // Table Header
    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(148, 163, 184);
    pdf.rect(14, y, 182, 7, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(15, 23, 42);

    pdf.text('Sr. No', 17, y + 4.8);
    pdf.text('Application ID', 32, y + 4.8);
    pdf.text('Applicant Agency Name', 68, y + 4.8);

    if (isEmp) {
      pdf.text('Category', 135, y + 4.8);
      pdf.text('File Status', 158, y + 4.8);
      pdf.text('Grade', 182, y + 4.8);
    } else {
      pdf.text('File Status', 135, y + 4.8);
      pdf.text('Reason for Rejection', 158, y + 4.8);
    }

    // Table Rows
    y += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);

    const agencies = isEmp ? (order.empanelledAgencies || []) : (order.rejectedAgencies || []);
    agencies.forEach((item, idx) => {
      if (y > 230) {
        pdf.addPage();
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.35);
        pdf.rect(10, 10, 190, 277);
        y = 20;

        // Redraw Table Header on new page
        pdf.setFillColor(241, 245, 249);
        pdf.setDrawColor(148, 163, 184);
        pdf.rect(14, y, 182, 7, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Sr. No', 17, y + 4.8);
        pdf.text('Application ID', 32, y + 4.8);
        pdf.text('Applicant Agency Name', 68, y + 4.8);
        if (isEmp) {
          pdf.text('Category', 135, y + 4.8);
          pdf.text('File Status', 158, y + 4.8);
          pdf.text('Grade', 182, y + 4.8);
        } else {
          pdf.text('File Status', 135, y + 4.8);
          pdf.text('Reason for Rejection', 158, y + 4.8);
        }
        y += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.rect(14, y, 182, 6.5);
      pdf.text(String(item.sNo || idx + 1), 17, y + 4.2);
      pdf.text(printable(item.applicationId), 32, y + 4.2);
      pdf.text(printable(item.agencyName.slice(0, 36)), 68, y + 4.2);

      if (isEmp) {
        const emp = item as any;
        pdf.text(printable(emp.category || 'A1(skilling)'), 135, y + 4.2);
        pdf.setTextColor(5, 150, 105);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Eligible', 158, y + 4.2);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.text(printable(emp.marksGrade || 'A'), 182, y + 4.2);
      } else {
        const rej = item as any;
        pdf.setTextColor(225, 29, 72);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Not Eligible', 135, y + 4.2);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'normal');
        pdf.text(printable((rej.reason || 'Criteria not met').slice(0, 24)), 158, y + 4.2);
      }
      y += 6.5;
    });

    // Check bottom space for Signatory & RajKaj Seal
    if (y > 215) {
      pdf.addPage();
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.35);
      pdf.rect(10, 10, 190, 277);
      y = 25;
    } else {
      y += 8;
    }

    // Signatory Name & Designation (Right side)
    const sigName = isEmp ? (order.issuingAuthority?.name || 'Rishav Mandal, I.A.S.') : 'Shivkesh Jareda';
    const sigDesig = isEmp ? 'Managing Director' : 'Scheme Officer In-Charge (OIC)';
    const sigDept = 'RSLDC (Govt. of Rajasthan)';

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(sigName, 195, y, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(sigDesig, 195, y + 4, { align: 'right' });
    pdf.text(sigDept, 195, y + 8, { align: 'right' });

    // RajKaj Digital Signature Box (scanned government style)
    y += 12;
    pdf.setDrawColor(5, 150, 105);
    pdf.setFillColor(236, 253, 245);
    pdf.setLineWidth(0.4);
    pdf.rect(142, y, 54, 25, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(6, 95, 70);
    pdf.text('Signature Valid', 145, y + 5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Digitally signed by: ${sigName}`, 145, y + 9);
    pdf.text(`Designation: ${sigDesig}`, 145, y + 13);
    pdf.text(`Date: ${order.signedAt || order.orderDate || formatDate(new Date())}`, 145, y + 17);
    pdf.text(`Reason: Approved & Issued`, 145, y + 21);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(6, 95, 70);
    pdf.text(`RajKaj: ${order.rajKajRefNo || '23898348'}`, 193, y + 21, { align: 'right' });

    // Copy To Distribution List
    y += 28;
    if (y < 270) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Copy to following for information and necessary action:', 14, y);
      y += 4;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(71, 85, 105);
      const copyList = order.copyToList && order.copyToList.length > 0 ? order.copyToList.slice(0, 5) : [
        "1. PS to Hon'ble Minister, DSEE",
        '2. PS to Secretary, DSEE',
        '3. PS to Managing Director, RSLDC',
        '4. CAO / General Manager, RSLDC',
        '5. Concerned Agencies / Guard File'
      ];
      copyList.forEach((c, idx) => {
        pdf.text(printable(`${idx + 1}. ${c.replace(/^\d+\.\s*/, '')}`), 14, y);
        y += 3.5;
      });
    }

    return pdf;
  }

  private drawLogoFallback(pdf: jsPDF, x: number, y: number, label: string): void {
    pdf.setDrawColor(148, 163, 184);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(x, y, 16, 16, 2, 2, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.setTextColor(71, 85, 105);
    pdf.text(label, x + 8, y + 9, { align: 'center' });
  }
}
