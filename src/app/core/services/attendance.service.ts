import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AttendanceUser {
  id: string;
  userName: string;
  nickName: string;
  email: string;
  altEmail: string;
  mobile: string;
  altMobile: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface AttendanceLog {
  id: string;
  batchCode: string;
  traineeId: string;
  deviceType: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private usersSubject = new BehaviorSubject<AttendanceUser[]>([]);
  users$ = this.usersSubject.asObservable();

  private logsSubject = new BehaviorSubject<AttendanceLog[]>([]);
  logs$ = this.logsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchUsers();
    this.fetchLogs();
  }

  private fetchUsers() {
    this.http.get<AttendanceUser[]>('/api/attendance/users').subscribe({
      next: (data) => this.usersSubject.next(data),
      error: (err) => console.error('Failed to fetch attendance users:', err)
    });
  }

  private fetchLogs() {
    this.http.get<AttendanceLog[]>('/api/attendance/logs').subscribe({
      next: (data) => this.logsSubject.next(data),
      error: (err) => console.error('Failed to fetch attendance logs:', err)
    });
  }

  createAttendanceUser(payload: any): Observable<any> {
    return this.http.post('/api/attendance/users', payload).pipe(
      tap(() => this.fetchUsers())
    );
  }

  markAttendance(payload: { batchCode: string; aadhaarNo: string; deviceType: string }): Observable<any> {
    return this.http.post('/api/attendance/mark', payload).pipe(
      tap(() => this.fetchLogs())
    );
  }
}
