import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CourseProposal {
  id: string;
  tpId: string;
  tpName: string;
  sdcId: string;
  sdcName: string;
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
      sdcId: '1',
      sdcName: 'Skill Center Jaipur',
      courseCode: 'SSC/Q2212',
      courseName: 'Domestic Data Entry Operator',
      sector: 'IT & ITeS',
      nsqfLevel: 'NSQF Level 4',
      durationHrs: 400,
      targetCapacity: 120,
      infrastructure: 'Computer lab with 30 PCs',
      status: 'APPROVED'
    },
    {
      id: 'prop-2',
      tpId: 'TP042',
      tpName: 'SkillMasters Rajasthan',
      sdcId: '2',
      sdcName: 'Tech Training Jodhpur',
      courseCode: 'ELE/Q5901',
      courseName: 'Solar Panel Installation Technician',
      sector: 'Green Energy',
      nsqfLevel: 'NSQF Level 4',
      durationHrs: 300,
      targetCapacity: 50,
      infrastructure: 'Solar training lab & simulation setup',
      status: 'PENDING_ADMIN_REVIEW'
    },
    {
      id: 'prop-3',
      tpId: 'TP042',
      tpName: 'SkillMasters Rajasthan',
      sdcId: '1',
      sdcName: 'Skill Center Jaipur',
      courseCode: 'AAS/Q6301',
      courseName: 'Drone Operator - Multi Rotor',
      sector: 'Aerospace & Aviation',
      nsqfLevel: 'NSQF Level 4',
      durationHrs: 430,
      targetCapacity: 200,
      infrastructure: 'Drone testing arena',
      status: 'REJECTED',
      rejectionReason: 'Infrastructure inspection pending'
    }
  ];

  private proposalsSubject = new BehaviorSubject<CourseProposal[]>(this.proposals);
  proposals$ = this.proposalsSubject.asObservable();

  constructor() {}

  getProposalsByTp(tpId: string): Observable<CourseProposal[]> {
    return this.proposals$.pipe(
      map(proposals => proposals.filter(p => p.tpId === tpId))
    );
  }

  getProposalsBySdc(sdcId: string): Observable<CourseProposal[]> {
    return this.proposals$.pipe(
      map(proposals => proposals.filter(p => p.sdcId === sdcId))
    );
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

