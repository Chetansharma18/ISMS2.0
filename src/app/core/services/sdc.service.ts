import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Sdc {
  id: string;
  sdcCode: string;
  name: string;
  tpName: string;
  scheme: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING_INSPECTION' | 'APPROVED' | 'REJECTED';
  district?: string;
  noOfApprovedBatches?: number;
  noOfCompletedBatches?: number;
  noOfOngoingBatches?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SdcService {
  private http = inject(HttpClient);
  
  private initialSdcs: Sdc[] = [
    { id: '1', sdcCode: 'SDC-001', name: 'Apex Skill Development Center', tpName: 'Apex Skill Solutions Pvt Ltd', scheme: 'MMKVY', status: 'APPROVED', district: 'Jaipur', noOfApprovedBatches: 2, noOfCompletedBatches: 1, noOfOngoingBatches: 1 },
    { id: '2', sdcCode: 'SDC-002', name: 'Rajasthan Kaushal Kendra', tpName: 'Rajasthan Kaushal Vikas Sansthan', scheme: 'SAMARTH', status: 'PENDING_INSPECTION', district: 'Jodhpur', noOfApprovedBatches: 0, noOfCompletedBatches: 0, noOfOngoingBatches: 0 },
    { id: '3', sdcCode: 'SDC-003', name: 'Digital Yuva Training Hub', tpName: 'Digital Yuva Foundation', scheme: 'MNSKSY', status: 'DRAFT', district: 'Udaipur', noOfApprovedBatches: 0, noOfCompletedBatches: 0, noOfOngoingBatches: 0 }
  ];

  private sdcsSubject = new BehaviorSubject<Sdc[]>(this.initialSdcs);
  sdcs$ = this.sdcsSubject.asObservable();

  constructor() {
    this.loadSdcs();
  }

  loadSdcs(): void {
    this.http.get<{ success: boolean; data: { items: Sdc[] } }>('/api/v1/sdcs')
      .subscribe({
        next: (res) => {
          if (res.success && res.data.items?.length > 0) {
            this.sdcsSubject.next(res.data.items);
          }
        },
        error: (err) => {
          // Fallback to in-memory state
        }
      });
  }

  addSdc(sdcData: Partial<Sdc>) {
    const current = this.sdcsSubject.value || [];
    const newSdc: Sdc = {
      id: Math.random().toString(36).substring(2, 9),
      sdcCode: `SDC-00${current.length + 1}`,
      name: sdcData.name || 'New Skill Development Center',
      tpName: sdcData.tpName || 'Apex Skill Solutions Pvt Ltd',
      scheme: sdcData.scheme || 'MMKVY',
      status: sdcData.status || 'SUBMITTED',
      district: sdcData.district || 'Jaipur',
      noOfApprovedBatches: 0,
      noOfCompletedBatches: 0,
      noOfOngoingBatches: 0
    };
    this.sdcsSubject.next([newSdc, ...current]);
  }

  getById(id: string): Sdc | undefined {
    return this.sdcsSubject.value.find(s => s.id === id);
  }
}
