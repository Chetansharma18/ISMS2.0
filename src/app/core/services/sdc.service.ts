import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';

export interface Sdc {
  id: string;
  sdcCode: string;
  name: string;
  tpName: string;
  scheme: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING_INSPECTION' | 'APPROVED' | 'REJECTED';
}

@Injectable({
  providedIn: 'root'
})
export class SdcService {
  private http = inject(HttpClient);
  
  // Using a BehaviorSubject for basic state management to prevent 
  // redundant API calls when navigating back and forth.
  private sdcsSubject = new BehaviorSubject<Sdc[] | null>(null);
  sdcs$ = this.sdcsSubject.asObservable();

  constructor() {
    this.loadSdcs();
  }

  loadSdcs(): void {
    // In a real app, this would point to the actual environment API URL
    this.http.get<{ success: boolean; data: { items: Sdc[] } }>('/api/v1/sdcs')
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.sdcsSubject.next(res.data.items);
          }
        },
        error: (err) => {
          console.error('Failed to load SDCs', err);
          // For now, load some mock data if the API fails, to ensure the UI still renders
          this.sdcsSubject.next(this.getMockSdcs());
        }
      });
  }

  private getMockSdcs(): Sdc[] {
    return [
      { id: '1', sdcCode: 'SDC-001', name: 'Skill Center Jaipur', tpName: 'TP Alpha', scheme: 'PMKVY', status: 'APPROVED' },
      { id: '2', sdcCode: 'SDC-002', name: 'Tech Training Jodhpur', tpName: 'TP Beta', scheme: 'DDU-GKY', status: 'PENDING_INSPECTION' },
      { id: '3', sdcCode: 'SDC-003', name: 'Rural Skilling Udaipur', tpName: 'TP Gamma', scheme: 'State Scheme', status: 'DRAFT' }
    ];
  }
}
