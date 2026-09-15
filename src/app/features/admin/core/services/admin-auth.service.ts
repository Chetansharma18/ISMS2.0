import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AdminProfile {
  id: string;
  username: string;
  fullName: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  role: string;
  ssoId: string;
  avatarUrl?: string;
  lastLogin: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  currentUser = signal<AdminProfile>({
    id: 'ADM-001',
    username: 'superadmin_rajasthan',
    fullName: 'Shri Rajeshwar Sharma, IAS',
    designation: 'Principal Secretary & State Mission Director',
    department: 'Skill, Employment & Entrepreneurship Department',
    email: 'superadmin.eoi@rajasthan.gov.in',
    phone: '+91 141 2227845',
    role: 'SUPER_ADMIN',
    ssoId: 'RAJ_GOV_ADMIN_01',
    lastLogin: new Date(Date.now() - 42 * 60 * 1000).toLocaleString('en-IN')
  });

  isSuperAdmin(): boolean {
    return this.currentUser().role === 'SUPER_ADMIN';
  }

  hasPermission(module: string, action: string): boolean {
    // Super Admin has full unrestricted control over all modules & actions
    if (this.currentUser().role === 'SUPER_ADMIN') {
      return true;
    }
    return true;
  }

  updateProfile(data: Partial<AdminProfile>): Observable<boolean> {
    this.currentUser.update(curr => ({ ...curr, ...data }));
    return of(true);
  }

  changePassword(oldPass: string, newPass: string): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: 'Password updated successfully. Please use your new password for your next login.' });
  }

  logout(): void {
    console.log('Super Admin logged out');
  }
}
