import { INITIAL_ASPIRANTS } from '../../../core/mock/data/aspirants.mock';
import { Injectable, signal, computed, inject } from '@angular/core';
import { AspirantRecord, AspirantTrainingStatus } from '../models/aspirant.model';
import { AspirantFormData } from '../config/aspirant-form.config';
import { BatchRecord } from '../models/batch.model';
import { SdcRecord } from '../models/sdc.model';
import { BatchService } from './batch.service';
import { SdcService } from './sdc.service';


@Injectable({
  providedIn: 'root'
})
export class AspirantService {
  private batchService = inject(BatchService);
  private sdcService = inject(SdcService);
  private readonly STORAGE_KEY = 'isms_aspirant_records';

  private readonly _aspirants = signal<AspirantRecord[]>(this.loadInitialAspirants());

  readonly aspirants = this._aspirants.asReadonly();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.STORAGE_KEY && event.newValue) {
          try {
            const records: AspirantRecord[] = JSON.parse(event.newValue);
            if (Array.isArray(records) && records.length > 0) {
              this._aspirants.set(records);
            }
          } catch { }
        }
      });
    }
  }

  private loadInitialAspirants(): AspirantRecord[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed: AspirantRecord[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const canonicalMap = new Map(INITIAL_ASPIRANTS.map(a => [a.id, a]));

            const updated = parsed.map(a => {
              const canonical = canonicalMap.get(a.id);
              if (canonical) {
                return {
                  ...a,
                  aspirantName: canonical.aspirantName,
                  sdcId: canonical.sdcId,
                  sdcCode: canonical.sdcCode,
                  sdcName: canonical.sdcName,
                  sdcDistrict: canonical.sdcDistrict,
                  batchId: canonical.batchId,
                  batchCode: canonical.batchCode,
                  batchName: canonical.batchName,
                  courseName: canonical.courseName,
                  scheme: canonical.scheme,
                  sector: canonical.sector
                };
              }
              return a;
            });

            const existingIds = new Set(updated.map(p => p.id));
            const missing = INITIAL_ASPIRANTS.filter(a => !existingIds.has(a.id));
            const combined = [...updated, ...missing];
            this.persist(combined);
            return combined;
          }
        }
      } catch (e) {
        console.error('Failed to load aspirants from localStorage', e);
      }
    }
    this.persist(INITIAL_ASPIRANTS);
    return INITIAL_ASPIRANTS;
  }

  private persist(records?: AspirantRecord[]): void {
    const list = records || this._aspirants();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to persist aspirants to localStorage', e);
      }
    }
  }

  /** Stats computed across all aspirants */
  readonly stats = computed(() => {
    const list = this._aspirants();
    const verifiedCount = list.filter(a => a.biometricVerified).length;
    const maleCount = list.filter(a => a.gender === 'Male').length;
    const femaleCount = list.filter(a => a.gender === 'Female').length;
    
    // Unique SDCs
    const sdcCodes = new Set(list.map(a => a.sdcCode));
    // Unique Batches
    const batchCodes = new Set(list.map(a => a.batchCode));
    // Unique Schemes
    const schemes = new Set(list.map(a => a.scheme));

    return {
      total: list.length,
      verifiedCount,
      verifiedPercent: list.length ? Math.round((verifiedCount / list.length) * 100) : 0,
      maleCount,
      femaleCount,
      sdcCount: sdcCodes.size,
      batchCount: batchCodes.size,
      schemeCount: schemes.size,
      inTraining: list.filter(a => a.trainingStatus === 'IN_TRAINING').length,
      enrolled: list.filter(a => a.trainingStatus === 'ENROLLED').length,
      certified: list.filter(a => a.trainingStatus === 'CERTIFIED').length
    };
  });

  /** Get aspirant by ID */
  getAspirantById(id: string): AspirantRecord | undefined {
    return this._aspirants().find(a => a.id === id);
  }

  /**
   * Register and map a new aspirant from the 4-step form
   */
  addAspirant(formData: AspirantFormData, batch: BatchRecord, sdc?: SdcRecord): AspirantRecord {
    const nextNum = Math.floor(10000 + Math.random() * 90000);
    const newId = `ASP-RJ-2026-${nextNum}`;
    const aadhaarLast4 = formData.aadhaarNo.slice(-4) || '9999';
    const aadhaarMasked = `XXXX-XXXX-${aadhaarLast4}`;

    // Center info from SDC or Batch
    const sdcId = sdc?.id || batch.sdcId || 'sdc-101';
    const sdcCode = sdc?.sdcCode || batch.sdcCode || 'SDC-0001';
    const sdcName = sdc?.sdcName || batch.sdcName || 'Jaipur Skill Center';
    const sdcDistrict = sdc?.district || 'Jaipur';

    const newRecord: AspirantRecord = {
      ...formData,
      documents: (formData.documents && formData.documents.length > 0) ? formData.documents : [
        { id: 'doc-1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: formData.aadhaarDocName || 'Aadhaar_Document.pdf', fileSize: formData.aadhaarDocSize || '1.4 MB', status: 'UPLOADED' },
        { id: 'doc-2', docType: 'Educational Qualification Certificate', docName: 'Educational Qualification Certificate', fileName: '12th_Pass_Certificate.pdf', fileSize: '2.1 MB', status: 'UPLOADED' },
        { id: 'doc-3', docType: 'Bank Passbook / Cancelled Cheque', docName: 'Bank Passbook / Cancelled Cheque', fileName: 'Bank_Passbook.jpg', fileSize: '850 KB', status: 'UPLOADED' }
      ],
      id: newId,
      aadhaarMasked,
      sdcId,
      sdcCode,
      sdcName,
      sdcDistrict,
      batchId: batch.id,
      batchCode: batch.batchCode,
      batchName: batch.batchName,
      courseName: batch.courseName,
      scheme: batch.scheme,
      sector: batch.sector,
      enrollmentDate: new Date().toISOString().split('T')[0],
      trainingStatus: 'ENROLLED',
      biometricVerified: true,
      attendancePercent: 100
    };

    // Prepend to reactive signal
    this._aspirants.update(list => [newRecord, ...list]);
    this.persist();

    return newRecord;
  }

  /** Update an existing aspirant record */
  updateAspirant(id: string, updates: Partial<AspirantRecord>): AspirantRecord | undefined {
    let updated: AspirantRecord | undefined;
    this._aspirants.update(list =>
      list.map(item => {
        if (item.id === id) {
          updated = { ...item, ...updates };
          return updated;
        }
        return item;
      })
    );
    this.persist();
    return updated;
  }

  /** Toggle biometric verification */
  toggleBiometric(id: string): void {
    this._aspirants.update(list =>
      list.map(item =>
        item.id === id
          ? { ...item, biometricVerified: !item.biometricVerified }
          : item
      )
    );
    this.persist();
  }

  /** Update candidate training status */
  updateTrainingStatus(id: string, status: AspirantTrainingStatus): void {
    this._aspirants.update(list =>
      list.map(item =>
        item.id === id
          ? { ...item, trainingStatus: status }
          : item
      )
    );
    this.persist();
  }

  /** Delete aspirant */
  deleteAspirant(id: string): void {
    this._aspirants.update(list => list.filter(a => a.id !== id));
    this.persist();
  }
}
