import { Injectable, signal } from '@angular/core';

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  badge?: string;
}

export interface AlertModalOptions {
  title: string;
  message: string;
  okLabel?: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Global Modal Service
 * Centralizes modal open/close lifecycle, programmatic confirm/alert dialogs,
 * body scroll-lock management, and stacking layers.
 */
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalCount = signal<number>(0);

  /** Active confirm dialog state for app-level confirmation dialog outlet */
  readonly confirmState = signal<{
    isOpen: boolean;
    options: ConfirmModalOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  /** Active alert dialog state */
  readonly alertState = signal<{
    isOpen: boolean;
    options: AlertModalOptions;
    resolve: () => void;
  } | null>(null);

  /** Locks background body scrolling when the first modal opens */
  registerModalOpen(): void {
    this.activeModalCount.update(c => c + 1);
    if (this.activeModalCount() === 1 && typeof document !== 'undefined') {
      document.body.classList.add('overflow-hidden');
    }
  }

  /** Restores background body scrolling when the last modal closes */
  registerModalClose(): void {
    this.activeModalCount.update(c => Math.max(0, c - 1));
    if (this.activeModalCount() === 0 && typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }

  /** Open a programmatic confirmation dialog */
  confirm(options: ConfirmModalOptions): Promise<boolean> {
    return new Promise(resolve => {
      this.confirmState.set({
        isOpen: true,
        options,
        resolve: (result: boolean) => {
          this.confirmState.set(null);
          resolve(result);
        }
      });
    });
  }

  /** Open a programmatic informational/alert dialog */
  alert(options: AlertModalOptions): Promise<void> {
    return new Promise(resolve => {
      this.alertState.set({
        isOpen: true,
        options,
        resolve: () => {
          this.alertState.set(null);
          resolve();
        }
      });
    });
  }
}
