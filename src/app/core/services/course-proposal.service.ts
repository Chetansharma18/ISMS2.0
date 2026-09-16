import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CourseProposal {
  id: string;
  tpId: string;
  tpName: string;
  courseCode: string;
  courseName: string;
  sector: string;
  nsqfLevel: string;
  durationHrs: number;
  targetCapacity: number;
  infrastructure: string;
  status: 'PENDING_ADMIN_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseProposalService {
  private proposals: CourseProposal[] = [
    {
      id: 'prop-1',
      tpId: 'TP042',
      tpName: 'SkillMasters Rajasthan',
      courseCode: 'C-01',
      courseName: 'Data Entry Operator',
      sector: 'IT & ITeS',
      nsqfLevel: 'Level 4',
      durationHrs: 400,
      targetCapacity: 120,
      infrastructure: 'Computer lab with 30 PCs',
      status: 'APPROVED'
    },
    {
      id: 'prop-2',
      tpId: 'TP042',
      tpName: 'SkillMasters Rajasthan',
      courseCode: 'C-09',
      courseName: 'Cloud Architect',
      sector: 'IT & ITeS',
      nsqfLevel: 'Level 6',
      durationHrs: 600,
      targetCapacity: 50,
      infrastructure: 'High-end lab',
      status: 'PENDING_ADMIN_REVIEW'
    },
    {
      id: 'prop-3',
      tpId: 'TP042',
      tpName: 'SkillMasters Rajasthan',
      courseCode: 'C-04',
      courseName: 'Basic Typing',
      sector: 'IT & ITeS',
      nsqfLevel: 'Level 2',
      durationHrs: 120,
      targetCapacity: 200,
      infrastructure: 'Basic PCs',
      status: 'REJECTED',
      rejectionReason: 'NSQF level too low for current scheme'
    }
  ];

  private proposalsSubject = new BehaviorSubject<CourseProposal[]>(this.proposals);
  proposals$ = this.proposalsSubject.asObservable();

  constructor() {}

  getProposalsByTp(tpId: string): Observable<CourseProposal[]> {
    return new BehaviorSubject(this.proposals.filter(p => p.tpId === tpId)).asObservable();
  }

  addProposal(proposal: Omit<CourseProposal, 'id' | 'status'>): void {
    const newProposal: CourseProposal = {
      ...proposal,
      id: 'prop-' + Date.now(),
      status: 'PENDING_ADMIN_REVIEW',
      courseCode: 'C-' + Math.floor(Math.random() * 1000)
    };
    this.proposals = [newProposal, ...this.proposals];
    this.proposalsSubject.next(this.proposals);
  }

  updateStatus(id: string, status: 'APPROVED' | 'REJECTED', reason?: string): void {
    this.proposals = this.proposals.map(p => 
      p.id === id ? { ...p, status, rejectionReason: reason } : p
    );
    this.proposalsSubject.next(this.proposals);
  }
}
