import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<AppNotification[]>([]);

  show(notification: Omit<AppNotification, 'id'>): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: AppNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000
    };

    this.notifications.update(list => [...list, newNotification]);

    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newNotification.duration);
    }
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title });
  }

  dismiss(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}
