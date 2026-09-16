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
}

@Injectable({
  providedIn: 'root'
})
export class SanctionOrderService {
  private ordersSubject = new BehaviorSubject<SanctionOrder[]>([
    {
      id: '2',
      ref: 'SO-2026-4412',
      tender: 'TND-2026-001',
      eoi: 'EOI-2026-9871',
      tpName: 'SkillMasters Rajasthan',
      tpId: 'TP042',
      status: 'PENDING_RELEASE',
      target: 500
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
      target: order.target
    };
    
    const current = this.ordersSubject.value;
    this.ordersSubject.next([newOrder, ...current]);
  }

  updateStatus(id: string, status: SanctionOrder['status']) {
    const current = this.ordersSubject.value;
    const updated = current.map(o => o.id === id ? { ...o, status } : o);
    this.ordersSubject.next(updated);
  }
}
