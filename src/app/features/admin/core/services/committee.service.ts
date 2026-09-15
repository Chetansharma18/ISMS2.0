import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Committee, CommitteeMember } from '../models/admin.models';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {
  private auditService = inject(AuditService);

  private committees: Committee[] = [
    {
      id: 'COMM-01',
      committeeName: 'State Skill Evaluation Committee (SSEC-01)',
      committeeCode: 'SSEC_MMKVY_2025',
      department: 'Skill, Employment & Entrepreneurship',
      description: 'Apex technical scrutiny committee for evaluating PIA proposals under MMKVY and RSTP.',
      chairpersonName: 'Dr. Alok Verma, IAS (Mission Director)',
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      status: 'Active',
      assignedEoiCount: 3,
      createdAt: '2024-01-01T10:00:00.000Z',
      members: [
        {
          id: 'MEM-01',
          name: 'Dr. Alok Verma, IAS',
          userId: 'alok_verma_ias',
          designation: 'Mission Director, RSLDC',
          department: 'RSLDC',
          role: 'Chairperson',
          startDate: '2024-01-01',
          endDate: '2026-12-31',
          status: 'Active'
        },
        {
          id: 'MEM-02',
          name: 'Shri Vikram Rathore',
          userId: 'vikram_rathore_dte',
          designation: 'Joint Director (Technical Evaluations)',
          department: 'Directorate of Technical Education',
          role: 'Member',
          startDate: '2024-01-01',
          endDate: '2026-12-31',
          status: 'Active'
        },
        {
          id: 'MEM-03',
          name: 'Prof. Sunita Choudhary',
          userId: 'sunita_choudhary_univ',
          designation: 'Dean & Professor, Faculty of Management',
          department: 'University of Rajasthan',
          role: 'Reviewer',
          startDate: '2024-01-01',
          endDate: '2026-12-31',
          status: 'Active'
        },
        {
          id: 'MEM-04',
          name: 'Shri K. L. Meena',
          userId: 'kl_meena_rsldc',
          designation: 'General Manager (EOI & Procurement)',
          department: 'RSLDC',
          role: 'Secretary',
          startDate: '2024-01-01',
          endDate: '2026-12-31',
          status: 'Active'
        }
      ]
    },
    {
      id: 'COMM-02',
      committeeName: 'Centrally Sponsored Schemes Scrutiny Committee',
      committeeCode: 'CSS_SCRUTINY_COMM',
      department: 'Skill, Employment & Entrepreneurship',
      description: 'Technical evaluation of proposals submitted for PMKVY State Component and NSQF alignment.',
      chairpersonName: 'Shri Mahendra Soni, RAS',
      startDate: '2024-04-01',
      endDate: '2027-03-31',
      status: 'Active',
      assignedEoiCount: 1,
      createdAt: '2024-04-01T11:00:00.000Z',
      members: [
        {
          id: 'MEM-05',
          name: 'Shri Mahendra Soni, RAS',
          userId: 'mahendra_soni_ras',
          designation: 'Executive Director, RSLDC',
          department: 'RSLDC',
          role: 'Chairperson',
          startDate: '2024-04-01',
          endDate: '2027-03-31',
          status: 'Active'
        },
        {
          id: 'MEM-06',
          name: 'Smt. Anita Mathur',
          userId: 'anita_mathur_fin',
          designation: 'Senior Accounts Officer (Treasury)',
          department: 'Finance Department',
          role: 'Member',
          startDate: '2024-04-01',
          endDate: '2027-03-31',
          status: 'Active'
        },
        {
          id: 'MEM-07',
          name: 'Er. Rajesh Bansal',
          userId: 'rajesh_bansal_it',
          designation: 'Joint Director (IT & Technical Systems)',
          department: 'DoIT&C',
          role: 'Reviewer',
          startDate: '2024-04-01',
          endDate: '2027-03-31',
          status: 'Active'
        }
      ]
    },
    {
      id: 'COMM-03',
      committeeName: 'Women & Affirmative Skilling Screening Board',
      committeeCode: 'WASSB_SAMARTH_2025',
      department: 'Women & Child Development / Skill Dept',
      description: 'Specialized panel reviewing proposals targeting women, persons with disabilities, and tribal clusters.',
      chairpersonName: 'Dr. Meenakshi Sharma',
      startDate: '2024-06-01',
      endDate: '2026-05-31',
      status: 'Active',
      assignedEoiCount: 1,
      createdAt: '2024-06-01T09:30:00.000Z',
      members: [
        {
          id: 'MEM-08',
          name: 'Dr. Meenakshi Sharma',
          userId: 'meenakshi_sharma_wcd',
          designation: 'Additional Director (Gender Budgeting)',
          department: 'Women & Child Development',
          role: 'Chairperson',
          startDate: '2024-06-01',
          endDate: '2026-05-31',
          status: 'Active'
        },
        {
          id: 'MEM-09',
          name: 'Shri Dinesh Gehlot',
          userId: 'dinesh_gehlot_sjed',
          designation: 'Deputy Director (Disability Empowerment)',
          department: 'Social Justice & Empowerment',
          role: 'Member',
          startDate: '2024-06-01',
          endDate: '2026-05-31',
          status: 'Active'
        }
      ]
    }
  ];

  getCommittees(): Observable<Committee[]> {
    return of([...this.committees]);
  }

  getCommitteeById(id: string): Observable<Committee | undefined> {
    const found = this.committees.find(c => c.id === id || c.committeeCode === id);
    return of(found ? { ...found } : undefined);
  }

  saveCommittee(committee: Partial<Committee>): Observable<Committee> {
    if (committee.id) {
      const idx = this.committees.findIndex(c => c.id === committee.id);
      if (idx !== -1) {
        this.committees[idx] = { ...this.committees[idx], ...committee };
        this.auditService.logAction({
          user: 'superadmin_rajasthan',
          role: 'SUPER_ADMIN',
          module: 'Committees',
          action: 'Updated Committee',
          oldValue: `Committee: ${this.committees[idx].committeeName}`,
          newValue: `Updated: ${this.committees[idx].committeeName}`,
          reason: 'Administrative committee reconfiguration'
        });
        return of({ ...this.committees[idx] });
      }
    }
    const newComm: Committee = {
      id: `COMM-${String(this.committees.length + 1).padStart(2, '0')}`,
      committeeName: committee.committeeName || 'New Evaluation Committee',
      committeeCode: committee.committeeCode || 'COMM_NEW',
      department: committee.department || 'Skill, Employment & Entrepreneurship',
      description: committee.description || '',
      chairpersonName: committee.chairpersonName || 'Designated Chairperson',
      startDate: committee.startDate || new Date().toISOString().split('T')[0],
      endDate: committee.endDate || new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
      status: committee.status || 'Active',
      assignedEoiCount: 0,
      createdAt: new Date().toISOString(),
      members: committee.members || []
    };
    this.committees.unshift(newComm);
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Committees',
      action: 'Created Committee',
      newValue: `Created: ${newComm.committeeName} (${newComm.committeeCode})`,
      reason: 'New Committee initialized'
    });
    return of({ ...newComm });
  }

  toggleCommitteeStatus(id: string): Observable<Committee | undefined> {
    const c = this.committees.find(item => item.id === id);
    if (c) {
      c.status = c.status === 'Active' ? 'Inactive' : 'Active';
      return of({ ...c });
    }
    return of(undefined);
  }
}
