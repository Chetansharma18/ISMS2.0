import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService', () => {
  let service: ConnectivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectivityService]
    });
    service = TestBed.inject(ConnectivityService);
  });

  it('initializes with default online status', () => {
    expect(service.isOnline()).toBe(true);
  });

  it('updates isOnline signal to false when offline event fires', () => {
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
  });

  it('updates isOnline signal to true when online event fires', () => {
    // First simulate offline
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);

    // Then simulate restoration
    window.dispatchEvent(new Event('online'));
    expect(service.isOnline()).toBe(true);
  });

  it('manually evaluates connectivity with checkConnectivity', () => {
    const status = service.checkConnectivity();
    expect(typeof status).toBe('boolean');
    expect(service.isOnline()).toBe(status);
  });
});
