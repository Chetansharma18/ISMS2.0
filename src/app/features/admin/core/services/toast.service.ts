import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  durationMs?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, durationMs: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message, durationMs };
    this.toasts.update(list => [...list, newToast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.remove(id);
      }, durationMs);
    }
  }

  success(title: string, message: string = ''): void {
    this.show('success', title, message);
  }

  error(title: string, message: string = ''): void {
    this.show('error', title, message, 5000);
  }

  warning(title: string, message: string = ''): void {
    this.show('warning', title, message);
  }

  info(title: string, message: string = ''): void {
    this.show('info', title, message);
  }

  remove(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
