import { Injectable } from '@angular/core';
import { TP_SANCTION_ORDERS } from '../../../core/mock/data/tp-sanction-orders.mock';
import { createPersistedStore } from '../../../core/services/persisted-store';
import type { TpSanctionOrder } from './tp-sanction-order.model';

/** The sanction orders that sanction the signed-in training partner (resource `TP_SANCTION_ORDERS`, read-only). */
@Injectable({ providedIn: 'root' })
export class TpSanctionOrderService {
  private readonly store = createPersistedStore<TpSanctionOrder>({
    dataKey: 'TP_SANCTION_ORDERS',
    seed: TP_SANCTION_ORDERS,
    writable: false
  });

  readonly orders = this.store.items.asReadonly();
}
