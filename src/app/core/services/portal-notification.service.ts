import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { map } from 'rxjs';
import { PortalNotification } from '../models/portal-notification.model';
import { AuthService, UserRole } from '../auth/auth.service';
import { API_ENDPOINTS } from '../config/api.config';
import { HttpService } from '../http/http.service';
import { toItems } from '../http/response-adapter';
import { ROLE_NOTIFICATIONS } from '../mock/data/portal-notifications.mock';
import { isMockEnabled } from '../mock/mock.config';

/**
 * Bell notifications of the signed-in user (resource `NOTIFICATIONS`). Mock mode shows the dummy list of the active
 * role; API mode loads the user's notifications and saves the read state to the server.
 */
@Injectable({
  providedIn: 'root'
})
export class PortalNotificationService {
  private authService = inject(AuthService);
  private http = inject(HttpService);

  readonly notifications = signal<PortalNotification[]>([]);

  /** Total unread count */
  readonly unreadCount = computed(() => {
    return this.notifications().filter(n => !n.isRead).length;
  });

  /** Whether there is at least one unread notification */
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  /** Whether any newly arrived unread notification exists */
  readonly hasNewArrivals = computed(() => {
    return this.notifications().some(n => n.isNew && !n.isRead);
  });

  constructor() {
    // Whenever the logged-in user or active role changes, load the notifications of that user / role.
    effect(() => {
      const user = this.authService.currentUser();
      const role: UserRole = user?.role || 'existing_user';
      untracked(() => (this.isMock() ? this.loadRoleNotifications(role) : user ? this.loadFromApi() : this.notifications.set([])));
    });
  }

  private isMock(): boolean {
    return isMockEnabled('NOTIFICATIONS');
  }

  private loadRoleNotifications(role: UserRole): void {
    const list = ROLE_NOTIFICATIONS[role] || ROLE_NOTIFICATIONS['existing_user'];
    // Deep clone to allow read state mutation
    this.notifications.set(list.map(item => ({ ...item })));
  }

  private loadFromApi(): void {
    this.http
      .call<unknown>(API_ENDPOINTS.NOTIFICATIONS.LIST, { flags: { skipLoading: true, skipErrorToast: true } })
      .pipe(map(res => toItems<PortalNotification>(res)))
      .subscribe({ next: list => this.notifications.set(list), error: () => this.notifications.set([]) });
  }

  markAsRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, isRead: true, isNew: false } : n))
    );
    if (!this.isMock()) {
      this.http.call(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { id, body: {}, flags: { skipLoading: true } }).subscribe({ error: () => {} });
    }
  }

  markAllAsRead(): void {
    this.notifications.update(list =>
      list.map(n => ({ ...n, isRead: true, isNew: false }))
    );
    if (!this.isMock()) {
      this.http.call(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, { body: {}, flags: { skipLoading: true } }).subscribe({ error: () => {} });
    }
  }
}
