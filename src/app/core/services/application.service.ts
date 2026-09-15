import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SchemeService, Scheme } from './scheme.service';

export interface Application {
  id: string;
  schemeId: string;
  referenceNumber: string;
  schemeName: string;
  sector: string;
  lastUpdated: Date;
  status: string;
  filterGroup: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private applications: Application[] = [
    {
      id: 'EOI-2026-9871',
      schemeId: 'SCH-2026-101',
      referenceNumber: 'REF-883921',
      schemeName: 'Setup of Rural Digital Hubs in Aspirational Districts',
      sector: 'Information Technology',
      lastUpdated: new Date('2026-09-01T10:30:00'),
      status: 'UNDER REVIEW',
      filterGroup: 'SUBMITTED'
    },
    {
      id: 'EOI-2026-8542',
      schemeId: 'SCH-2026-102',
      referenceNumber: 'REF-772831',
      schemeName: 'Solar PV Manufacturing PLI Scheme Phase III',
      sector: 'Energy',
      lastUpdated: new Date('2026-08-15T14:20:00'),
      status: 'CLARIFICATION REQUIRED',
      filterGroup: 'ACTION_REQUIRED'
    },
    {
      id: 'EOI-2026-7123',
      schemeId: 'SCH-2026-104',
      referenceNumber: 'REF-554219',
      schemeName: 'Primary Healthcare Center Digitization',
      sector: 'Healthcare',
      lastUpdated: new Date('2026-07-22T09:15:00'),
      status: 'ACCEPTED',
      filterGroup: 'COMPLETED'
    }
  ];

  private applicationsSubject = new BehaviorSubject<Application[]>(this.applications);
  applications$ = this.applicationsSubject.asObservable();

  constructor(private schemeService: SchemeService) {}

  getApplications(): Application[] {
    return this.applications;
  }

  getApplicationById(id: string): Application | undefined {
    return this.applications.find(a => a.id === id);
  }

  addApplication(schemeId: string) {
    const scheme = this.schemeService.getSchemeById(schemeId);
    if (!scheme) return;

    const newApp: Application = {
      id: 'EOI-2026-' + Math.floor(1000 + Math.random() * 9000),
      schemeId: scheme.id,
      referenceNumber: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      schemeName: scheme.title,
      sector: scheme.sector,
      lastUpdated: new Date(),
      status: 'UNDER REVIEW',
      filterGroup: 'SUBMITTED'
    };

    this.applications = [newApp, ...this.applications];
    this.applicationsSubject.next(this.applications);
  }
}
