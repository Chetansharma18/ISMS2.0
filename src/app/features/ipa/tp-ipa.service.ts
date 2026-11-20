import { Injectable } from '@angular/core';
import { TP_IPAS } from '../../core/mock/data/tp-ipas.mock';
import { createPersistedStore } from '../../core/services/persisted-store';
import type { TpIpa } from './tp-ipa.model';

/** The IPAs issued to the signed-in training partner (resource `TP_IPAS`, read-only). */
@Injectable({ providedIn: 'root' })
export class TpIpaService {
  private readonly store = createPersistedStore<TpIpa>({
    dataKey: 'TP_IPAS',
    idKey: 'ipaId',
    seed: TP_IPAS,
    writable: false
  });

  readonly ipas = this.store.items.asReadonly();

  find(ipaId: string): TpIpa | undefined {
    return this.ipas().find(ipa => ipa.ipaId === ipaId);
  }
}
