import { Injectable, computed, signal } from '@angular/core';

/**
 * Counts the HTTP requests in flight (fed by the loading interceptor), so a global progress bar or spinner can
 * bind to `isLoading()` without any screen tracking its own requests.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);

  readonly pendingCount = this.pending.asReadonly();
  readonly isLoading = computed(() => this.pending() > 0);

  begin(): void {
    this.pending.update(n => n + 1);
  }

  end(): void {
    this.pending.update(n => Math.max(0, n - 1));
  }
}
