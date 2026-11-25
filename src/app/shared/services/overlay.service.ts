import { Injectable, NgZone, inject } from '@angular/core';

export interface OverlayPositionOptions {
  preferredMaxHeight?: number;
  gap?: number;
  minWidth?: number;
  matchWidth?: boolean;
}

export interface ConnectedOverlayRef {
  updatePosition: () => void;
  close: () => void;
  panel: HTMLElement;
  direction: 'up' | 'down';
}

/**
 * Global Overlay Service
 * Resolves dropdown, autocomplete and tooltip clipping inside modals and scrollable containers
 * by portaling floating panels outside overflow boundaries directly to document.body with fixed positioning.
 */
@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private ngZone = inject(NgZone);
  private container: HTMLElement | null = null;
  private activeOverlays = new Set<ConnectedOverlayRef>();

  private getContainer(): HTMLElement {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = document.getElementById('isms-overlay-portal');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'isms-overlay-portal';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100vw';
        this.container.style.height = '0';
        this.container.style.overflow = 'visible';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '99999';
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  attachConnectedOverlay(
    trigger: HTMLElement,
    panel: HTMLElement,
    options: OverlayPositionOptions = {},
    onClose?: () => void
  ): ConnectedOverlayRef {
    const container = this.getContainer();
    panel.style.position = 'fixed';
    panel.style.pointerEvents = 'auto';
    panel.style.zIndex = '99999';

    if (panel.parentElement !== container) {
      container.appendChild(panel);
    }

    let currentDirection: 'up' | 'down' = 'down';
    let ref: ConnectedOverlayRef;

    const updatePosition = () => {
      if (!trigger || !panel) return;
      if (typeof window === 'undefined') return;

      const triggerRect = trigger.getBoundingClientRect();

      // If trigger is detached from DOM
      if (!trigger.isConnected) {
        if (ref) ref.close();
        return;
      }

      const winH = window.innerHeight || 800;
      const winW = window.innerWidth || 1200;
      const gap = options.gap ?? 4;
      const preferredMaxH = options.preferredMaxHeight ?? 280;

      const spaceBelow = winH - triggerRect.bottom - 16;
      const spaceAbove = triggerRect.top - 16;

      // Determine opening direction and max height
      if (spaceBelow >= Math.min(preferredMaxH, 160) || spaceBelow >= spaceAbove) {
        currentDirection = 'down';
        const top = triggerRect.bottom + gap;
        const maxH = Math.max(120, Math.min(preferredMaxH, spaceBelow > 0 ? spaceBelow : preferredMaxH));
        panel.style.top = `${Math.round(top)}px`;
        panel.style.bottom = 'auto';
        panel.style.maxHeight = `${Math.round(maxH)}px`;
      } else {
        currentDirection = 'up';
        const maxH = Math.max(120, Math.min(preferredMaxH, spaceAbove > 0 ? spaceAbove : preferredMaxH));
        const bottom = winH - triggerRect.top + gap;
        panel.style.bottom = `${Math.round(bottom)}px`;
        panel.style.top = 'auto';
        panel.style.maxHeight = `${Math.round(maxH)}px`;
      }

      // Horizontal alignment & width
      const width = triggerRect.width > 0
        ? (options.matchWidth !== false ? triggerRect.width : Math.max(options.minWidth || 0, triggerRect.width))
        : 220;

      let left = triggerRect.left || 0;
      if (left + width > winW - 8) {
        left = Math.max(8, winW - width - 8);
      }
      left = Math.max(8, left);

      panel.style.left = `${Math.round(left)}px`;
      panel.style.width = `${Math.round(width)}px`;
    };

    // Listeners for outside click, escape, and scroll/resize
    const onScrollOrResize = () => {
      this.ngZone.runOutsideAngular(() => {
        updatePosition();
      });
    };

    const onPointerDown = (event: PointerEvent | MouseEvent) => {
      const target = event.target as Node;
      if (!panel.contains(target) && !trigger.contains(target)) {
        ref.close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        ref.close();
      }
    };

    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true });
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);

    let isClosed = false;
    ref = {
      panel,
      get direction() {
        return currentDirection;
      },
      updatePosition,
      close: () => {
        if (isClosed) return;
        isClosed = true;

        window.removeEventListener('resize', onScrollOrResize);
        window.removeEventListener('scroll', onScrollOrResize, { capture: true });
        document.removeEventListener('pointerdown', onPointerDown, true);
        document.removeEventListener('keydown', onKeyDown, true);

        if (panel.parentElement === container) {
          container.removeChild(panel);
        }
        this.activeOverlays.delete(ref);
        if (onClose) onClose();
      }
    };

    updatePosition();
    this.activeOverlays.add(ref);
    return ref;
  }

  closeAll(): void {
    const list = Array.from(this.activeOverlays);
    for (const ov of list) {
      ov.close();
    }
    this.activeOverlays.clear();
  }
}
