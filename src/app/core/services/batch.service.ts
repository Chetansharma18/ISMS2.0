import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Batch {
  id: string;
  batchCode: string;
  batchName: string;
  courseName: string;
  sdcCode: string;
  sdcName: string;
  scheme: string;
  targetCapacity: number;
  mappedAspirantsCount: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'APPROVED' | 'ONGOING' | 'COMPLETED';
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private initialBatches: Batch[] = [
    {
      id: 'bt-1',
      batchCode: 'B-26-0001',
      batchName: 'Solar Tech Batch 01',
      courseName: 'Solar Panel Installation Technician',
      sdcCode: 'SDC-001',
      sdcName: 'Apex Skill Development Center',
      scheme: 'MMKVY',
      targetCapacity: 30,
      mappedAspirantsCount: 1,
      startDate: '2026-09-01',
      endDate: '2026-11-30',
      status: 'ONGOING'
    },
    {
      id: 'bt-2',
      batchCode: 'B-26-0002',
      batchName: 'Data Entry Batch A',
      courseName: 'Domestic Data Entry Operator',
      sdcCode: 'SDC-001',
      sdcName: 'Apex Skill Development Center',
      scheme: 'SAMARTH',
      targetCapacity: 30,
      mappedAspirantsCount: 0,
      startDate: '2026-10-01',
      endDate: '2026-12-31',
      status: 'APPROVED'
    },
    {
      id: 'bt-3',
      batchCode: 'B-26-0003',
      batchName: 'Auto Service Batch 01',
      courseName: 'Automotive Service Technician',
      sdcCode: 'SDC-002',
      sdcName: 'Rajasthan Kaushal Kendra',
      scheme: 'MNSKSY',
      targetCapacity: 25,
      mappedAspirantsCount: 0,
      startDate: '2026-10-15',
      endDate: '2027-01-15',
      status: 'APPROVED'
    }
  ];

  private batchesSubject = new BehaviorSubject<Batch[]>(this.initialBatches);
  batches$: Observable<Batch[]> = this.batchesSubject.asObservable();

  addBatch(data: Partial<Batch>) {
    const current = this.batchesSubject.value;
    const newBatch: Batch = {
      id: 'bt-' + Math.floor(100 + Math.random() * 900),
      batchCode: data.batchCode || 'B-26-000' + (current.length + 1),
      batchName: data.batchName || 'New Skill Training Batch',
      courseName: data.courseName || 'Solar Panel Installation Technician',
      sdcCode: data.sdcCode || 'SDC-001',
      sdcName: data.sdcName || 'Apex Skill Center',
      scheme: data.scheme || 'MMKVY',
      targetCapacity: data.targetCapacity || 30,
      mappedAspirantsCount: data.mappedAspirantsCount || 0,
      startDate: data.startDate || '2026-10-01',
      endDate: data.endDate || '2026-12-31',
      status: data.status || 'APPROVED'
    };
    this.batchesSubject.next([newBatch, ...current]);
  }

  updateMappedCount(batchCode: string, newCount: number) {
    const current = this.batchesSubject.value;
    const updated = current.map(b => b.batchCode === batchCode ? { ...b, mappedAspirantsCount: newCount } : b);
    this.batchesSubject.next(updated);
  }
}
