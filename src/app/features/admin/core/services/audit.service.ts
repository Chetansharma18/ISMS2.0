import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { AuditLog } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private initialLogs: AuditLog[] = [
    {
      id: 'AUD-901',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'EOI',
      action: 'Rescheduled EOI',
      eoiId: 'EOI-2025-001',
      oldValue: 'Closing Date: 2025-05-15',
      newValue: 'Closing Date: 2025-06-30 (Corrigendum-01 attached)',
      reason: 'Administrative extension requested by Skill Development Directorate',
      ipAddress: '10.244.12.85'
    },
    {
      id: 'AUD-902',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Committees',
      action: 'Assigned Committee',
      eoiId: 'EOI-2025-004',
      oldValue: 'Unassigned',
      newValue: 'State Skill Evaluation Committee (SSEC-01)',
      reason: 'Empanelment screening committee formation',
      ipAddress: '10.244.12.85'
    },
    {
      id: 'AUD-903',
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'EOI Form Builder',
      action: 'Added Field',
      eoiId: 'EOI-2025-002',
      oldValue: 'None',
      newValue: 'Field: GST Registration Number (Type: Text, Required: Yes)',
      reason: 'Statutory compliance validation addition',
      ipAddress: '10.244.12.85'
    },
    {
      id: 'AUD-904',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Users',
      action: 'Mapped SSO',
      oldValue: 'SSO ID: raj_sk_temp',
      newValue: 'SSO ID: raj_eval_comm_01',
      reason: 'Official Gov SSO identity verified',
      ipAddress: '10.244.12.85'
    },
    {
      id: 'AUD-905',
      timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Schemes',
      action: 'Created Scheme',
      oldValue: 'None',
      newValue: 'Scheme: MMKVY - Mukhya Mantri Kaushal Vikas Yojana',
      reason: 'FY 2025-26 notification rollout',
      ipAddress: '10.244.12.85'
    },
    {
      id: 'AUD-906',
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'EOI',
      action: 'Published EOI',
      eoiId: 'EOI-2025-003',
      oldValue: 'Status: APPROVED',
      newValue: 'Status: PUBLISHED',
      reason: 'Approval from Competent Authority received',
      ipAddress: '10.244.12.85'
    }
  ];

  private logs$ = new BehaviorSubject<AuditLog[]>(this.initialLogs);

  getAuditLogs(): Observable<AuditLog[]> {
    return this.logs$.asObservable();
  }

  logAction(log: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'>): void {
    const entry: AuditLog = {
      ...log,
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '10.244.12.85'
    };
    const current = this.logs$.value;
    this.logs$.next([entry, ...current]);
  }
}
