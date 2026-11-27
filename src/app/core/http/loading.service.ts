import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { LoadingMessageKey } from '../translations/loading.translations';

export type LoadingOperationMode = 'silent' | 'page' | 'fullscreen';

export interface LoadingStartOptions {
  scope?: string;
  mode?: LoadingOperationMode;
  messageKey?: LoadingMessageKey;
  message?: string;
  /** Delay before showing non-blocking page loaders to avoid flicker on fast responses (default 0ms). */
  thresholdMs?: number;
  /** Optional brief minimum visible duration once shown so route transitions feel smooth without abrupt 1-frame flashes. */
  minVisibleMs?: number;
}

interface ActiveOperation {
  id: string;
  scope: string;
  mode: LoadingOperationMode;
  messageKey?: LoadingMessageKey;
  message?: string;
  visible: boolean;
  shownAt: number;
  minVisibleMs: number;
  timerId?: ReturnType<typeof setTimeout>;
  stopTimerId?: ReturnType<typeof setTimeout>;
}

/**
 * Centralized loading state manager for ISMS 2.0.
 * Tracks concurrent HTTP requests, router navigation, and scoped UI operations
 * with reference-counted IDs, flicker thresholds, and localized messages.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly doc = inject(DOCUMENT);
  private readonly lang = inject(LanguageService);

  private nextId = 1;
  private readonly anonymousStack: string[] = [];
  private readonly operations = signal<Record<string, ActiveOperation>>({});

  readonly pendingCount = computed(() => Object.keys(this.operations()).length);
  readonly isLoading = computed(() => this.pendingCount() > 0);

  readonly isFullScreenLoading = computed(() =>
    Object.values(this.operations()).some(op => op.mode === 'fullscreen' && op.visible)
  );

  readonly isPageLoading = computed(() =>
    !this.isFullScreenLoading() &&
    Object.values(this.operations()).some(op => op.mode === 'page' && op.visible)
  );

  readonly fullScreenMessage = computed(() => {
    const active = Object.values(this.operations()).find(op => op.mode === 'fullscreen' && op.visible);
    if (!active) return this.lang.getLoadingMessage('loadingApplication');
    if (active.messageKey) return this.lang.getLoadingMessage(active.messageKey);
    return active.message || this.lang.getLoadingMessage('loadingApplication');
  });

  readonly pageMessage = computed(() => {
    const active = Object.values(this.operations()).find(op => op.mode === 'page' && op.visible);
    if (!active) return this.lang.getLoadingMessage('loadingPage');
    if (active.messageKey) return this.lang.getLoadingMessage(active.messageKey);
    return active.message || this.lang.getLoadingMessage('loadingPage');
  });

  /** Backward-compatible counter start for HTTP interceptor & callers. */
  begin(): void {
    const id = this.start({ scope: 'http', mode: 'silent' });
    this.anonymousStack.push(id);
  }

  /** Backward-compatible counter end for HTTP interceptor & callers. */
  end(): void {
    const id = this.anonymousStack.pop();
    if (id) this.stop(id);
  }

  /** Starts a tracked loading operation and returns its unique token for `stop(id)`. */
  start(options: LoadingStartOptions = {}): string {
    const id = `load-${this.nextId++}`;
    const mode: LoadingOperationMode = options.mode ?? 'silent';
    const scope = options.scope ?? 'global';
    const threshold = options.thresholdMs ?? 0;
    const minVisibleMs = options.minVisibleMs ?? 0;

    const op: ActiveOperation = {
      id,
      scope,
      mode,
      messageKey: options.messageKey,
      message: options.message,
      visible: threshold <= 0,
      shownAt: threshold <= 0 ? Date.now() : 0,
      minVisibleMs
    };

    if (threshold > 0) {
      op.timerId = setTimeout(() => {
        this.operations.update(curr => {
          const existing = curr[id];
          if (!existing) return curr;
          return { ...existing ? { ...curr, [id]: { ...existing, visible: true, shownAt: Date.now(), timerId: undefined } } : curr };
        });
      }, threshold);
    }

    this.operations.update(curr => ({ ...curr, [id]: op }));
    return id;
  }

  /** Completes a specific tracked loading operation (respecting any `minVisibleMs` if already shown). */
  stop(id: string | null | undefined): void {
    if (!id) return;
    const existing = this.operations()[id];
    if (!existing) return;

    if (existing.visible && existing.minVisibleMs > 0) {
      const elapsed = Date.now() - existing.shownAt;
      const remaining = existing.minVisibleMs - elapsed;
      if (remaining > 0) {
        if (!existing.stopTimerId) {
          const stopTimerId = setTimeout(() => this.stopImmediate(id), remaining);
          this.operations.update(curr => (curr[id] ? { ...curr, [id]: { ...curr[id], stopTimerId } } : curr));
        }
        return;
      }
    }

    this.stopImmediate(id);
  }

  /** Immediately removes a tracked loading operation without waiting for `minVisibleMs`. */
  stopImmediate(id: string | null | undefined): void {
    if (!id) return;
    this.operations.update(curr => {
      const existing = curr[id];
      if (!existing) return curr;
      if (existing.timerId) clearTimeout(existing.timerId);
      if (existing.stopTimerId) clearTimeout(existing.stopTimerId);
      const next = { ...curr };
      delete next[id];
      return next;
    });
  }

  /** Stops all active operations belonging to a given scope. */
  stopScope(scope: string): void {
    this.operations.update(curr => {
      let changed = false;
      const next: Record<string, ActiveOperation> = {};
      for (const [key, op] of Object.entries(curr)) {
        if (op.scope === scope) {
          if (op.timerId) clearTimeout(op.timerId);
          if (op.stopTimerId) clearTimeout(op.stopTimerId);
          changed = true;
        } else {
          next[key] = op;
        }
      }
      return changed ? next : curr;
    });
  }

  /** Returns true if any active operation exists for the given scope. */
  isScopeLoading(scope: string): boolean {
    return Object.values(this.operations()).some(op => op.scope === scope);
  }

  /** Clears all pending operations (e.g. on fatal reset/sign-out). */
  clearAll(): void {
    const curr = this.operations();
    for (const op of Object.values(curr)) {
      if (op.timerId) clearTimeout(op.timerId);
      if (op.stopTimerId) clearTimeout(op.stopTimerId);
    }
    this.anonymousStack.length = 0;
    this.operations.set({});
  }

  /** Dismisses the initial index.html startup loader smoothly once the app shell is ready. */
  markAppReady(): void {
    const win = this.doc.defaultView as (Window & { __ismsStartupWatchdog?: number }) | null;
    if (win?.__ismsStartupWatchdog) {
      clearTimeout(win.__ismsStartupWatchdog);
      win.__ismsStartupWatchdog = undefined;
    }
    const el = this.doc.getElementById('isms-startup-loader');
    if (!el || el.classList.contains('isms-startup-hidden')) return;
    el.setAttribute('aria-busy', 'false');
    el.classList.add('isms-startup-hidden');
    setTimeout(() => {
      el.remove();
    }, 200);
  }

  /** Transitions the initial startup loader into an accessible failure/recovery state. */
  reportStartupError(message?: string): void {
    const win = this.doc.defaultView as (Window & { __ismsStartupFail?: (msg?: string) => void }) | null;
    if (typeof win?.__ismsStartupFail === 'function') {
      win.__ismsStartupFail(message);
    }
  }
}
