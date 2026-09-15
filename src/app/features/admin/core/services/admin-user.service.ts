import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminUser, UserRoleAssignment, UserSchemeAssignment } from '../models/admin.models';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private auditService = inject(AuditService);

  private users: AdminUser[] = [
    {
      id: 'USR-01',
      userId: 'rajeshwar_sharma_ias',
      username: 'rajeshwar_sharma',
      fullName: 'Shri Rajeshwar Sharma, IAS',
      email: 'superadmin.eoi@rajasthan.gov.in',
      mobile: '9829012345',
      ssoId: 'RAJ_GOV_ADMIN_01',
      userType: 'Super Admin',
      designation: 'Principal Secretary & State Mission Director',
      department: 'Skill, Employment & Entrepreneurship Department',
      district: 'Jaipur',
      block: 'Sanganer',
      aadhaarMasked: 'XXXXXXXX8901',
      active: true,
      roles: [
        { id: 'UR-01', role: 'SUPER_ADMIN', startDate: '2023-01-01', endDate: '2028-12-31', status: 'Active' }
      ],
      schemes: [
        { id: 'US-01', schemeId: 'SCH-001', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', startDate: '2023-01-01', endDate: '2028-12-31', status: 'Active' },
        { id: 'US-02', schemeId: 'SCH-002', schemeName: 'Pradhan Mantri Kaushal Vikas Yojana', startDate: '2023-01-01', endDate: '2028-12-31', status: 'Active' }
      ],
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 'USR-02',
      userId: 'alok_verma_ias',
      username: 'alok_verma',
      fullName: 'Dr. Alok Verma, IAS',
      email: 'md.rsldc@rajasthan.gov.in',
      mobile: '9414056789',
      ssoId: 'RSLDC_MD_01',
      userType: 'Approval Committee',
      designation: 'Mission Director, RSLDC',
      department: 'RSLDC',
      district: 'Jaipur',
      block: 'Jhotwara',
      aadhaarMasked: 'XXXXXXXX4512',
      active: true,
      roles: [
        { id: 'UR-02', role: 'APPROVAL_COMMITTEE', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active' }
      ],
      schemes: [
        { id: 'US-03', schemeId: 'SCH-001', schemeName: 'Mukhya Mantri Kaushal Vikas Yojana', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active' }
      ],
      createdAt: '2024-01-01T10:00:00.000Z'
    },
    {
      id: 'USR-03',
      userId: 'vikram_rathore_dte',
      username: 'vikram_rathore',
      fullName: 'Shri Vikram Rathore',
      email: 'v.rathore.dte@rajasthan.gov.in',
      mobile: '9784011223',
      ssoId: 'DTE_JTDIR_TECH',
      userType: 'Department User',
      designation: 'Joint Director (Technical Evaluations)',
      department: 'Directorate of Technical Education',
      district: 'Jodhpur',
      block: 'Mandore',
      aadhaarMasked: 'XXXXXXXX7834',
      active: true,
      roles: [
        { id: 'UR-03', role: 'DEPARTMENT_USER', startDate: '2023-05-01', endDate: '2026-04-30', status: 'Active' }
      ],
      schemes: [
        { id: 'US-04', schemeId: 'SCH-006', schemeName: 'Rajkvik Recognition of Prior Learning', startDate: '2023-05-01', endDate: '2026-04-30', status: 'Active' }
      ],
      createdAt: '2023-05-01T09:00:00.000Z'
    },
    {
      id: 'USR-04',
      userId: 'sunita_choudhary_univ',
      username: 'sunita_choudhary',
      fullName: 'Prof. Sunita Choudhary',
      email: 's.choudhary@uniraj.ac.in',
      mobile: '9829177889',
      ssoId: 'RAJ_ACAD_EVAL_03',
      userType: 'Third Party User',
      designation: 'Dean & Professor, Faculty of Management',
      department: 'University of Rajasthan',
      district: 'Jaipur',
      block: 'Amber',
      active: true,
      roles: [
        { id: 'UR-04', role: 'APPROVAL_COMMITTEE', startDate: '2024-01-01', endDate: '2026-12-31', status: 'Active' }
      ],
      schemes: [],
      createdAt: '2024-01-01T11:00:00.000Z'
    }
  ];

  getUsers(): Observable<AdminUser[]> {
    return of([...this.users]);
  }

  getUserById(id: string): Observable<AdminUser | undefined> {
    const found = this.users.find(u => u.id === id || u.userId === id);
    return of(found ? { ...found } : undefined);
  }

  saveUser(user: Partial<AdminUser>): Observable<AdminUser> {
    if (user.id) {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...user };
        this.auditService.logAction({
          user: 'superadmin_rajasthan',
          role: 'SUPER_ADMIN',
          module: 'Users',
          action: 'Updated User Setup',
          oldValue: `User: ${this.users[idx].username}`,
          newValue: `Updated: ${this.users[idx].fullName}`,
          reason: 'Administrative user modification'
        });
        return of({ ...this.users[idx] });
      }
    }
    const newUser: AdminUser = {
      id: `USR-${String(this.users.length + 1).padStart(2, '0')}`,
      userId: user.userId || `user_${Date.now()}`,
      username: user.username || 'new_user',
      fullName: user.fullName || user.username || 'New User',
      email: user.email || '',
      mobile: user.mobile || '',
      alternateEmail: user.alternateEmail,
      alternateMobile: user.alternateMobile,
      dob: user.dob,
      ssoId: user.ssoId || '',
      userType: user.userType || 'Department User',
      designation: user.designation || '',
      department: user.department || 'Skill, Employment & Entrepreneurship Department',
      district: user.district || 'Jaipur',
      block: user.block || 'Sanganer',
      aadhaarMasked: user.aadhaarMasked,
      active: user.active ?? true,
      roles: user.roles || [],
      schemes: user.schemes || [],
      createdAt: new Date().toISOString()
    };
    this.users.unshift(newUser);
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Users',
      action: 'Created User',
      newValue: `Created User: ${newUser.fullName} (${newUser.userId})`,
      reason: 'New system operator/committee member onboarding'
    });
    return of({ ...newUser });
  }

  // SSO Mapping (Rule 48)
  mapSso(userId: string, newSsoId: string): Observable<{ success: boolean; message: string }> {
    const user = this.users.find(u => u.id === userId || u.userId === userId);
    if (!user) {
      return of({ success: false, message: 'User not found.' });
    }
    const oldSso = user.ssoId || 'Not mapped';
    user.ssoId = newSsoId;
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Users',
      action: 'Mapped SSO',
      oldValue: `User ${user.username} Previous SSO: ${oldSso}`,
      newValue: `New SSO: ${newSsoId}`,
      reason: 'Rajasthan State Single Sign-On (SSO) mapping linked'
    });
    return of({ success: true, message: 'SSO ID mapped successfully.' });
  }

  unmapSso(userId: string): Observable<{ success: boolean; message: string }> {
    const user = this.users.find(u => u.id === userId || u.userId === userId);
    if (!user) {
      return of({ success: false, message: 'User not found.' });
    }
    const oldSso = user.ssoId;
    user.ssoId = '';
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'Users',
      action: 'Unmapped SSO',
      oldValue: `User ${user.username} SSO: ${oldSso}`,
      newValue: 'SSO Unlinked',
      reason: 'SSO identity revoked or reset by Super Admin'
    });
    return of({ success: true, message: 'SSO ID unmapped successfully.' });
  }

  toggleUserStatus(userId: string): Observable<AdminUser | undefined> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.active = !user.active;
      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'Users',
        action: user.active ? 'Activated User' : 'Deactivated User',
        newValue: `User ${user.username} status: ${user.active ? 'Active' : 'Inactive'}`,
        reason: 'Super Admin status toggle'
      });
      return of({ ...user });
    }
    return of(undefined);
  }
}
