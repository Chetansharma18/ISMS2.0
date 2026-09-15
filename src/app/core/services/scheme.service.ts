import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Scheme {
  id: string;
  title: string;
  description: string;
  sector: string;
  agency: string;
  deadline: Date;
  fee: number;
  emd: number;
}

@Injectable({
  providedIn: 'root'
})
export class SchemeService {
  private schemes: Scheme[] = [
    {
      id: 'SCH-2026-101',
      title: 'Setup of Rural Digital Hubs in Aspirational Districts',
      description: 'Expression of Interest is invited from eligible IT/ITES companies for establishing and operating digital citizen service centers across 112 aspirational districts under the Digital Bharat Initiative.',
      sector: 'Information Technology',
      agency: 'Ministry of Electronics and IT',
      deadline: new Date('2026-10-15'),
      fee: 5000,
      emd: 150000
    },
    {
      id: 'SCH-2026-102',
      title: 'Solar PV Manufacturing PLI Scheme Phase III',
      description: 'EOI for establishing high-efficiency Solar PV module manufacturing units with a minimum capacity of 1GW per annum to support the National Green Energy transition goals.',
      sector: 'Energy',
      agency: 'Ministry of New and Renewable Energy',
      deadline: new Date('2026-09-30'),
      fee: 10000,
      emd: 5000000
    },
    {
      id: 'SCH-2026-103',
      title: 'Development of Multi-Modal Logistics Parks',
      description: 'Seeking proposals from infrastructure developers for the construction and operation of MMLPs at strategic nodes identified under the PM Gati Shakti National Master Plan.',
      sector: 'Infrastructure',
      agency: 'NHAI / Ministry of Road Transport',
      deadline: new Date('2026-11-20'),
      fee: 25000,
      emd: 10000000
    },
    {
      id: 'SCH-2026-104',
      title: 'Primary Healthcare Center Digitization',
      description: 'EOI for providing cloud-based Electronic Health Record (EHR) systems and hardware infrastructure to 5,000 PHCs in Tier-2 and Tier-3 cities.',
      sector: 'Healthcare',
      agency: 'Ministry of Health and Family Welfare',
      deadline: new Date('2026-10-05'),
      fee: 0,
      emd: 50000
    },
    {
      id: 'SCH-2026-105',
      title: 'Skill Development Training for Drone Piloting',
      description: 'Inviting training partners to conduct comprehensive certification programs for drone piloting and maintenance for rural youth.',
      sector: 'Education & Skill',
      agency: 'National Skill Development Corporation',
      deadline: new Date('2026-09-25'),
      fee: 2000,
      emd: 0
    }
  ];

  private schemesSubject = new BehaviorSubject<Scheme[]>(this.schemes);
  schemes$ = this.schemesSubject.asObservable();

  getSchemes(): Scheme[] {
    return this.schemes;
  }

  getSchemeById(id: string): Scheme | undefined {
    return this.schemes.find(s => s.id === id);
  }
}
