import { Injectable, signal } from '@angular/core';
import { User, MOCK_USERS } from './mock-users';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {
    // Load from local storage on init
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSignal.set(JSON.parse(storedUser));
    }
  }

  login(username: string): Observable<User> {
    const user = MOCK_USERS.find(u => u.username === username);
    if (user) {
      return of(user).pipe(
        delay(500),
        tap(u => {
          this.currentUserSignal.set(u);
          localStorage.setItem('currentUser', JSON.stringify(u));
        })
      );
    }
    return throwError(() => new Error('Invalid username'));
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  hasRole(role: string | string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role) || user.role === 'SUPER_ADMIN';
    }
    return user.role === role || user.role === 'SUPER_ADMIN';
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }
}
