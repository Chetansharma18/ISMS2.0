import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SanctionOrder {
  id: string;
  ref: string;
  tender: string;
  eoi: string;
  tpName: string;
  tpId: string;
  status: 'DRAFT' | 'PENDING_RELEASE' | 'RELEASED';
  target?: number;
  tpCode?: string;
  scheme?: string;
  mouStartDate?: string;
  mouExpiryDate?: string;
  totalSdc?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SanctionOrderService {
  private ordersSubject = new BehaviorSubject<SanctionOrder[]>([
    // ─── ORDER 1: Already Released ────────────────────────────────────────────
    {
      id: '1',
      ref: 'SO-2026-4412',
      tender: 'TND-2026-001',
      eoi: 'EOI-2026-9871',
      tpName: 'SkillMasters Rajasthan',
      tpId: 'TP042',
      status: 'RELEASED',
      target: 500,
      tpCode: 'TP-2026-001',
      scheme: 'SAMARTH',
      mouStartDate: '2026-01-01',
      mouExpiryDate: '2027-01-01',
      totalSdc: 2
    },
    // ─── ORDER 2: Pending Release (Admin can release → syncs to TP) ───────────
    {
      id: '2',
      ref: 'SO-2026-4413',
      tender: 'TND-2026-002',
      eoi: 'EOI-2026-9872',
      tpName: 'Rajasthan Kaushal Vikas Sansthan',
      tpId: 'TP078',
      status: 'PENDING_RELEASE',
      target: 300,
      tpCode: 'TP-2026-002',
      scheme: 'MMKVY',
      mouStartDate: '2026-09-01',
      mouExpiryDate: '2027-08-31',
      totalSdc: 0
    },
    // ─── ORDER 3: Draft ───────────────────────────────────────────────────────
    {
      id: '3',
      ref: 'SO-2026-4414',
      tender: 'TND-2026-003',
      eoi: 'EOI-2026-9873',
      tpName: 'Digital Yuva Foundation',
      tpId: 'TP115',
      status: 'DRAFT',
      target: 200,
      tpCode: 'TP-2026-003',
      scheme: 'MNSKSY',
      mouStartDate: '2026-10-01',
      mouExpiryDate: '2027-09-30',
      totalSdc: 0
    }
  ]);

  orders$ = this.ordersSubject.asObservable();

  addOrder(order: Partial<SanctionOrder>) {
    const newOrder: SanctionOrder = {
      id: Math.random().toString(36).substr(2, 9),
      ref: order.ref || '-',
      tender: order.tender || 'TND-2026-001',
      eoi: order.eoi || 'EOI-2026-9871',
      tpName: order.tpName || 'SkillMasters Rajasthan',
      tpId: order.tpId || 'TP042',
      status: order.status || 'DRAFT',
      target: order.target,
      tpCode: order.tpCode,
      scheme: order.scheme,
      mouStartDate: order.mouStartDate,
      mouExpiryDate: order.mouExpiryDate,
      totalSdc: order.totalSdc || 0
    };
    
    const current = this.ordersSubject.value;
    this.ordersSubject.next([newOrder, ...current]);
  }

  updateOrder(id: string, data: Partial<SanctionOrder>) {
    const current = this.ordersSubject.value;
    const updated = current.map(o => o.id === id ? { ...o, ...data } : o);
    this.ordersSubject.next(updated);
  }

  updateStatus(id: string, status: SanctionOrder['status']) {
    const current = this.ordersSubject.value;
    const updated = current.map(o => o.id === id ? { ...o, status } : o);
    this.ordersSubject.next(updated);
  }

  getById(id: string): SanctionOrder | undefined {
    return this.ordersSubject.value.find(o => o.id === id);
  }
}
