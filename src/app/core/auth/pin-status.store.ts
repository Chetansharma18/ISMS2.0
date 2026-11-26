import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from '../services/storage.service';

const KEY = 'isms_security_pin_status';

/** true: the user has a security PIN. false: they have none. null: not known yet. */
export type PinStatus = boolean | null;

/**
 * Whether each user has a security PIN, as the backend last reported it.
 *
 * The backend tells the frontend only during sign-in: a role that asks for a second check sends
 * `twoStepStatus.pin.isSet` with the challenge. A PIN sign-in or a successful "set PIN" also proves one exists.
 * The answer is kept per SSO ID (it outlives the session) so the profile can show it; null until the backend has said.
 */
@Injectable({ providedIn: 'root' })
export class PinStatusStore {
  private readonly storage = inject(StorageService);
  private readonly all = signal<Record<string, boolean>>(this.storage.getItem<Record<string, boolean>>(KEY) ?? {});

  statusOf(ssoId: string | null | undefined): PinStatus {
    const key = this.key(ssoId);
    return key && key in this.all() ? this.all()[key] : null;
  }

  record(ssoId: string | null | undefined, isSet: boolean | null | undefined): void {
    const key = this.key(ssoId);
    if (!key || isSet === null || isSet === undefined) return;
    if (this.all()[key] === isSet) return;
    const next = { ...this.all(), [key]: isSet };
    this.all.set(next);
    this.storage.setItem(KEY, next);
  }

  private key(ssoId: string | null | undefined): string {
    return (ssoId ?? '').trim().toLowerCase();
  }
}
