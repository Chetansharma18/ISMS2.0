import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';

export interface Tender {
  id: string;
  ref: string;
  sector: string;
  scheme: string;
  eoi: string;
  appliedCount: number;
  approvedCount: number;
  status: 'Draft' | 'Published' | 'Processing' | 'Closed';
}

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private http = inject(HttpClient);
  
  private tendersSubject = new BehaviorSubject<Tender[] | null>(null);
  tenders$ = this.tendersSubject.asObservable();

  constructor() {
    this.loadTenders();
  }

  loadTenders(): void {
    // In a real scenario, fetch from actual API. 
    // using mock data for now to ensure UI renders properly.
    this.http.get<{ success: boolean; data: { items: Tender[] } }>('/api/v1/tenders')
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.tendersSubject.next(res.data.items);
          }
        },
        error: (err) => {
          console.error('Failed to load tenders, using mock data.', err);
          this.tendersSubject.next(this.getMockTenders());
        }
      });
  }

  private getMockTenders(): Tender[] {
    return [
      {
        id: '1',
        ref: 'TND-2026-001',
        sector: 'IT & ITeS Sector',
        scheme: 'MMKAY 2026-27',
        eoi: 'EOI-2026-9871',
        appliedCount: 42,
        approvedCount: 18,
        status: 'Processing'
      },
      {
        id: '2',
        ref: 'TND-2026-002',
        sector: 'Healthcare',
        scheme: 'PMKVY 4.0',
        eoi: 'EOI-2026-9872',
        appliedCount: 25,
        approvedCount: 5,
        status: 'Published'
      }
    ];
  }
}
