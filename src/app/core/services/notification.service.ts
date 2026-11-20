import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

export interface NotificationOptions extends Omit<AppNotification, 'id'> {
  /** Skip it when a notification of the same type and message is already on screen. */
  unique?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<AppNotification[]>([]);

  show({ unique, ...notification }: NotificationOptions): void {
    if (unique && this.notifications().some(n => n.type === notification.type && n.message === notification.message)) {
      return;
    }
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
