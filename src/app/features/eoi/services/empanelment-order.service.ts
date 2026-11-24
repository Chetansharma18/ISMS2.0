import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDate } from '../../../shared/utils';
import type { CommitteeSignatory, EmpanelmentOrder } from '../models/empanelment-order.model';
import { EoiStorage } from './eoi-state.storage';

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
}
