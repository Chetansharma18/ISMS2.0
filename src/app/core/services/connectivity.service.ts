import { Injectable, signal, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  /** Single source of truth for internet connectivity */
  readonly isOnline = signal<boolean>(true);

  private onlineHandler?: () => void;
  private offlineHandler?: () => void;

  constructor() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      // Initialize with current browser status
      this.isOnline.set(typeof navigator !== 'undefined' ? navigator.onLine : true);

      // Single centralized event listener pair for connectivity changes
      this.onlineHandler = () => this.isOnline.set(true);
      this.offlineHandler = () => this.isOnline.set(false);

      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  /** Manually refresh connectivity status from navigator */
  checkConnectivity(): boolean {
    if (typeof navigator !== 'undefined') {
      const online = navigator.onLine;
      this.isOnline.set(online);
      return online;
    }
    return true;
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      if (this.onlineHandler) {
        window.removeEventListener('online', this.onlineHandler);
      }
      if (this.offlineHandler) {
        window.removeEventListener('offline', this.offlineHandler);
      }
    }
  }
}
